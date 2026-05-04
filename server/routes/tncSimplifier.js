import express from 'express'
import axios from 'axios'
import { load } from 'cheerio'

const router = express.Router()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function scrapeUrl(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    timeout: 15000,
    maxRedirects: 5,
  })

  const contentType = response.headers['content-type'] || ''
  if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
    throw new Error('The URL does not point to a readable web page.')
  }

  const $ = load(response.data)
  $('script, style, nav, header, footer, aside, iframe, noscript').remove()

  // Prefer semantic content containers over the full body
  const mainSelectors = ['main', 'article', '.content', '#content', '.terms', '#terms', '.legal', '.tos', '#tos', '.policy']
  for (const selector of mainSelectors) {
    const el = $(selector)
    if (el.length > 0) {
      const text = el.text().replace(/\s+/g, ' ').trim()
      if (text.split(/\s+/).length >= 100) return text
    }
  }

  return $('body').text().replace(/\s+/g, ' ').trim()
}

function truncateToWords(text, maxWords = 10000) {
  const words = text.split(/\s+/)
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(' ')
}

async function analyzeWithGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Add GEMINI_API_KEY to your .env file.')
  }

  const prompt = `You are an expert privacy analyst helping everyday consumers understand Terms & Conditions documents.

Analyze the T&Cs below and produce a structured assessment with these rules:

overallRisk: "low", "medium", or "high" based on how much users should be concerned.
summary: 2-3 plain-English sentences covering the main risks or reassurances.
flaggedClauses: 3 to 7 clauses, each with:
  - category: short label (e.g. Data collection, Data sharing, AI training, Cancellation trap, Data retention, Arbitration)
  - severity: "danger" (users would strongly object), "warn" (common but worth knowing), or "pass" (actually user-friendly)
  - clause: the actual or paraphrased clause text (1-2 sentences)
  - consequence: concrete plain-English explanation of what this means for the user
  - realCase: a real-world example { name, detail } or null if none is relevant

Focus on: data collection, third-party data sharing, AI training use, cancellation/auto-renewal traps, data retention, arbitration clauses, liability waivers.

T&Cs text to analyze:
${text}`

  const responseSchema = {
    type: 'object',
    properties: {
      overallRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
      summary: { type: 'string' },
      flaggedClauses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            severity: { type: 'string', enum: ['danger', 'warn', 'pass'] },
            clause: { type: 'string' },
            consequence: { type: 'string' },
            realCase: {
              type: 'object',
              nullable: true,
              properties: {
                name: { type: 'string' },
                detail: { type: 'string' },
              },
            },
          },
          required: ['category', 'severity', 'clause', 'consequence'],
        },
      },
    },
    required: ['overallRisk', 'summary', 'flaggedClauses'],
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  let response
  let lastError

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await axios.post(
        endpoint,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
            responseSchema,
          },
        },
        { timeout: 60000 }
      )
      break
    } catch (err) {
      lastError = err
      const status = err.response?.status
      if (status !== 429 || attempt === 2) break

      const retryAfterHeader = err.response?.headers?.['retry-after']
      const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10)
      const fallbackMs = Math.min(15000, 1500 * 2 ** attempt)
      const delayMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : fallbackMs
      await sleep(delayMs)
    }
  }

  if (!response) {
    throw lastError || new Error('AI request failed.')
  }

  // Gemini 2.5 Flash may return thinking parts — find the non-thought part
  const parts = response.data.candidates?.[0]?.content?.parts ?? []
  const rawText = (parts.find(p => !p.thought) ?? parts[parts.length - 1])?.text ?? ''

  try {
    return JSON.parse(rawText)
  } catch {
    throw new Error('Could not parse the AI response. Please try again.')
  }
}

router.post('/tnc-simplify', async (req, res) => {
  const { url, text, mode } = req.body

  if (!url && !text) {
    return res.status(400).json({ error: 'Provide either a URL or text to analyse.' })
  }

  let tncText = text

  if (mode === 'url' || (url && !text)) {
    try {
      tncText = await scrapeUrl(url)
    } catch (err) {
      return res.status(422).json({
        error: `Could not fetch the page: ${err.message} — try pasting the T&C text directly instead.`,
      })
    }
  }

  if (!tncText || tncText.split(/\s+/).length < 30) {
    return res.status(422).json({ error: 'Not enough text to analyse. Try pasting the T&C text directly.' })
  }

  tncText = truncateToWords(tncText, 10000)

  try {
    const result = await analyzeWithGemini(tncText)
    res.json(result)
  } catch (err) {
    const status = err.response?.status
    if (status === 429) {
      const retryAfter = err.response?.headers?.['retry-after'] || '30'
      res.set('Retry-After', `${retryAfter}`)
      return res.status(429).json({ error: 'AI service rate limit reached. Please wait a moment and try again.' })
    }
    if (status === 400) {
      return res.status(400).json({ error: 'The text could not be analysed. It may not be a valid T&C document.' })
    }
    console.error('[TnC Simplifier] Error:', err.response?.data || err.message)
    res.status(500).json({ error: err.message || 'Analysis failed. Please try again.' })
  }
})

export default router

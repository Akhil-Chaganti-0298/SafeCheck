import express from 'express'
import axios from 'axios'
import { load } from 'cheerio'
import OpenAI from 'openai'
import multer from 'multer'
import { PDFParse } from 'pdf-parse'

const router = express.Router()
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MIN_WORD_COUNT = 30
const URL_READ_ERROR_MESSAGE = 'SafeCheck could not read this page automatically. Some websites prevent tools from accessing their content. Please copy the Terms and Conditions text from the website and paste it into the box instead.'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and plain text files can be uploaded.'))
    }
  },
})

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

  const selectors = ['main', 'article', '.content', '#content', '.terms', '#terms', '.legal', '.tos', '#tos', '.policy']
  for (const selector of selectors) {
    const text = $(selector).text().replace(/\s+/g, ' ').trim()
    if (text.split(/\s+/).length >= 100) return text
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

  let lastError

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: 'n/a',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 4096,
      })

      const rawText = completion.choices[0]?.message?.content ?? ''
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse AI response. Please try again.')
      return JSON.parse(jsonMatch[0].trim())

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

  throw lastError || new Error('AI request failed.')
}

router.post('/tnc-simplify', (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (!err) return next()

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Please upload a file smaller than 5 MB.' })
    }

    return res.status(400).json({ error: err.message || 'File upload failed.' })
  })
}, async (req, res) => {
  const { url, text, mode } = req.body

  if (mode === 'file' && !req.file) {
    return res.status(400).json({ error: 'Please upload a PDF or plain text file to analyse.' })
  }

  if (mode !== 'file' && !url && !text) {
    return res.status(400).json({ error: 'Provide a URL, pasted text, or uploaded file to analyse.' })
  }

  let tncText = text

  if (mode === 'file') {
    try {
      tncText = await extractTextFromFile(req.file)
    } catch (err) {
      return res.status(err.statusCode || 422).json({ error: err.message || 'Could not read the uploaded file.' })
    }
  } else if (mode === 'url' || (url && !text)) {
    try {
      tncText = await scrapeUrl(url)
    } catch (err) {
      return res.status(422).json({ error: URL_READ_ERROR_MESSAGE })
    }
  }

  if (!tncText || tncText.split(/\s+/).length < MIN_WORD_COUNT) {
    const message = mode === 'file'
      ? 'Not enough readable text was found in the uploaded file. Please upload a text-based PDF or paste the T&C text directly.'
      : mode === 'url' || (url && !text)
        ? URL_READ_ERROR_MESSAGE
        : 'Not enough text to analyse. Please paste more of the T&C text directly.'
    return res.status(422).json({ error: message })
  }

  tncText = truncateToWords(tncText)

  try {
    const result = await analyzeWithDO(tncText)
    res.json(sortFlaggedClausesByRisk(result))
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

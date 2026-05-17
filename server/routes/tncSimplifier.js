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

const severityRank = {
  danger: 3,
  warn: 2,
  pass: 1,
}

function sortFlaggedClausesByRisk(result) {
  if (!Array.isArray(result?.flaggedClauses)) return result

  return {
    ...result,
    flaggedClauses: result.flaggedClauses
      .map((clause, index) => ({ clause, index }))
      .sort((a, b) => {
        const riskDifference = (severityRank[b.clause.severity] || 0) - (severityRank[a.clause.severity] || 0)
        return riskDifference || a.index - b.index
      })
      .map(({ clause }) => clause),
  }
}

async function extractTextFromFile(file) {
  if (!file) {
    const error = new Error('Please upload a PDF or plain text file to analyse.')
    error.statusCode = 400
    throw error
  }

  if (file.mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: file.buffer })
    try {
      const parsed = await parser.getText()
      return parsed.text.replace(/\s+/g, ' ').trim()
    } finally {
      await parser.destroy()
    }
  }

  if (file.mimetype === 'text/plain') {
    return file.buffer.toString('utf8').replace(/\s+/g, ' ').trim()
  }

  const error = new Error('Only PDF and plain text files can be uploaded.')
  error.statusCode = 400
  throw error
}

async function analyzeWithDO(text) {
  const apiKey = process.env.DO_AGENT_ACCESS_KEY?.trim()
  const baseURL = process.env.OPENAI_BASE_URL?.trim()

  if (!apiKey) throw new Error('DO_AGENT_ACCESS_KEY is not set in .env')
  if (!baseURL) throw new Error('OPENAI_BASE_URL is not set in .env')

  const client = new OpenAI({ apiKey, baseURL })

  const prompt = `You are a JSON API. Respond with ONLY a valid JSON object. No markdown, no code fences, no text before or after. Start with { and end with }

Analyze these Terms and Conditions and return exactly this structure:
{
  "overallRisk": "low" or "medium" or "high",
  "summary": "2-3 plain English sentences about the main risks",
  "flaggedClauses": [
    {
      "category": "short label like Data collection or Arbitration",
      "severity": "danger" or "warn" or "pass",
      "clause": "the actual clause text",
      "consequence": "plain English explanation of what this means for the user",
      "realCase": { "name": "company name", "detail": "what happened" } or null
    }
  ]
}

Include 3 to 7 flaggedClauses. Focus on: data collection, third-party sharing, AI training data usage, cancellation traps, data retention, arbitration, liability waivers.
Return flaggedClauses in descending severity order: danger first, then warn, then pass.

T&Cs text:
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
      const status = err.status || err.response?.status
      if (status === 401) throw new Error('DigitalOcean authentication failed (401). Check DO_AGENT_ACCESS_KEY.')
      if (status !== 429 || attempt === 2) break
      await sleep(Math.min(15000, 1500 * 2 ** attempt))
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
    const status = err.status || err.response?.status
    if (status === 429) return res.status(429).json({ error: 'Rate limit reached. Wait a moment and retry.' })
    console.error('[TnC Simplifier]', err.message)
    res.status(500).json({ error: err.message || 'Analysis failed. Please try again.' })
  }
})

export default router

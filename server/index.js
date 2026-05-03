import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// Load .env from project root first, then server/ -- server/ overrides root if both exist
for (const envPath of [
  path.join(projectRoot, '.env'),
  path.join(__dirname, '.env'),
]) {
  dotenv.config({ path: envPath, override: true })
}

// Warn on startup if any API key is missing so it is obvious what needs configuring
for (const [envName, label] of [
  ['URLHAUS_API_KEY', 'URLhaus'],
  ['GOOGLE_SAFE_BROWSING_API_KEY', 'Google Safe Browsing'],
  ['VIRUSTOTAL_API_KEY', 'VirusTotal'],
  ['WHOIS_API_KEY', 'WHOIS (domain age)'],
  ['DB_NAME', 'Database name'],
]) {
  if (!process.env[envName]) {
    console.warn(`[SafeCheck] ${label} is missing. Related features may be unavailable.`)
  }
}

const { default: urlCheckRouter } = await import('./routes/urlCheck.js')
const { default: scamStatsRouter } = await import('./routes/scamStats.js')

const app = express()
const PORT = process.env.PORT || 3000
const allowedOrigins = [
  'http://localhost:5173',
  'https://safetychecker.app',
  'https://www.safetychecker.app',
].filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

// Simple password gate used by the frontend PasswordGate component
app.post('/api/auth', (req, res) => {
  const { password } = req.body

  if (password === process.env.APP_PASSWORD) {
    res.json({ success: true })
  } else {
    res.status(401).json({ success: false })
  }
})

app.use('/api/scam-stats', scamStatsRouter)
app.use('/api', urlCheckRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Catch malformed JSON bodies before they bubble up as unhandled errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body.' })
  }

  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

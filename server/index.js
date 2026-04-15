import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../src/.env') })
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

// register more specific route before the generic /api route
app.use('/api/scam-stats', scamStatsRouter)
app.use('/api', urlCheckRouter)

// health checks for root and API-prefixed probes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import csv from 'csv-parser'
import db from '../db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '../../data')
const fallbackFiles = [
  path.join(dataDir, 'nasc_cleaned.csv'),
  path.join(dataDir, 'scamwatch_cleaned.csv'),
]

let fallbackStatsPromise = null

const router = express.Router()

router.get('/online-seniors', async (req, res) => {
  try {
    const [topScamTypes] = await db.query(`
      SELECT
        scam_type,
        SUM(reports) AS total_reports,
        SUM(amount_lost) AS total_lost
      FROM scam_reports
      WHERE age_group = '65 and over'
        AND contact_method = 'Online'
      GROUP BY scam_type
      ORDER BY total_reports DESC
      LIMIT 6
    `)

    const [summaryRows] = await db.query(`
      SELECT
        SUM(reports) AS total_reports,
        SUM(amount_lost) AS total_lost
      FROM scam_reports
      WHERE age_group = '65 and over'
        AND contact_method = 'Online'
    `)

    res.json({
      topScamTypes,
      summary: summaryRows[0],
    })
  } catch (err) {
    console.warn('[scamStats] database unavailable, using local CSV fallback:', err.message)

    try {
      const fallbackStats = await getFallbackStats()
      res.json(fallbackStats)
    } catch (fallbackErr) {
      console.error('Error fetching scam stats:', fallbackErr)
      res.status(500).json({ error: 'Could not load scam data' })
    }
  }
})

function getFallbackStats() {
  if (!fallbackStatsPromise) {
    fallbackStatsPromise = buildFallbackStats().catch((err) => {
      fallbackStatsPromise = null
      throw err
    })
  }

  return fallbackStatsPromise
}

async function buildFallbackStats() {
  const scamTotals = new Map()
  let totalReports = 0
  let totalLost = 0

  for (const file of fallbackFiles) {
    await readFallbackFile(file, (row) => {
      if (row.age_group !== '65 and over' || row.contact_method !== 'Online') {
        return
      }

      const scamType = row.scam_type || 'Unknown'
      const reports = Number(row.reports) || 0
      const amountLost = Number(row.amount_lost) || 0
      const current = scamTotals.get(scamType) || { scam_type: scamType, total_reports: 0, total_lost: 0 }

      current.total_reports += reports
      current.total_lost += amountLost
      totalReports += reports
      totalLost += amountLost

      scamTotals.set(scamType, current)
    })
  }

  const topScamTypes = [...scamTotals.values()]
    .sort((a, b) => b.total_reports - a.total_reports)
    .slice(0, 6)

  return {
    topScamTypes,
    summary: {
      total_reports: totalReports,
      total_lost: totalLost,
    },
  }
}

function readFallbackFile(file, onRow) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) {
      reject(new Error(`Fallback data file not found: ${file}`))
      return
    }

    fs.createReadStream(file)
      .pipe(csv())
      .on('data', onRow)
      .on('end', resolve)
      .on('error', reject)
  })
}

export default router

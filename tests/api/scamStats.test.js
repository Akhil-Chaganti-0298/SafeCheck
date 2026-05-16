import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

const dbQuery = vi.hoisted(() => vi.fn())

vi.mock('../../server/db.js', () => ({
  default: {
    query: dbQuery,
  },
}))

vi.mock('openai', () => ({
  default: class MockOpenAI {
    constructor() {
      this.chat = { completions: { create: vi.fn() } }
    }
  },
}))

vi.mock('multer', () => {
  function multer() {
    return {
      single: () => (req, res, next) => next(),
    }
  }

  multer.memoryStorage = () => ({})
  multer.MulterError = class MulterError extends Error {}

  return { default: multer }
})

vi.mock('pdf-parse', () => ({
  PDFParse: class MockPDFParse {
    async getText() {
      return { text: '' }
    }

    async destroy() {}
  },
}))

let app

describe('Scam Stats API', () => {
  beforeAll(async () => {
    app = (await import('../../server/app.js')).default
  })

  beforeEach(() => {
    dbQuery.mockReset()
  })

  it('returns online scam statistics for people aged 65 and over from the database', async () => {
    const topScamTypes = [
      { scam_type: 'Investment scams', total_reports: 42, total_lost: 120000 },
      { scam_type: 'Phishing', total_reports: 25, total_lost: 15000 },
    ]
    const summary = { total_reports: 67, total_lost: 135000 }

    dbQuery
      .mockResolvedValueOnce([topScamTypes])
      .mockResolvedValueOnce([[summary]])

    const response = await request(app).get('/api/scam-stats/online-seniors')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ topScamTypes, summary })
    expect(dbQuery).toHaveBeenCalledTimes(2)
    expect(dbQuery.mock.calls[0][0]).toContain("age_group = '65 and over'")
    expect(dbQuery.mock.calls[0][0]).toContain("contact_method = 'Online'")
  })

  it('falls back to local CSV data when the database is unavailable', async () => {
    dbQuery.mockRejectedValue(new Error('Database unavailable during test'))

    const response = await request(app).get('/api/scam-stats/online-seniors')

    expect(response.status).toBe(200)
    expect(response.body.topScamTypes.length).toBeGreaterThan(0)
    expect(response.body.topScamTypes.length).toBeLessThanOrEqual(6)
    expect(Number(response.body.summary.total_reports)).toBeGreaterThan(0)
    expect(Number(response.body.summary.total_lost)).toBeGreaterThanOrEqual(0)
  })
})

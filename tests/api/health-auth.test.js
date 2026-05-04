import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../server/app.js'

describe('Backend API Tests', () => {
  beforeAll(() => {
    process.env.APP_PASSWORD = 'test-password'
  })

  describe('Health Checks', () => {
    it('GET /health returns status 200', async () => {
      const response = await request(app).get('/health')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })

    it('GET /api/health returns status 200', async () => {
      const response = await request(app).get('/api/health')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })
  })

  describe('Authentication', () => {
    it('POST /api/auth succeeds with correct password', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({ password: 'test-password' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: true })
    })

    it('POST /api/auth fails with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({ password: 'wrong-password' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ success: false })
    })

    it('POST /api/auth fails with missing password', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({})

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ success: false })
    })
  })
})

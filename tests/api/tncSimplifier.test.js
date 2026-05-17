import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

const mockedAnalysis = {
  overallRisk: 'medium',
  summary: 'The terms allow broad data collection and sharing. Users should review cancellation and retention clauses before agreeing.',
  flaggedClauses: [
    {
      category: 'Data sharing',
      severity: 'warn',
      clause: 'We may share personal information with advertising partners.',
      consequence: 'Your data may be used outside the service.',
      realCase: null,
    },
  ],
}

const openAiCreate = vi.hoisted(() => vi.fn())

vi.mock('openai', () => ({
  default: class MockOpenAI {
    constructor() {
      this.chat = {
        completions: {
          create: openAiCreate,
        },
      }
    }
  },
}))

vi.mock('multer', () => {
  function multer() {
    return {
      single: () => (req, res, next) => {
        if (req.headers['x-test-file-error'] === 'limit') {
          return next(new multer.MulterError('LIMIT_FILE_SIZE'))
        }

        if (req.headers['x-test-file-error'] === 'unsupported') {
          return next(new Error('Only PDF and plain text files can be uploaded.'))
        }

        next()
      },
    }
  }

  multer.memoryStorage = () => ({})
  multer.MulterError = class MulterError extends Error {
    constructor(code) {
      super(code)
      this.code = code
    }
  }

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

describe('T&C Simplifier API', () => {
  beforeAll(async () => {
    process.env.DO_AGENT_ACCESS_KEY = 'test-do-key'
    process.env.OPENAI_BASE_URL = 'https://example.test/v1'
    app = (await import('../../server/app.js')).default
  })

  beforeEach(() => {
    openAiCreate.mockReset()
    openAiCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockedAnalysis) } }],
    })
  })

  it('rejects requests without a URL, text, or file', async () => {
    const response = await request(app)
      .post('/api/tnc-simplify')
      .send({})

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'Provide a URL, pasted text, or uploaded file to analyse.',
    })
    expect(openAiCreate).not.toHaveBeenCalled()
  })

  it('rejects pasted text that is too short to analyse', async () => {
    const response = await request(app)
      .post('/api/tnc-simplify')
      .send({ mode: 'text', text: 'Too short for a meaningful terms analysis.' })

    expect(response.status).toBe(422)
    expect(response.body.error).toBe('Not enough text to analyse. Please paste more of the T&C text directly.')
    expect(openAiCreate).not.toHaveBeenCalled()
  })

  it('rejects file mode when no file is uploaded', async () => {
    const response = await request(app)
      .post('/api/tnc-simplify')
      .send({ mode: 'file' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'Please upload a PDF or plain text file to analyse.',
    })
    expect(openAiCreate).not.toHaveBeenCalled()
  })

  it('rejects unsupported uploaded file types', async () => {
    const response = await request(app)
      .post('/api/tnc-simplify')
      .set('x-test-file-error', 'unsupported')
      .field('mode', 'file')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'Only PDF and plain text files can be uploaded.',
    })
    expect(openAiCreate).not.toHaveBeenCalled()
  })

  it('rejects uploaded files over the size limit', async () => {
    const response = await request(app)
      .post('/api/tnc-simplify')
      .set('x-test-file-error', 'limit')
      .field('mode', 'file')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'File is too large. Please upload a file smaller than 5 MB.',
    })
    expect(openAiCreate).not.toHaveBeenCalled()
  })

  it('returns a plain-English analysis for valid pasted terms text', async () => {
    const text = [
      'By using this service, you agree that we may collect information about account usage, device details, browsing activity, and submitted content.',
      'We may share this information with advertising partners and analytics providers to improve products and personalise offers.',
      'Cancellation requests must be made before renewal, and some submitted data may be retained after account closure for legal or operational reasons.',
    ].join(' ')

    const response = await request(app)
      .post('/api/tnc-simplify')
      .send({ mode: 'text', text })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockedAnalysis)
    expect(openAiCreate).toHaveBeenCalledTimes(1)
    expect(openAiCreate.mock.calls[0][0].messages[0].content).toContain('advertising partners')
  })

  it('returns flagged clauses from highest to lowest severity', async () => {
    openAiCreate.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            overallRisk: 'high',
            summary: 'The terms include several risks.',
            flaggedClauses: [
              {
                category: 'Security contact',
                severity: 'pass',
                clause: 'You can contact support to review account security.',
                consequence: 'This gives you a clear support path.',
                realCase: null,
              },
              {
                category: 'Data sharing',
                severity: 'warn',
                clause: 'We may share personal information with advertising partners.',
                consequence: 'Your data may be used outside the service.',
                realCase: null,
              },
              {
                category: 'AI training',
                severity: 'danger',
                clause: 'Submitted content may be used to train artificial intelligence systems.',
                consequence: 'Your private content may be reused to train AI models.',
                realCase: null,
              },
            ],
          }),
        },
      }],
    })

    const text = [
      'By using this service, you agree that we may collect information about account usage, device details, browsing activity, and submitted content.',
      'We may share this information with advertising partners and analytics providers to improve products and personalise offers.',
      'Cancellation requests must be made before renewal, and some submitted data may be retained after account closure for legal or operational reasons.',
    ].join(' ')

    const response = await request(app)
      .post('/api/tnc-simplify')
      .send({ mode: 'text', text })

    expect(response.status).toBe(200)
    expect(response.body.flaggedClauses.map(clause => clause.category)).toEqual([
      'AI training',
      'Data sharing',
      'Security contact',
    ])
  })
})

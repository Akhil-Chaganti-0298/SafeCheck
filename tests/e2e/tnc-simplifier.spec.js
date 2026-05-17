import { expect, test } from '@playwright/test'

const sampleTerms = [
  'By using this service, you agree that we may collect information about account usage, device details, browsing activity, and submitted content.',
  'We may share this information with advertising partners and analytics providers to improve products and personalise offers.',
  'Cancellation requests must be made before renewal, and some submitted data may be retained after account closure for legal or operational reasons.',
].join(' ')

async function unlock(page) {
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('safecheck-unlocked', 'true')
  })
}

async function openTncSimplifier(page) {
  await unlock(page)
  await page.goto('/tnc-simplifier')
}

async function fillPastedTerms(page) {
  await page.getByRole('button', { name: 'Paste Text', exact: true }).click()
  await page.getByPlaceholder('Paste the full Terms & Conditions text here...').fill(sampleTerms)
}

async function mockTncAnalysis(page, responseBody, status = 200, headers = {}) {
  await page.route('**/api/tnc-simplify', async (route) => {
    await route.fulfill({
      status,
      headers,
      contentType: 'application/json',
      body: JSON.stringify(responseBody),
    })
  })
}

function analysisResponse(overallRisk, flaggedClauses = []) {
  return {
    overallRisk,
    summary: `This is a ${overallRisk} risk summary for the pasted terms.`,
    flaggedClauses,
  }
}

test.describe('T&C Simplifier integration, validation, error handling, and security', () => {
  test('pasted text flow displays the mocked risk, summary, and flagged clauses', async ({ page }) => {
    await mockTncAnalysis(page, analysisResponse('medium', [
      {
        category: 'Data sharing',
        severity: 'warn',
        clause: 'We may share personal information with advertising partners.',
        consequence: 'Your data may be used outside the service.',
        realCase: null,
      },
    ]))
    await openTncSimplifier(page)

    await fillPastedTerms(page)
    await page.getByRole('button', { name: /Analyse these T&Cs/i }).click()

    await expect(page.getByText('Medium Risk', { exact: true })).toBeVisible()
    await expect(page.getByText('This is a medium risk summary for the pasted terms.')).toBeVisible()
    await expect(page.getByText('Data sharing', { exact: true })).toBeVisible()
    await expect(page.getByText('Worth noting')).toBeVisible()
  })

  test('analyse button is disabled when input is empty', async ({ page }) => {
    await openTncSimplifier(page)

    await expect(page.getByRole('button', { name: /Analyse these T&Cs/i })).toBeDisabled()
  })

  test('unsupported frontend file type is rejected before analysis', async ({ page }) => {
    await openTncSimplifier(page)

    await page.getByRole('button', { name: 'Upload PDF', exact: true }).click()
    await page.locator('#tnc-file-upload').setInputFiles({
      name: 'screenshot.png',
      mimeType: 'image/png',
      buffer: Buffer.from('not a supported terms file'),
    })

    await expect(page.getByText('Only PDF and text files are supported.')).toBeVisible()
    await expect(page.getByRole('button', { name: /Analyse these T&Cs/i })).toBeDisabled()
  })

  test('executable file type is rejected before analysis', async ({ page }) => {
    await openTncSimplifier(page)

    await page.getByRole('button', { name: 'Upload PDF', exact: true }).click()
    await page.locator('#tnc-file-upload').setInputFiles({
      name: 'installer.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('fake executable content'),
    })

    await expect(page.getByText('Only PDF and text files are supported.')).toBeVisible()
    await expect(page.getByRole('button', { name: /Analyse these T&Cs/i })).toBeDisabled()
  })

  test('oversized frontend file is rejected before analysis', async ({ page }) => {
    await openTncSimplifier(page)

    await page.getByRole('button', { name: 'Upload PDF', exact: true }).click()
    await page.locator('#tnc-file-upload').setInputFiles({
      name: 'large-terms.txt',
      mimeType: 'text/plain',
      buffer: Buffer.alloc(5 * 1024 * 1024 + 1, 'a'),
    })

    await expect(page.getByText('This file is too large. Please upload a file under 5 MB.')).toBeVisible()
    await expect(page.getByRole('button', { name: /Analyse these T&Cs/i })).toBeDisabled()
  })

  test('rate limit response shows a friendly wait message', async ({ page }) => {
    await mockTncAnalysis(
      page,
      { error: 'Rate limit reached. Wait a moment and retry.' },
      429,
      { 'retry-after': '12' },
    )
    await openTncSimplifier(page)

    await fillPastedTerms(page)
    await page.getByRole('button', { name: /Analyse these T&Cs/i }).click()

    await expect(page.getByText('Analysis failed', { exact: true })).toBeVisible()
    await expect(page.getByText(/Please wait about 12 seconds/i)).toBeVisible()
  })

  test('server error response shows a friendly message without a stack trace', async ({ page }) => {
    await mockTncAnalysis(page, { error: 'Analysis failed. Please try again.' }, 500)
    await openTncSimplifier(page)

    await fillPastedTerms(page)
    await page.getByRole('button', { name: /Analyse these T&Cs/i }).click()

    await expect(page.getByText('Analysis failed', { exact: true })).toBeVisible()
    await expect(page.getByText('Analysis failed. Please try again.')).toBeVisible()
    await expect(page.getByText(/at .*\.js|Stack trace|TypeError|ReferenceError/i)).toHaveCount(0)
    await expect(page.locator('body')).not.toContainText(/API key|token|password|secret|Stack trace|at .*\.js/i)
  })

  test('low, medium, and high risk values display the correct risk labels', async ({ page }) => {
    for (const [risk, label] of [
      ['low', 'Low Risk'],
      ['medium', 'Medium Risk'],
      ['high', 'High Risk'],
    ]) {
      await mockTncAnalysis(page, analysisResponse(risk))
      await openTncSimplifier(page)

      await fillPastedTerms(page)
      await page.getByRole('button', { name: /Analyse these T&Cs/i }).click()

      await expect(page.getByText(label, { exact: true })).toBeVisible()
      await page.unroute('**/api/tnc-simplify')
    }
  })

  test('danger, warn, and pass clause severities display readable labels', async ({ page }) => {
    await mockTncAnalysis(page, analysisResponse('high', [
      {
        category: 'Data retention',
        severity: 'danger',
        clause: 'We may retain your data for ten years.',
        consequence: 'Your information may remain stored after you leave.',
        realCase: null,
      },
      {
        category: 'Cancellation',
        severity: 'warn',
        clause: 'You must cancel thirty days before renewal.',
        consequence: 'You may be charged again if you miss the deadline.',
        realCase: null,
      },
      {
        category: 'Security contact',
        severity: 'pass',
        clause: 'You can contact support to review account security.',
        consequence: 'This gives you a clear support path.',
        realCase: null,
      },
    ]))
    await openTncSimplifier(page)

    await fillPastedTerms(page)
    await page.getByRole('button', { name: /Analyse these T&Cs/i }).click()

    await expect(page.getByText('High concern')).toBeVisible()
    await expect(page.getByText('Worth noting')).toBeVisible()
    await expect(page.getByText('Fine', { exact: true })).toBeVisible()
  })

  test('flagged clauses are displayed from highest to lowest risk', async ({ page }) => {
    await mockTncAnalysis(page, analysisResponse('high', [
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
        clause: 'We may share personal information with analytics providers.',
        consequence: 'Your data may be used by another company.',
        realCase: null,
      },
      {
        category: 'AI training',
        severity: 'danger',
        clause: 'Submitted content may be used to train artificial intelligence systems.',
        consequence: 'Your private content may be reused to train AI models.',
        realCase: null,
      },
      {
        category: 'Cancellation',
        severity: 'warn',
        clause: 'You must cancel thirty days before renewal.',
        consequence: 'You may be charged again if you miss the deadline.',
        realCase: null,
      },
    ]))
    await openTncSimplifier(page)

    await fillPastedTerms(page)
    await page.getByRole('button', { name: /Analyse these T&Cs/i }).click()

    await expect(page.getByTestId('flagged-clause-category')).toHaveText([
      'AI training',
      'Data sharing',
      'Cancellation',
      'Security contact',
    ])
  })
})

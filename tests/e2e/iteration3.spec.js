import { expect, test } from '@playwright/test'

async function unlock(page) {
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('safecheck-unlocked', 'true')
  })
}

async function mockScamStats(page) {
  await page.route('**/api/scam-stats/online-seniors', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        topScamTypes: [
          { scam_type: 'Investment scams', total_reports: 50, total_lost: 200000 },
          { scam_type: 'Phishing', total_reports: 30, total_lost: 40000 },
        ],
        summary: {
          total_reports: 80,
          total_lost: 240000,
        },
      }),
    })
  })
}

test.describe('Iteration 3 functional and acceptance tests', () => {
  test('scam awareness page shows statistics, scam types, and trusted help links', async ({ page }) => {
    await mockScamStats(page)
    await unlock(page)

    await page.goto('/awareness')

    await expect(page.getByRole('heading', { name: 'Scam Awareness' })).toBeVisible()
    await expect(page.getByText('80')).toBeVisible()
    await expect(page.getByText('$240,000')).toBeVisible()
    await expect(page.getByText('Investment scams', { exact: true })).toBeVisible()
    await expect(page.getByText('Phishing', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Fake bank message' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Remote access or tech support scam' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Scamwatch/i })).toHaveAttribute('href', 'https://www.scamwatch.gov.au/')
  })

  test('scam awareness page shows an error state when statistics cannot load', async ({ page }) => {
    await page.route('**/api/scam-stats/online-seniors', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Could not load scam data' }),
      })
    })
    await unlock(page)

    await page.goto('/awareness')

    await expect(page.getByRole('heading', { name: 'Scam Awareness' })).toBeVisible()
    await expect(page.getByText('Scam statistics could not be loaded right now. You can still read the safety information below.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Common scam types' })).toBeVisible()
  })

  test('scam quiz accepts answers, shows feedback, and reaches the final score screen', async ({ page }) => {
    await mockScamStats(page)
    await unlock(page)

    await page.goto('/scam-quiz')

    await expect(page.getByRole('heading', { name: 'Scam Quiz' })).toBeVisible()

    for (let questionNumber = 1; questionNumber <= 5; questionNumber += 1) {
      await expect(page.getByText(`Question ${questionNumber} of 5`)).toBeVisible()
      await page.locator('button').filter({ hasText: /^[A-C]\./ }).first().click()
      await expect(page.getByText(/Correct answer|Incorrect answer/)).toBeVisible()
      await expect(page.getByText('Warning sign', { exact: true })).toBeVisible()
      await page.getByRole('button', { name: questionNumber === 5 ? /See my score/i : /Next Question/i }).click()
    }

    await expect(page.getByText('Final score')).toBeVisible()
    await expect(page.getByRole('button', { name: /Try Again/i })).toBeVisible()
  })

  test('T&C simplifier submits sample text and displays the API result', async ({ page }) => {
    await mockScamStats(page)
    await page.route('**/api/tnc-simplify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          overallRisk: 'medium',
          summary: 'The terms include broad data sharing and cancellation conditions worth reviewing.',
          flaggedClauses: [
            {
              category: 'Data sharing',
              severity: 'warn',
              clause: 'We may share your personal information with advertising partners.',
              consequence: 'Your details may be used by third parties.',
              realCase: null,
            },
          ],
        }),
      })
    })
    await unlock(page)

    await page.goto('/tnc-simplifier')
    await page.getByRole('button', { name: /Try a sample/i }).click()
    await page.getByRole('button', { name: /Analyse these T&Cs/i }).click()

    await expect(page.getByText('Medium Risk')).toBeVisible()
    await expect(page.getByText('Data sharing', { exact: true })).toBeVisible()
    await expect(page.getByText(/broad data sharing/i)).toBeVisible()
  })
})

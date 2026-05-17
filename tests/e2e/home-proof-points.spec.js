import { expect, test } from '@playwright/test'

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

async function unlock(page) {
  await mockScamStats(page)
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('safecheck-unlocked', 'true')
  })
  await page.reload()
}

test.describe('Home scam proof points', () => {
  test('proof point cards flip and link to matching awareness detail', async ({ page }) => {
    await unlock(page)

    const totalLossCard = page.getByRole('button', { name: /\$2\.74B.*reported scam losses/i })
    await expect(totalLossCard).toBeVisible()
    await totalLossCard.click()

    await expect(totalLossCard).toHaveAttribute('aria-pressed', 'true')
    await expect(totalLossCard.getByText('Reported losses add up quickly')).toBeVisible()

    await totalLossCard.getByRole('button', { name: 'Know more' }).click()

    await expect(page).toHaveURL(/\/awareness#proof-total-losses$/)
    await expect(page.locator('#proof-total-losses')).toBeVisible()
    await expect(page.locator('#proof-total-losses').getByRole('link', { name: /Read the ACCC report/i })).toHaveAttribute('href', /accc\.gov\.au/)
  })
})

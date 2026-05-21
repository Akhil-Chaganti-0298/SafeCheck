import { test, expect } from '@playwright/test'

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

test.describe('Frontend Smoke Tests', () => {
  test('Homepage opens directly when password gate flag is disabled', async ({ page }) => {
    await mockScamStats(page)
    await page.goto('/')
    
    await expect(page.getByPlaceholder('Password')).not.toBeVisible()
    
    const safeCheckHeading = page.getByText('SafeCheck')
    await expect(safeCheckHeading).toBeVisible()
  })

  test('Main page displays key UI elements', async ({ page }) => {
    await unlock(page)
    
    const mainHeading = page.getByRole('heading', {
      level: 1,
      name: /Protect your identity.*SafeCheck/i,
    })
    await expect(mainHeading).toBeVisible()
  })

  test('Main CTA buttons exist and are visible', async ({ page }) => {
    await unlock(page)
    
    const checkLinkButton = page.getByRole('button', { name: /Use Our URL Verifier/i })
    const simplifyButton = page.getByRole('button', { name: /Simplify T&Cs/i })
    const quizButton = page.getByRole('button', { name: /Take Scam Quiz/i })
    
    await expect(checkLinkButton).toBeVisible()
    await expect(simplifyButton).toBeVisible()
    await expect(quizButton).toBeVisible()
  })

  test('Navigation to URL verifier works', async ({ page }) => {
    await unlock(page)
    
    const checkLinkButton = page.getByRole('button', { name: /Use Our URL Verifier/i })
    await checkLinkButton.click()
    
    // Verify we navigated to the URL verifier page
    await expect(page).toHaveURL(/url-verifier/)
  })
})

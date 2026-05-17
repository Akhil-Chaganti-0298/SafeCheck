import { expect, test } from '@playwright/test'

async function unlock(page) {
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('safecheck-unlocked', 'true')
  })
}

function urlCheckResponse() {
  return {
    hostname: 'example-warning.com',
    verdict: 'warning',
    trustScore: 62,
    maxScore: 100,
    riskFactors: ['This website was only recently created'],
    scoreCategories: [
      { label: 'API Verification', score: 20, maxScore: 25, status: 'pass' },
      { label: 'HTTP Security', score: 12, maxScore: 25, status: 'warn' },
      { label: 'SSL/TLS Analysis', score: 20, maxScore: 25, status: 'pass' },
      { label: 'DNS Analysis', score: 10, maxScore: 25, status: 'danger' },
    ],
    checkGroups: [
      {
        id: 'website-age',
        status: 'danger',
        badge: 'Brand new',
        summary: 'This website was created very recently',
        detail: 'Scammers often create brand new websites to trick people.',
        items: [
          {
            label: 'How long this website has existed',
            status: 'danger',
            detail: 'This website was created very recently.',
          },
        ],
      },
      {
        id: 'connection',
        status: 'warn',
        badge: 'Mostly secure',
        summary: 'Your connection to this website is mostly secure',
        detail: 'Your connection is protected but there are one or two minor notes below.',
        items: [
          {
            label: 'One optional security setting is not enabled',
            status: 'warn',
            detail: 'This is a minor technical setting that many legitimate websites skip.',
          },
        ],
      },
      {
        id: 'content',
        status: 'warn',
        badge: 'Review content',
        summary: 'The page content has some warning signs',
        detail: 'We noticed urgency language that is worth checking carefully.',
        items: [
          {
            label: 'Urgency language',
            status: 'warn',
            detail: 'The page asks visitors to act quickly.',
          },
        ],
      },
      {
        id: 'threat-lists',
        status: 'pass',
        badge: 'All clear',
        summary: 'Not found on any scam or threat lists',
        detail: 'We checked multiple safety databases. None of them flagged this site.',
        items: [
          {
            label: 'Online security tools',
            status: 'pass',
            detail: 'No known security tools flagged this site.',
          },
        ],
      },
    ],
    checks: [],
    domainStatus: 'brand_new',
  }
}

async function mockUrlCheck(page) {
  await page.route('**/api/check-url', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(urlCheckResponse()),
    })
  })
}

test.describe('URL verifier risk cards', () => {
  test('risk cards are the default result view and can be paged by risk level', async ({ page }) => {
    await mockUrlCheck(page)
    await unlock(page)

    await page.goto('/url-verifier')
    await page.getByPlaceholder('e.g. example.com or https://example.com').fill('example-warning.com')
    await page.getByRole('button', { name: 'Check this website' }).click()

    await expect(page.getByText('Caution', { exact: true })).toBeVisible()
    await expect(page.getByTestId('url-risk-card-title')).toHaveText([
      'This website was created very recently',
      'Your connection to this website is mostly secure',
      'Not found on any scam or threat lists',
    ])

    await page.getByRole('button', { name: 'Next Worth noting risk card' }).click()

    await expect(page.getByTestId('url-risk-card-title')).toHaveText([
      'This website was created very recently',
      'The page content has some warning signs',
      'Not found on any scam or threat lists',
    ])

    await page.getByRole('button', { name: 'Full summary' }).click()
    await expect(page.getByText('The page content has some warning signs')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Show more detail' })).toHaveCount(4)
  })
})

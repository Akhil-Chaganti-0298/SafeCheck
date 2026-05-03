import httpClient from './httpClient.js'

// Points: HTTPS 10, four security headers 3 each = 12, redirect check 3 = 25 total.
export async function checkHttpSecurity(url) {
  let score = 0
  const details = {}

  const isHttps = url.startsWith('https://')

  // HTTPS: 10 points -- biggest single check in this category
  if (isHttps) {
    score += 10
    details.https = { status: 'pass', points: 10, message: 'Site uses HTTPS to protect your connection' }
  } else {
    details.https = { status: 'danger', points: 0, message: 'Site does not use HTTPS -- your data could be seen by others' }
  }

  try {
    const response = await httpClient.get(url, {
      timeout: 6000,
      validateStatus: () => true,
      maxRedirects: 2,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SafeCheck/1.0)' },
    })

    const h = response.headers

    // HSTS: tells browsers to always use HTTPS even if the user types http://
    if (h['strict-transport-security']) {
      score += 3
      details.hsts = { status: 'pass', points: 3, message: 'HSTS is enabled -- browsers will always use HTTPS' }
    } else {
      details.hsts = { status: 'warn', points: 0, message: 'HSTS header is missing' }
    }

    // X-Frame-Options / CSP frame-ancestors: stops the page being embedded in an iframe on another site
    const hasFrameProtection = h['x-frame-options'] || h['content-security-policy']?.includes('frame-ancestors')
    if (hasFrameProtection) {
      score += 3
      details.xFrame = { status: 'pass', points: 3, message: 'Protected against clickjacking attacks' }
    } else {
      details.xFrame = { status: 'warn', points: 0, message: 'No clickjacking protection header found' }
    }

    // X-Content-Type-Options: stops browsers guessing a file type and running it as something else
    if (h['x-content-type-options'] === 'nosniff') {
      score += 3
      details.xContentType = { status: 'pass', points: 3, message: 'Content type sniffing is blocked' }
    } else {
      details.xContentType = { status: 'warn', points: 0, message: 'X-Content-Type-Options header is missing' }
    }

    // CSP: controls which domains the page is allowed to load resources from
    if (h['content-security-policy']) {
      score += 3
      details.csp = { status: 'pass', points: 3, message: 'Content Security Policy is in place' }
    } else {
      details.csp = { status: 'warn', points: 0, message: 'No Content Security Policy found' }
    }

    if (isHttps) {
      score += 3
      details.redirect = { status: 'pass', points: 3, message: 'Already using HTTPS' }
    } else {
      // Quick probe to see if an HTTPS version exists. Short timeout, no redirect following.
      try {
        const httpsUrl = url.replace('http://', 'https://')
        const redirectTest = await httpClient.get(httpsUrl, {
          timeout: 3000,
          validateStatus: (s) => s < 500,
          maxRedirects: 0,
        })
        if (redirectTest.status < 400) {
          score += 3
          details.redirect = { status: 'pass', points: 3, message: 'HTTPS version of this site is available' }
        } else {
          details.redirect = { status: 'warn', points: 0, message: 'No HTTPS version available' }
        }
      } catch {
        details.redirect = { status: 'warn', points: 0, message: 'Could not check for an HTTPS redirect' }
      }
    }

  } catch (error) {
    console.error('[httpSecurity] could not fetch headers:', error.code || error.message)
    // Page could not be loaded -- give partial credit if HTTPS was at least confirmed from the URL
    if (isHttps) score += 5
    details.fetchError = { message: 'Could not load page headers', code: error.code }
  }

  const statuses = Object.values(details).filter(d => d.status).map(d => d.status)
  const categoryStatus = statuses.includes('danger') ? 'danger' : statuses.includes('warn') ? 'warn' : 'pass'

  return {
    category: 'HTTP Security',
    score: Math.min(score, 25),
    maxScore: 25,
    status: categoryStatus,
    details,
  }
}

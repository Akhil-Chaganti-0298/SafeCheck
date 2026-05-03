import * as cheerio from 'cheerio'
import httpClient from './httpClient.js'

// Phrases that appear on parked domain pages shown by registrars when a
// domain has been registered but no site has been built on it yet
const PARKED_SIGNALS = [
  'domain for sale',
  'buy this domain',
  'this domain is for sale',
  'domain is for sale',
  'domain listed for sale',
  'domain is available for purchase',
  'purchase this domain',
  'make an offer on this domain',
  'domain parking',
  'parked domain',
  'this domain has been registered',
  'hugedomains',
  'afternic',
  'sedo',
  'dan.com',
]

const EXPIRED_SIGNALS = [
  'domain has expired',
  'this domain has expired',
  'domain name has expired',
  'domain registration has expired',
  'domain is expired',
  'expired domain',
  'renew this domain',
  'domain suspension notice',
]

const COMING_SOON_SIGNALS = [
  'coming soon',
  'under construction',
  'launching soon',
  'we are coming soon',
  'website coming soon',
  'stay tuned',
  'launching shortly',
  'work in progress',
]

function matchesAny(text, signals) {
  return signals.some(signal => text.includes(signal))
}

// Fetches the page and returns a plain-English description of what kind of site it is.
// Informational only -- does not contribute to the score.
export async function summarisePageContent(url) {
  const label = 'What this website appears to be'

  try {
    const response = await httpClient.get(url, {
      timeout: 6000,
      validateStatus: () => true,
      maxRedirects: 3,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SafeCheck/1.0)' },
    })

    if (response.status === 404) {
      return { label, status: 'warn', detail: 'This page does not exist (404 not found)' }
    }
    if (response.status === 403) {
      return { label, status: 'warn', detail: 'This website blocked our request (access denied)' }
    }
    if (response.status >= 500) {
      return { label, status: 'warn', detail: 'This website had a server error when we tried to load it' }
    }

    if (!response.data || typeof response.data !== 'string') {
      return { label, status: 'warn', detail: 'This page did not return any readable content' }
    }

    const $ = cheerio.load(response.data)

    const title = $('title').text().toLowerCase().trim()

    // Cap at 3000 characters -- enough to catch signals in the above-the-fold content
    const bodyText = $('body').text().toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 3000)

    const combined = `${title} ${bodyText}`

    // Check expired before parked because some expired pages also mention "for sale"
    if (matchesAny(combined, EXPIRED_SIGNALS)) {
      return {
        label,
        status: 'warn',
        detail: 'This domain has expired and is no longer active',
      }
    }

    if (matchesAny(combined, PARKED_SIGNALS)) {
      return {
        label,
        status: 'warn',
        detail: 'This domain is listed for sale and has no real content yet',
      }
    }

    if (matchesAny(combined, COMING_SOON_SIGNALS)) {
      return {
        label,
        status: 'warn',
        detail: 'This website is not launched yet',
      }
    }

    // A password field means someone is being asked to log in
    const passwordFields = $('input[type="password"]').length
    if (passwordFields > 0) {
      return {
        label,
        status: 'warn',
        detail: 'This page is asking you to enter a password or login credentials',
      }
    }

    // Words shorter than 3 characters are filtered out to avoid counting filler like "a", "to"
    const wordCount = bodyText.split(' ').filter(w => w.length > 2).length
    if (wordCount < 20) {
      return {
        label,
        status: 'warn',
        detail: 'This page has very little content -- it may not be a real website',
      }
    }

    const displayTitle = $('title').text().trim()
    if (displayTitle && displayTitle.length > 0) {
      return {
        label,
        status: 'pass',
        detail: `This appears to be a normal website${displayTitle.length < 60 ? ` (${displayTitle})` : ''}`,
      }
    }

    return {
      label,
      status: 'pass',
      detail: 'This appears to be a normal website',
    }

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return { label, status: 'warn', detail: 'This website refused the connection when we tried to load it' }
    }
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return { label, status: 'warn', detail: 'This website took too long to respond' }
    }
    return { label, status: 'warn', detail: 'We could not load this page to check its content' }
  }
}

import httpClient from './httpClient.js'

const PHISHSTATS_ENDPOINT = 'https://api.phishstats.info/api/phishing'
const PHISHSTATS_TIMEOUT_MS = 7000

// Normalize a hostname for exact domain matching:
// - lowercase it
// - remove leading 'www.'
function normalizeHostname(hostname) {
  let clean = hostname.toLowerCase()
  if (clean.startsWith('www.')) {
    clean = clean.slice(4)
  }
  return clean
}

// PhishStats uses a SQL-like filter syntax to query by exact domain
function buildParams(hostname) {
  return {
    _where: `(domain,eq,${hostname})`,
    _sort: '-id',
    _size: 100,
  }
}

export async function checkPhishStats(url, hostname) {
  if (!hostname) {
    return {
      matched: false,
      count: 0,
      phishScore: null,
      host: null,
      title: null,
      exactMatch: false,
      error: true,
    }
  }

  try {
    const cleanHostname = normalizeHostname(hostname)

    const response = await httpClient.get(PHISHSTATS_ENDPOINT, {
      params: buildParams(cleanHostname),
      timeout: PHISHSTATS_TIMEOUT_MS,
    })

    // The API sometimes wraps results in a data property, sometimes not
    const items = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : []

    // Find an exact domain match by comparing normalized hostnames
    let exactMatchItem = null
    for (const item of items) {
      const itemDomain = item.domain ? normalizeHostname(item.domain) : null
      const itemHost = item.host ? normalizeHostname(item.host) : null

      if (itemDomain === cleanHostname || itemHost === cleanHostname) {
        exactMatchItem = item
        break
      }
    }

    if (exactMatchItem) {
      const score = Number.isFinite(Number(exactMatchItem?.score))
        ? Number(exactMatchItem.score)
        : null

      return {
        matched: score !== null && score >= 8,
        count: items.length,
        phishScore: score,
        host: exactMatchItem?.host || null,
        title: exactMatchItem?.title || null,
        exactMatch: true,
        error: false,
      }
    }

    // No exact match found
    return {
      matched: false,
      count: items.length,
      phishScore: null,
      host: null,
      title: null,
      exactMatch: false,
      error: false,
    }
  } catch (err) {
    console.error('[PhishStats] request failed:', err.message, err.response?.status)
  }

  return {
    matched: false,
    count: 0,
    phishScore: null,
    host: null,
    title: null,
    exactMatch: false,
    error: true,
  }
}

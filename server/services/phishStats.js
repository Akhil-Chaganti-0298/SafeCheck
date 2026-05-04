import httpClient from './httpClient.js'

const PHISHSTATS_ENDPOINT = 'https://api.phishstats.info/api/phishing'
const PHISHSTATS_TIMEOUT_MS = 7000

// PhishStats uses a SQL-like filter syntax to query by URL
function buildParams(url) {
  return {
    _where: `(url,like,${url})`,
    _sort: '-id',
    _size: 5,
  }
}

export async function checkPhishStats(url) {
  try {
    const response = await httpClient.get(PHISHSTATS_ENDPOINT, {
      params: buildParams(url),
      timeout: PHISHSTATS_TIMEOUT_MS,
    })

    // The API sometimes wraps results in a data property, sometimes not
    const items = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : []

    const item = items[0] || null

    return {
      matched: items.length > 0,
      count: items.length,
      phishScore: Number.isFinite(Number(item?.score)) ? Number(item.score) : null,
      host: item?.host || null,
      title: item?.title || null,
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
    error: true,
  }
}

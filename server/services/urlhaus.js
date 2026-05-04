import httpClient from './httpClient.js'

const URLHAUS_LOOKUP_URL = 'https://urlhaus-api.abuse.ch/v1/url/'
const URLHAUS_TIMEOUT_MS = 7000

export async function checkUrlhaus(url) {
  const apiKey = process.env.URLHAUS_API_KEY

  if (!apiKey) {
    console.warn('[URLhaus] URLHAUS_API_KEY is not set; request may fail until it is configured.')
    return { error: true, matched: false }
  }

  // URLhaus expects the URL as a form-encoded body, not JSON
  const body = new URLSearchParams({ url }).toString()

  try {
    const response = await httpClient.post(URLHAUS_LOOKUP_URL, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Auth-Key': apiKey,
      },
      timeout: URLHAUS_TIMEOUT_MS,
    })

    const data = response.data || {}
    const queryStatus = String(data.query_status || '').toLowerCase()
    const urlStatus = data.url_status || null
    const tags = Array.isArray(data.tags) ? data.tags : []

    // is_db_match means the URL is in their malware database
    if (queryStatus === 'is_db_match') {
      return {
        matched: true,
        threat: data.threat || null,
        urlStatus,
        status: urlStatus,
        tags,
        error: false,
      }
    }

    if (queryStatus === 'no_results') {
      return {
        matched: false,
        threat: null,
        urlStatus,
        status: urlStatus,
        tags,
        error: false,
      }
    }

    return { error: true, matched: false }
  } catch (err) {
    console.error('[URLhaus] request failed:', err.message, err.response?.status, err.response?.data)
    return { error: true, matched: false }
  }
}

import axios from 'axios'

const OTX_TIMEOUT_MS = 7000

export async function checkOtx(hostname) {
  const apiKey = process.env.OTX_API_KEY
  const endpoint = `https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(hostname)}/general`

  if (!apiKey) {
    console.warn('[OTX] OTX_API_KEY is not set; requesting public data without an API key.')
  }

  try {
    const response = await axios.get(endpoint, {
      timeout: OTX_TIMEOUT_MS,
      ...(apiKey ? { headers: { 'X-OTX-API-KEY': apiKey } } : {}),
    })

    const pulseInfo = response.data?.pulse_info || {}
    const pulseCount = Number(pulseInfo.count || 0)
    const reputation = Number.isFinite(Number(response.data?.reputation)) ? Number(response.data.reputation) : 0
    const validation = Array.isArray(response.data?.validation) ? response.data.validation : []
    const isWhitelisted = validation.some(entry => entry?.source === 'whitelist' || entry?.source === 'false_positive')

    return {
      matched: pulseCount > 0 && !isWhitelisted,
      pulseCount,
      reputation,
      isWhitelisted,
      error: false,
    }
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 404) {
      return {
        matched: false,
        pulseCount: 0,
        reputation: 0,
        isWhitelisted: false,
        error: false,
      }
    }

    console.error('[OTX] request failed:', err.message, err.response?.status)

    return {
      error: true,
      matched: false,
      pulseCount: 0,
      reputation: 0,
      isWhitelisted: false,
    }
  }
}

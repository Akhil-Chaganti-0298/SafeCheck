import httpClient from './httpClient.js'

const SAFE_BROWSING_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find'

export async function checkGoogleSafeBrowsing(url) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY

  const body = {
    client: {
      clientId: 'safecheck-app',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }],
    },
  }

  const response = await httpClient.post(`${SAFE_BROWSING_URL}?key=${apiKey}`, body)

  // Empty matches array means the URL is clean
  const matches = response.data.matches || []
  if (matches.length === 0) {
    return { isThreat: false }
  }

  return {
    isThreat: true,
    threatType: matches[0].threatType,
  }
}

import { checkGoogleSafeBrowsing } from './safeBrowsing.js'
import { checkVirusTotal } from './virusTotal.js'
import { checkUrlhaus } from './urlhaus.js'
import { checkPhishStats } from './phishStats.js'

// Any API taking longer than this gets cut off. 8 seconds is generous enough
// for a real response but short enough not to stall the user.
const TIMEOUT_MS = 8000

function withTimeout(promise, name) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${name} timed out`)), TIMEOUT_MS)
    ),
  ])
}

// Runs all 4 threat checks in parallel. Points: Google 7, VirusTotal 8, URLhaus 5, PhishStats 5 = 25.
// API errors get partial credit rather than 0 -- the failure is on our side, not the site's.
export async function checkApiAggregation(url, hostname) {
  let score = 0
  const details = {}

  const [googleResult, vtResult, urlhausResult, phishResult] = await Promise.allSettled([
    withTimeout(checkGoogleSafeBrowsing(url), 'Google Safe Browsing'),
    withTimeout(checkVirusTotal(url), 'VirusTotal'),
    withTimeout(checkUrlhaus(url), 'URLhaus'),
    withTimeout(checkPhishStats(url, hostname), 'PhishStats'),
  ])

  // Google Safe Browsing: 7 points
  const google = googleResult.status === 'fulfilled' ? googleResult.value : { error: true }
  if (google.error) {
    score += 3
    details.google = { status: 'warn', points: 3, message: 'Google check unavailable right now' }
  } else if (google.isThreat) {
    details.google = { status: 'danger', points: 0, message: `Google flagged this site (${google.threatType})` }
  } else {
    score += 7
    details.google = { status: 'pass', points: 7, message: 'Google found no threats' }
  }

  // VirusTotal: 8 points
  // 1-2 detections is warn (could be a false positive), 3+ is danger
  const vt = vtResult.status === 'fulfilled' ? vtResult.value : { error: true }
  if (vt.error) {
    score += 4
    details.virusTotal = { status: 'warn', points: 4, message: 'Antivirus scan unavailable right now' }
  } else if (vt.malicious > 2) {
    details.virusTotal = { status: 'danger', points: 0, malicious: vt.malicious, message: `${vt.malicious} antivirus tools flagged this site` }
  } else if (vt.malicious > 0) {
    score += 4
    details.virusTotal = { status: 'warn', points: 4, malicious: vt.malicious, message: `${vt.malicious} antivirus tool(s) raised a concern` }
  } else {
    score += 8
    details.virusTotal = { status: 'pass', points: 8, malicious: 0, message: 'No antivirus tools found any issues' }
  }

  // URLhaus: 5 points
  const urlhaus = urlhausResult.status === 'fulfilled' ? urlhausResult.value : { error: true }
  if (urlhaus.error) {
    score += 2
    details.urlhaus = { status: 'warn', points: 2, message: 'Malware list check unavailable right now' }
  } else if (urlhaus.matched) {
    details.urlhaus = { status: 'danger', points: 0, message: 'Found on a known malware distribution list' }
  } else {
    score += 5
    details.urlhaus = { status: 'pass', points: 5, message: 'Not found on any malware list' }
  }

  // PhishStats: 5 points
  const phish = phishResult.status === 'fulfilled' ? phishResult.value : { error: true }
  if (phish.error) {
    score += 2
    details.phishStats = { status: 'warn', points: 2, message: 'Phishing list check unavailable right now' }
  } else if (phish.matched) {
    details.phishStats = { status: 'danger', points: 0, message: 'Found on a known phishing list' }
  } else {
    score += 5
    details.phishStats = { status: 'pass', points: 5, message: 'Not found on any phishing list' }
  }

  const statuses = [details.google.status, details.virusTotal.status, details.urlhaus.status, details.phishStats.status]
  const categoryStatus = statuses.includes('danger') ? 'danger' : statuses.includes('warn') ? 'warn' : 'pass'

  return {
    category: 'API Verification',
    score: Math.min(score, 25),
    maxScore: 25,
    status: categoryStatus,
    details,
  }
}

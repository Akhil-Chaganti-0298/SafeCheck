import express from 'express'
import { checkGoogleSafeBrowsing } from '../services/safeBrowsing.js'
import { checkVirusTotal } from '../services/virusTotal.js'
import { checkUrlhaus } from '../services/urlhaus.js'
import { checkPhishStats } from '../services/phishStats.js'
import { checkOtx } from '../services/otx.js'

const router = express.Router()

const SUSPICIOUS_KEYWORDS = [
  'free-prize', 'claim-now', 'verify-account', 'login-update',
  'secure-bank', 'paypa1', 'arnazon', 'g00gle', 'micros0ft',
]
const SUSPICIOUS_TLDS = ['.xyz', '.tk', '.cf', '.ml', '.ga', '.click', '.top']
const PROVIDER_TIMEOUT_MS = 8000

const GOOGLE_FALLBACK = { error: true, matched: false, isThreat: false, threatType: null }
const VT_FALLBACK = { error: true, matched: false, malicious: 0, suspicious: 0, harmless: 0, undetected: 0 }
const URLHAUS_FALLBACK = { error: true, matched: false, status: null, threat: null, tags: [] }
const PHISHSTATS_FALLBACK = { error: true, matched: false, phishScore: null, confidence: null, verified: null }
const OTX_FALLBACK = { error: true, matched: false, pulseCount: 0, pulses: [] }

function withTimeout(promise, providerName) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${providerName} request timed out`)), PROVIDER_TIMEOUT_MS)
    }),
  ])
}

function getSettledValue(result, fallback) {
  if (result.status === 'fulfilled' && result.value) {
    return result.value
  }

  return fallback
}

function normalizeUrl(rawUrl) {
  let url = rawUrl.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  return url
}

function inspectDomain(normalized) {
  let hostname
  try {
    hostname = new URL(normalized).hostname.toLowerCase()
  } catch {
    return null
  }

  return {
    hostname,
    normalized,
    hasSuspiciousKeyword: SUSPICIOUS_KEYWORDS.some(k => hostname.includes(k)),
    hasSuspiciousTld:     SUSPICIOUS_TLDS.some(t => hostname.endsWith(t)),
    hasExcessiveDashes:   (hostname.match(/-/g) || []).length >= 3,
    hasIpAddress:         /^\d+\.\d+\.\d+\.\d+$/.test(hostname),
    isHttp:               normalized.startsWith('http://'),
  }
}

function buildChecks(local, googleData, vtData, urlhausData, phishStatsData, otxData) {
  return [
    {
      label: 'Google check',
      status: googleData.error ? 'warn' : googleData.isThreat ? 'danger' : 'pass',
      detail: googleData.error
        ? 'We could not check Google, so we skipped this step.'
        : googleData.isThreat
        ? `Google thinks this site may be unsafe (${googleData.threatType}).`
        : 'Google did not flag this site.',
    },
    {
      label: 'Security scan',
      status: vtData.error ? 'warn' : vtData.malicious > 2 ? 'danger' : vtData.malicious > 0 ? 'warn' : 'pass',
      detail: vtData.error
        ? 'We could not run the security scan, so we skipped this step.'
        : vtData.malicious > 2
        ? 'Several security tools flagged this site.'
        : vtData.malicious > 0
        ? 'One security tool flagged this site.'
        : 'No issues were found by the security tools.',
    },
    {
      label: 'Secure connection',
      status: local.isHttp ? 'warn' : 'pass',
      detail: local.isHttp
        ? 'This site does not use HTTPS, so the connection is not protected.'
        : 'This site uses HTTPS, so the connection is protected.',
    },
    {
      label: 'Website name',
      status: (local.hasExcessiveDashes || local.hasIpAddress || local.hasSuspiciousKeyword || local.hasSuspiciousTld) ? 'warn' : 'pass',
      detail: local.hasIpAddress        ? 'This site uses an IP address instead of a normal website name.'
            : local.hasSuspiciousKeyword ? 'The website name includes words often used in scams.'
            : local.hasSuspiciousTld     ? 'This site uses a less common web address ending.'
            : local.hasExcessiveDashes   ? 'The website name has an unusual number of dashes.'
                                         : 'The website name looks normal.',
    },
    {
      label: 'URLhaus database',
      status: urlhausData.error ? 'warn' : urlhausData.matched ? 'danger' : 'pass',
      detail: urlhausData.error
        ? 'We could not check URLhaus, so we skipped this step.'
        : urlhausData.matched
        ? 'URLhaus lists this URL in its malware database.'
        : 'URLhaus did not list this URL.',
    },
    {
      label: 'PhishStats database',
      status: phishStatsData.error ? 'warn' : phishStatsData.matched ? 'danger' : 'pass',
      detail: phishStatsData.error
        ? 'We could not check PhishStats, so we skipped this step.'
        : phishStatsData.matched
        ? 'PhishStats has phishing intelligence for this URL.'
        : 'PhishStats did not find this URL.',
    },
    {
      label: 'OTX intelligence',
      status: otxData.error ? 'warn' : otxData.matched ? 'warn' : 'pass',
      detail: otxData.error
        ? 'We could not check OTX, so we skipped this step.'
        : otxData.matched
        ? `OTX has related threat intelligence (${otxData.pulseCount} pulse${otxData.pulseCount === 1 ? '' : 's'}).`
        : 'OTX did not return related intelligence for this host.',
    },
  ]
}

function buildScoreCategories(local, googleData, vtData, urlhausData, phishStatsData, otxData) {
  const googleStatus = googleData.error ? 'warn' : googleData.isThreat ? 'danger' : 'pass'
  const vtStatus = vtData.error ? 'warn' : vtData.malicious > 2 ? 'danger' : vtData.malicious > 0 ? 'warn' : 'pass'
  const urlhausStatus = urlhausData.error ? 'warn' : urlhausData.matched ? 'danger' : 'pass'
  const phishStatsStatus = phishStatsData.error ? 'warn' : phishStatsData.matched ? 'danger' : 'pass'
  const otxStatus = otxData.error ? 'warn' : otxData.matched ? 'warn' : 'pass'

  return [
    {
      label: 'Google check',
      maxDeduction: 40,
      deduction: googleData.isThreat ? 40 : 0,
      passed: googleStatus === 'pass',
      status: googleStatus,
      detail: googleData.error     ? 'Could not check Google'
            : googleData.isThreat  ? 'Google flagged this site'
                                   : 'Google did not flag this site',
    },
    {
      label: 'Security scan',
      maxDeduction: 30,
      deduction: vtData.malicious > 2 ? 30 : vtData.malicious > 0 ? 10 : 0,
      passed: vtStatus === 'pass',
      status: vtStatus,
      detail: vtData.error           ? 'Could not run the scan'
            : vtData.malicious > 2   ? 'Several tools flagged this site'
            : vtData.malicious > 0   ? 'One tool flagged this site'
                                     : 'No issues found',
    },
    {
      label: 'Secure connection',
      maxDeduction: 10,
      deduction: local.isHttp ? 10 : 0,
      passed: local.isHttp ? false : true,
      status: local.isHttp ? 'warn' : 'pass',
      detail: local.isHttp ? 'Site uses HTTP' : 'Site uses HTTPS',
    },
    {
      label: 'Scam words in name',
      maxDeduction: 20,
      deduction: local.hasSuspiciousKeyword ? 20 : 0,
      passed: local.hasSuspiciousKeyword ? false : true,
      status: local.hasSuspiciousKeyword ? 'danger' : 'pass',
      detail: local.hasSuspiciousKeyword ? 'The website name includes words often seen in scams' : 'No scam words found',
    },
    {
      label: 'Website ending',
      maxDeduction: 15,
      deduction: local.hasSuspiciousTld ? 15 : 0,
      passed: local.hasSuspiciousTld ? false : true,
      status: local.hasSuspiciousTld ? 'warn' : 'pass',
      detail: local.hasSuspiciousTld ? 'This ending is less common and can be risky' : 'The website ending looks normal',
    },
    {
      label: 'IP address used',
      maxDeduction: 15,
      deduction: local.hasIpAddress ? 15 : 0,
      passed: local.hasIpAddress ? false : true,
      status: local.hasIpAddress ? 'danger' : 'pass',
      detail: local.hasIpAddress ? 'This site uses an IP address instead of a website name' : 'A normal website name is used',
    },
    {
      label: 'Website name',
      maxDeduction: 10,
      deduction: local.hasExcessiveDashes ? 10 : 0,
      passed: local.hasExcessiveDashes ? false : true,
      status: local.hasExcessiveDashes ? 'warn' : 'pass',
      detail: local.hasExcessiveDashes ? 'The website name has an unusual number of dashes' : 'The website name looks normal',
    },
    {
      label: 'URLhaus malware database',
      maxDeduction: 25,
      deduction: urlhausData.matched ? 25 : 0,
      passed: urlhausStatus === 'pass',
      status: urlhausStatus,
      detail: urlhausData.missingKey ? 'URLhaus is not configured yet.'
            : urlhausData.error     ? 'Could not check URLhaus'
            : urlhausData.matched   ? 'URLhaus lists this URL as malicious'
                                    : 'No URLhaus match found',
    },
    {
      label: 'PhishStats phishing database',
      maxDeduction: 20,
      deduction: phishStatsData.matched ? 20 : 0,
      passed: phishStatsStatus === 'pass',
      status: phishStatsStatus,
      detail: phishStatsData.error      ? 'Could not check PhishStats'
            : phishStatsData.matched    ? 'PhishStats has phishing intelligence for this URL'
                                       : 'No PhishStats match found',
    },
    {
      label: 'OTX threat intelligence',
      maxDeduction: 10,
      deduction: otxData.matched ? 10 : 0,
      passed: otxStatus === 'pass',
      status: otxStatus,
      detail: otxData.error     ? 'Could not check OTX'
            : otxData.matched   ? 'OTX has related pulses for this host'
                                : 'No OTX pulses found for this host',
    },
  ]
}

router.post('/check-url', async (req, res) => {
  const { url } = req.body

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please provide a website address to check.' })
  }

  const local = inspectDomain(normalizeUrl(url))
  if (!local) {
    return res.status(400).json({ error: 'That does not look like a valid website address.' })
  }

  const [googleResult, vtResult, urlhausResult, phishStatsResult, otxResult] = await Promise.allSettled([
    withTimeout(checkGoogleSafeBrowsing(local.normalized), 'Google Safe Browsing'),
    withTimeout(checkVirusTotal(local.normalized), 'VirusTotal'),
    withTimeout(checkUrlhaus(local.normalized), 'URLhaus'),
    withTimeout(checkPhishStats(local.normalized, local.hostname), 'PhishStats'),
    withTimeout(checkOtx(local.hostname), 'OTX'),
  ])

  const googleData = getSettledValue(googleResult, GOOGLE_FALLBACK)
  const vtData = getSettledValue(vtResult, VT_FALLBACK)
  const urlhausData = getSettledValue(urlhausResult, URLHAUS_FALLBACK)
  const phishStatsData = getSettledValue(phishStatsResult, PHISHSTATS_FALLBACK)
  const otxData = getSettledValue(otxResult, OTX_FALLBACK)

  const scoreCategories = buildScoreCategories(local, googleData, vtData, urlhausData, phishStatsData, otxData)
  const trustScore = Math.max(0, 100 - scoreCategories.reduce((sum, c) => sum + c.deduction, 0))

  const isDefinitelyUnsafe = (
    googleData.isThreat ||
    vtData.malicious > 2 ||
    urlhausData.matched ||
    phishStatsData.matched ||
    local.hasSuspiciousKeyword ||
    local.hasIpAddress ||
    local.hasSuspiciousTld
  )

  const hasWarnings = !isDefinitelyUnsafe && (
    local.hasExcessiveDashes ||
    local.isHttp ||
    vtData.malicious > 1 ||
    otxData.matched
  )

  const riskFactors = []
  if (local.hasSuspiciousKeyword) riskFactors.push('The website name includes words often seen in scams.')
  if (local.hasSuspiciousTld)     riskFactors.push('This site uses a less common web address ending.')
  if (local.hasExcessiveDashes)   riskFactors.push('The website name has an unusual number of dashes.')
  if (local.hasIpAddress)         riskFactors.push('This site uses an IP address instead of a normal website name.')
  if (local.isHttp)               riskFactors.push('This site does not use HTTPS.')
  if (googleData.isThreat)        riskFactors.push(`Google thinks this site may be unsafe (${googleData.threatType}).`)
  if (vtData.malicious > 1)       riskFactors.push('Several security tools flagged this site.')
  if (urlhausData.matched)        riskFactors.push('URLhaus lists this URL in its malware database.')
  if (phishStatsData.matched)     riskFactors.push('PhishStats has phishing intelligence for this URL.')
  if (otxData.matched)            riskFactors.push('OTX has related threat intelligence for this host.')

  res.json({
    hostname: local.hostname,
    verdict: isDefinitelyUnsafe ? 'unsafe' : hasWarnings ? 'warning' : 'safe',
    trustScore,
    scoreCategories,
    riskFactors,
    checks: buildChecks(local, googleData, vtData, urlhausData, phishStatsData, otxData),
    threatIntel: {
      google: { matched: Boolean(googleData.isThreat), error: Boolean(googleData.error), threatType: googleData.threatType || null },
      virusTotal: { matched: vtData.malicious > 0, error: Boolean(vtData.error), malicious: vtData.malicious, suspicious: vtData.suspicious },
      urlhaus: { matched: Boolean(urlhausData.matched), error: Boolean(urlhausData.error), status: urlhausData.status || null },
      phishStats: { matched: Boolean(phishStatsData.matched), error: Boolean(phishStatsData.error), phishScore: phishStatsData.phishScore },
      otx: { matched: Boolean(otxData.matched), error: Boolean(otxData.error), pulseCount: otxData.pulseCount },
    },
  })
})

export default router

import express from 'express'
import { checkGoogleSafeBrowsing } from '../services/safeBrowsing.js'
import { checkVirusTotal } from '../services/virusTotal.js'
import { checkUrlhaus } from '../services/urlhaus.js'
import { checkPhishStats } from '../services/phishStats.js'
import { checkOtx } from '../services/otx.js'
import {
  WEBSITE_INPUT_ERROR,
  parseWebsiteInput,
} from '../../shared/websiteValidation.js'

const router = express.Router()

// TLDs that are free/unregulated and commonly abused by scammers.
const SUSPICIOUS_TLDS = ['.xyz', '.tk', '.cf', '.ml', '.ga', '.click', '.top']

// Keywords that frequently appear in phishing URL paths.
// Checked against the path only (not the domain) to avoid false positives on
// legitimate login pages hosted on well-known domains.
const PHISHING_PATH_KEYWORDS = [
  'verify', 'account-suspended', 'confirm-identity',
  'secure-login', 'update-billing', 'signin-confirm', 'verify-payment',
]

// How long each external provider is allowed to take before we skip it and
// use its fallback value instead.
const PROVIDER_TIMEOUT_MS = 8000

// Fallback values used when a provider times out or returns an error.
// These are intentionally neutral — we do not want to penalise users for our
// own connectivity problems.
const GOOGLE_FALLBACK     = { error: true, matched: false, isThreat: false, threatType: null }
const VT_FALLBACK         = { error: true, matched: false, malicious: 0, suspicious: 0, harmless: 0, undetected: 0 }
const URLHAUS_FALLBACK    = { error: true, matched: false, status: null, threat: null, tags: [] }
const PHISHSTATS_FALLBACK = { error: true, matched: false, phishScore: null, confidence: null, verified: null }
const OTX_FALLBACK        = { error: true, matched: false, pulseCount: 0, pulses: [] }

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

// Extracts all the local (no-API-call-needed) signals from the raw URL input.
function inspectDomain(rawUrl) {
  const parsed = parseWebsiteInput(rawUrl)
  if (!parsed) return null

  // Pull out just the path so keyword checks don't fire on the domain itself.
  let urlPath = ''
  try { urlPath = new URL(parsed.normalized).pathname } catch { /* leave empty */ }

  // Subdomain depth: legitimate sites rarely have more than 4 labels total
  // (e.g. www.shop.example.com = 4). Anything deeper is unusual.
  const labelCount = parsed.hostname.split('.').length

  return {
    hostname:               parsed.hostname,
    normalized:             parsed.normalized,
    hasSuspiciousTld:       SUSPICIOUS_TLDS.some(t => parsed.hostname.endsWith(t)),
    hasExcessiveDashes:     (parsed.hostname.match(/-/g) || []).length >= 3,
    hasIpAddress:           parsed.isIpAddress,
    isHttp:                 parsed.normalized.startsWith('http://'),
    hasExcessiveSubdomains: !parsed.isIpAddress && labelCount > 4,
    hasPhishingKeywords:    PHISHING_PATH_KEYWORDS.some(kw => urlPath.toLowerCase().includes(kw)),
  }
}

// buildChecks produces the human-readable "What we checked" list shown to the user.
// Each entry maps 1-to-1 with an entry in buildScoreCategories so the two panels
// always stay in sync.
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
      label: 'Antivirus scan',
      status: vtData.error ? 'warn' : vtData.malicious > 2 ? 'danger' : vtData.malicious > 0 ? 'warn' : 'pass',
      detail: vtData.error
        ? 'We could not run the antivirus scan, so we skipped this step.'
        : vtData.malicious > 2
        ? 'Several antivirus tools flagged this site as unsafe.'
        : vtData.malicious > 0
        ? 'One antivirus tool flagged this site.'
        : 'No antivirus tools found any issues.',
    },
    {
      label: 'Secure connection',
      status: local.isHttp ? 'warn' : 'pass',
      detail: local.isHttp
        ? 'This site does not use HTTPS, so the connection is not protected.'
        : 'This site uses HTTPS, so the connection is protected.',
    },
    {
      label: 'Website address ending',
      status: local.hasSuspiciousTld ? 'warn' : 'pass',
      detail: local.hasSuspiciousTld
        ? 'This ending is less common and sometimes used by scammers.'
        : 'The address ending looks fine.',
    },
    {
      label: 'Number address instead of name',
      status: local.hasIpAddress ? 'danger' : 'pass',
      detail: local.hasIpAddress
        ? 'Uses a number instead of a real site name — real sites rarely do this.'
        : 'Uses a proper name, not a number.',
    },
    {
      label: 'Too many dashes in name',
      status: local.hasExcessiveDashes ? 'warn' : 'pass',
      detail: local.hasExcessiveDashes
        ? 'Too many dashes in the name — a common sign of a fake site.'
        : 'The name looks fine.',
    },
    {
      label: 'Too many levels in address',
      status: local.hasExcessiveSubdomains ? 'warn' : 'pass',
      detail: local.hasExcessiveSubdomains
        ? 'The address has many parts — sometimes used to disguise the real site.'
        : 'The address looks straightforward.',
    },
    {
      label: 'Suspicious words in address',
      status: local.hasPhishingKeywords ? 'warn' : 'pass',
      detail: local.hasPhishingKeywords
        ? 'The page name has words often used in fake login pages.'
        : 'No suspicious words found.',
    },
    {
      label: 'Harmful site list',
      status: urlhausData.error ? 'warn' : urlhausData.matched ? 'danger' : 'pass',
      detail: urlhausData.error
        ? 'We could not run this check, so we skipped it.'
        : urlhausData.matched
        ? 'This site is on a list of known harmful sites.'
        : 'Not on any list of harmful sites.',
    },
    {
      label: 'Fake site list',
      status: phishStatsData.error ? 'warn' : phishStatsData.matched ? 'danger' : 'pass',
      detail: phishStatsData.error
        ? 'We could not run this check, so we skipped it.'
        : phishStatsData.matched
        ? 'This site is on a list of known fake or scam sites.'
        : 'Not on any list of fake sites.',
    },
    {
      label: 'Expert reports',
      status: otxData.error ? 'warn' : otxData.matched ? 'warn' : 'pass',
      detail: otxData.error
        ? 'We could not run this check, so we skipped it.'
        : otxData.matched
        ? `Security experts have filed ${otxData.pulseCount} report${otxData.pulseCount === 1 ? '' : 's'} about this site.`
        : 'No expert reports found about this site.',
    },
  ]
}

// buildScoreCategories produces the score breakdown shown under "How did we decide this?".
//
// Scoring philosophy:
//   - Start at 100 (trusted).
//   - Deduct points for each warning sign found.
//   - Clamp the final score to a minimum of 0.
//
// Weight rationale:
//   - Google Safe Browsing (40): Most authoritative signal — Google has the widest
//     crawl coverage and a very low false-positive rate.
//   - VirusTotal (30): Aggregates 70+ antivirus engines; multiple hits are highly reliable.
//   - URLhaus (25): Specific to malware distribution; a match here is very serious.
//   - PhishStats (20): Specific to phishing pages; a match here is serious.
//   - IP address (15): Raw IP addresses are almost never used by legitimate websites.
//   - Suspicious TLD (15): Free TLDs are disproportionately used in scam campaigns.
//   - HTTPS (10): Lack of HTTPS is a meaningful warning sign but less definitive on its own.
//   - Website name dashes (10): Excessive dashes are a common typosquatting pattern.
//   - OTX threat reports (10): Community intelligence; lower weight because it includes
//     research on legitimate-but-interesting domains.
//   - Excessive subdomains (5): Moderately suspicious — can be used to spoof brands.
//   - Phishing path keywords (3): Low weight because many legitimate pages also use
//     these words; it is a supporting signal, not a primary one.
function buildScoreCategories(local, googleData, vtData, urlhausData, phishStatsData, otxData) {
  const googleStatus     = googleData.error     ? 'warn' : googleData.isThreat      ? 'danger' : 'pass'
  const vtStatus         = vtData.error         ? 'warn' : vtData.malicious > 2     ? 'danger' : vtData.malicious > 0 ? 'warn' : 'pass'
  const urlhausStatus    = urlhausData.error    ? 'warn' : urlhausData.matched       ? 'danger' : 'pass'
  const phishStatsStatus = phishStatsData.error ? 'warn' : phishStatsData.matched   ? 'danger' : 'pass'
  const otxStatus        = otxData.error        ? 'warn' : otxData.matched          ? 'warn'   : 'pass'

  return [
    {
      label: 'Google check',
      maxDeduction: 40,
      deduction: googleData.isThreat ? 40 : 0,
      passed: googleStatus === 'pass',
      status: googleStatus,
      detail: googleData.error    ? 'We could not reach Google for this check'
            : googleData.isThreat ? 'Google says this site may not be safe'
                                  : 'Google says this site is safe',
    },
    {
      label: 'Antivirus scan',
      maxDeduction: 30,
      deduction: vtData.malicious > 2 ? 30 : vtData.malicious > 0 ? 10 : 0,
      passed: vtStatus === 'pass',
      status: vtStatus,
      detail: vtData.error         ? 'We could not run this check'
            : vtData.malicious > 2 ? 'Several antivirus tools found problems'
            : vtData.malicious > 0 ? 'One antivirus tool found a problem'
                                   : 'No problems found',
    },
    {
      label: 'Secure connection',
      maxDeduction: 10,
      deduction: local.isHttp ? 10 : 0,
      passed: !local.isHttp,
      status: local.isHttp ? 'warn' : 'pass',
      detail: local.isHttp ? 'Your connection to this site is not protected' : 'Your connection is protected',
    },
    {
      label: 'Website address ending',
      maxDeduction: 15,
      deduction: local.hasSuspiciousTld ? 15 : 0,
      passed: !local.hasSuspiciousTld,
      status: local.hasSuspiciousTld ? 'warn' : 'pass',
      detail: local.hasSuspiciousTld ? 'This ending is less common and sometimes used by scammers' : 'The address ending looks fine',
    },
    {
      label: 'Number address instead of name',
      maxDeduction: 15,
      deduction: local.hasIpAddress ? 15 : 0,
      passed: !local.hasIpAddress,
      status: local.hasIpAddress ? 'danger' : 'pass',
      detail: local.hasIpAddress ? 'Uses a number instead of a real site name — real sites rarely do this' : 'Uses a proper name, not a number',
    },
    {
      label: 'Too many dashes in name',
      maxDeduction: 10,
      deduction: local.hasExcessiveDashes ? 10 : 0,
      passed: !local.hasExcessiveDashes,
      status: local.hasExcessiveDashes ? 'warn' : 'pass',
      detail: local.hasExcessiveDashes ? 'Too many dashes in the name — a common sign of a fake site' : 'The name looks fine',
    },
    {
      label: 'Too many levels in address',
      maxDeduction: 5,
      deduction: local.hasExcessiveSubdomains ? 5 : 0,
      passed: !local.hasExcessiveSubdomains,
      status: local.hasExcessiveSubdomains ? 'warn' : 'pass',
      detail: local.hasExcessiveSubdomains ? 'The address has many parts — sometimes used to disguise the real site' : 'The address looks straightforward',
    },
    {
      label: 'Suspicious words in address',
      maxDeduction: 3,
      deduction: local.hasPhishingKeywords ? 3 : 0,
      passed: !local.hasPhishingKeywords,
      status: local.hasPhishingKeywords ? 'warn' : 'pass',
      detail: local.hasPhishingKeywords ? 'The page name has words often used in fake login pages' : 'No suspicious words found',
    },
    {
      label: 'Harmful site list',
      maxDeduction: 25,
      deduction: urlhausData.matched ? 25 : 0,
      passed: urlhausStatus === 'pass',
      status: urlhausStatus,
      detail: urlhausData.missingKey ? 'This check is not set up yet'
            : urlhausData.error      ? 'We could not run this check'
            : urlhausData.matched    ? 'This site is on a list of known harmful sites'
                                     : 'Not on any list of harmful sites',
    },
    {
      label: 'Fake site list',
      maxDeduction: 20,
      deduction: phishStatsData.matched ? 20 : 0,
      passed: phishStatsStatus === 'pass',
      status: phishStatsStatus,
      detail: phishStatsData.error   ? 'We could not run this check'
            : phishStatsData.matched ? 'This site is on a list of known fake or scam sites'
                                     : 'Not on any list of fake sites',
    },
    {
      label: 'Expert reports',
      maxDeduction: 10,
      deduction: otxData.matched ? 10 : 0,
      passed: otxStatus === 'pass',
      status: otxStatus,
      detail: otxData.error   ? 'We could not run this check'
            : otxData.matched ? 'Security experts have filed reports about this site'
                              : 'No expert reports found about this site',
    },
  ]
}

router.post('/check-url', async (req, res) => {
  const { url } = req.body

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please provide a website address to check.' })
  }

  const local = inspectDomain(url)
  if (!local) {
    return res.status(400).json({ error: WEBSITE_INPUT_ERROR })
  }

  // Run all external provider checks in parallel. Each has its own timeout so a
  // slow provider does not hold up the entire response.
  const [googleResult, vtResult, urlhausResult, phishStatsResult, otxResult] = await Promise.allSettled([
    withTimeout(checkGoogleSafeBrowsing(local.normalized), 'Google Safe Browsing'),
    withTimeout(checkVirusTotal(local.normalized), 'VirusTotal'),
    withTimeout(checkUrlhaus(local.normalized), 'URLhaus'),
    withTimeout(checkPhishStats(local.normalized, local.hostname), 'PhishStats'),
    withTimeout(checkOtx(local.hostname), 'OTX'),
  ])

  const googleData     = getSettledValue(googleResult,     GOOGLE_FALLBACK)
  const vtData         = getSettledValue(vtResult,         VT_FALLBACK)
  const urlhausData    = getSettledValue(urlhausResult,    URLHAUS_FALLBACK)
  const phishStatsData = getSettledValue(phishStatsResult, PHISHSTATS_FALLBACK)
  const otxData        = getSettledValue(otxResult,        OTX_FALLBACK)

  const scoreCategories = buildScoreCategories(local, googleData, vtData, urlhausData, phishStatsData, otxData)

  // Score is the sum of all deductions subtracted from 100, clamped to 0.
  const trustScore = Math.max(0, 100 - scoreCategories.reduce((sum, c) => sum + c.deduction, 0))

  // "Unsafe" verdict: at least one high-confidence signal is present.
  const isDefinitelyUnsafe = (
    googleData.isThreat     ||
    vtData.malicious > 2    ||
    urlhausData.matched     ||
    phishStatsData.matched  ||
    local.hasIpAddress      ||
    local.hasSuspiciousTld
  )

  // "Warning" verdict: no high-confidence signal, but lower-confidence signals exist.
  const hasWarnings = !isDefinitelyUnsafe && (
    local.hasExcessiveDashes       ||
    local.hasExcessiveSubdomains   ||
    local.hasPhishingKeywords      ||
    local.isHttp                   ||
    vtData.malicious > 1           ||
    otxData.matched
  )

  // Collect the specific reasons shown in the verdict banner.
  const riskFactors = []
  if (local.hasSuspiciousTld)         riskFactors.push('This site uses a less common web address ending.')
  if (local.hasExcessiveDashes)       riskFactors.push('The website name has an unusual number of dashes.')
  if (local.hasIpAddress)             riskFactors.push('This site uses a number address instead of a normal website name.')
  if (local.isHttp)                   riskFactors.push('This site does not use HTTPS.')
  if (local.hasExcessiveSubdomains)   riskFactors.push('This address has many levels which can be used to hide the real site.')
  if (local.hasPhishingKeywords)      riskFactors.push('The page name contains words commonly used in fake login pages.')
  if (googleData.isThreat)            riskFactors.push(`Google thinks this site may be unsafe (${googleData.threatType}).`)
  if (vtData.malicious > 1)           riskFactors.push('Several antivirus tools flagged this site.')
  if (urlhausData.matched)            riskFactors.push('This site appears on a malware blacklist.')
  if (phishStatsData.matched)         riskFactors.push('This site appears on a phishing blacklist.')
  if (otxData.matched)                riskFactors.push('Security researchers have filed reports about this site.')

  res.json({
    hostname: local.hostname,
    verdict: isDefinitelyUnsafe ? 'unsafe' : hasWarnings ? 'warning' : 'safe',
    trustScore,
    scoreCategories,
    riskFactors,
    checks: buildChecks(local, googleData, vtData, urlhausData, phishStatsData, otxData),
    threatIntel: {
      google:     { matched: Boolean(googleData.isThreat),      error: Boolean(googleData.error),     threatType: googleData.threatType || null },
      virusTotal: { matched: vtData.malicious > 0,              error: Boolean(vtData.error),         malicious: vtData.malicious, suspicious: vtData.suspicious },
      urlhaus:    { matched: Boolean(urlhausData.matched),       error: Boolean(urlhausData.error),    status: urlhausData.status || null },
      phishStats: { matched: Boolean(phishStatsData.matched),    error: Boolean(phishStatsData.error), phishScore: phishStatsData.phishScore },
      otx:        { matched: Boolean(otxData.matched),           error: Boolean(otxData.error),        pulseCount: otxData.pulseCount },
    },
  })
})

export default router

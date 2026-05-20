import express from 'express'
import fs from 'node:fs'
import { checkApiAggregation } from '../services/apiAggregator.js'
import { checkHttpSecurity } from '../services/httpSecurity.js'
import { checkSslCertificate } from '../services/sslAnalysis.js'
import { checkDnsAnalysis } from '../services/dnsAnalysis.js'
import { summarisePageContent } from '../services/contentSummary.js'

const sharedModuleCandidates = [
  new URL('../../shared/websiteValidation.js', import.meta.url),
  new URL('../shared/websiteValidation.js', import.meta.url),
]
const sharedModuleUrl = sharedModuleCandidates.find(c => fs.existsSync(c)) ?? sharedModuleCandidates[0]
const { WEBSITE_INPUT_ERROR, parseWebsiteInput } = await import(sharedModuleUrl)

const router = express.Router()

const SHARED_HOSTING_HOSTS = new Set([
  'storage.googleapis.com',
  'ipfs.io',
  'cloudflare-ipfs.com',
  'gateway.pinata.cloud',
  'sites.google.com',
])

const SHARED_HOSTING_SUFFIXES = [
  '.netlify.app',
  '.framer.app',
  '.pages.dev',
  '.vercel.app',
  '.web.app',
  '.firebaseapp.com',
  '.github.io',
  '.gitlab.io',
]

router.post('/check-url', async (req, res) => {
  const { url } = req.body

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please provide a website address to check.' })
  }

  const parsed = parseWebsiteInput(url)
  if (!parsed) {
    return res.status(400).json({ error: WEBSITE_INPUT_ERROR })
  }

  const { normalized, hostname, registrableDomain } = parsed

  // All 5 checks run in parallel. If one throws, the others still complete.
  const [apiResult, httpResult, sslResult, dnsResult, contentResult] = await Promise.allSettled([
    checkApiAggregation(normalized, hostname),
    checkHttpSecurity(normalized),
    checkSslCertificate(hostname),
    checkDnsAnalysis(registrableDomain),
    summarisePageContent(normalized),
  ])

  const fallback = (category, maxScore) => ({ category, score: 0, maxScore, status: 'warn', details: {} })

  const api      = apiResult.status  === 'fulfilled' ? apiResult.value  : fallback('API Verification', 25)
  const http     = httpResult.status === 'fulfilled' ? httpResult.value : fallback('HTTP Security',    25)
  const ssl      = sslResult.status  === 'fulfilled' ? sslResult.value  : fallback('SSL/TLS Analysis', 25)
  const dnsCheck = dnsResult.status  === 'fulfilled' ? dnsResult.value  : fallback('DNS Analysis',     25)
  const contentCheck = contentResult.status === 'fulfilled' ? contentResult.value : { label: 'What this website appears to be', status: 'warn', detail: 'We could not load this page to check its content' }

  let trustScore = api.score + http.score + ssl.score + dnsCheck.score

  const sharedHostingRisk = getSharedHostingRisk(normalized, hostname)
  const hasHardDangerSignal = [
    api.status === 'danger',
    http.details?.https?.status === 'danger',
    ssl.details?.validity?.status === 'danger',
    ssl.details?.expiry?.status === 'danger',
    dnsCheck.status === 'danger',
  ].some(Boolean)

  // Detect if 3 or more threat APIs are unavailable
  const apiUnavailableCount = [
    api.details.google?.status === 'warn' && api.details.google?.points === 0,
    api.details.virusTotal?.status === 'warn' && api.details.virusTotal?.points === 0,
    api.details.urlhaus?.status === 'warn' && api.details.urlhaus?.points === 0,
    api.details.phishStats?.status === 'warn' && api.details.phishStats?.points === 0,
  ].filter(Boolean).length

  // Detect hard threats from API checks
  const hardThreatFound = [
    api.details.google?.status === 'danger',
    api.details.virusTotal?.status === 'danger',
    api.details.urlhaus?.status === 'danger',
    api.details.phishStats?.status === 'danger',
  ].some(Boolean)

  // Apply scoring caps based on domain status and threats
  const domainStatus = dnsCheck.domainStatus || 'established'
  if (hardThreatFound) {
    trustScore = Math.min(trustScore, 20)
  }
  if (domainStatus === 'brand_new') {
    trustScore = Math.min(trustScore, 25)
  }
  if (domainStatus === 'new') {
    trustScore = Math.min(trustScore, 45)
  }
  if (apiUnavailableCount >= 3) {
    trustScore = Math.min(trustScore, 65)
  }

  const hasWarningSignal = [
    api.status === 'warn' && apiUnavailableCount >= 3,
    ssl.status === 'warn',
    dnsCheck.status === 'warn',
    Boolean(sharedHostingRisk),
  ].some(Boolean)
  const isDefinitelyUnsafe = trustScore < 40 || domainStatus === 'unregistered' || domainStatus === 'brand_new' || hasHardDangerSignal
  const hasWarnings = !isDefinitelyUnsafe && (trustScore < 70 || domainStatus !== 'established' || hasWarningSignal)

  const verdict = isDefinitelyUnsafe ? 'unsafe' : hasWarnings ? 'warning' : 'safe'

  // scoreCategories: read by TrustScoreCard.vue for the breakdown panel
  const scoreCategories = [
    { label: api.category,      score: api.score,      maxScore: api.maxScore,      status: api.status },
    { label: http.category,     score: http.score,     maxScore: http.maxScore,     status: http.status },
    { label: ssl.category,      score: ssl.score,      maxScore: ssl.maxScore,      status: ssl.status },
    { label: dnsCheck.category, score: dnsCheck.score, maxScore: dnsCheck.maxScore, status: dnsCheck.status },
  ]

  // checks: flat list for ChecksList.vue
  const checks = buildChecks(api.details, http.details, ssl.details, dnsCheck.details, contentCheck)

  // checkGroups: grouped check cards for ChecksList.vue
  const checkGroups = buildCheckGroups(api.details, http.details, ssl.details, dnsCheck.details)

  // riskFactors: shown in VerdictBanner.vue
  const riskFactors = buildRiskFactors(api.details, http.details, ssl.details, dnsCheck.details, domainStatus, contentCheck, sharedHostingRisk)

  res.json({
    hostname,
    verdict,
    trustScore,
    maxScore: 100,
    scoreCategories,
    checks,
    checkGroups,
    riskFactors,
    domainStatus,
  })
})

function buildChecks(apiDetails, httpDetails, sslDetails, dnsDetails, contentCheck) {
  const checks = []

  // Content summary goes first so users see the plain-English page description immediately.
  if (contentCheck) checks.push(contentCheck)

  if (apiDetails.google)        checks.push({ label: 'Google safety check',        status: apiDetails.google.status,        detail: apiDetails.google.message })
  if (apiDetails.virusTotal)    checks.push({ label: 'Antivirus scan',              status: apiDetails.virusTotal.status,    detail: apiDetails.virusTotal.message })
  if (apiDetails.urlhaus)       checks.push({ label: 'Malware list check',          status: apiDetails.urlhaus.status,       detail: apiDetails.urlhaus.message })
  if (apiDetails.phishStats)    checks.push({ label: 'Phishing list check',         status: apiDetails.phishStats.status,    detail: apiDetails.phishStats.message })

  if (httpDetails.https)        checks.push({ label: 'Secure connection (HTTPS)',   status: httpDetails.https.status,        detail: httpDetails.https.message })
  if (httpDetails.hsts)         checks.push({ label: 'HSTS protection',             status: httpDetails.hsts.status,         detail: httpDetails.hsts.message })
  if (httpDetails.xFrame)       checks.push({ label: 'Clickjacking protection',     status: httpDetails.xFrame.status,       detail: httpDetails.xFrame.message })
  if (httpDetails.xContentType) checks.push({ label: 'Content type protection',     status: httpDetails.xContentType.status, detail: httpDetails.xContentType.message })

  if (sslDetails.validity)      checks.push({ label: 'Security certificate',        status: sslDetails.validity.status,      detail: sslDetails.validity.message })
  if (sslDetails.expiry)        checks.push({ label: 'Certificate expiry',          status: sslDetails.expiry.status,        detail: sslDetails.expiry.message })
  if (sslDetails.tlsVersion)    checks.push({ label: 'Encryption strength',         status: sslDetails.tlsVersion.status,    detail: sslDetails.tlsVersion.message })
  if (sslDetails.issuer)        checks.push({ label: 'Certificate issuer',          status: sslDetails.issuer.status,        detail: sslDetails.issuer.message })

  if (dnsDetails.domainExists)  checks.push({ label: 'Website address exists',      status: dnsDetails.domainExists.status,  detail: dnsDetails.domainExists.message })
  if (dnsDetails.domainAge)     checks.push({ label: 'Website age',                 status: dnsDetails.domainAge.status,     detail: dnsDetails.domainAge.message })
  if (dnsDetails.blocklist)     checks.push({ label: 'Spam and malware blocklist',  status: dnsDetails.blocklist.status,     detail: dnsDetails.blocklist.message })
  if (dnsDetails.mxRecords)     checks.push({ label: 'Mail server records',         status: dnsDetails.mxRecords.status,     detail: dnsDetails.mxRecords.message })

  return checks
}

function buildCheckGroups(apiDetails, httpDetails, sslDetails, dnsDetails) {

  // Helper: derive the worst status from a list of item statuses.
  // danger beats warn beats pass.
  function worstStatus(items) {
    if (items.some(i => i.status === 'danger')) return 'danger'
    if (items.some(i => i.status === 'warn'))   return 'warn'
    return 'pass'
  }

  // ---- GROUP 1: Threat list checks ----
  const threatItems = []

  if (apiDetails.google) {
    threatItems.push({
      label: "Google's unsafe website list",
      status: apiDetails.google.status,
      detail: apiDetails.google.status === 'pass'
        ? 'Google checks billions of websites for scams and malware. This site was not on their list.'
        : apiDetails.google.status === 'warn'
        ? 'We could not check Google\'s list right now, so we relied on the other checks.'
        : 'Google found this site on its list of unsafe websites.',
    })
  }

  if (apiDetails.virusTotal) {
    const mal = apiDetails.virusTotal.malicious || 0
    threatItems.push({
      label: 'Online security tools',
      status: apiDetails.virusTotal.status,
      detail: apiDetails.virusTotal.status === 'pass'
        ? 'Over 70 antivirus programs scanned this site. None of them found anything dangerous.'
        : apiDetails.virusTotal.status === 'warn' && mal === 0
        ? 'We could not reach the online security tools right now.'
        : `${mal} online security tool${mal === 1 ? '' : 's'} flagged this site as potentially dangerous.`,
    })
  }

  if (apiDetails.urlhaus) {
    threatItems.push({
      label: 'Harmful website lists',
      status: apiDetails.urlhaus.status,
      detail: apiDetails.urlhaus.status === 'pass'
        ? 'This site was not found on any list of websites known to spread harmful software.'
        : apiDetails.urlhaus.status === 'warn'
        ? 'We could not check the harmful website lists right now.'
        : 'This site was found on a list of websites known to spread harmful software.',
    })
  }

  if (apiDetails.phishStats) {
    threatItems.push({
      label: 'Fake website lists',
      status: apiDetails.phishStats.status,
      detail: apiDetails.phishStats.status === 'pass'
        ? 'This site was not found on any list of websites known to impersonate real businesses.'
        : apiDetails.phishStats.status === 'warn'
        ? 'We could not check the fake website lists right now.'
        : 'This site was found on a list of websites that pretend to be real businesses.',
    })
  }

  const threatStatus = worstStatus(threatItems)
  const threatGroup = {
    id: 'threat-lists',
    status: threatStatus,
    badge:   threatStatus === 'pass' ? 'All clear' : threatStatus === 'warn' ? 'Could not check all' : 'Threat found',
    summary: threatStatus === 'pass'
      ? 'Not found on any scam or threat lists'
      : threatStatus === 'warn'
      ? 'We could not check all scam lists right now'
      : 'Found on a known scam or threat list',
    detail: threatStatus === 'pass'
      ? 'We checked 4 different safety databases. None of them flagged this site.'
      : threatStatus === 'warn'
      ? 'Some checks were unavailable. The results below show what we could check.'
      : 'At least one safety database has flagged this site. See below for details.',
    items: threatItems,
  }

  // ---- GROUP 2: Connection and certificate checks ----
  const connectionItems = []

  if (httpDetails.https) {
    connectionItems.push({
      label: 'Private connection',
      status: httpDetails.https.status,
      detail: httpDetails.https.status === 'pass'
        ? 'Your information travels to this site in a protected form that others cannot read.'
        : 'This website does not use a private connection. Your information could be seen by others.',
    })
  }

  if (sslDetails.validity) {
    connectionItems.push({
      label: 'Website identity confirmed',
      status: sslDetails.validity.status,
      detail: sslDetails.validity.status === 'pass'
        ? `This website proved who it is.${sslDetails.issuer?.name ? ' Its identity was confirmed by ' + sslDetails.issuer.name + ', a trusted company that verifies websites.' : ''}`
        : 'This website could not prove its identity. Be careful before entering any personal information.',
    })
  }

  if (sslDetails.expiry) {
    connectionItems.push({
      label: 'Identity check is current',
      status: sslDetails.expiry.status,
      detail: sslDetails.expiry.status === 'pass'
        ? `The website's identity certificate is valid for another ${sslDetails.expiry.daysLeft} days.`
        : sslDetails.expiry.status === 'warn'
        ? `The website's identity certificate expires in ${sslDetails.expiry.daysLeft} days. It should be renewed soon.`
        : 'The website\'s identity certificate has expired.',
    })
  }

  if (sslDetails.tlsVersion) {
    connectionItems.push({
      label: 'Up to date protection',
      status: sslDetails.tlsVersion.status,
      detail: sslDetails.tlsVersion.status === 'pass'
        ? `This website uses the most current method to protect your connection (${sslDetails.tlsVersion.version}).`
        : `This website uses an older method to protect your connection (${sslDetails.tlsVersion.version}).`,
    })
  }

  // Collect minor HTTP header warnings as one combined item if any exist
  const headerStatuses = [
    httpDetails.hsts?.status,
    httpDetails.xFrame?.status,
    httpDetails.xContentType?.status,
    httpDetails.csp?.status,
  ].filter(Boolean)

  const headerWarningCount = headerStatuses.filter(s => s === 'warn').length
  if (headerWarningCount > 0) {
    connectionItems.push({
      label: headerWarningCount === 1
        ? 'One optional security setting is not enabled'
        : `${headerWarningCount} optional security settings are not enabled`,
      status: 'warn',
      detail: 'These are minor technical settings that many legitimate websites skip. They do not mean this site is unsafe.',
    })
  }

  const connectionStatus = worstStatus(connectionItems)
  const connectionGroup = {
    id: 'connection',
    status: connectionStatus,
    badge:   connectionStatus === 'pass' ? 'Secure' : connectionStatus === 'warn' ? 'Mostly secure' : 'Not secure',
    summary: connectionStatus === 'pass'
      ? 'Your connection to this website is secure'
      : connectionStatus === 'warn'
      ? 'Your connection to this website is mostly secure'
      : 'Your connection to this website is not secure',
    detail: connectionStatus === 'pass'
      ? 'Your information is protected while you use this site.'
      : connectionStatus === 'warn'
      ? 'Your connection is protected but there are one or two minor notes below.'
      : 'This website does not protect your connection properly.',
    items: connectionItems,
  }

  // ---- GROUP 3: Website age and registration checks ----
  const ageItems = []

  if (dnsDetails.domainAge) {
    const months = dnsDetails.domainAge.ageInMonths || 0
    const years  = Math.floor(months / 12)
    const ageLabel = years >= 2
      ? `over ${years} year${years === 1 ? '' : 's'}`
      : months > 0
      ? `${months} month${months === 1 ? '' : 's'}`
      : 'a very short time'

    ageItems.push({
      label: 'How long this website has existed',
      status: dnsDetails.domainAge.status,
      detail: dnsDetails.domainAge.status === 'pass'
        ? `This website has existed for ${ageLabel}. Real, trusted websites tend to be older.`
        : dnsDetails.domainAge.status === 'warn'
        ? dnsDetails.domainAge.domainStatus === 'unknown_age'
          ? 'We could not find out when this website was created.'
          : `This website was only created ${ageLabel} ago. Be cautious with recently created websites.`
        : `This website was created very recently (${ageLabel} ago). Scammers often use brand new websites.`,
    })
  }

  if (dnsDetails.blocklist) {
    const blocklistWasListed = Boolean(dnsDetails.blocklist.listedOn)
    ageItems.push({
      label: 'Network spam and malware blocklists',
      status: dnsDetails.blocklist.status,
      detail: dnsDetails.blocklist.status === 'pass'
        ? "The website's current IP address was not found on the network blocklists we checked."
        : dnsDetails.blocklist.status === 'warn' && blocklistWasListed
        ? 'The website uses an IP address with a network reputation warning. This can happen with shared hosting or content delivery networks.'
        : dnsDetails.blocklist.status === 'warn'
        ? 'We could not check the network spam and malware blocklists right now.'
        : "The website's current IP address was found on a network spam or malware blocklist.",
    })
  }

  if (dnsDetails.mxRecords) {
    ageItems.push({
      label: 'Website is properly set up',
      status: dnsDetails.mxRecords.status,
      detail: dnsDetails.mxRecords.status === 'pass'
        ? 'This website has all the standard technical records in place that a real website should have.'
        : 'This website is missing some standard technical records. This can be a sign of a temporary or fake site.',
    })
  }

  if (dnsDetails.domainExists) {
    ageItems.push({
      label: 'Website address exists',
      status: dnsDetails.domainExists.status,
      detail: dnsDetails.domainExists.status === 'pass'
        ? 'This website address exists and is active.'
        : 'This website address does not exist anywhere on the internet.',
    })
  }

  const ageStatus = worstStatus(ageItems)
  const domainExistsStatus = dnsDetails.domainExists?.status
  const domainAgeStatus = dnsDetails.domainAge?.status
  const blocklistStatus = dnsDetails.blocklist?.status

  let ageGroupCopy
  if (domainExistsStatus === 'danger') {
    ageGroupCopy = {
      badge: 'Not found',
      summary: 'This website address could not be found',
      detail: 'We could not find this address in the internet records websites need in order to work.',
    }
  } else if (domainAgeStatus === 'danger') {
    ageGroupCopy = {
      badge: 'Brand new',
      summary: 'This website was created very recently',
      detail: 'Scammers often create brand new websites to trick people. This site was created very recently.',
    }
  } else if (blocklistStatus === 'danger') {
    ageGroupCopy = {
      badge: 'Listed IP',
      summary: "This website's internet address is on a network blocklist",
      detail: 'The domain itself is not brand new, but its current IP address appears on a spam or malware blocklist.',
    }
  } else if (ageStatus === 'danger') {
    ageGroupCopy = {
      badge: 'Setup issue',
      summary: 'This website has a serious setup warning',
      detail: 'One of the website setup checks found a serious warning sign. See the details below.',
    }
  } else if (domainAgeStatus === 'warn') {
    const ageUnknown = dnsDetails.domainAge?.domainStatus === 'unknown_age'
    ageGroupCopy = {
      badge: ageUnknown ? 'Age unknown' : 'Fairly new',
      summary: ageUnknown ? 'We could not confirm when this website was created' : 'This website is relatively new',
      detail: ageUnknown
        ? 'The registration record exists, but the creation date was not available.'
        : 'Newer websites are not always unsafe, but it is worth being careful.',
    }
  } else if (blocklistStatus === 'warn' && dnsDetails.blocklist?.listedOn) {
    ageGroupCopy = {
      badge: 'Network note',
      summary: 'This website has a network reputation note',
      detail: 'The website age and setup look okay, but its current IP address has a network reputation warning.',
    }
  } else if (ageStatus === 'warn') {
    ageGroupCopy = {
      badge: 'Setup note',
      summary: 'Some website setup checks need attention',
      detail: 'The website age looks fine, but one or more setup checks could not be fully confirmed.',
    }
  } else {
    ageGroupCopy = {
      badge: 'Established',
      summary: 'This website has been around for a long time',
      detail: 'Scam sites are usually brand new. This one is not.',
    }
  }

  const ageGroup = {
    id: 'website-age',
    status: ageStatus,
    ...ageGroupCopy,
    items: ageItems,
  }

  return [threatGroup, connectionGroup, ageGroup]
}

function getSharedHostingRisk(normalizedUrl, hostname) {
  let parsedUrl
  try {
    parsedUrl = new URL(normalizedUrl)
  } catch {
    return ''
  }

  const isSharedHost = SHARED_HOSTING_HOSTS.has(hostname)
    || SHARED_HOSTING_SUFFIXES.some(suffix => hostname.endsWith(suffix))

  if (!isSharedHost) return ''

  const hasSpecificPath = parsedUrl.pathname && parsedUrl.pathname !== '/'
  const hasQuery = Boolean(parsedUrl.search)
  const isSubdomainHostedApp = SHARED_HOSTING_SUFFIXES.some(suffix => hostname.endsWith(suffix))

  if (!hasSpecificPath && !hasQuery && !isSubdomainHostedApp) return ''

  return 'This link is hosted on a public hosting or storage platform; scammers often use trusted platforms to hide phishing pages'
}

function buildRiskFactors(apiDetails, httpDetails, sslDetails, dnsDetails, domainStatus, contentCheck, sharedHostingRisk) {
  const factors = []

  if (domainStatus === 'unregistered')              factors.push('This website address does not exist anywhere on the internet')
  if (domainStatus === 'brand_new')                 factors.push('This website was only just created -- brand new sites are a common scammer tactic')
  if (domainStatus === 'new')                       factors.push('This website is very new -- scammers often use recently registered domains')
  if (domainStatus === 'recent')                    factors.push('This website is fairly new, so it deserves extra caution')
  if (apiDetails.google?.status     === 'danger')  factors.push('Google has flagged this site as unsafe')
  if (apiDetails.virusTotal?.status === 'danger')  factors.push(`${apiDetails.virusTotal.malicious} antivirus tools detected threats on this site`)
  if (apiDetails.urlhaus?.status    === 'danger')  factors.push('This site is on a known malware distribution list')
  if (apiDetails.phishStats?.status === 'danger')  factors.push('This site is on a known phishing list')
  if (httpDetails.https?.status     === 'danger')  factors.push('Site does not use HTTPS -- your connection is not secure')
  if (sslDetails.validity?.status   === 'danger')  factors.push('The SSL certificate is invalid or not trusted')
  if (sslDetails.expiry?.status     === 'danger')  factors.push('The SSL certificate has expired')
  if (sharedHostingRisk)                            factors.push(sharedHostingRisk)
  return factors
}

export default router

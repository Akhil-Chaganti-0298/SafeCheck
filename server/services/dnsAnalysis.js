import dns from 'dns/promises'
import httpClient from './httpClient.js'

// Points: A records 2, domain age 8, MX 4, NS 3, blocklist 6, WHOIS 2 = 25 total.
export async function checkDnsAnalysis(hostname) {
  let score = 0
  const details = {}

  const cleanHostname = hostname.replace(/^https?:\/\//, '').split('/')[0]

  // If the domain does not resolve at all, nothing else is worth checking
  let aRecords = []
  try {
    aRecords = await dns.resolve4(cleanHostname)
  } catch (err) {
    const knownNoExist = ['ENOTFOUND', 'ENODATA', 'ESERVFAIL'].includes(err.code)
    return {
      category: 'DNS Analysis',
      score: 0,
      maxScore: 25,
      domainStatus: 'unregistered',
      status: 'danger',
      details: {
        domainExists: {
          status: 'danger',
          points: 0,
          message: knownNoExist
            ? 'This website address does not exist -- it has never been registered'
            : 'Could not look up this website address',
          errorCode: err.code,
        },
      },
    }
  }

  score += 2
  details.aRecords = { status: 'pass', points: 2, count: aRecords.length }

  // Domain age via WHOIS: 8 points
  // Scammers almost always use freshly registered domains so age is a strong signal
  let domainStatus = 'established'
  const whoisKey = process.env.WHOIS_API_KEY

  if (whoisKey) {
    try {
      const whoisRes = await httpClient.get('https://www.whoisxmlapi.com/whoisserver/WhoisService', {
        params: { apiKey: whoisKey, domainName: cleanHostname, outputFormat: 'JSON' },
        timeout: 5000,
      })

      const record = whoisRes.data?.WhoisRecord

      // Only MISSING_WHOIS_DATA means the domain does not exist.
      // Other dataError values (privacy protection, partial data) still have usable fields.
      if (!record || record.dataError === 'MISSING_WHOIS_DATA') {
        return {
          category: 'DNS Analysis',
          score: 0,
          maxScore: 25,
          domainStatus: 'unregistered',
          status: 'danger',
          details: {
            domainAge: {
              status: 'danger',
              points: 0,
              message: 'No registration record found for this domain',
            },
          },
        }
      }

      // Some TLDs store the creation date in registryData instead of the top-level record
      const createdDate = record?.createdDate
        || record?.registryData?.createdDate
        || record?.registryData?.creationDate

      if (createdDate) {
        const ageInDays = Math.floor((Date.now() - new Date(createdDate)) / 86400000)
        const ageInMonths = Math.floor(ageInDays / 30)

        if (ageInDays < 7)        domainStatus = 'brand_new'
        else if (ageInMonths < 3) domainStatus = 'new'
        else if (ageInMonths < 6) domainStatus = 'recent'
        else                      domainStatus = 'established'

        const ageScore =
          domainStatus === 'established' ? 8 :
          domainStatus === 'recent'      ? 4 :
          domainStatus === 'new'         ? 1 : 0

        score += ageScore

        details.domainAge = {
          status: domainStatus === 'established' ? 'pass' : domainStatus === 'recent' ? 'warn' : 'danger',
          points: ageScore,
          ageInDays,
          ageInMonths,
          domainStatus,
          createdDate,
          registrar: record?.registrarName || 'Unknown',
          message:
            domainStatus === 'brand_new'
              ? `Website was created only ${ageInDays} day(s) ago -- brand new sites are a common scammer tactic`
              : domainStatus === 'new'
              ? `Website is only ${ageInMonths} month(s) old -- be cautious`
              : domainStatus === 'recent'
              ? `Website is ${ageInMonths} months old -- fairly new`
              : `Website has been around for ${ageInMonths} months`,
        }
      } else {
        // WHOIS record exists but the creation date is privacy-protected
        domainStatus = 'unknown_age'
        score += 2
        details.domainAge = {
          status: 'warn',
          points: 2,
          domainStatus,
          registrar: record?.registrarName || 'Unknown',
          message: 'Website registration date is hidden',
        }
      }
    } catch (err) {
      console.error('[dnsAnalysis] WHOIS lookup failed:', err.message)
      score += 2
      details.domainAge = { status: 'warn', points: 2, message: 'Could not check domain age right now' }
    }
  } else {
    score += 2
    details.domainAge = { status: 'warn', points: 2, message: 'Domain age check is not configured' }
  }

  // MX records: real businesses almost always have mail servers configured
  try {
    const mx = await dns.resolveMx(cleanHostname)
    if (mx?.length > 0) {
      score += 4
      details.mxRecords = { status: 'pass', points: 4, count: mx.length, message: 'Mail server records found' }
    } else {
      details.mxRecords = { status: 'warn', points: 0, message: 'No mail server records found' }
    }
  } catch {
    details.mxRecords = { status: 'warn', points: 0, message: 'No mail server records found' }
  }

  // NS records: nameservers -- every properly registered domain has these
  try {
    const ns = await dns.resolveNs(cleanHostname)
    if (ns?.length > 0) {
      score += 3
      details.nsRecords = { status: 'pass', points: 3, count: ns.length, message: 'Nameserver records found' }
    } else {
      details.nsRecords = { status: 'warn', points: 0, message: 'No nameserver records found' }
    }
  } catch {
    details.nsRecords = { status: 'warn', points: 0, message: 'No nameserver records found' }
  }

  // DNS blocklist check: reverse the IP and query each blocklist as a DNS name.
  // If the lookup resolves, the IP is listed (bad). If it throws NXDOMAIN, it is clean.
  try {
    const reversedIp = aRecords[0].split('.').reverse().join('.')
    const blocklists = ['zen.spamhaus.org', 'bl.spamcop.net', 'dnsbl.sorbs.net']
    let isListed = false
    let listedOn = null

    for (const bl of blocklists) {
      try {
        await dns.resolve4(`${reversedIp}.${bl}`)
        isListed = true
        listedOn = bl
        break
      } catch {
        // Not listed on this one
      }
    }

    if (!isListed) {
      score += 6
      details.blocklist = { status: 'pass', points: 6, message: 'Not found on any spam or malware blocklist' }
    } else {
      details.blocklist = { status: 'danger', points: 0, listedOn, message: `IP is on a blocklist (${listedOn})` }
    }
  } catch {
    score += 3
    details.blocklist = { status: 'warn', points: 3, message: 'Could not check blocklists right now' }
  }

  // WHOIS completeness: 2 points if the registrar is publicly visible
  const registrar = details.domainAge?.registrar
  if (registrar && registrar !== 'Unknown') {
    score += 2
    details.whois = { status: 'pass', points: 2, message: `Registered through ${registrar}` }
  } else {
    details.whois = { status: 'warn', points: 0, message: 'Registrar information is hidden or missing' }
  }

  const statuses = Object.values(details).filter(d => d?.status).map(d => d.status)
  const categoryStatus = statuses.includes('danger') ? 'danger' : statuses.includes('warn') ? 'warn' : 'pass'

  return {
    category: 'DNS Analysis',
    score: Math.min(score, 25),
    maxScore: 25,
    domainStatus,
    status: categoryStatus,
    details,
  }
}

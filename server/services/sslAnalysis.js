import tls from 'tls'

// Points: valid cert 10, expiry 8, TLS version 4, trusted issuer 3 = 25 total.
// Uses a direct TLS handshake because we only need certificate details.
export async function checkSslCertificate(hostname) {
  const cleanHostname = hostname.replace(/^https?:\/\//, '').split('/')[0]

  return new Promise((resolve) => {
    let score = 0
    const details = {}
    let settled = false
    let socket

    function finish(result) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      socket?.destroy()
      resolve(result)
    }

    function softFailure(key, message) {
      finish({
        category: 'SSL/TLS Analysis',
        score: 12,
        maxScore: 25,
        status: 'warn',
        details: { [key]: { status: 'warn', points: 12, message } },
      })
    }

    const timer = setTimeout(() => {
      softFailure('timeout', 'We could not fully check the security certificate right now')
    }, 6000)

    // rejectUnauthorized: false lets us inspect untrusted certificates instead of failing early.
    socket = tls.connect({
      host: cleanHostname,
      port: 443,
      servername: /^\d{1,3}(?:\.\d{1,3}){3}$/.test(cleanHostname) ? undefined : cleanHostname,
      rejectUnauthorized: false,
    }, () => {
        const cert = socket.getPeerCertificate()

        if (!cert || Object.keys(cert).length === 0) {
          return softFailure('noCert', 'We could not fully check the security certificate right now')
        }

        const now = new Date()
        const validTo = new Date(cert.valid_to)
        const daysLeft = Math.floor((validTo - now) / (1000 * 60 * 60 * 24))
        const isAuthorized = socket.authorized

        // Valid and trusted cert: 10 points
        if (isAuthorized) {
          score += 10
          details.validity = { status: 'pass', points: 10, message: 'Certificate is valid and trusted' }
        } else {
          details.validity = {
            status: 'danger',
            points: 0,
            message: `Certificate problem: ${socket.authorizationError || 'not trusted'}`,
          }
        }

        // Expiry: 8 points if more than 30 days left, 4 if expiring soon, 0 if expired
        if (daysLeft > 30) {
          score += 8
          details.expiry = { status: 'pass', points: 8, daysLeft, message: `Certificate is valid for another ${daysLeft} days` }
        } else if (daysLeft > 0) {
          score += 4
          details.expiry = { status: 'warn', points: 4, daysLeft, message: `Certificate expires in ${daysLeft} days -- renew soon` }
        } else {
          details.expiry = { status: 'danger', points: 0, daysLeft, message: 'Certificate has expired' }
        }

        // TLS 1.2 and 1.3 are current standards -- anything older has known vulnerabilities
        const tlsVersion = socket.getProtocol?.() || 'Unknown'
        if (tlsVersion === 'TLSv1.3' || tlsVersion === 'TLSv1.2') {
          score += 4
          details.tlsVersion = { status: 'pass', points: 4, version: tlsVersion, message: `Uses modern encryption (${tlsVersion})` }
        } else {
          details.tlsVersion = { status: 'warn', points: 0, version: tlsVersion, message: `Uses outdated encryption (${tlsVersion})` }
        }

        // Self-signed means the site vouched for itself -- anyone can do that
        const isSelfSigned = cert.issuer?.CN === cert.subject?.CN
        if (!isSelfSigned && cert.issuer?.O) {
          score += 3
          details.issuer = { status: 'pass', points: 3, name: cert.issuer.O, message: `Issued by ${cert.issuer.O}` }
        } else {
          details.issuer = {
            status: 'danger',
            points: 0,
            message: isSelfSigned ? 'Certificate is self-signed -- not trustworthy' : 'Certificate issuer is unknown',
          }
        }

        const statuses = [details.validity?.status, details.expiry?.status, details.tlsVersion?.status, details.issuer?.status]
        const categoryStatus = statuses.includes('danger') ? 'danger' : statuses.includes('warn') ? 'warn' : 'pass'

        finish({
          category: 'SSL/TLS Analysis',
          score: Math.min(score, 25),
          maxScore: 25,
          status: categoryStatus,
          details,
        })
      }
    )

    socket.on('error', (err) => {
      console.error('[sslAnalysis] connection error:', err.message)
      softFailure('connectionError', 'We could not fully check the security certificate right now')
    })
  })
}

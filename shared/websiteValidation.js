import psl from 'psl'

const HTTPS_PREFIX_RE = /^https?:\/\//i
const IPV4_RE = /^\d{1,3}(?:\.\d{1,3}){3}$/

export const WEBSITE_INPUT_ERROR = 'Please enter a full website address with a domain extension like example.com or example.org.'

export function normalizeWebsiteInput(value) {
  const input = String(value ?? '').trim()
  if (!input) {
    return ''
  }

  return HTTPS_PREFIX_RE.test(input) ? input : `https://${input}`
}

export function isIpAddress(hostname) {
  return IPV4_RE.test(hostname)
}

export function isValidWebsiteHostname(hostname) {
  if (!hostname) {
    return false
  }

  if (isIpAddress(hostname)) {
    return true
  }

  return psl.isValid(hostname)
}

export function parseWebsiteInput(value) {
  const normalized = normalizeWebsiteInput(value)
  if (!normalized) {
    return null
  }

  let parsedUrl
  try {
    parsedUrl = new URL(normalized)
  } catch {
    return null
  }

  const hostname = parsedUrl.hostname.toLowerCase()
  if (!isValidWebsiteHostname(hostname)) {
    return null
  }

  return {
    normalized,
    hostname,
    isIpAddress: isIpAddress(hostname),
  }
}

export function getWebsiteInputError(value) {
  const input = String(value ?? '').trim()

  if (!input) {
    return 'Please enter a website address.'
  }

  return parseWebsiteInput(input) ? '' : WEBSITE_INPUT_ERROR
}
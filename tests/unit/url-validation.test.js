import { describe, it, expect } from 'vitest'
import {
  normalizeWebsiteInput,
  isIpAddress,
  isValidWebsiteHostname,
  parseWebsiteInput,
  getWebsiteInputError,
  WEBSITE_INPUT_ERROR,
} from '../../shared/websiteValidation.js'

describe('websiteValidation', () => {
  describe('normalizeWebsiteInput', () => {
    it('adds https:// prefix if missing', () => {
      expect(normalizeWebsiteInput('example.com')).toBe('https://example.com')
      expect(normalizeWebsiteInput('google.com')).toBe('https://google.com')
    })

    it('preserves https:// prefix if present', () => {
      expect(normalizeWebsiteInput('https://example.com')).toBe('https://example.com')
    })

    it('preserves http:// prefix if present', () => {
      expect(normalizeWebsiteInput('http://example.com')).toBe('http://example.com')
    })

    it('handles empty input', () => {
      expect(normalizeWebsiteInput('')).toBe('')
      expect(normalizeWebsiteInput(null)).toBe('')
      expect(normalizeWebsiteInput(undefined)).toBe('')
    })

    it('trims whitespace', () => {
      expect(normalizeWebsiteInput('  example.com  ')).toBe('https://example.com')
      expect(normalizeWebsiteInput('\texample.com\t')).toBe('https://example.com')
    })
  })

  describe('isIpAddress', () => {
    it('identifies valid IPv4 addresses', () => {
      expect(isIpAddress('192.168.1.1')).toBe(true)
      expect(isIpAddress('8.8.8.8')).toBe(true)
      expect(isIpAddress('127.0.0.1')).toBe(true)
      expect(isIpAddress('0.0.0.0')).toBe(true)
    })

    it('rejects invalid IPv4 addresses', () => {
      expect(isIpAddress('1.1.1')).toBe(false)
      expect(isIpAddress('example.com')).toBe(false)
      expect(isIpAddress('192.168.1.1.1')).toBe(false)
    })

    it('rejects non-numeric input', () => {
      expect(isIpAddress('192.168.a.1')).toBe(false)
      expect(isIpAddress('')).toBe(false)
    })
  })

  describe('isValidWebsiteHostname', () => {
    it('validates standard domain names', () => {
      expect(isValidWebsiteHostname('example.com')).toBe(true)
      expect(isValidWebsiteHostname('google.com')).toBe(true)
      expect(isValidWebsiteHostname('subdomain.example.com')).toBe(true)
    })

    it('validates IPv4 addresses', () => {
      expect(isValidWebsiteHostname('192.168.1.1')).toBe(true)
      expect(isValidWebsiteHostname('8.8.8.8')).toBe(true)
    })

    it('rejects invalid domains', () => {
      expect(isValidWebsiteHostname('invalid..domain')).toBe(false)
    })

    it('rejects empty hostname', () => {
      expect(isValidWebsiteHostname('')).toBe(false)
      expect(isValidWebsiteHostname(null)).toBe(false)
      expect(isValidWebsiteHostname(undefined)).toBe(false)
    })
  })

  describe('parseWebsiteInput', () => {
    it('parses valid URLs correctly', () => {
      const result = parseWebsiteInput('example.com')
      expect(result).toBeDefined()
      expect(result.normalized).toBe('https://example.com')
      expect(result.hostname).toBe('example.com')
      expect(result.isIpAddress).toBe(false)
    })

    it('handles IP addresses correctly', () => {
      const result = parseWebsiteInput('192.168.1.1')
      expect(result).toBeDefined()
      expect(result.hostname).toBe('192.168.1.1')
      expect(result.isIpAddress).toBe(true)
    })

    it('lowercases hostname', () => {
      const result = parseWebsiteInput('EXAMPLE.COM')
      expect(result.hostname).toBe('example.com')
    })

    it('returns null for invalid input', () => {
      expect(parseWebsiteInput('')).toBe(null)
      expect(parseWebsiteInput('invalid..domain')).toBe(null)
      expect(parseWebsiteInput(null)).toBe(null)
    })

    it('handles URLs with protocols', () => {
      const result = parseWebsiteInput('https://example.com')
      expect(result).toBeDefined()
      expect(result.hostname).toBe('example.com')
    })
  })

  describe('getWebsiteInputError', () => {
    it('returns error message for empty input', () => {
      expect(getWebsiteInputError('')).toBe('Please enter a website address.')
      expect(getWebsiteInputError(null)).toBe('Please enter a website address.')
    })

    it('returns no error for valid input', () => {
      expect(getWebsiteInputError('example.com')).toBe('')
      expect(getWebsiteInputError('https://example.com')).toBe('')
    })

    it('returns standard error for invalid domains', () => {
      const error = getWebsiteInputError('invalid..domain')
      expect(error).toBe(WEBSITE_INPUT_ERROR)
    })

    it('handles whitespace correctly', () => {
      expect(getWebsiteInputError('   ')).toBe('Please enter a website address.')
      expect(getWebsiteInputError('  example.com  ')).toBe('')
    })
  })
})

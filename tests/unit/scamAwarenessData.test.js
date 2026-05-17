import { describe, expect, it } from 'vitest'
import {
  awarenessInsights,
  scamAwarenessCards,
  scamProofPoints,
  supportLinks,
} from '../../src/data/scamAwarenessData.js'

describe('scamAwarenessData', () => {
  it('covers the common scam awareness topics shown on the awareness page', () => {
    expect(scamAwarenessCards.map(card => card.title)).toEqual([
      'Fake bank message',
      'Fake delivery message',
      'Remote access or tech support scam',
      'Family emergency scam',
    ])

    scamAwarenessCards.forEach((card) => {
      expect(card.description.trim().length).toBeGreaterThan(40)
      expect(card.warningSign).toMatch(/link|software|control|new number|money|urgent/i)
      expect(card.safeAction).toMatch(/do not|ignore|hang up|call|official/i)
    })
  })

  it('provides simple reminders and trusted support links', () => {
    expect(awarenessInsights).toHaveLength(2)
    expect(awarenessInsights.map(insight => insight.title)).toEqual([
      'Scammers use urgency',
      'Use official contact methods',
    ])

    expect(supportLinks).toHaveLength(4)
    supportLinks.forEach((link) => {
      expect(link.label.trim()).not.toBe('')
      expect(link.description.trim().length).toBeGreaterThan(20)
      expect(link.url).toMatch(/^https:\/\/.+/)
    })
  })

  it('provides source-backed scam proof points for the home and awareness pages', () => {
    expect(scamProofPoints.map(point => point.id)).toEqual([
      'total-losses',
      'investment-losses',
      'older-australians',
    ])

    scamProofPoints.forEach((point) => {
      expect(point.value.trim()).not.toBe('')
      expect(point.detail.length).toBeGreaterThan(60)
      expect(point.awarenessText.length).toBeGreaterThan(50)
      expect(point.sourceUrl).toMatch(/^https:\/\/.+/)
    })
  })
})

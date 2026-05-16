import { describe, expect, it } from 'vitest'
import { scamQuizQuestions } from '../../src/data/scamQuizData.js'

describe('scamQuizData', () => {
  it('provides a complete set of quiz questions for the scam quiz', () => {
    expect(scamQuizQuestions).toHaveLength(5)

    scamQuizQuestions.forEach((question, index) => {
      expect(question.id).toBe(index + 1)
      expect(question.scenario.trim().length).toBeGreaterThan(40)
      expect(question.options).toHaveLength(3)
      expect(question.correctIndex).toBeGreaterThanOrEqual(0)
      expect(question.correctIndex).toBeLessThan(question.options.length)
      expect(question.explanation.trim().length).toBeGreaterThan(40)
      expect(question.warningSign.trim().length).toBeGreaterThan(20)
    })
  })

  it('marks the safest action as the correct answer for each scenario', () => {
    const expectedSafeActions = [
      /open your banking app|call the number on the back of your bank card/i,
      /go to the Australia Post website yourself/i,
      /hang up.*call Telstra yourself/i,
      /go to my\.gov\.au yourself/i,
      /call your child on their real number/i,
    ]

    scamQuizQuestions.forEach((question, index) => {
      const correctOption = question.options[question.correctIndex]

      expect(correctOption).toMatch(expectedSafeActions[index])
      expect(question.explanation).toMatch(/scammer|fake|real companies|real bank|official/i)
      expect(question.warningSign).toMatch(/link|payment|download|personal details|money/i)
    })
  })
})

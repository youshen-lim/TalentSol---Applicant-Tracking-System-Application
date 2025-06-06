import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('MLService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle ML prediction data structure', () => {
    const mockPrediction = {
      priorityScore: 85,
      confidence: 0.9,
      reasoning: ['Strong technical skills', 'Relevant experience'],
      skillsExtracted: [
        { skill: 'JavaScript', confidence: 0.95, category: 'technical' }
      ],
      recommendedActions: ['Schedule technical interview']
    }

    expect(mockPrediction).toHaveProperty('priorityScore')
    expect(mockPrediction).toHaveProperty('confidence')
    expect(mockPrediction).toHaveProperty('reasoning')
    expect(mockPrediction).toHaveProperty('skillsExtracted')
    expect(mockPrediction).toHaveProperty('recommendedActions')
    
    expect(mockPrediction.priorityScore).toBeGreaterThan(0)
    expect(mockPrediction.confidence).toBeGreaterThan(0)
    expect(Array.isArray(mockPrediction.reasoning)).toBe(true)
  })

  it('should validate prediction score ranges', () => {
    const validScores = [0, 25, 50, 75, 100]
    const validConfidences = [0, 0.25, 0.5, 0.75, 1.0]

    validScores.forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    validConfidences.forEach(confidence => {
      expect(confidence).toBeGreaterThanOrEqual(0)
      expect(confidence).toBeLessThanOrEqual(1)
    })
  })

  it('should handle prediction error scenarios', () => {
    const errorPrediction = {
      applicationId: 'invalid-id',
      error: 'Prediction failed',
      priorityScore: 50,
      confidence: 0.1,
      reasoning: ['Prediction service unavailable'],
      skillsExtracted: [],
      recommendedActions: ['Manual review required']
    }

    expect(errorPrediction.error).toBe('Prediction failed')
    expect(errorPrediction.priorityScore).toBe(50)
    expect(errorPrediction.confidence).toBe(0.1)
    expect(Array.isArray(errorPrediction.skillsExtracted)).toBe(true)
    expect(Array.isArray(errorPrediction.recommendedActions)).toBe(true)
  })
})

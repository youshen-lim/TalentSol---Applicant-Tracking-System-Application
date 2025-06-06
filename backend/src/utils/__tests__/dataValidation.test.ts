import { describe, it, expect } from 'vitest'

// Data validation utilities for ML pipeline
const validateCandidateData = (candidate: any) => {
  const errors: string[] = []
  
  if (!candidate.firstName || candidate.firstName.trim().length === 0) {
    errors.push('First name is required')
  }
  
  if (!candidate.lastName || candidate.lastName.trim().length === 0) {
    errors.push('Last name is required')
  }
  
  if (!candidate.email || !candidate.email.includes('@')) {
    errors.push('Valid email is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const validateApplicationData = (application: any) => {
  const errors: string[] = []
  
  if (!application.candidateId) {
    errors.push('Candidate ID is required')
  }
  
  if (!application.jobId) {
    errors.push('Job ID is required')
  }
  
  if (!application.submittedAt) {
    errors.push('Submission date is required')
  }
  
  // Validate submission date is not in the future
  if (application.submittedAt && new Date(application.submittedAt) > new Date()) {
    errors.push('Submission date cannot be in the future')
  }
  
  // Validate hiring date is after submission date
  if (application.hiredAt && application.submittedAt) {
    if (new Date(application.hiredAt) <= new Date(application.submittedAt)) {
      errors.push('Hiring date must be after submission date')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

describe('Data Validation for ML Pipeline', () => {
  describe('Candidate Data Validation', () => {
    it('should validate complete candidate data', () => {
      const validCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }
      
      const result = validateCandidateData(validCandidate)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    it('should reject incomplete candidate data', () => {
      const invalidCandidate = {
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email'
      }
      
      const result = validateCandidateData(invalidCandidate)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('First name is required')
      expect(result.errors).toContain('Valid email is required')
    })
  })
  
  describe('Application Data Validation', () => {
    it('should validate complete application data', () => {
      const validApplication = {
        candidateId: 'cand_123',
        jobId: 'job_456',
        submittedAt: '2024-01-01T10:00:00Z',
        hiredAt: '2024-01-15T10:00:00Z'
      }
      
      const result = validateApplicationData(validApplication)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    it('should enforce business logic rules', () => {
      const invalidApplication = {
        candidateId: 'cand_123',
        jobId: 'job_456',
        submittedAt: '2024-01-15T10:00:00Z',
        hiredAt: '2024-01-01T10:00:00Z' // Hired before submission
      }
      
      const result = validateApplicationData(invalidApplication)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Hiring date must be after submission date')
    })
    
    it('should reject future submission dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      
      const invalidApplication = {
        candidateId: 'cand_123',
        jobId: 'job_456',
        submittedAt: futureDate.toISOString()
      }
      
      const result = validateApplicationData(invalidApplication)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Submission date cannot be in the future')
    })
  })
})

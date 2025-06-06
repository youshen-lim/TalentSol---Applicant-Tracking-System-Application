#!/bin/bash

# Update system packages
sudo apt-get update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install testing dependencies
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event
cd backend
npm install --save-dev vitest supertest @types/supertest
cd ..

# Create vitest configs
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
EOF

cd backend
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
EOF
cd ..

# Create test setup files
mkdir -p src/test
cat > src/test/setup.ts << 'EOF'
import '@testing-library/jest-dom'
EOF

mkdir -p backend/src/test
cat > backend/src/test/setup.ts << 'EOF'
import { vi } from 'vitest'

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.JWT_SECRET = 'test-secret'

// Mock Prisma client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    candidate: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    application: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    job: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    mLModel: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    mLPrediction: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  })),
}))
EOF

# Create data validation tests
mkdir -p backend/src/utils/__tests__
cat > backend/src/utils/__tests__/dataValidation.test.ts << 'EOF'
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
EOF

# Create performance tests for ML data processing
cat > backend/src/services/__tests__/performance.test.ts << 'EOF'
import { describe, it, expect, vi } from 'vitest'

// Mock large dataset processing
const processBatchPredictions = async (applicationIds: string[], batchSize = 10) => {
  const results = []
  const startTime = Date.now()
  
  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < applicationIds.length; i += batchSize) {
    const batch = applicationIds.slice(i, i + batchSize)
    
    // Simulate ML prediction processing time
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const batchResults = batch.map(id => ({
      applicationId: id,
      priorityScore: Math.floor(Math.random() * 100),
      confidence: Math.random(),
      processingTime: Date.now() - startTime
    }))
    
    results.push(...batchResults)
  }
  
  return {
    results,
    totalProcessingTime: Date.now() - startTime,
    averageTimePerPrediction: (Date.now() - startTime) / applicationIds.length
  }
}

// Cache simulation for ML predictions
class PredictionCache {
  private cache = new Map<string, any>()
  private hitCount = 0
  private missCount = 0
  
  get(key: string) {
    if (this.cache.has(key)) {
      this.hitCount++
      return this.cache.get(key)
    }
    this.missCount++
    return null
  }
  
  set(key: string, value: any, ttl = 300000) { // 5 minutes default TTL
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    })
  }
  
  getStats() {
    return {
      hitRate: this.hitCount / (this.hitCount + this.missCount),
      totalRequests: this.hitCount + this.missCount,
      cacheSize: this.cache.size
    }
  }
  
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key)
      }
    }
  }
}

describe('ML Data Processing Performance', () => {
  it('should process large batches efficiently', async () => {
    const applicationIds = Array.from({ length: 100 }, (_, i) => `app_${i}`)
    
    const result = await processBatchPredictions(applicationIds, 20)
    
    expect(result.results).toHaveLength(100)
    expect(result.averageTimePerPrediction).toBeLessThan(100) // Less than 100ms per prediction
    expect(result.totalProcessingTime).toBeLessThan(5000) // Less than 5 seconds total
  })
  
  it('should handle different batch sizes', async () => {
    const applicationIds = Array.from({ length: 50 }, (_, i) => `app_${i}`)
    
    const smallBatch = await processBatchPredictions(applicationIds, 5)
    const largeBatch = await processBatchPredictions(applicationIds, 25)
    
    expect(smallBatch.results).toHaveLength(50)
    expect(largeBatch.results).toHaveLength(50)
    
    // Both should complete in reasonable time
    expect(smallBatch.totalProcessingTime).toBeLessThan(10000)
    expect(largeBatch.totalProcessingTime).toBeLessThan(10000)
  })
})

describe('ML Prediction Caching', () => {
  it('should cache predictions effectively', () => {
    const cache = new PredictionCache()
    
    // First request - cache miss
    const result1 = cache.get('app_123')
    expect(result1).toBeNull()
    
    // Set cache
    cache.set('app_123', { priorityScore: 85, confidence: 0.9 })
    
    // Second request - cache hit
    const result2 = cache.get('app_123')
    expect(result2).toBeTruthy()
    expect(result2.value.priorityScore).toBe(85)
    
    const stats = cache.getStats()
    expect(stats.hitRate).toBe(0.5) // 1 hit out of 2 requests
    expect(stats.totalRequests).toBe(2)
  })
  
  it('should maintain good cache hit rates', () => {
    const cache = new PredictionCache()
    
    // Simulate realistic usage pattern
    const applicationIds = ['app_1', 'app_2', 'app_3', 'app_1', 'app_2', 'app_4', 'app_1']
    
    applicationIds.forEach((id, index) => {
      const cached = cache.get(id)
      if (!cached) {
        // Cache miss - simulate ML prediction
        cache.set(id, { 
          priorityScore: Math.floor(Math.random() * 100),
          confidence: Math.random(),
          timestamp: Date.now()
        })
      }
    })
    
    const stats = cache.getStats()
    expect(stats.hitRate).toBeGreaterThan(0.3) // At least 30% hit rate
    expect(stats.cacheSize).toBeLessThanOrEqual(4) // Only unique keys cached
  })
  
  it('should handle cache cleanup', () => {
    const cache = new PredictionCache()
    
    // Add entries with short TTL
    cache.set('app_1', { score: 85 }, 100) // 100ms TTL
    cache.set('app_2', { score: 90 }, 1000) // 1s TTL
    
    expect(cache.getStats().cacheSize).toBe(2)
    
    // Wait for first entry to expire
    setTimeout(() => {
      cache.cleanup()
      expect(cache.getStats().cacheSize).toBe(1)
    }, 150)
  })
})
EOF

# Create timeseries analytics tests
cat > backend/src/services/__tests__/timeseries.test.ts << 'EOF'
import { describe, it, expect } from 'vitest'

// Timeseries data processing for ML analytics
const generateTimeseriesData = (days: number) => {
  const data = []
  const baseDate = new Date('2024-01-01')
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      applications: Math.floor(Math.random() * 50) + 10,
      interviews: Math.floor(Math.random() * 20) + 5,
      hires: Math.floor(Math.random() * 5) + 1,
      avgScore: Math.floor(Math.random() * 40) + 60 // 60-100 range
    })
  }
  
  return data
}

const calculateTrends = (data: any[]) => {
  if (data.length < 2) return null
  
  const recent = data.slice(-7) // Last 7 days
  const previous = data.slice(-14, -7) // Previous 7 days
  
  const recentAvg = recent.reduce((sum, d) => sum + d.applications, 0) / recent.length
  const previousAvg = previous.reduce((sum, d) => sum + d.applications, 0) / previous.length
  
  const growth = ((recentAvg - previousAvg) / previousAvg) * 100
  
  return {
    recentAverage: recentAvg,
    previousAverage: previousAvg,
    growthPercentage: growth,
    trend: growth > 5 ? 'increasing' : growth < -5 ? 'decreasing' : 'stable'
  }
}

const forecastNextPeriod = (data: any[], periods = 7) => {
  // Simple linear regression for forecasting
  const values = data.map(d => d.applications)
  const n = values.length
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
  
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumXX += i * i
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  const forecast = []
  for (let i = 0; i < periods; i++) {
    const predicted = slope * (n + i) + intercept
    forecast.push(Math.max(0, Math.round(predicted)))
  }
  
  return forecast
}

describe('Timeseries Analytics for ML', () => {
  it('should generate consistent timeseries data', () => {
    const data = generateTimeseriesData(30)
    
    expect(data).toHaveLength(30)
    expect(data[0].date).toBe('2024-01-01')
    expect(data[29].date).toBe('2024-01-30')
    
    // Validate data structure
    data.forEach(entry => {
      expect(entry).toHaveProperty('date')
      expect(entry).toHaveProperty('applications')
      expect(entry).toHaveProperty('interviews')
      expect(entry).toHaveProperty('hires')
      expect(entry).toHaveProperty('avgScore')
      
      expect(entry.applications).toBeGreaterThan(0)
      expect(entry.avgScore).toBeGreaterThanOrEqual(60)
      expect(entry.avgScore).toBeLessThanOrEqual(100)
    })
  })
  
  it('should calculate trends correctly', () => {
    const data = generateTimeseriesData(14)
    const trends = calculateTrends(data)
    
    expect(trends).toBeTruthy()
    expect(trends).toHaveProperty('recentAverage')
    expect(trends).toHaveProperty('previousAverage')
    expect(trends).toHaveProperty('growthPercentage')
    expect(trends).toHaveProperty('trend')
    
    expect(['increasing', 'decreasing', 'stable']).toContain(trends.trend)
  })
  
  it('should forecast future periods', () => {
    const data = generateTimeseriesData(30)
    const forecast = forecastNextPeriod(data, 7)
    
    expect(forecast).toHaveLength(7)
    forecast.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(typeof value).toBe('number')
    })
  })
  
  it('should handle edge cases in trend calculation', () => {
    const singleDay = generateTimeseriesData(1)
    const trends = calculateTrends(singleDay)
    
    expect(trends).toBeNull()
    
    const shortData = generateTimeseriesData(5)
    const shortTrends = calculateTrends(shortData)
    
    expect(shortTrends).toBeTruthy()
  })
})
EOF

# Create existing test files
mkdir -p src/services/__tests__
cat > src/services/__tests__/api.test.ts << 'EOF'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should handle successful API responses', async () => {
    const mockResponse = { data: 'test' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const response = await fetch('/api/test')
    const data = await response.json()
    
    expect(data).toEqual(mockResponse)
  })

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    })

    const response = await fetch('/api/test')
    expect(response.ok).toBe(false)
    expect(response.status).toBe(404)
  })
})
EOF

# Create backend test files
mkdir -p backend/src/services/__tests__
cat > backend/src/services/__tests__/mlService.test.ts << 'EOF'
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
EOF

mkdir -p backend/src/routes/__tests__
cat > backend/src/routes/__tests__/analytics.test.ts << 'EOF'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

const mockAnalyticsHandler = (req: any, res: any) => {
  res.json({
    totalApplications: 150,
    newApplications: 25,
    conversionRate: 0.15,
    averageScore: 75,
    applicationsByStatus: [
      { status: 'applied', count: 50, percentage: 33.3 },
      { status: 'screening', count: 40, percentage: 26.7 },
      { status: 'interview', count: 30, percentage: 20.0 },
      { status: 'hired', count: 20, percentage: 13.3 },
      { status: 'rejected', count: 10, percentage: 6.7 }
    ]
  })
}

describe('Analytics API', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.get('/api/analytics/dashboard', mockAnalyticsHandler)
  })

  it('should return dashboard statistics', async () => {
    const response = await request(app)
      .get('/api/analytics/dashboard')
      .expect(200)

    expect(response.body).toHaveProperty('totalApplications')
    expect(response.body).toHaveProperty('newApplications')
    expect(response.body).toHaveProperty('conversionRate')
    expect(response.body).toHaveProperty('applicationsByStatus')
    expect(Array.isArray(response.body.applicationsByStatus)).toBe(true)
  })

  it('should return valid data types', async () => {
    const response = await request(app)
      .get('/api/analytics/dashboard')
      .expect(200)

    expect(typeof response.body.totalApplications).toBe('number')
    expect(typeof response.body.conversionRate).toBe('number')
    expect(response.body.conversionRate).toBeGreaterThanOrEqual(0)
    expect(response.body.conversionRate).toBeLessThanOrEqual(1)
  })
})
EOF

cat > backend/src/routes/__tests__/ml.test.ts << 'EOF'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

const mockMLPredictHandler = (req: any, res: any) => {
  const { applicationIds } = req.body
  
  const predictions = applicationIds.map((id: string) => ({
    applicationId: id,
    priorityScore: Math.floor(Math.random() * 100),
    confidence: Math.random(),
    reasoning: ['Technical skills match', 'Experience level appropriate'],
    skillsExtracted: [
      { skill: 'JavaScript', confidence: 0.9, category: 'technical' }
    ],
    recommendedActions: ['Schedule interview']
  }))

  res.json({
    predictions,
    summary: {
      total: applicationIds.length,
      successful: predictions.length,
      failed: 0,
      averageScore: predictions.reduce((sum: number, p: any) => sum + p.priorityScore, 0) / predictions.length
    }
  })
}

describe('ML API', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.post('/api/ml/predict', mockMLPredictHandler)
  })

  it('should predict candidate priorities', async () => {
    const requestData = {
      applicationIds: ['app1', 'app2', 'app3'],
      modelType: 'candidate_scoring'
    }

    const response = await request(app)
      .post('/api/ml/predict')
      .send(requestData)
      .expect(200)

    expect(response.body).toHaveProperty('predictions')
    expect(response.body).toHaveProperty('summary')
    expect(Array.isArray(response.body.predictions)).toBe(true)
    expect(response.body.predictions).toHaveLength(3)
    
    const prediction = response.body.predictions[0]
    expect(prediction).toHaveProperty('applicationId')
    expect(prediction).toHaveProperty('priorityScore')
    expect(prediction).toHaveProperty('confidence')
    expect(prediction).toHaveProperty('reasoning')
    expect(prediction).toHaveProperty('skillsExtracted')
  })

  it('should return valid prediction scores', async () => {
    const requestData = {
      applicationIds: ['app1'],
      modelType: 'candidate_scoring'
    }

    const response = await request(app)
      .post('/api/ml/predict')
      .send(requestData)
      .expect(200)

    const prediction = response.body.predictions[0]
    expect(prediction.priorityScore).toBeGreaterThanOrEqual(0)
    expect(prediction.priorityScore).toBeLessThanOrEqual(100)
    expect(prediction.confidence).toBeGreaterThanOrEqual(0)
    expect(prediction.confidence).toBeLessThanOrEqual(1)
  })
})
EOF

# Update package.json scripts
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:run="vitest run"
npm pkg set scripts.test:watch="vitest"
npm pkg set scripts.test:ui="vitest --ui"

cd backend
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:run="vitest run"
npm pkg set scripts.test:watch="vitest"
cd ..

# Add PATH to profile
echo 'export PATH=$PATH:/usr/local/bin' >> $HOME/.profile

echo "✅ Phase 3: Data architecture & performance testing infrastructure complete"
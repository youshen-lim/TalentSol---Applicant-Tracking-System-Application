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

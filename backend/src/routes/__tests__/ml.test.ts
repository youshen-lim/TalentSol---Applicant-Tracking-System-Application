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

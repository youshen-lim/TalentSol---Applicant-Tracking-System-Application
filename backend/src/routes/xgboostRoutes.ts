import express from 'express';
import { XGBoostModelService } from '../services/xgboostModelService.js';
import { XGBoostDataMappingService } from '../services/xgboostDataMappingService.js';
import { logger } from '../utils/logger.js';
import { websocketService } from '../services/websocketService.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();
const xgboostService = new XGBoostModelService();
const mappingService = new XGBoostDataMappingService();

/**
 * Initialize XGBoost model
 * POST /api/xgboost/initialize
 */
router.post('/initialize', async (req, res) => {
  try {
    await xgboostService.initializeModel();
    
    const metrics = xgboostService.getModelMetrics();
    
    res.json({
      success: true,
      message: 'XGBoost model initialized successfully',
      metrics
    });
  } catch (error) {
    logger.error('XGBoost initialization failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize XGBoost model',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get XGBoost model status and metrics
 * GET /api/xgboost/status
 */
router.get('/status', (req, res) => {
  try {
    const isInitialized = xgboostService.isModelInitialized();
    const metrics = xgboostService.getModelMetrics();
    
    res.json({
      success: true,
      initialized: isInitialized,
      metrics
    });
  } catch (error) {
    logger.error('Failed to get XGBoost status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model status'
    });
  }
});

/**
 * Predict single application
 * POST /api/xgboost/predict/:applicationId
 */
router.post('/predict/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  
  try {
    // Check if prediction already exists
    const hasExisting = await mappingService.hasExistingPrediction(applicationId);
    if (hasExisting && !req.body.force) {
      return res.status(409).json({
        success: false,
        error: 'Prediction already exists for this application',
        message: 'Use force=true to regenerate prediction'
      });
    }

    // Map application data to model input
    const modelInput = await mappingService.mapApplicationToModelInput(applicationId);
    
    // Make prediction
    const prediction = await xgboostService.predict(modelInput);
    
    // Emit WebSocket event for real-time updates
    await websocketService.emitXGBoostPredictionCompleted(
      prediction.applicationId,
      prediction.candidateId,
      prediction.jobId,
      {
        probability: prediction.probability,
        binary_prediction: prediction.binaryPrediction,
        confidence: prediction.confidence,
        threshold_used: prediction.thresholdUsed,
        model_version: prediction.modelVersion
      },
      prediction.processingTimeMs
    );
    
    res.json({
      success: true,
      prediction
    });
    
  } catch (error) {
    logger.error(`XGBoost prediction failed for application ${applicationId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Batch predict multiple applications
 * POST /api/xgboost/predict-batch
 * Body: { applicationIds: string[], force?: boolean }
 */
router.post('/predict-batch', async (req, res) => {
  const { applicationIds, force = false } = req.body;
  
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'applicationIds must be a non-empty array'
    });
  }

  if (applicationIds.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Maximum 100 applications per batch'
    });
  }

  try {
    // Filter out applications with existing predictions if not forcing
    let applicationsToProcess = applicationIds;
    if (!force) {
      const filteredIds = [];
      for (const appId of applicationIds) {
        const hasExisting = await mappingService.hasExistingPrediction(appId);
        if (!hasExisting) {
          filteredIds.push(appId);
        }
      }
      applicationsToProcess = filteredIds;
    }

    if (applicationsToProcess.length === 0) {
      return res.json({
        success: true,
        message: 'All applications already have predictions',
        processed: 0,
        skipped: applicationIds.length
      });
    }

    // Map applications to model inputs
    const modelInputs = await mappingService.mapApplicationsBatch(applicationsToProcess);
    
    // Make batch predictions
    const predictions = await xgboostService.predictBatch(modelInputs);
    
    // Emit WebSocket events for each prediction
    for (const prediction of predictions) {
      await websocketService.emitXGBoostPredictionCompleted(
        prediction.applicationId,
        prediction.candidateId,
        prediction.jobId,
        {
          probability: prediction.probability,
          binary_prediction: prediction.binaryPrediction,
          confidence: prediction.confidence,
          threshold_used: prediction.thresholdUsed,
          model_version: prediction.modelVersion
        },
        prediction.processingTimeMs
      );
    }
    
    res.json({
      success: true,
      processed: predictions.length,
      skipped: applicationIds.length - applicationsToProcess.length,
      predictions
    });
    
  } catch (error) {
    logger.error('Batch prediction failed:', error);
    res.status(500).json({
      success: false,
      error: 'Batch prediction failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Process pending applications automatically
 * POST /api/xgboost/process-pending
 */
router.post('/process-pending', async (req, res) => {
  const { limit = 50 } = req.body;
  
  try {
    // Get applications ready for processing
    const applicationIds = await mappingService.getApplicationsForProcessing(limit);
    
    if (applicationIds.length === 0) {
      return res.json({
        success: true,
        message: 'No pending applications to process',
        processed: 0
      });
    }

    // Map applications to model inputs
    const modelInputs = await mappingService.mapApplicationsBatch(applicationIds);
    
    // Make batch predictions
    const predictions = await xgboostService.predictBatch(modelInputs);
    
    // Emit WebSocket events
    const websocketService = WebSocketService.getInstance();
    predictions.forEach(prediction => {
      websocketService.emitToAll('xgboost_prediction_completed', {
        type: 'xgboost_prediction_completed',
        applicationId: prediction.applicationId,
        candidateId: prediction.candidateId,
        jobId: prediction.jobId,
        prediction: {
          probability: prediction.probability,
          binary_prediction: prediction.binaryPrediction,
          confidence: prediction.confidence,
          threshold_used: prediction.thresholdUsed,
          model_version: prediction.modelVersion
        },
        processing_time_ms: prediction.processingTimeMs,
        timestamp: prediction.timestamp
      });
    });
    
    res.json({
      success: true,
      processed: predictions.length,
      predictions
    });
    
  } catch (error) {
    logger.error('Process pending applications failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process pending applications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get prediction for specific application
 * GET /api/xgboost/prediction/:applicationId
 */
router.get('/prediction/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  
  try {
    const prediction = await prisma.mlPrediction.findFirst({
      where: {
        applicationId,
        modelType: 'xgboost_decision_tree'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'No XGBoost prediction found for this application'
      });
    }
    
    res.json({
      success: true,
      prediction: {
        id: prediction.id,
        applicationId: prediction.applicationId,
        modelType: prediction.modelType,
        modelVersion: prediction.modelVersion,
        prediction: JSON.parse(prediction.prediction),
        confidence: prediction.confidence,
        explanation: JSON.parse(prediction.explanation),
        createdAt: prediction.createdAt
      }
    });
    
  } catch (error) {
    logger.error(`Failed to get prediction for application ${applicationId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve prediction'
    });
  }
});

/**
 * Get model performance metrics
 * GET /api/xgboost/metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    // Get recent predictions for performance analysis
    const recentPredictions = await prisma.mlPrediction.findMany({
      where: {
        modelType: 'xgboost_decision_tree',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        prediction: true,
        confidence: true,
        createdAt: true
      }
    });
    
    // Calculate metrics
    const totalPredictions = recentPredictions.length;
    const positiveClassPredictions = recentPredictions.filter(p => {
      const pred = JSON.parse(p.prediction);
      return pred.binary_prediction === 1;
    }).length;
    
    const averageConfidence = recentPredictions.reduce((sum, p) => sum + p.confidence, 0) / totalPredictions || 0;
    
    const modelMetrics = xgboostService.getModelMetrics();
    
    res.json({
      success: true,
      metrics: {
        ...modelMetrics,
        recent_performance: {
          total_predictions_24h: totalPredictions,
          positive_predictions_24h: positiveClassPredictions,
          positive_rate_24h: totalPredictions > 0 ? positiveClassPredictions / totalPredictions : 0,
          average_confidence_24h: averageConfidence
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to get XGBoost metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

export default router;

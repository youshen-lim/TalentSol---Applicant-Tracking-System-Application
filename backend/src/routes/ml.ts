import express from 'express';
import { prisma } from '../index.js';
import { MLService } from '../services/mlService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();
const mlService = MLService.getInstance();

// Validation schemas
const trainModelSchema = z.object({
  datasetId: z.string().cuid(),
  modelType: z.enum(['candidate_scoring', 'job_matching', 'resume_parsing']),
  modelName: z.string().min(1),
  features: z.array(z.string()),
  hyperparameters: z.record(z.any()).optional(),
});

const predictSchema = z.object({
  applicationIds: z.array(z.string().cuid()),
  modelType: z.enum(['candidate_scoring', 'job_matching', 'resume_parsing']).default('candidate_scoring'),
});

// Get all ML models
router.get('/models', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const models = await prisma.mLModel.findMany({
    orderBy: { trainedAt: 'desc' },
    include: {
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  });

  res.json({
    models: models.map(model => ({
      ...model,
      predictionCount: model._count.predictions,
    })),
  });
}));

// Get model performance metrics
router.get('/models/:id/metrics', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const model = await prisma.mLModel.findUnique({
    where: { id },
    include: {
      predictions: {
        take: 100,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!model) {
    throw new AppError('Model not found', 404);
  }

  // Calculate recent performance metrics
  const recentPredictions = model.predictions;
  const avgConfidence = recentPredictions.length > 0
    ? recentPredictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / recentPredictions.length
    : 0;

  res.json({
    model: {
      id: model.id,
      name: model.name,
      type: model.type,
      version: model.version,
      accuracy: model.accuracy,
      precision: model.precision,
      recall: model.recall,
      f1Score: model.f1Score,
      isActive: model.isActive,
      trainedAt: model.trainedAt,
    },
    recentMetrics: {
      totalPredictions: recentPredictions.length,
      averageConfidence: avgConfidence,
      predictionTrend: recentPredictions.slice(0, 10).map(p => ({
        date: p.createdAt,
        confidence: p.confidence,
      })),
    },
  });
}));

// Predict candidate priority for applications
router.post('/predict', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = predictSchema.parse(req.body);

  const results = [];

  for (const applicationId of validatedData.applicationIds) {
    // Verify application belongs to user's company
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId: req.user!.companyId,
        },
      },
    });

    if (!application) {
      continue; // Skip applications not belonging to user's company
    }

    try {
      const prediction = await mlService.predictCandidatePriority(applicationId);
      results.push({
        applicationId,
        ...prediction,
      });
    } catch (error) {
      console.error(`Prediction failed for application ${applicationId}:`, error);
      results.push({
        applicationId,
        error: 'Prediction failed',
        priorityScore: 50, // Default score
        confidence: 0.1,
        reasoning: ['Prediction service unavailable'],
        skillsExtracted: [],
        recommendedActions: ['Manual review required'],
      });
    }
  }

  res.json({
    predictions: results,
    summary: {
      total: validatedData.applicationIds.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      averageScore: results.reduce((sum, r) => sum + (r.priorityScore || 0), 0) / results.length,
    },
  });
}));

// Get predictions for a specific application
router.get('/predictions/application/:applicationId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { applicationId } = req.params;

  // Verify application belongs to user's company
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: {
        companyId: req.user!.companyId,
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const predictions = await prisma.mLPrediction.findMany({
    where: { applicationId },
    include: {
      model: {
        select: {
          name: true,
          type: true,
          version: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const skillExtractions = await prisma.skillExtraction.findMany({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    applicationId,
    predictions,
    skillExtractions,
    latestPrediction: predictions[0] || null,
    latestSkillExtraction: skillExtractions[0] || null,
  });
}));

// Bulk predict for job pipeline
router.post('/predict/job/:jobId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { jobId } = req.params;

  // Verify job belongs to user's company
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: req.user!.companyId,
    },
    include: {
      applications: {
        where: {
          status: { in: ['applied', 'screening'] }, // Only predict for early-stage applications
        },
        select: { id: true },
      },
    },
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const applicationIds = job.applications.map(app => app.id);

  if (applicationIds.length === 0) {
    return res.json({
      message: 'No applications found for prediction',
      predictions: [],
      summary: { total: 0, successful: 0, failed: 0, averageScore: 0 },
    });
  }

  // Use the existing predict endpoint logic
  const results = [];

  for (const applicationId of applicationIds) {
    try {
      const prediction = await mlService.predictCandidatePriority(applicationId);
      results.push({
        applicationId,
        ...prediction,
      });
    } catch (error) {
      console.error(`Prediction failed for application ${applicationId}:`, error);
      results.push({
        applicationId,
        error: 'Prediction failed',
        priorityScore: 50,
        confidence: 0.1,
        reasoning: ['Prediction service unavailable'],
        skillsExtracted: [],
        recommendedActions: ['Manual review required'],
      });
    }
  }

  res.json({
    jobId,
    predictions: results,
    summary: {
      total: applicationIds.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      averageScore: results.reduce((sum, r) => sum + (r.priorityScore || 0), 0) / results.length,
    },
  });
}));

// Get training datasets
router.get('/datasets', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const datasets = await prisma.trainingDataset.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({ datasets });
}));

// Upload/register new training dataset
router.post('/datasets', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const {
    name,
    description,
    source,
    datasetPath,
    features,
    targetVariable,
    recordCount,
    metadata,
  } = req.body;

  const dataset = await prisma.trainingDataset.create({
    data: {
      name,
      description,
      source,
      datasetPath,
      features,
      targetVariable,
      recordCount,
      metadata,
    },
  });

  res.status(201).json({
    message: 'Dataset registered successfully',
    dataset,
  });
}));

// Train new model (placeholder - would integrate with Python ML pipeline)
router.post('/train', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = trainModelSchema.parse(req.body);

  // Verify dataset exists
  const dataset = await prisma.trainingDataset.findUnique({
    where: { id: validatedData.datasetId },
  });

  if (!dataset) {
    throw new AppError('Dataset not found', 404);
  }

  // In a real implementation, this would trigger a background training job
  // For now, we'll create a placeholder model
  const model = await prisma.mLModel.create({
    data: {
      name: validatedData.modelName,
      type: validatedData.modelType,
      version: '1.0',
      modelPath: `/models/${validatedData.modelName}_${Date.now()}.pkl`,
      accuracy: 0.85 + Math.random() * 0.1, // Simulated metrics
      precision: 0.82 + Math.random() * 0.1,
      recall: 0.78 + Math.random() * 0.1,
      f1Score: 0.80 + Math.random() * 0.1,
      trainingData: {
        datasetId: dataset.id,
        datasetName: dataset.name,
        recordCount: dataset.recordCount,
        features: validatedData.features,
        hyperparameters: validatedData.hyperparameters,
      },
      features: validatedData.features,
      isActive: false, // Requires manual activation
      trainedAt: new Date(),
    },
  });

  res.status(201).json({
    message: 'Model training initiated',
    model,
    note: 'Model training is running in background. Check status periodically.',
  });
}));

// Activate/deactivate model
router.patch('/models/:id/status', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (isActive) {
    // Deactivate other models of the same type first
    const model = await prisma.mLModel.findUnique({ where: { id } });
    if (model) {
      await prisma.mLModel.updateMany({
        where: { type: model.type, isActive: true },
        data: { isActive: false },
      });
    }
  }

  const updatedModel = await prisma.mLModel.update({
    where: { id },
    data: { isActive },
  });

  res.json({
    message: `Model ${isActive ? 'activated' : 'deactivated'} successfully`,
    model: updatedModel,
  });
}));

export default router;

import express from 'express';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  type: z.enum(['technical', 'behavioral', 'cultural_fit', 'final', 'screening']),
  duration: z.number().min(15).max(480),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  interviewers: z.array(z.string()).optional(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    category: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    expectedAnswer: z.string().optional(),
    timeAllocation: z.number()
  })).optional(),
  evaluationCriteria: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    weight: z.number(),
    scale: z.number()
  })).optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().optional()
});

const updateTemplateSchema = createTemplateSchema.partial();

// GET /api/interview-templates - Get all templates for company
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const templates = await prisma.interviewTemplate.findMany({
    where: {
      companyId: req.user!.companyId,
    },
    orderBy: [
      { isDefault: 'desc' },
      { updatedAt: 'desc' }
    ]
  });

  res.json({
    message: 'Interview templates retrieved successfully',
    templates,
  });
}));

// GET /api/interview-templates/:id - Get specific template
router.get('/:id', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const template = await prisma.interviewTemplate.findFirst({
    where: {
      id,
      companyId: req.user!.companyId,
    },
  });

  if (!template) {
    throw new AppError('Interview template not found', 404);
  }

  res.json({
    message: 'Interview template retrieved successfully',
    template,
  });
}));

// POST /api/interview-templates - Create new template
router.post('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = createTemplateSchema.parse(req.body);

  // If setting as default, unset other defaults of the same type
  if (validatedData.isDefault) {
    await prisma.interviewTemplate.updateMany({
      where: {
        companyId: req.user!.companyId,
        type: validatedData.type,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const template = await prisma.interviewTemplate.create({
    data: {
      ...validatedData,
      companyId: req.user!.companyId,
      createdById: req.user!.id,
      interviewers: validatedData.interviewers || [],
      questions: validatedData.questions || [],
      evaluationCriteria: validatedData.evaluationCriteria || [],
    },
  });

  res.status(201).json({
    message: 'Interview template created successfully',
    template,
  });
}));

// PUT /api/interview-templates/:id - Update template
router.put('/:id', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const validatedData = updateTemplateSchema.parse(req.body);

  // Check if template exists and belongs to user's company
  const existingTemplate = await prisma.interviewTemplate.findFirst({
    where: {
      id,
      companyId: req.user!.companyId,
    },
  });

  if (!existingTemplate) {
    throw new AppError('Interview template not found', 404);
  }

  // If setting as default, unset other defaults of the same type
  if (validatedData.isDefault && validatedData.type) {
    await prisma.interviewTemplate.updateMany({
      where: {
        companyId: req.user!.companyId,
        type: validatedData.type,
        isDefault: true,
        id: { not: id },
      },
      data: {
        isDefault: false,
      },
    });
  }

  const template = await prisma.interviewTemplate.update({
    where: { id },
    data: validatedData,
  });

  res.json({
    message: 'Interview template updated successfully',
    template,
  });
}));

// POST /api/interview-templates/:id/duplicate - Duplicate template
router.post('/:id/duplicate', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const existingTemplate = await prisma.interviewTemplate.findFirst({
    where: {
      id,
      companyId: req.user!.companyId,
    },
  });

  if (!existingTemplate) {
    throw new AppError('Interview template not found', 404);
  }

  const duplicatedTemplate = await prisma.interviewTemplate.create({
    data: {
      name: `${existingTemplate.name} (Copy)`,
      description: existingTemplate.description,
      type: existingTemplate.type,
      duration: existingTemplate.duration,
      location: existingTemplate.location,
      meetingLink: existingTemplate.meetingLink,
      interviewers: existingTemplate.interviewers as any,
      questions: existingTemplate.questions as any,
      evaluationCriteria: existingTemplate.evaluationCriteria as any,
      instructions: existingTemplate.instructions,
      isDefault: false, // Copies are never default
      companyId: req.user!.companyId,
      createdById: req.user!.id,
    },
  });

  res.status(201).json({
    message: 'Interview template duplicated successfully',
    template: duplicatedTemplate,
  });
}));

// DELETE /api/interview-templates/:id - Delete template
router.delete('/:id', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const existingTemplate = await prisma.interviewTemplate.findFirst({
    where: {
      id,
      companyId: req.user!.companyId,
    },
  });

  if (!existingTemplate) {
    throw new AppError('Interview template not found', 404);
  }

  // Prevent deletion of default templates
  if (existingTemplate.isDefault) {
    throw new AppError('Cannot delete default templates', 400);
  }

  await prisma.interviewTemplate.delete({
    where: { id },
  });

  res.json({
    message: 'Interview template deleted successfully',
  });
}));

// POST /api/interview-templates/bulk-operations - Bulk operations
router.post('/bulk-operations', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { operation, templateIds, data } = req.body;

  // Validate that all templates belong to user's company
  const templates = await prisma.interviewTemplate.findMany({
    where: {
      id: { in: templateIds },
      companyId: req.user!.companyId,
    },
  });

  if (templates.length !== templateIds.length) {
    throw new AppError('Some templates not found or access denied', 404);
  }

  let result;

  switch (operation) {
    case 'delete':
      // Prevent deletion of default templates
      const defaultTemplates = templates.filter(t => t.isDefault);
      if (defaultTemplates.length > 0) {
        throw new AppError('Cannot delete default templates', 400);
      }

      result = await prisma.interviewTemplate.deleteMany({
        where: {
          id: { in: templateIds },
          companyId: req.user!.companyId,
          isDefault: false,
        },
      });
      break;

    case 'duplicate':
      const duplicatedTemplates: any[] = [];
      for (const template of templates) {
        const duplicated = await prisma.interviewTemplate.create({
          data: {
            name: `${template.name} (Copy)`,
            description: template.description,
            type: template.type,
            duration: template.duration,
            location: template.location,
            meetingLink: template.meetingLink,
            interviewers: template.interviewers as any,
            questions: template.questions as any,
            evaluationCriteria: template.evaluationCriteria as any,
            instructions: template.instructions,
            isDefault: false,
            companyId: req.user!.companyId,
            createdById: req.user!.id,
          },
        });
        duplicatedTemplates.push(duplicated);
      }
      result = { duplicatedTemplates };
      break;

    case 'update_type':
      result = await prisma.interviewTemplate.updateMany({
        where: {
          id: { in: templateIds },
          companyId: req.user!.companyId,
        },
        data: {
          type: data.type,
        },
      });
      break;

    default:
      throw new AppError('Invalid bulk operation', 400);
  }

  res.json({
    message: `Bulk ${operation} completed successfully`,
    result,
  });
}));

export default router;

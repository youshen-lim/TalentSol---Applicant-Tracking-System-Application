import express from 'express';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createFormSchema = z.object({
  jobId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  sections: z.array(z.any()),
  settings: z.object({
    allowSave: z.boolean(),
    autoSave: z.boolean(),
    showProgress: z.boolean(),
    multiStep: z.boolean(),
    deadline: z.string().optional(),
    maxApplications: z.number().optional(),
    requireLogin: z.boolean(),
    gdprCompliance: z.boolean(),
    eeocQuestions: z.boolean(),
  }),
  emailSettings: z.object({
    confirmationTemplate: z.string(),
    autoResponse: z.boolean(),
    redirectUrl: z.string().optional(),
  }),
});

const updateFormSchema = createFormSchema.partial();

// Get all forms for company
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const {
    page = '1',
    limit = '10',
    jobId,
    status,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    job: {
      companyId: req.user!.companyId,
    },
  };

  if (jobId) {
    where.jobId = jobId as string;
  }

  const [forms, total] = await Promise.all([
    prisma.applicationFormSchema.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.applicationFormSchema.count({ where }),
  ]);

  // Add form statistics
  const formsWithStats = await Promise.all(
    forms.map(async (form) => {
      const applicationCount = await prisma.application.count({
        where: { jobId: form.jobId },
      });

      return {
        ...form,
        applicationCount,
        status: form.job.status === 'open' ? 'live' : 'draft',
        publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/apply/${form.job.title.toLowerCase().replace(/\s+/g, '-')}-${req.user!.companyId}-${form.id}`,
      };
    })
  );

  res.json({
    forms: formsWithStats,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}));

// Get single form (public access for form submissions)
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const form = await prisma.applicationFormSchema.findFirst({
    where: {
      id,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!form) {
    throw new AppError('Form not found', 404);
  }

  // Add form statistics
  const applicationCount = await prisma.application.count({
    where: { jobId: form.jobId },
  });

  const formWithStats = {
    ...form,
    applicationCount,
    status: form.job.status === 'open' ? 'live' : 'draft',
    publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/apply/${form.job.title.toLowerCase().replace(/\s+/g, '-')}-comp1-${form.id}`,
  };

  res.json(formWithStats);
}));

// Create new form
router.post('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = createFormSchema.parse(req.body);

  // Check if job exists and belongs to user's company
  const job = await prisma.job.findFirst({
    where: {
      id: validatedData.jobId,
      companyId: req.user!.companyId,
    },
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const form = await prisma.applicationFormSchema.create({
    data: {
      ...validatedData,
      createdById: req.user!.id,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  const formWithStats = {
    ...form,
    applicationCount: 0,
    status: form.job.status === 'open' ? 'live' : 'draft',
    publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/apply/${form.job.title.toLowerCase().replace(/\s+/g, '-')}-${req.user!.companyId}-${form.id}`,
  };

  res.status(201).json({
    message: 'Form created successfully',
    form: formWithStats,
  });
}));

// Update form
router.put('/:id', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const validatedData = updateFormSchema.parse(req.body);

  // Check if form exists and belongs to user's company
  const existingForm = await prisma.applicationFormSchema.findFirst({
    where: {
      id,
      job: {
        companyId: req.user!.companyId,
      },
    },
  });

  if (!existingForm) {
    throw new AppError('Form not found', 404);
  }

  const form = await prisma.applicationFormSchema.update({
    where: { id },
    data: {
      ...validatedData,
      version: existingForm.version + 1,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  const applicationCount = await prisma.application.count({
    where: { jobId: form.jobId },
  });

  const formWithStats = {
    ...form,
    applicationCount,
    status: form.job.status === 'open' ? 'live' : 'draft',
    publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/apply/${form.job.title.toLowerCase().replace(/\s+/g, '-')}-${req.user!.companyId}-${form.id}`,
  };

  res.json({
    message: 'Form updated successfully',
    form: formWithStats,
  });
}));

// Clone form
router.post('/:id/clone', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { jobId, title } = req.body;

  // Check if original form exists and belongs to user's company
  const originalForm = await prisma.applicationFormSchema.findFirst({
    where: {
      id,
      job: {
        companyId: req.user!.companyId,
      },
    },
  });

  if (!originalForm) {
    throw new AppError('Form not found', 404);
  }

  // Check if target job exists and belongs to user's company
  const targetJob = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: req.user!.companyId,
    },
  });

  if (!targetJob) {
    throw new AppError('Target job not found', 404);
  }

  const clonedForm = await prisma.applicationFormSchema.create({
    data: {
      jobId,
      title: title || `${originalForm.title} (Copy)`,
      description: originalForm.description,
      sections: originalForm.sections,
      settings: originalForm.settings,
      emailSettings: originalForm.emailSettings,
      createdById: req.user!.id,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  const formWithStats = {
    ...clonedForm,
    applicationCount: 0,
    status: clonedForm.job.status === 'open' ? 'live' : 'draft',
    publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/apply/${clonedForm.job.title.toLowerCase().replace(/\s+/g, '-')}-${req.user!.companyId}-${clonedForm.id}`,
  };

  res.status(201).json({
    message: 'Form cloned successfully',
    form: formWithStats,
  });
}));

// Delete form
router.delete('/:id', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if form exists and belongs to user's company
  const existingForm = await prisma.applicationFormSchema.findFirst({
    where: {
      id,
      job: {
        companyId: req.user!.companyId,
      },
    },
  });

  if (!existingForm) {
    throw new AppError('Form not found', 404);
  }

  // Check if form has applications
  const applicationCount = await prisma.application.count({
    where: { jobId: existingForm.jobId },
  });

  if (applicationCount > 0) {
    throw new AppError('Cannot delete form with existing applications', 400);
  }

  await prisma.applicationFormSchema.delete({
    where: { id },
  });

  res.json({
    message: 'Form deleted successfully',
  });
}));

// Get form analytics
router.get('/:id/analytics', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if form exists and belongs to user's company
  const form = await prisma.applicationFormSchema.findFirst({
    where: {
      id,
      job: {
        companyId: req.user!.companyId,
      },
    },
    include: {
      job: true,
    },
  });

  if (!form) {
    throw new AppError('Form not found', 404);
  }

  // Get form analytics
  const [
    totalApplications,
    applicationsByStatus,
    recentApplications,
  ] = await Promise.all([
    prisma.application.count({
      where: { jobId: form.jobId },
    }),
    prisma.application.groupBy({
      by: ['status'],
      where: { jobId: form.jobId },
      _count: true,
    }),
    prisma.application.findMany({
      where: { jobId: form.jobId },
      take: 10,
      orderBy: { submittedAt: 'desc' },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  ]);

  res.json({
    formId: id,
    jobTitle: form.job.title,
    totalApplications,
    applicationsByStatus: applicationsByStatus.map(item => ({
      status: item.status,
      count: item._count,
    })),
    recentApplications: recentApplications.map(app => ({
      id: app.id,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      email: app.candidate.email,
      status: app.status,
      submittedAt: app.submittedAt,
      score: app.score,
    })),
    conversionRate: totalApplications > 0 ? (totalApplications / 100) * 17.3 : 0, // Mock calculation
    averageCompletionTime: '8.5 minutes', // Mock data
  });
}));

export default router;

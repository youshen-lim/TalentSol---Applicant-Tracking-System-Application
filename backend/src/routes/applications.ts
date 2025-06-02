import express from 'express';
import { prisma } from '../index.js';
import { createApplicationSchema, updateApplicationSchema } from '../types/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Submit application (public endpoint)
router.post('/', asyncHandler(async (req, res) => {
  const validatedData = createApplicationSchema.parse(req.body);

  // Check if job exists and is open for applications
  const job = await prisma.job.findUnique({
    where: { id: validatedData.jobId },
    select: {
      id: true,
      status: true,
      maxApplicants: true,
      currentApplicants: true,
      applicationDeadline: true,
    },
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.status !== 'open') {
    throw new AppError('This job is no longer accepting applications', 400);
  }

  if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
    throw new AppError('Application deadline has passed', 400);
  }

  if (job.maxApplicants && job.currentApplicants >= job.maxApplicants) {
    throw new AppError('Maximum number of applications reached', 400);
  }

  // Check if candidate already applied for this job
  const existingCandidate = await prisma.candidate.findUnique({
    where: { email: validatedData.candidateInfo.email },
  });

  if (existingCandidate) {
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: validatedData.jobId,
        candidateId: existingCandidate.id,
      },
    });

    if (existingApplication) {
      throw new AppError('You have already applied for this position', 409);
    }
  }

  // Create application in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create or update candidate
    const candidate = await tx.candidate.upsert({
      where: { email: validatedData.candidateInfo.email },
      update: {
        firstName: validatedData.candidateInfo.firstName,
        lastName: validatedData.candidateInfo.lastName,
        phone: validatedData.candidateInfo.phone,
        location: validatedData.candidateInfo.location,
        willingToRelocate: validatedData.candidateInfo.willingToRelocate,
        workAuthorization: validatedData.candidateInfo.workAuthorization,
        linkedinUrl: validatedData.candidateInfo.linkedinUrl,
        portfolioUrl: validatedData.candidateInfo.portfolioUrl,
        websiteUrl: validatedData.candidateInfo.websiteUrl,
      },
      create: {
        firstName: validatedData.candidateInfo.firstName,
        lastName: validatedData.candidateInfo.lastName,
        email: validatedData.candidateInfo.email,
        phone: validatedData.candidateInfo.phone,
        location: validatedData.candidateInfo.location,
        willingToRelocate: validatedData.candidateInfo.willingToRelocate,
        workAuthorization: validatedData.candidateInfo.workAuthorization,
        linkedinUrl: validatedData.candidateInfo.linkedinUrl,
        portfolioUrl: validatedData.candidateInfo.portfolioUrl,
        websiteUrl: validatedData.candidateInfo.websiteUrl,
      },
    });

    // Create application
    const application = await tx.application.create({
      data: {
        jobId: validatedData.jobId,
        candidateId: candidate.id,
        status: 'applied',
        submittedAt: new Date(),
        candidateInfo: validatedData.candidateInfo,
        professionalInfo: validatedData.professionalInfo,
        customAnswers: validatedData.customAnswers,
        metadata: validatedData.metadata,
        activity: [
          {
            type: 'application_submitted',
            timestamp: new Date().toISOString(),
            description: 'Application submitted',
          },
        ],
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update job application count
    await tx.job.update({
      where: { id: validatedData.jobId },
      data: {
        currentApplicants: {
          increment: 1,
        },
      },
    });

    return application;
  });

  res.status(201).json({
    message: 'Application submitted successfully',
    application: result,
  });
}));

// Protected routes (require authentication)
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user!.companyId;

  // Get date ranges
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get total applications
  const totalApplications = await prisma.application.count({
    where: {
      job: { companyId },
    },
  });

  // Get new applications (last week)
  const newApplications = await prisma.application.count({
    where: {
      job: { companyId },
      submittedAt: { gte: oneWeekAgo },
    },
  });

  // Get applications by status for conversion rate
  const applicationsByStatus = await prisma.application.groupBy({
    by: ['status'],
    where: {
      job: { companyId },
    },
    _count: true,
  });

  // Calculate conversion rate (non-pending applications / total)
  const nonPendingCount = applicationsByStatus
    .filter(group => group.status !== 'applied')
    .reduce((sum, group) => sum + group._count, 0);
  const conversionRate = totalApplications > 0 ? (nonPendingCount / totalApplications) * 100 : 0;

  // Get average AI score
  const avgScoreResult = await prisma.application.aggregate({
    where: {
      job: { companyId },
      scoring: { not: null },
    },
    _avg: {
      // Note: This would need to be adjusted based on your scoring JSON structure
      // For now, we'll return a mock value
    },
  });

  // Get application sources
  const applicationSources = await prisma.application.groupBy({
    by: ['metadata'],
    where: {
      job: { companyId },
    },
    _count: true,
  });

  // Process sources (this would need to be adjusted based on your metadata structure)
  const sourceStats = [
    { source: 'Company Website', count: Math.floor(totalApplications * 0.43), percentage: 43 },
    { source: 'LinkedIn', count: Math.floor(totalApplications * 0.29), percentage: 29 },
    { source: 'Indeed', count: Math.floor(totalApplications * 0.18), percentage: 18 },
    { source: 'Referrals', count: Math.floor(totalApplications * 0.10), percentage: 10 },
  ];

  // Get recent applications
  const recentApplications = await prisma.application.findMany({
    where: {
      job: { companyId },
    },
    take: 10,
    orderBy: {
      submittedAt: 'desc',
    },
    include: {
      candidate: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      job: {
        select: {
          title: true,
        },
      },
    },
  });

  res.json({
    totalApplications,
    newApplications,
    conversionRate: Math.round(conversionRate * 10) / 10,
    averageScore: 72, // Mock value - would be calculated from scoring data
    applicationsByStatus,
    sourceStats,
    recentApplications: recentApplications.map(app => ({
      id: app.id,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      jobTitle: app.job.title,
      submittedAt: app.submittedAt,
      status: app.status,
      score: 85, // Mock value - would come from scoring data
    })),
  });
}));

// Get all applications for user's company
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const {
    page = '1',
    limit = '10',
    jobId,
    status,
    search,
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

  if (status) {
    where.status = status as string;
  }

  if (search) {
    where.OR = [
      {
        candidate: {
          firstName: { contains: search as string, mode: 'insensitive' },
        },
      },
      {
        candidate: {
          lastName: { contains: search as string, mode: 'insensitive' },
        },
      },
      {
        candidate: {
          email: { contains: search as string, mode: 'insensitive' },
        },
      },
    ];
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            interviews: true,
            documents: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    }),
    prisma.application.count({ where }),
  ]);

  res.json({
    applications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}));

// Get single application
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const application = await prisma.application.findFirst({
    where: {
      id,
      job: {
        companyId: req.user!.companyId,
      },
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          department: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      candidate: true,
      reviewedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      interviews: {
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      documents: true,
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  res.json(application);
}));

// Update application
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const validatedData = updateApplicationSchema.parse(req.body);

  // Check if application exists and belongs to user's company
  const existingApplication = await prisma.application.findFirst({
    where: {
      id,
      job: {
        companyId: req.user!.companyId,
      },
    },
  });

  if (!existingApplication) {
    throw new AppError('Application not found', 404);
  }

  // Prepare update data
  const updateData: any = { ...validatedData };

  // Add review information if status is being updated
  if (validatedData.status && validatedData.status !== existingApplication.status) {
    updateData.reviewedById = req.user!.id;
    updateData.reviewedAt = new Date();

    // Add activity log
    const newActivity = {
      type: 'status_changed',
      timestamp: new Date().toISOString(),
      description: `Status changed from ${existingApplication.status} to ${validatedData.status}`,
      userId: req.user!.id,
    };

    updateData.activity = {
      push: newActivity,
    };
  }

  const application = await prisma.application.update({
    where: { id },
    data: updateData,
    include: {
      job: {
        select: {
          id: true,
          title: true,
          department: true,
        },
      },
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json({
    message: 'Application updated successfully',
    application,
  });
}));

export default router;

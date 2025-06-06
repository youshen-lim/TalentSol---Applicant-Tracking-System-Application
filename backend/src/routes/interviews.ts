import express from 'express';
import { prisma } from '../index.js';
import { createInterviewSchema, updateInterviewSchema } from '../types/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Development authentication bypass middleware for interviews
const devAuthBypass = async (req: AuthenticatedRequest, res: any, next: any) => {
  // Check if we're in development and using demo token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === 'demo-token-for-development' || process.env.NODE_ENV === 'development') {
    // Find the first available company for development
    const firstCompany = await prisma.company.findFirst();
    const companyId = firstCompany ? firstCompany.id : 'comp_1';

    // Set a default admin user for development
    req.user = {
      id: 'dev-admin-user',
      email: 'admin@talentsol.com',
      role: 'admin',
      companyId: companyId,
    };
    next();
  } else {
    // Use normal authentication for production
    authenticateToken(req, res, next);
  }
};

// Apply authentication middleware to all routes
router.use(devAuthBypass);

// Get all interviews for user's company
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const {
    page = '1',
    limit = '10',
    status,
    type,
    date,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    application: {
      job: {
        companyId: req.user!.companyId,
      },
    },
  };

  if (status) {
    where.status = status as string;
  }

  if (type) {
    where.type = type as string;
  }

  if (date) {
    const targetDate = new Date(date as string);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    where.scheduledDate = {
      gte: targetDate,
      lt: nextDay,
    };
  }

  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        application: {
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            job: {
              select: {
                title: true,
                department: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    }),
    prisma.interview.count({ where }),
  ]);

  res.json({
    interviews,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}));

// Get upcoming interviews (next 7 days) - MUST BE BEFORE /:id route
router.get('/upcoming', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user!.companyId;
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingInterviews = await prisma.interview.findMany({
    where: {
      application: {
        job: { companyId },
      },
      scheduledDate: {
        gte: now,
        lte: nextWeek,
      },
      status: 'scheduled',
    },
    include: {
      application: {
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          job: {
            select: {
              title: true,
              department: true,
            },
          },
        },
      },
    },
    orderBy: {
      scheduledDate: 'asc',
    },
  });

  // Transform data to match frontend expectations
  const transformedInterviews = upcomingInterviews.map(interview => ({
    id: interview.id,
    candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
    candidateId: interview.application.candidateId,
    position: interview.application.job.title,
    jobTitle: interview.application.job.title,
    type: interview.type || 'Interview',
    interviewers: interview.interviewers || [],
    dateTime: interview.scheduledDate?.toISOString() || new Date().toISOString(),
    status: interview.status,
    location: interview.location,
    notes: interview.notes,
    application: {
      id: interview.applicationId,
      jobId: interview.application.jobId,
      candidateInfo: {
        firstName: interview.application.candidate.firstName,
        lastName: interview.application.candidate.lastName,
        email: interview.application.candidate.email,
      },
    },
    createdAt: interview.createdAt.toISOString(),
    updatedAt: interview.updatedAt.toISOString(),
  }));

  res.json({
    data: transformedInterviews,
    total: transformedInterviews.length,
  });
}));

// Get single interview
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const interview = await prisma.interview.findFirst({
    where: {
      id,
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    },
    include: {
      application: {
        include: {
          candidate: true,
          job: {
            select: {
              title: true,
              department: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!interview) {
    throw new AppError('Interview not found', 404);
  }

  res.json(interview);
}));

// Create new interview
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = createInterviewSchema.parse(req.body);

  // Check if application exists and belongs to user's company
  const application = await prisma.application.findFirst({
    where: {
      id: validatedData.applicationId,
      job: {
        companyId: req.user!.companyId,
      },
    },
    include: {
      candidate: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      job: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const interview = await prisma.interview.create({
    data: {
      ...validatedData,
      createdById: req.user!.id,
    },
    include: {
      application: {
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          job: {
            select: {
              title: true,
              department: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Update application activity
  await prisma.application.update({
    where: { id: validatedData.applicationId },
    data: {
      activity: {
        push: {
          type: 'interview_scheduled',
          timestamp: new Date().toISOString(),
          description: `Interview "${validatedData.title}" scheduled`,
          userId: req.user!.id,
        },
      },
    },
  });

  res.status(201).json({
    message: 'Interview scheduled successfully',
    interview,
  });
}));



// Update interview
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const validatedData = updateInterviewSchema.parse(req.body);

  // Check if interview exists and belongs to user's company
  const existingInterview = await prisma.interview.findFirst({
    where: {
      id,
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    },
  });

  if (!existingInterview) {
    throw new AppError('Interview not found', 404);
  }

  const interview = await prisma.interview.update({
    where: { id },
    data: validatedData,
    include: {
      application: {
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          job: {
            select: {
              title: true,
              department: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json({
    message: 'Interview updated successfully',
    interview,
  });
}));

// Delete interview
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if interview exists and belongs to user's company
  const existingInterview = await prisma.interview.findFirst({
    where: {
      id,
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    },
  });

  if (!existingInterview) {
    throw new AppError('Interview not found', 404);
  }

  await prisma.interview.delete({
    where: { id },
  });

  res.json({
    message: 'Interview deleted successfully',
  });
}));

export default router;

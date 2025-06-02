import express from 'express';
import { prisma } from '../index.js';
import { createInterviewSchema, updateInterviewSchema } from '../types/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

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

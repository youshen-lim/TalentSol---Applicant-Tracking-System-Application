import express from 'express';
import { prisma } from '../index.js';
import { candidateInfoSchema } from '../types/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all candidates for user's company
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const {
    page = '1',
    limit = '10',
    search,
    stage,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    applications: {
      some: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    },
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        applications: {
          where: {
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
              },
            },
            _count: {
              select: {
                interviews: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.candidate.count({ where }),
  ]);

  res.json({
    candidates,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}));

// Get single candidate
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const candidate = await prisma.candidate.findFirst({
    where: {
      id,
      applications: {
        some: {
          job: {
            companyId: req.user!.companyId,
          },
        },
      },
    },
    include: {
      applications: {
        where: {
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
          reviewedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      },
    },
  });

  if (!candidate) {
    throw new AppError('Candidate not found', 404);
  }

  res.json(candidate);
}));

// Update candidate information
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const validatedData = candidateInfoSchema.partial().parse(req.body);

  // Check if candidate exists and has applications to user's company
  const existingCandidate = await prisma.candidate.findFirst({
    where: {
      id,
      applications: {
        some: {
          job: {
            companyId: req.user!.companyId,
          },
        },
      },
    },
  });

  if (!existingCandidate) {
    throw new AppError('Candidate not found', 404);
  }

  const candidate = await prisma.candidate.update({
    where: { id },
    data: validatedData,
    include: {
      applications: {
        where: {
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
            },
          },
        },
      },
    },
  });

  res.json({
    message: 'Candidate updated successfully',
    candidate,
  });
}));

// Get candidate pipeline/stages summary
router.get('/pipeline/summary', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const stages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
  
  const stageCounts = await Promise.all(
    stages.map(async (stage) => {
      const count = await prisma.application.count({
        where: {
          status: stage,
          job: {
            companyId: req.user!.companyId,
          },
        },
      });
      return { stage, count };
    })
  );

  const totalApplications = await prisma.application.count({
    where: {
      job: {
        companyId: req.user!.companyId,
      },
    },
  });

  const recentApplications = await prisma.application.findMany({
    where: {
      job: {
        companyId: req.user!.companyId,
      },
    },
    take: 10,
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
    orderBy: {
      submittedAt: 'desc',
    },
  });

  res.json({
    stageCounts,
    totalApplications,
    recentApplications,
  });
}));

export default router;

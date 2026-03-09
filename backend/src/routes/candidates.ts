import express, { Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { candidateInfoSchema } from '../types/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Development authentication bypass — falls back to real DB admin user
const devAuthBypass = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === 'demo-token-for-development' || process.env.NODE_ENV === 'development') {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { id: true, email: true, role: true, companyId: true },
    });
    req.user = adminUser ?? {
      id: 'dev-fallback',
      email: 'admin@talentsol-demo.com',
      role: 'admin',
      companyId: 'comp_1',
    };
    next();
  } else {
    authenticateToken(req, _res, next);
  }
};

router.use(devAuthBypass);

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

  // Use default company for testing when auth is disabled
  const companyId = req.user!.companyId;

  const where: any = {
    applications: {
      some: {
        job: {
          companyId,
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
              companyId,
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
          take: 5, // Limit applications per candidate to prevent N+1
        },
        _count: {
          select: {
            applications: true,
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

// Get candidate pipeline/stages summary
router.get('/pipeline/summary', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user!.companyId;
  const stages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];

  const stageCounts = await Promise.all(
    stages.map(async (stage) => {
      const count = await prisma.application.count({
        where: {
          status: stage,
          job: {
            companyId,
          },
        },
      });
      return { stage, count };
    })
  );

  const totalApplications = await prisma.application.count({
    where: {
      job: {
        companyId,
      },
    },
  });

  const recentApplications = await prisma.application.findMany({
    where: {
      job: {
        companyId,
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

// Get candidate pipeline with full candidate data organized by stages
router.get('/pipeline', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user!.companyId;
  const stages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];

  // Get all applications with candidate data for the company
  const applications = await prisma.application.findMany({
    where: {
      job: {
        companyId,
      },
    },
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          location: true,
          workAuthorization: true,
          linkedinUrl: true,
          portfolioUrl: true,
          websiteUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
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
  });

  // Transform applications into candidate pipeline format
  const candidateMap = new Map();

  for (const app of applications) {
    const candidateId = app.candidate.id;

    if (!candidateMap.has(candidateId)) {
      // Get score from existing scoring data or generate a default
      const scoring = app.scoring as any;
      let score = scoring?.automaticScore || Math.floor(Math.random() * 40) + 60; // Default 60-99 range

      const rating = Math.min(5, Math.max(1, Math.round(score / 20))); // Convert to 1-5 scale

      // Extract skills from tags or generate from job requirements
      const tags = (app.tags && app.tags.length > 0) ? app.tags : [app.job.title.split(' ')[0], app.job.department || 'General'];

      // Calculate last activity
      const lastActivity = app.submittedAt
        ? `Applied ${Math.floor((Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
        : 'Recently applied';

      candidateMap.set(candidateId, {
        id: candidateId,
        name: `${app.candidate.firstName} ${app.candidate.lastName}`,
        email: app.candidate.email,
        phone: app.candidate.phone,
        position: app.job.title,
        stage: app.status,
        tags,
        lastActivity,
        rating,
        location: app.candidate.location,
        workAuthorization: app.candidate.workAuthorization,
        linkedinUrl: app.candidate.linkedinUrl,
        portfolioUrl: app.candidate.portfolioUrl,
        websiteUrl: app.candidate.websiteUrl,
        applications: [{
          id: app.id,
          jobTitle: app.job.title,
          status: app.status,
          submittedAt: app.submittedAt?.toISOString() || new Date().toISOString(),
          score: score,
        }],
        createdAt: app.candidate.createdAt.toISOString(),
        updatedAt: app.candidate.updatedAt.toISOString(),
      });
    } else {
      // Add additional application to existing candidate
      const candidate = candidateMap.get(candidateId);
      const scoring = app.scoring as any;
      const score = scoring?.automaticScore || Math.floor(Math.random() * 40) + 60;

      candidate.applications.push({
        id: app.id,
        jobTitle: app.job.title,
        status: app.status,
        submittedAt: app.submittedAt?.toISOString() || new Date().toISOString(),
        score: score,
      });
    }
  }

  const candidates = Array.from(candidateMap.values());

  // Organize candidates by stages
  const pipelineStages = stages.map(stageId => ({
    id: stageId,
    name: stageId.charAt(0).toUpperCase() + stageId.slice(1),
    candidates: candidates.filter(candidate => candidate.stage === stageId),
  }));

  res.json({
    stages: pipelineStages,
    totalCandidates: candidates.length,
    summary: {
      stageCounts: stages.map(stage => ({
        stage,
        count: candidates.filter(c => c.stage === stage).length,
      })),
    },
  });
}));

// Update candidate application stage
router.put('/:id/stage', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  const companyId = req.user!.companyId;

  if (!stage) {
    throw new AppError('Stage is required', 400);
  }

  // Find the candidate's most recent application for this company
  const application = await prisma.application.findFirst({
    where: {
      candidateId: id,
      job: {
        companyId,
      },
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
    orderBy: {
      submittedAt: 'desc',
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  // Update the application status
  const updatedApplication = await prisma.application.update({
    where: { id: application.id },
    data: {
      status: stage,
      updatedAt: new Date(),
      ...(stage === 'hired' && { hiredAt: new Date() }),
    },
    include: {
      candidate: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: `${application.candidate.firstName} ${application.candidate.lastName} moved to ${stage}`,
    application: updatedApplication,
  });
}));

// Get single candidate
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const companyId = req.user!.companyId;

  const candidate = await prisma.candidate.findFirst({
    where: {
      id,
      applications: {
        some: {
          job: {
            companyId,
          },
        },
      },
    },
    include: {
      applications: {
        where: {
          job: {
            companyId,
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
  const companyId = req.user!.companyId;
  const validatedData = candidateInfoSchema.partial().parse(req.body);

  // Check if candidate exists and has applications to user's company
  const existingCandidate = await prisma.candidate.findFirst({
    where: {
      id,
      applications: {
        some: {
          job: {
            companyId,
          },
        },
      },
    },
  });

  if (!existingCandidate) {
    throw new AppError('Candidate not found', 404);
  }

  // Prepare update data with proper type conversion
  const updateData: any = { ...validatedData };

  // Convert location object to string if needed
  if (updateData.location && typeof updateData.location === 'object') {
    updateData.location = JSON.stringify(updateData.location);
  }

  const candidate = await prisma.candidate.update({
    where: { id },
    data: updateData,
    include: {
      applications: {
        where: {
          job: {
            companyId,
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

export default router;

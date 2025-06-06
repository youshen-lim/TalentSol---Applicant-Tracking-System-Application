import express from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../index.js';

const router = express.Router();

// Development authentication bypass middleware for interviews
const devAuthBypass = async (req: AuthenticatedRequest, res: any, next: any) => {
  // Check if we're in development and using demo token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === 'demo-token-for-development' || process.env.NODE_ENV === 'development') {
    // Set a default admin user for development
    req.user = {
      id: 'dev-admin-user',
      email: 'admin@talentsol.com',
      role: 'admin',
      companyId: 'comp_1', // Use hardcoded company ID to avoid database dependency
    };
    next();
  } else {
    // Use normal authentication for production
    authenticateToken(req, res, next);
  }
};

// Apply authentication middleware to all routes
router.use(devAuthBypass);

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

export default router;

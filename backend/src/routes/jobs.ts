import express, { Response } from 'express';
import { prisma } from '../index.js';
import { createJobSchema, updateJobSchema } from '../types/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import {
  sendSuccess,
  sendPaginatedSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendNoContent,
  handleAsyncError
} from '../utils/responseHelpers.js';
import {
  StandardResponse,
  PaginatedResponse,
  JobResponse
} from '../types/api-responses.js';

const router = express.Router();

// Helper function to parse JSON fields in job data with error handling
function parseJobFields(job: any) {
  if (!job) return job;

  // Safe JSON parsing function
  const safeJsonParse = (jsonString: string | null, fallback: any = null) => {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn(`Failed to parse JSON field: ${jsonString}`, error);
      return fallback;
    }
  };

  return {
    ...job,
    location: safeJsonParse(job.location, null),
    salary: safeJsonParse(job.salary, null),
    responsibilities: safeJsonParse(job.responsibilities, []),
    requiredQualifications: safeJsonParse(job.requiredQualifications, []),
    preferredQualifications: safeJsonParse(job.preferredQualifications, []),
    skills: safeJsonParse(job.skills, []),
  };
}

// Get all jobs (public endpoint for job listings, enhanced with optional authentication)
router.get('/', asyncHandler(async (req, res: Response<PaginatedResponse<JobResponse['data']>>) => {
  const {
    page = '1',
    limit = '10',
    search,
    department,
    location,
    employmentType,
    experienceLevel,
    status = 'open',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Check if user is authenticated (optional authentication)
  const authHeader = req.headers.authorization;
  let authenticatedUser: { companyId: string } | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // Simple check for demo token or JWT
      if (token === 'demo-token-for-development' || token.includes('.')) {
        // For demo purposes, assume authenticated user belongs to comp_1
        authenticatedUser = { companyId: 'comp_1' };
      }
    } catch (error) {
      // Ignore authentication errors for this endpoint
    }
  }

  // Build where clause
  const where: any = {};

  if (authenticatedUser) {
    // If authenticated, show all company jobs (including drafts)
    where.companyId = authenticatedUser.companyId;
    // Don't filter by status or visibility for authenticated users
  } else {
    // If not authenticated, only show public open jobs
    where.status = status as string;
    where.visibility = 'public';
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { department: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (department) {
    where.department = department as string;
  }

  if (employmentType) {
    where.employmentType = employmentType as string;
  }

  if (experienceLevel) {
    where.experienceLevel = experienceLevel as string;
  }

  // Get jobs with pagination
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        postedDate: 'desc',
      },
    }),
    prisma.job.count({ where }),
  ]);

  res.json({
    success: true,
    data: jobs.map(parseJobFields),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
    timestamp: new Date().toISOString()
  });
}));

// Get single job by ID (public)
router.get('/:id', asyncHandler(async (req, res: Response<JobResponse>) => {
  const { id } = req.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Only show public jobs for unauthenticated requests
  if (job.visibility !== 'public') {
    throw new AppError('Job not found', 404);
  }

  res.json(parseJobFields(job));
}));

// Protected routes (require authentication)
router.use(authenticateToken);

// Get all jobs for authenticated user's company
router.get('/company/all', asyncHandler(async (req: AuthenticatedRequest, res: Response<PaginatedResponse<JobResponse['data']>>) => {
  const {
    page = '1',
    limit = '10',
    search,
    department,
    status,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    companyId: req.user!.companyId,
  };

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (department) {
    where.department = department as string;
  }

  if (status) {
    where.status = status as string;
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
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
    prisma.job.count({ where }),
  ]);

  res.json({
    success: true,
    data: jobs.map(parseJobFields),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
    timestamp: new Date().toISOString()
  });
}));

// Create new job
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response<JobResponse>) => {
  const validatedData = createJobSchema.parse(req.body);

  // Serialize complex fields to JSON strings for database storage
  const jobData = {
    ...validatedData,
    location: validatedData.location ? JSON.stringify(validatedData.location) : null,
    salary: validatedData.salary ? JSON.stringify(validatedData.salary) : null,
    responsibilities: JSON.stringify(validatedData.responsibilities || []),
    requiredQualifications: JSON.stringify(validatedData.requiredQualifications || []),
    preferredQualifications: JSON.stringify(validatedData.preferredQualifications || []),
    skills: JSON.stringify(validatedData.skills || []),
    createdById: req.user!.id,
    companyId: req.user!.companyId,
    postedDate: validatedData.status === 'open' ? new Date() : null,
  };

  const job = await prisma.job.create({
    data: jobData,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: parseJobFields(job),
    message: 'Job created successfully',
    timestamp: new Date().toISOString()
  });
}));

// Update job
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response<JobResponse>) => {
  const { id } = req.params;
  const validatedData = updateJobSchema.parse(req.body);

  // Check if job exists and belongs to user's company
  const existingJob = await prisma.job.findFirst({
    where: {
      id,
      companyId: req.user!.companyId,
    },
  });

  if (!existingJob) {
    throw new AppError('Job not found', 404);
  }

  // Serialize complex fields to JSON strings for database storage
  const updateData: any = { ...validatedData };

  // Only serialize fields that are being updated
  if (validatedData.location !== undefined) {
    updateData.location = validatedData.location ? JSON.stringify(validatedData.location) : null;
  }
  if (validatedData.salary !== undefined) {
    updateData.salary = validatedData.salary ? JSON.stringify(validatedData.salary) : null;
  }
  if (validatedData.responsibilities !== undefined) {
    updateData.responsibilities = JSON.stringify(validatedData.responsibilities || []);
  }
  if (validatedData.requiredQualifications !== undefined) {
    updateData.requiredQualifications = JSON.stringify(validatedData.requiredQualifications || []);
  }
  if (validatedData.preferredQualifications !== undefined) {
    updateData.preferredQualifications = JSON.stringify(validatedData.preferredQualifications || []);
  }
  if (validatedData.skills !== undefined) {
    updateData.skills = JSON.stringify(validatedData.skills || []);
  }

  // Set posted date if status is changing to open
  if (validatedData.status === 'open' && existingJob.status !== 'open') {
    updateData.postedDate = new Date();
  }

  const job = await prisma.job.update({
    where: { id },
    data: updateData,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: parseJobFields(job),
    message: 'Job updated successfully',
    timestamp: new Date().toISOString()
  });
}));

// Delete job
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response<StandardResponse>) => {
  const { id } = req.params;

  // Check if job exists and belongs to user's company
  const existingJob = await prisma.job.findFirst({
    where: {
      id,
      companyId: req.user!.companyId,
    },
  });

  if (!existingJob) {
    throw new AppError('Job not found', 404);
  }

  await prisma.job.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Job deleted successfully',
    timestamp: new Date().toISOString()
  });
}));

export default router;

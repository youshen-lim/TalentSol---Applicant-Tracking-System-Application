import express, { Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../index.js';
import {
  sendSuccess,
  sendPaginatedSuccess,
  sendNotFound,
} from '../utils/responseHelpers.js';
import { InterviewController } from '../controllers/interviewController.js';

const router = express.Router();

// Development authentication bypass middleware for interviews
const devAuthBypass = async (req: AuthenticatedRequest, res: any, next: any) => {
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
    authenticateToken(req, res, next);
  }
};

router.use(devAuthBypass);

// Shared transform helper — converts Prisma interview row to API shape
const transformInterview = (interview: any) => ({
  id: interview.id,
  title: interview.title,
  candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
  candidateId: interview.application.candidateId,
  position: interview.application.job.title,
  jobTitle: interview.application.job.title,
  type: interview.type || 'Interview',
  interviewers: (() => {
    if (!interview.interviewers) return [];
    if (Array.isArray(interview.interviewers)) return interview.interviewers;
    try { return JSON.parse(interview.interviewers); } catch { return [interview.interviewers]; }
  })(),
  dateTime: interview.scheduledDate?.toISOString() || new Date().toISOString(),
  startTime: interview.startTime || null,
  endTime: interview.endTime || null,
  status: interview.status,
  location: interview.location || null,
  meetingLink: interview.meetingLink || null,
  notes: interview.notes || null,
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
});

// Standard include for all interview queries
const interviewInclude = {
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
          id: true,
        },
      },
    },
  },
} as const;

// ─── GET /upcoming — MUST be before /:id ────────────────────────────────────
router.get('/upcoming', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingInterviews = await prisma.interview.findMany({
    where: {
      application: { job: { companyId } },
      scheduledDate: { gte: now, lte: nextWeek },
      status: 'scheduled',
    },
    include: interviewInclude,
    orderBy: { scheduledDate: 'asc' },
  });

  return sendSuccess(res, upcomingInterviews.map(transformInterview), 'Upcoming interviews retrieved successfully');
}));

// ─── POST /bulk-operations — MUST be before /:id ────────────────────────────
router.post('/bulk-operations', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const { operation, interviewIds, data } = req.body;

  // Validate operation
  const validOperations = ['reschedule', 'cancel', 'send_reminder', 'delete', 'update_status', 'assign_interviewer'];
  if (!operation || !validOperations.includes(operation)) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: { operation: `Must be one of: ${validOperations.join(', ')}` },
    });
  }

  // Validate interviewIds
  if (!Array.isArray(interviewIds) || interviewIds.length === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: { interviewIds: 'Must be a non-empty array' },
    });
  }
  if (interviewIds.length > 100) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: { interviewIds: 'Cannot exceed 100 interviews per bulk operation' },
    });
  }

  // Verify all interviews belong to this company
  const interviews = await prisma.interview.findMany({
    where: {
      id: { in: interviewIds },
      application: { job: { companyId } },
    },
    select: { id: true },
  });
  const foundIds = new Set(interviews.map(i => i.id));
  const invalidIds = interviewIds.filter(id => !foundIds.has(id));
  if (invalidIds.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: { interviewIds: `Some interview IDs not found or not accessible: ${invalidIds.join(', ')}` },
    });
  }

  // Execute operation
  const results: Array<{ id: string; success: boolean; error?: string }> = [];

  await Promise.allSettled(
    interviewIds.map(async (id: string) => {
      try {
        if (operation === 'reschedule') {
          await prisma.interview.update({
            where: { id },
            data: {
              ...(data?.newDate && { scheduledDate: new Date(data.newDate) }),
              ...(data?.newTime && { startTime: data.newTime }),
            },
          });
        } else if (operation === 'cancel') {
          await prisma.interview.update({
            where: { id },
            data: { status: 'cancelled' },
          });
        } else if (operation === 'send_reminder') {
          // No-op in dev: log intent
          console.log(`[bulk-ops] send_reminder for interview ${id}`, data?.message);
        } else if (operation === 'delete') {
          await prisma.interview.delete({ where: { id } });
        } else if (operation === 'update_status') {
          if (!data?.status) throw new Error('status is required for update_status');
          await prisma.interview.update({
            where: { id },
            data: { status: data.status },
          });
        } else if (operation === 'assign_interviewer') {
          const existing = await prisma.interview.findUnique({ where: { id }, select: { interviewers: true } });
          let currentList: string[] = [];
          if (existing?.interviewers) {
            try { currentList = JSON.parse(existing.interviewers as string); } catch { currentList = []; }
          }
          const newName = data?.interviewerName;
          if (newName && !currentList.includes(newName)) currentList.push(newName);
          await prisma.interview.update({
            where: { id },
            data: { interviewers: JSON.stringify(currentList) },
          });
        }
        results.push({ id, success: true });
      } catch (err) {
        results.push({ id, success: false, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    })
  );

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const errors = results.filter(r => !r.success).map(r => ({ id: r.id, reason: r.error }));

  if (succeeded === 0) {
    return res.status(400).json({ error: 'All operations failed', affected: 0, failed, errors });
  }

  const statusCode = failed > 0 ? 207 : 200;
  return res.status(statusCode).json({
    success: true,
    affected: succeeded,
    failed,
    errors: errors.length > 0 ? errors : undefined,
    message: failed > 0 ? `${succeeded} succeeded, ${failed} failed` : `${succeeded} interview(s) updated`,
  });
}));

// ─── GET / — list with pagination ───────────────────────────────────────────
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const { status, type, startDate, endDate } = req.query;

  const where: any = { application: { job: { companyId } } };
  if (status) where.status = status;
  if (type) where.type = type;
  if (startDate || endDate) {
    where.scheduledDate = {};
    if (startDate) where.scheduledDate.gte = new Date(startDate as string);
    if (endDate) where.scheduledDate.lte = new Date(endDate as string);
  }

  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      where,
      include: interviewInclude,
      orderBy: { scheduledDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.interview.count({ where }),
  ]);

  return sendPaginatedSuccess(
    res,
    interviews.map(transformInterview),
    { page, limit, total }
  );
}));

// ─── GET /:id — single interview ────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const { id } = req.params;

  const interview = await prisma.interview.findFirst({
    where: { id, application: { job: { companyId } } },
    include: interviewInclude,
  });

  if (!interview) {
    return sendNotFound(res, 'Interview not found');
  }

  return sendSuccess(res, transformInterview(interview), 'Interview retrieved successfully');
}));

// ─── POST / — create interview ───────────────────────────────────────────────
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const { applicationId, title, type, scheduledDate, startTime, endTime, location, meetingLink, interviewers, notes } = req.body;

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (!applicationId) fieldErrors.applicationId = 'required';
  if (!title || !title.trim()) fieldErrors.title = 'required';
  if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) fieldErrors.startTime = 'Must be HH:MM format';
  if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) fieldErrors.endTime = 'Must be HH:MM format';
  if (startTime && endTime && startTime >= endTime) fieldErrors.endTime = 'End time must be after start time';
  if (scheduledDate && isNaN(Date.parse(scheduledDate))) fieldErrors.scheduledDate = 'Must be a valid ISO 8601 datetime string';

  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', fields: fieldErrors });
  }

  // Verify application belongs to company
  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId } },
  });
  if (!application) {
    return res.status(400).json({ error: 'Invalid applicationId', fields: { applicationId: 'Application not found or not accessible' } });
  }

  const interview = await prisma.interview.create({
    data: {
      applicationId,
      title: title.trim(),
      type: type || null,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      startTime: startTime || null,
      endTime: endTime || null,
      location: location || null,
      meetingLink: meetingLink || null,
      interviewers: interviewers ? JSON.stringify(interviewers) : null,
      notes: notes || null,
      status: 'scheduled',
      createdById: req.user!.id,
    },
    include: interviewInclude,
  });

  return res.status(201).json({
    success: true,
    data: transformInterview(interview),
    message: 'Interview scheduled successfully',
  });
}));

// ─── PUT /:id — update interview ─────────────────────────────────────────────
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const { id } = req.params;
  const { title, type, scheduledDate, startTime, endTime, location, meetingLink, interviewers, notes, status } = req.body;

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) fieldErrors.startTime = 'Must be HH:MM format';
  if (endTime && !/^\d{2}:\d{2}$/.test(endTime)) fieldErrors.endTime = 'Must be HH:MM format';
  if (startTime && endTime && startTime >= endTime) fieldErrors.endTime = 'End time must be after start time';
  if (scheduledDate && isNaN(Date.parse(scheduledDate))) fieldErrors.scheduledDate = 'Must be a valid ISO 8601 datetime string';

  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', fields: fieldErrors });
  }

  const existing = await prisma.interview.findFirst({
    where: { id, application: { job: { companyId } } },
    select: { id: true, scheduledDate: true },
  });
  if (!existing) {
    return sendNotFound(res, 'Interview not found');
  }

  const dateChanged = scheduledDate && existing.scheduledDate?.toISOString() !== new Date(scheduledDate).toISOString();
  if (dateChanged) {
    console.log(`[interview] Reschedule detected: ${id} from ${existing.scheduledDate?.toISOString()} to ${scheduledDate}`);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title.trim();
  if (type !== undefined) updateData.type = type;
  if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
  if (startTime !== undefined) updateData.startTime = startTime;
  if (endTime !== undefined) updateData.endTime = endTime;
  if (location !== undefined) updateData.location = location;
  if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
  if (interviewers !== undefined) updateData.interviewers = JSON.stringify(interviewers);
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) updateData.status = status;

  const interview = await prisma.interview.update({
    where: { id },
    data: updateData,
    include: interviewInclude,
  });

  return sendSuccess(res, transformInterview(interview), 'Interview updated successfully');
}));

// ─── DELETE /:id — soft cancel ───────────────────────────────────────────────
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user!.companyId;
  const { id } = req.params;

  const existing = await prisma.interview.findFirst({
    where: { id, application: { job: { companyId } } },
    select: { id: true },
  });
  if (!existing) {
    return sendNotFound(res, 'Interview not found');
  }

  await prisma.interview.update({
    where: { id },
    data: { status: 'cancelled' },
  });

  return sendSuccess(res, null, 'Interview cancelled successfully');
}));

export default router;

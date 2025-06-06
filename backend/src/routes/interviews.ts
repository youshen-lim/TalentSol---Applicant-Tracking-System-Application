import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { InterviewController } from '../controllers/interviewController.js';
import { BulkInterviewController } from '../controllers/bulkInterviewController.js';
import {
  validateInterviewData,
  validateBulkOperation,
  generalLimiter,
  bulkOperationLimiter,
  emailLimiter
} from '../middleware/security.js';

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

  // Send real-time notification and email
  try {
    // Prepare interview data for notifications
    const interviewData = {
      interviewId: interview.id,
      candidateEmail: interview.application.candidate.email,
      candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
      interviewTitle: interview.title,
      scheduledDate: interview.scheduledDate || new Date(),
      location: interview.location,
      meetingLink: interview.meetingLink,
      interviewers: interview.interviewers ? JSON.parse(interview.interviewers) : [],
      jobTitle: interview.application.job.title,
      companyName: 'TalentSol' // You might want to get this from the company table
    };

    // Send confirmation email to candidate
    await notificationService.sendInterviewConfirmation(interviewData);

    // Schedule automatic reminders
    if (interview.scheduledDate) {
      const scheduledDate = new Date(interview.scheduledDate);
      const dayBefore = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000);
      const hourBefore = new Date(scheduledDate.getTime() - 60 * 60 * 1000);

      // Schedule reminders
      await schedulerService.scheduleInterviewReminder(interview.id, dayBefore, 'day_before');
      await schedulerService.scheduleInterviewReminder(interview.id, hourBefore, 'hour_before');
    }

    // Broadcast real-time update
    webSocketServer.broadcastInterviewUpdate(req.user!.companyId, {
      type: 'interview_created',
      interview: interview,
      companyId: req.user!.companyId
    });

  } catch (notificationError) {
    console.error('Error sending interview notifications:', notificationError);
    // Don't fail the request if notifications fail
  }

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

  // Handle notifications for interview updates
  try {
    // Check if the scheduled date changed (reschedule)
    if (validatedData.scheduledDate && existingInterview.scheduledDate !== validatedData.scheduledDate) {
      const interviewData = {
        interviewId: interview.id,
        candidateEmail: interview.application.candidate.email,
        candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
        interviewTitle: interview.title,
        scheduledDate: existingInterview.scheduledDate || new Date(),
        location: interview.location,
        meetingLink: interview.meetingLink,
        interviewers: interview.interviewers ? JSON.parse(interview.interviewers) : [],
        jobTitle: interview.application.job.title,
        companyName: 'TalentSol'
      };

      // Send reschedule notification
      await notificationService.sendInterviewReschedule(
        interviewData,
        new Date(validatedData.scheduledDate),
        'Interview time has been updated'
      );

      // Cancel old reminders and schedule new ones
      await schedulerService.cancelInterviewReminders(interview.id);

      const newScheduledDate = new Date(validatedData.scheduledDate);
      const dayBefore = new Date(newScheduledDate.getTime() - 24 * 60 * 60 * 1000);
      const hourBefore = new Date(newScheduledDate.getTime() - 60 * 60 * 1000);

      await schedulerService.scheduleInterviewReminder(interview.id, dayBefore, 'day_before');
      await schedulerService.scheduleInterviewReminder(interview.id, hourBefore, 'hour_before');
    }

    // Broadcast real-time update
    webSocketServer.broadcastInterviewUpdate(req.user!.companyId, {
      type: 'interview_updated',
      interview: interview,
      companyId: req.user!.companyId
    });

  } catch (notificationError) {
    console.error('Error sending interview update notifications:', notificationError);
  }

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
            },
          },
        },
      },
    },
  });

  if (!existingInterview) {
    throw new AppError('Interview not found', 404);
  }

  // Send cancellation notification before deleting
  try {
    const interviewData = {
      interviewId: existingInterview.id,
      candidateEmail: existingInterview.application.candidate.email,
      candidateName: `${existingInterview.application.candidate.firstName} ${existingInterview.application.candidate.lastName}`,
      interviewTitle: existingInterview.title,
      scheduledDate: existingInterview.scheduledDate || new Date(),
      location: existingInterview.location,
      meetingLink: existingInterview.meetingLink,
      interviewers: existingInterview.interviewers ? JSON.parse(existingInterview.interviewers) : [],
      jobTitle: existingInterview.application.job.title,
      companyName: 'TalentSol'
    };

    // Send cancellation email
    await notificationService.sendInterviewCancellation(interviewData, 'Interview has been cancelled');

    // Cancel all scheduled reminders
    await schedulerService.cancelInterviewReminders(id);

    // Broadcast real-time update
    webSocketServer.broadcastInterviewUpdate(req.user!.companyId, {
      type: 'interview_cancelled',
      interview: existingInterview,
      companyId: req.user!.companyId
    });

  } catch (notificationError) {
    console.error('Error sending interview cancellation notifications:', notificationError);
  }

  await prisma.interview.delete({
    where: { id },
  });

  res.json({
    message: 'Interview deleted successfully',
  });
}));

// POST /api/interviews/bulk-operations - Bulk operations
router.post('/bulk-operations', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { operation, interviewIds, data } = req.body;

  if (!operation || !interviewIds || !Array.isArray(interviewIds)) {
    throw new AppError('Invalid bulk operation request', 400);
  }

  // Validate that all interviews belong to user's company
  const interviews = await prisma.interview.findMany({
    where: {
      id: { in: interviewIds },
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
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
            },
          },
        },
      },
    },
  });

  if (interviews.length !== interviewIds.length) {
    throw new AppError('Some interviews not found or access denied', 404);
  }

  let result;

  switch (operation) {
    case 'reschedule':
      const { newDate, newTime } = data;
      if (!newDate || !newTime) {
        throw new AppError('New date and time are required for rescheduling', 400);
      }

      // Update all interviews with new date/time
      result = await prisma.interview.updateMany({
        where: {
          id: { in: interviewIds },
        },
        data: {
          scheduledDate: new Date(newDate),
          startTime: newTime,
        },
      });

      // Send notifications for each interview
      for (const interview of interviews) {
        try {
          const interviewData = {
            interviewId: interview.id,
            candidateEmail: interview.application.candidate.email,
            candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
            interviewTitle: interview.title,
            scheduledDate: new Date(newDate),
            location: interview.location,
            meetingLink: interview.meetingLink,
            interviewers: interview.interviewers ? JSON.parse(interview.interviewers) : [],
            jobTitle: interview.application.job.title,
            companyName: 'TalentSol'
          };

          await notificationService.sendInterviewReschedule(
            interviewData,
            new Date(newDate),
            'Interview has been rescheduled'
          );
        } catch (notificationError) {
          console.error('Error sending reschedule notification:', notificationError);
        }
      }
      break;

    case 'cancel':
      const { reason } = data;

      // Update all interviews to cancelled status
      result = await prisma.interview.updateMany({
        where: {
          id: { in: interviewIds },
        },
        data: {
          status: 'cancelled',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
        },
      });

      // Send cancellation notifications
      for (const interview of interviews) {
        try {
          const interviewData = {
            interviewId: interview.id,
            candidateEmail: interview.application.candidate.email,
            candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
            interviewTitle: interview.title,
            scheduledDate: interview.scheduledDate || new Date(),
            location: interview.location,
            meetingLink: interview.meetingLink,
            interviewers: interview.interviewers ? JSON.parse(interview.interviewers) : [],
            jobTitle: interview.application.job.title,
            companyName: 'TalentSol'
          };

          await notificationService.sendInterviewCancellation(interviewData, reason || 'Interview cancelled');
          await schedulerService.cancelInterviewReminders(interview.id);
        } catch (notificationError) {
          console.error('Error sending cancellation notification:', notificationError);
        }
      }
      break;

    case 'send_reminder':
      const { message } = data;

      // Send reminder emails
      for (const interview of interviews) {
        try {
          const interviewData = {
            interviewId: interview.id,
            candidateEmail: interview.application.candidate.email,
            candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
            interviewTitle: interview.title,
            scheduledDate: interview.scheduledDate || new Date(),
            location: interview.location,
            meetingLink: interview.meetingLink,
            interviewers: interview.interviewers ? JSON.parse(interview.interviewers) : [],
            jobTitle: interview.application.job.title,
            companyName: 'TalentSol'
          };

          await notificationService.sendInterviewReminder(interviewData, message || 'Interview reminder');
        } catch (notificationError) {
          console.error('Error sending reminder:', notificationError);
        }
      }

      result = { remindersSent: interviews.length };
      break;

    case 'delete':
      // Send cancellation notifications before deletion
      for (const interview of interviews) {
        try {
          const interviewData = {
            interviewId: interview.id,
            candidateEmail: interview.application.candidate.email,
            candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
            interviewTitle: interview.title,
            scheduledDate: interview.scheduledDate || new Date(),
            location: interview.location,
            meetingLink: interview.meetingLink,
            interviewers: interview.interviewers ? JSON.parse(interview.interviewers) : [],
            jobTitle: interview.application.job.title,
            companyName: 'TalentSol'
          };

          await notificationService.sendInterviewCancellation(interviewData, 'Interview has been cancelled');
          await schedulerService.cancelInterviewReminders(interview.id);
        } catch (notificationError) {
          console.error('Error sending cancellation notification:', notificationError);
        }
      }

      result = await prisma.interview.deleteMany({
        where: {
          id: { in: interviewIds },
        },
      });
      break;

    case 'update_status':
      const { status } = data;
      if (!status) {
        throw new AppError('Status is required for status update', 400);
      }

      result = await prisma.interview.updateMany({
        where: {
          id: { in: interviewIds },
        },
        data: {
          status,
        },
      });
      break;

    case 'assign_interviewer':
      const { interviewerId, interviewerName } = data;
      if (!interviewerId || !interviewerName) {
        throw new AppError('Interviewer ID and name are required', 400);
      }

      result = await prisma.interview.updateMany({
        where: {
          id: { in: interviewIds },
        },
        data: {
          interviewers: JSON.stringify([interviewerName]),
        },
      });
      break;

    default:
      throw new AppError('Invalid bulk operation', 400);
  }

  // Broadcast real-time updates
  try {
    webSocketServer.broadcastInterviewUpdate(req.user!.companyId, {
      type: `bulk_${operation}`,
      interviewIds,
      companyId: req.user!.companyId,
      operation,
      data
    });
  } catch (broadcastError) {
    console.error('Error broadcasting bulk operation:', broadcastError);
  }

  res.json({
    message: `Bulk ${operation} completed successfully`,
    result,
    affectedCount: interviewIds.length,
  });
}));

export default router;

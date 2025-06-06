import { Response } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { notificationService } from '../services/notificationService.js';
import { webSocketServer } from '../websocket/server.js';
import { schedulerService } from '../services/schedulerService.js';
import { createInterviewSchema, updateInterviewSchema } from '../types/validation.js';

export class InterviewController {
  // Get all interviews for company
  static async getInterviews(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    };

    // Add filters
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(startDate as string);
      if (endDate) where.scheduledDate.lte = new Date(endDate as string);
    }

    try {
      const [interviews, total] = await Promise.all([
        prisma.interview.findMany({
          where,
          skip,
          take,
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
        message: 'Interviews retrieved successfully',
        interviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      throw new AppError('Failed to retrieve interviews', 500);
    }
  }

  // Get single interview
  static async getInterview(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
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
              candidate: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
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
          reminders: true,
        },
      });

      if (!interview) {
        throw new AppError('Interview not found', 404);
      }

      res.json({
        message: 'Interview retrieved successfully',
        interview,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to retrieve interview', 500);
    }
  }

  // Create new interview
  static async createInterview(req: AuthenticatedRequest, res: Response) {
    const validatedData = createInterviewSchema.parse(req.body);

    try {
      // Verify application belongs to user's company
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
        throw new AppError('Application not found or access denied', 404);
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

      // Send notifications asynchronously
      setImmediate(async () => {
        try {
          await InterviewController.sendInterviewNotifications(interview, 'created');
        } catch (notificationError) {
          console.error('Error sending interview notifications:', notificationError);
        }
      });

      res.status(201).json({
        message: 'Interview scheduled successfully',
        interview,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create interview', 500);
    }
  }

  // Update interview
  static async updateInterview(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const validatedData = updateInterviewSchema.parse(req.body);

    try {
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
      setImmediate(async () => {
        try {
          if (validatedData.scheduledDate && existingInterview.scheduledDate !== validatedData.scheduledDate) {
            await InterviewController.handleRescheduleNotifications(interview, existingInterview);
          }
          await InterviewController.broadcastUpdate(req.user!.companyId, 'interview_updated', interview);
        } catch (notificationError) {
          console.error('Error sending interview update notifications:', notificationError);
        }
      });

      res.json({
        message: 'Interview updated successfully',
        interview,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update interview', 500);
    }
  }

  // Delete interview
  static async deleteInterview(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
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
      setImmediate(async () => {
        try {
          await InterviewController.sendCancellationNotifications(existingInterview);
          await schedulerService.cancelInterviewReminders(id);
          await InterviewController.broadcastUpdate(req.user!.companyId, 'interview_cancelled', existingInterview);
        } catch (notificationError) {
          console.error('Error sending interview cancellation notifications:', notificationError);
        }
      });

      await prisma.interview.delete({
        where: { id },
      });

      res.json({
        message: 'Interview deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete interview', 500);
    }
  }

  // Helper methods
  private static async sendInterviewNotifications(interview: any, action: string) {
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

    if (action === 'created') {
      await notificationService.sendInterviewConfirmation(interviewData);
      
      if (interview.scheduledDate) {
        const scheduledDate = new Date(interview.scheduledDate);
        const dayBefore = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000);
        const hourBefore = new Date(scheduledDate.getTime() - 60 * 60 * 1000);

        await schedulerService.scheduleInterviewReminder(interview.id, dayBefore, 'day_before');
        await schedulerService.scheduleInterviewReminder(interview.id, hourBefore, 'hour_before');
      }
    }
  }

  private static async handleRescheduleNotifications(interview: any, existingInterview: any) {
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

    await notificationService.sendInterviewReschedule(
      interviewData,
      new Date(interview.scheduledDate),
      'Interview time has been updated'
    );

    await schedulerService.cancelInterviewReminders(interview.id);
    
    const newScheduledDate = new Date(interview.scheduledDate);
    const dayBefore = new Date(newScheduledDate.getTime() - 24 * 60 * 60 * 1000);
    const hourBefore = new Date(newScheduledDate.getTime() - 60 * 60 * 1000);

    await schedulerService.scheduleInterviewReminder(interview.id, dayBefore, 'day_before');
    await schedulerService.scheduleInterviewReminder(interview.id, hourBefore, 'hour_before');
  }

  private static async sendCancellationNotifications(interview: any) {
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
  }

  private static async broadcastUpdate(companyId: string, type: string, interview: any) {
    webSocketServer.broadcastInterviewUpdate(companyId, {
      type,
      interview,
      companyId
    });
  }
}

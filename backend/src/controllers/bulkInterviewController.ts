import { Response } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { notificationService } from '../services/notificationService.js';
import { webSocketServer } from '../websocket/server.js';
import { schedulerService } from '../services/schedulerService.js';

export class BulkInterviewController {
  // Bulk operations handler
  static async bulkOperations(req: AuthenticatedRequest, res: Response) {
    const { operation, interviewIds, data } = req.body;

    if (!operation || !interviewIds || !Array.isArray(interviewIds)) {
      throw new AppError('Invalid bulk operation request', 400);
    }

    try {
      // Validate that all interviews belong to user's company
      const interviews = await BulkInterviewController.validateInterviews(interviewIds, req.user!.companyId);

      let result;

      switch (operation) {
        case 'reschedule':
          result = await BulkInterviewController.bulkReschedule(interviews, data, req.user!.companyId);
          break;
        case 'cancel':
          result = await BulkInterviewController.bulkCancel(interviews, data, req.user!.companyId);
          break;
        case 'send_reminder':
          result = await BulkInterviewController.bulkSendReminder(interviews, data);
          break;
        case 'delete':
          result = await BulkInterviewController.bulkDelete(interviews, req.user!.companyId);
          break;
        case 'update_status':
          result = await BulkInterviewController.bulkUpdateStatus(interviews, data);
          break;
        case 'assign_interviewer':
          result = await BulkInterviewController.bulkAssignInterviewer(interviews, data);
          break;
        default:
          throw new AppError('Invalid bulk operation', 400);
      }

      // Broadcast real-time updates
      setImmediate(() => {
        BulkInterviewController.broadcastBulkUpdate(req.user!.companyId, operation, interviewIds, data);
      });

      res.json({
        message: `Bulk ${operation} completed successfully`,
        result,
        affectedCount: interviewIds.length,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to perform bulk ${operation}`, 500);
    }
  }

  // Validate interviews belong to company
  private static async validateInterviews(interviewIds: string[], companyId: string) {
    const interviews = await prisma.interview.findMany({
      where: {
        id: { in: interviewIds },
        application: {
          job: {
            companyId,
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

    return interviews;
  }

  // Bulk reschedule
  private static async bulkReschedule(interviews: any[], data: any, companyId: string) {
    const { newDate, newTime } = data;
    if (!newDate || !newTime) {
      throw new AppError('New date and time are required for rescheduling', 400);
    }

    const interviewIds = interviews.map(i => i.id);

    // Update all interviews with new date/time
    const result = await prisma.interview.updateMany({
      where: {
        id: { in: interviewIds },
      },
      data: {
        scheduledDate: new Date(newDate),
        startTime: newTime,
      },
    });

    // Send notifications in batches to avoid overwhelming the email service
    const batchSize = 5;
    for (let i = 0; i < interviews.length; i += batchSize) {
      const batch = interviews.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (interview) => {
          try {
            const interviewData = BulkInterviewController.buildInterviewData(interview);
            await notificationService.sendInterviewReschedule(
              interviewData,
              new Date(newDate),
              'Interview has been rescheduled'
            );
          } catch (error) {
            console.error(`Error sending reschedule notification for interview ${interview.id}:`, error);
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < interviews.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return result;
  }

  // Bulk cancel
  private static async bulkCancel(interviews: any[], data: any, companyId: string) {
    const { reason } = data;
    const interviewIds = interviews.map(i => i.id);
    
    // Update all interviews to cancelled status
    const result = await prisma.interview.updateMany({
      where: {
        id: { in: interviewIds },
      },
      data: {
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      },
    });

    // Send cancellation notifications in batches
    const batchSize = 5;
    for (let i = 0; i < interviews.length; i += batchSize) {
      const batch = interviews.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (interview) => {
          try {
            const interviewData = BulkInterviewController.buildInterviewData(interview);
            await notificationService.sendInterviewCancellation(interviewData, reason || 'Interview cancelled');
            await schedulerService.cancelInterviewReminders(interview.id);
          } catch (error) {
            console.error(`Error sending cancellation notification for interview ${interview.id}:`, error);
          }
        })
      );

      if (i + batchSize < interviews.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return result;
  }

  // Bulk send reminder
  private static async bulkSendReminder(interviews: any[], data: any) {
    const { message } = data;
    
    // Send reminder emails in batches
    const batchSize = 5;
    let successCount = 0;

    for (let i = 0; i < interviews.length; i += batchSize) {
      const batch = interviews.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(async (interview) => {
          const interviewData = BulkInterviewController.buildInterviewData(interview);
          await notificationService.sendInterviewReminder(interviewData, message || 'Interview reminder');
        })
      );

      successCount += results.filter(r => r.status === 'fulfilled').length;

      if (i + batchSize < interviews.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return { remindersSent: successCount };
  }

  // Bulk delete
  private static async bulkDelete(interviews: any[], companyId: string) {
    const interviewIds = interviews.map(i => i.id);

    // Send cancellation notifications before deletion in batches
    const batchSize = 5;
    for (let i = 0; i < interviews.length; i += batchSize) {
      const batch = interviews.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (interview) => {
          try {
            const interviewData = BulkInterviewController.buildInterviewData(interview);
            await notificationService.sendInterviewCancellation(interviewData, 'Interview has been cancelled');
            await schedulerService.cancelInterviewReminders(interview.id);
          } catch (error) {
            console.error(`Error sending cancellation notification for interview ${interview.id}:`, error);
          }
        })
      );

      if (i + batchSize < interviews.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const result = await prisma.interview.deleteMany({
      where: {
        id: { in: interviewIds },
      },
    });

    return result;
  }

  // Bulk update status
  private static async bulkUpdateStatus(interviews: any[], data: any) {
    const { status } = data;
    if (!status) {
      throw new AppError('Status is required for status update', 400);
    }

    const interviewIds = interviews.map(i => i.id);

    const result = await prisma.interview.updateMany({
      where: {
        id: { in: interviewIds },
      },
      data: {
        status,
      },
    });

    return result;
  }

  // Bulk assign interviewer
  private static async bulkAssignInterviewer(interviews: any[], data: any) {
    const { interviewerId, interviewerName } = data;
    if (!interviewerId || !interviewerName) {
      throw new AppError('Interviewer ID and name are required', 400);
    }

    const interviewIds = interviews.map(i => i.id);

    const result = await prisma.interview.updateMany({
      where: {
        id: { in: interviewIds },
      },
      data: {
        interviewers: JSON.stringify([interviewerName]),
      },
    });

    return result;
  }

  // Helper to build interview data for notifications
  private static buildInterviewData(interview: any) {
    return {
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
  }

  // Broadcast bulk update
  private static broadcastBulkUpdate(companyId: string, operation: string, interviewIds: string[], data: any) {
    try {
      webSocketServer.broadcastInterviewUpdate(companyId, {
        type: `bulk_${operation}`,
        interviewIds,
        companyId,
        operation,
        data
      });
    } catch (error) {
      console.error('Error broadcasting bulk operation:', error);
    }
  }
}

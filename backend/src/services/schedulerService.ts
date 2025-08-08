import cron from 'node-cron';
import { prisma } from '../index.js';
import { notificationService } from './notificationService.js';

export class SchedulerService {
  private jobs: Map<string, any> = new Map();

  constructor() {
    this.initializeScheduledJobs();
  }

  private initializeScheduledJobs() {
    // Check for interview reminders every 15 minutes
    const reminderJob = cron.schedule('*/15 * * * *', async () => {
      await this.checkInterviewReminders();
    }, {
      timezone: 'UTC'
    });

    // Daily cleanup of old notifications (runs at 2 AM)
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    }, {
      timezone: 'UTC'
    });

    this.jobs.set('interview-reminders', reminderJob);
    this.jobs.set('notification-cleanup', cleanupJob);

    console.log('📅 Scheduler service initialized');
  }

  public start() {
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`✅ Started scheduled job: ${name}`);
    });
  }

  public stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped scheduled job: ${name}`);
    });
  }

  private async checkInterviewReminders() {
    try {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      // Get interviews that need reminders
      const upcomingInterviews = await prisma.interview.findMany({
        where: {
          scheduledDate: {
            gte: now,
            lte: oneDayFromNow
          },
          status: 'scheduled'
        },
        include: {
          application: {
            include: {
              candidate: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              },
              job: {
                select: {
                  title: true,
                  company: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      for (const interview of upcomingInterviews) {
        const interviewDate = new Date(interview.scheduledDate || new Date());
        const candidate = interview.application.candidate;
        const job = interview.application.job;

        const interviewData = {
          interviewId: interview.id,
          candidateEmail: candidate.email,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          interviewTitle: interview.title,
          scheduledDate: interviewDate,
          location: interview.location || undefined,
          meetingLink: interview.meetingLink || undefined,
          interviewers: Array.isArray(interview.interviewers) ? interview.interviewers : [],
          jobTitle: job.title,
          companyName: job.company.name
        };

        // Check if we need to send reminders
        const timeDiff = interviewDate.getTime() - now.getTime();

        // Day before reminder (23-25 hours before)
        if (timeDiff <= 25 * 60 * 60 * 1000 && timeDiff >= 23 * 60 * 60 * 1000) {
          const reminderSent = await this.checkIfReminderSent(interview.id, 'day_before');
          if (!reminderSent) {
            await notificationService.sendInterviewReminder(interviewData, 'day_before');
            await this.markReminderSent(interview.id, 'day_before');
          }
        }

        // Hour before reminder (55-65 minutes before)
        if (timeDiff <= 65 * 60 * 1000 && timeDiff >= 55 * 60 * 1000) {
          const reminderSent = await this.checkIfReminderSent(interview.id, 'hour_before');
          if (!reminderSent) {
            await notificationService.sendInterviewReminder(interviewData, 'hour_before');
            await this.markReminderSent(interview.id, 'hour_before');
          }
        }

        // Starting now reminder (0-5 minutes before)
        if (timeDiff <= 5 * 60 * 1000 && timeDiff >= 0) {
          const reminderSent = await this.checkIfReminderSent(interview.id, 'now');
          if (!reminderSent) {
            await notificationService.sendInterviewReminder(interviewData, 'now');
            await this.markReminderSent(interview.id, 'now');
          }
        }
      }

      console.log(`✅ Checked ${upcomingInterviews.length} upcoming interviews for reminders`);
    } catch (error) {
      console.error('Error checking interview reminders:', error);
    }
  }

  private async checkIfReminderSent(interviewId: string, reminderType: string): Promise<boolean> {
    try {
      const reminder = await prisma.interviewReminder.findFirst({
        where: {
          interviewId,
          reminderType,
          sentAt: {
            not: null
          }
        }
      });

      return !!reminder;
    } catch (error) {
      // If the table doesn't exist, we'll create it
      return false;
    }
  }

  private async markReminderSent(interviewId: string, reminderType: string) {
    try {
      await prisma.interviewReminder.upsert({
        where: {
          interviewId_reminderType: {
            interviewId,
            reminderType
          }
        },
        update: {
          sentAt: new Date()
        },
        create: {
          interviewId,
          reminderType,
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
    }
  }

  private async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete read notifications older than 30 days
      const deletedCount = await prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      console.log(`🧹 Cleaned up ${deletedCount.count} old notifications`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }

  // Schedule a one-time reminder for a specific interview
  public async scheduleInterviewReminder(interviewId: string, reminderDate: Date, reminderType: 'day_before' | 'hour_before' | 'now') {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          application: {
            include: {
              candidate: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              },
              job: {
                select: {
                  title: true,
                  company: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!interview) {
        throw new Error('Interview not found');
      }

      const candidate = interview.application.candidate;
      const job = interview.application.job;

      const interviewData = {
        interviewId: interview.id,
        candidateEmail: candidate.email,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        interviewTitle: interview.title,
        scheduledDate: new Date(interview.scheduledDate || new Date()),
        location: interview.location || undefined,
        meetingLink: interview.meetingLink || undefined,
        interviewers: Array.isArray(interview.interviewers) ? interview.interviewers : [],
        jobTitle: job.title,
        companyName: job.company.name
      };

      // Calculate when to send the reminder
      const now = new Date();
      const delay = reminderDate.getTime() - now.getTime();

      if (delay > 0) {
        setTimeout(async () => {
          try {
            await notificationService.sendInterviewReminder(interviewData, reminderType);
            await this.markReminderSent(interviewId, reminderType);
          } catch (error) {
            console.error(`Error sending scheduled reminder for interview ${interviewId}:`, error);
          }
        }, delay);

        console.log(`📅 Scheduled ${reminderType} reminder for interview ${interviewId} at ${reminderDate.toISOString()}`);
      }
    } catch (error) {
      console.error('Error scheduling interview reminder:', error);
      throw error;
    }
  }

  // Cancel all reminders for an interview
  public async cancelInterviewReminders(interviewId: string) {
    try {
      await prisma.interviewReminder.deleteMany({
        where: { interviewId }
      });

      console.log(`🚫 Cancelled all reminders for interview ${interviewId}`);
    } catch (error) {
      console.error('Error cancelling interview reminders:', error);
    }
  }

  // Get reminder statistics
  public async getReminderStats() {
    try {
      const stats = await prisma.interviewReminder.groupBy({
        by: ['reminderType'],
        _count: {
          id: true
        },
        where: {
          sentAt: {
            not: null
          }
        }
      });

      return stats.reduce((acc, stat) => {
        acc[stat.reminderType] = stat._count.id;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return {};
    }
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();

import nodemailer from 'nodemailer';
import { prisma } from '../index.js';
import { webSocketServer } from '../websocket/server.js';

// Types
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NotificationData {
  userId: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  title: string;
  message: string;
  metadata?: any;
  scheduledFor?: Date;
}

interface InterviewNotificationData {
  interviewId: string;
  candidateEmail: string;
  candidateName: string;
  interviewTitle: string;
  scheduledDate: Date;
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  jobTitle: string;
  companyName: string;
}

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export class NotificationService {
  private emailTransporter: any;

  constructor() {
    this.emailTransporter = createEmailTransporter();
  }

  // Send interview reminder notifications
  async sendInterviewReminder(interviewData: InterviewNotificationData, reminderType: 'day_before' | 'hour_before' | 'now') {
    try {
      const { candidateEmail, candidateName, interviewTitle, scheduledDate, location, meetingLink, interviewers, jobTitle, companyName } = interviewData;

      // Generate email template based on reminder type
      const emailTemplate = this.generateInterviewReminderEmail(interviewData, reminderType);

      // Send email to candidate
      await this.sendEmail({
        to: candidateEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      // Send in-app notification to interviewers
      for (const interviewer of interviewers) {
        const user = await prisma.user.findFirst({
          where: { 
            OR: [
              { email: interviewer },
              { firstName: { contains: interviewer.split(' ')[0] } }
            ]
          }
        });

        if (user) {
          await this.sendInAppNotification({
            userId: user.id,
            type: 'in_app',
            title: `Interview Reminder: ${interviewTitle}`,
            message: `Interview with ${candidateName} is ${reminderType === 'now' ? 'starting now' : reminderType === 'hour_before' ? 'in 1 hour' : 'tomorrow'}`,
            metadata: { interviewId: interviewData.interviewId, type: 'interview_reminder' }
          });

          // Send real-time notification
          webSocketServer.sendInterviewReminder(user.id, interviewData);
        }
      }

      console.log(`Interview reminder sent for ${interviewTitle} (${reminderType})`);
    } catch (error) {
      console.error('Error sending interview reminder:', error);
      throw error;
    }
  }

  // Send interview confirmation
  async sendInterviewConfirmation(interviewData: InterviewNotificationData) {
    try {
      const emailTemplate = this.generateInterviewConfirmationEmail(interviewData);

      await this.sendEmail({
        to: interviewData.candidateEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      console.log(`Interview confirmation sent for ${interviewData.interviewTitle}`);
    } catch (error) {
      console.error('Error sending interview confirmation:', error);
      throw error;
    }
  }

  // Send interview cancellation
  async sendInterviewCancellation(interviewData: InterviewNotificationData, reason?: string) {
    try {
      const emailTemplate = this.generateInterviewCancellationEmail(interviewData, reason);

      await this.sendEmail({
        to: interviewData.candidateEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      console.log(`Interview cancellation sent for ${interviewData.interviewTitle}`);
    } catch (error) {
      console.error('Error sending interview cancellation:', error);
      throw error;
    }
  }

  // Send interview reschedule notification
  async sendInterviewReschedule(interviewData: InterviewNotificationData, newDate: Date, reason?: string) {
    try {
      const emailTemplate = this.generateInterviewRescheduleEmail(interviewData, newDate, reason);

      await this.sendEmail({
        to: interviewData.candidateEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      console.log(`Interview reschedule notification sent for ${interviewData.interviewTitle}`);
    } catch (error) {
      console.error('Error sending interview reschedule notification:', error);
      throw error;
    }
  }

  // Generic email sending method
  private async sendEmail(emailData: { to: string; subject: string; html: string; text: string }) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email credentials not configured, skipping email send');
      return;
    }

    try {
      const info = await this.emailTransporter.sendMail({
        from: `"TalentSol ATS" <${process.env.SMTP_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Send in-app notification
  async sendInAppNotification(notificationData: NotificationData) {
    try {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.title.toLowerCase().includes('interview') ? 'interview_reminder' : 'system_alert',
          title: notificationData.title,
          message: notificationData.message,
          metadata: notificationData.metadata || {},
        }
      });

      // Send real-time notification via WebSocket
      webSocketServer.sendNotificationToUser(notificationData.userId, notification);

      return notification;
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      throw error;
    }
  }

  // Email template generators
  private generateInterviewReminderEmail(data: InterviewNotificationData, reminderType: string): EmailTemplate {
    const { candidateName, interviewTitle, scheduledDate, location, meetingLink, jobTitle, companyName } = data;
    const timeText = reminderType === 'now' ? 'starting now' : reminderType === 'hour_before' ? 'in 1 hour' : 'tomorrow';
    
    const subject = `Interview Reminder: ${interviewTitle} ${timeText}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Interview Reminder</h2>
        <p>Dear ${candidateName},</p>
        <p>This is a reminder that your interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> is ${timeText}.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Interview Details:</h3>
          <p><strong>Title:</strong> ${interviewTitle}</p>
          <p><strong>Date & Time:</strong> ${scheduledDate.toLocaleString()}</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        </div>
        
        <p>Please make sure you're prepared and arrive on time. If you have any questions or need to reschedule, please contact us immediately.</p>
        
        <p>Best regards,<br>The ${companyName} Team</p>
      </div>
    `;
    
    const text = `Interview Reminder: ${interviewTitle} ${timeText}\n\nDear ${candidateName},\n\nThis is a reminder that your interview for the ${jobTitle} position at ${companyName} is ${timeText}.\n\nInterview Details:\nTitle: ${interviewTitle}\nDate & Time: ${scheduledDate.toLocaleString()}\n${location ? `Location: ${location}\n` : ''}${meetingLink ? `Meeting Link: ${meetingLink}\n` : ''}\n\nPlease make sure you're prepared and arrive on time.\n\nBest regards,\nThe ${companyName} Team`;
    
    return { subject, html, text };
  }

  private generateInterviewConfirmationEmail(data: InterviewNotificationData): EmailTemplate {
    const { candidateName, interviewTitle, scheduledDate, location, meetingLink, jobTitle, companyName } = data;
    
    const subject = `Interview Confirmed: ${interviewTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Interview Confirmed</h2>
        <p>Dear ${candidateName},</p>
        <p>We're pleased to confirm your interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Interview Details:</h3>
          <p><strong>Title:</strong> ${interviewTitle}</p>
          <p><strong>Date & Time:</strong> ${scheduledDate.toLocaleString()}</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        </div>
        
        <p>We look forward to meeting with you. Please arrive 10 minutes early and bring any requested documents.</p>
        
        <p>Best regards,<br>The ${companyName} Team</p>
      </div>
    `;
    
    const text = `Interview Confirmed: ${interviewTitle}\n\nDear ${candidateName},\n\nWe're pleased to confirm your interview for the ${jobTitle} position at ${companyName}.\n\nInterview Details:\nTitle: ${interviewTitle}\nDate & Time: ${scheduledDate.toLocaleString()}\n${location ? `Location: ${location}\n` : ''}${meetingLink ? `Meeting Link: ${meetingLink}\n` : ''}\n\nWe look forward to meeting with you.\n\nBest regards,\nThe ${companyName} Team`;
    
    return { subject, html, text };
  }

  private generateInterviewCancellationEmail(data: InterviewNotificationData, reason?: string): EmailTemplate {
    const { candidateName, interviewTitle, jobTitle, companyName } = data;
    
    const subject = `Interview Cancelled: ${interviewTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Interview Cancelled</h2>
        <p>Dear ${candidateName},</p>
        <p>We regret to inform you that your interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been cancelled.</p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        
        <p>We apologize for any inconvenience this may cause. We will contact you soon to reschedule or provide further information.</p>
        
        <p>Best regards,<br>The ${companyName} Team</p>
      </div>
    `;
    
    const text = `Interview Cancelled: ${interviewTitle}\n\nDear ${candidateName},\n\nWe regret to inform you that your interview for the ${jobTitle} position at ${companyName} has been cancelled.\n\n${reason ? `Reason: ${reason}\n\n` : ''}We apologize for any inconvenience this may cause.\n\nBest regards,\nThe ${companyName} Team`;
    
    return { subject, html, text };
  }

  private generateInterviewRescheduleEmail(data: InterviewNotificationData, newDate: Date, reason?: string): EmailTemplate {
    const { candidateName, interviewTitle, jobTitle, companyName } = data;
    
    const subject = `Interview Rescheduled: ${interviewTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">Interview Rescheduled</h2>
        <p>Dear ${candidateName},</p>
        <p>Your interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been rescheduled.</p>
        
        <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400E;">New Interview Details:</h3>
          <p><strong>Title:</strong> ${interviewTitle}</p>
          <p><strong>New Date & Time:</strong> ${newDate.toLocaleString()}</p>
        </div>
        
        ${reason ? `<p><strong>Reason for reschedule:</strong> ${reason}</p>` : ''}
        
        <p>We apologize for any inconvenience. Please confirm your availability for the new time.</p>
        
        <p>Best regards,<br>The ${companyName} Team</p>
      </div>
    `;
    
    const text = `Interview Rescheduled: ${interviewTitle}\n\nDear ${candidateName},\n\nYour interview for the ${jobTitle} position at ${companyName} has been rescheduled.\n\nNew Date & Time: ${newDate.toLocaleString()}\n\n${reason ? `Reason for reschedule: ${reason}\n\n` : ''}We apologize for any inconvenience.\n\nBest regards,\nThe ${companyName} Team`;
    
    return { subject, html, text };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

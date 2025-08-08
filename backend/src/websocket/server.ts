import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { createNotification } from '../routes/notifications.js';
import { validateWebSocketAuth } from '../middleware/security.js';

// Types for WebSocket events
interface InterviewUpdate {
  type: 'interview_created' | 'interview_updated' | 'interview_cancelled' | 'interview_reminder';
  interview: any;
  userId?: string;
  companyId: string;
}

interface NotificationEvent {
  type: 'notification';
  notification: any;
  userId: string;
}

// Enhanced event types for Phase 4
interface ApplicationStatusUpdate {
  type: 'application_status_changed';
  applicationId: string;
  candidateId: string;
  jobId: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: {
    id: string;
    name: string;
  };
  companyId: string;
  timestamp: string;
}

interface DashboardMetricsUpdate {
  type: 'dashboard_metrics_updated';
  metrics: {
    totalApplications: number;
    totalCandidates: number;
    totalInterviews: number;
    activeJobs: number;
    conversionRate: number;
    newApplicationsToday: number;
  };
  companyId: string;
  timestamp: string;
}

interface MLProcessingEvent {
  type: 'ml_processing_started' | 'ml_processing_completed' | 'ml_processing_failed';
  applicationId: string;
  candidateId: string;
  jobId: string;
  processingId?: string;
  score?: number;
  recommendations?: any;
  error?: string;
  companyId: string;
  timestamp: string;
}

interface XGBoostPredictionEvent {
  type: 'xgboost_prediction_completed' | 'xgboost_prediction_failed';
  applicationId: string;
  candidateId: string;
  jobId: string;
  prediction?: {
    probability: number;
    binary_prediction: 0 | 1;
    confidence: number;
    threshold_used: number;
    model_version: string;
  };
  processing_time_ms?: number;
  error?: string;
  companyId: string;
  timestamp: string;
}

// WebSocket Server Class
export class WebSocketServer {
  private io: Server;
  private server: any;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(port: number = 9000) {
    this.server = createServer();
    this.io = new Server(this.server, {
      cors: {
        origin: [
          'http://localhost:8080',
          'http://localhost:8081',
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:4173'
        ],
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Enhanced authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        // Enhanced token validation
        if (!validateWebSocketAuth(token)) {
          return next(new Error('Invalid authentication token format'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Verify user exists and is active
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            companyId: true,
            role: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        // Check token expiration
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          return next(new Error('Token expired'));
        }

        // Store enhanced user data
        socket.data.user = user;
        socket.data.authenticatedAt = new Date();
        socket.data.tokenExp = decoded.exp;

        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        if (error instanceof jwt.JsonWebTokenError) {
          return next(new Error('Invalid token signature'));
        }
        if (error instanceof jwt.TokenExpiredError) {
          return next(new Error('Token expired'));
        }
        next(new Error('Authentication failed'));
      }
    });

    // Rate limiting middleware
    this.io.use((socket, next) => {
      const now = Date.now();
      const windowMs = 60000; // 1 minute
      const maxRequests = 100;

      if (!socket.data.rateLimitWindow) {
        socket.data.rateLimitWindow = now;
        socket.data.requestCount = 0;
      }

      // Reset window if expired
      if (now - socket.data.rateLimitWindow > windowMs) {
        socket.data.rateLimitWindow = now;
        socket.data.requestCount = 0;
      }

      socket.data.requestCount++;

      if (socket.data.requestCount > maxRequests) {
        return next(new Error('Rate limit exceeded'));
      }

      next();
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      console.log(`User ${user.firstName} ${user.lastName} connected (${user.id})`);

      // Store user connection
      this.connectedUsers.set(user.id, socket.id);

      // Join company room for company-wide updates
      socket.join(`company:${user.companyId}`);

      // Handle interview subscription
      socket.on('subscribe:interviews', () => {
        socket.join(`interviews:${user.companyId}`);
        console.log(`User ${user.id} subscribed to interview updates`);
      });

      // Handle notification subscription
      socket.on('subscribe:notifications', () => {
        socket.join(`notifications:${user.id}`);
        console.log(`User ${user.id} subscribed to notifications`);
      });

      // Handle dashboard metrics subscription
      socket.on('subscribe:dashboard', () => {
        socket.join(`dashboard:${user.companyId}`);
        console.log(`User ${user.id} subscribed to dashboard metrics updates`);
      });

      // Handle application status subscription
      socket.on('subscribe:applications', () => {
        socket.join(`applications:${user.companyId}`);
        console.log(`User ${user.id} subscribed to application status updates`);
      });

      // Handle ML processing subscription
      socket.on('subscribe:ml_processing', () => {
        socket.join(`ml_processing:${user.companyId}`);
        console.log(`User ${user.id} subscribed to ML processing updates`);
      });

      // Handle XGBoost prediction subscription
      socket.on('subscribe:xgboost_predictions', () => {
        socket.join(`xgboost_predictions:${user.companyId}`);
        console.log(`User ${user.id} subscribed to XGBoost prediction updates`);
      });

      // Handle interview updates
      socket.on('interview:update', async (data) => {
        try {
          await this.handleInterviewUpdate(data, user);
        } catch (error) {
          console.error('Error handling interview update:', error);
          socket.emit('error', { message: 'Failed to process interview update' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${user.firstName} ${user.lastName} disconnected`);
        this.connectedUsers.delete(user.id);
      });

      // Send initial connection confirmation
      socket.emit('connected', {
        message: 'Connected to TalentSol real-time updates',
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    });
  }

  private async handleInterviewUpdate(data: any, user: any) {
    // Validate and process interview updates
    const { action, interviewId, interviewData } = data;

    switch (action) {
      case 'schedule':
        await this.handleInterviewScheduled(interviewData, user);
        break;
      case 'update':
        await this.handleInterviewUpdated(interviewId, interviewData, user);
        break;
      case 'cancel':
        await this.handleInterviewCancelled(interviewId, user);
        break;
      default:
        throw new Error(`Unknown interview action: ${action}`);
    }
  }

  private async handleInterviewScheduled(interviewData: any, user: any) {
    // Broadcast to company members
    this.io.to(`interviews:${user.companyId}`).emit('interview:scheduled', {
      type: 'interview_created',
      interview: interviewData,
      scheduledBy: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString()
    });

    // Create notification for relevant users
    await this.createInterviewNotification(
      'interview_scheduled',
      `New interview scheduled: ${interviewData.title}`,
      interviewData,
      user.companyId
    );
  }

  private async handleInterviewUpdated(interviewId: string, interviewData: any, user: any) {
    // Broadcast to company members
    this.io.to(`interviews:${user.companyId}`).emit('interview:updated', {
      type: 'interview_updated',
      interviewId,
      interview: interviewData,
      updatedBy: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString()
    });

    // Create notification
    await this.createInterviewNotification(
      'interview_updated',
      `Interview updated: ${interviewData.title}`,
      interviewData,
      user.companyId
    );
  }

  private async handleInterviewCancelled(interviewId: string, user: any) {
    // Get interview details
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            candidate: true,
            job: true
          }
        }
      }
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    // Broadcast cancellation
    this.io.to(`interviews:${user.companyId}`).emit('interview:cancelled', {
      type: 'interview_cancelled',
      interviewId,
      interview,
      cancelledBy: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString()
    });

    // Create notification
    await this.createInterviewNotification(
      'interview_cancelled',
      `Interview cancelled: ${interview.title}`,
      interview,
      user.companyId
    );
  }

  private async createInterviewNotification(
    type: string,
    message: string,
    interviewData: any,
    companyId: string
  ) {
    try {
      // Get all users in the company who should receive notifications
      const users = await prisma.user.findMany({
        where: {
          companyId,
          role: { in: ['admin', 'recruiter', 'hiring_manager'] }
        },
        select: { id: true }
      });

      // Create notifications for each user
      for (const user of users) {
        const notification = await createNotification(
          user.id,
          type,
          'Interview Update',
          message,
          { interviewData }
        );

        // Send real-time notification
        this.sendNotificationToUser(user.id, notification);
      }
    } catch (error) {
      console.error('Error creating interview notification:', error);
    }
  }

  // Public methods for external use
  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', {
        type: 'notification',
        notification,
        timestamp: new Date().toISOString()
      });
    }
  }

  public broadcastInterviewUpdate(companyId: string, update: InterviewUpdate) {
    this.io.to(`interviews:${companyId}`).emit('interview:update', update);
  }

  public sendInterviewReminder(userId: string, interview: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('interview:reminder', {
        type: 'interview_reminder',
        interview,
        timestamp: new Date().toISOString()
      });
    }
  }

  public broadcastToCompany(companyId: string, data: any) {
    this.io.to(`company:${companyId}`).emit('company:update', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  public sendMLProcessingUpdate(userId: string, update: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('ml:processing_update', {
        type: 'ml_processing_update',
        ...update,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Enhanced real-time methods for Phase 4
  public broadcastApplicationStatusUpdate(companyId: string, update: ApplicationStatusUpdate) {
    this.io.to(`applications:${companyId}`).emit('application:status_changed', {
      ...update,
      timestamp: new Date().toISOString()
    });

    // Also broadcast to company room for general updates
    this.io.to(`company:${companyId}`).emit('company:application_update', {
      ...update,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastDashboardMetricsUpdate(companyId: string, metrics: DashboardMetricsUpdate['metrics']) {
    const update: DashboardMetricsUpdate = {
      type: 'dashboard_metrics_updated',
      metrics,
      companyId,
      timestamp: new Date().toISOString()
    };

    this.io.to(`dashboard:${companyId}`).emit('dashboard:metrics_updated', update);

    // Also broadcast to company room for general dashboard updates
    this.io.to(`company:${companyId}`).emit('company:dashboard_update', update);
  }

  public broadcastMLProcessingEvent(companyId: string, event: MLProcessingEvent) {
    this.io.to(`ml_processing:${companyId}`).emit('ml:processing_event', {
      ...event,
      timestamp: new Date().toISOString()
    });

    // Send specific user notification if processing completed
    if (event.type === 'ml_processing_completed' && event.score) {
      this.io.to(`company:${companyId}`).emit('company:ml_update', {
        type: 'ml_score_available',
        applicationId: event.applicationId,
        score: event.score,
        timestamp: new Date().toISOString()
      });
    }
  }

  public broadcastXGBoostPredictionEvent(companyId: string, event: XGBoostPredictionEvent) {
    // Broadcast to XGBoost subscribers
    this.io.to(`xgboost_predictions:${companyId}`).emit('xgboost:prediction_event', {
      ...event,
      timestamp: new Date().toISOString()
    });

    // Also broadcast to ML processing subscribers for compatibility
    this.io.to(`ml_processing:${companyId}`).emit('ml:xgboost_prediction', {
      ...event,
      timestamp: new Date().toISOString()
    });

    // Send company-wide notification for completed predictions
    if (event.type === 'xgboost_prediction_completed' && event.prediction) {
      this.io.to(`company:${companyId}`).emit('company:xgboost_update', {
        type: 'xgboost_prediction_available',
        applicationId: event.applicationId,
        candidateId: event.candidateId,
        jobId: event.jobId,
        prediction: event.prediction,
        processing_time_ms: event.processing_time_ms,
        timestamp: new Date().toISOString()
      });
    }
  }

  public start(port: number = 9000) {
    this.server.listen(port, () => {
      console.log(`🔌 WebSocket server running on port ${port}`);
    });
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

// Export singleton instance
export const webSocketServer = new WebSocketServer();

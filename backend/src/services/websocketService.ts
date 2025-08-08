import { webSocketServer } from '../websocket/server';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

export interface XGBoostWebSocketEvent {
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
  timestamp: string;
}

export class WebSocketService {
  private static instance: WebSocketService;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Emit XGBoost prediction event to all connected clients in a company
   */
  async emitXGBoostPrediction(event: XGBoostWebSocketEvent): Promise<void> {
    try {
      // Get company ID from application
      const application = await prisma.application.findUnique({
        where: { id: event.applicationId },
        include: { job: true }
      });

      if (!application) {
        logger.error(`Application ${event.applicationId} not found for WebSocket event`);
        return;
      }

      const companyId = application.job.companyId;

      // Broadcast XGBoost prediction event
      webSocketServer.broadcastXGBoostPredictionEvent(companyId, {
        ...event,
        companyId,
        timestamp: event.timestamp || new Date().toISOString()
      });

      logger.info(`XGBoost prediction event broadcasted for application ${event.applicationId}`);

    } catch (error) {
      logger.error('Failed to emit XGBoost prediction event:', error);
    }
  }

  /**
   * Emit event to all connected clients
   */
  emitToAll(eventName: string, data: any): void {
    try {
      // This would need to be implemented in the WebSocketServer class
      // For now, we'll use the existing broadcast methods
      logger.info(`Broadcasting event ${eventName} to all clients`);
    } catch (error) {
      logger.error(`Failed to emit event ${eventName}:`, error);
    }
  }

  /**
   * Emit XGBoost prediction completed event
   */
  async emitXGBoostPredictionCompleted(
    applicationId: string,
    candidateId: string,
    jobId: string,
    prediction: {
      probability: number;
      binary_prediction: 0 | 1;
      confidence: number;
      threshold_used: number;
      model_version: string;
    },
    processingTimeMs: number
  ): Promise<void> {
    await this.emitXGBoostPrediction({
      type: 'xgboost_prediction_completed',
      applicationId,
      candidateId,
      jobId,
      prediction,
      processing_time_ms: processingTimeMs,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit XGBoost prediction failed event
   */
  async emitXGBoostPredictionFailed(
    applicationId: string,
    candidateId: string,
    jobId: string,
    error: string
  ): Promise<void> {
    await this.emitXGBoostPrediction({
      type: 'xgboost_prediction_failed',
      applicationId,
      candidateId,
      jobId,
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit ML processing started event (for compatibility)
   */
  async emitMLProcessingStarted(
    applicationId: string,
    candidateId: string,
    jobId: string,
    processingId: string
  ): Promise<void> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { job: true }
      });

      if (!application) {
        logger.error(`Application ${applicationId} not found for ML processing event`);
        return;
      }

      const companyId = application.job.companyId;

      webSocketServer.broadcastMLProcessingEvent(companyId, {
        type: 'ml_processing_started',
        applicationId,
        candidateId,
        jobId,
        processingId,
        companyId,
        timestamp: new Date().toISOString()
      });

      logger.info(`ML processing started event broadcasted for application ${applicationId}`);

    } catch (error) {
      logger.error('Failed to emit ML processing started event:', error);
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return webSocketServer.getConnectedUsersCount();
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return webSocketServer.isUserConnected(userId);
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: string, notification: any): void {
    webSocketServer.sendNotificationToUser(userId, notification);
  }

  /**
   * Broadcast to company
   */
  async broadcastToCompany(companyId: string, data: any): Promise<void> {
    webSocketServer.broadcastToCompany(companyId, data);
  }

  /**
   * Broadcast application status update
   */
  async broadcastApplicationStatusUpdate(
    applicationId: string,
    status: string,
    updatedBy?: string
  ): Promise<void> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { 
          job: true,
          candidate: true
        }
      });

      if (!application) {
        logger.error(`Application ${applicationId} not found for status update`);
        return;
      }

      const companyId = application.job.companyId;

      webSocketServer.broadcastApplicationStatusUpdate(companyId, {
        type: 'application_status_changed',
        applicationId,
        candidateId: application.candidateId,
        jobId: application.jobId,
        status,
        candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        jobTitle: application.job.title,
        updatedBy,
        timestamp: new Date().toISOString()
      });

      logger.info(`Application status update broadcasted for application ${applicationId}: ${status}`);

    } catch (error) {
      logger.error('Failed to broadcast application status update:', error);
    }
  }

  /**
   * Broadcast dashboard metrics update
   */
  async broadcastDashboardUpdate(companyId: string, metrics: any): Promise<void> {
    webSocketServer.broadcastDashboardMetricsUpdate(companyId, metrics);
  }

  /**
   * Send interview reminder
   */
  sendInterviewReminder(userId: string, interview: any): void {
    webSocketServer.sendInterviewReminder(userId, interview);
  }

  /**
   * Broadcast interview update
   */
  broadcastInterviewUpdate(companyId: string, update: any): void {
    webSocketServer.broadcastInterviewUpdate(companyId, update);
  }

  /**
   * Send ML processing update to specific user
   */
  sendMLProcessingUpdate(userId: string, update: any): void {
    webSocketServer.sendMLProcessingUpdate(userId, update);
  }

  /**
   * Health check for WebSocket service
   */
  healthCheck(): {
    status: 'healthy' | 'unhealthy';
    connectedUsers: number;
    uptime: number;
  } {
    try {
      const connectedUsers = this.getConnectedUsersCount();
      return {
        status: 'healthy',
        connectedUsers,
        uptime: process.uptime()
      };
    } catch (error) {
      logger.error('WebSocket health check failed:', error);
      return {
        status: 'unhealthy',
        connectedUsers: 0,
        uptime: 0
      };
    }
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();

import { prisma } from '../index.js';
import { webSocketServer } from '../websocket/server.js';
import { unifiedDataService } from './UnifiedDataService.js';

export interface RealTimeDashboardMetrics {
  totalApplications: number;
  totalCandidates: number;
  totalInterviews: number;
  activeJobs: number;
  conversionRate: number;
  newApplicationsToday: number;
  averageScore: number;
  interviewsScheduled: number;
  offersExtended: number;
  hires: number;
}

export class RealTimeDashboardService {
  private static instance: RealTimeDashboardService;
  private metricsCache: Map<string, RealTimeDashboardMetrics> = new Map();
  private lastUpdateTime: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  public static getInstance(): RealTimeDashboardService {
    if (!RealTimeDashboardService.instance) {
      RealTimeDashboardService.instance = new RealTimeDashboardService();
    }
    return RealTimeDashboardService.instance;
  }

  /**
   * Get current dashboard metrics for a company
   */
  public async getDashboardMetrics(companyId: string): Promise<RealTimeDashboardMetrics> {
    const now = Date.now();
    const lastUpdate = this.lastUpdateTime.get(companyId) || 0;
    
    // Return cached metrics if still fresh
    if (now - lastUpdate < this.CACHE_DURATION && this.metricsCache.has(companyId)) {
      return this.metricsCache.get(companyId)!;
    }

    // Fetch fresh metrics
    const metrics = await this.fetchFreshMetrics(companyId);
    
    // Update cache
    this.metricsCache.set(companyId, metrics);
    this.lastUpdateTime.set(companyId, now);
    
    return metrics;
  }

  /**
   * Trigger real-time dashboard update for a company
   */
  public async triggerDashboardUpdate(companyId: string, reason?: string): Promise<void> {
    try {
      console.log(`📊 Triggering dashboard update for company ${companyId}${reason ? ` (${reason})` : ''}`);
      
      // Fetch fresh metrics
      const metrics = await this.fetchFreshMetrics(companyId);
      
      // Update cache
      this.metricsCache.set(companyId, metrics);
      this.lastUpdateTime.set(companyId, Date.now());
      
      // Broadcast to connected clients
      webSocketServer.broadcastDashboardMetricsUpdate(companyId, metrics);
      
      console.log(`✅ Dashboard update broadcasted for company ${companyId}`);
    } catch (error) {
      console.error(`❌ Failed to trigger dashboard update for company ${companyId}:`, error);
    }
  }

  /**
   * Handle application status change and trigger dashboard update
   */
  public async handleApplicationStatusChange(
    applicationId: string,
    oldStatus: string,
    newStatus: string,
    updatedBy: { id: string; name: string }
  ): Promise<void> {
    try {
      // Get application details
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: { select: { companyId: true } },
          candidate: { select: { id: true } }
        }
      });

      if (!application) {
        console.error(`Application ${applicationId} not found`);
        return;
      }

      const companyId = application.job.companyId;

      // Broadcast application status update
      webSocketServer.broadcastApplicationStatusUpdate(companyId, {
        type: 'application_status_changed',
        applicationId,
        candidateId: application.candidate.id,
        jobId: application.jobId,
        oldStatus,
        newStatus,
        updatedBy,
        companyId,
        timestamp: new Date().toISOString()
      });

      // Trigger dashboard metrics update if status change affects metrics
      if (this.shouldUpdateDashboard(oldStatus, newStatus)) {
        await this.triggerDashboardUpdate(companyId, `application status: ${oldStatus} → ${newStatus}`);
      }
    } catch (error) {
      console.error('Error handling application status change:', error);
    }
  }

  /**
   * Handle new application submission
   */
  public async handleNewApplication(applicationId: string): Promise<void> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: { select: { companyId: true } },
          candidate: { select: { id: true, firstName: true, lastName: true } }
        }
      });

      if (!application) return;

      const companyId = application.job.companyId;

      // Trigger dashboard update for new application
      await this.triggerDashboardUpdate(companyId, 'new application submitted');

      // Broadcast new application event
      webSocketServer.broadcastToCompany(companyId, {
        type: 'new_application',
        applicationId,
        candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        jobId: application.jobId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error handling new application:', error);
    }
  }

  /**
   * Handle interview scheduling and trigger updates
   */
  public async handleInterviewScheduled(interviewId: string): Promise<void> {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          application: {
            include: {
              job: { select: { companyId: true } }
            }
          }
        }
      });

      if (!interview) return;

      const companyId = interview.application.job.companyId;
      await this.triggerDashboardUpdate(companyId, 'interview scheduled');
    } catch (error) {
      console.error('Error handling interview scheduled:', error);
    }
  }

  /**
   * Fetch fresh metrics from database
   */
  private async fetchFreshMetrics(companyId: string): Promise<RealTimeDashboardMetrics> {
    try {
      // Use unified data service for consistent metrics
      const unifiedData = await unifiedDataService.getUnifiedDashboardData(companyId);
      
      // Get today's applications
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newApplicationsToday = await prisma.application.count({
        where: {
          job: { companyId },
          submittedAt: { gte: today }
        }
      });

      return {
        totalApplications: unifiedData.totalApplications,
        totalCandidates: unifiedData.totalCandidates,
        totalInterviews: unifiedData.totalInterviews,
        activeJobs: unifiedData.topJobs.filter(j => j.applicationCount > 0).length,
        conversionRate: unifiedData.totalApplications > 0 
          ? Math.round((unifiedData.totalHires / unifiedData.totalApplications) * 100) 
          : 0,
        newApplicationsToday,
        averageScore: 85, // Mock data - would calculate from actual scores
        interviewsScheduled: unifiedData.scheduledInterviews,
        offersExtended: unifiedData.candidatesByStatus.find(s => s.status === 'offer')?.count || 0,
        hires: unifiedData.totalHires
      };
    } catch (error) {
      console.error('Error fetching fresh metrics:', error);
      throw error;
    }
  }

  /**
   * Determine if dashboard should be updated based on status change
   */
  private shouldUpdateDashboard(oldStatus: string, newStatus: string): boolean {
    const significantStatuses = ['applied', 'interview', 'offer', 'hired', 'rejected'];
    return significantStatuses.includes(oldStatus) || significantStatuses.includes(newStatus);
  }

  /**
   * Clear cache for a company (useful for testing or manual refresh)
   */
  public clearCache(companyId: string): void {
    this.metricsCache.delete(companyId);
    this.lastUpdateTime.delete(companyId);
  }

  /**
   * Get cache status for monitoring
   */
  public getCacheStatus(): { companies: number; oldestCache: number } {
    const now = Date.now();
    let oldestCache = now;
    
    for (const [, lastUpdate] of this.lastUpdateTime) {
      if (lastUpdate < oldestCache) {
        oldestCache = lastUpdate;
      }
    }
    
    return {
      companies: this.metricsCache.size,
      oldestCache: now - oldestCache
    };
  }
}

// Export singleton instance
export const realTimeDashboardService = RealTimeDashboardService.getInstance();

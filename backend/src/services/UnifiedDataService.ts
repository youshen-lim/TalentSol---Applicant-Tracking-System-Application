import { prisma } from '../index.js';
import { Cached, InvalidateCache, CacheInvalidation } from '../cache/decorators.js';

/**
 * Unified Data Service - Candidate-Centric Data Architecture
 * All metrics and data flow from candidate_ID as the primary entity
 */

export interface CandidateMetrics {
  candidateId: string;
  candidateName: string;
  totalApplications: number;
  activeApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  hiredPositions: number;
  averageApplicationScore: number;
  timeToHire?: number; // Days from first application to hire
  sources: string[];
  lastActivity: Date;
}

export interface UnifiedDashboardData {
  totalCandidates: number;
  newCandidatesThisMonth: number;
  totalApplications: number;
  newApplicationsThisMonth: number;
  totalInterviews: number;
  scheduledInterviews: number;
  totalHires: number;
  hiresThisMonth: number;
  averageTimeToHire: number;
  topSources: Array<{
    source: string;
    candidateCount: number;
    applicationCount: number;
    hireCount: number;
    conversionRate: number;
  }>;
  candidatesByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    candidateId: string;
    candidateName: string;
    action: string;
    jobTitle: string;
    timestamp: Date;
  }>;
  topJobs: Array<{
    jobId: string;
    jobTitle: string;
    department: string;
    candidateCount: number;
    applicationCount: number;
    interviewCount: number;
    hireCount: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    newCandidates: number;
    applications: number;
    interviews: number;
    hires: number;
  }>;
}

@CacheInvalidation({
  entityType: 'company',
  idExtractor: (args) => args[0],
})
export class UnifiedDataService {

  @Cached({
    strategy: 'dashboard_cache',
    ttl: 900, // 15 minutes
    tags: ['unified', 'dashboard', 'candidates'],
    keyGenerator: (companyId: string) => `unified_dashboard_${companyId}`,
  })
  async getUnifiedDashboardData(companyId: string): Promise<UnifiedDashboardData> {
    console.log(`🔄 Generating unified dashboard data for company: ${companyId}`);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get all candidates with their applications (candidate-centric query)
    const candidatesWithApplications = await prisma.candidate.findMany({
      where: {
        applications: {
          some: {
            job: { companyId }
          }
        }
      },
      include: {
        applications: {
          where: {
            job: { companyId }
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                department: true,
              }
            },
            interviews: true,
          },
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    });

    console.log(`📊 Found ${candidatesWithApplications.length} candidates with applications`);

    // Calculate unified metrics from candidate data
    const totalCandidates = candidatesWithApplications.length;
    const newCandidatesThisMonth = candidatesWithApplications.filter(
      c => c.createdAt >= thirtyDaysAgo
    ).length;

    const allApplications = candidatesWithApplications.flatMap(c => c.applications);
    const totalApplications = allApplications.length;
    const newApplicationsThisMonth = allApplications.filter(
      a => a.submittedAt >= thirtyDaysAgo
    ).length;

    const allInterviews = allApplications.flatMap(a => a.interviews);
    const totalInterviews = allInterviews.length;
    const scheduledInterviews = allInterviews.filter(
      i => i.status === 'scheduled' && i.scheduledAt >= now
    ).length;

    const hiredApplications = allApplications.filter(a => a.status === 'hired');
    const totalHires = hiredApplications.length;
    const hiresThisMonth = hiredApplications.filter(
      a => a.hiredAt && a.hiredAt >= thirtyDaysAgo
    ).length;

    // Calculate average time to hire (candidate journey)
    const timeToHireData = hiredApplications
      .filter(a => a.hiredAt)
      .map(a => Math.ceil((a.hiredAt!.getTime() - a.submittedAt.getTime()) / (1000 * 60 * 60 * 24)));
    
    const averageTimeToHire = timeToHireData.length > 0
      ? Math.round(timeToHireData.reduce((sum, days) => sum + days, 0) / timeToHireData.length)
      : 0;

    // Source analysis (candidate-centric)
    const sourceMap = new Map<string, {
      candidateIds: Set<string>;
      applicationCount: number;
      hireCount: number;
    }>();

    allApplications.forEach(app => {
      const source = (app.metadata as any)?.source || 'unknown';
      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          candidateIds: new Set(),
          applicationCount: 0,
          hireCount: 0,
        });
      }
      const sourceData = sourceMap.get(source)!;
      sourceData.candidateIds.add(app.candidateId);
      sourceData.applicationCount++;
      if (app.status === 'hired') {
        sourceData.hireCount++;
      }
    });

    const topSources = Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      candidateCount: data.candidateIds.size,
      applicationCount: data.applicationCount,
      hireCount: data.hireCount,
      conversionRate: data.applicationCount > 0 ? (data.hireCount / data.applicationCount) * 100 : 0,
    })).sort((a, b) => b.candidateCount - a.candidateCount);

    // Candidate status distribution
    const statusMap = new Map<string, number>();
    candidatesWithApplications.forEach(candidate => {
      const latestApplication = candidate.applications[0]; // Most recent
      const status = latestApplication?.status || 'no_applications';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const candidatesByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / totalCandidates) * 100),
    }));

    // Recent activity (candidate-centric) - last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = allApplications
      .filter(a => a.submittedAt && a.submittedAt >= sevenDaysAgo)
      .slice(0, 10)
      .map(app => {
        const candidate = candidatesWithApplications.find(c => c.id === app.candidateId)!;
        return {
          candidateId: candidate.id,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          action: `Applied for ${app.job.title}`,
          jobTitle: app.job.title,
          timestamp: app.submittedAt,
        };
      });

    // Top jobs by candidate engagement
    const jobMap = new Map<string, {
      jobId: string;
      jobTitle: string;
      department: string;
      candidateIds: Set<string>;
      applicationCount: number;
      interviewCount: number;
      hireCount: number;
    }>();

    allApplications.forEach(app => {
      if (!jobMap.has(app.job.id)) {
        jobMap.set(app.job.id, {
          jobId: app.job.id,
          jobTitle: app.job.title,
          department: app.job.department || 'Unknown',
          candidateIds: new Set(),
          applicationCount: 0,
          interviewCount: 0,
          hireCount: 0,
        });
      }
      const jobData = jobMap.get(app.job.id)!;
      jobData.candidateIds.add(app.candidateId);
      jobData.applicationCount++;
      jobData.interviewCount += app.interviews.length;
      if (app.status === 'hired') {
        jobData.hireCount++;
      }
    });

    const topJobs = Array.from(jobMap.values())
      .map(job => ({
        ...job,
        candidateCount: job.candidateIds.size,
      }))
      .sort((a, b) => b.candidateCount - a.candidateCount)
      .slice(0, 5);

    // Time series data (last 30 days)
    const timeSeriesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      timeSeriesData.push({
        date: dateStr,
        newCandidates: candidatesWithApplications.filter(
          c => c.createdAt >= dayStart && c.createdAt <= dayEnd
        ).length,
        applications: allApplications.filter(
          a => a.submittedAt >= dayStart && a.submittedAt <= dayEnd
        ).length,
        interviews: allInterviews.filter(
          i => i.scheduledAt >= dayStart && i.scheduledAt <= dayEnd
        ).length,
        hires: hiredApplications.filter(
          a => a.hiredAt && a.hiredAt >= dayStart && a.hiredAt <= dayEnd
        ).length,
      });
    }

    const unifiedData: UnifiedDashboardData = {
      totalCandidates,
      newCandidatesThisMonth,
      totalApplications,
      newApplicationsThisMonth,
      totalInterviews,
      scheduledInterviews,
      totalHires,
      hiresThisMonth,
      averageTimeToHire,
      topSources,
      candidatesByStatus,
      recentActivity,
      topJobs,
      timeSeriesData,
    };

    console.log('✅ Unified dashboard data generated successfully');
    return unifiedData;
  }

  @Cached({
    strategy: 'dashboard_cache',
    ttl: 1800, // 30 minutes
    tags: ['unified', 'candidates', 'metrics'],
    keyGenerator: (companyId: string) => `candidate_metrics_${companyId}`,
  })
  async getCandidateMetrics(companyId: string): Promise<CandidateMetrics[]> {
    const candidatesWithApplications = await prisma.candidate.findMany({
      where: {
        applications: {
          some: {
            job: { companyId }
          }
        }
      },
      include: {
        applications: {
          where: {
            job: { companyId }
          },
          include: {
            interviews: true,
          }
        }
      }
    });

    return candidatesWithApplications.map(candidate => {
      const applications = candidate.applications;
      const interviews = applications.flatMap(a => a.interviews);
      const hiredApplications = applications.filter(a => a.status === 'hired');
      
      const timeToHire = hiredApplications.length > 0
        ? Math.ceil((hiredApplications[0].hiredAt!.getTime() - hiredApplications[0].submittedAt.getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      const sources = [...new Set(applications.map(a => (a.metadata as any)?.source || 'unknown'))];
      const scores = applications.map(a => (a.scoring as any)?.automaticScore || 0).filter(s => s > 0);
      const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

      return {
        candidateId: candidate.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        totalApplications: applications.length,
        activeApplications: applications.filter(a => !['hired', 'rejected'].includes(a.status)).length,
        interviewsScheduled: interviews.length,
        offersReceived: applications.filter(a => a.status === 'offer').length,
        hiredPositions: hiredApplications.length,
        averageApplicationScore: Math.round(averageScore),
        timeToHire,
        sources,
        lastActivity: applications[0]?.submittedAt || candidate.createdAt,
      };
    });
  }

  @InvalidateCache({
    strategies: ['dashboard_cache'],
    tags: ['unified', 'dashboard', 'candidates'],
  })
  async refreshUnifiedCache(companyId: string): Promise<void> {
    console.log(`🔄 Refreshing unified cache for company ${companyId}`);
  }
}

export const unifiedDataService = new UnifiedDataService();

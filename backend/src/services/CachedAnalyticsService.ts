import { prisma } from '../index.js';
import { Cached, InvalidateCache, CacheInvalidation } from '../cache/decorators.js';
import { cacheManager } from '../cache/CacheManager.js';

export interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  totalCandidates: number;
  totalInterviews: number;
  activeJobs: number;
  newApplicationsToday: number;
}

export interface ApplicationsByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface ApplicationsByDate {
  date: string;
  count: number;
}

export interface TopJob {
  id: string;
  title: string;
  department: string;
  applicationCount: number;
}

export interface RecentApplication {
  id: string;
  candidateName: string;
  jobTitle: string;
  submittedAt: string;
  status: string;
  score: number;
}

@CacheInvalidation({
  entityType: 'company',
  idExtractor: (args) => args[0], // First argument is usually companyId
})
export class CachedAnalyticsService {
  
  @Cached({
    strategy: 'dashboard_cache',
    ttl: 900, // 15 minutes
    tags: ['dashboard', 'analytics', 'summary'],
    keyGenerator: (companyId: string) => `dashboard_summary_${companyId}`,
  })
  async getDashboardSummary(companyId: string): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalJobs,
      totalApplications,
      totalCandidates,
      totalInterviews,
      activeJobs,
      newApplicationsToday,
    ] = await Promise.all([
      prisma.job.count({
        where: { companyId },
      }),
      prisma.application.count({
        where: { job: { companyId } },
      }),
      prisma.candidate.count({
        where: {
          applications: {
            some: {
              job: { companyId },
            },
          },
        },
      }),
      prisma.interview.count({
        where: {
          application: {
            job: { companyId },
          },
        },
      }),
      prisma.job.count({
        where: {
          companyId,
          status: 'open',
        },
      }),
      prisma.application.count({
        where: {
          job: { companyId },
          submittedAt: {
            gte: today,
          },
        },
      }),
    ]);

    return {
      totalJobs,
      totalApplications,
      totalCandidates,
      totalInterviews,
      activeJobs,
      newApplicationsToday,
    };
  }

  @Cached({
    strategy: 'dashboard_cache',
    ttl: 1800, // 30 minutes
    tags: ['dashboard', 'analytics', 'status'],
    keyGenerator: (companyId: string) => `applications_by_status_${companyId}`,
  })
  async getApplicationsByStatus(companyId: string): Promise<ApplicationsByStatus[]> {
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      where: {
        job: { companyId },
      },
      _count: {
        status: true,
      },
    });

    const total = statusCounts.reduce((sum, item) => sum + item._count.status, 0);

    return statusCounts.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: total > 0 ? Math.round((item._count.status / total) * 100) : 0,
    }));
  }

  @Cached({
    strategy: 'dashboard_cache',
    ttl: 3600, // 1 hour
    tags: ['dashboard', 'analytics', 'timeline'],
    keyGenerator: (companyId: string, days: number) => `applications_by_date_${companyId}_${days}`,
  })
  async getApplicationsByDate(companyId: string, days: number = 30): Promise<ApplicationsByDate[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const applications = await prisma.application.findMany({
      where: {
        job: { companyId },
        submittedAt: {
          gte: startDate,
        },
      },
      select: {
        submittedAt: true,
      },
    });

    // Group by date
    const dateGroups: Record<string, number> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateGroups[dateStr] = 0;
    }

    applications.forEach(app => {
      const dateStr = app.submittedAt.toISOString().split('T')[0];
      if (dateGroups.hasOwnProperty(dateStr)) {
        dateGroups[dateStr]++;
      }
    });

    return Object.entries(dateGroups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  @Cached({
    strategy: 'dashboard_cache',
    ttl: 1800, // 30 minutes
    tags: ['dashboard', 'analytics', 'jobs'],
    keyGenerator: (companyId: string, limit: number) => `top_jobs_${companyId}_${limit}`,
  })
  async getTopJobs(companyId: string, limit: number = 5): Promise<TopJob[]> {
    const topJobs = await prisma.job.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        applications: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return topJobs.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department || 'Unknown',
      applicationCount: job._count.applications,
    }));
  }

  @Cached({
    strategy: 'dashboard_cache',
    ttl: 600, // 10 minutes
    tags: ['dashboard', 'analytics', 'recent'],
    keyGenerator: (companyId: string, limit: number) => `recent_applications_${companyId}_${limit}`,
  })
  async getRecentApplications(companyId: string, limit: number = 10): Promise<RecentApplication[]> {
    const recentApplications = await prisma.application.findMany({
      where: {
        job: { companyId },
      },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: limit,
    });

    return recentApplications.map(app => ({
      id: app.id,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      jobTitle: app.job.title,
      submittedAt: app.submittedAt.toISOString(),
      status: app.status,
      score: app.score || 0,
    }));
  }

  @Cached({
    strategy: 'ai_analysis_cache',
    ttl: 7200, // 2 hours
    tags: ['analytics', 'ai', 'conversion'],
    keyGenerator: (companyId: string) => `conversion_metrics_${companyId}`,
  })
  async getConversionMetrics(companyId: string): Promise<{
    overallConversionRate: number;
    stageConversionRates: Record<string, number>;
    averageTimeToHire: number;
  }> {
    const applications = await prisma.application.findMany({
      where: {
        job: { companyId },
      },
      select: {
        status: true,
        submittedAt: true,
        hiredAt: true,
      },
    });

    const total = applications.length;
    const hired = applications.filter(app => app.status === 'hired').length;
    const overallConversionRate = total > 0 ? (hired / total) * 100 : 0;

    // Calculate stage conversion rates
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stageConversionRates: Record<string, number> = {};
    const stages = ['submitted', 'screening', 'interview', 'assessment', 'offer', 'hired'];
    
    for (let i = 1; i < stages.length; i++) {
      const currentStage = stages[i];
      const previousStage = stages[i - 1];
      const currentCount = statusCounts[currentStage] || 0;
      const previousCount = statusCounts[previousStage] || 0;
      
      stageConversionRates[currentStage] = previousCount > 0 ? (currentCount / previousCount) * 100 : 0;
    }

    // Calculate average time to hire
    const hiredApplications = applications.filter(app => app.hiredAt);
    const averageTimeToHire = hiredApplications.length > 0
      ? hiredApplications.reduce((sum, app) => {
          const days = Math.ceil((app.hiredAt!.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / hiredApplications.length
      : 0;

    return {
      overallConversionRate,
      stageConversionRates,
      averageTimeToHire,
    };
  }

  @InvalidateCache({
    strategies: ['dashboard_cache'],
    tags: ['dashboard', 'analytics'],
  })
  async refreshDashboardCache(companyId: string): Promise<void> {
    // This method will invalidate dashboard cache when called
    console.log(`Dashboard cache refreshed for company ${companyId}`);
  }

  @InvalidateCache({
    strategies: ['ai_analysis_cache'],
    tags: ['ai', 'analytics'],
  })
  async refreshAnalyticsCache(companyId: string): Promise<void> {
    // This method will invalidate analytics cache when called
    console.log(`Analytics cache refreshed for company ${companyId}`);
  }

  // Warm cache for a specific company
  async warmCompanyCache(companyId: string): Promise<void> {
    console.log(`Warming cache for company ${companyId}...`);
    
    try {
      // Warm dashboard cache
      await Promise.all([
        this.getDashboardSummary(companyId),
        this.getApplicationsByStatus(companyId),
        this.getApplicationsByDate(companyId),
        this.getTopJobs(companyId),
        this.getRecentApplications(companyId),
        this.getConversionMetrics(companyId),
      ]);
      
      console.log(`✅ Cache warmed for company ${companyId}`);
    } catch (error) {
      console.error(`❌ Failed to warm cache for company ${companyId}:`, error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<Record<string, any>> {
    return cacheManager.getAllStats();
  }
}

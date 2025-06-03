import express from 'express';
import { prisma } from '../index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { CachedAnalyticsService } from '../services/CachedAnalyticsService.js';
import { unifiedDataService } from '../services/UnifiedDataService.js';
import { cacheManager } from '../cache/CacheManager.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();
const analyticsService = new CachedAnalyticsService();

// Get unified dashboard analytics (candidate-centric)
router.get('/dashboard', asyncHandler(async (req: AuthenticatedRequest, res) => {
  // Use default company for testing when auth is disabled
  const companyId = req.user?.companyId || 'comp_1';

  try {
    console.log(`📊 Fetching unified dashboard data for company: ${companyId}`);

    // Use unified data service for candidate-centric metrics
    const unifiedData = await unifiedDataService.getUnifiedDashboardData(companyId);

    // Transform to match frontend expectations
    const dashboardResponse = {
      // Summary stats
      summary: {
        totalJobs: unifiedData.topJobs.length,
        totalApplications: unifiedData.totalApplications,
        totalCandidates: unifiedData.totalCandidates,
        totalInterviews: unifiedData.totalInterviews,
        activeJobs: unifiedData.topJobs.filter(j => j.applicationCount > 0).length,
        newApplicationsToday: unifiedData.newApplicationsThisMonth, // Simplified for now
      },

      // Status distribution (candidate-based)
      statusDistribution: unifiedData.candidatesByStatus,

      // Time series data
      applicationsByDate: unifiedData.timeSeriesData.map(d => ({
        date: d.date,
        count: d.applications,
      })),

      // Top jobs with candidate metrics
      topJobs: unifiedData.topJobs,

      // Recent applications (candidate-centric)
      recentApplications: unifiedData.recentActivity,

      // Time to hire metrics
      timeToHire: {
        averageDays: unifiedData.averageTimeToHire,
        totalHires: unifiedData.totalHires,
      },

      // Source data (candidate-centric)
      sources: unifiedData.topSources,

      // Change metrics (simplified)
      changeMetrics: {
        totalCandidates: {
          current: unifiedData.totalCandidates,
          change: Math.round((unifiedData.newCandidatesThisMonth / Math.max(unifiedData.totalCandidates - unifiedData.newCandidatesThisMonth, 1)) * 100),
        },
        applications: {
          current: unifiedData.totalApplications,
          change: Math.round((unifiedData.newApplicationsThisMonth / Math.max(unifiedData.totalApplications - unifiedData.newApplicationsThisMonth, 1)) * 100),
        },
      },

      unified: true,
      candidateCentric: true,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Unified dashboard data sent: ${unifiedData.totalCandidates} candidates, ${unifiedData.totalApplications} applications`);
    res.json(dashboardResponse);

  } catch (error) {
    console.error('❌ Unified dashboard analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch unified dashboard analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Get recruitment timeline data
router.get('/recruitment', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId || 'comp_1';
  const { period = '30d' } = req.query;

  try {
    // Get applications over time for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applications = await prisma.application.findMany({
      where: {
        job: { companyId },
        submittedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        submittedAt: true,
        status: true,
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });

    // Group by date and create timeline
    const timelineData = [];
    const dateMap = new Map();

    // Initialize all dates in the range
    for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        applications: 0,
        interviews: 0,
        offers: 0,
      });
    }

    // Count applications by date and status
    applications.forEach(app => {
      if (app.submittedAt) {
        const dateStr = app.submittedAt.toISOString().split('T')[0];
        const dayData = dateMap.get(dateStr);
        if (dayData) {
          dayData.applications++;
          if (['interview', 'assessment'].includes(app.status)) {
            dayData.interviews++;
          }
          if (['offer', 'hired'].includes(app.status)) {
            dayData.offers++;
          }
        }
      }
    });

    const data = Array.from(dateMap.values());

    res.json({
      data,
      period,
      totalApplications: applications.length,
    });
  } catch (error) {
    console.error('Recruitment data error:', error);
    res.status(500).json({ error: 'Failed to fetch recruitment data' });
  }
}));

// Cache management endpoints
router.post('/cache/warm', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId || 'comp_1';

  try {
    await analyticsService.warmCompanyCache(companyId);
    res.json({
      message: 'Cache warmed successfully',
      companyId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache warming error:', error);
    res.status(500).json({ error: 'Failed to warm cache' });
  }
}));

router.post('/cache/refresh', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId || 'comp_1';

  try {
    await analyticsService.refreshDashboardCache(companyId);
    res.json({
      message: 'Cache refreshed successfully',
      companyId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh cache' });
  }
}));

router.get('/cache/stats', asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await analyticsService.getCacheStats();
    res.json({
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
}));

// Get hiring funnel analytics
router.get('/funnel', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId || 'comp_1';
  const { jobId, startDate, endDate } = req.query;

  const where: any = {
    job: { companyId },
  };

  if (jobId) {
    where.jobId = jobId as string;
  }

  if (startDate && endDate) {
    where.submittedAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  // Get funnel data
  const funnelStages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired'];
  
  const funnelData = await Promise.all(
    funnelStages.map(async (stage) => {
      const count = await prisma.application.count({
        where: {
          ...where,
          status: stage,
        },
      });
      return { stage, count };
    })
  );

  // Calculate conversion rates
  const totalApplications = funnelData[0].count;
  const funnelWithRates = funnelData.map((stage, index) => ({
    ...stage,
    conversionRate: totalApplications > 0 ? (stage.count / totalApplications) * 100 : 0,
    dropoffRate: index > 0 ? 
      ((funnelData[index - 1].count - stage.count) / funnelData[index - 1].count) * 100 : 0,
  }));

  res.json({
    funnel: funnelWithRates,
    totalApplications,
  });
}));

// Get time-to-hire analytics
router.get('/time-to-hire', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId || 'comp_1';

  // Get hired applications with their timeline
  const hiredApplications = await prisma.application.findMany({
    where: {
      job: { companyId },
      status: 'hired',
      submittedAt: { not: null },
    },
    include: {
      job: {
        select: {
          title: true,
          department: true,
        },
      },
      candidate: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Calculate time to hire for each application
  const timeToHireData = hiredApplications
    .filter(app => app.submittedAt && app.reviewedAt)
    .map(app => {
      const submittedDate = new Date(app.submittedAt!);
      const hiredDate = new Date(app.reviewedAt!);
      const daysToHire = Math.ceil((hiredDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        applicationId: app.id,
        candidate: `${app.candidate.firstName} ${app.candidate.lastName}`,
        jobTitle: app.job.title,
        department: app.job.department,
        daysToHire,
        submittedAt: app.submittedAt,
        hiredAt: app.reviewedAt,
      };
    });

  // Calculate averages
  const averageTimeToHire = timeToHireData.length > 0 
    ? timeToHireData.reduce((sum, item) => sum + item.daysToHire, 0) / timeToHireData.length 
    : 0;

  // Group by department
  const byDepartment = timeToHireData.reduce((acc, item) => {
    const dept = item.department || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(item.daysToHire);
    return acc;
  }, {} as Record<string, number[]>);

  const departmentAverages = Object.entries(byDepartment).map(([department, days]) => ({
    department,
    averageDays: days.reduce((sum, day) => sum + day, 0) / days.length,
    hires: days.length,
  }));

  res.json({
    averageTimeToHire: Math.round(averageTimeToHire),
    totalHires: timeToHireData.length,
    timeToHireData,
    departmentAverages,
  });
}));

// Get source effectiveness analytics
router.get('/sources', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId || 'comp_1';

  // Get applications with source data
  const applications = await prisma.application.findMany({
    where: {
      job: { companyId },
    },
    select: {
      status: true,
      metadata: true,
    },
  });

  // Extract source data and calculate metrics
  const sourceData = applications.reduce((acc, app) => {
    const metadata = app.metadata as any;
    const source = metadata?.source || 'unknown';
    
    if (!acc[source]) {
      acc[source] = {
        total: 0,
        hired: 0,
        interviewed: 0,
      };
    }
    
    acc[source].total++;
    
    if (app.status === 'hired') {
      acc[source].hired++;
    }
    
    if (['interview', 'assessment', 'offer', 'hired'].includes(app.status)) {
      acc[source].interviewed++;
    }
    
    return acc;
  }, {} as Record<string, { total: number; hired: number; interviewed: number }>);

  // Calculate conversion rates
  const sourceEffectiveness = Object.entries(sourceData).map(([source, data]) => ({
    source,
    applications: data.total,
    interviews: data.interviewed,
    hires: data.hired,
    interviewRate: data.total > 0 ? (data.interviewed / data.total) * 100 : 0,
    hireRate: data.total > 0 ? (data.hired / data.total) * 100 : 0,
  }));

  res.json({
    sourceEffectiveness: sourceEffectiveness.sort((a, b) => b.applications - a.applications),
    totalApplications: applications.length,
  });
}));

// Get change metrics (percentage changes)
router.get('/changes', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId || 'comp_1';

  try {
    const changeMetrics = await analyticsService.getChangeMetrics(companyId);
    res.json(changeMetrics);
  } catch (error) {
    console.error('Change metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch change metrics' });
  }
}));

// Get top jobs with enhanced data
router.get('/top-jobs', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user?.companyId || 'comp_1';
  const limit = parseInt(req.query.limit as string) || 5;

  try {
    const topJobs = await analyticsService.getTopJobs(companyId, limit);
    res.json({ jobs: topJobs });
  } catch (error) {
    console.error('Top jobs analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch top jobs' });
  }
}));

export default router;

import express from 'express';
import { prisma } from '../index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { CachedAnalyticsService } from '../services/CachedAnalyticsService.js';
import { cacheManager } from '../cache/CacheManager.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();
const analyticsService = new CachedAnalyticsService();

// Get dashboard analytics (cached)
router.get('/dashboard', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user!.companyId;

  try {
    // Use cached analytics service
    const [
      summary,
      statusDistribution,
      applicationsByDate,
      topJobs,
      recentApplications,
    ] = await Promise.all([
      analyticsService.getDashboardSummary(companyId),
      analyticsService.getApplicationsByStatus(companyId),
      analyticsService.getApplicationsByDate(companyId, 30),
      analyticsService.getTopJobs(companyId, 5),
      analyticsService.getRecentApplications(companyId, 10),
    ]);

    res.json({
      summary,
      statusDistribution,
      applicationsByDate,
      topJobs,
      recentApplications,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
}));

// Cache management endpoints
router.post('/cache/warm', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user!.companyId;

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
  const companyId = req.user!.companyId;

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
  const companyId = req.user!.companyId;
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
  const companyId = req.user!.companyId;

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
  const companyId = req.user!.companyId;

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

export default router;

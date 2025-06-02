import express from 'express';
import { prisma } from '../index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const companyId = req.user!.companyId;

  // Get date range (default to last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Total counts
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
      where: {
        job: { companyId },
      },
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
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  // Application status distribution
  const statusDistribution = await prisma.application.groupBy({
    by: ['status'],
    where: {
      job: { companyId },
    },
    _count: {
      status: true,
    },
  });

  // Applications over time (last 30 days)
  const applicationsOverTime = await prisma.application.findMany({
    where: {
      job: { companyId },
      submittedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      submittedAt: true,
    },
    orderBy: {
      submittedAt: 'asc',
    },
  });

  // Group applications by date
  const applicationsByDate = applicationsOverTime.reduce((acc, app) => {
    if (app.submittedAt) {
      const date = app.submittedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Top performing jobs
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
    take: 5,
  });

  // Recent activity
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
    take: 10,
  });

  res.json({
    summary: {
      totalJobs,
      totalApplications,
      totalCandidates,
      totalInterviews,
      activeJobs,
      newApplicationsToday,
    },
    statusDistribution,
    applicationsByDate,
    topJobs,
    recentApplications,
  });
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

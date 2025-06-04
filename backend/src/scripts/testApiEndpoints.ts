import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test API Endpoints Script
 * Tests the database queries that the Dashboard API endpoints use
 */

async function testApiEndpoints() {
  console.log('🔍 Testing Dashboard API endpoints...');

  try {
    // Test 1: Basic data counts
    console.log('\n📊 Testing basic data counts...');
    const candidateCount = await prisma.candidate.count();
    const applicationCount = await prisma.application.count();
    const interviewCount = await prisma.interview.count();
    const jobCount = await prisma.job.count();
    
    console.log(`✅ Candidates: ${candidateCount}`);
    console.log(`✅ Applications: ${applicationCount}`);
    console.log(`✅ Interviews: ${interviewCount}`);
    console.log(`✅ Jobs: ${jobCount}`);

    // Test 2: Recent applications (for Recent Applications card)
    console.log('\n📝 Testing recent applications...');
    const recentApps = await prisma.application.findMany({
      where: {
        job: { companyId: 'comp_1' },
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
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
      take: 5,
    });
    
    console.log(`✅ Recent applications (last 7 days): ${recentApps.length}`);
    recentApps.forEach(app => {
      console.log(`   - ${app.candidate.firstName} ${app.candidate.lastName} → ${app.job.title} (${app.submittedAt})`);
    });

    // Test 3: Upcoming interviews (for Upcoming Interviews card)
    console.log('\n📅 Testing upcoming interviews...');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        application: {
          job: { companyId: 'comp_1' },
        },
        scheduledDate: {
          gte: now,
          lte: nextWeek,
        },
        status: 'scheduled',
      },
      include: {
        application: {
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
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });
    
    console.log(`✅ Upcoming interviews (next 7 days): ${upcomingInterviews.length}`);
    upcomingInterviews.forEach(interview => {
      console.log(`   - ${interview.application.candidate.firstName} ${interview.application.candidate.lastName} → ${interview.application.job.title} (${interview.scheduledDate})`);
    });

    // Test 4: Top jobs (for Top Job Openings card)
    console.log('\n💼 Testing top jobs...');
    const topJobs = await prisma.job.findMany({
      where: {
        companyId: 'comp_1',
        status: 'active',
      },
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
    
    console.log(`✅ Top jobs by application count: ${topJobs.length}`);
    topJobs.forEach(job => {
      console.log(`   - ${job.title} (${job.department}): ${job._count.applications} applications`);
    });

    // Test 5: Recruitment timeline data (for Recruitment Pipeline chart)
    console.log('\n📈 Testing recruitment timeline...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const timelineApps = await prisma.application.findMany({
      where: {
        job: { companyId: 'comp_1' },
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
    
    console.log(`✅ Applications in last 30 days: ${timelineApps.length}`);
    
    // Group by date
    const dateGroups = timelineApps.reduce((acc, app) => {
      if (!app.submittedAt) return acc;
      
      const dateStr = app.submittedAt.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = { applications: 0, interviews: 0, offers: 0 };
      }
      
      acc[dateStr].applications++;
      if (['interview', 'assessment', 'offer', 'hired'].includes(app.status)) {
        acc[dateStr].interviews++;
      }
      if (['offer', 'hired'].includes(app.status)) {
        acc[dateStr].offers++;
      }
      
      return acc;
    }, {} as Record<string, { applications: number; interviews: number; offers: number }>);
    
    const timelineData = Object.entries(dateGroups)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`✅ Timeline data points: ${timelineData.length}`);
    if (timelineData.length > 0) {
      console.log(`   First: ${timelineData[0].date} - ${timelineData[0].applications} apps`);
      console.log(`   Last: ${timelineData[timelineData.length - 1].date} - ${timelineData[timelineData.length - 1].applications} apps`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('💡 If Dashboard cards are still empty, check the frontend API calls and error handling.');

  } catch (error) {
    console.error('❌ Error testing API endpoints:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
testApiEndpoints();

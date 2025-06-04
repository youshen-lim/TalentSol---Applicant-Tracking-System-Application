import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDashboardData() {
  console.log('🔍 Checking Dashboard Data Issues...');
  
  try {
    // Check basic counts
    const [candidates, applications, interviews, jobs] = await Promise.all([
      prisma.candidate.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.job.count(),
    ]);
    
    console.log('\n📊 Basic Counts:');
    console.log(`👥 Candidates: ${candidates}`);
    console.log(`📝 Applications: ${applications}`);
    console.log(`🎯 Interviews: ${interviews}`);
    console.log(`💼 Jobs: ${jobs}`);
    
    // Check Time to Hire data
    console.log('\n🕒 Time to Hire Analysis:');
    const hiredApps = await prisma.application.findMany({
      where: {
        status: 'hired',
        hiredAt: { not: null }
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        hiredAt: true,
        candidateInfo: true
      }
    });
    
    console.log(`📈 Applications with hired status and hiredAt: ${hiredApps.length}`);
    
    if (hiredApps.length > 0) {
      console.log('\n📋 Sample hired applications:');
      hiredApps.slice(0, 3).forEach(app => {
        const days = app.hiredAt && app.submittedAt ? 
          Math.ceil((app.hiredAt.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        console.log(`   ${app.id}: ${app.submittedAt?.toISOString().split('T')[0]} → ${app.hiredAt?.toISOString().split('T')[0]} (${days} days)`);
      });
    }
    
    // Check Interviews This Week data
    console.log('\n📅 Interviews This Week Analysis:');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    console.log(`🗓️  Current date: ${now.toISOString().split('T')[0]}`);
    console.log(`🗓️  Next week: ${nextWeek.toISOString().split('T')[0]}`);
    
    const allInterviews = await prisma.interview.findMany({
      select: {
        id: true,
        scheduledDate: true,
        status: true,
        type: true
      },
      orderBy: { scheduledDate: 'asc' }
    });
    
    console.log(`📊 Total interviews in database: ${allInterviews.length}`);
    
    if (allInterviews.length > 0) {
      console.log('\n📋 All interviews:');
      allInterviews.forEach(interview => {
        const isUpcoming = interview.scheduledDate && interview.scheduledDate >= now && interview.scheduledDate <= nextWeek;
        console.log(`   ${interview.id}: ${interview.scheduledDate?.toISOString().split('T')[0]} (${interview.status}) ${isUpcoming ? '✅ UPCOMING' : '❌ NOT UPCOMING'}`);
      });
    }
    
    const upcomingInterviews = await prisma.interview.count({
      where: {
        status: 'scheduled',
        scheduledDate: {
          gte: now,
          lte: nextWeek
        }
      }
    });
    
    console.log(`📈 Upcoming interviews (next 7 days): ${upcomingInterviews}`);
    
    // Check Candidate Sources
    console.log('\n📊 Candidate Sources Analysis:');
    const applicationsForSources = await prisma.application.findMany({
      select: {
        metadata: true
      }
    });

    const sources = applicationsForSources.map(app => {
      const metadata = app.metadata as any;
      return metadata?.source || 'unknown';
    });
    
    const sourceCounts = sources.reduce((acc, source) => {
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📋 Source distribution:');
    Object.entries(sourceCounts).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} candidates`);
    });
    
    // Recommendations
    console.log('\n💡 Issues and Recommendations:');
    
    if (hiredApps.length === 0) {
      console.log('❌ Time to Hire: No hired applications with hiredAt dates');
    } else if (hiredApps.length > 0) {
      const avgDays = hiredApps.reduce((sum, app) => {
        const days = app.hiredAt && app.submittedAt ? 
          Math.ceil((app.hiredAt.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return sum + days;
      }, 0) / hiredApps.length;
      console.log(`✅ Time to Hire: ${hiredApps.length} hired apps, avg ${avgDays.toFixed(1)} days`);
    }
    
    if (upcomingInterviews === 0) {
      console.log('❌ Interviews This Week: No interviews scheduled for next 7 days');
      console.log('   - Check if interview dates are in the future');
      console.log('   - Check if interview status is "scheduled"');
    } else {
      console.log(`✅ Interviews This Week: ${upcomingInterviews} upcoming interviews`);
    }
    
    if (Object.keys(sourceCounts).length === 1) {
      console.log('❌ Candidate Sources: Only one source type found');
      console.log('   - Add variety to application metadata.source field');
    } else {
      console.log(`✅ Candidate Sources: ${Object.keys(sourceCounts).length} different sources`);
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDashboardData();

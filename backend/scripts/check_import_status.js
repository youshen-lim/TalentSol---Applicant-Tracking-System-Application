const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImportStatus() {
  console.log('🔍 Checking TalentSol database import status...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check record counts
    const [candidates, applications, interviews, jobs] = await Promise.all([
      prisma.candidate.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.job.count(),
    ]);
    
    console.log('\n📊 Database Record Counts:');
    console.log(`👥 Candidates: ${candidates}`);
    console.log(`📝 Applications: ${applications}`);
    console.log(`🎯 Interviews: ${interviews}`);
    console.log(`💼 Jobs: ${jobs}`);
    
    // Check specific metrics data
    const hiredApplications = await prisma.application.count({
      where: {
        status: 'hired',
        hiredAt: { not: null }
      }
    });
    
    const upcomingInterviews = await prisma.interview.count({
      where: {
        status: 'scheduled',
        scheduledDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    console.log('\n🎯 Dashboard Metrics Data:');
    console.log(`📈 Hired applications with hired_at: ${hiredApplications}`);
    console.log(`📅 Upcoming interviews (next 7 days): ${upcomingInterviews}`);
    
    // Show sample data
    if (hiredApplications > 0) {
      const sampleHired = await prisma.application.findFirst({
        where: { status: 'hired', hiredAt: { not: null } },
        select: { id: true, status: true, submittedAt: true, hiredAt: true }
      });
      console.log('\n📋 Sample hired application:', sampleHired);
    }
    
    if (upcomingInterviews > 0) {
      const sampleInterview = await prisma.interview.findFirst({
        where: { status: 'scheduled' },
        select: { id: true, type: true, scheduledDate: true, status: true }
      });
      console.log('📋 Sample upcoming interview:', sampleInterview);
    }
    
    // Determine if metrics should work
    const metricsWorking = hiredApplications > 0 && upcomingInterviews > 0;
    console.log(`\n${metricsWorking ? '✅' : '❌'} Dashboard metrics should ${metricsWorking ? 'work' : 'still show zero'}`);
    
    if (!metricsWorking) {
      console.log('\n💡 To fix the metrics:');
      if (hiredApplications === 0) console.log('   - Need applications with status="hired" and hiredAt field');
      if (upcomingInterviews === 0) console.log('   - Need interviews with status="scheduled" in next 7 days');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImportStatus();

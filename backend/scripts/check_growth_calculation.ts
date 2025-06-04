import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGrowthCalculation() {
  console.log('🔍 Checking Growth Calculation for +39% indicator...');
  
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    console.log(`📅 Current date: ${now.toISOString().split('T')[0]}`);
    console.log(`📅 30 days ago: ${thirtyDaysAgo.toISOString().split('T')[0]}`);
    
    // Get all applications with their submission dates
    const applications = await prisma.application.findMany({
      where: {
        job: { companyId: 'comp_1' }
      },
      select: {
        id: true,
        submittedAt: true,
        candidateId: true
      },
      orderBy: { submittedAt: 'desc' }
    });
    
    console.log(`\n📊 Total applications: ${applications.length}`);
    
    // Group by time periods
    const newApplicationsThisMonth = applications.filter(app => 
      app.submittedAt >= thirtyDaysAgo
    );
    
    const oldApplications = applications.filter(app => 
      app.submittedAt < thirtyDaysAgo
    );
    
    console.log(`📈 Applications in last 30 days: ${newApplicationsThisMonth.length}`);
    console.log(`📉 Applications before 30 days: ${oldApplications.length}`);
    
    // Get unique candidates for each period
    const newCandidateIds = new Set(newApplicationsThisMonth.map(app => app.candidateId));
    const oldCandidateIds = new Set(oldApplications.map(app => app.candidateId));
    
    // Remove overlap (candidates who applied in both periods)
    const uniqueNewCandidates = [...newCandidateIds].filter(id => !oldCandidateIds.has(id));
    const uniqueOldCandidates = [...oldCandidateIds].filter(id => !newCandidateIds.has(id));
    
    console.log(`\n👥 Unique new candidates (last 30 days): ${uniqueNewCandidates.length}`);
    console.log(`👥 Unique old candidates (before 30 days): ${uniqueOldCandidates.length}`);
    console.log(`👥 Candidates in both periods: ${[...newCandidateIds].filter(id => oldCandidateIds.has(id)).length}`);
    
    // Calculate growth using the same formula as the backend
    const totalCandidates = newCandidateIds.size + uniqueOldCandidates.length;
    const newCandidatesThisMonth = uniqueNewCandidates.length;
    const previousPeriodCandidates = Math.max(totalCandidates - newCandidatesThisMonth, 1);
    
    const growthPercentage = Math.round((newCandidatesThisMonth / previousPeriodCandidates) * 100);
    
    console.log(`\n🧮 Growth Calculation:`);
    console.log(`   Total candidates: ${totalCandidates}`);
    console.log(`   New candidates this month: ${newCandidatesThisMonth}`);
    console.log(`   Previous period candidates: ${previousPeriodCandidates}`);
    console.log(`   Formula: (${newCandidatesThisMonth} ÷ ${previousPeriodCandidates}) × 100`);
    console.log(`   Growth percentage: ${growthPercentage}%`);
    
    // Show sample dates to understand the distribution
    console.log(`\n📋 Sample submission dates:`);
    console.log(`   Recent applications (last 5):`);
    newApplicationsThisMonth.slice(0, 5).forEach(app => {
      console.log(`      ${app.id}: ${app.submittedAt.toISOString().split('T')[0]}`);
    });
    
    if (oldApplications.length > 0) {
      console.log(`   Older applications (last 5):`);
      oldApplications.slice(0, 5).forEach(app => {
        console.log(`      ${app.id}: ${app.submittedAt.toISOString().split('T')[0]}`);
      });
    }
    
    console.log(`\n💡 The +39% growth indicator means:`);
    console.log(`   - You gained ${newCandidatesThisMonth} new candidates in the last 30 days`);
    console.log(`   - Compared to ${previousPeriodCandidates} candidates from the previous period`);
    console.log(`   - This represents a ${growthPercentage}% increase in candidate acquisition`);
    
  } catch (error) {
    console.error('❌ Error checking growth calculation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGrowthCalculation();

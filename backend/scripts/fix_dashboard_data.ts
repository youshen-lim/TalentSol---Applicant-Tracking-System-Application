import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDashboardData() {
  console.log('🔧 Fixing Dashboard Data Issues...');
  
  try {
    // Fix 1: Update hired_at dates to be AFTER submitted_at dates
    console.log('\n📈 Fixing Time to Hire dates...');
    
    const hiredApps = await prisma.application.findMany({
      where: { status: 'hired' },
      select: { id: true, submittedAt: true }
    });
    
    for (const app of hiredApps) {
      if (app.submittedAt) {
        // Add 15-45 days to submission date for realistic hiring time
        const daysToAdd = Math.floor(Math.random() * 30) + 15; // 15-45 days
        const hiredAt = new Date(app.submittedAt.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        
        await prisma.application.update({
          where: { id: app.id },
          data: { hiredAt }
        });
        
        console.log(`   ✅ ${app.id}: ${app.submittedAt.toISOString().split('T')[0]} → ${hiredAt.toISOString().split('T')[0]} (+${daysToAdd} days)`);
      }
    }
    
    // Fix 2: Update interview dates to be in the next 7 days
    console.log('\n📅 Fixing Interview dates...');
    
    const now = new Date();
    const interviews = await prisma.interview.findMany({
      select: { id: true }
    });
    
    for (let i = 0; i < interviews.length; i++) {
      const interview = interviews[i];
      // Schedule interviews over the next 7 days
      const daysAhead = Math.floor(Math.random() * 7); // 0-6 days ahead
      const hoursAhead = Math.floor(Math.random() * 9) + 9; // 9 AM - 5 PM
      const minutesAhead = Math.random() > 0.5 ? 0 : 30; // On the hour or half hour
      
      const scheduledDate = new Date(now);
      scheduledDate.setDate(now.getDate() + daysAhead);
      scheduledDate.setHours(hoursAhead, minutesAhead, 0, 0);
      
      await prisma.interview.update({
        where: { id: interview.id },
        data: { scheduledDate }
      });
      
      console.log(`   ✅ ${interview.id}: ${scheduledDate.toISOString().split('T')[0]} ${scheduledDate.toTimeString().split(' ')[0]}`);
    }
    
    // Fix 3: Add variety to candidate sources
    console.log('\n📊 Fixing Candidate Sources...');
    
    const sources = ['website', 'linkedin', 'referral', 'job_board', 'recruiter', 'career_fair'];
    const applications = await prisma.application.findMany({
      select: { id: true, metadata: true }
    });
    
    for (const app of applications) {
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const currentMetadata = app.metadata as any || {};
      
      const updatedMetadata = {
        ...currentMetadata,
        source: randomSource
      };
      
      await prisma.application.update({
        where: { id: app.id },
        data: { metadata: updatedMetadata }
      });
    }
    
    // Show source distribution
    const sourceCounts = sources.reduce((acc, source) => {
      acc[source] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    const updatedApps = await prisma.application.findMany({
      select: { metadata: true }
    });
    
    updatedApps.forEach(app => {
      const metadata = app.metadata as any;
      const source = metadata?.source || 'unknown';
      if (sourceCounts[source] !== undefined) {
        sourceCounts[source]++;
      }
    });
    
    console.log('   📋 New source distribution:');
    Object.entries(sourceCounts).forEach(([source, count]) => {
      console.log(`      ${source}: ${count} candidates`);
    });
    
    // Verification
    console.log('\n🔍 Verification...');
    
    // Check Time to Hire
    const verifyHired = await prisma.application.findMany({
      where: {
        status: 'hired',
        hiredAt: { not: null }
      },
      select: { submittedAt: true, hiredAt: true }
    });
    
    const avgDays = verifyHired.reduce((sum, app) => {
      const days = app.hiredAt && app.submittedAt ? 
        Math.ceil((app.hiredAt.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return sum + days;
    }, 0) / verifyHired.length;
    
    console.log(`   ✅ Time to Hire: ${verifyHired.length} hired apps, avg ${avgDays.toFixed(1)} days`);
    
    // Check Upcoming Interviews
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingCount = await prisma.interview.count({
      where: {
        status: 'scheduled',
        scheduledDate: {
          gte: now,
          lte: nextWeek
        }
      }
    });
    
    console.log(`   ✅ Upcoming Interviews: ${upcomingCount} scheduled for next 7 days`);
    
    // Check Sources
    const uniqueSources = new Set(updatedApps.map(app => {
      const metadata = app.metadata as any;
      return metadata?.source || 'unknown';
    }));
    
    console.log(`   ✅ Candidate Sources: ${uniqueSources.size} different sources`);
    
    console.log('\n🎉 Dashboard data fixes completed!');
    console.log('💡 Refresh your Dashboard to see the updated metrics');
    
  } catch (error) {
    console.error('❌ Error fixing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDashboardData();

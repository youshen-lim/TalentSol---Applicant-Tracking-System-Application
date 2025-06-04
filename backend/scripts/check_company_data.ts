import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCompanyData() {
  console.log('🔍 Checking Company Data and API Issues...');
  
  try {
    // Check what companies exist
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });
    
    console.log('\n🏢 Companies in database:');
    companies.forEach(company => {
      console.log(`   ${company.id}: ${company.name}`);
    });
    
    // Check what jobs exist and their company associations
    const jobs = await prisma.job.findMany({
      select: { id: true, title: true, companyId: true }
    });
    
    console.log('\n💼 Jobs and their company associations:');
    jobs.forEach(job => {
      console.log(`   ${job.id}: ${job.title} (company: ${job.companyId})`);
    });
    
    // Check applications and their job associations
    const applications = await prisma.application.findMany({
      select: { 
        id: true, 
        status: true, 
        hiredAt: true,
        job: { select: { id: true, companyId: true } }
      }
    });
    
    console.log('\n📝 Applications and their company associations:');
    const companyGroups = applications.reduce((acc, app) => {
      const companyId = app.job.companyId;
      if (!acc[companyId]) acc[companyId] = [];
      acc[companyId].push(app);
      return acc;
    }, {} as Record<string, any[]>);
    
    Object.entries(companyGroups).forEach(([companyId, apps]) => {
      const hiredCount = apps.filter(app => app.status === 'hired' && app.hiredAt).length;
      console.log(`   Company ${companyId}: ${apps.length} applications, ${hiredCount} hired`);
    });
    
    // Check interviews and their company associations
    const interviews = await prisma.interview.findMany({
      select: { 
        id: true, 
        status: true, 
        scheduledDate: true,
        application: { 
          select: { 
            job: { select: { companyId: true } }
          }
        }
      }
    });
    
    console.log('\n🎯 Interviews and their company associations:');
    const interviewCompanyGroups = interviews.reduce((acc, interview) => {
      const companyId = interview.application.job.companyId;
      if (!acc[companyId]) acc[companyId] = [];
      acc[companyId].push(interview);
      return acc;
    }, {} as Record<string, any[]>);
    
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    Object.entries(interviewCompanyGroups).forEach(([companyId, interviews]) => {
      const upcomingCount = interviews.filter(interview => 
        interview.status === 'scheduled' && 
        interview.scheduledDate && 
        interview.scheduledDate >= now && 
        interview.scheduledDate <= nextWeek
      ).length;
      console.log(`   Company ${companyId}: ${interviews.length} interviews, ${upcomingCount} upcoming`);
    });
    
    // Test the API queries with the default company ID
    const defaultCompanyId = 'comp_1';
    console.log(`\n🔍 Testing API queries with default company ID: ${defaultCompanyId}`);
    
    // Test Time to Hire query
    const hiredAppsForCompany = await prisma.application.findMany({
      where: {
        job: { companyId: defaultCompanyId },
        status: 'hired',
        hiredAt: { not: null },
      },
      select: {
        submittedAt: true,
        hiredAt: true,
      },
    });
    
    console.log(`   📈 Hired applications for ${defaultCompanyId}: ${hiredAppsForCompany.length}`);
    
    if (hiredAppsForCompany.length > 0) {
      const avgDays = hiredAppsForCompany.reduce((sum, app) => {
        const days = app.hiredAt && app.submittedAt ? 
          Math.ceil((app.hiredAt.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return sum + days;
      }, 0) / hiredAppsForCompany.length;
      console.log(`   📊 Average time to hire: ${avgDays.toFixed(1)} days`);
    }
    
    // Test Upcoming Interviews query
    const upcomingInterviewsForCompany = await prisma.interview.findMany({
      where: {
        application: {
          job: { companyId: defaultCompanyId },
        },
        scheduledDate: {
          gte: now,
          lte: nextWeek,
        },
        status: 'scheduled',
      },
    });
    
    console.log(`   📅 Upcoming interviews for ${defaultCompanyId}: ${upcomingInterviewsForCompany.length}`);
    
    // Recommendations
    console.log('\n💡 Issues and Recommendations:');
    
    if (companies.length === 0) {
      console.log('❌ No companies found in database');
      console.log('   - Need to create a company with ID "comp_1"');
    } else if (!companies.find(c => c.id === defaultCompanyId)) {
      console.log(`❌ Default company "${defaultCompanyId}" not found`);
      console.log('   - Need to create a company with this ID or update jobs to use existing company ID');
    }
    
    const jobsWithoutCompany = jobs.filter(job => !job.companyId || job.companyId !== defaultCompanyId);
    if (jobsWithoutCompany.length > 0) {
      console.log(`❌ ${jobsWithoutCompany.length} jobs not associated with default company "${defaultCompanyId}"`);
      console.log('   - Need to update job.companyId to match default company');
    }
    
    if (hiredAppsForCompany.length === 0) {
      console.log('❌ No hired applications found for default company');
      console.log('   - Time to Hire metric will show 0');
    }
    
    if (upcomingInterviewsForCompany.length === 0) {
      console.log('❌ No upcoming interviews found for default company');
      console.log('   - Interviews This Week metric will show 0');
    }
    
  } catch (error) {
    console.error('❌ Error checking company data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanyData();

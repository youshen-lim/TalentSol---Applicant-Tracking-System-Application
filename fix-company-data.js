// Fix company data structure for TalentSol ATS
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCompanyData() {
  console.log('🔧 Fixing Company Data Structure for TalentSol ATS...\n');

  try {
    // 1. Ensure company 'comp_1' exists (the user's company using the ATS)
    console.log('1️⃣ Checking user company (comp_1)...');
    
    let userCompany = await prisma.company.findUnique({
      where: { id: 'comp_1' }
    });
    
    if (!userCompany) {
      console.log('   Creating user company comp_1...');
      userCompany = await prisma.company.create({
        data: {
          id: 'comp_1',
          name: 'TalentSol Demo Company',
          domain: 'talentsol.com'
        }
      });
      console.log('   ✅ Created user company:', userCompany.name);
    } else {
      console.log('   ✅ User company exists:', userCompany.name);
    }

    // 2. Check jobs posted by the user company
    console.log('\n2️⃣ Checking jobs posted by user company...');
    
    const jobs = await prisma.job.findMany({
      where: { companyId: 'comp_1' },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
    
    console.log(`   Found ${jobs.length} jobs posted by user company`);
    jobs.forEach(job => {
      console.log(`   - ${job.title}: ${job._count.applications} applications`);
    });

    // 3. If no jobs exist, we need to update existing jobs to belong to comp_1
    if (jobs.length === 0) {
      console.log('\n   ⚠️ No jobs found for user company. Checking all jobs...');
      
      const allJobs = await prisma.job.findMany({
        select: {
          id: true,
          title: true,
          companyId: true
        },
        take: 5
      });
      
      console.log(`   Found ${allJobs.length} total jobs in database`);
      
      if (allJobs.length > 0) {
        console.log('   Updating jobs to belong to user company...');
        
        // Update all jobs to belong to comp_1 (since this is the user's company)
        const updateResult = await prisma.job.updateMany({
          data: {
            companyId: 'comp_1'
          }
        });
        
        console.log(`   ✅ Updated ${updateResult.count} jobs to belong to user company`);
      }
    }

    // 4. Check applications to jobs posted by user company
    console.log('\n3️⃣ Checking applications to user company jobs...');
    
    const applicationCount = await prisma.application.count({
      where: {
        job: {
          companyId: 'comp_1'
        }
      }
    });
    
    console.log(`   Found ${applicationCount} applications to user company jobs`);

    // 5. Show sample applications if they exist
    if (applicationCount > 0) {
      const sampleApps = await prisma.application.findMany({
        where: {
          job: {
            companyId: 'comp_1'
          }
        },
        take: 3,
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          job: {
            select: {
              title: true
            }
          }
        }
      });

      console.log('\n   📋 Sample applications:');
      sampleApps.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.candidate.firstName} ${app.candidate.lastName} -> ${app.job.title} (${app.status})`);
      });
    }

    // 6. Final verification - test the API query
    console.log('\n4️⃣ Testing API query logic...');
    
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalApplications = await prisma.application.count({
      where: {
        job: { companyId: 'comp_1' },
        submittedAt: { gte: currentMonth }
      }
    });
    
    const newApplications = await prisma.application.count({
      where: {
        job: { companyId: 'comp_1' },
        submittedAt: { gte: oneWeekAgo }
      }
    });
    
    const hiredApplications = await prisma.application.count({
      where: {
        job: { companyId: 'comp_1' },
        status: 'hired'
      }
    });
    
    const allAppsForCompany = await prisma.application.count({
      where: {
        job: { companyId: 'comp_1' }
      }
    });
    
    const conversionRate = allAppsForCompany > 0 ? 
      Math.round((hiredApplications / allAppsForCompany) * 100 * 10) / 10 : 0;
    
    console.log('\n   📊 API Results:');
    console.log(`   - Total Applications (current month): ${totalApplications}`);
    console.log(`   - New Applications (last 7 days): ${newApplications}`);
    console.log(`   - Conversion Rate: ${conversionRate}% (${hiredApplications}/${allAppsForCompany})`);
    
    if (totalApplications > 0) {
      console.log('\n   ✅ SUCCESS: API should now return real data!');
    } else {
      console.log('\n   ⚠️ Still no applications found. You may need to import data.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCompanyData();

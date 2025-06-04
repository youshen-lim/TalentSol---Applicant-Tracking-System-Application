// Fix company assignment for admin user
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCompanyAssignment() {
  console.log('🔧 Fixing Company Assignment for Admin User...\n');

  try {
    // 1. Check current companies
    console.log('📊 Current Companies:');
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            jobs: true,
            users: true
          }
        }
      }
    });
    
    if (companies.length === 0) {
      console.log('❌ No companies found in database!');
      return;
    }

    companies.forEach((company, index) => {
      console.log(`  ${index + 1}. ID: ${company.id} | Name: ${company.name} | Jobs: ${company._count.jobs} | Users: ${company._count.users}`);
    });

    // 2. Check applications by company
    console.log('\n📝 Applications by Company:');
    let bestCompany = null;
    let maxApplications = 0;

    for (const company of companies) {
      const applicationCount = await prisma.application.count({
        where: {
          job: {
            companyId: company.id
          }
        }
      });
      
      console.log(`  - ${company.name} (${company.id}): ${applicationCount} applications`);
      
      if (applicationCount > maxApplications) {
        maxApplications = applicationCount;
        bestCompany = company;
      }
    }

    if (!bestCompany) {
      console.log('\n❌ No company found with applications!');
      console.log('💡 You may need to import data or create test applications.');
      return;
    }

    console.log(`\n🎯 Best company for admin user: ${bestCompany.name} (${bestCompany.id}) with ${maxApplications} applications`);

    // 3. Check current admin assignment
    console.log('\n🔍 Current Admin Assignment:');
    console.log('Current hardcoded companyId in auth.ts: comp_1');
    console.log(`Recommended companyId: ${bestCompany.id}`);

    // 4. Show what the fix should be
    console.log('\n✅ SOLUTION:');
    console.log('Update the auth.ts file to use the correct company ID:');
    console.log(`Change line 34 from: companyId: 'comp_1',`);
    console.log(`To: companyId: '${bestCompany.id}',`);

    // 5. Test the current assignment
    console.log('\n🧪 Testing Current Assignment:');
    const currentApps = await prisma.application.count({
      where: {
        job: {
          companyId: 'comp_1'
        }
      }
    });
    console.log(`Applications for current admin company (comp_1): ${currentApps}`);

    const newApps = await prisma.application.count({
      where: {
        job: {
          companyId: bestCompany.id
        }
      }
    });
    console.log(`Applications for recommended company (${bestCompany.id}): ${newApps}`);

    // 6. Show sample applications for verification
    if (newApps > 0) {
      console.log('\n📋 Sample Applications for Recommended Company:');
      const sampleApps = await prisma.application.findMany({
        where: {
          job: {
            companyId: bestCompany.id
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

      sampleApps.forEach((app, index) => {
        console.log(`  ${index + 1}. ${app.candidate.firstName} ${app.candidate.lastName} -> ${app.job.title} (Status: ${app.status})`);
      });
    }

    return bestCompany.id;

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCompanyAssignment().then((companyId) => {
  if (companyId) {
    console.log(`\n🎉 Run this command to automatically fix the auth.ts file:`);
    console.log(`node -e "const fs = require('fs'); const content = fs.readFileSync('backend/src/middleware/auth.ts', 'utf8'); const fixed = content.replace(/companyId: 'comp_1'/, \\"companyId: '${companyId}'\\")); fs.writeFileSync('backend/src/middleware/auth.ts', fixed);"`);
  }
});

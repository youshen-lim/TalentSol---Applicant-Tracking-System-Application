// Quick script to check companies and applications
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function checkCompanies() {
  try {
    console.log('🔍 Checking companies and applications...\n');

    // Get all companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
      }
    });

    console.log('📊 Companies found:');
    for (const company of companies) {
      console.log(`  - ${company.id}: ${company.name}`);
      
      // Count applications for this company
      const appCount = await prisma.application.count({
        where: {
          job: {
            companyId: company.id
          }
        }
      });
      console.log(`    Applications: ${appCount}`);
    }

    // Find the company with the most applications
    let bestCompany = null;
    let maxApps = 0;

    for (const company of companies) {
      const appCount = await prisma.application.count({
        where: {
          job: {
            companyId: company.id
          }
        }
      });
      
      if (appCount > maxApps) {
        maxApps = appCount;
        bestCompany = company;
      }
    }

    if (bestCompany) {
      console.log(`\n✅ Best company: ${bestCompany.id} (${bestCompany.name}) with ${maxApps} applications`);
      
      // Update auth.ts file
      const authPath = 'backend/src/middleware/auth.ts';
      const authContent = fs.readFileSync(authPath, 'utf8');
      const updatedContent = authContent.replace(
        /companyId: 'comp_1'/,
        `companyId: '${bestCompany.id}'`
      );
      
      if (authContent !== updatedContent) {
        fs.writeFileSync(authPath, updatedContent);
        console.log(`🔧 Updated auth.ts to use company ID: ${bestCompany.id}`);
      } else {
        console.log(`ℹ️ auth.ts already uses correct company ID`);
      }
    } else {
      console.log('\n❌ No companies found with applications');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanies();

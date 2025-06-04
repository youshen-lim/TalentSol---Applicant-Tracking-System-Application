import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSourceNames() {
  console.log('🔧 Fixing Candidate Source Names...');
  
  try {
    // Define proper source name mappings
    const sourceMapping = {
      'website': 'Website',
      'linkedin': 'LinkedIn',
      'referral': 'Referral',
      'job_board': 'Job Board',
      'recruiter': 'Recruiter',
      'career_fair': 'Career Fair'
    };
    
    // Get all applications
    const applications = await prisma.application.findMany({
      select: { id: true, metadata: true }
    });
    
    console.log(`📊 Updating ${applications.length} applications...`);
    
    let updatedCount = 0;
    
    for (const app of applications) {
      const currentMetadata = app.metadata as any || {};
      const currentSource = currentMetadata.source;
      
      if (currentSource && sourceMapping[currentSource as keyof typeof sourceMapping]) {
        const properSourceName = sourceMapping[currentSource as keyof typeof sourceMapping];
        
        const updatedMetadata = {
          ...currentMetadata,
          source: properSourceName
        };
        
        await prisma.application.update({
          where: { id: app.id },
          data: { metadata: updatedMetadata }
        });
        
        updatedCount++;
        console.log(`   ✅ ${app.id}: "${currentSource}" → "${properSourceName}"`);
      }
    }
    
    console.log(`\n📈 Updated ${updatedCount} applications`);
    
    // Verify the changes
    console.log('\n🔍 Verification - New source distribution:');
    
    const updatedApps = await prisma.application.findMany({
      select: { metadata: true }
    });
    
    const sourceCounts = {} as Record<string, number>;
    
    updatedApps.forEach(app => {
      const metadata = app.metadata as any;
      const source = metadata?.source || 'Unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`   📋 ${source}: ${count} candidates`);
      });
    
    console.log('\n🎉 Source names updated successfully!');
    console.log('💡 Refresh your Dashboard to see the properly formatted source names');
    
  } catch (error) {
    console.error('❌ Error fixing source names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSourceNames();

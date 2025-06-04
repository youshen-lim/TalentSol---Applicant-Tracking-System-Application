import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Simple Source Update Script
 * Updates application metadata with diverse source values for better analytics
 * This script works with the existing schema without requiring changes
 */

const DIVERSE_SOURCES = [
  'LinkedIn',
  'Indeed', 
  'Company Website',
  'Employee Referral',
  'University Career Fair',
  'Glassdoor',
  'AngelList',
  'Stack Overflow Jobs',
  'Recruiter',
  'Direct Application'
];

// Weighted distribution for more realistic data
const WEIGHTED_SOURCES = [
  { source: 'LinkedIn', weight: 30 },
  { source: 'Indeed', weight: 20 },
  { source: 'Company Website', weight: 15 },
  { source: 'Employee Referral', weight: 10 },
  { source: 'University Career Fair', weight: 8 },
  { source: 'Glassdoor', weight: 7 },
  { source: 'AngelList', weight: 4 },
  { source: 'Stack Overflow Jobs', weight: 3 },
  { source: 'Recruiter', weight: 2 },
  { source: 'Direct Application', weight: 1 }
];

function getRandomSource(): string {
  const totalWeight = WEIGHTED_SOURCES.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of WEIGHTED_SOURCES) {
    random -= item.weight;
    if (random <= 0) {
      return item.source;
    }
  }
  
  return WEIGHTED_SOURCES[0].source; // fallback
}

async function updateSourcesSimple() {
  console.log('🔄 Updating application sources with diverse data...');

  try {
    // Get all applications
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        metadata: true,
      },
    });

    console.log(`📊 Found ${applications.length} applications to update`);

    if (applications.length === 0) {
      console.log('❌ No applications found in database');
      return;
    }

    // Update each application with a diverse source
    let updateCount = 0;
    for (const app of applications) {
      const currentMetadata = app.metadata as any || {};
      const newSource = getRandomSource();
      
      const updatedMetadata = {
        ...currentMetadata,
        source: newSource,
        sourceCategory: getSourceCategory(newSource),
        sourceUpdated: new Date().toISOString(),
      };

      await prisma.application.update({
        where: { id: app.id },
        data: {
          metadata: updatedMetadata,
        },
      });

      updateCount++;
      if (updateCount % 10 === 0) {
        console.log(`✅ Updated ${updateCount}/${applications.length} applications...`);
      }
    }

    console.log(`✅ Successfully updated ${updateCount} applications with diverse sources`);

    // Verify the update
    const updatedApplications = await prisma.application.findMany({
      select: {
        metadata: true,
      },
    });

    const sourceCounts = updatedApplications.reduce((acc, app) => {
      const metadata = app.metadata as any;
      const source = metadata?.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Updated source distribution:');
    Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        const percentage = ((count / applications.length) * 100).toFixed(1);
        console.log(`   ${source}: ${count} applications (${percentage}%)`);
      });

    console.log('\n🎉 Source update completed successfully!');
    console.log('💡 Refresh the Dashboard to see the updated Candidate Sources chart');

  } catch (error) {
    console.error('❌ Error updating sources:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getSourceCategory(source: string): string {
  const categoryMap: Record<string, string> = {
    'LinkedIn': 'social_media',
    'Indeed': 'job_board',
    'Company Website': 'company_website',
    'Employee Referral': 'referral',
    'University Career Fair': 'direct',
    'Glassdoor': 'job_board',
    'AngelList': 'job_board',
    'Stack Overflow Jobs': 'job_board',
    'Recruiter': 'direct',
    'Direct Application': 'direct'
  };
  
  return categoryMap[source] || 'unknown';
}

// Run the script
updateSourcesSimple();

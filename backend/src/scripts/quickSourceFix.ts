import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Quick Source Fix Script
 * Updates application metadata with diverse source values
 * Works with existing schema without requiring database changes
 */

const SOURCES = [
  'LinkedIn', 'Indeed', 'Company Website', 'Employee Referral', 
  'University Career Fair', 'Glassdoor', 'AngelList', 'Stack Overflow Jobs',
  'Recruiter', 'Direct Application'
];

async function quickSourceFix() {
  console.log('🔧 Quick fix: Updating candidate sources...');

  try {
    // Get all applications
    const applications = await prisma.application.findMany({
      select: { id: true, metadata: true },
    });

    console.log(`📊 Found ${applications.length} applications`);

    // Update each application with a random source
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const randomSource = SOURCES[i % SOURCES.length]; // Distribute evenly
      
      const currentMetadata = app.metadata as any || {};
      const updatedMetadata = {
        ...currentMetadata,
        source: randomSource,
      };

      await prisma.application.update({
        where: { id: app.id },
        data: { metadata: updatedMetadata },
      });

      if ((i + 1) % 10 === 0) {
        console.log(`✅ Updated ${i + 1}/${applications.length} applications`);
      }
    }

    console.log('🎉 Source update completed!');
    console.log('💡 Refresh the Dashboard to see the updated Candidate Sources chart');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickSourceFix();

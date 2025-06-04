import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed Candidate Sources Script
 * Creates candidate source records and updates applications with proper source references
 */

const CANDIDATE_SOURCES = [
  {
    name: 'LinkedIn',
    category: 'social_media',
    cost: 25.0,
    description: 'Professional networking platform - LinkedIn Jobs and recruiter outreach'
  },
  {
    name: 'Indeed',
    category: 'job_board',
    cost: 15.0,
    description: 'Popular job search engine and application platform'
  },
  {
    name: 'Company Website',
    category: 'company_website',
    cost: 0.0,
    description: 'Direct applications through company careers page'
  },
  {
    name: 'Employee Referral',
    category: 'referral',
    cost: 5.0,
    description: 'Internal employee referral program'
  },
  {
    name: 'University Career Fair',
    category: 'direct',
    cost: 50.0,
    description: 'Campus recruiting and university partnerships'
  },
  {
    name: 'Glassdoor',
    category: 'job_board',
    cost: 20.0,
    description: 'Company reviews and job listings platform'
  },
  {
    name: 'AngelList',
    category: 'job_board',
    cost: 30.0,
    description: 'Startup and tech company job platform'
  },
  {
    name: 'Stack Overflow Jobs',
    category: 'job_board',
    cost: 35.0,
    description: 'Developer-focused job board and community'
  },
  {
    name: 'Recruiter',
    category: 'direct',
    cost: 100.0,
    description: 'External recruiting agency and headhunter services'
  },
  {
    name: 'Direct Application',
    category: 'direct',
    cost: 0.0,
    description: 'Cold outreach and direct candidate contact'
  }
];

async function seedCandidateSources() {
  console.log('🌱 Seeding candidate sources...');

  try {
    // Step 1: Create candidate source records
    console.log('\n📊 Creating candidate source records...');
    
    const createdSources = [];
    for (const sourceData of CANDIDATE_SOURCES) {
      const source = await prisma.candidateSource.upsert({
        where: { name: sourceData.name },
        update: sourceData,
        create: sourceData,
      });
      createdSources.push(source);
      console.log(`✅ Created/Updated source: ${source.name} (${source.category})`);
    }

    console.log(`\n📈 Successfully created ${createdSources.length} candidate sources`);

    // Step 2: Update existing applications with source references
    console.log('\n🔄 Updating existing applications with source references...');
    
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        metadata: true,
        sourceId: true,
      },
    });

    console.log(`📊 Found ${applications.length} applications to update`);

    let updatedCount = 0;
    for (const app of applications) {
      // Skip if already has a sourceId
      if (app.sourceId) {
        continue;
      }

      // Try to get source from metadata first
      const metadata = app.metadata as any;
      let sourceName = metadata?.source;

      // Map old source names to new standardized names
      const sourceMapping: Record<string, string> = {
        'website': 'Company Website',
        'job_board': 'Indeed',
        'social_media': 'LinkedIn',
        'referral': 'Employee Referral',
        'direct': 'Direct Application',
        'company_website': 'Company Website'
      };

      if (sourceName && sourceMapping[sourceName]) {
        sourceName = sourceMapping[sourceName];
      }

      // If no source in metadata, assign a random one
      if (!sourceName) {
        const randomSource = createdSources[Math.floor(Math.random() * createdSources.length)];
        sourceName = randomSource.name;
      }

      // Find the source record
      const sourceRecord = createdSources.find(s => s.name === sourceName);
      if (sourceRecord) {
        await prisma.application.update({
          where: { id: app.id },
          data: {
            sourceId: sourceRecord.id,
            // Also update metadata to ensure consistency
            metadata: {
              ...(metadata || {}),
              source: sourceName,
              sourceCategory: sourceRecord.category,
            },
          },
        });
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} applications with source references`);

    // Step 3: Verify the seeding
    console.log('\n📊 Verification Summary:');
    
    const sourceStats = await prisma.candidateSource.findMany({
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        applications: {
          _count: 'desc',
        },
      },
    });

    console.log('\n📈 Source Distribution:');
    sourceStats.forEach(source => {
      console.log(`   ${source.name}: ${source._count.applications} applications (${source.category})`);
    });

    const totalApplicationsWithSources = sourceStats.reduce((sum, source) => sum + source._count.applications, 0);
    console.log(`\n✅ Total applications with sources: ${totalApplicationsWithSources}`);

    console.log('\n🎉 Candidate sources seeding completed successfully!');
    console.log('💡 The Dashboard Candidate Sources chart should now show diverse data');

  } catch (error) {
    console.error('❌ Error seeding candidate sources:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
seedCandidateSources();

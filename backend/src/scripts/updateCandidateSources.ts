import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define realistic candidate sources with weights
const candidateSources = [
  { source: 'LinkedIn', weight: 30 },
  { source: 'Indeed', weight: 20 },
  { source: 'Company Website', weight: 15 },
  { source: 'Employee Referral', weight: 10 },
  { source: 'University Career Fair', weight: 8 },
  { source: 'Glassdoor', weight: 7 },
  { source: 'AngelList', weight: 4 },
  { source: 'Stack Overflow Jobs', weight: 3 },
  { source: 'Recruiter', weight: 2 },
  { source: 'Direct Application', weight: 1 },
];

// Create weighted array for random selection
const weightedSources: string[] = [];
candidateSources.forEach(({ source, weight }) => {
  for (let i = 0; i < weight; i++) {
    weightedSources.push(source);
  }
});

function getRandomSource(): string {
  const randomIndex = Math.floor(Math.random() * weightedSources.length);
  return weightedSources[randomIndex];
}

function getRandomCampaign(source: string): string {
  const campaigns = {
    'LinkedIn': ['tech-jobs-2024', 'senior-roles', 'remote-opportunities'],
    'Indeed': ['general-hiring', 'entry-level', 'experienced-professionals'],
    'Company Website': ['direct-apply', 'careers-page', 'job-board'],
    'Employee Referral': ['referral-program', 'internal-network', 'team-recommendations'],
    'University Career Fair': ['campus-recruiting', 'graduate-program', 'internship-pipeline'],
    'Glassdoor': ['company-reviews', 'salary-research', 'job-search'],
    'AngelList': ['startup-jobs', 'equity-positions', 'tech-startups'],
    'Stack Overflow Jobs': ['developer-outreach', 'tech-community', 'programming-jobs'],
    'Recruiter': ['executive-search', 'headhunting', 'talent-acquisition'],
    'Direct Application': ['cold-outreach', 'networking', 'personal-contact'],
  };
  
  const sourceCampaigns = campaigns[source as keyof typeof campaigns] || ['general'];
  return sourceCampaigns[Math.floor(Math.random() * sourceCampaigns.length)];
}

async function updateCandidateSources() {
  try {
    console.log('🔄 Starting candidate source update...');

    // Get all applications
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        metadata: true,
      },
    });

    console.log(`📊 Found ${applications.length} applications to update`);

    // Update each application with source data
    for (const application of applications) {
      const source = getRandomSource();
      const campaign = getRandomCampaign(source);
      const isReferral = source === 'Employee Referral';

      const updatedMetadata = {
        ...(application.metadata as any || {}),
        source,
        referral: isReferral,
        campaign,
        sourceDetails: {
          platform: source,
          referralBonus: isReferral ? Math.random() > 0.5 : false,
          sourceQuality: Math.floor(Math.random() * 5) + 1, // 1-5 rating
        },
      };

      await prisma.application.update({
        where: { id: application.id },
        data: { metadata: updatedMetadata },
      });

      console.log(`✅ Updated application ${application.id} with source: ${source}`);
    }

    // Show source distribution
    const sourceDistribution = await prisma.application.groupBy({
      by: ['metadata'],
      _count: true,
    });

    console.log('\n📈 Source Distribution:');
    const sourceCounts: Record<string, number> = {};
    
    for (const group of sourceDistribution) {
      const metadata = group.metadata as any;
      const source = metadata?.source || 'unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + group._count;
    }

    Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`  ${source}: ${count} applications`);
      });

    console.log('\n🎉 Candidate source update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating candidate sources:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateCandidateSources();

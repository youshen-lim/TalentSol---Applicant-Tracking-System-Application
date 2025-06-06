import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Candidate Source Population Script
 * Adds realistic source distribution to candidates and applications
 */

interface CandidateSourceData {
  name: string;
  category: string;
  cost: number;
  description: string;
  weight: number; // For distribution probability
}

const STANDARD_SOURCES: CandidateSourceData[] = [
  {
    name: 'LinkedIn',
    category: 'social_media',
    cost: 25.0,
    description: 'Professional networking platform',
    weight: 0.35
  },
  {
    name: 'Indeed',
    category: 'job_board',
    cost: 15.0,
    description: 'Popular job search engine',
    weight: 0.25
  },
  {
    name: 'Company Website',
    category: 'company_website',
    cost: 0.0,
    description: 'Direct applications through careers page',
    weight: 0.20
  },
  {
    name: 'Employee Referral',
    category: 'referral',
    cost: 5.0,
    description: 'Internal employee referral program',
    weight: 0.12
  },
  {
    name: 'Glassdoor',
    category: 'job_board',
    cost: 20.0,
    description: 'Company reviews and job listings',
    weight: 0.08
  }
];

class CandidateSourcePopulator {
  async populateAllSources(): Promise<void> {
    console.log('🌱 Starting Candidate Source Population...\n');

    try {
      // Step 1: Ensure candidate sources exist
      await this.ensureCandidateSourcesExist();
      
      // Step 2: Assign sources to candidates without sources
      await this.assignSourcesToCandidates();
      
      // Step 3: Assign sources to applications without sources
      await this.assignSourcesToApplications();
      
      // Step 4: Generate distribution report
      await this.generateSourceReport();
      
      console.log('\n✅ Candidate source population completed successfully!');
      
    } catch (error) {
      console.error('❌ Source population failed:', error);
      throw error;
    }
  }

  private async ensureCandidateSourcesExist(): Promise<void> {
    console.log('📊 Ensuring candidate sources exist...');

    for (const sourceData of STANDARD_SOURCES) {
      await prisma.candidateSource.upsert({
        where: { name: sourceData.name },
        update: {
          category: sourceData.category,
          cost: sourceData.cost,
          description: sourceData.description,
          isActive: true
        },
        create: {
          name: sourceData.name,
          category: sourceData.category,
          cost: sourceData.cost,
          description: sourceData.description,
          isActive: true
        }
      });
      
      console.log(`  ✅ ${sourceData.name} (${sourceData.category})`);
    }

    console.log(`📈 ${STANDARD_SOURCES.length} candidate sources ready`);
  }

  private async assignSourcesToCandidates(): Promise<void> {
    console.log('\n👥 Assigning sources to candidates...');

    // Get candidates without sources
    const candidatesWithoutSources = await prisma.candidate.findMany({
      where: { sourceId: null },
      select: { id: true, firstName: true, lastName: true }
    });

    if (candidatesWithoutSources.length === 0) {
      console.log('  ✅ All candidates already have sources assigned');
      return;
    }

    console.log(`  📊 Found ${candidatesWithoutSources.length} candidates without sources`);

    // Get available sources
    const availableSources = await prisma.candidateSource.findMany({
      where: { isActive: true }
    });

    let assignedCount = 0;

    for (const candidate of candidatesWithoutSources) {
      const selectedSource = this.selectRandomSource(availableSources);
      
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { sourceId: selectedSource.id }
      });

      assignedCount++;
      
      if (assignedCount % 10 === 0) {
        console.log(`    📈 Assigned sources to ${assignedCount}/${candidatesWithoutSources.length} candidates`);
      }
    }

    console.log(`  ✅ Assigned sources to ${assignedCount} candidates`);
  }

  private async assignSourcesToApplications(): Promise<void> {
    console.log('\n📝 Assigning sources to applications...');

    // Get applications without sources
    const applicationsWithoutSources = await prisma.application.findMany({
      where: { sourceId: null },
      select: { 
        id: true, 
        candidateId: true,
        candidate: {
          select: { sourceId: true }
        }
      }
    });

    if (applicationsWithoutSources.length === 0) {
      console.log('  ✅ All applications already have sources assigned');
      return;
    }

    console.log(`  📊 Found ${applicationsWithoutSources.length} applications without sources`);

    // Get available sources
    const availableSources = await prisma.candidateSource.findMany({
      where: { isActive: true }
    });

    let assignedCount = 0;

    for (const application of applicationsWithoutSources) {
      // Prefer candidate's source if available, otherwise assign random
      let selectedSourceId: string;
      
      if (application.candidate.sourceId) {
        selectedSourceId = application.candidate.sourceId;
      } else {
        const selectedSource = this.selectRandomSource(availableSources);
        selectedSourceId = selectedSource.id;
      }
      
      await prisma.application.update({
        where: { id: application.id },
        data: { sourceId: selectedSourceId }
      });

      assignedCount++;
      
      if (assignedCount % 10 === 0) {
        console.log(`    📈 Assigned sources to ${assignedCount}/${applicationsWithoutSources.length} applications`);
      }
    }

    console.log(`  ✅ Assigned sources to ${assignedCount} applications`);
  }

  private selectRandomSource(sources: any[]): any {
    // Use weighted random selection based on realistic distribution
    const random = Math.random();
    let cumulativeWeight = 0;

    for (const sourceData of STANDARD_SOURCES) {
      cumulativeWeight += sourceData.weight;
      if (random <= cumulativeWeight) {
        const source = sources.find(s => s.name === sourceData.name);
        if (source) return source;
      }
    }

    // Fallback to first source if no match found
    return sources[0];
  }

  async generateSourceReport(): Promise<void> {
    console.log('\n📊 Candidate Source Distribution Report');
    console.log('=' .repeat(60));

    // Get candidate source distribution
    const candidateSourceStats = await prisma.candidateSource.findMany({
      include: {
        _count: {
          select: {
            candidates: true,
            applications: true
          }
        }
      },
      orderBy: {
        candidates: {
          _count: 'desc'
        }
      }
    });

    const totalCandidates = await prisma.candidate.count();
    const totalApplications = await prisma.application.count();

    console.log(`📈 Total Candidates: ${totalCandidates}`);
    console.log(`📈 Total Applications: ${totalApplications}`);
    console.log('\n📊 Source Distribution:');

    for (const source of candidateSourceStats) {
      const candidatePercentage = totalCandidates > 0 ? 
        Math.round((source._count.candidates / totalCandidates) * 100) : 0;
      const applicationPercentage = totalApplications > 0 ? 
        Math.round((source._count.applications / totalApplications) * 100) : 0;

      console.log(`  📌 ${source.name} (${source.category})`);
      console.log(`     Candidates: ${source._count.candidates} (${candidatePercentage}%)`);
      console.log(`     Applications: ${source._count.applications} (${applicationPercentage}%)`);
      console.log(`     Cost per hire: $${source.cost}`);
      console.log('');
    }

    // Calculate cost analysis
    const totalSourceCost = candidateSourceStats.reduce((sum, source) => {
      return sum + (source._count.applications * source.cost);
    }, 0);

    const averageCostPerApplication = totalApplications > 0 ? 
      Math.round((totalSourceCost / totalApplications) * 100) / 100 : 0;

    console.log(`💰 Total Source Cost: $${Math.round(totalSourceCost * 100) / 100}`);
    console.log(`💰 Average Cost per Application: $${averageCostPerApplication}`);

    // Check for candidates/applications without sources
    const candidatesWithoutSources = await prisma.candidate.count({
      where: { sourceId: null }
    });

    const applicationsWithoutSources = await prisma.application.count({
      where: { sourceId: null }
    });

    if (candidatesWithoutSources > 0 || applicationsWithoutSources > 0) {
      console.log('\n⚠️  Missing Sources:');
      if (candidatesWithoutSources > 0) {
        console.log(`  - ${candidatesWithoutSources} candidates without sources`);
      }
      if (applicationsWithoutSources > 0) {
        console.log(`  - ${applicationsWithoutSources} applications without sources`);
      }
    } else {
      console.log('\n✅ All candidates and applications have sources assigned!');
    }

    console.log('=' .repeat(60));
  }

  async validateSourceIntegrity(): Promise<void> {
    console.log('\n🔍 Validating source data integrity...');

    // Check for orphaned references
    const candidatesWithInvalidSources = await prisma.candidate.count({
      where: {
        sourceId: { not: null },
        source: null
      }
    });

    const applicationsWithInvalidSources = await prisma.application.count({
      where: {
        sourceId: { not: null },
        source: null
      }
    });

    if (candidatesWithInvalidSources > 0) {
      console.log(`  ⚠️  ${candidatesWithInvalidSources} candidates with invalid source references`);
    }

    if (applicationsWithInvalidSources > 0) {
      console.log(`  ⚠️  ${applicationsWithInvalidSources} applications with invalid source references`);
    }

    if (candidatesWithInvalidSources === 0 && applicationsWithInvalidSources === 0) {
      console.log('  ✅ All source references are valid');
    }
  }
}

async function main() {
  const populator = new CandidateSourcePopulator();
  
  try {
    await populator.populateAllSources();
    await populator.validateSourceIntegrity();
  } catch (error) {
    console.error('❌ Population process failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CandidateSourcePopulator };

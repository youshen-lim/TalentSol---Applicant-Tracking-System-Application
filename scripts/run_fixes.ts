import { CandidateSourcePopulator } from './populate_candidate_sources.js';
import { ApplicationCountSync } from './sync_application_counts.js';

async function runAllFixes() {
  console.log('🚀 Running TalentSol Critical Fixes...\n');

  try {
    // Fix 1: Populate candidate sources
    console.log('📊 Phase 1: Populating Candidate Sources...');
    const sourcePopulator = new CandidateSourcePopulator();
    await sourcePopulator.populateAllSources();
    await sourcePopulator.validateSourceIntegrity();

    console.log('\n' + '='.repeat(60) + '\n');

    // Fix 2: Sync application counts
    console.log('🔧 Phase 2: Syncing Application Counts...');
    const countSync = new ApplicationCountSync();
    await countSync.generateSyncReport();
    await countSync.syncAllJobCounts();
    await countSync.createDatabaseTriggers();
    await countSync.testTriggers();
    await countSync.generateSyncReport();

    console.log('\n✅ All critical fixes completed successfully!');
    console.log('🎉 TalentSol data architecture is now optimized!');

  } catch (error) {
    console.error('❌ Critical fixes failed:', error);
    process.exit(1);
  }
}

runAllFixes();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Application Count Synchronization Script
 * Fixes job application count discrepancies and sets up automated sync
 */

interface JobCountResult {
  jobId: string;
  title: string;
  currentCount: number;
  actualCount: number;
  difference: number;
}

class ApplicationCountSync {
  async syncAllJobCounts(): Promise<void> {
    console.log('🔄 Starting Application Count Synchronization...\n');

    try {
      // Get all jobs with their current and actual application counts
      const jobsWithCounts = await this.getJobCountDiscrepancies();
      
      if (jobsWithCounts.length === 0) {
        console.log('✅ All job application counts are already synchronized!');
        return;
      }

      console.log(`📊 Found ${jobsWithCounts.length} jobs with count discrepancies:`);
      
      // Display discrepancies
      for (const job of jobsWithCounts) {
        console.log(`  📝 ${job.title} (${job.jobId}): ${job.currentCount} → ${job.actualCount} (${job.difference > 0 ? '+' : ''}${job.difference})`);
      }

      // Fix the counts
      await this.fixJobCounts(jobsWithCounts);
      
      // Verify the fix
      await this.verifySync();
      
      console.log('\n✅ Application count synchronization completed successfully!');
      
    } catch (error) {
      console.error('❌ Application count sync failed:', error);
      throw error;
    }
  }

  private async getJobCountDiscrepancies(): Promise<JobCountResult[]> {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        currentApplicants: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    return jobs
      .map(job => ({
        jobId: job.id,
        title: job.title,
        currentCount: job.currentApplicants,
        actualCount: job._count.applications,
        difference: job._count.applications - job.currentApplicants
      }))
      .filter(job => job.difference !== 0);
  }

  private async fixJobCounts(jobsToFix: JobCountResult[]): Promise<void> {
    console.log('\n🔧 Fixing application counts...');
    
    for (const job of jobsToFix) {
      await prisma.job.update({
        where: { id: job.jobId },
        data: { currentApplicants: job.actualCount }
      });
      
      console.log(`  ✅ Fixed ${job.title}: ${job.currentCount} → ${job.actualCount}`);
    }
  }

  private async verifySync(): Promise<void> {
    console.log('\n🔍 Verifying synchronization...');
    
    const remainingDiscrepancies = await this.getJobCountDiscrepancies();
    
    if (remainingDiscrepancies.length === 0) {
      console.log('  ✅ All counts are now synchronized!');
    } else {
      console.log(`  ⚠️  Still ${remainingDiscrepancies.length} discrepancies remaining`);
      for (const job of remainingDiscrepancies) {
        console.log(`    - ${job.title}: ${job.currentCount} vs ${job.actualCount}`);
      }
    }
  }

  async createDatabaseTriggers(): Promise<void> {
    console.log('\n🔧 Creating database triggers for automatic count sync...');
    
    try {
      // Create trigger function for application count updates
      await prisma.$executeRaw`
        CREATE OR REPLACE FUNCTION update_job_application_count()
        RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'INSERT' THEN
            UPDATE jobs 
            SET current_applicants = current_applicants + 1 
            WHERE id = NEW.job_id;
            RETURN NEW;
          ELSIF TG_OP = 'DELETE' THEN
            UPDATE jobs 
            SET current_applicants = current_applicants - 1 
            WHERE id = OLD.job_id;
            RETURN OLD;
          ELSIF TG_OP = 'UPDATE' THEN
            -- Handle job_id changes
            IF OLD.job_id != NEW.job_id THEN
              UPDATE jobs 
              SET current_applicants = current_applicants - 1 
              WHERE id = OLD.job_id;
              UPDATE jobs 
              SET current_applicants = current_applicants + 1 
              WHERE id = NEW.job_id;
            END IF;
            RETURN NEW;
          END IF;
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
      `;

      // Create triggers for INSERT, UPDATE, DELETE on applications table
      await prisma.$executeRaw`
        DROP TRIGGER IF EXISTS trigger_application_count_insert ON applications;
        CREATE TRIGGER trigger_application_count_insert
          AFTER INSERT ON applications
          FOR EACH ROW
          EXECUTE FUNCTION update_job_application_count();
      `;

      await prisma.$executeRaw`
        DROP TRIGGER IF EXISTS trigger_application_count_delete ON applications;
        CREATE TRIGGER trigger_application_count_delete
          AFTER DELETE ON applications
          FOR EACH ROW
          EXECUTE FUNCTION update_job_application_count();
      `;

      await prisma.$executeRaw`
        DROP TRIGGER IF EXISTS trigger_application_count_update ON applications;
        CREATE TRIGGER trigger_application_count_update
          AFTER UPDATE ON applications
          FOR EACH ROW
          EXECUTE FUNCTION update_job_application_count();
      `;

      console.log('✅ Database triggers created successfully!');
      console.log('   - Applications will now automatically update job counts');
      console.log('   - Triggers handle INSERT, UPDATE, and DELETE operations');
      
    } catch (error) {
      console.error('❌ Failed to create database triggers:', error);
      console.log('⚠️  Manual count sync will be required');
    }
  }

  async testTriggers(): Promise<void> {
    console.log('\n🧪 Testing database triggers...');
    
    try {
      // Get a job to test with
      const testJob = await prisma.job.findFirst({
        select: { id: true, title: true, currentApplicants: true }
      });

      if (!testJob) {
        console.log('⚠️  No jobs found for trigger testing');
        return;
      }

      const initialCount = testJob.currentApplicants;
      console.log(`  📊 Initial count for "${testJob.title}": ${initialCount}`);

      // Create a test candidate
      const testCandidate = await prisma.candidate.create({
        data: {
          firstName: 'Test',
          lastName: 'Trigger',
          email: `test-trigger-${Date.now()}@example.com`
        }
      });

      // Create a test application (should trigger count increment)
      const testApplication = await prisma.application.create({
        data: {
          jobId: testJob.id,
          candidateId: testCandidate.id,
          candidateInfo: JSON.stringify({
            firstName: 'Test',
            lastName: 'Trigger',
            email: testCandidate.email
          }),
          status: 'applied'
        }
      });

      // Check if count was incremented
      const updatedJob = await prisma.job.findUnique({
        where: { id: testJob.id },
        select: { currentApplicants: true }
      });

      if (updatedJob && updatedJob.currentApplicants === initialCount + 1) {
        console.log('  ✅ INSERT trigger working correctly');
      } else {
        console.log('  ❌ INSERT trigger failed');
      }

      // Delete the test application (should trigger count decrement)
      await prisma.application.delete({
        where: { id: testApplication.id }
      });

      // Delete the test candidate
      await prisma.candidate.delete({
        where: { id: testCandidate.id }
      });

      // Check if count was decremented
      const finalJob = await prisma.job.findUnique({
        where: { id: testJob.id },
        select: { currentApplicants: true }
      });

      if (finalJob && finalJob.currentApplicants === initialCount) {
        console.log('  ✅ DELETE trigger working correctly');
        console.log('  ✅ All triggers are functioning properly!');
      } else {
        console.log('  ❌ DELETE trigger failed');
      }

    } catch (error) {
      console.error('❌ Trigger testing failed:', error);
    }
  }

  async generateSyncReport(): Promise<void> {
    console.log('\n📊 Application Count Sync Report');
    console.log('=' .repeat(50));

    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();
    const discrepancies = await this.getJobCountDiscrepancies();

    console.log(`📈 Total Jobs: ${totalJobs}`);
    console.log(`📈 Total Applications: ${totalApplications}`);
    console.log(`📈 Jobs with Count Discrepancies: ${discrepancies.length}`);
    console.log(`📈 Sync Accuracy: ${Math.round(((totalJobs - discrepancies.length) / totalJobs) * 100)}%`);

    if (discrepancies.length > 0) {
      console.log('\n⚠️  Jobs requiring sync:');
      for (const job of discrepancies.slice(0, 5)) {
        console.log(`  - ${job.title}: ${job.currentCount} → ${job.actualCount}`);
      }
      if (discrepancies.length > 5) {
        console.log(`  ... and ${discrepancies.length - 5} more`);
      }
    }

    console.log('=' .repeat(50));
  }
}

async function main() {
  const syncService = new ApplicationCountSync();
  
  try {
    // Generate initial report
    await syncService.generateSyncReport();
    
    // Sync all counts
    await syncService.syncAllJobCounts();
    
    // Create database triggers for automatic sync
    await syncService.createDatabaseTriggers();
    
    // Test the triggers
    await syncService.testTriggers();
    
    // Generate final report
    await syncService.generateSyncReport();
    
  } catch (error) {
    console.error('❌ Sync process failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ApplicationCountSync };

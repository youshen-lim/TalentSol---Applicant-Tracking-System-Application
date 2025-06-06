import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  score: number;
  recommendations?: string[];
}

class DataArchitectureTestSuite {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Running Comprehensive Data Architecture Tests...\n');

    await this.testDatabaseConnectivity();
    await this.testSchemaIntegrity();
    await this.testDataRelationships();
    await this.testDataConsistency();
    await this.testPerformanceMetrics();
    await this.testBusinessLogicConstraints();
    await this.testMLReadiness();
    await this.testDataQuality();

    this.generateReport();
  }

  private async testDatabaseConnectivity(): Promise<void> {
    try {
      await prisma.$connect();
      const result = await prisma.$queryRaw`SELECT version()`;
      this.addResult({
        testName: 'Database Connectivity',
        status: 'PASS',
        details: 'PostgreSQL connection successful',
        score: 100
      });
    } catch (error) {
      this.addResult({
        testName: 'Database Connectivity',
        status: 'FAIL',
        details: `Connection failed: ${error}`,
        score: 0,
        recommendations: ['Check DATABASE_URL', 'Verify PostgreSQL is running']
      });
    }
  }

  private async testSchemaIntegrity(): Promise<void> {
    try {
      // Test all 16 tables exist
      const tables = [
        'companies', 'users', 'jobs', 'candidates', 'applications', 'interviews',
        'documents', 'application_form_schemas', 'candidate_sources',
        'email_templates', 'notifications', 'user_settings',
        'ml_models', 'ml_predictions', 'training_datasets', 'skill_extractions'
      ];

      const existingTables = await prisma.$queryRaw<Array<{table_name: string}>>`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `;

      const existingTableNames = existingTables.map(t => t.table_name);
      const missingTables = tables.filter(table => !existingTableNames.includes(table));

      if (missingTables.length === 0) {
        this.addResult({
          testName: 'Schema Integrity - Table Existence',
          status: 'PASS',
          details: `All 16 tables exist: ${tables.join(', ')}`,
          score: 100
        });
      } else {
        this.addResult({
          testName: 'Schema Integrity - Table Existence',
          status: 'FAIL',
          details: `Missing tables: ${missingTables.join(', ')}`,
          score: Math.max(0, 100 - (missingTables.length * 10)),
          recommendations: ['Run prisma db push', 'Check schema.prisma file']
        });
      }
    } catch (error) {
      this.addResult({
        testName: 'Schema Integrity',
        status: 'FAIL',
        details: `Schema check failed: ${error}`,
        score: 0
      });
    }
  }

  private async testDataRelationships(): Promise<void> {
    try {
      // Test foreign key relationships
      const relationshipTests = [
        {
          name: 'User-Company Relationship',
          query: () => prisma.user.findMany({ include: { company: true } }),
          validation: (data: any[]) => data.every(user => user.company !== null)
        },
        {
          name: 'Application-Job-Candidate Relationship',
          query: () => prisma.application.findMany({ include: { job: true, candidate: true } }),
          validation: (data: any[]) => data.every(app => app.job !== null && app.candidate !== null)
        },
        {
          name: 'Interview-Application Relationship',
          query: () => prisma.interview.findMany({ include: { application: true } }),
          validation: (data: any[]) => data.every(interview => interview.application !== null)
        }
      ];

      let passedTests = 0;
      let totalTests = relationshipTests.length;

      for (const test of relationshipTests) {
        try {
          const data = await test.query();
          const isValid = test.validation(data);
          if (isValid) {
            passedTests++;
          }
        } catch (error) {
          console.warn(`Relationship test failed: ${test.name} - ${error}`);
        }
      }

      const score = Math.round((passedTests / totalTests) * 100);
      this.addResult({
        testName: 'Data Relationships',
        status: score >= 80 ? 'PASS' : score >= 60 ? 'WARNING' : 'FAIL',
        details: `${passedTests}/${totalTests} relationship tests passed`,
        score,
        recommendations: score < 80 ? ['Check foreign key constraints', 'Verify data integrity'] : undefined
      });
    } catch (error) {
      this.addResult({
        testName: 'Data Relationships',
        status: 'FAIL',
        details: `Relationship test failed: ${error}`,
        score: 0
      });
    }
  }

  private async testDataConsistency(): Promise<void> {
    try {
      const issues: string[] = [];
      let score = 100;

      // Test 1: Application dates consistency
      const invalidDateApps = await prisma.application.count({
        where: {
          AND: [
            { submittedAt: { not: null } },
            { hiredAt: { not: null } },
            { hiredAt: { lt: prisma.application.fields.submittedAt } }
          ]
        }
      });

      if (invalidDateApps > 0) {
        issues.push(`${invalidDateApps} applications with hiredAt before submittedAt`);
        score -= 20;
      }

      // Test 2: Email uniqueness
      const duplicateEmails = await prisma.$queryRaw<Array<{email: string, count: number}>>`
        SELECT email, COUNT(*) as count FROM candidates 
        GROUP BY email HAVING COUNT(*) > 1
      `;

      if (duplicateEmails.length > 0) {
        issues.push(`${duplicateEmails.length} duplicate candidate emails`);
        score -= 15;
      }

      // Test 3: Job application counts
      const jobsWithWrongCounts = await prisma.$queryRaw<Array<{id: string, current_applicants: number, actual_count: number}>>`
        SELECT j.id, j.current_applicants, COUNT(a.id) as actual_count
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        GROUP BY j.id, j.current_applicants
        HAVING j.current_applicants != COUNT(a.id)
      `;

      if (jobsWithWrongCounts.length > 0) {
        issues.push(`${jobsWithWrongCounts.length} jobs with incorrect application counts`);
        score -= 10;
      }

      this.addResult({
        testName: 'Data Consistency',
        status: score >= 80 ? 'PASS' : score >= 60 ? 'WARNING' : 'FAIL',
        details: issues.length === 0 ? 'All consistency checks passed' : issues.join('; '),
        score: Math.max(0, score),
        recommendations: issues.length > 0 ? ['Run data cleanup scripts', 'Add database constraints'] : undefined
      });
    } catch (error) {
      this.addResult({
        testName: 'Data Consistency',
        status: 'FAIL',
        details: `Consistency test failed: ${error}`,
        score: 0
      });
    }
  }

  private async testPerformanceMetrics(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Test query performance
      await Promise.all([
        prisma.application.count(),
        prisma.candidate.count(),
        prisma.job.count(),
        prisma.interview.count()
      ]);

      const queryTime = Date.now() - startTime;
      const score = queryTime < 100 ? 100 : queryTime < 500 ? 80 : queryTime < 1000 ? 60 : 40;

      this.addResult({
        testName: 'Performance Metrics',
        status: score >= 80 ? 'PASS' : score >= 60 ? 'WARNING' : 'FAIL',
        details: `Basic queries completed in ${queryTime}ms`,
        score,
        recommendations: score < 80 ? ['Add database indexes', 'Optimize queries', 'Consider connection pooling'] : undefined
      });
    } catch (error) {
      this.addResult({
        testName: 'Performance Metrics',
        status: 'FAIL',
        details: `Performance test failed: ${error}`,
        score: 0
      });
    }
  }

  private async testBusinessLogicConstraints(): Promise<void> {
    try {
      let score = 100;
      const issues: string[] = [];

      // Test application status flow
      const invalidStatusApps = await prisma.application.count({
        where: {
          status: { notIn: ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'] }
        }
      });

      if (invalidStatusApps > 0) {
        issues.push(`${invalidStatusApps} applications with invalid status`);
        score -= 20;
      }

      // Test interview scheduling logic
      const pastInterviews = await prisma.interview.count({
        where: {
          scheduledDate: { lt: new Date() },
          status: 'scheduled'
        }
      });

      if (pastInterviews > 0) {
        issues.push(`${pastInterviews} past interviews still marked as scheduled`);
        score -= 10;
      }

      this.addResult({
        testName: 'Business Logic Constraints',
        status: score >= 80 ? 'PASS' : score >= 60 ? 'WARNING' : 'FAIL',
        details: issues.length === 0 ? 'All business logic checks passed' : issues.join('; '),
        score: Math.max(0, score),
        recommendations: issues.length > 0 ? ['Add validation rules', 'Implement status update workflows'] : undefined
      });
    } catch (error) {
      this.addResult({
        testName: 'Business Logic Constraints',
        status: 'FAIL',
        details: `Business logic test failed: ${error}`,
        score: 0
      });
    }
  }

  private async testMLReadiness(): Promise<void> {
    try {
      let score = 100;
      const details: string[] = [];

      // Test ML tables using Prisma client methods instead of raw SQL
      const mlModelCount = await prisma.mLModel.count();
      const mlPredictionCount = await prisma.mLPrediction.count();
      const trainingDatasetCount = await prisma.trainingDataset.count();
      const skillExtractionCount = await prisma.skillExtraction.count();

      details.push(`ml_models: ${mlModelCount} records`);
      details.push(`ml_predictions: ${mlPredictionCount} records`);
      details.push(`training_datasets: ${trainingDatasetCount} records`);
      details.push(`skill_extractions: ${skillExtractionCount} records`);

      // Check if candidate sources are properly set up for ML features
      const sourcesCount = await prisma.candidateSource.count();
      if (sourcesCount < 3) {
        score -= 20;
        details.push('Insufficient candidate sources for ML analysis');
      }

      // Check if we have any applications for ML training
      const applicationsCount = await prisma.application.count();
      if (applicationsCount < 10) {
        score -= 15;
        details.push('Insufficient applications for ML training');
      }

      this.addResult({
        testName: 'ML Integration Readiness',
        status: score >= 80 ? 'PASS' : 'WARNING',
        details: details.join('; '),
        score,
        recommendations: score < 80 ? ['Set up candidate sources', 'Prepare training datasets', 'Add more application data'] : undefined
      });
    } catch (error) {
      this.addResult({
        testName: 'ML Integration Readiness',
        status: 'FAIL',
        details: `ML readiness test failed: ${error}`,
        score: 0,
        recommendations: ['Check Prisma schema', 'Verify ML table structure']
      });
    }
  }

  private async testDataQuality(): Promise<void> {
    try {
      let score = 100;
      const issues: string[] = [];

      // Test for candidates with empty names (firstName and lastName are required fields)
      const candidatesWithEmptyFirstName = await prisma.candidate.count({
        where: { firstName: '' }
      });

      const candidatesWithEmptyLastName = await prisma.candidate.count({
        where: { lastName: '' }
      });

      if (candidatesWithEmptyFirstName > 0) {
        issues.push(`${candidatesWithEmptyFirstName} candidates with empty first names`);
        score -= 10;
      }

      if (candidatesWithEmptyLastName > 0) {
        issues.push(`${candidatesWithEmptyLastName} candidates with empty last names`);
        score -= 10;
      }

      // Test for applications without submission dates
      const appsWithoutDates = await prisma.application.count({
        where: { submittedAt: null }
      });

      if (appsWithoutDates > 0) {
        issues.push(`${appsWithoutDates} applications without submission dates`);
        score -= 15;
      }

      // Test for candidates with empty email addresses (email is required)
      const candidatesWithEmptyEmail = await prisma.candidate.count({
        where: { email: '' }
      });

      if (candidatesWithEmptyEmail > 0) {
        issues.push(`${candidatesWithEmptyEmail} candidates with empty email addresses`);
        score -= 20;
      }

      // Test for jobs with empty titles (title is required)
      const jobsWithEmptyTitles = await prisma.job.count({
        where: { title: '' }
      });

      if (jobsWithEmptyTitles > 0) {
        issues.push(`${jobsWithEmptyTitles} jobs with empty titles`);
        score -= 15;
      }

      this.addResult({
        testName: 'Data Quality',
        status: score >= 80 ? 'PASS' : score >= 60 ? 'WARNING' : 'FAIL',
        details: issues.length === 0 ? 'All data quality checks passed' : issues.join('; '),
        score: Math.max(0, score),
        recommendations: issues.length > 0 ? ['Clean up missing data', 'Add validation rules', 'Implement required field constraints'] : undefined
      });
    } catch (error) {
      this.addResult({
        testName: 'Data Quality',
        status: 'FAIL',
        details: `Data quality test failed: ${error}`,
        score: 0,
        recommendations: ['Check Prisma query syntax', 'Verify database schema']
      });
    }
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
  }

  private generateReport(): void {
    console.log('\n📊 DATA ARCHITECTURE TEST REPORT\n');
    console.log('=' .repeat(60));

    let totalScore = 0;
    let passCount = 0;
    let warningCount = 0;
    let failCount = 0;

    this.results.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${result.testName}: ${result.status} (${result.score}/100)`);
      console.log(`   ${result.details}`);
      
      if (result.recommendations) {
        console.log(`   Recommendations: ${result.recommendations.join(', ')}`);
      }
      console.log('');

      totalScore += result.score;
      if (result.status === 'PASS') passCount++;
      else if (result.status === 'WARNING') warningCount++;
      else failCount++;
    });

    const averageScore = Math.round(totalScore / this.results.length);
    const overallStatus = averageScore >= 80 ? 'EXCELLENT' : averageScore >= 70 ? 'GOOD' : averageScore >= 60 ? 'FAIR' : 'POOR';

    console.log('=' .repeat(60));
    console.log(`📈 OVERALL SCORE: ${averageScore}/100 (${overallStatus})`);
    console.log(`📊 TEST SUMMARY: ${passCount} PASS, ${warningCount} WARNING, ${failCount} FAIL`);
    console.log('=' .repeat(60));
  }
}

async function main() {
  const testSuite = new DataArchitectureTestSuite();
  await testSuite.runAllTests();
  await prisma.$disconnect();
}

main().catch(console.error);

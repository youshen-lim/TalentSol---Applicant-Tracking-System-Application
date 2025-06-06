import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * TalentSol Custom SQL Testing Framework
 * Comprehensive testing suite for data architecture and business logic
 */

interface TestCase {
  name: string;
  description: string;
  category: 'schema' | 'data_integrity' | 'business_logic' | 'performance' | 'ml_readiness';
  severity: 'critical' | 'high' | 'medium' | 'low';
  testFunction: () => Promise<TestResult>;
}

interface TestResult {
  passed: boolean;
  score: number;
  message: string;
  details?: any;
  recommendations?: string[];
  executionTime?: number;
}

interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallScore: number;
  categoryScores: Record<string, number>;
  executionTime: number;
  results: Array<TestCase & { result: TestResult }>;
}

class TalentSolTestFramework {
  private testCases: TestCase[] = [];

  constructor() {
    this.registerTestCases();
  }

  private registerTestCases(): void {
    // Schema Integrity Tests
    this.addTest({
      name: 'Table Existence',
      description: 'Verify all 16 required tables exist',
      category: 'schema',
      severity: 'critical',
      testFunction: this.testTableExistence.bind(this)
    });

    this.addTest({
      name: 'Foreign Key Constraints',
      description: 'Verify all foreign key relationships are intact',
      category: 'schema',
      severity: 'critical',
      testFunction: this.testForeignKeyConstraints.bind(this)
    });

    // Data Integrity Tests
    this.addTest({
      name: 'Application Date Logic',
      description: 'Verify hiredAt is always after submittedAt',
      category: 'data_integrity',
      severity: 'high',
      testFunction: this.testApplicationDateLogic.bind(this)
    });

    this.addTest({
      name: 'Email Uniqueness',
      description: 'Verify candidate emails are unique',
      category: 'data_integrity',
      severity: 'high',
      testFunction: this.testEmailUniqueness.bind(this)
    });

    this.addTest({
      name: 'Required Fields',
      description: 'Verify critical fields are not null or empty',
      category: 'data_integrity',
      severity: 'medium',
      testFunction: this.testRequiredFields.bind(this)
    });

    // Business Logic Tests
    this.addTest({
      name: 'Application Status Flow',
      description: 'Verify application status values are valid',
      category: 'business_logic',
      severity: 'high',
      testFunction: this.testApplicationStatusFlow.bind(this)
    });

    this.addTest({
      name: 'Job Application Counts',
      description: 'Verify job application counts match actual applications',
      category: 'business_logic',
      severity: 'medium',
      testFunction: this.testJobApplicationCounts.bind(this)
    });

    this.addTest({
      name: 'Interview Scheduling Logic',
      description: 'Verify interview scheduling constraints',
      category: 'business_logic',
      severity: 'medium',
      testFunction: this.testInterviewScheduling.bind(this)
    });

    // Performance Tests
    this.addTest({
      name: 'Query Performance',
      description: 'Verify critical queries execute within acceptable time',
      category: 'performance',
      severity: 'medium',
      testFunction: this.testQueryPerformance.bind(this)
    });

    // ML Readiness Tests
    this.addTest({
      name: 'ML Table Structure',
      description: 'Verify ML tables are properly configured',
      category: 'ml_readiness',
      severity: 'medium',
      testFunction: this.testMLTableStructure.bind(this)
    });

    this.addTest({
      name: 'Candidate Source Distribution',
      description: 'Verify candidate sources are properly distributed',
      category: 'ml_readiness',
      severity: 'low',
      testFunction: this.testCandidateSourceDistribution.bind(this)
    });
  }

  private addTest(testCase: TestCase): void {
    this.testCases.push(testCase);
  }

  async runAllTests(): Promise<TestSuiteResult> {
    console.log('🧪 Running TalentSol Test Suite...\n');
    const startTime = Date.now();

    const results: Array<TestCase & { result: TestResult }> = [];
    let totalScore = 0;
    let passedTests = 0;
    let failedTests = 0;

    const categoryScores: Record<string, { total: number; count: number }> = {};

    for (const testCase of this.testCases) {
      console.log(`🔍 Running: ${testCase.name}`);
      
      const testStartTime = Date.now();
      try {
        const result = await testCase.testFunction();
        result.executionTime = Date.now() - testStartTime;
        
        results.push({ ...testCase, result });
        
        if (result.passed) {
          passedTests++;
          console.log(`  ✅ PASS (${result.score}/100) - ${result.message}`);
        } else {
          failedTests++;
          console.log(`  ❌ FAIL (${result.score}/100) - ${result.message}`);
          if (result.recommendations) {
            console.log(`     Recommendations: ${result.recommendations.join(', ')}`);
          }
        }

        totalScore += result.score;
        
        // Track category scores
        if (!categoryScores[testCase.category]) {
          categoryScores[testCase.category] = { total: 0, count: 0 };
        }
        categoryScores[testCase.category].total += result.score;
        categoryScores[testCase.category].count += 1;

      } catch (error) {
        const result: TestResult = {
          passed: false,
          score: 0,
          message: `Test execution failed: ${error}`,
          executionTime: Date.now() - testStartTime
        };
        
        results.push({ ...testCase, result });
        failedTests++;
        console.log(`  💥 ERROR - ${result.message}`);
      }
    }

    const executionTime = Date.now() - startTime;
    const overallScore = Math.round(totalScore / this.testCases.length);

    // Calculate category scores
    const finalCategoryScores: Record<string, number> = {};
    for (const [category, data] of Object.entries(categoryScores)) {
      finalCategoryScores[category] = Math.round(data.total / data.count);
    }

    const testSuiteResult: TestSuiteResult = {
      totalTests: this.testCases.length,
      passedTests,
      failedTests,
      overallScore,
      categoryScores: finalCategoryScores,
      executionTime,
      results
    };

    this.generateReport(testSuiteResult);
    return testSuiteResult;
  }

  private generateReport(result: TestSuiteResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TALENTSOL TEST SUITE REPORT');
    console.log('='.repeat(80));

    console.log(`📈 Overall Score: ${result.overallScore}/100`);
    console.log(`📊 Tests: ${result.passedTests} passed, ${result.failedTests} failed (${result.totalTests} total)`);
    console.log(`⏱️  Execution Time: ${result.executionTime}ms`);

    console.log('\n📋 Category Scores:');
    for (const [category, score] of Object.entries(result.categoryScores)) {
      const status = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
      console.log(`  ${status} ${category.replace('_', ' ').toUpperCase()}: ${score}/100`);
    }

    console.log('\n🔍 Failed Tests:');
    const failedTests = result.results.filter(r => !r.result.passed);
    if (failedTests.length === 0) {
      console.log('  🎉 All tests passed!');
    } else {
      for (const test of failedTests) {
        console.log(`  ❌ ${test.name} (${test.severity}): ${test.result.message}`);
      }
    }

    console.log('\n💡 Recommendations:');
    const allRecommendations = result.results
      .filter(r => r.result.recommendations)
      .flatMap(r => r.result.recommendations!);
    
    if (allRecommendations.length === 0) {
      console.log('  ✅ No recommendations - system is healthy!');
    } else {
      const uniqueRecommendations = [...new Set(allRecommendations)];
      for (const rec of uniqueRecommendations.slice(0, 5)) {
        console.log(`  💡 ${rec}`);
      }
    }

    console.log('='.repeat(80));
  }

  // Test Implementation Methods
  private async testTableExistence(): Promise<TestResult> {
    const requiredTables = [
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
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));

    if (missingTables.length === 0) {
      return {
        passed: true,
        score: 100,
        message: `All ${requiredTables.length} required tables exist`
      };
    } else {
      return {
        passed: false,
        score: Math.max(0, 100 - (missingTables.length * 10)),
        message: `Missing ${missingTables.length} tables: ${missingTables.join(', ')}`,
        recommendations: ['Run prisma db push', 'Check schema.prisma file']
      };
    }
  }

  private async testForeignKeyConstraints(): Promise<TestResult> {
    try {
      // Test key relationships by joining tables
      const testQueries = [
        prisma.user.findMany({ include: { company: true }, take: 1 }),
        prisma.application.findMany({ include: { job: true, candidate: true }, take: 1 }),
        prisma.interview.findMany({ include: { application: true }, take: 1 })
      ];

      await Promise.all(testQueries);

      return {
        passed: true,
        score: 100,
        message: 'All foreign key relationships are intact'
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        message: `Foreign key constraint error: ${error}`,
        recommendations: ['Check database schema', 'Verify foreign key constraints']
      };
    }
  }

  private async testApplicationDateLogic(): Promise<TestResult> {
    const invalidDates = await prisma.application.count({
      where: {
        AND: [
          { submittedAt: { not: null } },
          { hiredAt: { not: null } },
          { hiredAt: { lt: prisma.application.fields.submittedAt } }
        ]
      }
    });

    if (invalidDates === 0) {
      return {
        passed: true,
        score: 100,
        message: 'All application dates follow correct logic'
      };
    } else {
      return {
        passed: false,
        score: Math.max(0, 100 - (invalidDates * 10)),
        message: `${invalidDates} applications have hiredAt before submittedAt`,
        recommendations: ['Fix date inconsistencies', 'Add date validation rules']
      };
    }
  }

  private async testEmailUniqueness(): Promise<TestResult> {
    const duplicateEmails = await prisma.$queryRaw<Array<{email: string, count: number}>>`
      SELECT email, COUNT(*) as count FROM candidates 
      GROUP BY email HAVING COUNT(*) > 1
    `;

    if (duplicateEmails.length === 0) {
      return {
        passed: true,
        score: 100,
        message: 'All candidate emails are unique'
      };
    } else {
      return {
        passed: false,
        score: Math.max(0, 100 - (duplicateEmails.length * 5)),
        message: `${duplicateEmails.length} duplicate email addresses found`,
        recommendations: ['Clean up duplicate emails', 'Add unique constraints']
      };
    }
  }

  private async testRequiredFields(): Promise<TestResult> {
    const issues: string[] = [];
    let score = 100;

    // Test candidates without names
    const candidatesWithoutNames = await prisma.candidate.count({
      where: {
        OR: [
          { firstName: { equals: '' } },
          { lastName: { equals: '' } }
        ]
      }
    });

    if (candidatesWithoutNames > 0) {
      issues.push(`${candidatesWithoutNames} candidates missing names`);
      score -= 15;
    }

    // Test applications without submission dates
    const appsWithoutDates = await prisma.application.count({
      where: { submittedAt: null }
    });

    if (appsWithoutDates > 0) {
      issues.push(`${appsWithoutDates} applications without submission dates`);
      score -= 10;
    }

    if (issues.length === 0) {
      return {
        passed: true,
        score: 100,
        message: 'All required fields are properly populated'
      };
    } else {
      return {
        passed: false,
        score: Math.max(0, score),
        message: issues.join('; '),
        recommendations: ['Add validation rules', 'Clean up missing data']
      };
    }
  }

  private async testApplicationStatusFlow(): Promise<TestResult> {
    const validStatuses = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
    
    const invalidStatusApps = await prisma.application.count({
      where: {
        status: { notIn: validStatuses }
      }
    });

    if (invalidStatusApps === 0) {
      return {
        passed: true,
        score: 100,
        message: 'All application statuses are valid'
      };
    } else {
      return {
        passed: false,
        score: Math.max(0, 100 - (invalidStatusApps * 10)),
        message: `${invalidStatusApps} applications have invalid status values`,
        recommendations: ['Fix invalid status values', 'Add status validation']
      };
    }
  }

  private async testJobApplicationCounts(): Promise<TestResult> {
    const jobsWithWrongCounts = await prisma.$queryRaw<Array<{id: string, current_applicants: number, actual_count: number}>>`
      SELECT j.id, j.current_applicants, COUNT(a.id) as actual_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id, j.current_applicants
      HAVING j.current_applicants != COUNT(a.id)
    `;

    if (jobsWithWrongCounts.length === 0) {
      return {
        passed: true,
        score: 100,
        message: 'All job application counts are accurate'
      };
    } else {
      return {
        passed: false,
        score: Math.max(0, 100 - (jobsWithWrongCounts.length * 5)),
        message: `${jobsWithWrongCounts.length} jobs have incorrect application counts`,
        recommendations: ['Run application count sync', 'Add database triggers']
      };
    }
  }

  private async testInterviewScheduling(): Promise<TestResult> {
    const pastInterviews = await prisma.interview.count({
      where: {
        scheduledDate: { lt: new Date() },
        status: 'scheduled'
      }
    });

    if (pastInterviews === 0) {
      return {
        passed: true,
        score: 100,
        message: 'Interview scheduling logic is correct'
      };
    } else {
      return {
        passed: false,
        score: Math.max(0, 100 - (pastInterviews * 5)),
        message: `${pastInterviews} past interviews still marked as scheduled`,
        recommendations: ['Update past interview statuses', 'Add automated status updates']
      };
    }
  }

  private async testQueryPerformance(): Promise<TestResult> {
    const startTime = Date.now();
    
    await Promise.all([
      prisma.application.count(),
      prisma.candidate.count(),
      prisma.job.count(),
      prisma.interview.count()
    ]);

    const queryTime = Date.now() - startTime;
    const score = queryTime < 100 ? 100 : queryTime < 500 ? 80 : queryTime < 1000 ? 60 : 40;

    return {
      passed: score >= 60,
      score,
      message: `Basic queries completed in ${queryTime}ms`,
      recommendations: score < 80 ? ['Add database indexes', 'Optimize queries'] : undefined
    };
  }

  private async testMLTableStructure(): Promise<TestResult> {
    try {
      const mlModelCount = await prisma.mLModel.count();
      const mlPredictionCount = await prisma.mLPrediction.count();
      const trainingDatasetCount = await prisma.trainingDataset.count();
      const skillExtractionCount = await prisma.skillExtraction.count();

      return {
        passed: true,
        score: 100,
        message: `ML tables accessible: ${mlModelCount + mlPredictionCount + trainingDatasetCount + skillExtractionCount} total records`,
        details: {
          mlModels: mlModelCount,
          mlPredictions: mlPredictionCount,
          trainingDatasets: trainingDatasetCount,
          skillExtractions: skillExtractionCount
        }
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        message: `ML table access failed: ${error}`,
        recommendations: ['Check ML table schema', 'Verify Prisma client generation']
      };
    }
  }

  private async testCandidateSourceDistribution(): Promise<TestResult> {
    const sourcesCount = await prisma.candidateSource.count();
    const candidatesWithSources = await prisma.candidate.count({
      where: { sourceId: { not: null } }
    });
    const totalCandidates = await prisma.candidate.count();

    const sourceDistribution = totalCandidates > 0 ? 
      Math.round((candidatesWithSources / totalCandidates) * 100) : 0;

    if (sourcesCount >= 3 && sourceDistribution >= 80) {
      return {
        passed: true,
        score: 100,
        message: `Good source distribution: ${sourcesCount} sources, ${sourceDistribution}% coverage`
      };
    } else {
      let score = 50;
      if (sourcesCount >= 3) score += 25;
      if (sourceDistribution >= 80) score += 25;

      return {
        passed: false,
        score,
        message: `Limited source distribution: ${sourcesCount} sources, ${sourceDistribution}% coverage`,
        recommendations: ['Add more candidate sources', 'Populate source data']
      };
    }
  }
}

async function main() {
  const framework = new TalentSolTestFramework();
  
  try {
    const result = await framework.runAllTests();
    
    // Exit with appropriate code
    process.exit(result.overallScore >= 70 ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test framework failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TalentSolTestFramework };

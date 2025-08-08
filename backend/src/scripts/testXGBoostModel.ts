#!/usr/bin/env tsx

/**
 * XGBoost Model Testing Script
 * Tests the local XGBoost model integration with sample data
 */

import { XGBoostModelService } from '../services/xgboostModelService.js';
import { XGBoostDataMappingService } from '../services/xgboostDataMappingService.js';
import { logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestCase {
  name: string;
  input: {
    jobDescription: string;
    resume: string;
    jobRoles: string;
    ethnicity: string;
  };
  expectedRange?: {
    minProbability: number;
    maxProbability: number;
  };
}

class XGBoostModelTester {
  private xgboostService: XGBoostModelService;
  private mappingService: XGBoostDataMappingService;

  constructor() {
    this.xgboostService = new XGBoostModelService();
    this.mappingService = new XGBoostDataMappingService();
  }

  async runTests(): Promise<void> {
    console.log('🧪 Starting XGBoost Model Tests...\n');

    try {
      // Initialize the model
      console.log('1️⃣ Initializing XGBoost model...');
      await this.xgboostService.initializeModel();
      console.log('✅ Model initialized successfully\n');

      // Test model metrics
      console.log('2️⃣ Testing model metrics...');
      const metrics = this.xgboostService.getModelMetrics();
      this.displayModelMetrics(metrics);

      // Run prediction tests
      console.log('3️⃣ Running prediction tests...');
      await this.runPredictionTests();

      // Test data mapping (if database is available)
      console.log('4️⃣ Testing data mapping...');
      await this.testDataMapping();

      console.log('\n✅ All XGBoost model tests completed successfully!');

    } catch (error) {
      console.error('\n❌ XGBoost model tests failed:', error);
      process.exit(1);
    }
  }

  private displayModelMetrics(metrics: any): void {
    console.log('📊 Model Metrics:');
    console.log(`   Model Version: ${metrics.modelVersion}`);
    console.log(`   Optimized Threshold: ${metrics.optimizedThreshold}`);
    console.log(`   Target Recall: ${(metrics.targetRecall * 100).toFixed(1)}%`);
    console.log(`   Target Precision: ${(metrics.targetPrecision * 100).toFixed(1)}%`);
    console.log(`   Required sklearn: ${metrics.requiredSklearnVersion}`);
    console.log(`   Required joblib: ${metrics.requiredJoblibVersion}\n`);
  }

  private async runPredictionTests(): Promise<void> {
    const testCases: TestCase[] = [
      {
        name: 'High Match - Software Engineer',
        input: {
          jobDescription: 'Senior Software Engineer position requiring 5+ years of Python experience, machine learning knowledge, and experience with data science frameworks. Must have strong problem-solving skills and ability to work in agile environments.',
          resume: 'Experienced Software Engineer with 6 years of Python development, specializing in machine learning and data science. Proficient in scikit-learn, pandas, numpy, and TensorFlow. Led multiple ML projects and worked in agile teams.',
          jobRoles: 'Senior Software Engineer',
          ethnicity: 'Not Specified'
        },
        expectedRange: { minProbability: 0.6, maxProbability: 1.0 }
      },
      {
        name: 'Medium Match - Data Scientist',
        input: {
          jobDescription: 'Data Scientist role focusing on statistical analysis, machine learning model development, and business intelligence. Requires experience with Python, R, and SQL.',
          resume: 'Data Analyst with 3 years experience in statistical analysis and Python programming. Some exposure to machine learning through online courses and personal projects.',
          jobRoles: 'Data Scientist',
          ethnicity: 'Asian'
        },
        expectedRange: { minProbability: 0.3, maxProbability: 0.7 }
      },
      {
        name: 'Low Match - Marketing Manager',
        input: {
          jobDescription: 'Marketing Manager position requiring experience in digital marketing, campaign management, and brand strategy. Must have strong communication skills and experience with marketing automation tools.',
          resume: 'Recent graduate with degree in Marketing. Completed internships in social media marketing and has basic knowledge of Google Analytics and Facebook Ads.',
          jobRoles: 'Marketing Manager',
          ethnicity: 'Hispanic'
        },
        expectedRange: { minProbability: 0.0, maxProbability: 0.4 }
      },
      {
        name: 'Edge Case - Empty Fields',
        input: {
          jobDescription: 'Basic job description with minimal requirements.',
          resume: 'Basic resume with minimal information.',
          jobRoles: 'General Position',
          ethnicity: 'Not Specified'
        }
      }
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`   Test ${i + 1}: ${testCase.name}`);
      
      try {
        const startTime = Date.now();
        
        // Create mock input for the model service
        const modelInput = {
          candidateId: `test_candidate_${i + 1}`,
          jobId: `test_job_${i + 1}`,
          applicationId: `test_application_${i + 1}`,
          data: testCase.input
        };

        const prediction = await this.xgboostService.predict(modelInput);
        const processingTime = Date.now() - startTime;

        console.log(`      ✅ Probability: ${prediction.probability.toFixed(4)}`);
        console.log(`      📊 Binary Prediction: ${prediction.binaryPrediction}`);
        console.log(`      🎯 Confidence: ${prediction.confidence.toFixed(4)}`);
        console.log(`      ⏱️  Processing Time: ${processingTime}ms`);
        console.log(`      🔧 Threshold Used: ${prediction.thresholdUsed}`);

        // Validate expected range if provided
        if (testCase.expectedRange) {
          const { minProbability, maxProbability } = testCase.expectedRange;
          if (prediction.probability >= minProbability && prediction.probability <= maxProbability) {
            console.log(`      ✅ Probability within expected range [${minProbability}, ${maxProbability}]`);
          } else {
            console.log(`      ⚠️  Probability outside expected range [${minProbability}, ${maxProbability}]`);
          }
        }

        // Validate processing time
        if (processingTime > 2000) {
          console.log(`      ⚠️  Processing time exceeded 2 second target`);
        } else {
          console.log(`      ✅ Processing time within target (<2s)`);
        }

        console.log(`      💭 Reasoning: ${prediction.reasoning.join(', ')}\n`);

      } catch (error) {
        console.log(`      ❌ Test failed: ${(error as Error).message}\n`);
      }
    }
  }

  private async testDataMapping(): Promise<void> {
    console.log('   Testing data mapping service...');
    
    try {
      // Test getting applications for processing (will fail if no database)
      const applicationIds = await this.mappingService.getApplicationsForProcessing(5);
      console.log(`   ✅ Found ${applicationIds.length} applications for processing`);
      
      if (applicationIds.length > 0) {
        console.log(`   📋 Sample application IDs: ${applicationIds.slice(0, 3).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`   ⚠️  Database not available for mapping test: ${(error as Error).message}`);
      console.log('   ℹ️  This is expected if database is not set up yet');
    }
  }

  async testBatchProcessing(): Promise<void> {
    console.log('5️⃣ Testing batch processing...');
    
    const batchInputs = [
      {
        candidateId: 'batch_candidate_1',
        jobId: 'batch_job_1',
        applicationId: 'batch_application_1',
        data: {
          jobDescription: 'Software Developer position requiring JavaScript and React experience.',
          resume: 'Frontend Developer with 3 years React experience and strong JavaScript skills.',
          jobRoles: 'Software Developer',
          ethnicity: 'Not Specified'
        }
      },
      {
        candidateId: 'batch_candidate_2',
        jobId: 'batch_job_2',
        applicationId: 'batch_application_2',
        data: {
          jobDescription: 'Data Analyst role requiring SQL and Excel expertise.',
          resume: 'Business Analyst with strong SQL skills and advanced Excel knowledge.',
          jobRoles: 'Data Analyst',
          ethnicity: 'White'
        }
      }
    ];

    try {
      const startTime = Date.now();
      const predictions = await this.xgboostService.predictBatch(batchInputs);
      const totalTime = Date.now() - startTime;

      console.log(`   ✅ Batch processing completed`);
      console.log(`   📊 Processed ${predictions.length} predictions`);
      console.log(`   ⏱️  Total time: ${totalTime}ms`);
      console.log(`   📈 Average time per prediction: ${(totalTime / predictions.length).toFixed(1)}ms`);

      predictions.forEach((pred, index) => {
        console.log(`   ${index + 1}. App ${pred.applicationId}: ${pred.probability.toFixed(4)} (${pred.binaryPrediction})`);
      });

    } catch (error) {
      console.log(`   ❌ Batch processing test failed: ${(error as Error).message}`);
    }
  }

  async runPerformanceTest(): Promise<void> {
    console.log('6️⃣ Running performance test...');
    
    const testInput = {
      candidateId: 'perf_test_candidate',
      jobId: 'perf_test_job',
      applicationId: 'perf_test_application',
      data: {
        jobDescription: 'Performance test job description with sufficient length to test processing time.',
        resume: 'Performance test resume with sufficient content to validate processing speed and accuracy.',
        jobRoles: 'Performance Test Role',
        ethnicity: 'Not Specified'
      }
    };

    const iterations = 10;
    const times: number[] = [];

    console.log(`   Running ${iterations} iterations...`);

    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = Date.now();
        await this.xgboostService.predict(testInput);
        const endTime = Date.now();
        times.push(endTime - startTime);
      } catch (error) {
        console.log(`   ❌ Iteration ${i + 1} failed: ${(error as Error).message}`);
      }
    }

    if (times.length > 0) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      console.log(`   📊 Performance Results:`);
      console.log(`      Average: ${avgTime.toFixed(1)}ms`);
      console.log(`      Min: ${minTime}ms`);
      console.log(`      Max: ${maxTime}ms`);
      console.log(`      Target: <2000ms`);
      
      if (avgTime < 2000) {
        console.log(`      ✅ Performance target met`);
      } else {
        console.log(`      ⚠️  Performance target not met`);
      }
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new XGBoostModelTester();
  
  // Run all tests
  tester.runTests()
    .then(() => tester.testBatchProcessing())
    .then(() => tester.runPerformanceTest())
    .then(() => {
      console.log('\n🎉 All XGBoost tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

export { XGBoostModelTester };

#!/usr/bin/env tsx
/**
 * TalentSol ML Integration Test Script
 * Tests the complete ML pipeline with your Decision Tree model
 */

import { PrismaClient } from '@prisma/client';
import { mlModelService } from '../src/services/mlModelService.js';
import { mlDataAdapter } from '../src/services/mlDataAdapter.js';
import { spawn } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  data?: any;
  duration?: number;
}

class MLIntegrationTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 TalentSol ML Integration Test Suite');
    console.log('=' * 60);

    try {
      await this.testPythonEnvironment();
      await this.testModelFile();
      await this.testModelLoading();
      await this.testDataAdapter();
      await this.testMLService();
      await this.testWithRealData();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  private async testPythonEnvironment(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('\n1️⃣ Testing Python Environment...');
      
      // Test Python availability
      const pythonVersion = await this.runCommand('python --version');
      console.log(`   Python version: ${pythonVersion.trim()}`);
      
      // Test required packages
      const packages = ['joblib', 'scikit-learn', 'pandas', 'numpy'];
      for (const pkg of packages) {
        try {
          await this.runCommand(`python -c "import ${pkg}; print('${pkg}:', ${pkg}.__version__)"`);
          console.log(`   ✅ ${pkg} available`);
        } catch (error) {
          throw new Error(`Required package ${pkg} not available`);
        }
      }
      
      this.addResult({
        test: 'Python Environment',
        status: 'PASS',
        message: 'All required packages available',
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.addResult({
        test: 'Python Environment',
        status: 'FAIL',
        message: `Python environment error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testModelFile(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('\n2️⃣ Testing Model File...');
      
      const modelPath = path.join(process.cwd(), 'backend', 'ml-models', 'decision-tree', 'best_performing_model_pipeline.joblib');
      console.log(`   Model path: ${modelPath}`);
      
      // Check if file exists
      const fs = await import('fs/promises');
      await fs.access(modelPath);
      
      // Check file size
      const stats = await fs.stat(modelPath);
      console.log(`   ✅ Model file found (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      
      this.addResult({
        test: 'Model File',
        status: 'PASS',
        message: `Model file exists (${(stats.size / 1024 / 1024).toFixed(2)} MB)`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.addResult({
        test: 'Model File',
        status: 'FAIL',
        message: `Model file not found: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testModelLoading(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('\n3️⃣ Testing Model Loading...');
      
      const testScript = path.join(process.cwd(), 'backend', 'ml-models', 'decision-tree', 'test_model.py');
      const result = await this.runCommand(`python "${testScript}"`);
      
      console.log('   Model test output:');
      console.log(result.split('\n').map(line => `     ${line}`).join('\n'));
      
      // Check if test passed
      if (result.includes('All tests passed!')) {
        this.addResult({
          test: 'Model Loading',
          status: 'PASS',
          message: 'Model loads and predicts successfully',
          duration: Date.now() - startTime
        });
      } else {
        throw new Error('Model test script failed');
      }
      
    } catch (error) {
      this.addResult({
        test: 'Model Loading',
        status: 'FAIL',
        message: `Model loading failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testDataAdapter(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('\n4️⃣ Testing Data Adapter...');
      
      // Test data quality metrics
      const metrics = await mlDataAdapter.getDataQualityMetrics();
      console.log(`   📊 Data Quality Metrics:`);
      console.log(`     Total Candidates: ${metrics.totalCandidates}`);
      console.log(`     Total Jobs: ${metrics.totalJobs}`);
      console.log(`     Total Applications: ${metrics.totalApplications}`);
      console.log(`     Data Quality Score: ${metrics.dataQualityScore}/100`);
      
      if (metrics.dataQualityScore < 50) {
        console.log('   ⚠️  Low data quality score - consider adding more sample data');
      }
      
      this.addResult({
        test: 'Data Adapter',
        status: 'PASS',
        message: `Data quality score: ${metrics.dataQualityScore}/100`,
        data: metrics,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.addResult({
        test: 'Data Adapter',
        status: 'FAIL',
        message: `Data adapter error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testMLService(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('\n5️⃣ Testing ML Service...');
      
      // Initialize ML models
      await mlModelService.initializeModels();
      console.log('   ✅ ML Service initialized');
      
      this.addResult({
        test: 'ML Service',
        status: 'PASS',
        message: 'ML Service initialized successfully',
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.addResult({
        test: 'ML Service',
        status: 'FAIL',
        message: `ML Service error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testWithRealData(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('\n6️⃣ Testing with Real TalentSol Data...');
      
      // Get a sample application from the database
      const application = await prisma.application.findFirst({
        include: {
          candidate: true,
          job: true
        }
      });
      
      if (!application) {
        this.addResult({
          test: 'Real Data Test',
          status: 'SKIP',
          message: 'No application data available for testing',
          duration: Date.now() - startTime
        });
        return;
      }
      
      console.log(`   📋 Testing with application: ${application.id}`);
      console.log(`   👤 Candidate: ${application.candidate.firstName} ${application.candidate.lastName}`);
      console.log(`   💼 Job: ${application.job.title}`);
      
      // Test ML prediction
      const prediction = await mlModelService.predictDecisionTree({
        candidateId: application.candidateId,
        jobId: application.jobId,
        candidateData: {
          resume: `${application.candidate.firstName} ${application.candidate.lastName} - ${application.candidate.currentPosition || 'Professional'} with ${application.candidate.experienceYears || 0} years of experience.`,
          experience: application.candidate.experienceYears || 0,
          skills: [],
          location: application.candidate.location || '',
          education: application.candidate.educationLevel || '',
          currentPosition: application.candidate.currentPosition,
          expectedSalary: application.candidate.expectedSalaryMin
        },
        jobData: {
          title: application.job.title,
          description: application.job.description || '',
          requirements: application.job.requiredQualifications || '',
          location: application.job.location || '',
          salaryRange: {
            min: application.job.salaryMin || 0,
            max: application.job.salaryMax || 0
          },
          experienceLevel: application.job.experienceLevel || '',
          skills: []
        }
      });
      
      console.log(`   🎯 Prediction Result:`);
      console.log(`     Score: ${prediction.score}`);
      console.log(`     Confidence: ${prediction.confidence}`);
      console.log(`     Model: ${prediction.model}`);
      console.log(`     Reasoning: ${prediction.reasoning.join(', ')}`);
      
      this.addResult({
        test: 'Real Data Test',
        status: 'PASS',
        message: `Prediction successful - Score: ${prediction.score}`,
        data: {
          applicationId: application.id,
          prediction: prediction
        },
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.addResult({
        test: 'Real Data Test',
        status: 'FAIL',
        message: `Real data test failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async runCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('cmd', ['/c', command], { 
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => stdout += data.toString());
      child.stderr.on('data', (data) => stderr += data.toString());
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed: ${stderr || stdout}`));
        }
      });
    });
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
  }

  private printResults(): void {
    console.log('\n📊 Test Results Summary');
    console.log('=' * 60);
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    this.results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${index + 1}. ${icon} ${result.test}: ${result.message}${duration}`);
    });
    
    console.log('\n📈 Summary:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your Decision Tree model is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Run the tests
const tester = new MLIntegrationTester();
tester.runAllTests().catch(console.error);

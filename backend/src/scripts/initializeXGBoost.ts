#!/usr/bin/env tsx

/**
 * XGBoost Initialization Script
 * Initializes XGBoost model and integration service for local development
 */

import { xgboostIntegrationService } from '../services/xgboostIntegrationService.js';
import { XGBoostModelService } from '../services/xgboostModelService.js';
import { websocketService } from '../services/websocketService.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../lib/prisma.js';
import path from 'path';
import fs from 'fs/promises';

class XGBoostInitializer {
  private xgboostService: XGBoostModelService;

  constructor() {
    this.xgboostService = new XGBoostModelService();
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing XGBoost Integration for TalentSol...\n');

    try {
      // Step 1: Validate environment
      await this.validateEnvironment();

      // Step 2: Check database connection
      await this.checkDatabaseConnection();

      // Step 3: Initialize XGBoost model
      await this.initializeModel();

      // Step 4: Initialize integration service
      await this.initializeIntegrationService();

      // Step 5: Test WebSocket service
      await this.testWebSocketService();

      // Step 6: Run health checks
      await this.runHealthChecks();

      console.log('\n✅ XGBoost Integration initialized successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Start the backend: yarn dev');
      console.log('2. Test predictions: yarn xgboost:test-model');
      console.log('3. Process pending applications: yarn xgboost:process-pending');

    } catch (error) {
      console.error('\n❌ XGBoost initialization failed:', error);
      process.exit(1);
    }
  }

  private async validateEnvironment(): Promise<void> {
    console.log('1️⃣ Validating environment...');

    // Check required environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Check XGBoost-specific environment
    const xgboostEnvVars = {
      'XGBOOST_MODEL_PATH': process.env.XGBOOST_MODEL_PATH,
      'XGBOOST_PYTHON_WRAPPER': process.env.XGBOOST_PYTHON_WRAPPER,
      'XGBOOST_PYTHON_PATH': process.env.XGBOOST_PYTHON_PATH,
      'XGBOOST_LOCAL_DEVELOPMENT': process.env.XGBOOST_LOCAL_DEVELOPMENT
    };

    console.log('   📋 XGBoost Environment Variables:');
    Object.entries(xgboostEnvVars).forEach(([key, value]) => {
      const status = value ? '✅' : '⚠️ ';
      console.log(`      ${status} ${key}: ${value || 'not set'}`);
    });

    // Check model file exists
    const modelPath = process.env.XGBOOST_MODEL_PATH || 
      path.join(process.cwd(), 'ml-models', 'decision-tree', 'best_performing_model_pipeline.joblib');
    
    try {
      await fs.access(modelPath);
      console.log('   ✅ XGBoost model file found');
    } catch (error) {
      console.log('   ⚠️  XGBoost model file not found at:', modelPath);
      console.log('      Please run: yarn xgboost:setup first');
    }

    // Check Python wrapper exists
    const wrapperPath = process.env.XGBOOST_PYTHON_WRAPPER || 
      path.join(process.cwd(), 'ml-models', 'integration', 'xgboost_predict_wrapper.py');
    
    try {
      await fs.access(wrapperPath);
      console.log('   ✅ Python wrapper found');
    } catch (error) {
      console.log('   ⚠️  Python wrapper not found at:', wrapperPath);
      console.log('      Please run: yarn xgboost:setup first');
    }

    console.log('   ✅ Environment validation completed\n');
  }

  private async checkDatabaseConnection(): Promise<void> {
    console.log('2️⃣ Checking database connection...');

    try {
      // Test basic connection
      await prisma.$connect();
      console.log('   ✅ Database connection successful');

      // Check if XGBoost tables exist
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'ml_xgboost%'
      ` as any[];

      if (tables.length > 0) {
        console.log(`   ✅ Found ${tables.length} XGBoost tables`);
        tables.forEach((table: any) => {
          console.log(`      - ${table.table_name}`);
        });
      } else {
        console.log('   ⚠️  XGBoost tables not found');
        console.log('      Please run: yarn xgboost:migrate');
      }

      // Check existing ML predictions
      const predictionCount = await prisma.mlPrediction.count({
        where: { modelType: 'xgboost_decision_tree' }
      });
      console.log(`   📊 Existing XGBoost predictions: ${predictionCount}`);

    } catch (error) {
      console.log('   ❌ Database connection failed:', (error as Error).message);
      throw error;
    }

    console.log('   ✅ Database check completed\n');
  }

  private async initializeModel(): Promise<void> {
    console.log('3️⃣ Initializing XGBoost model...');

    try {
      await this.xgboostService.initializeModel();
      
      const metrics = this.xgboostService.getModelMetrics();
      console.log('   📊 Model Metrics:');
      console.log(`      Version: ${metrics.modelVersion}`);
      console.log(`      Threshold: ${metrics.optimizedThreshold}`);
      console.log(`      Target Recall: ${(metrics.targetRecall * 100).toFixed(1)}%`);
      console.log(`      Target Precision: ${(metrics.targetPrecision * 100).toFixed(1)}%`);
      
      console.log('   ✅ XGBoost model initialized successfully');

    } catch (error) {
      console.log('   ❌ Model initialization failed:', (error as Error).message);
      throw error;
    }

    console.log('   ✅ Model initialization completed\n');
  }

  private async initializeIntegrationService(): Promise<void> {
    console.log('4️⃣ Initializing integration service...');

    try {
      await xgboostIntegrationService.initialize();
      
      const status = await xgboostIntegrationService.getStatus();
      console.log('   📊 Integration Service Status:');
      console.log(`      Initialized: ${status.initialized ? '✅' : '❌'}`);
      console.log(`      Auto Processing: ${status.autoProcessing ? '✅' : '❌'}`);
      console.log(`      Batch Size: ${status.config.batchSize}`);
      console.log(`      Processing Interval: ${status.config.processingInterval}`);
      
      console.log('   ✅ Integration service initialized successfully');

    } catch (error) {
      console.log('   ❌ Integration service initialization failed:', (error as Error).message);
      throw error;
    }

    console.log('   ✅ Integration service initialization completed\n');
  }

  private async testWebSocketService(): Promise<void> {
    console.log('5️⃣ Testing WebSocket service...');

    try {
      const healthCheck = websocketService.healthCheck();
      console.log('   📊 WebSocket Health Check:');
      console.log(`      Status: ${healthCheck.status === 'healthy' ? '✅' : '❌'} ${healthCheck.status}`);
      console.log(`      Connected Users: ${healthCheck.connectedUsers}`);
      console.log(`      Uptime: ${Math.floor(healthCheck.uptime)}s`);
      
      console.log('   ✅ WebSocket service test completed');

    } catch (error) {
      console.log('   ⚠️  WebSocket service test failed:', (error as Error).message);
      console.log('      This is expected if WebSocket server is not running');
    }

    console.log('   ✅ WebSocket test completed\n');
  }

  private async runHealthChecks(): Promise<void> {
    console.log('6️⃣ Running health checks...');

    const healthChecks = [
      {
        name: 'Model Initialization',
        check: () => this.xgboostService.isModelInitialized()
      },
      {
        name: 'Database Connection',
        check: async () => {
          try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Integration Service',
        check: async () => {
          try {
            const status = await xgboostIntegrationService.getStatus();
            return status.initialized;
          } catch (error) {
            return false;
          }
        }
      }
    ];

    console.log('   🏥 Health Check Results:');
    
    for (const healthCheck of healthChecks) {
      try {
        const result = await healthCheck.check();
        const status = result ? '✅' : '❌';
        console.log(`      ${status} ${healthCheck.name}: ${result ? 'OK' : 'FAILED'}`);
      } catch (error) {
        console.log(`      ❌ ${healthCheck.name}: ERROR - ${(error as Error).message}`);
      }
    }

    console.log('   ✅ Health checks completed\n');
  }

  async testSamplePrediction(): Promise<void> {
    console.log('7️⃣ Testing sample prediction...');

    const sampleInput = {
      candidateId: 'init_test_candidate',
      jobId: 'init_test_job',
      applicationId: 'init_test_application',
      data: {
        jobDescription: 'Software Engineer position requiring Python programming skills and experience with machine learning frameworks.',
        resume: 'Software Developer with 4 years of Python experience, including work with scikit-learn and data analysis.',
        jobRoles: 'Software Engineer',
        ethnicity: 'Not Specified'
      }
    };

    try {
      const startTime = Date.now();
      const prediction = await this.xgboostService.predict(sampleInput);
      const processingTime = Date.now() - startTime;

      console.log('   📊 Sample Prediction Results:');
      console.log(`      Probability: ${prediction.probability.toFixed(4)}`);
      console.log(`      Binary Prediction: ${prediction.binaryPrediction}`);
      console.log(`      Confidence: ${prediction.confidence.toFixed(4)}`);
      console.log(`      Processing Time: ${processingTime}ms`);
      console.log(`      Threshold Used: ${prediction.thresholdUsed}`);
      
      if (processingTime < 2000) {
        console.log('      ✅ Processing time within target (<2s)');
      } else {
        console.log('      ⚠️  Processing time exceeded target (2s)');
      }

      console.log('   ✅ Sample prediction test completed');

    } catch (error) {
      console.log('   ❌ Sample prediction test failed:', (error as Error).message);
      throw error;
    }

    console.log('   ✅ Sample prediction test completed\n');
  }

  async displaySummary(): Promise<void> {
    console.log('📋 INITIALIZATION SUMMARY');
    console.log('========================');
    
    try {
      const status = await xgboostIntegrationService.getStatus();
      const metrics = this.xgboostService.getModelMetrics();
      
      console.log(`🤖 Model: ${metrics.modelVersion} (${metrics.requiredSklearnVersion})`);
      console.log(`🎯 Threshold: ${metrics.optimizedThreshold}`);
      console.log(`📊 Targets: ${(metrics.targetRecall * 100).toFixed(1)}% recall, ${(metrics.targetPrecision * 100).toFixed(1)}% precision`);
      console.log(`⚙️  Auto Processing: ${status.autoProcessing ? 'Enabled' : 'Disabled'}`);
      console.log(`📦 Batch Size: ${status.config.batchSize}`);
      console.log(`⏰ Interval: ${status.config.processingInterval}`);
      
      console.log('\n🔗 Available Endpoints:');
      console.log('   POST /api/xgboost/initialize');
      console.log('   GET  /api/xgboost/status');
      console.log('   POST /api/xgboost/predict/:id');
      console.log('   POST /api/xgboost/predict-batch');
      console.log('   POST /api/xgboost/process-pending');
      console.log('   GET  /api/xgboost/metrics');
      
    } catch (error) {
      console.log('⚠️  Could not retrieve full status');
    }
  }
}

// Run initialization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const initializer = new XGBoostInitializer();
  
  initializer.initialize()
    .then(() => initializer.testSamplePrediction())
    .then(() => initializer.displaySummary())
    .then(() => {
      console.log('\n🎉 XGBoost initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Initialization failed:', error);
      process.exit(1);
    });
}

export { XGBoostInitializer };

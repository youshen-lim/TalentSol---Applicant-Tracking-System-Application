import { XGBoostModelService } from './xgboostModelService';
import { XGBoostDataMappingService } from './xgboostDataMappingService';
import { websocketService } from './websocketService';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';
import cron from 'node-cron';

export interface XGBoostIntegrationConfig {
  autoProcessing: boolean;
  batchSize: number;
  processingInterval: string; // cron expression
  maxRetries: number;
  retryDelay: number; // milliseconds
}

export class XGBoostIntegrationService {
  private static instance: XGBoostIntegrationService;
  private xgboostService: XGBoostModelService;
  private mappingService: XGBoostDataMappingService;
  private config: XGBoostIntegrationConfig;
  private isProcessing = false;
  private cronJob: any;

  private constructor() {
    this.xgboostService = new XGBoostModelService();
    this.mappingService = new XGBoostDataMappingService();
    this.config = {
      autoProcessing: true,
      batchSize: 20,
      processingInterval: '*/10 * * * *', // Every 10 minutes
      maxRetries: 3,
      retryDelay: 5000 // 5 seconds
    };
  }

  public static getInstance(): XGBoostIntegrationService {
    if (!XGBoostIntegrationService.instance) {
      XGBoostIntegrationService.instance = new XGBoostIntegrationService();
    }
    return XGBoostIntegrationService.instance;
  }

  /**
   * Initialize the XGBoost integration service
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing XGBoost Integration Service...');
      
      // Initialize XGBoost model
      await this.xgboostService.initializeModel();
      
      // Start automatic processing if enabled
      if (this.config.autoProcessing) {
        this.startAutomaticProcessing();
      }
      
      logger.info('XGBoost Integration Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize XGBoost Integration Service:', error);
      throw error;
    }
  }

  /**
   * Start automatic processing of pending applications
   */
  startAutomaticProcessing(): void {
    if (this.cronJob) {
      this.cronJob.destroy();
    }

    this.cronJob = cron.schedule(this.config.processingInterval, async () => {
      if (!this.isProcessing) {
        await this.processPendingApplications();
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    logger.info(`Automatic XGBoost processing started with interval: ${this.config.processingInterval}`);
  }

  /**
   * Stop automatic processing
   */
  stopAutomaticProcessing(): void {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
      logger.info('Automatic XGBoost processing stopped');
    }
  }

  /**
   * Process pending applications automatically
   */
  async processPendingApplications(): Promise<{
    processed: number;
    failed: number;
    skipped: number;
  }> {
    if (this.isProcessing) {
      logger.warn('XGBoost processing already in progress, skipping...');
      return { processed: 0, failed: 0, skipped: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;
    let skipped = 0;

    try {
      logger.info('Starting automatic XGBoost processing...');

      // Get pending applications
      const applicationIds = await this.mappingService.getApplicationsForProcessing(this.config.batchSize);
      
      if (applicationIds.length === 0) {
        logger.info('No pending applications for XGBoost processing');
        return { processed, failed, skipped };
      }

      logger.info(`Found ${applicationIds.length} applications for XGBoost processing`);

      // Process applications in smaller batches to manage memory
      const smallBatchSize = Math.min(5, this.config.batchSize);
      
      for (let i = 0; i < applicationIds.length; i += smallBatchSize) {
        const batch = applicationIds.slice(i, i + smallBatchSize);
        
        try {
          const results = await this.processBatchWithRetry(batch);
          processed += results.processed;
          failed += results.failed;
          skipped += results.skipped;
          
          // Small delay between batches to prevent overwhelming the system
          if (i + smallBatchSize < applicationIds.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error) {
          logger.error(`Batch processing failed for applications ${batch.join(', ')}:`, error);
          failed += batch.length;
        }
      }

      logger.info(`XGBoost processing completed: ${processed} processed, ${failed} failed, ${skipped} skipped`);

    } catch (error) {
      logger.error('Automatic XGBoost processing failed:', error);
    } finally {
      this.isProcessing = false;
    }

    return { processed, failed, skipped };
  }

  /**
   * Process a batch of applications with retry logic
   */
  private async processBatchWithRetry(applicationIds: string[]): Promise<{
    processed: number;
    failed: number;
    skipped: number;
  }> {
    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const applicationId of applicationIds) {
      let retries = 0;
      let success = false;

      while (retries < this.config.maxRetries && !success) {
        try {
          // Check if already processed
          const hasExisting = await this.mappingService.hasExistingPrediction(applicationId);
          if (hasExisting) {
            skipped++;
            success = true;
            continue;
          }

          // Map application data
          const modelInput = await this.mappingService.mapApplicationToModelInput(applicationId);
          
          // Make prediction
          const prediction = await this.xgboostService.predict(modelInput);
          
          // Emit WebSocket event
          await websocketService.emitXGBoostPredictionCompleted(
            prediction.applicationId,
            prediction.candidateId,
            prediction.jobId,
            {
              probability: prediction.probability,
              binary_prediction: prediction.binaryPrediction,
              confidence: prediction.confidence,
              threshold_used: prediction.thresholdUsed,
              model_version: prediction.modelVersion
            },
            prediction.processingTimeMs
          );

          // Update performance metrics
          await this.updatePerformanceMetrics(prediction);

          processed++;
          success = true;
          
          logger.debug(`Successfully processed application ${applicationId}`);

        } catch (error) {
          retries++;
          logger.warn(`Attempt ${retries} failed for application ${applicationId}:`, error);
          
          if (retries < this.config.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          } else {
            failed++;
            
            // Emit failure event
            await websocketService.emitXGBoostPredictionFailed(
              applicationId,
              'unknown',
              'unknown',
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
        }
      }
    }

    return { processed, failed, skipped };
  }

  /**
   * Process single application on demand
   */
  async processSingleApplication(applicationId: string, force = false): Promise<any> {
    try {
      // Check if already processed
      if (!force) {
        const hasExisting = await this.mappingService.hasExistingPrediction(applicationId);
        if (hasExisting) {
          throw new Error('Application already has XGBoost prediction. Use force=true to regenerate.');
        }
      }

      // Emit processing started event
      await websocketService.emitMLProcessingStarted(
        applicationId,
        'unknown', // candidateId will be filled by the service
        'unknown', // jobId will be filled by the service
        `xgboost_${Date.now()}`
      );

      // Map application data
      const modelInput = await this.mappingService.mapApplicationToModelInput(applicationId);
      
      // Make prediction
      const prediction = await this.xgboostService.predict(modelInput);
      
      // Emit success event
      await websocketService.emitXGBoostPredictionCompleted(
        prediction.applicationId,
        prediction.candidateId,
        prediction.jobId,
        {
          probability: prediction.probability,
          binary_prediction: prediction.binaryPrediction,
          confidence: prediction.confidence,
          threshold_used: prediction.thresholdUsed,
          model_version: prediction.modelVersion
        },
        prediction.processingTimeMs
      );

      // Update performance metrics
      await this.updatePerformanceMetrics(prediction);

      return prediction;

    } catch (error) {
      logger.error(`Failed to process application ${applicationId}:`, error);
      
      // Emit failure event
      await websocketService.emitXGBoostPredictionFailed(
        applicationId,
        'unknown',
        'unknown',
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      throw error;
    }
  }

  /**
   * Update performance metrics in database
   */
  private async updatePerformanceMetrics(prediction: any): Promise<void> {
    try {
      await prisma.$executeRaw`
        SELECT update_xgboost_performance_metrics(
          ${prediction.modelVersion}::VARCHAR,
          1::INTEGER,
          ${prediction.binaryPrediction}::INTEGER,
          ${prediction.confidence}::DECIMAL,
          ${prediction.processingTimeMs}::INTEGER
        )
      `;
    } catch (error) {
      logger.warn('Failed to update XGBoost performance metrics:', error);
    }
  }

  /**
   * Get service status and metrics
   */
  async getStatus(): Promise<{
    initialized: boolean;
    processing: boolean;
    autoProcessing: boolean;
    modelMetrics: any;
    recentPerformance: any;
    config: XGBoostIntegrationConfig;
  }> {
    const modelMetrics = this.xgboostService.getModelMetrics();
    
    // Get recent performance data
    const recentPerformance = await prisma.mlXgboostPerformance.findFirst({
      where: {
        modelVersion: modelMetrics.modelVersion
      },
      orderBy: { evaluationDate: 'desc' }
    });

    return {
      initialized: this.xgboostService.isModelInitialized(),
      processing: this.isProcessing,
      autoProcessing: !!this.cronJob,
      modelMetrics,
      recentPerformance,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<XGBoostIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart automatic processing if interval changed
    if (newConfig.processingInterval && this.cronJob) {
      this.stopAutomaticProcessing();
      if (this.config.autoProcessing) {
        this.startAutomaticProcessing();
      }
    }
    
    logger.info('XGBoost integration configuration updated:', this.config);
  }

  /**
   * Cleanup expired features and old logs
   */
  async cleanup(): Promise<void> {
    try {
      // Cleanup expired features
      const deletedFeatures = await prisma.$executeRaw`SELECT cleanup_expired_xgboost_features()`;
      
      // Cleanup old prediction logs (keep last 30 days)
      const deletedLogs = await prisma.mlXgboostPredictionLogs.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      logger.info(`XGBoost cleanup completed: ${deletedFeatures} features, ${deletedLogs.count} logs deleted`);
    } catch (error) {
      logger.error('XGBoost cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const xgboostIntegrationService = XGBoostIntegrationService.getInstance();

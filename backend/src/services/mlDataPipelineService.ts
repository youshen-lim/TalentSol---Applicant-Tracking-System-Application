import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { mlModelService, MLModelInput } from './mlModelService';
import { redisClient } from '../config/redis';
import { EventEmitter } from 'events';

export interface MLDataPipelineConfig {
  batchSize: number;
  processingInterval: number; // milliseconds
  retryAttempts: number;
  enableRealTimeProcessing: boolean;
  modelVersioning: boolean;
}

export interface MLTrainingData {
  candidateId: string;
  jobId: string;
  applicationId: string;
  features: Record<string, any>;
  label: 'best_match' | 'not_match';
  timestamp: string;
  version: string;
}

export class MLDataPipelineService extends EventEmitter {
  private prisma: PrismaClient;
  private config: MLDataPipelineConfig;
  private processingQueue: string[] = [];
  private isProcessing = false;

  constructor(prisma: PrismaClient, config?: Partial<MLDataPipelineConfig>) {
    super();
    this.prisma = prisma;
    this.config = {
      batchSize: 50,
      processingInterval: 30000, // 30 seconds
      retryAttempts: 3,
      enableRealTimeProcessing: true,
      modelVersioning: true,
      ...config
    };

    this.startProcessingLoop();
  }

  /**
   * Extract and transform candidate data for ML processing
   */
  async extractCandidateData(candidateId: string): Promise<any> {
    try {
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          applications: {
            include: {
              job: true,
              documents: true
            }
          }
        }
      });

      if (!candidate) {
        throw new Error(`Candidate not found: ${candidateId}`);
      }

      // Transform candidate data for ML
      const transformedData = {
        candidateId: candidate.id,
        personalInfo: {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location
        },
        professionalInfo: {
          experience: candidate.experienceYears || 0,
          currentPosition: candidate.currentPosition,
          currentCompany: candidate.currentCompany,
          skills: this.parseJsonField(candidate.skillsArray) || [],
          education: candidate.educationLevel,
          certifications: this.parseJsonField(candidate.certifications) || []
        },
        preferences: {
          expectedSalaryMin: candidate.expectedSalaryMin,
          expectedSalaryMax: candidate.expectedSalaryMax,
          workType: candidate.preferredWorkType,
          remotePreference: candidate.remoteWorkPreference,
          locationPreferences: {
            city: candidate.locationCity,
            state: candidate.locationState,
            country: candidate.locationCountry
          }
        },
        applications: candidate.applications.map(app => ({
          applicationId: app.id,
          jobId: app.jobId,
          status: app.status,
          submittedAt: app.submittedAt,
          score: app.score,
          jobTitle: app.job.title,
          jobDescription: app.job.description
        }))
      };

      return transformedData;
    } catch (error) {
      logger.error(`Error extracting candidate data for ${candidateId}:`, error);
      throw error;
    }
  }

  /**
   * Extract and transform job data for ML processing
   */
  async extractJobData(jobId: string): Promise<any> {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        include: {
          applications: {
            include: {
              candidate: true
            }
          },
          company: true
        }
      });

      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      // Transform job data for ML
      const transformedData = {
        jobId: job.id,
        basicInfo: {
          title: job.title,
          department: job.department,
          description: job.description,
          responsibilities: job.responsibilities,
          requirements: job.requiredQualifications,
          preferredQualifications: job.preferredQualifications
        },
        compensation: {
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          currency: job.salaryCurrency,
          benefits: job.benefits
        },
        location: {
          city: job.locationCity,
          state: job.locationState,
          country: job.locationCountry,
          remoteAllowed: job.remoteWorkAllowed
        },
        requirements: {
          experienceLevel: job.experienceLevel,
          workType: job.workType,
          skills: this.parseJsonField(job.requiredSkillsArray) || [],
          preferredSkills: this.parseJsonField(job.preferredSkillsArray) || []
        },
        company: {
          name: job.company.name,
          size: job.companySizeCategory,
          industry: job.company.industry
        },
        applications: job.applications.map(app => ({
          applicationId: app.id,
          candidateId: app.candidateId,
          status: app.status,
          score: app.score,
          submittedAt: app.submittedAt
        }))
      };

      return transformedData;
    } catch (error) {
      logger.error(`Error extracting job data for ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Process application for ML prediction
   */
  async processApplicationForML(applicationId: string): Promise<void> {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          candidate: true,
          job: true,
          documents: true
        }
      });

      if (!application) {
        throw new Error(`Application not found: ${applicationId}`);
      }

      // Extract resume text from documents
      const resumeText = await this.extractResumeText(application.documents);

      // Prepare ML input
      const mlInput: MLModelInput = {
        candidateId: application.candidateId,
        jobId: application.jobId,
        candidateData: {
          resume: resumeText,
          experience: application.candidate.experienceYears || 0,
          skills: this.parseJsonField(application.candidate.skillsArray) || [],
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
          salaryRange: application.job.salaryMin && application.job.salaryMax ? {
            min: application.job.salaryMin,
            max: application.job.salaryMax
          } : undefined,
          experienceLevel: application.job.experienceLevel || '',
          skills: this.parseJsonField(application.job.requiredSkillsArray) || []
        }
      };

      // Get ML predictions
      const [logisticPrediction, treePrediction, ensemblePrediction] = await Promise.all([
        mlModelService.predictLogisticRegression(mlInput),
        mlModelService.predictDecisionTree(mlInput),
        mlModelService.predictEnsemble(mlInput)
      ]);

      // Store predictions in database
      await this.storePredictions(applicationId, [
        logisticPrediction,
        treePrediction,
        ensemblePrediction
      ]);

      // Update application score with ensemble prediction
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { score: Math.round(ensemblePrediction.score * 100) }
      });

      // Cache predictions for fast retrieval
      await this.cachePredictions(applicationId, ensemblePrediction);

      // Emit event for real-time updates
      this.emit('predictionComplete', {
        applicationId,
        candidateId: application.candidateId,
        jobId: application.jobId,
        prediction: ensemblePrediction
      });

      logger.info(`ML processing completed for application ${applicationId}`);

    } catch (error) {
      logger.error(`Error processing application ${applicationId} for ML:`, error);
      throw error;
    }
  }

  /**
   * Generate training data for model retraining
   */
  async generateTrainingData(startDate?: Date, endDate?: Date): Promise<MLTrainingData[]> {
    try {
      const whereClause: any = {};
      
      if (startDate || endDate) {
        whereClause.submittedAt = {};
        if (startDate) whereClause.submittedAt.gte = startDate;
        if (endDate) whereClause.submittedAt.lte = endDate;
      }

      const applications = await this.prisma.application.findMany({
        where: whereClause,
        include: {
          candidate: true,
          job: true,
          documents: true
        }
      });

      const trainingData: MLTrainingData[] = [];

      for (const app of applications) {
        // Determine label based on application outcome
        let label: 'best_match' | 'not_match' = 'not_match';
        
        if (app.hiredAt) {
          label = 'best_match';
        } else if (app.status === 'hired' || (app.score && app.score >= 80)) {
          label = 'best_match';
        }

        // Extract features
        const resumeText = await this.extractResumeText(app.documents);
        
        const features = {
          job_description: app.job.description || '',
          resume: resumeText,
          job_role: app.job.title,
          experience_years: app.candidate.experienceYears || 0,
          education_level: app.candidate.educationLevel || '',
          skills: this.parseJsonField(app.candidate.skillsArray) || [],
          location: app.candidate.location || '',
          expected_salary: app.candidate.expectedSalaryMin || 0,
          job_salary_min: app.job.salaryMin || 0,
          job_salary_max: app.job.salaryMax || 0,
          work_type: app.job.workType || '',
          remote_allowed: app.job.remoteWorkAllowed || false
        };

        trainingData.push({
          candidateId: app.candidateId,
          jobId: app.jobId,
          applicationId: app.id,
          features,
          label,
          timestamp: app.submittedAt?.toISOString() || new Date().toISOString(),
          version: this.getCurrentModelVersion()
        });
      }

      logger.info(`Generated ${trainingData.length} training samples`);
      return trainingData;

    } catch (error) {
      logger.error('Error generating training data:', error);
      throw error;
    }
  }

  /**
   * Queue application for ML processing
   */
  async queueForProcessing(applicationId: string): Promise<void> {
    if (!this.processingQueue.includes(applicationId)) {
      this.processingQueue.push(applicationId);
      logger.info(`Queued application ${applicationId} for ML processing`);
    }

    if (this.config.enableRealTimeProcessing && !this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Start the processing loop
   */
  private startProcessingLoop(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        await this.processQueue();
      }
    }, this.config.processingInterval);
  }

  /**
   * Process queued applications
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batch = this.processingQueue.splice(0, this.config.batchSize);

    logger.info(`Processing ML batch of ${batch.length} applications`);

    for (const applicationId of batch) {
      try {
        await this.processApplicationForML(applicationId);
      } catch (error) {
        logger.error(`Failed to process application ${applicationId}:`, error);
        // Could implement retry logic here
      }
    }

    this.isProcessing = false;
    logger.info(`Completed ML batch processing`);
  }

  /**
   * Store ML predictions in database
   */
  private async storePredictions(applicationId: string, predictions: any[]): Promise<void> {
    for (const prediction of predictions) {
      await this.prisma.mLPrediction.create({
        data: {
          applicationId,
          modelName: prediction.model,
          modelVersion: this.getCurrentModelVersion(),
          predictionScore: prediction.score,
          confidence: prediction.confidence,
          features: JSON.stringify(prediction.features),
          reasoning: JSON.stringify(prediction.reasoning),
          createdAt: new Date()
        }
      });
    }
  }

  /**
   * Cache predictions for fast retrieval
   */
  private async cachePredictions(applicationId: string, prediction: any): Promise<void> {
    const cacheKey = `ml:prediction:${applicationId}`;
    await redisClient.setex(cacheKey, 3600, JSON.stringify(prediction)); // Cache for 1 hour
  }

  /**
   * Extract resume text from documents
   */
  private async extractResumeText(documents: any[]): Promise<string> {
    // This would integrate with document parsing service
    // For now, return placeholder
    const resumeDoc = documents.find(doc => doc.type === 'resume');
    return resumeDoc?.content || 'Resume content not available';
  }

  /**
   * Parse JSON field safely
   */
  private parseJsonField(field: string | null): any {
    if (!field) return null;
    try {
      return JSON.parse(field);
    } catch {
      return null;
    }
  }

  /**
   * Get current model version
   */
  private getCurrentModelVersion(): string {
    return process.env.ML_MODEL_VERSION || 'v1.0.0';
  }
}

export const mlDataPipelineService = new MLDataPipelineService(new PrismaClient());

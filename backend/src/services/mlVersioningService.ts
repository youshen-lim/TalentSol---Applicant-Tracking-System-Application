import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  modelType: 'logistic_regression' | 'decision_tree' | 'ensemble';
  filePath: string;
  checksum: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  };
  metadata: {
    trainingDataSize: number;
    trainingDate: string;
    features: string[];
    hyperparameters: Record<string, any>;
  };
  status: 'active' | 'deprecated' | 'testing';
  createdAt: string;
  deployedAt?: string;
}

export interface ModelDeployment {
  modelVersionId: string;
  environment: 'development' | 'staging' | 'production';
  deployedAt: string;
  deployedBy: string;
  rollbackVersionId?: string;
  status: 'active' | 'rolled_back' | 'failed';
}

export class MLVersioningService {
  private prisma: PrismaClient;
  private modelsBasePath: string;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.modelsBasePath = path.join(process.cwd(), 'ml-models', 'versions');
  }

  /**
   * Register a new model version
   */
  async registerModelVersion(
    modelName: string,
    modelType: 'logistic_regression' | 'decision_tree' | 'ensemble',
    modelFilePath: string,
    performance: ModelVersion['performance'],
    metadata: ModelVersion['metadata']
  ): Promise<ModelVersion> {
    try {
      // Generate version number
      const version = await this.generateVersionNumber(modelName);
      
      // Calculate file checksum
      const checksum = await this.calculateFileChecksum(modelFilePath);
      
      // Copy model file to versioned storage
      const versionedPath = await this.storeVersionedModel(modelName, version, modelFilePath);
      
      // Create model version record
      const modelVersion = await this.prisma.mLModel.create({
        data: {
          name: modelName,
          type: modelType,
          modelType: modelType,
          version,
          modelPath: versionedPath,
          filePath: versionedPath,
          checksum,
          status: 'testing',
          metadata: JSON.stringify(metadata),
          trainingData: JSON.stringify(performance),
          features: JSON.stringify(metadata),
          trainedAt: new Date()
        }
      });

      const versionData: ModelVersion = {
        id: modelVersion.id,
        name: modelVersion.name,
        version: modelVersion.version,
        modelType: (modelVersion.modelType || modelVersion.type) as 'logistic_regression' | 'decision_tree' | 'ensemble',
        filePath: modelVersion.filePath || modelVersion.modelPath,
        checksum: modelVersion.checksum || '',
        performance,
        metadata,
        status: (modelVersion.status || 'active') as 'active' | 'deprecated' | 'testing',
        createdAt: modelVersion.createdAt.toISOString()
      };

      logger.info(`Registered model version: ${modelName} v${version}`);
      return versionData;

    } catch (error) {
      logger.error('Error registering model version:', error);
      throw error;
    }
  }

  /**
   * Deploy model version to environment
   */
  async deployModelVersion(
    modelVersionId: string,
    environment: 'development' | 'staging' | 'production',
    deployedBy: string
  ): Promise<ModelDeployment> {
    try {
      // Get model version
      const modelVersion = await this.prisma.mLModel.findUnique({
        where: { id: modelVersionId }
      });

      if (!modelVersion) {
        throw new Error(`Model version not found: ${modelVersionId}`);
      }

      // Get current active deployment for rollback
      const currentDeployment = await this.prisma.mLModel.findFirst({
        where: {
          name: modelVersion.name,
          status: 'active'
        }
      });

      // Create deployment record
      const deployment: ModelDeployment = {
        modelVersionId,
        environment,
        deployedAt: new Date().toISOString(),
        deployedBy,
        rollbackVersionId: currentDeployment?.id,
        status: 'active'
      };

      // Update model status
      await this.prisma.mLModel.update({
        where: { id: modelVersionId },
        data: {
          status: 'active',
          deployedAt: new Date()
        }
      });

      // Deactivate previous version
      if (currentDeployment) {
        await this.prisma.mLModel.update({
          where: { id: currentDeployment.id },
          data: { status: 'deprecated' }
        });
      }

      // Store deployment record (you might want to create a separate table for this)
      await this.storeDeploymentRecord(deployment);

      logger.info(`Deployed model ${modelVersion.name} v${modelVersion.version} to ${environment}`);
      return deployment;

    } catch (error) {
      logger.error('Error deploying model version:', error);
      throw error;
    }
  }

  /**
   * Rollback to previous model version
   */
  async rollbackModelVersion(
    modelName: string,
    environment: string,
    rolledBackBy: string
  ): Promise<ModelDeployment> {
    try {
      // Get current active deployment
      const currentDeployment = await this.getActiveDeployment(modelName, environment);
      
      if (!currentDeployment || !currentDeployment.rollbackVersionId) {
        throw new Error('No rollback version available');
      }

      // Deploy rollback version
      const rollbackDeployment = await this.deployModelVersion(
        currentDeployment.rollbackVersionId,
        environment as any,
        rolledBackBy
      );

      // Update current deployment status
      await this.updateDeploymentStatus(currentDeployment.modelVersionId, 'rolled_back');

      logger.info(`Rolled back model ${modelName} in ${environment}`);
      return rollbackDeployment;

    } catch (error) {
      logger.error('Error rolling back model version:', error);
      throw error;
    }
  }

  /**
   * Get active model version for environment
   */
  async getActiveModelVersion(
    modelName: string,
    environment: string = 'production'
  ): Promise<ModelVersion | null> {
    try {
      const modelVersion = await this.prisma.mLModel.findFirst({
        where: {
          name: modelName,
          status: 'active'
        },
        orderBy: {
          deployedAt: 'desc'
        }
      });

      if (!modelVersion) {
        return null;
      }

      return {
        id: modelVersion.id,
        name: modelVersion.name,
        version: modelVersion.version,
        modelType: (modelVersion.modelType || modelVersion.type) as 'logistic_regression' | 'decision_tree' | 'ensemble',
        filePath: modelVersion.filePath || modelVersion.modelPath,
        checksum: modelVersion.checksum || '',
        performance: JSON.parse(modelVersion.trainingData || '{}'),
        metadata: JSON.parse(modelVersion.metadata || modelVersion.features || '{}'),
        status: (modelVersion.status || 'active') as 'active' | 'deprecated' | 'testing',
        createdAt: modelVersion.createdAt.toISOString(),
        deployedAt: modelVersion.deployedAt?.toISOString()
      };

    } catch (error) {
      logger.error('Error getting active model version:', error);
      throw error;
    }
  }

  /**
   * List all model versions
   */
  async listModelVersions(modelName?: string): Promise<ModelVersion[]> {
    try {
      const whereClause = modelName ? { name: modelName } : {};
      
      const modelVersions = await this.prisma.mLModel.findMany({
        where: whereClause,
        orderBy: [
          { name: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      return modelVersions.map(mv => ({
        id: mv.id,
        name: mv.name,
        version: mv.version,
        modelType: mv.modelType || mv.type,
        filePath: mv.filePath || mv.modelPath,
        checksum: mv.checksum || '',
        performance: JSON.parse(mv.trainingData || '{}'),
        metadata: JSON.parse(mv.metadata || mv.features || '{}'),
        status: mv.status || 'active',
        createdAt: mv.createdAt.toISOString(),
        deployedAt: mv.deployedAt?.toISOString()
      })) as any[];

    } catch (error) {
      logger.error('Error listing model versions:', error);
      throw error;
    }
  }

  /**
   * Validate model integrity
   */
  async validateModelIntegrity(modelVersionId: string): Promise<boolean> {
    try {
      const modelVersion = await this.prisma.mLModel.findUnique({
        where: { id: modelVersionId }
      });

      if (!modelVersion) {
        return false;
      }

      // Check if file exists
      if (!modelVersion.filePath) {
        logger.error('Model file path is null');
        return false;
      }

      try {
        await fs.access(modelVersion.filePath);
      } catch {
        logger.error(`Model file not found: ${modelVersion.filePath}`);
        return false;
      }

      // Verify checksum
      const currentChecksum = await this.calculateFileChecksum(modelVersion.filePath);
      if (currentChecksum !== modelVersion.checksum) {
        logger.error(`Model checksum mismatch for ${modelVersionId}`);
        return false;
      }

      return true;

    } catch (error) {
      logger.error('Error validating model integrity:', error);
      return false;
    }
  }

  /**
   * Generate version number
   */
  private async generateVersionNumber(modelName: string): Promise<string> {
    const latestVersion = await this.prisma.mLModel.findFirst({
      where: { name: modelName },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestVersion) {
      return '1.0.0';
    }

    // Simple semantic versioning increment
    const [major, minor, patch] = latestVersion.version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  /**
   * Calculate file checksum
   */
  private async calculateFileChecksum(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Store versioned model file
   */
  private async storeVersionedModel(
    modelName: string,
    version: string,
    sourceFilePath: string
  ): Promise<string> {
    const versionDir = path.join(this.modelsBasePath, modelName, version);
    await fs.mkdir(versionDir, { recursive: true });

    const fileName = path.basename(sourceFilePath);
    const targetPath = path.join(versionDir, fileName);

    await fs.copyFile(sourceFilePath, targetPath);
    return targetPath;
  }

  /**
   * Store deployment record
   */
  private async storeDeploymentRecord(deployment: ModelDeployment): Promise<void> {
    // This could be stored in a separate deployments table
    // For now, we'll use the model metadata
    logger.info('Deployment record stored:', deployment);
  }

  /**
   * Get active deployment
   */
  private async getActiveDeployment(
    modelName: string,
    environment: string
  ): Promise<ModelDeployment | null> {
    // This would query the deployments table
    // For now, return mock data
    return null;
  }

  /**
   * Update deployment status
   */
  private async updateDeploymentStatus(
    modelVersionId: string,
    status: ModelDeployment['status']
  ): Promise<void> {
    // This would update the deployments table
    logger.info(`Updated deployment status for ${modelVersionId}: ${status}`);
  }
}

export const mlVersioningService = new MLVersioningService(new PrismaClient());

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

export interface XGBoostModelInput {
  candidateId: string;
  jobId: string;
  applicationId: string;
  data: {
    jobDescription: string;
    resume: string;
    jobRoles: string;
    ethnicity: string;
  };
}

export interface XGBoostPrediction {
  applicationId: string;
  candidateId: string;
  jobId: string;
  probability: number;           // Raw probability [0,1]
  binaryPrediction: 0 | 1;      // Binary classification using optimized threshold
  confidence: number;           // Confidence score [0,1]
  thresholdUsed: number;        // 0.5027 for your model
  modelVersion: string;         // Track model version
  processingTimeMs: number;     // Performance tracking
  featureExtractionTimeMs: number;
  inferenceTimeMs: number;
  reasoning: string[];          // Explanation for the prediction
  timestamp: string;
}

export class XGBoostModelService {
  private readonly modelPath: string;
  private readonly pythonWrapperPath: string;
  private readonly optimizedThreshold = 0.5027;  // Your model's optimized threshold
  private readonly modelVersion = '1.0';
  private readonly requiredSklearnVersion = '1.6.1';
  private readonly requiredJoblibVersion = '1.3.2';
  private readonly targetRecall = 0.70;
  private readonly targetPrecision = 0.57;
  private isInitialized = false;

  constructor() {
    // Use local development paths from environment or defaults
    const projectRoot = process.cwd();
    this.modelPath = process.env.XGBOOST_MODEL_PATH ||
      path.join(projectRoot, 'backend', 'ml-models', 'decision-tree', 'best_performing_model_pipeline.joblib');
    this.pythonWrapperPath = process.env.XGBOOST_PYTHON_WRAPPER ||
      path.join(projectRoot, 'backend', 'ml-models', 'integration', 'xgboost_predict_wrapper.py');

    console.log('🤖 XGBoost Model Service initialized (Local Development)');
    console.log('📁 Model path:', this.modelPath);
    console.log('🐍 Python wrapper:', this.pythonWrapperPath);
    console.log('🎯 Optimized threshold:', this.optimizedThreshold);
    console.log('📊 Target metrics: Recall=70%, Precision=57%');
    console.log('🏠 Local development mode:', process.env.XGBOOST_LOCAL_DEVELOPMENT === 'true');
  }

  /**
   * Initialize XGBoost model with version validation
   */
  async initializeModel(): Promise<void> {
    try {
      await this.validateModelFile();
      await this.validatePythonEnvironment();
      await this.createPythonWrapper();
      await this.validateModelCompatibility();
      this.isInitialized = true;
      logger.info('XGBoost model initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize XGBoost model:', error);
      throw error;
    }
  }

  /**
   * Make prediction using your trained XGBoost model
   */
  async predict(input: XGBoostModelInput): Promise<XGBoostPrediction> {
    const startTime = Date.now();
    
    if (!this.isInitialized) {
      await this.initializeModel();
    }

    try {
      // Validate input format matches your training data
      this.validateInput(input);

      const featureExtractionStart = Date.now();
      
      // Prepare input in your model's expected format
      const modelInput = {
        'Job Description': input.data.jobDescription,
        'Resume': input.data.resume,
        'Job Roles': input.data.jobRoles,
        'Ethnicity': input.data.ethnicity || 'Not Specified'
      };

      const featureExtractionTime = Date.now() - featureExtractionStart;
      const inferenceStart = Date.now();

      // Call Python wrapper for prediction
      const rawPrediction = await this.callPythonPredictor(modelInput);
      
      const inferenceTime = Date.now() - inferenceStart;
      const totalTime = Date.now() - startTime;

      // Apply your optimized threshold
      const binaryPrediction = rawPrediction.probability >= this.optimizedThreshold ? 1 : 0;
      
      // Calculate confidence (distance from decision boundary)
      const confidence = Math.abs(rawPrediction.probability - 0.5) * 2;

      // Generate reasoning based on prediction
      const reasoning = this.generateReasoning(rawPrediction, binaryPrediction);

      const prediction: XGBoostPrediction = {
        applicationId: input.applicationId,
        candidateId: input.candidateId,
        jobId: input.jobId,
        probability: rawPrediction.probability,
        binaryPrediction,
        confidence,
        thresholdUsed: this.optimizedThreshold,
        modelVersion: this.modelVersion,
        processingTimeMs: totalTime,
        featureExtractionTimeMs: featureExtractionTime,
        inferenceTimeMs: inferenceTime,
        reasoning,
        timestamp: new Date().toISOString()
      };

      // Store prediction in database
      await this.storePrediction(prediction);

      logger.info(`XGBoost prediction completed for application ${input.applicationId}: ${binaryPrediction} (${rawPrediction.probability.toFixed(4)})`);
      
      return prediction;

    } catch (error) {
      logger.error(`XGBoost prediction failed for application ${input.applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Batch prediction for multiple applications
   */
  async predictBatch(inputs: XGBoostModelInput[]): Promise<XGBoostPrediction[]> {
    const predictions: XGBoostPrediction[] = [];
    
    // Process in batches to manage memory
    const batchSize = 10;
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchPromises = batch.map(input => this.predict(input));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          predictions.push(result.value);
        } else {
          logger.error(`Batch prediction failed for input ${i + index}:`, result.reason);
        }
      });
    }
    
    return predictions;
  }

  /**
   * Validate input format matches your training data expectations
   */
  private validateInput(input: XGBoostModelInput): void {
    const { data } = input;
    
    if (!data.jobDescription || data.jobDescription.length < 50) {
      throw new Error('Job description must be at least 50 characters');
    }
    
    if (!data.resume || data.resume.length < 100) {
      throw new Error('Resume must be at least 100 characters');
    }
    
    if (!data.jobRoles || data.jobRoles.length < 3) {
      throw new Error('Job roles must be specified');
    }

    // Validate ethnicity is in expected format
    const validEthnicities = ['Not Specified', 'Asian', 'Black', 'Hispanic', 'White', 'Other'];
    if (data.ethnicity && !validEthnicities.includes(data.ethnicity)) {
      logger.warn(`Unexpected ethnicity value: ${data.ethnicity}, using 'Not Specified'`);
      data.ethnicity = 'Not Specified';
    }
  }

  /**
   * Call Python wrapper for model prediction using local virtual environment
   */
  private async callPythonPredictor(input: Record<string, string>): Promise<{ probability: number }> {
    return new Promise((resolve, reject) => {
      // Use local virtual environment Python if available
      const pythonPath = process.env.XGBOOST_PYTHON_PATH ||
        process.env.PYTHON_PATH ||
        this.getLocalPythonPath() ||
        'python';

      const pythonProcess = spawn(pythonPath, [this.pythonWrapperPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          VIRTUAL_ENV: process.env.XGBOOST_VENV_PATH || process.env.VIRTUAL_ENV,
          PATH: this.getEnhancedPath()
        }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });

      // Send input to Python process
      pythonProcess.stdin.write(JSON.stringify(input));
      pythonProcess.stdin.end();
    });
  }

  /**
   * Generate human-readable reasoning for the prediction
   */
  private generateReasoning(rawPrediction: any, binaryPrediction: number): string[] {
    const reasoning: string[] = [];
    
    if (binaryPrediction === 1) {
      reasoning.push(`Strong candidate match with ${(rawPrediction.probability * 100).toFixed(1)}% probability`);
      reasoning.push(`Exceeds optimized threshold of ${(this.optimizedThreshold * 100).toFixed(1)}%`);
      reasoning.push('Recommended for priority review based on XGBoost ensemble analysis');
    } else {
      reasoning.push(`Candidate probability ${(rawPrediction.probability * 100).toFixed(1)}% below threshold`);
      reasoning.push(`Does not meet ${(this.optimizedThreshold * 100).toFixed(1)}% threshold for priority screening`);
      reasoning.push('Consider for standard review process');
    }
    
    reasoning.push(`Model optimized for 70% recall and 57% precision`);
    
    return reasoning;
  }

  /**
   * Store prediction in database
   */
  private async storePrediction(prediction: XGBoostPrediction): Promise<void> {
    await prisma.mlPrediction.create({
      data: {
        applicationId: prediction.applicationId,
        modelType: 'xgboost_decision_tree',
        modelVersion: prediction.modelVersion,
        inputFeatures: JSON.stringify({
          threshold_used: prediction.thresholdUsed,
          processing_time_ms: prediction.processingTimeMs
        }),
        prediction: JSON.stringify({
          probability: prediction.probability,
          binary_prediction: prediction.binaryPrediction,
          threshold_used: prediction.thresholdUsed
        }),
        confidence: prediction.confidence,
        explanation: JSON.stringify({
          reasoning: prediction.reasoning,
          model_type: 'xgboost_decision_tree_ensemble',
          preprocessing: 'hashing_vectorizer_onehot_encoding'
        })
      }
    });
  }

  /**
   * Validate model file exists
   */
  private async validateModelFile(): Promise<void> {
    try {
      await fs.access(this.modelPath);
      logger.info(`XGBoost model file found: ${this.modelPath}`);
    } catch (error) {
      throw new Error(`XGBoost model file not found: ${this.modelPath}`);
    }
  }

  /**
   * Validate Python environment and dependencies
   */
  private async validatePythonEnvironment(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', ['-c', `
import sys
import sklearn
import joblib
import pandas
import numpy
print(f"sklearn_version:{sklearn.__version__}")
print(f"joblib_version:{joblib.__version__}")
print("validation_success")
      `]);

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Python environment validation failed'));
          return;
        }

        // Check versions
        if (output.includes(`sklearn_version:${this.requiredSklearnVersion}`) &&
            output.includes(`joblib_version:${this.requiredJoblibVersion}`)) {
          logger.info('Python environment validated successfully');
          resolve();
        } else {
          reject(new Error(`Version mismatch. Required: sklearn==${this.requiredSklearnVersion}, joblib==${this.requiredJoblibVersion}`));
        }
      });
    });
  }

  /**
   * Create Python wrapper script for model prediction
   */
  private async createPythonWrapper(): Promise<void> {
    const wrapperContent = `#!/usr/bin/env python3
"""
XGBoost Model Prediction Wrapper for TalentSol
Loads your trained best_performing_model_pipeline.joblib and makes predictions
"""
import sys
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

# Model path
MODEL_PATH = "${this.modelPath.replace(/\\/g, '/')}"

def load_model():
    """Load the trained XGBoost pipeline"""
    try:
        pipeline = joblib.load(MODEL_PATH)
        return pipeline
    except Exception as e:
        raise Exception(f"Failed to load model: {str(e)}")

def preprocess_input(input_data):
    """Preprocess input to match training format"""
    # Create DataFrame with exact column names from training
    df = pd.DataFrame([{
        'Job Description': input_data.get('Job Description', ''),
        'Resume': input_data.get('Resume', ''),
        'Job Roles': input_data.get('Job Roles', ''),
        'Ethnicity': input_data.get('Ethnicity', 'Not Specified')
    }])

    return df

def predict(pipeline, input_df):
    """Make prediction using the loaded pipeline"""
    try:
        # Get probability for positive class (Best Match)
        probabilities = pipeline.predict_proba(input_df)
        probability = float(probabilities[0][1])  # Positive class probability

        return {
            'probability': probability,
            'model_type': 'xgboost_decision_tree_ensemble'
        }
    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        # Load model
        pipeline = load_model()

        # Preprocess input
        input_df = preprocess_input(input_data)

        # Make prediction
        result = predict(pipeline, input_df)

        # Output result as JSON
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

    try {
      await fs.writeFile(this.pythonWrapperPath, wrapperContent);
      logger.info(`Python wrapper created: ${this.pythonWrapperPath}`);
    } catch (error) {
      throw new Error(`Failed to create Python wrapper: ${error}`);
    }
  }

  /**
   * Validate model compatibility with test prediction
   */
  private async validateModelCompatibility(): Promise<void> {
    const testInput = {
      'Job Description': 'Software Engineer position requiring Python and machine learning experience',
      'Resume': 'Experienced software developer with 5 years in Python, machine learning, and data science',
      'Job Roles': 'Software Engineer',
      'Ethnicity': 'Not Specified'
    };

    try {
      const result = await this.callPythonPredictor(testInput);
      if (typeof result.probability === 'number' && result.probability >= 0 && result.probability <= 1) {
        logger.info(`Model validation successful. Test prediction: ${result.probability.toFixed(4)}`);
      } else {
        throw new Error('Invalid prediction format');
      }
    } catch (error) {
      throw new Error(`Model compatibility validation failed: ${error}`);
    }
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics() {
    return {
      modelVersion: this.modelVersion,
      optimizedThreshold: this.optimizedThreshold,
      targetRecall: this.targetRecall,
      targetPrecision: this.targetPrecision,
      requiredSklearnVersion: this.requiredSklearnVersion,
      requiredJoblibVersion: this.requiredJoblibVersion
    };
  }

  /**
   * Check if model is initialized
   */
  isModelInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get local Python path from virtual environment
   */
  private getLocalPythonPath(): string | null {
    const projectRoot = process.cwd();
    const venvPath = process.env.XGBOOST_VENV_PATH ||
      path.join(projectRoot, 'backend', 'ml-models', 'shared', 'venv');

    const pythonPath = process.platform === 'win32'
      ? path.join(venvPath, 'Scripts', 'python.exe')
      : path.join(venvPath, 'bin', 'python');

    try {
      require('fs').accessSync(pythonPath);
      return pythonPath;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get enhanced PATH with virtual environment
   */
  private getEnhancedPath(): string {
    const currentPath = process.env.PATH || '';
    const venvPath = process.env.XGBOOST_VENV_PATH || process.env.VIRTUAL_ENV;

    if (!venvPath) {
      return currentPath;
    }

    const venvBinPath = process.platform === 'win32'
      ? path.join(venvPath, 'Scripts')
      : path.join(venvPath, 'bin');

    const pathSeparator = process.platform === 'win32' ? ';' : ':';
    return `${venvBinPath}${pathSeparator}${currentPath}`;
  }
}

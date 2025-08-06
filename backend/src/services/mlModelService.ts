import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

export interface MLModelPrediction {
  candidateId: string;
  jobId: string;
  score: number;
  confidence: number;
  model: 'logistic_regression' | 'decision_tree';
  features: Record<string, any>;
  reasoning: string[];
  timestamp: string;
}

export interface MLModelInput {
  candidateId: string;
  jobId: string;
  candidateData: {
    resume: string;
    experience: number;
    skills: string[];
    location: string;
    education: string;
    currentPosition?: string;
    expectedSalary?: number;
  };
  jobData: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    salaryRange?: { min: number; max: number };
    experienceLevel: string;
    skills: string[];
  };
}

export class MLModelService {
  private readonly modelsPath: string;
  private readonly pythonPath: string;
  private readonly pythonEnvPath: string;
  private readonly logisticRegressionPath: string;
  private readonly decisionTreePath: string;
  private readonly logisticModelFile: string;
  private readonly decisionTreeModelFile: string;
  private modelsInitialized: boolean = false;

  constructor() {
    this.modelsPath = path.join(process.cwd(), 'ml-models');
    this.pythonEnvPath = path.join(this.modelsPath, 'shared', 'ml-env', 'bin', 'python');
    this.pythonPath = process.env.PYTHON_PATH || this.pythonEnvPath;
    this.logisticRegressionPath = path.join(this.modelsPath, 'logistic-regression');
    this.decisionTreePath = path.join(this.modelsPath, 'decision-tree');
    this.logisticModelFile = path.join(this.logisticRegressionPath, 'optimized_tfidf_logistic_regression_pipeline.joblib');
    this.decisionTreeModelFile = path.join(this.decisionTreePath, 'best_performing_model_pipeline.joblib');
  }

  /**
   * Initialize ML models by checking local files and validating setup
   */
  async initializeModels(): Promise<void> {
    try {
      await this.ensureModelsDirectory();
      await this.validateModelFiles();
      await this.validatePythonEnvironment();
      await this.validateModels();
      this.modelsInitialized = true;
      logger.info('ML models initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ML models:', error);
      throw error;
    }
  }

  /**
   * Get prediction from logistic regression model
   */
  async predictLogisticRegression(input: MLModelInput): Promise<MLModelPrediction> {
    if (!this.modelsInitialized) {
      await this.initializeModels();
    }

    const inputData = this.formatInputForLogisticRegression(input);
    return this.runLocalPythonPrediction(inputData, 'logistic_regression');
  }

  /**
   * Get prediction from decision tree model
   */
  async predictDecisionTree(input: MLModelInput): Promise<MLModelPrediction> {
    if (!this.modelsInitialized) {
      await this.initializeModels();
    }

    const inputData = this.formatInputForDecisionTree(input);
    return this.runLocalPythonPrediction(inputData, 'decision_tree');
  }

  /**
   * Get ensemble prediction from both models
   */
  async predictEnsemble(input: MLModelInput): Promise<MLModelPrediction> {
    const [logisticResult, treeResult] = await Promise.all([
      this.predictLogisticRegression(input),
      this.predictDecisionTree(input)
    ]);

    // Weighted ensemble (you can adjust weights based on model performance)
    const logisticWeight = 0.6;
    const treeWeight = 0.4;
    
    const ensembleScore = (logisticResult.score * logisticWeight) + (treeResult.score * treeWeight);
    const ensembleConfidence = (logisticResult.confidence * logisticWeight) + (treeResult.confidence * treeWeight);

    return {
      candidateId: input.candidateId,
      jobId: input.jobId,
      score: ensembleScore,
      confidence: ensembleConfidence,
      model: 'logistic_regression', // Primary model
      features: { ...logisticResult.features, ...treeResult.features },
      reasoning: [
        `Ensemble prediction combining Logistic Regression (${logisticResult.score.toFixed(3)}) and Decision Tree (${treeResult.score.toFixed(3)})`,
        ...logisticResult.reasoning,
        ...treeResult.reasoning
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run local Python prediction using embedded script
   */
  private async runLocalPythonPrediction(
    inputData: any,
    modelType: 'logistic_regression' | 'decision_tree'
  ): Promise<MLModelPrediction> {
    const scriptContent = this.generatePythonScript(modelType);
    const tempScriptPath = path.join(this.modelsPath, 'temp_predict.py');

    try {
      // Write temporary Python script
      await fs.writeFile(tempScriptPath, scriptContent);

      return new Promise((resolve, reject) => {
        const python = spawn(this.pythonPath, [tempScriptPath], {
          cwd: this.modelsPath,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        python.on('close', async (code) => {
          // Clean up temp file
          try {
            await fs.unlink(tempScriptPath);
          } catch (e) {
            // Ignore cleanup errors
          }

          if (code !== 0) {
            logger.error(`Python prediction failed with code ${code}:`, stderr);
            reject(new Error(`ML model prediction failed: ${stderr}`));
            return;
          }

          try {
            const result = JSON.parse(stdout);
            resolve({
              candidateId: inputData.candidateId,
              jobId: inputData.jobId,
              score: result.probability || result.score,
              confidence: result.confidence || 0.8,
              model: modelType,
              features: result.features || {},
              reasoning: result.reasoning || [`${modelType} prediction`],
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            logger.error('Failed to parse ML model output:', error);
            reject(new Error('Invalid ML model response format'));
          }
        });

        // Send input data to Python script
        python.stdin.write(JSON.stringify(inputData));
        python.stdin.end();
      });
    } catch (error) {
      logger.error('Failed to create Python script:', error);
      throw error;
    }
  }

  /**
   * Format input data for logistic regression model
   */
  private formatInputForLogisticRegression(input: MLModelInput): any {
    return {
      candidateId: input.candidateId,
      jobId: input.jobId,
      job_description: input.jobData.description,
      resume: input.candidateData.resume,
      job_role: input.jobData.title,
      ethnicity: 'Not Specified', // Privacy-compliant default
      experience_years: input.candidateData.experience,
      location: input.candidateData.location,
      education: input.candidateData.education,
      skills: input.candidateData.skills.join(', '),
      expected_salary: input.candidateData.expectedSalary || 0
    };
  }

  /**
   * Format input data for decision tree model
   */
  private formatInputForDecisionTree(input: MLModelInput): any {
    return {
      candidateId: input.candidateId,
      jobId: input.jobId,
      job_description: input.jobData.description,
      resume: input.candidateData.resume,
      job_roles: input.jobData.title,
      ethnicity: 'Not Specified', // Privacy-compliant default
      experience: input.candidateData.experience,
      location: input.candidateData.location,
      education_level: input.candidateData.education,
      skills_match: this.calculateSkillsMatch(input.candidateData.skills, input.jobData.skills)
    };
  }

  /**
   * Calculate skills match percentage
   */
  private calculateSkillsMatch(candidateSkills: string[], jobSkills: string[]): number {
    if (!candidateSkills.length || !jobSkills.length) return 0;
    
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    
    const matches = jobSkillsLower.filter(skill => 
      candidateSkillsLower.some(candidateSkill => 
        candidateSkill.includes(skill) || skill.includes(candidateSkill)
      )
    );
    
    return (matches.length / jobSkillsLower.length) * 100;
  }

  /**
   * Ensure models directory exists
   */
  private async ensureModelsDirectory(): Promise<void> {
    try {
      await fs.access(this.modelsPath);
    } catch {
      await fs.mkdir(this.modelsPath, { recursive: true });
    }
  }

  /**
   * Validate that model files exist locally
   */
  private async validateModelFiles(): Promise<void> {
    const requiredFiles = [
      this.logisticModelFile,
      this.decisionTreeModelFile
    ];

    for (const filePath of requiredFiles) {
      try {
        await fs.access(filePath);
        logger.info(`Model file found: ${path.basename(filePath)}`);
      } catch {
        throw new Error(`Model file not found: ${filePath}. Please run setup-ml-models.sh first.`);
      }
    }
  }

  /**
   * Validate Python environment
   */
  private async validatePythonEnvironment(): Promise<void> {
    try {
      // Check if Python is available
      await this.executeCommand(`${this.pythonPath} --version`);

      // Check required packages
      const requiredPackages = ['joblib', 'scikit-learn', 'pandas', 'numpy'];
      for (const pkg of requiredPackages) {
        try {
          await this.executeCommand(`${this.pythonPath} -c "import ${pkg}"`);
          logger.info(`Python package available: ${pkg}`);
        } catch {
          throw new Error(`Required Python package not found: ${pkg}. Please run setup-ml-models.sh first.`);
        }
      }
    } catch (error) {
      logger.error('Python environment validation failed:', error);
      throw error;
    }
  }

  /**
   * Validate that models are working
   */
  private async validateModels(): Promise<void> {
    // Test with dummy data
    const testInput: MLModelInput = {
      candidateId: 'test',
      jobId: 'test',
      candidateData: {
        resume: 'Software engineer with 5 years experience in Python and JavaScript',
        experience: 5,
        skills: ['Python', 'JavaScript', 'React'],
        location: 'San Francisco, CA',
        education: 'Bachelor of Science in Computer Science'
      },
      jobData: {
        title: 'Senior Software Engineer',
        description: 'Looking for experienced software engineer with Python and React skills',
        requirements: 'Bachelor degree, 3+ years experience',
        location: 'San Francisco, CA',
        experienceLevel: 'Senior',
        skills: ['Python', 'React', 'Node.js']
      }
    };

    try {
      // Test both models with timeout
      const timeout = 30000; // 30 seconds
      await Promise.race([
        Promise.all([
          this.predictLogisticRegression(testInput),
          this.predictDecisionTree(testInput)
        ]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Model validation timeout')), timeout)
        )
      ]);
      
      logger.info('ML models validation successful');
    } catch (error) {
      logger.error('ML models validation failed:', error);
      throw error;
    }
  }

  /**
   * Generate Python script for model prediction
   */
  private generatePythonScript(modelType: 'logistic_regression' | 'decision_tree'): string {
    const modelFile = modelType === 'logistic_regression'
      ? this.logisticModelFile
      : this.decisionTreeModelFile;

    return `
import json
import sys
import pandas as pd
import joblib
import numpy as np
from pathlib import Path

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        # Load the model
        model_path = "${modelFile.replace(/\\/g, '/')}"
        pipeline = joblib.load(model_path)

        # Prepare data for prediction
        df_data = {
            'Job Description': input_data.get('job_description', ''),
            'Resume': input_data.get('resume', ''),
            'Job Roles': input_data.get('job_role', ''),
            'Ethnicity': input_data.get('ethnicity', 'Not Specified'),
        }

        df = pd.DataFrame([df_data])

        # Make prediction
        probabilities = pipeline.predict_proba(df)
        best_match_prob = float(probabilities[0][1])  # Probability of "Best Match"

        # Apply optimized threshold from your research
        optimized_threshold = 0.5027
        prediction = 1 if best_match_prob >= optimized_threshold else 0

        # Calculate confidence
        confidence = min(best_match_prob * 1.5, 1.0)

        # Extract features
        features = {
            'job_description_length': len(df_data['Job Description'].split()),
            'resume_length': len(df_data['Resume'].split()),
            'model_type': '${modelType}',
            'threshold_used': optimized_threshold
        }

        # Generate reasoning
        reasoning = []
        if best_match_prob >= 0.7:
            reasoning.append("Strong match: High probability of being a best match candidate")
        elif best_match_prob >= 0.5:
            reasoning.append("Good match: Above-average probability of being suitable")
        else:
            reasoning.append("Weak match: Below-average probability of being suitable")

        # Add model-specific reasoning
        if '${modelType}' == 'logistic_regression':
            reasoning.append("Prediction based on optimized TF-IDF logistic regression model")
        else:
            reasoning.append("Prediction based on XGBoost decision tree ensemble model")

        # Output result
        result = {
            'probability': best_match_prob,
            'prediction': prediction,
            'confidence': confidence,
            'features': features,
            'reasoning': reasoning,
            'model_type': '${modelType}',
            'success': True
        }

        print(json.dumps(result))

    except Exception as e:
        error_result = {
            'error': str(e),
            'success': False,
            'model_type': '${modelType}'
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
`;
  }

  /**
   * Execute shell command
   */
  private async executeCommand(command: string, cwd?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], { cwd });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => stdout += data);
      child.stderr.on('data', (data) => stderr += data);

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed: ${stderr}`));
        }
      });
    });
  }
}

export const mlModelService = new MLModelService();

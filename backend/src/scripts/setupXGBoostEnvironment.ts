#!/usr/bin/env tsx

/**
 * XGBoost Environment Setup Script
 * Sets up local Python virtual environment and validates XGBoost model integration
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SetupConfig {
  projectRoot: string;
  mlModelsPath: string;
  venvPath: string;
  decisionTreePath: string;
  modelFile: string;
  requirementsFile: string;
  pythonWrapperPath: string;
}

class XGBoostEnvironmentSetup {
  private config: SetupConfig;

  constructor() {
    this.config = {
      projectRoot: path.resolve(__dirname, '../../..'),
      mlModelsPath: path.resolve(__dirname, '../../../ml-models'),
      venvPath: path.resolve(__dirname, '../../../ml-models/shared/venv'),
      decisionTreePath: path.resolve(__dirname, '../../../ml-models/decision-tree'),
      modelFile: path.resolve(__dirname, '../../../ml-models/decision-tree/best_performing_model_pipeline.joblib'),
      requirementsFile: path.resolve(__dirname, '../../../ml-models/decision-tree/requirements.txt'),
      pythonWrapperPath: path.resolve(__dirname, '../../../ml-models/integration')
    };
  }

  async setup(): Promise<void> {
    console.log('🚀 Starting XGBoost Environment Setup...\n');

    try {
      await this.validatePrerequisites();
      await this.createDirectoryStructure();
      await this.setupPythonVirtualEnvironment();
      await this.installPythonDependencies();
      await this.validateModelFile();
      await this.createPythonWrapper();
      await this.testModelIntegration();
      await this.createLocalConfigFiles();

      console.log('\n✅ XGBoost Environment Setup Complete!');
      console.log('\n📋 Next Steps:');
      console.log('1. Run: yarn xgboost:migrate (to setup database)');
      console.log('2. Run: yarn xgboost:init (to initialize model)');
      console.log('3. Run: yarn dev (to start backend with XGBoost support)');

    } catch (error) {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    }
  }

  private async validatePrerequisites(): Promise<void> {
    console.log('🔍 Validating prerequisites...');

    // Check Python installation
    try {
      const pythonVersion = execSync('python --version', { encoding: 'utf8' });
      console.log(`✅ Python found: ${pythonVersion.trim()}`);
    } catch (error) {
      try {
        const python3Version = execSync('python3 --version', { encoding: 'utf8' });
        console.log(`✅ Python3 found: ${python3Version.trim()}`);
      } catch (error) {
        throw new Error('Python not found. Please install Python 3.8+ first.');
      }
    }

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required. Current version: ${nodeVersion}`);
    }
    console.log(`✅ Node.js version: ${nodeVersion}`);

    // Check yarn availability
    try {
      const yarnVersion = execSync('yarn --version', { encoding: 'utf8' });
      console.log(`✅ Yarn found: ${yarnVersion.trim()}`);
    } catch (error) {
      console.log('⚠️  Yarn not found. Installing via npm...');
      execSync('npm install -g yarn', { stdio: 'inherit' });
    }
  }

  private async createDirectoryStructure(): Promise<void> {
    console.log('📁 Creating directory structure...');

    const directories = [
      this.config.mlModelsPath,
      path.join(this.config.mlModelsPath, 'shared'),
      this.config.decisionTreePath,
      this.config.pythonWrapperPath,
      path.join(this.config.mlModelsPath, 'shared', 'logs'),
      path.join(this.config.mlModelsPath, 'shared', 'cache')
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ Created: ${path.relative(this.config.projectRoot, dir)}`);
      } catch (error) {
        if ((error as any).code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }

  private async setupPythonVirtualEnvironment(): Promise<void> {
    console.log('🐍 Setting up Python virtual environment...');

    // Check if venv already exists
    try {
      await fs.access(this.config.venvPath);
      console.log('✅ Virtual environment already exists');
      return;
    } catch (error) {
      // Create new virtual environment
    }

    return new Promise((resolve, reject) => {
      const pythonCmd = this.getPythonCommand();
      const venvProcess = spawn(pythonCmd, ['-m', 'venv', this.config.venvPath], {
        stdio: 'inherit'
      });

      venvProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Virtual environment created successfully');
          resolve();
        } else {
          reject(new Error(`Virtual environment creation failed with code ${code}`));
        }
      });

      venvProcess.on('error', (error) => {
        reject(new Error(`Failed to create virtual environment: ${error.message}`));
      });
    });
  }

  private async installPythonDependencies(): Promise<void> {
    console.log('📦 Installing Python dependencies...');

    // Ensure requirements.txt exists
    await this.createRequirementsFile();

    const pipPath = this.getPipPath();
    const requirementsPath = this.config.requirementsFile;

    return new Promise((resolve, reject) => {
      const installProcess = spawn(pipPath, ['install', '-r', requirementsPath], {
        stdio: 'inherit'
      });

      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Python dependencies installed successfully');
          resolve();
        } else {
          reject(new Error(`Dependency installation failed with code ${code}`));
        }
      });

      installProcess.on('error', (error) => {
        reject(new Error(`Failed to install dependencies: ${error.message}`));
      });
    });
  }

  private async createRequirementsFile(): Promise<void> {
    const requirementsContent = `# TalentSol XGBoost Model Requirements
# Local development environment with strict version constraints

# ⚠️ CRITICAL VERSION CONSTRAINTS ⚠️
# These versions must match your trained model exactly
scikit-learn==1.6.1    # EXACT VERSION REQUIRED
joblib==1.3.2          # Compatible with scikit-learn 1.6.1
pandas>=2.0.0          # Data manipulation
numpy>=1.24.0          # Numerical computing

# Optional ML libraries
xgboost>=1.7.0         # XGBoost ensemble methods
scipy>=1.10.0          # Scientific computing
matplotlib>=3.7.0      # Visualization (optional)
seaborn>=0.12.0        # Statistical visualization (optional)

# Development and testing
pytest>=7.0.0          # Testing framework
pytest-cov>=4.0.0      # Coverage reporting

# Local development utilities
ipython>=8.0.0         # Interactive Python shell
jupyter>=1.0.0         # Jupyter notebooks (optional)
`;

    try {
      await fs.writeFile(this.config.requirementsFile, requirementsContent);
      console.log('✅ Requirements file created');
    } catch (error) {
      console.log('ℹ️  Requirements file already exists');
    }
  }

  private async validateModelFile(): Promise<void> {
    console.log('🔍 Validating XGBoost model file...');

    try {
      await fs.access(this.config.modelFile);
      const stats = await fs.stat(this.config.modelFile);
      console.log(`✅ Model file found: ${path.relative(this.config.projectRoot, this.config.modelFile)}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.log('⚠️  Model file not found. Please place your trained model at:');
      console.log(`   ${this.config.modelFile}`);
      console.log('   You can download it from your training environment or GitHub repository.');
      
      // Create placeholder file with instructions
      const placeholderContent = `# XGBoost Model Placeholder
# 
# Please replace this file with your trained model:
# best_performing_model_pipeline.joblib
#
# The model should be trained with:
# - scikit-learn==1.6.1
# - joblib==1.3.2
# - XGBoost ensemble with HashingVectorizer
# - Optimized threshold: 0.5027
# - Target recall: 70%, precision: 57%
`;
      await fs.writeFile(this.config.modelFile + '.placeholder', placeholderContent);
    }
  }

  private async createPythonWrapper(): Promise<void> {
    console.log('🔧 Creating Python wrapper script...');

    const wrapperContent = `#!/usr/bin/env python3
"""
XGBoost Model Prediction Wrapper for TalentSol (Local Development)
Loads your trained best_performing_model_pipeline.joblib and makes predictions
"""
import sys
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
import os

# Local development paths
SCRIPT_DIR = Path(__file__).parent
MODEL_PATH = SCRIPT_DIR.parent / "decision-tree" / "best_performing_model_pipeline.joblib"

def load_model():
    """Load the trained XGBoost pipeline"""
    try:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
        
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
            'model_type': 'xgboost_decision_tree_ensemble',
            'model_path': str(MODEL_PATH),
            'environment': 'local_development'
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
        error_result = {
            'error': str(e),
            'model_path': str(MODEL_PATH),
            'environment': 'local_development'
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

    const wrapperPath = path.join(this.config.pythonWrapperPath, 'xgboost_predict_wrapper.py');
    await fs.writeFile(wrapperPath, wrapperContent);
    
    // Make executable
    try {
      await fs.chmod(wrapperPath, 0o755);
    } catch (error) {
      console.log('⚠️  Could not make wrapper executable (Windows?)');
    }
    
    console.log(`✅ Python wrapper created: ${path.relative(this.config.projectRoot, wrapperPath)}`);
  }

  private async testModelIntegration(): Promise<void> {
    console.log('🧪 Testing model integration...');

    const testInput = {
      'Job Description': 'Software Engineer position requiring Python and machine learning experience',
      'Resume': 'Experienced software developer with 5 years in Python, machine learning, and data science',
      'Job Roles': 'Software Engineer',
      'Ethnicity': 'Not Specified'
    };

    try {
      const pythonPath = this.getPythonPath();
      const wrapperPath = path.join(this.config.pythonWrapperPath, 'xgboost_predict_wrapper.py');
      
      const result = await this.runPythonScript(pythonPath, wrapperPath, testInput);
      
      if (result.error) {
        console.log('⚠️  Model test failed (expected if model file not present):', result.error);
      } else {
        console.log('✅ Model integration test successful');
        console.log(`   Test prediction probability: ${result.probability?.toFixed(4)}`);
      }
    } catch (error) {
      console.log('⚠️  Model test failed (expected if model file not present):', (error as Error).message);
    }
  }

  private async createLocalConfigFiles(): Promise<void> {
    console.log('⚙️  Creating local configuration files...');

    // Create .env.local for development
    const envLocalContent = `# Local XGBoost Development Configuration
XGBOOST_MODEL_PATH=${this.config.modelFile}
XGBOOST_PYTHON_WRAPPER=${path.join(this.config.pythonWrapperPath, 'xgboost_predict_wrapper.py')}
XGBOOST_PYTHON_PATH=${this.getPythonPath()}
XGBOOST_VENV_PATH=${this.config.venvPath}
XGBOOST_LOCAL_DEVELOPMENT=true

# Python environment
PYTHON_PATH=${this.getPythonPath()}
VIRTUAL_ENV=${this.config.venvPath}
`;

    const envLocalPath = path.join(this.config.projectRoot, '.env.local');
    await fs.writeFile(envLocalPath, envLocalContent);
    console.log(`✅ Local environment config: ${path.relative(this.config.projectRoot, envLocalPath)}`);

    // Create yarn.lock equivalent for pnpm if needed
    const yarnLockPath = path.join(this.config.projectRoot, 'yarn.lock');
    try {
      await fs.access(yarnLockPath);
    } catch (error) {
      console.log('ℹ️  Run "yarn install" to generate yarn.lock');
    }
  }

  private getPythonCommand(): string {
    try {
      execSync('python --version', { encoding: 'utf8' });
      return 'python';
    } catch (error) {
      return 'python3';
    }
  }

  private getPythonPath(): string {
    const venvPython = process.platform === 'win32' 
      ? path.join(this.config.venvPath, 'Scripts', 'python.exe')
      : path.join(this.config.venvPath, 'bin', 'python');
    
    return venvPython;
  }

  private getPipPath(): string {
    const venvPip = process.platform === 'win32'
      ? path.join(this.config.venvPath, 'Scripts', 'pip.exe')
      : path.join(this.config.venvPath, 'bin', 'pip');
    
    return venvPip;
  }

  private async runPythonScript(pythonPath: string, scriptPath: string, input: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonPath, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
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
          try {
            const errorResult = JSON.parse(stderr);
            resolve(errorResult);
          } catch (e) {
            reject(new Error(`Python process failed: ${stderr}`));
          }
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });

      pythonProcess.stdin.write(JSON.stringify(input));
      pythonProcess.stdin.end();
    });
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new XGBoostEnvironmentSetup();
  setup.setup().catch(console.error);
}

export { XGBoostEnvironmentSetup };

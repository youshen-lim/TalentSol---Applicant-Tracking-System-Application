@echo off
REM TalentSol XGBoost Local Development Setup Script (Windows)
REM This script sets up the complete local development environment

echo 🚀 TalentSol XGBoost Local Development Setup (Windows)
echo =====================================================

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Please run this script from the backend directory
    exit /b 1
)

REM Step 1: Check prerequisites
echo ℹ️  Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)
echo ✅ Node.js version: 
node --version

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python is not installed. Please install Python 3.8+ first.
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
    )
) else (
    set PYTHON_CMD=python
)
echo ✅ Python version:
%PYTHON_CMD% --version

REM Check/Install Yarn
yarn --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Yarn not found. Installing via npm...
    npm install -g yarn
    echo ✅ Yarn installed
) else (
    echo ✅ Yarn version:
    yarn --version
)

REM Step 2: Install Node.js dependencies with Yarn
echo ℹ️  Installing Node.js dependencies with Yarn...
yarn install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    exit /b 1
)
echo ✅ Node.js dependencies installed

REM Step 3: Setup Python virtual environment
echo ℹ️  Setting up Python virtual environment...

REM Create ml-models directory structure
if not exist "ml-models\shared" mkdir ml-models\shared
if not exist "ml-models\decision-tree" mkdir ml-models\decision-tree
if not exist "ml-models\integration" mkdir ml-models\integration
if not exist "ml-models\shared\logs" mkdir ml-models\shared\logs
if not exist "ml-models\shared\cache" mkdir ml-models\shared\cache

REM Create virtual environment if it doesn't exist
if not exist "ml-models\shared\venv" (
    echo ℹ️  Creating Python virtual environment...
    %PYTHON_CMD% -m venv ml-models\shared\venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        exit /b 1
    )
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

REM Create requirements.txt if it doesn't exist
if not exist "ml-models\decision-tree\requirements.txt" (
    echo ℹ️  Creating requirements.txt...
    (
        echo # TalentSol XGBoost Model Requirements
        echo # Local development environment with strict version constraints
        echo.
        echo # ⚠️ CRITICAL VERSION CONSTRAINTS ⚠️
        echo # These versions must match your trained model exactly
        echo scikit-learn==1.6.1    # EXACT VERSION REQUIRED
        echo joblib==1.3.2          # Compatible with scikit-learn 1.6.1
        echo pandas^>=2.0.0          # Data manipulation
        echo numpy^>=1.24.0          # Numerical computing
        echo.
        echo # Optional ML libraries
        echo xgboost^>=1.7.0         # XGBoost ensemble methods
        echo scipy^>=1.10.0          # Scientific computing
        echo.
        echo # Development and testing
        echo pytest^>=7.0.0          # Testing framework
    ) > ml-models\decision-tree\requirements.txt
    echo ✅ Requirements.txt created
)

REM Activate virtual environment and install dependencies
echo ℹ️  Installing Python dependencies...
call ml-models\shared\venv\Scripts\activate.bat
pip install -r ml-models\decision-tree\requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    exit /b 1
)
echo ✅ Python dependencies installed

REM Step 4: Setup environment variables
echo ℹ️  Setting up environment variables...

if not exist ".env.local" (
    if exist ".env.local.example" (
        copy .env.local.example .env.local >nul
        echo ✅ Environment file created from example
        echo ⚠️  Please update .env.local with your database credentials
    ) else (
        echo ⚠️  .env.local.example not found. Please create .env.local manually
    )
) else (
    echo ✅ Environment file already exists
)

REM Step 5: Run XGBoost setup
echo ℹ️  Running XGBoost environment setup...
yarn xgboost:setup
if errorlevel 1 (
    echo ⚠️  XGBoost setup encountered issues, but continuing...
)
echo ✅ XGBoost environment setup completed

REM Step 6: Test XGBoost model (if model file exists)
echo ℹ️  Testing XGBoost model integration...
if exist "ml-models\decision-tree\best_performing_model_pipeline.joblib" (
    yarn xgboost:test-model >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  XGBoost model test failed. This is expected if the model file is not present.
    ) else (
        echo ✅ XGBoost model test passed
    )
) else (
    echo ⚠️  XGBoost model file not found. Please place your trained model at:
    echo    ml-models\decision-tree\best_performing_model_pipeline.joblib
)

REM Step 7: Display summary
echo.
echo 🎉 Local Development Setup Complete!
echo ====================================
echo.
echo 📋 Next Steps:
echo 1. Update .env.local with your database credentials
echo 2. Place your XGBoost model file at: ml-models\decision-tree\best_performing_model_pipeline.joblib
echo 3. Run database migration: yarn xgboost:migrate
echo 4. Start the development server: yarn dev
echo 5. Test XGBoost integration: yarn xgboost:test-model
echo.
echo 🔗 Available Commands:
echo    yarn dev                    - Start development server
echo    yarn xgboost:setup         - Setup XGBoost environment
echo    yarn xgboost:test-model    - Test XGBoost model
echo    yarn xgboost:init          - Initialize XGBoost service
echo    yarn xgboost:migrate       - Run database migration
echo    yarn xgboost:process-pending - Process pending applications
echo.
echo 📁 Project Structure:
echo    backend\
echo    ├── ml-models\
echo    │   ├── decision-tree\          # Your XGBoost model
echo    │   ├── integration\            # Python wrappers
echo    │   └── shared\venv\           # Python virtual environment
echo    ├── src\services\              # XGBoost services
echo    └── src\scripts\               # Setup and test scripts
echo.
echo 🌐 Endpoints (when server is running):
echo    http://localhost:3001/api/xgboost/status
echo    http://localhost:3001/api/xgboost/metrics
echo    WebSocket: ws://localhost:9001
echo.

REM Check if model file exists and provide specific guidance
if not exist "ml-models\decision-tree\best_performing_model_pipeline.joblib" (
    echo ⚠️  IMPORTANT: XGBoost Model File Missing
    echo    Please download your trained model from:
    echo    https://github.com/youshen-lim/TalentSol_Supervised-Classifier-for-Initial-Candidate-Screening-Decision-Trees
    echo    And place it at: ml-models\decision-tree\best_performing_model_pipeline.joblib
    echo.
)

echo ✅ Setup script completed successfully!

REM Deactivate virtual environment
call deactivate >nul 2>&1

pause

@echo off
echo 🚀 TalentSol ATS - Synthetic Data Generator
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo 💡 Please install Python 3.7+ and try again
    pause
    exit /b 1
)

echo ✅ Python found

REM Install required dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Run the synthetic data generator
echo 🎯 Running synthetic data generator...
python generate_synthetic_data.py

if %errorlevel% neq 0 (
    echo ❌ Synthetic data generation failed
    pause
    exit /b 1
)

echo ✅ Synthetic data generation completed
echo 💡 You can now check the Dashboard for updated metrics
pause

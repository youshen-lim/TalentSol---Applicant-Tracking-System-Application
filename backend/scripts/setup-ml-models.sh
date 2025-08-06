#!/bin/bash

# TalentSol ML Models Setup Script
# Downloads and sets up ML models for local inference

set -e

echo "🚀 Setting up TalentSol ML Models..."

# Create models directory structure
ML_DIR="backend/ml-models"
mkdir -p "$ML_DIR/logistic-regression"
mkdir -p "$ML_DIR/decision-tree"
mkdir -p "$ML_DIR/shared"

# Download Logistic Regression Model
echo "📥 Downloading Logistic Regression model..."
cd "$ML_DIR/logistic-regression"

# Download specific files instead of full repo
curl -L -o "optimized_tfidf_logistic_regression_pipeline.joblib" \
  "https://github.com/youshen-lim/TalentSol-ATS-Supervised-Classifier-for-Initial-Candidate-Screening-and-Prioritization-Regression/raw/main/optimized_tfidf_logistic_regression_pipeline.joblib"

curl -L -o "requirements.txt" \
  "https://github.com/youshen-lim/TalentSol-ATS-Supervised-Classifier-for-Initial-Candidate-Screening-and-Prioritization-Regression/raw/main/requirements.txt"

curl -L -o "upsampled_training_data_July 21.csv" \
  "https://github.com/youshen-lim/TalentSol-ATS-Supervised-Classifier-for-Initial-Candidate-Screening-and-Prioritization-Regression/raw/main/upsampled_training_data_July%2021.csv"

# Download Decision Tree Model
echo "📥 Downloading Decision Tree model..."
cd "../decision-tree"

curl -L -o "best_performing_model_pipeline.joblib" \
  "https://github.com/youshen-lim/TalentSol_Supervised-Classifier-for-Initial-Candidate-Screening-Decision-Trees/raw/main/best_performing_model_pipeline.joblib"

curl -L -o "requirements.txt" \
  "https://github.com/youshen-lim/TalentSol_Supervised-Classifier-for-Initial-Candidate-Screening-Decision-Trees/raw/main/requirements.txt"

# Create Python virtual environment
echo "🐍 Setting up Python environment..."
cd "../shared"

python3 -m venv ml-env
source ml-env/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install joblib scikit-learn pandas numpy xgboost lightgbm

# Install additional requirements from model repos
pip install -r ../logistic-regression/requirements.txt
pip install -r ../decision-tree/requirements.txt

echo "✅ ML Models setup complete!"
echo ""
echo "📁 Model files location:"
echo "  - Logistic Regression: $ML_DIR/logistic-regression/"
echo "  - Decision Tree: $ML_DIR/decision-tree/"
echo "  - Python Environment: $ML_DIR/shared/ml-env/"
echo ""
echo "🔧 To activate Python environment:"
echo "  source $ML_DIR/shared/ml-env/bin/activate"

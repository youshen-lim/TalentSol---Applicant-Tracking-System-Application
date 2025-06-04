#!/bin/bash

echo "🚀 TalentSol ATS - Synthetic Data Generator"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    echo "💡 Please install Python 3.7+ and try again"
    exit 1
fi

echo "✅ Python found"

# Install required dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Run the synthetic data generator
echo "🎯 Running synthetic data generator..."
python3 generate_synthetic_data.py

if [ $? -ne 0 ]; then
    echo "❌ Synthetic data generation failed"
    exit 1
fi

echo "✅ Synthetic data generation completed"
echo "💡 You can now check the Dashboard for updated metrics"

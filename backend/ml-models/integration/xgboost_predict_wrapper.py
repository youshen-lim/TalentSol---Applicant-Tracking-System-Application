#!/usr/bin/env python3
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

# Model path — resolved relative to this script's location
MODEL_PATH = Path(__file__).parent.parent / "decision-tree" / "best_performing_model_pipeline.joblib"

def load_model():
    """Load the trained XGBoost pipeline"""
    try:
        pipeline = joblib.load(str(MODEL_PATH))
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

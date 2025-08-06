#!/usr/bin/env python3
"""
TalentSol ML Model Integration Wrapper
Standardizes input/output for both Logistic Regression and Decision Tree models
"""

import json
import sys
import os
import traceback
from typing import Dict, Any, List
import pandas as pd
import numpy as np

class MLModelWrapper:
    """Base wrapper class for ML models"""
    
    def __init__(self, model_type: str):
        self.model_type = model_type
        self.model = None
        self.pipeline = None
        
    def load_model(self, model_path: str):
        """Load the trained model"""
        raise NotImplementedError
        
    def preprocess_input(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """Preprocess input data for model"""
        raise NotImplementedError
        
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction and return standardized output"""
        raise NotImplementedError

class LogisticRegressionWrapper(MLModelWrapper):
    """Wrapper for Logistic Regression model"""
    
    def __init__(self):
        super().__init__("logistic_regression")
        
    def load_model(self, model_path: str = None):
        """Load the optimized TF-IDF logistic regression pipeline"""
        import joblib
        
        if model_path is None:
            # Default path from your repository
            model_path = "optimized_tfidf_logistic_regression_pipeline.joblib"
            
        try:
            self.pipeline = joblib.load(model_path)
            return True
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            return False
            
    def preprocess_input(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """Convert input to format expected by logistic regression model"""
        
        # Create DataFrame with expected columns
        df_data = {
            'Job Description': input_data.get('job_description', ''),
            'Resume': input_data.get('resume', ''),
            'Job Roles': input_data.get('job_role', ''),
            'Ethnicity': input_data.get('ethnicity', 'Not Specified'),
            # Add other features as needed based on your model training
        }
        
        return pd.DataFrame([df_data])
        
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction using logistic regression model"""
        
        if self.pipeline is None:
            raise ValueError("Model not loaded")
            
        try:
            # Preprocess input
            df = self.preprocess_input(input_data)
            
            # Get prediction probability
            probabilities = self.pipeline.predict_proba(df)
            best_match_prob = probabilities[0][1]  # Probability of "Best Match"
            
            # Apply optimized threshold (from your model evaluation)
            optimized_threshold = 0.5027  # From your research
            prediction = 1 if best_match_prob >= optimized_threshold else 0
            
            # Extract feature importance (if available)
            features = self.extract_features(df)
            
            # Generate reasoning
            reasoning = self.generate_reasoning(best_match_prob, features)
            
            return {
                'probability': float(best_match_prob),
                'prediction': int(prediction),
                'confidence': float(min(best_match_prob * 2, 1.0)),  # Simple confidence metric
                'features': features,
                'reasoning': reasoning,
                'model_type': 'optimized_tfidf_logistic_regression',
                'threshold_used': optimized_threshold
            }
            
        except Exception as e:
            print(f"Prediction error: {e}", file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            raise
            
    def extract_features(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Extract key features used in prediction"""
        
        features = {}
        
        # Text-based features
        job_desc = df['Job Description'].iloc[0]
        resume = df['Resume'].iloc[0]
        
        features['job_description_length'] = len(job_desc.split())
        features['resume_length'] = len(resume.split())
        
        # Simple keyword matching
        job_keywords = set(job_desc.lower().split())
        resume_keywords = set(resume.lower().split())
        keyword_overlap = len(job_keywords.intersection(resume_keywords))
        
        features['keyword_overlap'] = keyword_overlap
        features['keyword_overlap_ratio'] = keyword_overlap / max(len(job_keywords), 1)
        
        return features
        
    def generate_reasoning(self, probability: float, features: Dict[str, Any]) -> List[str]:
        """Generate human-readable reasoning for the prediction"""
        
        reasoning = []
        
        if probability >= 0.7:
            reasoning.append("Strong match: High probability of being a best match candidate")
        elif probability >= 0.5:
            reasoning.append("Good match: Above-average probability of being a suitable candidate")
        else:
            reasoning.append("Weak match: Below-average probability of being a suitable candidate")
            
        # Feature-based reasoning
        if features.get('keyword_overlap_ratio', 0) > 0.3:
            reasoning.append(f"Good keyword overlap ({features['keyword_overlap']} matching terms)")
        elif features.get('keyword_overlap_ratio', 0) > 0.1:
            reasoning.append(f"Moderate keyword overlap ({features['keyword_overlap']} matching terms)")
        else:
            reasoning.append("Limited keyword overlap between resume and job description")
            
        return reasoning

class DecisionTreeWrapper(MLModelWrapper):
    """Wrapper for Decision Tree model"""
    
    def __init__(self):
        super().__init__("decision_tree")
        
    def load_model(self, model_path: str = None):
        """Load the XGBoost decision tree pipeline"""
        import joblib
        
        if model_path is None:
            # Default path from your repository
            model_path = "best_performing_model_pipeline.joblib"
            
        try:
            self.pipeline = joblib.load(model_path)
            return True
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            return False
            
    def preprocess_input(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """Convert input to format expected by decision tree model"""
        
        # Create DataFrame with expected columns
        df_data = {
            'Job Description': input_data.get('job_description', ''),
            'Resume': input_data.get('resume', ''),
            'Job Roles': input_data.get('job_roles', ''),
            'Ethnicity': input_data.get('ethnicity', 'Not Specified'),
            # Add other features based on your decision tree model training
        }
        
        return pd.DataFrame([df_data])
        
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction using decision tree model"""
        
        if self.pipeline is None:
            raise ValueError("Model not loaded")
            
        try:
            # Preprocess input
            df = self.preprocess_input(input_data)
            
            # Get prediction probability
            probabilities = self.pipeline.predict_proba(df)
            best_match_prob = probabilities[0][1]  # Probability of "Best Match"
            
            # Apply optimized threshold (from your model evaluation)
            optimized_threshold = 0.5027  # Adjust based on your XGBoost results
            prediction = 1 if best_match_prob >= optimized_threshold else 0
            
            # Extract feature importance
            features = self.extract_features(df, input_data)
            
            # Generate reasoning
            reasoning = self.generate_reasoning(best_match_prob, features)
            
            return {
                'probability': float(best_match_prob),
                'prediction': int(prediction),
                'confidence': float(min(best_match_prob * 1.8, 1.0)),  # Adjusted for tree models
                'features': features,
                'reasoning': reasoning,
                'model_type': 'xgboost_decision_tree_ensemble',
                'threshold_used': optimized_threshold
            }
            
        except Exception as e:
            print(f"Prediction error: {e}", file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            raise
            
    def extract_features(self, df: pd.DataFrame, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract key features used in prediction"""
        
        features = {}
        
        # Skills matching
        skills_match = input_data.get('skills_match', 0)
        features['skills_match_percentage'] = skills_match
        
        # Experience
        experience = input_data.get('experience', 0)
        features['experience_years'] = experience
        
        # Location matching
        features['location'] = input_data.get('location', 'Unknown')
        
        # Text features
        job_desc = df['Job Description'].iloc[0]
        resume = df['Resume'].iloc[0]
        
        features['job_description_length'] = len(job_desc.split())
        features['resume_length'] = len(resume.split())
        
        return features
        
    def generate_reasoning(self, probability: float, features: Dict[str, Any]) -> List[str]:
        """Generate human-readable reasoning for the prediction"""
        
        reasoning = []
        
        if probability >= 0.7:
            reasoning.append("Strong candidate: High probability based on ensemble decision trees")
        elif probability >= 0.5:
            reasoning.append("Good candidate: Above-average probability from decision tree analysis")
        else:
            reasoning.append("Weak candidate: Below-average probability from decision tree analysis")
            
        # Feature-based reasoning
        skills_match = features.get('skills_match_percentage', 0)
        if skills_match > 70:
            reasoning.append(f"Excellent skills match ({skills_match:.1f}%)")
        elif skills_match > 40:
            reasoning.append(f"Good skills match ({skills_match:.1f}%)")
        else:
            reasoning.append(f"Limited skills match ({skills_match:.1f}%)")
            
        experience = features.get('experience_years', 0)
        if experience >= 5:
            reasoning.append(f"Experienced candidate ({experience} years)")
        elif experience >= 2:
            reasoning.append(f"Mid-level experience ({experience} years)")
        else:
            reasoning.append(f"Entry-level candidate ({experience} years)")
            
        return reasoning

def main():
    """Main function to handle prediction requests"""
    
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Determine model type
        model_type = input_data.get('model_type', 'logistic_regression')
        
        # Initialize appropriate wrapper
        if model_type == 'logistic_regression':
            wrapper = LogisticRegressionWrapper()
        elif model_type == 'decision_tree':
            wrapper = DecisionTreeWrapper()
        else:
            raise ValueError(f"Unknown model type: {model_type}")
            
        # Load model
        model_loaded = wrapper.load_model()
        if not model_loaded:
            raise ValueError("Failed to load model")
            
        # Make prediction
        result = wrapper.predict(input_data)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'traceback': traceback.format_exc(),
            'success': False
        }
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

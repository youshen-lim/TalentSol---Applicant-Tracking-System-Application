#!/usr/bin/env python3
"""
TalentSol ML Prediction Service
Integrates Kaggle datasets for candidate prioritization
"""

import sys
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any
import warnings
warnings.filterwarnings('ignore')

class CandidatePrioritizationModel:
    """
    ML Model for candidate prioritization using Kaggle dataset features
    """
    
    def __init__(self, model_path: str = None):
        self.model = None
        self.feature_names = []
        self.scaler = None
        
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
    
    def load_model(self, model_path: str):
        """Load trained model from pickle file"""
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                self.model = model_data['model']
                self.feature_names = model_data['feature_names']
                self.scaler = model_data.get('scaler')
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            self.model = None
    
    def extract_features(self, candidate_data: Dict[str, Any]) -> np.ndarray:
        """
        Extract features from candidate data for ML prediction
        Maps TalentSol data to Kaggle dataset format
        """
        features = []
        
        # Experience features (from Kaggle resume datasets)
        features.append(candidate_data.get('yearsOfExperience', 0))
        
        # Education level encoding
        education_mapping = {
            'high_school': 1,
            'bachelor': 2,
            'master': 3,
            'phd': 4
        }
        features.append(education_mapping.get(candidate_data.get('educationLevel', 'bachelor'), 2))
        
        # Skills features
        features.append(len(candidate_data.get('technicalSkills', [])))
        features.append(len(candidate_data.get('softSkills', [])))
        features.append(candidate_data.get('skillsMatchScore', 0))
        
        # Experience relevance
        features.append(candidate_data.get('roleRelevance', 0))
        
        # Application quality indicators
        features.append(candidate_data.get('resumeQualityScore', 0))
        features.append(1 if candidate_data.get('coverLetterPresent', False) else 0)
        features.append(1 if candidate_data.get('portfolioPresent', False) else 0)
        
        # Behavioral features
        features.append(candidate_data.get('applicationCompleteness', 0))
        features.append(min(candidate_data.get('responseTime', 24), 168))  # Cap at 1 week
        
        # Location and practical factors
        features.append(candidate_data.get('locationMatch', 0))
        features.append(candidate_data.get('salaryExpectationMatch', 0))
        features.append(candidate_data.get('availabilityMatch', 0))
        
        return np.array(features).reshape(1, -1)
    
    def predict(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make prediction for candidate prioritization
        """
        try:
            features = self.extract_features(candidate_data)
            
            if self.model is None:
                # Fallback to rule-based prediction
                return self.rule_based_prediction(candidate_data)
            
            # Scale features if scaler is available
            if self.scaler:
                features = self.scaler.transform(features)
            
            # Get prediction and probability
            prediction = self.model.predict(features)[0]
            
            # Get prediction probability if available
            confidence = 0.8  # Default confidence
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba(features)[0]
                confidence = max(proba)
            elif hasattr(self.model, 'decision_function'):
                decision = self.model.decision_function(features)[0]
                confidence = min(abs(decision) / 2, 1.0)
            
            # Convert prediction to priority score (0-100)
            if isinstance(prediction, (int, float)):
                priority_score = max(0, min(100, prediction * 100))
            else:
                priority_score = 75  # Default for classification
            
            # Generate explanation
            reasoning = self.generate_reasoning(candidate_data, features.flatten())
            
            # Extract skills with confidence
            skills_extracted = self.extract_skills_with_confidence(candidate_data)
            
            # Generate recommendations
            recommendations = self.generate_recommendations(priority_score, candidate_data)
            
            return {
                'priorityScore': round(priority_score),
                'confidence': round(confidence, 3),
                'reasoning': reasoning,
                'skillsExtracted': skills_extracted,
                'recommendedActions': recommendations
            }
            
        except Exception as e:
            print(f"Prediction error: {e}", file=sys.stderr)
            return self.rule_based_prediction(candidate_data)
    
    def rule_based_prediction(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fallback rule-based prediction when ML model is unavailable
        """
        score = 0
        reasoning = []
        
        # Experience scoring (25 points)
        exp_years = candidate_data.get('yearsOfExperience', 0)
        exp_score = min(exp_years / 10 * 25, 25)
        score += exp_score
        if exp_years >= 5:
            reasoning.append(f"Strong experience: {exp_years} years")
        
        # Skills match scoring (30 points)
        skills_score = candidate_data.get('skillsMatchScore', 0) * 30
        score += skills_score
        if candidate_data.get('skillsMatchScore', 0) > 0.7:
            reasoning.append("Excellent skills match")
        
        # Application quality (25 points)
        quality_score = (
            candidate_data.get('resumeQualityScore', 0) * 0.4 +
            (0.3 if candidate_data.get('coverLetterPresent', False) else 0) +
            (0.3 if candidate_data.get('portfolioPresent', False) else 0)
        ) * 25
        score += quality_score
        
        # Practical factors (20 points)
        practical_score = (
            candidate_data.get('locationMatch', 0) * 0.4 +
            candidate_data.get('salaryExpectationMatch', 0) * 0.4 +
            candidate_data.get('availabilityMatch', 0) * 0.2
        ) * 20
        score += practical_score
        
        if candidate_data.get('locationMatch', 0) > 0.8:
            reasoning.append("Good location match")
        
        return {
            'priorityScore': round(score),
            'confidence': 0.75,
            'reasoning': reasoning,
            'skillsExtracted': self.extract_skills_with_confidence(candidate_data),
            'recommendedActions': self.generate_recommendations(score, candidate_data)
        }
    
    def generate_reasoning(self, candidate_data: Dict[str, Any], features: np.ndarray) -> List[str]:
        """Generate human-readable reasoning for the prediction"""
        reasoning = []
        
        if candidate_data.get('yearsOfExperience', 0) >= 5:
            reasoning.append(f"Experienced candidate: {candidate_data['yearsOfExperience']} years")
        
        if candidate_data.get('skillsMatchScore', 0) > 0.7:
            reasoning.append(f"Strong skills match: {round(candidate_data['skillsMatchScore'] * 100)}%")
        
        if candidate_data.get('resumeQualityScore', 0) > 0.8:
            reasoning.append("High-quality resume")
        
        if candidate_data.get('portfolioPresent', False):
            reasoning.append("Portfolio provided")
        
        if candidate_data.get('locationMatch', 0) > 0.8:
            reasoning.append("Good location match")
        
        return reasoning
    
    def extract_skills_with_confidence(self, candidate_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract skills with confidence scores"""
        skills = []
        
        # Technical skills
        for skill in candidate_data.get('technicalSkills', []):
            skills.append({
                'skill': skill,
                'confidence': 0.85,
                'category': 'technical'
            })
        
        # Soft skills
        for skill in candidate_data.get('softSkills', []):
            skills.append({
                'skill': skill,
                'confidence': 0.75,
                'category': 'soft'
            })
        
        return skills
    
    def generate_recommendations(self, score: float, candidate_data: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if score >= 80:
            recommendations.append("High priority - schedule interview immediately")
        elif score >= 60:
            recommendations.append("Good candidate - proceed to next round")
        else:
            recommendations.append("Review application carefully before proceeding")
        
        if candidate_data.get('skillsMatchScore', 0) < 0.5:
            recommendations.append("Consider skills gap - may need training")
        
        if not candidate_data.get('coverLetterPresent', False):
            recommendations.append("Request cover letter for better assessment")
        
        if candidate_data.get('locationMatch', 0) < 0.5:
            recommendations.append("Discuss remote work or relocation options")
        
        return recommendations

def main():
    """Main function to handle prediction requests"""
    if len(sys.argv) != 3:
        print("Usage: python predict.py <model_path> <candidate_data_json>", file=sys.stderr)
        sys.exit(1)
    
    model_path = sys.argv[1]
    candidate_data_json = sys.argv[2]
    
    try:
        candidate_data = json.loads(candidate_data_json)
        
        # Initialize model
        model = CandidatePrioritizationModel(model_path)
        
        # Make prediction
        result = model.predict(candidate_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(f"Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Prediction failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

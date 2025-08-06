#!/usr/bin/env python3
"""
TalentSol Decision Tree Model Test Script
Tests your trained model with sample data to ensure integration works correctly
"""

import sys
import json
import pandas as pd
import joblib
import numpy as np
from pathlib import Path

def test_model_loading():
    """Test if the model can be loaded successfully"""
    try:
        model_path = Path(__file__).parent / "best_performing_model_pipeline.joblib"
        print(f"🔍 Loading model from: {model_path}")
        
        if not model_path.exists():
            print(f"❌ Model file not found: {model_path}")
            return False
            
        pipeline = joblib.load(model_path)
        print(f"✅ Model loaded successfully!")
        print(f"📊 Model type: {type(pipeline)}")
        
        # Check if it has the expected methods
        if hasattr(pipeline, 'predict_proba'):
            print("✅ Model has predict_proba method")
        else:
            print("⚠️  Model doesn't have predict_proba method")
            
        if hasattr(pipeline, 'predict'):
            print("✅ Model has predict method")
        else:
            print("❌ Model doesn't have predict method")
            
        return True
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

def test_sample_prediction():
    """Test prediction with sample data matching your model's expected format"""
    try:
        model_path = Path(__file__).parent / "best_performing_model_pipeline.joblib"
        pipeline = joblib.load(model_path)
        
        # Sample data based on your model's expected input format
        # This should match the format from your training data
        sample_data = {
            'Job Description': 'We are looking for a Senior Software Engineer with experience in Python, React, and machine learning. The ideal candidate should have 5+ years of experience in full-stack development.',
            'Resume': 'John Doe - Senior Software Engineer with 6 years of experience in Python, JavaScript, React, and machine learning. Previously worked at tech startups building scalable web applications.',
            'Job Roles': 'Senior Software Engineer',
            'Ethnicity': 'Not Specified'
        }
        
        print("🧪 Testing with sample data:")
        print(f"   Job: {sample_data['Job Roles']}")
        print(f"   Resume length: {len(sample_data['Resume'])} characters")
        
        # Create DataFrame (your model expects this format)
        df = pd.DataFrame([sample_data])
        print(f"📊 DataFrame shape: {df.shape}")
        print(f"📊 DataFrame columns: {list(df.columns)}")
        
        # Make prediction
        probabilities = pipeline.predict_proba(df)
        prediction = pipeline.predict(df)
        
        print(f"✅ Prediction successful!")
        print(f"📈 Probabilities shape: {probabilities.shape}")
        print(f"📈 Probabilities: {probabilities[0]}")
        print(f"🎯 Prediction: {prediction[0]}")
        
        # Calculate best match probability (assuming class 1 is "Best Match")
        if probabilities.shape[1] >= 2:
            best_match_prob = probabilities[0][1]
            print(f"🎯 Best Match Probability: {best_match_prob:.4f}")
            
            # Apply your optimized threshold (if you have one)
            threshold = 0.5  # Adjust based on your model's optimal threshold
            final_prediction = 1 if best_match_prob >= threshold else 0
            print(f"🎯 Final Prediction (threshold={threshold}): {final_prediction}")
            
            return {
                'success': True,
                'probability': float(best_match_prob),
                'prediction': int(final_prediction),
                'confidence': float(max(probabilities[0])),
                'raw_probabilities': probabilities[0].tolist()
            }
        else:
            print("⚠️  Unexpected probability shape")
            return {'success': False, 'error': 'Unexpected probability shape'}
            
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

def test_talentsol_format():
    """Test with TalentSol data format (as it would come from mlDataAdapter)"""
    try:
        # This simulates data from your TalentSol database
        talentsol_input = {
            'job_description': 'Senior Software Engineer position requiring Python, React, and ML experience. 5+ years required.',
            'resume': 'Experienced software engineer with 6 years in Python, JavaScript, React. Built ML-powered applications.',
            'job_role': 'Senior Software Engineer',
            'ethnicity': 'Not Specified'
        }
        
        print("🏢 Testing with TalentSol format:")
        
        # Convert to your model's expected format
        model_input = {
            'Job Description': talentsol_input['job_description'],
            'Resume': talentsol_input['resume'],
            'Job Roles': talentsol_input['job_role'],
            'Ethnicity': talentsol_input.get('ethnicity', 'Not Specified')
        }
        
        model_path = Path(__file__).parent / "best_performing_model_pipeline.joblib"
        pipeline = joblib.load(model_path)
        
        df = pd.DataFrame([model_input])
        probabilities = pipeline.predict_proba(df)
        
        best_match_prob = probabilities[0][1] if probabilities.shape[1] >= 2 else probabilities[0][0]
        
        result = {
            'success': True,
            'probability': float(best_match_prob),
            'confidence': float(max(probabilities[0])),
            'model_input': model_input,
            'talentsol_input': talentsol_input
        }
        
        print(f"✅ TalentSol format test successful!")
        print(f"🎯 Best Match Probability: {best_match_prob:.4f}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error with TalentSol format: {e}")
        return {'success': False, 'error': str(e)}

def main():
    """Main test function"""
    print("🚀 TalentSol Decision Tree Model Integration Test")
    print("=" * 50)
    
    # Test 1: Model Loading
    print("\n1️⃣ Testing Model Loading...")
    if not test_model_loading():
        print("❌ Model loading failed. Please check the model file.")
        sys.exit(1)
    
    # Test 2: Sample Prediction
    print("\n2️⃣ Testing Sample Prediction...")
    sample_result = test_sample_prediction()
    if not sample_result.get('success'):
        print("❌ Sample prediction failed.")
        sys.exit(1)
    
    # Test 3: TalentSol Format
    print("\n3️⃣ Testing TalentSol Data Format...")
    talentsol_result = test_talentsol_format()
    if not talentsol_result.get('success'):
        print("❌ TalentSol format test failed.")
        sys.exit(1)
    
    print("\n🎉 All tests passed! Your model is ready for TalentSol integration.")
    print("\n📊 Test Results Summary:")
    print(f"   Sample Prediction: {sample_result['probability']:.4f}")
    print(f"   TalentSol Format: {talentsol_result['probability']:.4f}")
    
    # Output JSON for programmatic use
    final_result = {
        'integration_test': 'PASSED',
        'model_loaded': True,
        'sample_prediction': sample_result,
        'talentsol_format': talentsol_result,
        'timestamp': pd.Timestamp.now().isoformat()
    }
    
    print(f"\n📋 JSON Result:")
    print(json.dumps(final_result, indent=2))

if __name__ == "__main__":
    main()

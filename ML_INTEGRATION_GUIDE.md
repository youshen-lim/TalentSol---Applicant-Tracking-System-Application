# TalentSol ML Integration Guide: Kaggle Dataset to Production

## 🎯 **Overview**

This guide shows how to integrate publicly sourced Kaggle datasets for ML-powered candidate prioritization in TalentSol ATS, leveraging your existing database structure and mock data.

## 📊 **Recommended Kaggle Datasets**

### **1. Primary Dataset: "Resume Dataset" by SPIDY20**
- **URL**: `https://www.kaggle.com/datasets/spidy20/resume-dataset`
- **Size**: 2,400+ labeled resumes
- **Categories**: 25 job categories
- **Format**: CSV with resume text and job categories
- **License**: Public Domain

### **2. Secondary Dataset: "HR Analytics Dataset"**
- **URL**: `https://www.kaggle.com/datasets/giripujar/hr-analytics`
- **Features**: Employee performance, satisfaction, promotion data
- **Use Case**: Training hiring success prediction models

### **3. Skills Dataset: "LinkedIn Job Skills"**
- **URL**: `https://www.kaggle.com/datasets/asaniczka/linkedin-job-skills-dataset`
- **Features**: Job titles, required skills, experience levels
- **Use Case**: Skills extraction and matching

## 🏗️ **Database Integration Architecture**

### **Enhanced Schema (Already Implemented)**

```sql
-- ML Models Management
CREATE TABLE ml_models (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50), -- 'candidate_scoring', 'job_matching', 'resume_parsing'
  version VARCHAR(50),
  model_path VARCHAR(500),
  accuracy FLOAT,
  precision FLOAT,
  recall FLOAT,
  f1_score FLOAT,
  training_data JSONB,
  features TEXT[],
  is_active BOOLEAN DEFAULT false,
  trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ML Predictions Storage
CREATE TABLE ml_predictions (
  id UUID PRIMARY KEY,
  model_id UUID REFERENCES ml_models(id),
  application_id UUID REFERENCES applications(id),
  prediction_type VARCHAR(50),
  input_features JSONB,
  prediction JSONB,
  confidence FLOAT,
  explanation JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skills Extraction
CREATE TABLE skill_extractions (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  extracted_skills JSONB,
  skill_categories JSONB,
  experience_level VARCHAR(50),
  confidence FLOAT,
  method VARCHAR(20) DEFAULT 'ml',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Training Datasets Registry
CREATE TABLE training_datasets (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  source VARCHAR(100), -- 'kaggle', 'internal', 'synthetic'
  dataset_path VARCHAR(500),
  features TEXT[],
  target_variable VARCHAR(100),
  record_count INTEGER,
  version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 **Data Flow Integration**

### **1. Kaggle Dataset → TalentSol Features Mapping**

```python
# Kaggle Resume Dataset Features
kaggle_features = {
    'resume_text': 'Raw resume content',
    'category': 'Job category (25 categories)',
    'skills': 'Extracted skills list'
}

# TalentSol Application Features
talentsol_features = {
    'yearsOfExperience': 'From professional_info.experience',
    'educationLevel': 'Extracted from resume/application',
    'technicalSkills': 'From skills extraction',
    'softSkills': 'From skills extraction',
    'skillsMatchScore': 'Calculated vs job requirements',
    'roleRelevance': 'Based on previous roles',
    'resumeQualityScore': 'ML-based quality assessment',
    'applicationCompleteness': 'Calculated completeness score',
    'locationMatch': 'Geographic compatibility',
    'salaryExpectationMatch': 'Salary alignment score'
}
```

### **2. Feature Engineering Pipeline**

```typescript
// In MLService.extractFeatures()
async extractFeatures(applicationId: string): Promise<CandidateFeatures> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { candidate: true, job: true, documents: true }
  });

  // Map TalentSol data to ML features
  return {
    yearsOfExperience: this.parseExperience(application.professionalInfo),
    technicalSkills: await this.extractSkills(application.documents),
    skillsMatchScore: this.calculateSkillsMatch(candidateSkills, jobSkills),
    // ... other features
  };
}
```

## 🚀 **Implementation Steps**

### **Step 1: Download and Prepare Kaggle Dataset**

```bash
# Install Kaggle CLI
pip install kaggle

# Download dataset
kaggle datasets download -d spidy20/resume-dataset
unzip resume-dataset.zip -d ./backend/ml_models/data/

# Register dataset in TalentSol
curl -X POST http://localhost:3001/api/ml/datasets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Kaggle Resume Dataset",
    "description": "2400+ labeled resumes for candidate classification",
    "source": "kaggle",
    "datasetPath": "./ml_models/data/resume_dataset.csv",
    "features": ["resume_text", "category", "extracted_skills"],
    "targetVariable": "category",
    "recordCount": 2400,
    "metadata": {
      "kaggle_url": "https://www.kaggle.com/datasets/spidy20/resume-dataset",
      "license": "Public Domain"
    }
  }'
```

### **Step 2: Train ML Model**

```python
# Create training script: backend/ml_models/train_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pickle

def train_candidate_scoring_model():
    # Load Kaggle dataset
    df = pd.read_csv('./data/resume_dataset.csv')
    
    # Feature engineering
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    X_text = vectorizer.fit_transform(df['resume_text'])
    
    # Add numerical features (simulated from TalentSol structure)
    X_numerical = np.random.rand(len(df), 10)  # Replace with real features
    X = np.hstack([X_text.toarray(), X_numerical])
    
    # Create priority scores (0-100) from categories
    category_scores = {
        'Data Science': 85, 'Web Designing': 75, 'Android Developer': 80,
        # ... map all 25 categories to priority scores
    }
    y = df['category'].map(category_scores).fillna(50) / 100  # Normalize to 0-1
    
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    score = model.score(X_test, y_test)
    print(f"Model accuracy: {score:.3f}")
    
    # Save model
    model_data = {
        'model': model,
        'vectorizer': vectorizer,
        'feature_names': ['text_features'] + [f'feature_{i}' for i in range(10)],
        'accuracy': score
    }
    
    with open('./models/candidate_scoring_v1.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    return model_data

if __name__ == "__main__":
    train_candidate_scoring_model()
```

### **Step 3: Register Trained Model**

```bash
# Register model via API
curl -X POST http://localhost:3001/api/ml/train \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "datasetId": "DATASET_ID_FROM_STEP_1",
    "modelType": "candidate_scoring",
    "modelName": "Kaggle Resume Classifier v1",
    "features": ["resume_text", "years_experience", "skills_match", "education_level"],
    "hyperparameters": {
      "n_estimators": 100,
      "max_depth": 10,
      "random_state": 42
    }
  }'
```

### **Step 4: Activate Model and Test Predictions**

```bash
# Activate model
curl -X PATCH http://localhost:3001/api/ml/models/MODEL_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"isActive": true}'

# Test prediction
curl -X POST http://localhost:3001/api/ml/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "applicationIds": ["APPLICATION_ID_1", "APPLICATION_ID_2"],
    "modelType": "candidate_scoring"
  }'
```

## 🎨 **Frontend Integration**

### **Enhanced Candidate Cards with ML Scores**

```typescript
// In CandidatePipeline.tsx
interface CandidateWithML extends Candidate {
  mlScore?: {
    priorityScore: number;
    confidence: number;
    reasoning: string[];
    skillsExtracted: Array<{
      skill: string;
      confidence: number;
      category: string;
    }>;
  };
}

// ML Score Badge Component
const MLScoreBadge = ({ score, confidence }: { score: number; confidence: number }) => (
  <div className="flex items-center gap-2">
    <div className={`px-2 py-1 rounded text-xs font-medium ${
      score >= 80 ? 'bg-green-100 text-green-800' :
      score >= 60 ? 'bg-yellow-100 text-yellow-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      ML Score: {score}
    </div>
    <div className="text-xs text-gray-500">
      {Math.round(confidence * 100)}% confidence
    </div>
  </div>
);
```

### **Bulk ML Prediction Button**

```typescript
// Add to Jobs page for bulk candidate scoring
const handleBulkMLPrediction = async (jobId: string) => {
  try {
    const response = await fetch(`/api/ml/predict/job/${jobId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    toast.success(`ML predictions completed for ${result.summary.successful} candidates`);
    // Refresh candidate list with ML scores
    
  } catch (error) {
    toast.error('ML prediction failed');
  }
};
```

## 📈 **Analytics Integration**

### **ML Performance Dashboard**

```typescript
// New analytics endpoint: /api/analytics/ml-performance
const MLAnalytics = () => {
  const [mlMetrics, setMLMetrics] = useState({
    totalPredictions: 0,
    averageConfidence: 0,
    modelAccuracy: 0,
    predictionTrend: []
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="ML Predictions"
        value={mlMetrics.totalPredictions}
        icon={<Brain className="h-5 w-5" />}
      />
      <MetricCard
        title="Average Confidence"
        value={`${Math.round(mlMetrics.averageConfidence * 100)}%`}
        icon={<Target className="h-5 w-5" />}
      />
      <MetricCard
        title="Model Accuracy"
        value={`${Math.round(mlMetrics.modelAccuracy * 100)}%`}
        icon={<TrendingUp className="h-5 w-5" />}
      />
    </div>
  );
};
```

## 🔒 **Security & Privacy Considerations**

### **Data Privacy**
- ✅ **Anonymize training data** - Remove PII from Kaggle datasets
- ✅ **Secure model storage** - Encrypt model files
- ✅ **Access controls** - ML endpoints require authentication
- ✅ **Audit logging** - Track all ML predictions

### **Model Governance**
- ✅ **Version control** - Track model versions and performance
- ✅ **A/B testing** - Compare ML vs rule-based predictions
- ✅ **Bias monitoring** - Regular fairness audits
- ✅ **Fallback systems** - Rule-based backup when ML fails

## 🚀 **Production Deployment**

### **Scalability Considerations**
1. **Async Processing** - Queue ML predictions for batch processing
2. **Model Caching** - Cache frequently used models in memory
3. **Feature Store** - Centralized feature management
4. **Monitoring** - Track prediction latency and accuracy

### **Continuous Learning**
1. **Feedback Loop** - Use hiring outcomes to retrain models
2. **Active Learning** - Identify uncertain predictions for human review
3. **Model Drift Detection** - Monitor for performance degradation
4. **Automated Retraining** - Scheduled model updates

This integration transforms TalentSol from a traditional ATS into an AI-powered recruitment platform while maintaining data privacy and providing transparent, explainable AI decisions.

# TalentSol ML Models Directory

## 📁 Directory Structure

```
backend/ml-models/
├── decision-tree/                    # Your Decision Tree Model
│   ├── best_performing_model_pipeline.joblib  # Your trained model
│   ├── requirements.txt              # Python dependencies
│   └── test_model.py                # Model testing script
├── logistic-regression/              # Logistic Regression Model (future)
│   ├── optimized_tfidf_logistic_regression_pipeline.joblib
│   ├── requirements.txt
│   └── test_model.py
├── integration/                      # Model Integration Wrappers
│   └── predict_wrapper.py           # Unified prediction wrapper
├── legacy/                          # Legacy ML Components
│   └── predict.py                   # Old Kaggle-based prediction
├── shared/                          # Shared Resources
│   ├── ml-env/                      # Python virtual environment
│   └── utils.py                     # Shared utilities
└── versions/                        # Model Versioning (managed by mlVersioningService)
    └── {model-name}/
        └── {version}/
```

## 🎯 Model Types

### **Production Models** (Active)
- **Decision Tree**: Your trained XGBoost model for candidate screening
- **Logistic Regression**: TF-IDF optimized model (future integration)

### **Legacy Models** (Deprecated)
- **Kaggle-based**: Generic candidate prioritization (kept for reference)

## 🔧 Integration Services

### **Primary Services** (TypeScript)
- `mlModelService.ts` - Main ML model service
- `mlDataAdapter.ts` - Data format conversion
- `mlDataPipelineService.ts` - ETL and real-time processing
- `mlSecurityService.ts` - Security and validation
- `mlVersioningService.ts` - Model deployment and versioning

### **Legacy Services** (Deprecated)
- `mlService.ts` - Old generic ML service (uses legacy/ directory)

## 🚀 Usage

### **Your Decision Tree Model**
```bash
# Place your model file
cp best_performing_model_pipeline.joblib backend/ml-models/decision-tree/

# Test integration
python backend/ml-models/decision-tree/test_model.py

# Start TalentSol with ML
npm run dev
```

### **API Endpoints**
```bash
# Decision Tree prediction
POST /api/ml/predict/decision-tree

# Ensemble prediction (both models)
POST /api/ml/predict/ensemble

# Model initialization
POST /api/ml/initialize-models
```

## 📊 Model Performance

### **Your Decision Tree Model**
- **Accuracy**: 87%
- **Precision**: 57% (at 70% recall)
- **Recall**: 70%
- **F1-Score**: 63%
- **Model Type**: XGBoost ensemble with HashingVectorizer

### **Expected Input Format**
```python
{
    'Job Description': 'Senior Software Engineer...',
    'Resume': 'John Doe - 6 years experience...',
    'Job Roles': 'Senior Software Engineer',
    'Ethnicity': 'Not Specified'
}
```

### **Expected Output Format**
```json
{
  "probability": 0.73,
  "prediction": 1,
  "confidence": 0.85,
  "reasoning": ["Strong match based on experience"],
  "model_type": "xgboost_decision_tree_ensemble"
}
```

## 🔒 Security Features

- **Input validation**: Prevents malicious data injection
- **Rate limiting**: 1000 predictions/hour per user
- **Data encryption**: Sensitive ML data encrypted at rest
- **Audit logging**: All predictions logged for compliance
- **Privacy compliance**: PII detection and removal

## 📈 Performance Optimization

- **Local model files**: Fast inference (<2 seconds)
- **Memory caching**: Models loaded once, reused
- **Process pooling**: Efficient Python subprocess management
- **Batch processing**: Handle multiple predictions efficiently

## 🛠️ Maintenance

### **Adding New Models**
1. Create new directory under `ml-models/`
2. Add model file and requirements.txt
3. Create test script
4. Update `mlModelService.ts` with new model paths
5. Add API endpoints in `ml.ts`

### **Model Versioning**
- Managed automatically by `mlVersioningService.ts`
- Versions stored in `versions/` directory
- Supports rollback and A/B testing

### **Monitoring**
- Performance metrics tracked
- Error rates monitored
- Model accuracy validation
- Real-time health checks

## 🔄 Migration Notes

**Consolidated from two directories**:
- `ml-models/` (hyphenated) - **Primary structure** ✅
- `ml_models/` (underscore) - **Migrated to legacy/** ✅

**Benefits of consolidation**:
- Single source of truth for ML models
- Consistent naming convention
- Better organization and maintainability
- Clear separation of active vs legacy components

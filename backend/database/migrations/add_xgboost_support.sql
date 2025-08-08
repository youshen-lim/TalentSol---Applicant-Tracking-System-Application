-- Migration: Add XGBoost Model Support to TalentSol
-- This migration adds support for your trained XGBoost Decision Tree model
-- Created: 2025-01-08

-- Add XGBoost-specific columns to ml_models table
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS xgboost_params JSONB;
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS hashing_vectorizer_params JSONB;
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS onehot_encoder_params JSONB;
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS optimized_threshold DECIMAL(6,4);
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS target_recall DECIMAL(5,4);
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS achieved_precision DECIMAL(5,4);
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS sklearn_version VARCHAR(20);
ALTER TABLE ml_models ADD COLUMN IF NOT EXISTS joblib_version VARCHAR(20);

-- Create XGBoost feature store table for efficient feature caching
CREATE TABLE IF NOT EXISTS ml_xgboost_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  
  -- Text features (HashingVectorizer output)
  job_description_hash_features JSONB NOT NULL,
  resume_hash_features JSONB NOT NULL,
  combined_text_features JSONB NOT NULL,
  
  -- Categorical features (One-Hot Encoded)
  ethnicity_encoded JSONB NOT NULL,
  job_roles_encoded JSONB NOT NULL,
  race1_encoded JSONB,
  race2_encoded JSONB,
  
  -- Model-specific metadata
  feature_vector_size INTEGER NOT NULL DEFAULT 10000,
  preprocessing_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  model_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  
  -- Feature quality metrics
  text_quality_score DECIMAL(5,4),
  categorical_completeness DECIMAL(5,4),
  
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Indexes for performance
  CONSTRAINT unique_application_version UNIQUE (application_id, model_version)
);

-- Create indexes for XGBoost features table
CREATE INDEX IF NOT EXISTS idx_xgboost_features_application_id ON ml_xgboost_features(application_id);
CREATE INDEX IF NOT EXISTS idx_xgboost_features_model_version ON ml_xgboost_features(model_version);
CREATE INDEX IF NOT EXISTS idx_xgboost_features_expires_at ON ml_xgboost_features(expires_at);

-- Create XGBoost performance tracking table
CREATE TABLE IF NOT EXISTS ml_xgboost_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version VARCHAR(20) NOT NULL,
  evaluation_date TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Performance metrics matching your model
  accuracy DECIMAL(6,4),
  precision_at_70_recall DECIMAL(6,4),  -- Your target: ~57%
  recall_target DECIMAL(6,4),           -- Your target: ~70%
  f1_score DECIMAL(6,4),
  roc_auc DECIMAL(6,4),
  
  -- Threshold optimization
  optimized_threshold DECIMAL(6,4),     -- ~0.5027 for your model
  threshold_optimization_method VARCHAR(50) DEFAULT 'precision_recall_curve',
  
  -- Dataset characteristics
  training_samples INTEGER,
  test_samples INTEGER,
  class_balance_ratio DECIMAL(6,4),     -- After oversampling
  
  -- Performance over time
  predictions_count INTEGER DEFAULT 0,
  positive_predictions_count INTEGER DEFAULT 0,
  average_confidence DECIMAL(6,4),
  average_processing_time_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for performance tracking
CREATE INDEX IF NOT EXISTS idx_xgboost_performance_model_version ON ml_xgboost_performance(model_version);
CREATE INDEX IF NOT EXISTS idx_xgboost_performance_evaluation_date ON ml_xgboost_performance(evaluation_date);

-- Create XGBoost prediction logs table for detailed tracking
CREATE TABLE IF NOT EXISTS ml_xgboost_prediction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES ml_predictions(id) ON DELETE CASCADE,
  
  -- Detailed prediction information
  raw_probability DECIMAL(8,6) NOT NULL,
  binary_prediction INTEGER NOT NULL CHECK (binary_prediction IN (0, 1)),
  threshold_used DECIMAL(6,4) NOT NULL,
  confidence_score DECIMAL(6,4) NOT NULL,
  
  -- Processing metrics
  feature_extraction_time_ms INTEGER,
  inference_time_ms INTEGER,
  total_processing_time_ms INTEGER,
  
  -- Model information
  model_version VARCHAR(20) NOT NULL,
  sklearn_version VARCHAR(20),
  python_version VARCHAR(20),
  
  -- Input data characteristics
  job_description_length INTEGER,
  resume_length INTEGER,
  ethnicity_value VARCHAR(50),
  
  -- Error tracking
  error_message TEXT,
  error_type VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for prediction logs
CREATE INDEX IF NOT EXISTS idx_xgboost_logs_application_id ON ml_xgboost_prediction_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_xgboost_logs_prediction_id ON ml_xgboost_prediction_logs(prediction_id);
CREATE INDEX IF NOT EXISTS idx_xgboost_logs_model_version ON ml_xgboost_prediction_logs(model_version);
CREATE INDEX IF NOT EXISTS idx_xgboost_logs_created_at ON ml_xgboost_prediction_logs(created_at);

-- Insert your XGBoost model configuration
INSERT INTO ml_models (
  name, 
  version, 
  type, 
  file_path,
  description,
  xgboost_params,
  hashing_vectorizer_params,
  onehot_encoder_params,
  optimized_threshold,
  target_recall,
  achieved_precision,
  sklearn_version,
  joblib_version,
  performance_metrics,
  is_active,
  created_at
) VALUES (
  'xgboost_candidate_screening',
  '1.0',
  'xgboost_ensemble',
  'backend/ml-models/decision-tree/best_performing_model_pipeline.joblib',
  'XGBoost Decision Tree ensemble for candidate screening with 70% recall and 57% precision',
  '{"n_estimators": 100, "max_depth": 6, "learning_rate": 0.1, "random_state": 42}',
  '{"n_features": 10000, "hash_function": "sklearn", "alternate_sign": true}',
  '{"drop": "first", "sparse": false, "handle_unknown": "ignore"}',
  0.5027,  -- Your optimized threshold
  0.70,    -- Your target recall
  0.57,    -- Your achieved precision
  '1.6.1',  -- Critical sklearn version
  '1.3.2',  -- Critical joblib version
  '{"accuracy": 0.87, "f1_score": 0.63, "roc_auc": 0.85, "training_method": "5_fold_stratified_cv", "oversampling": true}',
  true,
  NOW()
) ON CONFLICT (name, version) DO UPDATE SET
  xgboost_params = EXCLUDED.xgboost_params,
  hashing_vectorizer_params = EXCLUDED.hashing_vectorizer_params,
  onehot_encoder_params = EXCLUDED.onehot_encoder_params,
  optimized_threshold = EXCLUDED.optimized_threshold,
  target_recall = EXCLUDED.target_recall,
  achieved_precision = EXCLUDED.achieved_precision,
  sklearn_version = EXCLUDED.sklearn_version,
  joblib_version = EXCLUDED.joblib_version,
  performance_metrics = EXCLUDED.performance_metrics,
  updated_at = NOW();

-- Insert initial performance record for your model
INSERT INTO ml_xgboost_performance (
  model_version,
  accuracy,
  precision_at_70_recall,
  recall_target,
  f1_score,
  roc_auc,
  optimized_threshold,
  threshold_optimization_method,
  training_samples,
  test_samples,
  class_balance_ratio
) VALUES (
  '1.0',
  0.87,    -- Your model's accuracy
  0.57,    -- Your achieved precision at 70% recall
  0.70,    -- Your target recall
  0.63,    -- Your F1-score
  0.85,    -- Your ROC AUC (estimated)
  0.5027,  -- Your optimized threshold
  'precision_recall_curve',
  NULL,    -- Training samples (to be updated)
  NULL,    -- Test samples (to be updated)
  NULL     -- Class balance ratio (to be updated)
) ON CONFLICT DO NOTHING;

-- Create function to clean up expired features
CREATE OR REPLACE FUNCTION cleanup_expired_xgboost_features()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ml_xgboost_features 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update XGBoost performance metrics
CREATE OR REPLACE FUNCTION update_xgboost_performance_metrics(
  p_model_version VARCHAR(20),
  p_predictions_count INTEGER DEFAULT 1,
  p_positive_predictions INTEGER DEFAULT 0,
  p_confidence DECIMAL(6,4) DEFAULT NULL,
  p_processing_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ml_xgboost_performance (
    model_version,
    evaluation_date,
    predictions_count,
    positive_predictions_count,
    average_confidence,
    average_processing_time_ms
  ) VALUES (
    p_model_version,
    NOW(),
    p_predictions_count,
    p_positive_predictions,
    p_confidence,
    p_processing_time_ms
  )
  ON CONFLICT (model_version, DATE(evaluation_date)) 
  DO UPDATE SET
    predictions_count = ml_xgboost_performance.predictions_count + p_predictions_count,
    positive_predictions_count = ml_xgboost_performance.positive_predictions_count + p_positive_predictions,
    average_confidence = CASE 
      WHEN p_confidence IS NOT NULL THEN 
        (COALESCE(ml_xgboost_performance.average_confidence, 0) + p_confidence) / 2
      ELSE ml_xgboost_performance.average_confidence
    END,
    average_processing_time_ms = CASE 
      WHEN p_processing_time_ms IS NOT NULL THEN 
        (COALESCE(ml_xgboost_performance.average_processing_time_ms, 0) + p_processing_time_ms) / 2
      ELSE ml_xgboost_performance.average_processing_time_ms
    END;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE ml_xgboost_features IS 'Feature store for XGBoost model preprocessing cache';
COMMENT ON TABLE ml_xgboost_performance IS 'Performance tracking for XGBoost model over time';
COMMENT ON TABLE ml_xgboost_prediction_logs IS 'Detailed logging for XGBoost predictions';
COMMENT ON FUNCTION cleanup_expired_xgboost_features() IS 'Cleanup function for expired XGBoost features';
COMMENT ON FUNCTION update_xgboost_performance_metrics(VARCHAR, INTEGER, INTEGER, DECIMAL, INTEGER) IS 'Update XGBoost performance metrics';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ml_xgboost_features TO talentsol_app;
-- GRANT SELECT, INSERT, UPDATE ON ml_xgboost_performance TO talentsol_app;
-- GRANT SELECT, INSERT ON ml_xgboost_prediction_logs TO talentsol_app;

COMMIT;

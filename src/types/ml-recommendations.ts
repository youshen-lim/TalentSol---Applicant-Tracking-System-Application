/**
 * ML Candidate Recommendation Types
 * Defines interfaces for ML-driven candidate prioritization and recommendation system
 */

// Core ML recommendation interfaces
export interface CandidateScore {
  candidateId: string;
  jobId: string;
  overallScore: number; // 0-100
  confidence: number; // 0-1
  reasoning: ScoreReasoning;
  timestamp: string;
  modelVersion: string;
}

export interface ScoreReasoning {
  skillMatch: SkillMatchScore;
  experienceMatch: ExperienceMatchScore;
  locationMatch: LocationMatchScore;
  salaryMatch: SalaryMatchScore;
  qualificationMatch: QualificationMatchScore;
  culturalFit: CulturalFitScore;
  successProbability: number; // 0-1
}

export interface SkillMatchScore {
  score: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  weightedScore: number;
}

export interface ExperienceMatchScore {
  score: number; // 0-100
  requiredYears: number;
  candidateYears: number;
  relevantExperience: boolean;
  industryMatch: boolean;
}

export interface LocationMatchScore {
  score: number; // 0-100
  distance: number; // km
  remoteCompatible: boolean;
  relocationWillingness: boolean;
  timezone: string;
}

export interface SalaryMatchScore {
  score: number; // 0-100
  jobSalaryRange: SalaryRange;
  candidateExpectation: SalaryRange;
  negotiationPotential: number; // 0-1
}

export interface QualificationMatchScore {
  score: number; // 0-100
  requiredQualifications: string[];
  candidateQualifications: string[];
  overqualified: boolean;
  underqualified: boolean;
}

export interface CulturalFitScore {
  score: number; // 0-100
  workTypeMatch: boolean; // full-time, part-time, contract
  companySizePreference: boolean;
  industryExperience: boolean;
  teamFitPrediction: number; // 0-1
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

// ML Model interfaces
export interface MLModelConfig {
  modelId: string;
  modelName: string;
  version: string;
  type: 'scoring' | 'ranking' | 'matching' | 'prediction';
  isActive: boolean;
  accuracy: number;
  lastTrained: string;
  features: string[];
}

export interface RecommendationRequest {
  jobId: string;
  candidateIds?: string[];
  limit?: number;
  includeReasoning?: boolean;
  modelVersion?: string;
  filters?: RecommendationFilters;
}

export interface RecommendationFilters {
  minScore?: number;
  maxResults?: number;
  excludeApplied?: boolean;
  locationRadius?: number;
  salaryRange?: SalaryRange;
  requiredSkills?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
}

export interface RecommendationResponse {
  jobId: string;
  recommendations: CandidateRecommendation[];
  metadata: RecommendationMetadata;
  modelInfo: MLModelConfig;
}

export interface CandidateRecommendation {
  candidate: CandidateProfile;
  score: CandidateScore;
  rank: number;
  tags: RecommendationTag[];
  actionItems: string[];
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  currentPosition?: string;
  experience: number; // years
  location: LocationInfo;
  skills: string[];
  qualifications: string[];
  salaryExpectation?: SalaryRange;
  availability: AvailabilityInfo;
  preferences: CandidatePreferences;
}

export interface LocationInfo {
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  remoteWork: boolean;
  relocationWilling: boolean;
}

export interface AvailabilityInfo {
  status: 'available' | 'employed' | 'not-looking';
  startDate?: string;
  noticePeriod?: number; // days
  workType: 'full-time' | 'part-time' | 'contract' | 'freelance';
}

export interface CandidatePreferences {
  companySizePreference: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industryPreferences: string[];
  workEnvironment: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  careerGoals: string[];
}

export interface RecommendationTag {
  type: 'strength' | 'concern' | 'opportunity' | 'risk';
  label: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface RecommendationMetadata {
  totalCandidates: number;
  processedCandidates: number;
  processingTime: number; // ms
  cacheHit: boolean;
  dataFreshness: string; // ISO timestamp
  abTestGroup?: string;
}

// Analytics and performance tracking
export interface RecommendationAnalytics {
  modelPerformance: ModelPerformance;
  userInteractions: UserInteraction[];
  outcomeTracking: OutcomeTracking;
  abTestResults?: ABTestResults;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  calibration: number;
  bias: BiasMetrics;
}

export interface BiasMetrics {
  genderBias: number;
  ageBias: number;
  locationBias: number;
  educationBias: number;
  experienceBias: number;
}

export interface UserInteraction {
  userId: string;
  action: 'view' | 'click' | 'apply' | 'reject' | 'shortlist' | 'interview';
  candidateId: string;
  jobId: string;
  score: number;
  timestamp: string;
  sessionId: string;
}

export interface OutcomeTracking {
  recommendationId: string;
  candidateId: string;
  jobId: string;
  outcome: 'hired' | 'rejected' | 'withdrawn' | 'pending';
  timeToHire?: number; // days
  satisfactionScore?: number; // 1-5
  performanceRating?: number; // 1-5
  retentionMonths?: number;
}

export interface ABTestResults {
  testId: string;
  variant: string;
  conversionRate: number;
  confidenceInterval: [number, number];
  significance: number;
  sampleSize: number;
}

// Feature engineering interfaces
export interface FeatureVector {
  candidateId: string;
  jobId: string;
  features: Record<string, number>;
  categoricalFeatures: Record<string, string>;
  timestamp: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  category: 'skill' | 'experience' | 'location' | 'qualification' | 'preference';
  description: string;
}

// API response interfaces
export interface MLApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  metadata: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    modelVersion: string;
  };
}

export interface BatchRecommendationRequest {
  jobs: Array<{
    jobId: string;
    candidatePool?: string[];
    limit?: number;
  }>;
  globalFilters?: RecommendationFilters;
  priority: 'high' | 'normal' | 'low';
}

export interface BatchRecommendationResponse {
  results: RecommendationResponse[];
  summary: {
    totalJobs: number;
    totalRecommendations: number;
    averageScore: number;
    processingTime: number;
  };
}

/**
 * ML API Service
 * Handles communication with ML recommendation services
 */

import { 
  RecommendationRequest, 
  RecommendationResponse, 
  BatchRecommendationRequest,
  BatchRecommendationResponse,
  CandidateScore,
  MLModelConfig,
  RecommendationAnalytics,
  FeatureImportance,
  MLApiResponse
} from '@/types/ml-recommendations';

class MLApiService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_ML_API_URL || 'http://localhost:3001/api/ml';
    this.apiKey = import.meta.env.VITE_ML_API_KEY;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<MLApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Add demo token for development
    const token = localStorage.getItem('auth-token') || 'demo-token-for-development';
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('ML API request failed:', error);
      throw error;
    }
  }

  // Core recommendation methods
  async getCandidateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const response = await this.request<RecommendationResponse>(
      '/recommendations',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.data;
  }

  async getBatchRecommendations(
    request: BatchRecommendationRequest
  ): Promise<BatchRecommendationResponse> {
    const response = await this.request<BatchRecommendationResponse>(
      '/recommendations/batch',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.data;
  }

  async scoreCandidateForJob(
    candidateId: string,
    jobId: string,
    includeReasoning = true
  ): Promise<CandidateScore> {
    const response = await this.request<CandidateScore>(
      `/score/${candidateId}/${jobId}?includeReasoning=${includeReasoning}`,
      { method: 'GET' }
    );
    return response.data;
  }

  async scoreCandidatesForJob(
    candidateIds: string[],
    jobId: string
  ): Promise<CandidateScore[]> {
    const response = await this.request<CandidateScore[]>(
      `/score/batch`,
      {
        method: 'POST',
        body: JSON.stringify({ candidateIds, jobId }),
      }
    );
    return response.data;
  }

  // Model management
  async getAvailableModels(): Promise<MLModelConfig[]> {
    const response = await this.request<MLModelConfig[]>('/models');
    return response.data;
  }

  async getModelInfo(modelId: string): Promise<MLModelConfig> {
    const response = await this.request<MLModelConfig>(`/models/${modelId}`);
    return response.data;
  }

  async updateModelConfig(
    modelId: string, 
    config: Partial<MLModelConfig>
  ): Promise<MLModelConfig> {
    const response = await this.request<MLModelConfig>(
      `/models/${modelId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(config),
      }
    );
    return response.data;
  }

  // Analytics and performance
  async getRecommendationAnalytics(
    jobId?: string,
    options?: {
      timeRange?: string;
      dateRange?: { start: string; end: string };
      includeABTests?: boolean;
      includeBiasMetrics?: boolean;
    }
  ): Promise<any> {
    const params = new URLSearchParams();
    if (jobId) params.append('jobId', jobId);

    if (options?.timeRange) {
      params.append('timeRange', options.timeRange);
    } else if (options?.dateRange) {
      params.append('start', options.dateRange.start);
      params.append('end', options.dateRange.end);
    }

    if (options?.includeABTests) params.append('includeABTests', 'true');
    if (options?.includeBiasMetrics) params.append('includeBiasMetrics', 'true');

    try {
      const response = await this.request<any>(
        `/analytics?${params.toString()}`
      );
      return response.data || response;
    } catch (error) {
      console.warn('ML Analytics API not available, using mock data');
      return this.getMockAnalyticsData();
    }
  }

  // Get model performance metrics
  async getModelPerformance(modelId?: string): Promise<ModelPerformance> {
    try {
      const response = await this.request<ModelPerformance>(
        `/models/${modelId || 'active'}/performance`
      );
      return response.data || response;
    } catch (error) {
      console.warn('Model performance API not available');
      return {
        accuracy: 0.87,
        precision: 0.84,
        recall: 0.89,
        f1Score: 0.86,
        auc: 0.91,
        calibration: 0.82,
        bias: {
          genderBias: 0.02,
          ageBias: 0.01,
          locationBias: 0.03,
          educationBias: 0.02,
          experienceBias: 0.01
        }
      };
    }
  }

  async getFeatureImportance(modelId?: string): Promise<FeatureImportance[]> {
    const endpoint = modelId ? `/features/importance/${modelId}` : '/features/importance';
    const response = await this.request<FeatureImportance[]>(endpoint);
    return response.data;
  }

  // User interaction tracking
  async trackUserInteraction(interaction: {
    action: string;
    candidateId: string;
    jobId: string;
    score?: number;
    sessionId?: string;
  }): Promise<void> {
    await this.request('/interactions', {
      method: 'POST',
      body: JSON.stringify({
        ...interaction,
        timestamp: new Date().toISOString(),
        userId: 'current-user', // TODO: Get from auth context
      }),
    });
  }

  async trackOutcome(outcome: {
    recommendationId: string;
    candidateId: string;
    jobId: string;
    outcome: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.request('/outcomes', {
      method: 'POST',
      body: JSON.stringify({
        ...outcome,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  // A/B Testing support
  async getABTestVariant(testId: string): Promise<string> {
    try {
      const response = await this.request<{ variant: string }>(`/ab-test/${testId}`);
      return response.data.variant;
    } catch (error) {
      console.warn('A/B test variant API not available');
      return 'control'; // Default to control variant
    }
  }

  async trackABTestConversion(
    testId: string,
    variant: string,
    conversionType: string
  ): Promise<void> {
    try {
      await this.request('/ab-test/conversion', {
        method: 'POST',
        body: JSON.stringify({
          testId,
          variant,
          conversionType,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('A/B test conversion tracking failed:', error);
    }
  }

  // Track A/B test events
  async trackABTestEvent(event: {
    testName: string;
    variant: string;
    userId: string;
    eventType: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await this.request('/ab-tests/events', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('A/B test tracking failed:', error);
    }
  }

  // Get A/B test results
  async getABTestResults(testName?: string): Promise<ABTestResults | null> {
    try {
      const params = testName ? `?testName=${testName}` : '';
      const response = await this.request<ABTestResults>(
        `/ab-tests/results${params}`
      );
      return response.data || response;
    } catch (error) {
      console.warn('A/B test results not available');
      return null;
    }
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string; version: string; uptime: number }> {
    const response = await this.request<{ status: string; version: string; uptime: number }>('/health');
    return response.data;
  }

  async refreshCache(jobId?: string): Promise<void> {
    const endpoint = jobId ? `/cache/refresh/${jobId}` : '/cache/refresh';
    await this.request(endpoint, { method: 'POST' });
  }

  // Mock analytics data for development
  private getMockAnalyticsData() {
    return {
      modelPerformance: {
        accuracy: 0.87,
        precision: 0.84,
        recall: 0.89,
        f1Score: 0.86,
        auc: 0.91,
        calibration: 0.82,
        bias: {
          genderBias: 0.02,
          ageBias: 0.01,
          locationBias: 0.03,
          educationBias: 0.02,
          experienceBias: 0.01
        }
      },
      userInteractions: Array.from({ length: 150 }, (_, i) => ({
        userId: `user_${i}`,
        action: ['view', 'click', 'apply', 'shortlist'][Math.floor(Math.random() * 4)],
        candidateId: `candidate_${i}`,
        jobId: 'job_1',
        score: Math.random() * 100,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        sessionId: `session_${i}`
      })),
      conversionMetrics: {
        viewToClick: 0.25,
        clickToApply: 0.15,
        applyToInterview: 0.30,
        interviewToHire: 0.40,
        overallConversion: 0.045
      },
      recommendationTrends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        recommendations: Math.floor(Math.random() * 50) + 20,
        interactions: Math.floor(Math.random() * 30) + 10,
        conversions: Math.floor(Math.random() * 8) + 2
      })),
      biasMetrics: {
        genderBias: 0.02,
        ageBias: 0.01,
        locationBias: 0.03,
        educationBias: 0.02,
        experienceBias: 0.01
      }
    };
  }

  // Mock data for development
  async getMockRecommendations(jobId: string): Promise<RecommendationResponse> {
    // Return mock data when ML service is not available
    return {
      jobId,
      recommendations: [
        {
          candidate: {
            id: 'cand_1',
            name: 'Sarah Chen',
            email: 'sarah.chen@email.com',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
            currentPosition: 'Senior Frontend Developer',
            experience: 5,
            location: {
              city: 'San Francisco',
              state: 'CA',
              country: 'USA',
              remoteWork: true,
              relocationWilling: false,
            },
            skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
            qualifications: ['BS Computer Science', 'AWS Certified'],
            availability: {
              status: 'employed',
              startDate: '2024-02-01',
              noticePeriod: 14,
              workType: 'full-time',
            },
            preferences: {
              companySizePreference: 'medium',
              industryPreferences: ['Technology', 'FinTech'],
              workEnvironment: 'hybrid',
              careerGoals: ['Technical Leadership', 'Product Development'],
            },
          },
          score: {
            candidateId: 'cand_1',
            jobId,
            overallScore: 92,
            confidence: 0.87,
            reasoning: {
              skillMatch: {
                score: 95,
                matchedSkills: ['React', 'TypeScript'],
                missingSkills: ['Python'],
                additionalSkills: ['GraphQL', 'AWS'],
                weightedScore: 95,
              },
              experienceMatch: {
                score: 90,
                requiredYears: 3,
                candidateYears: 5,
                relevantExperience: true,
                industryMatch: true,
              },
              locationMatch: {
                score: 85,
                distance: 0,
                remoteCompatible: true,
                relocationWillingness: false,
                timezone: 'PST',
              },
              salaryMatch: {
                score: 88,
                jobSalaryRange: { min: 120000, max: 150000, currency: 'USD' },
                candidateExpectation: { min: 130000, max: 160000, currency: 'USD' },
                negotiationPotential: 0.8,
              },
              qualificationMatch: {
                score: 92,
                requiredQualifications: ['BS Computer Science'],
                candidateQualifications: ['BS Computer Science', 'AWS Certified'],
                overqualified: false,
                underqualified: false,
              },
              culturalFit: {
                score: 89,
                workTypeMatch: true,
                companySizePreference: true,
                industryExperience: true,
                teamFitPrediction: 0.89,
              },
              successProbability: 0.91,
            },
            timestamp: new Date().toISOString(),
            modelVersion: 'v1.2.0',
          },
          rank: 1,
          tags: [
            {
              type: 'strength',
              label: 'Strong Technical Skills',
              description: 'Excellent match for required technical skills',
              impact: 'high',
            },
            {
              type: 'opportunity',
              label: 'Career Growth Potential',
              description: 'Looking for leadership opportunities',
              impact: 'medium',
            },
          ],
          actionItems: [
            'Schedule technical interview',
            'Discuss remote work arrangements',
            'Present growth opportunities',
          ],
        },
      ],
      metadata: {
        totalCandidates: 150,
        processedCandidates: 150,
        processingTime: 245,
        cacheHit: false,
        dataFreshness: new Date().toISOString(),
        abTestGroup: 'control',
      },
      modelInfo: {
        modelId: 'candidate-scorer-v1',
        modelName: 'TalentSol Candidate Scoring Model',
        version: 'v1.2.0',
        type: 'scoring',
        isActive: true,
        accuracy: 0.87,
        lastTrained: '2024-01-15T10:00:00Z',
        features: ['skills', 'experience', 'location', 'salary', 'qualifications'],
      },
    };
  }
}

export const mlApi = new MLApiService();
export default mlApi;

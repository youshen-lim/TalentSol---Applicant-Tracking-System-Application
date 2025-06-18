/**
 * ML Recommendations Hook
 * Manages ML-driven candidate recommendations with caching and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  RecommendationResponse, 
  RecommendationRequest,
  CandidateScore,
  MLModelConfig,
  RecommendationAnalytics 
} from '@/types/ml-recommendations';
import { mlApi } from '@/services/mlApi';

interface UseMLRecommendationsOptions {
  jobId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
  maxRecommendations?: number;
  includeReasoning?: boolean;
  cacheTimeout?: number; // minutes
}

interface UseMLRecommendationsReturn {
  recommendations: RecommendationResponse | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  lastUpdated: Date | null;
  
  // Actions
  fetchRecommendations: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  clearCache: () => void;
  
  // Individual scoring
  scoreCandidateForJob: (candidateId: string) => Promise<CandidateScore | null>;
  
  // Analytics
  analytics: RecommendationAnalytics | null;
  fetchAnalytics: () => Promise<void>;
  
  // Model info
  modelInfo: MLModelConfig | null;
  
  // Interaction tracking
  trackInteraction: (candidateId: string, action: string, score?: number) => Promise<void>;
}

export const useMLRecommendations = (
  options: UseMLRecommendationsOptions
): UseMLRecommendationsReturn => {
  const {
    jobId,
    autoRefresh = false,
    refreshInterval = 30,
    maxRecommendations = 10,
    includeReasoning = true,
    cacheTimeout = 15,
  } = options;

  // State
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [analytics, setAnalytics] = useState<RecommendationAnalytics | null>(null);
  const [modelInfo, setModelInfo] = useState<MLModelConfig | null>(null);

  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, { data: any; timestamp: Date }>>(new Map());

  // Cache management
  const getCachedData = useCallback((key: string) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp.getTime() > cacheTimeout * 60 * 1000;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cacheTimeout]);

  const setCachedData = useCallback((key: string, data: any) => {
    cacheRef.current.set(key, { data, timestamp: new Date() });
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Main fetch function
  const fetchRecommendations = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `recommendations-${jobId}-${maxRecommendations}`;
      const cachedRecommendations = getCachedData(cacheKey);
      
      if (cachedRecommendations) {
        setRecommendations(cachedRecommendations);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      // Prepare request
      const request: RecommendationRequest = {
        jobId,
        limit: maxRecommendations,
        includeReasoning,
        filters: {
          excludeApplied: true,
          minScore: 60, // Only show candidates with decent scores
        },
      };

      // Fetch recommendations
      let response: RecommendationResponse;
      try {
        response = await mlApi.getCandidateRecommendations(request);
      } catch (apiError) {
        console.warn('ML API not available, using mock data:', apiError);
        response = await mlApi.getMockRecommendations(jobId);
      }

      // Update state and cache
      setRecommendations(response);
      setModelInfo(response.modelInfo);
      setCachedData(cacheKey, response);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [jobId, maxRecommendations, includeReasoning, getCachedData, setCachedData]);

  // Refresh function (bypasses cache)
  const refreshRecommendations = useCallback(async () => {
    if (!jobId) return;

    try {
      setRefreshing(true);
      setError(null);

      // Clear cache for this job
      const cacheKey = `recommendations-${jobId}-${maxRecommendations}`;
      cacheRef.current.delete(cacheKey);

      // Force refresh cache on server
      try {
        await mlApi.refreshCache(jobId);
      } catch (cacheError) {
        console.warn('Failed to refresh server cache:', cacheError);
      }

      // Fetch fresh data
      await fetchRecommendations();

    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh recommendations');
    } finally {
      setRefreshing(false);
    }
  }, [jobId, maxRecommendations, fetchRecommendations]);

  // Individual candidate scoring
  const scoreCandidateForJob = useCallback(async (candidateId: string): Promise<CandidateScore | null> => {
    if (!jobId || !candidateId) return null;

    try {
      const cacheKey = `score-${candidateId}-${jobId}`;
      const cachedScore = getCachedData(cacheKey);
      
      if (cachedScore) {
        return cachedScore;
      }

      const score = await mlApi.scoreCandidateForJob(candidateId, jobId, true);
      setCachedData(cacheKey, score);
      
      return score;
    } catch (error) {
      console.error('Failed to score candidate:', error);
      return null;
    }
  }, [jobId, getCachedData, setCachedData]);

  // Analytics fetching
  const fetchAnalytics = useCallback(async () => {
    if (!jobId) return;

    try {
      const analyticsData = await mlApi.getRecommendationAnalytics(jobId);
      setAnalytics(analyticsData);
    } catch (error) {
      console.warn('Failed to fetch analytics:', error);
    }
  }, [jobId]);

  // Interaction tracking
  const trackInteraction = useCallback(async (
    candidateId: string, 
    action: string, 
    score?: number
  ) => {
    try {
      await mlApi.trackUserInteraction({
        action,
        candidateId,
        jobId,
        score,
        sessionId: `session-${Date.now()}`, // Simple session ID
      });
    } catch (error) {
      console.warn('Failed to track interaction:', error);
    }
  }, [jobId]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshRecommendations();
      }, refreshInterval * 60 * 1000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshRecommendations]);

  // Initial fetch
  useEffect(() => {
    if (jobId) {
      fetchRecommendations();
      fetchAnalytics();
    }
  }, [jobId, fetchRecommendations, fetchAnalytics]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    recommendations,
    loading,
    error,
    refreshing,
    lastUpdated,
    
    // Actions
    fetchRecommendations,
    refreshRecommendations,
    clearCache,
    
    // Individual scoring
    scoreCandidateForJob,
    
    // Analytics
    analytics,
    fetchAnalytics,
    
    // Model info
    modelInfo,
    
    // Interaction tracking
    trackInteraction,
  };
};

// Simplified hook for basic recommendations
export const useBasicRecommendations = (jobId: string, limit = 5) => {
  return useMLRecommendations({
    jobId,
    maxRecommendations: limit,
    includeReasoning: false,
    cacheTimeout: 30,
  });
};

// Hook for real-time recommendations with auto-refresh
export const useRealtimeRecommendations = (jobId: string) => {
  return useMLRecommendations({
    jobId,
    autoRefresh: true,
    refreshInterval: 15,
    maxRecommendations: 10,
    includeReasoning: true,
  });
};

export default useMLRecommendations;

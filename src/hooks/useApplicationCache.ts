import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApplicationWithML } from '@/components/applications/EnhancedApplicationCard';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
}

class ApplicationCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.config = config;
  }

  set<T>(key: string, data: T, customTtl?: number): void {
    const now = Date.now();
    const ttl = customTtl || this.config.ttl;
    
    // Remove expired entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    // If still at max size, remove oldest entries
    if (this.cache.size >= this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.config.maxSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl
    };
  }
}

// Global cache instances
const applicationCache = new ApplicationCache({ ttl: 5 * 60 * 1000, maxSize: 50 });
const mlPredictionCache = new ApplicationCache({ ttl: 10 * 60 * 1000, maxSize: 100 });
const analyticsCache = new ApplicationCache({ ttl: 2 * 60 * 1000, maxSize: 20 });

export const useApplicationCache = () => {
  const [cacheStats, setCacheStats] = useState({
    applications: applicationCache.getStats(),
    mlPredictions: mlPredictionCache.getStats(),
    analytics: analyticsCache.getStats()
  });

  const updateStats = useCallback(() => {
    setCacheStats({
      applications: applicationCache.getStats(),
      mlPredictions: mlPredictionCache.getStats(),
      analytics: analyticsCache.getStats()
    });
  }, []);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [updateStats]);

  const cacheApplications = useCallback((key: string, applications: ApplicationWithML[]) => {
    applicationCache.set(key, applications);
    updateStats();
  }, [updateStats]);

  const getCachedApplications = useCallback((key: string): ApplicationWithML[] | null => {
    return applicationCache.get<ApplicationWithML[]>(key);
  }, []);

  const cacheMLPrediction = useCallback((applicationId: string, prediction: any) => {
    mlPredictionCache.set(`ml_${applicationId}`, prediction, 15 * 60 * 1000); // 15 minutes for ML predictions
    updateStats();
  }, [updateStats]);

  const getCachedMLPrediction = useCallback((applicationId: string) => {
    return mlPredictionCache.get(`ml_${applicationId}`);
  }, []);

  const cacheAnalytics = useCallback((key: string, data: any) => {
    analyticsCache.set(key, data);
    updateStats();
  }, [updateStats]);

  const getCachedAnalytics = useCallback((key: string) => {
    return analyticsCache.get(key);
  }, []);

  const clearAllCaches = useCallback(() => {
    applicationCache.clear();
    mlPredictionCache.clear();
    analyticsCache.clear();
    updateStats();
  }, [updateStats]);

  const clearExpiredEntries = useCallback(() => {
    // Force cleanup of expired entries
    applicationCache.get('__cleanup__'); // Triggers cleanup
    mlPredictionCache.get('__cleanup__');
    analyticsCache.get('__cleanup__');
    updateStats();
  }, [updateStats]);

  return {
    // Application caching
    cacheApplications,
    getCachedApplications,
    
    // ML prediction caching
    cacheMLPrediction,
    getCachedMLPrediction,
    
    // Analytics caching
    cacheAnalytics,
    getCachedAnalytics,
    
    // Cache management
    clearAllCaches,
    clearExpiredEntries,
    cacheStats,
    updateStats
  };
};

// Hook for progressive data loading
export const useProgressiveApplicationLoading = (
  fetchFunction: (page: number, limit: number) => Promise<{ applications: ApplicationWithML[]; hasMore: boolean }>,
  initialLimit: number = 20
) => {
  const [applications, setApplications] = useState<ApplicationWithML[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const { cacheApplications, getCachedApplications } = useApplicationCache();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const cacheKey = `applications_page_${page}_limit_${initialLimit}`;
    const cached = getCachedApplications(cacheKey);
    
    if (cached) {
      setApplications(prev => [...prev, ...cached]);
      setPage(prev => prev + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(page, initialLimit);
      
      // Cache the results
      cacheApplications(cacheKey, result.applications);
      
      setApplications(prev => [...prev, ...result.applications]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [page, initialLimit, loading, hasMore, fetchFunction, cacheApplications, getCachedApplications]);

  const reset = useCallback(() => {
    setApplications([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    reset();
    await loadMore();
  }, [reset, loadMore]);

  // Load initial data
  useEffect(() => {
    if (applications.length === 0 && hasMore) {
      loadMore();
    }
  }, []);

  return {
    applications,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    refresh
  };
};

// Hook for optimized filtering
export const useOptimizedFiltering = <T>(
  items: T[],
  filterFunction: (item: T) => boolean,
  dependencies: any[] = []
) => {
  return useMemo(() => {
    if (!items || items.length === 0) return [];
    return items.filter(filterFunction);
  }, [items, ...dependencies]);
};

// Hook for debounced search
export const useDebouncedSearch = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

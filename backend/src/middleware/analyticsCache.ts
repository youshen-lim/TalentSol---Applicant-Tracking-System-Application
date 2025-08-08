import { Request, Response, NextFunction } from 'express';
import { analyticsCache } from '../cache/AnalyticsCache.js';
import { AuthenticatedRequest } from './auth.js';

export interface AnalyticsCacheOptions {
  strategy?: 'analytics_dashboard' | 'analytics_realtime' | 'analytics_trends' | 'analytics_reports';
  ttl?: number;
  keyGenerator?: (req: AuthenticatedRequest) => string;
  condition?: (req: AuthenticatedRequest) => boolean;
  skipCache?: boolean;
  warmOnMiss?: boolean;
}

/**
 * Analytics cache middleware for automatic caching of analytics endpoints
 */
export function analyticsCacheMiddleware(options: AnalyticsCacheOptions = {}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const {
      strategy = 'analytics_dashboard',
      ttl,
      keyGenerator,
      condition,
      skipCache = false,
      warmOnMiss = true
    } = options;

    // Skip caching if condition is not met
    if (condition && !condition(req)) {
      return next();
    }

    // Skip caching if explicitly disabled
    if (skipCache || req.query.nocache === 'true') {
      return next();
    }

    const companyId = req.user?.companyId || 'comp_1';
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : generateDefaultCacheKey(req, companyId);

    try {
      // Try to get cached data
      const cachedData = await analyticsCache.get(cacheKey, strategy);

      if (cachedData) {
        // Cache hit - return cached data
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-Strategy', strategy);
        
        return res.json({
          success: true,
          data: cachedData,
          timestamp: new Date().toISOString(),
          cached: true,
          cacheKey: process.env.NODE_ENV === 'development' ? cacheKey : undefined
        });
      }

      // Cache miss - continue to route handler
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);
      res.setHeader('X-Cache-Strategy', strategy);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = function(data: any) {
        // Cache the response data if it's successful
        if (data && data.success && data.data) {
          setImmediate(async () => {
            try {
              await analyticsCache.set(cacheKey, data.data, strategy, ttl);
              
              // Warm related cache if enabled
              if (warmOnMiss) {
                await analyticsCache.warmCache(companyId);
              }
            } catch (error) {
              console.error('Error caching analytics response:', error);
            }
          });
        }

        // Add cache headers to response
        data.cached = false;
        data.cacheKey = process.env.NODE_ENV === 'development' ? cacheKey : undefined;

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Analytics cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Cache invalidation middleware for analytics endpoints
 */
export function analyticsCacheInvalidation(triggers: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const companyId = req.user?.companyId || 'comp_1';

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to trigger cache invalidation after successful response
    res.json = function(data: any) {
      // Trigger cache invalidation if response is successful
      if (data && data.success) {
        setImmediate(async () => {
          try {
            for (const trigger of triggers) {
              await analyticsCache.invalidate(trigger, companyId);
            }
          } catch (error) {
            console.error('Error invalidating analytics cache:', error);
          }
        });
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Cache warming middleware for preloading analytics data
 */
export function analyticsCacheWarming() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const companyId = req.user?.companyId || 'comp_1';

    // Trigger cache warming in background
    setImmediate(async () => {
      try {
        await analyticsCache.warmCache(companyId);
      } catch (error) {
        console.error('Error warming analytics cache:', error);
      }
    });

    next();
  };
}

/**
 * Cache metrics middleware for monitoring cache performance
 */
export function analyticsCacheMetrics() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/cache-metrics') {
      const metrics = analyticsCache.getCacheMetrics();
      const summary = analyticsCache.getCachePerformanceSummary();

      return res.json({
        success: true,
        data: {
          summary,
          strategies: Object.fromEntries(metrics),
          timestamp: new Date().toISOString()
        },
        message: 'Analytics cache metrics retrieved successfully'
      });
    }

    return next();
  };
}

/**
 * Generate default cache key for analytics endpoints
 */
function generateDefaultCacheKey(req: AuthenticatedRequest, companyId: string): string {
  const path = req.path.replace(/^\/api\//, '').replace(/\//g, ':');
  const queryParams = new URLSearchParams();
  
  // Include relevant query parameters in cache key
  const relevantParams = ['timeframe', 'period', 'limit', 'offset', 'filter', 'sort'];
  
  for (const param of relevantParams) {
    if (req.query[param]) {
      queryParams.set(param, String(req.query[param]));
    }
  }

  const queryString = queryParams.toString();
  const baseKey = `analytics:${path}:${companyId}`;
  
  return queryString ? `${baseKey}:${queryString}` : baseKey;
}

/**
 * Cache key generators for specific analytics endpoints
 */
export const cacheKeyGenerators = {
  dashboard: (req: AuthenticatedRequest): string => {
    const companyId = req.user?.companyId || 'comp_1';
    const timeframe = req.query.timeframe || 'week';
    return `analytics:dashboard:${companyId}:${timeframe}`;
  },

  realtimeMetrics: (req: AuthenticatedRequest): string => {
    const companyId = req.user?.companyId || 'comp_1';
    return `analytics:realtime:${companyId}:${Date.now()}`;
  },

  trends: (req: AuthenticatedRequest): string => {
    const companyId = req.user?.companyId || 'comp_1';
    const period = req.query.period || 'month';
    const metric = req.query.metric || 'applications';
    return `analytics:trends:${companyId}:${period}:${metric}`;
  },

  reports: (req: AuthenticatedRequest): string => {
    const companyId = req.user?.companyId || 'comp_1';
    const reportType = req.query.type || 'summary';
    const dateRange = req.query.dateRange || 'month';
    return `analytics:reports:${companyId}:${reportType}:${dateRange}`;
  }
};

/**
 * Cache conditions for different scenarios
 */
export const cacheConditions = {
  // Only cache for authenticated users
  authenticated: (req: AuthenticatedRequest): boolean => {
    return !!req.user;
  },

  // Only cache during business hours (optional optimization)
  businessHours: (req: AuthenticatedRequest): boolean => {
    const hour = new Date().getHours();
    return hour >= 8 && hour <= 18; // 8 AM to 6 PM
  },

  // Only cache for specific company sizes (if needed)
  largeCompany: (req: AuthenticatedRequest): boolean => {
    // This would check company size from database
    return true; // Placeholder
  },

  // Skip cache for real-time requests
  notRealtime: (req: AuthenticatedRequest): boolean => {
    return req.query.realtime !== 'true';
  }
};

/**
 * Predefined cache configurations for common analytics endpoints
 */
export const analyticsCacheConfigs = {
  dashboard: {
    strategy: 'analytics_dashboard' as const,
    ttl: 900, // 15 minutes
    keyGenerator: cacheKeyGenerators.dashboard,
    condition: cacheConditions.authenticated,
    warmOnMiss: true
  },

  realtimeMetrics: {
    strategy: 'analytics_realtime' as const,
    ttl: 30, // 30 seconds
    keyGenerator: cacheKeyGenerators.realtimeMetrics,
    condition: cacheConditions.authenticated,
    warmOnMiss: false
  },

  trends: {
    strategy: 'analytics_trends' as const,
    ttl: 1800, // 30 minutes
    keyGenerator: cacheKeyGenerators.trends,
    condition: cacheConditions.authenticated,
    warmOnMiss: true
  },

  reports: {
    strategy: 'analytics_reports' as const,
    ttl: 3600, // 1 hour
    keyGenerator: cacheKeyGenerators.reports,
    condition: cacheConditions.authenticated,
    warmOnMiss: false
  }
};

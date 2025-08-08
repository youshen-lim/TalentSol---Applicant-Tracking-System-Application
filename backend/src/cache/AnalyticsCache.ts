import { cacheManager } from './CacheManager.js';
import { redisClient } from './RedisClient.js';
import { QueryCache } from './QueryCache.js';

export interface AnalyticsCacheConfig {
  dashboardTTL: number;
  realtimeMetricsTTL: number;
  trendDataTTL: number;
  reportCacheTTL: number;
  warmupEnabled: boolean;
  invalidationEnabled: boolean;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

export interface CacheInvalidationRule {
  pattern: string;
  triggers: string[];
  companySpecific: boolean;
}

export class AnalyticsCache {
  private static instance: AnalyticsCache;
  private config: AnalyticsCacheConfig;
  private metrics: Map<string, CacheMetrics> = new Map();
  private invalidationRules: CacheInvalidationRule[] = [];

  private constructor() {
    this.config = {
      dashboardTTL: parseInt(process.env.ANALYTICS_DASHBOARD_TTL || '900'), // 15 minutes
      realtimeMetricsTTL: parseInt(process.env.ANALYTICS_REALTIME_TTL || '30'), // 30 seconds
      trendDataTTL: parseInt(process.env.ANALYTICS_TRENDS_TTL || '1800'), // 30 minutes
      reportCacheTTL: parseInt(process.env.ANALYTICS_REPORTS_TTL || '3600'), // 1 hour
      warmupEnabled: process.env.ANALYTICS_CACHE_WARMUP === 'true',
      invalidationEnabled: process.env.ANALYTICS_CACHE_INVALIDATION !== 'false'
    };

    this.initializeInvalidationRules();
    this.initializeAnalyticsStrategies();
  }

  public static getInstance(): AnalyticsCache {
    if (!AnalyticsCache.instance) {
      AnalyticsCache.instance = new AnalyticsCache();
    }
    return AnalyticsCache.instance;
  }

  /**
   * Initialize analytics-specific cache strategies
   */
  private initializeAnalyticsStrategies(): void {
    // Enhanced dashboard cache strategy
    cacheManager.setStrategy({
      name: 'analytics_dashboard',
      ttl: this.config.dashboardTTL,
      pattern: 'analytics:dashboard:*',
      tags: ['analytics', 'dashboard', 'metrics']
    });

    // Real-time metrics cache strategy
    cacheManager.setStrategy({
      name: 'analytics_realtime',
      ttl: this.config.realtimeMetricsTTL,
      pattern: 'analytics:realtime:*',
      tags: ['analytics', 'realtime', 'live']
    });

    // Trend data cache strategy
    cacheManager.setStrategy({
      name: 'analytics_trends',
      ttl: this.config.trendDataTTL,
      pattern: 'analytics:trends:*',
      tags: ['analytics', 'trends', 'historical']
    });

    // Report cache strategy
    cacheManager.setStrategy({
      name: 'analytics_reports',
      ttl: this.config.reportCacheTTL,
      pattern: 'analytics:reports:*',
      tags: ['analytics', 'reports', 'exports']
    });

    console.log('✅ Analytics cache strategies initialized');
  }

  /**
   * Initialize cache invalidation rules
   */
  private initializeInvalidationRules(): void {
    this.invalidationRules = [
      {
        pattern: 'analytics:dashboard:*',
        triggers: ['application_created', 'application_updated', 'interview_scheduled'],
        companySpecific: true
      },
      {
        pattern: 'analytics:realtime:*',
        triggers: ['application_status_changed', 'ml_processing_completed'],
        companySpecific: true
      },
      {
        pattern: 'analytics:trends:*',
        triggers: ['application_created', 'interview_completed', 'hire_completed'],
        companySpecific: true
      }
    ];
  }

  /**
   * Get cached analytics data with performance tracking
   */
  public async get<T>(key: string, strategyName: string = 'analytics_dashboard'): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const cache = cacheManager.getCache(strategyName);
      if (!cache) {
        console.warn(`Cache strategy ${strategyName} not found`);
        return null;
      }

      const result = await cache.get<T>(key);
      const responseTime = Date.now() - startTime;

      // Update metrics
      this.updateMetrics(strategyName, result !== null, responseTime);

      if (result) {
        console.log(`📊 Cache HIT: ${key} (${responseTime}ms)`);
      } else {
        console.log(`📊 Cache MISS: ${key} (${responseTime}ms)`);
      }

      return result;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached analytics data with automatic invalidation setup
   */
  public async set<T>(
    key: string, 
    value: T, 
    strategyName: string = 'analytics_dashboard',
    customTTL?: number
  ): Promise<boolean> {
    try {
      const cache = cacheManager.getCache(strategyName);
      if (!cache) {
        console.warn(`Cache strategy ${strategyName} not found`);
        return false;
      }

      const ttl = customTTL || this.getTTLForStrategy(strategyName);
      const success = await cache.set(key, value as any, { ttl });

      if (success) {
        console.log(`📊 Cache SET: ${key} (TTL: ${ttl}s)`);
      }

      return success;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache based on triggers
   */
  public async invalidate(trigger: string, companyId?: string): Promise<void> {
    if (!this.config.invalidationEnabled) {
      return;
    }

    try {
      console.log(`🔄 Cache invalidation triggered: ${trigger} (company: ${companyId || 'all'})`);

      for (const rule of this.invalidationRules) {
        if (rule.triggers.includes(trigger)) {
          const pattern = rule.companySpecific && companyId 
            ? rule.pattern.replace('*', `${companyId}:*`)
            : rule.pattern;

          await this.invalidateByPattern(pattern);
        }
      }
    } catch (error) {
      console.error(`Cache invalidation error for trigger ${trigger}:`, error);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  private async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await Promise.all(keys.map(key => redisClient.del(key)));
        console.log(`🗑️ Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error(`Pattern invalidation error for ${pattern}:`, error);
    }
  }

  /**
   * Warm analytics cache for a company
   */
  public async warmCache(companyId: string): Promise<void> {
    if (!this.config.warmupEnabled) {
      return;
    }

    try {
      console.log(`🔥 Warming analytics cache for company: ${companyId}`);

      // Warm dashboard metrics
      await this.warmDashboardMetrics(companyId);
      
      // Warm real-time metrics
      await this.warmRealtimeMetrics(companyId);
      
      // Warm trend data
      await this.warmTrendData(companyId);

      console.log(`✅ Analytics cache warmed for company: ${companyId}`);
    } catch (error) {
      console.error(`Cache warming error for company ${companyId}:`, error);
    }
  }

  /**
   * Get cache metrics for monitoring
   */
  public getCacheMetrics(): Map<string, CacheMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get cache performance summary
   */
  public getCachePerformanceSummary(): {
    totalHitRate: number;
    totalRequests: number;
    averageResponseTime: number;
    strategiesCount: number;
  } {
    const allMetrics = Array.from(this.metrics.values());
    
    if (allMetrics.length === 0) {
      return {
        totalHitRate: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        strategiesCount: 0
      };
    }

    const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalHits = allMetrics.reduce((sum, m) => sum + (m.totalRequests * m.hitRate / 100), 0);
    const totalResponseTime = allMetrics.reduce((sum, m) => sum + (m.averageResponseTime * m.totalRequests), 0);

    return {
      totalHitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      totalRequests,
      averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      strategiesCount: allMetrics.length
    };
  }

  /**
   * Update cache metrics
   */
  private updateMetrics(strategyName: string, isHit: boolean, responseTime: number): void {
    const existing = this.metrics.get(strategyName) || {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      cacheSize: 0,
      averageResponseTime: 0,
      lastUpdated: new Date()
    };

    existing.totalRequests++;
    
    if (isHit) {
      existing.hitRate = ((existing.hitRate * (existing.totalRequests - 1)) + 100) / existing.totalRequests;
    } else {
      existing.missRate = ((existing.missRate * (existing.totalRequests - 1)) + 100) / existing.totalRequests;
    }

    existing.averageResponseTime = ((existing.averageResponseTime * (existing.totalRequests - 1)) + responseTime) / existing.totalRequests;
    existing.lastUpdated = new Date();

    this.metrics.set(strategyName, existing);
  }

  /**
   * Get TTL for strategy
   */
  private getTTLForStrategy(strategyName: string): number {
    switch (strategyName) {
      case 'analytics_dashboard': return this.config.dashboardTTL;
      case 'analytics_realtime': return this.config.realtimeMetricsTTL;
      case 'analytics_trends': return this.config.trendDataTTL;
      case 'analytics_reports': return this.config.reportCacheTTL;
      default: return this.config.dashboardTTL;
    }
  }

  /**
   * Warm dashboard metrics (placeholder - would integrate with actual analytics service)
   */
  private async warmDashboardMetrics(companyId: string): Promise<void> {
    // This would call the actual analytics service to pre-populate cache
    console.log(`🔥 Warming dashboard metrics for company: ${companyId}`);
  }

  /**
   * Warm real-time metrics (placeholder)
   */
  private async warmRealtimeMetrics(companyId: string): Promise<void> {
    console.log(`🔥 Warming real-time metrics for company: ${companyId}`);
  }

  /**
   * Warm trend data (placeholder)
   */
  private async warmTrendData(companyId: string): Promise<void> {
    console.log(`🔥 Warming trend data for company: ${companyId}`);
  }
}

// Export singleton instance
export const analyticsCache = AnalyticsCache.getInstance();

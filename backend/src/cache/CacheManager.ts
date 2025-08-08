import { QueryCache } from './QueryCache.js';
import { redisClient } from './RedisClient.js';

export interface CacheStrategy {
  name: string;
  ttl: number;
  pattern: string;
  tags?: string[];
}

export interface CacheWarmupConfig {
  enabled: boolean;
  strategies: string[];
  schedule?: string; // Cron expression for scheduled warmup
}

export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, QueryCache> = new Map();
  private strategies: Map<string, CacheStrategy> = new Map();

  private constructor() {
    this.initializeStrategies();
    this.initializeCaches();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Initialize cache strategies
   */
  private initializeStrategies(): void {
    const strategies: CacheStrategy[] = [
      {
        name: 'application_cache',
        ttl: 3600, // 1 hour
        pattern: 'app:*',
        tags: ['applications', 'general'],
      },
      {
        name: 'session_cache',
        ttl: 86400, // 24 hours
        pattern: 'session:*',
        tags: ['sessions', 'auth'],
      },
      {
        name: 'query_cache',
        ttl: 1800, // 30 minutes
        pattern: 'query:*',
        tags: ['database', 'queries'],
      },
      {
        name: 'ai_analysis_cache',
        ttl: 7200, // 2 hours
        pattern: 'ai:*',
        tags: ['ai', 'ml', 'analysis'],
      },
      {
        name: 'dashboard_cache',
        ttl: 900, // 15 minutes
        pattern: 'dashboard:*',
        tags: ['dashboard', 'analytics'],
      },
      {
        name: 'job_listings_cache',
        ttl: 1800, // 30 minutes
        pattern: 'jobs:*',
        tags: ['jobs', 'listings'],
      },
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  /**
   * Initialize cache instances
   */
  private initializeCaches(): void {
    this.strategies.forEach((strategy, name) => {
      const cache = new QueryCache(name, strategy.ttl);
      this.caches.set(name, cache);
    });
  }

  /**
   * Get cache instance by strategy name
   */
  public getCache(strategyName: string): QueryCache | null {
    return this.caches.get(strategyName) || null;
  }

  /**
   * Get or create cache instance
   */
  public getOrCreateCache(strategyName: string, ttl?: number): QueryCache {
    let cache = this.caches.get(strategyName);
    
    if (!cache) {
      cache = new QueryCache(strategyName, ttl || 1800);
      this.caches.set(strategyName, cache);
    }
    
    return cache;
  }

  /**
   * Invalidate cache by application context
   */
  public async invalidateApplicationCache(applicationId: string): Promise<void> {
    const patterns = [
      `*application*${applicationId}*`,
      'dashboard:*',
      'analytics:*',
      `ai:*${applicationId}*`,
      'query:*applications*',
    ];

    for (const pattern of patterns) {
      await this.invalidateByPattern(pattern);
    }
  }

  /**
   * Invalidate cache by job context
   */
  public async invalidateJobCache(jobId: string): Promise<void> {
    const patterns = [
      `*job*${jobId}*`,
      'jobs:*',
      'dashboard:*',
      'analytics:*',
    ];

    for (const pattern of patterns) {
      await this.invalidateByPattern(pattern);
    }
  }

  /**
   * Invalidate cache by candidate context
   */
  public async invalidateCandidateCache(candidateId: string): Promise<void> {
    const patterns = [
      `*candidate*${candidateId}*`,
      'dashboard:*',
      'analytics:*',
      `ai:*${candidateId}*`,
    ];

    for (const pattern of patterns) {
      await this.invalidateByPattern(pattern);
    }
  }

  /**
   * Invalidate cache by company context
   */
  public async invalidateCompanyCache(companyId: string): Promise<void> {
    const patterns = [
      `*company*${companyId}*`,
      'dashboard:*',
      'analytics:*',
      'jobs:*',
    ];

    for (const pattern of patterns) {
      await this.invalidateByPattern(pattern);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  private async invalidateByPattern(pattern: string): Promise<number> {
    try {
      return await redisClient.deletePattern(pattern);
    } catch (error) {
      console.warn(`Failed to invalidate cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  public async invalidateByTags(tags: string[]): Promise<number> {
    let totalDeleted = 0;
    
    for (const cache of this.caches.values()) {
      const deleted = await cache.invalidateByTags(tags);
      totalDeleted += deleted;
    }
    
    return totalDeleted;
  }

  /**
   * Warm dashboard cache
   */
  public async warmDashboardCache(companyId: string): Promise<void> {
    try {
      console.log(`Warming dashboard cache for company ${companyId}...`);
      
      // This would typically call your analytics service
      // For now, we'll create a placeholder implementation
      const dashboardCache = this.getCache('dashboard_cache');
      
      if (dashboardCache) {
        // Warm key metrics
        await this.warmKeyMetrics(dashboardCache, companyId);
        
        // Warm recent activities
        await this.warmRecentActivities(dashboardCache, companyId);
        
        // Warm chart data
        await this.warmChartData(dashboardCache, companyId);
      }
      
      console.log(`✅ Dashboard cache warmed for company ${companyId}`);
    } catch (error) {
      console.error(`Failed to warm dashboard cache for company ${companyId}:`, error);
    }
  }

  /**
   * Warm key metrics cache
   */
  private async warmKeyMetrics(cache: QueryCache, companyId: string): Promise<void> {
    const metrics = [
      'total_applications',
      'new_applications',
      'conversion_rate',
      'average_score',
    ];

    for (const metric of metrics) {
      // Placeholder data - in real implementation, this would fetch from database
      const mockData = {
        value: Math.floor(Math.random() * 1000),
        change: Math.floor(Math.random() * 20) - 10,
        timestamp: new Date().toISOString(),
      };

      await cache.set(
        `dashboard_metrics_${metric}`,
        { companyId },
        mockData,
        { ttl: 900, tags: ['dashboard', 'metrics'] }
      );
    }
  }

  /**
   * Warm recent activities cache
   */
  private async warmRecentActivities(cache: QueryCache, companyId: string): Promise<void> {
    // Placeholder data - in real implementation, this would fetch from database
    const mockActivities = Array.from({ length: 10 }, (_, i) => ({
      id: `activity_${i}`,
      type: 'application_submitted',
      candidateName: `Candidate ${i}`,
      jobTitle: `Job ${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    await cache.set(
      'dashboard_recent_activities',
      { companyId },
      mockActivities,
      { ttl: 600, tags: ['dashboard', 'activities'] }
    );
  }

  /**
   * Warm chart data cache
   */
  private async warmChartData(cache: QueryCache, companyId: string): Promise<void> {
    const charts = ['applications_by_date', 'applications_by_status', 'source_distribution'];

    for (const chart of charts) {
      // Placeholder data - in real implementation, this would fetch from database
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 50),
      }));

      await cache.set(
        `dashboard_chart_${chart}`,
        { companyId },
        mockData,
        { ttl: 1800, tags: ['dashboard', 'charts'] }
      );
    }
  }

  /**
   * Get cache statistics for all caches
   */
  public getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.caches.forEach((cache, name) => {
      stats[name] = cache.getStats();
    });
    
    return stats;
  }

  /**
   * Clear all caches
   */
  public async clearAllCaches(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    
    for (const [name, cache] of this.caches) {
      results[name] = await cache.clear();
    }
    
    return results;
  }

  /**
   * Health check for cache system
   */
  public async healthCheck(): Promise<{
    redis: any;
    caches: Record<string, any>;
    strategies: string[];
  }> {
    const redisHealth = await redisClient.healthCheck();
    const cacheStats = this.getAllStats();
    const strategyNames = Array.from(this.strategies.keys());

    return {
      redis: redisHealth,
      caches: cacheStats,
      strategies: strategyNames,
    };
  }

  /**
   * Get cache strategy configuration
   */
  public getStrategy(name: string): CacheStrategy | null {
    return this.strategies.get(name) || null;
  }

  /**
   * Add or update cache strategy
   */
  public setStrategy(strategy: CacheStrategy): void {
    this.strategies.set(strategy.name, strategy);

    // Create or update cache instance
    const cache = new QueryCache(strategy.name, strategy.ttl);
    this.caches.set(strategy.name, cache);
  }

  /**
   * Get cache statistics for monitoring
   */
  public getStats(): {
    strategiesCount: number;
    cachesCount: number;
    redisConnected: boolean;
  } {
    return {
      strategiesCount: this.strategies.size,
      cachesCount: this.caches.size,
      redisConnected: redisClient?.isRedisConnected() || false
    };
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

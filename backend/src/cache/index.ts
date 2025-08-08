// Cache module exports
export { RedisClient, redisClient } from './RedisClient.js';
export { QueryCache, queryCache } from './QueryCache.js';
export { CacheManager, cacheManager } from './CacheManager.js';

// Import instances for internal use
import { redisClient } from './RedisClient.js';
import { cacheManager } from './CacheManager.js';
export {
  Cached,
  InvalidateCache,
  CacheInvalidation,
  warmCache,
  conditionalCache,
  BatchCacheOperations,
} from './decorators.js';

// Type exports
export type { CacheConfig } from './RedisClient.js';
export type { CacheOptions, QueryCacheStats } from './QueryCache.js';
export type { CacheStrategy, CacheWarmupConfig } from './CacheManager.js';
export type { CacheDecoratorOptions } from './decorators.js';

// Cache initialization function
export async function initializeCache(): Promise<void> {
  try {
    console.log('🔄 Initializing cache system...');

    // Test Redis connection with fallback
    try {
      if (redisClient) {
        const redisHealth = await redisClient.healthCheck();

        if (redisHealth.redis) {
          console.log('✅ Redis cache system initialized successfully');
        } else {
          console.log('⚠️ Redis unavailable, using in-memory fallback cache');
        }
      } else {
        console.log('⚠️ Redis client not available, using fallback cache');
      }
    } catch (redisError: any) {
      console.log('⚠️ Failed to initialize Redis, using in-memory cache:', redisError?.message || 'Unknown error');
    }

    // Initialize cache manager
    try {
      if (cacheManager) {
        const cacheHealth = await cacheManager.healthCheck();
        console.log(`✅ Cache manager initialized with ${cacheHealth.strategies.length} strategies`);
      } else {
        console.log('⚠️ Cache manager not available, using basic caching');
      }
    } catch (cacheError: any) {
      console.log('⚠️ Cache manager using fallback mode:', cacheError?.message || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Failed to initialize cache system:', error);
    // Don't throw error - allow server to start without cache
    console.log('⚠️ Server will continue without advanced caching');
  }
}

// Cache cleanup function
export async function cleanupCache(): Promise<void> {
  try {
    console.log('🔄 Cleaning up cache system...');
    try {
      if (redisClient) {
        await redisClient.disconnect();
        console.log('✅ Cache system cleaned up successfully');
      } else {
        console.log('⚠️ Redis client not available for cleanup');
      }
    } catch (redisError: any) {
      console.log('⚠️ Redis cleanup skipped:', redisError?.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error during cache cleanup:', error);
  }
}

// Cache health check function
export async function getCacheHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: any;
}> {
  try {
    if (!cacheManager) {
      return {
        status: 'unhealthy',
        details: { error: 'Cache manager not available' },
      };
    }

    const health = await cacheManager.healthCheck();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (!health.redis.redis && !health.redis.fallback) {
      status = 'unhealthy';
    } else if (!health.redis.redis) {
      status = 'degraded';
    }

    return {
      status,
      details: health,
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      details: { error: error?.message || 'Unknown error' },
    };
  }
}

// Cache metrics function
export function getCacheMetrics(): {
  strategies: string[];
  stats: Record<string, any>;
  config: any;
} {
  try {
    if (!cacheManager || !redisClient) {
      return {
        strategies: [],
        stats: {},
        config: {},
      };
    }

    const allStats = cacheManager.getAllStats();
    return {
      strategies: Object.keys(allStats),
      stats: allStats,
      config: redisClient.getConfig(),
    };
  } catch (error) {
    console.error('Error getting cache metrics:', error);
    return {
      strategies: [],
      stats: {},
      config: {},
    };
  }
}

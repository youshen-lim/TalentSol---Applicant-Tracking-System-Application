// Cache module exports
export { RedisClient, redisClient } from './RedisClient.js';
export { QueryCache, queryCache } from './QueryCache.js';
export { CacheManager, cacheManager } from './CacheManager.js';
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
    
    // Test Redis connection
    const redisHealth = await redisClient.healthCheck();
    
    if (redisHealth.redis) {
      console.log('✅ Redis cache system initialized successfully');
    } else {
      console.log('⚠️ Redis unavailable, using in-memory fallback cache');
    }
    
    // Initialize cache manager
    const cacheHealth = await cacheManager.healthCheck();
    console.log(`✅ Cache manager initialized with ${cacheHealth.strategies.length} strategies`);
    
  } catch (error) {
    console.error('❌ Failed to initialize cache system:', error);
    throw error;
  }
}

// Cache cleanup function
export async function cleanupCache(): Promise<void> {
  try {
    console.log('🔄 Cleaning up cache system...');
    await redisClient.disconnect();
    console.log('✅ Cache system cleaned up successfully');
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
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { error: error.message },
    };
  }
}

// Cache metrics function
export function getCacheMetrics(): {
  strategies: string[];
  stats: Record<string, any>;
  config: any;
} {
  return {
    strategies: Array.from(cacheManager.getAllStats()),
    stats: cacheManager.getAllStats(),
    config: redisClient.getConfig(),
  };
}

import { cacheManager } from './CacheManager.js';
import { CacheOptions } from './QueryCache.js';

export interface CacheDecoratorOptions extends CacheOptions {
  strategy?: string;
  keyGenerator?: (...args: any[]) => string;
  condition?: (...args: any[]) => boolean;
  invalidateOn?: string[]; // Method names that should invalidate this cache
}

/**
 * Method decorator for caching function results
 */
export function Cached(options: CacheDecoratorOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const strategy = options.strategy || 'query_cache';
    
    descriptor.value = async function (...args: any[]) {
      // Check condition if provided
      if (options.condition && !options.condition.apply(this, args)) {
        return originalMethod.apply(this, args);
      }

      const cache = cacheManager.getOrCreateCache(strategy, options.ttl);
      
      // Generate cache key
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator.apply(this, args)
        : `${target.constructor.name}.${propertyKey}`;
      
      const cacheParams = options.keyGenerator 
        ? {} 
        : { method: propertyKey, args: JSON.stringify(args) };

      try {
        // Try to get from cache first
        const cached = await cache.get(cacheKey, cacheParams, options);
        if (cached !== null) {
          return cached;
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);
        
        // Cache the result
        await cache.set(cacheKey, cacheParams, result, options);
        
        return result;
      } catch (error) {
        console.warn(`Cache error in ${target.constructor.name}.${propertyKey}:`, error);
        // Fallback to original method
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Method decorator for cache invalidation
 */
export function InvalidateCache(options: {
  strategies?: string[];
  patterns?: string[];
  tags?: string[];
  methods?: string[]; // Other method caches to invalidate
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        // Execute original method first
        const result = await originalMethod.apply(this, args);
        
        // Invalidate caches after successful execution
        await invalidateCaches(options, target.constructor.name, args);
        
        return result;
      } catch (error) {
        // Don't invalidate cache if method failed
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Class decorator for automatic cache invalidation setup
 */
export function CacheInvalidation(config: {
  entityType: 'application' | 'job' | 'candidate' | 'company';
  idExtractor?: (args: any[]) => string;
}) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      async invalidateEntityCache(entityId: string) {
        switch (config.entityType) {
          case 'application':
            await cacheManager.invalidateApplicationCache(entityId);
            break;
          case 'job':
            await cacheManager.invalidateJobCache(entityId);
            break;
          case 'candidate':
            await cacheManager.invalidateCandidateCache(entityId);
            break;
          case 'company':
            await cacheManager.invalidateCompanyCache(entityId);
            break;
        }
      }
    };
  };
}

/**
 * Helper function to invalidate caches
 */
async function invalidateCaches(
  options: {
    strategies?: string[];
    patterns?: string[];
    tags?: string[];
    methods?: string[];
  },
  className: string,
  args: any[]
): Promise<void> {
  try {
    // Invalidate by strategies
    if (options.strategies) {
      for (const strategy of options.strategies) {
        const cache = cacheManager.getCache(strategy);
        if (cache) {
          await cache.clear();
        }
      }
    }

    // Invalidate by patterns
    if (options.patterns) {
      for (const pattern of options.patterns) {
        await cacheManager.invalidateByTags([pattern]);
      }
    }

    // Invalidate by tags
    if (options.tags) {
      await cacheManager.invalidateByTags(options.tags);
    }

    // Invalidate specific method caches
    if (options.methods) {
      for (const method of options.methods) {
        const cache = cacheManager.getOrCreateCache('query_cache');
        await cache.invalidateByPattern(`*${className}.${method}*`);
      }
    }
  } catch (error) {
    console.warn('Error during cache invalidation:', error);
  }
}

/**
 * Utility function for manual cache warming
 */
export async function warmCache<T>(
  strategy: string,
  key: string,
  params: Record<string, any>,
  dataProvider: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cache = cacheManager.getOrCreateCache(strategy, options.ttl);
  
  try {
    // Check if already cached
    const cached = await cache.get<T>(key, params, options);
    if (cached !== null) {
      return cached;
    }

    // Generate data and cache it
    const data = await dataProvider();
    await cache.set(key, params, data, options);
    
    return data;
  } catch (error) {
    console.warn(`Error warming cache for ${key}:`, error);
    // Fallback to data provider
    return dataProvider();
  }
}

/**
 * Utility function for conditional caching
 */
export async function conditionalCache<T>(
  condition: boolean,
  strategy: string,
  key: string,
  params: Record<string, any>,
  dataProvider: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  if (!condition) {
    return dataProvider();
  }

  return warmCache(strategy, key, params, dataProvider, options);
}

/**
 * Batch cache operations
 */
export class BatchCacheOperations {
  private operations: Array<{
    type: 'set' | 'delete' | 'invalidate';
    strategy: string;
    key: string;
    params?: Record<string, any>;
    data?: any;
    options?: CacheOptions;
  }> = [];

  set<T>(
    strategy: string,
    key: string,
    params: Record<string, any>,
    data: T,
    options: CacheOptions = {}
  ): this {
    this.operations.push({
      type: 'set',
      strategy,
      key,
      params,
      data,
      options,
    });
    return this;
  }

  delete(strategy: string, key: string, params: Record<string, any> = {}): this {
    this.operations.push({
      type: 'delete',
      strategy,
      key,
      params,
    });
    return this;
  }

  invalidate(strategy: string, pattern: string): this {
    this.operations.push({
      type: 'invalidate',
      strategy,
      key: pattern,
    });
    return this;
  }

  async execute(): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const operation of this.operations) {
      try {
        const cache = cacheManager.getOrCreateCache(operation.strategy);
        
        switch (operation.type) {
          case 'set':
            await cache.set(
              operation.key,
              operation.params || {},
              operation.data,
              operation.options || {}
            );
            break;
          case 'delete':
            await cache.delete(operation.key, operation.params || {});
            break;
          case 'invalidate':
            await cache.invalidateByPattern(operation.key);
            break;
        }
        
        success++;
      } catch (error) {
        console.warn(`Batch cache operation failed:`, error);
        failed++;
      }
    }

    // Clear operations after execution
    this.operations = [];

    return { success, failed };
  }

  clear(): this {
    this.operations = [];
    return this;
  }

  getOperationCount(): number {
    return this.operations.length;
  }
}

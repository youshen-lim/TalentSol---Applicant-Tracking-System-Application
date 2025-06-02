import { redisClient } from './RedisClient.js';
import crypto from 'crypto';

export interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
  tags?: string[];
  skipCache?: boolean;
}

export interface QueryCacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

export class QueryCache {
  private stats: QueryCacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };

  private defaultTTL: number;
  private keyPrefix: string;

  constructor(keyPrefix: string = 'query', defaultTTL: number = 1800) {
    this.keyPrefix = keyPrefix;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Generate a cache key from query and parameters
   */
  private generateCacheKey(
    query: string, 
    params: Record<string, any> = {}, 
    options: CacheOptions = {}
  ): string {
    const prefix = options.keyPrefix || this.keyPrefix;
    const normalizedParams = this.normalizeParams(params);
    const combined = `${query}:${JSON.stringify(normalizedParams)}`;
    const hash = crypto.createHash('md5').update(combined).digest('hex');
    return `${prefix}:${hash}`;
  }

  /**
   * Normalize parameters for consistent cache keys
   */
  private normalizeParams(params: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
    
    // Sort keys and handle special values
    Object.keys(params)
      .sort()
      .forEach(key => {
        const value = params[key];
        if (value instanceof Date) {
          normalized[key] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          normalized[key] = this.normalizeParams(value);
        } else {
          normalized[key] = value;
        }
      });
    
    return normalized;
  }

  /**
   * Get cached result
   */
  async get<T = any>(
    query: string, 
    params: Record<string, any> = {}, 
    options: CacheOptions = {}
  ): Promise<T | null> {
    if (options.skipCache) {
      return null;
    }

    try {
      const key = this.generateCacheKey(query, params, options);
      const cached = await redisClient.get(key);
      
      if (cached) {
        this.stats.hits++;
        this.updateHitRate();
        return JSON.parse(cached) as T;
      } else {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }
    } catch (error) {
      console.warn('Cache GET error:', error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set cache result
   */
  async set<T = any>(
    query: string, 
    params: Record<string, any> = {}, 
    result: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (options.skipCache) {
      return false;
    }

    try {
      const key = this.generateCacheKey(query, params, options);
      const ttl = options.ttl || this.defaultTTL;
      const serialized = JSON.stringify(result);
      
      const success = await redisClient.set(key, serialized, ttl);
      
      if (success) {
        this.stats.sets++;
        
        // Store tags for cache invalidation
        if (options.tags && options.tags.length > 0) {
          await this.storeTags(key, options.tags, ttl);
        }
      }
      
      return success;
    } catch (error) {
      console.warn('Cache SET error:', error);
      return false;
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(
    query: string, 
    params: Record<string, any> = {}, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const key = this.generateCacheKey(query, params, options);
      const success = await redisClient.del(key);
      
      if (success) {
        this.stats.deletes++;
      }
      
      return success;
    } catch (error) {
      console.warn('Cache DELETE error:', error);
      return false;
    }
  }

  /**
   * Store tags for cache invalidation
   */
  private async storeTags(cacheKey: string, tags: string[], ttl: number): Promise<void> {
    try {
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const taggedKeys = await redisClient.get(tagKey);
        const keys = taggedKeys ? JSON.parse(taggedKeys) : [];
        
        if (!keys.includes(cacheKey)) {
          keys.push(cacheKey);
          await redisClient.set(tagKey, JSON.stringify(keys), ttl + 300); // Tags live slightly longer
        }
      }
    } catch (error) {
      console.warn('Error storing cache tags:', error);
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let deletedCount = 0;
    
    try {
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const taggedKeys = await redisClient.get(tagKey);
        
        if (taggedKeys) {
          const keys = JSON.parse(taggedKeys);
          
          for (const key of keys) {
            const deleted = await redisClient.del(key);
            if (deleted) {
              deletedCount++;
              this.stats.deletes++;
            }
          }
          
          // Remove the tag key itself
          await redisClient.del(tagKey);
        }
      }
    } catch (error) {
      console.warn('Error invalidating cache by tags:', error);
    }
    
    return deletedCount;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const deletedCount = await redisClient.deletePattern(pattern);
      this.stats.deletes += deletedCount;
      return deletedCount;
    } catch (error) {
      console.warn('Error invalidating cache by pattern:', error);
      return 0;
    }
  }

  /**
   * Clear all cache entries with this prefix
   */
  async clear(): Promise<number> {
    return this.invalidateByPattern(`${this.keyPrefix}:*`);
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): QueryCacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };
  }

  /**
   * Check if a cache entry exists
   */
  async exists(
    query: string, 
    params: Record<string, any> = {}, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const key = this.generateCacheKey(query, params, options);
      return await redisClient.exists(key);
    } catch (error) {
      console.warn('Cache EXISTS error:', error);
      return false;
    }
  }

  /**
   * Get TTL for a cache entry
   */
  async getTTL(
    query: string, 
    params: Record<string, any> = {}, 
    options: CacheOptions = {}
  ): Promise<number> {
    try {
      const key = this.generateCacheKey(query, params, options);
      return await redisClient.ttl(key);
    } catch (error) {
      console.warn('Cache TTL error:', error);
      return -1;
    }
  }

  /**
   * Warm cache with predefined data
   */
  async warm<T = any>(
    entries: Array<{
      query: string;
      params?: Record<string, any>;
      result: T;
      options?: CacheOptions;
    }>
  ): Promise<number> {
    let warmedCount = 0;
    
    for (const entry of entries) {
      const success = await this.set(
        entry.query, 
        entry.params || {}, 
        entry.result, 
        entry.options || {}
      );
      
      if (success) {
        warmedCount++;
      }
    }
    
    return warmedCount;
  }
}

// Export default instance
export const queryCache = new QueryCache();

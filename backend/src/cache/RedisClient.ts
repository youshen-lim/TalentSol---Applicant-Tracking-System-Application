import Redis from 'ioredis';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

export interface CacheConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  clusterEnabled: boolean;
  clusterNodes: string[];
  defaultTTL: number;
  queryTTL: number;
  sessionTTL: number;
  aiAnalysisTTL: number;
}

export class RedisClient {
  private static instance: RedisClient;
  private redis: Redis | null = null;
  private fallbackCache: NodeCache;
  private config: CacheConfig;
  private isConnected: boolean = false;

  private constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0'),
      clusterEnabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
      clusterNodes: process.env.REDIS_CLUSTER_NODES?.split(',') || ['localhost:6379'],
      defaultTTL: parseInt(process.env.CACHE_TTL_DEFAULT || '1800'),
      queryTTL: parseInt(process.env.CACHE_TTL_QUERY || '1800'),
      sessionTTL: parseInt(process.env.CACHE_TTL_SESSION || '86400'),
      aiAnalysisTTL: parseInt(process.env.CACHE_TTL_AI_ANALYSIS || '7200'),
    };

    // Initialize fallback in-memory cache
    this.fallbackCache = new NodeCache({
      stdTTL: this.config.defaultTTL,
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false,
    });

    this.initializeRedis();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (this.config.clusterEnabled && this.config.clusterNodes.length > 0) {
        // Initialize Redis Cluster
        const clusterNodes = this.config.clusterNodes.map(node => {
          const [host, port] = node.split(':');
          return { host, port: parseInt(port) };
        });

        this.redis = new Redis.Cluster(clusterNodes, {
          redisOptions: {
            password: this.config.password || undefined,
            db: this.config.db,
          },
          enableOfflineQueue: false,
          retryDelayOnFailover: 100,
        }) as any;
      } else {
        // Initialize single Redis instance
        this.redis = new Redis({
          host: this.config.host,
          port: this.config.port,
          password: this.config.password || undefined,
          db: this.config.db,
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          lazyConnect: true,
        });
      }

      // Set up event listeners
      if (this.redis) {
        this.redis.on('connect', () => {
          console.log('✅ Redis connected successfully');
          this.isConnected = true;
        });

        this.redis.on('error', (error) => {
          console.warn('⚠️ Redis connection error, falling back to in-memory cache:', error.message);
          this.isConnected = false;
        });

        this.redis.on('close', () => {
          console.warn('⚠️ Redis connection closed, using in-memory cache');
          this.isConnected = false;
        });

        // Test connection
        await this.redis.ping();
        this.isConnected = true;
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize Redis, using in-memory cache:', (error as Error).message);
      this.isConnected = false;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      if (this.isConnected && this.redis) {
        return await this.redis.get(key);
      }
    } catch (error) {
      console.warn('Redis GET error:', error);
    }
    
    // Fallback to in-memory cache
    return this.fallbackCache.get(key) as string || null;
  }

  public async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (this.isConnected && this.redis) {
        if (ttl) {
          await this.redis.setex(key, ttl, value);
        } else {
          await this.redis.set(key, value);
        }
        return true;
      }
    } catch (error) {
      console.warn('Redis SET error:', error);
    }
    
    // Fallback to in-memory cache
    this.fallbackCache.set(key, value, ttl || this.config.defaultTTL);
    return true;
  }

  public async del(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.redis) {
        await this.redis.del(key);
        return true;
      }
    } catch (error) {
      console.warn('Redis DEL error:', error);
    }
    
    // Fallback to in-memory cache
    return this.fallbackCache.del(key) > 0;
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      if (this.isConnected && this.redis) {
        return await this.redis.keys(pattern);
      }
    } catch (error) {
      console.warn('Redis KEYS error:', error);
    }
    
    // Fallback to in-memory cache
    return this.fallbackCache.keys().filter(key => 
      new RegExp(pattern.replace(/\*/g, '.*')).test(key)
    );
  }

  public async deletePattern(pattern: string): Promise<number> {
    try {
      if (this.isConnected && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          return await this.redis.del(...keys);
        }
        return 0;
      }
    } catch (error) {
      console.warn('Redis DELETE PATTERN error:', error);
    }
    
    // Fallback to in-memory cache
    const keys = this.fallbackCache.keys().filter(key => 
      new RegExp(pattern.replace(/\*/g, '.*')).test(key)
    );
    return this.fallbackCache.del(keys);
  }

  public async exists(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.redis) {
        return (await this.redis.exists(key)) === 1;
      }
    } catch (error) {
      console.warn('Redis EXISTS error:', error);
    }
    
    // Fallback to in-memory cache
    return this.fallbackCache.has(key);
  }

  public async ttl(key: string): Promise<number> {
    try {
      if (this.isConnected && this.redis) {
        return await this.redis.ttl(key);
      }
    } catch (error) {
      console.warn('Redis TTL error:', error);
    }
    
    // Fallback to in-memory cache
    return this.fallbackCache.getTtl(key) || -1;
  }

  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  public isRedisConnected(): boolean {
    return this.isConnected;
  }

  public getPipeline(): any | null {
    if (this.isConnected && this.redis) {
      return this.redis.pipeline();
    }
    return null;
  }

  public async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
    this.fallbackCache.close();
  }

  // Health check method
  public async healthCheck(): Promise<{ redis: boolean; fallback: boolean; stats: any }> {
    const redisHealth = this.isConnected;
    const fallbackHealth = true; // In-memory cache is always available

    let stats: any = {
      redis_connected: redisHealth,
      fallback_keys: this.fallbackCache.keys().length,
      fallback_stats: this.fallbackCache.getStats(),
    };

    if (redisHealth && this.redis) {
      try {
        const info = await this.redis.info('memory');
        stats.redis_info = info;
      } catch (error) {
        console.warn('Failed to get Redis info:', error);
      }
    }

    return {
      redis: redisHealth,
      fallback: fallbackHealth,
      stats,
    };
  }
}

// Export singleton instance
export const redisClient = RedisClient.getInstance();

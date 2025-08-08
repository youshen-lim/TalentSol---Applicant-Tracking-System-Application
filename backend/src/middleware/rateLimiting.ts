import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../cache/RedisClient.js';
import { AuthenticatedRequest } from './auth.js';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  standardHeaders?: boolean; // Include rate limit headers
  legacyHeaders?: boolean; // Include X-RateLimit-* headers
  onLimitReached?: (req: Request, res: Response) => void;
}

export interface RateLimitInfo {
  totalHits: number;
  totalRequests: number;
  resetTime: Date;
  remaining: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private keyPrefix: string;

  constructor(config: RateLimitConfig, keyPrefix: string = 'rate_limit') {
    this.config = {
      windowMs: config.windowMs || 60 * 60 * 1000, // 1 hour default
      maxRequests: config.maxRequests || 1000, // 1000 requests per hour default
      standardHeaders: config.standardHeaders ?? true,
      legacyHeaders: config.legacyHeaders ?? false,
      message: config.message || 'Too many requests, please try again later.'
    };
    this.keyPrefix = keyPrefix;
  }

  /**
   * Rate limiting middleware
   */
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.generateKey(req);
        const rateLimitInfo = await this.checkRateLimit(key);

        // Add rate limit headers
        this.addHeaders(res, rateLimitInfo);

        if (rateLimitInfo.totalHits > this.config.maxRequests) {
          // Rate limit exceeded
          if (this.config.onLimitReached) {
            this.config.onLimitReached(req, res);
          }

          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: this.config.message,
            retryAfter: Math.ceil((rateLimitInfo.resetTime.getTime() - Date.now()) / 1000),
            limit: this.config.maxRequests,
            remaining: rateLimitInfo.remaining,
            resetTime: rateLimitInfo.resetTime.toISOString(),
            timestamp: new Date().toISOString()
          });
        }

        return next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Continue without rate limiting on error
        return next();
      }
    };
  }

  /**
   * Check rate limit for a key
   */
  private async checkRateLimit(key: string): Promise<RateLimitInfo> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const resetTime = new Date(now + this.config.windowMs);

    try {
      // Try Redis first
      if (redisClient.isRedisConnected()) {
        return await this.checkRateLimitRedis(key, windowStart, now, resetTime);
      }
    } catch (error) {
      console.warn('Redis rate limiting failed, using in-memory fallback:', error);
    }

    // Fallback to in-memory rate limiting
    return await this.checkRateLimitMemory(key, windowStart, now, resetTime);
  }

  /**
   * Redis-based rate limiting
   */
  private async checkRateLimitRedis(
    key: string, 
    windowStart: number, 
    now: number, 
    resetTime: Date
  ): Promise<RateLimitInfo> {
    const redisKey = `${this.keyPrefix}:${key}`;
    
    // Use Redis sorted set to track requests in time window
    const pipeline = redisClient.getPipeline();
    
    if (!pipeline) {
      throw new Error('Redis pipeline not available');
    }

    // Remove old entries outside the window
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    
    // Add current request
    pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
    
    // Count requests in current window
    pipeline.zcard(redisKey);
    
    // Set expiration
    pipeline.expire(redisKey, Math.ceil(this.config.windowMs / 1000));
    
    const results = await pipeline.exec();
    
    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    const totalHits = (results[2][1] as number) || 0;
    const remaining = Math.max(0, this.config.maxRequests - totalHits);

    return {
      totalHits,
      totalRequests: totalHits,
      resetTime,
      remaining
    };
  }

  /**
   * In-memory rate limiting fallback
   */
  private async checkRateLimitMemory(
    key: string, 
    windowStart: number, 
    now: number, 
    resetTime: Date
  ): Promise<RateLimitInfo> {
    // Simple in-memory implementation (not persistent across restarts)
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }

    const store = global.rateLimitStore as Map<string, number[]>;
    const requests = store.get(key) || [];
    
    // Filter requests within the current window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Add current request
    validRequests.push(now);
    
    // Update store
    store.set(key, validRequests);
    
    const totalHits = validRequests.length;
    const remaining = Math.max(0, this.config.maxRequests - totalHits);

    return {
      totalHits,
      totalRequests: totalHits,
      resetTime,
      remaining
    };
  }

  /**
   * Generate rate limit key
   */
  private generateKey(req: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Default key generation based on IP and user
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as AuthenticatedRequest).user?.id || 'anonymous';
    
    return `${ip}:${userId}`;
  }

  /**
   * Add rate limit headers to response
   */
  private addHeaders(res: Response, rateLimitInfo: RateLimitInfo): void {
    if (this.config.standardHeaders) {
      res.setHeader('RateLimit-Limit', this.config.maxRequests);
      res.setHeader('RateLimit-Remaining', rateLimitInfo.remaining);
      res.setHeader('RateLimit-Reset', rateLimitInfo.resetTime.toISOString());
      res.setHeader('RateLimit-Policy', `${this.config.maxRequests};w=${this.config.windowMs / 1000}`);
    }

    if (this.config.legacyHeaders) {
      res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitInfo.resetTime.getTime() / 1000));
    }
  }
}

/**
 * Predefined rate limiting configurations
 */
export const rateLimitConfigs = {
  // General API rate limiting
  general: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000, // 1000 requests per hour for authenticated users
    message: 'Too many requests from this IP, please try again later.'
  },

  // Unauthenticated users (stricter)
  unauthenticated: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // 100 requests per hour for unauthenticated users
    message: 'Too many requests. Please register or login for higher limits.'
  },

  // Authentication endpoints (very strict)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  },

  // ML processing endpoints (moderate)
  mlProcessing: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 ML processing requests per hour
    message: 'ML processing rate limit exceeded. Please wait before submitting more requests.'
  },

  // File upload endpoints (strict)
  fileUpload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 file uploads per hour
    message: 'File upload rate limit exceeded. Please wait before uploading more files.'
  },

  // Analytics endpoints (moderate)
  analytics: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 200, // 200 analytics requests per hour
    message: 'Analytics rate limit exceeded. Please reduce request frequency.'
  }
};

/**
 * Key generators for different scenarios
 */
export const keyGenerators = {
  // IP-based rate limiting
  byIP: (req: Request): string => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },

  // User-based rate limiting
  byUser: (req: Request): string => {
    const userId = (req as AuthenticatedRequest).user?.id;
    return userId || req.ip || 'anonymous';
  },

  // Company-based rate limiting
  byCompany: (req: Request): string => {
    const companyId = (req as AuthenticatedRequest).user?.companyId;
    return companyId || req.ip || 'anonymous';
  },

  // Combined IP and User
  byIPAndUser: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as AuthenticatedRequest).user?.id || 'anonymous';
    return `${ip}:${userId}`;
  }
};

/**
 * Create rate limiter instances
 */
export const rateLimiters = {
  general: new RateLimiter(rateLimitConfigs.general, 'general'),
  unauthenticated: new RateLimiter(rateLimitConfigs.unauthenticated, 'unauth'),
  auth: new RateLimiter(rateLimitConfigs.auth, 'auth'),
  mlProcessing: new RateLimiter(rateLimitConfigs.mlProcessing, 'ml'),
  fileUpload: new RateLimiter(rateLimitConfigs.fileUpload, 'upload'),
  analytics: new RateLimiter(rateLimitConfigs.analytics, 'analytics')
};

/**
 * Smart rate limiting middleware that applies different limits based on authentication status
 */
export function smartRateLimit() {
  return (req: Request, res: Response, next: NextFunction) => {
    const isAuthenticated = !!(req as AuthenticatedRequest).user;

    if (isAuthenticated) {
      return rateLimiters.general.middleware()(req, res, next);
    } else {
      return rateLimiters.unauthenticated.middleware()(req, res, next);
    }
  };
}

/**
 * Rate limiting middleware for specific endpoint types
 */
export const rateLimitMiddleware = {
  general: rateLimiters.general.middleware(),
  unauthenticated: rateLimiters.unauthenticated.middleware(),
  auth: rateLimiters.auth.middleware(),
  mlProcessing: rateLimiters.mlProcessing.middleware(),
  fileUpload: rateLimiters.fileUpload.middleware(),
  analytics: rateLimiters.analytics.middleware(),
  smart: smartRateLimit()
};

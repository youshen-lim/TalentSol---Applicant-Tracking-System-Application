import { Request, Response, NextFunction } from 'express';

export interface CacheControlOptions {
  maxAge?: number; // in seconds
  sMaxAge?: number; // for shared caches (CDN)
  mustRevalidate?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  private?: boolean;
  public?: boolean;
  immutable?: boolean;
  staleWhileRevalidate?: number;
}

/**
 * Cache Control Middleware for TalentSol ATS
 * Optimizes browser caching for different types of content
 *
 * Browser Cache Storage Strategy:
 * - Short-term cache (< 1 hour): Stored in RAM for fast access
 * - Medium-term cache (1 hour - 1 day): Mixed RAM/disk based on browser heuristics
 * - Long-term cache (> 1 day): Stored on disk to preserve RAM
 *
 * Cache Duration Guidelines:
 * - RAM Cache: 0-3600 seconds (0-1 hour)
 * - Mixed Cache: 3600-86400 seconds (1 hour - 1 day)
 * - Disk Cache: 86400+ seconds (1+ days)
 */
export class CacheControlMiddleware {
  
  /**
   * Static assets (JS, CSS, images) - Long-term disk cache with immutable
   * Duration: 1 year (disk storage) - Browser will store on disk to preserve RAM
   */
  static staticAssets(maxAge: number = 31536000): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': `public, max-age=${maxAge}, immutable`,
        'Expires': new Date(Date.now() + maxAge * 1000).toUTCString(),
        // Hint to browser this is suitable for disk storage
        'Cache-Storage-Policy': 'disk-preferred',
      });
      next();
    };
  }

  /**
   * API responses that change frequently - Short-term RAM cache with revalidation
   * Duration: 5 minutes (RAM storage) - Fast access for immediate reuse
   */
  static apiResponses(maxAge: number = 300): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': `private, max-age=${maxAge}, must-revalidate`,
        'Vary': 'Authorization, Accept-Encoding',
        // Hint to browser this is suitable for RAM storage
        'Cache-Storage-Policy': 'memory-preferred',
      });
      next();
    };
  }

  /**
   * Dashboard data - Medium cache with stale-while-revalidate
   */
  static dashboardData(maxAge: number = 900): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': `private, max-age=${maxAge}, stale-while-revalidate=1800`,
        'Vary': 'Authorization',
      });
      next();
    };
  }

  /**
   * Job listings - Public cache with moderate TTL
   */
  static jobListings(maxAge: number = 1800): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': `public, max-age=${maxAge}, s-maxage=3600`,
        'Vary': 'Accept-Encoding',
      });
      next();
    };
  }

  /**
   * User-specific data - Private cache, short TTL
   */
  static userData(maxAge: number = 300): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': `private, max-age=${maxAge}, must-revalidate`,
        'Vary': 'Authorization',
      });
      next();
    };
  }

  /**
   * No cache for sensitive operations
   */
  static noCache(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      });
      next();
    };
  }

  /**
   * Short-term RAM cache - Optimized for immediate reuse
   * Duration: 0-30 minutes (RAM storage preferred)
   */
  static ramCache(maxAge: number = 1800): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': `private, max-age=${maxAge}`,
        'Vary': 'Authorization, Accept-Encoding',
        'Cache-Storage-Policy': 'memory-only',
        // Add hint for browser memory management
        'X-Cache-Hint': 'ram-preferred',
      });
      next();
    };
  }

  /**
   * Medium-term mixed cache - Browser decides RAM vs disk
   * Duration: 30 minutes - 6 hours (mixed storage)
   */
  static mixedCache(maxAge: number = 7200): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': `private, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
        'Vary': 'Authorization, Accept-Encoding',
        'Cache-Storage-Policy': 'adaptive',
        'X-Cache-Hint': 'mixed-storage',
      });
      next();
    };
  }

  /**
   * Long-term disk cache - Optimized for persistent storage
   * Duration: 6+ hours (disk storage preferred)
   */
  static diskCache(maxAge: number = 86400): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.set({
        'Cache-Control': `public, max-age=${maxAge}`,
        'Expires': new Date(Date.now() + maxAge * 1000).toUTCString(),
        'Cache-Storage-Policy': 'disk-preferred',
        'X-Cache-Hint': 'disk-storage',
      });
      next();
    };
  }

  /**
   * Custom cache control
   */
  static custom(options: CacheControlOptions): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const directives: string[] = [];

      if (options.public) directives.push('public');
      if (options.private) directives.push('private');
      if (options.noCache) directives.push('no-cache');
      if (options.noStore) directives.push('no-store');
      if (options.mustRevalidate) directives.push('must-revalidate');
      if (options.immutable) directives.push('immutable');
      
      if (options.maxAge !== undefined) directives.push(`max-age=${options.maxAge}`);
      if (options.sMaxAge !== undefined) directives.push(`s-maxage=${options.sMaxAge}`);
      if (options.staleWhileRevalidate !== undefined) {
        directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
      }

      res.set({
        'Cache-Control': directives.join(', '),
        'Vary': 'Accept-Encoding, Authorization',
      });
      next();
    };
  }

  /**
   * Conditional cache based on request/response characteristics
   * Uses safer header setting approach without overriding res.send
   */
  static conditional(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      // Apply cache headers based on route and method with RAM/disk optimization
      if (req.method === 'GET') {
        if (req.path.includes('/api/dashboard')) {
          // Dashboard: Medium-term mixed cache (15 min RAM, then disk)
          res.set({
            'Cache-Control': 'private, max-age=900, stale-while-revalidate=1800',
            'Vary': 'Authorization',
            'Cache-Storage-Policy': 'adaptive',
            'X-Cache-Hint': 'mixed-storage',
          });
        } else if (req.path.includes('/api/jobs') && !req.path.includes('/applications')) {
          // Job listings: Medium-term disk cache (public, longer duration)
          res.set({
            'Cache-Control': 'public, max-age=1800, s-maxage=3600',
            'Vary': 'Accept-Encoding',
            'Cache-Storage-Policy': 'disk-preferred',
            'X-Cache-Hint': 'disk-storage',
          });
        } else if (req.path.includes('/api/candidates') || req.path.includes('/api/applications')) {
          // User data: Short-term RAM cache (frequent updates)
          res.set({
            'Cache-Control': 'private, max-age=300, must-revalidate',
            'Vary': 'Authorization',
            'Cache-Storage-Policy': 'memory-preferred',
            'X-Cache-Hint': 'ram-preferred',
          });
        } else if (req.path.includes('/api/analytics')) {
          // Analytics: Medium-term mixed cache
          res.set({
            'Cache-Control': 'private, max-age=1800, stale-while-revalidate=3600',
            'Vary': 'Authorization',
            'Cache-Storage-Policy': 'adaptive',
            'X-Cache-Hint': 'mixed-storage',
          });
        } else {
          // Default: Short-term RAM cache
          res.set({
            'Cache-Control': 'private, max-age=300, must-revalidate',
            'Vary': 'Authorization, Accept-Encoding',
            'Cache-Storage-Policy': 'memory-preferred',
            'X-Cache-Hint': 'ram-preferred',
          });
        }
      } else {
        // POST, PUT, DELETE - no cache
        res.set({
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Cache-Storage-Policy': 'none',
        });
      }

      next();
    };
  }
}

// Export commonly used middleware
export const {
  staticAssets,
  apiResponses,
  dashboardData,
  jobListings,
  userData,
  noCache,
  custom,
  conditional,
  ramCache,
  mixedCache,
  diskCache
} = CacheControlMiddleware;

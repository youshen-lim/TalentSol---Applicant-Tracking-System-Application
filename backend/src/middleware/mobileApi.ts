import { Request, Response, NextFunction } from 'express';
import { mobileApiService, MobileDeviceInfo, MobileOptimizationConfig } from '../services/MobileApiService.js';
import { AuthenticatedRequest } from './auth.js';
import compression from 'compression';

export interface MobileApiOptions {
  enableOptimization?: boolean;
  forceOptimization?: boolean;
  customConfig?: Partial<MobileOptimizationConfig>;
  offlineSupport?: boolean;
  compressionLevel?: number;
}

/**
 * Mobile API optimization middleware
 */
export function mobileApiMiddleware(options: MobileApiOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        enableOptimization = true,
        forceOptimization = false,
        customConfig = {},
        offlineSupport = true,
        compressionLevel = 6
      } = options;

      // Detect mobile device
      const deviceInfo = mobileApiService.detectMobileDevice(req);
      const isMobileDevice = deviceInfo.deviceType === 'mobile' || deviceInfo.deviceType === 'tablet';

      // Skip optimization for non-mobile devices unless forced
      if (!enableOptimization || (!isMobileDevice && !forceOptimization)) {
        return next();
      }

      // Get mobile configuration
      const userId = (req as AuthenticatedRequest).user?.id;
      let mobileConfig = mobileApiService.getMobileConfig(deviceInfo, userId);
      
      // Apply custom configuration overrides
      mobileConfig = { ...mobileConfig, ...customConfig };

      // Add mobile information to request
      (req as any).mobileInfo = {
        deviceInfo,
        config: mobileConfig,
        isOptimized: true
      };

      // Set up compression if enabled
      if (mobileConfig.enableCompression) {
        const compressionMiddleware = compression({
          level: compressionLevel,
          threshold: 1024, // Only compress responses > 1KB
          filter: (req, res) => {
            // Don't compress if client doesn't support it
            if (req.headers['x-no-compression']) {
              return false;
            }
            // Use compression default filter
            return compression.filter(req, res);
          }
        });
        
        compressionMiddleware(req, res, () => {});
      }

      // Override res.json to apply mobile optimization
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        try {
          const startTime = Date.now();
          
          // Create mobile-optimized response
          const mobileResponse = mobileApiService.createMobileResponse(
            data,
            deviceInfo,
            mobileConfig,
            Date.now() - startTime,
            false // TODO: Check if data was cached
          );

          // Add mobile-specific headers
          res.setHeader('X-Mobile-Optimized', 'true');
          res.setHeader('X-Device-Type', deviceInfo.deviceType);
          res.setHeader('X-Platform', deviceInfo.platform);
          res.setHeader('X-Payload-Reduction', mobileResponse.metadata.mobile.payloadReduction.toString());
          res.setHeader('X-Offline-Capable', mobileConfig.offlineSupport.toString());
          
          if (mobileConfig.enableCompression) {
            res.setHeader('X-Compression-Enabled', 'true');
          }

          // Add offline support headers if enabled
          if (offlineSupport && mobileConfig.offlineSupport) {
            res.setHeader('X-Offline-Support', 'true');
            res.setHeader('X-Sync-Endpoint', '/api/mobile/sync');
            res.setHeader('X-Queue-Endpoint', '/api/mobile/queue');
          }

          return originalJson(mobileResponse);
        } catch (error) {
          console.error('Mobile optimization error:', error);
          // Fallback to original response on error
          return originalJson(data);
        }
      };

      next();
    } catch (error) {
      console.error('Mobile API middleware error:', error);
      // Continue without mobile optimization on error
      next();
    }
  };
}

/**
 * Mobile rate limiting middleware
 */
export function mobileRateLimitMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceInfo = mobileApiService.detectMobileDevice(req);
      const isMobileDevice = deviceInfo.deviceType === 'mobile' || deviceInfo.deviceType === 'tablet';

      if (isMobileDevice) {
        // Apply mobile-specific rate limiting (500 req/hr)
        const mobileRateLimit = 500; // requests per hour
        const windowMs = 60 * 60 * 1000; // 1 hour
        
        // Add mobile rate limit headers
        res.setHeader('X-Mobile-Rate-Limit', mobileRateLimit);
        res.setHeader('X-Mobile-Rate-Window', '3600'); // seconds
        
        // TODO: Implement actual rate limiting logic
        // For now, just add headers and continue
      }

      next();
    } catch (error) {
      console.error('Mobile rate limiting error:', error);
      next();
    }
  };
}

/**
 * Offline support middleware
 */
export function offlineSupportMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceInfo = mobileApiService.detectMobileDevice(req);
      const isMobileDevice = deviceInfo.deviceType === 'mobile' || deviceInfo.deviceType === 'tablet';
      const userId = (req as AuthenticatedRequest).user?.id;

      if (isMobileDevice && userId) {
        // Check for offline queue header
        const isOfflineSync = req.headers['x-offline-sync'] === 'true';
        
        if (isOfflineSync) {
          // Handle offline synchronization
          const syncResult = await mobileApiService.processOfflineQueue(userId);
          
          return res.json({
            success: true,
            data: syncResult,
            message: 'Offline synchronization completed',
            timestamp: new Date().toISOString()
          });
        }

        // Check if this is a queueable operation
        const isQueueableMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
        const isOfflineMode = req.headers['x-offline-mode'] === 'true';

        if (isQueueableMethod && isOfflineMode) {
          // Queue the operation for later processing
          const operationId = mobileApiService.queueOfflineOperation(
            userId,
            req.method,
            req.originalUrl,
            req.body,
            'medium'
          );

          return res.json({
            success: true,
            data: { operationId, queued: true },
            message: 'Operation queued for offline processing',
            offline: {
              syncId: operationId,
              lastSync: new Date().toISOString(),
              conflictResolution: 'server'
            },
            timestamp: new Date().toISOString()
          });
        }

        // Add offline queue information to response
        const queueLength = mobileApiService.getOfflineQueue(userId).length;
        if (queueLength > 0) {
          res.setHeader('X-Offline-Queue-Length', queueLength);
          res.setHeader('X-Offline-Sync-Available', 'true');
        }
      }

      return next();
    } catch (error) {
      console.error('Offline support middleware error:', error);
      return next();
    }
  };
}

/**
 * Mobile image optimization middleware
 */
export function mobileImageMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceInfo = mobileApiService.detectMobileDevice(req);
      const isMobileDevice = deviceInfo.deviceType === 'mobile';

      if (isMobileDevice) {
        // Add mobile image optimization headers
        res.setHeader('X-Image-Quality', 'medium');
        res.setHeader('X-Image-Format', 'webp');
        res.setHeader('X-Thumbnail-Size', '150x150');
        
        // Override image URLs in response (would be implemented in actual image service)
        const originalJson = res.json.bind(res);
        res.json = function(data: any) {
          try {
            // Transform image URLs for mobile optimization
            const optimizedData = optimizeImageUrls(data, deviceInfo);
            return originalJson(optimizedData);
          } catch (error) {
            console.error('Image optimization error:', error);
            return originalJson(data);
          }
        };
      }

      next();
    } catch (error) {
      console.error('Mobile image middleware error:', error);
      next();
    }
  };
}

/**
 * Mobile performance monitoring middleware
 */
export function mobilePerformanceMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const deviceInfo = mobileApiService.detectMobileDevice(req);
    const isMobileDevice = deviceInfo.deviceType === 'mobile' || deviceInfo.deviceType === 'tablet';

    if (isMobileDevice) {
      // Track mobile-specific performance metrics
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        const responseTime = Date.now() - startTime;
        const payloadSize = JSON.stringify(data).length;
        
        // Add performance headers
        res.setHeader('X-Mobile-Response-Time', responseTime);
        res.setHeader('X-Mobile-Payload-Size', payloadSize);
        res.setHeader('X-Mobile-Performance-Score', calculatePerformanceScore(responseTime, payloadSize));
        
        // Log mobile performance metrics
        console.log(`📱 Mobile Performance: ${req.method} ${req.originalUrl} - ${responseTime}ms, ${payloadSize} bytes`);
        
        return originalJson(data);
      };
    }

    next();
  };
}

/**
 * Combined mobile middleware stack
 */
export function mobileMiddlewareStack(options: MobileApiOptions = {}) {
  return [
    mobilePerformanceMiddleware(),
    mobileRateLimitMiddleware(),
    offlineSupportMiddleware(),
    mobileImageMiddleware(),
    mobileApiMiddleware(options)
  ];
}

// Helper functions
function optimizeImageUrls(data: any, deviceInfo: MobileDeviceInfo): any {
  if (typeof data !== 'object' || data === null) return data;

  const optimized = Array.isArray(data) ? [...data] : { ...data };

  // Recursively optimize image URLs
  Object.keys(optimized).forEach(key => {
    const value = optimized[key];
    
    if (typeof value === 'string' && (key.includes('image') || key.includes('photo') || key.includes('avatar'))) {
      // Transform image URL for mobile optimization
      optimized[key] = transformImageUrl(value, deviceInfo);
    } else if (typeof value === 'object' && value !== null) {
      optimized[key] = optimizeImageUrls(value, deviceInfo);
    }
  });

  return optimized;
}

function transformImageUrl(url: string, deviceInfo: MobileDeviceInfo): string {
  if (!url || !url.startsWith('http')) return url;

  // Add mobile optimization parameters
  const separator = url.includes('?') ? '&' : '?';
  const quality = deviceInfo.deviceType === 'mobile' ? 'medium' : 'high';
  const format = 'webp';
  const size = deviceInfo.deviceType === 'mobile' ? '300x300' : '600x600';

  return `${url}${separator}quality=${quality}&format=${format}&size=${size}&mobile=true`;
}

function calculatePerformanceScore(responseTime: number, payloadSize: number): number {
  // Simple performance scoring algorithm
  let score = 100;
  
  // Penalize slow response times
  if (responseTime > 500) score -= 30;
  else if (responseTime > 300) score -= 20;
  else if (responseTime > 200) score -= 10;
  
  // Penalize large payloads
  if (payloadSize > 100000) score -= 30; // 100KB
  else if (payloadSize > 50000) score -= 20;  // 50KB
  else if (payloadSize > 25000) score -= 10;  // 25KB
  
  return Math.max(0, score);
}

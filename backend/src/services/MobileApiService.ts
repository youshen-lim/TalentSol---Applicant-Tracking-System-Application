import { Request } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';

export interface MobileDeviceInfo {
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web';
  screenSize: 'small' | 'medium' | 'large';
  connectionType: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

export interface MobileOptimizationConfig {
  maxPayloadSize: number;
  imageQuality: 'low' | 'medium' | 'high';
  enableCompression: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
  offlineSupport: boolean;
  pushNotifications: boolean;
}

export interface MobileResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    payloadSize: number;
    compressionRatio?: number;
    cacheInfo: {
      cached: boolean;
      ttl: number;
      strategy: string;
    };
    performance: {
      queryTime: number;
      optimizations: string[];
    };
    mobile: {
      deviceOptimized: boolean;
      payloadReduction: number;
      offlineCapable: boolean;
    };
  };
  offline?: {
    syncId: string;
    lastSync: string;
    conflictResolution: 'client' | 'server' | 'merge';
  };
  timestamp: string;
}

export interface OfflineQueueItem {
  id: string;
  method: string;
  endpoint: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
  userId: string;
  deviceId: string;
}

export class MobileApiService {
  private static instance: MobileApiService;
  private offlineQueue: Map<string, OfflineQueueItem[]> = new Map();
  private deviceConfigs: Map<string, MobileOptimizationConfig> = new Map();
  private syncConflicts: Map<string, any[]> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
  }

  public static getInstance(): MobileApiService {
    if (!MobileApiService.instance) {
      MobileApiService.instance = new MobileApiService();
    }
    return MobileApiService.instance;
  }

  /**
   * Detect mobile device information from request
   */
  public detectMobileDevice(req: Request): MobileDeviceInfo {
    const userAgent = req.headers['user-agent'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const connection = req.headers['connection'] || '';

    // Device type detection
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone|iPod/.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/iPad|Tablet/.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Platform detection
    let platform: 'ios' | 'android' | 'web' = 'web';
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      platform = 'ios';
    } else if (/Android/.test(userAgent)) {
      platform = 'android';
    }

    // Screen size estimation
    let screenSize: 'small' | 'medium' | 'large' = 'medium';
    if (deviceType === 'mobile') {
      screenSize = 'small';
    } else if (deviceType === 'tablet') {
      screenSize = 'medium';
    } else {
      screenSize = 'large';
    }

    // Connection type estimation (basic)
    let connectionType: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown' = 'unknown';
    if (connection.includes('keep-alive')) {
      connectionType = 'wifi'; // Assumption for persistent connections
    }

    return {
      userAgent,
      deviceType,
      platform,
      screenSize,
      connectionType,
      batteryLevel: undefined, // Would need client-side reporting
      isLowPowerMode: undefined // Would need client-side reporting
    };
  }

  /**
   * Get mobile optimization configuration for device
   */
  public getMobileConfig(deviceInfo: MobileDeviceInfo, userId?: string): MobileOptimizationConfig {
    const deviceKey = `${deviceInfo.platform}_${deviceInfo.deviceType}`;
    
    // Check for user-specific config
    if (userId) {
      const userConfig = this.deviceConfigs.get(`${userId}_${deviceKey}`);
      if (userConfig) return userConfig;
    }

    // Return device-specific default config
    return this.deviceConfigs.get(deviceKey) || this.getDefaultMobileConfig(deviceInfo);
  }

  /**
   * Optimize payload for mobile device
   */
  public optimizePayload<T>(
    data: T, 
    deviceInfo: MobileDeviceInfo, 
    config: MobileOptimizationConfig
  ): { optimizedData: any; reductionPercentage: number; optimizations: string[] } {
    const originalSize = JSON.stringify(data).length;
    const optimizations: string[] = [];
    let optimizedData = JSON.parse(JSON.stringify(data)); // Deep clone

    // Apply mobile-specific optimizations
    if (Array.isArray(optimizedData)) {
      optimizedData = this.optimizeArrayPayload(optimizedData, deviceInfo, config, optimizations);
    } else if (typeof optimizedData === 'object' && optimizedData !== null) {
      optimizedData = this.optimizeObjectPayload(optimizedData, deviceInfo, config, optimizations);
    }

    const optimizedSize = JSON.stringify(optimizedData).length;
    const reductionPercentage = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

    return {
      optimizedData,
      reductionPercentage,
      optimizations
    };
  }

  /**
   * Create mobile-optimized response
   */
  public createMobileResponse<T>(
    data: T,
    deviceInfo: MobileDeviceInfo,
    config: MobileOptimizationConfig,
    queryTime: number,
    cached: boolean = false
  ): MobileResponse<any> {
    const { optimizedData, reductionPercentage, optimizations } = this.optimizePayload(data, deviceInfo, config);
    const payloadSize = JSON.stringify(optimizedData).length;

    return {
      success: true,
      data: optimizedData,
      metadata: {
        payloadSize,
        compressionRatio: config.enableCompression ? 0.7 : undefined,
        cacheInfo: {
          cached,
          ttl: this.getCacheTTL(config.cacheStrategy),
          strategy: config.cacheStrategy
        },
        performance: {
          queryTime,
          optimizations
        },
        mobile: {
          deviceOptimized: true,
          payloadReduction: reductionPercentage,
          offlineCapable: config.offlineSupport
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Queue offline operation
   */
  public queueOfflineOperation(
    userId: string,
    method: string,
    endpoint: string,
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): string {
    const operationId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queueItem: OfflineQueueItem = {
      id: operationId,
      method,
      endpoint,
      data,
      timestamp: new Date(),
      retryCount: 0,
      priority,
      userId,
      deviceId: `device_${userId}` // Simplified device ID
    };

    const userQueue = this.offlineQueue.get(userId) || [];
    userQueue.push(queueItem);
    
    // Sort by priority and timestamp
    userQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    this.offlineQueue.set(userId, userQueue);
    
    console.log(`📱 Queued offline operation: ${method} ${endpoint} for user ${userId}`);
    return operationId;
  }

  /**
   * Get offline queue for user
   */
  public getOfflineQueue(userId: string): OfflineQueueItem[] {
    return this.offlineQueue.get(userId) || [];
  }

  /**
   * Process offline queue when connectivity returns
   */
  public async processOfflineQueue(userId: string): Promise<{
    processed: number;
    failed: number;
    conflicts: number;
  }> {
    const queue = this.offlineQueue.get(userId) || [];
    let processed = 0;
    let failed = 0;
    let conflicts = 0;

    console.log(`📱 Processing offline queue for user ${userId}: ${queue.length} items`);

    for (const item of queue) {
      try {
        // Simulate processing offline operation
        const success = await this.processOfflineItem(item);
        
        if (success) {
          processed++;
        } else {
          failed++;
          item.retryCount++;
        }
      } catch (error) {
        console.error(`Failed to process offline item ${item.id}:`, error);
        failed++;
        item.retryCount++;
      }
    }

    // Remove successfully processed items
    const remainingQueue = queue.filter(item => item.retryCount < 3);
    this.offlineQueue.set(userId, remainingQueue);

    return { processed, failed, conflicts };
  }

  /**
   * Initialize default mobile configurations
   */
  private initializeDefaultConfigs(): void {
    // iOS Mobile
    this.deviceConfigs.set('ios_mobile', {
      maxPayloadSize: 50000, // 50KB
      imageQuality: 'medium',
      enableCompression: true,
      cacheStrategy: 'aggressive',
      offlineSupport: true,
      pushNotifications: true
    });

    // Android Mobile
    this.deviceConfigs.set('android_mobile', {
      maxPayloadSize: 60000, // 60KB
      imageQuality: 'medium',
      enableCompression: true,
      cacheStrategy: 'aggressive',
      offlineSupport: true,
      pushNotifications: true
    });

    // Tablet
    this.deviceConfigs.set('ios_tablet', {
      maxPayloadSize: 100000, // 100KB
      imageQuality: 'high',
      enableCompression: true,
      cacheStrategy: 'moderate',
      offlineSupport: true,
      pushNotifications: false
    });

    this.deviceConfigs.set('android_tablet', {
      maxPayloadSize: 100000, // 100KB
      imageQuality: 'high',
      enableCompression: true,
      cacheStrategy: 'moderate',
      offlineSupport: true,
      pushNotifications: false
    });
  }

  /**
   * Get default mobile configuration
   */
  private getDefaultMobileConfig(deviceInfo: MobileDeviceInfo): MobileOptimizationConfig {
    if (deviceInfo.deviceType === 'mobile') {
      return {
        maxPayloadSize: 50000,
        imageQuality: 'low',
        enableCompression: true,
        cacheStrategy: 'aggressive',
        offlineSupport: true,
        pushNotifications: true
      };
    }

    return {
      maxPayloadSize: 100000,
      imageQuality: 'medium',
      enableCompression: false,
      cacheStrategy: 'moderate',
      offlineSupport: false,
      pushNotifications: false
    };
  }

  /**
   * Optimize array payload for mobile
   */
  private optimizeArrayPayload(
    data: any[], 
    deviceInfo: MobileDeviceInfo, 
    config: MobileOptimizationConfig,
    optimizations: string[]
  ): any[] {
    // Limit array size for mobile devices
    if (deviceInfo.deviceType === 'mobile' && data.length > 20) {
      optimizations.push('array_truncated');
      data = data.slice(0, 20);
    }

    // Optimize each item in the array
    return data.map(item => this.optimizeObjectPayload(item, deviceInfo, config, optimizations));
  }

  /**
   * Optimize object payload for mobile
   */
  private optimizeObjectPayload(
    data: any, 
    deviceInfo: MobileDeviceInfo, 
    config: MobileOptimizationConfig,
    optimizations: string[]
  ): any {
    if (typeof data !== 'object' || data === null) return data;

    const optimized = { ...data };

    // Remove heavy fields for mobile
    if (deviceInfo.deviceType === 'mobile') {
      const heavyFields = ['description', 'notes', 'fullText', 'content', 'details'];
      heavyFields.forEach(field => {
        if (optimized[field] && typeof optimized[field] === 'string' && optimized[field].length > 100) {
          optimized[field] = optimized[field].substring(0, 100) + '...';
          optimizations.push(`${field}_truncated`);
        }
      });

      // Remove null/undefined fields
      Object.keys(optimized).forEach(key => {
        if (optimized[key] === null || optimized[key] === undefined) {
          delete optimized[key];
          optimizations.push('null_fields_removed');
        }
      });
    }

    return optimized;
  }

  /**
   * Get cache TTL based on strategy
   */
  private getCacheTTL(strategy: string): number {
    switch (strategy) {
      case 'aggressive': return 3600; // 1 hour
      case 'moderate': return 1800;   // 30 minutes
      case 'minimal': return 300;     // 5 minutes
      default: return 900;            // 15 minutes
    }
  }

  /**
   * Process individual offline item
   */
  private async processOfflineItem(item: OfflineQueueItem): Promise<boolean> {
    // Simulate processing - in real implementation, this would make actual API calls
    console.log(`Processing offline item: ${item.method} ${item.endpoint}`);
    
    // Simulate success/failure
    return Math.random() > 0.1; // 90% success rate
  }
}

// Export singleton instance
export const mobileApiService = MobileApiService.getInstance();

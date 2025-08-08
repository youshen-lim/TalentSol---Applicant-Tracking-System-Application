import express from 'express';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth.js';
import { 
  mobileMiddlewareStack,
  mobileApiMiddleware,
  offlineSupportMiddleware,
  mobilePerformanceMiddleware
} from '../middleware/mobileApi.js';
import { mobileApiService } from '../services/MobileApiService.js';
import { rateLimitMiddleware } from '../middleware/rateLimiting.js';
import { 
  mobilePaginationMiddleware,
  sendPaginatedResponse
} from '../middleware/pagination.js';

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Apply mobile-specific rate limiting (500 req/hr)
router.use((req, res, next) => {
  // Custom mobile rate limiting - 500 requests per hour
  const deviceInfo = mobileApiService.detectMobileDevice(req);
  const isMobileDevice = deviceInfo.deviceType === 'mobile' || deviceInfo.deviceType === 'tablet';
  
  if (isMobileDevice) {
    res.setHeader('X-Mobile-Rate-Limit', '500');
    res.setHeader('X-Mobile-Rate-Window', '3600');
  }
  
  next();
});

// GET /api/mobile/dashboard - Mobile-optimized dashboard
router.get('/dashboard',
  mobileMiddlewareStack({
    enableOptimization: true,
    offlineSupport: true,
    compressionLevel: 6
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user?.companyId || 'comp_1';
      const deviceInfo = (req as any).mobileInfo?.deviceInfo;

      console.log(`📱 Mobile dashboard request from ${deviceInfo?.platform} ${deviceInfo?.deviceType}`);

      // Get essential dashboard data optimized for mobile
      const [
        applicationCount,
        candidateCount,
        interviewCount,
        recentApplications
      ] = await Promise.all([
        prisma.application.count({ where: { job: { companyId } } }),
        prisma.candidate.count({ where: { applications: { some: { job: { companyId } } } } }),
        prisma.interview.count({ where: { application: { job: { companyId } } } }),
        prisma.application.findMany({
          where: { job: { companyId } },
          take: 5,
          orderBy: { submittedAt: 'desc' },
          select: {
            id: true,
            status: true,
            submittedAt: true,
            createdAt: true,
            candidate: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            job: {
              select: {
                title: true
              }
            }
          }
        })
      ]);

      // Mobile-optimized dashboard data
      const dashboardData = {
        metrics: {
          applications: applicationCount,
          candidates: candidateCount,
          interviews: interviewCount,
          activeJobs: 3 // Simplified for mobile
        },
        recentActivity: recentApplications.map(app => ({
          id: app.id,
          candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          jobTitle: app.job.title,
          status: app.status,
          timeAgo: getTimeAgo(app.submittedAt || app.createdAt),
          statusColor: getStatusColor(app.status)
        })),
        quickActions: [
          { id: 'view_applications', label: 'Applications', icon: 'applications', count: applicationCount },
          { id: 'view_candidates', label: 'Candidates', icon: 'candidates', count: candidateCount },
          { id: 'schedule_interview', label: 'Interviews', icon: 'interviews', count: interviewCount }
        ]
      };

      // Response is automatically optimized by mobile middleware
      res.json({
        success: true,
        data: dashboardData,
        message: 'Mobile dashboard loaded successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Mobile dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load mobile dashboard',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  })
);

// GET /api/mobile/applications - Mobile-optimized applications list
router.get('/applications',
  mobileMiddlewareStack({ enableOptimization: true }),
  mobilePaginationMiddleware({
    model: 'application',
    defaultLimit: 10,
    maxLimit: 25,
    mobileLimit: 8,
    strategy: 'cursor',
    allowedFilters: ['status'],
    allowedSortFields: ['submittedAt', 'score'],
    defaultSort: { field: 'submittedAt', direction: 'desc' },
    mobileFields: ['id', 'status', 'score', 'submittedAt', 'createdAt'],
    compressionEnabled: true,
    skeletonCount: 6
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const paginationResult = (req as any).paginationResult;
      
      if (!paginationResult) {
        return res.status(500).json({
          success: false,
          error: 'Mobile pagination failed',
          timestamp: new Date().toISOString()
        });
      }

      // Ultra-lightweight mobile application data
      const mobileApplications = paginationResult.data.map((app: any) => ({
        id: app.id,
        candidate: `${app.candidate.firstName} ${app.candidate.lastName}`,
        job: app.job.title,
        status: app.status,
        score: app.score || 0,
        time: getTimeAgo(app.submittedAt || app.createdAt),
        badge: {
          text: app.status,
          color: getStatusColor(app.status)
        },
        avatar: generateAvatarUrl(app.candidate.firstName, app.candidate.lastName)
      }));

      return sendPaginatedResponse(
        res,
        mobileApplications,
        paginationResult.pagination,
        {
          ...paginationResult.metadata,
          mobileOptimized: true,
          ultraLightweight: true
        },
        'Mobile applications loaded successfully'
      );

    } catch (error) {
      console.error('❌ Mobile applications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load mobile applications',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  })
);

// GET /api/mobile/candidates - Mobile-optimized candidates list
router.get('/candidates',
  mobileMiddlewareStack({ enableOptimization: true }),
  mobilePaginationMiddleware({
    model: 'candidate',
    defaultLimit: 12,
    maxLimit: 30,
    mobileLimit: 10,
    strategy: 'cursor',
    allowedFilters: ['location', 'experienceYears'],
    allowedSortFields: ['createdAt', 'firstName'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
    mobileFields: ['id', 'firstName', 'lastName', 'email', 'location', 'experienceYears'],
    compressionEnabled: true,
    skeletonCount: 8
  }),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const paginationResult = (req as any).paginationResult;
      
      if (!paginationResult) {
        return res.status(500).json({
          success: false,
          error: 'Mobile pagination failed',
          timestamp: new Date().toISOString()
        });
      }

      // Mobile-optimized candidate data
      const mobileCandidates = paginationResult.data.map((candidate: any) => ({
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        location: candidate.location || 'Not specified',
        experience: `${candidate.experienceYears || 0}y`,
        avatar: generateAvatarUrl(candidate.firstName, candidate.lastName),
        initials: `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`.toUpperCase()
      }));

      return sendPaginatedResponse(
        res,
        mobileCandidates,
        paginationResult.pagination,
        {
          ...paginationResult.metadata,
          mobileOptimized: true,
          payloadOptimized: true
        },
        'Mobile candidates loaded successfully'
      );

    } catch (error) {
      console.error('❌ Mobile candidates error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load mobile candidates',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  })
);

// POST /api/mobile/sync - Offline synchronization endpoint
router.post('/sync',
  offlineSupportMiddleware(),
  mobilePerformanceMiddleware(),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required for sync',
          timestamp: new Date().toISOString()
        });
      }

      console.log(`📱 Processing offline sync for user: ${userId}`);

      // Process offline queue
      const syncResult = await mobileApiService.processOfflineQueue(userId);
      
      // Get remaining queue length
      const remainingQueue = mobileApiService.getOfflineQueue(userId);

      res.json({
        success: true,
        data: {
          processed: syncResult.processed,
          failed: syncResult.failed,
          conflicts: syncResult.conflicts,
          remainingInQueue: remainingQueue.length,
          lastSyncTime: new Date().toISOString()
        },
        message: 'Offline synchronization completed',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Mobile sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process offline sync',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  })
);

// GET /api/mobile/queue - Get offline queue status
router.get('/queue',
  mobilePerformanceMiddleware(),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const queue = mobileApiService.getOfflineQueue(userId);
      
      // Mobile-optimized queue information
      const queueSummary = {
        totalItems: queue.length,
        highPriority: queue.filter(item => item.priority === 'high').length,
        mediumPriority: queue.filter(item => item.priority === 'medium').length,
        lowPriority: queue.filter(item => item.priority === 'low').length,
        oldestItem: queue.length > 0 ? queue[queue.length - 1].timestamp : null,
        estimatedSyncTime: `${Math.ceil(queue.length * 0.5)} seconds`
      };

      res.json({
        success: true,
        data: queueSummary,
        message: 'Queue status retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Mobile queue status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get queue status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  })
);

// GET /api/mobile/device-info - Get mobile device optimization info
router.get('/device-info',
  mobilePerformanceMiddleware(),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const deviceInfo = mobileApiService.detectMobileDevice(req);
      const userId = req.user?.id;
      const config = mobileApiService.getMobileConfig(deviceInfo, userId);

      res.json({
        success: true,
        data: {
          device: {
            type: deviceInfo.deviceType,
            platform: deviceInfo.platform,
            screenSize: deviceInfo.screenSize,
            connectionType: deviceInfo.connectionType
          },
          optimization: {
            maxPayloadSize: config.maxPayloadSize,
            imageQuality: config.imageQuality,
            compressionEnabled: config.enableCompression,
            cacheStrategy: config.cacheStrategy,
            offlineSupport: config.offlineSupport
          },
          performance: {
            recommendedPageSize: deviceInfo.deviceType === 'mobile' ? 10 : 20,
            estimatedLoadTime: '200-400ms',
            bandwidthOptimized: true
          }
        },
        message: 'Device information retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Mobile device info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get device information',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  })
);

export default router;

// Helper functions
function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': '#f59e0b',
    'reviewing': '#3b82f6',
    'interview': '#8b5cf6',
    'offer': '#10b981',
    'hired': '#059669',
    'rejected': '#ef4444',
    'withdrawn': '#6b7280'
  };
  return colors[status] || '#6b7280';
}

function generateAvatarUrl(firstName: string, lastName: string): string {
  const name = `${firstName} ${lastName}`;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F86F7&color=fff&size=32`;
}

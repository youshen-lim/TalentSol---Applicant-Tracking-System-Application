import { Request, Response, NextFunction } from 'express';
import { paginationService, PaginationOptions } from '../services/PaginationService.js';
import { AuthenticatedRequest } from './auth.js';

export interface PaginationMiddlewareOptions {
  model: string;
  defaultLimit?: number;
  maxLimit?: number;
  strategy?: 'cursor' | 'offset' | 'auto';
  allowedFilters?: string[];
  allowedSortFields?: string[];
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  include?: Record<string, any>;
  select?: Record<string, any>;
  cacheKey?: (req: Request) => string;
  cacheTTL?: number;
}

export interface MobilePaginationOptions extends PaginationMiddlewareOptions {
  mobileLimit?: number;
  mobileFields?: string[];
  compressionEnabled?: boolean;
  skeletonCount?: number;
}

/**
 * Standard pagination middleware
 */
export function paginationMiddleware(options: PaginationMiddlewareOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        model,
        defaultLimit = 20,
        maxLimit = 100,
        strategy = 'auto',
        allowedFilters = [],
        allowedSortFields = ['createdAt', 'updatedAt'],
        defaultSort = { field: 'createdAt', direction: 'desc' },
        include = {},
        select = {}
      } = options;

      // Parse pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || defaultLimit, maxLimit);
      const cursor = req.query.cursor as string;
      const sortField = allowedSortFields.includes(req.query.sort as string) 
        ? req.query.sort as string 
        : defaultSort.field;
      const sortDirection = (req.query.order as string) === 'asc' ? 'asc' : defaultSort.direction;

      // Build filters from query parameters
      const filters: Record<string, any> = {};
      
      // Add company filter for authenticated requests
      const companyId = (req as AuthenticatedRequest).user?.companyId;
      if (companyId && model !== 'company') {
        filters.companyId = companyId;
      }

      // Add allowed filters from query parameters
      allowedFilters.forEach(filterKey => {
        if (req.query[filterKey]) {
          const filterValue = req.query[filterKey] as string;
          
          // Handle different filter types
          if (filterValue.includes(',')) {
            // Multiple values - use 'in' operator
            filters[filterKey] = { in: filterValue.split(',') };
          } else if (filterValue.includes('*')) {
            // Wildcard search - use 'contains' operator
            filters[filterKey] = { contains: filterValue.replace(/\*/g, ''), mode: 'insensitive' };
          } else {
            // Exact match
            filters[filterKey] = filterValue;
          }
        }
      });

      // Handle search query
      if (req.query.search) {
        const searchTerm = req.query.search as string;
        filters.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ].filter(condition => {
          // Only include search conditions for fields that exist on the model
          const field = Object.keys(condition)[0];
          return ['name', 'title', 'description'].includes(field);
        });
      }

      // Determine pagination strategy
      let paginationStrategy = strategy;
      if (strategy === 'auto') {
        const recommendations = await paginationService.getPaginationRecommendations(model, filters);
        paginationStrategy = recommendations.recommendedStrategy;
      }

      // Build pagination options
      const paginationOptions: PaginationOptions = {
        limit,
        filters,
        orderBy: sortField,
        orderDirection: sortDirection,
        include: Object.keys(include).length > 0 ? include : undefined,
        select: Object.keys(select).length > 0 ? select : undefined
      };

      // Execute pagination
      let result;
      if (paginationStrategy === 'cursor' && cursor) {
        paginationOptions.cursor = cursor;
        result = await paginationService.paginateWithCursor(model, paginationOptions);
      } else if (paginationStrategy === 'cursor') {
        result = await paginationService.paginateWithCursor(model, paginationOptions);
      } else {
        result = await paginationService.paginateWithOffset(model, page, paginationOptions);
      }

      // Add pagination result to request for use in route handler
      (req as any).paginationResult = result;
      
      // Add pagination headers
      res.setHeader('X-Pagination-Strategy', paginationStrategy);
      res.setHeader('X-Pagination-Page-Size', limit);
      res.setHeader('X-Pagination-Query-Time', result.metadata.queryTime);
      
      if (result.metadata.optimizations.length > 0) {
        res.setHeader('X-Pagination-Optimizations', result.metadata.optimizations.join(','));
      }

      next();
    } catch (error) {
      console.error('Pagination middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Pagination failed',
        message: error instanceof Error ? error.message : 'Unknown pagination error',
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Mobile-optimized pagination middleware
 */
export function mobilePaginationMiddleware(options: MobilePaginationOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        mobileLimit = 10,
        mobileFields = [],
        compressionEnabled = true,
        skeletonCount = 5
      } = options;

      // Detect mobile client
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
      
      // Override options for mobile
      if (isMobile) {
        options.defaultLimit = mobileLimit;
        options.maxLimit = Math.min(options.maxLimit || 100, 50); // Cap mobile limit
        
        // Use mobile-specific field selection if provided
        if (mobileFields.length > 0) {
          options.select = mobileFields.reduce((acc, field) => {
            acc[field] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }

      // Add mobile-specific headers
      if (isMobile) {
        res.setHeader('X-Mobile-Optimized', 'true');
        res.setHeader('X-Skeleton-Count', skeletonCount);
        
        if (compressionEnabled) {
          res.setHeader('X-Compression-Enabled', 'true');
        }
      }

      // Call standard pagination middleware with modified options
      return paginationMiddleware(options)(req, res, next);
    } catch (error) {
      console.error('Mobile pagination middleware error:', error);
      next(error);
    }
  };
}

/**
 * Progressive loading middleware
 */
export function progressiveLoadingMiddleware(options: {
  model: string;
  priorityFields: string[];
  lazyFields: string[];
  prefetchRelations?: string[];
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { model, priorityFields, lazyFields, prefetchRelations = [] } = options;
      const id = req.params.id;

      if (!id) {
        return next(); // Skip if no ID parameter
      }

      const progressiveResult = await paginationService.loadProgressively(model, id, {
        priorityFields,
        lazyFields,
        prefetchRelations,
        chunkSize: 10,
        maxConcurrentChunks: 3
      });

      // Add progressive loading result to request
      (req as any).progressiveResult = progressiveResult;
      
      // Add progressive loading headers
      res.setHeader('X-Progressive-Loading', 'true');
      res.setHeader('X-Priority-Fields', priorityFields.join(','));
      res.setHeader('X-Lazy-Fields', lazyFields.join(','));

      next();
    } catch (error) {
      console.error('Progressive loading middleware error:', error);
      next(error);
    }
  };
}

/**
 * Infinite scroll middleware for mobile
 */
export function infiniteScrollMiddleware(options: PaginationMiddlewareOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Force cursor-based pagination for infinite scroll
      const infiniteScrollOptions = {
        ...options,
        strategy: 'cursor' as const,
        defaultLimit: options.defaultLimit || 20
      };

      // Add infinite scroll headers
      res.setHeader('X-Infinite-Scroll', 'true');
      res.setHeader('X-Pagination-Type', 'cursor');

      return paginationMiddleware(infiniteScrollOptions)(req, res, next);
    } catch (error) {
      console.error('Infinite scroll middleware error:', error);
      next(error);
    }
  };
}

/**
 * Skeleton loading configuration
 */
export const skeletonConfigs = {
  applications: {
    count: 5,
    fields: ['candidateName', 'jobTitle', 'status', 'submittedAt'],
    estimatedHeight: 120
  },
  candidates: {
    count: 8,
    fields: ['name', 'email', 'location', 'experience'],
    estimatedHeight: 100
  },
  jobs: {
    count: 6,
    fields: ['title', 'department', 'location', 'status'],
    estimatedHeight: 140
  },
  interviews: {
    count: 4,
    fields: ['candidateName', 'jobTitle', 'scheduledDate', 'type'],
    estimatedHeight: 110
  }
};

/**
 * Pagination response helper
 */
export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: any,
  metadata: any,
  message: string = 'Data retrieved successfully'
) {
  return res.json({
    success: true,
    data,
    pagination,
    metadata: {
      ...metadata,
      responseTime: Date.now(),
      dataCount: data.length
    },
    message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Progressive response helper
 */
export function sendProgressiveResponse<T>(
  req: Request,
  res: Response,
  priorityData: T,
  lazyPromise: Promise<Partial<T>>,
  message: string = 'Priority data loaded successfully'
) {
  // Send priority data immediately
  res.json({
    success: true,
    data: priorityData,
    progressive: {
      hasLazyData: true,
      lazyEndpoint: `${req.originalUrl}/lazy`,
      estimatedLazyLoadTime: '200-500ms'
    },
    message,
    timestamp: new Date().toISOString()
  });

  // Handle lazy loading in background (could be exposed via separate endpoint)
  lazyPromise.then(lazyData => {
    console.log('Lazy data loaded for progressive response:', Object.keys(lazyData));
  }).catch(error => {
    console.error('Lazy loading failed:', error);
  });
}

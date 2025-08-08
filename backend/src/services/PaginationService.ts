import { PrismaClient } from '@prisma/client';

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  include?: Record<string, any>;
  select?: Record<string, any>;
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
    totalCount?: number;
    currentPage: number;
    pageSize: number;
  };
  metadata: {
    queryTime: number;
    cacheHit: boolean;
    dataSource: 'database' | 'cache';
    optimizations: string[];
  };
}

export interface OffsetPaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  metadata: {
    queryTime: number;
    cacheHit: boolean;
    dataSource: 'database' | 'cache';
    optimizations: string[];
  };
}

export interface ProgressiveLoadingConfig {
  priorityFields: string[];
  lazyFields: string[];
  prefetchRelations: string[];
  chunkSize: number;
  maxConcurrentChunks: number;
}

export class PaginationService {
  private prisma: PrismaClient;
  private defaultLimit = 20;
  private maxLimit = 100;
  private performanceThreshold = 500; // ms

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Cursor-based pagination for large datasets
   */
  async paginateWithCursor<T>(
    model: string,
    options: PaginationOptions = {}
  ): Promise<CursorPaginationResult<T>> {
    const startTime = Date.now();
    const optimizations: string[] = [];

    const {
      limit = this.defaultLimit,
      cursor,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      filters = {},
      include = {},
      select = {}
    } = options;

    // Validate and sanitize limit
    const sanitizedLimit = Math.min(Math.max(1, limit), this.maxLimit);
    if (sanitizedLimit !== limit) {
      optimizations.push(`limit_capped_to_${sanitizedLimit}`);
    }

    try {
      // Build where clause
      const whereClause: any = { ...filters };
      
      // Add cursor condition for pagination
      if (cursor) {
        const cursorCondition = this.buildCursorCondition(cursor, orderBy, orderDirection);
        whereClause.AND = whereClause.AND ? [...whereClause.AND, cursorCondition] : [cursorCondition];
        optimizations.push('cursor_pagination');
      }

      // Build query options
      const queryOptions: any = {
        where: whereClause,
        take: sanitizedLimit + 1, // Take one extra to check if there's a next page
        orderBy: { [orderBy]: orderDirection }
      };

      // Add include or select
      if (Object.keys(select).length > 0) {
        queryOptions.select = select;
        optimizations.push('field_selection');
      } else if (Object.keys(include).length > 0) {
        queryOptions.include = include;
        optimizations.push('relation_inclusion');
      }

      // Execute query
      const results = await (this.prisma as any)[model].findMany(queryOptions);
      
      // Check if there's a next page
      const hasNextPage = results.length > sanitizedLimit;
      if (hasNextPage) {
        results.pop(); // Remove the extra record
      }

      // Generate cursors
      const nextCursor = hasNextPage && results.length > 0 
        ? this.generateCursor(results[results.length - 1], orderBy)
        : undefined;

      const previousCursor = cursor; // In a full implementation, you'd track previous cursors

      const queryTime = Date.now() - startTime;
      
      // Add performance optimization suggestions
      if (queryTime > this.performanceThreshold) {
        optimizations.push('consider_indexing');
      }

      return {
        data: results as T[],
        pagination: {
          hasNextPage,
          hasPreviousPage: !!cursor,
          nextCursor,
          previousCursor,
          currentPage: cursor ? -1 : 1, // Cursor pagination doesn't have traditional page numbers
          pageSize: sanitizedLimit
        },
        metadata: {
          queryTime,
          cacheHit: false,
          dataSource: 'database',
          optimizations
        }
      };

    } catch (error) {
      console.error('Cursor pagination error:', error);
      throw new Error(`Pagination failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Offset-based pagination for smaller datasets with total count
   */
  async paginateWithOffset<T>(
    model: string,
    page: number = 1,
    options: PaginationOptions = {}
  ): Promise<OffsetPaginationResult<T>> {
    const startTime = Date.now();
    const optimizations: string[] = [];

    const {
      limit = this.defaultLimit,
      filters = {},
      include = {},
      select = {},
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = options;

    // Validate and sanitize inputs
    const sanitizedLimit = Math.min(Math.max(1, limit), this.maxLimit);
    const sanitizedPage = Math.max(1, page);
    const offset = (sanitizedPage - 1) * sanitizedLimit;

    try {
      // Build query options
      const queryOptions: any = {
        where: filters,
        skip: offset,
        take: sanitizedLimit,
        orderBy: { [orderBy]: orderDirection }
      };

      // Add include or select
      if (Object.keys(select).length > 0) {
        queryOptions.select = select;
        optimizations.push('field_selection');
      } else if (Object.keys(include).length > 0) {
        queryOptions.include = include;
        optimizations.push('relation_inclusion');
      }

      // Execute queries in parallel
      const [results, totalCount] = await Promise.all([
        (this.prisma as any)[model].findMany(queryOptions),
        (this.prisma as any)[model].count({ where: filters })
      ]);

      const totalPages = Math.ceil(totalCount / sanitizedLimit);
      const queryTime = Date.now() - startTime;

      // Add performance optimization suggestions
      if (queryTime > this.performanceThreshold) {
        optimizations.push('consider_cursor_pagination');
      }
      if (totalCount > 10000) {
        optimizations.push('large_dataset_detected');
      }

      return {
        data: results as T[],
        pagination: {
          currentPage: sanitizedPage,
          pageSize: sanitizedLimit,
          totalPages,
          totalCount,
          hasNextPage: sanitizedPage < totalPages,
          hasPreviousPage: sanitizedPage > 1
        },
        metadata: {
          queryTime,
          cacheHit: false,
          dataSource: 'database',
          optimizations
        }
      };

    } catch (error) {
      console.error('Offset pagination error:', error);
      throw new Error(`Pagination failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Progressive loading for complex data structures
   */
  async loadProgressively<T>(
    model: string,
    id: string,
    config: ProgressiveLoadingConfig
  ): Promise<{
    priority: Partial<T>;
    lazy: Promise<Partial<T>>;
    prefetch: Promise<any>;
  }> {
    const startTime = Date.now();

    try {
      // Load priority fields first
      const priorityData = await (this.prisma as any)[model].findUnique({
        where: { id },
        select: this.buildSelectObject(config.priorityFields)
      });

      // Create lazy loading promise for non-critical fields
      const lazyPromise = this.loadLazyFields(model, id, config.lazyFields);

      // Create prefetch promise for related data
      const prefetchPromise = this.prefetchRelatedData(model, id, config.prefetchRelations);

      console.log(`Progressive loading initiated for ${model}:${id} in ${Date.now() - startTime}ms`);

      return {
        priority: priorityData,
        lazy: lazyPromise,
        prefetch: prefetchPromise
      };

    } catch (error) {
      console.error('Progressive loading error:', error);
      throw new Error(`Progressive loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build cursor condition for pagination
   */
  private buildCursorCondition(cursor: string, orderBy: string, orderDirection: 'asc' | 'desc'): any {
    try {
      const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString());
      const operator = orderDirection === 'asc' ? 'gt' : 'lt';
      
      return {
        [orderBy]: {
          [operator]: cursorData[orderBy]
        }
      };
    } catch (error) {
      throw new Error('Invalid cursor format');
    }
  }

  /**
   * Generate cursor for pagination
   */
  private generateCursor(record: any, orderBy: string): string {
    const cursorData = { [orderBy]: record[orderBy] };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  /**
   * Build select object from field array
   */
  private buildSelectObject(fields: string[]): Record<string, boolean> {
    const select: Record<string, boolean> = {};
    fields.forEach(field => {
      select[field] = true;
    });
    return select;
  }

  /**
   * Load lazy fields asynchronously
   */
  private async loadLazyFields<T>(model: string, id: string, lazyFields: string[]): Promise<Partial<T>> {
    if (lazyFields.length === 0) return {};

    try {
      const lazyData = await (this.prisma as any)[model].findUnique({
        where: { id },
        select: this.buildSelectObject(lazyFields)
      });

      return lazyData || {};
    } catch (error) {
      console.error('Lazy loading error:', error);
      return {};
    }
  }

  /**
   * Prefetch related data
   */
  private async prefetchRelatedData(model: string, id: string, relations: string[]): Promise<any> {
    if (relations.length === 0) return {};

    try {
      const include: Record<string, boolean> = {};
      relations.forEach(relation => {
        include[relation] = true;
      });

      const relatedData = await (this.prisma as any)[model].findUnique({
        where: { id },
        include
      });

      return relatedData || {};
    } catch (error) {
      console.error('Prefetch error:', error);
      return {};
    }
  }

  /**
   * Get pagination recommendations based on dataset size
   */
  async getPaginationRecommendations(model: string, filters: Record<string, any> = {}): Promise<{
    recommendedStrategy: 'cursor' | 'offset';
    recommendedPageSize: number;
    estimatedTotalRecords: number;
    performanceNotes: string[];
  }> {
    try {
      const totalCount = await (this.prisma as any)[model].count({ where: filters });
      const performanceNotes: string[] = [];

      let recommendedStrategy: 'cursor' | 'offset' = 'offset';
      let recommendedPageSize = this.defaultLimit;

      if (totalCount > 10000) {
        recommendedStrategy = 'cursor';
        performanceNotes.push('Large dataset detected - cursor pagination recommended');
      }

      if (totalCount > 1000) {
        recommendedPageSize = Math.min(50, this.maxLimit);
        performanceNotes.push('Increased page size for better performance');
      }

      if (totalCount < 100) {
        recommendedPageSize = Math.max(totalCount, 10);
        performanceNotes.push('Small dataset - consider loading all at once');
      }

      return {
        recommendedStrategy,
        recommendedPageSize,
        estimatedTotalRecords: totalCount,
        performanceNotes
      };
    } catch (error) {
      console.error('Pagination recommendations error:', error);
      return {
        recommendedStrategy: 'offset',
        recommendedPageSize: this.defaultLimit,
        estimatedTotalRecords: 0,
        performanceNotes: ['Error calculating recommendations - using defaults']
      };
    }
  }
}

// Export singleton instance
export const paginationService = new PaginationService(new PrismaClient());

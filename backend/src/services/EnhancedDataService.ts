import { PrismaClient } from '@prisma/client';
import { Cached, InvalidateCache } from '../cache/decorators.js';
import { analyticsCache } from '../cache/AnalyticsCache.js';

const prisma = new PrismaClient();

/**
 * Enhanced Data Service - Centralized Data Models with Pre-aggregation
 * Provides semantic layer benefits without the complexity overhead
 */

export interface DataModel {
  query: string;
  cacheKey: string;
  ttl: number;
  tags: string[];
}

export interface DashboardMetrics {
  totalCandidates: number;
  totalApplications: number;
  totalInterviews: number;
  activeJobs: number;
  conversionRate: number;
  averageTimeToHire: number;
  topSources: Array<{ source: string; count: number; percentage: number }>;
  recentActivity: Array<{ date: string; applications: number; interviews: number }>;
}

export interface CandidateAnalytics {
  candidateId: string;
  name: string;
  totalApplications: number;
  successRate: number;
  averageScore: number;
  timeToHire?: number;
  preferredSources: string[];
  skillsExtracted: string[];
}

export class EnhancedDataService {
  
  // Centralized data models with optimized queries
  private static readonly DATA_MODELS = {
    DASHBOARD_OVERVIEW: {
      query: `
        WITH company_stats AS (
          SELECT 
            COUNT(DISTINCT c.id) as total_candidates,
            COUNT(DISTINCT a.id) as total_applications,
            COUNT(DISTINCT i.id) as total_interviews,
            COUNT(DISTINCT CASE WHEN j.status = 'open' THEN j.id END) as active_jobs,
            COUNT(CASE WHEN a.status = 'hired' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0) as conversion_rate,
            AVG(CASE 
              WHEN a.hired_at IS NOT NULL AND a.submitted_at IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (a.hired_at - a.submitted_at)) / 86400 
            END) as avg_time_to_hire
          FROM jobs j
          LEFT JOIN applications a ON j.id = a.job_id
          LEFT JOIN candidates c ON a.candidate_id = c.id
          LEFT JOIN interviews i ON a.id = i.application_id
          WHERE j.company_id = $1
        )
        SELECT * FROM company_stats
      `,
      cacheKey: 'dashboard_overview',
      ttl: 900, // 15 minutes
      tags: ['dashboard', 'overview']
    },

    CANDIDATE_SOURCES: {
      query: `
        SELECT 
          COALESCE(cs.name, 'Unknown') as source,
          COUNT(a.id) as count,
          COUNT(a.id) * 100.0 / SUM(COUNT(a.id)) OVER() as percentage
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN candidates c ON a.candidate_id = c.id
        LEFT JOIN candidate_sources cs ON c.source_id = cs.id
        WHERE j.company_id = $1
        GROUP BY cs.name
        ORDER BY count DESC
        LIMIT 10
      `,
      cacheKey: 'candidate_sources',
      ttl: 1800, // 30 minutes
      tags: ['dashboard', 'sources']
    },

    TIME_SERIES_ACTIVITY: {
      query: `
        SELECT 
          DATE_TRUNC('day', a.submitted_at) as date,
          COUNT(a.id) as applications,
          COUNT(i.id) as interviews,
          COUNT(CASE WHEN a.status = 'hired' THEN 1 END) as hires
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN interviews i ON a.id = i.application_id
        WHERE j.company_id = $1
          AND a.submitted_at >= $2
        GROUP BY DATE_TRUNC('day', a.submitted_at)
        ORDER BY date DESC
        LIMIT 30
      `,
      cacheKey: 'time_series_activity',
      ttl: 600, // 10 minutes
      tags: ['dashboard', 'timeseries']
    },

    CANDIDATE_ANALYTICS: {
      query: `
        SELECT 
          c.id as candidate_id,
          c.first_name || ' ' || c.last_name as name,
          COUNT(a.id) as total_applications,
          COUNT(CASE WHEN a.status = 'hired' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0) as success_rate,
          AVG(a.score) as average_score,
          AVG(CASE 
            WHEN a.hired_at IS NOT NULL AND a.submitted_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (a.hired_at - a.submitted_at)) / 86400 
          END) as time_to_hire,
          ARRAY_AGG(DISTINCT cs.name) FILTER (WHERE cs.name IS NOT NULL) as preferred_sources,
          ARRAY_AGG(DISTINCT se.skills) FILTER (WHERE se.skills IS NOT NULL) as skills_extracted
        FROM candidates c
        JOIN applications a ON c.id = a.candidate_id
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN candidate_sources cs ON c.source_id = cs.id
        LEFT JOIN skill_extractions se ON c.id = se.candidate_id
        WHERE j.company_id = $1
        GROUP BY c.id, c.first_name, c.last_name
        ORDER BY total_applications DESC, success_rate DESC
      `,
      cacheKey: 'candidate_analytics',
      ttl: 1800, // 30 minutes
      tags: ['analytics', 'candidates']
    }
  };

  @Cached({
    strategy: 'dashboard_cache',
    ttl: 900,
    tags: ['dashboard', 'overview'],
    keyGenerator: (companyId: string) => `enhanced_dashboard_${companyId}`,
  })
  async getDashboardMetrics(companyId: string): Promise<DashboardMetrics> {
    console.log('🔍 Generating enhanced dashboard metrics...');

    // Execute optimized queries in parallel
    const [overviewData, sourcesData, activityData] = await Promise.all([
      this.executeDataModel('DASHBOARD_OVERVIEW', [companyId]),
      this.executeDataModel('CANDIDATE_SOURCES', [companyId]),
      this.executeDataModel('TIME_SERIES_ACTIVITY', [companyId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)])
    ]);

    const overview = overviewData[0] || {};
    
    return {
      totalCandidates: parseInt(overview.total_candidates) || 0,
      totalApplications: parseInt(overview.total_applications) || 0,
      totalInterviews: parseInt(overview.total_interviews) || 0,
      activeJobs: parseInt(overview.active_jobs) || 0,
      conversionRate: parseFloat(overview.conversion_rate) || 0,
      averageTimeToHire: parseFloat(overview.avg_time_to_hire) || 0,
      topSources: sourcesData.map((source: any) => ({
        source: source.source,
        count: parseInt(source.count),
        percentage: parseFloat(source.percentage)
      })),
      recentActivity: activityData.map((activity: any) => ({
        date: activity.date.toISOString().split('T')[0],
        applications: parseInt(activity.applications) || 0,
        interviews: parseInt(activity.interviews) || 0
      }))
    };
  }

  @Cached({
    strategy: 'analytics_cache',
    ttl: 1800,
    tags: ['analytics', 'candidates'],
    keyGenerator: (companyId: string) => `candidate_analytics_${companyId}`,
  })
  async getCandidateAnalytics(companyId: string): Promise<CandidateAnalytics[]> {
    console.log('📊 Generating candidate analytics...');

    const analyticsData = await this.executeDataModel('CANDIDATE_ANALYTICS', [companyId]);

    return analyticsData.map((candidate: any) => ({
      candidateId: candidate.candidate_id,
      name: candidate.name,
      totalApplications: parseInt(candidate.total_applications) || 0,
      successRate: parseFloat(candidate.success_rate) || 0,
      averageScore: parseFloat(candidate.average_score) || 0,
      timeToHire: candidate.time_to_hire ? parseFloat(candidate.time_to_hire) : undefined,
      preferredSources: candidate.preferred_sources || [],
      skillsExtracted: candidate.skills_extracted || []
    }));
  }

  // Pre-aggregation service for heavy computations
  async createMaterializedViews(companyId: string): Promise<void> {
    console.log(`🏗️ Creating materialized views for company ${companyId}...`);

    try {
      // Create company-specific materialized view for dashboard metrics
      await prisma.$executeRaw`
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_company_${companyId}_dashboard AS
        SELECT 
          'overview' as metric_type,
          jsonb_build_object(
            'total_candidates', COUNT(DISTINCT c.id),
            'total_applications', COUNT(DISTINCT a.id),
            'total_interviews', COUNT(DISTINCT i.id),
            'active_jobs', COUNT(DISTINCT CASE WHEN j.status = 'open' THEN j.id END),
            'conversion_rate', COUNT(CASE WHEN a.status = 'hired' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0),
            'last_updated', NOW()
          ) as metrics
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        LEFT JOIN candidates c ON a.candidate_id = c.id
        LEFT JOIN interviews i ON a.id = i.application_id
        WHERE j.company_id = '${companyId}'
      `;

      console.log(`✅ Materialized views created for company ${companyId}`);
    } catch (error) {
      console.warn('⚠️ Materialized view creation failed (may already exist):', error);
    }
  }

  async refreshMaterializedViews(companyId: string): Promise<void> {
    try {
      await prisma.$executeRaw`REFRESH MATERIALIZED VIEW mv_company_${companyId}_dashboard`;
      console.log(`🔄 Refreshed materialized views for company ${companyId}`);
    } catch (error) {
      console.warn('⚠️ Materialized view refresh failed:', error);
    }
  }

  // Smart cache invalidation based on data changes
  @InvalidateCache({
    strategies: ['dashboard_cache', 'analytics_cache'],
    tags: ['dashboard', 'analytics'],
  })
  async invalidateCompanyCache(companyId: string): Promise<void> {
    console.log(`🗑️ Invalidating cache for company ${companyId}...`);
    
    // Invalidate specific cache keys
    await analyticsCache.invalidate('data_change', companyId);

    // Refresh materialized views in background
    this.refreshMaterializedViews(companyId).catch(console.warn);
  }

  // Event handlers for automatic cache invalidation
  async onApplicationCreated(companyId: string): Promise<void> {
    await this.invalidateCompanyCache(companyId);
  }

  async onCandidateUpdated(companyId: string): Promise<void> {
    await this.invalidateCompanyCache(companyId);
  }

  async onInterviewScheduled(companyId: string): Promise<void> {
    await this.invalidateCompanyCache(companyId);
  }

  // Execute data model with caching
  private async executeDataModel(modelName: keyof typeof EnhancedDataService.DATA_MODELS, params: any[]): Promise<any[]> {
    const model = EnhancedDataService.DATA_MODELS[modelName];
    const cacheKey = `${model.cacheKey}_${params.join('_')}`;

    // Try cache first
    const cached = await analyticsCache.get(cacheKey, 'semantic-layer');
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // Execute query
    const result = await prisma.$queryRawUnsafe(model.query, ...params);

    // Cache result
    await analyticsCache.set(cacheKey, result, 'semantic-layer', model.ttl);

    return Array.isArray(result) ? result : [result] as any[];
  }

  // Performance monitoring
  async getQueryPerformanceStats(): Promise<any> {
    const summary = analyticsCache.getCachePerformanceSummary();
    return {
      cacheHitRate: summary.totalHitRate,
      totalQueries: summary.totalRequests,
      averageQueryTime: summary.averageResponseTime || 0,
      cachedQueries: summary.totalRequests * (summary.totalHitRate / 100),
      uncachedQueries: summary.totalRequests * ((100 - summary.totalHitRate) / 100)
    };
  }

  // Health check for data service
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const startTime = Date.now();
      
      // Test basic query
      await prisma.candidate.count();
      
      const queryTime = Date.now() - startTime;
      const cacheStats = await this.getQueryPerformanceStats();

      return {
        status: 'healthy',
        details: {
          queryTime: `${queryTime}ms`,
          cacheHitRate: `${cacheStats.cacheHitRate}%`,
          totalQueries: cacheStats.totalQueries
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

export const enhancedDataService = new EnhancedDataService();

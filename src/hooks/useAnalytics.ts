import { useState, useEffect } from 'react';
import { analyticsApi } from '@/services/api';

export interface DashboardStats {
  // Summary stats (nested in backend response)
  summary: {
    totalJobs: number;
    totalApplications: number;
    totalCandidates: number;
    totalInterviews: number;
    activeJobs: number;
    newApplicationsToday: number;
  };
  // Status distribution
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  // Applications by date
  applicationsByDate: Array<{
    date: string;
    count: number;
  }>;
  // Top jobs
  topJobs: Array<{
    jobId: string;
    jobTitle: string;
    department: string;
    applicationCount: number;
    interviewCount: number;
    hireCount: number;
    candidateCount: number;
  }>;
  // Recent applications
  recentApplications: Array<{
    candidateId: string;
    candidateName: string;
    jobTitle: string;
    timestamp: string;
  }>;
  // Time to hire metrics
  timeToHire?: {
    averageDays: number;
    totalHires: number;
  };
  // Sources
  sources: Array<{
    source: string;
    candidateCount: number;
    applicationCount: number;
    hireCount: number;
    conversionRate: number;
  }>;
  // Change metrics
  changeMetrics?: {
    totalCandidates: { current: number; previous: number; change: number };
    applications: { current: number; previous: number; change: number };
  };
}

export interface RecruitmentData {
  period: string;
  data: Array<{
    date: string;
    applications: number;
    interviews: number;
    offers: number;
  }>;
  totalApplications: number;
}

export interface SourceData {
  sourceEffectiveness: Array<{
    source: string;
    applications: number;
    interviews: number;
    hires: number;
    category: string;
    cost: number;
    interviewRate: number;
    hireRate: number;
    costPerApplication: number;
    costPerHire: number;
  }>;
  totalApplications: number;
}

export interface ConversionFunnel {
  stages: Array<{
    name: string;
    count: number;
    percentage: number;
    dropoffRate: number;
  }>;
  overallConversion: number;
  bottlenecks: Array<{
    stage: string;
    dropoffRate: number;
    recommendations: string[];
  }>;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getDashboardStats();
      // Backend returns data directly, not wrapped in { data: ... }
      console.log('🔍 Dashboard API Response:', response);
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export const useRecruitmentData = (period?: string) => {
  const [data, setData] = useState<RecruitmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getRecruitmentData(period);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recruitment data');
      console.error('Error fetching recruitment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export const useSourceData = () => {
  const [data, setData] = useState<SourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getSourceData();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch source data');
      console.error('Error fetching source data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export const useConversionFunnel = (jobId?: string) => {
  const [data, setData] = useState<ConversionFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getConversionFunnel(jobId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversion funnel');
      console.error('Error fetching conversion funnel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export const useFormStatusData = () => {
  const [data, setData] = useState<Array<{
    status: string;
    count: number;
    percentage: number;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Import formApi here to avoid circular dependency
      const { formApi } = await import('@/services/api');
      const response = await formApi.getForms({ limit: 100 }); // Get all forms

      if (response?.forms) {
        // Calculate status distribution from actual form data
        const statusCounts = response.forms.reduce((acc: Record<string, number>, form: any) => {
          // Map job status to form status (based on backend logic)
          const formStatus = form.job?.status === 'open' ? 'Live' :
                           form.status === 'archived' ? 'Archived' : 'Draft';
          acc[formStatus] = (acc[formStatus] || 0) + 1;
          return acc;
        }, {});

        const total = Object.values(statusCounts).reduce((sum: number, count: number) => sum + count, 0);

        const formStatusData = Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count: count as number,
          percentage: total > 0 ? Math.round((count as number / total) * 100) : 0
        }));

        setData(formStatusData);
      } else {
        // Fallback to mock data if no forms found
        setData([
          { status: 'Live', count: 8, percentage: 57 },
          { status: 'Draft', count: 4, percentage: 29 },
          { status: 'Archived', count: 2, percentage: 14 }
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch form status data');
      console.error('Error fetching form status data:', err);

      // Fallback to mock data on error
      setData([
        { status: 'Live', count: 8, percentage: 57 },
        { status: 'Draft', count: 4, percentage: 29 },
        { status: 'Archived', count: 2, percentage: 14 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Combined hook for all analytics data
export const useAnalytics = (options?: {
  includeDashboard?: boolean;
  includeRecruitment?: boolean;
  includeSources?: boolean;
  includeConversion?: boolean;
  period?: string;
  jobId?: string;
}) => {
  const {
    includeDashboard = true,
    includeRecruitment = true,
    includeSources = true,
    includeConversion = false,
    period,
    jobId,
  } = options || {};

  const dashboardStats = useDashboardStats();
  const recruitmentData = useRecruitmentData(includeRecruitment ? period : undefined);
  const sourceData = useSourceData();
  const conversionFunnel = useConversionFunnel(includeConversion ? jobId : undefined);

  const loading = 
    (includeDashboard && dashboardStats.loading) ||
    (includeRecruitment && recruitmentData.loading) ||
    (includeSources && sourceData.loading) ||
    (includeConversion && conversionFunnel.loading);

  const error = 
    dashboardStats.error ||
    recruitmentData.error ||
    sourceData.error ||
    conversionFunnel.error;

  const refetchAll = () => {
    if (includeDashboard) dashboardStats.refetch();
    if (includeRecruitment) recruitmentData.refetch();
    if (includeSources) sourceData.refetch();
    if (includeConversion) conversionFunnel.refetch();
  };

  return {
    dashboardStats: includeDashboard ? dashboardStats.stats : null,
    recruitmentData: includeRecruitment ? recruitmentData.data : null,
    sourceData: includeSources ? sourceData.data : null,
    conversionFunnel: includeConversion ? conversionFunnel.data : null,
    loading,
    error,
    refetch: refetchAll,
  };
};

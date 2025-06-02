import { useState, useEffect } from 'react';
import { analyticsApi } from '@/services/api';

export interface DashboardStats {
  totalApplications: number;
  newApplications: number;
  conversionRate: number;
  averageScore: number;
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  interviewsScheduled: number;
  offersExtended: number;
  hires: number;
  applicationsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    candidateName?: string;
    jobTitle?: string;
  }>;
}

export interface RecruitmentData {
  period: string;
  data: Array<{
    name: string;
    applications: number;
    interviews: number;
    offers: number;
    hires: number;
  }>;
  trends: {
    applications: number;
    interviews: number;
    offers: number;
    hires: number;
  };
}

export interface SourceData {
  sources: Array<{
    name: string;
    candidates: number;
    applications: number;
    percentage: number;
    conversionRate: number;
  }>;
  totalSources: number;
  topPerformer: string;
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
      setStats(response.data);
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
      setData(response.data);
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
      setData(response.data);
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
      setData(response.data);
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

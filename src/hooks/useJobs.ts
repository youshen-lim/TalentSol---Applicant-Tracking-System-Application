import { useState, useEffect } from 'react';
import { jobsApi } from '@/services/api';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: {
    type: string;
    allowRemote: boolean;
    country: string;
    city?: string;
    state?: string;
  };
  employmentType: string;
  experienceLevel: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    payFrequency?: string;
  };
  description: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  skills: string[];
  benefits: string;
  status: string;
  visibility: string;
  postedDate: string;
  applicationDeadline?: string;
  maxApplicants?: number;
  currentApplicants: number;
  pipeline: {
    screening: number;
    interview: number;
    assessment: number;
    offer: number;
  };
  source: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface UseJobsParams {
  page?: number;
  limit?: number;
  status?: string;
  department?: string;
  search?: string;
}

export interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  refetch: () => void;
}

export const useJobs = (params?: UseJobsParams): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page || 1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApi.getJobs(params);
      
      if (response.data) {
        setJobs(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(response.pagination?.page || 1);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [params?.page, params?.limit, params?.status, params?.department, params?.search]);

  return {
    jobs,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    refetch: fetchJobs,
  };
};

export const useJob = (id: string) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApi.getJob(id);
      setJob(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  return {
    job,
    loading,
    error,
    refetch: fetchJob,
  };
};

export const useJobStats = (id: string) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApi.getJobStats(id);
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job statistics');
      console.error('Error fetching job stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStats();
    }
  }, [id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook for creating a new job
export const useCreateJob = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = async (jobData: Partial<Job>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApi.createJob(jobData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createJob,
    loading,
    error,
  };
};

// Hook for updating a job
export const useUpdateJob = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApi.updateJob(id, jobData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateJob,
    loading,
    error,
  };
};

// Hook for deleting a job
export const useDeleteJob = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJob = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await jobsApi.deleteJob(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteJob,
    loading,
    error,
  };
};

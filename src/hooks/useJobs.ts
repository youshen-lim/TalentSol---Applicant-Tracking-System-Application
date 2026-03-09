import { useState, useEffect } from 'react';
import { jobsApi } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

// Backend job structure (what we receive from API)
interface BackendJob {
  id: string;
  title: string;
  department: string;
  location: {
    city?: string;
    state?: string;
    remote: boolean;
  } | null;
  employmentType: string; // "full_time", "part_time", etc.
  experienceLevel: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  } | null;
  description: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  skills: string[];
  benefits: string | null;
  status: string;
  visibility: string;
  postedDate: string | null;
  applicationDeadline?: string | null;
  maxApplicants?: number | null;
  pipeline: any; // null in backend
  source: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
  };
  createdById: string;
  companyId: string;
  _count?: {
    applications: number;
  };
}

// Frontend job structure (what we use in components)
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
  daysOpen?: number;
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

// Helper function to safely parse JSON strings
const safeJsonParse = (jsonString: any, fallback: any = null) => {
  if (typeof jsonString === 'object' && jsonString !== null) {
    return jsonString; // Already an object
  }
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn('Failed to parse JSON:', jsonString, e);
      return fallback;
    }
  }
  return fallback;
};

// Transform backend job to frontend job structure
const transformBackendJob = (backendJob: BackendJob): Job => {
  // Handle location data (could be JSON string or object)
  const locationData = safeJsonParse(backendJob.location, {});
  const isRemote = locationData.remote || false;

  // Handle salary data (could be JSON string or object)
  const salaryData = safeJsonParse(backendJob.salary, { min: 0, max: 0, currency: 'USD' });

  // Handle array fields that might be JSON strings
  const responsibilities = safeJsonParse(backendJob.responsibilities, []);
  const requiredQualifications = safeJsonParse(backendJob.requiredQualifications, []);
  const preferredQualifications = safeJsonParse(backendJob.preferredQualifications, []);
  const skills = safeJsonParse(backendJob.skills, []);

  return {
    id: backendJob.id,
    title: backendJob.title,
    department: backendJob.department,
    location: {
      type: isRemote ? 'remote' : 'onsite',
      allowRemote: isRemote,
      country: 'US', // Default to US
      city: locationData.city,
      state: locationData.state,
    },
    employmentType: backendJob.employmentType.replace('_', '-'), // Convert "full_time" to "full-time"
    experienceLevel: backendJob.experienceLevel,
    salary: {
      min: salaryData.min || 0,
      max: salaryData.max || 0,
      currency: salaryData.currency || 'USD',
      payFrequency: 'annual',
    },
    description: backendJob.description,
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    requiredQualifications: Array.isArray(requiredQualifications) ? requiredQualifications : [],
    preferredQualifications: Array.isArray(preferredQualifications) ? preferredQualifications : [],
    skills: Array.isArray(skills) ? skills : [],
    benefits: backendJob.benefits || '',
    status: backendJob.status,
    visibility: backendJob.visibility,
    postedDate: backendJob.postedDate || backendJob.createdAt,
    applicationDeadline: backendJob.applicationDeadline || undefined,
    maxApplicants: backendJob.maxApplicants || undefined,
    currentApplicants: backendJob._count?.applications || 0,
    daysOpen: backendJob.postedDate
      ? Math.floor((Date.now() - new Date(backendJob.postedDate).getTime()) / 86400000)
      : 0,
    pipeline: {
      screening: 0,
      interview: 0,
      assessment: 0,
      offer: 0,
    },
    source: backendJob.source,
    createdAt: backendJob.createdAt,
    updatedAt: backendJob.updatedAt,
    company: backendJob.company,
    createdBy: {
      id: backendJob.createdById,
      firstName: 'User', // Default values since backend doesn't provide this
      lastName: 'Admin',
    },
  };
};

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

      // Handle the actual backend response structure: { success, data: Job[], pagination }
      if (response.data) {
        const transformedJobs = response.data.map((backendJob: BackendJob) => transformBackendJob(backendJob));
        setJobs(transformedJobs);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(response.pagination?.page || 1);
        setTotal(response.pagination?.total || 0);
        setError(null);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('Jobs API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      setJobs([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotal(0);
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
      // Transform backend job to frontend structure
      const transformedJob = transformBackendJob(response);
      setJob(transformedJob);
    } catch (err) {
      console.error('Failed to fetch job:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
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

// Hook for creating a new job with state management
export const useCreateJob = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = async (jobData: Partial<Job>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobsApi.createJob(jobData);

      // Call success callback to trigger refetch
      if (onSuccess) {
        onSuccess();
      }

      return response.data;
    } catch (err) {
      console.error('Failed to create job:', err);
      setError(err instanceof Error ? err.message : 'Failed to create job');
      toast({ title: 'Error', description: 'Failed to create job', variant: 'destructive' });
      throw err;
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobsApi.updateJob(id, jobData);
      return response.data;
    } catch (err) {
      console.error('Failed to update job:', err);
      setError(err instanceof Error ? err.message : 'Failed to update job');
      toast({ title: 'Error', description: 'Failed to update job', variant: 'destructive' });
      throw err;
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJob = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await jobsApi.deleteJob(id);
      return true;
    } catch (err) {
      console.error('Failed to delete job:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      toast({ title: 'Error', description: 'Failed to delete job', variant: 'destructive' });
      throw err;
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

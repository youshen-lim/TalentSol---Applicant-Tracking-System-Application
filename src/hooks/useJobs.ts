import { useState, useEffect } from 'react';
import { jobsApi } from '@/services/api';

// Fallback mock data for when API is not available
const mockJobs: Job[] = [
  {
    id: "j1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: {
      type: "remote",
      allowRemote: true,
      country: "US"
    },
    employmentType: "full-time",
    experienceLevel: "senior",
    salary: {
      min: 120000,
      max: 150000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "We are looking for a Senior Frontend Developer to join our team...",
    responsibilities: ["Develop user interfaces", "Collaborate with design team", "Optimize performance"],
    requiredQualifications: ["5+ years React experience", "TypeScript proficiency"],
    preferredQualifications: ["Next.js experience", "Design system knowledge"],
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    benefits: "Comprehensive health insurance, 401k matching, flexible PTO",
    status: "open",
    visibility: "public",
    postedDate: "2024-01-05T10:00:00Z",
    applicationDeadline: "2024-02-05T23:59:59Z",
    maxApplicants: 50,
    currentApplicants: 45,
    pipeline: {
      screening: 15,
      interview: 8,
      assessment: 4,
      offer: 1,
    },
    source: "internal",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    company: {
      id: "comp_1",
      name: "TalentSol Inc."
    },
    createdBy: {
      id: "user_123",
      firstName: "John",
      lastName: "Doe"
    }
  },
  {
    id: "j2",
    title: "UX/UI Designer",
    department: "Design",
    location: {
      type: "onsite",
      city: "San Francisco",
      state: "CA",
      country: "US",
      allowRemote: false
    },
    employmentType: "full-time",
    experienceLevel: "mid",
    salary: {
      min: 90000,
      max: 120000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "Join our design team to create beautiful and intuitive user experiences...",
    responsibilities: ["Design user interfaces", "Create prototypes", "Conduct user research"],
    requiredQualifications: ["3+ years UX/UI experience", "Figma proficiency"],
    preferredQualifications: ["Design system experience", "Frontend development knowledge"],
    skills: ["Figma", "Sketch", "Adobe Creative Suite", "Prototyping"],
    benefits: "Health insurance, design conference budget, flexible hours",
    status: "open",
    visibility: "public",
    postedDate: "2024-01-17T09:00:00Z",
    currentApplicants: 23,
    pipeline: {
      screening: 8,
      interview: 4,
      assessment: 2,
      offer: 0,
    },
    source: "job_board",
    createdAt: "2024-01-17T09:00:00Z",
    updatedAt: "2024-01-18T11:15:00Z",
    company: {
      id: "comp_1",
      name: "TalentSol Inc."
    },
    createdBy: {
      id: "user_456",
      firstName: "Jane",
      lastName: "Smith"
    }
  },
  {
    id: "j3",
    title: "Product Manager",
    department: "Product",
    location: {
      type: "hybrid",
      city: "New York",
      state: "NY",
      country: "US",
      allowRemote: true
    },
    employmentType: "full-time",
    experienceLevel: "senior",
    salary: {
      min: 110000,
      max: 140000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "Lead product strategy and development for our core platform...",
    responsibilities: ["Define product roadmap", "Work with engineering teams", "Analyze user metrics"],
    requiredQualifications: ["5+ years product management", "Technical background"],
    preferredQualifications: ["SaaS experience", "Data analysis skills"],
    skills: ["Product Strategy", "Analytics", "Agile", "SQL"],
    benefits: "Equity package, unlimited PTO, learning budget",
    status: "open",
    visibility: "public",
    postedDate: "2024-01-13T14:00:00Z",
    applicationDeadline: "2024-02-13T23:59:59Z",
    maxApplicants: 40,
    currentApplicants: 34,
    pipeline: {
      screening: 12,
      interview: 6,
      assessment: 3,
      offer: 1,
    },
    source: "internal",
    createdAt: "2024-01-13T14:00:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
    company: {
      id: "comp_1",
      name: "TalentSol Inc."
    },
    createdBy: {
      id: "user_789",
      firstName: "Mike",
      lastName: "Johnson"
    }
  }
];

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

// Transform backend job to frontend job structure
const transformBackendJob = (backendJob: BackendJob): Job => {
  // Handle null location data
  const location = backendJob.location || {};
  const isRemote = location.remote || false;

  // Handle null salary data
  const salary = backendJob.salary || { min: 0, max: 0, currency: 'USD' };

  return {
    id: backendJob.id,
    title: backendJob.title,
    department: backendJob.department,
    location: {
      type: isRemote ? 'remote' : 'onsite',
      allowRemote: isRemote,
      country: 'US', // Default to US
      city: location.city,
      state: location.state,
    },
    employmentType: backendJob.employmentType.replace('_', '-'), // Convert "full_time" to "full-time"
    experienceLevel: backendJob.experienceLevel,
    salary: {
      min: salary.min,
      max: salary.max,
      currency: salary.currency,
      payFrequency: 'annual',
    },
    description: backendJob.description,
    responsibilities: backendJob.responsibilities || [],
    requiredQualifications: backendJob.requiredQualifications || [],
    preferredQualifications: backendJob.preferredQualifications || [],
    skills: backendJob.skills || [],
    benefits: backendJob.benefits || '',
    status: backendJob.status,
    visibility: backendJob.visibility,
    postedDate: backendJob.postedDate || backendJob.createdAt,
    applicationDeadline: backendJob.applicationDeadline || undefined,
    maxApplicants: backendJob.maxApplicants || undefined,
    currentApplicants: backendJob._count?.applications || 0,
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

      // Handle the actual backend response structure
      if (response.jobs) {
        // Transform backend jobs to frontend structure
        const transformedJobs = response.jobs.map((backendJob: BackendJob) => transformBackendJob(backendJob));
        setJobs(transformedJobs);
        setTotalPages(response.pagination?.pages || 1);
        setCurrentPage(response.pagination?.page || 1);
        setTotal(response.pagination?.total || 0);
        setError(null); // Clear any previous errors
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('Jobs API Error:', err);

      // Check if this is a network/connection error
      const isConnectionError = err instanceof Error && (
        err.message.includes('fetch') ||
        err.message.includes('Network') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('ECONNREFUSED') ||
        err.message.includes('ERR_NETWORK') ||
        (err.name === 'TypeError' && err.message.includes('fetch'))
      );

      if (isConnectionError) {
        console.warn('Connection error detected, using fallback mock data:', err);

        // Use fallback mock data when API is not available
        let filteredJobs = [...mockJobs];

        // Apply search filter
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          filteredJobs = filteredJobs.filter(job =>
            job.title.toLowerCase().includes(searchLower) ||
            job.department.toLowerCase().includes(searchLower) ||
            job.description.toLowerCase().includes(searchLower)
          );
        }

        // Apply status filter
        if (params?.status) {
          const statusFilters = params.status.split(',');
          filteredJobs = filteredJobs.filter(job => statusFilters.includes(job.status));
        }

        // Apply department filter
        if (params?.department) {
          const deptFilters = params.department.split(',');
          filteredJobs = filteredJobs.filter(job => deptFilters.includes(job.department));
        }

        // Apply pagination
        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

        // IMPORTANT: Set the jobs array with mock data
        setJobs(paginatedJobs);
        setTotalPages(Math.ceil(filteredJobs.length / limit));
        setCurrentPage(page);
        setTotal(filteredJobs.length);

        // Set a user-friendly error message but don't clear the jobs
        setError('Backend server not available - showing demo data');
      } else {
        // For other errors (like 404, 500, etc.), show the actual error
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
        setJobs([]);
        setTotalPages(1);
        setCurrentPage(1);
        setTotal(0);
      }
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
      console.warn('API not available for single job, using fallback data:', err);

      // Try to find job in mock data as fallback
      const mockJob = mockJobs.find(j => j.id === id);
      if (mockJob) {
        setJob(mockJob);
        setError('Backend server not available - showing demo data');
      } else {
        // Create a fallback job if not found in mock data
        const fallbackJob: Job = {
          id: id,
          title: "Sample Job Position",
          department: "Engineering",
          location: { type: "remote", allowRemote: true, country: "US" },
          employmentType: "full-time",
          experienceLevel: "mid",
          salary: { min: 80000, max: 120000, currency: "USD", payFrequency: "annual" },
          description: "This is a sample job description for demonstration purposes.",
          responsibilities: ["Lead development initiatives", "Collaborate with team members"],
          requiredQualifications: ["Bachelor's degree", "3+ years experience"],
          preferredQualifications: ["Master's degree", "5+ years experience"],
          skills: ["JavaScript", "React", "Node.js"],
          benefits: "Health insurance, 401k, flexible PTO",
          status: "open",
          visibility: "public",
          postedDate: new Date().toISOString(),
          currentApplicants: 15,
          pipeline: { screening: 5, interview: 3, assessment: 2, offer: 1 },
          source: "internal",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          company: { id: "comp_1", name: "TalentSol Inc." },
          createdBy: { id: "user_demo", firstName: "Demo", lastName: "User" }
        };
        setJob(fallbackJob);
        setError('Backend server not available - showing demo data');
      }
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
      console.warn('API not available for job creation:', err);

      // Simulate job creation with mock data
      const newJob: Job = {
        id: `job_${Date.now()}`,
        title: jobData.title || 'New Job',
        department: jobData.department || 'General',
        location: jobData.location || { type: 'remote', allowRemote: true, country: 'US' },
        employmentType: jobData.employmentType || 'full-time',
        experienceLevel: jobData.experienceLevel || 'mid',
        salary: jobData.salary || { min: 50000, max: 80000, currency: 'USD' },
        description: jobData.description || 'Job description',
        responsibilities: jobData.responsibilities || [],
        requiredQualifications: jobData.requiredQualifications || [],
        preferredQualifications: jobData.preferredQualifications || [],
        skills: jobData.skills || [],
        benefits: jobData.benefits || '',
        status: jobData.status || 'draft',
        visibility: jobData.visibility || 'public',
        postedDate: new Date().toISOString(),
        currentApplicants: 0,
        pipeline: { screening: 0, interview: 0, assessment: 0, offer: 0 },
        source: jobData.source || 'internal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        company: { id: 'comp_1', name: 'TalentSol Inc.' },
        createdBy: { id: 'user_demo', firstName: 'Demo', lastName: 'User' }
      };

      // Add to mock data for demo mode
      mockJobs.push(newJob);

      // Call success callback to trigger refetch
      if (onSuccess) {
        onSuccess();
      }

      setError('Backend server not available - job created in demo mode');
      return newJob;
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
      console.warn('API not available for job update:', err);

      // In demo mode, update the mock data
      const jobIndex = mockJobs.findIndex(job => job.id === id);
      if (jobIndex !== -1) {
        mockJobs[jobIndex] = { ...mockJobs[jobIndex], ...jobData, updatedAt: new Date().toISOString() };
      }

      setError('Backend server not available - job updated in demo mode');
      return { id, ...jobData };
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
      console.warn('API not available for job deletion:', err);

      // In demo mode, remove from mock data
      const jobIndex = mockJobs.findIndex(job => job.id === id);
      if (jobIndex !== -1) {
        mockJobs.splice(jobIndex, 1);
      }

      setError('Backend server not available - job deleted in demo mode');
      return true;
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

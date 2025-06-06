import { useState, useEffect } from 'react';
import { candidatesApi } from '@/services/api';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  stage: string;
  tags: string[];
  lastActivity: string;
  rating: number;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  workAuthorization?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
  applications: Array<{
    id: string;
    jobTitle: string;
    status: string;
    submittedAt: string;
    score?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UseCandidatesParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
}

export interface UseCandidatesReturn {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  refetch: () => void;
}

export const useCandidates = (params?: UseCandidatesParams): UseCandidatesReturn => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page || 1);
  const [total, setTotal] = useState(0);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidatesApi.getCandidates(params);
      
      if (response.data) {
        setCandidates(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(response.pagination?.page || 1);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [params?.page, params?.limit, params?.search, params?.stage]);

  return {
    candidates,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    refetch: fetchCandidates,
  };
};

export const useCandidate = (id: string) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidatesApi.getCandidate(id);
      setCandidate(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candidate');
      console.error('Error fetching candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCandidate();
    }
  }, [id]);

  return {
    candidate,
    loading,
    error,
    refetch: fetchCandidate,
  };
};

export interface PipelineData {
  stages: Array<{
    id: string;
    name: string;
    candidates: Candidate[];
  }>;
  totalCandidates: number;
  summary: {
    stageCounts: Array<{
      stage: string;
      count: number;
    }>;
  };
}

export const useCandidatePipeline = () => {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await candidatesApi.getPipeline();
      setPipeline(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch candidate pipeline';
      console.error('Error fetching pipeline:', err);

      // Check if it's a connection error
      const isConnectionError = errorMessage.includes('Failed to fetch') ||
                               errorMessage.includes('Network error') ||
                               errorMessage.includes('Could not connect') ||
                               errorMessage.includes('ECONNREFUSED');

      if (isConnectionError) {
        console.warn('Connection error detected, using fallback mock data:', err);

        // Use fallback mock data when API is not available
        const mockPipeline = {
          stages: [
            {
              id: 'applied',
              name: 'Applied',
              candidates: [
                {
                  id: 'mock_1',
                  name: 'John Doe',
                  email: 'john.doe@email.com',
                  phone: '+1-555-0001',
                  position: 'Software Engineer',
                  stage: 'applied',
                  tags: ['JavaScript', 'React'],
                  lastActivity: new Date().toISOString(),
                  rating: 4,
                  location: { city: 'San Francisco', state: 'CA', country: 'USA' },
                  applications: [{
                    id: 'app_1',
                    jobTitle: 'Senior Software Engineer',
                    status: 'applied',
                    submittedAt: new Date().toISOString(),
                    score: 85
                  }],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]
            },
            {
              id: 'screening',
              name: 'Screening',
              candidates: []
            },
            {
              id: 'interview',
              name: 'Interview',
              candidates: []
            },
            {
              id: 'assessment',
              name: 'Assessment',
              candidates: []
            },
            {
              id: 'offer',
              name: 'Offer',
              candidates: []
            },
            {
              id: 'hired',
              name: 'Hired',
              candidates: []
            },
            {
              id: 'rejected',
              name: 'Rejected',
              candidates: []
            }
          ]
        };

        setPipeline(mockPipeline);
        setError('Backend server not available - showing demo data');
      } else {
        // For other errors (like 404, 500, etc.), show the actual error
        setError(errorMessage);
        setPipeline(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  return {
    pipeline,
    loading,
    error,
    refetch: fetchPipeline,
  };
};

// Hook for creating a new candidate
export const useCreateCandidate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCandidate = async (candidateData: Partial<Candidate>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidatesApi.createCandidate(candidateData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCandidate,
    loading,
    error,
  };
};

// Hook for updating a candidate
export const useUpdateCandidate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCandidate = async (id: string, candidateData: Partial<Candidate>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidatesApi.updateCandidate(id, candidateData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCandidate,
    loading,
    error,
  };
};

// Hook for updating candidate stage
export const useUpdateCandidateStage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStage = async (id: string, stage: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidatesApi.updateStage(id, stage);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update candidate stage';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStage,
    loading,
    error,
  };
};

// Hook for deleting a candidate
export const useDeleteCandidate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCandidate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await candidatesApi.deleteCandidate(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteCandidate,
    loading,
    error,
  };
};

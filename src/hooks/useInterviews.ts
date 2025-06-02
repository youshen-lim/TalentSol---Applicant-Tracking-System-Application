import { useState, useEffect } from 'react';
import { interviewsApi } from '@/services/api';

export interface Interview {
  id: string;
  candidateName: string;
  candidateId: string;
  position: string;
  jobTitle: string;
  type: string;
  interviewers: string[];
  dateTime: string;
  status: string;
  location?: string;
  notes?: string;
  feedback?: {
    rating: number;
    comments: string;
    recommendations: string[];
    strengths: string[];
    concerns: string[];
  };
  application: {
    id: string;
    jobId: string;
    candidateInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UseInterviewsParams {
  page?: number;
  limit?: number;
  date?: string;
  status?: string;
}

export interface UseInterviewsReturn {
  interviews: Interview[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  refetch: () => void;
}

export const useInterviews = (params?: UseInterviewsParams): UseInterviewsReturn => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page || 1);
  const [total, setTotal] = useState(0);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await interviewsApi.getInterviews(params);
      
      if (response.data) {
        setInterviews(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(response.pagination?.page || 1);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interviews');
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [params?.page, params?.limit, params?.date, params?.status]);

  return {
    interviews,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    refetch: fetchInterviews,
  };
};

export const useInterview = (id: string) => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await interviewsApi.getInterview(id);
      setInterview(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interview');
      console.error('Error fetching interview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInterview();
    }
  }, [id]);

  return {
    interview,
    loading,
    error,
    refetch: fetchInterview,
  };
};

export const useUpcomingInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await interviewsApi.getUpcoming();
      setInterviews(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming interviews');
      console.error('Error fetching upcoming interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  return {
    interviews,
    loading,
    error,
    refetch: fetchUpcoming,
  };
};

// Hook for creating a new interview
export const useCreateInterview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInterview = async (interviewData: Partial<Interview>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await interviewsApi.createInterview(interviewData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create interview';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createInterview,
    loading,
    error,
  };
};

// Hook for updating an interview
export const useUpdateInterview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInterview = async (id: string, interviewData: Partial<Interview>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await interviewsApi.updateInterview(id, interviewData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update interview';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateInterview,
    loading,
    error,
  };
};

// Hook for deleting an interview
export const useDeleteInterview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInterview = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await interviewsApi.deleteInterview(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete interview';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteInterview,
    loading,
    error,
  };
};

// Hook for interview scheduling with time slots
export const useInterviewScheduling = () => {
  const [availableSlots, setAvailableSlots] = useState<Array<{
    date: string;
    time: string;
    available: boolean;
    interviewer?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAvailableSlots = async (date: string, interviewerIds?: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be an API call to get available time slots
      // For now, we'll generate mock slots
      const slots = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push({
          date,
          time: `${hour.toString().padStart(2, '0')}:00`,
          available: Math.random() > 0.3, // Random availability
          interviewer: interviewerIds?.[0],
        });
        slots.push({
          date,
          time: `${hour.toString().padStart(2, '0')}:30`,
          available: Math.random() > 0.3,
          interviewer: interviewerIds?.[0],
        });
      }
      
      setAvailableSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available slots');
      console.error('Error fetching available slots:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    availableSlots,
    loading,
    error,
    getAvailableSlots,
  };
};

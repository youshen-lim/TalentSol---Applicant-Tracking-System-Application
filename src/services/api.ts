// API service for TalentSol ATS
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface ApplicationStats {
  totalApplications: number;
  newApplications: number;
  conversionRate: number;
  averageScore: number;
  applicationsByStatus: Array<{
    status: string;
    _count: number;
  }>;
  sourceStats: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  recentApplications: Array<{
    id: string;
    candidateName: string;
    jobTitle: string;
    submittedAt: string;
    status: string;
    score: number;
  }>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  company: {
    id: string;
    name: string;
  };
}

export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  browserNotifications: boolean;
  newApplications: boolean;
  interviewReminders: boolean;
  systemUpdates: boolean;
  weeklyReports: boolean;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  profileVisibility: 'public' | 'team' | 'private';
  activityTracking: boolean;
  dataSharing: boolean;
  analyticsOptIn: boolean;
  compactMode: boolean;
  sidebarCollapsed: boolean;
}

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Application API
export const applicationApi = {
  // Get dashboard statistics
  getStats: async (): Promise<ApplicationStats> => {
    return makeRequest('/applications/stats');
  },

  // Get all applications
  getApplications: async (params?: {
    page?: number;
    limit?: number;
    jobId?: string;
    status?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return makeRequest(`/applications?${searchParams.toString()}`);
  },

  // Get single application
  getApplication: async (id: string) => {
    return makeRequest(`/applications/${id}`);
  },

  // Update application
  updateApplication: async (id: string, data: any) => {
    return makeRequest(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Submit application (public endpoint)
  submitApplication: async (data: any) => {
    return makeRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Notifications API
export const notificationApi = {
  // Get all notifications
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return makeRequest(`/notifications?${searchParams.toString()}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    return makeRequest('/notifications/unread-count');
  },

  // Mark notifications as read
  markAsRead: async (notificationIds: string[]) => {
    return makeRequest('/notifications/mark-read', {
      method: 'PATCH',
      body: JSON.stringify({ notificationIds }),
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return makeRequest('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    return makeRequest(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

// User API
export const userApi = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return makeRequest('/users/profile');
  },

  // Update user profile
  updateProfile: async (data: Partial<UserProfile>) => {
    return makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return makeRequest('/users/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    return makeRequest('/users/settings');
  },

  // Update user settings
  updateSettings: async (data: Partial<UserSettings>) => {
    return makeRequest('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Auth API
export const authApi = {
  // Login
  login: async (email: string, password: string) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Register
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
  }) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Logout
  logout: async () => {
    return makeRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Verify token
  verifyToken: async () => {
    return makeRequest('/auth/me');
  },
};

// Form Builder API
export const formApi = {
  // Get form schemas
  getForms: async () => {
    return makeRequest('/forms');
  },

  // Get single form
  getForm: async (id: string) => {
    return makeRequest(`/forms/${id}`);
  },

  // Create form
  createForm: async (data: any) => {
    return makeRequest('/forms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update form
  updateForm: async (id: string, data: any) => {
    return makeRequest(`/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete form
  deleteForm: async (id: string) => {
    return makeRequest(`/forms/${id}`, {
      method: 'DELETE',
    });
  },
};

// Jobs API
export const jobsApi = {
  // Get all jobs
  getJobs: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return makeRequest(`/jobs?${searchParams.toString()}`);
  },

  // Get single job
  getJob: async (id: string) => {
    return makeRequest(`/jobs/${id}`);
  },

  // Create job
  createJob: async (data: any) => {
    return makeRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update job
  updateJob: async (id: string, data: any) => {
    return makeRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete job
  deleteJob: async (id: string) => {
    return makeRequest(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  // Get job statistics
  getJobStats: async (id: string) => {
    return makeRequest(`/jobs/${id}/stats`);
  },
};

// Candidates API
export const candidatesApi = {
  // Get all candidates
  getCandidates: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return makeRequest(`/candidates?${searchParams.toString()}`);
  },

  // Get single candidate
  getCandidate: async (id: string) => {
    return makeRequest(`/candidates/${id}`);
  },

  // Create candidate
  createCandidate: async (data: any) => {
    return makeRequest('/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update candidate
  updateCandidate: async (id: string, data: any) => {
    return makeRequest(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete candidate
  deleteCandidate: async (id: string) => {
    return makeRequest(`/candidates/${id}`, {
      method: 'DELETE',
    });
  },

  // Get candidate pipeline
  getPipeline: async () => {
    return makeRequest('/candidates/pipeline');
  },

  // Update candidate stage
  updateStage: async (id: string, stage: string) => {
    return makeRequest(`/candidates/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage }),
    });
  },
};

// Interviews API
export const interviewsApi = {
  // Get all interviews
  getInterviews: async (params?: {
    page?: number;
    limit?: number;
    date?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return makeRequest(`/interviews?${searchParams.toString()}`);
  },

  // Get single interview
  getInterview: async (id: string) => {
    return makeRequest(`/interviews/${id}`);
  },

  // Create interview
  createInterview: async (data: any) => {
    return makeRequest('/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update interview
  updateInterview: async (id: string, data: any) => {
    return makeRequest(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete interview
  deleteInterview: async (id: string) => {
    return makeRequest(`/interviews/${id}`, {
      method: 'DELETE',
    });
  },

  // Get upcoming interviews
  getUpcoming: async () => {
    return makeRequest('/interviews/upcoming');
  },
};

// Analytics API
export const analyticsApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return makeRequest('/analytics/dashboard');
  },

  // Get recruitment data
  getRecruitmentData: async (period?: string) => {
    const searchParams = new URLSearchParams();
    if (period) {
      searchParams.append('period', period);
    }

    return makeRequest(`/analytics/recruitment?${searchParams.toString()}`);
  },

  // Get source data
  getSourceData: async () => {
    return makeRequest('/analytics/sources');
  },

  // Get conversion funnel
  getConversionFunnel: async (jobId?: string) => {
    const searchParams = new URLSearchParams();
    if (jobId) {
      searchParams.append('jobId', jobId);
    }

    return makeRequest(`/analytics/conversion?${searchParams.toString()}`);
  },
};

export default {
  applicationApi,
  notificationApi,
  userApi,
  authApi,
  formApi,
  jobsApi,
  candidatesApi,
  interviewsApi,
  analyticsApi,
};

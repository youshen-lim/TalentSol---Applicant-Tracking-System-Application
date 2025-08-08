// Standardized API Response Types for TalentSol ATS Backend
// Provides consistent response structure across all endpoints

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends StandardResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse extends StandardResponse<never> {
  success: false;
  error: string;
  details?: any;
  code?: string;
}

// Specific response types for common endpoints
export interface AuthResponse extends StandardResponse {
  data: {
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
      companyId: string;
    };
    token: string;
    refreshToken?: string;
  };
}

export interface HealthResponse extends StandardResponse {
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    database: {
      status: 'connected' | 'disconnected';
      latency?: number;
    };
    cache: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      redis: boolean;
      fallback: boolean;
    };
    services: {
      ml: boolean;
      websocket: boolean;
      scheduler: boolean;
    };
  };
}

export interface DashboardResponse extends StandardResponse {
  data: {
    metrics: {
      totalApplications: number;
      totalInterviews: number;
      totalOffers: number;
      totalCandidates: number;
    };
    recentActivity: Array<{
      id: string;
      type: 'application' | 'interview' | 'offer';
      title: string;
      timestamp: string;
      status: string;
    }>;
    upcomingInterviews: Array<{
      id: string;
      title: string;
      candidateName: string;
      scheduledDate: string;
      type: string;
    }>;
  };
}

export interface JobResponse extends StandardResponse {
  data: {
    id: string;
    title: string;
    department?: string;
    location?: string;
    employmentType?: string;
    status: string;
    postedDate?: string;
    applicationDeadline?: string;
    currentApplicants: number;
    maxApplicants?: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CandidateResponse extends StandardResponse {
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    experienceYears?: number;
    currentPosition?: string;
    availabilityStatus?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ApplicationResponse extends StandardResponse {
  data: {
    id: string;
    status: string;
    appliedDate: string;
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    job: {
      id: string;
      title: string;
      department?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface InterviewResponse extends StandardResponse {
  data: {
    id: string;
    title: string;
    type?: string;
    scheduledDate?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    meetingLink?: string;
    status: string;
    application: {
      id: string;
      candidate: {
        firstName: string;
        lastName: string;
        email: string;
      };
      job: {
        title: string;
        department?: string;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

// Analytics response types
export interface AnalyticsResponse extends StandardResponse {
  data: {
    period?: string;
    metrics?: Record<string, number>;
    trends?: Array<{
      date: string;
      value: number;
      metric: string;
    }>;
    comparisons?: {
      previousPeriod: Record<string, number>;
      percentageChange: Record<string, number>;
    };
    // Additional analytics-specific properties
    funnel?: {
      applied: number;
      screening: number;
      interview: number;
      offer: number;
      hired: number;
      totalApplications: number;
    };
    averageTimeToHire?: number;
    departmentAverages?: Record<string, number>;
    sourceEffectiveness?: {
      sources: Array<{
        name: string;
        applications: number;
        hires: number;
        cost: number;
        effectiveness: number;
      }>;
      totalApplications: number;
      totalHires: number;
    };
    topJobs?: Array<{
      id: string;
      title: string;
      applications: number;
      department?: string;
    }>;
    // Performance metrics
    performanceMetrics?: {
      applicationVolume: number;
      averageTimeToHire: number;
      offerAcceptanceRate: number;
      sourceEffectiveness: number;
      interviewToOfferRatio: number;
    };
    // Application trends
    applicationTrends?: Array<{
      date: string;
      applications: number;
      interviews: number;
      offers: number;
    }>;
    // Form performance data
    formPerformance?: {
      totalForms: number;
      totalSubmissions: number;
      averageCompletionRate: number;
      forms: Array<{
        id: string;
        title: string;
        submissions: number;
        completionRate: number;
      }>;
    };
  };
}

// ML-related response types
export interface MLPredictionResponse extends StandardResponse {
  data: {
    applicationId: string;
    prediction: string;
    confidence: number;
    explanation?: string;
    modelName?: string;
    createdAt: string;
  };
}

export interface MLModelResponse extends StandardResponse {
  data: {
    id: string;
    name: string;
    type: string;
    version: string;
    status?: string;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    isActive: boolean;
    trainedAt: string;
    deployedAt?: string;
  };
}

// File upload response types
export interface FileUploadResponse extends StandardResponse {
  data: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
    uploadedAt: string;
  };
}

// Bulk operation response types
export interface BulkOperationResponse extends StandardResponse {
  data: {
    total: number;
    successful: number;
    failed: number;
    errors?: Array<{
      index: number;
      error: string;
    }>;
  };
}

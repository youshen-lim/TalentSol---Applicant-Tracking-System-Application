// Standardized API response types for TalentSol ATS
// Ensures consistency across all endpoints

export interface StandardApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata?: {
    version: string;
    cached: boolean;
    processingTime?: number;
  };
}

export interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    field?: string;
    timestamp: string;
    requestId?: string;
    stack?: string; // Only in development
  };
  data: null;
}

// ML-specific response types
export interface MLApiResponse<T = any> extends StandardApiResponse<T> {
  metadata: StandardApiResponse<T>['metadata'] & {
    modelVersion: string;
    confidence: number;
    processingTime: number;
    cached: boolean;
  };
}

// Validation error response
export interface ValidationErrorResponse extends StandardErrorResponse {
  error: StandardErrorResponse['error'] & {
    code: 'VALIDATION_ERROR';
    validationErrors: Array<{
      field: string;
      message: string;
      value?: any;
      code?: string;
    }>;
  };
}

// Authentication error response
export interface AuthErrorResponse extends StandardErrorResponse {
  error: StandardErrorResponse['error'] & {
    code: 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'TOKEN_EXPIRED';
    retryAfter?: number;
  };
}

/**
 * Standardized error handling utilities for TalentSol ATS
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface StandardError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: string;
  field?: string;
  timestamp: string;
  requestId?: string;
  retryable: boolean;
  userMessage: string;
  technicalMessage: string;
  suggestions?: string[];
}

/**
 * Standardizes error objects across the application
 */
export class ErrorHandler {
  static standardizeError(error: unknown): StandardError {
    const timestamp = new Date().toISOString();
    
    // Handle API errors
    if (this.isApiError(error)) {
      return this.handleApiError(error, timestamp);
    }
    
    // Handle network errors
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error, timestamp);
    }
    
    // Handle validation errors
    if (this.isValidationError(error)) {
      return this.handleValidationError(error, timestamp);
    }
    
    // Handle authentication errors
    if (this.isAuthError(error)) {
      return this.handleAuthError(error, timestamp);
    }
    
    // Handle generic errors
    return this.handleGenericError(error, timestamp);
  }

  private static isApiError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as any).response === 'object'
    );
  }

  private static isNetworkError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const networkIndicators = [
      'fetch',
      'network',
      'connection',
      'timeout',
      'offline',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'ECONNREFUSED',
      'Failed to fetch',
    ];
    
    return networkIndicators.some(indicator =>
      error.message.toLowerCase().includes(indicator.toLowerCase()) ||
      error.name.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  private static isValidationError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('field' in error || 'validationErrors' in error)
    );
  }

  private static isAuthError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const authIndicators = [
      'unauthorized',
      'authentication',
      'token',
      'login',
      'session',
      '401',
      '403',
    ];
    
    return authIndicators.some(indicator =>
      error.message.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  private static handleApiError(error: any, timestamp: string): StandardError {
    const response = error.response;
    const status = response?.status || 500;
    const data = response?.data || {};
    
    let type = ErrorType.SERVER;
    let severity = ErrorSeverity.MEDIUM;
    
    if (status >= 400 && status < 500) {
      type = status === 401 ? ErrorType.AUTHENTICATION : 
             status === 403 ? ErrorType.AUTHORIZATION :
             status === 404 ? ErrorType.NOT_FOUND :
             ErrorType.CLIENT;
      severity = status === 401 || status === 403 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
    }
    
    return {
      type,
      severity,
      message: data.message || error.message || 'An API error occurred',
      code: data.code || `HTTP_${status}`,
      details: data.details,
      field: data.field,
      timestamp,
      requestId: data.requestId,
      retryable: status >= 500 || status === 408 || status === 429,
      userMessage: this.getUserMessage(type, status),
      technicalMessage: `API Error ${status}: ${data.message || error.message}`,
      suggestions: this.getSuggestions(type, status),
    };
  }

  private static handleNetworkError(error: Error, timestamp: string): StandardError {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: error.message,
      timestamp,
      retryable: true,
      userMessage: 'Connection problem. Please check your internet connection and try again.',
      technicalMessage: `Network Error: ${error.message}`,
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable VPN if you\'re using one',
        'Contact support if the problem persists',
      ],
    };
  }

  private static handleValidationError(error: any, timestamp: string): StandardError {
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      message: error.message || 'Validation failed',
      field: error.field,
      details: error.details,
      timestamp,
      retryable: false,
      userMessage: 'Please check your input and try again.',
      technicalMessage: `Validation Error: ${error.message}`,
      suggestions: [
        'Check the highlighted fields',
        'Ensure all required fields are filled',
        'Verify the format of your input',
      ],
    };
  }

  private static handleAuthError(error: Error, timestamp: string): StandardError {
    return {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message: error.message,
      timestamp,
      retryable: false,
      userMessage: 'Authentication required. Please log in and try again.',
      technicalMessage: `Authentication Error: ${error.message}`,
      suggestions: [
        'Log out and log back in',
        'Clear your browser cache',
        'Contact support if you continue having issues',
      ],
    };
  }

  private static handleGenericError(error: unknown, timestamp: string): StandardError {
    const message = error instanceof Error ? error.message : String(error);
    
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message,
      timestamp,
      retryable: true,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: `Unknown Error: ${message}`,
      suggestions: [
        'Try refreshing the page',
        'Clear your browser cache',
        'Contact support if the problem persists',
      ],
    };
  }

  private static getUserMessage(type: ErrorType, status?: number): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Connection problem. Please check your internet connection.';
      case ErrorType.AUTHENTICATION:
        return 'Please log in to continue.';
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.SERVER:
        return status && status >= 500 
          ? 'Server error. Please try again later.'
          : 'Something went wrong. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  private static getSuggestions(type: ErrorType, status?: number): string[] {
    switch (type) {
      case ErrorType.NETWORK:
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable VPN if you\'re using one',
        ];
      case ErrorType.AUTHENTICATION:
        return [
          'Log out and log back in',
          'Clear your browser cache',
          'Check if your session has expired',
        ];
      case ErrorType.AUTHORIZATION:
        return [
          'Contact your administrator',
          'Check if you have the required permissions',
          'Try logging out and back in',
        ];
      case ErrorType.SERVER:
        return status && status >= 500
          ? [
              'Try again in a few minutes',
              'Contact support if the problem persists',
              'Check our status page for known issues',
            ]
          : [
              'Try refreshing the page',
              'Check your input',
              'Contact support if needed',
            ];
      default:
        return [
          'Try refreshing the page',
          'Clear your browser cache',
          'Contact support if the problem persists',
        ];
    }
  }

  /**
   * Determines if an error should trigger a retry
   */
  static shouldRetry(error: StandardError, attemptCount: number, maxRetries: number): boolean {
    if (attemptCount >= maxRetries) return false;
    if (!error.retryable) return false;
    
    // Don't retry client errors (except specific cases)
    if (error.type === ErrorType.CLIENT) return false;
    if (error.type === ErrorType.VALIDATION) return false;
    if (error.type === ErrorType.AUTHENTICATION) return false;
    if (error.type === ErrorType.AUTHORIZATION) return false;
    
    return true;
  }

  /**
   * Calculates retry delay with exponential backoff
   */
  static getRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attemptCount - 1), 30000); // Max 30 seconds
  }
}

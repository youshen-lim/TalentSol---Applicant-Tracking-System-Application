import { toast } from '@/components/ui/use-toast';

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private config: ApiClientConfig;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
      timeout: 10000, // 10 seconds
      retries: 3,
      retryDelay: 1000, // 1 second
      ...config,
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRetryableError(status: number): boolean {
    // Retry on network errors, timeouts, and server errors (5xx)
    return status >= 500 || status === 0 || status === 408 || status === 429;
  }

  private createTimeoutPromise(timeout: number, requestId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        const controller = this.abortControllers.get(requestId);
        if (controller) {
          controller.abort();
          this.abortControllers.delete(requestId);
        }
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  private validateResponse(response: any): boolean {
    // Basic response validation
    if (!response || typeof response !== 'object') {
      return false;
    }

    // Check for required fields based on API contract
    if (response.error && typeof response.error !== 'string') {
      return false;
    }

    if (response.data && typeof response.data !== 'object' && !Array.isArray(response.data)) {
      return false;
    }

    return true;
  }

  private handleApiError(error: any, url: string, attempt: number): ApiError {
    let apiError: ApiError;

    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      apiError = {
        message: 'Request timed out. Please check your connection and try again.',
        status: 408,
        code: 'TIMEOUT',
      };
    } else if (error.status === 401) {
      apiError = {
        message: 'Authentication required. Please log in again.',
        status: 401,
        code: 'UNAUTHORIZED',
      };
      // Clear invalid token
      localStorage.removeItem('authToken');
    } else if (error.status === 403) {
      apiError = {
        message: 'Access denied. You do not have permission to perform this action.',
        status: 403,
        code: 'FORBIDDEN',
      };
    } else if (error.status === 404) {
      apiError = {
        message: 'The requested resource was not found.',
        status: 404,
        code: 'NOT_FOUND',
      };
    } else if (error.status === 429) {
      apiError = {
        message: 'Too many requests. Please wait before trying again.',
        status: 429,
        code: 'RATE_LIMITED',
      };
    } else if (error.status >= 500) {
      apiError = {
        message: 'Server error. Please try again later.',
        status: error.status || 500,
        code: 'SERVER_ERROR',
      };
    } else if (!navigator.onLine) {
      apiError = {
        message: 'No internet connection. Please check your network and try again.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    } else {
      apiError = {
        message: error.message || 'An unexpected error occurred.',
        status: error.status || 500,
        code: 'UNKNOWN_ERROR',
        details: error.details,
      };
    }

    // Log error for debugging
    console.error(`API Error (attempt ${attempt}):`, {
      url,
      error: apiError,
      originalError: error,
    });

    return apiError;
  }

  async request<T = any>(
    endpoint: string,
    config: RequestConfig = { method: 'GET' }
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    const requestId = `${Date.now()}-${Math.random()}`;
    const timeout = config.timeout || this.config.timeout;
    const maxRetries = config.retries ?? this.config.retries;

    let lastError: ApiError | null = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // Create abort controller for this request
        const controller = new AbortController();
        this.abortControllers.set(requestId, controller);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(!config.skipAuth && this.getAuthHeaders()),
          ...config.headers,
        };

        const requestOptions: RequestInit = {
          method: config.method,
          headers,
          signal: controller.signal,
          ...(config.body && { body: JSON.stringify(config.body) }),
        };

        // Race between fetch and timeout
        const fetchPromise = fetch(url, requestOptions);
        const timeoutPromise = this.createTimeoutPromise(timeout, requestId);

        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Clean up abort controller
        this.abortControllers.delete(requestId);

        // Handle HTTP errors
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: response.statusText };
          }

          const error = {
            message: errorData.message || `HTTP ${response.status}`,
            status: response.status,
            details: errorData,
          };

          // Don't retry client errors (4xx) except 408, 429
          if (!this.isRetryableError(response.status)) {
            throw this.handleApiError(error, url, attempt);
          }

          lastError = this.handleApiError(error, url, attempt);
        } else {
          // Success - parse response
          let data;
          try {
            data = await response.json();
          } catch {
            data = null;
          }

          // Validate response structure
          if (!this.validateResponse(data)) {
            console.warn('Invalid response structure:', data);
          }

          return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          };
        }
      } catch (error: any) {
        this.abortControllers.delete(requestId);
        lastError = this.handleApiError(error, url, attempt);

        // Don't retry on non-retryable errors
        if (!this.isRetryableError(error.status || 0)) {
          throw lastError;
        }
      }

      // Wait before retry (except on last attempt)
      if (attempt <= maxRetries) {
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await this.delay(delay);
      }
    }

    // All retries exhausted
    if (lastError) {
      throw lastError;
    }

    throw new Error('Request failed after all retries');
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Cancel all pending requests
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  // Cancel specific request
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Error handling hook for React components
export const useApiErrorHandler = () => {
  const handleError = (error: ApiError) => {
    // Show user-friendly error message
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });

    // Handle specific error types
    if (error.code === 'UNAUTHORIZED') {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.code === 'NETWORK_ERROR') {
      // Show offline indicator
      console.log('Network error detected');
    }
  };

  return { handleError };
};

export default apiClient;

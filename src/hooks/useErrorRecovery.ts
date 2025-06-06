import { useState, useCallback, useRef, useEffect } from 'react';
import { useNotifications } from '@/store';

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: (attempt: number) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

export interface ErrorRecoveryState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  canRetry: boolean;
}

/**
 * Hook for handling error recovery with automatic retry mechanisms
 */
export const useErrorRecovery = <T>(
  asyncFunction: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onError,
    onSuccess,
    onMaxRetriesReached,
  } = options;

  const [state, setState] = useState<ErrorRecoveryState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    canRetry: true,
  });

  const { addNotification } = useNotifications();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const calculateDelay = useCallback((attempt: number) => {
    if (!exponentialBackoff) {
      return retryDelay;
    }
    return retryDelay * Math.pow(2, attempt - 1);
  }, [retryDelay, exponentialBackoff]);

  const execute = useCallback(async (): Promise<T | null> => {
    // Create new abort controller for this execution
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const result = await asyncFunction();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        retryCount: 0,
        canRetry: true,
      }));

      onSuccess?.(state.retryCount);
      
      if (state.retryCount > 0) {
        addNotification({
          type: 'system',
          title: 'Operation Successful',
          message: `Operation completed successfully after ${state.retryCount} retry attempts.`,
        });
      }

      return result;
    } catch (error) {
      const currentError = error instanceof Error ? error : new Error(String(error));
      const currentRetryCount = state.retryCount + 1;
      const canStillRetry = currentRetryCount < maxRetries;

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: currentError,
        retryCount: currentRetryCount,
        canRetry: canStillRetry,
      }));

      onError?.(currentError, currentRetryCount);

      if (canStillRetry) {
        addNotification({
          type: 'system',
          title: 'Operation Failed',
          message: `Attempt ${currentRetryCount} failed. Retrying in ${calculateDelay(currentRetryCount) / 1000} seconds...`,
        });
      } else {
        onMaxRetriesReached?.(currentError);
        addNotification({
          type: 'system',
          title: 'Operation Failed',
          message: `Operation failed after ${maxRetries} attempts. Please try again later.`,
        });
      }

      throw currentError;
    }
  }, [asyncFunction, state.retryCount, maxRetries, onError, onSuccess, onMaxRetriesReached, addNotification, calculateDelay]);

  const retry = useCallback(async (): Promise<T | null> => {
    if (!state.canRetry) {
      throw new Error('Maximum retry attempts reached');
    }

    const delay = calculateDelay(state.retryCount + 1);
    
    return new Promise((resolve, reject) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await execute();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }, [state.canRetry, state.retryCount, calculateDelay, execute]);

  const autoRetry = useCallback(async (): Promise<T | null> => {
    if (!state.canRetry) {
      return null;
    }

    try {
      return await retry();
    } catch (error) {
      if (state.retryCount + 1 < maxRetries) {
        // Continue auto-retrying
        return autoRetry();
      }
      throw error;
    }
  }, [state.canRetry, state.retryCount, maxRetries, retry]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
      canRetry: true,
    });
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  return {
    ...state,
    execute,
    retry,
    autoRetry,
    reset,
    cancel,
    progress: state.retryCount / maxRetries,
    nextRetryDelay: state.canRetry ? calculateDelay(state.retryCount + 1) : 0,
  };
};

/**
 * Specialized hook for API calls with network error recovery
 */
export const useApiErrorRecovery = <T>(
  apiCall: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
) => {
  const defaultOptions: ErrorRecoveryOptions = {
    maxRetries: 3,
    retryDelay: 2000,
    exponentialBackoff: true,
    onError: (error, attempt) => {
      console.warn(`API call failed (attempt ${attempt}):`, error.message);
    },
    ...options,
  };

  return useErrorRecovery(apiCall, defaultOptions);
};

/**
 * Hook for handling component-level errors with recovery
 */
export const useComponentErrorRecovery = () => {
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleError = useCallback((error: Error) => {
    setError(error);
    console.error('Component error:', error);
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setRetryKey(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setRetryKey(0);
  }, []);

  return {
    error,
    retryKey,
    handleError,
    retry,
    reset,
    hasError: error !== null,
  };
};

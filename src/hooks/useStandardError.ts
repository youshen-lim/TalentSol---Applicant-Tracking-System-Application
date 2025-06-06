import { useState, useCallback } from 'react';
import { ErrorHandler, StandardError } from '@/utils/errorHandling';
import { useNotifications } from '@/store';

interface UseStandardErrorOptions {
  showNotification?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseStandardErrorReturn {
  error: StandardError | null;
  isRetrying: boolean;
  retryCount: number;
  handleError: (error: unknown) => StandardError;
  clearError: () => void;
  retry: (retryFunction: () => Promise<void>) => Promise<void>;
  canRetry: boolean;
}

/**
 * Hook for standardized error handling across components
 */
export const useStandardError = (
  options: UseStandardErrorOptions = {}
): UseStandardErrorReturn => {
  const {
    showNotification = true,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [error, setError] = useState<StandardError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { addNotification } = useNotifications();

  const handleError = useCallback((rawError: unknown): StandardError => {
    const standardError = ErrorHandler.standardizeError(rawError);
    setError(standardError);
    setRetryCount(0);

    // Show notification if enabled
    if (showNotification) {
      addNotification({
        type: 'system',
        title: 'Error',
        message: standardError.userMessage,
        metadata: {
          errorType: standardError.type,
          severity: standardError.severity,
          retryable: standardError.retryable,
        },
      });
    }

    // Log error for debugging
    console.error('Standardized Error:', standardError);

    return standardError;
  }, [showNotification, addNotification]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (!error || !ErrorHandler.shouldRetry(error, retryCount, maxRetries)) {
      return;
    }

    setIsRetrying(true);
    const currentRetryCount = retryCount + 1;
    setRetryCount(currentRetryCount);

    try {
      // Wait for retry delay
      const delay = ErrorHandler.getRetryDelay(currentRetryCount, retryDelay);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Execute retry function
      await retryFunction();

      // Success - clear error
      clearError();

      if (showNotification) {
        addNotification({
          type: 'system',
          title: 'Success',
          message: `Operation completed successfully after ${currentRetryCount} retry attempts.`,
        });
      }
    } catch (retryError) {
      // Handle retry failure
      const newStandardError = ErrorHandler.standardizeError(retryError);
      setError(newStandardError);

      if (showNotification && !ErrorHandler.shouldRetry(newStandardError, currentRetryCount, maxRetries)) {
        addNotification({
          type: 'system',
          title: 'Retry Failed',
          message: `Operation failed after ${currentRetryCount} attempts. ${newStandardError.userMessage}`,
        });
      }
    } finally {
      setIsRetrying(false);
    }
  }, [error, retryCount, maxRetries, retryDelay, showNotification, addNotification, clearError]);

  const canRetry = error ? ErrorHandler.shouldRetry(error, retryCount, maxRetries) : false;

  return {
    error,
    isRetrying,
    retryCount,
    handleError,
    clearError,
    retry,
    canRetry,
  };
};

/**
 * Hook for handling async operations with standardized error handling
 */
export const useAsyncWithError = <T>(
  asyncFunction: () => Promise<T>,
  options: UseStandardErrorOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    error,
    isRetrying,
    retryCount,
    handleError,
    clearError,
    retry,
    canRetry,
  } = useStandardError(options);

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    clearError();

    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction, handleError, clearError]);

  const retryExecution = useCallback(async () => {
    await retry(async () => {
      const result = await asyncFunction();
      setData(result);
    });
  }, [retry, asyncFunction]);

  return {
    data,
    isLoading,
    error,
    isRetrying,
    retryCount,
    execute,
    retry: retryExecution,
    clearError,
    canRetry,
  };
};

/**
 * Hook for form validation with standardized error handling
 */
export const useFormWithError = <T extends Record<string, any>>(
  validationFunction: (data: T) => Promise<void> | void,
  options: UseStandardErrorOptions = {}
) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const {
    error,
    handleError,
    clearError,
  } = useStandardError(options);

  const validateField = useCallback((field: string, value: any): string | null => {
    try {
      // This would be implemented based on your validation library
      // For now, just clear the field error
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return null;
    } catch (err) {
      const standardError = handleError(err);
      if (standardError.field === field) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: standardError.userMessage,
        }));
        return standardError.userMessage;
      }
      return null;
    }
  }, [handleError]);

  const validateForm = useCallback(async (data: T): Promise<boolean> => {
    try {
      await validationFunction(data);
      setFieldErrors({});
      clearError();
      return true;
    } catch (err) {
      const standardError = handleError(err);
      
      if (standardError.field) {
        setFieldErrors({
          [standardError.field]: standardError.userMessage,
        });
      }
      
      return false;
    }
  }, [validationFunction, handleError, clearError]);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    clearError();
  }, [clearError]);

  return {
    error,
    fieldErrors,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(fieldErrors).length > 0 || error !== null,
  };
};

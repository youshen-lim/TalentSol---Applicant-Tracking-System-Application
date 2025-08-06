import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export interface EnhancedError {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  context: ErrorContext;
  originalError?: Error;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'redirect' | 'manual';
  action: () => Promise<void> | void;
  description: string;
}

export interface UseEnhancedErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  enableAutoRecovery?: boolean;
  enableErrorReporting?: boolean;
  component: string;
}

export function useEnhancedErrorHandling(options: UseEnhancedErrorHandlingOptions) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableAutoRecovery = true,
    enableErrorReporting = true,
    component
  } = options;

  const [errors, setErrors] = useState<EnhancedError[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);

  /**
   * Handle error with enhanced context and recovery options
   */
  const handleError = useCallback(async (
    error: Error | string,
    action: string,
    severity: EnhancedError['severity'] = 'medium',
    recoveryStrategies: ErrorRecoveryStrategy[] = []
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const originalError = typeof error === 'string' ? undefined : error;

    const context: ErrorContext = {
      component,
      action,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const enhancedError: EnhancedError = {
      message: errorMessage,
      code: extractErrorCode(originalError),
      severity,
      recoverable: recoveryStrategies.length > 0,
      context,
      originalError,
      retryCount: 0,
      maxRetries
    };

    setErrors(prev => [...prev, enhancedError]);

    // Report error if enabled
    if (enableErrorReporting) {
      await reportError(enhancedError);
    }

    // Show user notification based on severity
    showErrorNotification(enhancedError);

    // Attempt auto-recovery for recoverable errors
    if (enableAutoRecovery && enhancedError.recoverable && recoveryStrategies.length > 0) {
      await attemptRecovery(enhancedError, recoveryStrategies);
    }

  }, [component, maxRetries, enableAutoRecovery, enableErrorReporting]);

  /**
   * Retry failed operation with exponential backoff
   */
  const retryOperation = useCallback(async (
    operation: () => Promise<any>,
    errorContext: string
  ): Promise<any> => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setIsRecovering(attempt > 1);
        const result = await operation();
        setIsRecovering(false);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    setIsRecovering(false);
    throw lastError;
  }, [maxRetries, retryDelay]);

  /**
   * Clear specific error or all errors
   */
  const clearErrors = useCallback((errorIndex?: number) => {
    if (errorIndex !== undefined) {
      setErrors(prev => prev.filter((_, index) => index !== errorIndex));
    } else {
      setErrors([]);
    }
  }, []);

  /**
   * Get error statistics
   */
  const getErrorStats = useCallback(() => {
    const total = errors.length;
    const bySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recoverable = errors.filter(e => e.recoverable).length;
    const recent = errors.filter(e => 
      Date.now() - new Date(e.context.timestamp).getTime() < 300000 // Last 5 minutes
    ).length;

    return {
      total,
      bySeverity,
      recoverable,
      recent,
      errorRate: total > 0 ? (total / (total + 100)) * 100 : 0 // Approximate error rate
    };
  }, [errors]);

  return {
    errors,
    isRecovering,
    handleError,
    retryOperation,
    clearErrors,
    getErrorStats
  };
}

// Helper functions

function extractErrorCode(error?: Error): string | undefined {
  if (!error) return undefined;
  
  // Extract error codes from different error types
  if ('code' in error) return (error as any).code;
  if (error.message.includes('401')) return 'UNAUTHORIZED';
  if (error.message.includes('403')) return 'FORBIDDEN';
  if (error.message.includes('404')) return 'NOT_FOUND';
  if (error.message.includes('500')) return 'INTERNAL_ERROR';
  if (error.message.includes('timeout')) return 'TIMEOUT';
  if (error.message.includes('network')) return 'NETWORK_ERROR';
  
  return 'UNKNOWN_ERROR';
}

function showErrorNotification(error: EnhancedError) {
  const severityConfig = {
    low: { variant: 'default' as const, duration: 3000 },
    medium: { variant: 'destructive' as const, duration: 5000 },
    high: { variant: 'destructive' as const, duration: 8000 },
    critical: { variant: 'destructive' as const, duration: 0 } // Persistent
  };

  const config = severityConfig[error.severity];
  
  toast({
    variant: config.variant,
    title: `Error in ${error.context.component}`,
    description: error.message,
    duration: config.duration,
  });
}

async function reportError(error: EnhancedError) {
  try {
    // Send error report to backend for monitoring
    await fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          message: error.message,
          code: error.code,
          severity: error.severity,
          context: error.context,
          stack: error.originalError?.stack,
        },
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (reportingError) {
    console.warn('Failed to report error:', reportingError);
  }
}

async function attemptRecovery(
  error: EnhancedError,
  strategies: ErrorRecoveryStrategy[]
): Promise<void> {
  for (const strategy of strategies) {
    try {
      await strategy.action();
      console.log(`Successfully recovered using strategy: ${strategy.type}`);
      return;
    } catch (recoveryError) {
      console.warn(`Recovery strategy ${strategy.type} failed:`, recoveryError);
    }
  }
  
  console.error('All recovery strategies failed for error:', error.message);
}

// Network-specific error handling
export function useNetworkErrorHandling() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkErrors, setNetworkErrors] = useState<string[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkErrors([]);
      toast({
        title: 'Connection Restored',
        description: 'You are back online. Syncing data...',
        variant: 'default',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Connection Lost',
        description: 'You are offline. Some features may be limited.',
        variant: 'destructive',
        duration: 0, // Persistent until back online
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNetworkError = useCallback((error: string) => {
    setNetworkErrors(prev => [...prev, error]);
  }, []);

  const clearNetworkErrors = useCallback(() => {
    setNetworkErrors([]);
  }, []);

  return {
    isOnline,
    networkErrors,
    handleNetworkError,
    clearNetworkErrors
  };
}

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Wifi, Lock } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

// Error types based on backend error codes
export type ErrorType = 
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'RECORD_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'FILE_UPLOAD_ERROR'
  | 'BUSINESS_LOGIC_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorResponseData {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    field?: string;
    timestamp: string;
    requestId?: string;
    validationErrors?: Array<{
      field: string;
      message: string;
      value?: any;
    }>;
  };
}

interface ErrorResponseProps {
  error: ErrorResponseData | Error | string;
  title?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

interface InlineErrorProps {
  error: ErrorResponseData | Error | string;
  className?: string;
  showIcon?: boolean;
}

interface ValidationErrorProps {
  errors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  className?: string;
}

// Utility functions
const getErrorType = (error: ErrorResponseData | Error | string): ErrorType => {
  if (typeof error === 'string') return 'UNKNOWN_ERROR';
  if (error instanceof Error) return 'UNKNOWN_ERROR';
  
  const code = error.error?.code;
  if (code?.includes('AUTHENTICATION')) return 'AUTHENTICATION_ERROR';
  if (code?.includes('AUTHORIZATION')) return 'AUTHORIZATION_ERROR';
  if (code?.includes('VALIDATION')) return 'VALIDATION_ERROR';
  if (code?.includes('NOT_FOUND')) return 'RECORD_NOT_FOUND';
  if (code?.includes('RATE_LIMIT')) return 'RATE_LIMIT_EXCEEDED';
  if (code?.includes('FILE_UPLOAD')) return 'FILE_UPLOAD_ERROR';
  if (code?.includes('BUSINESS_LOGIC')) return 'BUSINESS_LOGIC_ERROR';
  if (code?.includes('SERVER_ERROR') || code?.includes('DATABASE_ERROR')) return 'SERVER_ERROR';
  
  return 'UNKNOWN_ERROR';
};

const getErrorMessage = (error: ErrorResponseData | Error | string): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return error.error?.message || 'An unexpected error occurred';
};

const getErrorDetails = (error: ErrorResponseData | Error | string): string | undefined => {
  if (typeof error === 'string' || error instanceof Error) return undefined;
  return error.error?.details;
};

const getErrorIcon = (type: ErrorType) => {
  switch (type) {
    case 'AUTHENTICATION_ERROR':
    case 'AUTHORIZATION_ERROR':
      return Lock;
    case 'NETWORK_ERROR':
      return Wifi;
    case 'SERVER_ERROR':
      return Bug;
    default:
      return AlertTriangle;
  }
};

const getErrorConfig = (type: ErrorType) => {
  switch (type) {
    case 'AUTHENTICATION_ERROR':
      return {
        title: 'Authentication Required',
        variant: 'destructive' as const,
        badge: 'Auth Error',
        badgeVariant: 'destructive' as const,
      };
    case 'AUTHORIZATION_ERROR':
      return {
        title: 'Access Denied',
        variant: 'destructive' as const,
        badge: 'Permission Error',
        badgeVariant: 'destructive' as const,
      };
    case 'VALIDATION_ERROR':
      return {
        title: 'Validation Error',
        variant: 'warning' as const,
        badge: 'Validation',
        badgeVariant: 'secondary' as const,
      };
    case 'RECORD_NOT_FOUND':
      return {
        title: 'Not Found',
        variant: 'warning' as const,
        badge: '404',
        badgeVariant: 'secondary' as const,
      };
    case 'RATE_LIMIT_EXCEEDED':
      return {
        title: 'Rate Limit Exceeded',
        variant: 'warning' as const,
        badge: 'Rate Limited',
        badgeVariant: 'secondary' as const,
      };
    case 'SERVER_ERROR':
      return {
        title: 'Server Error',
        variant: 'destructive' as const,
        badge: 'Server Error',
        badgeVariant: 'destructive' as const,
      };
    default:
      return {
        title: 'Error',
        variant: 'destructive' as const,
        badge: 'Error',
        badgeVariant: 'destructive' as const,
      };
  }
};

// Main error response component
export const ErrorResponse: React.FC<ErrorResponseProps> = ({
  error,
  title,
  showRetry = true,
  showGoHome = false,
  showGoBack = false,
  onRetry,
  onGoHome,
  onGoBack,
  className = '',
  variant,
  size = 'md',
}) => {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);
  const errorDetails = getErrorDetails(error);
  const config = getErrorConfig(errorType);
  const Icon = getErrorIcon(errorType);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <Card className={`${sizeClasses[size]} ${className}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
            <Icon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <CardTitle className="text-xl">{title || config.title}</CardTitle>
          <Badge variant={config.badgeVariant}>{config.badge}</Badge>
        </div>
        <CardDescription className="text-base">{errorMessage}</CardDescription>
        {errorDetails && (
          <CardDescription className="text-sm text-muted-foreground mt-2">
            {errorDetails}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="default" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {showGoBack && onGoBack && (
            <Button onClick={onGoBack} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
          {showGoHome && onGoHome && (
            <Button onClick={onGoHome} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Inline error component for forms and smaller spaces
export const InlineError: React.FC<InlineErrorProps> = ({
  error,
  className = '',
  showIcon = true,
}) => {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);
  const config = getErrorConfig(errorType);
  const Icon = getErrorIcon(errorType);

  return (
    <Alert variant={config.variant} className={className}>
      {showIcon && <Icon className="h-4 w-4" />}
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
};

// Validation error component for forms
export const ValidationErrors: React.FC<ValidationErrorProps> = ({
  errors,
  className = '',
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Validation Errors</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              <span className="font-medium">{error.field}:</span> {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

// Network error component
export const NetworkError: React.FC<{ onRetry?: () => void; className?: string }> = ({
  onRetry,
  className = '',
}) => (
  <ErrorResponse
    error={{
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
        timestamp: new Date().toISOString(),
      },
    }}
    title="Connection Error"
    showRetry={!!onRetry}
    onRetry={onRetry}
    className={className}
  />
);

// Loading error component
export const LoadingError: React.FC<{ onRetry?: () => void; className?: string }> = ({
  onRetry,
  className = '',
}) => (
  <ErrorResponse
    error={{
      success: false,
      error: {
        code: 'LOADING_ERROR',
        message: 'Failed to load data. Please try again.',
        timestamp: new Date().toISOString(),
      },
    }}
    title="Loading Error"
    showRetry={!!onRetry}
    onRetry={onRetry}
    className={className}
  />
);

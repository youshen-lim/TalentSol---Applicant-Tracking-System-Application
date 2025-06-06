import React from 'react';
import { AlertTriangle, RefreshCw, Info, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StandardError, ErrorType, ErrorSeverity } from '@/utils/errorHandling';

interface StandardErrorDisplayProps {
  error: StandardError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showTechnicalDetails?: boolean;
  showSuggestions?: boolean;
  variant?: 'inline' | 'card' | 'toast';
  className?: string;
}

/**
 * Standardized error display component
 */
export const StandardErrorDisplay: React.FC<StandardErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showTechnicalDetails = false,
  showSuggestions = true,
  variant = 'inline',
  className,
}) => {
  const getErrorIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case ErrorSeverity.LOW:
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getErrorVariant = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-100 text-red-800';
      case ErrorSeverity.HIGH:
        return 'bg-red-100 text-red-700';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case ErrorSeverity.LOW:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'bg-orange-100 text-orange-800';
      case ErrorType.AUTHENTICATION:
        return 'bg-purple-100 text-purple-800';
      case ErrorType.AUTHORIZATION:
        return 'bg-red-100 text-red-800';
      case ErrorType.VALIDATION:
        return 'bg-blue-100 text-blue-800';
      case ErrorType.SERVER:
        return 'bg-red-100 text-red-800';
      case ErrorType.NOT_FOUND:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (variant === 'toast') {
    return (
      <Alert variant={getErrorVariant()} className={className}>
        {getErrorIcon()}
        <AlertTitle className="flex items-center gap-2">
          Error
          <Badge className={`text-xs ${getSeverityColor()}`}>
            {error.severity}
          </Badge>
        </AlertTitle>
        <AlertDescription>
          {error.userMessage}
          {onRetry && error.retryable && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-2 h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getErrorIcon()}
              <div>
                <CardTitle className="text-lg">Error Occurred</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getTypeColor()}`}>
                      {error.type}
                    </Badge>
                    <Badge className={`text-xs ${getSeverityColor()}`}>
                      {error.severity}
                    </Badge>
                  </div>
                </CardDescription>
              </div>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                ×
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">{error.userMessage}</p>

          {showSuggestions && error.suggestions && error.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                What you can try:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showTechnicalDetails && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-2">
                <div>
                  <span className="font-medium">Message:</span> {error.technicalMessage}
                </div>
                {error.code && (
                  <div>
                    <span className="font-medium">Code:</span> {error.code}
                  </div>
                )}
                {error.details && (
                  <div>
                    <span className="font-medium">Details:</span> {error.details}
                  </div>
                )}
                {error.field && (
                  <div>
                    <span className="font-medium">Field:</span> {error.field}
                  </div>
                )}
                <div>
                  <span className="font-medium">Timestamp:</span> {error.timestamp}
                </div>
                {error.requestId && (
                  <div>
                    <span className="font-medium">Request ID:</span> {error.requestId}
                  </div>
                )}
              </div>
            </details>
          )}

          {onRetry && error.retryable && (
            <div className="flex gap-2">
              <Button onClick={onRetry} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Inline variant (default)
  return (
    <Alert variant={getErrorVariant()} className={className}>
      {getErrorIcon()}
      <AlertTitle className="flex items-center gap-2">
        Error
        <div className="flex gap-1">
          <Badge className={`text-xs ${getTypeColor()}`}>
            {error.type}
          </Badge>
          <Badge className={`text-xs ${getSeverityColor()}`}>
            {error.severity}
          </Badge>
        </div>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error.userMessage}</p>

        {showSuggestions && error.suggestions && error.suggestions.length > 0 && (
          <div>
            <p className="font-medium text-sm mb-1">Try these steps:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              {error.suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          {onRetry && error.retryable && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>

        {showTechnicalDetails && (
          <details className="text-xs">
            <summary className="cursor-pointer">Technical Details</summary>
            <div className="mt-1 p-2 bg-gray-100 rounded text-gray-700">
              <div><strong>Message:</strong> {error.technicalMessage}</div>
              {error.code && <div><strong>Code:</strong> {error.code}</div>}
              {error.requestId && <div><strong>Request ID:</strong> {error.requestId}</div>}
            </div>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
};

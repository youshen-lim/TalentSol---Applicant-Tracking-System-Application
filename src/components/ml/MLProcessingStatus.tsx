import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MLProcessingStatusProps {
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'not_started';
  confidence?: number;
  score?: number;
  processingTime?: number;
  error?: string;
  className?: string;
  showDetails?: boolean;
}

/**
 * ML Processing Status Component
 * Shows the current status of ML processing for applications
 * Follows TalentSol design system and provides clear user feedback
 */
export const MLProcessingStatus: React.FC<MLProcessingStatusProps> = ({
  status,
  confidence,
  score,
  processingTime,
  error,
  className,
  showDetails = false
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          icon: <Clock className="h-3 w-3" />,
          label: 'Queued for AI Screening',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          description: 'Application queued for AI-powered candidate screening'
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: 'AI Screening in Progress',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          description: 'Analyzing resume and job match using Decision Tree model'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'AI Screening Complete',
          color: 'bg-green-100 text-green-700 border-green-200',
          description: 'AI-powered screening completed successfully'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'AI Screening Failed',
          color: 'bg-red-100 text-red-700 border-red-200',
          description: error || 'AI screening encountered an error'
        };
      default:
        return {
          icon: <Brain className="h-3 w-3" />,
          label: 'AI Screening Available',
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          description: 'Ready for AI-powered candidate screening'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={cn("space-y-2", className)}>
      {/* Status Badge */}
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-2 py-1",
          statusConfig.color
        )}
      >
        {statusConfig.icon}
        {statusConfig.label}
      </Badge>

      {/* Processing Progress (only show during processing) */}
      {status === 'processing' && (
        <div className="space-y-1">
          <Progress value={65} className="h-1.5" />
          <p className="text-xs text-gray-500">Analyzing text matching...</p>
        </div>
      )}

      {/* Results Summary (only show when completed) */}
      {status === 'completed' && score !== undefined && (
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-blue-600" />
            <span className="font-medium">Score: {score}/100</span>
          </div>
          {confidence !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Confidence: {Math.round(confidence * 100)}%</span>
            </div>
          )}
          {processingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">{processingTime}ms</span>
            </div>
          )}
        </div>
      )}

      {/* Detailed Description (optional) */}
      {showDetails && (
        <p className="text-xs text-gray-600 leading-relaxed">
          {statusConfig.description}
        </p>
      )}

      {/* Error Details (only show when failed) */}
      {status === 'failed' && error && showDetails && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Compact ML Status Indicator
 * Minimal version for use in tables and cards
 */
export const MLStatusIndicator: React.FC<{
  status: MLProcessingStatusProps['status'];
  score?: number;
  className?: string;
}> = ({ status, score, className }) => {
  const getIndicatorConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <Brain className="h-3 w-3" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      case 'queued':
        return {
          icon: <Clock className="h-3 w-3" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          icon: <Brain className="h-3 w-3" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const config = getIndicatorConfig();

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("p-1 rounded-full", config.bgColor)}>
        <div className={config.color}>
          {config.icon}
        </div>
      </div>
      {status === 'completed' && score !== undefined && (
        <span className="text-xs font-medium text-gray-700">
          {score}
        </span>
      )}
    </div>
  );
};

export default MLProcessingStatus;

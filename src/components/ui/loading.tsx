import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingUIProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Standardized loading UI component for TalentSol ATS
 * Based on the Candidates page loading pattern
 * Provides consistent loading states across all pages
 */
export const LoadingUI: React.FC<LoadingUIProps> = ({
  message = 'Loading...',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Standardized loading UI - matches Candidates page pattern
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4`}></div>
        <p className={`${textSizeClasses[size]} text-gray-500 font-inter`}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingUI;

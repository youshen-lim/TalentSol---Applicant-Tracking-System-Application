import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Standardized page header component for consistent layout across all pages
 * Provides consistent typography, spacing, and layout structure
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 font-sans", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3 font-sans">
          {Icon && <Icon className="h-6 w-6 text-blue-600 flex-shrink-0" />}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1 font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

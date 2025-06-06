import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'large' | 'compact';
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
  className,
  variant = 'default'
}: PageHeaderProps) => {
  // Variant-specific styling using Tailwind config typography
  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 font-sans",
          title: "text-metric text-gray-900 flex items-center gap-3 font-sans",
          icon: "h-8 w-8 text-ats-blue flex-shrink-0",
          subtitle: "text-base text-gray-500 mt-2 font-sans"
        };
      case 'compact':
        return {
          container: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 font-sans",
          title: "text-section-header text-gray-900 flex items-center gap-2 font-sans",
          icon: "h-5 w-5 text-ats-blue flex-shrink-0",
          subtitle: "text-sm text-gray-500 mt-1 font-sans"
        };
      default:
        return {
          container: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 font-sans",
          title: "text-page-title text-gray-900 flex items-center gap-3 font-sans",
          icon: "h-6 w-6 text-ats-blue flex-shrink-0",
          subtitle: "text-sm text-gray-500 mt-1 font-sans"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={cn(styles.container, className)}>
      <div className="min-w-0">
        <h1 className={styles.title}>
          {Icon && <Icon className={styles.icon} />}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && (
          <p className={styles.subtitle}>
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

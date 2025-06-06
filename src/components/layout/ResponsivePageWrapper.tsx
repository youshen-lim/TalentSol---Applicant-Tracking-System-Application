import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import PageHeader from './PageHeader';
import { ResponsiveContainer, ResponsiveStack } from '@/components/ui/responsive';

/**
 * Standardized responsive page wrapper for TalentSol ATS
 * Provides consistent layout, spacing, and responsive behavior across all pages
 */

interface ResponsivePageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  headerActions?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  
  // Layout options
  fullWidth?: boolean;
  noPadding?: boolean;
  noBackground?: boolean;
  
  // Responsive options
  mobileSpacing?: 'sm' | 'md' | 'lg';
  desktopSpacing?: 'sm' | 'md' | 'lg';
}

const ResponsivePageWrapper: React.FC<ResponsivePageWrapperProps> = ({
  children,
  title,
  subtitle,
  icon,
  headerActions,
  className,
  containerClassName,
  headerClassName,
  contentClassName,
  fullWidth = false,
  noPadding = false,
  noBackground = false,
  mobileSpacing = 'md',
  desktopSpacing = 'lg',
}) => {
  const {
    isMobile,
    isTablet,
    getSpacing,
    getPadding,
  } = useResponsiveLayout();

  // Responsive spacing configuration
  const spacingConfig = {
    sm: {
      mobile: 'space-y-3',
      desktop: 'sm:space-y-4',
      padding: 'p-3 sm:p-4',
    },
    md: {
      mobile: 'space-y-4',
      desktop: 'sm:space-y-6',
      padding: 'p-4 sm:p-6',
    },
    lg: {
      mobile: 'space-y-6',
      desktop: 'sm:space-y-8',
      padding: 'p-6 sm:p-8',
    },
  };

  const mobileSpacingClasses = spacingConfig[mobileSpacing];
  const desktopSpacingClasses = spacingConfig[desktopSpacing];

  // Background classes
  const backgroundClasses = noBackground 
    ? '' 
    : 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50';

  // Container classes
  const containerClasses = cn(
    backgroundClasses,
    !noPadding && '-m-6',
    !noPadding && getPadding('p-4', 'sm:p-6'),
    className
  );

  // Content wrapper classes
  const contentWrapperClasses = cn(
    fullWidth ? 'w-full' : 'max-w-7xl mx-auto',
    mobileSpacingClasses.mobile,
    desktopSpacingClasses.desktop,
    containerClassName
  );

  // Content area classes
  const contentAreaClasses = cn(
    'w-full min-w-fit overflow-x-auto',
    contentClassName
  );

  return (
    <div className={containerClasses}>
      <div className={contentWrapperClasses}>
        {/* Standardized Page Header */}
        <PageHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          className={headerClassName}
        >
          {headerActions}
        </PageHeader>

        {/* Main Content Area */}
        <div className={contentAreaClasses}>
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Responsive section wrapper for consistent section styling
 */
interface ResponsiveSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  spacing?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className,
  contentClassName,
  spacing = 'md',
  shadow = true,
  border = true,
}) => {
  const { getPadding, getSpacing } = useResponsiveLayout();

  const spacingClasses = {
    sm: getSpacing('gap-3', 'sm:gap-4'),
    md: getSpacing('gap-4', 'sm:gap-6'),
    lg: getSpacing('gap-6', 'sm:gap-8'),
  };

  const sectionClasses = cn(
    'bg-white rounded-lg',
    border && 'border border-slate-200',
    shadow && 'shadow-sm hover:shadow-md transition-shadow duration-300',
    className
  );

  const headerClasses = cn(
    getPadding('p-4', 'sm:p-6'),
    (title || subtitle || headerActions) && 'border-b border-slate-100'
  );

  const contentClasses = cn(
    getPadding('p-4', 'sm:p-6'),
    contentClassName
  );

  return (
    <div className={sectionClasses}>
      {/* Section Header */}
      {(title || subtitle || headerActions) && (
        <div className={headerClasses}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Content */}
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

/**
 * Responsive grid wrapper for consistent grid layouts
 */
interface ResponsiveGridWrapperProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGridWrapper: React.FC<ResponsiveGridWrapperProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = 'md',
  className,
}) => {
  const { getGridClasses, getSpacing } = useResponsiveLayout();

  const gapClasses = {
    sm: getSpacing('gap-3', 'sm:gap-4'),
    md: getSpacing('gap-4', 'sm:gap-6'),
    lg: getSpacing('gap-6', 'sm:gap-8'),
  };

  const gridClasses = getGridClasses(
    `grid-cols-${columns.mobile || 1}`,
    `sm:grid-cols-${columns.tablet || 2}`,
    `lg:grid-cols-${columns.desktop || 3}`,
    `xl:grid-cols-${columns.wide || 4}`
  );

  return (
    <div className={cn(
      'grid',
      gridClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Responsive tabs wrapper for mobile-friendly tab navigation
 */
interface ResponsiveTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    count?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  const { isMobile } = useResponsiveLayout();

  return (
    <div className={cn(
      'bg-white rounded-lg border border-slate-200 shadow-sm',
      className
    )}>
      <div className="p-1">
        <div className={cn(
          'flex',
          isMobile ? 'overflow-x-auto' : 'space-x-1'
        )}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200',
                  isMobile ? 'whitespace-nowrap' : '',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResponsivePageWrapper;

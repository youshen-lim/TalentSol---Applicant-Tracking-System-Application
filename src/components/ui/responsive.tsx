import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Standardized Mobile Responsiveness System for TalentSol ATS
 * Provides consistent responsive patterns across all pages and components
 */

// Breakpoint definitions following TalentSol standards
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

// Responsive grid system
export const gridClasses = {
  // Standard responsive grids
  cols1: "grid-cols-1",
  cols2: "grid-cols-1 sm:grid-cols-2",
  cols3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  cols4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  cols6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  
  // Dashboard specific grids
  dashboardMetrics: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  dashboardCards: "grid-cols-1 lg:grid-cols-2",
  
  // Application Management specific grids
  applicationTabs: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  formsList: "grid-cols-1",
  
  // Jobs page grids
  jobsGrid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  
  // Candidates page grids
  candidatesGrid: "grid-cols-1 lg:grid-cols-2",
} as const;

// Responsive spacing system
export const spacing = {
  // Container padding
  containerPadding: "px-4 sm:px-6 lg:px-8",
  
  // Section spacing
  sectionGap: "space-y-4 sm:space-y-6 lg:space-y-8",
  
  // Card spacing
  cardPadding: "p-4 sm:p-6",
  cardGap: "gap-4 sm:gap-6",
  
  // Header spacing
  headerGap: "gap-2 sm:gap-4",
  
  // Button spacing
  buttonGap: "gap-2 sm:gap-3",
} as const;

// Responsive typography
export const typography = {
  // Page titles
  pageTitle: "text-xl sm:text-2xl lg:text-3xl font-bold",
  
  // Section titles
  sectionTitle: "text-lg sm:text-xl font-semibold",
  
  // Card titles
  cardTitle: "text-base sm:text-lg font-semibold",
  
  // Subtitles
  subtitle: "text-sm sm:text-base text-gray-600",
  
  // Body text
  body: "text-sm sm:text-base",
  
  // Small text
  small: "text-xs sm:text-sm",
} as const;

// Responsive layout patterns
export const layouts = {
  // Page layout
  page: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -m-6 p-4 sm:p-6",
  
  // Content container
  container: "max-w-7xl mx-auto",
  
  // Card layout
  card: "bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300",
  
  // Flex layouts
  flexBetween: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
  flexCenter: "flex flex-col sm:flex-row sm:items-center gap-4",
  
  // Stack layouts
  stack: "flex flex-col space-y-4",
  stackSm: "flex flex-col space-y-2",
  stackLg: "flex flex-col space-y-6",
} as const;

// Responsive component props
interface ResponsiveProps {
  children: React.ReactNode;
  className?: string;
}

// Responsive Grid Component
interface ResponsiveGridProps extends ResponsiveProps {
  variant?: keyof typeof gridClasses;
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  variant = 'cols3',
  gap = 'md',
  className,
}) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  return (
    <div className={cn(
      'grid',
      gridClasses[variant],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive Container Component
export const ResponsiveContainer: React.FC<ResponsiveProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(layouts.container, spacing.containerPadding, className)}>
      {children}
    </div>
  );
};

// Responsive Card Component
interface ResponsiveCardProps extends ResponsiveProps {
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  padding = 'md',
  shadow = true,
  className,
}) => {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border border-slate-200',
      shadow && 'shadow-sm hover:shadow-md transition-shadow duration-300',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive Flex Component
interface ResponsiveFlexProps extends ResponsiveProps {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'between';
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  direction = 'col',
  align = 'start',
  gap = 'md',
  className,
}) => {
  const directionClasses = {
    row: 'flex flex-col sm:flex-row',
    col: 'flex flex-col',
  };

  const alignClasses = {
    start: direction === 'row' ? 'sm:items-start' : 'items-start',
    center: direction === 'row' ? 'sm:items-center' : 'items-center',
    end: direction === 'row' ? 'sm:items-end' : 'items-end',
    between: direction === 'row' ? 'sm:items-center sm:justify-between' : 'justify-between',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn(
      directionClasses[direction],
      alignClasses[align],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive Text Component
interface ResponsiveTextProps extends ResponsiveProps {
  variant?: keyof typeof typography;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  as: Component = 'p',
  className,
}) => {
  return (
    <Component className={cn(typography[variant], className)}>
      {children}
    </Component>
  );
};

// Responsive Stack Component
interface ResponsiveStackProps extends ResponsiveProps {
  spacing?: 'sm' | 'md' | 'lg';
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  spacing = 'md',
  className,
}) => {
  const spacingClasses = {
    sm: 'space-y-2 sm:space-y-3',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8',
  };

  return (
    <div className={cn('flex flex-col', spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};

// Hook for responsive values
export const useResponsiveValue = <T,>(
  mobileValue: T,
  desktopValue: T,
  breakpoint?: number
): T => {
  const isMobile = useIsMobile(breakpoint);
  return isMobile ? mobileValue : desktopValue;
};

// Utility function to get responsive classes
export const getResponsiveClasses = (
  mobileClasses: string,
  desktopClasses: string,
  breakpoint: keyof typeof breakpoints = 'mobile'
): string => {
  const bp = breakpoint === 'mobile' ? 'sm' : 
            breakpoint === 'tablet' ? 'lg' : 
            breakpoint === 'desktop' ? 'xl' : 'sm';
  
  return `${mobileClasses} ${bp}:${desktopClasses}`;
};

// Export all utilities
export {
  breakpoints,
  gridClasses,
  spacing,
  typography,
  layouts,
};

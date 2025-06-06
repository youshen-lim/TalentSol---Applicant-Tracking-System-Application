import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Standardized layout components for TalentSol ATS application
 * Uses Tailwind config tokens for consistent spacing and responsive behavior
 */

// Page container variants
const pageContainerVariants = cva(
  "mx-auto font-sans",
  {
    variants: {
      variant: {
        default: "px-4 md:px-6 lg:px-8 py-6 md:py-8",
        compact: "px-4 md:px-6 py-4 md:py-6",
        wide: "px-6 md:px-8 lg:px-12 py-8 md:py-12",
        full: "px-0 py-0",
      },
      maxWidth: {
        default: "max-w-7xl",
        sm: "max-w-4xl",
        md: "max-w-5xl",
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        full: "max-w-full",
      },
      background: {
        default: "",
        gray: "bg-gray-50",
        gradient: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
        white: "bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
      maxWidth: "default",
      background: "default",
    },
  }
);

// Card container variants using Tailwind config shadows
const cardContainerVariants = cva(
  "bg-white rounded-lg border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-slate-200 shadow-ats-card hover:shadow-ats-card-hover",
        enhanced: "border-gray-200 shadow-ats-card-hover hover:shadow-ats-modal backdrop-blur-sm",
        flat: "border-slate-200 shadow-none hover:shadow-ats-card",
        outlined: "border-ats-blue/20 shadow-none hover:border-ats-blue/30 hover:shadow-ats-card",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

// Grid layout variants
const gridVariants = cva(
  "grid gap-6",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      },
      gap: {
        sm: "gap-3",
        default: "gap-6",
        lg: "gap-8",
        xl: "gap-12",
      },
    },
    defaultVariants: {
      cols: "auto",
      gap: "default",
    },
  }
);

// Component interfaces
interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {}

interface CardContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContainerVariants> {}

interface GridContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

// Page Container Component
export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, variant, maxWidth, background, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageContainerVariants({ variant, maxWidth, background }), className)}
        {...props}
      />
    );
  }
);
PageContainer.displayName = "PageContainer";

// Card Container Component
export const CardContainer = React.forwardRef<HTMLDivElement, CardContainerProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardContainerVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);
CardContainer.displayName = "CardContainer";

// Grid Container Component
export const GridContainer = React.forwardRef<HTMLDivElement, GridContainerProps>(
  ({ className, cols, gap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gridVariants({ cols, gap }), className)}
        {...props}
      />
    );
  }
);
GridContainer.displayName = "GridContainer";

// Standardized spacing utilities using Tailwind config
export const spacing = {
  // Page sections
  section: "space-y-6",
  sectionLarge: "space-y-8",
  sectionCompact: "space-y-4",
  
  // Component spacing
  component: "space-y-4",
  componentLarge: "space-y-6",
  componentCompact: "space-y-2",
  
  // Form spacing
  form: "space-y-4",
  formLarge: "space-y-6",
  formCompact: "space-y-3",
} as const;

// Standardized responsive padding utilities
export const responsivePadding = {
  page: "px-4 md:px-6 lg:px-8",
  pageVertical: "py-6 md:py-8",
  section: "px-4 md:px-6",
  sectionVertical: "py-4 md:py-6",
  component: "p-4 md:p-6",
  componentLarge: "p-6 md:p-8",
} as const;

// Export variants for external use
export { pageContainerVariants, cardContainerVariants, gridVariants };

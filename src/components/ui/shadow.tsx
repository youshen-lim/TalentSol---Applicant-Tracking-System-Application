import React from 'react';
import { cn } from '@/lib/utils';
import { useStandardizedShadows } from '@/hooks/useABTest';

// Legacy shadow variants (control group)
export const legacyShadowVariants = {
  // Card shadows - for main content containers
  card: "bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300",

  // Enhanced card shadows - for important content like StatCards
  cardEnhanced: "bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300",

  // Modal shadows - for overlays and modals
  modal: "bg-white rounded-lg border border-slate-200 shadow-xl",

  // Dropdown shadows - for menus and dropdowns
  dropdown: "bg-white rounded-md border border-slate-200 shadow-lg",
};

// Standardized shadow variants for TalentSol application using Tailwind config
export const standardizedShadowVariants = {
  // Card shadows - for main content containers
  card: "bg-white rounded-lg border border-slate-200 shadow-ats-card hover:shadow-ats-card-hover transition-shadow duration-300",

  // Enhanced card shadows - for important content like StatCards
  cardEnhanced: "bg-white/80 backdrop-blur-sm border border-gray-200 shadow-ats-card-hover hover:shadow-ats-modal transition-all duration-300",

  // Modal shadows - for overlays and modals
  modal: "bg-white rounded-lg border border-slate-200 shadow-ats-modal",

  // Dropdown shadows - for menus and dropdowns
  dropdown: "bg-white rounded-md border border-slate-200 shadow-ats-dropdown",
};

// A/B tested shadow variants - automatically switches based on user's test group
export const shadowVariants = {
  card: "",
  cardEnhanced: "",
  modal: "",
  dropdown: "",
};

// Hook to get appropriate shadow variant based on A/B test
export const useShadowVariant = (variant: keyof typeof shadowVariants): string => {
  const useStandardized = useStandardizedShadows();
  const variants = useStandardized ? standardizedShadowVariants : legacyShadowVariants;
  return variants[variant] || variants.card;
};

// Component wrapper for A/B tested shadows
interface ShadowWrapperProps {
  variant: keyof typeof shadowVariants;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const ShadowWrapper: React.FC<ShadowWrapperProps> = ({
  variant,
  children,
  className,
  as: Component = 'div'
}) => {
  const shadowClass = useShadowVariant(variant);

  return (
    <Component className={cn(shadowClass, className)}>
      {children}
    </Component>
  );
};
  
  // Button shadows - for interactive elements
  button: "shadow-sm hover:shadow-md transition-shadow duration-200",
  
  // Input shadows - for form elements
  input: "border border-slate-300 shadow-sm focus:shadow-md transition-shadow duration-200",
  
  // Sidebar shadows - for navigation panels
  sidebar: "bg-white border-r border-slate-200 shadow-sm",
  
  // Header shadows - for top navigation
  header: "bg-white border-b border-slate-200 shadow-sm",
  
  // None - for elements that should not have shadows
  none: ""
} as const;

export type ShadowVariant = keyof typeof shadowVariants;

// Shadow wrapper component for consistent styling
interface ShadowBoxProps {
  variant?: ShadowVariant;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  onClick?: () => void;
}

export const ShadowBox: React.FC<ShadowBoxProps> = ({
  variant = 'card',
  className,
  children,
  as: Component = 'div',
  onClick,
  ...props
}) => {
  return (
    <Component
      className={cn(shadowVariants[variant], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

// Utility function to get shadow classes
export const getShadowClasses = (variant: ShadowVariant): string => {
  return shadowVariants[variant];
};

// Pre-configured shadow components for common use cases
export const CardShadow: React.FC<Omit<ShadowBoxProps, 'variant'>> = (props) => (
  <ShadowBox variant="card" {...props} />
);

export const EnhancedCardShadow: React.FC<Omit<ShadowBoxProps, 'variant'>> = (props) => (
  <ShadowBox variant="cardEnhanced" {...props} />
);

export const ModalShadow: React.FC<Omit<ShadowBoxProps, 'variant'>> = (props) => (
  <ShadowBox variant="modal" {...props} />
);

export const DropdownShadow: React.FC<Omit<ShadowBoxProps, 'variant'>> = (props) => (
  <ShadowBox variant="dropdown" {...props} />
);

// Shadow classes for direct use in className props
export const shadows = {
  // Standard card shadow
  card: "bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300",
  
  // Enhanced card shadow with backdrop blur
  cardEnhanced: "bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300",
  
  // Modal shadow
  modal: "bg-white rounded-lg border border-slate-200 shadow-xl",
  
  // Dropdown shadow
  dropdown: "bg-white rounded-md border border-slate-200 shadow-lg",
  
  // Button shadow
  button: "shadow-sm hover:shadow-md transition-shadow duration-200",
  
  // Input shadow
  input: "border border-slate-300 shadow-sm focus:shadow-md transition-shadow duration-200",
  
  // Sidebar shadow
  sidebar: "bg-white border-r border-slate-200 shadow-sm",
  
  // Header shadow
  header: "bg-white border-b border-slate-200 shadow-sm"
} as const;

export default ShadowBox;

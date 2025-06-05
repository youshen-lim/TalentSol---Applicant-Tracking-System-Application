/**
 * Shadow utility classes for consistent shadow styling across the application
 */

export const shadows = {
  // Card shadows
  card: 'bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300',
  
  // Component shadows
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  
  // Interactive shadows
  hover: 'hover:shadow-md transition-shadow duration-300',
  focus: 'focus:shadow-lg transition-shadow duration-300',
  
  // Specific component shadows
  button: 'shadow-sm hover:shadow-md transition-shadow duration-200',
  modal: 'shadow-xl',
  dropdown: 'shadow-lg',
  tooltip: 'shadow-md',
  
  // Color-specific shadows
  blue: 'shadow-blue-100',
  purple: 'shadow-purple-100',
  green: 'shadow-green-100',
  red: 'shadow-red-100',
  
  // None
  none: 'shadow-none'
} as const;

export type ShadowKey = keyof typeof shadows;

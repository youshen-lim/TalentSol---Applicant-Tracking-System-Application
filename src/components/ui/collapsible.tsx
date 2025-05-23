import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Enhanced Collapsible component for TalentSol ATS application
 * Supports ATS-specific styling and variants
 */

// Base Collapsible component
const Collapsible = CollapsiblePrimitive.Root

// Collapsible trigger with variants
const collapsibleTriggerVariants = cva(
  "flex items-center justify-between w-full font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
  {
    variants: {
      variant: {
        default: "text-foreground",
        "ats-blue": "text-ats-blue hover:text-ats-dark-blue",
        "ats-purple": "text-ats-purple hover:text-ats-dark-purple",
      },
      size: {
        default: "text-sm py-2",
        sm: "text-xs py-1",
        lg: "text-base py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CollapsibleTriggerProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
    VariantProps<typeof collapsibleTriggerVariants> {
  showIcon?: boolean
  icon?: React.ReactNode
}

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  CollapsibleTriggerProps
>(({ className, variant, size, showIcon = true, icon, children, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn(collapsibleTriggerVariants({ variant, size }), className)}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {showIcon && (
      <div className="flex-shrink-0 ml-2 transition-transform duration-200">
        {icon || <ChevronDown className="h-4 w-4" />}
      </div>
    )}
  </CollapsiblePrimitive.CollapsibleTrigger>
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName

// Collapsible content with variants
const collapsibleContentVariants = cva(
  "overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
  {
    variants: {
      variant: {
        default: "text-foreground",
        "ats-blue": "text-ats-blue/80",
        "ats-purple": "text-ats-purple/80",
      },
      padding: {
        default: "pt-1 pb-2",
        none: "",
        sm: "pt-0.5 pb-1",
        lg: "pt-2 pb-4",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface CollapsibleContentProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>,
    VariantProps<typeof collapsibleContentVariants> {}

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  CollapsibleContentProps
>(({ className, variant, padding, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(collapsibleContentVariants({ variant, padding }), className)}
    {...props}
  />
))
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  collapsibleTriggerVariants,
  collapsibleContentVariants
}

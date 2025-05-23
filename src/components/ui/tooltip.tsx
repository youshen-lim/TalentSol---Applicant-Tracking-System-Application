import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Tooltip component for TalentSol ATS application
 * Includes ATS-specific variants and improved styling
 */

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const tooltipVariants = cva(
  "z-50 overflow-hidden rounded-md px-3 py-1.5 text-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 shadow-md",
  {
    variants: {
      variant: {
        default: "border bg-popover text-popover-foreground",
        primary: "bg-primary text-primary-foreground",
        "ats-blue": "bg-ats-blue text-white",
        "ats-light-blue": "bg-ats-light-blue text-white",
        "ats-purple": "bg-ats-purple text-white",
        "ats-light-purple": "bg-ats-light-purple text-white",
        "ats-blue-subtle": "bg-ats-blue/10 text-ats-dark-blue border border-ats-blue/20",
        "ats-purple-subtle": "bg-ats-purple/10 text-ats-dark-purple border border-ats-purple/20",
      },
      size: {
        default: "",
        sm: "text-xs py-1 px-2",
        lg: "text-base p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipVariants> {}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, variant, size, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(tooltipVariants({ variant, size }), className)}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  tooltipVariants
}

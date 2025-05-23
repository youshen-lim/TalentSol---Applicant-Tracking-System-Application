import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Separator component for TalentSol ATS application
 * Includes ATS-specific variants and size options
 */
const separatorVariants = cva(
  "shrink-0",
  {
    variants: {
      variant: {
        default: "bg-border",
        "ats-blue": "bg-ats-blue/30",
        "ats-dark-blue": "bg-ats-dark-blue",
        "ats-purple": "bg-ats-purple/30",
        "ats-dark-purple": "bg-ats-dark-purple",
        "ats-gray": "bg-ats-border-gray",
        "ats-subtle": "bg-muted",
      },
      size: {
        default: "",
        thin: "h-[0.5px]",
        thick: "h-[2px]",
        xl: "h-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, variant, size, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorVariants({ variant, size }),
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator, separatorVariants }

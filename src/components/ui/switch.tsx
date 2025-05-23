import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Switch component for TalentSol ATS application
 * Includes ATS-specific variants and improved styling
 */

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:ring-ring",
        "ats-blue": "data-[state=checked]:bg-ats-blue data-[state=unchecked]:bg-input focus-visible:ring-ats-blue",
        "ats-purple": "data-[state=checked]:bg-ats-purple data-[state=unchecked]:bg-input focus-visible:ring-ats-purple",
        "ats-blue-subtle": "data-[state=checked]:bg-ats-blue/80 data-[state=unchecked]:bg-ats-blue/20 focus-visible:ring-ats-blue",
        "ats-purple-subtle": "data-[state=checked]:bg-ats-purple/80 data-[state=unchecked]:bg-ats-purple/20 focus-visible:ring-ats-purple",
      },
      size: {
        default: "h-6 w-11",
        sm: "h-5 w-9",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
  {
    variants: {
      variant: {
        default: "",
        "ats-blue": "",
        "ats-purple": "",
        "ats-blue-subtle": "",
        "ats-purple-subtle": "",
      },
      size: {
        default: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        lg: "h-6 w-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ variant, size }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(thumbVariants({ variant, size }))}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch, switchVariants, thumbVariants }

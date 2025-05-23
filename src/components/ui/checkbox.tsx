import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Checkbox component for TalentSol ATS application
 * Supports ATS-specific styling and variants
 */

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground",
  {
    variants: {
      variant: {
        default: "border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        "ats-blue": "border-ats-blue data-[state=checked]:bg-ats-blue data-[state=checked]:border-ats-blue",
        "ats-purple": "border-ats-purple data-[state=checked]:bg-ats-purple data-[state=checked]:border-ats-purple",
        "ats-outline-blue": "border-ats-blue bg-transparent data-[state=checked]:bg-ats-blue/20 data-[state=checked]:border-ats-blue data-[state=checked]:text-ats-blue",
        "ats-outline-purple": "border-ats-purple bg-transparent data-[state=checked]:bg-ats-purple/20 data-[state=checked]:border-ats-purple data-[state=checked]:text-ats-purple",
      },
      size: {
        default: "h-4 w-4",
        sm: "h-3 w-3",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant, size }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className={cn(
        size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
      )} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, checkboxVariants }

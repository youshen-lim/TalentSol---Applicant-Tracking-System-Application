import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "",
        ats: "text-ats-dark-blue mb-2",
        required: "after:content-['*'] after:ml-0.5 after:text-red-500",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

// Enhanced label with optional description
interface LabelWithDescriptionProps extends React.ComponentPropsWithoutRef<typeof Label> {
  description?: string;
}

const LabelWithDescription = React.forwardRef<
  React.ElementRef<typeof Label>,
  LabelWithDescriptionProps
>(({ className, description, children, ...props }, ref) => (
  <div className="space-y-1">
    <Label ref={ref} className={className} {...props}>
      {children}
    </Label>
    {description && (
      <p className="text-xs text-muted-foreground">{description}</p>
    )}
  </div>
))
LabelWithDescription.displayName = "LabelWithDescription"

export { Label, LabelWithDescription, labelVariants }

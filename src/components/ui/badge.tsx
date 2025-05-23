import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // ATS-specific variants
        "ats-blue":
          "border-transparent bg-ats-blue text-white hover:bg-ats-dark-blue",
        "ats-light-blue":
          "border-transparent bg-ats-light-blue text-white hover:bg-ats-blue",
        "ats-purple":
          "border-transparent bg-ats-purple text-white hover:bg-ats-dark-purple",
        "ats-light-purple":
          "border-transparent bg-ats-light-purple text-white hover:bg-ats-purple",
        // Subtle variants with transparent backgrounds
        "ats-blue-subtle":
          "border border-ats-blue/30 bg-ats-blue/10 text-ats-blue hover:bg-ats-blue/20",
        "ats-purple-subtle":
          "border border-ats-purple/30 bg-ats-purple/10 text-ats-purple hover:bg-ats-purple/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

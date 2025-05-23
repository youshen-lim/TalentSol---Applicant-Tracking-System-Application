import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Enhanced Skeleton component for TalentSol ATS application
 * Includes ATS-specific variants and improved styling
 */
const skeletonVariants = cva("animate-pulse rounded-md", {
  variants: {
    variant: {
      default: "bg-muted",
      "ats-blue": "bg-ats-blue/10",
      "ats-purple": "bg-ats-purple/10",
      "ats-gray": "bg-ats-border-gray",
      subtle: "bg-muted/50",
    },
    size: {
      default: "",
      sm: "h-4",
      md: "h-8",
      lg: "h-12",
      icon: "h-6 w-6",
      avatar: "h-10 w-10 rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({
  className,
  variant,
  size,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }

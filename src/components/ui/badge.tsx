import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-white hover:bg-indigo-700",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-gray-900",
        // Pipeline status badges — flat design system style
        "status-applied":
          "border-0 bg-blue-100 text-blue-700",
        "status-screening":
          "border-0 bg-yellow-100 text-yellow-700",
        "status-interview":
          "border-0 bg-purple-100 text-purple-700",
        "status-assessment":
          "border-0 bg-orange-100 text-orange-700",
        "status-offer":
          "border-0 bg-emerald-100 text-emerald-700",
        "status-hired":
          "border-0 bg-emerald-100 text-emerald-700",
        "status-rejected":
          "border-0 bg-red-100 text-red-700",
        // Job status badges
        "job-live":
          "border-0 bg-emerald-100 text-emerald-700",
        "job-draft":
          "border border-gray-200 bg-gray-100 text-gray-700",
        "job-archived":
          "border border-yellow-200 bg-yellow-100 text-yellow-700",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export const getLegacyApplicationStatusBadge = (status: string) => {
  const statusMap: Record<string, { className: string; label: string }> = {
    applied: { className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-0", label: "Applied" },
    review: { className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0", label: "Screening" },
    screening: { className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0", label: "Screening" },
    interview: { className: "bg-purple-100 text-purple-700 hover:bg-purple-100 border-0", label: "Interview" },
    assessment: { className: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-0", label: "Assessment" },
    offer: { className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0", label: "Offer" },
    hired: { className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0", label: "Hired" },
    rejected: { className: "bg-red-100 text-red-700 hover:bg-red-100 border-0", label: "Rejected" },
  };

  const config = statusMap[status] || statusMap.applied;
  return { className: config.className, label: config.label };
};

// Standardized status badge helper functions (test group)
export const getStandardizedApplicationStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    applied: { variant: "status-applied", label: "Applied" },
    review: { variant: "status-screening", label: "Screening" },
    screening: { variant: "status-screening", label: "Screening" },
    interview: { variant: "status-interview", label: "Interview" },
    assessment: { variant: "status-assessment", label: "Assessment" },
    offer: { variant: "status-offer", label: "Offer" },
    hired: { variant: "status-hired", label: "Hired" },
    rejected: { variant: "status-rejected", label: "Rejected" },
  };

  const config = statusMap[status] || statusMap.applied;
  return { variant: config.variant, label: config.label };
};

// A/B tested status badge helper function
export const getApplicationStatusBadge = (status: string) => {
  return { status, useStandardized: true };
};

export const getJobStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    live: { variant: "job-live", label: "Live" },
    open: { variant: "job-live", label: "Open" },
    draft: { variant: "job-draft", label: "Draft" },
    archived: { variant: "job-archived", label: "Archived" },
    closed: { variant: "status-rejected", label: "Closed" },
  };

  const config = statusMap[status] || statusMap.draft;
  return { variant: config.variant, label: config.label };
};

export { Badge, badgeVariants }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
        // Standardized status badges using Tailwind config gradients
        "status-applied":
          "border-0 bg-ats-status-applied text-white shadow-sm hover:shadow-md",
        "status-screening":
          "border-0 bg-ats-status-screening text-white shadow-sm hover:shadow-md",
        "status-interview":
          "border-0 bg-ats-status-interview text-white shadow-sm hover:shadow-md",
        "status-assessment":
          "border-0 bg-ats-status-interview text-white shadow-sm hover:shadow-md",
        "status-offer":
          "border-0 bg-ats-status-offer text-white shadow-sm hover:shadow-md",
        "status-hired":
          "border-0 bg-ats-status-hired text-white shadow-sm hover:shadow-md",
        "status-rejected":
          "border-0 bg-ats-status-rejected text-white shadow-sm hover:shadow-md",
        // Job status badges
        "job-live":
          "border-0 bg-ats-status-offer text-white shadow-sm hover:shadow-md",
        "job-draft":
          "border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200",
        "job-archived":
          "border border-yellow-300 bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
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

// Legacy status badge helper functions (control group)
export const getLegacyApplicationStatusBadge = (status: string) => {
  const statusMap: Record<string, { className: string; label: string }> = {
    applied: { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-sm", label: "Applied" },
    review: { className: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-sm", label: "Screening" },
    screening: { className: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-sm", label: "Screening" },
    interview: { className: "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-sm", label: "Interview" },
    assessment: { className: "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-sm", label: "Assessment" },
    offer: { className: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-sm", label: "Offer" },
    hired: { className: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-sm", label: "Hired" },
    rejected: { className: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-sm", label: "Rejected" },
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
  // This will be used by components to automatically get the right variant
  return { status, useStandardized: true }; // Components will handle the A/B logic
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

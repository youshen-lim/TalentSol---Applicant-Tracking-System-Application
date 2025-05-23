import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast, type ToastT } from "sonner"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Sonner Toaster component for TalentSol ATS application
 * Includes ATS-specific variants and improved styling
 */

type ToasterProps = React.ComponentProps<typeof Sonner> & {
  variant?: "default" | "ats-blue" | "ats-purple"
}

// Define toast variants for different styles
const toastVariants = cva("group toast", {
  variants: {
    variant: {
      default: "group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border",
      "ats-blue": "group-[.toaster]:bg-ats-blue/5 group-[.toaster]:text-ats-dark-blue group-[.toaster]:border-ats-blue/20",
      "ats-purple": "group-[.toaster]:bg-ats-purple/5 group-[.toaster]:text-ats-dark-purple group-[.toaster]:border-ats-purple/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

// Define action button variants
const actionButtonVariants = cva("", {
  variants: {
    variant: {
      default: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      "ats-blue": "group-[.toast]:bg-ats-blue group-[.toast]:text-white",
      "ats-purple": "group-[.toast]:bg-ats-purple group-[.toast]:text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

// Define cancel button variants
const cancelButtonVariants = cva("", {
  variants: {
    variant: {
      default: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      "ats-blue": "group-[.toast]:bg-ats-blue/10 group-[.toast]:text-ats-blue",
      "ats-purple": "group-[.toast]:bg-ats-purple/10 group-[.toast]:text-ats-purple",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

// Define description variants
const descriptionVariants = cva("", {
  variants: {
    variant: {
      default: "group-[.toast]:text-muted-foreground",
      "ats-blue": "group-[.toast]:text-ats-blue/80",
      "ats-purple": "group-[.toast]:text-ats-purple/80",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Toaster = ({ variant = "default", ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            toastVariants({ variant }),
            "group-[.toaster]:shadow-lg"
          ),
          description: descriptionVariants({ variant }),
          actionButton: actionButtonVariants({ variant }),
          cancelButton: cancelButtonVariants({ variant }),
          // Add ATS-specific styling for other elements
          title: variant === "ats-blue"
            ? "group-[.toast]:font-medium group-[.toast]:text-ats-dark-blue"
            : variant === "ats-purple"
              ? "group-[.toast]:font-medium group-[.toast]:text-ats-dark-purple"
              : "",
          closeButton: variant === "ats-blue"
            ? "group-[.toast]:text-ats-blue/70 group-[.toast]:hover:text-ats-blue"
            : variant === "ats-purple"
              ? "group-[.toast]:text-ats-purple/70 group-[.toast]:hover:text-ats-purple"
              : "",
          success: variant === "ats-blue"
            ? "group-[.toast]:text-ats-blue group-[.toast]:bg-ats-blue/10"
            : variant === "ats-purple"
              ? "group-[.toast]:text-ats-purple group-[.toast]:bg-ats-purple/10"
              : "",
          error: "group-[.toast]:text-destructive group-[.toast]:bg-destructive/10",
          info: variant === "ats-blue"
            ? "group-[.toast]:text-ats-blue group-[.toast]:bg-ats-blue/10"
            : variant === "ats-purple"
              ? "group-[.toast]:text-ats-purple group-[.toast]:bg-ats-purple/10"
              : "group-[.toast]:text-primary group-[.toast]:bg-primary/10",
        },
      }}
      {...props}
    />
  )
}

// Enhanced toast function with ATS-specific variants
type ToastOptions = Omit<ToastT, "id"> & {
  variant?: "default" | "ats-blue" | "ats-purple"
}

const toast = {
  ...sonnerToast,
  // Override the default toast method
  default: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, options)
  },
  // Add ATS-specific variants
  atsBlue: (message: string, options?: Omit<ToastOptions, "variant">) => {
    return sonnerToast(message, { ...options, className: "bg-ats-blue/5 border-ats-blue/20 text-ats-dark-blue" })
  },
  atsPurple: (message: string, options?: Omit<ToastOptions, "variant">) => {
    return sonnerToast(message, { ...options, className: "bg-ats-purple/5 border-ats-purple/20 text-ats-dark-purple" })
  },
  // Override success with ATS-specific styling
  success: (message: string, options?: ToastOptions) => {
    const className = options?.variant === "ats-blue"
      ? "border-ats-blue/20 [&>div>.sonner-toast-icon]:text-ats-blue [&>div>.sonner-toast-icon]:bg-ats-blue/10"
      : options?.variant === "ats-purple"
        ? "border-ats-purple/20 [&>div>.sonner-toast-icon]:text-ats-purple [&>div>.sonner-toast-icon]:bg-ats-purple/10"
        : ""
    return sonnerToast.success(message, { ...options, className })
  },
  // Override error with ATS-specific styling
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, options)
  },
  // Override info with ATS-specific styling
  info: (message: string, options?: ToastOptions) => {
    const className = options?.variant === "ats-blue"
      ? "border-ats-blue/20 [&>div>.sonner-toast-icon]:text-ats-blue [&>div>.sonner-toast-icon]:bg-ats-blue/10"
      : options?.variant === "ats-purple"
        ? "border-ats-purple/20 [&>div>.sonner-toast-icon]:text-ats-purple [&>div>.sonner-toast-icon]:bg-ats-purple/10"
        : ""
    return sonnerToast.info(message, { ...options, className })
  },
}

export { Toaster, toast, toastVariants, actionButtonVariants, cancelButtonVariants, descriptionVariants }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 [&>svg]:text-green-500",
        warning:
          "border-yellow-500/50 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 [&>svg]:text-yellow-500",
        info:
          "border-blue-500/50 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 [&>svg]:text-blue-500",
        ats:
          "border-ats-blue/50 bg-ats-blue/10 text-ats-blue dark:bg-ats-blue/20 dark:text-ats-light-blue [&>svg]:text-ats-blue",
        atsSecondary:
          "border-ats-purple/50 bg-ats-purple/10 text-ats-purple dark:bg-ats-purple/20 dark:text-ats-light-purple [&>svg]:text-ats-purple",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps extends
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {
  icon?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </div>
  )
)
Alert.displayName = "Alert"

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: 'default' | 'ats' | 'atsSecondary'
}

const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: "mb-1 font-medium leading-none tracking-tight",
      ats: "mb-1 font-semibold leading-none tracking-tight text-ats-blue",
      atsSecondary: "mb-1 font-semibold leading-none tracking-tight text-ats-purple"
    }

    return (
      <h5
        ref={ref}
        className={cn(variantStyles[variant], className)}
        {...props}
      />
    )
  }
)
AlertTitle.displayName = "AlertTitle"

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'ats' | 'atsSecondary'
  hasIcon?: boolean
}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, variant = 'default', hasIcon = false, ...props }, ref) => {
    const variantStyles = {
      default: "text-sm [&_p]:leading-relaxed",
      ats: "text-sm [&_p]:leading-relaxed text-ats-blue/80",
      atsSecondary: "text-sm [&_p]:leading-relaxed text-ats-purple/80"
    }

    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant],
          hasIcon && "pl-7",
          className
        )}
        {...props}
      />
    )
  }
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

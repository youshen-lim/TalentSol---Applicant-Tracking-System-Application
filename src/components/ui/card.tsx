import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Enhanced Card components for TalentSol ATS application
 * Supports ATS-specific styling and variants
 */

// Card variant types
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ats-blue" | "ats-purple" | "ats-outline" | "ats-hover"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    // Apply variant-specific styling
    const getVariantStyles = () => {
      switch (variant) {
        case "ats-blue":
          return "border-ats-blue/20 bg-ats-blue/5 hover:border-ats-blue/30 hover:bg-ats-blue/10"
        case "ats-purple":
          return "border-ats-purple/20 bg-ats-purple/5 hover:border-ats-purple/30 hover:bg-ats-purple/10"
        case "ats-outline":
          return "bg-transparent hover:bg-accent/50"
        case "ats-hover":
          return "hover:shadow-md transition-all duration-200 hover:border-ats-blue/30"
        default:
          return "bg-card text-card-foreground"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border shadow-sm",
          getVariantStyles(),
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

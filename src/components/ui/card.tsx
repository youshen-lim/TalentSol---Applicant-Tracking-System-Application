import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "accent" | "ats-blue" | "ats-purple" | "ats-outline" | "ats-hover"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        // New variants
        case "hover":
          return "bg-card text-card-foreground hover:shadow-md transition-shadow duration-200"
        case "accent":
          return "bg-accent border-primary/20"
        // Legacy variants — remapped to new tokens (backward compat for unmigrated pages)
        case "ats-blue":
          return "border-primary/20 bg-primary/5 hover:border-primary/30 hover:bg-primary/10"
        case "ats-purple":
          return "border-ats-purple/20 bg-ats-purple/5 hover:border-ats-purple/30 hover:bg-ats-purple/10"
        case "ats-outline":
          return "bg-transparent hover:bg-accent/50"
        case "ats-hover":
          return "hover:shadow-md transition-shadow duration-200 hover:border-primary/30"
        default:
          return "bg-card text-card-foreground"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-gray-100",
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

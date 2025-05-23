import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Enhanced Sheet component for TalentSol ATS application
 * Includes ATS-specific variants and improved styling
 */
const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const overlayVariants = cva(
  "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default: "bg-black/80",
        "ats-blue": "bg-ats-dark-blue/70",
        "ats-purple": "bg-ats-dark-purple/70",
        subtle: "bg-black/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SheetOverlayProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>,
    VariantProps<typeof overlayVariants> {}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  SheetOverlayProps
>(({ className, variant, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(overlayVariants({ variant }), className)}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
      size: {
        default: "",
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        full: "sm:max-w-full",
      },
      variant: {
        default: "",
        "ats-blue": "border-ats-blue/20 bg-ats-blue/5",
        "ats-purple": "border-ats-purple/20 bg-ats-purple/5",
      },
    },
    defaultVariants: {
      side: "right",
      size: "default",
      variant: "default",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  overlayVariant?: VariantProps<typeof overlayVariants>["variant"]
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", size, variant, overlayVariant, className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay variant={overlayVariant} />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side, size, variant }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close
        className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
          variant === "ats-blue" ? "hover:bg-ats-blue/10 data-[state=open]:bg-ats-blue/20" :
          variant === "ats-purple" ? "hover:bg-ats-purple/10 data-[state=open]:bg-ats-purple/20" :
          "data-[state=open]:bg-secondary"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

/**
 * Sheet header component with enhanced styling options
 */
interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ats-blue" | "ats-purple"
}

const SheetHeader = ({
  className,
  variant = "default",
  ...props
}: SheetHeaderProps) => {
  const variantStyles = {
    "default": "",
    "ats-blue": "border-b border-ats-blue/10 pb-4 mb-4",
    "ats-purple": "border-b border-ats-purple/10 pb-4 mb-4",
  }

  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
SheetHeader.displayName = "SheetHeader"

/**
 * Sheet footer component with enhanced styling options
 */
interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ats-blue" | "ats-purple"
}

const SheetFooter = ({
  className,
  variant = "default",
  ...props
}: SheetFooterProps) => {
  const variantStyles = {
    "default": "",
    "ats-blue": "border-t border-ats-blue/10 pt-4 mt-4",
    "ats-purple": "border-t border-ats-purple/10 pt-4 mt-4",
  }

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
SheetFooter.displayName = "SheetFooter"

/**
 * Sheet title component with enhanced styling options
 */
interface SheetTitleProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> {
  variant?: "default" | "ats-blue" | "ats-purple"
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  SheetTitleProps
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    "default": "text-foreground",
    "ats-blue": "text-ats-dark-blue",
    "ats-purple": "text-ats-dark-purple",
  }

  return (
    <SheetPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold", variantStyles[variant], className)}
      {...props}
    />
  )
})
SheetTitle.displayName = SheetPrimitive.Title.displayName

/**
 * Sheet description component with enhanced styling options
 */
interface SheetDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> {
  variant?: "default" | "ats-blue" | "ats-purple"
}

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  SheetDescriptionProps
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    "default": "text-muted-foreground",
    "ats-blue": "text-ats-blue/80",
    "ats-purple": "text-ats-purple/80",
  }

  return (
    <SheetPrimitive.Description
      ref={ref}
      className={cn("text-sm", variantStyles[variant], className)}
      {...props}
    />
  )
})
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
  overlayVariants,
}

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Tabs component for TalentSol ATS application
 * Includes ATS-specific variants and improved styling
 */

const Tabs = TabsPrimitive.Root

// TabsList variants
const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-md p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        "ats-blue": "bg-ats-blue/10 border border-ats-blue/20",
        "ats-purple": "bg-ats-purple/10 border border-ats-purple/20",
        "ats-gray": "bg-ats-gray border border-ats-border-gray",
        outline: "border border-input bg-transparent",
      },
      size: {
        default: "h-10",
        sm: "h-9",
        lg: "h-11",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
)

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, fullWidth, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, size, fullWidth }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

// TabsTrigger variants
const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "ats-blue": "focus-visible:ring-ats-blue data-[state=active]:bg-ats-blue data-[state=active]:text-white data-[state=active]:shadow-sm",
        "ats-purple": "focus-visible:ring-ats-purple data-[state=active]:bg-ats-purple data-[state=active]:text-white data-[state=active]:shadow-sm",
        "ats-blue-subtle": "focus-visible:ring-ats-blue data-[state=active]:bg-ats-blue/20 data-[state=active]:text-ats-dark-blue data-[state=active]:shadow-sm",
        "ats-purple-subtle": "focus-visible:ring-ats-purple data-[state=active]:bg-ats-purple/20 data-[state=active]:text-ats-dark-purple data-[state=active]:shadow-sm",
        "ats-underline": "rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
        "ats-blue-underline": "rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 focus-visible:ring-0 data-[state=active]:border-b-ats-blue data-[state=active]:text-ats-dark-blue data-[state=active]:shadow-none",
        "ats-purple-underline": "rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 focus-visible:ring-0 data-[state=active]:border-b-ats-purple data-[state=active]:text-ats-dark-purple data-[state=active]:shadow-none",
      },
      size: {
        default: "",
        sm: "text-xs",
        lg: "text-base px-4",
      },
      fullWidth: {
        true: "flex-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
)

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, fullWidth, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size, fullWidth }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// TabsContent variants
const tabsContentVariants = cva(
  "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "focus-visible:ring-ring",
        "ats-blue": "focus-visible:ring-ats-blue",
        "ats-purple": "focus-visible:ring-ats-purple",
      },
      padding: {
        default: "",
        sm: "p-2",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
    VariantProps<typeof tabsContentVariants> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, variant, padding, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants({ variant, padding }), className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants
}

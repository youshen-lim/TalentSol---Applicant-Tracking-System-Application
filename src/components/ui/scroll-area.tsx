import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    variant?: "default" | "blue" | "purple"
  }
>(({ className, children, variant = "default", ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar variant={variant} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {
    variant?: "default" | "blue" | "purple"
  }
>(({ className, orientation = "vertical", variant = "default", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        "relative flex-1 rounded-full",
        variant === "default" && "bg-border hover:bg-muted",
        variant === "blue" && "bg-ats-light-blue/40 hover:bg-ats-light-blue/60",
        variant === "purple" && "bg-ats-light-purple/40 hover:bg-ats-light-purple/60"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

// Specialized scroll areas for the ATS application

// List scroll area with max height
interface ListScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollArea> {
  maxHeight?: string | number;
}

const ListScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollArea>,
  ListScrollAreaProps
>(({ className, maxHeight = "400px", children, ...props }, ref) => (
  <ScrollArea
    ref={ref}
    className={cn("w-full", className)}
    style={{ maxHeight: maxHeight }}
    {...props}
  >
    {children}
  </ScrollArea>
));
ListScrollArea.displayName = "ListScrollArea";

// Candidate list scroll area with styling
interface CandidateListScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollArea> {
  maxHeight?: string | number;
  variant?: "default" | "blue" | "purple";
}

const CandidateListScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollArea>,
  CandidateListScrollAreaProps
>(({ className, maxHeight = "600px", variant = "blue", children, ...props }, ref) => (
  <ScrollArea
    ref={ref}
    className={cn(
      "w-full rounded-md border",
      variant === "blue" && "border-ats-light-blue/20",
      variant === "purple" && "border-ats-light-purple/20",
      className
    )}
    style={{ maxHeight: maxHeight }}
    variant={variant}
    {...props}
  >
    <div className="p-4">
      {children}
    </div>
  </ScrollArea>
));
CandidateListScrollArea.displayName = "CandidateListScrollArea";

export { ScrollArea, ScrollBar, ListScrollArea, CandidateListScrollArea }

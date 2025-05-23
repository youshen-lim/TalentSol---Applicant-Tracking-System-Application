import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

// Additional components for common hover card patterns
const HoverCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-ats-dark-blue mb-2", className)}
    {...props}
  />
))
HoverCardTitle.displayName = "HoverCardTitle"

const HoverCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
HoverCardDescription.displayName = "HoverCardDescription"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border border-ats-light-blue bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

// Additional component for avatar display in hover cards
const HoverCardAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src?: string;
    alt?: string;
    fallback?: string;
  }
>(({ className, src, alt, fallback, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3", className)}
    {...props}
  >
    <div className="h-10 w-10 rounded-full bg-ats-blue flex items-center justify-center text-white overflow-hidden">
      {src ? (
        <img src={src} alt={alt || "Avatar"} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-medium">{fallback || "ATS"}</span>
      )}
    </div>
    <div className="flex flex-col">
      {props.children}
    </div>
  </div>
))
HoverCardAvatar.displayName = "HoverCardAvatar"

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardTitle,
  HoverCardDescription,
  HoverCardAvatar
}

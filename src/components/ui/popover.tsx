import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { User, X } from "lucide-react"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-ats-light-blue bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// Additional components for common popover patterns
const PopoverHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-3", className)}
    {...props}
  />
))
PopoverHeader.displayName = "PopoverHeader"

const PopoverFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end pt-3", className)}
    {...props}
  />
))
PopoverFooter.displayName = "PopoverFooter"

const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-ats-dark-blue", className)}
    {...props}
  />
))
PopoverTitle.displayName = "PopoverTitle"

const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
PopoverDescription.displayName = "PopoverDescription"

// Close button for popover
const PopoverClose = PopoverPrimitive.Close

// Specialized component for candidate quick view
interface CandidatePopoverProps {
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  status?: string;
  avatarUrl?: string;
  onViewProfile?: () => void;
  onScheduleInterview?: () => void;
  className?: string;
}

const CandidatePopover = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  CandidatePopoverProps
>(({
  name,
  position,
  email,
  phone,
  status,
  avatarUrl,
  onViewProfile,
  onScheduleInterview,
  className,
  ...props
}, ref) => (
  <PopoverContent
    ref={ref}
    className={cn("w-80", className)}
    {...props}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-ats-blue flex items-center justify-center text-white overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <div>
          <PopoverTitle>{name}</PopoverTitle>
          {position && <PopoverDescription>{position}</PopoverDescription>}
        </div>
      </div>
      <PopoverClose className="rounded-full h-6 w-6 p-0 flex items-center justify-center opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </PopoverClose>
    </div>

    {status && (
      <div className="mt-3">
        <span className="text-xs font-medium">Status:</span>
        <span className={cn(
          "ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          status === "Active" && "bg-green-100 text-green-800",
          status === "New" && "bg-blue-100 text-blue-800",
          status === "On Hold" && "bg-yellow-100 text-yellow-800",
          status === "Rejected" && "bg-red-100 text-red-800",
        )}>
          {status}
        </span>
      </div>
    )}

    <div className="mt-3 space-y-2">
      {email && (
        <div className="flex items-center text-sm">
          <span className="text-muted-foreground">Email:</span>
          <span className="ml-2 text-ats-dark-blue">{email}</span>
        </div>
      )}
      {phone && (
        <div className="flex items-center text-sm">
          <span className="text-muted-foreground">Phone:</span>
          <span className="ml-2 text-ats-dark-blue">{phone}</span>
        </div>
      )}
    </div>

    <PopoverFooter className="flex gap-2">
      {onViewProfile && (
        <button
          onClick={onViewProfile}
          className="flex-1 rounded-md bg-ats-light-blue/10 px-3 py-2 text-xs font-medium text-ats-dark-blue hover:bg-ats-light-blue/20"
        >
          View Profile
        </button>
      )}
      {onScheduleInterview && (
        <button
          onClick={onScheduleInterview}
          className="flex-1 rounded-md bg-ats-blue px-3 py-2 text-xs font-medium text-white hover:bg-ats-dark-blue"
        >
          Schedule Interview
        </button>
      )}
    </PopoverFooter>
  </PopoverContent>
))
CandidatePopover.displayName = "CandidatePopover"

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverFooter,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  CandidatePopover
}

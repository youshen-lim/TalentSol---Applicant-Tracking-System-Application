import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

/**
 * Enhanced Command component for TalentSol ATS application
 * Supports ATS-specific styling and variants
 */

// Command variants
const commandVariants = cva(
  "flex h-full w-full flex-col overflow-hidden rounded-md",
  {
    variants: {
      variant: {
        default: "bg-popover text-popover-foreground",
        "ats-blue": "bg-ats-blue/5 text-foreground border border-ats-blue/20",
        "ats-purple": "bg-ats-purple/5 text-foreground border border-ats-purple/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CommandProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive>,
    VariantProps<typeof commandVariants> {}

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  CommandProps
>(({ className, variant, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(commandVariants({ variant }), className)}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps {
  variant?: "default" | "ats-blue" | "ats-purple"
}

const CommandDialog = ({ children, variant = "default", ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command
          variant={variant}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

// Command input variants
const commandInputWrapperVariants = cva(
  "flex items-center border-b px-3",
  {
    variants: {
      variant: {
        default: "border-border",
        "ats-blue": "border-ats-blue/30",
        "ats-purple": "border-ats-purple/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CommandInputProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    VariantProps<typeof commandInputWrapperVariants> {
  iconColor?: string
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, variant, iconColor, ...props }, ref) => {
  // Get icon color based on variant
  const getIconColor = () => {
    if (iconColor) return iconColor;

    switch (variant) {
      case "ats-blue":
        return "text-ats-blue opacity-70";
      case "ats-purple":
        return "text-ats-purple opacity-70";
      default:
        return "opacity-50";
    }
  };

  return (
    <div className={cn(commandInputWrapperVariants({ variant }))} cmdk-input-wrapper="">
      <Search className={cn("mr-2 h-4 w-4 shrink-0", getIconColor())} />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
})

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

// Command item variants
const commandItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground",
        "ats-blue": "data-[selected=true]:bg-ats-blue/10 data-[selected=true]:text-ats-blue aria-selected:bg-ats-blue/10 aria-selected:text-ats-blue",
        "ats-purple": "data-[selected=true]:bg-ats-purple/10 data-[selected=true]:text-ats-purple aria-selected:bg-ats-purple/10 aria-selected:text-ats-purple",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CommandItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>,
    VariantProps<typeof commandItemVariants> {}

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, variant, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(commandItemVariants({ variant }), className)}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

// Command shortcut variants
const commandShortcutVariants = cva(
  "ml-auto text-xs tracking-widest",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        "ats-blue": "text-ats-blue/70",
        "ats-purple": "text-ats-purple/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CommandShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof commandShortcutVariants> {}

const CommandShortcut = ({
  className,
  variant,
  ...props
}: CommandShortcutProps) => {
  return (
    <span
      className={cn(commandShortcutVariants({ variant }), className)}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  commandVariants,
  commandInputWrapperVariants,
  commandItemVariants,
  commandShortcutVariants
}

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Enhanced Sidebar component for TalentSol ATS application
 * Includes responsive behavior, keyboard shortcuts, and ATS-specific styling
 */

const SIDEBAR_COOKIE_NAME = "talentsol:sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  variant?: "default" | "ats-blue" | "ats-purple"
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      variant = "default",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        variant,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, variant]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
    themeVariant?: "default" | "ats-blue" | "ats-purple"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      themeVariant = "ats-blue",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    // Apply ATS-specific styling based on themeVariant
    const getThemeStyles = () => {
      switch (themeVariant) {
        case "ats-blue":
          return "bg-ats-gray border-ats-blue/20 text-ats-dark-blue [&_[data-sidebar=menu-button][data-active=true]]:bg-ats-blue/10 [&_[data-sidebar=menu-button][data-active=true]]:text-ats-blue"
        case "ats-purple":
          return "bg-ats-gray border-ats-purple/20 text-ats-dark-purple [&_[data-sidebar=menu-button][data-active=true]]:bg-ats-purple/10 [&_[data-sidebar=menu-button][data-active=true]]:text-ats-purple"
        default:
          return "bg-sidebar text-sidebar-foreground"
      }
    }

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col",
            getThemeStyles(),
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className={cn(
              "w-[--sidebar-width] p-0 [&>button]:hidden",
              getThemeStyles()
            )}
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
            variant={themeVariant === "ats-blue" ? "ats-blue" : themeVariant === "ats-purple" ? "ats-purple" : "default"}
            overlayVariant={themeVariant === "ats-blue" ? "ats-blue" : themeVariant === "ats-purple" ? "ats-purple" : "default"}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        data-theme-variant={themeVariant}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className={cn(
              "flex h-full w-full flex-col",
              getThemeStyles(),
              "group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, onClick, variant = "default", ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "text-ats-blue hover:bg-ats-blue/10 hover:text-ats-dark-blue"
      case "ats-purple":
        return "text-ats-purple hover:bg-ats-purple/10 hover:text-ats-dark-purple"
      default:
        return ""
    }
  }

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", getVariantStyles(), className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "hover:after:bg-ats-blue/30 group-data-[collapsible=offcanvas]:hover:bg-ats-blue/5"
      case "ats-purple":
        return "hover:after:bg-ats-purple/30 group-data-[collapsible=offcanvas]:hover:bg-ats-purple/5"
      default:
        return "hover:after:bg-sidebar-border group-data-[collapsible=offcanvas]:hover:bg-sidebar"
    }
  }

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        getVariantStyles(),
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main"> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "bg-gray-50 peer-data-[variant=inset]:shadow-ats-blue/10"
      case "ats-purple":
        return "bg-gray-50 peer-data-[variant=inset]:shadow-ats-purple/10"
      default:
        return "bg-background"
    }
  }

  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col",
        getVariantStyles(),
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "bg-white focus-visible:ring-ats-blue"
      case "ats-purple":
        return "bg-white focus-visible:ring-ats-purple"
      default:
        return "bg-background focus-visible:ring-sidebar-ring"
    }
  }

  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full shadow-none focus-visible:ring-2",
        getVariantStyles(),
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "border-b border-ats-blue/10"
      case "ats-purple":
        return "border-b border-ats-purple/10"
      default:
        return ""
    }
  }

  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex h-14 flex-col gap-2 p-2", getVariantStyles(), className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "border-t border-ats-blue/10"
      case "ats-purple":
        return "border-t border-ats-purple/10"
      default:
        return ""
    }
  }

  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", getVariantStyles(), className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Map our variant to the Separator component's variant
  const getSeparatorVariant = () => {
    switch (variant) {
      case "ats-blue":
        return "ats-blue"
      case "ats-purple":
        return "ats-purple"
      default:
        return "default"
    }
  }

  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      variant={getSeparatorVariant()}
      className={cn("mx-2 w-auto", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2 group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "bg-ats-blue/5 rounded-md"
      case "ats-purple":
        return "bg-ats-purple/5 rounded-md"
      default:
        return ""
    }
  }

  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn(
        "relative flex w-full min-w-0 flex-col p-2",
        getVariantStyles(),
        className
      )}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, asChild = false, variant = "default", ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "text-ats-blue font-medium"
      case "ats-purple":
        return "text-ats-purple font-medium"
      default:
        return "text-sidebar-foreground/70"
    }
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs outline-none ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        getVariantStyles(),
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    showOnHover?: boolean
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, asChild = false, showOnHover = false, variant = "default", ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "hover:bg-ats-blue/10 hover:text-ats-blue"
      case "ats-purple":
        return "hover:bg-ats-purple/10 hover:text-ats-purple"
      default:
        return "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        getVariantStyles(),
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
        "ats-blue": "hover:bg-ats-blue/10 hover:text-ats-blue data-[active=true]:bg-ats-blue/10 data-[active=true]:text-ats-blue",
        "ats-purple": "hover:bg-ats-purple/10 hover:text-ats-purple data-[active=true]:bg-ats-purple/10 data-[active=true]:text-ats-purple",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    showOnHover?: boolean
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, asChild = false, showOnHover = false, variant = "default", ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "hover:bg-ats-blue/10 hover:text-ats-blue"
      case "ats-purple":
        return "hover:bg-ats-purple/10 hover:text-ats-purple"
      default:
        return "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        getVariantStyles(),
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "bg-ats-blue/10 text-ats-blue peer-data-[active=true]/menu-button:bg-ats-blue peer-data-[active=true]/menu-button:text-white"
      case "ats-purple":
        return "bg-ats-purple/10 text-ats-purple peer-data-[active=true]/menu-button:bg-ats-purple peer-data-[active=true]/menu-button:text-white"
      default:
        return "text-sidebar-foreground peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground"
    }
  }

  return (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none pointer-events-none",
        getVariantStyles(),
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, showIcon = false, variant = "default", ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "bg-ats-blue/5"
      case "ats-purple":
        return "bg-ats-purple/5"
      default:
        return ""
    }
  }

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", getVariantStyles(), className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul"> & {
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "border-ats-blue/20"
      case "ats-purple":
        return "border-ats-purple/20"
      default:
        return "border-sidebar-border"
    }
  }

  return (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        getVariantStyles(),
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ asChild = false, size = "md", isActive, variant = "default", className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  // Apply ATS-specific styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "hover:bg-ats-blue/10 hover:text-ats-blue data-[active=true]:bg-ats-blue/10 data-[active=true]:text-ats-blue [&>svg]:text-ats-blue"
      case "ats-purple":
        return "hover:bg-ats-purple/10 hover:text-ats-purple data-[active=true]:bg-ats-purple/10 data-[active=true]:text-ats-purple [&>svg]:text-ats-purple"
      default:
        return "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground"
    }
  }

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        getVariantStyles(),
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

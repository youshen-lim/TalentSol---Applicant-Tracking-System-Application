import * as React from "react"
import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel> & {
  variant?: "default" | "blue" | "purple" | "gray"
}) => (
  <ResizablePrimitive.Panel
    className={cn(
      "overflow-auto",
      variant === "blue" && "bg-ats-light-blue/5 border-ats-light-blue/20",
      variant === "purple" && "bg-ats-light-purple/5 border-ats-light-purple/20",
      variant === "gray" && "bg-ats-gray",
      className
    )}
    {...props}
  />
)

const ResizableHandle = ({
  withHandle,
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
  variant?: "default" | "blue" | "purple"
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      variant === "default" && "bg-border focus-visible:ring-ring",
      variant === "blue" && "bg-ats-light-blue/30 focus-visible:ring-ats-blue hover:bg-ats-light-blue/50",
      variant === "purple" && "bg-ats-light-purple/30 focus-visible:ring-ats-purple hover:bg-ats-light-purple/50",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className={cn(
        "z-10 flex h-4 w-3 items-center justify-center rounded-sm border",
        variant === "default" && "border-border bg-border",
        variant === "blue" && "border-ats-light-blue bg-ats-light-blue/20",
        variant === "purple" && "border-ats-light-purple bg-ats-light-purple/20"
      )}>
        <GripVertical className={cn(
          "h-2.5 w-2.5",
          variant === "blue" && "text-ats-blue",
          variant === "purple" && "text-ats-purple"
        )} />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

// Specialized layouts for the ATS application

// Two-panel layout with sidebar and main content
interface ResizableSidebarLayoutProps {
  sidebarContent: React.ReactNode;
  mainContent: React.ReactNode;
  defaultSidebarSize?: number;
  minSidebarSize?: number;
  variant?: "default" | "blue" | "purple";
  className?: string;
}

const ResizableSidebarLayout = ({
  sidebarContent,
  mainContent,
  defaultSidebarSize = 25,
  minSidebarSize = 15,
  variant = "blue",
  className,
}: ResizableSidebarLayoutProps) => (
  <ResizablePanelGroup
    direction="horizontal"
    className={cn("h-full rounded-lg border", className)}
  >
    <ResizablePanel
      defaultSize={defaultSidebarSize}
      minSize={minSidebarSize}
      variant={variant === "default" ? "default" : variant}
      className="p-4"
    >
      {sidebarContent}
    </ResizablePanel>
    <ResizableHandle withHandle variant={variant} />
    <ResizablePanel className="p-4">
      {mainContent}
    </ResizablePanel>
  </ResizablePanelGroup>
);

// Three-panel layout for complex interfaces
interface ResizableTriplePanelLayoutProps {
  leftContent: React.ReactNode;
  centerContent: React.ReactNode;
  rightContent: React.ReactNode;
  defaultLeftSize?: number;
  defaultRightSize?: number;
  minLeftSize?: number;
  minRightSize?: number;
  variant?: "default" | "blue" | "purple";
  className?: string;
}

const ResizableTriplePanelLayout = ({
  leftContent,
  centerContent,
  rightContent,
  defaultLeftSize = 20,
  defaultRightSize = 25,
  minLeftSize = 15,
  minRightSize = 15,
  variant = "blue",
  className,
}: ResizableTriplePanelLayoutProps) => (
  <ResizablePanelGroup
    direction="horizontal"
    className={cn("h-full rounded-lg border", className)}
  >
    <ResizablePanel
      defaultSize={defaultLeftSize}
      minSize={minLeftSize}
      variant={variant === "default" ? "default" : variant}
      className="p-4"
    >
      {leftContent}
    </ResizablePanel>
    <ResizableHandle withHandle variant={variant} />
    <ResizablePanel className="p-4">
      {centerContent}
    </ResizablePanel>
    <ResizableHandle withHandle variant={variant} />
    <ResizablePanel
      defaultSize={defaultRightSize}
      minSize={minRightSize}
      variant={variant === "default" ? "gray" : variant}
      className="p-4"
    >
      {rightContent}
    </ResizablePanel>
  </ResizablePanelGroup>
);

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ResizableSidebarLayout,
  ResizableTriplePanelLayout
}

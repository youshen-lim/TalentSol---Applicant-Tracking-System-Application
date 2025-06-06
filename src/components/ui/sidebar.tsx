/**
 * Enhanced Sidebar component for TalentSol ATS application
 * Re-exports from modular sidebar components for backward compatibility
 */

// Re-export all sidebar components from the modular structure
export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "./sidebar/index";

export type {
  SidebarState,
  SidebarSide,
  SidebarVariant,
  SidebarCollapsible,
  SidebarThemeVariant,
  SidebarContext,
  SidebarProviderProps,
  SidebarProps,
  SidebarTriggerProps,
  SidebarRailProps,
  SidebarInsetProps,
  SidebarInputProps,
  SidebarHeaderProps,
  SidebarFooterProps,
} from "./sidebar/index";

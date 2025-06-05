import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * Enhanced responsive layout hook for TalentSol ATS
 * Provides comprehensive responsive state management and utilities
 */

export interface ResponsiveLayoutState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'wide';
}

export interface ResponsiveLayoutConfig {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
  wideBreakpoint?: number;
}

const defaultConfig: Required<ResponsiveLayoutConfig> = {
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  desktopBreakpoint: 1280,
  wideBreakpoint: 1536,
};

/**
 * Hook for comprehensive responsive layout management
 */
export const useResponsiveLayout = (config: ResponsiveLayoutConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  
  // Use the existing mobile hook
  const isMobile = useIsMobile(finalConfig.mobileBreakpoint);
  
  // State for screen dimensions and device detection
  const [layoutState, setLayoutState] = useState<ResponsiveLayoutState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWide: false,
        screenWidth: 1280,
        screenHeight: 720,
        orientation: 'landscape',
        deviceType: 'desktop',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < finalConfig.mobileBreakpoint,
      isTablet: width >= finalConfig.mobileBreakpoint && width < finalConfig.desktopBreakpoint,
      isDesktop: width >= finalConfig.desktopBreakpoint && width < finalConfig.wideBreakpoint,
      isWide: width >= finalConfig.wideBreakpoint,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      deviceType: width < finalConfig.mobileBreakpoint ? 'mobile' :
                  width < finalConfig.desktopBreakpoint ? 'tablet' :
                  width < finalConfig.wideBreakpoint ? 'desktop' : 'wide',
    };
  });

  // Update layout state on resize
  const updateLayoutState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setLayoutState({
      isMobile: width < finalConfig.mobileBreakpoint,
      isTablet: width >= finalConfig.mobileBreakpoint && width < finalConfig.desktopBreakpoint,
      isDesktop: width >= finalConfig.desktopBreakpoint && width < finalConfig.wideBreakpoint,
      isWide: width >= finalConfig.wideBreakpoint,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      deviceType: width < finalConfig.mobileBreakpoint ? 'mobile' :
                  width < finalConfig.desktopBreakpoint ? 'tablet' :
                  width < finalConfig.wideBreakpoint ? 'desktop' : 'wide',
    });
  }, [finalConfig]);

  // Set up resize listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Debounce resize events for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateLayoutState, 100);
    };

    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', debouncedUpdate);

    // Initial update
    updateLayoutState();

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, [updateLayoutState]);

  // Utility functions for responsive behavior
  const getColumnsForDevice = useCallback((
    mobile: number = 1,
    tablet: number = 2,
    desktop: number = 3,
    wide: number = 4
  ): number => {
    if (layoutState.isMobile) return mobile;
    if (layoutState.isTablet) return tablet;
    if (layoutState.isDesktop) return desktop;
    return wide;
  }, [layoutState]);

  const getValueForDevice = useCallback(<T,>(
    mobile: T,
    tablet?: T,
    desktop?: T,
    wide?: T
  ): T => {
    if (layoutState.isMobile) return mobile;
    if (layoutState.isTablet) return tablet ?? mobile;
    if (layoutState.isDesktop) return desktop ?? tablet ?? mobile;
    return wide ?? desktop ?? tablet ?? mobile;
  }, [layoutState]);

  const shouldShowSidebar = useCallback((): boolean => {
    return !layoutState.isMobile;
  }, [layoutState.isMobile]);

  const shouldCollapseSidebar = useCallback((): boolean => {
    return layoutState.isTablet;
  }, [layoutState.isTablet]);

  const getGridClasses = useCallback((
    mobile: string = 'grid-cols-1',
    tablet: string = 'sm:grid-cols-2',
    desktop: string = 'lg:grid-cols-3',
    wide: string = 'xl:grid-cols-4'
  ): string => {
    return `${mobile} ${tablet} ${desktop} ${wide}`;
  }, []);

  const getFlexDirection = useCallback((): 'column' | 'row' => {
    return layoutState.isMobile ? 'column' : 'row';
  }, [layoutState.isMobile]);

  const getSpacing = useCallback((
    mobile: string = 'gap-4',
    desktop: string = 'sm:gap-6'
  ): string => {
    return `${mobile} ${desktop}`;
  }, []);

  const getPadding = useCallback((
    mobile: string = 'p-4',
    desktop: string = 'sm:p-6'
  ): string => {
    return `${mobile} ${desktop}`;
  }, []);

  // Navigation helpers
  const shouldShowMobileMenu = useCallback((): boolean => {
    return layoutState.isMobile;
  }, [layoutState.isMobile]);

  const shouldShowTabNavigation = useCallback((): boolean => {
    return layoutState.isMobile;
  }, [layoutState.isMobile]);

  // Table helpers
  const shouldUseCardLayout = useCallback((): boolean => {
    return layoutState.isMobile;
  }, [layoutState.isMobile]);

  const getTableScrollable = useCallback((): boolean => {
    return layoutState.isMobile || layoutState.isTablet;
  }, [layoutState.isMobile, layoutState.isTablet]);

  // Modal helpers
  const getModalSize = useCallback((): 'sm' | 'md' | 'lg' | 'xl' | 'full' => {
    if (layoutState.isMobile) return 'full';
    if (layoutState.isTablet) return 'lg';
    if (layoutState.isDesktop) return 'xl';
    return 'xl';
  }, [layoutState]);

  const shouldUseFullScreenModal = useCallback((): boolean => {
    return layoutState.isMobile;
  }, [layoutState.isMobile]);

  // Form helpers
  const getFormLayout = useCallback((): 'stacked' | 'inline' => {
    return layoutState.isMobile ? 'stacked' : 'inline';
  }, [layoutState.isMobile]);

  const shouldStackFormButtons = useCallback((): boolean => {
    return layoutState.isMobile;
  }, [layoutState.isMobile]);

  return {
    // State
    ...layoutState,
    
    // Utility functions
    getColumnsForDevice,
    getValueForDevice,
    
    // Layout helpers
    shouldShowSidebar,
    shouldCollapseSidebar,
    getGridClasses,
    getFlexDirection,
    getSpacing,
    getPadding,
    
    // Navigation helpers
    shouldShowMobileMenu,
    shouldShowTabNavigation,
    
    // Table helpers
    shouldUseCardLayout,
    getTableScrollable,
    
    // Modal helpers
    getModalSize,
    shouldUseFullScreenModal,
    
    // Form helpers
    getFormLayout,
    shouldStackFormButtons,
    
    // Configuration
    config: finalConfig,
  };
};

/**
 * Hook for responsive component props
 */
export const useResponsiveProps = <T extends Record<string, any>>(
  mobileProps: Partial<T>,
  desktopProps: Partial<T> = {}
): T => {
  const { isMobile } = useResponsiveLayout();
  
  return {
    ...desktopProps,
    ...(isMobile ? mobileProps : {}),
  } as T;
};

/**
 * Hook for responsive CSS classes
 */
export const useResponsiveClasses = (
  mobileClasses: string,
  desktopClasses: string = ''
): string => {
  const { isMobile } = useResponsiveLayout();
  
  return isMobile ? mobileClasses : desktopClasses;
};

/**
 * Hook for responsive values with custom breakpoints
 */
export const useResponsiveBreakpoint = (breakpoint: number = 768) => {
  const isMobile = useIsMobile(breakpoint);
  
  return {
    isMobile,
    isDesktop: !isMobile,
    getValue: <T,>(mobileValue: T, desktopValue: T): T => 
      isMobile ? mobileValue : desktopValue,
    getClasses: (mobileClasses: string, desktopClasses: string): string =>
      isMobile ? mobileClasses : desktopClasses,
  };
};

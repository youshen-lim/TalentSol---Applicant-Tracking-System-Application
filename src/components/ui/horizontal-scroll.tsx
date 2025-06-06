import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * TalentSol Horizontal Scroll Design System Component
 * 
 * A comprehensive horizontal scrolling solution that:
 * - Uses existing Tailwind spacing/colors from TalentSol design system
 * - Provides consistent scroll indicators across all pages
 * - Handles responsive breakpoints automatically
 * - Includes full accessibility features (WCAG 2.1 AA compliant)
 * - Integrates seamlessly with existing UI components
 */

// Design system variants matching TalentSol color scheme
export type ScrollVariant = 'default' | 'blue' | 'purple' | 'subtle';
export type ScrollSize = 'sm' | 'md' | 'lg';
export type IndicatorType = 'dots' | 'bars' | 'arrows' | 'fade' | 'none';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  
  // Design system integration
  variant?: ScrollVariant;
  size?: ScrollSize;
  
  // Scroll behavior
  scrollAmount?: number;
  smoothScroll?: boolean;
  snapToItems?: boolean;
  
  // Indicators and controls
  showScrollButtons?: boolean;
  showIndicators?: boolean;
  indicatorType?: IndicatorType;
  autoHideControls?: boolean;
  
  // Responsive behavior
  mobileScrollButtons?: boolean;
  touchOptimized?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
  
  // Callbacks
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  onScrollChange?: (scrollLeft: number, scrollWidth: number, clientWidth: number) => void;
}

// Design system color mappings
const variantStyles = {
  default: {
    scrollbar: 'scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400',
    buttons: 'bg-white/90 border-gray-200 hover:bg-white hover:border-gray-300 text-gray-700',
    indicators: 'bg-gray-300 data-[active=true]:bg-gray-600',
    fade: 'from-white/80 to-transparent',
  },
  blue: {
    scrollbar: 'scrollbar-thumb-ats-light-blue/60 hover:scrollbar-thumb-ats-blue',
    buttons: 'bg-white/90 border-ats-light-blue/20 hover:bg-ats-blue/5 hover:border-ats-blue/30 text-ats-blue',
    indicators: 'bg-ats-light-blue/40 data-[active=true]:bg-ats-blue',
    fade: 'from-ats-blue/10 to-transparent',
  },
  purple: {
    scrollbar: 'scrollbar-thumb-ats-light-purple/60 hover:scrollbar-thumb-ats-purple',
    buttons: 'bg-white/90 border-ats-light-purple/20 hover:bg-ats-purple/5 hover:border-ats-purple/30 text-ats-purple',
    indicators: 'bg-ats-light-purple/40 data-[active=true]:bg-ats-purple',
    fade: 'from-ats-purple/10 to-transparent',
  },
  subtle: {
    scrollbar: 'scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300',
    buttons: 'bg-gray-50/90 border-gray-100 hover:bg-gray-100 hover:border-gray-200 text-gray-600',
    indicators: 'bg-gray-200 data-[active=true]:bg-gray-400',
    fade: 'from-gray-50/80 to-transparent',
  },
};

// Size configurations using TalentSol spacing scale
const sizeConfig = {
  sm: {
    buttonSize: 'h-6 w-6',
    iconSize: 'h-3 w-3',
    scrollAmount: 200,
    indicatorSize: 'h-1 w-6',
    gap: 'gap-2',
  },
  md: {
    buttonSize: 'h-8 w-8',
    iconSize: 'h-4 w-4',
    scrollAmount: 300,
    indicatorSize: 'h-1.5 w-8',
    gap: 'gap-3',
  },
  lg: {
    buttonSize: 'h-10 w-10',
    iconSize: 'h-5 w-5',
    scrollAmount: 400,
    indicatorSize: 'h-2 w-10',
    gap: 'gap-4',
  },
};

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  scrollAmount,
  smoothScroll = true,
  snapToItems = false,
  showScrollButtons = true,
  showIndicators = true,
  indicatorType = 'dots',
  autoHideControls = true,
  mobileScrollButtons = false,
  touchOptimized = true,
  ariaLabel = 'Horizontal scroll container',
  ariaDescription,
  onScrollStart,
  onScrollEnd,
  onScrollChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isMobile = useIsMobile();
  
  const styles = variantStyles[variant];
  const config = sizeConfig[size];
  const effectiveScrollAmount = scrollAmount || config.scrollAmount;

  // Check scroll position and update states
  const checkScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const newCanScrollLeft = scrollLeft > 0;
    const newCanScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
    const progress = scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0;

    setCanScrollLeft(newCanScrollLeft);
    setCanScrollRight(newCanScrollRight);
    setScrollProgress(progress);

    onScrollChange?.(scrollLeft, scrollWidth, clientWidth);
  }, [onScrollChange]);

  // Smooth scroll functions
  const scrollLeft = useCallback(() => {
    if (!scrollRef.current || isScrolling) return;
    
    setIsScrolling(true);
    onScrollStart?.();
    
    scrollRef.current.scrollBy({
      left: -effectiveScrollAmount,
      behavior: smoothScroll ? 'smooth' : 'auto'
    });
    
    setTimeout(() => {
      setIsScrolling(false);
      onScrollEnd?.();
    }, smoothScroll ? 300 : 0);
  }, [effectiveScrollAmount, smoothScroll, isScrolling, onScrollStart, onScrollEnd]);

  const scrollRight = useCallback(() => {
    if (!scrollRef.current || isScrolling) return;
    
    setIsScrolling(true);
    onScrollStart?.();
    
    scrollRef.current.scrollBy({
      left: effectiveScrollAmount,
      behavior: smoothScroll ? 'smooth' : 'auto'
    });
    
    setTimeout(() => {
      setIsScrolling(false);
      onScrollEnd?.();
    }, smoothScroll ? 300 : 0);
  }, [effectiveScrollAmount, smoothScroll, isScrolling, onScrollStart, onScrollEnd]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollLeft();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollRight();
    }
  }, [scrollLeft, scrollRight]);

  // Set up event listeners
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    checkScrollPosition();
    scrollElement.addEventListener('scroll', checkScrollPosition, { passive: true });
    
    const handleResize = () => setTimeout(checkScrollPosition, 100);
    window.addEventListener('resize', handleResize);

    return () => {
      scrollElement.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollPosition]);

  // Check scroll position when children change
  useEffect(() => {
    const timer = setTimeout(checkScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [children, checkScrollPosition]);

  const shouldShowButtons = showScrollButtons && (!isMobile || mobileScrollButtons);
  const shouldShowIndicators = showIndicators && indicatorType !== 'none';

  return (
    <div 
      className={cn("relative group", className)}
      role="region"
      aria-label={ariaLabel}
      aria-description={ariaDescription}
    >
      {/* Left scroll button */}
      {shouldShowButtons && canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-ats-card",
            config.buttonSize,
            styles.buttons,
            autoHideControls && "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
          onClick={scrollLeft}
          disabled={isScrolling}
          aria-label="Scroll left"
        >
          <ChevronLeft className={config.iconSize} />
        </Button>
      )}

      {/* Right scroll button */}
      {shouldShowButtons && canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-ats-card",
            config.buttonSize,
            styles.buttons,
            autoHideControls && "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
          onClick={scrollRight}
          disabled={isScrolling}
          aria-label="Scroll right"
        >
          <ChevronRight className={config.iconSize} />
        </Button>
      )}

      {/* Fade indicators */}
      {indicatorType === 'fade' && (
        <>
          {canScrollLeft && (
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r pointer-events-none z-[1]",
              styles.fade
            )} />
          )}
          {canScrollRight && (
            <div className={cn(
              "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l pointer-events-none z-[1]",
              styles.fade
            )} />
          )}
        </>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-track-transparent",
          styles.scrollbar,
          smoothScroll && "scroll-smooth",
          touchOptimized && "touch-pan-x",
          snapToItems && "scroll-snap-type-x-mandatory"
        )}
        style={{
          scrollBehavior: smoothScroll ? 'smooth' : 'auto',
          WebkitOverflowScrolling: touchOptimized ? 'touch' : 'auto',
        }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="scrollbar"
        aria-orientation="horizontal"
        aria-valuenow={Math.round(scrollProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {children}
      </div>

      {/* Scroll indicators */}
      {shouldShowIndicators && (canScrollLeft || canScrollRight) && (
        <div className={cn("flex justify-center mt-3", config.gap)}>
          {indicatorType === 'dots' && (
            <>
              <div
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-200",
                  styles.indicators
                )}
                data-active={canScrollLeft}
              />
              <div
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-200",
                  styles.indicators
                )}
                data-active={canScrollRight}
              />
            </>
          )}
          
          {indicatorType === 'bars' && (
            <div
              className={cn(
                "rounded-full transition-all duration-200",
                config.indicatorSize,
                styles.indicators
              )}
              style={{ width: `${20 + scrollProgress * 60}%` }}
            />
          )}
          
          {indicatorType === 'arrows' && (
            <div className="flex items-center gap-1">
              <ChevronLeft 
                className={cn(
                  "h-3 w-3 transition-colors duration-200",
                  canScrollLeft ? "text-current" : "text-gray-300"
                )} 
              />
              <MoreHorizontal className="h-3 w-3 text-gray-400" />
              <ChevronRight 
                className={cn(
                  "h-3 w-3 transition-colors duration-200",
                  canScrollRight ? "text-current" : "text-gray-300"
                )} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized components for common TalentSol use cases

/**
 * Card Scroll Container - For scrolling cards horizontally
 * Optimized for dashboard metrics, job cards, candidate cards, etc.
 */
interface CardScrollProps extends Omit<HorizontalScrollProps, 'children'> {
  children: React.ReactNode;
  cardGap?: 'sm' | 'md' | 'lg';
  cardMinWidth?: string;
}

export const CardScroll: React.FC<CardScrollProps> = ({
  children,
  cardGap = 'md',
  cardMinWidth = '280px',
  variant = 'blue',
  size = 'md',
  className,
  ...props
}) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  return (
    <HorizontalScroll
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      <div
        className={cn("flex pb-4", gapClasses[cardGap])}
        style={{ minWidth: 'fit-content' }}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ minWidth: cardMinWidth }}
          >
            {child}
          </div>
        ))}
      </div>
    </HorizontalScroll>
  );
};

/**
 * Kanban Scroll Container - For candidate pipeline and similar workflows
 * Optimized for drag-and-drop columns with consistent sizing
 */
interface KanbanScrollProps extends Omit<HorizontalScrollProps, 'children'> {
  children: React.ReactNode;
  columnWidth?: string;
  columnGap?: 'sm' | 'md' | 'lg';
}

export const KanbanScroll: React.FC<KanbanScrollProps> = ({
  children,
  columnWidth = '320px',
  columnGap = 'md',
  variant = 'blue',
  snapToItems = true,
  className,
  ...props
}) => {
  const gapClasses = {
    sm: 'space-x-3',
    md: 'space-x-4 sm:space-x-6',
    lg: 'space-x-6 sm:space-x-8',
  };

  return (
    <HorizontalScroll
      variant={variant}
      snapToItems={snapToItems}
      className={className}
      ariaLabel="Kanban board columns"
      {...props}
    >
      <div
        className={cn("flex pb-4", gapClasses[columnGap])}
        style={{ minWidth: 'fit-content' }}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="flex-shrink-0 scroll-snap-align-start"
            style={{ width: columnWidth, minWidth: columnWidth }}
          >
            {child}
          </div>
        ))}
      </div>
    </HorizontalScroll>
  );
};

/**
 * Tab Scroll Container - For horizontal tab navigation
 * Optimized for tab bars that may overflow on smaller screens
 */
interface TabScrollProps extends Omit<HorizontalScrollProps, 'children'> {
  children: React.ReactNode;
  tabGap?: 'sm' | 'md' | 'lg';
}

export const TabScroll: React.FC<TabScrollProps> = ({
  children,
  tabGap = 'sm',
  variant = 'subtle',
  size = 'sm',
  showIndicators = false,
  autoHideControls = false,
  className,
  ...props
}) => {
  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4',
  };

  return (
    <HorizontalScroll
      variant={variant}
      size={size}
      showIndicators={showIndicators}
      autoHideControls={autoHideControls}
      className={className}
      ariaLabel="Tab navigation"
      {...props}
    >
      <div className={cn("flex items-center", gapClasses[tabGap])}>
        {children}
      </div>
    </HorizontalScroll>
  );
};

/**
 * Media Scroll Container - For image galleries, document previews, etc.
 * Optimized for media content with consistent aspect ratios
 */
interface MediaScrollProps extends Omit<HorizontalScrollProps, 'children'> {
  children: React.ReactNode;
  itemWidth?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}

export const MediaScroll: React.FC<MediaScrollProps> = ({
  children,
  itemWidth = '200px',
  aspectRatio = 'square',
  variant = 'default',
  indicatorType = 'bars',
  className,
  ...props
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <HorizontalScroll
      variant={variant}
      indicatorType={indicatorType}
      className={className}
      ariaLabel="Media gallery"
      {...props}
    >
      <div className="flex gap-4 pb-4">
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className={cn("flex-shrink-0 rounded-lg overflow-hidden", aspectClasses[aspectRatio])}
            style={{ width: itemWidth, minWidth: itemWidth }}
          >
            {child}
          </div>
        ))}
      </div>
    </HorizontalScroll>
  );
};

// Export types for external use
export type {
  HorizontalScrollProps,
  ScrollVariant,
  ScrollSize,
  IndicatorType,
};

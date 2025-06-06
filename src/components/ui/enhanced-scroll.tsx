import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Enhanced horizontal scroll container with scroll indicators and smooth scrolling
 * Optimized for all screen sizes including mobile touch devices
 */

interface EnhancedHorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  showScrollButtons?: boolean;
  showScrollIndicators?: boolean;
  scrollButtonClassName?: string;
  scrollAmount?: number;
  autoHideScrollbar?: boolean;
}

export const EnhancedHorizontalScroll: React.FC<EnhancedHorizontalScrollProps> = ({
  children,
  className,
  showScrollButtons = true,
  showScrollIndicators = true,
  scrollButtonClassName,
  scrollAmount = 300,
  autoHideScrollbar = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Smooth scroll functions
  const scrollLeft = () => {
    if (!scrollRef.current) return;
    setIsScrolling(true);
    scrollRef.current.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(() => setIsScrolling(false), 300);
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    setIsScrolling(true);
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(() => setIsScrolling(false), 300);
  };

  // Set up scroll event listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    checkScrollPosition();
    scrollElement.addEventListener('scroll', checkScrollPosition);
    
    // Check on resize
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      scrollElement.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Check scroll position when children change
  useEffect(() => {
    setTimeout(checkScrollPosition, 100);
  }, [children]);

  return (
    <div className="relative group">
      {/* Left scroll button */}
      {showScrollButtons && canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full",
            "bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg",
            "hover:bg-white hover:shadow-xl transition-all duration-200",
            "opacity-0 group-hover:opacity-100",
            scrollButtonClassName
          )}
          onClick={scrollLeft}
          disabled={isScrolling}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Right scroll button */}
      {showScrollButtons && canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full",
            "bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg",
            "hover:bg-white hover:shadow-xl transition-all duration-200",
            "opacity-0 group-hover:opacity-100",
            scrollButtonClassName
          )}
          onClick={scrollRight}
          disabled={isScrolling}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto overflow-y-hidden",
          // Enhanced scrollbar styling
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300",
          "hover:scrollbar-thumb-gray-400 active:scrollbar-thumb-gray-500",
          // Mobile optimizations
          "scroll-smooth touch-pan-x",
          // Auto-hide scrollbar option
          autoHideScrollbar && "scrollbar-hide hover:scrollbar-thin",
          className
        )}
        style={{
          // Ensure smooth scrolling on all browsers
          scrollBehavior: 'smooth',
          // Optimize for touch devices
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Scroll indicators */}
      {showScrollIndicators && (canScrollLeft || canScrollRight) && (
        <div className="flex justify-center mt-2 space-x-1">
          <div
            className={cn(
              "h-1 w-8 rounded-full transition-colors duration-200",
              canScrollLeft ? "bg-blue-500" : "bg-gray-200"
            )}
          />
          <div
            className={cn(
              "h-1 w-8 rounded-full transition-colors duration-200",
              canScrollRight ? "bg-blue-500" : "bg-gray-200"
            )}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Kanban scroll container specifically optimized for candidate pipeline
 */
interface KanbanScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const KanbanScrollContainer: React.FC<KanbanScrollContainerProps> = ({
  children,
  className,
}) => {
  return (
    <EnhancedHorizontalScroll
      className={cn(
        "pb-4 sm:pb-6 -mx-2 px-2 sm:mx-0 sm:px-0",
        className
      )}
      showScrollButtons={true}
      showScrollIndicators={false}
      scrollAmount={320}
      autoHideScrollbar={false}
      scrollButtonClassName="sm:h-10 sm:w-10"
    >
      <div className="flex space-x-3 sm:space-x-4 min-w-fit">
        {children}
      </div>
    </EnhancedHorizontalScroll>
  );
};

export default EnhancedHorizontalScroll;

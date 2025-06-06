import { useRef, useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * TalentSol Horizontal Scroll Hook
 * 
 * A comprehensive hook for managing horizontal scroll behavior
 * Provides state management, scroll controls, and accessibility features
 */

export interface UseHorizontalScrollOptions {
  scrollAmount?: number;
  smoothScroll?: boolean;
  snapToItems?: boolean;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  onScrollChange?: (scrollLeft: number, scrollWidth: number, clientWidth: number) => void;
}

export interface UseHorizontalScrollReturn {
  // Refs
  scrollRef: React.RefObject<HTMLDivElement>;
  
  // State
  canScrollLeft: boolean;
  canScrollRight: boolean;
  isScrolling: boolean;
  scrollProgress: number;
  
  // Controls
  scrollLeft: () => void;
  scrollRight: () => void;
  scrollTo: (position: number) => void;
  scrollToItem: (index: number) => void;
  
  // Auto scroll
  startAutoScroll: () => void;
  stopAutoScroll: () => void;
  
  // Utilities
  checkScrollPosition: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

export const useHorizontalScroll = (
  options: UseHorizontalScrollOptions = {}
): UseHorizontalScrollReturn => {
  const {
    scrollAmount = 300,
    smoothScroll = true,
    snapToItems = false,
    autoScroll = false,
    autoScrollInterval = 3000,
    onScrollStart,
    onScrollEnd,
    onScrollChange,
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isMobile = useIsMobile();

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

  // Scroll to specific position
  const scrollTo = useCallback((position: number) => {
    if (!scrollRef.current || isScrolling) return;
    
    setIsScrolling(true);
    onScrollStart?.();
    
    scrollRef.current.scrollTo({
      left: position,
      behavior: smoothScroll ? 'smooth' : 'auto'
    });
    
    setTimeout(() => {
      setIsScrolling(false);
      onScrollEnd?.();
    }, smoothScroll ? 300 : 0);
  }, [smoothScroll, isScrolling, onScrollStart, onScrollEnd]);

  // Scroll left by amount
  const scrollLeft = useCallback(() => {
    if (!scrollRef.current || isScrolling) return;
    
    setIsScrolling(true);
    onScrollStart?.();
    
    const currentScroll = scrollRef.current.scrollLeft;
    const newPosition = Math.max(0, currentScroll - scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: smoothScroll ? 'smooth' : 'auto'
    });
    
    setTimeout(() => {
      setIsScrolling(false);
      onScrollEnd?.();
    }, smoothScroll ? 300 : 0);
  }, [scrollAmount, smoothScroll, isScrolling, onScrollStart, onScrollEnd]);

  // Scroll right by amount
  const scrollRight = useCallback(() => {
    if (!scrollRef.current || isScrolling) return;
    
    setIsScrolling(true);
    onScrollStart?.();
    
    const currentScroll = scrollRef.current.scrollLeft;
    const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
    const newPosition = Math.min(maxScroll, currentScroll + scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newPosition,
      behavior: smoothScroll ? 'smooth' : 'auto'
    });
    
    setTimeout(() => {
      setIsScrolling(false);
      onScrollEnd?.();
    }, smoothScroll ? 300 : 0);
  }, [scrollAmount, smoothScroll, isScrolling, onScrollStart, onScrollEnd]);

  // Scroll to specific item by index
  const scrollToItem = useCallback((index: number) => {
    if (!scrollRef.current) return;
    
    const children = scrollRef.current.children;
    if (index >= 0 && index < children.length) {
      const targetElement = children[index] as HTMLElement;
      const containerRect = scrollRef.current.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const scrollLeft = scrollRef.current.scrollLeft;
      
      // Calculate position to center the item
      const targetPosition = scrollLeft + targetRect.left - containerRect.left - 
        (containerRect.width - targetRect.width) / 2;
      
      scrollTo(Math.max(0, targetPosition));
    }
  }, [scrollTo]);

  // Auto scroll functionality
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return;
    
    autoScrollRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;
      
      if (isAtEnd) {
        scrollTo(0); // Reset to beginning
      } else {
        scrollRight();
      }
    }, autoScrollInterval);
  }, [autoScrollInterval, scrollRight, scrollTo]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        scrollLeft();
        break;
      case 'ArrowRight':
        event.preventDefault();
        scrollRight();
        break;
      case 'Home':
        event.preventDefault();
        scrollTo(0);
        break;
      case 'End':
        event.preventDefault();
        if (scrollRef.current) {
          const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
          scrollTo(maxScroll);
        }
        break;
    }
  }, [scrollLeft, scrollRight, scrollTo]);

  // Set up event listeners
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    checkScrollPosition();
    scrollElement.addEventListener('scroll', checkScrollPosition, { passive: true });
    
    const handleResize = () => setTimeout(checkScrollPosition, 100);
    window.addEventListener('resize', handleResize);

    // Start auto scroll if enabled
    if (autoScroll) {
      startAutoScroll();
    }

    return () => {
      scrollElement.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', handleResize);
      stopAutoScroll();
    };
  }, [checkScrollPosition, autoScroll, startAutoScroll, stopAutoScroll]);

  // Pause auto scroll on hover (desktop only)
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !autoScroll || isMobile) return;

    const handleMouseEnter = () => stopAutoScroll();
    const handleMouseLeave = () => startAutoScroll();

    scrollElement.addEventListener('mouseenter', handleMouseEnter);
    scrollElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      scrollElement.removeEventListener('mouseenter', handleMouseEnter);
      scrollElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [autoScroll, isMobile, startAutoScroll, stopAutoScroll]);

  return {
    // Refs
    scrollRef,
    
    // State
    canScrollLeft,
    canScrollRight,
    isScrolling,
    scrollProgress,
    
    // Controls
    scrollLeft,
    scrollRight,
    scrollTo,
    scrollToItem,
    
    // Auto scroll
    startAutoScroll,
    stopAutoScroll,
    
    // Utilities
    checkScrollPosition,
    handleKeyDown,
  };
};

// Utility hook for scroll intersection observer
export const useScrollIntersection = (
  scrollRef: React.RefObject<HTMLDivElement>,
  threshold = 0.5
) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible: number[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(scrollElement.children).indexOf(entry.target);
            if (index !== -1) visible.push(index);
          }
        });
        setVisibleItems(visible);
      },
      {
        root: scrollElement,
        threshold,
      }
    );

    Array.from(scrollElement.children).forEach((child) => {
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, [scrollRef, threshold]);

  return visibleItems;
};

export default useHorizontalScroll;

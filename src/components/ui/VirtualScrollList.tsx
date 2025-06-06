import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent,
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Calculate total height and visible items
  const totalHeight = items.length * itemHeight;
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Render visible items with proper positioning
  const renderVisibleItems = useCallback(() => {
    return visibleItems.map((item, index) => {
      const actualIndex = visibleRange.startIndex + index;
      const top = actualIndex * itemHeight;
      
      return (
        <div
          key={actualIndex}
          style={{
            position: 'absolute',
            top,
            left: 0,
            right: 0,
            height: itemHeight,
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [visibleItems, visibleRange.startIndex, itemHeight, renderItem]);

  if (loading && loadingComponent) {
    return <div className={cn('flex items-center justify-center', className)}>{loadingComponent}</div>;
  }

  if (items.length === 0 && emptyComponent) {
    return <div className={cn('flex items-center justify-center', className)}>{emptyComponent}</div>;
  }

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {renderVisibleItems()}
      </div>
    </div>
  );
}

export default memo(VirtualScrollList) as <T>(props: VirtualScrollListProps<T>) => JSX.Element;

// Hook for managing virtual scroll state
export const useVirtualScroll = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;

  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  const scrollToBottom = useCallback(() => {
    const maxScrollTop = Math.max(0, totalHeight - containerHeight);
    setScrollTop(maxScrollTop);
  }, [totalHeight, containerHeight]);

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    visibleItems,
    totalHeight,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  };
};

// Optimized list item component
interface VirtualListItemProps {
  children: React.ReactNode;
  index: number;
  style?: React.CSSProperties;
  className?: string;
}

export const VirtualListItem = memo<VirtualListItemProps>(({ 
  children, 
  index, 
  style, 
  className 
}) => {
  return (
    <div 
      className={cn('virtual-list-item', className)} 
      style={style}
      data-index={index}
    >
      {children}
    </div>
  );
});

VirtualListItem.displayName = 'VirtualListItem';

// Infinite scroll hook for large datasets
export const useInfiniteScroll = <T,>(
  fetchMore: () => Promise<T[]>,
  hasMore: boolean,
  threshold = 0.8
) => {
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(async (scrollTop: number, containerHeight: number, totalHeight: number) => {
    const scrollPercentage = (scrollTop + containerHeight) / totalHeight;
    
    if (scrollPercentage >= threshold && hasMore && !loading) {
      setLoading(true);
      try {
        await fetchMore();
      } catch (error) {
        console.error('Error fetching more items:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [fetchMore, hasMore, loading, threshold]);

  return { loading, handleScroll };
};

// Debounced search hook
export const useDebouncedSearch = (
  searchTerm: string,
  delay: number = 300
) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedSearchTerm;
};

// Optimized filter hook
export const useOptimizedFilter = <T,>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[] = []
) => {
  return useMemo(() => {
    return items.filter(filterFn);
  }, [items, ...dependencies]);
};

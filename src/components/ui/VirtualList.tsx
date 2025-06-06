import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  getItemKey?: (item: T, index: number) => string | number;
  onScroll?: (scrollTop: number) => void;
  estimateSize?: (index: number) => number;
  gap?: number;
}

/**
 * Virtual scrolling component for large data lists
 * Optimizes performance by only rendering visible items
 */
export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
  getItemKey,
  onScroll,
  estimateSize,
  gap = 0,
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize || (() => itemHeight),
    overscan,
    gap,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Handle scroll events
  React.useEffect(() => {
    if (onScroll) {
      const element = parentRef.current;
      if (!element) return;

      const handleScroll = () => {
        onScroll(element.scrollTop);
      };

      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [onScroll]);

  return (
    <div
      ref={parentRef}
      className={cn(
        "overflow-auto",
        className
      )}
      style={{
        height: `${height}px`,
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = getItemKey ? getItemKey(item, virtualItem.index) : virtualItem.index;

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Virtual table component for tabular data
 */
interface VirtualTableProps<T> {
  items: T[];
  columns: Array<{
    key: string;
    header: string;
    width?: number;
    render: (item: T, index: number) => React.ReactNode;
  }>;
  height: number;
  rowHeight: number;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  overscan?: number;
  getRowKey?: (item: T, index: number) => string | number;
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualTable<T>({
  items,
  columns,
  height,
  rowHeight,
  className,
  headerClassName,
  rowClassName,
  overscan = 5,
  getRowKey,
  onRowClick,
}: VirtualTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className={cn("bg-gray-50 border-b", headerClassName)}>
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual scrolling body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: `${height}px`,
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            const key = getRowKey ? getRowKey(item, virtualItem.index) : virtualItem.index;

            return (
              <div
                key={key}
                className={cn(
                  "border-b hover:bg-gray-50 cursor-pointer",
                  rowClassName
                )}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                onClick={() => onRowClick?.(item, virtualItem.index)}
              >
                <div className="flex items-center h-full">
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="px-4 py-2 text-sm text-gray-900"
                      style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
                    >
                      {column.render(item, virtualItem.index)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Virtual grid component for card-based layouts
 */
interface VirtualGridProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  itemsPerRow: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: number;
  overscan?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualGrid<T>({
  items,
  height,
  itemHeight,
  itemsPerRow,
  renderItem,
  className,
  gap = 16,
  overscan = 5,
  getItemKey,
}: VirtualGridProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Calculate rows needed
  const rowCount = Math.ceil(items.length / itemsPerRow);
  const rowHeight = itemHeight + gap;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
      style={{ height: `${height}px` }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * itemsPerRow;
          const endIndex = Math.min(startIndex + itemsPerRow, items.length);
          const rowItems = items.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="flex"
                style={{
                  gap: `${gap}px`,
                  height: `${itemHeight}px`,
                }}
              >
                {rowItems.map((item, itemIndex) => {
                  const globalIndex = startIndex + itemIndex;
                  const key = getItemKey ? getItemKey(item, globalIndex) : globalIndex;

                  return (
                    <div
                      key={key}
                      style={{
                        flex: `0 0 calc((100% - ${gap * (itemsPerRow - 1)}px) / ${itemsPerRow})`,
                        height: '100%',
                      }}
                    >
                      {renderItem(item, globalIndex)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

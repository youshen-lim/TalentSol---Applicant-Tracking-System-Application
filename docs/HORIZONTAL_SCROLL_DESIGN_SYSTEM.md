# TalentSol Horizontal Scroll Design System

A comprehensive horizontal scrolling solution that provides consistent behavior across all TalentSol pages while maintaining accessibility and responsive design principles.

## 🎯 Overview

The TalentSol Horizontal Scroll Design System provides:

- **Consistent UI/UX** across all pages using standardized TalentSol colors and spacing
- **Responsive behavior** that adapts to all screen sizes and devices
- **Full accessibility** compliance (WCAG 2.1 AA)
- **Touch optimization** for mobile devices
- **Keyboard navigation** support
- **Multiple variants** for different use cases

## 🚀 Components

### 1. HorizontalScroll (Base Component)

The foundation component that provides core horizontal scrolling functionality.

```tsx
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

<HorizontalScroll
  variant="blue"
  size="md"
  showScrollButtons={true}
  showIndicators={true}
  indicatorType="dots"
  ariaLabel="Content scroll area"
>
  {/* Your content */}
</HorizontalScroll>
```

**Props:**
- `variant`: `'default' | 'blue' | 'purple' | 'subtle'`
- `size`: `'sm' | 'md' | 'lg'`
- `indicatorType`: `'dots' | 'bars' | 'arrows' | 'fade' | 'none'`
- `showScrollButtons`: boolean
- `showIndicators`: boolean
- `autoHideControls`: boolean
- `touchOptimized`: boolean
- `snapToItems`: boolean

### 2. CardScroll

Optimized for dashboard metrics, job cards, and other card-based content.

```tsx
import { CardScroll } from '@/components/ui/horizontal-scroll';

<CardScroll
  variant="blue"
  cardGap="md"
  cardMinWidth="280px"
>
  {metrics.map(metric => (
    <Card key={metric.id}>
      {/* Card content */}
    </Card>
  ))}
</CardScroll>
```

**Use Cases:**
- Dashboard metrics
- Job listings
- Candidate cards
- Feature highlights

### 3. KanbanScroll

Perfect for candidate pipelines and workflow columns with drag-and-drop support.

```tsx
import { KanbanScroll } from '@/components/ui/horizontal-scroll';

<KanbanScroll
  variant="blue"
  columnWidth="320px"
  columnGap="md"
  snapToItems={true}
>
  {columns.map(column => (
    <div key={column.id} className="kanban-column">
      {/* Column content */}
    </div>
  ))}
</KanbanScroll>
```

**Use Cases:**
- Candidate pipeline
- Project workflows
- Task boards
- Status tracking

### 4. TabScroll

Horizontal tab navigation that gracefully handles overflow.

```tsx
import { TabScroll } from '@/components/ui/horizontal-scroll';

<TabScroll variant="subtle" tabGap="sm">
  {tabs.map(tab => (
    <Button key={tab.id} variant={tab.active ? "default" : "ghost"}>
      {tab.label}
    </Button>
  ))}
</TabScroll>
```

**Use Cases:**
- Navigation tabs
- Filter options
- Category selection
- Settings panels

### 5. MediaScroll

For image galleries, document previews, and media content.

```tsx
import { MediaScroll } from '@/components/ui/horizontal-scroll';

<MediaScroll
  variant="default"
  itemWidth="200px"
  aspectRatio="square"
  indicatorType="bars"
>
  {images.map(image => (
    <img key={image.id} src={image.url} alt={image.alt} />
  ))}
</MediaScroll>
```

**Use Cases:**
- Document previews
- Image galleries
- Video thumbnails
- File attachments

## 🎨 Design System Integration

### Color Variants

The components use TalentSol's standardized color scheme:

- **Blue** (`variant="blue"`): Primary brand color, used for main content areas
- **Purple** (`variant="purple"`): Secondary brand color, used for accent areas
- **Default** (`variant="default"`): Neutral gray, used for general content
- **Subtle** (`variant="subtle"`): Light gray, used for minimal interfaces

### Spacing Scale

All components use TalentSol's standardized spacing:

- **Small** (`size="sm"`): Compact layouts, mobile-first
- **Medium** (`size="md"`): Standard desktop layouts
- **Large** (`size="lg"`): Spacious layouts, large screens

### Typography

Components inherit TalentSol's typography scale:
- Uses Inter font family
- Responsive text sizing
- Consistent line heights

## ♿ Accessibility Features

### Keyboard Navigation
- **Arrow Keys**: Navigate left/right through content
- **Home/End**: Jump to beginning/end
- **Tab**: Focus on scroll buttons
- **Enter/Space**: Activate scroll buttons

### Screen Reader Support
- Proper ARIA labels and descriptions
- Role attributes for scroll containers
- Live regions for scroll state changes
- Descriptive button labels

### Visual Accessibility
- High contrast mode support
- Reduced motion support
- Focus indicators
- Color-blind friendly indicators

### Touch Accessibility
- Large touch targets (44px minimum)
- Momentum scrolling on mobile
- Swipe gesture support
- Touch-friendly button spacing

## 📱 Responsive Behavior

### Mobile (< 768px)
- Touch-optimized scrolling
- Auto-hide scroll buttons (optional)
- Larger touch targets
- Momentum scrolling

### Tablet (768px - 1024px)
- Balanced button visibility
- Medium-sized controls
- Hover states enabled

### Desktop (> 1024px)
- Full feature set
- Hover-activated controls
- Keyboard navigation
- Mouse wheel support

## 🔧 Advanced Usage

### Custom Hook

Use the `useHorizontalScroll` hook for custom implementations:

```tsx
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';

const MyComponent = () => {
  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    scrollProgress
  } = useHorizontalScroll({
    scrollAmount: 300,
    smoothScroll: true,
    onScrollChange: (left, width, clientWidth) => {
      console.log('Scroll progress:', left / (width - clientWidth));
    }
  });

  return (
    <div ref={scrollRef} className="overflow-x-auto">
      {/* Your content */}
    </div>
  );
};
```

### Auto Scroll

Enable auto-scrolling for carousels and showcases:

```tsx
<HorizontalScroll
  autoScroll={true}
  autoScrollInterval={3000}
  onScrollStart={() => console.log('Auto scroll started')}
  onScrollEnd={() => console.log('Auto scroll ended')}
>
  {/* Content */}
</HorizontalScroll>
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Scroll buttons appear/disappear correctly
- [ ] Keyboard navigation works
- [ ] Touch scrolling is smooth on mobile
- [ ] Indicators update properly
- [ ] Auto-hide controls function
- [ ] Screen reader announces changes
- [ ] High contrast mode works
- [ ] Reduced motion is respected

### Automated Testing

```tsx
import { render, screen } from '@testing-library/react';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

test('renders scroll buttons when content overflows', () => {
  render(
    <HorizontalScroll ariaLabel="Test scroll">
      {/* Overflow content */}
    </HorizontalScroll>
  );
  
  expect(screen.getByLabelText('Scroll left')).toBeInTheDocument();
  expect(screen.getByLabelText('Scroll right')).toBeInTheDocument();
});
```

## 📚 Examples

See `src/components/ui/horizontal-scroll-examples.tsx` for comprehensive examples of all components and variants.

## 🔄 Migration Guide

### From Enhanced Scroll

Replace existing enhanced scroll components:

```tsx
// Before
import { KanbanScrollContainer } from '@/components/ui/enhanced-scroll';

// After
import { KanbanScroll } from '@/components/ui/horizontal-scroll';
```

### From Custom Implementations

Replace custom scroll implementations with design system components for consistency and better accessibility.

## 🤝 Contributing

When adding new scroll variants or features:

1. Follow TalentSol design system principles
2. Ensure accessibility compliance
3. Add comprehensive tests
4. Update documentation
5. Test on all supported devices

## 📄 License

Part of the TalentSol ATS application. All rights reserved.

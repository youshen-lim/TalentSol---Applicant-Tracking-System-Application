import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  HorizontalScroll, 
  CardScroll, 
  KanbanScroll, 
  TabScroll, 
  MediaScroll 
} from '@/components/ui/horizontal-scroll';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Test suite for TalentSol Horizontal Scroll Design System
 * 
 * Tests accessibility, functionality, and responsive behavior
 */

// Mock useIsMobile hook
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Helper to create overflow content
const createOverflowContent = (count = 10) => 
  Array.from({ length: count }, (_, i) => (
    <div key={i} style={{ minWidth: '200px', height: '100px' }}>
      Item {i + 1}
    </div>
  ));

describe('HorizontalScroll', () => {
  beforeEach(() => {
    // Mock scrollWidth to simulate overflow
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 300,
    });
  });

  test('renders with basic props', () => {
    render(
      <HorizontalScroll ariaLabel="Test scroll">
        {createOverflowContent(5)}
      </HorizontalScroll>
    );

    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Test scroll');
  });

  test('shows scroll buttons when content overflows', async () => {
    render(
      <HorizontalScroll>
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Scroll right')).toBeInTheDocument();
    });
  });

  test('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <HorizontalScroll>
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    const scrollContainer = screen.getByRole('scrollbar');
    
    await user.click(scrollContainer);
    await user.keyboard('{ArrowRight}');
    
    // Verify scroll behavior was triggered
    expect(scrollContainer).toHaveFocus();
  });

  test('calls scroll callbacks', async () => {
    const onScrollStart = jest.fn();
    const onScrollEnd = jest.fn();
    const onScrollChange = jest.fn();

    render(
      <HorizontalScroll
        onScrollStart={onScrollStart}
        onScrollEnd={onScrollEnd}
        onScrollChange={onScrollChange}
      >
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    const scrollButton = await screen.findByLabelText('Scroll right');
    await userEvent.click(scrollButton);

    expect(onScrollStart).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(onScrollEnd).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  test('applies correct variant styles', () => {
    const { rerender } = render(
      <HorizontalScroll variant="blue">
        {createOverflowContent(5)}
      </HorizontalScroll>
    );

    let container = screen.getByRole('scrollbar');
    expect(container).toHaveClass('scrollbar-thumb-ats-light-blue/60');

    rerender(
      <HorizontalScroll variant="purple">
        {createOverflowContent(5)}
      </HorizontalScroll>
    );

    container = screen.getByRole('scrollbar');
    expect(container).toHaveClass('scrollbar-thumb-ats-light-purple/60');
  });

  test('shows different indicator types', () => {
    const { rerender } = render(
      <HorizontalScroll indicatorType="dots">
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    // Check for dots indicators
    expect(document.querySelector('[data-active]')).toBeInTheDocument();

    rerender(
      <HorizontalScroll indicatorType="none">
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    // Check that indicators are hidden
    expect(document.querySelector('[data-active]')).not.toBeInTheDocument();
  });

  test('handles disabled state correctly', async () => {
    render(
      <HorizontalScroll>
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    const scrollButton = await screen.findByLabelText('Scroll right');
    
    // Click rapidly to test disabled state during scroll
    await userEvent.click(scrollButton);
    await userEvent.click(scrollButton);
    
    // Button should be disabled during scroll animation
    expect(scrollButton).toBeDisabled();
  });
});

describe('CardScroll', () => {
  test('renders cards with proper spacing', () => {
    render(
      <CardScroll cardGap="md" cardMinWidth="280px">
        <Card>Card 1</Card>
        <Card>Card 2</Card>
        <Card>Card 3</Card>
      </CardScroll>
    );

    const cards = screen.getAllByText(/Card \d/);
    expect(cards).toHaveLength(3);
    
    // Check that cards have proper styling
    cards.forEach(card => {
      const cardContainer = card.closest('[style*="minWidth"]');
      expect(cardContainer).toHaveStyle('min-width: 280px');
    });
  });

  test('applies correct gap classes', () => {
    const { rerender } = render(
      <CardScroll cardGap="sm">
        <Card>Card 1</Card>
        <Card>Card 2</Card>
      </CardScroll>
    );

    let container = document.querySelector('.gap-3');
    expect(container).toBeInTheDocument();

    rerender(
      <CardScroll cardGap="lg">
        <Card>Card 1</Card>
        <Card>Card 2</Card>
      </CardScroll>
    );

    container = document.querySelector('.gap-6');
    expect(container).toBeInTheDocument();
  });
});

describe('KanbanScroll', () => {
  test('renders columns with snap behavior', () => {
    render(
      <KanbanScroll columnWidth="320px" snapToItems={true}>
        <div>Column 1</div>
        <div>Column 2</div>
        <div>Column 3</div>
      </KanbanScroll>
    );

    const columns = screen.getAllByText(/Column \d/);
    expect(columns).toHaveLength(3);

    // Check for snap classes
    const scrollContainer = screen.getByRole('scrollbar');
    expect(scrollContainer).toHaveClass('scroll-snap-type-x-mandatory');
  });

  test('sets correct column widths', () => {
    render(
      <KanbanScroll columnWidth="300px">
        <div>Column 1</div>
        <div>Column 2</div>
      </KanbanScroll>
    );

    const columns = document.querySelectorAll('[style*="width: 300px"]');
    expect(columns).toHaveLength(2);
  });
});

describe('TabScroll', () => {
  test('renders tabs with proper styling', () => {
    render(
      <TabScroll variant="subtle" tabGap="sm">
        <Button>Tab 1</Button>
        <Button>Tab 2</Button>
        <Button>Tab 3</Button>
      </TabScroll>
    );

    const tabs = screen.getAllByRole('button');
    expect(tabs).toHaveLength(3);
    
    // Check that container has proper gap
    const container = document.querySelector('.gap-1');
    expect(container).toBeInTheDocument();
  });

  test('hides indicators by default', () => {
    render(
      <TabScroll>
        <Button>Tab 1</Button>
        <Button>Tab 2</Button>
      </TabScroll>
    );

    // TabScroll should not show indicators by default
    expect(document.querySelector('[data-active]')).not.toBeInTheDocument();
  });
});

describe('MediaScroll', () => {
  test('applies correct aspect ratio classes', () => {
    const { rerender } = render(
      <MediaScroll aspectRatio="square" itemWidth="200px">
        <div>Media 1</div>
        <div>Media 2</div>
      </MediaScroll>
    );

    let containers = document.querySelectorAll('.aspect-square');
    expect(containers).toHaveLength(2);

    rerender(
      <MediaScroll aspectRatio="video" itemWidth="200px">
        <div>Media 1</div>
        <div>Media 2</div>
      </MediaScroll>
    );

    containers = document.querySelectorAll('.aspect-video');
    expect(containers).toHaveLength(2);
  });

  test('sets correct item widths', () => {
    render(
      <MediaScroll itemWidth="160px">
        <div>Media 1</div>
        <div>Media 2</div>
      </MediaScroll>
    );

    const items = document.querySelectorAll('[style*="width: 160px"]');
    expect(items).toHaveLength(2);
  });
});

describe('Accessibility', () => {
  test('provides proper ARIA labels', () => {
    render(
      <HorizontalScroll 
        ariaLabel="Custom scroll area"
        ariaDescription="Scroll through content items"
      >
        {createOverflowContent(5)}
      </HorizontalScroll>
    );

    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'Custom scroll area');
    expect(container).toHaveAttribute('aria-description', 'Scroll through content items');
  });

  test('scroll container has proper scrollbar role', () => {
    render(
      <HorizontalScroll>
        {createOverflowContent(5)}
      </HorizontalScroll>
    );

    const scrollContainer = screen.getByRole('scrollbar');
    expect(scrollContainer).toHaveAttribute('aria-orientation', 'horizontal');
    expect(scrollContainer).toHaveAttribute('tabindex', '0');
  });

  test('scroll buttons have descriptive labels', async () => {
    render(
      <HorizontalScroll>
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Scroll left')).toBeInTheDocument();
      expect(screen.getByLabelText('Scroll right')).toBeInTheDocument();
    });
  });
});

describe('Responsive Behavior', () => {
  test('handles mobile viewport', () => {
    const { useIsMobile } = require('@/hooks/use-mobile');
    useIsMobile.mockReturnValue(true);

    render(
      <HorizontalScroll mobileScrollButtons={false}>
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    // Scroll buttons should be hidden on mobile when mobileScrollButtons is false
    expect(screen.queryByLabelText('Scroll left')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Scroll right')).not.toBeInTheDocument();
  });

  test('shows mobile scroll buttons when enabled', () => {
    const { useIsMobile } = require('@/hooks/use-mobile');
    useIsMobile.mockReturnValue(true);

    render(
      <HorizontalScroll mobileScrollButtons={true}>
        {createOverflowContent(10)}
      </HorizontalScroll>
    );

    // Should show buttons even on mobile when explicitly enabled
    expect(screen.getByLabelText('Scroll right')).toBeInTheDocument();
  });
});

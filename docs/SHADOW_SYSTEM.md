# TalentSol Shadow System

## Overview

The TalentSol application uses a standardized shadow system to ensure visual consistency across all pages (except the Landing Page). This system provides predefined shadow variants for different UI components and use cases.

## Shadow Variants

### Card Shadows
- **`card`**: Standard card shadow for main content containers
  - Classes: `bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300`
  - Use for: Regular content cards, chart containers, list items

- **`cardEnhanced`**: Enhanced card shadow for important content
  - Classes: `bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300`
  - Use for: StatCards, featured content, important metrics

### Modal & Overlay Shadows
- **`modal`**: Modal and dialog shadows
  - Classes: `bg-white rounded-lg border border-slate-200 shadow-xl`
  - Use for: Modals, dialogs, overlays

- **`dropdown`**: Dropdown and menu shadows
  - Classes: `bg-white rounded-md border border-slate-200 shadow-lg`
  - Use for: Dropdown menus, select options, tooltips

### Interactive Element Shadows
- **`button`**: Button shadows
  - Classes: `shadow-sm hover:shadow-md transition-shadow duration-200`
  - Use for: Buttons, clickable elements

- **`input`**: Form input shadows
  - Classes: `border border-slate-300 shadow-sm focus:shadow-md transition-shadow duration-200`
  - Use for: Input fields, form elements

### Layout Shadows
- **`sidebar`**: Sidebar shadows
  - Classes: `bg-white border-r border-slate-200 shadow-sm`
  - Use for: Navigation sidebars, side panels

- **`header`**: Header shadows
  - Classes: `bg-white border-b border-slate-200 shadow-sm`
  - Use for: Top navigation, page headers

## Usage

### Import the Shadow System

```typescript
import { shadows, ShadowBox, CardShadow } from '@/components/ui/shadow';
```

### Method 1: Using Shadow Classes Directly

```typescript
// Standard card
<div className={shadows.card}>
  Content here
</div>

// Enhanced card
<div className={shadows.cardEnhanced}>
  Important content here
</div>
```

### Method 2: Using Shadow Components

```typescript
// Generic shadow box
<ShadowBox variant="card">
  Content here
</ShadowBox>

// Pre-configured card shadow
<CardShadow>
  Content here
</CardShadow>
```

### Method 3: Using Template Literals (Current Implementation)

```typescript
<div className={`${shadows.card} additional-classes`}>
  Content here
</div>
```

## Implementation Examples

### Dashboard Cards
```typescript
// Chart containers
<div className={`${shadows.card} h-[400px]`}>
  <LineChart />
</div>

// Bottom section cards
<div className={`${shadows.card} flex flex-col h-[320px]`}>
  <div className="p-6">Card content</div>
</div>
```

### StatCards
StatCards automatically use `cardEnhanced` shadows when they have change indicators or tooltips.

### Modals
```typescript
<div className={shadows.modal}>
  Modal content
</div>
```

## Design Principles

1. **Consistency**: All similar components use the same shadow variant
2. **Hierarchy**: Enhanced shadows for important content, standard shadows for regular content
3. **Interaction**: Hover effects provide visual feedback
4. **Performance**: Smooth transitions without being distracting
5. **Accessibility**: Shadows enhance visual hierarchy without affecting screen readers

## Migration Guide

When updating existing components:

1. Import the shadow system: `import { shadows } from '@/components/ui/shadow';`
2. Replace hardcoded shadow classes with standardized variants
3. Use template literals for combining with additional classes
4. Test hover states and transitions

### Before
```typescript
<div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
```

### After
```typescript
<div className={shadows.card}>
```

## Pages Using Standardized Shadows

- ✅ Dashboard
- ⏳ CandidatePipeline (to be updated)
- ⏳ Interviews (to be updated)
- ⏳ Jobs (to be updated)
- ⏳ Documents (to be updated)
- ❌ Landing Page (excluded by design)

## Benefits

1. **Visual Consistency**: Uniform appearance across all pages
2. **Maintainability**: Single source of truth for shadow styles
3. **Developer Experience**: Easy to use and understand
4. **Performance**: Optimized CSS classes
5. **Flexibility**: Easy to update globally by changing the shadow system

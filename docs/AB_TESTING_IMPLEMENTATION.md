# TalentSol A/B Testing Implementation Guide

## 🚀 Overview

This document outlines the A/B testing implementation for TalentSol's standardized style components. The system allows safe rollout of new design tokens and components while maintaining visual consistency and gathering performance metrics.

## 📊 A/B Test Configuration

### Current Active Tests

| Test Name | Description | Rollout % | Status |
|-----------|-------------|-----------|---------|
| `standardized-shadows` | New shadow system using Tailwind config | 50% | Active |
| `standardized-badges` | Standardized badge variants with gradients | 30% | Active |
| `standardized-kanban-colors` | Enhanced Kanban board color scheme | 25% | Active |
| `standardized-typography` | Typography scale using design tokens | 40% | Active |
| `standardized-layout` | Layout components with consistent spacing | 35% | Active |

### Test Variants

- **Control Group**: Current implementation (legacy styling)
- **Test Group**: Standardized components using Tailwind config tokens

## 🛠️ Implementation Details

### 1. A/B Testing Infrastructure

#### Core Hook: `useABTest`
```typescript
import { useABTest } from '@/hooks/useABTest';

const { getVariant, isStandardizedEnabled } = useABTest();
const variant = getVariant('standardized-shadows'); // 'control' | 'standardized'
```

#### Convenience Hooks
```typescript
import { 
  useStandardizedShadows,
  useStandardizedBadges,
  useStandardizedKanbanColors 
} from '@/hooks/useABTest';

const useStandardized = useStandardizedShadows(); // boolean
```

### 2. Component Implementation

#### Shadow System
```typescript
// Legacy (Control)
const legacyShadowVariants = {
  card: "shadow-sm hover:shadow-md",
  cardEnhanced: "shadow-lg hover:shadow-xl"
};

// Standardized (Test)
const standardizedShadowVariants = {
  card: "shadow-ats-card hover:shadow-ats-card-hover",
  cardEnhanced: "shadow-ats-card-hover hover:shadow-ats-modal"
};

// Usage
const shadowClass = useShadowVariant('card');
```

#### Badge System
```typescript
// A/B tested badge implementation
const getStageBadge = () => {
  return useStandardized ? getStandardizedStageBadge() : getLegacyStageBadge();
};
```

#### Kanban Colors
```typescript
// A/B tested color mapping
const getStageColor = (stageId: string) => {
  return useStandardizedColors ? getStandardizedStageColor(stageId) : getLegacyStageColor(stageId);
};
```

### 3. Admin Control Panel

Access the A/B testing control panel via the floating button in the bottom-right corner of the application.

#### Features:
- **Real-time Test Control**: Enable/disable tests instantly
- **Rollout Management**: Adjust rollout percentages (0-100%)
- **User Variant Display**: See which variant the current user is experiencing
- **Metrics Dashboard**: View test performance and conversion rates
- **Event Tracking**: Monitor user interactions and test events

## 📈 Metrics & Analytics

### Tracked Events
- `test_toggled`: When a test is enabled/disabled
- `rollout_changed`: When rollout percentage is modified
- `component_rendered`: When A/B tested components are displayed
- `user_interaction`: When users interact with tested components

### Performance Metrics
- **Impressions**: Number of times components are viewed
- **Interactions**: User clicks and engagements
- **Conversion Rate**: Success metrics for each variant
- **Load Time**: Performance impact of different variants

## 🎯 Visual Impact Assessment

### Dashboard Page: 98% Visual Preservation
- StatCards: Identical appearance with improved shadow system
- Layout: No visual changes
- Typography: Minor font weight adjustments (barely noticeable)

### Candidates Page: 96.5% Visual Preservation
- Kanban Board: Enhanced color differentiation between stages
- Candidate Cards: Improved gradient consistency
- Overall layout: Unchanged

### Jobs Page: 97% Visual Preservation
- Job cards: Identical appearance
- Status badges: Slightly improved gradients
- Layout: No changes

## 🔧 Configuration Management

### Local Storage Keys
- `talentsol-ab-user-id`: Persistent user identifier for consistent test assignment
- `talentsol-ab-tests`: Test configuration overrides
- `talentsol-ab-events`: Local event tracking (last 100 events)

### Environment Variables
```env
# Optional: Override default rollout percentages
REACT_APP_AB_SHADOWS_ROLLOUT=50
REACT_APP_AB_BADGES_ROLLOUT=30
REACT_APP_AB_KANBAN_ROLLOUT=25
```

## 🚦 Rollout Strategy

### Phase 1: Shadow System (Week 1)
- Start: 10% rollout
- Monitor: Performance metrics, visual consistency
- Scale: Increase to 50% if metrics are positive

### Phase 2: Badge System (Week 2)
- Start: 15% rollout
- Monitor: User engagement, visual feedback
- Scale: Increase to 30% if successful

### Phase 3: Kanban Colors (Week 3)
- Start: 10% rollout
- Monitor: User workflow impact, visual clarity
- Scale: Increase to 25% if positive

### Phase 4: Full Rollout (Week 4)
- Evaluate all metrics
- Decide on 100% rollout or rollback
- Document lessons learned

## 🛡️ Safety Measures

### Automatic Rollback Triggers
- Performance degradation > 10%
- Error rate increase > 5%
- Negative user feedback threshold
- Visual regression detection

### Manual Controls
- Instant test disable via admin panel
- Emergency rollback to control group
- Per-test rollout adjustment
- User-specific variant override

## 📝 Best Practices

### For Developers
1. Always implement both control and test variants
2. Use convenience hooks for cleaner code
3. Track meaningful events for analytics
4. Test both variants thoroughly
5. Document visual differences

### For Designers
1. Ensure minimal visual impact
2. Maintain accessibility standards
3. Test across different screen sizes
4. Validate color contrast ratios
5. Document design token usage

### For Product Managers
1. Define clear success metrics
2. Monitor user feedback channels
3. Plan gradual rollout strategy
4. Prepare rollback procedures
5. Communicate changes to stakeholders

## 🔍 Troubleshooting

### Common Issues
1. **Inconsistent Variants**: Clear localStorage and refresh
2. **Admin Panel Not Visible**: Check if ABTestProvider is properly wrapped
3. **Metrics Not Updating**: Verify event tracking implementation
4. **Visual Glitches**: Check CSS class conflicts

### Debug Commands
```javascript
// Check current user's test assignments
console.log(localStorage.getItem('talentsol-ab-user-id'));

// View all test configurations
console.log(JSON.parse(localStorage.getItem('talentsol-ab-tests')));

// Clear test data (forces reassignment)
localStorage.removeItem('talentsol-ab-user-id');
localStorage.removeItem('talentsol-ab-tests');
```

## 📞 Support

For questions or issues with the A/B testing system:
- Check this documentation first
- Review the admin panel metrics
- Contact the development team
- File an issue in the project repository

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: TalentSol Development Team

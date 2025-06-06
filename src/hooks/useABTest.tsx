import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * A/B Testing Hook for TalentSol Standardized Components
 * Allows safe rollout of new standardized styling with fallback to current implementation
 */

export type ABTestVariant = 'control' | 'standardized';

interface ABTestConfig {
  testName: string;
  variant: ABTestVariant;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
}

interface ABTestContextType {
  getVariant: (testName: string) => ABTestVariant;
  isStandardizedEnabled: (testName: string) => boolean;
  setTestConfig: (testName: string, config: Partial<ABTestConfig>) => void;
  getAllTests: () => Record<string, ABTestConfig>;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

// Default A/B test configurations
const DEFAULT_TESTS: Record<string, ABTestConfig> = {
  'standardized-shadows': {
    testName: 'standardized-shadows',
    variant: 'control',
    enabled: true,
    rolloutPercentage: 50, // 50% of users see standardized shadows
  },
  'standardized-badges': {
    testName: 'standardized-badges',
    variant: 'control',
    enabled: true,
    rolloutPercentage: 30, // 30% of users see standardized badges
  },
  'standardized-kanban-colors': {
    testName: 'standardized-kanban-colors',
    variant: 'control',
    enabled: true,
    rolloutPercentage: 25, // 25% of users see new kanban colors
  },
  'standardized-typography': {
    testName: 'standardized-typography',
    variant: 'control',
    enabled: true,
    rolloutPercentage: 40, // 40% of users see standardized typography
  },
  'standardized-layout': {
    testName: 'standardized-layout',
    variant: 'control',
    enabled: true,
    rolloutPercentage: 35, // 35% of users see standardized layout components
  },
};

export const ABTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tests, setTests] = useState<Record<string, ABTestConfig>>(DEFAULT_TESTS);

  // Generate consistent user ID for A/B testing (persisted in localStorage)
  const getUserId = (): string => {
    let userId = localStorage.getItem('talentsol-ab-user-id');
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('talentsol-ab-user-id', userId);
    }
    return userId;
  };

  // Hash function to consistently assign users to variants
  const hashUserId = (userId: string, testName: string): number => {
    let hash = 0;
    const str = userId + testName;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  };

  const getVariant = (testName: string): ABTestVariant => {
    const test = tests[testName];
    if (!test || !test.enabled) {
      return 'control';
    }

    const userId = getUserId();
    const hash = hashUserId(userId, testName);
    
    // If hash is within rollout percentage, show standardized variant
    return hash < test.rolloutPercentage ? 'standardized' : 'control';
  };

  const isStandardizedEnabled = (testName: string): boolean => {
    return getVariant(testName) === 'standardized';
  };

  const setTestConfig = (testName: string, config: Partial<ABTestConfig>) => {
    setTests(prev => ({
      ...prev,
      [testName]: {
        ...prev[testName],
        ...config,
        testName,
      },
    }));
  };

  const getAllTests = () => tests;

  // Load test configurations from localStorage on mount
  useEffect(() => {
    const savedTests = localStorage.getItem('talentsol-ab-tests');
    if (savedTests) {
      try {
        const parsedTests = JSON.parse(savedTests);
        setTests(prev => ({ ...prev, ...parsedTests }));
      } catch (error) {
        console.warn('Failed to parse saved A/B test configurations:', error);
      }
    }
  }, []);

  // Save test configurations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('talentsol-ab-tests', JSON.stringify(tests));
  }, [tests]);

  return (
    <ABTestContext.Provider value={{
      getVariant,
      isStandardizedEnabled,
      setTestConfig,
      getAllTests,
    }}>
      {children}
    </ABTestContext.Provider>
  );
};

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (context === undefined) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};

// Convenience hooks for specific tests
export const useStandardizedShadows = () => {
  const { isStandardizedEnabled } = useABTest();
  return isStandardizedEnabled('standardized-shadows');
};

export const useStandardizedBadges = () => {
  const { isStandardizedEnabled } = useABTest();
  return isStandardizedEnabled('standardized-badges');
};

export const useStandardizedKanbanColors = () => {
  const { isStandardizedEnabled } = useABTest();
  return isStandardizedEnabled('standardized-kanban-colors');
};

export const useStandardizedTypography = () => {
  const { isStandardizedEnabled } = useABTest();
  return isStandardizedEnabled('standardized-typography');
};

export const useStandardizedLayout = () => {
  const { isStandardizedEnabled } = useABTest();
  return isStandardizedEnabled('standardized-layout');
};

// Analytics tracking for A/B test events
export const trackABTestEvent = (testName: string, variant: ABTestVariant, event: string, metadata?: any) => {
  // In a real implementation, this would send to your analytics service
  console.log('A/B Test Event:', {
    testName,
    variant,
    event,
    metadata,
    timestamp: new Date().toISOString(),
    userId: localStorage.getItem('talentsol-ab-user-id'),
  });
  
  // Store events locally for development/testing
  const events = JSON.parse(localStorage.getItem('talentsol-ab-events') || '[]');
  events.push({
    testName,
    variant,
    event,
    metadata,
    timestamp: new Date().toISOString(),
    userId: localStorage.getItem('talentsol-ab-user-id'),
  });
  localStorage.setItem('talentsol-ab-events', JSON.stringify(events.slice(-100))); // Keep last 100 events
};

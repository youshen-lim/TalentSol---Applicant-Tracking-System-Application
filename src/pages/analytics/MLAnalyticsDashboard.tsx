import React from 'react';
import { RecommendationAnalyticsDashboard } from '@/components/ml/RecommendationAnalyticsDashboard';
import PageHeader from '@/components/layout/PageHeader';
import { Brain, BarChart3, TrendingUp } from 'lucide-react';

/**
 * ML Analytics Dashboard Page
 * Dedicated page for comprehensive ML recommendation analytics
 */
const MLAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="ML Analytics Dashboard"
        description="Comprehensive analytics and performance insights for AI-powered candidate recommendations"
        icon={<Brain className="h-6 w-6" />}
        actions={[
          {
            label: "View Reports",
            href: "/analytics/ml-reports",
            icon: <BarChart3 className="h-4 w-4" />,
            variant: "outline" as const
          },
          {
            label: "Performance Trends",
            href: "/analytics/reports/performance-trends",
            icon: <TrendingUp className="h-4 w-4" />,
            variant: "outline" as const
          }
        ]}
      />

      <RecommendationAnalyticsDashboard 
        timeRange="30d"
        autoRefresh={true}
        className="w-full"
      />
    </div>
  );
};

export default MLAnalyticsDashboard;

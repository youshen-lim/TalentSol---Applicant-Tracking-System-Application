import React from 'react';
import { RecommendationAnalyticsDashboard } from '@/components/ml/RecommendationAnalyticsDashboard';
import { Brain, BarChart3, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * ML Analytics Dashboard Page
 * Dedicated page for comprehensive ML recommendation analytics
 */
const MLAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Brain size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>ML Analytics Dashboard</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>Comprehensive analytics and performance insights for AI-powered candidate recommendations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/analytics/ml-reports">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-all">
              <BarChart3 size={15} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>View Reports</span>
            </button>
          </Link>
        </div>
      </div>

      <RecommendationAnalyticsDashboard 
        timeRange="30d"
        autoRefresh={true}
        className="w-full"
      />
    </div>
  );
};

export default MLAnalyticsDashboard;

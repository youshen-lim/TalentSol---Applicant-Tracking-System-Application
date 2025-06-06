// Test component to verify Application Sources fix
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

interface ApplicationStats {
  total: number;
  new: number;
  conversionRate: number;
  averageScore: number;
  topSources: SourceData[];
}

const TestApplicationSources: React.FC = () => {
  const [applicationStats, setApplicationStats] = useState<ApplicationStats | null>(null);
  const [testScenario, setTestScenario] = useState<'loading' | 'with-data' | 'empty-data' | 'api-error'>('loading');

  useEffect(() => {
    // Simulate different scenarios
    const timer = setTimeout(() => {
      switch (testScenario) {
        case 'loading':
          // Keep as null to show loading state
          break;
        case 'with-data':
          setApplicationStats({
            total: 156,
            new: 23,
            conversionRate: 15.4,
            averageScore: 72,
            topSources: [
              { source: 'Company Website', count: 67, percentage: 43 },
              { source: 'LinkedIn', count: 45, percentage: 29 },
              { source: 'Indeed', count: 28, percentage: 18 },
              { source: 'Referrals', count: 16, percentage: 10 }
            ]
          });
          break;
        case 'empty-data':
          setApplicationStats({
            total: 0,
            new: 0,
            conversionRate: 0,
            averageScore: 0,
            topSources: []
          });
          break;
        case 'api-error':
          // Simulate API error - fallback to mock data
          setApplicationStats({
            total: 156,
            new: 23,
            conversionRate: 15.4,
            averageScore: 72,
            topSources: [
              { source: 'Company Website', count: 67, percentage: 43 },
              { source: 'LinkedIn', count: 45, percentage: 29 },
              { source: 'Indeed', count: 28, percentage: 18 },
              { source: 'Referrals', count: 16, percentage: 10 }
            ]
          });
          break;
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [testScenario]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Application Sources Test</h1>
      
      {/* Test Scenario Controls */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Test Scenarios:</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setApplicationStats(null);
              setTestScenario('loading');
            }}
            className={`px-3 py-1 rounded text-sm ${testScenario === 'loading' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
          >
            Loading State
          </button>
          <button
            onClick={() => {
              setApplicationStats(null);
              setTestScenario('with-data');
            }}
            className={`px-3 py-1 rounded text-sm ${testScenario === 'with-data' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
          >
            With Data
          </button>
          <button
            onClick={() => {
              setApplicationStats(null);
              setTestScenario('empty-data');
            }}
            className={`px-3 py-1 rounded text-sm ${testScenario === 'empty-data' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
          >
            Empty Data
          </button>
          <button
            onClick={() => {
              setApplicationStats(null);
              setTestScenario('api-error');
            }}
            className={`px-3 py-1 rounded text-sm ${testScenario === 'api-error' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
          >
            API Error (Fallback)
          </button>
        </div>
      </div>

      {/* Application Sources Component */}
      <Card>
        <CardHeader>
          <CardTitle>Application Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applicationStats?.topSources && applicationStats.topSources.length > 0 ? (
              applicationStats.topSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{source.source}</span>
                    <span>{source.count} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : applicationStats === null ? (
              // Loading state
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                  
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                  
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ) : (
              // No data state
              <div className="text-center py-8 text-gray-500">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">No application source data available</p>
                <p className="text-xs text-gray-400 mt-1">Data will appear here once applications are submitted</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs text-gray-600">
          {JSON.stringify({ 
            testScenario, 
            applicationStats: applicationStats ? {
              ...applicationStats,
              topSourcesLength: applicationStats.topSources?.length || 0
            } : null 
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestApplicationSources;

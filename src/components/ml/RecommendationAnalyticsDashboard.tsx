import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCw,
  Download,
  Settings,
  Zap,
  Eye,
  MousePointer,
  UserCheck,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { shadows } from '@/components/ui/shadow';
import { LineChart } from '@/components/dashboard/LineChart';
import { BarChart } from '@/components/dashboard/BarChart';
import { StatCard } from '@/components/dashboard/StatCard';
import LoadingUI from '@/components/ui/loading';
import { mlApi } from '@/services/mlApi';
import { 
  RecommendationAnalytics, 
  ModelPerformance, 
  UserInteraction,
  ABTestResults 
} from '@/types/ml-recommendations';

interface RecommendationAnalyticsDashboardProps {
  className?: string;
  jobId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  autoRefresh?: boolean;
}

interface MLAnalyticsData {
  modelPerformance: ModelPerformance;
  userInteractions: UserInteraction[];
  conversionMetrics: {
    viewToClick: number;
    clickToApply: number;
    applyToInterview: number;
    interviewToHire: number;
    overallConversion: number;
  };
  recommendationTrends: Array<{
    date: string;
    recommendations: number;
    interactions: number;
    conversions: number;
  }>;
  biasMetrics: {
    genderBias: number;
    ageBias: number;
    locationBias: number;
    educationBias: number;
    experienceBias: number;
  };
  abTestResults?: ABTestResults;
}

export const RecommendationAnalyticsDashboard: React.FC<RecommendationAnalyticsDashboardProps> = ({
  className,
  jobId,
  timeRange = '30d',
  autoRefresh = false,
}) => {
  const [analyticsData, setAnalyticsData] = useState<MLAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ML analytics data
      const response = await mlApi.getRecommendationAnalytics(jobId, {
        timeRange: selectedTimeRange,
        includeABTests: true,
        includeBiasMetrics: true,
      });
      
      setAnalyticsData(response);
    } catch (err) {
      console.error('Failed to fetch ML analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      
      // Fallback to mock data for development
      setAnalyticsData(generateMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [jobId, selectedTimeRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, jobId, selectedTimeRange]);

  if (loading) {
    return (
      <Card className={cn(shadows.card, className)}>
        <CardContent className="p-8">
          <LoadingUI message="Loading ML analytics..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(shadows.card, className)}>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-ats-blue" />
            ML Recommendation Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Performance insights and metrics for AI-powered candidate recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Model Accuracy"
          value={`${Math.round(analyticsData.modelPerformance.accuracy * 100)}%`}
          description="Current model performance"
          icon={<Target className="h-4 w-4 text-green-600" />}
          change={{
            value: 2.3,
            positive: true
          }}
        />
        <StatCard
          title="Conversion Rate"
          value={`${Math.round(analyticsData.conversionMetrics.overallConversion * 100)}%`}
          description="Recommendation to hire"
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          change={{
            value: 1.8,
            positive: true
          }}
        />
        <StatCard
          title="User Interactions"
          value={analyticsData.userInteractions.length.toString()}
          description={`Last ${selectedTimeRange}`}
          icon={<MousePointer className="h-4 w-4 text-purple-600" />}
          change={{
            value: 12.5,
            positive: true
          }}
        />
        <StatCard
          title="Bias Score"
          value={calculateOverallBiasScore(analyticsData.biasMetrics).toFixed(2)}
          description="Lower is better"
          icon={<CheckCircle className="h-4 w-4 text-orange-600" />}
          change={{
            value: 0.3,
            positive: false
          }}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
          <TabsTrigger value="abtests">A/B Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendation Trends */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-ats-blue" />
                  Recommendation Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={analyticsData.recommendationTrends}
                  lines={[
                    { dataKey: "recommendations", stroke: "#3B82F6", name: "Recommendations" },
                    { dataKey: "interactions", stroke: "#10B981", name: "Interactions" },
                    { dataKey: "conversions", stroke: "#F59E0B", name: "Conversions" }
                  ]}
                  height={300}
                  showLegend={true}
                />
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-ats-blue" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    { stage: "View", rate: analyticsData.conversionMetrics.viewToClick * 100 },
                    { stage: "Click", rate: analyticsData.conversionMetrics.clickToApply * 100 },
                    { stage: "Apply", rate: analyticsData.conversionMetrics.applyToInterview * 100 },
                    { stage: "Interview", rate: analyticsData.conversionMetrics.interviewToHire * 100 }
                  ]}
                  categories={["rate"]}
                  colors={["#3B82F6"]}
                  height={300}
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model Performance Metrics */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-ats-blue" />
                  Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Accuracy</span>
                    <span className="text-sm font-bold">{(analyticsData.modelPerformance.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${analyticsData.modelPerformance.accuracy * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Precision</span>
                    <span className="text-sm font-bold">{(analyticsData.modelPerformance.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analyticsData.modelPerformance.precision * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recall</span>
                    <span className="text-sm font-bold">{(analyticsData.modelPerformance.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${analyticsData.modelPerformance.recall * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">F1 Score</span>
                    <span className="text-sm font-bold">{(analyticsData.modelPerformance.f1Score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${analyticsData.modelPerformance.f1Score * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card className={cn(shadows.card, "lg:col-span-2")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-ats-blue" />
                  Performance Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={generatePerformanceTrends()}
                  lines={[
                    { dataKey: "accuracy", stroke: "#10B981", name: "Accuracy" },
                    { dataKey: "precision", stroke: "#3B82F6", name: "Precision" },
                    { dataKey: "recall", stroke: "#8B5CF6", name: "Recall" }
                  ]}
                  height={300}
                  showLegend={true}
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Interaction Types */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-ats-blue" />
                  Interaction Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={getInteractionTypeData(analyticsData.userInteractions)}
                  categories={["count"]}
                  colors={["#3B82F6"]}
                  height={300}
                  valueFormatter={(value) => value.toString()}
                />
              </CardContent>
            </Card>

            {/* Interaction Timeline */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-ats-blue" />
                  Daily Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={getDailyInteractionData(analyticsData.userInteractions)}
                  lines={[
                    { dataKey: "interactions", stroke: "#3B82F6", name: "Interactions" }
                  ]}
                  height={300}
                  showLegend={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bias" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bias Metrics */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Bias Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    { category: "Gender", bias: Math.abs(analyticsData.biasMetrics.genderBias) * 100 },
                    { category: "Age", bias: Math.abs(analyticsData.biasMetrics.ageBias) * 100 },
                    { category: "Location", bias: Math.abs(analyticsData.biasMetrics.locationBias) * 100 },
                    { category: "Education", bias: Math.abs(analyticsData.biasMetrics.educationBias) * 100 },
                    { category: "Experience", bias: Math.abs(analyticsData.biasMetrics.experienceBias) * 100 }
                  ]}
                  categories={["bias"]}
                  colors={["#F59E0B"]}
                  height={300}
                  valueFormatter={(value) => `${value.toFixed(2)}%`}
                />
              </CardContent>
            </Card>

            {/* Bias Recommendations */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Bias Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getBiasRecommendations(analyticsData.biasMetrics).map((recommendation, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${recommendation.severity === 'high' ? 'bg-red-100' : recommendation.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${recommendation.severity === 'high' ? 'bg-red-600' : recommendation.severity === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{recommendation.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{recommendation.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abtests" className="space-y-6 mt-6">
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-ats-blue" />
                A/B Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">A/B Testing Framework</h3>
                <p className="text-gray-600 mb-4">
                  A/B testing infrastructure is ready for deployment. Configure tests to compare different ML models and recommendation strategies.
                </p>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure A/B Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to calculate overall bias score
const calculateOverallBiasScore = (biasMetrics: any) => {
  const scores = Object.values(biasMetrics).filter(score => typeof score === 'number') as number[];
  return scores.reduce((sum, score) => sum + Math.abs(score), 0) / scores.length;
};

// Helper function to generate performance trends data
const generatePerformanceTrends = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    accuracy: 85 + Math.random() * 5,
    precision: 82 + Math.random() * 6,
    recall: 87 + Math.random() * 4
  }));
};

// Helper function to get interaction type data
const getInteractionTypeData = (interactions: UserInteraction[]) => {
  const counts = interactions.reduce((acc, interaction) => {
    acc[interaction.action] = (acc[interaction.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([action, count]) => ({
    action: action.charAt(0).toUpperCase() + action.slice(1),
    count
  }));
};

// Helper function to get daily interaction data
const getDailyInteractionData = (interactions: UserInteraction[]) => {
  const dailyCounts = interactions.reduce((acc, interaction) => {
    const date = interaction.timestamp.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, interactions]) => ({ date, interactions }));
};

// Helper function to get bias recommendations
const getBiasRecommendations = (biasMetrics: any) => {
  const recommendations = [];

  if (Math.abs(biasMetrics.genderBias) > 0.02) {
    recommendations.push({
      title: "Gender Bias Detected",
      description: "Consider rebalancing training data and implementing fairness constraints.",
      severity: "high" as const
    });
  }

  if (Math.abs(biasMetrics.locationBias) > 0.025) {
    recommendations.push({
      title: "Location Bias Present",
      description: "Review location-based features and ensure geographic diversity in recommendations.",
      severity: "medium" as const
    });
  }

  if (Math.abs(biasMetrics.educationBias) > 0.015) {
    recommendations.push({
      title: "Education Bias Observed",
      description: "Validate that education requirements align with job performance outcomes.",
      severity: "medium" as const
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Bias Levels Acceptable",
      description: "Current bias metrics are within acceptable thresholds. Continue monitoring.",
      severity: "low" as const
    });
  }

  return recommendations;
};

// Mock data generator for development
const generateMockAnalyticsData = (): MLAnalyticsData => {
  return {
    modelPerformance: {
      accuracy: 0.87,
      precision: 0.84,
      recall: 0.89,
      f1Score: 0.86,
      auc: 0.91,
      calibration: 0.82,
      bias: {
        genderBias: 0.02,
        ageBias: 0.01,
        locationBias: 0.03,
        educationBias: 0.02,
        experienceBias: 0.01
      }
    },
    userInteractions: Array.from({ length: 150 }, (_, i) => ({
      userId: `user_${i}`,
      action: ['view', 'click', 'apply', 'shortlist'][Math.floor(Math.random() * 4)] as any,
      candidateId: `candidate_${i}`,
      jobId: 'job_1',
      score: Math.random() * 100,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      sessionId: `session_${i}`
    })),
    conversionMetrics: {
      viewToClick: 0.25,
      clickToApply: 0.15,
      applyToInterview: 0.30,
      interviewToHire: 0.40,
      overallConversion: 0.045
    },
    recommendationTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recommendations: Math.floor(Math.random() * 50) + 20,
      interactions: Math.floor(Math.random() * 30) + 10,
      conversions: Math.floor(Math.random() * 8) + 2
    })),
    biasMetrics: {
      genderBias: 0.02,
      ageBias: 0.01,
      locationBias: 0.03,
      educationBias: 0.02,
      experienceBias: 0.01
    }
  };
};

export default RecommendationAnalyticsDashboard;

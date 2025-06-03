/**
 * Chart Enhancement Utilities for TalentSol Dashboard
 * Frontend-only data processing and analytics calculations
 * Maintains API compatibility while adding visual and analytical enhancements
 */

// Types for enhanced chart data
export interface EnhancedChartData {
  original: any;
  insights: ChartInsights;
  visualEnhancements: VisualEnhancements;
}

export interface ChartInsights {
  trends: TrendAnalysis;
  conversions: ConversionRates;
  rankings: RankingData;
  anomalies: AnomalyDetection[];
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
  significance: 'high' | 'medium' | 'low';
}

export interface ConversionRates {
  applicationToInterview: number;
  interviewToOffer: number;
  overallConversion: number;
}

export interface RankingData {
  topPerformers: Array<{ name: string; value: number; rank: number }>;
  bottomPerformers: Array<{ name: string; value: number; rank: number }>;
}

export interface AnomalyDetection {
  type: 'spike' | 'drop' | 'unusual_pattern';
  severity: 'high' | 'medium' | 'low';
  description: string;
  date?: string;
  value?: number;
}

export interface VisualEnhancements {
  colors: string[];
  gradients: string[];
  highlights: string[];
  patterns: string[];
}

/**
 * Calculate conversion rates from pipeline data
 * Frontend-only processing of existing API data
 */
export const calculateConversionRates = (pipelineData: any): ConversionRates => {
  if (!pipelineData || !pipelineData.applications || !pipelineData.interviews || !pipelineData.offers) {
    return { applicationToInterview: 0, interviewToOffer: 0, overallConversion: 0 };
  }

  const totalApplications = pipelineData.applications.reduce((sum: number, day: any) => sum + (day.count || 0), 0);
  const totalInterviews = pipelineData.interviews.reduce((sum: number, day: any) => sum + (day.count || 0), 0);
  const totalOffers = pipelineData.offers.reduce((sum: number, day: any) => sum + (day.count || 0), 0);

  const applicationToInterview = totalApplications > 0 ? (totalInterviews / totalApplications) * 100 : 0;
  const interviewToOffer = totalInterviews > 0 ? (totalOffers / totalInterviews) * 100 : 0;
  const overallConversion = totalApplications > 0 ? (totalOffers / totalApplications) * 100 : 0;

  return {
    applicationToInterview: Math.round(applicationToInterview * 10) / 10,
    interviewToOffer: Math.round(interviewToOffer * 10) / 10,
    overallConversion: Math.round(overallConversion * 10) / 10
  };
};

/**
 * Analyze trends in time-series data
 * Client-side trend detection without backend dependencies
 */
export const analyzeTrends = (data: Array<{ date: string; count: number }>, metric: string): TrendAnalysis => {
  if (!data || data.length < 2) {
    return { direction: 'stable', percentage: 0, period: 'insufficient data', significance: 'low' };
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
  const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.count, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.count, 0) / secondHalf.length;

  const percentageChange = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  const direction = percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'stable';
  const significance = Math.abs(percentageChange) > 20 ? 'high' : Math.abs(percentageChange) > 10 ? 'medium' : 'low';

  return {
    direction,
    percentage: Math.round(Math.abs(percentageChange) * 10) / 10,
    period: `${data.length} days`,
    significance
  };
};

/**
 * Generate ranking data for source effectiveness
 * Frontend sorting and ranking without API changes
 */
export const generateRankings = (sourceData: Array<{ source: string; applications: number }>): RankingData => {
  if (!sourceData || sourceData.length === 0) {
    return { topPerformers: [], bottomPerformers: [] };
  }

  const sortedData = [...sourceData]
    .sort((a, b) => (b.applications || 0) - (a.applications || 0))
    .map((item, index) => ({
      name: item.source,
      value: item.applications || 0,
      rank: index + 1
    }));

  const topPerformers = sortedData.slice(0, 3);
  const bottomPerformers = sortedData.slice(-3).reverse();

  return { topPerformers, bottomPerformers };
};

/**
 * Detect anomalies in data patterns
 * Statistical analysis for unusual patterns
 */
export const detectAnomalies = (data: Array<{ date: string; count: number }>, metric: string): AnomalyDetection[] => {
  if (!data || data.length < 5) return [];

  const values = data.map(item => item.count);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const anomalies: AnomalyDetection[] = [];

  data.forEach((item, index) => {
    const zScore = stdDev > 0 ? Math.abs(item.count - mean) / stdDev : 0;
    
    if (zScore > 2.5) { // 2.5 standard deviations
      const severity = zScore > 3 ? 'high' : zScore > 2.8 ? 'medium' : 'low';
      const type = item.count > mean ? 'spike' : 'drop';
      
      anomalies.push({
        type,
        severity,
        description: `Unusual ${type} in ${metric}: ${item.count} (${zScore.toFixed(1)}σ from mean)`,
        date: item.date,
        value: item.count
      });
    }
  });

  return anomalies;
};

/**
 * Generate enhanced color schemes based on data values
 * Dynamic color generation for better visual hierarchy
 */
export const generateEnhancedColors = (data: any[], valueKey: string = 'value'): VisualEnhancements => {
  if (!data || data.length === 0) {
    return {
      colors: ['#3B82F6'],
      gradients: ['#3B82F6'],
      highlights: ['#1E40AF'],
      patterns: ['solid']
    };
  }

  const values = data.map(item => item[valueKey] || 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const colors = data.map((item, index) => {
    const value = item[valueKey] || 0;
    const intensity = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0.5;
    
    // Blue gradient based on value intensity
    if (intensity > 0.8) return '#1E40AF'; // Dark blue
    if (intensity > 0.6) return '#2563EB'; // Strong blue
    if (intensity > 0.4) return '#3B82F6'; // Medium blue
    if (intensity > 0.2) return '#60A5FA'; // Light blue
    return '#93C5FD'; // Lightest blue
  });

  return {
    colors,
    gradients: colors.map(color => `linear-gradient(135deg, ${color}, ${color}dd)`),
    highlights: colors.map(color => color.replace('AF', 'FF')),
    patterns: data.map((_, index) => index === 0 ? 'solid' : index === 1 ? 'dashed' : 'dotted')
  };
};

/**
 * Format dates for better chart readability
 * Intelligent date formatting based on data range
 */
export const formatChartDates = (dates: string[]): string[] => {
  if (!dates || dates.length === 0) return [];

  const dateObjects = dates.map(date => new Date(date));
  const daysDiff = (dateObjects[dateObjects.length - 1].getTime() - dateObjects[0].getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff <= 7) {
    // Show day names for week or less
    return dates.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
  } else if (daysDiff <= 31) {
    // Show month/day for month or less
    return dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  } else {
    // Show month/year for longer periods
    return dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
  }
};

/**
 * Calculate period-over-period comparisons
 * Frontend analytics without backend changes
 */
export const calculatePeriodComparison = (currentData: any[], previousData: any[], metric: string) => {
  const currentTotal = currentData.reduce((sum, item) => sum + (item[metric] || 0), 0);
  const previousTotal = previousData.reduce((sum, item) => sum + (item[metric] || 0), 0);
  
  const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
  
  return {
    current: currentTotal,
    previous: previousTotal,
    change: Math.round(change * 10) / 10,
    direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
  };
};

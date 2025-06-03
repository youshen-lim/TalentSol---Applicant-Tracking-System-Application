import React, { useState, useEffect } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Unified chart data type that supports both implementations
export interface BarChartData {
  name: string;
  value?: number;
  [key: string]: any; // Allow for additional data properties
}

// Bar configuration type from the new implementation
export interface BarConfig {
  dataKey: string;
  fill: string;
  name: string;
}

// Comprehensive props interface that combines both implementations
export interface BarChartProps {
  // Common props
  title?: string;
  description?: string;
  data: BarChartData[];
  className?: string;

  // Original implementation props
  categories?: string[];
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number | string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;

  // New implementation props
  bars?: BarConfig[];
  vertical?: boolean;
}

// Enhanced gradient color palette for better visual hierarchy
const defaultColors = ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

// Generate gradient colors based on data values
const generateGradientColors = (data: BarChartData[], dataKey: string = 'value') => {
  if (!data || data.length === 0) return defaultColors;

  const values = data.map(item => item[dataKey] || 0).filter(val => typeof val === 'number');
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  return data.map((item, index) => {
    const value = item[dataKey] || 0;
    const intensity = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0.5;

    // Generate blue gradient from light to dark based on value
    if (intensity > 0.8) return '#1E40AF'; // Dark blue for highest values
    if (intensity > 0.6) return '#2563EB'; // Strong blue
    if (intensity > 0.4) return '#3B82F6'; // Medium blue
    if (intensity > 0.2) return '#60A5FA'; // Light blue
    return '#93C5FD'; // Lightest blue for lowest values
  });
};

export const BarChart: React.FC<BarChartProps> = ({
  // Common props
  title,
  description,
  data,
  className,

  // Original implementation props
  categories = ['value'],
  colors = defaultColors,
  xAxisLabel,
  yAxisLabel,
  height = 300,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  valueFormatter = (value: number) => value.toString(),

  // New implementation props
  bars,
  vertical = false,
}) => {
  // Responsive configuration hook
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('sm');
      } else if (width < 1024) {
        setScreenSize('md');
      } else {
        setScreenSize('lg');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Responsive configuration
  const getResponsiveConfig = () => {
    switch (screenSize) {
      case 'sm':
        return {
          yAxisWidth: 90,
          leftMargin: 110,
          maxLabelLength: 10,
          fontSize: 12
        };
      case 'md':
        return {
          yAxisWidth: 105,
          leftMargin: 125,
          maxLabelLength: 14,
          fontSize: 13
        };
      default:
        return {
          yAxisWidth: 120,
          leftMargin: 140,
          maxLabelLength: 18,
          fontSize: 14
        };
    }
  };

  const config = getResponsiveConfig();

  // Enhanced interactive tooltip with percentage and ranking
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value as number;
      const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
      const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0';

      // Calculate ranking
      const sortedData = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
      const rank = sortedData.findIndex(item => item.name === label) + 1;

      return (
        <div className="bg-white p-4 border border-gray-300 shadow-xl rounded-lg min-w-[220px]">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-900 text-base">{label}</p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              #{rank} of {data.length}
            </span>
          </div>

          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-700 text-sm font-medium">
                    {entry.name}
                  </span>
                </div>
                <span className="text-gray-900 text-lg font-bold">
                  {valueFormatter(entry.value as number)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Percentage of total</span>
                <span className="font-semibold">{percentage}%</span>
              </div>

              {/* Progress bar showing relative value */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Y-axis tick component for single-line labels
  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    let displayText = payload.value;

    // Truncate long text and add ellipsis based on screen size
    if (displayText.length > config.maxLabelLength) {
      displayText = displayText.substring(0, config.maxLabelLength - 3) + '...';
    }

    return (
      <text
        x={x - 8}
        y={y}
        fill="#475569"
        fontSize={config.fontSize}
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        fontWeight="400"
        textAnchor="end"
        dominantBaseline="middle"
      >
        {displayText}
      </text>
    );
  };

  // Enhanced bar rendering with gradient colors and data labels
  const getBars = () => {
    // Custom label component for displaying values on bars
    const CustomLabel = (props: any) => {
      const { x, y, width, height, value } = props;
      const labelX = vertical ? x + width + 5 : x + width / 2;
      const labelY = vertical ? y + height / 2 : y - 5;

      return (
        <text
          x={labelX}
          y={labelY}
          fill="#374151"
          textAnchor={vertical ? "start" : "middle"}
          dominantBaseline={vertical ? "middle" : "auto"}
          fontSize={config.fontSize}
          fontWeight="400"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        >
          {valueFormatter(value)}
        </text>
      );
    };

    // If bars prop is provided, use it with enhancements
    if (bars && bars.length > 0) {
      const gradientColors = generateGradientColors(data, bars[0]?.dataKey || 'value');

      return bars.map((bar, index) => (
        <Bar
          key={`bar-${bar.dataKey}`}
          dataKey={bar.dataKey}
          name={bar.name}
          fill={bar.fill}
          radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          barSize={vertical ? 12 : 30}
          label={<CustomLabel />}
        />
      ));
    }

    // Enhanced default bar rendering with gradient colors
    const gradientColors = generateGradientColors(data, categories[0] || 'value');

    return categories.map((category, index) => (
      <Bar
        key={`bar-${category}`}
        dataKey={category}
        name={category}
        fill={colors[index % colors.length]}
        radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
        barSize={vertical ? 12 : 30}
        label={<CustomLabel />}
      />
    ));
  };

  return (
    <Card className={cn("w-full h-full", className)}>
      {(title || description) && (
        <CardHeader className="pb-3 px-6 pt-6">
          {title && <CardTitle className="text-lg font-semibold text-slate-900 text-center">{title}</CardTitle>}
          {description && <CardDescription className="text-sm text-slate-600 mt-1 text-center">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="pt-0 px-6 pb-6">
        <div className="flex justify-center items-center w-full" style={{ height: typeof height === 'number' ? `${height - 100}px` : 'calc(100% - 100px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              layout={vertical ? "vertical" : "horizontal"}
              margin={{
                top: 20,
                right: vertical ? 50 : 30,
                left: vertical ? config.leftMargin : 30,
                bottom: 40,
              }}
              barCategoryGap={vertical ? "35%" : "8%"}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={!vertical} />}

              {vertical ? (
                <>
                  <XAxis
                    type="number"
                    tick={{ fontSize: config.fontSize, fill: '#475569', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={valueFormatter}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={<CustomYAxisTick />}
                    tickLine={{ stroke: '#e2e8f0' }}
                    width={config.yAxisWidth}
                    axisLine={{ stroke: '#e2e8f0' }}
                    interval={0}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 14, fill: '#475569', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    height={35}
                    label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 14, fill: '#475569', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 } } : undefined}
                  />
                  <YAxis
                    tick={{ fontSize: 14, fill: '#475569', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={valueFormatter}
                    width={40}
                    label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 14, fill: '#475569', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 } } : undefined}
                  />
                </>
              )}

              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && (
                <Legend
                  wrapperStyle={{
                    paddingTop: 12,
                    fontSize: config.fontSize,
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 400,
                    color: '#475569',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px'
                  }}
                  align="center"
                  verticalAlign="bottom"
                />
              )}

              {getBars()}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChart;

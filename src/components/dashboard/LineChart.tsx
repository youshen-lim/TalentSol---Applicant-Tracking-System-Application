import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
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

export interface LineChartData {
  name: string;
  [key: string]: any; // Allow for additional data properties
}

// Line configuration type for the new implementation
export interface LineConfig {
  dataKey: string;
  stroke: string;
  name: string;
}

export interface LineChartProps {
  title?: string;
  description?: string;
  data: LineChartData[];
  // Original implementation props
  categories?: string[];
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  height?: number | string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showDots?: boolean;
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: string) => string;
  strokeWidth?: number;
  // New implementation props
  lines?: LineConfig[];
}

// Enhanced accessible color palette for better differentiation
const defaultColors = ['#2563EB', '#DC2626', '#059669', '#7C3AED', '#EA580C'];

// Accessible color scheme for recruitment pipeline
const recruitmentColors = {
  applications: '#2563EB', // Strong Blue
  interviews: '#DC2626',   // Strong Red
  offers: '#059669'        // Strong Green
};

export const LineChart: React.FC<LineChartProps> = ({
  title,
  description,
  data,
  categories = [],
  colors = defaultColors,
  xAxisLabel,
  yAxisLabel,
  className,
  height = 300,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showDots = true,
  valueFormatter = (value: number) => value.toString(),
  dateFormatter = (date: string) => date,
  strokeWidth = 2,
  lines,
}) => {
  // Enhanced interactive tooltip with better formatting
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 shadow-xl rounded-lg min-w-[200px]">
          <p className="font-bold text-gray-900 text-base mb-3 border-b border-gray-100 pb-2">
            {dateFormatter(label)}
          </p>
          {payload
            .sort((a, b) => (b.value as number) - (a.value as number)) // Sort by value descending
            .map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-700 text-sm font-medium">
                  {entry.name}
                </span>
              </div>
              <span className="text-gray-900 text-sm font-bold">
                {valueFormatter(entry.value as number)}
              </span>
            </div>
          ))}
          {/* Add conversion rates if multiple metrics */}
          {payload.length > 1 && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Conversion: {payload.length > 1 && payload[1].value && payload[0].value ?
                  `${((payload[1].value as number) / (payload[0].value as number) * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Enhanced line rendering with better visual differentiation
  const getLines = () => {
    // If lines prop is provided, use it directly with enhancements
    if (lines && lines.length > 0) {
      return lines.map((line, index) => {
        // Enhanced stroke patterns for better differentiation
        const strokeDashArray = index === 0 ? "0" : index === 1 ? "5,5" : "10,5";
        const enhancedStrokeWidth = index === 0 ? strokeWidth + 1 : strokeWidth;

        return (
          <Line
            key={`line-${line.dataKey}`}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.stroke}
            strokeWidth={3}
            strokeDasharray={strokeDashArray}
            activeDot={{
              r: 6,
              stroke: line.stroke,
              strokeWidth: 2,
              fill: '#ffffff',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
            }}
            dot={showDots ? {
              r: 3,
              stroke: line.stroke,
              strokeWidth: 2,
              fill: '#ffffff'
            } : false}
          />
        );
      });
    }

    // Enhanced default line rendering
    return categories.map((category, index) => {
      const strokeDashArray = index === 0 ? "0" : index === 1 ? "5,5" : "10,5";
      const enhancedStrokeWidth = index === 0 ? strokeWidth + 1 : strokeWidth;

      return (
        <Line
          key={`line-${category}`}
          type="monotone"
          dataKey={category}
          stroke={colors[index % colors.length]}
          strokeWidth={3}
          strokeDasharray={strokeDashArray}
          activeDot={{
            r: 6,
            stroke: colors[index % colors.length],
            strokeWidth: 2,
            fill: '#ffffff',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
          }}
          dot={showDots ? {
            r: 3,
            stroke: colors[index % colors.length],
            strokeWidth: 2,
            fill: '#ffffff'
          } : false}
          name={category}
        />
      );
    });
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
            <RechartsLineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 30,
                bottom: 40,
              }}
            >
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />}
            <XAxis
              dataKey="name"
              tick={{ fill: '#475569', fontSize: 14, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
              tickLine={{ stroke: '#e2e8f0' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={dateFormatter}
              height={35}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 14, fill: '#475569', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 } } : undefined}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 14, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}
              tickLine={{ stroke: '#e2e8f0' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => Math.round(value).toString()} // Force whole numbers
              width={40}
              domain={[0, 'dataMax + 1']} // Start from 0, add padding at top
              allowDecimals={false} // Prevent decimal values
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 14, fill: '#475569', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 } } : undefined}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: 12,
                  fontSize: 14,
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 400,
                  color: '#475569',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px'
                }}
                iconType="line"
                align="center"
                verticalAlign="bottom"
              />
            )}

            {getLines()}
          </RechartsLineChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChart;

import React from 'react';
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

const defaultColors = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

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
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">
                {entry.name}: {valueFormatter(entry.value as number)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Determine which bar configuration to use
  const getBars = () => {
    // If bars prop is provided, use it directly
    if (bars && bars.length > 0) {
      return bars.map((bar, index) => (
        <Bar
          key={`bar-${bar.dataKey}`}
          dataKey={bar.dataKey}
          name={bar.name}
          fill={bar.fill}
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      ));
    }

    // Otherwise, use the categories and colors props
    return categories.map((category, index) => (
      <Bar
        key={`bar-${category}`}
        dataKey={category}
        name={category}
        fill={colors[index % colors.length]}
        radius={[4, 4, 0, 0]}
        barSize={30}
      />
    ));
  };

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className={cn(height === 300 ? "h-[300px]" : "", typeof height === 'string' ? height : `h-[${height}px]`)}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              layout={vertical ? "vertical" : "horizontal"}
              margin={{
                top: 10,
                right: 30,
                left: vertical ? 100 : 20,
                bottom: 40,
              }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={!vertical} />}

              {vertical ? (
                <>
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={valueFormatter}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    width={100}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -15 } : undefined}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={valueFormatter}
                    label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                  />
                </>
              )}

              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend wrapperStyle={{ paddingTop: 10 }} />}

              {getBars()}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChart;

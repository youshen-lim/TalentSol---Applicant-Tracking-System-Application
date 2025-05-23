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

const defaultColors = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

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
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium text-gray-900">{dateFormatter(label)}</p>
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

  // Determine which line configuration to use
  const getLines = () => {
    // If lines prop is provided, use it directly
    if (lines && lines.length > 0) {
      return lines.map((line, index) => (
        <Line
          key={`line-${line.dataKey}`}
          type="monotone"
          dataKey={line.dataKey}
          name={line.name}
          stroke={line.stroke}
          strokeWidth={strokeWidth}
          activeDot={{ r: 8 }}
          dot={showDots}
        />
      ));
    }

    // Otherwise, use the categories and colors props
    return categories.map((category, index) => (
      <Line
        key={`line-${category}`}
        type="monotone"
        dataKey={category}
        stroke={colors[index % colors.length]}
        strokeWidth={strokeWidth}
        activeDot={{ r: 6 }}
        dot={showDots}
        name={category}
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
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 40,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
            <XAxis
              dataKey="name"
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#E5E7EB' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={dateFormatter}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -15 } : undefined}
            />
            <YAxis
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#E5E7EB' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={valueFormatter}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend wrapperStyle={{ paddingTop: 10 }} />}

            {getLines()}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LineChart;

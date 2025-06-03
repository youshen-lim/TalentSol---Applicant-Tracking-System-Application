import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, ArrowRightIcon, LucideIcon, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon | ReactNode;
  description?: string;
  trend?: number;
  trendLabel?: string;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  trendClassName?: string;
  iconColor?: string;
  onClick?: () => void;
  tooltip?: string;
  change?: {
    value: number;
    positive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  className,
  iconClassName,
  valueClassName,
  trendClassName,
  iconColor = '#3B82F6', // Default to blue
  onClick,
  tooltip,
  change,
}) => {
  // Determine trend direction and styling
  const getTrendIcon = () => {
    if (!trend || trend === 0) return <ArrowRightIcon className="h-4 w-4 text-gray-500" />;
    return trend > 0 ? (
      <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-emerald-500' : 'text-red-500';
  };

  const formatTrend = (value: number) => {
    const absValue = Math.abs(value);
    return `${absValue}%`;
  };

  // Determine which layout to use based on provided props
  const useNewLayout = tooltip !== undefined || change !== undefined;

  // New layout
  if (useNewLayout) {
    return (
      <Card className={cn("bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300", className)} onClick={onClick}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && typeof Icon !== 'function' && <div className="flex-shrink-0">{Icon}</div>}
              {Icon && typeof Icon === 'function' && (
                <div className="flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <CardTitle className="text-base font-semibold text-slate-700">
                {title}
              </CardTitle>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60 text-sm">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between items-end">
            <div className="min-w-0 flex-1">
              <div className={cn("text-3xl font-bold text-slate-900 tracking-tight", valueClassName)}>{value}</div>
              {description && (
                <p className="text-sm mt-1 text-slate-600">
                  {description}
                </p>
              )}
            </div>
            {change && (
              <div
                className={cn(
                  "text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm",
                  change.positive
                    ? "text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                    : "text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200"
                )}
              >
                {change.positive ? "+" : ""}
                {change.value}%
              </div>
            )}
            {typeof trend !== 'undefined' && !change && (
              <div
                className={cn(
                  "flex items-center text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm",
                  trend > 0 ? "text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200" :
                  trend < 0 ? "text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200" :
                  "text-gray-600 bg-gray-50 border border-gray-200",
                  trendClassName
                )}
              >
                {getTrendIcon()}
                <span className="ml-1">
                  {formatTrend(trend)} {trendLabel || ''}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Original layout
  return (
    <Card
      className={cn(
        "bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300",
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {Icon && typeof Icon !== 'function' && <div className="flex-shrink-0">{Icon}</div>}
            {Icon && typeof Icon === 'function' && (
              <div className="flex-shrink-0">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <p className="text-base font-semibold text-slate-700">{title}</p>
          </div>
          <div>
            <h3
              className={cn(
                "text-2xl font-bold tracking-tight text-slate-900",
                valueClassName
              )}
            >
              {value}
            </h3>
            {description && (
              <p className="text-sm mt-1 text-slate-600">{description}</p>
            )}
            {typeof trend !== 'undefined' && (
              <div
                className={cn(
                  "flex items-center mt-2 text-xs font-medium",
                  getTrendColor(),
                  trendClassName
                )}
              >
                {getTrendIcon()}
                <span className="ml-1">
                  {formatTrend(trend)} {trendLabel || ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Predefined variants for common stats
export const RevenueCard: React.FC<Omit<StatCardProps, 'title'>> = (props) => (
  <StatCard title="Revenue" {...props} />
);

export const UsersCard: React.FC<Omit<StatCardProps, 'title'>> = (props) => (
  <StatCard title="Users" {...props} />
);

export const OrdersCard: React.FC<Omit<StatCardProps, 'title'>> = (props) => (
  <StatCard title="Orders" {...props} />
);

export const ConversionCard: React.FC<Omit<StatCardProps, 'title'>> = (props) => (
  <StatCard title="Conversion Rate" {...props} />
);

// ATS-specific stat cards
export const CandidatesCard: React.FC<Omit<StatCardProps, 'title'>> = (props) => (
  <StatCard title="Candidates" {...props} />
);

export const InterviewsCard: React.FC<Omit<StatCardProps, 'title'>> = (props) => (
  <StatCard title="Interviews" {...props} />
);

export const HiresCard: React.FC<Omit<StatCardProps, 'title'>> = (props) => (
  <StatCard title="Hires" {...props} />
);

export const TimeToHireCard: React.FC<Omit<StatCardProps, 'title'>> = (props) => (
  <StatCard title="Time to Hire" {...props} />
);

export default StatCard;

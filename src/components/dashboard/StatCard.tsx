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
      <Card className={cn("", className)} onClick={onClick}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium text-gray-500">
                {title}
              </CardTitle>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60 text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {Icon && typeof Icon !== 'function' && <div>{Icon}</div>}
            {Icon && typeof Icon === 'function' && (
              <div
                className={cn(
                  "p-2 rounded-full",
                  `bg-${iconColor.replace('#', '')}/10`,
                  iconClassName
                )}
                style={{ backgroundColor: `${iconColor}10` }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: iconColor }}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <div>
              <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
              {description && (
                <CardDescription className="text-xs mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
            {change && (
              <div
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  change.positive
                    ? "text-green-700 bg-green-50"
                    : "text-red-700 bg-red-50"
                )}
              >
                {change.positive ? "+" : ""}
                {change.value}%
              </div>
            )}
            {typeof trend !== 'undefined' && !change && (
              <div
                className={cn(
                  "flex items-center text-xs font-medium",
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
        </CardContent>
      </Card>
    );
  }

  // Original layout
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3
              className={cn(
                "text-2xl font-bold tracking-tight text-gray-900",
                valueClassName
              )}
            >
              {value}
            </h3>
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
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
          {Icon && typeof Icon === 'function' && (
            <div
              className={cn(
                "p-2 rounded-full",
                `bg-${iconColor.replace('#', '')}/10`,
                iconClassName
              )}
              style={{ backgroundColor: `${iconColor}10` }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: iconColor }}
              />
            </div>
          )}
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

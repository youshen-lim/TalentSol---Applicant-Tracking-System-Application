import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  Brain,
  Zap,
  Users,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface FilterState {
  search: string;
  status: string[];
  scoreRange: [number, number];
  confidenceRange: [number, number];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  jobPositions: string[];
}

interface AdvancedApplicationFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableStatuses: string[];
  availableJobPositions: string[];
  className?: string;
}

export const AdvancedApplicationFilters: React.FC<AdvancedApplicationFiltersProps> = ({
  filters,
  onFiltersChange,
  availableStatuses,
  availableJobPositions,
  className
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      scoreRange: [0, 100],
      confidenceRange: [0, 100],
      dateRange: { from: undefined, to: undefined },
      jobPositions: []
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) count++;
    if (filters.confidenceRange[0] > 0 || filters.confidenceRange[1] < 100) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.jobPositions.length > 0) count++;
    return count;
  };

  const removeStatusFilter = (status: string) => {
    updateFilters({
      status: filters.status.filter(s => s !== status)
    });
  };

  const removeJobPositionFilter = (position: string) => {
    updateFilters({
      jobPositions: filters.jobPositions.filter(p => p !== position)
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search candidates, positions, or skills..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="ats-blue" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-section-header text-slate-900">Advanced Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Clear All
                </Button>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!filters.status.includes(value)) {
                      updateFilters({ status: [...filters.status, value] });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Job Position Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Job Position</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!filters.jobPositions.includes(value)) {
                      updateFilters({ jobPositions: [...filters.jobPositions, value] });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableJobPositions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AI Score Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <label className="text-sm font-medium text-slate-700">AI Score Range</label>
                </div>
                <div className="px-2">
                  <Slider
                    value={filters.scoreRange}
                    onValueChange={(value) => updateFilters({ scoreRange: value as [number, number] })}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{filters.scoreRange[0]}</span>
                    <span>{filters.scoreRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Confidence Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <label className="text-sm font-medium text-slate-700">Confidence Range</label>
                </div>
                <div className="px-2">
                  <Slider
                    value={filters.confidenceRange}
                    onValueChange={(value) => updateFilters({ confidenceRange: value as [number, number] })}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{filters.confidenceRange[0]}%</span>
                    <span>{filters.confidenceRange[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Application Date</label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                            {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange.from}
                      selected={filters.dateRange}
                      onSelect={(range) => updateFilters({ dateRange: range || { from: undefined, to: undefined } })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status.map((status) => (
            <Badge key={status} variant="ats-blue-subtle" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <button
                onClick={() => removeStatusFilter(status)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.jobPositions.map((position) => (
            <Badge key={position} variant="ats-purple-subtle" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {position}
              <button
                onClick={() => removeJobPositionFilter(position)}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {(filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) && (
            <Badge variant="ats-blue-subtle" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Score: {filters.scoreRange[0]}-{filters.scoreRange[1]}
              <button
                onClick={() => updateFilters({ scoreRange: [0, 100] })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(filters.confidenceRange[0] > 0 || filters.confidenceRange[1] < 100) && (
            <Badge variant="ats-purple-subtle" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Confidence: {filters.confidenceRange[0]}%-{filters.confidenceRange[1]}%
              <button
                onClick={() => updateFilters({ confidenceRange: [0, 100] })}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {filters.dateRange.from && format(filters.dateRange.from, "MMM dd")}
              {filters.dateRange.from && filters.dateRange.to && " - "}
              {filters.dateRange.to && format(filters.dateRange.to, "MMM dd")}
              <button
                onClick={() => updateFilters({ dateRange: { from: undefined, to: undefined } })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

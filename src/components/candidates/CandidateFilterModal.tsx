import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Filter, X, Star, Save, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export interface FilterOptions {
  jobPosition: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  rating: number | null;
  skills: string[];
  sources: string[];
  stages: string[];
  lastActivity: string;
}

interface CandidateFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const jobPositions = [
  { value: 'all', label: 'All Positions' },
  { value: 'frontend-developer', label: 'Frontend Developer' },
  { value: 'backend-developer', label: 'Backend Developer' },
  { value: 'fullstack-developer', label: 'Fullstack Developer' },
  { value: 'ux-designer', label: 'UX Designer' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'devops-engineer', label: 'DevOps Engineer' },
  { value: 'marketing-lead', label: 'Marketing Lead' },
];

const candidateSources = [
  'LinkedIn',
  'Indeed',
  'Company Website',
  'Employee Referral',
  'Job Board',
  'Recruiter',
  'University',
  'Career Fair',
  'Other'
];

const candidateStages = [
  'Applied',
  'Screening',
  'Interview',
  'Assessment',
  'Offer',
  'Rejected'
];

const commonSkills = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go',
  'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git',
  'SQL', 'MongoDB', 'PostgreSQL', 'Redis',
  'UI/UX Design', 'Figma', 'Adobe Creative Suite',
  'Product Management', 'Agile', 'Scrum',
  'Data Analysis', 'Machine Learning', 'AI',
  'Marketing', 'Sales', 'Content Writing'
];

const lastActivityOptions = [
  { value: 'all', label: 'All Time' },
  { value: '1d', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '1w', label: 'Last week' },
  { value: '2w', label: 'Last 2 weeks' },
  { value: '1m', label: 'Last month' },
  { value: '3m', label: 'Last 3 months' },
];

export const CandidateFilterModal: React.FC<CandidateFilterModalProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const { toast } = useToast();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = localFilters.skills;
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    updateFilter('skills', newSkills);
  };

  const toggleSource = (source: string) => {
    const currentSources = localFilters.sources;
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];
    updateFilter('sources', newSources);
  };

  const toggleStage = (stage: string) => {
    const currentStages = localFilters.stages;
    const newStages = currentStages.includes(stage)
      ? currentStages.filter(s => s !== stage)
      : [...currentStages, stage];
    updateFilter('stages', newStages);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
    
    const activeFiltersCount = [
      localFilters.jobPosition !== 'all',
      localFilters.dateRange.from || localFilters.dateRange.to,
      localFilters.rating !== null,
      localFilters.skills.length > 0,
      localFilters.sources.length > 0,
      localFilters.stages.length > 0,
      localFilters.lastActivity !== 'all'
    ].filter(Boolean).length;

    if (activeFiltersCount > 0) {
      toast.atsBlue({
        title: "Filters applied",
        description: `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied to candidate search`,
      });
    }
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      jobPosition: 'all',
      dateRange: { from: undefined, to: undefined },
      rating: null,
      skills: [],
      sources: [],
      stages: [],
      lastActivity: 'all'
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    
    toast.atsBlue({
      title: "Filters cleared",
      description: "All filters have been reset",
    });
  };

  const renderStarRating = (rating: number | null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
            onClick={() => updateFilter('rating', rating === star ? null : star)}
          >
            <Star
              className={cn(
                "h-4 w-4",
                rating && star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-ats-blue" />
            Advanced Filters
          </DialogTitle>
          <DialogDescription>
            Filter candidates by position, skills, activity, and more
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Job Position */}
            <div className="space-y-2">
              <Label htmlFor="job-position">Job Position</Label>
              <Select 
                value={localFilters.jobPosition} 
                onValueChange={(value) => updateFilter('jobPosition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {jobPositions.map((position) => (
                    <SelectItem key={position.value} value={position.value}>
                      {position.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Application Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !localFilters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange.from ? format(localFilters.dateRange.from, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateRange.from}
                      onSelect={(date) => updateFilter('dateRange', { 
                        ...localFilters.dateRange, 
                        from: date 
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !localFilters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange.to ? format(localFilters.dateRange.to, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateRange.to}
                      onSelect={(date) => updateFilter('dateRange', { 
                        ...localFilters.dateRange, 
                        to: date 
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              {renderStarRating(localFilters.rating)}
              {localFilters.rating && (
                <p className="text-sm text-gray-500">
                  Showing candidates with {localFilters.rating}+ stars
                </p>
              )}
            </div>

            {/* Last Activity */}
            <div className="space-y-2">
              <Label htmlFor="last-activity">Last Activity</Label>
              <Select 
                value={localFilters.lastActivity} 
                onValueChange={(value) => updateFilter('lastActivity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {lastActivityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills & Technologies</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                <div className="grid grid-cols-2 gap-2">
                  {commonSkills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={localFilters.skills.includes(skill)}
                        onCheckedChange={() => toggleSkill(skill)}
                      />
                      <Label htmlFor={`skill-${skill}`} className="text-sm">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {localFilters.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {localFilters.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Candidate Sources */}
            <div className="space-y-2">
              <Label>Candidate Sources</Label>
              <div className="grid grid-cols-2 gap-2">
                {candidateSources.map((source) => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${source}`}
                      checked={localFilters.sources.includes(source)}
                      onCheckedChange={() => toggleSource(source)}
                    />
                    <Label htmlFor={`source-${source}`} className="text-sm">
                      {source}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="space-y-2">
              <Label>Pipeline Stages</Label>
              <div className="grid grid-cols-2 gap-2">
                {candidateStages.map((stage) => (
                  <div key={stage} className="flex items-center space-x-2">
                    <Checkbox
                      id={`stage-${stage}`}
                      checked={localFilters.stages.includes(stage)}
                      onCheckedChange={() => toggleStage(stage)}
                    />
                    <Label htmlFor={`stage-${stage}`} className="text-sm">
                      {stage}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyFilters}
              className="bg-ats-blue hover:bg-ats-dark-blue"
            >
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateFilterModal;

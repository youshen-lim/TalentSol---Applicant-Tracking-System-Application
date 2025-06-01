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
import { Textarea } from '@/components/ui/textarea';
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
import { CalendarIcon, Download, FileText, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ExportReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReportConfig {
  type: string;
  format: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  filters: {
    jobPositions: string[];
    candidateStatus: string[];
    departments: string[];
  };
  recipients: string;
  includeCharts: boolean;
  includeDetails: boolean;
}

const reportTypes = [
  { value: 'pipeline', label: 'Candidate Pipeline Report', description: 'Overview of candidates in recruitment pipeline' },
  { value: 'analytics', label: 'Job Performance Analytics', description: 'Metrics on job posting performance and candidate quality' },
  { value: 'interview', label: 'Interview Summary Report', description: 'Summary of interviews and feedback' },
  { value: 'hiring', label: 'Hiring Funnel Analysis', description: 'Analysis of hiring process efficiency' },
  { value: 'custom', label: 'Custom Report Builder', description: 'Build a custom report with selected metrics' },
];

const formatOptions = [
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'excel', label: 'Excel Spreadsheet', icon: FileText },
  { value: 'csv', label: 'CSV File', icon: FileText },
];

const jobPositions = ['Senior Developer', 'UX Designer', 'Product Manager', 'Data Scientist', 'Marketing Lead'];
const candidateStatuses = ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales'];

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    type: '',
    format: 'pdf',
    dateRange: {
      from: undefined,
      to: undefined,
    },
    filters: {
      jobPositions: [],
      candidateStatus: [],
      departments: [],
    },
    recipients: '',
    includeCharts: true,
    includeDetails: true,
  });

  const handleGenerateReport = async () => {
    if (!config.type) {
      toast({
        variant: "destructive",
        title: "Report type required",
        description: "Please select a report type to continue.",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    
    const selectedReportType = reportTypes.find(r => r.value === config.type);
    
    toast.atsBlue({
      title: "Report generated successfully",
      description: `${selectedReportType?.label} has been generated and will download shortly.`,
    });

    // Send email if recipients are specified
    if (config.recipients.trim()) {
      toast.atsBlue({
        title: "Report sent via email",
        description: `Report has been sent to ${config.recipients}`,
      });
    }

    onOpenChange(false);
    
    // Reset form
    setConfig({
      type: '',
      format: 'pdf',
      dateRange: { from: undefined, to: undefined },
      filters: { jobPositions: [], candidateStatus: [], departments: [] },
      recipients: '',
      includeCharts: true,
      includeDetails: true,
    });
  };

  const updateFilter = (filterType: keyof ReportConfig['filters'], value: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: checked 
          ? [...prev.filters[filterType], value]
          : prev.filters[filterType].filter(item => item !== value)
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-ats-blue" />
            Export Report
          </DialogTitle>
          <DialogDescription>
            Configure and generate reports for your recruitment data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={config.type} onValueChange={(value) => setConfig(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((format) => (
                <Button
                  key={format.value}
                  variant={config.format === format.value ? "ats-blue" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, format: format.value }))}
                  className="justify-start"
                >
                  <format.icon className="h-4 w-4 mr-2" />
                  {format.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !config.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {config.dateRange.from ? format(config.dateRange.from, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={config.dateRange.from}
                    onSelect={(date) => setConfig(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, from: date } 
                    }))}
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
                      !config.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {config.dateRange.to ? format(config.dateRange.to, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={config.dateRange.to}
                    onSelect={(date) => setConfig(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, to: date } 
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <Label>Filters (Optional)</Label>
            
            {/* Job Positions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Positions</Label>
              <div className="grid grid-cols-2 gap-2">
                {jobPositions.map((position) => (
                  <div key={position} className="flex items-center space-x-2">
                    <Checkbox
                      id={`position-${position}`}
                      checked={config.filters.jobPositions.includes(position)}
                      onCheckedChange={(checked) => updateFilter('jobPositions', position, checked as boolean)}
                    />
                    <Label htmlFor={`position-${position}`} className="text-sm">{position}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Candidate Status</Label>
              <div className="grid grid-cols-3 gap-2">
                {candidateStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={config.filters.candidateStatus.includes(status)}
                      onCheckedChange={(checked) => updateFilter('candidateStatus', status, checked as boolean)}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm">{status}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Departments</Label>
              <div className="grid grid-cols-2 gap-2">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={config.filters.departments.includes(dept)}
                      onCheckedChange={(checked) => updateFilter('departments', dept, checked as boolean)}
                    />
                    <Label htmlFor={`dept-${dept}`} className="text-sm">{dept}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Options */}
          <div className="space-y-2">
            <Label>Report Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={config.includeCharts}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeCharts: checked as boolean }))}
                />
                <Label htmlFor="include-charts">Include charts and visualizations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-details"
                  checked={config.includeDetails}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeDetails: checked as boolean }))}
                />
                <Label htmlFor="include-details">Include detailed candidate information</Label>
              </div>
            </div>
          </div>

          {/* Email Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Email Recipients (Optional)</Label>
            <div className="flex gap-2">
              <Mail className="h-4 w-4 text-gray-400 mt-3" />
              <Textarea
                id="recipients"
                placeholder="Enter email addresses separated by commas"
                value={config.recipients}
                onChange={(e) => setConfig(prev => ({ ...prev, recipients: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
            className="bg-ats-blue hover:bg-ats-dark-blue"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReportModal;

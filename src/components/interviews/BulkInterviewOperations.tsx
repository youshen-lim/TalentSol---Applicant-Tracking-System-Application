import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  Users, 
  Trash2,
  Mail,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  type: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  status: string;
  notes?: string;
}

interface BulkOperation {
  type: 'reschedule' | 'cancel' | 'send_reminder' | 'export' | 'delete';
  label: string;
  icon: React.ReactNode;
  description: string;
  requiresConfirmation: boolean;
  destructive?: boolean;
}

interface BulkInterviewOperationsProps {
  interviews: Interview[];
  selectedInterviews: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkReschedule: (interviewIds: string[], newDate: string, newTime: string) => void;
  onBulkCancel: (interviewIds: string[], reason: string) => void;
  onBulkSendReminder: (interviewIds: string[], message: string) => void;
  onBulkExport: (interviewIds: string[], format: string) => void;
  onBulkDelete: (interviewIds: string[]) => void;
  loading?: boolean;
}

const BulkInterviewOperations: React.FC<BulkInterviewOperationsProps> = ({
  interviews,
  selectedInterviews,
  onSelectionChange,
  onBulkReschedule,
  onBulkCancel,
  onBulkSendReminder,
  onBulkExport,
  onBulkDelete,
  loading = false
}) => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');

  const bulkOperations: BulkOperation[] = [
    {
      type: 'reschedule',
      label: 'Reschedule',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Reschedule selected interviews to a new date and time',
      requiresConfirmation: true
    },
    {
      type: 'cancel',
      label: 'Cancel',
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Cancel selected interviews and notify candidates',
      requiresConfirmation: true,
      destructive: true
    },
    {
      type: 'send_reminder',
      label: 'Send Reminder',
      icon: <Mail className="h-4 w-4" />,
      description: 'Send reminder emails to candidates',
      requiresConfirmation: false
    },
    {
      type: 'export',
      label: 'Export',
      icon: <Download className="h-4 w-4" />,
      description: 'Export selected interviews to file',
      requiresConfirmation: false
    },
    {
      type: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      description: 'Permanently delete selected interviews',
      requiresConfirmation: true,
      destructive: true
    }
  ];

  // Get selected interview objects
  const selectedInterviewObjects = interviews.filter(interview => 
    selectedInterviews.includes(interview.id)
  );

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedInterviews.length === interviews.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(interviews.map(interview => interview.id));
    }
  }, [interviews, selectedInterviews, onSelectionChange]);

  // Handle individual selection
  const handleIndividualSelection = useCallback((interviewId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedInterviews, interviewId]);
    } else {
      onSelectionChange(selectedInterviews.filter(id => id !== interviewId));
    }
  }, [selectedInterviews, onSelectionChange]);

  // Handle bulk reschedule
  const handleBulkReschedule = useCallback(async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast({
        title: 'Validation Error',
        description: 'Please select both date and time for rescheduling.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onBulkReschedule(selectedInterviews, rescheduleDate, rescheduleTime);
      setActiveOperation(null);
      setRescheduleDate('');
      setRescheduleTime('');
      
      toast({
        title: 'Interviews Rescheduled',
        description: `${selectedInterviews.length} interview(s) have been rescheduled successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reschedule interviews. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedInterviews, rescheduleDate, rescheduleTime, onBulkReschedule]);

  // Handle bulk cancel
  const handleBulkCancel = useCallback(async () => {
    try {
      await onBulkCancel(selectedInterviews, cancelReason);
      setActiveOperation(null);
      setCancelReason('');
      
      toast({
        title: 'Interviews Cancelled',
        description: `${selectedInterviews.length} interview(s) have been cancelled.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel interviews. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedInterviews, cancelReason, onBulkCancel]);

  // Handle bulk send reminder
  const handleBulkSendReminder = useCallback(async () => {
    try {
      await onBulkSendReminder(selectedInterviews, reminderMessage);
      setActiveOperation(null);
      setReminderMessage('');
      
      toast({
        title: 'Reminders Sent',
        description: `Reminder emails sent to ${selectedInterviews.length} candidate(s).`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminders. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedInterviews, reminderMessage, onBulkSendReminder]);

  // Handle bulk export
  const handleBulkExport = useCallback(async () => {
    try {
      await onBulkExport(selectedInterviews, exportFormat);
      setActiveOperation(null);
      
      toast({
        title: 'Export Complete',
        description: `${selectedInterviews.length} interview(s) exported successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export interviews. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedInterviews, exportFormat, onBulkExport]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    try {
      await onBulkDelete(selectedInterviews);
      setActiveOperation(null);
      
      toast({
        title: 'Interviews Deleted',
        description: `${selectedInterviews.length} interview(s) have been deleted permanently.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete interviews. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedInterviews, onBulkDelete]);

  // Render operation dialog content
  const renderOperationDialog = () => {
    switch (activeOperation) {
      case 'reschedule':
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Interviews</DialogTitle>
              <DialogDescription>
                Reschedule {selectedInterviews.length} selected interview(s) to a new date and time.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reschedule-date">New Date</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reschedule-time">New Time</Label>
                  <Input
                    id="reschedule-time"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  All selected interviews will be rescheduled to the same date and time. 
                  Candidates will be notified automatically.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveOperation(null)}>
                Cancel
              </Button>
              <Button onClick={handleBulkReschedule} disabled={loading}>
                Reschedule Interviews
              </Button>
            </DialogFooter>
          </DialogContent>
        );

      case 'cancel':
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Interviews</DialogTitle>
              <DialogDescription>
                Cancel {selectedInterviews.length} selected interview(s) and notify candidates.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Cancellation Reason (Optional)</Label>
                <Input
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Position filled, Interview rescheduled..."
                />
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-800">
                  This action will cancel all selected interviews and send cancellation 
                  notifications to candidates. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveOperation(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBulkCancel} disabled={loading}>
                Cancel Interviews
              </Button>
            </DialogFooter>
          </DialogContent>
        );

      case 'send_reminder':
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Reminder Emails</DialogTitle>
              <DialogDescription>
                Send reminder emails to {selectedInterviews.length} candidate(s).
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-message">Custom Message (Optional)</Label>
                <Input
                  id="reminder-message"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Add a custom message to the reminder email..."
                />
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  Standard reminder emails will be sent with interview details. 
                  Your custom message will be included if provided.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveOperation(null)}>
                Cancel
              </Button>
              <Button onClick={handleBulkSendReminder} disabled={loading}>
                Send Reminders
              </Button>
            </DialogFooter>
          </DialogContent>
        );

      case 'export':
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Interviews</DialogTitle>
              <DialogDescription>
                Export {selectedInterviews.length} selected interview(s) to a file.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  The export will include interview details, candidate information, 
                  and scheduling data for all selected interviews.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveOperation(null)}>
                Cancel
              </Button>
              <Button onClick={handleBulkExport} disabled={loading}>
                Export Data
              </Button>
            </DialogFooter>
          </DialogContent>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Bulk Operations
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selection Summary */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedInterviews.length === interviews.length && interviews.length > 0}
              onCheckedChange={handleSelectAll}
              disabled={loading}
            />
            <span className="text-sm font-medium">
              {selectedInterviews.length} of {interviews.length} interviews selected
            </span>
          </div>
          
          {selectedInterviews.length > 0 && (
            <Badge variant="secondary">
              {selectedInterviews.length} selected
            </Badge>
          )}
        </div>

        {/* Selected Interviews List */}
        {selectedInterviews.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {selectedInterviewObjects.map(interview => (
              <div key={interview.id} className="flex items-center gap-3 p-2 bg-white border rounded">
                <Checkbox
                  checked={true}
                  onCheckedChange={(checked) => handleIndividualSelection(interview.id, checked as boolean)}
                  disabled={loading}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {interview.candidateName} - {interview.position}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(parseISO(interview.scheduledDate), 'PPP p')}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {interview.type}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Operations */}
        {selectedInterviews.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Operations:</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {bulkOperations.map(operation => (
                <div key={operation.type}>
                  {operation.requiresConfirmation && operation.destructive ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant={operation.destructive ? "destructive" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          disabled={loading}
                        >
                          {operation.icon}
                          <span className="ml-2">{operation.label}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {operation.description} This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (operation.type === 'delete') {
                                handleBulkDelete();
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant={operation.destructive ? "destructive" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setActiveOperation(operation.type)}
                          disabled={loading}
                        >
                          {operation.icon}
                          <span className="ml-2">{operation.label}</span>
                        </Button>
                      </DialogTrigger>
                      {renderOperationDialog()}
                    </Dialog>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Selection State */}
        {selectedInterviews.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <CheckSquare className="h-12 w-12 mx-auto mb-4" />
            <p className="text-sm">Select interviews to perform bulk operations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkInterviewOperations;

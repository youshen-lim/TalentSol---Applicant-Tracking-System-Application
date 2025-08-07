import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Mail,
  ChevronDown,
  Users,
  Trash2,
  Archive,
  Star,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkAction {
  type: 'approve' | 'reject' | 'schedule' | 'export' | 'email' | 'archive' | 'delete' | 'status-change';
  payload?: any;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkAction: (action: BulkAction) => void;
  onClearSelection: () => void;
  availableStatuses?: string[];
  className?: string;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onBulkAction,
  onClearSelection,
  availableStatuses = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'],
  className
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();

  if (selectedCount === 0) return null;

  const handleBulkAction = (action: BulkAction) => {
    onBulkAction(action);
    toast({
      title: 'Bulk Action Applied',
      description: `Action applied to ${selectedCount} application${selectedCount > 1 ? 's' : ''}`,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    handleBulkAction({
      type: 'status-change',
      payload: { status: newStatus }
    });
  };

  const handleDelete = () => {
    handleBulkAction({ type: 'delete' });
    setShowDeleteDialog(false);
  };

  const handleReject = () => {
    handleBulkAction({ type: 'reject' });
    setShowRejectDialog(false);
  };

  return (
    <>
      <div className={cn(
        'flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg',
        'animate-in slide-in-from-top-2 duration-200',
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} application{selectedCount > 1 ? 's' : ''} selected
            </span>
            <Badge variant="ats-blue" className="text-xs">
              {selectedCount}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction({ type: 'approve' })}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRejectDialog(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction({ type: 'schedule' })}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                More
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Status Change */}
              <div className="px-2 py-1.5">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Change Status</label>
                <Select onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="text-xs">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleBulkAction({ type: 'email' })}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleBulkAction({ type: 'export' })}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleBulkAction({ type: 'archive' })}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Selection */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="text-slate-500 hover:text-slate-700"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Applications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} application{selectedCount > 1 ? 's' : ''}? 
              This action cannot be undone and will permanently remove the application data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Applications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {selectedCount} application{selectedCount > 1 ? 's' : ''}? 
              This will change the status to "rejected" and notify the candidates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

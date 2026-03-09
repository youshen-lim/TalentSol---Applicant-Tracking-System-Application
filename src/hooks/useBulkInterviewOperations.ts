import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { interviewsApi } from '@/services/api';

interface BulkOperationResult {
  success: boolean;
  message: string;
  affectedCount: number;
  errors?: string[];
}

export const useBulkInterviewOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<{ operation: string; message: string } | null>(null);

  const runBulkOp = useCallback(async (
    operation: 'reschedule' | 'cancel' | 'send_reminder' | 'delete' | 'update_status' | 'assign_interviewer',
    interviewIds: string[],
    opData?: Record<string, unknown>,
    successTitle?: string,
    successDesc?: string,
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    setError(null);
    setOperationError(null);

    try {
      await interviewsApi.bulkOperations({ operation, interviewIds, data: opData });

      toast({
        title: successTitle || 'Operation complete',
        description: successDesc || `${interviewIds.length} interview(s) updated.`,
      });

      return { success: true, message: 'Operation completed successfully', affectedCount: interviewIds.length };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMessage);
      setOperationError({ operation, message: errorMessage });

      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });

      return { success: false, message: errorMessage, affectedCount: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkReschedule = useCallback(async (interviewIds: string[], newDate: string, newTime: string) =>
    runBulkOp('reschedule', interviewIds, { newDate, newTime },
      'Interviews Rescheduled',
      `${interviewIds.length} interview(s) have been rescheduled.`
    ), [runBulkOp]);

  const bulkCancel = useCallback(async (interviewIds: string[], reason: string) =>
    runBulkOp('cancel', interviewIds, { reason },
      'Interviews Cancelled',
      `${interviewIds.length} interview(s) have been cancelled.`
    ), [runBulkOp]);

  const bulkSendReminder = useCallback(async (interviewIds: string[], message: string) =>
    runBulkOp('send_reminder', interviewIds, { message },
      'Reminders Sent',
      `Reminder sent to ${interviewIds.length} candidate(s).`
    ), [runBulkOp]);

  const bulkExport = useCallback(async (interviewIds: string[], format: string) =>
    runBulkOp('update_status', interviewIds, { format },
      'Export Complete',
      `${interviewIds.length} interview(s) exported.`
    ), [runBulkOp]);

  const bulkDelete = useCallback(async (interviewIds: string[]) =>
    runBulkOp('delete', interviewIds, undefined,
      'Interviews Deleted',
      `${interviewIds.length} interview(s) permanently deleted.`
    ), [runBulkOp]);

  const bulkUpdateStatus = useCallback(async (interviewIds: string[], status: string) =>
    runBulkOp('update_status', interviewIds, { status },
      'Status Updated',
      `${interviewIds.length} interview(s) updated to ${status}.`
    ), [runBulkOp]);

  const bulkAssignInterviewer = useCallback(async (interviewIds: string[], interviewerId: string, interviewerName: string) =>
    runBulkOp('assign_interviewer', interviewIds, { interviewerId, interviewerName },
      'Interviewer Assigned',
      `${interviewerName} assigned to ${interviewIds.length} interview(s).`
    ), [runBulkOp]);

  return {
    loading,
    error,
    operationError,
    bulkReschedule,
    bulkCancel,
    bulkSendReminder,
    bulkExport,
    bulkDelete,
    bulkUpdateStatus,
    bulkAssignInterviewer,
  };
};

export default useBulkInterviewOperations;

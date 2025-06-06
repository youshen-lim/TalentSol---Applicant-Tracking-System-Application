import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface BulkOperationResult {
  success: boolean;
  message: string;
  affectedCount: number;
  errors?: string[];
}

export const useBulkInterviewOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Bulk reschedule interviews
  const bulkReschedule = useCallback(async (
    interviewIds: string[], 
    newDate: string, 
    newTime: string
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/bulk-operations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          operation: 'reschedule',
          interviewIds,
          data: { newDate, newTime }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reschedule interviews: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: 'Interviews Rescheduled',
        description: `${interviewIds.length} interview(s) have been rescheduled successfully.`,
      });

      return {
        success: true,
        message: 'Interviews rescheduled successfully',
        affectedCount: interviewIds.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule interviews';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
        affectedCount: 0
      };
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Bulk cancel interviews
  const bulkCancel = useCallback(async (
    interviewIds: string[], 
    reason: string
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/bulk-operations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          operation: 'cancel',
          interviewIds,
          data: { reason }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel interviews: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: 'Interviews Cancelled',
        description: `${interviewIds.length} interview(s) have been cancelled.`,
      });

      return {
        success: true,
        message: 'Interviews cancelled successfully',
        affectedCount: interviewIds.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel interviews';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
        affectedCount: 0
      };
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Bulk send reminders
  const bulkSendReminder = useCallback(async (
    interviewIds: string[], 
    message: string
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/bulk-operations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          operation: 'send_reminder',
          interviewIds,
          data: { message }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send reminders: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: 'Reminders Sent',
        description: `Reminder emails sent to ${interviewIds.length} candidate(s).`,
      });

      return {
        success: true,
        message: 'Reminders sent successfully',
        affectedCount: interviewIds.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reminders';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
        affectedCount: 0
      };
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Bulk export interviews
  const bulkExport = useCallback(async (
    interviewIds: string[], 
    format: string
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/bulk-operations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          operation: 'export',
          interviewIds,
          data: { format }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export interviews: ${response.statusText}`);
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `interviews_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Export Complete',
        description: `${interviewIds.length} interview(s) exported successfully.`,
      });

      return {
        success: true,
        message: 'Interviews exported successfully',
        affectedCount: interviewIds.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export interviews';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
        affectedCount: 0
      };
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Bulk delete interviews
  const bulkDelete = useCallback(async (
    interviewIds: string[]
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/bulk-operations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          operation: 'delete',
          interviewIds
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete interviews: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: 'Interviews Deleted',
        description: `${interviewIds.length} interview(s) have been deleted permanently.`,
      });

      return {
        success: true,
        message: 'Interviews deleted successfully',
        affectedCount: interviewIds.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete interviews';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
        affectedCount: 0
      };
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Bulk update interview status
  const bulkUpdateStatus = useCallback(async (
    interviewIds: string[], 
    status: string
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/bulk-operations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          operation: 'update_status',
          interviewIds,
          data: { status }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update interview status: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: 'Status Updated',
        description: `${interviewIds.length} interview(s) status updated to ${status}.`,
      });

      return {
        success: true,
        message: 'Interview status updated successfully',
        affectedCount: interviewIds.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update interview status';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
        affectedCount: 0
      };
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Bulk assign interviewer
  const bulkAssignInterviewer = useCallback(async (
    interviewIds: string[], 
    interviewerId: string,
    interviewerName: string
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/bulk-operations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          operation: 'assign_interviewer',
          interviewIds,
          data: { interviewerId, interviewerName }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign interviewer: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: 'Interviewer Assigned',
        description: `${interviewerName} has been assigned to ${interviewIds.length} interview(s).`,
      });

      return {
        success: true,
        message: 'Interviewer assigned successfully',
        affectedCount: interviewIds.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign interviewer';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        message: errorMessage,
        affectedCount: 0
      };
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  return {
    loading,
    error,
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

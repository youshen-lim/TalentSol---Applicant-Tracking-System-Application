import { useState, useEffect, useCallback } from 'react';
import { notificationApi, type Notification } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const [notificationsResponse, unreadResponse] = await Promise.all([
        notificationApi.getNotifications({ limit: 50 }),
        notificationApi.getUnreadCount(),
      ]);

      setNotifications(notificationsResponse.notifications || []);
      setUnreadCount(unreadResponse.unreadCount || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      await notificationApi.markAsRead(notificationIds);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      const markedCount = notifications.filter(n => 
        notificationIds.includes(n.id) && !n.isRead
      ).length;
      setUnreadCount(prev => Math.max(0, prev - markedCount));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notifications as read';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [notifications, toast]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      
      toast.atsBlue({
        title: 'Notifications marked as read',
        description: 'All notifications have been marked as read',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.atsBlue({
        title: 'Notification deleted',
        description: 'The notification has been removed',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [notifications, toast]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh notifications
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  // Listen for visibility change to refresh when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && autoRefresh) {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefresh, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
};

// Hook for real-time notifications (would integrate with WebSocket)
export const useRealTimeNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { refreshNotifications } = useNotifications(false);

  useEffect(() => {
    // This would be implemented with WebSocket connection
    // For now, we'll simulate with periodic polling
    const interval = setInterval(() => {
      refreshNotifications();
    }, 10000); // Poll every 10 seconds

    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [refreshNotifications]);

  return { isConnected };
};

export default useNotifications;

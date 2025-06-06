import { useState, useEffect, useCallback } from 'react';
import { useInterviews } from './useInterviews';
import { toast } from '@/components/ui/use-toast';
import io, { Socket } from 'socket.io-client';

interface InterviewUpdate {
  type: 'interview_created' | 'interview_updated' | 'interview_cancelled' | 'interview_reminder';
  interview: any;
  timestamp: string;
  scheduledBy?: { id: string; name: string };
  updatedBy?: { id: string; name: string };
  cancelledBy?: { id: string; name: string };
}

interface NotificationEvent {
  type: 'notification';
  notification: any;
  timestamp: string;
}

export const useRealTimeInterviews = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { refetch } = useInterviews();

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setConnectionError('No authentication token found');
        return;
      }

      const wsUrl = import.meta.env.VITE_WS_API_URL || 'ws://localhost:9000';
      const newSocket = io(wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Connected to real-time interview updates');
        setIsConnected(true);
        setConnectionError(null);
        
        // Subscribe to interview updates
        newSocket.emit('subscribe:interviews');
        newSocket.emit('subscribe:notifications');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from real-time updates');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      // Handle interview updates
      newSocket.on('interview:scheduled', (data: InterviewUpdate) => {
        console.log('Interview scheduled:', data);
        handleInterviewUpdate(data);
      });

      newSocket.on('interview:updated', (data: InterviewUpdate) => {
        console.log('Interview updated:', data);
        handleInterviewUpdate(data);
      });

      newSocket.on('interview:cancelled', (data: InterviewUpdate) => {
        console.log('Interview cancelled:', data);
        handleInterviewUpdate(data);
      });

      newSocket.on('interview:reminder', (data: InterviewUpdate) => {
        console.log('Interview reminder:', data);
        handleInterviewReminder(data);
      });

      // Handle notifications
      newSocket.on('notification', (data: NotificationEvent) => {
        console.log('Real-time notification:', data);
        handleNotification(data);
      });

      setSocket(newSocket);

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Handle interview updates
  const handleInterviewUpdate = useCallback((data: InterviewUpdate) => {
    // Refresh interview data
    refetch();

    // Show toast notification
    const messages = {
      interview_created: `New interview scheduled: ${data.interview.title}`,
      interview_updated: `Interview updated: ${data.interview.title}`,
      interview_cancelled: `Interview cancelled: ${data.interview.title}`,
    };

    const message = messages[data.type] || 'Interview updated';
    
    toast({
      title: 'Interview Update',
      description: message,
      duration: 5000,
    });
  }, [refetch]);

  // Handle interview reminders
  const handleInterviewReminder = useCallback((data: InterviewUpdate) => {
    const timeText = data.type === 'interview_reminder' ? 'starting soon' : '';
    
    toast({
      title: 'Interview Reminder',
      description: `${data.interview.title} is ${timeText}`,
      duration: 10000,
    });

    // You could also trigger browser notifications here
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Interview Reminder', {
        body: `${data.interview.title} is ${timeText}`,
        icon: '/favicon.ico',
      });
    }
  }, []);

  // Handle general notifications
  const handleNotification = useCallback((data: NotificationEvent) => {
    toast({
      title: data.notification.title,
      description: data.notification.message,
      duration: 5000,
    });
  }, []);

  // Send interview update
  const sendInterviewUpdate = useCallback((action: string, interviewData: any) => {
    if (socket && isConnected) {
      socket.emit('interview:update', {
        action,
        interviewData,
      });
    }
  }, [socket, isConnected]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    // Request notification permission
    requestNotificationPermission();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, requestNotificationPermission]);

  // Reconnect when token changes
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && !isConnected && !socket) {
      connect();
    }
  }, [connect, isConnected, socket]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendInterviewUpdate,
    requestNotificationPermission,
  };
};

// Hook for managing real-time notifications
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const notification = event.detail;
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener('notification', handleNotification as EventListener);

    return () => {
      window.removeEventListener('notification', handleNotification as EventListener);
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
};

export default useRealTimeInterviews;

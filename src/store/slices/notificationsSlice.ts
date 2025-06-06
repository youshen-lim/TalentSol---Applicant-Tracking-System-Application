import { StateCreator } from 'zustand';

export interface Notification {
  id: string;
  type: 'application' | 'interview' | 'candidate' | 'system' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    applicationId?: string;
    candidateId?: string;
    jobId?: string;
    interviewId?: string;
    userId?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface NotificationsSlice {
  // State
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const notificationsSlice: StateCreator<
  NotificationsSlice,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  NotificationsSlice
> = (set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,

  // Actions
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    set((state) => {
      state.notifications.unshift(newNotification);
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    });
  },

  markAsRead: (notificationId: string) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      }
    });
  },

  markAllAsRead: () => {
    set((state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    });
  },

  removeNotification: (notificationId: string) => {
    set((state) => {
      const index = state.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        }
      }
    });
  },

  clearNotifications: () => {
    set((state) => {
      state.notifications = [];
      state.unreadCount = 0;
    });
  },

  setNotifications: (notifications: Notification[]) => {
    set((state) => {
      state.notifications = notifications;
      state.unreadCount = notifications.filter(n => !n.isRead).length;
    });
  },
});

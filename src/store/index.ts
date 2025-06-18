import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { authSlice, AuthSlice } from './slices/authSlice';
import { uiSlice, UISlice } from './slices/uiSlice';
import { filtersSlice, FiltersSlice } from './slices/filtersSlice';
import { notificationsSlice, NotificationsSlice } from './slices/notificationsSlice';

// Combined store interface
export interface AppStore extends AuthSlice, UISlice, FiltersSlice, NotificationsSlice {}

// Create the main store with all slices
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((...args) => ({
        ...authSlice(...args),
        ...uiSlice(...args),
        ...filtersSlice(...args),
        ...notificationsSlice(...args),
      })),
      {
        name: 'talentsol-store',
        partialize: (state) => ({
          // Persist only specific parts of the state
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          compactMode: state.compactMode,
          language: state.language,
          timezone: state.timezone,
          // Don't persist filters or notifications (session-only)
        }),
      }
    ),
    {
      name: 'TalentSol Store',
    }
  )
);

// Selector hooks for better performance
export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
  login: state.login,
  logout: state.logout,
  updateProfile: state.updateProfile,
  clearError: state.clearError,
}));

export const useUI = () => useAppStore((state) => ({
  theme: state.theme,
  sidebarCollapsed: state.sidebarCollapsed,
  compactMode: state.compactMode,
  language: state.language,
  timezone: state.timezone,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSidebarCollapsed: state.setSidebarCollapsed,
  setCompactMode: state.setCompactMode,
  setLanguage: state.setLanguage,
  setTimezone: state.setTimezone,
}));

export const useFilters = () => useAppStore((state) => ({
  candidateFilters: state.candidateFilters,
  jobFilters: state.jobFilters,
  applicationFilters: state.applicationFilters,
  interviewFilters: state.interviewFilters,
  setCandidateFilters: state.setCandidateFilters,
  setJobFilters: state.setJobFilters,
  setApplicationFilters: state.setApplicationFilters,
  setInterviewFilters: state.setInterviewFilters,
  clearAllFilters: state.clearAllFilters,
}));

export const useNotifications = () => useAppStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  addNotification: state.addNotification,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

// Export store for direct access if needed
export default useAppStore;

import { StateCreator } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

export interface UISlice {
  // State
  theme: Theme;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  language: string;
  timezone: string;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  resetUI: () => void;
}

export const uiSlice: StateCreator<
  UISlice,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  UISlice
> = (set) => ({
  // Initial state
  theme: 'light',
  sidebarCollapsed: false,
  compactMode: false,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',

  // Actions
  setTheme: (theme: Theme) => {
    set((state) => {
      state.theme = theme;
    });

    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  toggleSidebar: () => {
    set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    });
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set((state) => {
      state.sidebarCollapsed = collapsed;
    });
  },

  setCompactMode: (compact: boolean) => {
    set((state) => {
      state.compactMode = compact;
    });
  },

  setLanguage: (language: string) => {
    set((state) => {
      state.language = language;
    });
  },

  setTimezone: (timezone: string) => {
    set((state) => {
      state.timezone = timezone;
    });
  },

  resetUI: () => {
    set((state) => {
      state.theme = 'light';
      state.sidebarCollapsed = false;
      state.compactMode = false;
      state.language = 'en';
      state.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    });
  },
});

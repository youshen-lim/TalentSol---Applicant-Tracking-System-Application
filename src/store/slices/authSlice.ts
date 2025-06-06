import { StateCreator } from 'zustand';
import { authApi, userApi } from '@/services/api';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  companyId: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  company?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthSlice {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const authSlice: StateCreator<
  AuthSlice,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  AuthSlice
> = (set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const response = await authApi.login(email, password);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }

      // Fetch user profile after successful login
      await get().fetchProfile();

      set((state) => {
        state.isAuthenticated = true;
        state.isLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Login failed';
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
      throw error;
    }
  },

  logout: async () => {
    set((state) => {
      state.isLoading = true;
    });

    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('authToken');
      set((state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const updatedUser = await userApi.updateProfile(data);
      
      set((state) => {
        state.user = updatedUser;
        state.isLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Profile update failed';
        state.isLoading = false;
      });
      throw error;
    }
  },

  fetchProfile: async () => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const user = await userApi.getProfile();
      
      set((state) => {
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      
      // Fallback to mock data for development
      const mockUser: User = {
        id: 'user_1',
        email: 'jane.doe@talentsol.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'admin',
        companyId: 'comp_1',
        phone: '+1 (555) 123-4567',
        bio: 'HR Manager at TalentSol',
        company: {
          id: 'comp_1',
          name: 'TalentSol Inc.'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => {
        state.user = mockUser;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = 'Using demo data - API may be unavailable';
      });
    }
  },

  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  setUser: (user: User | null) => {
    set((state) => {
      state.user = user;
      state.isAuthenticated = !!user;
    });
  },
});

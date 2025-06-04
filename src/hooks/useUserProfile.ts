import { useState, useEffect } from 'react';
import { userApi } from '@/services/api';

export interface UserProfile {
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

interface UseUserProfileReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userApi.getProfile();
      
      if (response) {
        setUser(response);
      } else {
        // Fallback to mock data if API fails
        const mockUser: UserProfile = {
          id: 'user_1',
          email: 'jane.doe@talentsol.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'admin',
          companyId: 'comp_1',
          avatarUrl: undefined,
          phone: '+1 (555) 123-4567',
          bio: 'HR Manager at TalentSol',
          company: {
            id: 'comp_1',
            name: 'TalentSol Inc.'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setUser(mockUser);
        console.warn('Using mock user data - API may be unavailable');
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
      
      // Fallback to mock data on error
      const mockUser: UserProfile = {
        id: 'user_1',
        email: 'jane.doe@talentsol.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'admin',
        companyId: 'comp_1',
        avatarUrl: undefined,
        phone: '+1 (555) 123-4567',
        bio: 'HR Manager at TalentSol',
        company: {
          id: 'comp_1',
          name: 'TalentSol Inc.'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const updatedUser = await userApi.updateProfile(data);
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to update user profile:', err);
      throw err;
    }
  };

  const refetch = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    user,
    loading,
    error,
    refetch,
    updateProfile,
  };
};

export default useUserProfile;

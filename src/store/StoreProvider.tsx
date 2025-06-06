import React, { useEffect } from 'react';
import { useAuth } from './index';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * StoreProvider component that initializes the store and handles authentication
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { fetchProfile, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = localStorage.getItem('authToken');
    if (token && !isAuthenticated) {
      fetchProfile();
    }
  }, [fetchProfile, isAuthenticated]);

  return <>{children}</>;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

import { User } from '../navigation/NavigationTypes';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
  authenticateWithBiometric: () => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'va' | 'client' | 'both';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'maiki_token';
const REFRESH_TOKEN_KEY = 'maiki_refresh_token';
const USER_KEY = 'maiki_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  // Update API client headers when token changes
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const loadAuthState = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, refresh_token, user: userData } = response.data;

      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, access_token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
      ]);

      setToken(access_token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      const { access_token, refresh_token, user: userData } = response.data;

      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, access_token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
      ]);

      setToken(access_token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);

      setToken(null);
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;

      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, access_token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken),
      ]);

      setToken(access_token);
    } catch (error) {
      // If refresh fails, log out
      await logout();
      throw error;
    }
  };

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
  }, []);

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        return false;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Maiki',
        fallbackLabel: 'Use password',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    authenticateWithBiometric,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

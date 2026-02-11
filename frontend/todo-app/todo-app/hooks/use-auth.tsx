'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@/types/user';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      apiClient.setToken(storedToken); // Initialize API client with stored token
    }
    setIsLoading(false); // Set loading to false after initial check
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    apiClient.setToken(token); // Set token in API client
    setUser(userData);
    setToken(token);
  };

  const signOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    apiClient.clearToken(); // Clear token from API client
    setUser(null);
    setToken(null);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.signIn(email, password);
      // The API client will throw an error if the request fails,
      // so if we reach this point, the request was successful
      // The response contains the user data and token
      login(response.user, response.token);
    } catch (error) {
      // Error is already handled by the API client with user-friendly messages
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await apiClient.signUp(email, password, name);
      // The API client will throw an error if the request fails,
      // so if we reach this point, the request was successful
      login(response.user, response.token);
    } catch (error) {
      // Error is already handled by the API client with user-friendly messages
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        signOut,
        signIn,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

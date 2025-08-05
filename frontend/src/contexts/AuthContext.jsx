'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api.js';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && api.isAuthenticated();

  // Initialize auth state from cookies
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (api.isAuthenticated()) {
          // Verify token and get user data
          const userData = await api.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        api.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);
      
      // Get user data after successful login
      const userData = await api.getCurrentUser();
      setUser(userData);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await api.register(userData);
      
      // Get user data after successful registration
      const newUserData = await api.getCurrentUser();
      setUser(newUserData);
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await api.logout();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const contextValue = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
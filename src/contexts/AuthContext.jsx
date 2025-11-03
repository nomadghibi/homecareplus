import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '../api/base44Client';

// Create the context
const AuthContext = createContext(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount and set up listener
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await base44.auth.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AuthContext] Failed to check authentication:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await base44.auth.login(credentials);

      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }

      return { success: false, error: response.error };
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (credentials) => {
    try {
      const response = await base44.auth.signup(credentials);

      if (response.success) {
        // Note: User might need email verification, so don't set user state yet
        return {
          success: true,
          requiresEmailVerification: response.requiresEmailVerification
        };
      }

      return { success: false, error: response.error };
    } catch (error) {
      console.error('[AuthContext] Signup failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await base44.auth.logout();
      setUser(null);
      setIsAuthenticated(false);

      // Clear any additional local storage items
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');

      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    // Useful for when user data changes (e.g., profile update, subscription change)
    await checkAuth();
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

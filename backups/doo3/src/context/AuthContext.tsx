import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, RegisterFormData } from '../types';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (data: RegisterFormData) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('doo_buyer_session_v6');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sync session user to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('doo_buyer_session_v6', JSON.stringify(user));
        setIsAdmin(user.role === 'admin');
      } else {
        localStorage.removeItem('doo_buyer_session_v6');
        setIsAdmin(false);
      }
    } catch (e) {
      console.error('Failed to sync session to localStorage:', e);
    }
  }, [user]);

  // Load User on Mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAdmin(currentUser.role === 'admin');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    loadUser();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const currentUser = await AuthService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              setIsAdmin(currentUser.role === 'admin');
            }
          } catch (error) {
            console.error('Failed to load user on sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const userData = await AuthService.login(email, password);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      return userData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const userData = await AuthService.register(data);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      return userData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (email: string) => {
    await AuthService.resetPassword(email);
  }, []);

  // Update Password
  const updatePassword = useCallback(async (newPassword: string) => {
    await AuthService.updatePassword(newPassword);
  }, []);

  // Refresh User
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.role === 'admin');
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshUser,
  }), [user, isLoading, isAuthenticated, isAdmin, login, register, logout, resetPassword, updatePassword, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

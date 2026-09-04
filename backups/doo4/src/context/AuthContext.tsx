// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';
import { AuthService } from '../services/auth.service';
import { supabase } from '../lib/supabase';

// ============================================================
// 1. تعريف نوع السياق
// ============================================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// ============================================================
// 2. إنشاء السياق
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// 3. مزود السياق (Provider)
// ============================================================

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
  const [error, setError] = useState<string | null>(null);

  // Sync to localStorage
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
      console.error('Failed to sync user session:', e);
    }
  }, [user]);

  // Load User on Mount & Listen
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAdmin(currentUser.role === 'admin');
        }
      } catch (e) {
        console.error('Failed to load current user:', e);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const currentUser = await AuthService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              setIsAdmin(currentUser.role === 'admin');
            }
          } catch (e) {
            console.error('Auth state sign in error:', e);
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

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const userData = await AuthService.login(email, password);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      return userData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: any) => {
    setError(null);
    setIsLoading(true);
    try {
      const userData = await AuthService.register(data);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      return userData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ في إنشاء الحساب';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setIsAdmin(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ في تسجيل الخروج';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.resetPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ في إرسال رابط الاستعادة';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.updatePassword(newPassword);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ في تحديث كلمة المرور';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const clearError = useCallback(() => {
    setError(null);
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
    error,
    clearError,
  }), [
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
    error,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={value}>
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

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
  fallback = null,
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return fallback || <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

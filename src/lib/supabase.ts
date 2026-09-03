import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://plqfewlztgsojgvmygsl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mU_PNBeM9V3oi4IrsnVmWw_3w9NBbKh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============================================================
// Auth Helpers
// ============================================================

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  } catch {
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (e) {
    console.error('Sign out error:', e);
  }
};

// ============================================================
// User Profile Helpers
// ============================================================

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Update profile error:', e);
    return null;
  }
};

export const getUserRole = async (userId: string): Promise<'buyer' | 'admin'> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return 'buyer';
    return data.role || 'buyer';
  } catch {
    return 'buyer';
  }
};

// ============================================================
// Password Reset Helpers
// ============================================================

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#/reset-password`,
  });
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};

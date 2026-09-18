// src/lib/supabase.ts

import { createClient, SupabaseClient, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { ENV } from '../config/env';
import { UserRole } from '../types';

// ============================================================
// 1. تهيئة عميل Supabase الإلزامي من متغسرات البيئة
// ============================================================

const supabaseUrl = ENV.SUPABASE_URL.trim();
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ خطأ إعدادات البيئة: متغسرات VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY غير معرفة. ' +
    'يرجى إضافتهما إلى ملف .env وتحديد مفاتيح Supabase الصحيحة.'
  );
}

/**
 * العميل الرئيسي لـ Supabase - المصدر الوحيد للاتصال
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// ============================================================
// 2. أدوات المصادقة والجلسات (Auth Helpers)
// ============================================================

/**
 * الحصول على المستخدم الحالي من جلسة Supabase Auth الفعلية
 */
export const getCurrentSupabaseUser = async (): Promise<SupabaseUser | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

/**
 * الحصول على الجلسة الحالية النشطة
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
};

/**
 * التحقق من وجود جلسة نشطة
 */
export const hasActiveSession = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

/**
 * تسجيل الخروج الفعلي من Supabase Auth
 */
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * تحديث كلمة المرور في Supabase Auth
 */
export const updateSupabasePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * إرسال رابط إعادة تعيين كلمة المرور
 */
export const resetSupabasePassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${ENV.APP_URL}/#/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ============================================================
// 3. أدوات قاعدة البيانات (Database Helpers)
// ============================================================

export const getUserProfile = async (userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
};

export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return 'buyer';
    return data.role as UserRole;
  } catch {
    return 'buyer';
  }
};

export const getStoreSettings = async (): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
};

export const updateStoreSettings = async (settings: any): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({ id: 'main', ...settings, updated_at: new Date().toISOString() })
      .select()
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
};

export default supabase;

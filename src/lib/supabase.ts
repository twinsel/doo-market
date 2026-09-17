// src/lib/supabase.ts

import { createClient, SupabaseClient, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole } from '../types';

// ============================================================
// 0. دالة تنظيف شاملة من BOM والأحرف المخفية
// ============================================================
const clean = (s: string): string =>
  (s || '')
    .replace(/[\uFEFF\u200B-\u200D\u2060\uFFFE\uFFFF]/g, '')
    .trim();

const supabaseUrl = clean(
  import.meta.env.VITE_SUPABASE_URL || 'https://cuhopbhqtoxccoflogyy.supabase.co'
);
const supabaseAnonKey = clean(
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G9PbwL7JJffxKToCSSnQ-w_G3cYLQMT'
);

if (!supabaseAnonKey) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY is not set.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  // ✅ تم حذف global.headers نهائياً لأنه كان مصدر المشكلة
});

// ============================================================
// 2. أدوات المصادقة (Auth Helpers)
// ============================================================

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

export const hasActiveSession = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const updateSupabasePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const updateSupabaseEmail = async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({ email: clean(newEmail) });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const resetSupabasePassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(clean(email), {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ============================================================
// 3. أدوات المستخدمين
// ============================================================

export const getUserProfile = async (userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error || !data) return null;
    return data;
  } catch { return null; }
};

export const updateUserProfile = async (userId: string, updates: Record<string, any>) => {
  try {
    const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return null;
  }
};

export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
    if (error || !data) return 'buyer';
    return data.role as UserRole;
  } catch { return 'buyer'; }
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};

export const getFullUser = async (userId: string) => {
  try {
    const [userResult, profile, role] = await Promise.all([
      supabase.auth.getUser(),
      getUserProfile(userId),
      getUserRole(userId),
    ]);
    if (userResult.error || !userResult.data.user) return null;
    return { user: userResult.data.user, profile, role };
  } catch { return null; }
};

// ============================================================
// 4. أدوات الطلبات
// ============================================================

export const getUserOrders = async (userId: string, options?: { status?: string; limit?: number; offset?: number; }) => {
  try {
    let query = supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (options?.status) query = query.eq('status', options.status);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch { return null; }
};

export const getOrderById = async (orderId: string) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (error) throw error;
    return data;
  } catch { return null; }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).select().single();
    if (error) throw error;
    return data;
  } catch { return null; }
};

// ============================================================
// 5. السلة والمفضلة
// ============================================================

export const getUserCart = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('carts').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch { return null; }
};

export const updateUserCart = async (userId: string, items: any[]) => {
  try {
    const { data, error } = await supabase.from('carts').upsert({ user_id: userId, items, updated_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    return data;
  } catch { return null; }
};

export const getUserWishlist = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('wishlists').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch { return null; }
};

export const updateUserWishlist = async (userId: string, items: string[]) => {
  try {
    const { data, error } = await supabase.from('wishlists').upsert({ user_id: userId, items, updated_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    return data;
  } catch { return null; }
};

// ============================================================
// 6. المنتجات
// ============================================================

export const getAllProducts = async (options?: { categoryId?: string; featured?: boolean; flashDeal?: boolean; active?: boolean; limit?: number; offset?: number; }) => {
  try {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (options?.categoryId) query = query.eq('category_id', options.categoryId);
    if (options?.featured !== undefined) query = query.eq('featured', options.featured);
    if (options?.flashDeal !== undefined) query = query.eq('flash_deal', options.flashDeal);
    if (options?.active !== undefined) query = query.eq('active', options.active);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch { return null; }
};

export const getProductById = async (productId: string) => {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error) throw error;
    return data;
  } catch { return null; }
};

export const searchProductsFromSupabase = async (queryStr: string, options?: { limit?: number }) => {
  try {
    const q = clean(queryStr);
    const { data, error } = await supabase.from('products').select('*')
      .or(`name.ilike.%${q}%,name_en.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('active', true)
      .limit(options?.limit || 20);
    if (error) throw error;
    return data;
  } catch { return null; }
};

// ============================================================
// 7. المراجعات
// ============================================================

export const getProductReviews = async (productId: string, options?: { limit?: number }) => {
  try {
    const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false }).limit(options?.limit || 20);
    if (error) throw error;
    return data;
  } catch { return null; }
};

export const addReviewToSupabase = async (reviewData: { productId: string; userId: string; userName: string; rating: number; comment: string; }) => {
  try {
    const { data, error } = await supabase.from('reviews').insert({
      product_id: reviewData.productId,
      user_id: reviewData.userId,
      user_name: clean(reviewData.userName),
      rating: reviewData.rating,
      comment: clean(reviewData.comment),
    }).select().single();
    if (error) throw error;
    return data;
  } catch { return null; }
};

// ============================================================
// 8. الإعدادات
// ============================================================

export const getStoreSettings = async () => {
  try {
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'main').single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch { return null; }
};

export const updateStoreSettings = async (settings: any) => {
  try {
    const { data, error } = await supabase.from('store_settings').upsert({ id: 'main', ...settings, updated_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    return data;
  } catch { return null; }
};

// ============================================================
// 9. الإشعارات
// ============================================================

export const getUserNotifications = async (userId: string, options?: { limit?: number; unreadOnly?: boolean }) => {
  try {
    let query = supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (options?.unreadOnly) query = query.eq('read', false);
    if (options?.limit) query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch { return null; }
};

export const markNotificationsAsRead = async (userId: string, notificationIds?: string[]) => {
  try {
    let query = supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    if (notificationIds && notificationIds.length > 0) query = query.in('id', notificationIds);
    const { error } = await query;
    if (error) throw error;
    return true;
  } catch { return false; }
};

// ============================================================
// 10. أدوات عامة
// ============================================================

export const uploadFile = async (file: File, path: string): Promise<{ url: string | null; error?: string }> => {
  try {
    const fileName = `${Date.now()}_${clean(file.name)}`;
    const filePath = `${path}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
    if (uploadError) return { url: null, error: uploadError.message };
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
    return { url: publicUrl };
  } catch (error) {
    return { url: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const deleteFile = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage.from('products').remove([filePath]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export type SupabaseEvent =
  | 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT'
  | 'PASSWORD_RECOVERY' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

export default supabase;
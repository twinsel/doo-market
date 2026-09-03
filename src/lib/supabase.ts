// src/lib/supabase.ts

import { createClient, SupabaseClient, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole } from '../types';

// ============================================================
// 1. تهيئة العميل (Client Initialization)
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://plqfewlztgsojgvmygsl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mU_PNBeM9V3oi4IrsnVmWw_3w9NBbKh';

if (!supabaseAnonKey) {
  console.warn(
    '⚠️ VITE_SUPABASE_ANON_KEY is not set. ' +
    'Please add it to your .env file or set it in the environment variables.\n' +
    'The app will continue to work with limited functionality.'
  );
}

/**
 * العميل الرئيسي لـ Supabase
 * يستخدم في جميع أنحاء التطبيق
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'doo-market',
    },
  },
});

// ============================================================
// 2. أدوات المصادقة (Auth Helpers)
// ============================================================

/**
 * الحصول على المستخدم الحالي من جلسة Supabase Auth
 */
export const getCurrentSupabaseUser = async (): Promise<SupabaseUser | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.warn('⚠️ Failed to get current user:', error?.message);
      return null;
    }
    return user;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

/**
 * الحصول على الجلسة الحالية
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.warn('⚠️ No active session:', error?.message);
      return null;
    }
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
 * تسجيل الخروج من النظام
 */
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * تحديث كلمة المرور
 */
export const updateSupabasePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * تحديث البريد الإلكتروني
 */
export const updateSupabaseEmail = async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    if (error) {
      return { success: false, error: error.message };
    }
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
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// ============================================================
// 3. أدوات المستخدمين (User Helpers)
// ============================================================

/**
 * الحصول على ملف المستخدم من جدول users
 */
export const getUserProfile = async (userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('⚠️ Failed to get user profile:', error?.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return null;
  }
};

/**
 * الحصول على دور المستخدم من جدول user_roles
 */
export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn('⚠️ No role found, defaulting to buyer:', error?.message);
      return 'buyer';
    }
    return data.role as UserRole;
  } catch (error) {
    console.error('❌ Error getting user role:', error);
    return 'buyer';
  }
};

/**
 * تحديث دور المستخدم
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
      });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * التحقق مما إذا كان المستخدم مسؤولاً
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};

/**
 * الحصول على المستخدم الكامل (مع الملف والدور)
 */
export const getFullUser = async (userId: string): Promise<{
  user: SupabaseUser | null;
  profile: any | null;
  role: UserRole;
} | null> => {
  try {
    const [userResult, profile, role] = await Promise.all([
      supabase.auth.getUser(),
      getUserProfile(userId),
      getUserRole(userId),
    ]);

    if (userResult.error || !userResult.data.user) {
      return null;
    }

    return {
      user: userResult.data.user,
      profile,
      role,
    };
  } catch (error) {
    console.error('❌ Error getting full user:', error);
    return null;
  }
};

// ============================================================
// 4. أدوات الطلبات (Orders Helpers)
// ============================================================

/**
 * الحصول على طلبات المستخدم
 */
export const getUserOrders = async (userId: string, options?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting user orders:', error);
    return null;
  }
};

/**
 * الحصول على طلب محدد
 */
export const getOrderById = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting order:', error);
    return null;
  }
};

/**
 * تحديث حالة الطلب
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return null;
  }
};

// ============================================================
// 5. أدوات السلة والمفضلة (Cart & Wishlist Helpers)
// ============================================================

/**
 * الحصول على سلة المستخدم
 */
export const getUserCart = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data || null;
  } catch (error) {
    console.error('❌ Error getting user cart:', error);
    return null;
  }
};

/**
 * تحديث سلة المستخدم
 */
export const updateUserCart = async (userId: string, items: any[]) => {
  try {
    const { data, error } = await supabase
      .from('carts')
      .upsert({
        user_id: userId,
        items,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error updating cart:', error);
    return null;
  }
};

/**
 * الحصول على مفضلة المستخدم
 */
export const getUserWishlist = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('❌ Error getting wishlist:', error);
    return null;
  }
};

/**
 * تحديث مفضلة المستخدم
 */
export const updateUserWishlist = async (userId: string, items: string[]) => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .upsert({
        user_id: userId,
        items,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error updating wishlist:', error);
    return null;
  }
};

// ============================================================
// 6. أدوات المنتجات (Products Helpers)
// ============================================================

/**
 * الحصول على جميع المنتجات
 */
export const getAllProducts = async (options?: {
  categoryId?: string;
  featured?: boolean;
  flashDeal?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
}) => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    if (options?.flashDeal !== undefined) {
      query = query.eq('flash_deal', options.flashDeal);
    }

    if (options?.active !== undefined) {
      query = query.eq('active', options.active);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting products:', error);
    return null;
  }
};

/**
 * الحصول على منتج محدد
 */
export const getProductById = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting product:', error);
    return null;
  }
};

/**
 * البحث عن المنتجات
 */
export const searchProductsFromSupabase = async (queryStr: string, options?: { limit?: number }) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${queryStr}%,name_en.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
      .eq('active', true)
      .limit(options?.limit || 20);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return null;
  }
};

// ============================================================
// 7. أدوات المراجعات (Reviews Helpers)
// ============================================================

/**
 * الحصول على مراجعات المنتج
 */
export const getProductReviews = async (productId: string, options?: { limit?: number }) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(options?.limit || 20);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting reviews:', error);
    return null;
  }
};

/**
 * إضافة مراجعة
 */
export const addReviewToSupabase = async (reviewData: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: reviewData.productId,
        user_id: reviewData.userId,
        user_name: reviewData.userName,
        rating: reviewData.rating,
        comment: reviewData.comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error adding review:', error);
    return null;
  }
};

// ============================================================
// 8. أدوات الإعدادات (Settings Helpers)
// ============================================================

/**
 * الحصول على إعدادات المتجر
 */
export const getStoreSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('❌ Error getting store settings:', error);
    return null;
  }
};

/**
 * تحديث إعدادات المتجر
 */
export const updateStoreSettings = async (settings: any) => {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        id: 'main',
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error updating store settings:', error);
    return null;
  }
};

// ============================================================
// 9. أدوات الإشعارات (Notifications Helpers)
// ============================================================

/**
 * الحصول على إشعارات المستخدم
 */
export const getUserNotifications = async (userId: string, options?: { limit?: number; unreadOnly?: boolean }) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('read', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    return null;
  }
};

/**
 * تحديث حالة القراءة للإشعارات
 */
export const markNotificationsAsRead = async (userId: string, notificationIds?: string[]) => {
  try {
    let query = supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (notificationIds && notificationIds.length > 0) {
      query = query.in('id', notificationIds);
    }

    const { error } = await query;
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Error marking notifications as read:', error);
    return false;
  }
};

// ============================================================
// 10. أدوات المساعدة العامة (General Helpers)
// ============================================================

/**
 * رفع ملف إلى Supabase Storage
 */
export const uploadFile = async (file: File, path: string): Promise<{ url: string | null; error?: string }> => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    return { url: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * حذف ملف من Supabase Storage
 */
export const deleteFile = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from('products')
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export type SupabaseEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'PASSWORD_RECOVERY'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED';

export default supabase;

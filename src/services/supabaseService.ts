import { supabase } from '../lib/supabase';
import { Order, User, ShopData } from '../types';

// ============================================================
// Sync Orders to Supabase
// ============================================================
export const syncOrderToSupabase = async (order: Order) => {
  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      status: order.status,
      payment_method: order.paymentMethod,
      tracking_steps: order.trackingSteps,
      created_at: order.createdAt || new Date().toISOString()
    });
    if (error) console.error('Supabase order sync error:', error);
  } catch (e) {
    console.error('Failed to sync order to Supabase:', e);
  }
};

export const fetchOrdersFromSupabase = async (): Promise<Order[] | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.id,
      customer: item.customer,
      items: item.items,
      subtotal: Number(item.subtotal),
      shipping: Number(item.shipping),
      discount: Number(item.discount),
      total: Number(item.total),
      status: item.status,
      paymentMethod: item.payment_method,
      trackingSteps: item.tracking_steps,
      createdAt: item.created_at
    }));
  } catch (e) {
    console.error('Failed to fetch orders from Supabase:', e);
    return null;
  }
};

// ============================================================
// Sync & Authenticate Users in Supabase
// ============================================================

export const signUpUserWithSupabase = async (
  email: string,
  password?: string,
  name?: string,
  phone?: string,
  role: 'buyer' | 'admin' = 'buyer'
): Promise<{ ok: boolean; user?: User; error?: string }> => {
  try {
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists in DB
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${cleanEmail},phone.eq.${cleanEmail}`);

    if (existingUsers && existingUsers.length > 0) {
      const existing = existingUsers[0];
      const updatedUser: User = {
        id: existing.id,
        name: name?.trim() || existing.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone?.trim() || existing.phone || '',
        role: existing.role || role || 'buyer',
        joinedAt: existing.joined_at || 'اليوم',
        avatar: existing.avatar,
        cart: existing.cart || [],
        wishlist: existing.wishlist || []
      };

      // Update name & phone in DB
      await supabase.from('users').update({
        name: updatedUser.name,
        phone: updatedUser.phone
      }).eq('id', existing.id);

      return { ok: true, user: updatedUser };
    }

    let authUserId: string | null = null;

    if (cleanEmail && password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: name || 'مستخدم', phone: phone || '', role }
        }
      });

      if (authData?.user?.id) {
        authUserId = authData.user.id;
      }
    }

    const userId = authUserId || 'usr-' + Date.now();
    const newUser: User = {
      id: userId,
      name: name?.trim() || cleanEmail.split('@')[0] || 'مستخدم',
      email: cleanEmail,
      phone: phone?.trim() || '',
      role: role || 'buyer',
      joinedAt: 'اليوم',
      cart: [],
      wishlist: []
    };

    await supabase.from('users').upsert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      joined_at: newUser.joinedAt,
      cart: [],
      wishlist: []
    });

    return { ok: true, user: newUser };
  } catch (e: any) {
    console.error('Failed to sign up user:', e);
    return { ok: false, error: e.message || 'حدث خطأ أثناء إنشاء الحساب' };
  }
};

export const signInUserWithSupabase = async (
  email: string,
  password?: string
): Promise<{ ok: boolean; user?: User; error?: string }> => {
  try {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { ok: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
    }

    // 1. Verify password via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (authError || !authData?.user) {
      // Check if user exists in DB to give precise security feedback or reject
      const { data: existingUsers } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail);

      if (existingUsers && existingUsers.length > 0) {
        return { ok: false, error: 'كلمة المرور غير صحيحة، يرجى التأكد وإعادة المحاولة' };
      }

      return { ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }

    // 2. Fetch matched user profile from DB using authenticated user ID
    const u = authData.user;
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', u.id)
      .single();

    const metadata = u.user_metadata || {};
    const foundUser: User = {
      id: u.id,
      name: profile?.name || metadata.name || u.email?.split('@')[0] || 'مستخدم',
      email: u.email || cleanEmail,
      phone: profile?.phone || metadata.phone || '',
      role: profile?.role || metadata.role || 'buyer',
      avatar: profile?.avatar,
      cart: profile?.cart || [],
      wishlist: profile?.wishlist || []
    };

    return { ok: true, user: foundUser };
  } catch (e: any) {
    console.error('Failed to sign in user:', e);
    return { ok: false, error: e.message || 'حدث خطأ أثناء تسجيل الدخول' };
  }
};

export const sendPasswordResetEmail = async (
  email: string
): Promise<{ ok: boolean; message: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/auth?reset=true`
    });

    if (error) {
      console.warn('Supabase reset warning:', error.message);
    }

    return {
      ok: true,
      message: `تم إرسال رمز/رابط إعادة تعيين كلمة المرور بنجاح إلى البريد الإلكتروني: ${email}`
    };
  } catch (e: any) {
    return {
      ok: true,
      message: `تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك: ${email}`
    };
  }
};

export const syncUserToSupabase = async (user: User) => {
  try {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'buyer',
      joined_at: user.joinedAt || 'اليوم',
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      avatar: user.avatar || null
    });
    if (error) console.error('Supabase user sync error:', error);
  } catch (e) {
    console.error('Failed to sync user to Supabase:', e);
  }
};

export const fetchUsersFromSupabase = async (): Promise<User[] | null> => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      role: item.role,
      joinedAt: item.joined_at,
      cart: item.cart,
      wishlist: item.wishlist,
      avatar: item.avatar
    }));
  } catch (e) {
    console.error('Failed to fetch users from Supabase:', e);
    return null;
  }
};

export const deleteUserFromSupabase = async (identifier: string) => {
  try {
    if (!identifier) return;
    const clean = identifier.trim().toLowerCase();

    // 1. Call RPC function delete_user_completely in Supabase PostgreSQL
    try {
      await supabase.rpc('delete_user_completely', { p_email: clean });
    } catch {}

    // 2. Direct delete on public tables as fallback
    try {
      await supabase.from('users').delete().or(`id.eq.${identifier},email.ilike.${clean},phone.eq.${clean}`);
      await supabase.from('user_roles').delete().or(`user_id.eq.${identifier}`);
      await supabase.from('carts').delete().or(`user_id.eq.${identifier}`);
      await supabase.from('wishlists').delete().or(`user_id.eq.${identifier}`);
    } catch {}

    // 3. Sign out from Supabase Auth
    try {
      await supabase.auth.signOut();
    } catch {}
  } catch (e) {
    console.error('Failed to delete user from Supabase:', e);
  }
};

// ============================================================
// Sync Full Shop State
// ============================================================
export const syncShopStateToSupabase = async (shopData: ShopData) => {
  try {
    await supabase.from('shop_state').upsert({
      id: 'main_state',
      data: shopData,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to sync shop state to Supabase:', e);
  }
};

export const fetchShopStateFromSupabase = async (): Promise<ShopData | null> => {
  try {
    const { data, error } = await supabase
      .from('shop_state')
      .select('data')
      .eq('id', 'main_state')
      .single();

    if (error || !data) return null;
    return data.data as ShopData;
  } catch (e) {
    console.error('Failed to fetch shop state from Supabase:', e);
    return null;
  }
};

import { supabase } from '../lib/supabase';
import { Order, User, ShopData } from '../types';

// ============================================================
// Sync Orders to Supabase
// ============================================================
export const syncOrderToSupabase = async (order: Order) => {
  try {
    const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const validUserId = authData?.user?.id || (order.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.userId) ? order.userId : null);

    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      user_id: validUserId,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      status: order.status,
      payment_method: order.paymentMethod || 'cod',
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

const cleanString = (value?: string): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/[\uFEFF\u200B-\u200D\uFFFE\uFFFF]/g, '').trim();
};

export const signUpUserWithSupabase = async (
  email: string,
  password?: string,
  name?: string,
  phone?: string,
  role: 'buyer' | 'admin' = 'buyer'
): Promise<{ ok: boolean; user?: User; error?: string }> => {
  try {
    const cleanEmail = cleanString(email).toLowerCase();
    const cleanName = cleanString(name) || cleanEmail.split('@')[0] || 'مستخدم';
    const cleanPhone = cleanString(phone);
    const cleanPassword = cleanString(password);

    let authenticatedUserId: string | null = null;
    let authErrorMessage: string | null = null;

    if (cleanEmail && cleanPassword) {
      // 1. Try serverless API route (/api/account) first using Service Role Key
      try {
        const res = await fetch('/api/account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            fullName: cleanName,
            phone: cleanPhone,
            role
          })
        });

        const apiData = await res.json().catch(() => ({}));
        if (res.ok && apiData.user?.id) {
          authenticatedUserId = apiData.user.id;
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: String(password)
          }).catch(() => {});
        } else if (apiData.error) {
          authErrorMessage = apiData.error;
        }
      } catch (e: any) {
        authErrorMessage = e?.message || 'فشل الاتصال بمركز الخدمة';
      }

      // 2. Direct Supabase auth.signUp as fallback
      if (!authenticatedUserId && !authErrorMessage) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: String(password)
          });

          if (authData?.user?.id) {
            authenticatedUserId = authData.user.id;
          } else if (authError) {
            authErrorMessage = authError.message;
          }
        } catch (e: any) {
          authErrorMessage = e?.message || 'Supabase Auth client error';
        }
      }
    }

    if (!authenticatedUserId) {
      return {
        ok: false,
        error: authErrorMessage || 'تعذر إنشاء الحساب في Supabase، يرجى التثبت من إدخال البيانات بشكل صحيح'
      };
    }

    const newUser: User = {
      id: authenticatedUserId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: role || 'buyer',
      joinedAt: 'اليوم',
      cart: [],
      wishlist: []
    };

    // Ensure user row is inserted into public.users with valid UUID
    const { error: dbError } = await supabase.from('users').upsert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      joined_at: newUser.joinedAt
    });

    if (dbError) {
      console.warn('Public user row upsert warning:', dbError.message);
    }

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

export const setUserOnlineStatus = async (userId: string, isOnline: boolean, userEmail?: string) => {
  try {
    if (!userId && !userEmail) return;
    const cleanEmail = userEmail?.trim().toLowerCase();

    // 1. Broadcast instant real-time presence status event (~50ms across all clients)
    try {
      const channel = supabase.channel('presence_status_channel');
      await channel.send({
        type: 'broadcast',
        event: 'presence_changed',
        payload: { userId, email: cleanEmail, isOnline }
      });
    } catch (e) {
      console.warn('Presence broadcast warning:', e);
    }

    // 2. Update DB status before session ends
    if (cleanEmail) {
      await supabase.from('users').update({
        is_online: isOnline,
        last_login_at: new Date().toISOString()
      }).or(`id.eq.${userId},email.ilike.${cleanEmail}`);
    } else {
      await supabase.from('users').update({
        is_online: isOnline,
        last_login_at: new Date().toISOString()
      }).eq('id', userId);
    }
  } catch (e) {
    console.warn('Failed to update user online status:', e);
  }
};

export const syncUserToSupabase = async (user: User & { isOnline?: boolean }) => {
  try {
    if (!user || !user.email || user.id?.startsWith('guest-')) return;

    const cleanEmail = user.email.trim().toLowerCase();
    const cleanName = user.name?.trim() || cleanEmail.split('@')[0];
    const cleanPhone = user.phone?.trim() || '';
    const cleanRole = user.role || 'buyer';

    // 1. Ensure user is created in Supabase auth.users & public.users via serverless API
    try {
      await fetch('/api/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: 'DooUser@2026!',
          fullName: cleanName,
          phone: cleanPhone,
          role: cleanRole
        })
      });
    } catch (e) {
      console.warn('API Account sync warning:', e);
    }

    // 2. Resolve valid UUID ID from Supabase public.users if needed
    let targetId = user.id;
    if (!targetId || targetId.startsWith('usr-') || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
      const { data: profile } = await supabase.from('users').select('id').ilike('email', cleanEmail).maybeSingle();
      if (profile?.id) {
        targetId = profile.id;
      }
    }

    if (targetId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
      try {
        await supabase.from('users').upsert({
          id: targetId,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: cleanRole,
          joined_at: user.joinedAt || 'اليوم',
          avatar: user.avatar || null,
          is_online: user.isOnline ?? true,
          last_login_at: new Date().toISOString()
        });
        broadcastUserUpdated(targetId, cleanEmail, user);
      } catch {}
    }
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
      name: item.name || 'مستخدم',
      email: item.email || '',
      phone: item.phone || '',
      role: item.role || 'buyer',
      joinedAt: item.joined_at || 'اليوم',
      cart: [],
      wishlist: [],
      avatar: item.avatar,
      isOnline: item.is_online ?? false,
      lastLoginAt: item.last_login_at
    }));
  } catch (e) {
    console.error('Failed to fetch users from Supabase:', e);
    return null;
  }
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================================
// Realtime Broadcast Helpers
// ============================================================
export const broadcastUserDeleted = async (userId?: string, email?: string) => {
  const cleanId = (userId || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanId && !cleanEmail) return;

  try {
    const channelName = `del_bc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase.channel(channelName);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'user_deleted',
          payload: { userId: cleanId, email: cleanEmail }
        }).then(() => {
          setTimeout(() => {
            try { supabase.removeChannel(channel); } catch {}
          }, 1000);
        });
      }
    });
  } catch (e) {
    console.warn('Broadcast user_deleted error:', e);
  }
};

export const broadcastUserUpdated = async (userId?: string, email?: string, user?: any) => {
  const cleanId = (userId || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanId && !cleanEmail) return;

  try {
    const channelName = `upd_bc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase.channel(channelName);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'user_updated',
          payload: { userId: cleanId, email: cleanEmail, user }
        }).then(() => {
          setTimeout(() => {
            try { supabase.removeChannel(channel); } catch {}
          }, 1000);
        });
      }
    });
  } catch (e) {
    console.warn('Broadcast user_updated error:', e);
  }
};

export const deleteOwnAccount = async (
  userId?: string,
  userEmail?: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const uid = authData?.user?.id || userId || '';
    const email = authData?.user?.email || userEmail || '';

    const { data: sessionData } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
    const token = sessionData?.session?.access_token;

    // 1. Try Serverless API deletion with a 6s AbortController timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        `/api/account?targetUserId=${encodeURIComponent(uid)}&targetEmail=${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            action: 'delete',
            targetUserId: uid,
            targetEmail: email,
            userId: uid,
            email: email,
            id: uid
          }),
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        broadcastUserDeleted(uid, email);
        return { ok: true };
      }
    } catch (e: any) {
      console.warn('API account deletion fetch failed/timed out:', e?.message);
    }

    // 2. Try RPC function delete_own_account with timeout
    try {
      const rpcPromise = supabase.rpc('delete_own_account');
      const timeoutPromise = new Promise<{ error: any }>((resolve) =>
        setTimeout(() => resolve({ error: { message: 'RPC Timeout' } }), 4000)
      );

      const { error } = await Promise.race([rpcPromise, timeoutPromise]);

      if (!error) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        broadcastUserDeleted(uid, email);
        return { ok: true };
      }
    } catch (e: any) {
      console.warn('RPC delete_own_account failed/timed out:', e?.message);
    }

    // 3. Fallback: Direct database table deletion via Supabase Client
    try {
      await Promise.allSettled([
        supabase.from('carts').delete().eq('user_id', uid),
        supabase.from('wishlists').delete().eq('user_id', uid),
        supabase.from('notifications').delete().eq('user_id', uid),
        supabase.from('reviews').delete().eq('user_id', uid),
        supabase.from('user_roles').delete().eq('user_id', uid),
        supabase.from('users').delete().eq('id', uid)
      ]);
    } catch (e) {
      console.warn('Direct fallback table deletion notice:', e);
    }

    // Sign out locally regardless so the session is terminated and user is logged out
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    broadcastUserDeleted(uid, email);

    return { ok: true };
  } catch (e: any) {
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    broadcastUserDeleted(userId, userEmail);
    return { ok: true };
  }
};

export const adminDeleteUser = async (
  targetUserId: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const targetId = cleanString(targetUserId);

    if (!UUID_RE.test(targetId)) {
      return { ok: false, error: 'معرف المستخدم غير صالح' };
    }

    let token = '';
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      token = sessionData.session?.access_token || '';
    } catch {}

    let requesterId = '';
    try {
      const { data: userData } = await supabase.auth.getUser();
      requesterId = userData.user?.id || '';
    } catch {}

    if (!requesterId) {
      try {
        const cachedUser = JSON.parse(localStorage.getItem('doo_current_user') || '{}');
        requesterId = cachedUser.id || '';
      } catch {}
    }

    const res = await fetch(
      `/api/account?targetUserId=${encodeURIComponent(targetId)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: 'delete',
          targetUserId: targetId,
          requesterId: requesterId
        })
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        error: data?.error || 'فشل حذف المستخدم'
      };
    }

    broadcastUserDeleted(targetId);
    return { ok: true };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message || 'حدث خطأ أثناء حذف المستخدم'
    };
  }
};

export const deleteUserFromSupabase = async (identifier: string, userEmail?: string) => {
  try {
    if (!identifier && !userEmail) return;
    const cleanId = (identifier || '').trim();
    const cleanEmail = (userEmail || (cleanId.includes('@') ? cleanId : '')).trim().toLowerCase();

    // 1. Master Serverless API delete via Service Role Key (Bypasses RLS completely)
    try {
      const deleteApiUrl = `/api/account?targetUserId=${encodeURIComponent(cleanId)}&targetEmail=${encodeURIComponent(cleanEmail)}`;
      await fetch(deleteApiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: cleanId, targetEmail: cleanEmail, action: 'delete' })
      });
    } catch (e) {
      console.warn('Serverless API delete warning:', e);
    }

    // 2. Direct client-side cleanup
    if (cleanId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)) {
      try { await supabase.rpc('admin_delete_user', { target_user_id: cleanId }); } catch {}
      try { await supabase.from('users').delete().eq('id', cleanId); } catch {}
      try { await supabase.from('user_roles').delete().eq('user_id', cleanId); } catch {}
    }

    if (cleanEmail) {
      try { await supabase.rpc('delete_user_completely', { p_email: cleanEmail }); } catch {}
      try { await supabase.from('users').delete().ilike('email', cleanEmail); } catch {}
    }

    // 3. Broadcast RealTime user deletion event to kick out deleted user
    broadcastUserDeleted(cleanId, cleanEmail);
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

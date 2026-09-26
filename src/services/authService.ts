import { supabase, getUserProfile, getUserRole } from '../lib/supabase';
import { User, RegisterFormData } from '../types';

// ============================================================
// Auth Service
// ============================================================

export class AuthService {
  // ----- Login -----
  static async login(email: string, password?: string): Promise<User> {
    let authUser: any = null;

    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        authUser = data.user;
      }
    }

    if (authUser) {
      const profile = await getUserProfile(authUser.id);
      const role = await getUserRole(authUser.id);

      return {
        id: authUser.id,
        name: profile?.name || authUser.user_metadata?.name || email.split('@')[0] || 'مستخدم',
        email: authUser.email || email,
        phone: profile?.phone || authUser.user_metadata?.phone || '',
        role: role || (email.includes('admin') ? 'admin' : 'buyer'),
        avatar: profile?.avatar || authUser.user_metadata?.avatar,
        createdAt: authUser.created_at,
      };
    }

    // Fallback: DB lookup or local profile creation
    const { data: dbUsers } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email.trim()},phone.eq.${email.trim()}`);

    if (dbUsers && dbUsers.length > 0) {
      const match = dbUsers[0];
      return {
        id: match.id,
        name: match.name,
        email: match.email || email,
        phone: match.phone || '',
        role: match.role || (email.includes('admin') ? 'admin' : 'buyer'),
        avatar: match.avatar,
        joinedAt: match.joined_at
      };
    }

    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('مدير');
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0] || 'مستخدم',
      email: email.trim(),
      phone: '',
      role: isAdmin ? 'admin' : 'buyer',
      createdAt: new Date().toISOString()
    };

    try {
      await supabase.from('users').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      });
    } catch {}

    return newUser;
  }

  // ----- Register -----
  static async register(data: RegisterFormData): Promise<User> {
    let authUser: any = null;

    if (data.password) {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone || '',
          },
        },
      });

      if (!error && authData?.user) {
        authUser = authData.user;
      }
    }

    const userId = authUser?.id || 'usr-' + Date.now();
    const isAdmin = data.email.toLowerCase().includes('admin') || data.email.toLowerCase().includes('مدير');

    const newUser: User = {
      id: userId,
      name: data.name.trim() || 'مستخدم',
      email: data.email.trim(),
      phone: (data.phone || '').trim(),
      role: isAdmin ? 'admin' : 'buyer',
      createdAt: new Date().toISOString(),
    };

    // Save profile to users table
    try {
      await supabase.from('users').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        joined_at: 'اليوم'
      });
    } catch (e) {
      console.warn('User DB save warning:', e);
    }

    return newUser;
  }

  // ----- Logout -----
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  // ----- Reset Password -----
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    if (error) console.warn('Reset password error:', error.message);
  }

  // ----- Update Password -----
  static async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw new Error(error.message);
  }

  // ----- Get Current User -----
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const profile = await getUserProfile(user.id);
      const role = await getUserRole(user.id);

      return {
        id: user.id,
        name: profile?.name || user.user_metadata?.name || 'مستخدم',
        email: user.email || '',
        phone: profile?.phone || user.user_metadata?.phone || '',
        role: role,
        avatar: profile?.avatar || user.user_metadata?.avatar,
        createdAt: user.created_at,
      };
    } catch {
      return null;
    }
  }

  // ----- Check if Admin -----
  static async isAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === 'admin';
  }
}

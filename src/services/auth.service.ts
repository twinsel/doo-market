// src/services/auth.service.ts

import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { RegisterFormData, cleanString } from '../schemas/auth.schema';
import { RateLimitService } from './rate-limit.service';
import { ENV } from '../config/env';
import { AUTH_MESSAGES } from '../constants/auth-messages';
import { setUserOnlineStatus } from './supabaseService';

// ============================================================
// 1. خدمة المصادقة - AuthService (Strict Security OWASP 10/10)
// ============================================================

export class AuthService {
  /**
   * ✅ تسجيل الدخول - آمن حسب معايير OWASP
   */
  static async login(emailInput: string, passwordInput: string): Promise<User> {
    const email = cleanString(emailInput).toLowerCase();
    const password = cleanString(passwordInput);

    const rateLimit = await RateLimitService.checkAttempts(email);
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(
        (rateLimit.lockoutUntil!.getTime() - Date.now()) / (60 * 1000)
      );
      throw new Error(AUTH_MESSAGES.login.accountLocked(minutes));
    }

    await this.addRandomDelay();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        await RateLimitService.recordFailedAttempt(email);
        await this.addRandomDelay();
        throw new Error(AUTH_MESSAGES.login.invalidCredentials);
      }

      await RateLimitService.resetAttempts(email);

      // Set online status in DB & broadcast realtime presence
      await setUserOnlineStatus(data.user.id, true, email);

      const [profile, role] = await Promise.all([
        this.getUserProfile(data.user.id),
        this.getUserRole(data.user.id),
      ]);

      await this.updateLastLogin(data.user.id);

      return {
        id: data.user.id,
        name: profile?.name || data.user.user_metadata?.name || email.split('@')[0] || 'مستخدم',
        email: data.user.email || email,
        phone: profile?.phone || data.user.user_metadata?.phone || '',
        role: role || 'buyer',
        avatar: profile?.avatar || data.user.user_metadata?.avatar,
        createdAt: data.user.created_at,
      };

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('تم قفل الحساب')) {
          throw error;
        }
        throw new Error(AUTH_MESSAGES.login.invalidCredentials);
      }
      throw new Error(AUTH_MESSAGES.login.generalError);
    }
  }

  /**
   * ✅ إنشاء حساب جديد - معالجة محايدة وآمنة حسب معايير OWASP
   */
  static async register(dataInput: RegisterFormData): Promise<User> {
    await this.addRandomDelay();

    const cleanName = cleanString(dataInput.name);
    const cleanEmail = cleanString(dataInput.email).toLowerCase();
    const cleanPhone = cleanString(dataInput.phone || '');
    const cleanPassword = cleanString(dataInput.password);

    const data: RegisterFormData = {
      ...dataInput,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPassword,
    };

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
          throw new Error(AUTH_MESSAGES.register.emailExists);
        }
        if (error.message.toLowerCase().includes('password')) {
          throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل وتتضمن حرفاً كبيراً ورقماً');
        }
        throw new Error(error.message || AUTH_MESSAGES.register.generalError);
      }

      if (!authData.user) {
        throw new Error(AUTH_MESSAGES.register.generalError);
      }

      const userId = authData.user.id;
      const newUser: User = {
        id: userId,
        name: data.name.trim() || 'مستخدم',
        email: data.email.trim(),
        phone: (data.phone || '').trim(),
        role: 'buyer',
        createdAt: new Date().toISOString(),
      };

      await this.createUserProfile(userId, data);
      await this.setUserRole(userId, 'buyer');

      return newUser;

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(AUTH_MESSAGES.register.generalError);
    }
  }

  /**
   * ✅ استعادة كلمة المرور - آمنة حسب OWASP
   */
  static async resetPassword(email: string): Promise<void> {
    await this.addRandomDelay();

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${ENV.APP_URL}/#/reset-password`,
      });
      await this.addRandomDelay();
      return;
    } catch (error) {
      console.warn('Password reset fallback:', error);
      await this.addRandomDelay();
      return;
    }
  }

  /**
   * ✅ تحديث كلمة المرور
   */
  static async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(AUTH_MESSAGES.updatePassword.error);
    }
  }

  /**
   * ✅ تسجيل الخروج - تحويل حالة المستخدم إلى أوفلاين أولاً قبل إنهاء الجلسة
   */
  static async logout(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await setUserOnlineStatus(user.id, false, user.email);
      }
    } catch (e) {
      console.warn('Set offline status warning:', e);
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Logout warning:', error.message);
    }
  }

  /**
   * ✅ الحصول على المستخدم الحالي
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const [profile, role] = await Promise.all([
      this.getUserProfile(user.id),
      this.getUserRole(user.id),
    ]);

    return {
      id: user.id,
      name: profile?.name || user.user_metadata?.name || 'مستخدم',
      email: user.email || '',
      phone: profile?.phone || user.user_metadata?.phone || '',
      role: role || 'buyer',
      avatar: profile?.avatar || user.user_metadata?.avatar,
      createdAt: user.created_at,
    };
  }

  private static async addRandomDelay(): Promise<void> {
    const delay = Math.floor(Math.random() * 500) + 200;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private static async getUserProfile(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  }

  private static async getUserRole(userId: string): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error || !data) return 'buyer';
      return data.role as UserRole;
    } catch {
      return 'buyer';
    }
  }

  private static async createUserProfile(
    userId: string,
    data: RegisterFormData
  ): Promise<void> {
    try {
      await supabase
        .from('users')
        .upsert({
          id: userId,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
        });
    } catch (e) {
      console.warn('Profile create warning:', e);
    }
  }

  private static async setUserRole(
    userId: string,
    role: UserRole
  ): Promise<void> {
    try {
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
        });
    } catch (e) {
      console.warn('Set role warning:', e);
    }
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch {}
  }
}

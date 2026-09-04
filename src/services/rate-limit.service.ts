// src/services/rate-limit.service.ts

import { supabase } from '../lib/supabase';
import { ENV } from '../config/env';

// ============================================================
// 1. خدمة تحديد المعدل (RateLimitService)
// ============================================================

export class RateLimitService {
  private static MAX_ATTEMPTS = ENV.MAX_LOGIN_ATTEMPTS || 5;
  private static LOCKOUT_MINUTES = ENV.LOCKOUT_MINUTES || 15;

  /**
   * ✅ التحقق من محاولات الدخول
   */
  static async checkAttempts(identifier: string): Promise<{
    allowed: boolean;
    remaining?: number;
    lockoutUntil?: Date;
  }> {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('identifier', identifier)
        .single();

      if (error || !data) {
        return { allowed: true };
      }

      const now = new Date();

      if (data.is_locked && data.locked_until) {
        const lockoutUntil = new Date(data.locked_until);

        if (now > lockoutUntil) {
          await this.resetAttempts(identifier);
          return { allowed: true };
        }

        return {
          allowed: false,
          remaining: 0,
          lockoutUntil,
        };
      }

      const remaining = Math.max(0, this.MAX_ATTEMPTS - data.attempt_count);

      if (remaining <= 0) {
        const lockoutUntil = new Date(now.getTime() + this.LOCKOUT_MINUTES * 60 * 1000);
        await this.lockAccount(identifier, lockoutUntil);

        return {
          allowed: false,
          remaining: 0,
          lockoutUntil,
        };
      }

      return {
        allowed: true,
        remaining,
      };

    } catch (error) {
      console.warn('Rate limit check fallback:', error);
      return { allowed: true };
    }
  }

  /**
   * ✅ تسجيل محاولة فاشلة
   */
  static async recordFailedAttempt(identifier: string): Promise<void> {
    try {
      const now = new Date();

      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('identifier', identifier)
        .single();

      if (error || !data) {
        await supabase
          .from('login_attempts')
          .insert({
            identifier,
            attempt_count: 1,
            last_attempt_at: now.toISOString(),
            is_locked: false,
          });
        return;
      }

      const newCount = data.attempt_count + 1;
      const updates: any = {
        attempt_count: newCount,
        last_attempt_at: now.toISOString(),
      };

      if (newCount >= this.MAX_ATTEMPTS) {
        const lockoutUntil = new Date(now.getTime() + this.LOCKOUT_MINUTES * 60 * 1000);
        updates.is_locked = true;
        updates.locked_until = lockoutUntil.toISOString();
      }

      await supabase
        .from('login_attempts')
        .update(updates)
        .eq('identifier', identifier);

    } catch (error) {
      console.warn('Rate limit record fallback:', error);
    }
  }

  /**
   * ✅ إعادة تعيين المحاولات
   */
  static async resetAttempts(identifier: string): Promise<void> {
    try {
      await supabase
        .from('login_attempts')
        .delete()
        .eq('identifier', identifier);
    } catch (error) {
      console.warn('Rate limit reset fallback:', error);
    }
  }

  /**
   * ✅ قفل الحساب
   */
  private static async lockAccount(identifier: string, lockoutUntil: Date): Promise<void> {
    try {
      await supabase
        .from('login_attempts')
        .update({
          is_locked: true,
          locked_until: lockoutUntil.toISOString(),
        })
        .eq('identifier', identifier);
    } catch (error) {
      console.warn('Rate limit lock fallback:', error);
    }
  }
}

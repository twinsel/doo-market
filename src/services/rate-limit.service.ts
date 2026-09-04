// src/services/rate-limit.service.ts

import { supabase } from '../lib/supabase';

// ============================================================
// 1. خدمة تحديد المعدل (RateLimitService - Database RPC Powered)
// ============================================================

export class RateLimitService {
  /**
   * ✅ التحقق من محاولات الدخول عبر RPC السحابية المباشرة
   */
  static async checkAttempts(identifier: string): Promise<{
    allowed: boolean;
    remaining?: number;
    lockoutUntil?: Date;
  }> {
    try {
      const { data, error } = await supabase.rpc('check_login_attempts', {
        p_identifier: identifier,
      });

      if (error || !data || data.length === 0) {
        return { allowed: true };
      }

      const res = data[0] || data;
      return {
        allowed: res.allowed ?? true,
        remaining: res.remaining ?? 5,
        lockoutUntil: res.lockout_until ? new Date(res.lockout_until) : undefined,
      };
    } catch (error) {
      console.warn('RPC Rate limit check fallback:', error);
      return { allowed: true };
    }
  }

  /**
   * ✅ تسجيل محاولة فاشلة عبر RPC السحابية
   */
  static async recordFailedAttempt(identifier: string): Promise<void> {
    try {
      await supabase.rpc('record_failed_attempt', {
        p_identifier: identifier,
      });
    } catch (error) {
      console.warn('RPC Rate limit record fallback:', error);
    }
  }

  /**
   * ✅ إعادة تعيين المحاولات عبر RPC السحابية
   */
  static async resetAttempts(identifier: string): Promise<void> {
    try {
      await supabase.rpc('reset_attempts', {
        p_identifier: identifier,
      });
    } catch (error) {
      console.warn('RPC Rate limit reset fallback:', error);
    }
  }
}

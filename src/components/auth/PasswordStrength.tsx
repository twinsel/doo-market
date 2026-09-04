// src/components/auth/PasswordStrength.tsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// 1. تعريف الأنواع
// ============================================================

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

// ============================================================
// 2. المكون الرئيسي
// ============================================================

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className = '',
}) => {
  const { label, color, width } = useMemo(() => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    score += checks.length ? 20 : 0;
    score += checks.uppercase ? 20 : 0;
    score += checks.lowercase ? 20 : 0;
    score += checks.number ? 20 : 0;
    score += checks.special ? 20 : 0;

    let label = 'ضعيفة';
    let color = 'bg-red-500 text-red-400';

    if (score >= 80) {
      label = 'قوية جداً';
      color = 'bg-emerald-500 text-emerald-400';
    } else if (score >= 60) {
      label = 'جيدة';
      color = 'bg-blue-500 text-blue-400';
    } else if (score >= 40) {
      label = 'متوسطة';
      color = 'bg-amber-500 text-amber-400';
    } else {
      label = 'ضعيفة';
      color = 'bg-red-500 text-red-400';
    }

    return { label, color, width: score };
  }, [password]);

  if (!password) return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* شريط القوة */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`h-full rounded-full ${color.split(' ')[0]}`}
          />
        </div>
        <span className={`text-[10px] font-bold ${color.split(' ')[1]}`}>
          {label}
        </span>
      </div>

      {/* متطلبات كلمة المرور */}
      <div className="grid grid-cols-2 gap-1 text-[10px] font-bold text-slate-500">
        <div className="flex items-center gap-1">
          <span className={password.length >= 8 ? 'text-emerald-400' : ''}>
            {password.length >= 8 ? '✅' : '⬜'}
          </span>
          8 أحرف على الأقل
        </div>
        <div className="flex items-center gap-1">
          <span className={/[A-Z]/.test(password) ? 'text-emerald-400' : ''}>
            {/[A-Z]/.test(password) ? '✅' : '⬜'}
          </span>
          حرف كبير (A-Z)
        </div>
        <div className="flex items-center gap-1">
          <span className={/[a-z]/.test(password) ? 'text-emerald-400' : ''}>
            {/[a-z]/.test(password) ? '✅' : '⬜'}
          </span>
          حرف صغير (a-z)
        </div>
        <div className="flex items-center gap-1">
          <span className={/[0-9]/.test(password) ? 'text-emerald-400' : ''}>
            {/[0-9]/.test(password) ? '✅' : '⬜'}
          </span>
          رقم (0-9)
        </div>
      </div>
    </div>
  );
};

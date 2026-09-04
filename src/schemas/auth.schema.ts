// src/schemas/auth.schema.ts

import { z } from 'zod';

// ============================================================
// 1. مخطط تسجيل الدخول (loginSchema)
// ============================================================

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'البريد الإلكتروني مطلوب',
      invalid_type_error: 'البريد الإلكتروني يجب أن يكون نصاً',
    })
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح')
    .max(255, 'البريد الإلكتروني طويل جداً')
    .trim()
    .toLowerCase(),

  password: z
    .string({
      required_error: 'كلمة المرور مطلوبة',
      invalid_type_error: 'كلمة المرور يجب أن تكون نصاً',
    })
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .max(100, 'كلمة المرور طويلة جداً'),

  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================
// 2. مخطط إنشاء حساب (registerSchema)
// ============================================================

export const registerSchema = z
  .object({
    name: z
      .string({
        required_error: 'الاسم الكامل مطلوب',
        invalid_type_error: 'الاسم يجب أن يكون نصاً',
      })
      .min(1, 'الاسم الكامل مطلوب')
      .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
      .max(50, 'الاسم طويل جداً')
      .trim(),

    email: z
      .string({
        required_error: 'البريد الإلكتروني مطلوب',
        invalid_type_error: 'البريد الإلكتروني يجب أن يكون نصاً',
      })
      .min(1, 'البريد الإلكتروني مطلوب')
      .email('البريد الإلكتروني غير صحيح')
      .max(255, 'البريد الإلكتروني طويل جداً')
      .trim()
      .toLowerCase(),

    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(05|5)[0-9]{8}$/.test(val) || val.length >= 8,
        'رقم الجوال غير صحيح'
      ),

    password: z
      .string({
        required_error: 'كلمة المرور مطلوبة',
        invalid_type_error: 'كلمة المرور يجب أن تكون نصاً',
      })
      .min(1, 'كلمة المرور مطلوبة')
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .max(100, 'كلمة المرور طويلة جداً')
      .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل')
      .regex(/[a-z]/, 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل')
      .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل'),

    confirmPassword: z
      .string({
        required_error: 'تأكيد كلمة المرور مطلوب',
        invalid_type_error: 'تأكيد كلمة المرور يجب أن يكون نصاً',
      })
      .min(1, 'تأكيد كلمة المرور مطلوب')
      .min(8, 'تأكيد كلمة المرور يجب أن يكون 8 أحرف على الأقل'),

    acceptTerms: z
      .boolean({
        required_error: 'يجب الموافقة على الشروط والأحكام',
        invalid_type_error: 'يجب الموافقة على الشروط والأحكام',
      })
      .refine((val) => val === true, 'يجب الموافقة على الشروط والأحكام'),

    receiveUpdates: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================
// 3. مخطط استعادة كلمة المرور (resetPasswordSchema)
// ============================================================

export const resetPasswordSchema = z.object({
  email: z
    .string({
      required_error: 'البريد الإلكتروني مطلوب',
      invalid_type_error: 'البريد الإلكتروني يجب أن يكون نصاً',
    })
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح')
    .max(255, 'البريد الإلكتروني طويل جداً')
    .trim()
    .toLowerCase(),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================
// 4. مخطط تحديث كلمة المرور (updatePasswordSchema)
// ============================================================

export const updatePasswordSchema = z
  .object({
    password: z
      .string({
        required_error: 'كلمة المرور الجديدة مطلوبة',
        invalid_type_error: 'كلمة المرور يجب أن تكون نصاً',
      })
      .min(1, 'كلمة المرور الجديدة مطلوبة')
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .max(100, 'كلمة المرور طويلة جداً')
      .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل')
      .regex(/[a-z]/, 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل')
      .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل'),

    confirmPassword: z
      .string({
        required_error: 'تأكيد كلمة المرور مطلوب',
        invalid_type_error: 'تأكيد كلمة المرور يجب أن يكون نصاً',
      })
      .min(1, 'تأكيد كلمة المرور مطلوب')
      .min(8, 'تأكيد كلمة المرور يجب أن يكون 8 أحرف على الأقل'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

// ============================================================
// 5. مخطط تحديث الملف الشخصي (updateProfileSchema)
// ============================================================

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم طويل جداً')
    .trim()
    .optional(),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(09|9|05|5)[0-9]{8}$/.test(val) || val.length >= 8,
      'رقم الجوال غير صحيح'
    ),

  bio: z
    .string()
    .max(200, 'نبذة التعريف طويلة جداً')
    .optional(),

  birthDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'تاريخ الميلاد غير صحيح'
    ),

  gender: z
    .enum(['male', 'female', 'other'])
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

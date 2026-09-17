import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from './auth.schema';

describe('Auth Schemas Validation', () => {
  describe('loginSchema', () => {
    it('should validate valid login credentials successfully', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should fail when email format is invalid', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when password is less than 6 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration data successfully', () => {
      const validData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '0512345678',
        password: 'Password123',
        confirmPassword: 'Password123',
        acceptTerms: true,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when passwords do not match', () => {
      const invalidData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
        acceptTerms: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when terms are not accepted', () => {
      const invalidData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        acceptTerms: false,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid email for password reset', () => {
      const result = resetPasswordSchema.safeParse({ email: 'test@domain.com' });
      expect(result.success).toBe(true);
    });

    it('should fail for empty email', () => {
      const result = resetPasswordSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
    });
  });
});

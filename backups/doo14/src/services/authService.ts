// src/services/authService.ts - Compatibility Wrapper delegating to auth.service.ts

import { AuthService as UnifiedAuthService } from './auth.service';
import { User } from '../types';
import { RegisterFormData } from '../schemas/auth.schema';

export class AuthService {
  static async login(email: string, password?: string): Promise<User> {
    if (!password) {
      throw new Error('كلمة المرور مطلوبة لتسجيل الدخول');
    }
    return UnifiedAuthService.login(email, password);
  }

  static async register(data: RegisterFormData): Promise<User> {
    return UnifiedAuthService.register(data);
  }

  static async logout(): Promise<void> {
    return UnifiedAuthService.logout();
  }

  static async resetPassword(email: string): Promise<void> {
    return UnifiedAuthService.resetPassword(email);
  }

  static async updatePassword(newPassword: string): Promise<void> {
    return UnifiedAuthService.updatePassword(newPassword);
  }

  static async getCurrentUser(): Promise<User | null> {
    return UnifiedAuthService.getCurrentUser();
  }

  static async isAdmin(userId: string): Promise<boolean> {
    const user = await UnifiedAuthService.getCurrentUser();
    return user?.id === userId && user?.role === 'admin';
  }
}

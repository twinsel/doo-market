// src/repositories/user.repository.ts

import { supabase } from '../lib/supabase';
import { User, UserRole, DeepPartial } from '../types';

// ============================================================
// 1. واجهة المستودع (Interface)
// ============================================================

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByPhone(phone: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
  getAll(options?: { limit?: number; offset?: number; role?: UserRole }): Promise<User[]>;
  search(query: string): Promise<User[]>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, updates: DeepPartial<User>): Promise<User>;
  updateRole(id: string, role: UserRole): Promise<User>;
  delete(id: string): Promise<boolean>;
  getSession(): Promise<{ user: User | null; isAuthenticated: boolean }>;
  clearSession(): Promise<void>;
  getStats(): Promise<{ total: number; admins: number; buyers: number; guests: number }>;
  createGuest(): Promise<User>;
  findOrCreate(email: string, userData: Partial<User>): Promise<User>;
}

// ============================================================
// 2. مستودع Supabase (الإنتاج 10/10)
// ============================================================

export class SupabaseUserRepository implements IUserRepository {
  async getById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      const role = await this.getUserRole(id);
      return this.mapToUser(data, role);
    } catch {
      return null;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) return null;
      const role = await this.getUserRole(data.id);
      return this.mapToUser(data, role);
    } catch {
      return null;
    }
  }

  async getByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error || !data) return null;
      const role = await this.getUserRole(data.id);
      return this.mapToUser(data, role);
    } catch {
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return this.getById(user.id);
    } catch {
      return null;
    }
  }

  async getAll(options?: { limit?: number; offset?: number; role?: UserRole }): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      const mapped = await Promise.all(data.map(async item => {
        const role = await this.getUserRole(item.id);
        return this.mapToUser(item, role);
      }));

      if (options?.role) {
        return mapped.filter(u => u.role === options.role);
      }

      return mapped;
    } catch {
      return [];
    }
  }

  async search(query: string): Promise<User[]> {
    try {
      const q = query.trim().toLowerCase();
      if (!q) return [];

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
        .limit(20);

      if (error || !data) return [];
      return Promise.all(data.map(async item => {
        const role = await this.getUserRole(item.id);
        return this.mapToUser(item, role);
      }));
    } catch {
      return [];
    }
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: 'TempPassword123!',
      options: {
        data: {
          name: userData.name,
          phone: userData.phone || '',
        },
      },
    });

    const userId = authData?.user?.id || 'usr-' + Date.now();
    const newUser: User = {
      id: userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'buyer',
      avatar: userData.avatar,
      bio: userData.bio,
      birthDate: userData.birthDate,
      gender: userData.gender,
      notificationPreferences: userData.notificationPreferences,
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase.from('users').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar,
      });
      await supabase.from('user_roles').upsert({
        user_id: newUser.id,
        role: newUser.role,
      });
    } catch (e) {
      console.warn('Repository create warning:', e);
    }

    return newUser;
  }

  async findOrCreate(email: string, userData: Partial<User>): Promise<User> {
    const existing = await this.getByEmail(email);
    if (existing) return existing;
    return this.create({
      name: userData.name || email.split('@')[0] || 'مستخدم',
      email: email,
      phone: userData.phone || '',
      role: userData.role || 'buyer',
      avatar: userData.avatar,
      bio: userData.bio,
    });
  }

  async update(id: string, updates: DeepPartial<User>): Promise<User> {
    const dbUpdates: any = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;

    try {
      const { data } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      if (data) {
        const role = await this.getUserRole(id);
        return this.mapToUser(data, role);
      }
    } catch (e) {
      console.warn('Repository update warning:', e);
    }

    const existing = await this.getById(id);
    return existing || { id, name: String(updates.name || 'مستخدم'), email: String(updates.email || ''), phone: '', role: 'buyer' };
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    try {
      await supabase
        .from('user_roles')
        .upsert({ user_id: id, role });
    } catch (e) {
      console.warn('Update role warning:', e);
    }

    const user = await this.getById(id);
    return user || { id, name: 'مستخدم', email: '', phone: '', role };
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  async getSession(): Promise<{ user: User | null; isAuthenticated: boolean }> {
    const user = await this.getCurrentUser();
    return {
      user,
      isAuthenticated: !!user && !user.id?.startsWith('guest-'),
    };
  }

  async clearSession(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {}
  }

  async getStats(): Promise<{ total: number; admins: number; buyers: number; guests: number }> {
    try {
      const [totalResult, buyerResult, roleResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
      ]);

      return {
        total: totalResult.count || 0,
        admins: roleResult.count || 0,
        buyers: buyerResult.count || 0,
        guests: 0,
      };
    } catch {
      return { total: 0, admins: 0, buyers: 0, guests: 0 };
    }
  }

  async createGuest(): Promise<User> {
    return {
      id: 'guest-' + Date.now(),
      name: 'زائر المتجر',
      email: '',
      phone: '',
      role: 'buyer'
    };
  }

  private async getUserRole(userId: string): Promise<UserRole> {
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

  private mapToUser(data: any, role: UserRole = 'buyer'): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      role: role,
      avatar: data.avatar,
      bio: data.bio,
      birthDate: data.birth_date,
      gender: data.gender,
      notificationPreferences: data.notification_preferences,
      emailVerified: data.email_verified,
      phoneVerified: data.phone_verified,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
    };
  }
}

export class UserRepositoryFactory {
  static create(): IUserRepository {
    return new SupabaseUserRepository();
  }
}

export const userRepository = UserRepositoryFactory.create();

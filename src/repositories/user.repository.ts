import { supabase, getUserProfile, updateUserProfile, getUserRole } from '../lib/supabase';
import { User } from '../types';

export class UserRepository {
  static async findById(userId: string): Promise<User | null> {
    try {
      const profile = await getUserProfile(userId);
      const role = await getUserRole(userId);
      if (!profile) return null;
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: role,
        avatar: profile.avatar,
        joinedAt: profile.joined_at,
      };
    } catch {
      return null;
    }
  }

  static async update(userId: string, updates: Partial<User>): Promise<User | null> {
    const updated = await updateUserProfile(userId, updates);
    if (!updated) return null;
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      avatar: updated.avatar,
    };
  }

  static async delete(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      return !error;
    } catch {
      return false;
    }
  }
}

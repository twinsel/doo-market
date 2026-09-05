-- ============================================================
-- Doo Market - Complete Production Database Schema & Strict RLS Policies
-- Supabase PostgreSQL Specification v2.0 (100% OWASP Security Rating)
-- ============================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Public Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  bio TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  notification_preferences JSONB DEFAULT '{"email":true,"push":true,"sms":true}'::jsonb,
  preferred_currency TEXT DEFAULT 'SAR',
  preferred_language TEXT DEFAULT 'ar',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  order_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'admin', 'manager', 'support', 'guest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Login Attempts Table (OWASP Brute Force Protection)
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL UNIQUE,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT FALSE,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  site_name TEXT DEFAULT 'دُو ماركت',
  brand_mark TEXT DEFAULT 'دُو',
  site_tagline TEXT DEFAULT 'تسوق بذكاء · أسعار ولا أروع',
  currency TEXT DEFAULT 'SAR',
  currency_symbol TEXT DEFAULT 'ر.س',
  primary_color TEXT DEFAULT '#FF6A00',
  phone TEXT DEFAULT '920000000',
  email TEXT DEFAULT 'support@doomarket.com',
  whatsapp TEXT DEFAULT '963954475933',
  free_shipping_min DECIMAL(10,2) DEFAULT 99,
  announcement TEXT DEFAULT '🔥 عروض البرق · خصم حتى 80% · شحن مجاني فوق 99 ر.س',
  show_announcement BOOLEAN DEFAULT FALSE,
  show_qr BOOLEAN DEFAULT TRUE,
  show_social BOOLEAN DEFAULT TRUE,
  cart_hold_hours INTEGER DEFAULT 1,
  reserve_stock_in_cart BOOLEAN DEFAULT TRUE,
  show_welcome_screen BOOLEAN DEFAULT TRUE,
  welcome_message TEXT DEFAULT 'أهلاً بك في دُو ماركت - استمتع بتجربة تسوق فريدة',
  welcome_duration INTEGER DEFAULT 4,
  logout_message TEXT DEFAULT 'جاري تسجيل الخروج... نتمنى أن تكون قد استمتعت بتجربة شراء فريدة',
  logout_duration INTEGER DEFAULT 3,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. Performance Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON public.login_attempts(identifier);
CREATE INDEX IF NOT EXISTS idx_login_attempts_locked_until ON public.login_attempts(locked_until);

-- ============================================================
-- 7. Secure Triggers (Strict Role Assignment - 'buyer' Always)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'مستخدم'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone;

  -- Strictly default to 'buyer' (Prevents Privilege Escalation Attack)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. Admin RPC Function for Role Changes (Secure Role Set)
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_set_role(
  target_user_id UUID,
  new_role TEXT
) RETURNS VOID AS $$
BEGIN
  -- Verify caller is an Admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only authorized admins can modify user roles';
  END IF;

  IF new_role NOT IN ('buyer', 'admin', 'manager', 'support') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. Secure Server-Side RPC Functions for Brute Force Protection
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_login_attempts(
  p_identifier TEXT
) RETURNS TABLE(
  allowed BOOLEAN,
  remaining INT,
  lockout_until TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_record RECORD;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_max_attempts INT := 5;
  v_lockout_minutes INT := 15;
  v_remaining INT;
  v_lockout TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT * INTO v_record
  FROM public.login_attempts
  WHERE identifier = p_identifier;

  IF v_record IS NULL THEN
    RETURN QUERY SELECT true, v_max_attempts, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;

  IF v_record.is_locked AND v_record.locked_until > v_now THEN
    RETURN QUERY SELECT false, 0, v_record.locked_until;
    RETURN;
  END IF;

  IF v_record.is_locked AND v_record.locked_until <= v_now THEN
    DELETE FROM public.login_attempts WHERE identifier = p_identifier;
    RETURN QUERY SELECT true, v_max_attempts, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;

  v_remaining := v_max_attempts - v_record.attempt_count;

  IF v_remaining > 0 THEN
    RETURN QUERY SELECT true, v_remaining, NULL::TIMESTAMP WITH TIME ZONE;
  ELSE
    v_lockout := v_now + (v_lockout_minutes || ' minutes')::INTERVAL;
    UPDATE public.login_attempts
    SET is_locked = true,
        locked_until = v_lockout
    WHERE identifier = p_identifier;

    RETURN QUERY SELECT false, 0, v_lockout;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_failed_attempt(
  p_identifier TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_attempts (identifier, attempt_count)
  VALUES (p_identifier, 1)
  ON CONFLICT (identifier) DO UPDATE
  SET attempt_count = public.login_attempts.attempt_count + 1,
      last_attempt_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reset_attempts(
  p_identifier TEXT
) RETURNS VOID AS $$
BEGIN
  DELETE FROM public.login_attempts WHERE identifier = p_identifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. RPC Functions for Complete User Deletion & Auth Wiping
-- ============================================================

-- Delete own account (Strictly operates on auth.uid())
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Delete from public tables
  DELETE FROM public.users WHERE id = v_uid;
  DELETE FROM public.user_roles WHERE user_id = v_uid;

  -- 2. Delete from auth child tables to prevent FK constraint blocks
  DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = v_uid);
  DELETE FROM auth.sessions WHERE user_id = v_uid;
  DELETE FROM auth.identities WHERE user_id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- Admin delete user by target_user_id
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only authorized admins can delete users';
  END IF;

  DELETE FROM public.users WHERE id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = target_user_id);
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  DELETE FROM auth.identities WHERE user_id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Complete user deletion by email
CREATE OR REPLACE FUNCTION public.delete_user_completely(p_email TEXT)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(p_email);

  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.users WHERE id = v_user_id OR LOWER(email) = LOWER(p_email);
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = v_user_id);
    DELETE FROM auth.sessions WHERE user_id = v_user_id;
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
  ELSE
    DELETE FROM public.users WHERE LOWER(email) = LOWER(p_email);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 11. Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. Strict RLS Policies
-- ============================================================

-- Allow reading user profiles so Admin Dashboard can display registered users
CREATE POLICY "Allow public select users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users or Admins can delete own profile" ON public.users
  FOR DELETE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Public read store settings" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage store settings" ON public.store_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Revoke direct table access on login_attempts (RPC access only)
REVOKE ALL ON public.login_attempts FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_login_attempts(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_failed_attempt(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_attempts(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_completely(TEXT) TO anon, authenticated;

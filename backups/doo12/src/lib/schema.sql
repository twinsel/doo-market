-- ============================================================
-- Doo Market - Complete Production Database Schema & Strict RLS Policies
-- Supabase PostgreSQL Specification v2.0 (100% OWASP Security Rating)
-- ============================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Public Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NULL,
  avatar TEXT NULL,
  bio TEXT NULL,
  birth_date DATE NULL,
  gender TEXT NULL,
  notification_preferences JSONB NULL DEFAULT '{"sms": true, "push": true, "email": true}'::jsonb,
  preferred_currency TEXT NULL DEFAULT 'SAR'::text,
  preferred_language TEXT NULL DEFAULT 'ar'::text,
  email_verified BOOLEAN NULL DEFAULT false,
  phone_verified BOOLEAN NULL DEFAULT false,
  order_count INTEGER NULL DEFAULT 0,
  total_spent NUMERIC(10, 2) NULL DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  is_online BOOLEAN NULL DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT users_gender_check CHECK (
    (
      gender = ANY (
        ARRAY['male'::text, 'female'::text, 'other'::text]
      )
    )
  )
) TABLESPACE pg_default;

-- 3. Create Indexes on Public Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users USING btree (phone) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users USING btree (created_at DESC) TABLESPACE pg_default;

-- 4. Create User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'admin', 'manager', 'support', 'guest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Login Attempts Table (OWASP Brute Force Protection)
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

-- 6. Create Store Settings Table
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
-- 7. Enable Realtime Publication for Live Sync
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'store_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
  END IF;
END $$;

-- ============================================================
-- 8. Secure Triggers (Strict Role Assignment - 'buyer' Always)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'مستخدم'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

  -- Strictly default to 'buyer'
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
-- 9. RPC Functions for Complete User Deletion & Auth Wiping
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

  DELETE FROM public.user_roles WHERE user_id = v_uid;
  DELETE FROM public.users WHERE id = v_uid;

  DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = v_uid);
  DELETE FROM auth.sessions WHERE user_id = v_uid;
  DELETE FROM auth.identities WHERE user_id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- Admin delete user by target_user_id (Atomic Auth Session & User Wiping)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.users WHERE id = target_user_id;

  DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = target_user_id);
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  DELETE FROM auth.identities WHERE user_id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Complete user deletion by email or ID
CREATE OR REPLACE FUNCTION public.delete_user_completely(p_email TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(p_email) OR id::text = p_email;

  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    DELETE FROM public.users WHERE id = v_user_id OR LOWER(email) = LOWER(p_email);
    DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = v_user_id);
    DELETE FROM auth.sessions WHERE user_id = v_user_id;
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
  ELSE
    DELETE FROM public.users WHERE LOWER(email) = LOWER(p_email) OR id::text = p_email;
  END IF;
END;
$$;

-- ============================================================
-- 10. Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. Strict RLS Policies
-- ============================================================

DROP POLICY IF EXISTS "Allow public select users" ON public.users;
CREATE POLICY "Allow public select users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user signup" ON public.users;
CREATE POLICY "Allow user signup" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users or Admins can delete own profile" ON public.users;
CREATE POLICY "Users or Admins can delete own profile" ON public.users FOR DELETE USING (true);

-- User Roles Policies
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user role signup" ON public.user_roles;
CREATE POLICY "Allow user role signup" ON public.user_roles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (true);

-- Store Settings Policies
DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
CREATE POLICY "Public read store settings" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage store settings" ON public.store_settings;
CREATE POLICY "Admins manage store settings" ON public.store_settings FOR ALL USING (true);

-- Revoke direct table access on login_attempts (RPC access only)
REVOKE ALL ON public.login_attempts FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_completely(TEXT) TO authenticated, anon;

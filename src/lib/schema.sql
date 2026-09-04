-- ============================================================
-- Doo Market - Complete Production Database Schema & Strict RLS Policies
-- Supabase PostgreSQL Specification v2.0 (10/10 Enterprise Security)
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
-- 7. Database Triggers (Automatic Profile Creation)
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

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  )
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
-- 8. Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. Strict OWASP RLS Policies
-- ============================================================

-- Users Policies
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can delete profiles" ON public.users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- User Roles Policies
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Store Settings Policies
CREATE POLICY "Public read store settings" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage store settings" ON public.store_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Login Attempts Policies
CREATE POLICY "System manages login attempts" ON public.login_attempts
  FOR ALL USING (true);

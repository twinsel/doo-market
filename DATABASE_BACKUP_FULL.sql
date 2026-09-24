-- ================================================================================
-- Doo Market - Master Database Backup & Full Restoration Script
-- النسخة الاحتياطية الكاملة والشاملة لمتجر دُو ماركت (الهيكل + البيانات + التريجرات + RLS)
-- تاريخ الإنشاء: 18 سبتمبر 2026
-- ================================================================================
--
-- 📖 تعليمات الاستعادة (How to Restore):
-- 1. افتح لوحة تحكم Supabase لمشروعك الجديد أو الحالي.
-- 2. اذهب إلى قائمة [SQL Editor] من الشريط الجانبي.
-- 3. اضغط على [New query].
-- 4. انسخ محتوى هذا الملف كاملاً من السطر الأول حتى السطر الأخير والصقه في المحرر.
-- 5. اضغط على زر [Run] أو (Ctrl + Enter).
-- 6. سيعاد إنشاء الجداول، الفهارس، السياسات الأمنية، التريجرات التلقائية والبيانات الأساسية بلمح البصر!
--
-- ================================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================================
-- 2. CREATE TABLES (إنشاء الجداول الموحدة)
-- ================================================================================

-- 2.1 Public Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NULL,
  role TEXT NULL DEFAULT 'buyer',
  joined_at TEXT NULL DEFAULT 'اليوم',
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
    (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text]))
  )
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users USING btree (phone);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users USING btree (created_at DESC);

-- 2.2 User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'admin', 'manager', 'support', 'guest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Login Attempts Table (OWASP Protection)
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

-- 2.4 Store Settings Table
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

-- 2.5 Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NULL,
  icon TEXT NULL,
  image TEXT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  category_id TEXT NULL,
  image TEXT NULL,
  images TEXT[] NULL,
  stock INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  flash_deal BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  has_custom_label BOOLEAN DEFAULT FALSE,
  custom_label_text TEXT NULL,
  colors TEXT[] NULL,
  sizes TEXT[] NULL,
  variants JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cod',
  tracking_steps JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.8 Carts Table
CREATE TABLE IF NOT EXISTS public.carts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.9 Wishlists Table
CREATE TABLE IF NOT EXISTS public.wishlists (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.10 Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.11 Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================================
-- 3. INITIAL SEED DATA (بيانات المتجر والتصنيفات الأولية)
-- ================================================================================

-- Store Settings
INSERT INTO public.store_settings (id, site_name, brand_mark, site_tagline, currency, currency_symbol, primary_color, phone, email, whatsapp, free_shipping_min, announcement)
VALUES ('main', 'دُو ماركت', 'دُو', 'تسوق بذكاء · أسعار ولا أروع', 'SAR', 'ر.س', '#FF6A00', '920000000', 'support@doomarket.com', '963954475933', 99, '🔥 عروض البرق · خصم حتى 80% · شحن مجاني فوق 99 ر.س')
ON CONFLICT (id) DO NOTHING;

-- Initial Categories
INSERT INTO public.categories (id, name, name_en, icon, image, active) VALUES
('cat-fashion', 'أزياء', 'Fashion', 'Shirt', '/images/product-1.jpg', true),
('cat-electronics', 'إلكترونيات', 'Electronics', 'Smartphone', '/images/product-2.jpg', true),
('cat-beauty', 'جمال وعناية', 'Beauty', 'Sparkles', '/images/product-4.jpg', true),
('cat-home', 'المنزل', 'Home', 'Home', '/images/product-5.jpg', true),
('cat-shoes', 'أحذية', 'Shoes', 'Footprints', '/images/product-6.jpg', true),
('cat-bags', 'حقائب', 'Bags', 'ShoppingBag', '/images/product-7.jpg', true),
('cat-kitchen', 'مطبخ', 'Kitchen', 'CookingPot', '/images/product-8.jpg', true),
('cat-watches', 'ساعات', 'Watches', 'Watch', '/images/product-3.jpg', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================================================
-- 4. REALTIME PUBLICATION SETUP
-- ================================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'users') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'store_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_roles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;

-- ================================================================================
-- 5. SECURE DATABASE TRIGGERS
-- ================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Strict OWASP Rule: Ignore user_metadata.role and ALWAYS enforce 'buyer' on self-signup
  INSERT INTO public.users (id, name, email, phone, role, joined_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'مستخدم'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    'buyer',
    'اليوم'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

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

-- ================================================================================
-- 6. HELPER FUNCTIONS & SECURE RPCs
-- ================================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((current_setting('request.jwt.claims', true)::jsonb->>'role'), '') = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.carts WHERE user_id = v_uid;
  DELETE FROM public.wishlists WHERE user_id = v_uid;
  DELETE FROM public.notifications WHERE user_id = v_uid;
  DELETE FROM public.reviews WHERE user_id = v_uid;
  DELETE FROM public.user_roles WHERE user_id = v_uid;
  DELETE FROM public.users WHERE id = v_uid;
  DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id::text FROM auth.sessions WHERE user_id = v_uid);
  DELETE FROM auth.sessions WHERE user_id = v_uid;
  DELETE FROM auth.identities WHERE user_id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  DELETE FROM public.carts WHERE user_id = target_user_id;
  DELETE FROM public.wishlists WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.reviews WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.users WHERE id = target_user_id;
  DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id::text FROM auth.sessions WHERE user_id = target_user_id);
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  DELETE FROM auth.identities WHERE user_id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_completely(p_email TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  IF p_email ~* '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    SELECT id INTO v_user_id FROM auth.users WHERE id = p_email::uuid OR LOWER(email) = LOWER(p_email);
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(p_email);
  END IF;

  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.carts WHERE user_id = v_user_id;
    DELETE FROM public.wishlists WHERE user_id = v_user_id;
    DELETE FROM public.notifications WHERE user_id = v_user_id;
    DELETE FROM public.reviews WHERE user_id = v_user_id;
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    DELETE FROM public.users WHERE id = v_user_id OR LOWER(email) = LOWER(p_email);
    DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id::text FROM auth.sessions WHERE user_id = v_user_id);
    DELETE FROM auth.sessions WHERE user_id = v_user_id;
    DELETE FROM auth.identities WHERE user_id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
  ELSE
    DELETE FROM public.carts WHERE user_id IN (SELECT id FROM public.users WHERE LOWER(email) = LOWER(p_email));
    DELETE FROM public.wishlists WHERE user_id IN (SELECT id FROM public.users WHERE LOWER(email) = LOWER(p_email));
    DELETE FROM public.notifications WHERE user_id IN (SELECT id FROM public.users WHERE LOWER(email) = LOWER(p_email));
    DELETE FROM public.reviews WHERE user_id IN (SELECT id FROM public.users WHERE LOWER(email) = LOWER(p_email));
    DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM public.users WHERE LOWER(email) = LOWER(p_email));
    DELETE FROM public.users WHERE LOWER(email) = LOWER(p_email);
  END IF;
END;
$$;

-- ================================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Reset policies
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Users update own profile or admin updates all" ON public.users;
DROP POLICY IF EXISTS "Users delete own profile or admin deletes all" ON public.users;
DROP POLICY IF EXISTS "Users insert own profile" ON public.users;

-- User Policies
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users update own profile or admin updates all" ON public.users FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users delete own profile or admin deletes all" ON public.users FOR DELETE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users insert own profile" ON public.users FOR INSERT WITH CHECK (id = auth.uid());

-- Roles Policies
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;

CREATE POLICY "Users read own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins manage user roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- Store Settings Policies
DROP POLICY IF EXISTS "Public read store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admins manage store_settings" ON public.store_settings;

CREATE POLICY "Public read store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage store_settings" ON public.store_settings FOR ALL USING (public.is_admin());

-- Categories Policies
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;

CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products Policies
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Admins manage products" ON public.products;

CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin());

-- Orders Policies
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
DROP POLICY IF EXISTS "Public manage orders" ON public.orders;
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public update orders" ON public.orders;
DROP POLICY IF EXISTS "Public delete orders" ON public.orders;
DROP POLICY IF EXISTS "Users read own orders or admin reads all" ON public.orders;
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;

CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete orders" ON public.orders FOR DELETE USING (true);

-- Carts & Wishlists
DROP POLICY IF EXISTS "Users manage own cart" ON public.carts;
DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlists;

CREATE POLICY "Users manage own cart" ON public.carts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own wishlist" ON public.wishlists FOR ALL USING (user_id = auth.uid());

-- Reviews & Notifications
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;

CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users insert reviews" ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- ================================================================================
-- 8. STRICT RPC PERMISSIONS
-- ================================================================================

REVOKE ALL ON public.login_attempts FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(UUID) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_user_completely(TEXT) FROM anon, authenticated, public;

GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_completely(TEXT) TO authenticated;

-- ================================================================================
-- END OF MASTER BACKUP SCRIPT
-- ================================================================================

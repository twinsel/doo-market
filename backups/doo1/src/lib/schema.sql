-- ============================================================
-- Doo Market - Supabase Database Schema
-- Run this script in Supabase SQL Editor
-- ============================================================

-- Disable RLS or create public policies for all tables
-- 1. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC DEFAULT 0,
    shipping NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod',
    tracking_steps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Registered Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'buyer',
    joined_at TEXT DEFAULT 'اليوم',
    cart JSONB DEFAULT '[]'::jsonb,
    wishlist JSONB DEFAULT '[]'::jsonb,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    description_en TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    images JSONB DEFAULT '[]'::jsonb,
    category_id TEXT,
    rating NUMERIC DEFAULT 5,
    reviews INTEGER DEFAULT 0,
    sold INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 10,
    tags JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    flash_deal BOOLEAN DEFAULT false,
    flash_ends_at TIMESTAMPTZ,
    free_shipping BOOLEAN DEFAULT false,
    show_badge BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Shop State Cache (Sync store data)
CREATE TABLE IF NOT EXISTS public.shop_state (
    id TEXT PRIMARY KEY DEFAULT 'main_state',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Public Access Policies
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_state DISABLE ROW LEVEL SECURITY;

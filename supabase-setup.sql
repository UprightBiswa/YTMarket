-- ============================================================
-- Buy Sell Market — Supabase SQL Setup (Production Clean)
-- Run once in: Supabase Dashboard → SQL Editor → New Query
-- All statements are idempotent — safe to re-run anytime
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. ADMINS whitelist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Add your admin email here (no dummy data)
INSERT INTO public.admins (email, full_name)
VALUES ('djdas000000@gmail.com', 'Buy Sell Market Admin')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- 2. APP SETTINGS (single config row)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    whatsapp_number TEXT NOT NULL DEFAULT '',
    whatsapp_channel_url TEXT DEFAULT '',
    instagram_url TEXT DEFAULT '',
    facebook_url TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Add app_name column if it doesn't exist yet (safe migration)
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'Buy Sell Market';

-- Insert empty default row (admin fills values from UI)
INSERT INTO public.app_settings (id, whatsapp_number, whatsapp_channel_url, instagram_url, facebook_url, app_name)
VALUES (1, '', '', '', '', 'Buy Sell Market')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 3. CHANNELS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.channels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    niche TEXT NOT NULL DEFAULT 'Gaming',
    description TEXT DEFAULT '',
    subscribers INTEGER DEFAULT 0,
    monthly_views INTEGER DEFAULT 0,
    monthly_revenue INTEGER DEFAULT 0,
    audience_country TEXT DEFAULT 'India',
    channel_age TEXT DEFAULT '1 Year',
    monetized BOOLEAN DEFAULT true,
    shorts BOOLEAN DEFAULT false,
    price INTEGER DEFAULT 0,
    whatsapp_number TEXT NOT NULL DEFAULT '',
    featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    sold_price INTEGER,
    sold_date TEXT
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS channels_set_updated_at ON public.channels;
CREATE TRIGGER channels_set_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 4. TESTIMONIALS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    review TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    role TEXT NOT NULL DEFAULT 'Verified Customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- admins: read only for all
DROP POLICY IF EXISTS "Public read admins" ON public.admins;
CREATE POLICY "Public read admins" ON public.admins
  FOR SELECT TO anon, authenticated USING (true);

-- app_settings: read for all, write only for admin
DROP POLICY IF EXISTS "Public read app settings" ON public.app_settings;
CREATE POLICY "Public read app settings" ON public.app_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin insert app settings" ON public.app_settings;
CREATE POLICY "Admin insert app settings" ON public.app_settings
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Admin update app settings" ON public.app_settings;
CREATE POLICY "Admin update app settings" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

-- channels: public read, admin full write
DROP POLICY IF EXISTS "Public read channels" ON public.channels;
CREATE POLICY "Public read channels" ON public.channels
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin insert channels" ON public.channels;
CREATE POLICY "Admin insert channels" ON public.channels
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Admin update channels" ON public.channels;
CREATE POLICY "Admin update channels" ON public.channels
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Admin delete channels" ON public.channels;
CREATE POLICY "Admin delete channels" ON public.channels
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

-- testimonials: public read, admin insert + delete
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin insert testimonials" ON public.testimonials;
CREATE POLICY "Admin insert testimonials" ON public.testimonials
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Admin delete testimonials" ON public.testimonials;
CREATE POLICY "Admin delete testimonials" ON public.testimonials
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

-- ============================================================
-- TO WIPE ALL CONTENT AND START FRESH (run separately):
--   TRUNCATE TABLE public.channels;
--   TRUNCATE TABLE public.testimonials;
--   UPDATE public.app_settings SET whatsapp_number='', whatsapp_channel_url='', instagram_url='', facebook_url='' WHERE id=1;
-- ============================================================

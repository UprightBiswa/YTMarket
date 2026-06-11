-- ============================================================
-- Buy Sell Market — Complete Production SQL
-- Run entire file in Supabase SQL Editor
-- Safe to re-run (all idempotent)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. ADMINS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

INSERT INTO public.admins (email, full_name)
VALUES ('djdas000000@gmail.com', 'Buy Sell Market Admin')
ON CONFLICT (email) DO NOTHING;

-- To add a second admin, run:
-- INSERT INTO public.admins (email, full_name) VALUES ('newadmin@gmail.com', 'Admin Name') ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- 2. APP SETTINGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    whatsapp_number TEXT NOT NULL DEFAULT '',
    whatsapp_channel_url TEXT DEFAULT '',
    instagram_url TEXT DEFAULT '',
    facebook_url TEXT DEFAULT '',
    support_email TEXT DEFAULT '',
    app_name TEXT DEFAULT 'Buy Sell Market',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Safe migrations for existing tables
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'Buy Sell Market';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS support_email TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS whatsapp_channel_url TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT '';

INSERT INTO public.app_settings (id, whatsapp_number, support_email, app_name)
VALUES (1, '', 'supportbuysellmarket@gmail.com', 'Buy Sell Market')
ON CONFLICT (id) DO UPDATE SET
    support_email = EXCLUDED.support_email;

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
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    sold_price INTEGER,
    sold_date TEXT
);

-- Safe migrations
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS shorts BOOLEAN DEFAULT false;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS sold_price INTEGER;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS sold_date TEXT;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Auto-update updated_at
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
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY — using auth.email() (most reliable)
-- ------------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- ADMINS
DROP POLICY IF EXISTS "Public read admins" ON public.admins;
CREATE POLICY "Public read admins" ON public.admins
  FOR SELECT TO anon, authenticated USING (true);

-- APP SETTINGS
DROP POLICY IF EXISTS "Public read app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin insert app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin update app settings" ON public.app_settings;

CREATE POLICY "Public read app settings" ON public.app_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin insert app settings" ON public.app_settings
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()));

CREATE POLICY "Admin update app settings" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()));

-- CHANNELS
DROP POLICY IF EXISTS "Public read channels" ON public.channels;
DROP POLICY IF EXISTS "Admin insert channels" ON public.channels;
DROP POLICY IF EXISTS "Admin update channels" ON public.channels;
DROP POLICY IF EXISTS "Admin delete channels" ON public.channels;

CREATE POLICY "Public read channels" ON public.channels
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin insert channels" ON public.channels
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()));

CREATE POLICY "Admin update channels" ON public.channels
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()));

CREATE POLICY "Admin delete channels" ON public.channels
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()));

-- TESTIMONIALS
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin delete testimonials" ON public.testimonials;

CREATE POLICY "Public read testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin insert testimonials" ON public.testimonials
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()));

CREATE POLICY "Admin delete testimonials" ON public.testimonials
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email()));

-- ============================================================
-- 6. STORAGE BUCKET for channel images (Supabase free tier)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'channel-images',
  'channel-images',
  true,
  5242880, -- 5MB per file
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read for all
DROP POLICY IF EXISTS "Public read channel images" ON storage.objects;
CREATE POLICY "Public read channel images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'channel-images');

-- Only admin can upload
DROP POLICY IF EXISTS "Admin upload channel images" ON storage.objects;
CREATE POLICY "Admin upload channel images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'channel-images' AND
    EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email())
  );

-- Only admin can delete
DROP POLICY IF EXISTS "Admin delete channel images" ON storage.objects;
CREATE POLICY "Admin delete channel images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'channel-images' AND
    EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.email())
  );

-- ============================================================
-- FRESH START (run separately if needed):
--   TRUNCATE TABLE public.channels;
--   TRUNCATE TABLE public.testimonials;
-- ============================================================

-- ============================================================
-- ADD NEW ADMIN (run separately):
--   INSERT INTO public.admins (email, full_name)
--   VALUES ('newadmin@gmail.com', 'New Admin Name')
--   ON CONFLICT (email) DO NOTHING;
--   Then create the user in Supabase Dashboard → Auth → Users → Add User
-- ============================================================

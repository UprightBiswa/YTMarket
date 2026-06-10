-- ============================================================
-- Buy Sell Market — Fix Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add missing 'shorts' column to channels table
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS shorts BOOLEAN DEFAULT false;

-- 2. Add any other potentially missing columns
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS sold_price INTEGER;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS sold_date TEXT;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'Buy Sell Market';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS whatsapp_channel_url TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT '';
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT '';

-- ============================================================
-- 3. DROP ALL OLD POLICIES and recreate with auth.email()
--    (auth.jwt() ->> 'email' can fail depending on Supabase JWT config)
-- ============================================================

-- app_settings policies
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

-- channels policies
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

-- testimonials policies
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

-- admins policy
DROP POLICY IF EXISTS "Public read admins" ON public.admins;
CREATE POLICY "Public read admins" ON public.admins
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 4. Make sure your admin email is in the admins table
-- ============================================================
INSERT INTO public.admins (email, full_name)
VALUES ('djdas000000@gmail.com', 'Buy Sell Market Admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 5. Make sure app_settings row exists
-- ============================================================
INSERT INTO public.app_settings (id, whatsapp_number, whatsapp_channel_url, instagram_url, facebook_url, app_name)
VALUES (1, '', '', '', '', 'Buy Sell Market')
ON CONFLICT (id) DO NOTHING;

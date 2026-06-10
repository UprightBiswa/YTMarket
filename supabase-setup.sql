-- Buy Sell Market Supabase setup
-- Run this in Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT DEFAULT 'Buy Sell Market Admin',
    whatsapp_number TEXT DEFAULT '+919144534891',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.admins (email, full_name, whatsapp_number)
VALUES ('djdas000000@gmail.com', 'Buy Sell Market Admin', '+919144534891')
ON CONFLICT (email) DO UPDATE SET whatsapp_number = EXCLUDED.whatsapp_number;

CREATE TABLE IF NOT EXISTS public.app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    whatsapp_number TEXT NOT NULL DEFAULT '+919144534891',
    whatsapp_channel_url TEXT DEFAULT 'https://whatsapp.com/channel/0029VbD4kYR65yDJzTbS3B2e',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/buy.sellmarket',
    facebook_url TEXT DEFAULT 'https://www.facebook.com/share/18dPe2V26i/',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.app_settings (id, whatsapp_number, whatsapp_channel_url, instagram_url, facebook_url)
VALUES (
    1,
    '+919144534891',
    'https://whatsapp.com/channel/0029VbD4kYR65yDJzTbS3B2e',
    'https://www.instagram.com/buy.sellmarket',
    'https://www.facebook.com/share/18dPe2V26i/'
)
ON CONFLICT (id) DO UPDATE SET
    whatsapp_number = EXCLUDED.whatsapp_number,
    whatsapp_channel_url = EXCLUDED.whatsapp_channel_url,
    instagram_url = EXCLUDED.instagram_url,
    facebook_url = EXCLUDED.facebook_url,
    updated_at = timezone('utc'::text, now());

CREATE TABLE IF NOT EXISTS public.channels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    niche TEXT NOT NULL DEFAULT 'Gaming',
    description TEXT,
    subscribers INTEGER DEFAULT 0,
    monthly_views INTEGER DEFAULT 0,
    monthly_revenue INTEGER DEFAULT 0,
    audience_country TEXT DEFAULT 'United States',
    channel_age TEXT DEFAULT '1 Year',
    monetized BOOLEAN DEFAULT true,
    shorts BOOLEAN DEFAULT false,
    price INTEGER DEFAULT 0,
    whatsapp_number TEXT NOT NULL DEFAULT '+919144534891',
    featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'available',
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sold_price INTEGER,
    sold_date TEXT
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    review TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    role TEXT NOT NULL DEFAULT 'Verified Customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read admins" ON public.admins;
CREATE POLICY "Public read admins" ON public.admins FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read app settings" ON public.app_settings;
CREATE POLICY "Public read app settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin update app settings" ON public.app_settings;
CREATE POLICY "Admin update app settings" ON public.app_settings FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Public read channels" ON public.channels;
CREATE POLICY "Public read channels" ON public.channels FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin insert channels" ON public.channels;
CREATE POLICY "Admin insert channels" ON public.channels FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Admin update channels" ON public.channels;
CREATE POLICY "Admin update channels" ON public.channels FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Admin delete channels" ON public.channels;
CREATE POLICY "Admin delete channels" ON public.channels FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin insert testimonials" ON public.testimonials;
CREATE POLICY "Admin insert testimonials" ON public.testimonials FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Admin delete testimonials" ON public.testimonials;
CREATE POLICY "Admin delete testimonials" ON public.testimonials FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = auth.jwt() ->> 'email'));

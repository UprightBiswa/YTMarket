import { createClient } from '@supabase/supabase-js';
import { Channel, Testimonial } from '../types';

export type BackendType = 'supabase';

const cleanUrl = (rawUrl: string): string => {
  let cleaned = (rawUrl || '').trim();
  if (cleaned.endsWith('/rest/v1/')) {
    cleaned = cleaned.slice(0, -9).trim();
  } else if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.slice(0, -8).trim();
  }
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1).trim();
  }
  return cleaned;
};

// Read Supabase config from Vite env only. Do not hardcode live project keys in source.
const getSupabaseConfig = () => {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

  const rawUrl = envUrl.trim();
  const key = envKey.trim();
  const url = cleanUrl(rawUrl);

  return { url, key };
};

const config = getSupabaseConfig();
export const supabaseUrl = config.url;
export const supabaseAnonKey = config.key;

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  !supabaseUrl.includes('your-supabase-project') &&
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  supabaseAnonKey.startsWith('ey')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Determine active backend: strictly lock to Supabase
export const getSelectedBackend = (): BackendType => {
  return 'supabase';
};

export const setSelectedBackend = (backend: BackendType): void => {
  localStorage.setItem('yt_active_backend', 'supabase');
  window.dispatchEvent(new Event('storage'));
};

// SQL setup statements template for the user to run in Supabase SQL editor
export const SUPABASE_SQL_SETUP_CODE = `-- Buy Sell Market Supabase setup
-- Run this in Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Admin whitelist table. Supabase Auth still stores the password.
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT DEFAULT 'Buy Sell Market Admin',
    whatsapp_number TEXT DEFAULT '+919144534891',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.admins (email, full_name, whatsapp_number)
VALUES ('djdas000000@gmail.com', 'Buy Sell Market Admin', '+919144534891')
ON CONFLICT (email) DO UPDATE SET
    whatsapp_number = EXCLUDED.whatsapp_number;

-- 2. Global app settings.
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

-- 3. Channel listings.
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

-- 4. Testimonials managed by admin.
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    review TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    role TEXT NOT NULL DEFAULT 'Verified Customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Public can read. Only authenticated whitelisted admins can write.
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

-- 6. Seed demo listings. You can delete or edit these later from the admin panel.
INSERT INTO public.channels (id, title, youtube_url, niche, description, subscribers, monthly_views, monthly_revenue, audience_country, channel_age, monetized, shorts, price, whatsapp_number, featured, status, images, sold_price, sold_date)
VALUES
('tech-unboxing-pro', 'TechUnbox Pro', 'https://youtube.com/c/techunboxpro-demo', 'Tech & Gadgets', 'Active tech review and unboxing channel with strong organic search traffic and premium audience geography.', 245000, 680000, 3450, 'United States', '3 Years', true, false, 0, '+919144534891', true, 'available', ARRAY['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'], null, null),
('finance-freedom-hub', 'Finance Freedom Hub', 'https://youtube.com/c/financefreedomhub-demo', 'Finance & Investing', 'Evergreen investing and personal finance tutorials with consistent organic traffic.', 152000, 310000, 4100, 'United States', '2.5 Years', true, false, 0, '+919144534891', true, 'available', ARRAY['https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80'], null, null),
('gaming-pixel-arena', 'Pixel Arena', 'https://youtube.com/c/pixelarena-demo', 'Gaming', 'Gaming Shorts channel with active comments and strong repeat audience.', 412000, 1450000, 1850, 'United Kingdom', '4 Years', true, true, 0, '+919144534891', false, 'available', ARRAY['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80'], null, null),
('travel-nomad-diaries', 'Nomad Diaries', 'https://youtube.com/c/nomaddiaries-demo', 'Travel & Vlogs', 'Budget travel and cinematic vlog channel with steady organic growth.', 88000, 240000, 1100, 'Canada', '2 Years', true, false, 0, '+919144534891', false, 'available', ARRAY['https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'], null, null),
('crypto-bull-run', 'Crypto Daily Bull', 'https://youtube.com/c/cryptodailybull-demo', 'Crypto & Web3', 'Crypto indicators and Web3 analysis channel recorded as sold.', 305000, 980000, 5600, 'United States', '1.5 Years', true, false, 0, '+919144534891', false, 'sold', ARRAY['https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80'], 0, '2026-05-18'),
('culinary-mastery-delight', 'Chef''s Plate Secrets', 'https://youtube.com/c/chefsplate-demo', 'Cooking & Food', 'Cooking guide channel sold to a food brand for established audience reach.', 112000, 450000, 1350, 'Germany', '2 Years', false, true, 0, '+919144534891', false, 'sold', ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80'], 0, '2026-05-25')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.testimonials (id, name, review, rating, role)
VALUES
('testi-1', 'Alex Sterling', 'Sold my tech channel in four days. The admin handled communication clearly and safely.', 5, 'Verified Seller'),
('testi-2', 'Mariam A.', 'The channel statistics matched the listing and the buying process was smooth.', 5, 'Verified Buyer'),
('testi-3', 'Devon Miller', 'Fast replies and simple WhatsApp coordination. Very trustworthy experience.', 5, 'Verified Buyer')
ON CONFLICT (id) DO NOTHING;
`;

// Helper to standardise channels from Supabase format
export const standardiseChannel = (data: any): Channel => {
  return {
    id: String(data.id),
    title: String(data.title || ''),
    youtubeUrl: String(data.youtube_url || data.youtubeUrl || ''),
    niche: String(data.niche || 'Gaming'),
    description: String(data.description || ''),
    subscribers: Number(data.subscribers || 0),
    monthlyViews: Number(data.monthly_views || data.monthlyViews || 0),
    monthlyRevenue: Number(data.monthly_revenue || data.monthlyRevenue || 0),
    audienceCountry: String(data.audience_country || data.audienceCountry || 'United States'),
    channelAge: String(data.channel_age || data.channelAge || '1 Year'),
    monetized: Boolean(data.monetized !== false),
    shorts: Boolean(data.shorts),
    price: Number(data.price || 0),
    whatsappNumber: String(data.whatsapp_number || data.whatsappNumber || '+919144534891'),
    featured: Boolean(data.featured),
    status: data.status === 'sold' ? 'sold' : 'available',
    images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    soldPrice: data.sold_price !== null && data.sold_price !== undefined ? Number(data.sold_price) : undefined,
    soldDate: data.sold_date || data.soldDate || undefined
  };
};

// Standardise Testimonials
export const standardiseTestimonial = (data: any): Testimonial => {
  return {
    id: String(data.id),
    name: String(data.name || ''),
    review: String(data.review || ''),
    rating: Number(data.rating || 5),
    role: String(data.role || 'Verified Customer'),
    createdAt: data.created_at || data.createdAt || new Date().toISOString()
  };
};

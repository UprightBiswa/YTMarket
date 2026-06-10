import { createClient } from '@supabase/supabase-js';
import { Channel, Testimonial } from '../types';

const cleanUrl = (rawUrl: string): string => {
  let cleaned = (rawUrl || '').trim();
  if (cleaned.endsWith('/rest/v1/')) cleaned = cleaned.slice(0, -9).trim();
  else if (cleaned.endsWith('/rest/v1')) cleaned = cleaned.slice(0, -8).trim();
  if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1).trim();
  return cleaned;
};

const getSupabaseConfig = () => {
  const env = (import.meta as any).env || {};
  return {
    url: cleanUrl((env.VITE_SUPABASE_URL || '').trim()),
    key: (env.VITE_SUPABASE_ANON_KEY || '').trim(),
  };
};

const config = getSupabaseConfig();
export const supabaseUrl = config.url;
export const supabaseAnonKey = config.key;

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project') &&
  supabaseAnonKey.startsWith('ey')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const standardiseChannel = (data: any): Channel => ({
  id: String(data.id),
  title: String(data.title || ''),
  youtubeUrl: String(data.youtube_url || data.youtubeUrl || ''),
  niche: String(data.niche || 'Gaming'),
  description: String(data.description || ''),
  subscribers: Number(data.subscribers || 0),
  monthlyViews: Number(data.monthly_views || data.monthlyViews || 0),
  monthlyRevenue: Number(data.monthly_revenue || data.monthlyRevenue || 0),
  audienceCountry: String(data.audience_country || data.audienceCountry || 'India'),
  channelAge: String(data.channel_age || data.channelAge || '1 Year'),
  monetized: Boolean(data.monetized),
  shorts: Boolean(data.shorts),
  price: Number(data.price || 0),
  whatsappNumber: String(data.whatsapp_number || data.whatsappNumber || ''),
  featured: Boolean(data.featured),
  status: data.status === 'sold' ? 'sold' : 'available',
  images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
  createdAt: data.created_at || data.createdAt || new Date().toISOString(),
  updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
  soldPrice: data.sold_price != null ? Number(data.sold_price) : undefined,
  soldDate: data.sold_date || data.soldDate || undefined,
});

export const standardiseTestimonial = (data: any): Testimonial => ({
  id: String(data.id),
  name: String(data.name || ''),
  review: String(data.review || ''),
  rating: Number(data.rating || 5),
  role: String(data.role || 'Verified Customer'),
  createdAt: data.created_at || data.createdAt || new Date().toISOString(),
});

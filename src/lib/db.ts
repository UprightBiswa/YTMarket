import { Channel, Testimonial, HomepageStats, User } from '../types';
import { supabase, isSupabaseConfigured, standardiseChannel, standardiseTestimonial } from './supabase';

// Only localStorage keys used:
//   yt_admin_session  — logged-in admin user object (auth only)
//   yt_admin_whatsapp — cached whatsapp number from app_settings
//   yt_social_links   — cached social links from app_settings

// ----------------------------------------------------
// IN-MEMORY SUBSCRIBER REGISTRIES
// ----------------------------------------------------
type ChannelCallback = (channels: Channel[]) => void;
type TestimonialCallback = (testimonials: Testimonial[]) => void;
type StatsCallback = (stats: HomepageStats) => void;

const channelSubscribers = new Set<ChannelCallback>();
const testimonialSubscribers = new Set<TestimonialCallback>();
const statsSubscribers = new Set<StatsCallback>();

const pushChannels = (list: Channel[]) => channelSubscribers.forEach(cb => cb(list));
const pushTestimonials = (list: Testimonial[]) => testimonialSubscribers.forEach(cb => cb(list));
const pushStats = (s: HomepageStats) => statsSubscribers.forEach(cb => cb(s));

const emptyStats = (): HomepageStats => ({
  totalListings: 0, totalSold: 0, totalSubscribersSold: 0, totalMarketplaceValue: 0,
});

const fetchAndPushChannels = async () => {
  if (!isSupabaseConfigured || !supabase) {
    pushChannels([]);
    pushStats(emptyStats());
    return;
  }
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[db] fetchChannels error:', error.message);
    return;
  }
  const list = (data ?? []).map(standardiseChannel);
  pushChannels(list);
  const sold = list.filter(c => c.status === 'sold');
  pushStats({
    totalListings: list.length,
    totalSold: sold.length,
    totalSubscribersSold: sold.reduce((s, c) => s + c.subscribers, 0),
    totalMarketplaceValue: list.reduce((s, c) => s + (c.status === 'sold' ? (c.soldPrice || c.price) : c.price), 0),
  });
};

const fetchAndPushTestimonials = async () => {
  if (!isSupabaseConfigured || !supabase) {
    pushTestimonials([]);
    return;
  }
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[db] fetchTestimonials error:', error.message);
    return;
  }
  pushTestimonials((data ?? []).map(standardiseTestimonial));
};

// ----------------------------------------------------
// AUTH
// ----------------------------------------------------
let authListeners: ((user: User | null) => void)[] = [];

const getActiveUser = (): User | null => {
  const stored = localStorage.getItem('yt_admin_session');
  if (!stored) return null;
  try { return JSON.parse(stored) as User; } catch { return null; }
};

export const subscribeToAuth = (callback: (user: User | null) => void): (() => void) => {
  callback(getActiveUser());
  authListeners.push(callback);
  const sync = () => callback(getActiveUser());
  window.addEventListener('storage', sync);
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
    window.removeEventListener('storage', sync);
  };
};

const notifyAuthChange = () => authListeners.forEach(l => l(getActiveUser()));

export const loginWithEmailAndPassword = async (email: string, password: string): Promise<User | null> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Database not configured. Check your environment variables.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data?.user) throw new Error('Login failed. No user returned.');

  const u: User = {
    uid: data.user.id,
    email: data.user.email || null,
    displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Admin',
    emailVerified: !!data.user.email_confirmed_at,
    photoURL: data.user.user_metadata?.avatar_url || null,
  };

  if (!checkIsAdminUser(u)) {
    await supabase.auth.signOut();
    throw new Error('Access denied. Your account is not authorised as admin.');
  }

  localStorage.setItem('yt_admin_session', JSON.stringify(u));
  notifyAuthChange();
  return u;
};

export const logoutUser = async (): Promise<void> => {
  if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
  localStorage.removeItem('yt_admin_session');
  notifyAuthChange();
};

export const checkIsAdminUser = (user: User | null): boolean => {
  if (!user?.email) return false;
  const adminEmails = ['djdas000000@gmail.com', 'admin@buysellmarket.com', 'admin@ytmarket.com'];
  return adminEmails.includes(user.email.toLowerCase());
};

// ----------------------------------------------------
// APP SETTINGS  (whatsapp + social links)
// ----------------------------------------------------
export const getAdminWhatsAppNumber = (): string =>
  localStorage.getItem('yt_admin_whatsapp') || '';

export const setAdminWhatsAppNumber = (num: string): void => {
  localStorage.setItem('yt_admin_whatsapp', num.trim());
  if (isSupabaseConfigured && supabase) {
    supabase.from('app_settings')
      .upsert({ id: 1, whatsapp_number: num.trim(), updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error('[db] save whatsapp error:', error.message); });
  }
  window.dispatchEvent(new Event('storage'));
};

export const fetchAdminWhatsAppNumber = async (): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('whatsapp_number, whatsapp_channel_url, instagram_url, facebook_url, support_email')
      .eq('id', 1)
      .maybeSingle();
    if (!error && data) {
      if (data.whatsapp_number) localStorage.setItem('yt_admin_whatsapp', data.whatsapp_number);
      if (data.support_email) localStorage.setItem('yt_support_email', data.support_email);
      localStorage.setItem('yt_social_links', JSON.stringify({
        instagram: data.instagram_url || '',
        facebook: data.facebook_url || '',
        whatsappChannel: data.whatsapp_channel_url || '',
      }));
      window.dispatchEvent(new Event('storage'));
      return data.whatsapp_number || '';
    }
  }
  return getAdminWhatsAppNumber();
};

export const getSupportEmail = (): string =>
  localStorage.getItem('yt_support_email') || 'supportbuysellmarket@gmail.com';

export interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsappChannel: string;
}

export const getSocialLinks = (): SocialLinks => {
  const stored = localStorage.getItem('yt_social_links');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        instagram: parsed.instagram || '',
        facebook: parsed.facebook || '',
        whatsappChannel: parsed.whatsappChannel || '',
      };
    } catch {}
  }
  return { instagram: '', facebook: '', whatsappChannel: '' };
};

export const saveSocialLinks = (links: SocialLinks, supportEmail?: string): void => {
  localStorage.setItem('yt_social_links', JSON.stringify(links));
  if (supportEmail !== undefined) localStorage.setItem('yt_support_email', supportEmail);
  if (isSupabaseConfigured && supabase) {
    supabase.from('app_settings')
      .upsert({
        id: 1,
        instagram_url: links.instagram.trim(),
        facebook_url: links.facebook.trim(),
        whatsapp_channel_url: links.whatsappChannel.trim(),
        ...(supportEmail !== undefined ? { support_email: supportEmail.trim() } : {}),
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => { if (error) console.error('[db] save social links error:', error.message); });
  }
  window.dispatchEvent(new Event('storage'));
};

// ----------------------------------------------------
// IMAGE UPLOAD (Supabase Storage - free 1GB)
// ----------------------------------------------------
export const uploadChannelImage = async (file: File): Promise<string> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Database not configured.');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `channels/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('channel-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('channel-images').getPublicUrl(path);
  return data.publicUrl;
};

export const deleteChannelImage = async (url: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  // Extract path from public URL
  const marker = '/channel-images/';
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabase.storage.from('channel-images').remove([path]);
};

// ----------------------------------------------------
// CHANNELS
// ----------------------------------------------------
export const subscribeToChannels = (callback: ChannelCallback): (() => void) => {
  channelSubscribers.add(callback);
  fetchAndPushChannels();

  if (isSupabaseConfigured && supabase) {
    const sb = supabase;
    const sub = sb
      .channel('channels-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, fetchAndPushChannels)
      .subscribe();
    return () => {
      channelSubscribers.delete(callback);
      sb.removeChannel(sub);
    };
  }
  return () => { channelSubscribers.delete(callback); };
};

export const addChannelListing = async (channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Database not configured.');

  const newId = `ch-${Date.now()}`;
  const { data, error } = await supabase.from('channels').insert([{
    id: newId,
    title: channel.title.trim(),
    youtube_url: channel.youtubeUrl.trim(),
    niche: channel.niche,
    description: channel.description.trim(),
    subscribers: Number(channel.subscribers) || 0,
    monthly_views: Number(channel.monthlyViews) || 0,
    monthly_revenue: Number(channel.monthlyRevenue) || 0,
    audience_country: channel.audienceCountry.trim() || 'India',
    channel_age: channel.channelAge.trim() || '1 Year',
    monetized: !!channel.monetized,
    shorts: !!channel.shorts,
    price: 0,
    whatsapp_number: getAdminWhatsAppNumber(),
    featured: !!channel.featured,
    status: channel.status,
    images: Array.isArray(channel.images) ? channel.images.filter(Boolean) : [],
    sold_price: channel.soldPrice ? Number(channel.soldPrice) : null,
    sold_date: channel.soldDate || null,
  }]).select();

  if (error) throw new Error(error.message);
  await fetchAndPushChannels();
  return data?.[0] ? String(data[0].id) : newId;
};

export const updateChannelListing = async (id: string, updates: Partial<Channel>): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Database not configured.');

  const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) dbUpdates.title = updates.title.trim();
  if (updates.youtubeUrl !== undefined) dbUpdates.youtube_url = updates.youtubeUrl.trim();
  if (updates.niche !== undefined) dbUpdates.niche = updates.niche;
  if (updates.description !== undefined) dbUpdates.description = updates.description.trim();
  if (updates.subscribers !== undefined) dbUpdates.subscribers = Number(updates.subscribers) || 0;
  if (updates.monthlyViews !== undefined) dbUpdates.monthly_views = Number(updates.monthlyViews) || 0;
  if (updates.monthlyRevenue !== undefined) dbUpdates.monthly_revenue = Number(updates.monthlyRevenue) || 0;
  if (updates.audienceCountry !== undefined) dbUpdates.audience_country = updates.audienceCountry.trim();
  if (updates.channelAge !== undefined) dbUpdates.channel_age = updates.channelAge.trim();
  if (updates.monetized !== undefined) dbUpdates.monetized = !!updates.monetized;
  if (updates.shorts !== undefined) dbUpdates.shorts = !!updates.shorts;
  if (updates.featured !== undefined) dbUpdates.featured = !!updates.featured;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.images !== undefined) dbUpdates.images = Array.isArray(updates.images) ? updates.images.filter(Boolean) : [];
  if (updates.soldPrice !== undefined) dbUpdates.sold_price = updates.soldPrice ? Number(updates.soldPrice) : null;
  if (updates.soldDate !== undefined) dbUpdates.sold_date = updates.soldDate || null;

  const { error } = await supabase.from('channels').update(dbUpdates).eq('id', id);
  if (error) throw new Error(error.message);
  await fetchAndPushChannels();
};

export const deleteChannelListing = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Database not configured.');
  const { error } = await supabase.from('channels').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await fetchAndPushChannels();
};

// ----------------------------------------------------
// TESTIMONIALS
// ----------------------------------------------------
export const subscribeToTestimonials = (callback: TestimonialCallback): (() => void) => {
  testimonialSubscribers.add(callback);
  fetchAndPushTestimonials();

  if (isSupabaseConfigured && supabase) {
    const sb = supabase;
    const sub = sb
      .channel('testimonials-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchAndPushTestimonials)
      .subscribe();
    return () => {
      testimonialSubscribers.delete(callback);
      sb.removeChannel(sub);
    };
  }
  return () => { testimonialSubscribers.delete(callback); };
};

export const addTestimonialListing = async (testi: Omit<Testimonial, 'id' | 'createdAt'>): Promise<string> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Database not configured.');
  const { data, error } = await supabase.from('testimonials').insert([{
    name: testi.name.trim(),
    review: testi.review.trim(),
    rating: Number(testi.rating),
    role: testi.role.trim() || 'Verified Customer',
  }]).select();
  if (error) throw new Error(error.message);
  await fetchAndPushTestimonials();
  return data?.[0] ? String(data[0].id) : `testi-${Date.now()}`;
};

export const deleteTestimonialListing = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Database not configured.');
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await fetchAndPushTestimonials();
};

// ----------------------------------------------------
// STATS
// ----------------------------------------------------
export const subscribeToStats = (callback: StatsCallback): (() => void) => {
  statsSubscribers.add(callback);
  fetchAndPushChannels(); // stats derived from channels

  if (isSupabaseConfigured && supabase) {
    const sb = supabase;
    const sub = sb
      .channel('stats-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, fetchAndPushChannels)
      .subscribe();
    return () => {
      statsSubscribers.delete(callback);
      sb.removeChannel(sub);
    };
  }
  return () => { statsSubscribers.delete(callback); };
};

export const isLocalStorageFallback = false;

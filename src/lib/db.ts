import { Channel, Testimonial, HomepageStats, User } from '../types';
import { INITIAL_CHANNELS, INITIAL_TESTIMONIALS, INITIAL_STATS } from './mockData';
import { supabase, isSupabaseConfigured, standardiseChannel, standardiseTestimonial } from './supabase';

// Helpers for localStorage state
const getLocalData = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try { return JSON.parse(item) as T; } catch { return fallback; }
};

const setLocalData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const isLocalStorageFallback = !isSupabaseConfigured;

// ----------------------------------------------------
// IN-MEMORY SUBSCRIBER REGISTRIES (instant UI update)
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

const fetchAndPushChannels = async () => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('channels').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const list = data.map(standardiseChannel);
      pushChannels(list);
      // recalculate stats inline
      const sold = list.filter(c => c.status === 'sold');
      pushStats({
        totalListings: list.length,
        totalSold: sold.length,
        totalSubscribersSold: sold.reduce((s, c) => s + c.subscribers, 0),
        totalMarketplaceValue: list.reduce((s, c) => s + (c.status === 'sold' ? (c.soldPrice || c.price) : c.price), 0),
      });
    }
  }
};

const fetchAndPushTestimonials = async () => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (!error && data) pushTestimonials(data.map(standardiseTestimonial));
  }
};

// ----------------------------------------------------
// AUTH
// ----------------------------------------------------
let authListeners: ((user: User | null) => void)[] = [];

const getActiveUser = (): User | null => {
  const stored = localStorage.getItem('yt_admin_session');
  if (stored) { try { return JSON.parse(stored) as User; } catch { return null; } }
  return null;
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

const notifyAuthChange = () => {
  const user = getActiveUser();
  authListeners.forEach(l => l(user));
};

export const loginWithEmailAndPassword = async (email: string, password: string): Promise<User | null> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) {
      const u: User = {
        uid: data.user.id,
        email: data.user.email || null,
        displayName: data.user.user_metadata?.full_name || 'Broker Admin',
        emailVerified: !!data.user.email_confirmed_at,
        photoURL: data.user.user_metadata?.avatar_url || null,
      };
      if (!checkIsAdminUser(u)) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Your account is not authorized.');
      }
      localStorage.setItem('yt_admin_session', JSON.stringify(u));
      notifyAuthChange();
      return u;
    }
  }

  // Local fallback
  const adminEmails = ['djdas000000@gmail.com', 'admin@buysellmarket.com', 'admin@ytmarket.com'];
  if (adminEmails.includes(email) && password === 'ytmarket@admin2026') {
    const u: User = {
      uid: 'local-admin-uid',
      email,
      displayName: 'System Admin',
      emailVerified: true,
      photoURL: null,
    };
    localStorage.setItem('yt_admin_session', JSON.stringify(u));
    notifyAuthChange();
    return u;
  }
  throw new Error('Invalid credentials. Access denied.');
};

export const logoutUser = async (): Promise<void> => {
  if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
  localStorage.removeItem('yt_admin_session');
  notifyAuthChange();
};

export const checkIsAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  return ['djdas000000@gmail.com', 'admin@buysellmarket.com', 'admin@ytmarket.com'].includes(user.email || '');
};

export const fetchAdminWhatsAppNumber = async (): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('app_settings').select('whatsapp_number').eq('id', 1).maybeSingle();
    if (!error && data?.whatsapp_number) {
      localStorage.setItem('yt_admin_whatsapp', data.whatsapp_number);
      return data.whatsapp_number;
    }
  }
  return getAdminWhatsAppNumber();
};

// ----------------------------------------------------
// CHANNELS
// ----------------------------------------------------
export const subscribeToChannels = (callback: ChannelCallback): (() => void) => {
  channelSubscribers.add(callback);

  if (isSupabaseConfigured && supabase) {
    // Initial fetch
    fetchAndPushChannels();

    // Realtime (works if enabled, bonus — not relied upon)
    const sub = supabase
      .channel('channels-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, fetchAndPushChannels)
      .subscribe();

    return () => {
      channelSubscribers.delete(callback);
      supabase.removeChannel(sub);
    };
  }

  // Local fallback
  const syncLocal = () => {
    callback(getLocalData<Channel[]>('yt_channels', INITIAL_CHANNELS));
  };
  syncLocal();
  window.addEventListener('storage', syncLocal);
  return () => {
    channelSubscribers.delete(callback);
    window.removeEventListener('storage', syncLocal);
  };
};

export const getAdminWhatsAppNumber = (): string =>
  localStorage.getItem('yt_admin_whatsapp') || '+919144534891';

export const setAdminWhatsAppNumber = (num: string): void => {
  localStorage.setItem('yt_admin_whatsapp', num);
  if (isSupabaseConfigured && supabase) {
    supabase.from('app_settings')
      .upsert({ id: 1, whatsapp_number: num, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error(error); });
  }
  window.dispatchEvent(new Event('storage'));
};

export interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsappChannel: string;
}

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  instagram: 'https://www.instagram.com/buy.sellmarket',
  facebook: 'https://www.facebook.com/share/18dPe2V26i/',
  whatsappChannel: 'https://whatsapp.com/channel/0029VbD4kYR65yDJzTbS3B2e',
};

export const getSocialLinks = (): SocialLinks => {
  const stored = localStorage.getItem('yt_social_links');
  if (stored) { try { return { ...DEFAULT_SOCIAL_LINKS, ...JSON.parse(stored) }; } catch {} }
  return DEFAULT_SOCIAL_LINKS;
};

export const saveSocialLinks = (links: SocialLinks): void => {
  localStorage.setItem('yt_social_links', JSON.stringify(links));
  window.dispatchEvent(new Event('storage'));
};

export const addChannelListing = async (channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const newId = `channel-${Date.now()}`;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('channels').insert([{
      id: newId,
      title: channel.title,
      youtube_url: channel.youtubeUrl,
      niche: channel.niche,
      description: channel.description,
      subscribers: Number(channel.subscribers),
      monthly_views: Number(channel.monthlyViews),
      monthly_revenue: Number(channel.monthlyRevenue),
      audience_country: channel.audienceCountry,
      channel_age: channel.channelAge,
      monetized: !!channel.monetized,
      shorts: !!channel.shorts,
      price: Number(channel.price || 0),
      whatsapp_number: getAdminWhatsAppNumber(),
      featured: !!channel.featured,
      status: channel.status,
      images: channel.images,
      sold_price: channel.soldPrice ? Number(channel.soldPrice) : null,
      sold_date: channel.soldDate || null,
    }]).select();
    if (error) throw error;
    await fetchAndPushChannels(); // immediate UI update
    return data && data[0] ? String(data[0].id) : newId;
  }

  const now = new Date().toISOString();
  const item: Channel = { ...channel, id: newId, createdAt: now, updatedAt: now, whatsappNumber: getAdminWhatsAppNumber() };
  const current = getLocalData<Channel[]>('yt_channels', INITIAL_CHANNELS);
  setLocalData('yt_channels', [item, ...current]);
  recalculateLocalStats();
  window.dispatchEvent(new Event('storage'));
  return newId;
};

export const updateChannelListing = async (id: string, updates: Partial<Channel>): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.youtubeUrl !== undefined) dbUpdates.youtube_url = updates.youtubeUrl;
    if (updates.niche !== undefined) dbUpdates.niche = updates.niche;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.subscribers !== undefined) dbUpdates.subscribers = Number(updates.subscribers);
    if (updates.monthlyViews !== undefined) dbUpdates.monthly_views = Number(updates.monthlyViews);
    if (updates.monthlyRevenue !== undefined) dbUpdates.monthly_revenue = Number(updates.monthlyRevenue);
    if (updates.audienceCountry !== undefined) dbUpdates.audience_country = updates.audienceCountry;
    if (updates.channelAge !== undefined) dbUpdates.channel_age = updates.channelAge;
    if (updates.monetized !== undefined) dbUpdates.monetized = !!updates.monetized;
    if (updates.shorts !== undefined) dbUpdates.shorts = !!updates.shorts;
    if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
    if (updates.featured !== undefined) dbUpdates.featured = !!updates.featured;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.soldPrice !== undefined) dbUpdates.sold_price = updates.soldPrice ? Number(updates.soldPrice) : null;
    if (updates.soldDate !== undefined) dbUpdates.sold_date = updates.soldDate || null;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('channels').update(dbUpdates).eq('id', id);
    if (error) throw error;
    await fetchAndPushChannels(); // immediate UI update
    return;
  }

  const current = getLocalData<Channel[]>('yt_channels', INITIAL_CHANNELS);
  setLocalData('yt_channels', current.map(c => c.id === id ? { ...c, ...updates, id, updatedAt: new Date().toISOString() } : c));
  recalculateLocalStats();
  window.dispatchEvent(new Event('storage'));
};

export const deleteChannelListing = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (error) throw error;
    await fetchAndPushChannels(); // immediate UI update
    return;
  }

  const current = getLocalData<Channel[]>('yt_channels', INITIAL_CHANNELS);
  setLocalData('yt_channels', current.filter(c => c.id !== id));
  recalculateLocalStats();
  window.dispatchEvent(new Event('storage'));
};

// ----------------------------------------------------
// TESTIMONIALS
// ----------------------------------------------------
export const subscribeToTestimonials = (callback: TestimonialCallback): (() => void) => {
  testimonialSubscribers.add(callback);

  if (isSupabaseConfigured && supabase) {
    fetchAndPushTestimonials();

    const sub = supabase
      .channel('testimonials-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchAndPushTestimonials)
      .subscribe();

    return () => {
      testimonialSubscribers.delete(callback);
      supabase.removeChannel(sub);
    };
  }

  const syncLocal = () => {
    callback(getLocalData<Testimonial[]>('yt_testimonials', INITIAL_TESTIMONIALS));
  };
  syncLocal();
  window.addEventListener('storage', syncLocal);
  return () => {
    testimonialSubscribers.delete(callback);
    window.removeEventListener('storage', syncLocal);
  };
};

export const addTestimonialListing = async (testi: Omit<Testimonial, 'id' | 'createdAt'>): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('testimonials').insert([{
      name: testi.name,
      review: testi.review,
      rating: Number(testi.rating),
      role: testi.role,
    }]).select();
    if (error) throw error;
    await fetchAndPushTestimonials(); // immediate UI update
    return data && data[0] ? String(data[0].id) : `testi-${Date.now()}`;
  }

  const newId = `testi-${Date.now()}`;
  const item: Testimonial = { ...testi, id: newId, createdAt: new Date().toISOString() };
  const current = getLocalData<Testimonial[]>('yt_testimonials', INITIAL_TESTIMONIALS);
  setLocalData('yt_testimonials', [item, ...current]);
  window.dispatchEvent(new Event('storage'));
  return newId;
};

export const deleteTestimonialListing = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    await fetchAndPushTestimonials(); // immediate UI update
    return;
  }

  const current = getLocalData<Testimonial[]>('yt_testimonials', INITIAL_TESTIMONIALS);
  setLocalData('yt_testimonials', current.filter(t => t.id !== id));
  window.dispatchEvent(new Event('storage'));
};

// ----------------------------------------------------
// STATS
// ----------------------------------------------------
export const subscribeToStats = (callback: StatsCallback): (() => void) => {
  statsSubscribers.add(callback);

  if (isSupabaseConfigured && supabase) {
    fetchAndPushChannels(); // stats are derived from channels fetch above

    const sub = supabase
      .channel('stats-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, fetchAndPushChannels)
      .subscribe();

    return () => {
      statsSubscribers.delete(callback);
      supabase.removeChannel(sub);
    };
  }

  const syncLocal = () => {
    callback(getLocalData<HomepageStats>('yt_stats', INITIAL_STATS));
  };
  syncLocal();
  window.addEventListener('storage', syncLocal);
  return () => {
    statsSubscribers.delete(callback);
    window.removeEventListener('storage', syncLocal);
  };
};

const recalculateLocalStats = () => {
  const channels = getLocalData<Channel[]>('yt_channels', INITIAL_CHANNELS);
  const sold = channels.filter(c => c.status === 'sold');
  setLocalData('yt_stats', {
    totalListings: channels.length,
    totalSold: sold.length,
    totalSubscribersSold: sold.reduce((s, c) => s + c.subscribers, 0),
    totalMarketplaceValue: channels.reduce((s, c) => s + (c.status === 'sold' ? (c.soldPrice || c.price) : c.price), 0),
  });
};

export const updatePlatformStats = async (updates: HomepageStats): Promise<void> => {
  if (isLocalStorageFallback) {
    setLocalData('yt_stats', updates);
    window.dispatchEvent(new Event('storage'));
  }
};

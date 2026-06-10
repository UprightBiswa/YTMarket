import { Channel, Testimonial, HomepageStats, User } from '../types';
import { INITIAL_CHANNELS, INITIAL_TESTIMONIALS, INITIAL_STATS } from './mockData';
import { supabase, isSupabaseConfigured, standardiseChannel, standardiseTestimonial } from './supabase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Helpers for localStorage state
const getLocalData = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try {
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const isLocalStorageFallback = !isSupabaseConfigured;

// Auto-initialize local data if completely empty
if (isLocalStorageFallback) {
  if (!localStorage.getItem("yt_channels")) {
    setLocalData("yt_channels", INITIAL_CHANNELS);
  }
  if (!localStorage.getItem("yt_testimonials")) {
    setLocalData("yt_testimonials", INITIAL_TESTIMONIALS);
  }
  if (!localStorage.getItem("yt_stats")) {
    setLocalData("yt_stats", INITIAL_STATS);
  }
}

// ----------------------------------------------------
// AUTHENTICATION IMPLEMENTATION
// ----------------------------------------------------
let authListeners: ((user: User | null) => void)[] = [];

const getActiveUser = (): User | null => {
  const stored = localStorage.getItem("yt_admin_session");
  if (stored) {
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
  return null;
};

export const subscribeToAuth = (callback: (user: User | null) => void): (() => void) => {
  // Initial fire
  callback(getActiveUser());
  authListeners.push(callback);

  const sync = () => {
    callback(getActiveUser());
  };
  window.addEventListener("storage", sync);

  return () => {
    authListeners = authListeners.filter(l => l !== callback);
    window.removeEventListener("storage", sync);
  };
};

const notifyAuthChange = () => {
  const user = getActiveUser();
  authListeners.forEach(listener => listener(user));
  window.dispatchEvent(new Event("storage"));
};

export const loginWithGoogle = async (): Promise<User | null> => {
  throw new Error("Google login is disabled. Use the admin email and password configured in Supabase Auth.");
};

export const loginWithEmailAndPassword = async (email: string, password: string): Promise<User | null> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data?.user) {
      const u: User = {
        uid: data.user.id,
        email: data.user.email || null,
        displayName: data.user.user_metadata?.full_name || "Broker Admin",
        emailVerified: !!data.user.email_confirmed_at,
        photoURL: data.user.user_metadata?.avatar_url || null
      };

      // Ensure logged in user is actually in predefined admin list!
      if (!checkIsAdminUser(u)) {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Your account is not in the Authorized Administrators list.");
      }

      localStorage.setItem("yt_admin_session", JSON.stringify(u));
      notifyAuthChange();
      return u;
    }
  }

  // Local fallback with pre-vetted custom credentials requiring password validation
  if (email === "djdas000000@gmail.com" || email === "admin@buysellmarket.com" || email === "admin@ytmarket.com") {
    if (password === "ytmarket@admin2026") {
      const u: User = {
        uid: "local-admin-uid",
        email,
        displayName: "System Admin",
        emailVerified: true,
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
      };
      localStorage.setItem("yt_admin_session", JSON.stringify(u));
      notifyAuthChange();
      return u;
    } else {
      throw new Error("Invalid password! Access Denied.");
    }
  }
  throw new Error("Invalid Administrator Email! Account is not preconfigured as a broker.");
};

export const signUpWithEmailAndPassword = async (email: string, password: string): Promise<User | null> => {
  throw new Error("Public admin signup is disabled. Create the admin user from Supabase Auth.");
};

export const logoutUser = async (): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem("yt_admin_session");
  notifyAuthChange();
};

export const checkIsAdminUser = (user: User | null): boolean => {
  if (!user) return false;
  const adminEmails = [
    "djdas000000@gmail.com",
    "admin@buysellmarket.com",
    "admin@ytmarket.com"
  ];
  return adminEmails.includes(user.email || "");
};

export const fetchAdminWhatsAppNumber = async (): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('whatsapp_number')
      .eq('id', 1)
      .maybeSingle();
    if (!error && data?.whatsapp_number) {
      localStorage.setItem("yt_admin_whatsapp", data.whatsapp_number);
      return data.whatsapp_number;
    }
  }
  return getAdminWhatsAppNumber();
};

// ----------------------------------------------------
// CHANNELS SUBSCRIPTION AND MUTATIONS
// ----------------------------------------------------
export const subscribeToChannels = (callback: (channels: Channel[]) => void): (() => void) => {
  if (isSupabaseConfigured && supabase) {
    const fetchAndCallback = async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase fetch error for channels:', error);
      } else if (data) {
        callback(data.map(standardiseChannel));
      }
    };
    fetchAndCallback();

    const channelSub = supabase
      .channel('schema-channels-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        fetchAndCallback();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channelSub);
    };
  }

  const syncLocal = () => {
    const dbChannels = getLocalData<Channel[]>("yt_channels", INITIAL_CHANNELS);
    callback(dbChannels);
  };
  syncLocal();
  window.addEventListener("storage", syncLocal);
  return () => window.removeEventListener("storage", syncLocal);
};

export const getAdminWhatsAppNumber = (): string => {
  return localStorage.getItem("yt_admin_whatsapp") || "+919144534891";
};

export const setAdminWhatsAppNumber = (num: string): void => {
  localStorage.setItem("yt_admin_whatsapp", num);
  if (isSupabaseConfigured && supabase) {
    supabase
      .from('app_settings')
      .upsert({ id: 1, whatsapp_number: num, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.error('Failed to sync WhatsApp number:', error);
      });
  }
  window.dispatchEvent(new Event("storage"));
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
  const stored = localStorage.getItem("yt_social_links");
  if (stored) {
    try { return { ...DEFAULT_SOCIAL_LINKS, ...JSON.parse(stored) }; } catch {}
  }
  return DEFAULT_SOCIAL_LINKS;
};

export const saveSocialLinks = (links: SocialLinks): void => {
  localStorage.setItem("yt_social_links", JSON.stringify(links));
  window.dispatchEvent(new Event("storage"));
};

export const addChannelListing = async (channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const newId = `channel-${Date.now()}`;
  
  if (isSupabaseConfigured && supabase) {
    const dbItem = {
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
      sold_date: channel.soldDate || null
    };
    const { data, error } = await supabase
      .from('channels')
      .insert([dbItem])
      .select();
    if (error) throw error;
    return data && data[0] ? String(data[0].id) : newId;
  }

  const now = new Date().toISOString();
  const item: Channel = {
    ...channel,
    id: newId,
    createdAt: now,
    updatedAt: now,
    whatsappNumber: getAdminWhatsAppNumber()
  };

  const current = getLocalData<Channel[]>("yt_channels", INITIAL_CHANNELS);
  setLocalData("yt_channels", [item, ...current]);
  recalculateLocalStats();
  window.dispatchEvent(new Event("storage"));
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
    if (updates.whatsappNumber !== undefined) dbUpdates.whatsapp_number = updates.whatsappNumber;
    if (updates.featured !== undefined) dbUpdates.featured = !!updates.featured;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.soldPrice !== undefined) dbUpdates.sold_price = updates.soldPrice ? Number(updates.soldPrice) : null;
    if (updates.soldDate !== undefined) dbUpdates.sold_date = updates.soldDate || null;

    const { error } = await supabase
      .from('channels')
      .update(dbUpdates)
      .eq('id', id);
    if (error) throw error;
    return;
  }

  const cleanUpdates = { ...updates };
  delete cleanUpdates.id;

  const current = getLocalData<Channel[]>("yt_channels", INITIAL_CHANNELS);
  const updated = current.map((c) => {
    if (c.id === id) {
      return { ...c, ...cleanUpdates, updatedAt: new Date().toISOString() };
    }
    return c;
  });
  setLocalData("yt_channels", updated);
  recalculateLocalStats();
  window.dispatchEvent(new Event("storage"));
};

export const deleteChannelListing = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return;
  }

  const current = getLocalData<Channel[]>("yt_channels", INITIAL_CHANNELS);
  const filtered = current.filter((c) => c.id !== id);
  setLocalData("yt_channels", filtered);
  recalculateLocalStats();
  window.dispatchEvent(new Event("storage"));
};

// ----------------------------------------------------
// TESTIMONIALS SUBSCRIPTION AND MUTATIONS
// ----------------------------------------------------
export const subscribeToTestimonials = (callback: (testimonials: Testimonial[]) => void): (() => void) => {
  if (isSupabaseConfigured && supabase) {
    const fetchAndCallback = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase testimonials fetch error:', error);
      } else if (data) {
        callback(data.map(standardiseTestimonial));
      }
    };
    fetchAndCallback();

    const testimonialSub = supabase
      .channel('schema-testimonials-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchAndCallback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(testimonialSub);
    };
  }

  const syncLocal = () => {
    const list = getLocalData<Testimonial[]>("yt_testimonials", INITIAL_TESTIMONIALS);
    callback(list);
  };
  syncLocal();
  window.addEventListener("storage", syncLocal);
  return () => window.removeEventListener("storage", syncLocal);
};

export const addTestimonialListing = async (testi: Omit<Testimonial, 'id' | 'createdAt'>): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    const dbItem = {
      name: testi.name,
      review: testi.review,
      rating: Number(testi.rating),
      role: testi.role
    };
    const { data, error } = await supabase
      .from('testimonials')
      .insert([dbItem])
      .select();
    if (error) throw error;
    return data && data[0] ? String(data[0].id) : `testi-${Date.now()}`;
  }

  const newId = `testi-${Date.now()}`;
  const item: Testimonial = {
    ...testi,
    id: newId,
    createdAt: new Date().toISOString()
  };

  const current = getLocalData<Testimonial[]>("yt_testimonials", INITIAL_TESTIMONIALS);
  setLocalData("yt_testimonials", [item, ...current]);
  window.dispatchEvent(new Event("storage"));
  return newId;
};

export const deleteTestimonialListing = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return;
  }

  const current = getLocalData<Testimonial[]>("yt_testimonials", INITIAL_TESTIMONIALS);
  const filtered = current.filter((t) => t.id !== id);
  setLocalData("yt_testimonials", filtered);
  window.dispatchEvent(new Event("storage"));
};

// ----------------------------------------------------
// STATS AND AGGREGATIONS
// ----------------------------------------------------
export const subscribeToStats = (callback: (stats: HomepageStats) => void): (() => void) => {
  if (isSupabaseConfigured && supabase) {
    const fetchAndAggregate = async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*');
      if (error) {
        console.error('Supabase stats calculation error:', error);
      } else if (data) {
        const list = data.map(standardiseChannel);
        const totalListings = list.length;
        const soldChannels = list.filter(c => c.status === 'sold');
        const totalSold = soldChannels.length;
        const totalSubscribersSold = soldChannels.reduce((sum, c) => sum + c.subscribers, 0);
        const totalMarketplaceValue = list.reduce((sum, c) => sum + (c.status === 'sold' ? (c.soldPrice || c.price) : c.price), 0);
        
        callback({
          totalListings,
          totalSold,
          totalSubscribersSold,
          totalMarketplaceValue
        });
      }
    };
    
    fetchAndAggregate();
    
    const statsSub = supabase
      .channel('schema-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        fetchAndAggregate();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(statsSub);
    };
  }

  const syncLocal = () => {
    const stats = getLocalData<HomepageStats>("yt_stats", INITIAL_STATS);
    callback(stats);
  };
  syncLocal();
  window.addEventListener("storage", syncLocal);
  return () => window.removeEventListener("storage", syncLocal);
};

export const updatePlatformStats = async (updates: HomepageStats): Promise<void> => {
  if (isLocalStorageFallback) {
    setLocalData("yt_stats", updates);
    window.dispatchEvent(new Event("storage"));
  }
};

const recalculateLocalStats = () => {
  const channels = getLocalData<Channel[]>("yt_channels", INITIAL_CHANNELS);
  const totalListings = channels.length;
  const soldChannels = channels.filter(c => c.status === 'sold');
  const totalSold = soldChannels.length;
  const totalSubscribersSold = soldChannels.reduce((sum, c) => sum + c.subscribers, 0);
  const totalMarketplaceValue = channels.reduce((sum, c) => sum + (c.status === 'sold' ? (c.soldPrice || c.price) : c.price), 0);

  setLocalData("yt_stats", {
    totalListings,
    totalSold,
    totalSubscribersSold,
    totalMarketplaceValue
  });
};

export const seedActiveBackendForcefully = async (): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    try {
      // Upsert channels
      for (const chan of INITIAL_CHANNELS) {
        const dbItem = {
          id: chan.id,
          title: chan.title,
          youtube_url: chan.youtubeUrl,
          niche: chan.niche,
          description: chan.description,
          subscribers: Number(chan.subscribers),
          monthly_views: Number(chan.monthlyViews),
          monthly_revenue: Number(chan.monthlyRevenue),
          audience_country: chan.audienceCountry,
          channel_age: chan.channelAge,
          monetized: !!chan.monetized,
          shorts: !!chan.shorts,
          price: Number(chan.price),
          whatsapp_number: chan.whatsappNumber,
          featured: !!chan.featured,
          status: chan.status,
          images: chan.images,
          sold_price: chan.soldPrice ? Number(chan.soldPrice) : null,
          sold_date: chan.soldDate || null
        };
        const { error } = await supabase.from('channels').upsert([dbItem]);
        if (error) throw error;
      }
      
      // Upsert testimonials
      for (const testi of INITIAL_TESTIMONIALS) {
        const dbItem = {
          id: testi.id,
          name: testi.name,
          review: testi.review,
          rating: Number(testi.rating),
          role: testi.role
        };
        const { error } = await supabase.from('testimonials').upsert([dbItem]);
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Supabase seeding query failed:", err);
      throw new Error(
        `Failed to seed Supabase: ${err?.message || 'Table connection rejected'}. ` +
        `Make sure you created the 'channels' and 'testimonials' tables running the SQL script in your Supabase dashboard first!`
      );
    }
  } else {
    // Reset local data cache forcefully
    localStorage.setItem("yt_channels", JSON.stringify(INITIAL_CHANNELS));
    localStorage.setItem("yt_testimonials", JSON.stringify(INITIAL_TESTIMONIALS));
    localStorage.setItem("yt_stats", JSON.stringify(INITIAL_STATS));
    window.dispatchEvent(new Event("storage"));
  }
};

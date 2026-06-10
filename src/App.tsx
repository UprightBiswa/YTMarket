/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Tv, 
  ShieldCheck, 
  Sparkles, 
  TvMinimalPlay, 
  TrendingUp, 
  Award,
  CircleAlert
} from 'lucide-react';
import { Channel, Testimonial, HomepageStats, User } from './types';
import { 
  subscribeToAuth, 
  subscribeToChannels, 
  subscribeToTestimonials, 
  subscribeToStats,
  addTestimonialListing,
  fetchAdminWhatsAppNumber
} from './lib/db';
import Header from './components/Header';
import Footer from './components/Footer';
import HomepageOverview from './components/HomepageOverview';
import BrowseChannels from './components/BrowseChannels';
import AdminPanel from './components/AdminPanel';
import ChannelDetails from './components/ChannelDetails';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'browse' | 'sold' | 'admin'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Home filter overrides state to BrowseChannels
  const [browseFilters, setBrowseFilters] = useState<{
    monetized: 'all' | 'monetized' | 'non-monetized';
    isShortsOnly: boolean;
  }>({
    monetized: 'all',
    isShortsOnly: false
  });

  const handleNavigateToBrowseWithFilters = (monetized: 'all' | 'monetized' | 'non-monetized', isShortsOnly: boolean) => {
    setBrowseFilters({ monetized, isShortsOnly });
    setActiveTab('browse');
    window.location.hash = '#/browse';
  };

  // Core Listings Datastore States
  const [channels, setChannels] = useState<Channel[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<HomepageStats>({
    totalListings: 0,
    totalSold: 0,
    totalSubscribersSold: 0,
    totalMarketplaceValue: 0,
  });

  // Modal selector focus states
  const [activeChannelDetails, setActiveChannelDetails] = useState<Channel | null>(null);

  // Custom user niche preferences saved in browser cookie & local storage
  const [favoriteNiches, setFavoriteNiches] = useState<string[]>([]);

  // Listeners binding and URL Routing synchronization
  useEffect(() => {
    // 1. Auth Listener
    const unsubscribeAuth = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // 2. Channels Listener
    const unsubscribeChannels = subscribeToChannels((itemList) => {
      setChannels(itemList);
    });

    // 3. Testimonials Listener
    const unsubscribeTestimonials = subscribeToTestimonials((testiList) => {
      setTestimonials(testiList);
    });

    // 4. Stats Summary Listener
    const unsubscribeStats = subscribeToStats((summaryStats) => {
      setStats(summaryStats);
    });

    fetchAdminWhatsAppNumber().catch((err) => {
      console.error('Failed to load app settings:', err);
    });

    // 5. URL Path and Hash Listener (Seamless admin/tab synchronization)
    const syncRouteFromUrl = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      
      if (path.endsWith('/admin') || hash.includes('admin') || search.includes('admin')) {
        setActiveTab('admin');
      } else if (path.endsWith('/sold') || hash.includes('sold')) {
        setActiveTab('sold');
      } else if (path.endsWith('/browse') || hash.includes('browse')) {
        setActiveTab('browse');
      } else if (path === '/' || path.endsWith('/home') || hash.includes('home')) {
        setActiveTab('home');
      }
    };

    syncRouteFromUrl();
    window.addEventListener('hashchange', syncRouteFromUrl);
    window.addEventListener('popstate', syncRouteFromUrl);

    return () => {
      unsubscribeAuth();
      unsubscribeChannels();
      unsubscribeTestimonials();
      unsubscribeStats();
      window.removeEventListener('hashchange', syncRouteFromUrl);
      window.removeEventListener('popstate', syncRouteFromUrl);
    };
  }, []);

  // Update URL hash state to reflect tab changes
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (activeTab === 'admin' && !hash.includes('admin')) {
      window.location.hash = '#/admin';
    } else if (activeTab === 'sold' && !hash.includes('sold')) {
      window.location.hash = '#/sold';
    } else if (activeTab === 'browse' && !hash.includes('browse')) {
      window.location.hash = '#/browse';
    } else if (activeTab === 'home' && !hash.includes('home') && hash !== '') {
      window.location.hash = '#/home';
    }
  }, [activeTab]);

  // Handle URL deep-linking on first load or channel list updates
  useEffect(() => {
    if (channels.length > 0) {
      const pathParams = new URLSearchParams(window.location.search);
      let deepLinkId = pathParams.get('id') || pathParams.get('channelId') || pathParams.get('channelid');
      
      if (!deepLinkId && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          deepLinkId = hashParams.get('id') || hashParams.get('channelId') || hashParams.get('channelid');
        }
      }

      if (deepLinkId) {
        const found = channels.find(c => c.id.toLowerCase() === deepLinkId.toLowerCase());
        if (found) {
          setActiveChannelDetails(found);
        }
      }
    }
  }, [channels, window.location.hash, window.location.search]);

  const handleSelectChannelDetails = (channel: Channel) => {
    setActiveChannelDetails(channel);
  };

  // If we are in admin mode, completely separate the layout and do not render the standard user app bar and footer.
  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-red-600 selection:text-white" id="admin-root">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <div className="relative w-12 h-12">
                <span className="absolute inset-0 border-4 border-gray-800 rounded-full"></span>
                <span className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></span>
              </div>
              <p className="font-mono text-xs text-gray-400 font-semibold uppercase animate-pulse">
                Appraising Assets...
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <AdminPanel 
                channels={channels} 
                testimonials={testimonials} 
                stats={stats} 
                user={user}
                onBackToUserApp={() => {
                  setActiveTab('home');
                  window.location.hash = '#/home';
                }}
              />
            </div>
          )}
        </main>
        
        {activeChannelDetails && (
          <ChannelDetails 
            channel={activeChannelDetails} 
            onClose={() => setActiveChannelDetails(null)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-500 selection:text-white" id="app-root">
      
      {/* 1. Header Navigation Bar */}
      <Header 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNavigateWithFilters={handleNavigateToBrowseWithFilters}
      />

      {/* 2. Main Tab Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="relative w-12 h-12">
              <span className="absolute inset-0 border-4 border-gray-100 rounded-full"></span>
              <span className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></span>
            </div>
            <p className="font-mono text-xs text-gray-500 font-semibold uppercase animate-pulse">
              Appraising Assets...
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {activeTab === 'home' && (
              <HomepageOverview 
                stats={stats} 
                channels={channels}
                testimonials={testimonials} 
                setActiveTab={setActiveTab}
                onSelectChannel={handleSelectChannelDetails}
                favoriteNiches={favoriteNiches}
                onSubmitTestimonial={addTestimonialListing}
                onNavigateWithFilters={handleNavigateToBrowseWithFilters}
              />
            )}

            {activeTab === 'browse' && (
              <BrowseChannels 
                channels={channels} 
                onSelectChannel={handleSelectChannelDetails} 
                showOnlySold={false}
                favoriteNiches={favoriteNiches}
                initialFilters={browseFilters}
                onResetFilters={() => setBrowseFilters({ monetized: 'all', isShortsOnly: false })}
              />
            )}

            {activeTab === 'sold' && (
              <BrowseChannels 
                channels={channels} 
                onSelectChannel={handleSelectChannelDetails} 
                showOnlySold={true}
                favoriteNiches={favoriteNiches}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* 4. Overlay Modals (Details drawer) */}
      {activeChannelDetails && (
        <ChannelDetails 
          channel={activeChannelDetails} 
          onClose={() => setActiveChannelDetails(null)} 
        />
      )}

    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
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

type Tab = 'home' | 'browse' | 'sold' | 'admin';

const getTabFromPath = (): Tab => {
  const path = window.location.pathname.toLowerCase();
  if (path === '/admin' || path.startsWith('/admin')) return 'admin';
  if (path === '/browse' || path.startsWith('/browse')) return 'browse';
  if (path === '/sold' || path.startsWith('/sold')) return 'sold';
  return 'home';
};

const pushPath = (tab: Tab) => {
  const map: Record<Tab, string> = { home: '/', browse: '/browse', sold: '/sold', admin: '/admin' };
  const target = map[tab];
  if (window.location.pathname !== target) {
    window.history.pushState({ tab }, '', target);
  }
};

export default function App() {
  const [activeTab, setActiveTabState] = useState<Tab>(getTabFromPath);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const skipHashSync = useRef(false);

  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    pushPath(tab);
  };

  const [browseFilters, setBrowseFilters] = useState<{
    monetized: 'all' | 'monetized' | 'non-monetized';
    isShortsOnly: boolean;
  }>({ monetized: 'all', isShortsOnly: false });

  const handleNavigateToBrowseWithFilters = (monetized: 'all' | 'monetized' | 'non-monetized', isShortsOnly: boolean) => {
    setBrowseFilters({ monetized, isShortsOnly });
    setActiveTab('browse');
  };

  const [channels, setChannels] = useState<Channel[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<HomepageStats>({
    totalListings: 0,
    totalSold: 0,
    totalSubscribersSold: 0,
    totalMarketplaceValue: 0,
  });

  const [activeChannelDetails, setActiveChannelDetails] = useState<Channel | null>(null);
  const favoriteNiches: string[] = [];

  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((u) => { setUser(u); setLoading(false); });
    const unsubscribeChannels = subscribeToChannels(setChannels);
    const unsubscribeTestimonials = subscribeToTestimonials(setTestimonials);
    const unsubscribeStats = subscribeToStats(setStats);

    fetchAdminWhatsAppNumber().catch(console.error);

    // Handle browser back/forward
    const onPopState = () => setActiveTabState(getTabFromPath());
    window.addEventListener('popstate', onPopState);

    return () => {
      unsubscribeAuth();
      unsubscribeChannels();
      unsubscribeTestimonials();
      unsubscribeStats();
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  // Deep-link channel modal from URL ?id=
  useEffect(() => {
    if (channels.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || params.get('channelId');
    if (id) {
      const found = channels.find(c => c.id.toLowerCase() === id.toLowerCase());
      if (found) setActiveChannelDetails(found);
    }
  }, [channels]);

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
              <p className="font-mono text-xs text-gray-400 font-semibold uppercase animate-pulse">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <AdminPanel
                channels={channels}
                testimonials={testimonials}
                stats={stats}
                user={user}
                onSelectChannel={setActiveChannelDetails}
                onBackToUserApp={() => setActiveTab('home')}
              />
            </div>
          )}
        </main>
        {activeChannelDetails && (
          <ChannelDetails channel={activeChannelDetails} onClose={() => setActiveChannelDetails(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-500 selection:text-white" id="app-root">
      <Header user={user} activeTab={activeTab} setActiveTab={setActiveTab} onNavigateWithFilters={handleNavigateToBrowseWithFilters} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="relative w-12 h-12">
              <span className="absolute inset-0 border-4 border-gray-100 rounded-full"></span>
              <span className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></span>
            </div>
            <p className="font-mono text-xs text-gray-500 font-semibold uppercase animate-pulse">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {activeTab === 'home' && (
              <HomepageOverview
                stats={stats}
                channels={channels}
                testimonials={testimonials}
                setActiveTab={setActiveTab}
                onSelectChannel={setActiveChannelDetails}
                favoriteNiches={favoriteNiches}
                onSubmitTestimonial={addTestimonialListing}
                onNavigateWithFilters={handleNavigateToBrowseWithFilters}
              />
            )}
            {activeTab === 'browse' && (
              <BrowseChannels
                channels={channels}
                onSelectChannel={setActiveChannelDetails}
                showOnlySold={false}
                favoriteNiches={favoriteNiches}
                initialFilters={browseFilters}
                onResetFilters={() => setBrowseFilters({ monetized: 'all', isShortsOnly: false })}
              />
            )}
            {activeTab === 'sold' && (
              <BrowseChannels
                channels={channels}
                onSelectChannel={setActiveChannelDetails}
                showOnlySold={true}
                favoriteNiches={favoriteNiches}
              />
            )}
          </div>
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />

      {activeChannelDetails && (
        <ChannelDetails channel={activeChannelDetails} onClose={() => setActiveChannelDetails(null)} />
      )}
    </div>
  );
}

import { useEffect, useState, FormEvent } from 'react';
import { 
  ShieldCheck, 
  Tv, 
  Users, 
  TrendingUp, 
  Activity, 
  Coins, 
  CheckCircle, 
  MessageCircle, 
  ChevronDown, 
  ArrowRight,
  Sparkles,
  Award,
  Play,
  Globe
} from 'lucide-react';
import { Channel, Testimonial, HomepageStats } from '../types';
import FeaturedCarousel from './FeaturedCarousel';
import GoogleAdSense from './GoogleAdSense';

interface HomepageOverviewProps {
  stats: HomepageStats;
  channels: Channel[];
  testimonials: Testimonial[];
  setActiveTab: (tab: 'home' | 'browse' | 'sold' | 'admin') => void;
  onSelectChannel: (channel: Channel) => void;
  favoriteNiches?: string[];
  onSubmitTestimonial?: (testi: { name: string; review: string; rating: number; role: string }) => Promise<any>;
  onNavigateWithFilters?: (monetized: 'all' | 'monetized' | 'non-monetized', isShortsOnly: boolean) => void;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Math.max(0, value);
    const duration = 900;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{displayValue.toLocaleString('en-IN')}{suffix}</>;
}

export default function HomepageOverview({ 
  stats, 
  channels, 
  testimonials, 
  setActiveTab, 
  onSelectChannel,
  favoriteNiches = [],
  onSubmitTestimonial,
  onNavigateWithFilters
}: HomepageOverviewProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  const formatSubscribers = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString();
  };

  const FAQS = [
    {
      q: "How does the channel ownership transfer process work?",
      a: "Once you settle on a price, our administrator coordinates the channel transfer. We guide the seller through ownership transfer (changing primary owner credentials in Google) safely and promptly. Payout is released once ownership holds are officially settled."
    },
    {
      q: "Are these channels verified and safe from copyright issues?",
      a: "Yes. Every single channel list undergoes strict administrative vetting. We verify historical AdSense reports, check for active copyright strikes, and ensure complete eligibility for ongoing monetization."
    },
    {
      q: "Can I sell my YouTube channel here?",
      a: "Absolutely. Contact our administrator directly on WhatsApp. We will perform a complete analytics appraisal, establish real market values, and list your channel safely on our platform."
    },
    {
      q: "Is the AdSense account included in the transfer?",
      a: "In most listings, yes. The channel listing description will indicate if the existing connected AdSense account is included or if you need to connect your own after ownership is transferred."
    }
  ];

  const activeListings = channels.filter(channel => channel.status === 'available').length;

  return (
    <div className="space-y-16 py-4" id="homepage-root">
      
      {/* 1. Hero Section with dynamic image background banner & text overlay */}
      <section className="relative rounded-3xl overflow-hidden py-24 px-6 sm:px-12 lg:px-16 text-center text-white shadow-xl border border-gray-800 min-h-[420px] flex items-center justify-center">
        {/* Real image background banner */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        {/* Gradient overlay for supreme dark background contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-gray-900/90 to-black/95 z-0" />
        
        <div className="relative max-w-3xl mx-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-3.5 py-1.5 rounded-full font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Verified YouTube Channel Brokerage
          </div>
          
          <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-white">
            Buy & Sell Verified <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-red-400 bg-clip-text text-transparent">
              YouTube Channels
            </span>
          </h1>

          <p className="text-gray-300 font-sans text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Find established, profitable digital assets with authentic analytics. Skip months of gridlock and build immediate income from verified niches.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('browse')}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-sans font-bold text-sm tracking-tight transition-transform hover:scale-[1.02] shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              Browse Channels
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className="w-full sm:w-auto px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-sans font-bold text-sm tracking-tight transition-transform hover:scale-[1.02] cursor-pointer"
            >
              View Sold Proofs
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans" aria-label="Marketplace highlights">
        {[
          { label: 'Happy Customers', value: 100, suffix: '+', tone: 'text-emerald-600', desc: 'Verified buyer & seller reviews', icon: <Users className="w-5 h-5 text-emerald-500" /> },
          { label: 'Active Listings', value: activeListings, suffix: '', tone: 'text-blue-600', desc: 'Channels available now', icon: <Tv className="w-5 h-5 text-blue-500" /> },
          { label: 'Completed Deals', value: stats.totalSold, suffix: '+', tone: 'text-red-600', desc: 'Sold records shown publicly', icon: <CheckCircle className="w-5 h-5 text-red-500" /> },
          { label: 'Admin Support', value: 24, suffix: 'h', tone: 'text-slate-900', desc: 'Direct WhatsApp response', icon: <Activity className="w-5 h-5 text-slate-500" /> },
        ].map((item, i) => (
          <div key={item.label} className="animate-fade-up bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col gap-3" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              {item.icon}
            </div>
            <div>
              <div className={`text-3xl font-black tracking-tight ${item.tone}`}>
                <AnimatedNumber value={item.value} suffix={item.suffix} />
              </div>
              <div className="text-xs font-extrabold text-gray-900 uppercase tracking-wide mt-1">{item.label}</div>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Monetization & Format Fast Filters */}
      <section className="space-y-6" id="fast-filters-hub">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
            Direct Access Filters
          </span>
          <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2">
            Browse by Project Status & Format
          </h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5 leading-relaxed">
            Click any category below to browse channels by monetization and format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Monetized Channels */}
          <button
            onClick={() => onNavigateWithFilters && onNavigateWithFilters('monetized', false)}
            className="group relative bg-gradient-to-br from-white to-blue-50/20 hover:to-blue-50/50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between space-y-6 cursor-pointer w-full"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Earn Revenue
              </span>
            </div>
            <div>
              <h4 className="font-sans font-black text-base text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                Monetized Channels
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans mt-1">
                Skip YouTube's review delays. Purchase verified projects that are pre-approved and earning direct ad revenues today.
              </p>
            </div>
          </button>

          {/* 2. Non-Monetized / Growth Channels */}
          <button
            onClick={() => onNavigateWithFilters && onNavigateWithFilters('non-monetized', false)}
            className="group relative bg-gradient-to-br from-white to-indigo-50/20 hover:to-indigo-50/50 p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between space-y-6 cursor-pointer w-full"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Unlocking Growth
              </span>
            </div>
            <div>
              <h4 className="font-sans font-black text-base text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                Non-Monetized Channels
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans mt-1">
                Invest at lower starting points. High-sub and high-reach accounts ready to connect to your custom AdSense credentials.
              </p>
            </div>
          </button>

          {/* 3. Shorts Content Engines */}
          <button
            onClick={() => onNavigateWithFilters && onNavigateWithFilters('all', true)}
            className="group relative bg-gradient-to-br from-white to-red-50/20 hover:to-red-50/50 p-6 rounded-2xl border border-gray-100 hover:border-red-200 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between space-y-6 cursor-pointer w-full"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                <Tv className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-extrabold bg-red-100 text-red-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Vertical Shorts
              </span>
            </div>
            <div>
              <h4 className="font-sans font-black text-base text-gray-900 group-hover:text-red-600 transition-colors flex items-center gap-1.5">
                Shorts Channels
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans mt-1">
                Tap into exponential virality. Channels built primarily around high-reach YouTube Shorts videos for rapid promotions.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Niche Interest personalized alert banner panel */}
      {favoriteNiches && favoriteNiches.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 font-sans tracking-tight">Choice Recommendations Active ({favoriteNiches.length})</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-sans leading-relaxed">
                Highlights prioritized for: <strong className="text-blue-700">{favoriteNiches.join(', ')}</strong>.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('browse')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold font-mono rounded-lg transition-transform hover:scale-[1.01] shrink-0 cursor-pointer shadow-xs"
          >
            Explore Preferences
          </button>
        </div>
      )}

      {/* 3. Featured Carousels / Lists */}
      <section>
        <FeaturedCarousel channels={channels} stats={stats} onSelectChannel={onSelectChannel} />
      </section>

      {/* Recently Added Listings by Administrator */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 uppercase">
              Recently Uploaded Listings
            </h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              The latest YouTube channels added by the admin team.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('browse')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-sans shrink-0 group self-start sm:self-auto"
          >
            See All Channels
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels
            .filter(c => c.status === 'available')
            .slice(0, 3)
            .map((chan) => {
              const primaryImage = chan.images && chan.images.length > 0 
                ? chan.images[0]
                : "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80";

              return (
                <div 
                  key={chan.id} 
                  onClick={() => onSelectChannel(chan)}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
                    <img 
                      src={primaryImage} 
                      alt={chan.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 text-white">
                      <span className="text-[9px] font-bold uppercase font-mono bg-emerald-600 text-white px-2 py-0.5 rounded shadow-sm">
                        {chan.niche}
                      </span>
                      <h4 className="font-sans font-black text-base mt-1 leading-tight line-clamp-1">
                        {chan.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>Subs: <strong className="text-gray-900 font-bold">
                          {chan.subscribers >= 1000000 
                            ? `${(chan.subscribers / 1000000).toFixed(1)}M` 
                            : chan.subscribers >= 1000 
                              ? `${(chan.subscribers / 1000).toFixed(0)}K` 
                              : chan.subscribers}
                        </strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Play className="w-3.5 h-3.5 text-gray-400" />
                        <span>Views: <strong className="text-gray-900 font-bold">
                          {chan.monthlyViews >= 1000000 
                            ? `${(chan.monthlyViews / 1000000).toFixed(1)}M` 
                            : chan.monthlyViews >= 1000 
                              ? `${(chan.monthlyViews / 1000).toFixed(0)}K` 
                              : chan.monthlyViews}
                        </strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Monetized: <strong className="text-gray-900 font-bold">{chan.monetized ? "Yes" : "No"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">Audience: <strong className="text-gray-900 font-bold">{chan.audienceCountry}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[8px] text-gray-400 font-bold uppercase font-mono">Asking Price</span>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded font-mono">
                          Confidential
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        View Deal
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 4. Core Trust Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
            Platform Benefits
          </span>
          <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2">
            Why Transact on Buy Sell Market?
          </h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5 leading-relaxed">
            We provide verified digital brokerage to completely secure high-stakes channel exchanges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Verified Analytics Details",
              desc: "Every listing is accompanied by authentic, admin-audited traffic, geography, and watch-time data. Zero dummy metrics or falsified claims.",
              icon: <Activity className="w-5 h-5 text-blue-600" />
            },
            {
              title: "Safe WhatsApp Communication",
              desc: "Direct, high-touch liaison. Speak directly with administrators to negotiate, transfer contracts, and coordinate ownership transfers safely.",
              icon: <MessageCircle className="w-5 h-5 text-emerald-600" />
            },
            {
              title: "Legitimate Asset Reassignment",
              desc: "Transactions are settled safely while email, password, and primary owner statuses are securely reassigned. No risk of loss or scam of funds.",
              icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />
            }
          ].map((feat, idx) => (
            <div key={idx} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-white rounded-xl shadow-xs flex items-center justify-center">
                {feat.icon}
              </div>
              <h4 className="font-sans font-bold text-sm text-gray-900">{feat.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Google Sponsor AdSense Spot */}
      <GoogleAdSense format="horizontal" slot="home-middle-sponsor" />

      {/* 5. Client Testimonials */}
      {testimonials.length > 0 && (
        <section className="space-y-6 overflow-hidden">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              Broker Credibility
            </span>
            <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2">
              Success Stories & Testimonials
            </h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5 leading-relaxed">
              Real opinions and reviews from our buyers and sellers around the world.
            </p>
          </div>

          {/* Row 1: left scroll */}
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-marquee-left w-max">
              {[...testimonials, ...testimonials].map((testi, i) => (
                <div key={`l-${i}`} className="w-72 shrink-0 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex text-amber-400 gap-0.5 text-sm">
                      {'★'.repeat(testi.rating)}{'☆'.repeat(5 - testi.rating)}
                    </div>
                    <p className="text-xs italic text-gray-600 leading-relaxed font-sans mt-2 line-clamp-2">
                      &ldquo;{testi.review}&rdquo;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="font-sans font-bold text-xs text-gray-900">{testi.name}</span>
                    <span className="text-[10px] text-blue-600 font-mono font-bold uppercase bg-blue-50 px-2 py-0.5 rounded">
                      {testi.role || 'Verified Customer'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: right scroll */}
          {testimonials.length > 1 && (
            <div className="relative overflow-hidden">
              <div className="flex gap-4 animate-marquee-right w-max">
                {[...testimonials, ...testimonials].reverse().map((testi, i) => (
                  <div key={`r-${i}`} className="w-72 shrink-0 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex text-amber-400 gap-0.5 text-sm">
                        {'★'.repeat(testi.rating)}{'☆'.repeat(5 - testi.rating)}
                      </div>
                      <p className="text-xs italic text-gray-600 leading-relaxed font-sans mt-2 line-clamp-2">
                        &ldquo;{testi.review}&rdquo;
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="font-sans font-bold text-xs text-gray-900">{testi.name}</span>
                      <span className="text-[10px] text-blue-600 font-mono font-bold uppercase bg-blue-50 px-2 py-0.5 rounded">
                        {testi.role || 'Verified Customer'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 6. FAQ Block */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
            Support Matrix
          </span>
          <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2">
            Frequently Asked Queries
          </h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5 leading-relaxed">
            Need clarification? Everything you need to know about channel listings.
          </p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          {FAQS.map((faq, idx) => {
            const isOpened = expandedFaq === idx;
            return (
              <div key={idx} className="transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center py-4 px-6 text-left hover:bg-gray-50/50 cursor-pointer"
                >
                  <span className="font-sans font-bold text-sm text-gray-800">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpened ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {isOpened && (
                  <div className="pb-5 px-6 pt-1 text-xs text-gray-500 leading-relaxed font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Sell banner CTA */}
      <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center space-y-4 max-w-4xl mx-auto shadow-sm">
        <div className="inline-flex p-3 bg-white rounded-2xl shadow-xs border border-gray-100 text-emerald-600">
          <Award className="w-8 h-8" />
        </div>
        <div className="max-w-lg mx-auto space-y-2">
          <h3 className="font-sans font-extrabold text-xl text-gray-900">Have a YouTube Channel to Sell?</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-sans">
            Get an instant, secure analysis. Speak directly with us via WhatsApp to receive your estimated appraisal valuation and draft our Listing Agreement.
          </p>
        </div>
        <div className="pt-2">
          <a
            href="https://wa.me/919144534891?text=Hello!%20I%20have%20a%20YouTube%20Channel%20that%20I%20want%20to%20appraise%20and%20sell%20on%20Buy%20Sell%20Market."
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs px-6 py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-emerald-500/10 cursor-pointer"
            id="appraisal-whatsapp-cta"
          >
            <MessageCircle className="w-4 h-4" />
            Speak Direct with an Appraiser
          </a>
        </div>
      </section>

    </div>
  );
}

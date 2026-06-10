import { useState, FormEvent } from 'react';
import { 
  ShieldCheck, 
  Tv, 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Coins, 
  CheckCircle, 
  MessageCircle, 
  HelpCircle, 
  ChevronDown, 
  ArrowRight,
  Sparkles,
  Award,
  X,
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

  // Simple feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackRole, setFeedbackRole] = useState('Verified Buyer');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackReview, setFeedbackReview] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  const handleFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackReview) return;
    setFeedbackLoading(true);
    try {
      if (onSubmitTestimonial) {
        await onSubmitTestimonial({
          name: feedbackName,
          role: feedbackRole,
          rating: feedbackRating,
          review: feedbackReview
        });
        setFeedbackSuccess("Your recommendation has been submitted safely! Thank you!");
        setFeedbackName('');
        setFeedbackReview('');
        setFeedbackRating(5);
        setTimeout(() => setFeedbackSuccess(null), 5000);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const formatSubscribers = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString();
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
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

      {/* 2. Platform Real-Time Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {[
          { 
            label: "ESTABLISHED PROJECTS", 
            val: stats.totalListings, 
            desc: "Channels active on Buy Sell Market", 
            icon: <Tv className="w-5 h-5 text-blue-600" />,
            bg: "bg-blue-50/50"
          },
          { 
            label: "COMPLETED PORTFOLIOS", 
            val: stats.totalSold, 
            desc: "Completed channel listings", 
            icon: <CheckCircle className="w-5 h-5 text-red-600" />,
            bg: "bg-red-50/50"
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">
                {item.label}
              </span>
              <div className={`p-2.5 rounded-lg ${item.bg}`}>
                {item.icon}
              </div>
            </div>
            <div>
              <strong className="block text-3xl font-black text-gray-950 font-sans tracking-tight leading-none">
                {item.val}
              </strong>
              <p className="text-xs text-gray-400 font-sans mt-1">{item.desc}</p>
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
        <section className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testi) => (
              <div key={testi.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-500 gap-0.5">
                    {Array.from({ length: testi.rating }).map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-xs italic text-gray-600 leading-relaxed font-sans mt-3">
                    &ldquo;{testi.review}&rdquo;
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="font-sans font-bold text-xs text-gray-900">{testi.name}</span>
                  <span className="text-[10px] text-blue-600 font-mono font-bold uppercase bg-blue-50 px-2 py-0.5 rounded">
                    {testi.role || "Verified Customer"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Handlers and Form for submitting digital comments & rating recommendations */}
          <div className="hidden flex-col items-center pt-2 gap-4">
            {!showFeedbackForm ? (
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center gap-1.5 focus:outline-hidden"
                id="show-feedback-form-cta"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upload Review or Testimonial
              </button>
            ) : (
              <div className="w-full max-w-xl bg-white p-6 rounded-2xl border border-gray-200/80 shadow-md space-y-4 text-left animate-fade-in" id="feedback-form-container">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 font-sans">Submit Brokerage Review</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-sans">Share your digital asset acquisition story with the community.</p>
                  </div>
                  <button 
                    onClick={() => setShowFeedbackForm(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {feedbackSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-sans text-center">
                    {feedbackSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase font-mono mb-1">Your Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={feedbackName}
                          onChange={(e) => setFeedbackName(e.target.value)}
                          placeholder="Alex Mercer"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-gray-50/35 font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase font-mono mb-1">Your Role</label>
                        <select
                          value={feedbackRole}
                          onChange={(e) => setFeedbackRole(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-gray-50/35 font-sans font-medium"
                        >
                          <option value="Verified Buyer">Verified Buyer</option>
                          <option value="Verified Seller">Verified Seller</option>
                          <option value="Registered Broker">Registered Broker</option>
                          <option value="Guest Acquirer">Guest Acquirer</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase font-mono mb-1">Satisfaction Rating</label>
                      <div className="flex gap-1.5 items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            className="text-lg transition-transform hover:scale-110 focus:outline-hidden cursor-pointer"
                          >
                            {star <= feedbackRating ? '★' : '☆'}
                          </button>
                        ))}
                        <span className="text-[10px] text-gray-400 font-mono ml-2">({feedbackRating} / 5 stars)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase font-mono mb-1">Detailed Review</label>
                      <textarea
                        required
                        value={feedbackReview}
                        onChange={(e) => setFeedbackReview(e.target.value)}
                        placeholder="I successfully bought a verified tech channel with 120k subscribers inside 4 days. Safe ownership transfer, excellent administrator liaison..."
                        rows={3}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-gray-50/35 font-sans"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowFeedbackForm(false)}
                        className="px-4 py-1.5 border border-gray-200 text-xs font-semibold rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={feedbackLoading}
                        className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        {feedbackLoading ? "Publishing..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
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

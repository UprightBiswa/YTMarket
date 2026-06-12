import { useEffect, useState } from 'react';
import {
  ShieldCheck, Tv, Users, TrendingUp, Activity, Coins,
  CheckCircle, MessageCircle, ChevronDown, ArrowRight,
  Sparkles, Award, Play, Globe
} from 'lucide-react';
import { Channel, Testimonial, HomepageStats } from '../types';
import { getAdminWhatsAppNumber } from '../lib/db';
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
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{displayValue.toLocaleString('en-IN')}{suffix}</>;
}

export default function HomepageOverview({
  stats, channels, testimonials, setActiveTab, onSelectChannel,
  favoriteNiches = [], onNavigateWithFilters
}: HomepageOverviewProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [waNumber, setWaNumber] = useState(getAdminWhatsAppNumber());

  useEffect(() => {
    const sync = () => setWaNumber(getAdminWhatsAppNumber());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const toggleFaq = (idx: number) => setExpandedFaq(expandedFaq === idx ? null : idx);

  const FAQS = [
    {
      q: 'How does the channel ownership transfer process work?',
      a: 'Once you settle on a price, our administrator coordinates the channel transfer. We guide the seller through ownership transfer safely and promptly. Payout is released once ownership is officially settled.'
    },
    {
      q: 'Are these channels verified and safe from copyright issues?',
      a: 'Yes. Every channel undergoes strict administrative vetting. We verify AdSense reports, check for copyright strikes, and ensure complete monetization eligibility.'
    },
    {
      q: 'Can I sell my YouTube channel here?',
      a: 'Absolutely. Contact our administrator on WhatsApp. We will perform a complete analytics appraisal, establish market value, and list your channel safely.'
    },
    {
      q: 'Is the AdSense account included in the transfer?',
      a: 'In most listings, yes. The description will indicate if the AdSense account is included or if you need to connect your own after ownership transfer.'
    }
  ];

  const activeListings = channels.filter(c => c.status === 'available').length;
  const waLink = waNumber
    ? `https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=Hello!%20I%20have%20a%20YouTube%20Channel%20I%20want%20to%20sell%20on%20Buy%20Sell%20Market.`
    : '#';

  return (
    <div className="space-y-16 py-4" id="homepage-root">

      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden py-24 px-6 sm:px-12 lg:px-16 text-center text-white shadow-xl border border-gray-800 min-h-[420px] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-gray-900/90 to-black/95 z-0" />
        <div className="relative max-w-3xl mx-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-3.5 py-1.5 rounded-full font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Verified YouTube Channel Brokerage
          </div>
          <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-white">
            Buy & Sell Verified <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-red-400 bg-clip-text text-transparent">YouTube Channels</span>
          </h1>
          <p className="text-gray-300 font-sans text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Find established, profitable digital assets with authentic analytics. Skip months of gridlock and build immediate income from verified niches.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setActiveTab('browse')} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-sans font-bold text-sm tracking-tight transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
              Browse Channels <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setActiveTab('sold')} className="w-full sm:w-auto px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white rounded-xl font-sans font-bold text-sm tracking-tight transition-all">
              View Sold Proofs
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans" aria-label="Marketplace highlights">
        {[
          { label: 'Happy Customers', value: 100, suffix: '+', tone: 'text-emerald-600', desc: 'Verified buyer & seller reviews', icon: <Users className="w-5 h-5 text-emerald-500" /> },
          { label: 'Active Listings', value: activeListings, suffix: '', tone: 'text-blue-600', desc: 'Channels available now', icon: <Tv className="w-5 h-5 text-blue-500" /> },
          { label: 'Completed Deals', value: stats.totalSold, suffix: '+', tone: 'text-red-600', desc: 'Sold records shown publicly', icon: <CheckCircle className="w-5 h-5 text-red-500" /> },
          { label: 'Admin Support', value: 24, suffix: 'h', tone: 'text-slate-900', desc: 'Direct WhatsApp response', icon: <Activity className="w-5 h-5 text-slate-500" /> },
        ].map((item, i) => (
          <div key={item.label} className="animate-fade-up bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col gap-3" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">{item.icon}</div>
            <div>
              <div className={`text-3xl font-black tracking-tight ${item.tone}`}><AnimatedNumber value={item.value} suffix={item.suffix} /></div>
              <div className="text-xs font-extrabold text-gray-900 uppercase tracking-wide mt-1">{item.label}</div>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Browse filters */}
      <section className="space-y-6" id="fast-filters-hub">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Direct Access Filters</span>
          <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2">Browse by Project Status & Format</h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5 leading-relaxed">Click any category below to browse channels by monetization and format.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Monetized Channels', badge: 'Earn Revenue', desc: "Skip YouTube's review delays. Purchase verified projects earning direct ad revenues today.", icon: <Coins className="w-6 h-6" />, color: 'blue', onClick: () => onNavigateWithFilters?.('monetized', false) },
            { label: 'Non-Monetized Channels', badge: 'Unlocking Growth', desc: 'Invest at lower starting points. High-sub accounts ready to connect to your AdSense.', icon: <TrendingUp className="w-6 h-6" />, color: 'indigo', onClick: () => onNavigateWithFilters?.('non-monetized', false) },
            { label: 'Shorts Channels', badge: 'Vertical Shorts', desc: 'Tap into exponential virality. Channels built around high-reach YouTube Shorts.', icon: <Tv className="w-6 h-6" />, color: 'red', onClick: () => onNavigateWithFilters?.('all', true) },
          ].map(f => (
            <button key={f.label} onClick={f.onClick}
              className={`group relative bg-gradient-to-br from-white to-${f.color}-50/20 hover:to-${f.color}-50/50 p-6 rounded-2xl border border-gray-100 hover:border-${f.color}-200 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between space-y-6 cursor-pointer w-full`}>
              <div className="flex justify-between items-start">
                <div className={`p-3 bg-${f.color}-50 text-${f.color}-600 rounded-xl group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <span className={`text-[10px] font-mono font-extrabold bg-${f.color}-100 text-${f.color}-800 px-2 py-0.5 rounded-full uppercase tracking-wider`}>{f.badge}</span>
              </div>
              <div>
                <h4 className={`font-sans font-black text-base text-gray-900 group-hover:text-${f.color}-600 transition-colors flex items-center gap-1.5`}>
                  {f.label}<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed font-sans mt-1">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {favoriteNiches.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0"><Sparkles className="w-4 h-4" /></div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 font-sans">Recommendations Active ({favoriteNiches.length})</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-sans">Highlights for: <strong className="text-blue-700">{favoriteNiches.join(', ')}</strong></p>
            </div>
          </div>
          <button onClick={() => setActiveTab('browse')} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold font-mono rounded-lg transition-all shrink-0">
            Explore
          </button>
        </div>
      )}

      <section><FeaturedCarousel channels={channels} stats={stats} onSelectChannel={onSelectChannel} /></section>

      {/* Recent listings */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 uppercase">Recently Uploaded Listings</h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5">The latest YouTube channels added by the admin team.</p>
          </div>
          <button onClick={() => setActiveTab('browse')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer shrink-0 group self-start sm:self-auto">
            See All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.filter(c => c.status === 'available').slice(0, 3).map(chan => {
            const img = chan.images?.[0] || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80';
            return (
              <div key={chan.id} onClick={() => onSelectChannel(chan)} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col">
                <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
                  <img src={img} alt={chan.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                    <span className="text-[9px] font-bold uppercase font-mono bg-emerald-600 px-2 py-0.5 rounded">{chan.niche}</span>
                    <h4 className="font-sans font-black text-base mt-1 line-clamp-1">{chan.title}</h4>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs border-b border-gray-50 pb-3">
                    <div className="flex items-center gap-1.5 text-gray-500"><Users className="w-3.5 h-3.5 text-gray-400" /><span>Subs: <strong className="text-gray-900">{chan.subscribers >= 1000000 ? `${(chan.subscribers/1000000).toFixed(1)}M` : chan.subscribers >= 1000 ? `${(chan.subscribers/1000).toFixed(0)}K` : chan.subscribers}</strong></span></div>
                    <div className="flex items-center gap-1.5 text-gray-500"><Play className="w-3.5 h-3.5 text-gray-400" /><span>Views: <strong className="text-gray-900">{chan.monthlyViews >= 1000000 ? `${(chan.monthlyViews/1000000).toFixed(1)}M` : chan.monthlyViews >= 1000 ? `${(chan.monthlyViews/1000).toFixed(0)}K` : chan.monthlyViews}</strong></span></div>
                    <div className="flex items-center gap-1.5 text-gray-500"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span>Monetized: <strong className="text-gray-900">{chan.monetized ? 'Yes' : 'No'}</strong></span></div>
                    <div className="flex items-center gap-1.5 text-gray-500"><Globe className="w-3.5 h-3.5 text-gray-400" /><span className="truncate">Audience: <strong className="text-gray-900">{chan.audienceCountry}</strong></span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] text-gray-400 font-bold uppercase font-mono">Asking Price</span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded font-mono">Confidential</span>
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">View Deal</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Platform Benefits</span>
          <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2">Why Transact on Buy Sell Market?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Verified Analytics', desc: 'Every listing is admin-audited. Zero dummy metrics or falsified claims.', icon: <Activity className="w-5 h-5 text-blue-600" /> },
            { title: 'Safe WhatsApp Comms', desc: 'Speak directly with admins to negotiate, transfer contracts, and coordinate ownership.', icon: <MessageCircle className="w-5 h-5 text-emerald-600" /> },
            { title: 'Secure Asset Transfer', desc: 'Email, password, and primary owner statuses securely reassigned. No risk of scam.', icon: <ShieldCheck className="w-5 h-5 text-indigo-600" /> },
          ].map((f, i) => (
            <div key={i} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-white rounded-xl shadow-xs flex items-center justify-center">{f.icon}</div>
              <h4 className="font-sans font-bold text-sm text-gray-900">{f.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <GoogleAdSense format="horizontal" slot="home-middle-sponsor" />

      {/* Testimonials marquee */}
      {testimonials.length > 0 && (
        <section className="space-y-4 overflow-hidden">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Broker Credibility</span>
            <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2">Success Stories & Testimonials</h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5">Real opinions from our buyers and sellers around the world.</p>
          </div>

          {/* Always duplicate enough copies so the strip is wide enough to scroll smoothly */}
          {(() => {
            // Need at least 8 cards per row so animation looks continuous on any screen
            const minCopies = Math.ceil(8 / Math.max(testimonials.length, 1));
            const strip = Array.from({ length: minCopies * 2 }, (_, i) => testimonials[i % testimonials.length]);
            return (
              <>
                {/* Row 1 — scroll left */}
                <div className="overflow-hidden">
                  <div className="flex gap-4 animate-marquee-left" style={{ width: 'max-content' }}>
                    {strip.map((t, i) => (
                      <div key={`l-${i}`} className="testi-card shrink-0 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-amber-400 text-base tracking-wide">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                          <p className="text-xs italic text-gray-600 leading-relaxed mt-2 line-clamp-3">&ldquo;{t.review}&rdquo;</p>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-gray-900 truncate">{t.name}</span>
                          <span className="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded shrink-0">{t.role || 'Verified Customer'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2 — scroll right (reversed) */}
                <div className="overflow-hidden">
                  <div className="flex gap-4 animate-marquee-right" style={{ width: 'max-content' }}>
                    {[...strip].reverse().map((t, i) => (
                      <div key={`r-${i}`} className="testi-card shrink-0 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-amber-400 text-base tracking-wide">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                          <p className="text-xs italic text-gray-600 leading-relaxed mt-2 line-clamp-3">&ldquo;{t.review}&rdquo;</p>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-gray-900 truncate">{t.name}</span>
                          <span className="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded shrink-0">{t.role || 'Verified Customer'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </section>
      )}

      {/* FAQ */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Support Matrix</span>
          <h3 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2">Frequently Asked Queries</h3>
        </div>
        <div className="max-w-3xl mx-auto divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          {FAQS.map((faq, idx) => (
            <div key={idx}>
              <button onClick={() => toggleFaq(idx)} className="w-full flex justify-between items-center py-4 px-6 text-left hover:bg-gray-50/50">
                <span className="font-sans font-bold text-sm text-gray-800">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {expandedFaq === idx && <div className="pb-5 px-6 pt-1 text-xs text-gray-500 leading-relaxed font-sans">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Sell CTA */}
      <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center space-y-4 max-w-4xl mx-auto shadow-sm">
        <div className="inline-flex p-3 bg-white rounded-2xl shadow-xs border border-gray-100 text-emerald-600">
          <Award className="w-8 h-8" />
        </div>
        <div className="max-w-lg mx-auto space-y-2">
          <h3 className="font-sans font-extrabold text-xl text-gray-900">Have a YouTube Channel to Sell?</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-sans">Get an instant, secure analysis. Speak directly with us via WhatsApp for your appraisal valuation.</p>
        </div>
        <div className="pt-2">
          <a href={waLink} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-sans font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md cursor-pointer">
            <MessageCircle className="w-4 h-4" />
            Speak Direct with an Appraiser
          </a>
        </div>
      </section>

    </div>
  );
}

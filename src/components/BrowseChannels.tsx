import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  CheckCircle, 
  ArrowUpRight, 
  DollarSign, 
  Users, 
  Play, 
  Globe, 
  Sparkles, 
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Channel } from '../types';
import { NICHES } from '../lib/mockData';

interface BrowseChannelsProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  showOnlySold?: boolean;
  favoriteNiches?: string[];
  initialFilters?: {
    monetized: 'all' | 'monetized' | 'non-monetized';
    isShortsOnly: boolean;
  };
  onResetFilters?: () => void;
}

export default function BrowseChannels({ 
  channels, 
  onSelectChannel, 
  showOnlySold = false, 
  favoriteNiches = [],
  initialFilters,
  onResetFilters
}: BrowseChannelsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [monetizedFilter, setMonetizedFilter] = useState<'all' | 'monetized' | 'non-monetized'>('all');
  const [priceRange, setPriceRange] = useState<number>(30000000); // Higher maximum for rupees scale
  const [subscriberRange, setSubscriberRange] = useState<'all' | 'under-50k' | '50k-150k' | '150k-500k' | 'over-500k'>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [shortsFilter, setShortsFilter] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedNiche, monetizedFilter, priceRange, subscriberRange, featuredOnly, shortsFilter]);

  // Sync route overrides
  useEffect(() => {
    if (initialFilters) {
      setMonetizedFilter(initialFilters.monetized);
      setShortsFilter(initialFilters.isShortsOnly);
    }
  }, [initialFilters]);

  // Reset helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedNiche('All');
    setMonetizedFilter('all');
    setPriceRange(30000000);
    setSubscriberRange('all');
    setFeaturedOnly(false);
    setShortsFilter(false);
    if (onResetFilters) {
      onResetFilters();
    }
  };

  // Filter criteria logic
  const filteredChannels = useMemo(() => {
    const list = channels.filter((chan) => {
      // Sold status toggle
      if (showOnlySold) {
        if (chan.status !== 'sold') return false;
      } else {
        if (chan.status !== 'available') return false;
      }

      // Keyword / Title Match
      const matchesSearch = 
        chan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chan.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chan.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Niche Match
      if (selectedNiche !== 'All' && chan.niche !== selectedNiche) return false;

      // Monetization Match
      if (monetizedFilter === 'monetized' && !chan.monetized) return false;
      if (monetizedFilter === 'non-monetized' && chan.monetized) return false;

      // Subscribers Match
      if (subscriberRange === 'under-50k' && chan.subscribers >= 50000) return false;
      if (subscriberRange === '50k-150k' && (chan.subscribers < 50000 || chan.subscribers > 150000)) return false;
      if (subscriberRange === '150k-500k' && (chan.subscribers < 150000 || chan.subscribers > 500000)) return false;
      if (subscriberRange === 'over-500k' && chan.subscribers <= 500000) return false;

      // Featured matches
      if (featuredOnly && !chan.featured) return false;

      // Shorts Match
      if (shortsFilter && !chan.shorts) return false;

      return true;
    });

    // If we have custom cookie preference niches, float them to the top of listings!
    if (favoriteNiches && favoriteNiches.length > 0) {
      return [...list].sort((a, b) => {
        const aFav = favoriteNiches.includes(a.niche) ? 1 : 0;
        const bFav = favoriteNiches.includes(b.niche) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        // secondary sort by subscribers ascending/descending
        return b.subscribers - a.subscribers;
      });
    }

    return list;
  }, [channels, searchTerm, selectedNiche, monetizedFilter, priceRange, subscriberRange, featuredOnly, shortsFilter, showOnlySold, favoriteNiches]);

  const ITEMS_PER_PAGE = 6;
  const paginatedChannels = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredChannels.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredChannels, currentPage]);

  const totalPages = Math.ceil(filteredChannels.length / ITEMS_PER_PAGE);

  const maxPriceForSlider = useMemo(() => {
    const list = channels.filter(c => showOnlySold ? c.status === 'sold' : c.status === 'available');
    if (list.length === 0) return 30000000;
    return Math.max(...list.map(c => c.price), 50000);
  }, [channels, showOnlySold]);

  const formatSubscribers = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString();
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6" id="browse-channels-wrapper">
      
      {/* Title block */}
      <div>
        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
          {showOnlySold ? "Sold Records Portfolio" : "Active Brokerage Listings"}
        </span>
        <h2 className="font-sans font-black text-3xl tracking-tight text-gray-900 mt-2">
          {showOnlySold ? "Historical Sales Proof" : "Explore YouTube Channels"}
        </h2>
        <p className="text-xs text-gray-500 font-sans mt-0.5">
          {showOnlySold 
            ? "Inspect verified sold deals to see real asset transactions mediated successfully on our platform."
            : "Discover genuine YouTube channels for sale. Filter by niche, subscriber metrics, or asking range to narrow options."}
        </p>
      </div>

      {/* Main Search and filter layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Filter Options Toolbar (Desktop) / Sliding mobile header */}
        <aside className="w-full lg:w-64 shrink-0 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs h-fit space-y-6 hidden lg:block">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-sm font-bold text-gray-900 flex items-center gap-2 font-sans">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Advanced Filters
            </span>
            <button 
              onClick={handleResetFilters}
              className="text-gray-400 hover:text-blue-600 text-xs font-mono font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Search Input inside block */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 font-sans">Broker Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, keywords..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Niche select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 font-sans">Media Niche</label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50 font-sans font-medium"
            >
              <option value="All">All Niches</option>
              {NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Subscribers bounds select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 font-sans">Subscribers Size</label>
            <div className="flex flex-col gap-1.5 text-xs">
              {[
                { label: 'All Audits', value: 'all' },
                { label: 'Under 50K Subs', value: 'under-50k' },
                { label: '50K - 150K Subs', value: '50k-150k' },
                { label: '150K - 500K Subs', value: '150k-500k' },
                { label: 'Over 500K Subs', value: 'over-500k' }
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                  <input
                    type="radio"
                    name="subscriber-range"
                    checked={subscriberRange === opt.value}
                    onChange={() => setSubscriberRange(opt.value as any)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Monetization details toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 font-sans">Monetization Rank</label>
            <div className="flex flex-col gap-1.5 text-xs">
              {[
                { label: 'Show All', val: 'all' },
                { label: 'Monetized Only', val: 'monetized' },
                { label: 'Non-Monetized', val: 'non-monetized' },
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                  <input
                    type="radio"
                    name="monetize-radio"
                    checked={monetizedFilter === opt.val}
                    onChange={() => setMonetizedFilter(opt.val as any)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Featured only checkbox and formats */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            {!showOnlySold && (
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <span className="flex items-center gap-1 font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Premium Features Only
                </span>
              </label>
            )}

            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={shortsFilter}
                onChange={(e) => setShortsFilter(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              <span className="flex items-center gap-1 font-sans">
                <Play className="w-3.5 h-3.5 text-red-500 shrink-0" />
                Shorts Formats Only
              </span>
            </label>
          </div>
        </aside>

        {/* Mobile quick filters header */}
        <div className="lg:hidden bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <div className="relative flex-1 mr-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search channels..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1 cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            Filters
          </button>
        </div>

        {/* Mobile sliding filter menu */}
        {showFiltersMobile && (
          <div className="fixed inset-0 z-50 overflow-y-auto lg:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setShowFiltersMobile(false)}></div>
            <div className="relative transform bg-white p-6 w-full max-w-xs h-full flex flex-col justify-between overflow-y-auto ml-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    Advanced Filters
                  </span>
                  <button onClick={() => setShowFiltersMobile(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Media Niche</label>
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="All">All Niches</option>
                    {NICHES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Monetization Rank</label>
                  <select
                    value={monetizedFilter}
                    onChange={(e) => setMonetizedFilter(e.target.value as any)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="all">Show All</option>
                    <option value="monetized">Monetized Only</option>
                    <option value="non-monetized">Non-Monetized</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Subscribers Volume</label>
                  <select
                    value={subscriberRange}
                    onChange={(e) => setSubscriberRange(e.target.value as any)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="all">All Audits</option>
                    <option value="under-50k">Under 50K Subs</option>
                    <option value="50k-150k">50K - 150K Subs</option>
                    <option value="150k-500k">150K - 500K Subs</option>
                    <option value="over-500k">Over 500K Subs</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  {!showOnlySold && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredOnly}
                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Premium Features Only</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shortsFilter}
                      onChange={(e) => setShortsFilter(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Shorts Formats Only</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-2">
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs"
                >
                  Reset Actions
                </button>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg text-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Grid of channel cards */}
        <div className="flex-1">
          {filteredChannels.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-lg text-gray-900">No Channels Found</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-sans mt-1">
                  We currently do not have matching YouTube assets for this selected combination of metrics. Try resetting or relaxing your filtering criteria.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                Reset Filter Settings
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedChannels.map((chan) => {
                  const primaryImage = chan.images && chan.images.length > 0 
                    ? chan.images[0]
                    : "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80";

                  return (
                    <div
                      key={chan.id}
                      onClick={() => onSelectChannel(chan)}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
                    >
                      
                      {/* Badge / Graphics overlay */}
                      <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
                        <img 
                          src={primaryImage} 
                          alt={chan.title} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          referrerPolicy="no-referrer"
                        />
                        
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 text-white">
                          <span className="text-[9px] font-bold uppercase font-mono bg-blue-600/95 text-white px-2 py-0.5 rounded shadow-sm">
                            {chan.niche}
                          </span>
                          <h3 className="font-sans font-extrabold text-base mt-1 leading-tight line-clamp-1 flex items-center gap-1">
                            {chan.title}
                            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                          </h3>
                        </div>

                        {/* Featured badges */}
                        {chan.featured && chan.status !== 'sold' && (
                          <span className="absolute top-3 left-3 bg-amber-500 text-gray-950 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">
                            Premium
                          </span>
                        )}

                        {/* Favorite Niche Badge */}
                        {favoriteNiches && favoriteNiches.includes(chan.niche) && chan.status !== 'sold' && (
                          <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase font-mono tracking-wider flex items-center gap-1 shadow-sm leading-none">
                            ⭐ Choice
                          </span>
                        )}

                        {/* Sold stamps overlay */}
                        {chan.status === 'sold' && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="px-4 py-1.5 border-2 border-red-500 text-red-500 font-sans font-black text-xs uppercase tracking-wider rounded-lg transform -rotate-6 shadow-sm">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Meta specification panel */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        
                        {/* Metric lines */}
                        <div className="grid grid-cols-2 gap-3 text-xs border-b border-gray-50 pb-3">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span>Subs: <strong className="text-gray-900 font-semibold">{formatSubscribers(chan.subscribers)}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Play className="w-3.5 h-3.5 text-gray-400" />
                            <span>Views: <strong className="text-gray-900 font-semibold">{formatSubscribers(chan.monthlyViews)}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                            <span>Monetized: <strong className="text-gray-900 font-semibold">{chan.monetized ? "Yes" : "No"}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">Audience: <strong className="text-gray-900 font-semibold">{chan.audienceCountry}</strong></span>
                          </div>
                        </div>

                        {/* Pricing and view detail button triggers */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block text-[8px] text-gray-400 font-semibold uppercase font-mono">Asking Price</span>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded font-mono">
                              Confidential
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                            {chan.status === 'sold' ? "Review Deal" : "Enquire"}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Beautiful Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-xs mt-6">
                  <span className="text-xs text-gray-500 font-sans">
                    Showing <strong className="font-semibold text-gray-900">{Math.min(filteredChannels.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredChannels.length, currentPage * ITEMS_PER_PAGE)}</strong> of <strong className="font-semibold text-gray-900">{filteredChannels.length}</strong> listings
                  </span>
                  <div className="flex items-center gap-1.5" id="pagination-nav-tabs">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:hover:bg-gray-50 text-xs font-bold font-mono rounded-xl border border-gray-100 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xl font-mono cursor-pointer transition-all ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white border border-blue-700'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:hover:bg-gray-50 text-xs font-bold font-mono rounded-xl border border-gray-100 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

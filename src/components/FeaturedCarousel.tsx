import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Channel, HomepageStats } from '../types';
import { getAdminWhatsAppNumber } from '../lib/db';

interface FeaturedCarouselProps {
  channels: Channel[];
  stats?: HomepageStats;
  onSelectChannel: (channel: Channel) => void;
}

export default function FeaturedCarousel({ channels, onSelectChannel }: FeaturedCarouselProps) {
  const featuredAvailable = channels.filter(c => c.featured && c.status === 'available');
  const allAvailable = channels.filter(c => c.status === 'available');
  const allSold = channels.filter(c => c.status === 'sold');

  const largeChannel = featuredAvailable[0] || allAvailable[0];
  const sideChannel1 = featuredAvailable[1] || allAvailable[1] || allAvailable[0];
  const soldChannel = allSold[0];
  const sideChannel3 = featuredAvailable[2] || allAvailable[2] || allAvailable[1] || allAvailable[0];

  const formatCount = (val: number) => {
    if (!val) return '0';
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString();
  };

  const waNumber = getAdminWhatsAppNumber().replace(/[^0-9]/g, '');

  return (
    <div className="space-y-6" id="bento-featured-matrix-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider font-mono border border-blue-100">
            Marketplace Showcase
          </span>
          <h3 className="font-sans font-black text-2xl tracking-tight text-slate-900 mt-2">
            Verified YouTube Marketplace
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Browse active channels currently reviewed by the admin team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {largeChannel ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
                  Featured Channel
                </span>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                  Confidential
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-200">
                  <img
                    src={largeChannel.images?.[0] || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=150&q=80'}
                    alt={largeChannel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-1.5 leading-snug">
                    {largeChannel.title}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">
                      {largeChannel.niche}
                    </span>
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {largeChannel.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold font-mono mt-2.5">
                    <span className="px-2 py-1 bg-slate-50 rounded text-slate-600 border border-slate-100">
                      {formatCount(largeChannel.subscribers)} Subscribers
                    </span>
                    <span className="px-2 py-1 bg-green-50 rounded text-green-700 border border-green-100">
                      {largeChannel.monetized ? 'Monetized' : 'Non-monetized'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4 mt-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400">Monthly Views:</span>
                    <span className="font-semibold text-slate-800">{formatCount(largeChannel.monthlyViews)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400">Format:</span>
                    <span className="font-semibold text-slate-800">{largeChannel.shorts ? 'Shorts' : 'Long-form'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Audience:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[90px]">{largeChannel.audienceCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Channel Age:</span>
                    <span className="font-semibold text-slate-800">{largeChannel.channelAge}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2">
              <button
                onClick={() => onSelectChannel(largeChannel)}
                className="col-span-2 px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all font-mono tracking-tight"
              >
                View Details
              </button>
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello! I am interested in the YouTube channel "${largeChannel.title}". Link: ${window.location.origin}${window.location.pathname}?id=${largeChannel.id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="col-span-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Contact WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 flex items-center justify-center text-slate-400">
            No active listings found.
          </div>
        )}

        {[sideChannel1, soldChannel, sideChannel3].map((channel, index) => {
          if (!channel) {
            return (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-center text-slate-300 text-xs">
                Awaiting listings...
              </div>
            );
          }

          const isSold = channel.status === 'sold';
          return (
            <div key={`${channel.id}-${index}`} className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow ${isSold ? 'opacity-90 relative overflow-hidden' : ''}`}>
              {isSold && (
                <div className="absolute inset-0 bg-slate-50/30 flex items-center justify-center pointer-events-none select-none z-10">
                  <span className="px-4 py-1.5 border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase tracking-wider rounded-lg -rotate-12 bg-white/90 shadow-sm">
                    Sold Out
                  </span>
                </div>
              )}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-md font-mono uppercase">
                    {channel.niche}
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded font-mono">
                    Confidential
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                  {channel.title}
                </h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  {formatCount(channel.subscribers)} Subs | {isSold ? 'Transacted' : `${formatCount(channel.monthlyViews)} Monthly Views`}
                </p>
                {!isSold && (
                  <p className="text-slate-400 text-[11px] font-sans mt-2 line-clamp-2 leading-normal">
                    {channel.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between relative z-20">
                <div className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  {isSold ? 'Sold Proof' : channel.monetized ? 'Monetized' : 'Growth'}
                </div>
                <button
                  onClick={() => onSelectChannel(channel)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  Details <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-md border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
            Customer Support
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-white leading-none">
              Fast Reply
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              Direct admin WhatsApp contact for every listing.
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="text-2xl font-black tracking-tight text-white leading-none">
              Private Price
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              Final pricing is shared only after inquiry.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 py-4 px-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
          {['Admin Reviewed', 'Clear Channel Details', 'Direct WhatsApp Link'].map((trustName) => (
            <div key={trustName} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-50 rounded-full text-blue-600 flex items-center justify-center border border-blue-100">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">
                {trustName}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-400 font-mono font-medium italic">
          Active listings are managed by the admin team.
        </div>
      </div>
    </div>
  );
}

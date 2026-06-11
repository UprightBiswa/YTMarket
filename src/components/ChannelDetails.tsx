import { useState, useEffect, useCallback } from 'react';
import {
  X, MessageSquare, CheckCircle2, ShieldCheck,
  TrendingUp, DollarSign, Users, Globe,
  ChevronLeft, ChevronRight, ZoomIn, Maximize2,
} from 'lucide-react';
import { Channel } from '../types';
import GoogleAdSense from './GoogleAdSense';
import { getAdminWhatsAppNumber } from '../lib/db';

interface ChannelDetailsProps {
  channel: Channel;
  onClose: () => void;
}

export default function ChannelDetails({ channel, onClose }: ChannelDetailsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const imagesList = channel.images?.filter(Boolean).length
    ? channel.images.filter(Boolean)
    : ['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80'];

  const openLightbox = (idx: number) => { setLightboxIdx(idx); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLight = useCallback(() => setLightboxIdx(i => (i - 1 + imagesList.length) % imagesList.length), [imagesList.length]);
  const nextLight = useCallback(() => setLightboxIdx(i => (i + 1) % imagesList.length), [imagesList.length]);
  const prevThumb = () => setActiveIdx(i => (i - 1 + imagesList.length) % imagesList.length);
  const nextThumb = () => setActiveIdx(i => (i + 1) % imagesList.length);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLight();
      if (e.key === 'ArrowRight') nextLight();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, prevLight, nextLight]);

  // Close modal on Escape key
  useEffect(() => {
    if (lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const formatSubscribers = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString();
  };

  const formatPrice = (val: number) =>
    val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const whatsappUrl = () => {
    const postLink = `${window.location.origin}?id=${channel.id}`;
    const text = `Hello! I am interested in purchasing the YouTube Channel "${channel.title}" (${channel.niche}).\n\nListing: ${postLink}\n\nPlease provide more details. Thank you!`;
    const num = getAdminWhatsAppNumber().replace(/[^0-9]/g, '');
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  const listingDate = channel.createdAt
    ? new Date(channel.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  return (
    <>
      {/* ── CHANNEL DETAILS MODAL ── */}
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="flex min-h-screen items-center justify-center p-3 sm:p-6">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-4 flex flex-col md:flex-row overflow-hidden md:max-h-[88vh]">

            {/* Close */}
            <button onClick={onClose} className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-white text-gray-500 hover:text-gray-900 rounded-full shadow-md transition-all hover:scale-110">
              <X className="w-4 h-4" />
            </button>

            {/* LEFT — Images */}
            <div className="w-full md:w-[52%] bg-gray-950 flex flex-col overflow-y-auto">

              {/* Main image */}
              <div
                className="relative aspect-video w-full overflow-hidden cursor-zoom-in group shrink-0"
                onClick={() => openLightbox(activeIdx)}
              >
                <img
                  src={imagesList[activeIdx]}
                  alt={channel.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />

                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3 h-3" /> Tap to zoom
                </div>

                {/* Fullscreen button */}
                <button
                  onClick={e => { e.stopPropagation(); openLightbox(activeIdx); }}
                  className="absolute top-3 left-3 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Prev/Next on main image */}
                {imagesList.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); prevThumb(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); nextThumb(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Sold overlay */}
                {channel.status === 'sold' && (
                  <div className="absolute inset-0 bg-red-900/65 flex items-center justify-center">
                    <span className="px-5 py-2 border-4 border-white text-white font-black text-xl uppercase tracking-widest rounded-lg -rotate-12 shadow-lg select-none">
                      Sold
                    </span>
                  </div>
                )}

                {/* Dot indicators */}
                {imagesList.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imagesList.map((_, i) => (
                      <button key={i} onClick={e => { e.stopPropagation(); setActiveIdx(i); }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIdx ? 'bg-white w-3' : 'bg-white/50'}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto shrink-0">
                  {imagesList.map((img, i) => (
                    <button key={i} onClick={() => setActiveIdx(i)}
                      className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activeIdx ? 'border-blue-500 opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="m-3 mt-auto bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-3">
                <h4 className="font-bold text-xs text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verification
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    ['Ownership', 'Verified'],
                    ['Copyright', '0 Strikes'],
                    ['Guidelines', 'Passing'],
                    ['AdSense', channel.monetized ? 'Active' : 'None'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center gap-1.5 text-gray-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{label}: <strong className="text-white">{val}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Details */}
            <div className="w-full md:w-[48%] flex flex-col overflow-y-auto">
              <div className="p-6 space-y-5 flex-1">
                {/* Tags + title */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-semibold">{channel.niche}</span>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono font-medium flex items-center gap-1 ${
                      channel.monetized ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${channel.monetized ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {channel.monetized ? 'Monetized' : 'Not Monetized'}
                    </span>
                    {channel.featured && <span className="text-[11px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded font-semibold">★ Featured</span>}
                  </div>
                  <h2 className="font-black text-xl tracking-tight text-gray-900 flex items-center gap-2">
                    {channel.title}
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" aria-label="Verified" />
                  </h2>
                  <p className="text-[11px] text-gray-400 font-mono">Listed: {listingDate}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Users className="w-4 h-4" />, label: 'Subscribers', val: formatSubscribers(channel.subscribers), color: 'text-red-600', bg: 'bg-red-50' },
                    { icon: <TrendingUp className="w-4 h-4" />, label: 'Monthly Views', val: channel.monthlyViews.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: <DollarSign className="w-4 h-4" />, label: 'Monthly Revenue', val: channel.monthlyRevenue > 0 ? formatPrice(channel.monthlyRevenue) : 'N/A', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { icon: <Globe className="w-4 h-4" />, label: 'Channel Age', val: channel.channelAge, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
                      <div className={`${m.bg} ${m.color} p-1.5 rounded-lg shrink-0`}>{m.icon}</div>
                      <div>
                        <span className="block text-[9px] text-gray-400 font-mono uppercase">{m.label}</span>
                        <strong className={`block text-sm font-extrabold ${m.color}`}>{m.val}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specs */}
                <div className="border-t border-b border-gray-100 py-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Audience Country</span>
                    <span className="font-semibold text-gray-900">{channel.audienceCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Content Type</span>
                    <span className="font-semibold text-gray-900">100% Organic</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">YouTube Profile</span>
                    <a href={channel.youtubeUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">View Channel →</a>
                  </div>
                </div>

                <GoogleAdSense format="horizontal" slot="channel-details-popup" />

                {/* Description */}
                <div>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-2">Appraisal Summary</h3>
                  <p className="text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto pr-1">{channel.description}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">Asking Price</span>
                  <span className="block text-lg text-blue-600 font-black font-mono">Confidential</span>
                  <span className="text-[10px] text-gray-400">Inquire on WhatsApp for quote</span>
                </div>
                {channel.status === 'available' ? (
                  <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-700/20 transition-all">
                    <MessageSquare className="w-4 h-4" /> Contact on WhatsApp
                  </a>
                ) : (
                  <div className="w-full sm:w-auto bg-gray-100 text-center text-gray-500 px-6 py-3 rounded-lg font-bold text-sm border border-gray-200 uppercase">
                    Already Sold
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── LIGHTBOX OVERLAY ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={closeLightbox}>

          {/* Close */}
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-mono px-3 py-1 rounded-full">
            {lightboxIdx + 1} / {imagesList.length}
          </div>

          {/* Prev */}
          {imagesList.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prevLight(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={imagesList[lightboxIdx]}
            alt=""
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl select-none"
            onClick={e => e.stopPropagation()}
            referrerPolicy="no-referrer"
          />

          {/* Next */}
          {imagesList.length > 1 && (
            <button onClick={e => { e.stopPropagation(); nextLight(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnail strip */}
          {imagesList.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 rounded-xl" onClick={e => e.stopPropagation()}>
              {imagesList.map((img, i) => (
                <button key={i} onClick={() => setLightboxIdx(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIdx ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

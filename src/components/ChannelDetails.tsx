import { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Tv, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Layers, 
  Globe, 
  CalendarDays, 
  Image as ImageIcon 
} from 'lucide-react';
import { Channel } from '../types';
import GoogleAdSense from './GoogleAdSense';
import { getAdminWhatsAppNumber } from '../lib/db';

interface ChannelDetailsProps {
  channel: Channel;
  onClose: () => void;
}

export default function ChannelDetails({ channel, onClose }: ChannelDetailsProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const imagesList = channel.images && channel.images.length > 0 
    ? channel.images 
    : [
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ];

  const formatSubscribers = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString();
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  const constructionWhatsAppUrl = () => {
    const postLink = `${window.location.origin}${window.location.pathname}?id=${channel.id}`;
    const defaultText = `Hello! I am highly interested in purchasing the verified YouTube Channel listing "${channel.title}" (${channel.niche}).\n\nLink to listing: ${postLink}\n\nCan you please provide some information? Thank you!`;
    const escapedText = encodeURIComponent(defaultText);
    const rawNumber = getAdminWhatsAppNumber().replace(/[^0-9]/g, '');
    return `https://wa.me/${rawNumber}?text=${escapedText}`;
  };

  const listingDate = channel.createdAt 
    ? new Date(channel.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  const updateDate = channel.updatedAt 
    ? new Date(channel.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" id="channel-details-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-6 lg:p-8">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-5xl my-8 flex flex-col md:flex-row h-auto md:max-h-[85vh]">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-900 bg-white/80 rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Graphics Portfolio / Analytics Snapshots */}
          <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Listing Assets
                </span>
                {channel.featured && (
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Premium Highlight
                  </span>
                )}
              </div>

              {/* Main Image viewer */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-950 shadow-inner group">
                <img 
                  src={imagesList[activeImageIdx]} 
                  alt={`${channel.title} preview`} 
                  className="w-full h-full object-cover transition-all"
                  referrerPolicy="no-referrer"
                />
                
                {channel.status === 'sold' && (
                  <div className="absolute inset-0 bg-red-900/60 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-6 py-2 border-4 border-white text-white font-sans font-black text-2xl uppercase tracking-widest rounded-lg transform -rotate-12 select-none shadow-md">
                      Sold & Transacted
                    </span>
                  </div>
                )}
              </div>

              {/* Image selector thumbnails */}
              {imagesList.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-video rounded-md overflow-hidden bg-gray-200 border-2 transition-all ${
                        idx === activeImageIdx ? 'border-blue-600 scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick trust specifications */}
            <div className="mt-8 bg-white p-4 rounded-xl border border-gray-100 space-y-3.5">
              <h4 className="font-sans font-semibold text-xs text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                VERIFICATION AUDIT RATINGS
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Real Ownership Link: <strong className="text-gray-900">Verified</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Copyright Claims: <strong className="text-emerald-700">0 Strike</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Community Guidelines: <strong className="text-emerald-700">Passing</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>AdSense Status: <strong className="text-gray-900">{channel.monetized ? "Unbounded" : "None"}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Listing Parameters & Whatsapp Action */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header section */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-semibold font-sans">
                    {channel.niche}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium flex items-center gap-1 ${
                    channel.monetized ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${channel.monetized ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {channel.monetized ? "Monetized" : "Not Monetized"}
                  </span>
                </div>
                <h2 className="font-sans font-black text-2xl tracking-tight text-gray-900 mt-2 flex items-center gap-2">
                  {channel.title}
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" title="Verifiable analytics" />
                </h2>
                <div className="text-[11px] text-gray-400 font-mono flex gap-4">
                  <span>Listed: {listingDate}</span>
                  <span>Updated: {updateDate}</span>
                </div>
              </div>

              {/* Four Main Metric Grid */}
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center space-x-3">
                  <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono font-semibold uppercase">SUBSCRIBERS</span>
                    <strong className="block text-lg text-gray-900 font-extrabold">{formatSubscribers(channel.subscribers)}</strong>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center space-x-3">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono font-semibold uppercase">MONTHLY VIEWS</span>
                    <strong className="block text-lg text-gray-900 font-extrabold">{channel.monthlyViews.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center space-x-3">
                  <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono font-semibold uppercase">MONTHLY REVENUE</span>
                    <strong className="block text-lg text-emerald-800 font-black">{channel.monthlyRevenue > 0 ? formatPrice(channel.monthlyRevenue) : "N/A"}</strong>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center space-x-3">
                  <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-mono font-semibold uppercase">CHANNELS AGE</span>
                    <strong className="block text-lg text-gray-900 font-extrabold">{channel.channelAge}</strong>
                  </div>
                </div>
              </div>

              {/* Listing specs table */}
              <div className="border-t border-b border-gray-100 py-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Audience Geographic Coordinates:</span>
                  <span className="font-semibold text-gray-900">{channel.audienceCountry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Original Content Status:</span>
                  <span className="font-semibold text-gray-900">100% Organic Content</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Verify Link:</span>
                  <a 
                    href={channel.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    referrerPolicy="no-referrer"
                    className="font-mono font-semibold text-blue-600 hover:underline"
                  >
                    View YouTube Profile
                  </a>
                </div>
              </div>

              {/* Google Ad Slot */}
              <GoogleAdSense format="horizontal" slot="channel-details-popup" className="my-2 p-3 font-sans" />

              {/* Description */}
              <div className="my-5">
                <h3 className="font-sans font-bold text-xs text-gray-900 uppercase tracking-widest font-mono mb-2">
                  BROKER APPRAISAL SUMMARY
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {channel.description}
                </p>
              </div>
            </div>

            {/* Price section & primary WhatsApp CTA */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-center sm:text-left">
                <span className="block text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider font-semibold">ASKING PRICE</span>
                <span className="block text-xl text-blue-600 font-black font-mono">
                  Confidential
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5 leading-none">Inquire on WhatsApp for price quote</span>
              </div>

              {channel.status === 'available' ? (
                <a
                  href={constructionWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-3.5 rounded-xl font-sans font-bold text-sm tracking-tight shadow-lg shadow-emerald-700/10 cursor-pointer text-center"
                  id="details-whatsapp-cta"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-100" />
                  Contact on WhatsApp
                </a>
              ) : (
                <div className="w-full sm:w-auto bg-gray-100 text-center text-gray-500 px-6 py-3 rounded-lg font-sans font-bold text-sm tracking-tight border border-gray-200 uppercase">
                  Already Sold
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ExternalLink } from 'lucide-react';

interface GoogleAdSenseProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export default function GoogleAdSense({ slot = 'general-slot', format = 'horizontal', className = '' }: GoogleAdSenseProps) {
  const [adClosed, setAdClosed] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);
  const metaEnv = (import.meta as any).env || {};
  const clientId = metaEnv.VITE_GOOGLE_ADSENSE_CLIENT_ID;
  const slotMap: Record<string, string | undefined> = {
    'home-middle-sponsor': metaEnv.VITE_GOOGLE_ADSENSE_SLOT_HOME,
    'channel-details-popup': metaEnv.VITE_GOOGLE_ADSENSE_SLOT_DETAILS,
  };
  const resolvedSlot = slotMap[slot] || slot;

  const isAdSenseConfigured =
    clientId &&
    clientId !== 'ca-pub-XXXXXXXXXXXXXXXX' &&
    /^ca-pub-\d+$/.test(clientId) &&
    /^\d+$/.test(resolvedSlot);

  // Dynamically load Google AdSense script and initialize the ad slot safely
  useEffect(() => {
    if (isAdSenseConfigured && !adClosed && adRef.current) {
      try {
        const existingScript = document.querySelector('script[src*="adsbygoogle"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
          script.async = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        const win = window as any;
        win.adsbygoogle = win.adsbygoogle || [];

        // Check if this specific ins element is already processed to avoid duplicate push TagError
        const isProcessed = adRef.current.getAttribute('data-adsbygoogle-status') === 'done';

        if (!isProcessed) {
          const timer = setTimeout(() => {
            try {
              if (adRef.current && adRef.current.getAttribute('data-adsbygoogle-status') !== 'done') {
                win.adsbygoogle.push({});
              }
            } catch (err: any) {
              console.warn('Google AdSense inline push warning:', err.message);
            }
          }, 150);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn('Google AdSense setup warning: ', err);
      }
    }
  }, [clientId, isAdSenseConfigured, adClosed]);

  if (adClosed) return null;

  if (isAdSenseConfigured) {
    return (
      <div className={`my-6 mx-auto text-center border border-slate-100 rounded-xl overflow-hidden bg-slate-50 p-2 relative ${className}`}>
        <div className="flex justify-between items-center px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          <span>Sponsored Ad</span>
          <button onClick={() => setAdClosed(true)} className="hover:text-slate-700">
            <X className="w-3 h-3" />
          </button>
        </div>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={resolvedSlot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Elegant fallback promotion banner resembling curated developer sponsorship
  const isVertical = format === 'vertical';

  return (
    <div 
      className={`my-6 border border-dashed border-slate-300 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 p-5 relative select-none hover:border-blue-400 transition-colors ${
        isVertical ? 'flex flex-col text-center space-y-4 max-w-[280px]' : 'flex flex-col md:flex-row items-center justify-between gap-6'
      } ${className}`}
      id={`sponsored-ad-${slot}`}
    >
      {/* Sparkle badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <span className="text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
          Featured
        </span>
        <button 
          onClick={() => setAdClosed(true)} 
          className="p-1 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          title="Dismiss Sponsor Promo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className={isVertical ? 'space-y-2' : 'flex items-center gap-4 text-left'}>
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20 mx-auto md:mx-0">
          <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
        </div>
        <div>
          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest font-mono block">
            Partner Sponsor Ad
          </span>
          <h4 className="text-sm font-black text-slate-900 mt-1">
            Need Expert YouTube Growth?
          </h4>
          <p className="text-[11px] text-slate-500 max-w-md mt-0.5 leading-relaxed">
            Get personalized audience strategy blueprint, organic traffic audit, and certified fast-track transfers fully secured.
          </p>
        </div>
      </div>

      <div className={`shrink-0 ${isVertical ? 'w-full' : 'self-center md:self-end'}`}>
        <a 
          href="https://wa.me/919144534891?text=Hello!%20I%20would%20like%20to%20consult%20about%20Buy%20Sell%20Market%20sponsorships."
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-mono font-bold uppercase px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-sm shadow-slate-900/10 cursor-pointer"
        >
          Grow Channel <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

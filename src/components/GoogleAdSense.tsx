import { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
  slot?: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export default function GoogleAdSense({ slot = 'general-slot', format = 'auto', className = '' }: GoogleAdSenseProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const env = (import.meta as any).env || {};
  const clientId = (env.VITE_GOOGLE_ADSENSE_CLIENT_ID || '').trim();
  const slotId = (env.VITE_GOOGLE_ADSENSE_SLOT_HOME || '').trim();

  const isConfigured =
    clientId.startsWith('ca-pub-') &&
    /^ca-pub-\d{16}$/.test(clientId) &&
    /^\d+$/.test(slotId);

  useEffect(() => {
    if (!isConfigured || !adRef.current) return;

    // Inject script once
    if (!document.querySelector('script[data-adsense]')) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-adsense', 'true');
      document.head.appendChild(script);
    }

    const win = window as any;
    win.adsbygoogle = win.adsbygoogle || [];
    if (adRef.current.getAttribute('data-adsbygoogle-status') !== 'done') {
      try { win.adsbygoogle.push({}); } catch {}
    }
  }, [isConfigured, clientId]);

  // Render nothing until AdSense is properly configured
  if (!isConfigured) return null;

  return (
    <div className={`my-4 text-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

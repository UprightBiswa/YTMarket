import { Facebook, Instagram, MessageSquare } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: 'home' | 'browse' | 'sold' | 'admin') => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  return (
    <footer className="bg-gray-950 text-gray-400 font-sans border-t border-gray-900" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 text-white">
              <div className="relative w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="font-sans font-black text-xs text-emerald-500">BS</span>
              </div>
              <span className="font-sans font-extrabold text-base tracking-tight uppercase">Buy Sell <span className="text-emerald-500">Market</span></span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Buy Sell Market lists YouTube channels reviewed by the admin team. Browse channels, check details, and contact the admin directly on WhatsApp.
            </p>
          </div>

          {/* Core Hub */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase font-mono">Marketplace</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button 
                  onClick={() => setActiveTab('browse')} 
                  className="hover:text-white transition-colors text-left font-sans"
                >
                  Browse Available Listings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('sold')} 
                  className="hover:text-white transition-colors text-left font-sans"
                >
                  Sold Channel Portfolio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('home')} 
                  className="hover:text-white transition-colors text-left font-sans"
                >
                  Broker FAQ & Trust
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase font-mono">Social</h4>
            <div className="flex flex-col gap-2 text-xs font-medium">
              <a href="https://www.instagram.com/buy.sellmarket" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-2">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a href="https://www.facebook.com/share/18dPe2V26i/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-2">
                <Facebook className="w-4 h-4" /> Facebook
              </a>
              <a href="https://whatsapp.com/channel/0029VbD4kYR65yDJzTbS3B2e" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> WhatsApp Channel
              </a>
            </div>
          </div>

          {/* Legal / Contact */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase font-mono">Support</h4>
            <p className="text-xs font-sans leading-relaxed text-gray-400">
              Need assistance? Speak direct with an administrator regarding a premium listing or listing submission.
            </p>
            <div className="flex gap-2">
              <a 
                href="https://wa.me/919144534891?text=Hello%20Buy%20Sell%20Market%20Support" 
                target="_blank" 
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium transition-colors"
                id="footer-wa-support"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Contact Administrator
              </a>
            </div>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-900 text-center flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p className="font-sans">
            &copy; {new Date().getFullYear()} Buy Sell Market. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 font-sans flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            <button 
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-red-400 text-red-500 font-bold transition-colors cursor-pointer text-xs"
            >
              Broker Portal Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

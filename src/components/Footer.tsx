import { Facebook, Instagram, MessageSquare, Mail } from 'lucide-react';
import { getSocialLinks, getAdminWhatsAppNumber, getSupportEmail } from '../lib/db';
import { useState, useEffect } from 'react';

type Tab = 'home' | 'browse' | 'sold' | 'admin';

interface FooterProps {
  setActiveTab: (tab: Tab) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  const [social, setSocial] = useState(getSocialLinks());
  const [waNumber, setWaNumber] = useState(getAdminWhatsAppNumber());
  const [supportEmail, setSupportEmail] = useState(getSupportEmail());

  useEffect(() => {
    const sync = () => {
      setSocial(getSocialLinks());
      setWaNumber(getAdminWhatsAppNumber());
      setSupportEmail(getSupportEmail());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return (
    <footer className="bg-gray-950 text-gray-400 font-sans border-t border-gray-900" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <img src="/logo.jpeg" alt="Buy Sell Market" className="h-8 w-auto object-contain rounded-lg" />
              <span className="font-sans font-extrabold text-base tracking-tight uppercase text-white">
                Buy Sell <span className="text-emerald-500">Market</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Verified YouTube channel brokerage. Browse listings and connect with our admin directly on WhatsApp for safe, confidential transactions.
            </p>
          </div>

          {/* Marketplace links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase font-mono">Marketplace</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => setActiveTab('browse')} className="hover:text-white transition-colors text-left">Browse Listings</button></li>
              <li><button onClick={() => setActiveTab('sold')} className="hover:text-white transition-colors text-left">Sold Proofs</button></li>
              <li><button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors text-left">FAQ & Trust</button></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase font-mono">Follow Us</h4>
            <div className="flex flex-col gap-2 text-xs font-medium">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
              )}
              {social.whatsappChannel && (
                <a href={social.whatsappChannel} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> WhatsApp Channel
                </a>
              )}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase font-mono">Support</h4>
            <p className="text-xs font-sans leading-relaxed text-gray-400">
              Questions about a listing? Contact us directly.
            </p>
            <div className="flex flex-col gap-2">
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {supportEmail}
                </a>
              )}
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=Hello%20Buy%20Sell%20Market%20Support`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  WhatsApp Support
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p className="font-sans">&copy; {new Date().getFullYear()} Buy Sell Market. All rights reserved.</p>
          <div className="flex items-center gap-6 font-sans flex-wrap justify-center">
            <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Terms of Service</button>
            {supportEmail && (
              <a href={`mailto:${supportEmail}`} className="hover:text-white transition-colors">{supportEmail}</a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

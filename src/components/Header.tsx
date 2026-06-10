import { useState } from 'react';
import { User } from '../types';
import { 
  Tv, 
  LogOut, 
  Menu, 
  X,
  RefreshCw
} from 'lucide-react';
import { logoutUser, checkIsAdminUser } from '../lib/db';

interface HeaderProps {
  user: User | null;
  activeTab: 'home' | 'browse' | 'sold' | 'admin';
  setActiveTab: (tab: 'home' | 'browse' | 'sold' | 'admin') => void;
  onNavigateWithFilters: (monetized: 'all' | 'monetized' | 'non-monetized', isShortsOnly: boolean) => void;
}

export default function Header({ user, activeTab, setActiveTab, onNavigateWithFilters }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = checkIsAdminUser(user);

  const handleSignOut = async () => {
    try {
      await logoutUser();
      if (activeTab === 'admin') {
        setActiveTab('home');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative w-9 h-9 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100/80">
              <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin-slow absolute" />
              <span className="font-sans font-black text-xs text-blue-600 relative z-10 font-bold">BS</span>
            </div>
            <div>
              <span className="font-sans font-black text-lg tracking-tight text-gray-900 uppercase flex items-center">
                Buy Sell <span className="text-emerald-600 ml-1">Market</span>
              </span>
              <p className="text-[9px] text-gray-400 font-mono -mt-1 font-bold tracking-wider">VERIFIED CHANNELS</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-tight transition-colors ${
                activeTab === 'home' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-tight transition-colors ${
                activeTab === 'browse'
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
              }`}
            >
              Browse Channels
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`px-3 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-tight transition-colors ${
                activeTab === 'sold' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Sold Proofs
            </button>
          </nav>

          {/* Auth & Indicators */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 bg-gray-50 p-1.5 pr-3 rounded-full border border-gray-100">
                <img 
                  src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                  alt={user.displayName || "User"} 
                  className="w-8 h-8 rounded-full border border-white"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left text-xs">
                  <p className="font-semibold text-gray-800 line-clamp-1">{user.displayName || "Broker Admin"}</p>
                  <p className="text-[10px] text-gray-400 font-mono font-medium">{isAdmin ? "System Admin" : "Subscriber"}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  title="Log Out"
                  className="p-1 hover:text-red-500 text-gray-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-1 shadow-inner">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'home' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('browse'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'browse' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Browse Channels
          </button>
          <button
            onClick={() => { setActiveTab('sold'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'sold' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sold Proofs
          </button>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {user ? (
              <div className="flex items-center space-x-3 w-full justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                    alt={user.displayName || "User"} 
                    className="w-10 h-10 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">{user.displayName || "Admin User"}</span>
                    <span className="block text-xs text-gray-500 font-mono font-medium">{user.email}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 p-2.5 rounded-lg text-gray-500"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="text-[10px] text-gray-400 font-mono italic text-center w-full py-2">
                Secured Broker Channel
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import React, { useState } from 'react';
import { ArrowLeft, Check, Edit, LogOut, MessageSquare, Plus, Save, Trash2, Tv } from 'lucide-react';
import { Channel, Testimonial, HomepageStats } from '../types';
import {
  addChannelListing,
  updateChannelListing,
  deleteChannelListing,
  addTestimonialListing,
  deleteTestimonialListing,
  checkIsAdminUser,
  loginWithEmailAndPassword,
  logoutUser,
  getAdminWhatsAppNumber,
  setAdminWhatsAppNumber,
} from '../lib/db';
import { NICHES } from '../lib/mockData';

interface AdminPanelProps {
  channels: Channel[];
  testimonials: Testimonial[];
  stats: HomepageStats;
  user: any;
  onBackToUserApp: () => void;
}

type AdminTab = 'channels' | 'testimonials';

const inputClass = 'w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50/70 text-gray-900 outline-none focus:border-red-500 focus:bg-white';

export default function AdminPanel({ channels, testimonials, user, onBackToUserApp }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('channels');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [globalWhatsAppNumber, setGlobalWhatsAppNumber] = useState(getAdminWhatsAppNumber());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState(NICHES[0]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [subscribers, setSubscribers] = useState(50000);
  const [monthlyViews, setMonthlyViews] = useState(100000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [audienceCountry, setAudienceCountry] = useState('India');
  const [channelAge, setChannelAge] = useState('1 Year');
  const [channelType, setChannelType] = useState<'monetized' | 'non-monetized' | 'shorts'>('monetized');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'available' | 'sold'>('available');
  const [imageUrl, setImageUrl] = useState('');

  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialRole, setTestimonialRole] = useState('Verified Customer');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialReview, setTestimonialReview] = useState('');

  const showNotice = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const resetChannelForm = () => {
    setEditingId(null);
    setTitle('');
    setNiche(NICHES[0]);
    setYoutubeUrl('');
    setDescription('');
    setSubscribers(50000);
    setMonthlyViews(100000);
    setMonthlyRevenue(0);
    setAudienceCountry('India');
    setChannelAge('1 Year');
    setChannelType('monetized');
    setFeatured(false);
    setStatus('available');
    setImageUrl('');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await loginWithEmailAndPassword(loginEmail.trim(), loginPassword);
      showNotice('Admin login successful.');
    } catch (error: any) {
      setAuthError(error?.message || 'Login failed. Check Supabase Auth credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    onBackToUserApp();
  };

  const editChannel = (channel: Channel) => {
    setEditingId(channel.id);
    setTitle(channel.title);
    setNiche(channel.niche);
    setYoutubeUrl(channel.youtubeUrl);
    setDescription(channel.description);
    setSubscribers(channel.subscribers);
    setMonthlyViews(channel.monthlyViews);
    setMonthlyRevenue(channel.monthlyRevenue);
    setAudienceCountry(channel.audienceCountry);
    setChannelAge(channel.channelAge);
    setChannelType(channel.shorts ? 'shorts' : channel.monetized ? 'monetized' : 'non-monetized');
    setFeatured(channel.featured);
    setStatus(channel.status);
    setImageUrl(channel.images?.[0] || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveChannel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !youtubeUrl.trim() || !description.trim()) {
      showNotice('Please add title, YouTube URL, and description.');
      return;
    }

    const payload = {
      title: title.trim(),
      niche,
      youtubeUrl: youtubeUrl.trim(),
      description: description.trim(),
      subscribers: Number(subscribers || 0),
      monthlyViews: Number(monthlyViews || 0),
      monthlyRevenue: Number(monthlyRevenue || 0),
      audienceCountry: audienceCountry.trim() || 'India',
      channelAge: channelAge.trim() || '1 Year',
      monetized: channelType === 'monetized',
      shorts: channelType === 'shorts',
      price: 0,
      whatsappNumber: getAdminWhatsAppNumber(),
      featured,
      status,
      images: imageUrl.trim()
        ? [imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80'],
      soldPrice: status === 'sold' ? 0 : undefined,
      soldDate: status === 'sold' ? new Date().toISOString().split('T')[0] : undefined,
    };

    try {
      if (editingId) {
        await updateChannelListing(editingId, payload);
        showNotice('Channel updated.');
      } else {
        await addChannelListing(payload);
        showNotice('Channel created.');
      }
      resetChannelForm();
    } catch (error: any) {
      showNotice(`Database write rejected: ${error?.message || 'check Supabase RLS/Auth setup'}`);
    }
  };

  const removeChannel = async (id: string) => {
    if (!window.confirm('Delete this channel listing?')) return;
    try {
      await deleteChannelListing(id);
      showNotice('Channel deleted.');
    } catch (error: any) {
      showNotice(`Delete failed: ${error?.message || 'check Supabase permissions'}`);
    }
  };

  const saveTestimonial = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!testimonialName.trim() || !testimonialReview.trim()) {
      showNotice('Please add customer name and review.');
      return;
    }

    try {
      await addTestimonialListing({
        name: testimonialName.trim(),
        role: testimonialRole.trim() || 'Verified Customer',
        rating: testimonialRating,
        review: testimonialReview.trim(),
      });
      setTestimonialName('');
      setTestimonialReview('');
      showNotice('Testimonial added.');
    } catch (error: any) {
      showNotice(`Review write failed: ${error?.message || 'check Supabase permissions'}`);
    }
  };

  const removeTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonialListing(id);
      showNotice('Testimonial deleted.');
    } catch (error: any) {
      showNotice(`Delete failed: ${error?.message || 'check Supabase permissions'}`);
    }
  };

  if (!checkIsAdminUser(user)) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 space-y-7 animate-fade-in text-gray-800" id="admin-auth-gate">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 border border-red-100">
            <Tv className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="font-sans font-black text-xl text-gray-900 tracking-tight">Admin Login</h2>
          <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto">
            Sign in with the admin account created in Supabase Auth.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider font-mono">Email</label>
            <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="djdas000000@gmail.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider font-mono">Password</label>
            <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password from Supabase Auth" className={inputClass} />
          </div>
          {authError && <div className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-sans font-semibold">{authError}</div>}
          <button type="submit" disabled={authLoading} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all font-mono shadow-md cursor-pointer disabled:opacity-50">
            {authLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <button onClick={onBackToUserApp} className="mx-auto text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-dashboard-container">
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-4 rounded-xl shadow-lg border text-xs font-semibold bg-white text-gray-900 border-gray-200">
          <Check className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700 pb-5">
        <div>
          <span className="text-[10px] font-bold bg-red-500/15 text-red-200 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Admin</span>
          <h2 className="font-sans font-black text-3xl tracking-tight text-white mt-2">Buy Sell Market Dashboard</h2>
          <p className="text-xs text-slate-300 font-sans mt-0.5">Post channels, edit listings, mark sold records, and manage testimonials.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onBackToUserApp} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Marketplace
          </button>
          <button onClick={handleLogout} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-gray-900">Global WhatsApp Contact</h3>
          <p className="text-xs text-gray-500 mt-1">All listing inquiry buttons send users to this number.</p>
        </div>
        <div className="flex gap-2">
          <input value={globalWhatsAppNumber} onChange={(e) => setGlobalWhatsAppNumber(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold w-full sm:w-48 outline-none focus:border-red-500" />
          <button onClick={() => { setAdminWhatsAppNumber(globalWhatsAppNumber); showNotice('WhatsApp number saved.'); }} className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white rounded-xl text-xs font-bold">
            Save
          </button>
        </div>
      </div>

      <div className="bg-slate-800 p-1 rounded-lg inline-flex text-xs font-semibold font-sans">
        <button onClick={() => setActiveTab('channels')} className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'channels' ? 'bg-white text-gray-900' : 'text-slate-200 hover:text-white'}`}>Listings</button>
        <button onClick={() => setActiveTab('testimonials')} className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'testimonials' ? 'bg-white text-gray-900' : 'text-slate-200 hover:text-white'}`}>Testimonials</button>
      </div>

      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-md h-fit space-y-5">
            <h3 className="font-sans font-extrabold text-base text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Plus className="w-5 h-5 text-blue-600" /> {editingId ? 'Edit Channel' : 'Create Channel'}
            </h3>
            <form onSubmit={saveChannel} className="space-y-4 text-xs font-semibold">
              <label className="block space-y-1">Channel Title<input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Gaming Pro Live" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">Niche<select value={niche} onChange={(e) => setNiche(e.target.value)} className={inputClass}>{NICHES.map(n => <option key={n} value={n}>{n}</option>)}</select></label>
                <label className="block space-y-1">Country<input value={audienceCountry} onChange={(e) => setAudienceCountry(e.target.value)} className={inputClass} /></label>
              </div>
              <label className="block space-y-1">YouTube URL<input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className={inputClass} placeholder="https://youtube.com/..." /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">Subscribers<input type="number" value={subscribers} onChange={(e) => setSubscribers(Number(e.target.value))} className={inputClass} /></label>
                <label className="block space-y-1">Monthly Views<input type="number" value={monthlyViews} onChange={(e) => setMonthlyViews(Number(e.target.value))} className={inputClass} /></label>
                <label className="block space-y-1">Monthly Revenue<input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(Number(e.target.value))} className={inputClass} /></label>
                <label className="block space-y-1">Channel Age<input value={channelAge} onChange={(e) => setChannelAge(e.target.value)} className={inputClass} /></label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['monetized', 'non-monetized', 'shorts'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setChannelType(type)} className={`py-2 px-2 border rounded-lg text-[10px] font-bold uppercase ${channelType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {type}
                  </button>
                ))}
              </div>
              <label className="block space-y-1">Image URL<input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} placeholder="https://images..." /></label>
              <label className="block space-y-1">Description<textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} /></label>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-gray-800"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border border-gray-200 rounded-lg p-2 text-xs">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="flex gap-2">
                {editingId && <button type="button" onClick={resetChannelForm} className="flex-1 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold">Cancel</button>}
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center justify-center gap-1 text-xs font-bold">
                  <Save className="w-4 h-4" /> Save Listing
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-md">
            <h3 className="font-sans font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3">Active Platform Listings ({channels.length})</h3>
            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[720px] mt-2">
              {channels.map((channel) => (
                <div key={channel.id} className="flex justify-between items-center py-3.5 gap-4 hover:bg-gray-50/60 px-2.5 rounded-xl">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <img src={channel.images?.[0] || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=80&q=80'} alt="" className="w-12 h-12 object-cover rounded-lg bg-gray-100 border shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">{channel.niche}</span>
                      <h4 className="font-sans font-bold text-sm text-gray-900 mt-1 truncate">{channel.title}</h4>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{channel.subscribers.toLocaleString()} subscribers | {channel.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button onClick={() => editChannel(channel)} className="p-2 border border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-lg bg-white" title="Edit listing"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => removeChannel(channel.id)} className="p-2 border border-gray-200 hover:border-red-300 hover:text-red-600 rounded-lg bg-white" title="Delete listing"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'testimonials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-md h-fit space-y-4">
            <h3 className="font-sans font-bold text-base text-gray-900 border-b border-gray-100 pb-3">Add Review</h3>
            <form onSubmit={saveTestimonial} className="space-y-4 text-xs font-semibold">
              <label className="block space-y-1">Customer Name<input value={testimonialName} onChange={(e) => setTestimonialName(e.target.value)} className={inputClass} /></label>
              <label className="block space-y-1">Role<input value={testimonialRole} onChange={(e) => setTestimonialRole(e.target.value)} className={inputClass} /></label>
              <label className="block space-y-1">Rating<select value={testimonialRating} onChange={(e) => setTestimonialRating(Number(e.target.value))} className={inputClass}><option value={5}>5 Stars</option><option value={4}>4 Stars</option><option value={3}>3 Stars</option></select></label>
              <label className="block space-y-1">Review<textarea rows={4} value={testimonialReview} onChange={(e) => setTestimonialReview(e.target.value)} className={inputClass} /></label>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl flex items-center justify-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Add Testimonial
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-md">
            <h3 className="font-sans font-bold text-base text-gray-900 border-b border-gray-100 pb-3">Testimonials ({testimonials.length})</h3>
            <div className="divide-y divide-gray-100 mt-4 space-y-2 max-h-[520px] overflow-y-auto">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex justify-between items-center py-3.5 gap-4 hover:bg-gray-50/60 px-2 rounded-xl">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{testimonial.role}</span>
                    <h4 className="font-sans font-bold text-sm text-gray-900 mt-1">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500 font-sans mt-1 line-clamp-2">{testimonial.review}</p>
                  </div>
                  <button onClick={() => removeTestimonial(testimonial.id)} className="p-2 border border-gray-200 hover:border-red-300 hover:text-red-600 rounded-lg bg-white shrink-0" title="Remove testimonial">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

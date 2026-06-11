import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, Edit, Eye,
  LogOut, MessageSquare, Plus, Save, Settings, Trash2, Tv, Upload, User, X as XIcon
} from 'lucide-react';
import { Channel, Testimonial, HomepageStats } from '../types';
import {
  addChannelListing, updateChannelListing, deleteChannelListing,
  addTestimonialListing, deleteTestimonialListing,
  checkIsAdminUser, loginWithEmailAndPassword, logoutUser,
  getAdminWhatsAppNumber, setAdminWhatsAppNumber,
  getSocialLinks, saveSocialLinks, getSupportEmail,
  uploadChannelImage, deleteChannelImage,
} from '../lib/db';
import { NICHES } from '../lib/mockData';

interface AdminPanelProps {
  channels: Channel[];
  testimonials: Testimonial[];
  stats: HomepageStats;
  user: any;
  onSelectChannel: (channel: Channel) => void;
  onBackToUserApp: () => void;
}

type AdminTab = 'channels' | 'testimonials' | 'settings';
const inputClass = 'w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50/70 text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-colors';

export default function AdminPanel({ channels, testimonials, user, onSelectChannel, onBackToUserApp }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('channels');
  const [channelPage, setChannelPage] = useState(1);
  const [testimonialPage, setTestimonialPage] = useState(1);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Settings
  const [whatsapp, setWhatsapp] = useState(getAdminWhatsAppNumber());
  const [supportEmail, setSupportEmailState] = useState(getSupportEmail());
  const [social, setSocial] = useState(getSocialLinks());
  const [savingSettings, setSavingSettings] = useState(false);

  // Channel form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState(NICHES[0]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [subscribers, setSubscribers] = useState(0);
  const [monthlyViews, setMonthlyViews] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [audienceCountry, setAudienceCountry] = useState('India');
  const [channelAge, setChannelAge] = useState('1 Year');
  const [channelType, setChannelType] = useState<'monetized' | 'non-monetized' | 'shorts'>('monetized');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'available' | 'sold'>('available');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Testimonial form
  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialRole, setTestimonialRole] = useState('Verified Customer');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialReview, setTestimonialReview] = useState('');
  const [testimonialLoading, setTestimonialLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const pageSize = 6;

  const sortedChannels = useMemo(
    () => [...channels].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()),
    [channels]
  );
  const channelTotalPages = Math.max(1, Math.ceil(sortedChannels.length / pageSize));
  const paginatedChannels = sortedChannels.slice((channelPage - 1) * pageSize, channelPage * pageSize);

  const sortedTestimonials = useMemo(
    () => [...testimonials].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    [testimonials]
  );
  const testimonialTotalPages = Math.max(1, Math.ceil(sortedTestimonials.length / pageSize));
  const paginatedTestimonials = sortedTestimonials.slice((testimonialPage - 1) * pageSize, testimonialPage * pageSize);

  useEffect(() => { setChannelPage(p => Math.min(p, channelTotalPages)); }, [channelTotalPages]);
  useEffect(() => { setTestimonialPage(p => Math.min(p, testimonialTotalPages)); }, [testimonialTotalPages]);

  const showNotice = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const resetChannelForm = () => {
    setEditingId(null); setTitle(''); setNiche(NICHES[0]); setYoutubeUrl('');
    setDescription(''); setSubscribers(0); setMonthlyViews(0); setMonthlyRevenue(0);
    setAudienceCountry('India'); setChannelAge('1 Year'); setChannelType('monetized');
    setFeatured(false); setStatus('available'); setImages([]); setImageUrlInput('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await loginWithEmailAndPassword(loginEmail.trim(), loginPassword);
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => { await logoutUser(); onBackToUserApp(); };

  const editChannel = (ch: Channel) => {
    setEditingId(ch.id); setTitle(ch.title); setNiche(ch.niche);
    setYoutubeUrl(ch.youtubeUrl); setDescription(ch.description);
    setSubscribers(ch.subscribers); setMonthlyViews(ch.monthlyViews);
    setMonthlyRevenue(ch.monthlyRevenue); setAudienceCountry(ch.audienceCountry);
    setChannelAge(ch.channelAge);
    setChannelType(ch.shorts ? 'shorts' : ch.monetized ? 'monetized' : 'non-monetized');
    setFeatured(ch.featured); setStatus(ch.status);
    setImages(ch.images || []); setImageUrlInput('');
    setActiveTab('channels');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 5) { showNotice('Maximum 5 images allowed.', 'error'); return; }
    setUploadingImage(true);
    try {
      const urls = await Promise.all(files.map(f => uploadChannelImage(f)));
      setImages(prev => [...prev, ...urls].slice(0, 5));
    } catch (err: any) {
      showNotice(err?.message || 'Image upload failed.', 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (images.length >= 5) { showNotice('Maximum 5 images allowed.', 'error'); return; }
    setImages(prev => [...prev, url].slice(0, 5));
    setImageUrlInput('');
  };

  const removeImage = async (url: string) => {
    setImages(prev => prev.filter(u => u !== url));
    try { await deleteChannelImage(url); } catch {}
  };

  const saveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim() || !description.trim()) {
      showNotice('Title, YouTube URL and description are required.', 'error'); return;
    }
    setSaveLoading(true);
    try {
      const payload = {
        title: title.trim(), niche, youtubeUrl: youtubeUrl.trim(),
        description: description.trim(),
        subscribers: Number(subscribers) || 0,
        monthlyViews: Number(monthlyViews) || 0,
        monthlyRevenue: Number(monthlyRevenue) || 0,
        audienceCountry: audienceCountry.trim() || 'India',
        channelAge: channelAge.trim() || '1 Year',
        monetized: channelType === 'monetized',
        shorts: channelType === 'shorts',
        price: 0,
        whatsappNumber: getAdminWhatsAppNumber(),
        featured, status,
        images,
        soldPrice: status === 'sold' ? 0 : undefined,
        soldDate: status === 'sold' ? new Date().toISOString().split('T')[0] : undefined,
      };
      if (editingId) { await updateChannelListing(editingId, payload); showNotice('Channel updated.'); }
      else { await addChannelListing(payload); showNotice('Channel created.'); }
      resetChannelForm();
      setChannelPage(1);
    } catch (err: any) {
      showNotice(err?.message || 'Save failed. Check permissions.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const removeChannel = async (id: string) => {
    if (!window.confirm('Delete this channel listing permanently?')) return;
    setDeletingId(id);
    try { await deleteChannelListing(id); setChannelPage(1); showNotice('Channel deleted.'); }
    catch (err: any) { showNotice(err?.message || 'Delete failed.', 'error'); }
    finally { setDeletingId(null); }
  };

  const saveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialName.trim() || !testimonialReview.trim()) {
      showNotice('Name and review are required.', 'error'); return;
    }
    setTestimonialLoading(true);
    try {
      await addTestimonialListing({
        name: testimonialName.trim(),
        role: testimonialRole.trim() || 'Verified Customer',
        rating: testimonialRating,
        review: testimonialReview.trim(),
      });
      setTestimonialName(''); setTestimonialReview(''); setTestimonialPage(1);
      showNotice('Testimonial added.');
    } catch (err: any) {
      showNotice(err?.message || 'Failed to add testimonial.', 'error');
    } finally {
      setTestimonialLoading(false);
    }
  };

  const removeTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    setDeletingId(id);
    try { await deleteTestimonialListing(id); setTestimonialPage(1); showNotice('Testimonial deleted.'); }
    catch (err: any) { showNotice(err?.message || 'Delete failed.', 'error'); }
    finally { setDeletingId(null); }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      setAdminWhatsAppNumber(whatsapp.trim());
      saveSocialLinks(social, supportEmail.trim());
      showNotice('Settings saved.');
    } catch (err: any) {
      showNotice('Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── LOGIN GATE ──
  if (!checkIsAdminUser(user)) {
    return (
      <div className="max-w-sm mx-auto my-16 bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 space-y-6" id="admin-auth-gate">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-sans font-black text-xl text-gray-900">Admin Portal</h2>
          <p className="text-xs text-gray-500 font-sans">Restricted access. Authorised personnel only.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Email</label>
            <input type="email" required autoComplete="username" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@example.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Password</label>
            <input type="password" required autoComplete="current-password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
          </div>
          {authError && <div className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-semibold">{authError}</div>}
          <button type="submit" disabled={authLoading} className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-xs font-bold uppercase tracking-wider font-mono disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
            {authLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {authLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button onClick={onBackToUserApp} className="w-full text-center text-xs text-gray-400 hover:text-gray-700 font-semibold flex items-center justify-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to marketplace
        </button>
      </div>
    );
  }

  // ── DASHBOARD ──
  return (
    <div className="space-y-6" id="admin-dashboard">
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-fade-up ${
          notification.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-900 border-gray-200'
        }`}>
          <Check className={`w-4 h-4 shrink-0 ${notification.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`} />
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              : <User className="w-6 h-6 text-slate-300" />}
          </div>
          <div>
            <span className="text-[10px] font-bold bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Admin</span>
            <h2 className="font-sans font-black text-xl tracking-tight text-white mt-0.5">{user?.displayName || user?.email?.split('@')[0] || 'Admin'}</h2>
            <p className="text-[11px] text-slate-400 font-mono">{user?.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onBackToUserApp} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Marketplace
          </button>
          <button onClick={handleLogout} className="px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: channels.length, color: 'text-blue-400' },
          { label: 'Available', value: channels.filter(c => c.status === 'available').length, color: 'text-emerald-400' },
          { label: 'Sold', value: channels.filter(c => c.status === 'sold').length, color: 'text-red-400' },
          { label: 'Reviews', value: testimonials.length, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
            <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 p-1 rounded-xl inline-flex text-xs font-semibold gap-1">
        {([
          { id: 'channels' as const, label: 'Listings', icon: <Tv className="w-3.5 h-3.5" /> },
          { id: 'testimonials' as const, label: 'Reviews', icon: <MessageSquare className="w-3.5 h-3.5" /> },
          { id: 'settings' as const, label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-slate-300 hover:text-white'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── CHANNELS ── */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
            <h3 className="font-sans font-extrabold text-sm text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Plus className="w-4 h-4 text-blue-600" />{editingId ? 'Edit Channel' : 'New Channel'}
            </h3>
            <form onSubmit={saveChannel} className="space-y-3 text-xs font-semibold text-gray-700">
              <label className="block space-y-1">Channel Title *
                <input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Tech Reviews India" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">Niche
                  <select value={niche} onChange={e => setNiche(e.target.value)} className={inputClass}>
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label className="block space-y-1">Country
                  <input value={audienceCountry} onChange={e => setAudienceCountry(e.target.value)} className={inputClass} />
                </label>
              </div>
              <label className="block space-y-1">YouTube URL *
                <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className={inputClass} placeholder="https://youtube.com/@channel" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">Subscribers<input type="number" min={0} value={subscribers} onChange={e => setSubscribers(Number(e.target.value))} className={inputClass} /></label>
                <label className="block space-y-1">Monthly Views<input type="number" min={0} value={monthlyViews} onChange={e => setMonthlyViews(Number(e.target.value))} className={inputClass} /></label>
                <label className="block space-y-1">Revenue (₹/mo)<input type="number" min={0} value={monthlyRevenue} onChange={e => setMonthlyRevenue(Number(e.target.value))} className={inputClass} /></label>
                <label className="block space-y-1">Channel Age<input value={channelAge} onChange={e => setChannelAge(e.target.value)} className={inputClass} placeholder="2 Years" /></label>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['monetized', 'non-monetized', 'shorts'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setChannelType(t)}
                    className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${channelType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Images section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase font-mono">Images ({images.length}/5)</span>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((url, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border group">
                        <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button type="button" onClick={() => removeImage(url)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 5 && (
                  <label className={`flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-[11px] font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingImage
                      ? <><span className="w-3.5 h-3.5 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin" /> Uploading...</>
                      : <><Upload className="w-3.5 h-3.5" /> Upload from device</>}
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
                {images.length < 5 && (
                  <div className="flex gap-1.5">
                    <input value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())} className={inputClass} placeholder="Or paste image URL + Enter" />
                    <button type="button" onClick={addImageUrl} className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold shrink-0">Add</button>
                  </div>
                )}
              </div>

              <label className="block space-y-1">Description *
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
              </label>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded" />Featured
                </label>
                <select value={status} onChange={e => setStatus(e.target.value as any)} className="border border-gray-200 rounded-lg p-2 text-xs bg-gray-50 text-gray-900 outline-none">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                {editingId && <button type="button" onClick={resetChannelForm} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-xl text-xs font-bold transition-all">Cancel</button>}
                <button type="submit" disabled={saveLoading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all disabled:opacity-60">
                  {saveLoading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saveLoading ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update' : 'Save Listing')}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
              <h3 className="font-sans font-extrabold text-sm text-gray-900">All Listings ({channels.length})</h3>
              <span className="text-[10px] text-gray-400 font-mono">Page {channelPage}/{channelTotalPages}</span>
            </div>
            {paginatedChannels.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Tv className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-xs font-mono">No listings yet. Create your first channel.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {paginatedChannels.map(ch => (
                  <div key={ch.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 hover:bg-gray-50/70 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-lg bg-gray-100 border overflow-hidden shrink-0">
                        {ch.images?.[0]
                          ? <img src={ch.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          : <div className="w-full h-full flex items-center justify-center"><Tv className="w-4 h-4 text-gray-300" /></div>}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">{ch.niche}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${ch.status === 'sold' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>{ch.status}</span>
                          {ch.featured && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono">★</span>}
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 truncate mt-0.5">{ch.title}</h4>
                        <p className="text-[11px] text-gray-400 font-mono">{ch.subscribers.toLocaleString()} subs · {ch.images?.length || 0} imgs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button onClick={() => onSelectChannel(ch)} className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 active:scale-90 rounded-lg transition-all" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => editChannel(ch)} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 active:scale-90 rounded-lg transition-all" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeChannel(ch.id)} disabled={deletingId === ch.id} className="p-2 bg-red-100 hover:bg-red-200 text-red-700 active:scale-90 rounded-lg transition-all disabled:opacity-50" title="Delete">
                        {deletingId === ch.id ? <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-red-700 rounded-full animate-spin block" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-3">
              <span className="text-xs text-gray-400">{sortedChannels.length === 0 ? '0' : `${(channelPage - 1) * pageSize + 1}–${Math.min(channelPage * pageSize, sortedChannels.length)}`} of {sortedChannels.length}</span>
              <div className="flex gap-2">
                <button onClick={() => setChannelPage(p => Math.max(1, p - 1))} disabled={channelPage === 1} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 text-gray-600 disabled:opacity-40 flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button onClick={() => setChannelPage(p => Math.min(channelTotalPages, p + 1))} disabled={channelPage === channelTotalPages} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 text-gray-600 disabled:opacity-40 flex items-center gap-1">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TESTIMONIALS ── */}
      {activeTab === 'testimonials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" /> Add Review
            </h3>
            <form onSubmit={saveTestimonial} className="space-y-3 text-xs font-semibold text-gray-700">
              <label className="block space-y-1">Customer Name *<input value={testimonialName} onChange={e => setTestimonialName(e.target.value)} className={inputClass} placeholder="John Doe" /></label>
              <label className="block space-y-1">Role<input value={testimonialRole} onChange={e => setTestimonialRole(e.target.value)} className={inputClass} placeholder="Verified Buyer" /></label>
              <label className="block space-y-1">Rating
                <select value={testimonialRating} onChange={e => setTestimonialRating(Number(e.target.value))} className={inputClass}>
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4)</option>
                  <option value={3}>★★★☆☆ (3)</option>
                </select>
              </label>
              <label className="block space-y-1">Review *<textarea rows={4} value={testimonialReview} onChange={e => setTestimonialReview(e.target.value)} className={inputClass} placeholder="Customer experience..." /></label>
              <button type="submit" disabled={testimonialLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all disabled:opacity-60">
                {testimonialLoading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                {testimonialLoading ? 'Adding...' : 'Add Testimonial'}
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
              <h3 className="font-extrabold text-sm text-gray-900">Reviews ({testimonials.length})</h3>
              <span className="text-[10px] text-gray-400 font-mono">Page {testimonialPage}/{testimonialTotalPages}</span>
            </div>
            {paginatedTestimonials.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-xs font-mono">No reviews yet.</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {paginatedTestimonials.map(t => (
                  <div key={t.id} className="flex justify-between items-start py-3.5 gap-4 hover:bg-gray-50/70 px-2 rounded-xl transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-gray-900">{t.name}</span>
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{t.role}</span>
                        <span className="text-xs text-amber-400">{'★'.repeat(t.rating)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.review}</p>
                    </div>
                    <button onClick={() => removeTestimonial(t.id)} disabled={deletingId === t.id} className="p-2 bg-red-100 hover:bg-red-200 text-red-700 active:scale-90 rounded-lg shrink-0 disabled:opacity-50">
                      {deletingId === t.id ? <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-red-700 rounded-full animate-spin block" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-3">
              <span className="text-xs text-gray-400">{sortedTestimonials.length === 0 ? '0' : `${(testimonialPage - 1) * pageSize + 1}–${Math.min(testimonialPage * pageSize, sortedTestimonials.length)}`} of {sortedTestimonials.length}</span>
              <div className="flex gap-2">
                <button onClick={() => setTestimonialPage(p => Math.max(1, p - 1))} disabled={testimonialPage === 1} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 text-gray-600 disabled:opacity-40 flex items-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Prev</button>
                <button onClick={() => setTestimonialPage(p => Math.min(testimonialTotalPages, p + 1))} disabled={testimonialPage === testimonialTotalPages} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 text-gray-600 disabled:opacity-40 flex items-center gap-1">Next <ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-gray-600" /> Contact & Social Settings
            </h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase font-mono tracking-wider">WhatsApp Number</label>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inputClass} placeholder="+91XXXXXXXXXX" />
              <p className="text-[10px] text-gray-400">Used for all WhatsApp inquiry buttons sitewide.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase font-mono tracking-wider">Support Email</label>
              <input type="email" value={supportEmail} onChange={e => setSupportEmailState(e.target.value)} className={inputClass} placeholder="support@yourdomain.com" />
              <p className="text-[10px] text-gray-400">Shown in footer support section.</p>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase font-mono tracking-wider">Social Media Links</label>
              {([
                { key: 'instagram' as const, label: 'Instagram URL', placeholder: 'https://instagram.com/yourpage' },
                { key: 'facebook' as const, label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
                { key: 'whatsappChannel' as const, label: 'WhatsApp Channel URL', placeholder: 'https://whatsapp.com/channel/...' },
              ]).map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 font-mono">{label}</label>
                  <input value={social[key]} onChange={e => setSocial(prev => ({ ...prev, [key]: e.target.value }))} className={inputClass} placeholder={placeholder} />
                </div>
              ))}
            </div>
            <button onClick={saveSettings} disabled={savingSettings} className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {savingSettings ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-3">Add New Admin</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              To add a new admin account:
            </p>
            <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
              <li>Go to Supabase Dashboard → Authentication → Users → Add User</li>
              <li>Create the user with their email and password</li>
              <li>Run this SQL in Supabase SQL Editor:</li>
            </ol>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">
{`INSERT INTO public.admins (email, full_name)
VALUES ('newadmin@gmail.com', 'Admin Name')
ON CONFLICT (email) DO NOTHING;`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

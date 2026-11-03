import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Search, Heart, MessageSquare, Plus, Trash2,
  ZoomIn, X, Send, Sparkles, AlertCircle, CheckCircle2, ShieldCheck,
  User, RefreshCw, Upload, Lock, Clock, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeFetchJson } from '../utils/api';
import { GalleryItem, GalleryComment, GalleryCategory } from '../types';

interface GalleryPageProps {
  openAuthModal?: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ openAuthModal }) => {
  const { user, profile } = useAuth();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lightbox & Comments State
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('মাদ্রাসা ক্যাম্পাস');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadUrlInput, setUploadUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchGallery();
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const data = await safeFetchJson<{ success: boolean; categories: GalleryCategory[] }>('/api/gallery/categories');
      if (data && data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch {
      // Ignore
    }
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const data = await safeFetchJson<{ success: boolean; gallery: GalleryItem[] }>('/api/gallery');
      if (data && data.success && Array.isArray(data.gallery)) {
        setItems(data.gallery);
      }
    } catch (e: any) {
      console.warn('Notice loading gallery:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (item: GalleryItem) => {
    setLightboxItem(item);
    fetchComments(item.id);
  };

  const closeLightbox = () => {
    setLightboxItem(null);
    setComments([]);
    setNewCommentText('');
  };

  const fetchComments = async (imageId: string) => {
    setLoadingComments(true);
    try {
      const data = await safeFetchJson<{ success: boolean; comments: GalleryComment[] }>(`/api/gallery/${imageId}/comments`);
      if (data && data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }

    // Optimistic UI update
    const currentLiked = !!item.likedByMe;
    const newCount = currentLiked ? Math.max(0, (item.likeCount || 1) - 1) : (item.likeCount || 0) + 1;

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, likedByMe: !currentLiked, likeCount: newCount } : i));
    if (lightboxItem && lightboxItem.id === item.id) {
      setLightboxItem(prev => prev ? { ...prev, likedByMe: !currentLiked, likeCount: newCount } : null);
    }

    try {
      const res = await fetch(`/api/gallery/${item.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on failure
        fetchGallery();
      }
    } catch {
      fetchGallery();
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }

    if (!lightboxItem || !newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/gallery/${lightboxItem.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newCommentText.trim(),
          authorName: profile?.displayName || user.email || 'ব্যবহারকারী',
          authorAvatar: profile?.avatar || ''
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.comment) {
        setComments(prev => [...prev, data.comment]);
        setNewCommentText('');
        // Update comment count
        setItems(prev => prev.map(i => i.id === lightboxItem.id ? { ...i, commentCount: (i.commentCount || 0) + 1 } : i));
        setLightboxItem(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null);
      }
    } catch {
      // Ignore
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!lightboxItem) return;
    try {
      const res = await fetch(`/api/gallery/${lightboxItem.id}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setItems(prev => prev.map(i => i.id === lightboxItem.id ? { ...i, commentCount: Math.max(0, (i.commentCount || 1) - 1) } : i));
        setLightboxItem(prev => prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) } : null);
      }
    } catch {
      // Ignore
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }

    setUploading(true);
    setUploadFeedback(null);

    try {
      let finalUrl = uploadUrlInput.trim();

      // If file selected, upload via /api/upload first
      if (uploadFile) {
        const fd = new FormData();
        fd.append('file', uploadFile);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (upRes.ok && upData.success && upData.url) {
          finalUrl = upData.url;
        } else {
          setUploadFeedback({ type: 'error', text: upData.error || 'ছবি আপলোড ফিল্ডে সমস্যা হয়েছে।' });
          setUploading(false);
          return;
        }
      }

      if (!finalUrl) {
        setUploadFeedback({ type: 'error', text: 'অনুগ্রহ করে ছবি সিলেক্ট করুন বা লিংক প্রদান করুন।' });
        setUploading(false);
        return;
      }

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle.trim() || 'ক্যাম্পাস ছবি',
          url: finalUrl,
          category: uploadCategory,
          description: uploadDescription.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadFeedback({ type: 'success', text: data.message || 'ছবি সফলভাবে যোগ হয়েছে!' });
        setTimeout(() => {
          setUploadModalOpen(false);
          setUploadTitle('');
          setUploadDescription('');
          setUploadFile(null);
          setUploadUrlInput('');
          setUploadFeedback(null);
          fetchGallery();
        }, 1500);
      } else {
        setUploadFeedback({ type: 'error', text: data.error || 'ছবি সাবমিট করা যায়নি।' });
      }
    } catch (err: any) {
      setUploadFeedback({ type: 'error', text: err?.message || 'নেটওয়ার্ক সমস্যা।' });
    } finally {
      setUploading(false);
    }
  };

  const categoryOptions = categories.length > 0
    ? ['all', ...categories.filter(c => !c.disabled).map(c => c.name)]
    : ['all', 'মাদ্রাসা ক্যাম্পাস', 'শিক্ষা কার্যক্রম', 'মাহফিল ও অনুষ্ঠান', 'পুরস্কার বিতরণী', 'খেলাধুলা', 'ভ্রমণ ও স্মৃতিচারণ', 'অন্যান্য'];

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#033624] via-[#055136] to-[#07724c] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>প্রিমিয়াম ফুটোগ্যালারি</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            জামিয়ার ফটো ও ভিডিও গ্যালারি
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়ার মনোরম ক্যাম্পাস, বার্ষিক মাহফিল, দস্তারবন্দী সমাবর্তন ও বিভিন্ন অনুষ্ঠানের আলোকচিত্রমালা।
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => {
            if (!user) {
              if (openAuthModal) openAuthModal();
            } else {
              setUploadModalOpen(true);
            }
          }}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-900" />
          <span>ছবি আপলোড করুন</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Category Scroll Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'all' ? 'সকল ছবি' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ছবি খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs bg-slate-50"
          />
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-slate-200 rounded-3xl h-64"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold">কোনো ছবি পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openLightbox(item)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-md text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-400/30">
                  {item.category || 'মাদ্রাসা ক্যাম্পাস'}
                </div>

                {/* Status Badge if Pending */}
                {item.status === 'pending' && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow">
                    অপেক্ষমান (Pending)
                  </div>
                )}

                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 rounded-full bg-white/90 text-slate-900 shadow-lg">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Info Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-emerald-800 transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Footer Likes & Comments Count */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] text-slate-400">
                    {item.date ? new Date(item.date).toLocaleDateString('bn-BD') : ''}
                  </span>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleToggleLike(e, item)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        item.likedByMe ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${item.likedByMe ? 'fill-rose-600' : ''}`} />
                      <span>{item.likeCount || 0}</span>
                    </button>

                    <div className="flex items-center gap-1 text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{item.commentCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview & Comments Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-emerald-900/20 my-auto flex flex-col lg:flex-row max-h-[90vh]">
            
            {/* Left Image View */}
            <div className="lg:w-3/5 bg-slate-950 flex items-center justify-center p-4 relative min-h-[300px]">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
              <button
                onClick={closeLightbox}
                className="lg:hidden absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Right Comments & Details Drawer */}
            <div className="lg:w-2/5 p-6 flex flex-col justify-between space-y-4 bg-slate-50 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                    {lightboxItem.category || 'মাদ্রাসা ক্যাম্পাস'}
                  </span>
                  <button
                    onClick={closeLightbox}
                    className="hidden lg:block p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">{lightboxItem.title}</h2>
                {lightboxItem.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-2xl border border-slate-200">
                    {lightboxItem.description}
                  </p>
                )}

                {/* Like Button Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <button
                    onClick={(e) => handleToggleLike(e, lightboxItem)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      lightboxItem.likedByMe
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${lightboxItem.likedByMe ? 'fill-rose-600' : ''}`} />
                    <span>{lightboxItem.likedByMe ? 'পছন্দ করা হয়েছে' : 'লাইক দিন'} ({lightboxItem.likeCount || 0})</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    {lightboxItem.date ? new Date(lightboxItem.date).toLocaleDateString('bn-BD') : ''}
                  </span>
                </div>
              </div>

              {/* Comments Stream */}
              <div className="space-y-3 flex-1 border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-800" />
                  <span>মন্তব্যসমূহ ({comments.length})</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {loadingComments ? (
                    <p className="text-xs text-slate-400 italic">মন্তব্য লোড হচ্ছে...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন!</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1 relative group">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900">{c.authorName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700">{c.text}</p>

                        {(profile?.isAdmin || profile?.isModerator || user?.uid === c.authorUid) && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition p-1"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handlePostComment} className="flex gap-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={user ? 'আপনার সুন্দর মন্তব্যটি লিখুন...' : 'মন্তব্য করতে লগইন করুন'}
                  disabled={!user || submittingComment}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-white"
                />
                <button
                  type="submit"
                  disabled={!user || !newCommentText.trim() || submittingComment}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-900/20 my-auto relative space-y-4">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">গ্যালারিতে নতুন ছবি যোগ করুন</h3>
              <p className="text-xs text-slate-500">ছবি নির্বাচন বা ছবির ওয়েব লিংক প্রদান করুন</p>
            </div>

            {uploadFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                uploadFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {uploadFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{uploadFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ছবির শিরোনাম</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="যেমন: বার্ষিক দস্তারবন্দী মাহফিল ২০২৬"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ক্যাটাগরি</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs"
                >
                  {categoryOptions.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ছবি সিলেক্ট করুন (ডিভাইস থেকে)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                />
              </div>

              <div className="relative text-center my-2">
                <span className="bg-white px-2 text-[11px] text-slate-400">অথবা ছবির ইউআরএল/লিংক দিন</span>
              </div>

              <div>
                <input
                  type="url"
                  value={uploadUrlInput}
                  onChange={(e) => setUploadUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">বিস্তারিত বর্ণনা (ঐচ্ছিক)</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  placeholder="ছবি সম্পর্কিত কিছু তথ্য লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-60"
              >
                {uploading ? 'আপলোড হচ্ছে...' : 'ছবি সাবমিট করুন'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

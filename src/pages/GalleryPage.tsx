import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, ZoomIn, RefreshCw } from 'lucide-react';
import { GalleryItem } from '../types';
import { safeFetchJson } from '../utils/api';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

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

  const categories = ['all', 'ক্যাম্পাস', 'অনুষ্ঠান', 'দস্তারবন্দী', 'ক্লাসরুম'];

  const filtered = selectedCategory === 'all'
    ? items
    : items.filter((i) => (i.category || 'ক্যাম্পাস') === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>ফটোগ্যালারি</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            ক্যাম্পাস ও বিভিন্ন আয়োজনের আলোকচিত্র
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়ার ক্যাম্পাস জীবন, বার্ষিক মাহফিল, দস্তারবন্দী ও পুরস্কার বিতরণী অনুষ্ঠানের স্থিরচিত্র।
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-800 text-white shadow font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'সকল ছবি' : cat}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-700 mb-3" />
          <p className="text-sm font-semibold">ছবি লোড হচ্ছে...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer aspect-4/3"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                crossOrigin="anonymous"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                  {item.category || 'ক্যাম্পাস'}
                </span>
                <h4 className="font-bold text-sm leading-tight mt-0.5">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                    {item.description}
                  </p>
                )}
                <div className="mt-2 text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>বড় করে দেখুন</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">কোনো ছবি পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500">
            এই ক্যাটাগরিতে এখনো কোনো ছবি যুক্ত করা হয়নি।
          </p>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxItem(null)}
        >
          <div 
            className="max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[70vh]">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.title}
                className="max-h-full max-w-full object-contain"
                crossOrigin="anonymous"
              />
            </div>

            <div className="p-4 bg-slate-900 text-white border-t border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {lightboxItem.category || 'ক্যাম্পাস'}
              </span>
              <h3 className="text-lg font-bold mt-0.5">{lightboxItem.title}</h3>
              {lightboxItem.description && (
                <p className="text-xs text-slate-300 mt-1">{lightboxItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Bell, Search, Tag, AlertTriangle, Calendar, FileText,
  Filter, Pin, Eye, RefreshCw, Sparkles, ExternalLink
} from 'lucide-react';
import { Notice } from '../types';
import { NoticeModal } from '../components/NoticeModal';
import { safeFetchJson } from '../utils/api';

export const NoticePage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'important' | 'exam' | 'holiday' | 'admission' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await safeFetchJson<{ success: boolean; notices: Notice[] }>('/api/notices');
      if (data && data.success && Array.isArray(data.notices)) {
        setNotices(data.notices);
      }
    } catch (e: any) {
      console.warn('Notice loading notices:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    // Filter type
    if (filter === 'important' && !n.important) return false;
    if (filter !== 'all' && filter !== 'important' && n.type !== filter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchDesc = n.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'পরীক্ষা সংক্রান্ত';
      case 'holiday': return 'ছুটির বিজ্ঞপ্তি';
      case 'admission': return 'ভর্তি তথ্য';
      case 'general': return 'সাধারণ নোটিশ';
      default: return 'বিজ্ঞপ্তি';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>অফিসিয়াল নোটিশ বোর্ড</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            অনলাইন নোটিশ ও জরুরি বিজ্ঞপ্তি
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            মাদরাসার ছুটি, পরীক্ষার রুটিন, ভর্তি কার্যক্রম এবং গুরুত্বপূর্ণ প্রশাসনিক নির্দেশনাবলি নিয়মিত এখানে আপডেট করা হয়।
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-slate-200 space-y-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'all', label: 'সব নোটিশ' },
            { id: 'important', label: 'জরুরি নোটিশ', badge: 'জরুরি' },
            { id: 'exam', label: 'পরীক্ষা' },
            { id: 'holiday', label: 'ছুটি' },
            { id: 'admission', label: 'ভর্তি' },
            { id: 'general', label: 'সাধারণ' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === cat.id
                  ? 'bg-emerald-800 text-white shadow font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নোটিশের শিরোনাম বা বিষয় দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-700 mb-3" />
          <p className="text-sm font-semibold">নোটিশ লোড হচ্ছে...</p>
        </div>
      ) : filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotices.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNotice(n)}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between relative group ${
                n.important
                  ? 'border-rose-300 bg-rose-50/20 shadow-sm'
                  : n.pinned
                  ? 'border-amber-400/80 bg-amber-50/20 shadow-sm'
                  : 'border-slate-200'
              }`}
            >
              {n.pinned && (
                <div className="absolute top-3 right-3 text-amber-500" title="পিন করা নোটিশ">
                  <Pin className="w-4 h-4 fill-amber-500 rotate-45" />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    n.type === 'exam' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    n.type === 'holiday' ? 'bg-sky-100 text-sky-900 border border-sky-300' :
                    n.type === 'admission' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                    'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {getCategoryLabel(n.type)}
                  </span>

                  {n.important && (
                    <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      জরুরি
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                  {n.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {n.description}
                </p>

                {n.attachment && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                    <FileText className="w-3 h-3" />
                    <span>সংযুক্তি ফাইল রয়েছে</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  {n.date}
                </span>

                <span className="font-bold text-emerald-800 flex items-center gap-1 group-hover:underline">
                  <span>সম্পূর্ণ পড়ুন</span>
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">কোনো নোটিশ পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            নির্বাচিত ক্যাটাগরি অথবা অনুসন্ধানের সাথে মিল রেখে কোনো বিজ্ঞপ্তি বিদ্যমান নেই।
          </p>
        </div>
      )}

      {/* Notice Detail Modal */}
      <NoticeModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </div>
  );
};

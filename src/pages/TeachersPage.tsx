import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, Award, BookOpen, RefreshCw } from 'lucide-react';
import { Teacher } from '../types';
import { safeFetchJson } from '../utils/api';

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await safeFetchJson<{ success: boolean; teachers: Teacher[] }>('/api/teachers');
      if (data && data.success && Array.isArray(data.teachers)) {
        setTeachers(data.teachers);
      }
    } catch (e: any) {
      console.warn('Notice loading teachers:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['all', 'কিতাব বিভাগ', 'হিফজুল কুরআন বিভাগ', 'নূরানী বিভাগ', 'প্রশাসন ও স্টাফ'];

  const filtered = teachers.filter((t) => {
    if (selectedDept !== 'all' && t.department !== selectedDept) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchDes = t.designation.toLowerCase().includes(q);
      if (!matchName && !matchDes) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <Users className="w-4 h-4 text-amber-400" />
            <span>শিক্ষক ও স্টাফ পরিচিতি</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            সম্মানিত উলামায়ে কেরাম ও কর্মকর্তাবৃন্দ
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়ার সুযোগ্য মুহতামিম, শাইখুল হাদিস ও পাঠদানকারী আসাতেজায়ে কেরামের পরিচিতি।
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedDept === dept
                  ? 'bg-emerald-800 text-white shadow font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {dept === 'all' ? 'সকল বিভাগ' : dept}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="শিক্ষকের নাম বা পদবি দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-700 mb-3" />
          <p className="text-sm font-semibold">শিক্ষকদের তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all text-center flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-3 border-emerald-700/60 bg-emerald-50 shadow-md group-hover:scale-105 transition-transform">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-800 font-bold text-2xl bg-emerald-100">
                      {t.name[0]}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                    {t.designation}
                  </p>
                  <span className="inline-block mt-1 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                    {t.department || 'কিতাব বিভাগ'}
                  </span>
                </div>

                {t.qualifications && (
                  <p className="text-[11px] text-slate-500 italic">
                    {t.qualifications}
                  </p>
                )}
              </div>

              {t.phone && (
                <div className="pt-4 mt-3 border-t border-slate-100">
                  <a
                    href={`tel:${t.phone}`}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.phone}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">কোনো শিক্ষক পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500">
            অনুগ্রহ করে অন্য বিভাগ বা অনুসন্ধান শব্দ ব্যবহার করুন।
          </p>
        </div>
      )}
    </div>
  );
};

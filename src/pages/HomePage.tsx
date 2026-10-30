import React, { useState, useEffect } from 'react';
import {
  Search, Bell, GraduationCap, Moon, BookOpen, Users, Image as ImageIcon,
  MapPin, Phone, Mail, Award, CheckCircle, ArrowRight, Clock, Calendar,
  ChevronRight, Heart, Sparkles, AlertCircle
} from 'lucide-react';
import { Notice, Teacher, GalleryItem, StudentResult } from '../types';
import { getKushtiaPrayerTimes, AUTHENTIC_HADITHS } from '../data/islamicData';
import { safeFetchJson } from '../utils/api';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onViewNotice: (notice: Notice) => void;
  onQuickResultSearch: (roll: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  onViewNotice,
  onQuickResultSearch
}) => {
  const [quickRoll, setQuickRoll] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [prayerTimes, setPrayerTimes] = useState(getKushtiaPrayerTimes());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Fetch initial notices
    safeFetchJson<{ success: boolean; notices: Notice[] }>('/api/notices').then((data) => {
      if (data && data.success && Array.isArray(data.notices)) {
        setNotices(data.notices.slice(0, 4));
      }
    });

    // Fetch teachers
    safeFetchJson<{ success: boolean; teachers: Teacher[] }>('/api/teachers').then((data) => {
      if (data && data.success && Array.isArray(data.teachers)) {
        setTeachers(data.teachers.slice(0, 4));
      }
    });

    // Fetch gallery
    safeFetchJson<{ success: boolean; gallery: GalleryItem[] }>('/api/gallery').then((data) => {
      if (data && data.success && Array.isArray(data.gallery)) {
        setGallery(data.gallery.slice(0, 6));
      }
    });

    return () => clearInterval(timer);
  }, []);

  const handleRollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRoll.trim()) return;
    onQuickResultSearch(quickRoll.trim());
  };

  const departments = [
    {
      title: 'কিতাব বিভাগ',
      subtitle: 'হিফজ সমাপ্তির পর দাওরায়ে হাদিস পর্যন্ত পূর্ণাঙ্গ দ্বীনি শিক্ষা',
      icon: BookOpen,
      count: 'মাদানী নিসাব ও বেফাক বোর্ড'
    },
    {
      title: 'হিফজুল কুরআন বিভাগ',
      subtitle: 'আন্তর্জাতিক মানের তাজবিদসহ পূর্ণ ৩০ পারা হিফজ ও হুসনে সওত',
      icon: Award,
      count: 'দক্ষ হাফেজ শিক্ষকমণ্ডলী'
    },
    {
      title: 'নূরানী ও নাজেরা বিভাগ',
      subtitle: 'কুরআনুল কারীমের সহিহ তালিম, মাসায়েল ও প্রাথমিক সাধারণ শিক্ষা',
      icon: Sparkles,
      count: 'ছোট শিশুদের যত্নশীল পরিচর্যা'
    },
    {
      title: 'ফতওয়া ও গবেষণা বিভাগ',
      subtitle: 'দৈনন্দিন জীবনের জটিল শরয়ী সমস্যার কুরআন-সুন্নাহ ভিত্তিক ফতওয়া',
      icon: Heart,
      count: 'দারুল ইফতা খেদমত'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 animate-fade-in">
      
      {/* Hero Banner Section with Islamic Design */}
      <section className="relative bg-gradient-to-br from-[#033624] via-[#055136] to-[#086a48] text-white pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden rounded-b-[2.5rem] shadow-2xl">
        {/* Subtle Arabesque Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e8c96a_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>দ্বীনি শিক্ষার বাতিঘর • কুষ্টিয়া</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-snug sm:leading-tight text-white font-bn">
              জামিয়া আরাবিয়া <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
                আশরাফুল উলূম
              </span> কুষ্টিয়া
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              ইলমে ওহী এবং নৈতিকতার সমন্বয়ে আদর্শ আলেম ও সুযোগ্য নাগরিক গড়ার বিশ্বস্ত প্রতিষ্ঠান। আমাদের আধুনিক ডিজিটাল পোর্টালে অনলাইন রেজাল্ট ও নোটিশ বোর্ড সেবা উপলব্ধ।
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => setActiveTab('results')}
                className="px-5 sm:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95"
              >
                <GraduationCap className="w-4 h-4" />
                <span>অনলাইন ফলাফল দেখুন</span>
              </button>

              <button
                onClick={() => setActiveTab('notices')}
                className="px-5 sm:px-6 py-3 bg-emerald-800/80 hover:bg-emerald-700/80 text-white font-semibold text-xs sm:text-sm rounded-xl border border-emerald-600/60 shadow transition-all flex items-center gap-2 active:scale-95"
              >
                <Bell className="w-4 h-4 text-amber-300" />
                <span>নোটিশ বোর্ড</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-emerald-100 text-xs sm:text-sm rounded-xl transition-colors"
              >
                মাদরাসা পরিচিতি
              </button>
            </div>

            {/* Feature Highlights Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-amber-400" /> অভিজ্ঞ মুহাদ্দিস ও হাফেজবৃন্দ
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-amber-400" /> মনোরম আবাসিক ক্যাম্পাস
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-amber-400" /> মানসম্মত খাবার ও চিকিৎসা
              </span>
            </div>
          </div>

          {/* Hero Right Widget: Quick Result Search + Prayer Clock */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Result Lookup Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 text-slate-800 shadow-2xl border border-amber-400/40">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">দ্রুত ফলাফল সন্ধান</h3>
                    <p className="text-[11px] text-slate-500">শিক্ষার্থীর রোল নম্বর দিয়ে রেজাল্ট খুঁজুন</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  ২০২৬
                </span>
              </div>

              <form onSubmit={handleRollSubmit} className="mt-4 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={quickRoll}
                    onChange={(e) => setQuickRoll(e.target.value)}
                    placeholder="শিক্ষার্থীর রোল নম্বর লিখুন (যেমন: 1, 102)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-sm font-medium"
                    required
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#055136] hover:bg-[#04442d] text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>ফলাফল ও মার্কশিট দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-3 text-center">
                <button
                  onClick={() => setActiveTab('results')}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                >
                  উন্নত ফিল্টার ও সেশনভিত্তিক তালিকা ›
                </button>
              </div>
            </div>

            {/* Quick Prayer Today Pill Card */}
            <div className="bg-[#022c1d]/90 backdrop-blur-md rounded-2xl p-4 text-white border border-emerald-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                    নামাজের সময়সূচি (কুষ্টিয়া)
                  </div>
                  <div className="text-[11px] text-emerald-200">
                    ফজর: {prayerTimes.fajr} • জোহর: {prayerTimes.dhuhr}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('prayer')}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded-lg text-xs font-semibold transition-colors"
              >
                পূর্ণাঙ্গ সময়
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        
        {/* Notice Board Preview Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <Bell className="w-4 h-4 text-amber-600" />
                অনলাইন নোটিশ বোর্ড
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                সর্বশেষ বিজ্ঞপ্তি ও তথ্যাবলি
              </h2>
            </div>

            <button
              onClick={() => setActiveTab('notices')}
              className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>সকল নোটিশ দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {notices.length > 0 ? (
              notices.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onViewNotice(n)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between ${
                    n.important ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        n.type === 'exam' ? 'bg-amber-100 text-amber-800' :
                        n.type === 'holiday' ? 'bg-sky-100 text-sky-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {n.type === 'exam' ? 'পরীক্ষা' : n.type === 'holiday' ? 'ছুটি' : 'বিজ্ঞপ্তি'}
                      </span>
                      {n.important && (
                        <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.2 rounded-full">
                          জরুরি
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {n.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {n.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-emerald-700" />
                      {n.date}
                    </span>
                    <span className="text-emerald-700 font-semibold text-[11px] hover:underline">
                      বিস্তারিত ›
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm">কোনো সাম্প্রতিক নোটিশ পাওয়া যায়নি।</p>
              </div>
            )}
          </div>
        </section>

        {/* Daily Hadith Inspiration Card */}
        <section className="bg-gradient-to-r from-[#033624] to-[#065b3c] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-700">
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              দৈনিক নির্বাচিত হাদিস শরিফ
            </div>
            <p className="font-arabic text-base sm:text-xl text-amber-200 leading-relaxed font-semibold">
              {AUTHENTIC_HADITHS[0].arabic}
            </p>
            <blockquote className="text-sm sm:text-base text-emerald-100 leading-relaxed italic">
              "{AUTHENTIC_HADITHS[0].bengali}"
            </blockquote>
            <p className="text-xs text-emerald-300/80 font-medium pt-1">
              — {AUTHENTIC_HADITHS[0].narrator} • সূত্র: {AUTHENTIC_HADITHS[0].source}
            </p>
          </div>
        </section>

        {/* Academic Departments Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              শিক্ষা ব্যবস্থা ও কারিকুলাম
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              আমাদের প্রধান শিক্ষা বিভাগসমূহ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              কওমি দ্বীনি শিক্ষার ঐতিহ্য ও আধুনিক যুগোপযোগী শৃঙ্খলা
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {departments.map((dept, index) => {
              const Icon = dept.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-[#055136] group-hover:text-amber-300 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {dept.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {dept.subtitle}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1 border-t border-slate-100">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{dept.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Teachers Preview */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                শিক্ষকমণ্ডলী
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                সম্মানিত উলামায়ে কেরাম
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('teachers')}
              className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition-colors"
            >
              <span>সকল শিক্ষক দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-emerald-700/60 bg-emerald-50 shadow">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-800 font-bold text-lg">
                      {t.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{t.name}</h3>
                  <p className="text-xs text-emerald-800 font-medium">{t.designation}</p>
                </div>
                {t.phone && (
                  <a
                    href={`tel:${t.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-3 py-1 rounded-full font-medium transition-colors"
                  >
                    <Phone className="w-3 h-3 text-emerald-700" />
                    <span>{t.phone}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Gallery Snapshot Preview */}
        {gallery.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  ফটোগ্যালারি
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  ক্যাম্পাস ও বিভিন্ন অনুষ্ঠান
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('gallery')}
                className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition-colors"
              >
                <span>গ্যালারি খুলুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setActiveTab('gallery')}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-sm"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 text-white text-[11px] font-semibold truncate">
                    {img.title}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Campus Location & Contact Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5" />
              মাদরাসার অবস্থান
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              সরাসরি যোগাযোগ ও সাক্ষাৎ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              মাদরাসা সংক্রান্ত যেকোনো তথ্য, ভর্তি কিংবা খেদমতের জন্য সরাসরি মাদরাসা প্রাঙ্গণে চলে আসুন অথবা মুঠোফোনে যোগাযোগ করুন।
            </p>

            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>মাদরাসা রোড, মজমপুর, কুষ্টিয়া সদর, কুষ্টিয়া</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>০১৭১৬-৬৫২৬৪৬ / ০১৭২৯-৯৮১৮০০</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>info.alashraf26@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-64 relative flex items-center justify-center text-center p-6 shadow-inner">
            <div className="space-y-3">
              <MapPin className="w-10 h-10 text-emerald-800 mx-auto animate-bounce" />
              <div className="font-bold text-sm text-slate-800">
                জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া
              </div>
              <p className="text-xs text-slate-500">
                মজমপুর রেলগেট সংলগ্ন, কুষ্টিয়া শহর
              </p>
              <a
                href="https://maps.google.com/?q=Kushtia,Bangladesh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
              >
                গুগল ম্যাপে দেখুন
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

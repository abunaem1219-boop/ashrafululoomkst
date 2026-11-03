import React, { useState } from 'react';
import {
  BookOpen, Award, Heart, Compass, Calendar, Volume2,
  Copy, Check, Share2, RotateCcw, Plus, Sparkles, Search, ExternalLink
} from 'lucide-react';
import {
  ALLAH_99_NAMES, DAILY_DUAS, AUTHENTIC_HADITHS,
  SURAH_LIST, ZAKAT_NISAB
} from '../data/islamicData';

interface IslamicToolsProps {
  activeSubtool: 'quran' | 'hadith' | 'dua' | 'tasbih' | 'zakat' | 'allah-names' | 'qibla';
  setActiveSubtool: (tool: any) => void;
}

export const IslamicTools: React.FC<IslamicToolsProps> = ({
  activeSubtool,
  setActiveSubtool
}) => {
  // Tasbih state
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(33);
  const [selectedDhikr, setSelectedDhikr] = useState('سُبْحَانَ اللَّهِ (সুবহানাল্লাহ)');

  // Zakat Calculator state
  const [goldGrams, setGoldGrams] = useState<number | ''>('');
  const [silverGrams, setSilverGrams] = useState<number | ''>('');
  const [cashBDT, setCashBDT] = useState<number | ''>('');
  const [businessStockBDT, setBusinessStockBDT] = useState<number | ''>('');
  const [debtsBDT, setDebtsBDT] = useState<number | ''>('');

  // Audio playing state
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);

  // Copy indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search filter state
  const [toolSearch, setToolSearch] = useState('');

  // Tasbih click handler
  const handleTasbihTap = () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    setTasbihCount((prev) => prev + 1);
  };

  const handleTasbihReset = () => {
    setTasbihCount(0);
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Zakat Calculation
  const totalAssets =
    (Number(goldGrams) || 0) * ZAKAT_NISAB.goldPricePerGram +
    (Number(silverGrams) || 0) * ZAKAT_NISAB.silverPricePerGram +
    (Number(cashBDT) || 0) +
    (Number(businessStockBDT) || 0);

  const netWealth = Math.max(0, totalAssets - (Number(debtsBDT) || 0));
  const isEligibleForZakat = netWealth >= ZAKAT_NISAB.silverNisabBDT;
  const calculatedZakat = isEligibleForZakat ? Math.round(netWealth * 0.025) : 0;

  const toolsNav = [
    { id: 'quran', label: 'আল-কুরআন', icon: BookOpen },
    { id: 'hadith', label: 'হাদিস শরিফ', icon: Award },
    { id: 'dua', label: 'দৈনন্দিন দোয়া', icon: Heart },
    { id: 'tasbih', label: 'ডিজিটাল তসবীহ', icon: Compass },
    { id: 'zakat', label: 'যাকাত ক্যালকুলেটর', icon: Calendar },
    { id: 'allah-names', label: 'আল্লাহর ৯৯ নাম', icon: Sparkles },
    { id: 'qibla', label: 'কিবলা কম্পাস', icon: Compass },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Subtools Selector Pills */}
      <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-sm border border-slate-200 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {toolsNav.map((tool) => {
            const Icon = tool.icon;
            const active = activeSubtool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => { setActiveSubtool(tool.id); setToolSearch(''); }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-emerald-800 text-white shadow font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-emerald-700'}`} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. AL-QURAN MODULE */}
      {activeSubtool === 'quran' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">পবিত্র কালামুল্লাহ</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">আল-কুরআনুল কারীম</h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
                নির্বাচিত সুরাসমূহের সহিহ তেলাওয়াত, আরবি পাঠ ও বাংলা অর্থ
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-amber-300 font-semibold inline-block">
                ১১৪টি সুরা • ৩০ পারা
              </span>
            </div>
          </div>

          {/* Surah List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SURAH_LIST.map((surah) => (
              <div
                key={surah.number}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-600 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 leading-tight">
                        {surah.nameBangla}
                      </h4>
                      <p className="text-xs text-slate-500">{surah.nameEnglish} • {surah.revelationType}</p>
                    </div>
                  </div>
                  <span className="font-arabic text-xl text-emerald-900 font-semibold">
                    {surah.nameArabic}
                  </span>
                </div>

                <div className="pt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100">
                  <span>অর্থ: <strong>{surah.meaning}</strong></span>
                  <span className="text-slate-400">{surah.totalAyahs} আয়াত</span>
                </div>

                {/* Audio Recitation Player Link */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <a
                    href={`https://quran.com/${surah.number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>সম্পূর্ণ সুরা পড়ুন</span>
                  </a>
                  <button
                    onClick={() => {
                      const audio = new Audio(`https://server8.mp3quran.net/afs/${String(surah.number).padStart(3, '0')}.mp3`);
                      if (playingSurah === surah.number) {
                        setPlayingSurah(null);
                      } else {
                        setPlayingSurah(surah.number);
                        audio.play().catch(() => {});
                      }
                    }}
                    className="p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-bold transition-colors"
                    title="তেলাওয়াত শুনুন"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. HADITH MODULE */}
      {activeSubtool === 'hadith' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">সুন্নাহ ও নসিহত</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">নির্বাচিত হাদিস শরিফ</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়া সাল্লামের জীবনঘনিষ্ঠ সহিহ হাদিস সংকলন
            </p>
          </div>

          <div className="space-y-4">
            {AUTHENTIC_HADITHS.map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                    {h.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(`${h.title}\n\n${h.arabic}\n\n"${h.bengali}"\n\n— ${h.source}`, h.id)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="কপি করুন"
                    >
                      {copiedId === h.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{h.title}</h3>

                {h.arabic && (
                  <p className="font-arabic text-lg sm:text-xl text-emerald-950 font-semibold leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    {h.arabic}
                  </p>
                )}

                <blockquote className="text-sm sm:text-base text-slate-800 leading-relaxed italic border-l-4 border-amber-500 pl-4 py-1">
                  "{h.bengali}"
                </blockquote>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>বর্ণনাকারী: <strong>{h.narrator}</strong></span>
                  <span className="font-semibold text-emerald-800">{h.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DUA MODULE */}
      {activeSubtool === 'dua' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">ইবাদত ও মোনাজাত</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">দৈনন্দিন প্রয়োজনীয় মাসনূন দোয়া</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              ঘুম, আহার, ভ্রমণ, মসজিদ ও বিপদমুক্তির সহিহ দোয়াসমূহ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DAILY_DUAS.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                      {d.category}
                    </span>
                    <button
                      onClick={() => handleCopy(`${d.title}\n\n${d.arabic}\n\n${d.transliteration}\n\nঅর্থ: ${d.meaning}\n\nসূত্র: ${d.reference}`, d.id)}
                      className="text-slate-400 hover:text-emerald-700"
                      title="কপি করুন"
                    >
                      {copiedId === d.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{d.title}</h3>

                  <p className="font-arabic text-lg sm:text-xl text-emerald-950 font-semibold leading-relaxed bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                    {d.arabic}
                  </p>

                  <div className="text-xs text-slate-700 space-y-1.5 leading-relaxed">
                    <p><strong>উচ্চারণ:</strong> {d.transliteration}</p>
                    <p><strong>অর্থ:</strong> {d.meaning}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>সূত্র: {d.reference}</span>
                  <span className="text-emerald-700 font-semibold">মাসনূন আমল</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DIGITAL TASBIH MODULE */}
      {activeSubtool === 'tasbih' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 text-white text-center shadow-xl">
            <h2 className="text-2xl font-extrabold">ডিজিটাল জিকির তসবীহ</h2>
            <p className="text-xs text-emerald-100 mt-1">আল্লাহর জিকিরে অন্তর প্রশান্ত হয়</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg text-center space-y-6">
            {/* Dhikr Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                জিকির নির্বাচন করুন
              </label>
              <select
                value={selectedDhikr}
                onChange={(e) => { setSelectedDhikr(e.target.value); setTasbihCount(0); }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              >
                <option value="سُبْحَانَ اللَّهِ (সুবহানাল্লাহ)">سُبْحَانَ اللَّهِ (সুবহানাল্লাহ)</option>
                <option value="الْحَمْدُ لِلَّهِ (আলহামদুলিল্লাহ)">الْحَمْدُ لِلَّهِ (আলহামদুলিল্লাহ)</option>
                <option value="اللَّهُ أَكْبَرُ (আল্লাহু আকবার)">اللَّهُ أَكْبَرُ (আল্লাহু আকবার)</option>
                <option value="لَا إِلَٰهَ إِلَّا اللَّهُ (লা ইলাহা ইল্লাল্লাহ)">لَا إِلَٰهَ إِلَّا اللَّهُ (লা ইলাহা ইল্লাল্লাহ)</option>
                <option value="أَسْتَغْفِرُ اللَّهَ (আস্তাগফিরুল্লাহ)">أَسْتَغْفِرُ اللَّهَ (আস্তাগফিরুল্লাহ)</option>
                <option value="اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ (দরূদ শরিফ)">اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ (দরূদ শরিফ)</option>
              </select>
            </div>

            {/* Target Select */}
            <div className="flex items-center justify-center gap-2">
              {[33, 100, 1000].map((t) => (
                <button
                  key={t}
                  onClick={() => setTasbihTarget(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    tasbihTarget === t ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  লক্ষ্য: {t}
                </button>
              ))}
            </div>

            {/* Big Tactile Bead Counter Button */}
            <div className="py-4">
              <button
                type="button"
                onClick={handleTasbihTap}
                className="w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-full bg-gradient-to-b from-[#056c46] to-[#022c1d] text-white shadow-2xl border-4 border-amber-400/80 flex flex-col items-center justify-center transition-transform active:scale-92 cursor-pointer select-none group"
              >
                <span className="text-4xl sm:text-5xl font-mono font-black tracking-tight group-hover:scale-105 transition-transform">
                  {tasbihCount}
                </span>
                <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider mt-1">
                  ট্যাপ করুন (+১)
                </span>
                <span className="text-[10px] text-emerald-200/70 mt-0.5">
                  টার্গেট: {tasbihTarget}
                </span>
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleTasbihReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ZAKAT CALCULATOR MODULE */}
      {activeSubtool === 'zakat' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">শরয়ী হিসাব</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">যাকাত ক্যালকুলেটর</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              আপনার স্বর্ণ, রৌপ্য, নগদ অর্থ ও ব্যবসায়িক মালের সঠিক ২.৫% যাকাত নির্ণয়
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  স্বর্ণের পরিমাণ (গ্রাম)
                </label>
                <input
                  type="number"
                  min="0"
                  value={goldGrams}
                  onChange={(e) => setGoldGrams(e.target.value ? Number(e.target.value) : '')}
                  placeholder="যেমন: 20 গ্রাম (বা ভরি x 11.66)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  রূপার পরিমাণ (গ্রাম)
                </label>
                <input
                  type="number"
                  min="0"
                  value={silverGrams}
                  onChange={(e) => setSilverGrams(e.target.value ? Number(e.target.value) : '')}
                  placeholder="যেমন: 100 গ্রাম"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নগদ টাকা ও ব্যাংক ব্যালেন্স (টাকা)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashBDT}
                  onChange={(e) => setCashBDT(e.target.value ? Number(e.target.value) : '')}
                  placeholder="নগদ সঞ্চয়"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ব্যবসায়িক পণ্যের বর্তমান মূল্য (টাকা)
                </label>
                <input
                  type="number"
                  min="0"
                  value={businessStockBDT}
                  onChange={(e) => setBusinessStockBDT(e.target.value ? Number(e.target.value) : '')}
                  placeholder="বিক্রয়যোগ্য পণ্য"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">
                মাইনাস: বর্তমান দায়দেনা ও ঋণ (টাকা)
              </label>
              <input
                type="number"
                min="0"
                value={debtsBDT}
                onChange={(e) => setDebtsBDT(e.target.value ? Number(e.target.value) : '')}
                placeholder="পরিশোধযোগ্য দেনা"
                className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 text-sm font-semibold bg-rose-50/20"
              />
            </div>

            {/* Result Box */}
            <div className="pt-4 border-t border-slate-200">
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 space-y-3">
                <div className="flex justify-between text-xs text-slate-700">
                  <span>মোট নিট সম্পদ:</span>
                  <span className="font-bold font-mono text-slate-900">{netWealth.toLocaleString('bn-BD')} টাকা</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700">
                  <span>রূপার নেসাব সীমা:</span>
                  <span className="font-semibold">{ZAKAT_NISAB.silverNisabBDT.toLocaleString('bn-BD')} টাকা</span>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-emerald-900 block">
                      প্রদেয় যাকাত (২.৫% হারে)
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      {isEligibleForZakat ? '✅ আপনার ওপর যাকাত ফরজ হয়েছে' : 'নেছাব পরিমাণ হয়নি'}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-900">
                    ৳ {calculatedZakat.toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ALLAH 99 NAMES MODULE */}
      {activeSubtool === 'allah-names' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">আসমাউল হুসনা</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">আল্লাহর ৯৯টি পবিত্র গুণবাচক নাম</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              প্রতিটি নামের আরবি, বাংলা অর্থ ও ফজিলতপূর্ণ তাৎপর্য
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALLAH_99_NAMES.map((item) => (
              <div
                key={item.number}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all text-center space-y-2 group"
              >
                <span className="inline-block w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold leading-7 border border-emerald-200">
                  {item.number}
                </span>
                <div className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-900 group-hover:scale-105 transition-transform">
                  {item.arabic}
                </div>
                <h4 className="font-bold text-sm text-slate-900">{item.transliteration}</h4>
                <p className="text-xs text-amber-700 font-semibold">{item.meaningBangla}</p>
                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
                  {item.virtue}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. QIBLA COMPASS MODULE */}
      {activeSubtool === 'qibla' && (
        <div className="max-w-xl mx-auto space-y-6 text-center">
          <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <h2 className="text-2xl font-extrabold">কিবলা কম্পাস ও দিকনির্দেশনা</h2>
            <p className="text-xs text-emerald-100 mt-1">বায়তুল্লাহ শরিফ (কাবা)-এর পবিত্র দিক</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
            <div className="w-56 h-56 mx-auto rounded-full border-8 border-emerald-800/80 bg-emerald-50 relative flex items-center justify-center shadow-inner">
              {/* Compass Needle */}
              <div 
                className="absolute inset-4 rounded-full border-2 border-dashed border-emerald-300 flex items-center justify-center"
                style={{ transform: 'rotate(278deg)' }} // Kushtia/Bangladesh to Mecca angle is approx 278° (West-South-West)
              >
                <div className="w-2 h-28 bg-gradient-to-t from-rose-600 via-amber-500 to-emerald-700 rounded-full" />
                <span className="absolute top-2 text-[10px] font-bold text-emerald-800">কাবা (২৭৮°)</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center text-xs font-bold shadow">
                N
              </div>
            </div>

            <div className="space-y-1 text-xs sm:text-sm text-slate-700">
              <p className="font-bold text-emerald-900 text-base">কুষ্টিয়া / বাংলাদেশ থেকে কিবলার কোণ: ২৭৮° (পশ্চিম-দক্ষিণ-পশ্চিম)</p>
              <p className="text-slate-500">সূর্যাস্তের দিক থেকে সামান্য বাম দিকে বায়তুল্লাহ শরিফ অবস্থিত।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

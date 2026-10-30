import React, { useState, useEffect } from 'react';
import { Moon, Sun, Sunrise, Sunset, Clock, MapPin, Calendar, Heart, Volume2 } from 'lucide-react';
import { getKushtiaPrayerTimes } from '../data/islamicData';

export const PrayerPage: React.FC = () => {
  const [times, setTimes] = useState(getKushtiaPrayerTimes());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const prayers = [
    { id: 'fajr', name: 'ফজর', time: times.fajr, icon: Sunrise, desc: 'ভোর থেকে সূর্যোদয় পূর্ব পর্যন্ত' },
    { id: 'sunrise', name: 'সূর্যোদয়', time: times.sunrise, icon: Sun, desc: 'নামাজ নিষিদ্ধ সময়' },
    { id: 'dhuhr', name: 'জোহর', time: times.dhuhr, icon: Sun, desc: 'দুপুর থেকে আসর পর্যন্ত' },
    { id: 'asr', name: 'আসর', time: times.asr, icon: Sun, desc: 'বিকেল থেকে সূর্যাস্ত পূর্ব পর্যন্ত' },
    { id: 'maghrib', name: 'মাগরিব', time: times.maghrib, icon: Sunset, desc: 'সূর্যাস্তের পর থেকে' },
    { id: 'isha', name: 'এশা', time: times.isha, icon: Moon, desc: 'মাগরিবের পর থেকে মধ্যরাত' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Banner with Live Digital Clock */}
      <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>কুষ্টিয়া জেলা ও আশপাশ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            পাঁচ ওয়াক্ত নামাজের সময়সূচি
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            দৈনন্দিন পাঁচ ওয়াক্ত সালাত, সাহরি ও ইফতারের সঠিক সময়সূচি। নির্ধারিত সময়ে নামাজ আদায় করা ঈমানের অন্যতম নিদর্শন।
          </p>
        </div>

        {/* Live Digital Clock Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center space-y-1 shrink-0">
          <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
            বর্তমান সময়
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-wider">
            {currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <span className="text-xs text-emerald-200 block">
            {currentTime.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Sehri & Iftar Quick Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#04442d] to-[#065b3c] text-white p-5 rounded-2xl border border-emerald-700 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
              সাহরি শেষ সময় (আজ)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {times.sehriEnd}
            </div>
            <p className="text-[11px] text-emerald-200">সতর্কতামূলক শেষ সময়</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
            <Moon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#8a4b08] to-[#b4650d] text-white p-5 rounded-2xl border border-amber-600 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-amber-200 font-semibold uppercase tracking-wider">
              ইফতারের সময় (আজ)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {times.iftar}
            </div>
            <p className="text-[11px] text-amber-100">মাগরিব আজানের প্রারম্ভ</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/30">
            <Sunset className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Prayer Times Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {prayers.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm text-center space-y-2 hover:border-emerald-600 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-800">{p.name}</h4>
                <div className="text-base sm:text-lg font-extrabold text-emerald-900 font-mono mt-0.5">
                  {p.time}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Fasting & Roza Duas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Roza Niyyah */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Heart className="w-4 h-4 text-emerald-700" />
            <span>রোজার নিয়ত</span>
          </div>
          <p className="font-arabic text-lg sm:text-xl text-emerald-900 font-semibold leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            نَوَيْتُ أَنْ أَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ الْمُبَارَكِ فَرْضًا لَكَ يَا اللَّهُ
          </p>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>উচ্চারণ:</strong> নাওয়াইতু আন আসূমা গাদান মিন শাহরি রামাদানাল মুবারাকি ফারদান লাকা ইয়া আল্লাহ।</p>
            <p><strong>বাংলা অর্থ:</strong> হে আল্লাহ! আমি আগামীকাল পবিত্র রমজান মাসের তোমার নির্ধারিত ফরজ রোজা রাখার নিয়ত করলাম।</p>
          </div>
        </div>

        {/* Iftar Dua */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Sunset className="w-4 h-4 text-amber-600" />
            <span>ইফতারের দোয়া</span>
          </div>
          <p className="font-arabic text-lg sm:text-xl text-amber-950 font-semibold leading-relaxed bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
          </p>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>উচ্চারণ:</strong> যাহাবায যামাউ ওয়াবতাল্লাতিল উরূক্বু ওয়া ছাবাতাল আজরু ইনশাআল্লাহ।</p>
            <p><strong>বাংলা অর্থ:</strong> পিপাসা নিবৃত্ত হয়েছে, শিরা-উপশিরা সিক্ত হয়েছে এবং আল্লাহর ইচ্ছায় প্রতিদানও নির্ধারিত হয়েছে। (আবু দাউদ: ২৩৫৭)</p>
          </div>
        </div>

      </div>
    </div>
  );
};

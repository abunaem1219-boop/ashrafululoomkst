import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, ArrowUp } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#032e1f] text-emerald-100 border-t-2 border-amber-500/40 relative overflow-hidden pb-20 lg:pb-8">
      {/* Subtle Islamic Motif Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Madrasa Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://i.ibb.co.com/qFRmPqgK/20260310-005555.png"
                alt="Jamia Logo"
                className="w-12 h-12 rounded-full border border-amber-400 bg-white/10 p-0.5 object-contain"
                crossOrigin="anonymous"
              />
              <div>
                <h3 className="font-bold text-white text-base leading-tight">জামিয়া আরাবিয়া</h3>
                <p className="text-amber-400 text-xs font-semibold">আশরাফুল উলূম কুষ্টিয়া</p>
              </div>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              কুরআন-সুন্নাহর সঠিক অনুসারী, যোগ্য আলেম ও হাফেজে কুরআন তৈরির একটি আদর্শ কওমি দ্বীনি শিক্ষাপ্রতিষ্ঠান। এখানে নূরানী, হিফজ ও কিতাব বিভাগ পরিচালিত হয়।
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/80">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ অধিভুক্ত</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'results', label: 'অনলাইন পরীক্ষার ফলাফল' },
                { id: 'notices', label: 'অনলাইন নোটিশ বোর্ড' },
                { id: 'teachers', label: 'শিক্ষক ও স্টাফ পরিচিতি' },
                { id: 'gallery', label: 'ছবি ও ফটো গ্যালারি' },
                { id: 'about', label: 'মাদরাসার ইতিহাস ও সিলেবাস' },
                { id: 'prayer', label: 'নামাজ ও রোজার সময়সূচি' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => { setActiveTab(link.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-0.5"
                  >
                    <span className="text-amber-500">›</span> {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Islamic Tools Column */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              ইসলামিক খেদমত
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'quran', label: 'পবিত্র আল-কুরআন তিলাওয়াত' },
                { id: 'hadith', label: 'দৈনিক নির্বাচিত হাদিস শরিফ' },
                { id: 'dua', label: 'দৈনন্দিন মাসনূন দোয়া' },
                { id: 'tasbih', label: 'ডিজিটাল জিকির তসবীহ' },
                { id: 'zakat', label: 'সহজ যাকাত ক্যালকুলেটর' },
                { id: 'allah-names', label: 'আল্লাহর ৯৯টি পবিত্র নাম' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => { setActiveTab(link.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-0.5"
                  >
                    <span className="text-amber-500">›</span> {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Location Column */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              যোগাযোগ ও ঠিকানা
            </h4>
            <div className="space-y-3 text-xs text-emerald-200/90">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>মাদরাসা রোড, মজমপুর, কুষ্টিয়া সদর, কুষ্টিয়া, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>০১৭১৬-৬৫২৬৪৬ / ০১৭২৯-৯৮১৮০০</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>info.alashraf26@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>অফিস সময়: সকাল ৮:০০ - বিকাল ৫:০০</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={scrollToTop}
                className="w-full py-2 bg-emerald-800/60 hover:bg-emerald-700/80 text-amber-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-emerald-700/60 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>পৃষ্ঠার শীর্ষে ফিরুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Divider */}
        <div className="mt-10 pt-6 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-3">
          <p>© {new Date().getFullYear()} জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              সদকায়ে জারিয়া ও খেদমতে দ্বীন <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

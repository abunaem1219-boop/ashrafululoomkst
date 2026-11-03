import React from 'react';
import { BookOpen, ShieldCheck, Heart, Award, CheckCircle, MapPin, Phone, Mail } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>ঐতিহ্য ও পরিচিতি</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            দারুল উলূম দেওবন্দের মহান আদর্শে প্রতিষ্ঠিত কুষ্টিয়া জেলার ঐতিহ্যবাহী শীর্ষস্থানীয় কওমি দ্বীনি শিক্ষাপ্রতিষ্ঠান।
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* History */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              প্রতিষ্ঠার প্রেক্ষাপট ও সংক্ষিপ্ত ইতিহাস
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p>
                কুষ্টিয়া শহরের মজমপুরস্থ প্রাণকেন্দ্রে ১৯৮৬ খ্রিস্টাব্দে কুরআন ও সুন্নাহর বিশুদ্ধ জ্ঞান প্রচার এবং যোগ্য আলেম ও হাফেজে কুরআন তৈরির মহান উদ্দেশ্য নিয়ে <strong>জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া</strong> প্রতিষ্ঠিত হয়।
              </p>
              <p>
                হাকিমুল উম্মত হযরত মাওলানা আশরাফ আলী থানভী (রহ.)-এর পুণ্য স্মৃতির প্রতি সম্মান জানিয়ে এবং আকাবিরে দেওবন্দের শিক্ষা দর্শনকে মূল ভিত্তি ধরে এ প্রতিষ্ঠানের যাত্রা শুরু হয়। প্রতিষ্ঠাতা মুরুব্বিগন ও স্থানীয় ধর্মপ্রাণ মানুষের অক্লান্ত আত্মত্যাগের ফলে আজ এটি দক্ষিণ-পশ্চিমাঞ্চলের এক অনন্য আলোকবর্তিকা।
              </p>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              আমাদের লক্ষ্য ও উদ্দেশ্য
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                <h3 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  সহিহ কুরআন ও সুন্নাহর তালিম
                </h3>
                <p className="text-slate-600 text-xs">
                  শিক্ষার্থীদের সঠিক আকিদা, উন্নত নৈতিকতা ও ফিকহে হানাফির আলোকে দক্ষ আলেম হিসেবে গড়ে তোলা।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1.5">
                <h3 className="font-bold text-amber-950 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  চরিত্র গঠন ও আধ্যাত্মিক দীক্ষা
                </h3>
                <p className="text-slate-600 text-xs">
                  তাকওয়া, পরহেজগারি ও আমলি জিন্দেগির বাস্তব অনুশীলনের মাধ্যমে আদর্শ চরিত্র গঠন করা।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  হিফজুল কুরআনের উৎকর্ষতা
                </h3>
                <p className="text-slate-600 text-xs">
                  আন্তর্জাতিক মানসম্পন্ন তাজবিদ ও সুললিত কণ্ঠে পবিত্র কুরআন হিফজের সুব্যবস্থা।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  সমাজ সংস্কার ও দাওয়াত
                </h3>
                <p className="text-slate-600 text-xs">
                  সমাজে বিদআত ও কুসংস্কার দূর করে দ্বীনের সুমহান বাণী সর্বস্তরের মানুষের মাঝে ছড়িয়ে দেওয়া।
                </p>
              </div>
            </div>
          </div>

          {/* Academic Features */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              ক্যাম্পাস সুবিধা ও বৈশিষ্ট্য
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>মনোরম ও কোলাহলমুক্ত পরিবেশে বহুতল বিশিষ্ট নিজস্ব আবাসিক ভবন।</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>এতিম ও অসচ্ছল মেধাবী শিক্ষার্থীদের জন্য পূর্ণ বিনামূল্যে লিল্লাহ বোর্ডিং সুবিধা।</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>সমৃদ্ধ কিতাবখানা (লাইব্রেরি) যাতে রয়েছে দুষ্প্রাপ্য প্রাচীন ও আধুনিক কিতাবাদি।</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>ছাত্রদের স্বাস্থ্য সুরক্ষায় নিয়মিত চিকিৎসকের তত্ত্বাবধানে ফার্স্ট এইড ও চিকিৎসা সেবা।</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Sidebar Info Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              মাদরাসা এক নজরে
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-400">নাম:</span>
                <span className="font-bold text-slate-800 text-right">জামিয়া আরাবিয়া আশরাফুল উলূম</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-400">অবস্থান:</span>
                <span className="font-medium text-slate-800 text-right">মজমপুর, কুষ্টিয়া সদর</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-400">স্থাপন কাল:</span>
                <span className="font-medium text-slate-800">১৯৮৬ খ্রি.</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-400">অধিভুক্তি:</span>
                <span className="font-medium text-emerald-800 font-semibold">বেফাকুল মাদারিসিল আরাবিয়া</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50">
                <span className="text-slate-400">মুহতামিম:</span>
                <span className="font-bold text-slate-800">মাওলানা মুফতি আবু দাউদ</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 border border-amber-200 space-y-3 text-amber-950">
            <h3 className="font-bold text-base flex items-center gap-2 text-amber-900">
              <Heart className="w-5 h-5 text-amber-600 fill-amber-500" />
              <span>দান ও সদকায়ে জারিয়া</span>
            </h3>
            <p className="text-xs leading-relaxed text-amber-900/90">
              মাদরাসার লিল্লাহ বোর্ডিং ও এতিম ছাত্রদের জন্য আপনার যাকাত, ফিতরা, ও সাধারণ দান প্রদান করে পরকালের পাথেয় অর্জন করুন।
            </p>
            <div className="p-3 bg-white/80 rounded-xl border border-amber-300 text-xs font-mono font-bold text-amber-900">
              বিকাশ / নগদ (ব্যক্তিগত): ০১৭১৬-৬৫২৬৪৬
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

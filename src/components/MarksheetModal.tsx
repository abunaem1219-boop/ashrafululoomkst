import React, { useEffect } from 'react';
import { X, Printer, Share2, Award, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentResult } from '../types';

interface MarksheetModalProps {
  result: StudentResult | null;
  onClose: () => void;
}

export const MarksheetModal: React.FC<MarksheetModalProps> = ({ result, onClose }) => {
  useEffect(() => {
    if (result && (result.grade === 'মুমতাজ' || Number(result.average) >= 80)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#056c46', '#d4af37', '#10b981', '#f59e0b']
      });
    }
  }, [result]);

  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া\nশিক্ষার্থীর নাম: ${result.name}\nরোল: ${result.roll}\nবিভাগ: ${result.className}\nপ্রাপ্ত ফলাফল: ${result.grade} (মোট নম্বর: ${result.total})`;
    if (navigator.share) {
      navigator.share({ title: 'পরীক্ষার ফলাফল', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('ফলাফলের তথ্য কপি হয়েছে!');
    }
  };

  const getGradeBadge = (grade: string) => {
    if (grade.includes('মুমতাজ')) {
      return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Sparkles, text: 'মুমতাজ (সর্বোচ্চ কৃতিত্বপূর্ণ)' };
    }
    if (grade.includes('জিদ্দান')) {
      return { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle2, text: 'জায়্যিদ জিদ্দান (প্রথম বিভাগ)' };
    }
    if (grade.includes('জায়্যিদ')) {
      return { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Award, text: 'জায়্যিদ (দ্বিতীয় বিভাগ)' };
    }
    if (grade.includes('মাকবুল')) {
      return { bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: Award, text: 'মাকবুল (উত্তীর্ণ)' };
    }
    return { bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: AlertCircle, text: 'রাসিব (অনুত্তীর্ণ)' };
  };

  const gradeBadge = getGradeBadge(result.grade);
  const GradeIcon = gradeBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-emerald-900/10 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions (Hidden in print) */}
        <div className="p-3 sm:p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>নম্বরপত্র প্রিন্ট করুন</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>শেয়ার</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Printable Marksheet Document Area */}
        <div id="printable-marksheet" className="p-6 sm:p-8 space-y-6 bg-white text-slate-900">
          
          {/* Marksheet Header */}
          <div className="text-center space-y-2 border-b-2 border-emerald-800/80 pb-4">
            <p className="font-arabic text-base sm:text-lg text-emerald-800 tracking-wider">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <div className="flex items-center justify-center gap-3">
              <img
                src="https://i.ibb.co.com/qFRmPqgK/20260310-005555.png"
                alt="Madrasa Logo"
                className="w-14 h-14 object-contain rounded-full border border-amber-400 p-0.5"
                crossOrigin="anonymous"
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#055136] tracking-tight">
                  জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  মজমপুর, কুষ্টিয়া সদর, কুষ্টিয়া • স্থাপিত: ১৯৮৬ খ্রি.
                </p>
              </div>
            </div>
            
            <div className="inline-block mt-2 px-4 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider">
              {result.examSession || 'বার্ষিক পরীক্ষা ২০২৬'} — নম্বরপত্র
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-[11px]">শিক্ষার্থীর নাম</span>
              <span className="font-bold text-slate-900">{result.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">রোল নম্বর</span>
              <span className="font-bold text-emerald-800 text-base">{result.roll}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">বিভাগ / জামাত</span>
              <span className="font-bold text-slate-800">{result.className || result.jamaat || 'কিতাব বিভাগ'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">শিক্ষাবর্ষ / শ্রেণি</span>
              <span className="font-medium text-slate-800">{result.year || '২০২৬'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">শাখা</span>
              <span className="font-medium text-slate-800">{result.branch || 'মূল শাখা'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">রেজিস্ট্রেশন নম্বর</span>
              <span className="font-mono text-slate-700">{result.regNo || `AU-${result.roll}-26`}</span>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#055136] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">ক্রম</th>
                  <th className="py-2.5 px-4 font-semibold">বিষয়ের নাম</th>
                  <th className="py-2.5 px-3 text-center font-semibold">পূর্ণমান</th>
                  <th className="py-2.5 px-3 text-right font-semibold">প্রাপ্ত নম্বর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {result.subjects && result.subjects.length > 0 ? (
                  result.subjects.map((sub, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-4 font-medium text-slate-800">{sub.name}</td>
                      <td className="py-2 px-3 text-center text-slate-500">১০০</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{sub.marks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-3 text-center text-slate-500">
                      কোনো বিষয়ের বিস্তারিত তথ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-emerald-50 border-t-2 border-emerald-600 font-bold text-slate-900">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-emerald-900 text-sm">সর্বমোট নম্বর</td>
                  <td className="py-3 px-3 text-center text-slate-600 font-mono">
                    {(result.subjects?.length || 1) * 100}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-800 text-base font-bold font-mono">
                    {result.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary Cards: Grade & Average */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${gradeBadge.bg}`}>
              <GradeIcon className="w-8 h-8 shrink-0" />
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold block opacity-80">
                  চূড়ান্ত ফলাফল
                </span>
                <span className="text-base sm:text-lg font-bold">
                  {gradeBadge.text}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                  গড় নম্বর ও হার
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-800">
                  {result.average}%
                </span>
              </div>
              {result.meritPosition && (
                <div className="text-right">
                  <span className="text-[11px] text-amber-700 font-bold block">মেধাস্থান</span>
                  <span className="text-base font-bold text-amber-800">{result.meritPosition}ম</span>
                </div>
              )}
            </div>
          </div>

          {/* Official Signatures & Seal */}
          <div className="pt-8 sm:pt-12 grid grid-cols-3 text-center text-xs text-slate-600 border-t border-slate-200">
            <div>
              <div className="w-24 border-b border-dashed border-slate-400 mx-auto mb-1.5" />
              <span>শ্রেণি শিক্ষক</span>
            </div>
            <div>
              <div className="w-20 h-10 border-2 border-emerald-800/40 rounded-full mx-auto mb-1 flex items-center justify-center text-[9px] text-emerald-800 font-bold uppercase tracking-tight">
                অফিসিয়াল সিল
              </div>
              <span>যাচাইকারী</span>
            </div>
            <div>
              <div className="w-24 border-b border-dashed border-slate-400 mx-auto mb-1.5" />
              <span className="font-semibold text-slate-800">পরীক্ষা নিয়ন্ত্রক</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            * এটি জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া-এর অনলাইন সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত নম্বরপত্র।
          </div>

        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

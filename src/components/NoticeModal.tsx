import React from 'react';
import { X, Calendar, Download, Printer, Share2, Tag, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { Notice } from '../types';

interface NoticeModalProps {
  notice: Notice | null;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ notice, onClose }) => {
  if (!notice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: notice.title,
        text: notice.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${notice.title}\n\n${notice.description}`);
      alert('নোটিশের তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!');
    }
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'পরীক্ষা সংক্রান্ত';
      case 'holiday': return 'ছুটির বিজ্ঞপ্তি';
      case 'admission': return 'ভর্তি তথ্য';
      case 'important': return 'জরুরি নোটিশ';
      default: return 'সাধারণ নোটিশ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-900/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#044e34] to-[#07724c] text-white rounded-t-2xl flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Tag className="w-3 h-3" />
                {getCategoryLabel(notice.type)}
              </span>
              {notice.important && (
                <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  জরুরি
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold leading-snug">
              {notice.title}
            </h3>
            <p className="text-xs text-emerald-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              প্রকাশের তারিখ: {notice.date}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 text-slate-800">
          {/* Madrasa Official Seal Header */}
          <div className="text-center pb-4 border-b border-slate-100 hidden print:block">
            <h2 className="text-xl font-bold text-emerald-800">জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া</h2>
            <p className="text-xs text-slate-500">মজমপুর, কুষ্টিয়া সদর, কুষ্টিয়া</p>
          </div>

          {/* Description */}
          <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {notice.description}
          </div>

          {/* Attachment Preview (if any) */}
          {notice.attachment && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                সংযুক্ত ফাইল / ছবি
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                {notice.attachment.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                  <img
                    src={notice.attachment}
                    alt="Notice attachment"
                    className="w-full max-h-96 object-contain bg-white"
                  />
                ) : (
                  <div className="p-4 flex items-center justify-between bg-emerald-50">
                    <span className="text-xs font-medium text-emerald-900 truncate">
                      {notice.attachment}
                    </span>
                    <a
                      href={notice.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> খুলুন
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Official Sign-off */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">কর্তৃপক্ষের আদেশক্রমে</p>
              <p>জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া</p>
            </div>
            <div className="text-right">
              <div className="w-20 h-10 border-b border-dashed border-slate-300 ml-auto mb-1" />
              <p className="text-[11px] text-slate-400">অনলাইন কপি</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>শেয়ার</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

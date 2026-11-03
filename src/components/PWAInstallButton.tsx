import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3 py-1.5 text-xs shadow-md transition-all active:scale-95 cursor-pointer ${className}`}
        title="হোম স্ক্রিনে অ্যাপ ইনস্টল করুন"
      >
        <Download className="w-4 h-4 text-emerald-900" />
        <span>অ্যাপ ইনস্টল</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 px-3 py-1.5 text-xs font-bold transition-all ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span>iOS ইনস্টল সহায়িকা</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-emerald-900/10 text-slate-800 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">iPhone / iPad-এ ইনস্টল করুন</h3>
                <div className="text-xs text-slate-600 space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">১</span>
                    <span>Safari ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার) <Share2 className="w-3 h-3 inline text-blue-600" /></strong> আইকনে চাপুন।</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">২</span>
                    <span>নিচে স্ক্রোল করে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> অপশনে ক্লিক করুন।</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">৩</span>
                    <span>উপরে ডান কোণে থাকা <strong>Add</strong> চাপুন। অ্যাপটি সরাসরি আপনার আইফোনে যুক্ত হবে।</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow transition"
                >
                  ঠিক আছে
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic guidance button for modern browsers if beforeinstallprompt hasn't fired yet
  return (
    <button
      onClick={() => {
        alert('আপনার ব্রাউজার মেনু (⋮) থেকে "Add to Home Screen" বা "Install App" সিলেক্ট করুন।');
      }}
      className={`inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3 py-1.5 text-xs shadow transition-all ${className}`}
    >
      <Download className="w-3.5 h-3.5 text-emerald-950" />
      <span>ইনস্টল করুন</span>
    </button>
  );
};

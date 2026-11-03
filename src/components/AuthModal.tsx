import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, KeyRound, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [directResetLink, setDirectResetLink] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('গুগল লগইন উইন্ডো বন্ধ করা হয়েছে।');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setErrorMsg('এই ইমেইল দিয়ে পাসওয়ার্ডের মাধ্যমে একাউন্ট খোলা আছে। অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।');
      } else {
        setErrorMsg('গুগল সাইন-ইন সম্পন্ন করা যায়নি: ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, fullName.trim());
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('অনুগ্রহ করে আপনার ইমেইল ঠিকানা দিন।');
          setLoading(false);
          return;
        }
        const res = await resetPassword(email.trim());
        setSuccessMsg(res.message || 'পাসওয়ার্ড রিসেটের লিংক তৈরি হয়েছে।');
        if (res.resetLink) {
          setDirectResetLink(res.resetLink);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আপনার পাসওয়ার্ড মনে না থাকলে নিচে "পাসওয়ার্ড পুনরুদ্ধার" বাটনে চাপুন।');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে।');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।');
      } else {
        setErrorMsg(err.message || 'অনুরোধটি সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToForgot = () => {
    setMode('forgot');
    setErrorMsg('');
    setSuccessMsg('');
    setDirectResetLink('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-900/10 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-[#033624] to-[#07724c] text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src="https://i.ibb.co.com/qFRmPqgK/20260310-005555.png"
            alt="Logo"
            className="w-12 h-12 mx-auto rounded-full border border-amber-400 p-0.5 mb-2 bg-white/10"
            crossOrigin="anonymous"
          />
          <h3 className="text-lg font-bold text-white">জামিয়া আরাবিয়া আশরাফুল উলূম</h3>
          <p className="text-xs text-amber-300">
            {mode === 'forgot' ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'ডিজিটাল পোর্টালে স্বাগতম'}
          </p>
        </div>

        {/* Tab Selection */}
        {mode !== 'forgot' ? (
          <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600 bg-slate-50">
            <button
              onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                mode === 'signin' ? 'border-emerald-700 text-emerald-800 bg-white font-extrabold' : 'border-transparent hover:text-slate-900'
              }`}
            >
              লগইন
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                mode === 'signup' ? 'border-emerald-700 text-emerald-800 bg-white font-extrabold' : 'border-transparent hover:text-slate-900'
              }`}
            >
              নতুন একাউন্ট
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 py-2.5 bg-amber-50 border-b border-amber-200/60 text-xs">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              পাসওয়ার্ড রিসেট উইন্ডো
            </span>
            <button
              onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-emerald-700 font-bold hover:underline"
            >
              লগইনে ফিরে যান
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="self-start text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 mt-1"
                >
                  <KeyRound className="w-3 h-3" />
                  পাসওয়ার্ড মনে নেই? এখনই রিসেট করুন
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex flex-col gap-2.5">
              <div className="flex items-start gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
              {directResetLink && (
                <div className="mt-1 pt-2 border-t border-emerald-200/70 flex flex-col gap-1.5">
                  <p className="text-[11px] text-emerald-800">নিচের বাটনে ক্লিক করে সরাসরি নতুন পাসওয়ার্ড সেট করুন:</p>
                  <a
                    href={directResetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow transition-colors"
                  >
                    <span>নতুন পাসওয়ার্ড সেট করুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Google 1-Click Login (Shown in signin / signup) */}
          {mode !== 'forgot' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-colors active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google / জিমেইল দিয়ে প্রবেশ করুন</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-medium">অথবা ইমেইল ব্যবহার করুন</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার পুরো নাম
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="যেমন: আহমদ হোসেন"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ইমেইল এড্রেস
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-sm"
                  required
                />
              </div>
              {email.trim().toLowerCase() === 'info.alashraf26@gmail.com' && (
                <p className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  অফিসিয়াল প্রধান এডমিন অ্যাকাউন্ট শনাক্ত হয়েছে।
                </p>
              )}
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    পাসওয়ার্ড
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={switchToForgot}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-sm"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'forgot' && (
              <p className="text-xs text-slate-500 leading-relaxed">
                আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল লিখুন। আমরা আপনাকে একটি নিরাপদ পাসওয়ার্ড রিসেট লিংক প্রদান করব।
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow flex items-center justify-center gap-2 transition-all active:scale-98 bg-emerald-700 hover:bg-emerald-800 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>অপেক্ষা করুন...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'signin'
                      ? 'লগইন করুন'
                      : mode === 'signup'
                      ? 'একাউন্ট তৈরি করুন'
                      : 'রিসেট লিংক পাঠান'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-slate-600 hover:text-emerald-700 font-semibold underline"
              >
                &larr; লগইন পেজে ফিরে যান
              </button>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>প্রশাসনিক আইডি (UID) দ্বারা সিস্টেম সুরক্ষিত।</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Camera, Save, LogOut, User, Phone, BookMarked, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToResults?: (roll: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToResults
}) => {
  const { user, profile, isAdmin, logout, updateUserProfile } = useAuth();

  const [name, setName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [role, setRole] = useState(profile?.role || 'visitor');
  const [bio, setBio] = useState(profile?.bio || '');
  const [savedRoll, setSavedRoll] = useState(profile?.savedRoll || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Cloudinary image upload handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন।');
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setAvatar(data.url);
      } else {
        setErrorMsg(data.error || 'ছবি আপলোড ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setErrorMsg('সার্ভারে যোগাযোগ করা যায়নি: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const success = await updateUserProfile({
        displayName: name.trim() || 'সম্মানিত অতিথি',
        phone: phone.trim(),
        role: role as any,
        bio: bio.trim(),
        avatar,
        savedRoll: savedRoll.trim()
      });

      if (success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        setErrorMsg('প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setErrorMsg('ত্রুটি: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-emerald-900/10 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Emerald Gradient */}
        <div className="relative p-6 bg-gradient-to-r from-[#044e34] to-[#07724c] text-white rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar & Cloudinary Upload */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 bg-emerald-950 flex items-center justify-center shadow-lg">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-amber-300" />
                )}
              </div>

              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-400 text-slate-900 p-1.5 rounded-full cursor-pointer shadow-md transition-transform hover:scale-110"
                title="ছবি পরিবর্তন করুন (Cloudinary)"
              >
                {uploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{name || 'ইউজার প্রোফাইল'}</h3>
                {isAdmin && (
                  <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> এডমিন
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200 mt-0.5 truncate max-w-[200px]">
                {user?.email || (isAdmin ? 'অফিসিয়াল প্রধান এডমিন' : 'অতিথি ব্যবহারকারী')}
              </p>
              <p className="text-[11px] text-amber-300 mt-1 font-mono">
                UID: {profile?.uid?.slice(0, 16)}...
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-slate-800 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              আপনার পুরো নাম
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: হাফেজ মোঃ মাহমুদুল হাসান"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-700 text-sm"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মোবাইল নম্বর
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১৭১X-XXXXXX"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-700 text-sm"
              />
            </div>
          </div>

          {/* Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                আপনার পরিচিতি
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-sm bg-white"
                disabled={isAdmin}
              >
                <option value="student">শিক্ষার্থী</option>
                <option value="guardian">অভিভাবক</option>
                <option value="teacher">শিক্ষক / স্টাফ</option>
                <option value="alumnus">প্রাক্তন শিক্ষার্থী</option>
                <option value="visitor">শুভাকাঙ্ক্ষী / সাধারণ</option>
                {isAdmin && <option value="admin">প্রধান এডমিন</option>}
              </select>
            </div>

            {/* Quick Saved Roll */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সংরক্ষিত রোল নম্বর
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={savedRoll}
                  onChange={(e) => setSavedRoll(e.target.value)}
                  placeholder="যেমন: 1 বা 102"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Bio / About */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              আপনার সম্পর্কে সংক্ষিপ্ত পরিচিতি
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="মাদরাসা অথবা দ্বীনি আগ্রহ সম্পর্কে কিছু লিখুন..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-sm"
            />
          </div>

          {/* Quick Saved Roll Action */}
          {savedRoll && onNavigateToResults && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between">
              <div className="text-xs text-amber-900 font-medium">
                সংরক্ষিত রোল: <strong className="text-base text-amber-900">{savedRoll}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToResults(savedRoll);
                }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg transition-colors"
              >
                ফলাফল দেখুন
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>

            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>তথ্য সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Utensils, CheckCircle2, AlertCircle, Clock, Calendar, ShieldCheck,
  UserCheck, Send, X, RefreshCw, FileText, ChevronRight, HelpCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeFetchJson } from '../utils/api';
import { MealRequest, StudentMealRecord, MealRequestType, MealPeriod, AffectedMealsSet } from '../types';

interface KhanaManagementPageProps {
  openAuthModal?: () => void;
}

export const KhanaManagementPage: React.FC<KhanaManagementPageProps> = ({ openAuthModal }) => {
  const { user, profile, refreshProfile } = useAuth();

  // Student Identity Verification State
  const [studentId, setStudentId] = useState(profile?.studentId || '');
  const [studentName, setStudentName] = useState(profile?.displayName || '');
  const [department, setDepartment] = useState(profile?.department || 'কিতাব বিভাগ');
  const [className, setClassName] = useState(profile?.className || 'ইবতেদাইয়্যাহ (১ম-৩য়)');
  const [branch, setBranch] = useState(profile?.branch || 'মূল শাখা');
  const [isVerifyingStudent, setIsVerifyingStudent] = useState(false);
  const [studentVerified, setStudentVerified] = useState(!!profile?.studentVerified);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);

  // Form State
  const [requestType, setRequestType] = useState<MealRequestType>('stop');
  const [startMealPeriod, setStartMealPeriod] = useState<MealPeriod>('lunch');
  const [affectedMeals, setAffectedMeals] = useState<AffectedMealsSet>('all_three');
  const [proposedEffectiveDate, setProposedEffectiveDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [note, setNote] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<MealRequest[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<StudentMealRecord | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await safeFetchJson<{ success: boolean; departments: any[] }>('/api/departments');
        if (res && res.success && Array.isArray(res.departments)) {
          setDepartmentsList(res.departments);
        }
      } catch {
        // Ignore
      }
    }
    loadDepts();
  }, []);

  // Derived options for cascading dropdowns
  const selectedDeptObj = departmentsList.find((d) => d.name === department) || departmentsList[0];
  const currentClasses = selectedDeptObj?.classes || [];
  const selectedClassObj = currentClasses.find((c: any) => c.name === className) || currentClasses[0];
  const currentBranches = selectedClassObj?.branches || [];

  useEffect(() => {
    if (user && profile?.studentId) {
      setStudentId(profile.studentId);
      setStudentVerified(!!profile.studentVerified);
      if (profile.department) setDepartment(profile.department);
      if (profile.className) setClassName(profile.className);
      if (profile.branch) setBranch(profile.branch);
      fetchStudentSchedule(profile.studentId);
      fetchMyRequests();
    }
  }, [user, profile]);

  const fetchStudentSchedule = async (idStr: string) => {
    try {
      const data = await safeFetchJson<{ success: boolean; schedule: StudentMealRecord }>(`/api/khana/student-schedule/${idStr}`);
      if (data && data.success && data.schedule) {
        setCurrentSchedule(data.schedule);
      }
    } catch {
      // Ignore
    }
  };

  const fetchMyRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await safeFetchJson<{ success: boolean; requests: MealRequest[] }>('/api/khana/requests');
      if (data && data.success && Array.isArray(data.requests)) {
        setMyRequests(data.requests);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }

    if (!studentId.trim() || !studentName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'ছাত্রের আইডি ও নাম আবশ্যক।' });
      return;
    }

    setIsVerifyingStudent(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/khana/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId.trim(),
          studentName: studentName.trim(),
          className,
          branch
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStudentVerified(true);
        setFeedbackMsg({ type: 'success', text: 'আপনার ছাত্র পরিচয় সফলভাবে যুক্ত হয়েছে!' });
        await refreshProfile();
        fetchStudentSchedule(studentId.trim());
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'ভেরিফিকেশন সম্পন্ন হয়নি।' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'নেটওয়ার্ক সমস্যা।' });
    } finally {
      setIsVerifyingStudent(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (openAuthModal) openAuthModal();
      return;
    }

    if (!studentVerified || !studentId) {
      setFeedbackMsg({ type: 'error', text: 'প্রথমে আপনার ছাত্র পরিচয় নিশ্চিত ও সেভ করুন।' });
      return;
    }

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/khana/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentName.trim(),
          studentId: studentId.trim(),
          className,
          branch,
          requestType,
          startMealPeriod,
          affectedMeals,
          note: note.trim(),
          proposedEffectiveDate
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({
          type: data.isAfterCutoff ? 'warning' : 'success',
          text: data.message || 'আপনার খানা পরিবর্তন আবেদন জমা হয়েছে।'
        });
        setNote('');
        setActiveTab('history');
        fetchMyRequests();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'আবেদন জমা দেওয়া যায়নি।' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'আবেদন জমা দেওয়ার সময় সমস্যা হয়েছে।' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (reqId: string) => {
    if (!confirm('আপনি কি সত্যিই এই আবেদনটি বাতিল করতে চান?')) return;
    try {
      const res = await fetch(`/api/khana/requests/${reqId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({ type: 'success', text: 'আবেদনটি বাতিল করা হয়েছে।' });
        fetchMyRequests();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'বাতিল করা যায়নি।' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'নেটওয়ার্ক এরর।' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#033624] via-[#055136] to-[#07724c] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>ডিজিটাল খানা পোর্টাল</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            অনলাইন খানা জারি ও বন্ধ ব্যবস্থা
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            জামিয়ার আবাসিক শিক্ষার্থীদের খানা চালু বা বন্ধ করার অনলাইন ব্যবস্থাপনা। সকাল ৮:০০ - ১০:০০ টা পর্যন্ত দৈনিক খানা হিসাব চূড়ান্ত করা হয়।
          </p>
        </div>
      </div>

      {/* Login Prompt if not authenticated */}
      {!user && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-3 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold text-amber-950">খানা অনলাইন আবেদনের জন্য সাইন-ইন করুন</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            খানা জারি বা বন্ধ করার জন্য আপনার ব্যক্তিগত ইমেইল বা গুগল একাউন্ট দিয়ে লগইন করে ছাত্র আইডি ভেরিফাই করুন।
          </p>
          <button
            onClick={openAuthModal}
            className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow transition active:scale-95 cursor-pointer"
          >
            লগইন করতে ক্লিক করুন
          </button>
        </div>
      )}

      {/* User Student Verification Box */}
      {user && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                <UserCheck className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">শিক্ষার্থী পরিচয় তথ্য</h3>
                <p className="text-xs text-slate-500">খানা চালুর জন্য আপনার ছাত্র আইডি নিশ্চিত করা আবশ্যক</p>
              </div>
            </div>
            {studentVerified && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>ভেরিফাইড আইডি: {studentId}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleVerifyStudent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">ছাত্রের আইডি (৩/৪ ডিজিট)</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="যেমন: ১০১"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">শিক্ষার্থীর নাম</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="আপনার নাম"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">মাদরাসার বিভাগ</label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setClassName('');
                  setBranch('');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/40 text-xs font-semibold"
              >
                {departmentsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">জামাত / শ্রেণি</label>
              <select
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  setBranch('');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/40 text-xs font-semibold"
              >
                {currentClasses.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">শাখা / ব্লক</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/40 text-xs font-semibold"
              >
                {currentBranches.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={isVerifyingStudent}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isVerifyingStudent ? 'সংরক্ষণ হচ্ছে...' : 'পরিচয় তথ্য আপডেট করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Meal Status Card */}
      {studentVerified && currentSchedule && (
        <div className="bg-emerald-950/5 rounded-3xl p-5 border border-emerald-900/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">আপনার বর্তমান সক্রিয় খানা সূচি</h4>
            <p className="text-xs text-slate-600">আইডি: <strong className="text-emerald-800">{studentId}</strong> | {studentName} ({className})</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${currentSchedule.breakfastActive !== false ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
              সকাল: {currentSchedule.breakfastActive !== false ? 'চালু' : 'বন্ধ'}
            </span>
            <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${currentSchedule.lunchActive !== false ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
              দুপুর: {currentSchedule.lunchActive !== false ? 'চালু' : 'বন্ধ'}
            </span>
            <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${currentSchedule.dinnerActive !== false ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
              রাত: {currentSchedule.dinnerActive !== false ? 'চালু' : 'বন্ধ'}
            </span>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs border flex items-start gap-2.5 ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          feedbackMsg.type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-200' :
          'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {feedbackMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          {feedbackMsg.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
          {feedbackMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      {user && (
        <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('form')}
            className={`py-3 px-6 border-b-2 transition-all cursor-pointer ${
              activeTab === 'form' ? 'border-emerald-800 text-emerald-900 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            নতুন খানা আবেদন
          </button>
          <button
            onClick={() => { setActiveTab('history'); fetchMyRequests(); }}
            className={`py-3 px-6 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'history' ? 'border-emerald-800 text-emerald-900 font-extrabold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>আবেদনের ইতিহাস</span>
            {myRequests.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {myRequests.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Tab 1: Form */}
      {activeTab === 'form' && user && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <Utensils className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">খানা চালু / বন্ধের আবেদন ফরম</h3>
              <p className="text-xs text-slate-500">সকল তথ্য নির্ভুলভাবে নির্বাচন করে জমা দিন</p>
            </div>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-6 text-xs sm:text-sm">
            {/* 1. Request Type */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">১. আবেদনের ধরন নির্বাচন করুন:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestType('stop')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-bold ${
                    requestType === 'stop'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-500/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <X className="w-4 h-4 text-rose-600" />
                  <span>খানা বন্ধ করতে চাই</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('start')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-bold ${
                    requestType === 'start'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>খানা চালু করতে চাই</span>
                </button>
              </div>
            </div>

            {/* 2. Starting Period */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">২. কোনো খানা থেকে কার্যকর হবে (প্রারম্ভিক সময়):</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { id: 'breakfast', label: 'সকালের খানা' },
                  { id: 'lunch', label: 'দুপুরের খানা' },
                  { id: 'dinner', label: 'রাতের খানা' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setStartMealPeriod(p.id as MealPeriod)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                      startMealPeriod === p.id
                        ? 'bg-emerald-800 border-emerald-900 text-white shadow-md'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Affected Meals */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">৩. কোন কোন বেলার খানা প্রভাবিত হবে:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'all_three', label: 'তিন বেলা (সকাল, দুপুর ও রাত)' },
                  { id: 'breakfast_only', label: 'শুধু সকাল' },
                  { id: 'lunch_only', label: 'শুধু দুপুর' },
                  { id: 'dinner_only', label: 'শুধু রাত' },
                  { id: 'breakfast_lunch', label: 'সকাল ও দুপুর' },
                  { id: 'lunch_dinner', label: 'দুপুর ও রাত' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAffectedMeals(m.id as AffectedMealsSet)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                      affectedMeals === m.id
                        ? 'bg-amber-400 border-amber-500 text-emerald-950 font-bold shadow'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Effective Date & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">৪. প্রস্তাবিত তারিখ:</label>
                <input
                  type="date"
                  value={proposedEffectiveDate}
                  onChange={(e) => setProposedEffectiveDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">বিশেষ মন্তব্য (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: ৩ দিনের জন্য বাড়িতে ছুটি..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 text-xs"
                />
              </div>
            </div>

            {/* Review Preview Card */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1.5 text-emerald-950">
              <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Clock className="w-4 h-4 text-emerald-700" />
                আবেদন বিবরণী সমাপনী রিভিউ:
              </span>
              <p>
                শিক্ষার্থী: <strong>{studentName}</strong> (আইডি: <strong>{studentId}</strong>) — {className}।
              </p>
              <p>
                অনুরোধ: <strong className={requestType === 'stop' ? 'text-rose-700' : 'text-emerald-700'}>
                  {requestType === 'stop' ? 'খানা বন্ধ' : 'খানা চালু'}
                </strong> | তারিখ: <strong>{proposedEffectiveDate}</strong> ({startMealPeriod === 'breakfast' ? 'সকাল' : startMealPeriod === 'lunch' ? 'দুপুর' : 'রাত'} হতে)।
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>{submitting ? 'আবেদন পাঠানো হচ্ছে...' : 'খানা আবেদন জমা দিন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && user && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">আপনার জমাকৃত খানা আবেদনের তালিকা</h3>
            <button
              onClick={fetchMyRequests}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-1 font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500">লোড হচ্ছে...</div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
              <p>আপনি এখনো কোনো খানা আবেদন জমা দেননি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      req.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      req.status === 'cancelled' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {req.status === 'approved' ? 'অনুমোদিত' :
                       req.status === 'rejected' ? 'বাতিলকৃত' :
                       req.status === 'cancelled' ? 'বাতিল' : 'অপেক্ষমান (Pending)'}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {new Date(req.submittedAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      আবেদনের ধরন: <span className={req.requestType === 'stop' ? 'text-rose-700' : 'text-emerald-700'}>
                        {req.requestType === 'stop' ? 'খানা বন্ধ' : 'খানা চালু'}
                      </span>
                    </p>
                    <p className="text-slate-600">
                      কার্যকর সময়: {req.proposedEffectiveDate} ({req.startMealPeriod === 'breakfast' ? 'সকাল' : req.startMealPeriod === 'lunch' ? 'দুপুর' : 'রাত'} হতে)
                    </p>
                    {req.note && <p className="text-slate-500 italic bg-slate-50 p-2 rounded-lg text-[11px]">"{req.note}"</p>}
                    {req.rejectionReason && (
                      <p className="text-rose-700 font-medium text-[11px] bg-rose-50 p-2 rounded-lg border border-rose-200">
                        বাতিলের কারণ: {req.rejectionReason}
                      </p>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleCancelRequest(req.id)}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline"
                      >
                        আবেদন প্রত্যাহার করুন
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

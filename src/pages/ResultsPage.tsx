import React, { useState, useEffect } from 'react';
import {
  Search, GraduationCap, Award, Printer, Sparkles, Filter,
  CheckCircle2, AlertCircle, RefreshCw, Bookmark, Share2, BookOpen
} from 'lucide-react';
import { StudentResult } from '../types';
import { MarksheetModal } from '../components/MarksheetModal';
import { useAuth } from '../context/AuthContext';
import { safeFetchJson } from '../utils/api';

interface ResultsPageProps {
  initialRoll?: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ initialRoll = '' }) => {
  const { profile } = useAuth();
  const [roll, setRoll] = useState(initialRoll || profile?.savedRoll || '');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');

  const [loading, setLoading] = useState(false);
  const [resultsList, setResultsList] = useState<StudentResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<StudentResult[]>([]);
  const [activeResult, setActiveResult] = useState<StudentResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'search' | 'merit'>('search');

  // Available departments, classes & sessions
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  useEffect(() => {
    // Fetch all results to populate classes & sessions and enable fast search
    fetchResults();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await safeFetchJson<{ success: boolean; departments: any[] }>('/api/departments');
      if (data && data.success && Array.isArray(data.departments)) {
        setDepartmentsList(data.departments);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (initialRoll) {
      setRoll(initialRoll);
      performSearch(initialRoll, selectedClass, selectedSession);
    }
  }, [initialRoll]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await safeFetchJson<{ success: boolean; results: StudentResult[] }>('/api/results');
      if (data && data.success && Array.isArray(data.results)) {
        setResultsList(data.results);

        // Extract unique classes
        const classes = Array.from(new Set(data.results.map((r: StudentResult) => r.className || r.jamaat).filter(Boolean))) as string[];
        setAvailableClasses(classes);

        // Extract unique sessions
        const sessions = Array.from(new Set(data.results.map((r: StudentResult) => r.examSession).filter(Boolean))) as string[];
        setAvailableSessions(sessions);

        // If roll is already provided
        if (roll) {
          performSearch(roll, selectedClass, selectedSession, data.results);
        }
      }
    } catch (e: any) {
      console.warn('Notice loading results:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = (searchRoll: string, classFilter: string, sessionFilter: string, dataset = resultsList) => {
    setHasSearched(true);
    let list = [...dataset];

    if (searchRoll.trim()) {
      list = list.filter((r) => String(r.roll).trim() === searchRoll.trim());
    }

    if (classFilter !== 'all') {
      list = list.filter((r) => (r.className || r.jamaat) === classFilter);
    }

    if (sessionFilter !== 'all') {
      list = list.filter((r) => r.examSession === sessionFilter);
    }

    setFilteredResults(list);

    // If exactly 1 result matches, open marksheet directly
    if (list.length === 1 && searchRoll.trim()) {
      setActiveResult(list[0]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(roll, selectedClass, selectedSession);
  };

  const handleReset = () => {
    setRoll('');
    setSelectedClass('all');
    setSelectedSession('all');
    setFilteredResults([]);
    setHasSearched(false);
  };

  // Merit List (Top 10 highest marks overall or by class)
  const getMeritList = () => {
    let list = [...resultsList];
    if (selectedClass !== 'all') {
      list = list.filter((r) => (r.className || r.jamaat) === selectedClass);
    }
    list.sort((a, b) => (b.total || 0) - (a.total || 0));
    return list.slice(0, 15);
  };

  const meritList = getMeritList();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#033624] to-[#076a47] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#d4af37_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>অনলাইন ফলাফল পোর্টাল</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            পরীক্ষার ফলাফল ও নম্বরপত্র অনুসন্ধান
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়ার সকল জামাত ও বিভাগের শিক্ষাবর্ষের ফলাফল খুব সহজেই এখান থেকে চেক ও প্রিন্ট করা যাবে।
          </p>
        </div>

        {/* View Mode Toggle (Search vs Merit) */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-700/60 text-xs font-bold">
          <button
            onClick={() => setViewMode('search')}
            className={`px-4 py-2 rounded-xl transition-all ${
              viewMode === 'search'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            ব্যক্তিগত রোল অনুসন্ধান
          </button>
          <button
            onClick={() => setViewMode('merit')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === 'merit'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>মেধাতালিকা (Top Merit)</span>
          </button>
        </div>
      </div>

      {viewMode === 'search' ? (
        /* Search Mode */
        <div className="space-y-6">
          {/* Filter and Search Box */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Roll Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    শিক্ষার্থীর রোল নম্বর *
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={roll}
                      onChange={(e) => setRoll(e.target.value)}
                      placeholder="যেমন: 1, 102, 55"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Class / Jamaat Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    বিভাগ / জামাত
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-sm bg-white font-medium"
                  >
                    <option value="all">সকল বিভাগ / জামাত</option>
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                    {availableClasses.length === 0 && (
                      <>
                        <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
                        <option value="হিফজুল কুরআন বিভাগ">হিফজুল কুরআন বিভাগ</option>
                        <option value="নূরানী বিভাগ">নূরানী বিভাগ</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Exam Session Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    পরীক্ষার সেশন
                  </label>
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-sm bg-white font-medium"
                  >
                    <option value="all">সকল সেশন</option>
                    {availableSessions.map((ses) => (
                      <option key={ses} value={ses}>{ses}</option>
                    ))}
                    {availableSessions.length === 0 && (
                      <>
                        <option value="বার্ষিক পরীক্ষা ২০২৬">বার্ষিক পরীক্ষা ২০২৬</option>
                        <option value="ষান্মাসিক পরীক্ষা ২০২৬">ষান্মাসিক পরীক্ষা ২০২৬</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {profile?.savedRoll && (
                  <button
                    type="button"
                    onClick={() => {
                      setRoll(profile.savedRoll!);
                      performSearch(profile.savedRoll!, selectedClass, selectedSession);
                    }}
                    className="text-xs bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                    <span>আমার সংরক্ষিত রোল ({profile.savedRoll}) খুঁজুন</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {hasSearched && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      রিসেট
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>অনুসন্ধান করুন</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Results List View */}
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-700 mb-3" />
              <p className="text-sm font-semibold">ফলাফল খোঁজা হচ্ছে...</p>
            </div>
          ) : hasSearched ? (
            filteredResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-600 px-2 font-semibold">
                  <span>মোট {filteredResults.length} টি ফলাফল পাওয়া গিয়েছে</span>
                  <span className="text-emerald-700">কার্ডে ক্লিক করে বিস্তারিত নম্বরপত্র দেখুন</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.map((item) => (
                    <div
                      key={item.id || item.roll}
                      onClick={() => setActiveResult(item)}
                      className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-600 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            রোল: {item.roll}
                          </span>
                          <h3 className="font-bold text-base text-slate-900 mt-1 group-hover:text-emerald-800 transition-colors">
                            {item.name}
                          </h3>
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          item.grade.includes('মুমতাজ') ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          item.grade.includes('জিদ্দান') ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          item.grade.includes('জায়্যিদ') ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {item.grade}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span>বিভাগ:</span>
                          <span className="font-semibold text-slate-700">{item.className || item.jamaat || 'কিতাব বিভাগ'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>মোট নম্বর:</span>
                          <span className="font-bold text-emerald-800">{item.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>গড় নম্বর:</span>
                          <span className="font-bold text-slate-800">{item.average}%</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full mt-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700" />
                        <span>নম্বরপত্র / মার্কশিট দেখুন</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">কোনো ফলাফল পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  প্রদত্ত রোল নম্বর ({roll}) অথবা ফিল্টার অনুযায়ী কোনো ফলাফল ডাটাবেজে মেলেনি। অনুগ্রহ করে রোল ও বিভাগ পুনরায় যাচাই করুন।
                </p>
              </div>
            )
          ) : (
            /* Search Prompt State */
            <div className="p-8 sm:p-12 text-center bg-slate-50 rounded-3xl border border-slate-200/80 space-y-3">
              <GraduationCap className="w-12 h-12 text-emerald-700/60 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">রোল নম্বর দিয়ে ফলাফল খুঁজুন</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                উপরে শিক্ষার্থীর রোল নম্বর লিখে "অনুসন্ধান করুন" বাটনে চাপুন। সম্পূর্ণ নম্বরপত্র স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Top Merit Mode */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>সর্বোচ্চ মেধাতালিকা (Top Performers)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  সর্বাধিক নম্বরপ্রাপ্ত প্রথম ১৫ জন কৃতি শিক্ষার্থীর তালিকা
                </p>
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600">বিভাগ:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="all">সকল বিভাগ</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Merit Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#055136] text-white">
                  <tr>
                    <th className="py-3 px-3 font-semibold text-center w-12">স্থান</th>
                    <th className="py-3 px-3 font-semibold">রোল</th>
                    <th className="py-3 px-4 font-semibold">শিক্ষার্থীর নাম</th>
                    <th className="py-3 px-4 font-semibold">বিভাগ / জামাত</th>
                    <th className="py-3 px-3 text-right font-semibold">প্রাপ্ত নম্বর</th>
                    <th className="py-3 px-3 text-center font-semibold">ফলাফল</th>
                    <th className="py-3 px-3 text-right font-semibold">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {meritList.length > 0 ? (
                    meritList.map((item, idx) => (
                      <tr key={idx} className={idx < 3 ? 'bg-amber-50/40 font-semibold' : 'bg-white hover:bg-slate-50'}>
                        <td className="py-3 px-3 text-center">
                          {idx === 0 && <span className="inline-block p-1 bg-amber-400 text-slate-950 rounded-full font-bold text-xs">১ম</span>}
                          {idx === 1 && <span className="inline-block p-1 bg-slate-300 text-slate-900 rounded-full font-bold text-xs">২য়</span>}
                          {idx === 2 && <span className="inline-block p-1 bg-amber-700 text-white rounded-full font-bold text-xs">৩য়</span>}
                          {idx >= 3 && <span className="text-slate-500 font-mono">{idx + 1}</span>}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-800">{item.roll}</td>
                        <td className="py-3 px-4 text-slate-900 font-bold">{item.name}</td>
                        <td className="py-3 px-4 text-slate-600">{item.className || item.jamaat}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-900 font-mono text-sm">{item.total}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {item.grade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setActiveResult(item)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg"
                          >
                            মার্কশিট
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        কোনো ফলাফল ডাটাবেজে পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Marksheet Modal Popup */}
      <MarksheetModal
        result={activeResult}
        onClose={() => setActiveResult(null)}
      />
    </div>
  );
};

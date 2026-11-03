import React, { useState, useEffect } from 'react';
import {
  Utensils, CheckCircle2, XCircle, Clock, Calendar, Download, Search,
  AlertCircle, RefreshCw, Filter, FileSpreadsheet, Eye, ChevronRight
} from 'lucide-react';
import { safeFetchJson } from '../utils/api';
import { MealRequest, MealAccountingSummary } from '../types';

export const KhanaAdminSection: React.FC = () => {
  const [requests, setRequests] = useState<MealRequest[]>([]);
  const [accounting, setAccounting] = useState<MealAccountingSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('pending');

  // Approval Modal State
  const [selectedReq, setSelectedReq] = useState<MealRequest | null>(null);
  const [approvalDate, setApprovalDate] = useState('');
  const [approvalMealPeriod, setApprovalMealPeriod] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection Modal State
  const [rejectionModalReq, setRejectionModalReq] = useState<MealRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadKhanaAdminData();
  }, [selectedDate]);

  const loadKhanaAdminData = async () => {
    setLoading(true);
    try {
      const [reqData, accData] = await Promise.all([
        safeFetchJson<{ success: boolean; requests: MealRequest[] }>('/api/khana/requests'),
        safeFetchJson<{ success: boolean } & MealAccountingSummary>(`/api/khana/daily-accounting?date=${selectedDate}`)
      ]);

      if (reqData && reqData.success && Array.isArray(reqData.requests)) {
        setRequests(reqData.requests);
      }

      if (accData && accData.success) {
        setAccounting(accData);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (req: MealRequest) => {
    setSelectedReq(req);
    setApprovalDate(req.proposedEffectiveDate || selectedDate);
    setApprovalMealPeriod(req.startMealPeriod || 'breakfast');
  };

  const handleApproveSubmit = async () => {
    if (!selectedReq) return;
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/khana/requests/${selectedReq.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedEffectiveDate: approvalDate,
          approvedMealPeriod: approvalMealPeriod
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'আবেদনটি সফলভাবে অনুমোদন করা হয়েছে!' });
        setSelectedReq(null);
        loadKhanaAdminData();
      } else {
        setFeedback({ type: 'error', text: data.error || 'অনুমোদন করা যায়নি।' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'এরর ঘটেছে।' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionModalReq || !rejectionReason.trim()) {
      setFeedback({ type: 'error', text: 'বাতিলের কারণ উল্লেখ করা বাধ্যতামূলক।' });
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/khana/requests/${rejectionModalReq.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'আবেদনটি বাতিল করা হয়েছে।' });
        setRejectionModalReq(null);
        setRejectionReason('');
        loadKhanaAdminData();
      } else {
        setFeedback({ type: 'error', text: data.error || 'বাতিলকরণ করা যায়নি।' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'এরর ঘটেছে।' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/khana/export-csv?date=${selectedDate}`, '_blank');
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.studentName.toLowerCase().includes(q);
      const matchId = r.studentId.includes(q);
      const matchClass = r.className.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchClass) return false;
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-1">
          <span className="text-xs text-amber-800 font-bold block">পেন্ডিং আবেদন</span>
          <div className="text-3xl font-extrabold text-amber-600 font-mono">{pendingCount}</div>
          <p className="text-[11px] text-slate-400">অনুমোদনের অপেক্ষায়</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
          <span className="text-xs text-emerald-800 font-bold block">অনুমোদিত আবেদন</span>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono">{approvedCount}</div>
          <p className="text-[11px] text-slate-400">মোট হিসাববদ্ধ</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-bold block">আজকের সকালের খানা</span>
          <div className="text-3xl font-extrabold text-slate-800 font-mono">{accounting?.breakfastCount || 0}</div>
          <p className="text-[11px] text-slate-400">জন শিক্ষার্থী</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-bold block">আজকের দুপুরের খানা</span>
          <div className="text-3xl font-extrabold text-slate-800 font-mono">{accounting?.lunchCount || 0}</div>
          <p className="text-[11px] text-slate-400">জন শিক্ষার্থী</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-bold block">আজকের রাতের খানা</span>
          <div className="text-3xl font-extrabold text-slate-800 font-mono">{accounting?.dinnerCount || 0}</div>
          <p className="text-[11px] text-slate-400">জন শিক্ষার্থী</p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Daily Accounting Bar & Excel Export */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">দৈনিক খানা খাতা ও হিসাব</h3>
              <p className="text-xs text-slate-500">নির্দিষ্ট তারিখ অনুযায়ী প্রতিটি বেলার মোট খানা সংখ্যা</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 text-xs font-bold"
            />
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Excel (CSV) ডাউনলোড</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>সকালের খানা (নাস্তা)</span>
              <span className="text-emerald-800 text-base">{accounting?.breakfastCount || 0} জন</span>
            </div>
            <p className="text-[11px] text-slate-500">অনুমোদিত সূচি অনুযায়ী প্রস্তুতের প্রস্তাবিত সংখ্যা</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>দুপুরের খানা</span>
              <span className="text-emerald-800 text-base">{accounting?.lunchCount || 0} জন</span>
            </div>
            <p className="text-[11px] text-slate-500">অনুমোদিত সূচি অনুযায়ী প্রস্তুতের প্রস্তাবিত সংখ্যা</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>রাতের খানা</span>
              <span className="text-emerald-800 text-base">{accounting?.dinnerCount || 0} জন</span>
            </div>
            <p className="text-[11px] text-slate-500">অনুমোদিত সূচি অনুযায়ী প্রস্তুতের প্রস্তাবিত সংখ্যা</p>
          </div>
        </div>
      </div>

      {/* Applications Management Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">খানা আবেদন ব্যবস্থাপনা</h3>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                {pendingCount} টি পেন্ডিং
              </span>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="আইডি বা নামে খুঁজুন..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-1.5 rounded-xl border border-slate-300 text-xs bg-white font-bold"
            >
              <option value="pending">পেন্ডিং আবেদন</option>
              <option value="approved">অনুমোদিত</option>
              <option value="rejected">বাতিলকৃত</option>
              <option value="all">সকল আবেদন</option>
            </select>

            <button
              onClick={loadKhanaAdminData}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">কোনো আবেদন পাওয়া যায়নি।</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3">আইডি ও নাম</th>
                  <th className="p-3">জামাত ও শাখা</th>
                  <th className="p-3">আবেদনের ধরন</th>
                  <th className="p-3">প্রস্তাবিত সময় ও প্রারম্ভ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-800">
                      <div>{req.studentName}</div>
                      <div className="text-[10px] text-emerald-800 font-mono">ID: {req.studentId}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{req.className}</div>
                      <div className="text-[10px] text-slate-400">{req.branch}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        req.requestType === 'stop' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {req.requestType === 'stop' ? 'খানা বন্ধ' : 'খানা চালু'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>তারিখ: {req.proposedEffectiveDate}</div>
                      <div className="text-[10px] text-slate-400">
                        {req.startMealPeriod === 'breakfast' ? 'সকাল' : req.startMealPeriod === 'lunch' ? 'দুপুর' : 'রাত'} হতে
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status === 'approved' ? 'অনুমোদিত' :
                         req.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openApproveModal(req)}
                            className="px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] shadow cursor-pointer"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => { setRejectionModalReq(req); setRejectionReason(''); }}
                            className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">রিভিউ সম্পন্ন</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-emerald-900/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>খানা আবেদন অনুমোদন করুন</span>
            </h3>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl space-y-1">
              <p>শিক্ষার্থী: <strong>{selectedReq.studentName}</strong> (আইডি: {selectedReq.studentId})</p>
              <p>অনুরোধ: <strong className="text-emerald-800">{selectedReq.requestType === 'stop' ? 'খানা বন্ধ' : 'খানা চালু'}</strong></p>
              {selectedReq.note && <p className="italic text-slate-500">"{selectedReq.note}"</p>}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">অনুমোদিত কার্যকর তারিখ:</label>
                <input
                  type="date"
                  value={approvalDate}
                  onChange={(e) => setApprovalDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">প্রারম্ভিক খানা সময়:</label>
                <select
                  value={approvalMealPeriod}
                  onChange={(e) => setApprovalMealPeriod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="breakfast">সকালের খানা</option>
                  <option value="lunch">দুপুরের খানা</option>
                  <option value="dinner">রাতের খানা</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedReq(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                ফিরে যান
              </button>
              <button
                onClick={handleApproveSubmit}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow"
              >
                {actionLoading ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-rose-900/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>আবেদন বাতিলের কারণ</span>
            </h3>

            <p className="text-xs text-slate-600">
              ছাত্রের আইডি <strong>{rejectionModalReq.studentId}</strong> ({rejectionModalReq.studentName}) এর খানা আবেদন বাতিলের কারণ উল্লেখ করুন:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="যেমন: ভুল তারিখ / বকেয়া অনুপস্থিত তথ্য..."
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              required
            />

            <div className="flex gap-2">
              <button
                onClick={() => setRejectionModalReq(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow"
              >
                {actionLoading ? 'প্রসেসিং...' : 'বাতিল নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

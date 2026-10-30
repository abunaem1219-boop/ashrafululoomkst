import React, { useState, useEffect } from 'react';
import {
  Shield, Bell, GraduationCap, Users, Image as ImageIcon, Send,
  Settings, Plus, Trash2, Edit, Save, Check, Upload, AlertCircle,
  FileSpreadsheet, Loader2, RefreshCw, Eye, Sparkles, Lock, UserCheck,
  UserX, Search, Copy, CheckCheck, LogIn, LogOut, Utensils, FolderTree
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { Notice, StudentResult, Teacher, GalleryItem, SubjectResult } from '../types';
import { safeFetchJson } from '../utils/api';
import { KhanaAdminSection } from '../components/KhanaAdminSection';
import { DepartmentAdminSection } from '../components/DepartmentAdminSection';

interface AdminDashboardProps {
  openAuthModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ openAuthModal }) => {
  const { user, profile, isAdmin, isRootAdmin, logout } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'departments' | 'khana' | 'users' | 'notices' | 'results' | 'publish' | 'teachers' | 'gallery' | 'notify' | 'settings'>('overview');

  // Stats
  const [stats, setStats] = useState({
    noticesCount: 0,
    resultsCount: 0,
    teachersCount: 0,
    galleryCount: 0,
    usersCount: 0,
  });

  // State Stores
  const [notices, setNotices] = useState<Notice[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({
    resultPublish: { enabled: true, examName: 'বার্ষিক পরীক্ষা ২০২৬' },
    tickerNotice: 'জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়ার অনলাইন পোর্টালে স্বাগতম।',
    madrasaInfo: {
      name: 'জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া',
      phone: '01716-652646',
      email: 'info.alashraf26@gmail.com',
      address: 'মাদরাসা রোড, মজমপুর, কুষ্টিয়া, বাংলাদেশ'
    }
  });

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User Management state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [manualUidInput, setManualUidInput] = useState('');
  const [manualRoleInput, setManualRoleInput] = useState('moderator');
  const [updatingRoleUid, setUpdatingRoleUid] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Form States: Notice
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    type: 'announcement' as any,
    date: new Date().toISOString().slice(0, 10),
    important: false,
    pinned: false,
    description: '',
    attachment: ''
  });

  // Form States: Result
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState({
    name: '',
    roll: '',
    regNo: '',
    className: 'কিতাব বিভাগ',
    year: '২০২৬',
    examSession: 'বার্ষিক পরীক্ষা ২০২৬',
    branch: 'মূল শাখা',
    subjects: [
      { name: 'কুরআন ও তাজবীদ', marks: 95 },
      { name: 'হাদিস শরিফ', marks: 92 },
      { name: 'ফিকহ ও উসুল', marks: 90 },
      { name: 'নাহু ও ছরফ', marks: 94 },
      { name: 'আরবি সাহিত্য', marks: 88 }
    ] as SubjectResult[]
  });

  // Bulk Upload state
  const [bulkItems, setBulkItems] = useState<any[]>([]);

  // Form States: Teacher
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    designation: '',
    department: 'কিতাব বিভাগ',
    phone: '',
    photo: '',
    qualifications: '',
    order: 1
  });

  // Form States: Gallery
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'ক্যাম্পাস',
    url: '',
    description: ''
  });

  // Notification Composer Form
  const [notifyForm, setNotifyForm] = useState({
    title: '',
    message: '',
    url: '',
    big_picture: ''
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUid(text);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  // Fetch all administrative data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [resN, resR, resT, resG, resS, resU] = await Promise.all([
        safeFetchJson<any>('/api/notices'),
        safeFetchJson<any>('/api/results'),
        safeFetchJson<any>('/api/teachers'),
        safeFetchJson<any>('/api/gallery'),
        safeFetchJson<any>('/api/settings'),
        safeFetchJson<any>('/api/users')
      ]);

      if (resN?.success && Array.isArray(resN.notices)) setNotices(resN.notices);
      if (resR?.success && Array.isArray(resR.results)) setResults(resR.results);
      if (resT?.success && Array.isArray(resT.teachers)) setTeachers(resT.teachers);
      if (resG?.success && Array.isArray(resG.gallery)) setGallery(resG.gallery);
      if (resS?.success && resS.siteSettings) setSiteSettings(resS.siteSettings);
      if (resU?.success && Array.isArray(resU.users)) setRegisteredUsers(resU.users);

      setStats({
        noticesCount: resN?.notices?.length || 0,
        resultsCount: resR?.results?.length || 0,
        teachersCount: resT?.teachers?.length || 0,
        galleryCount: resG?.gallery?.length || 0,
        usersCount: resU?.users?.length || 0
      });
    } catch (e: any) {
      console.warn('Notice loading dashboard data:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // Upload image to Cloudinary via backend `/api/upload`
  const uploadImageFile = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        showFeedback('success', 'ছবি সফলভাবে ক্লাউডিনারিতে আপলোড হয়েছে!');
        return data.url;
      }
      throw new Error(data.error || 'আপলোড ব্যর্থ');
    } catch (err: any) {
      showFeedback('error', 'ছবি আপলোড সমস্যা: ' + err.message);
      return '';
    } finally {
      setUploadingImage(false);
    }
  };

  // Calculate grade helper
  const calculateResultSummary = (subjects: SubjectResult[]) => {
    const total = subjects.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
    const avg = subjects.length > 0 ? (total / subjects.length).toFixed(2) : '0';
    const numAvg = parseFloat(avg);
    let grade = 'রাসিব';
    if (numAvg >= 80) grade = 'মুমতাজ';
    else if (numAvg >= 65) grade = 'জায়্যিদ জিদ্দান';
    else if (numAvg >= 50) grade = 'জায়্যিদ';
    else if (numAvg >= 33) grade = 'মাকবুল';
    return { total, average: avg, grade };
  };

  /* ==================== USER & ROLE MANAGEMENT ==================== */
  const handleAssignRole = async (targetUid: string, newRole: string) => {
    if (!user) return;
    setUpdatingRoleUid(targetUid);
    try {
      const res = await fetch(`/api/users/${targetUid}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: newRole,
          requesterUid: user.uid
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', 'ব্যবহারকারীর রোল সফলভাবে পরিবর্তন করা হয়েছে!');
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'রোল পরিবর্তন ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setUpdatingRoleUid(null);
    }
  };

  const handleManualUidPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUidInput.trim()) {
      return showFeedback('error', 'অনুগ্রহ করে ইউআইডি (UID) লিখুন');
    }
    await handleAssignRole(manualUidInput.trim(), manualRoleInput);
    setManualUidInput('');
  };

  /* ==================== NOTICE ACTIONS ==================== */
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.date) {
      return showFeedback('error', 'শিরোনাম ও তারিখ প্রদান আবশ্যক');
    }

    try {
      const payload = {
        id: editingNoticeId || undefined,
        ...noticeForm
      };
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', editingNoticeId ? 'নোটিশ সফলভাবে আপডেট হয়েছে!' : 'নতুন নোটিশ প্রকাশিত হয়েছে!');
        setEditingNoticeId(null);
        setNoticeForm({
          title: '',
          type: 'announcement',
          date: new Date().toISOString().slice(0, 10),
          important: false,
          pinned: false,
          description: '',
          attachment: ''
        });
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'নোটিশ সেভ করা যায়নি');
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'নোটিশ মুছে ফেলা হয়েছে');
        loadDashboardData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  /* ==================== RESULT ACTIONS ==================== */
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.name || !resultForm.roll) {
      return showFeedback('error', 'শিক্ষার্থীর নাম ও রোল আবশ্যক');
    }

    const { total, average, grade } = calculateResultSummary(resultForm.subjects);

    try {
      const payload = {
        id: editingResultId || undefined,
        ...resultForm,
        total,
        average,
        grade
      };

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', editingResultId ? 'ফলাফল আপডেট হয়েছে!' : 'নতুন ফলাফল সফলভাবে সংরক্ষণ হয়েছে!');
        setEditingResultId(null);
        setResultForm({
          name: '',
          roll: '',
          regNo: '',
          className: 'কিতাব বিভাগ',
          year: '২০২৬',
          examSession: 'বার্ষিক পরীক্ষা ২০২৬',
          branch: 'মূল শাখা',
          subjects: [
            { name: 'কুরআন ও তাজবীদ', marks: 95 },
            { name: 'হাদিস শরিফ', marks: 92 },
            { name: 'ফিকহ ও উসুল', marks: 90 },
            { name: 'নাহু ও ছরফ', marks: 94 },
            { name: 'আরবি সাহিত্য', marks: 88 }
          ]
        });
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'ফলাফল সংরক্ষণ ব্যর্থ');
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm('আপনি কি এই ফলাফলটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/results/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'ফলাফল মুছে ফেলা হয়েছে');
        loadDashboardData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  // Bulk XLSX File handler
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const parsed = data.map((row: any, idx: number) => {
          const subjects: SubjectResult[] = [];
          Object.keys(row).forEach((k) => {
            if (!['name', 'roll', 'className', 'year', 'examSession', 'branch', 'regNo'].includes(k) && typeof row[k] === 'number') {
              subjects.push({ name: k, marks: row[k] });
            }
          });

          const total = subjects.length > 0
            ? subjects.reduce((s, sub) => s + sub.marks, 0)
            : Number(row.total || 0);

          const avg = subjects.length > 0 ? (total / subjects.length).toFixed(2) : String(row.average || '0');
          const grade = row.grade || (parseFloat(avg) >= 80 ? 'মুমতাজ' : (parseFloat(avg) >= 65 ? 'জায়্যিদ জিদ্দান' : 'জায়্যিদ'));

          return {
            name: row.name || `শিক্ষার্থী ${idx + 1}`,
            roll: String(row.roll || idx + 1),
            regNo: row.regNo || `AU-${row.roll || idx + 1}`,
            className: row.className || 'কিতাব বিভাগ',
            year: String(row.year || '২০২৬'),
            examSession: row.examSession || 'বার্ষিক পরীক্ষা ২০২৬',
            branch: row.branch || 'মূল শাখা',
            subjects,
            total,
            average: avg,
            grade
          };
        });

        setBulkItems(parsed);
        showFeedback('success', `এক্সেল থেকে ${parsed.length} টি রেজাল্ট রিড করা হয়েছে।`);
      } catch (err: any) {
        showFeedback('error', 'এক্সেল ফাইল পড়তে সমস্যা: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitBulk = async () => {
    if (bulkItems.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/results/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: bulkItems })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', `সফলভাবে ${data.imported} টি ফলাফল আপলোড হয়েছে!`);
        setBulkItems([]);
        loadDashboardData();
      } else {
        showFeedback('error', data.error || 'বাল্ক আপলোড ব্যর্থ');
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==================== TEACHER ACTIONS ==================== */
  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.designation) {
      return showFeedback('error', 'নাম ও পদবি আবশ্যক');
    }
    try {
      const payload = {
        id: editingTeacherId || undefined,
        ...teacherForm
      };
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', 'শিক্ষকের তথ্য সংরক্ষিত হয়েছে!');
        setEditingTeacherId(null);
        setTeacherForm({
          name: '',
          designation: '',
          department: 'কিতাব বিভাগ',
          phone: '',
          photo: '',
          qualifications: '',
          order: 1
        });
        loadDashboardData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('আপনি কি এই শিক্ষকের তথ্য মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'শিক্ষকের তথ্য মুছে ফেলা হয়েছে');
        loadDashboardData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  /* ==================== GALLERY ACTIONS ==================== */
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.url) return showFeedback('error', 'ছবির লিংক বা ফাইল আপলোড আবশ্যক');
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', 'ছবি গ্যালারিতে যুক্ত হয়েছে!');
        setGalleryForm({ title: '', category: 'ক্যাম্পাস', url: '', description: '' });
        loadDashboardData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('ছবিটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'ছবি ডিলিট করা হয়েছে');
        loadDashboardData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  /* ==================== SEND ONESIGNAL NOTIFICATION ==================== */
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyForm.title || !notifyForm.message) {
      return showFeedback('error', 'শিরোনাম ও বার্তা আবশ্যক');
    }
    setLoading(true);
    try {
      const res = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifyForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', 'সফলভাবে সকল ভিজিটরের ডিভাইসে নোটিফিকেশন পাঠানো হয়েছে!');
        setNotifyForm({ title: '', message: '', url: '', big_picture: '' });
      } else {
        showFeedback('error', data.error || 'নোটিফিকেশন পাঠানো যায়নি');
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==================== SAVE SITE SETTINGS ==================== */
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteSettings })
      });
      if (res.ok) {
        showFeedback('success', 'ওয়েবসাইট সেটিংস সফলভাবে আপডেট হয়েছে!');
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  // Filtered users for User Management tab
  const filteredUsers = registeredUsers.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.uid && u.uid.toLowerCase().includes(q))
    );
  });

  // STRICT ACCESS CONTROL: If NOT Admin, render unauthorized message ONLY (NO PASSWORD FIELD)
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-rose-200 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto border-2 border-rose-300">
          <Lock className="w-8 h-8 text-rose-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">অননুমোদিত প্রবেশাধিকার</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            এই এডমিন প্যানেলটি শুধুমাত্র জামিয়া আরাবিয়ার নির্ধারিত প্রধান প্রশাসক (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-800">UID: 6m20RVo...</code>) অথবা প্রধান এডমিন কর্তৃক মনোনীতদের জন্য সংরক্ষিত।
          </p>
        </div>

        {user ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
            <div className="text-slate-500">বর্তমানে লগইনকৃত একাউন্ট:</div>
            <div className="font-bold text-slate-900 truncate">{user.displayName || 'নামহীন'}</div>
            <div className="text-slate-600 truncate">{user.email}</div>
            <div className="font-mono text-[11px] text-slate-400 break-all">UID: {user.uid}</div>
            <div className="pt-2 text-rose-600 font-semibold">
              ⚠️ আপনার এই ইউআইডিতে এডমিন বা মডারেটর রোল দেওয়া নেই।
            </div>
            <button
              onClick={logout}
              className="w-full mt-2 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট করে সঠিক একাউন্ট দিয়ে ঢুকুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-500">
              আপনি যদি প্রধান এডমিন হন, তবে আপনার নির্ধারিত গুগল বা ইমেইল একাউন্ট দিয়ে লগইন করুন।
            </p>
            {openAuthModal && (
              <button
                type="button"
                onClick={openAuthModal}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>এডমিন একাউন্টে লগইন করুন</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      
      {/* Admin Dashboard Header */}
      <div className="bg-gradient-to-r from-[#033624] via-[#055136] to-[#076a47] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black shadow">
            <Shield className="w-3.5 h-3.5" />
            <span>এডমিন কন্ট্রোল প্যানেল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            মাদরাসা পরিচালনা ড্যাশবোর্ড
          </h1>
          <p className="text-xs text-emerald-200 flex flex-wrap items-center gap-2">
            <span>লগইনকৃত: <strong className="text-white">{profile?.displayName || user?.email}</strong></span>
            <span>•</span>
            <span className="font-mono bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] text-amber-300">
              UID: {user?.uid}
            </span>
            {isRootAdmin && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                প্রধান সুপার এডমিন
              </span>
            )}
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-2 self-start sm:self-auto border border-white/20 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ ডেটা</span>
        </button>
      </div>

      {/* Floating Feedback Alert */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition-all ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            : 'bg-rose-100 text-rose-900 border border-rose-300'
        }`}>
          {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-700" /> : <AlertCircle className="w-4 h-4 text-rose-700" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Navigation Tabs for Admin */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'ওভারভিউ', icon: Sparkles },
          { id: 'departments', label: 'বিভাগ ও শ্রেণি বিন্যাস', icon: FolderTree },
          { id: 'khana', label: 'খানা ব্যবস্থাপনা', icon: Utensils },
          { id: 'users', label: 'ইউজার ও রোল ব্যবস্থাপনা', icon: UserCheck, badge: stats.usersCount },
          { id: 'notices', label: 'নোটিশ ব্যবস্থাপনা', icon: Bell },
          { id: 'results', label: 'ফলাফল ও বাল্ক আপলোড', icon: GraduationCap },
          { id: 'publish', label: 'রেজাল্ট প্রকাশ নিয়ন্ত্রণ', icon: Settings },
          { id: 'teachers', label: 'শিক্ষক পরিচিতি', icon: Users },
          { id: 'gallery', label: 'গ্যালারি ছবি', icon: ImageIcon },
          { id: 'notify', label: 'পুশ নোটিফিকেশন', icon: Send },
          { id: 'settings', label: 'ওয়েবসাইট সেটিংস', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                active
                  ? 'bg-emerald-800 text-white shadow font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-emerald-700'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  active ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* KHANA MANAGEMENT TAB */}
      {activeAdminTab === 'khana' && <KhanaAdminSection />}

      {/* 1. OVERVIEW TAB */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">নিবন্ধিত ইউজার</span>
              <div className="text-3xl font-extrabold text-blue-700 font-mono">{stats.usersCount}</div>
              <p className="text-[11px] text-slate-400">রোল নিয়ন্ত্রণাধীন</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">মোট নোটিশ</span>
              <div className="text-3xl font-extrabold text-emerald-800 font-mono">{stats.noticesCount}</div>
              <p className="text-[11px] text-slate-400">অনলাইন নোটিশ বোর্ডে সচল</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">মোট ফলাফল</span>
              <div className="text-3xl font-extrabold text-amber-700 font-mono">{stats.resultsCount}</div>
              <p className="text-[11px] text-slate-400">ডাটাবেজে সংরক্ষিত</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">শিক্ষকবৃন্দ</span>
              <div className="text-3xl font-extrabold text-indigo-700 font-mono">{stats.teachersCount}</div>
              <p className="text-[11px] text-slate-400">অনলাইন প্রোফাইল</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">গ্যালারির ছবি</span>
              <div className="text-3xl font-extrabold text-purple-700 font-mono">{stats.galleryCount}</div>
              <p className="text-[11px] text-slate-400">ক্লাউডিনারি সিডিএন</p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl space-y-3">
            <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-700" />
              <span>নির্ধারিত ইউআইডি ভিত্তিক কঠোর নিরাপত্তা চালু রয়েছে</span>
            </h3>
            <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
              পাসকোড ভিত্তিক লগইন সম্পূর্ণরূপে অপসারণ করা হয়েছে। শুধুমাত্র প্রধান ইউআইডি (<code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">6m20RVo55GUWBL0gQrehsx8RsOF3</code>) লগইন করলেই পূর্ণ এডমিন ক্ষমতা পায়। এরপর প্রধান এডমিন <strong>"ইউজার ও রোল ব্যবস্থাপনা"</strong> ট্যাবে গিয়ে যেকোনো ইউজারকে মডারেটর বা এডমিন বানিয়ে ক্ষমতা অর্পণ করতে পারবেন।
            </p>
          </div>
        </div>
      )}

      {/* DEPARTMENTS, CLASSES & BRANCHES TAB */}
      {activeAdminTab === 'departments' && (
        <DepartmentAdminSection onRefreshParent={loadDashboardData} />
      )}

      {/* 2. USER & ROLE MANAGEMENT TAB (Requested Feature) */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          {/* Direct UID Role Promoter */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-200 space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <span>সরাসরি ইউআইডি (UID) দিয়ে রোল অর্পণ করুন</span>
              </h3>
              <p className="text-xs text-emerald-800">
                কোনো ব্যবহারকারী একাউন্ট খোলার পর তার ইউআইডি জেনে নিয়ে সরাসরি তাকে মডারেটর বা সহকারী এডমিন হিসেবে মনোনীত করতে পারেন।
              </p>
            </div>

            <form onSubmit={handleManualUidPromote} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={manualUidInput}
                onChange={(e) => setManualUidInput(e.target.value)}
                placeholder="ব্যবহারকারীর ফায়ারবেস UID লিখুন..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
                required
              />

              <select
                value={manualRoleInput}
                onChange={(e) => setManualRoleInput(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-emerald-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
              >
                <option value="moderator">মডারেটর (নোটিশ ও রেজাল্ট কন্ট্রোল)</option>
                <option value="admin">সহকারী এডমিন (পূর্ণ কন্ট্রোল)</option>
                <option value="teacher">শিক্ষক</option>
                <option value="student">শিক্ষার্থী</option>
                <option value="visitor">সাধারণ ভিজিটর</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow flex items-center justify-center gap-1.5 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>রোল সেট করুন</span>
              </button>
            </form>
          </div>

          {/* Registered Users Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  নিবন্ধিত ব্যবহারকারীদের তালিকা ({registeredUsers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  যেকোনো ইউজারের রোল নির্বাচন করে সংরক্ষণ বাটনে চাপুন।
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="নাম, ইমেইল বা UID দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">ব্যবহারকারী</th>
                    <th className="p-3">ইউআইডি (UID)</th>
                    <th className="p-3">বর্তমান রোল</th>
                    <th className="p-3">নতুন রোল নির্ধারণ</th>
                    <th className="p-3 text-right">সংরক্ষণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isRoot = u.uid === '6m20RVo55GUWBL0gQrehsx8RsOF3';
                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {u.avatar ? (
                                <img src={u.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                  {(u.displayName || 'উ')[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{u.displayName || 'নামহীন'}</span>
                                  {isRoot && (
                                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                      মূল এডমিন
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">{u.email || u.phone || 'ইমেইল নেই'}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded-lg w-max max-w-[200px] truncate">
                              <span className="truncate">{u.uid}</span>
                              <button
                                onClick={() => copyToClipboard(u.uid)}
                                className="text-slate-400 hover:text-emerald-700 shrink-0"
                                title="কপি করুন"
                              >
                                {copiedUid === u.uid ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isRoot ? 'bg-amber-400 text-slate-950 font-black' :
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              u.role === 'moderator' ? 'bg-sky-100 text-sky-800' :
                              u.role === 'teacher' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {isRoot ? 'প্রধান সুপার এডমিন' : (
                                u.role === 'admin' ? 'সহকারী এডমিন' :
                                u.role === 'moderator' ? 'মডারেটর' :
                                u.role === 'teacher' ? 'শিক্ষক' :
                                u.role === 'student' ? 'শিক্ষার্থী' :
                                u.role === 'guardian' ? 'অভিভাবক' : 'সাধারণ ব্যবহারকারী'
                              )}
                            </span>
                          </td>

                          <td className="p-3">
                            {isRoot ? (
                              <span className="text-[11px] text-slate-400 italic">অপরিবর্তনীয়</span>
                            ) : (
                              <select
                                id={`role-select-${u.uid}`}
                                defaultValue={u.role || 'visitor'}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
                              >
                                <option value="visitor">সাধারণ ভিজিটর</option>
                                <option value="moderator">মডারেটর (নোটিশ ও রেজাল্ট এক্সেস)</option>
                                <option value="admin">সহকারী এডমিন (পূর্ণ ক্ষমতা)</option>
                                <option value="teacher">শিক্ষক</option>
                                <option value="student">শিক্ষার্থী</option>
                                <option value="guardian">অভিভাবক</option>
                              </select>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            {!isRoot && (
                              <button
                                onClick={() => {
                                  const selectEl = document.getElementById(`role-select-${u.uid}`) as HTMLSelectElement;
                                  if (selectEl) {
                                    handleAssignRole(u.uid, selectEl.value);
                                  }
                                }}
                                disabled={updatingRoleUid === u.uid}
                                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow transition-colors disabled:opacity-50"
                              >
                                {updatingRoleUid === u.uid ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  'সেভ'
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        কোনো ব্যবহারকারী পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. NOTICES TAB */}
      {activeAdminTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>{editingNoticeId ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ তৈরি করুন'}</span>
              {editingNoticeId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNoticeId(null);
                    setNoticeForm({
                      title: '',
                      type: 'announcement',
                      date: new Date().toISOString().slice(0, 10),
                      important: false,
                      pinned: false,
                      description: '',
                      attachment: ''
                    });
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  বাতিল
                </button>
              )}
            </h3>

            <form onSubmit={handleSaveNotice} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="যেমন: পবিত্র ঈদুল ফিতরের ছুটির নোটিশ"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={noticeForm.type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="announcement">ঘোষণা / নোটিশ</option>
                    <option value="exam">পরীক্ষা</option>
                    <option value="holiday">ছুটি</option>
                    <option value="admission">ভর্তি</option>
                    <option value="general">সাধারণ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রকাশের তারিখ</label>
                  <input
                    type="date"
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 py-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={noticeForm.important}
                    onChange={(e) => setNoticeForm({ ...noticeForm, important: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>জরুরি নোটিশ হিসেবে মার্ক করুন</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={noticeForm.pinned}
                    onChange={(e) => setNoticeForm({ ...noticeForm, pinned: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span>শীর্ষে পিন করুন</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows={4}
                  value={noticeForm.description}
                  onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                  placeholder="নোটিশের পূর্ণাঙ্গ বিবরণ লিখুন..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Cloudinary Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সংযুক্ত ফাইল বা ছবি (Cloudinary)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={noticeForm.attachment}
                    onChange={(e) => setNoticeForm({ ...noticeForm, attachment: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>আপলোড</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImageFile(file);
                          if (url) setNoticeForm((prev) => ({ ...prev, attachment: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingImage}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow"
              >
                {editingNoticeId ? 'আপডেট সংরক্ষণ করুন' : 'নোটিশ প্রকাশ করুন'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              বিদ্যমান নোটিশসমূহ ({notices.length})
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {n.type}
                      </span>
                      {n.important && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                          জরুরি
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">{n.date}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 truncate mt-1">{n.title}</h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingNoticeId(n.id);
                        setNoticeForm({
                          title: n.title,
                          type: n.type,
                          date: n.date,
                          important: !!n.important,
                          pinned: !!n.pinned,
                          description: n.description || '',
                          attachment: n.attachment || ''
                        });
                      }}
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors"
                      title="এডিট"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                      title="ডিলিট"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. RESULTS & BULK UPLOAD TAB */}
      {activeAdminTab === 'results' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 p-6 rounded-3xl border border-amber-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-amber-950 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-700" />
                  <span>এক্সেল (XLSX/CSV) বাল্ক রেজাল্ট আপলোড</span>
                </h3>
                <p className="text-xs text-amber-900/80">
                  এক ক্লিকে শত শত শিক্ষার্থীর ফলাফল এক্সেল শিট থেকে ডাটাবেজে ইমপোর্ট করুন
                </p>
              </div>

              <label className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow self-start sm:self-auto transition-colors">
                <Upload className="w-4 h-4" />
                <span>এক্সেল ফাইল নির্বাচন করুন</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleExcelUpload}
                />
              </label>
            </div>

            {bulkItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>প্রিভিউ: {bulkItems.length} জন শিক্ষার্থীর ডাটা প্রস্তুত</span>
                  <button
                    onClick={handleCommitBulk}
                    disabled={loading}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>ডাটাবেজে যুক্ত করুন</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto bg-white rounded-xl border border-amber-200 p-2 text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-slate-500 font-bold">
                        <th className="p-1">রোল</th>
                        <th className="p-1">নাম</th>
                        <th className="p-1">বিভাগ</th>
                        <th className="p-1">মোট নম্বর</th>
                        <th className="p-1">গ্রেড</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkItems.slice(0, 10).map((r, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="p-1 font-bold">{r.roll}</td>
                          <td className="p-1">{r.name}</td>
                          <td className="p-1">{r.className}</td>
                          <td className="p-1 font-bold text-emerald-800">{r.total}</td>
                          <td className="p-1">{r.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                {editingResultId ? 'ফলাফল এডিট করুন' : 'একক ফলাফল এন্ট্রি'}
              </h3>

              <form onSubmit={handleSaveResult} className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম *</label>
                  <input
                    type="text"
                    value={resultForm.name}
                    onChange={(e) => setResultForm({ ...resultForm, name: e.target.value })}
                    placeholder="যেমন: আহমদ হাসান"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">রোল নম্বর *</label>
                    <input
                      type="text"
                      value={resultForm.roll}
                      onChange={(e) => setResultForm({ ...resultForm, roll: e.target.value })}
                      placeholder="যেমন: 101"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">রেজিস্ট্রেশন নম্বর</label>
                    <input
                      type="text"
                      value={resultForm.regNo}
                      onChange={(e) => setResultForm({ ...resultForm, regNo: e.target.value })}
                      placeholder="AU-101-26"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">বিভাগ / জামাত</label>
                    <select
                      value={resultForm.className}
                      onChange={(e) => setResultForm({ ...resultForm, className: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
                      <option value="হিফজুল কুরআন বিভাগ">হিফজুল কুরআন বিভাগ</option>
                      <option value="নূরানী বিভাগ">নূরানী বিভাগ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">পরীক্ষার সেশন</label>
                    <input
                      type="text"
                      value={resultForm.examSession}
                      onChange={(e) => setResultForm({ ...resultForm, examSession: e.target.value })}
                      placeholder="বার্ষিক পরীক্ষা ২০২৬"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">বিষয় ও প্রাপ্ত নম্বর</span>
                    <button
                      type="button"
                      onClick={() => setResultForm({
                        ...resultForm,
                        subjects: [...resultForm.subjects, { name: 'নতুন বিষয়', marks: 80 }]
                      })}
                      className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> বিষয় যোগ
                    </button>
                  </div>

                  {resultForm.subjects.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => {
                          const subs = [...resultForm.subjects];
                          subs[idx].name = e.target.value;
                          setResultForm({ ...resultForm, subjects: subs });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.marks}
                        onChange={(e) => {
                          const subs = [...resultForm.subjects];
                          subs[idx].marks = Number(e.target.value);
                          setResultForm({ ...resultForm, subjects: subs });
                        }}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const subs = resultForm.subjects.filter((_, i) => i !== idx);
                          setResultForm({ ...resultForm, subjects: subs });
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow"
                >
                  {editingResultId ? 'ফলাফল আপডেট করুন' : 'ফলাফল সংরক্ষণ করুন'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                সংরক্ষিত ফলাফল ({results.length})
              </h3>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 font-bold">
                    <tr>
                      <th className="p-2">রোল</th>
                      <th className="p-2">নাম</th>
                      <th className="p-2">বিভাগ</th>
                      <th className="p-2 text-right">নম্বর</th>
                      <th className="p-2 text-center">গ্রেড</th>
                      <th className="p-2 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((r) => (
                      <tr key={r.id || r.roll} className="hover:bg-slate-50">
                        <td className="p-2 font-bold font-mono text-emerald-800">{r.roll}</td>
                        <td className="p-2 font-semibold text-slate-800">{r.name}</td>
                        <td className="p-2 text-slate-500">{r.className || r.jamaat}</td>
                        <td className="p-2 text-right font-bold text-slate-900">{r.total}</td>
                        <td className="p-2 text-center">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {r.grade}
                          </span>
                        </td>
                        <td className="p-2 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingResultId(r.id || String(r.roll));
                              setResultForm({
                                name: r.name,
                                roll: String(r.roll),
                                regNo: r.regNo || '',
                                className: r.className || r.jamaat || 'কিতাব বিভাগ',
                                year: r.year || '২০২৬',
                                examSession: r.examSession || 'বার্ষিক পরীক্ষা ২০২৬',
                                branch: r.branch || 'মূল শাখা',
                                subjects: r.subjects || []
                              });
                            }}
                            className="p-1 text-slate-500 hover:text-emerald-700"
                            title="এডিট"
                          >
                            <Edit className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteResult(r.id || String(r.roll))}
                            className="p-1 text-slate-500 hover:text-rose-600"
                            title="ডিলিট"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PUBLISH TOGGLE TAB */}
      {activeAdminTab === 'publish' && (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">রেজাল্ট প্রকাশ ও কাউন্টডাউন নিয়ন্ত্রণ</h3>
            <p className="text-xs text-slate-500">
              ফলাফল সরাসরি উন্মুক্ত করতে অথবা নির্ধারিত সময়ের জন্য লক করতে পারেন।
            </p>
          </div>

          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-emerald-950">
                {siteSettings.resultPublish?.enabled ? '✅ ফলাফল সরাসরি প্রকাশিত' : '🔒 ফলাফল লুকানো'}
              </span>
              <p className="text-xs text-emerald-800">
                পাবলিশ অন থাকলে শিক্ষার্থীরা সঙ্গে সঙ্গে রোল নম্বর দিয়ে মার্কশিট দেখতে পাবে।
              </p>
            </div>

            <button
              onClick={async () => {
                const newState = !siteSettings.resultPublish?.enabled;
                const updated = {
                  ...siteSettings,
                  resultPublish: { ...siteSettings.resultPublish, enabled: newState }
                };
                setSiteSettings(updated);
                await fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ siteSettings: updated })
                });
                showFeedback('success', newState ? 'রেজাল্ট উন্মুক্ত করা হয়েছে!' : 'রেজাল্ট লক করা হয়েছে!');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow transition-colors ${
                siteSettings.resultPublish?.enabled
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {siteSettings.resultPublish?.enabled ? 'লক করুন' : 'উন্মুক্ত করুন'}
            </button>
          </div>
        </div>
      )}

      {/* 6. TEACHERS TAB */}
      {activeAdminTab === 'teachers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              {editingTeacherId ? 'শিক্ষকের তথ্য এডিট' : 'নতুন শিক্ষক যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveTeacher} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষকের নাম *</label>
                <input
                  type="text"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  placeholder="মাওলানা ..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পদবি *</label>
                <input
                  type="text"
                  value={teacherForm.designation}
                  onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                  placeholder="মুহতামিম / প্রধান শিক্ষক / উস্তাদ"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিভাগ</label>
                  <select
                    value={teacherForm.department}
                    onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
                    <option value="হিফজুল কুরআন বিভাগ">হিফজুল কুরআন বিভাগ</option>
                    <option value="নূরানী বিভাগ">নূরানী বিভাগ</option>
                    <option value="প্রশাসন ও স্টাফ">প্রশাসন ও স্টাফ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    placeholder="০১৭১X-XXXXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ছবি (Cloudinary অপ্টিমাইজড)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={teacherForm.photo}
                    onChange={(e) => setTeacherForm({ ...teacherForm, photo: e.target.value })}
                    placeholder="ছবির লিংক..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImageFile(file);
                          if (url) setTeacherForm((prev) => ({ ...prev, photo: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষাগত যোগ্যতা</label>
                <input
                  type="text"
                  value={teacherForm.qualifications}
                  onChange={(e) => setTeacherForm({ ...teacherForm, qualifications: e.target.value })}
                  placeholder="দাওরায়ে হাদিস, ইফতা..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingImage}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow"
              >
                সংরক্ষণ করুন
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-3">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              শিক্ষক ও স্টাফ তালিকা ({teachers.length})
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {teachers.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.photo || 'https://i.ibb.co.com/ycd9T2PK/IMG-20260311-233709.png'}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-700"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                      <p className="text-xs text-emerald-800">{t.designation} • {t.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTeacherId(t.id);
                        setTeacherForm({
                          name: t.name,
                          designation: t.designation,
                          department: t.department,
                          phone: t.phone || '',
                          photo: t.photo || '',
                          qualifications: t.qualifications || '',
                          order: t.order || 1
                        });
                      }}
                      className="p-1.5 text-slate-500 hover:text-emerald-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(t.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. GALLERY TAB */}
      {activeAdminTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900">গ্যালারিতে নতুন ছবি যোগ করুন</h3>
            <form onSubmit={handleSaveGallery} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিরোনাম</label>
                <input
                  type="text"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="যেমন: দস্তারবন্দী মাহফিল"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="ক্যাম্পাস">ক্যাম্পাস</option>
                  <option value="অনুষ্ঠান">অনুষ্ঠান</option>
                  <option value="দস্তারবন্দী">দস্তারবন্দী</option>
                  <option value="ক্লাসরুম">ক্লাসরুম</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ছবি আপলোড</label>
                <label className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-bold flex items-center justify-center gap-1 border border-slate-300">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'আপলোড হচ্ছে...' : (galleryForm.url ? 'ছবি নির্বাচিত' : 'ফাইল নির্বাচন')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImageFile(file);
                        if (url) setGalleryForm((prev) => ({ ...prev, url }));
                      }
                    }}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={uploadingImage || !galleryForm.url}
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50"
              >
                গ্যালারিতে যুক্ত করুন
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {gallery.map((g) => (
              <div key={g.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                <img src={g.url} alt={g.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeleteGallery(g.id)}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md text-xs shadow hover:bg-rose-700"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PUSH NOTIFICATION TAB */}
      {activeAdminTab === 'notify' && (
        <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-700" />
              <span>সরাসরি পুশ নোটিফিকেশন ব্রডকাস্ট</span>
            </h3>
            <p className="text-xs text-slate-500">
              OneSignal এবং ফায়ারবেস ব্যাকএন্ডের মাধ্যমে সকল সাবস্ক্রাইবকারী শিক্ষার্থী ও অভিভাবকের মোবাইলে রিয়েলটাইম মেসেজ পাঠান।
            </p>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">নোটিফিকেশন টাইটেল *</label>
              <input
                type="text"
                value={notifyForm.title}
                onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })}
                placeholder="যেমন: বার্ষিক পরীক্ষার ফলাফল প্রকাশিত হয়েছে!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বার্তা বা বর্ণনা *</label>
              <textarea
                rows={3}
                value={notifyForm.message}
                onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                placeholder="বিস্তারিত বার্তা..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">টার্গেট লিংক</label>
              <input
                type="text"
                value={notifyForm.url}
                onChange={(e) => setNotifyForm({ ...notifyForm, url: e.target.value })}
                placeholder="যেমন: /results"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বড় ব্যানার ছবি (Cloudinary URL)</label>
              <input
                type="text"
                value={notifyForm.big_picture}
                onChange={(e) => setNotifyForm({ ...notifyForm, big_picture: e.target.value })}
                placeholder="ছবির লিংক..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>এখনই ব্রডকাস্ট করুন</span>
            </button>
          </form>
        </div>
      )}

      {/* 9. SETTINGS TAB */}
      {activeAdminTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">ওয়েবসাইট সেটিংস</h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">টপ ব্যানার নোটিশ / স্ক্রল টেক্সট</label>
              <input
                type="text"
                value={siteSettings.tickerNotice || ''}
                onChange={(e) => setSiteSettings({ ...siteSettings, tickerNotice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মাদরাসার নাম</label>
              <input
                type="text"
                value={siteSettings.madrasaInfo?.name || ''}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  madrasaInfo: { ...siteSettings.madrasaInfo, name: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল ফোন</label>
                <input
                  type="text"
                  value={siteSettings.madrasaInfo?.phone || ''}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    madrasaInfo: { ...siteSettings.madrasaInfo, phone: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল</label>
                <input
                  type="email"
                  value={siteSettings.madrasaInfo?.email || ''}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    madrasaInfo: { ...siteSettings.madrasaInfo, email: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ঠিকানা</label>
              <input
                type="text"
                value={siteSettings.madrasaInfo?.address || ''}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  madrasaInfo: { ...siteSettings.madrasaInfo, address: e.target.value }
                })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow"
            >
              সেটিংস সংরক্ষণ করুন
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

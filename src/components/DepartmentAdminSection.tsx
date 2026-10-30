import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronRight,
  Layers,
  GraduationCap,
  FolderTree,
  AlertCircle,
  Check,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { MadrasaDepartment, DepartmentClass, DepartmentBranch } from '../types';
import { safeFetchJson } from '../utils/api';

interface Props {
  onRefreshParent?: () => void;
}

export const DepartmentAdminSection: React.FC<Props> = () => {
  const [departments, setDepartments] = useState<MadrasaDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Editing states
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptNameInput, setDeptNameInput] = useState('');

  // Add new Dept state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Add Class state
  const [addingClassDeptId, setAddingClassDeptId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');

  // Edit Class state
  const [editingClassKey, setEditingClassKey] = useState<{ deptId: string; classId: string } | null>(null);
  const [classNameInput, setClassNameInput] = useState('');

  // Add Branch state
  const [addingBranchKey, setAddingBranchKey] = useState<{ deptId: string; classId: string } | null>(null);
  const [newBranchName, setNewBranchName] = useState('');

  // Edit Branch state
  const [editingBranchKey, setEditingBranchKey] = useState<{ deptId: string; classId: string; branchId: string } | null>(null);
  const [branchNameInput, setBranchNameInput] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await safeFetchJson('/api/departments');
      if (res.ok && res.data && res.data.departments) {
        setDepartments(res.data.departments);
      } else {
        setError('বিভাগসমূহ লোড করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setError('সার্ভারে যোগাযোগ করা যায়নি: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const saveDepartmentsToBackend = async (updatedList: MadrasaDepartment[]) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await safeFetchJson('/api/departments', {
        method: 'POST',
        body: JSON.stringify({ departments: updatedList })
      });
      if (res.ok && res.data && res.data.success) {
        setDepartments(updatedList);
        setSuccessMsg('বিভাগ ও শ্রেণি বিন্যাস সফলভাবে সংরক্ষিত হয়েছে।');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError(res.data?.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setError('সংরক্ষণে ত্রুটি: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Department CRUD
  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    const newDept: MadrasaDepartment = {
      id: `dept_${Date.now()}`,
      name: newDeptName.trim(),
      code: `dept_${Date.now()}`,
      order: departments.length + 1,
      classes: []
    };
    const updated = [...departments, newDept];
    saveDepartmentsToBackend(updated);
    setNewDeptName('');
    setShowAddDeptModal(false);
  };

  const handleUpdateDeptName = (deptId: string) => {
    if (!deptNameInput.trim()) return;
    const updated = departments.map((d) => (d.id === deptId ? { ...d, name: deptNameInput.trim() } : d));
    saveDepartmentsToBackend(updated);
    setEditingDeptId(null);
  };

  const handleDeleteDepartment = (deptId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই সম্পূর্ণ বিভাগটি ডিলিট করতে চান?')) return;
    const updated = departments.filter((d) => d.id !== deptId);
    saveDepartmentsToBackend(updated);
  };

  // Class CRUD
  const handleAddClass = (deptId: string) => {
    if (!newClassName.trim()) return;
    const updated = departments.map((d) => {
      if (d.id === deptId) {
        const newCls: DepartmentClass = {
          id: `cls_${Date.now()}`,
          name: newClassName.trim(),
          branches: [
            { id: `br_1_${Date.now()}`, name: 'শাখা ক' },
            { id: `br_m_${Date.now()}`, name: 'মূল শাখা' }
          ]
        };
        return { ...d, classes: [...(d.classes || []), newCls] };
      }
      return d;
    });
    saveDepartmentsToBackend(updated);
    setNewClassName('');
    setAddingClassDeptId(null);
  };

  const handleUpdateClassName = (deptId: string, classId: string) => {
    if (!classNameInput.trim()) return;
    const updated = departments.map((d) => {
      if (d.id === deptId) {
        const updatedClasses = (d.classes || []).map((c) => (c.id === classId ? { ...c, name: classNameInput.trim() } : c));
        return { ...d, classes: updatedClasses };
      }
      return d;
    });
    saveDepartmentsToBackend(updated);
    setEditingClassKey(null);
  };

  const handleDeleteClass = (deptId: string, classId: string) => {
    if (!window.confirm('এই শ্রেণিটি মুছে ফেলতে চান?')) return;
    const updated = departments.map((d) => {
      if (d.id === deptId) {
        return { ...d, classes: (d.classes || []).filter((c) => c.id !== classId) };
      }
      return d;
    });
    saveDepartmentsToBackend(updated);
  };

  // Branch CRUD
  const handleAddBranch = (deptId: string, classId: string) => {
    if (!newBranchName.trim()) return;
    const updated = departments.map((d) => {
      if (d.id === deptId) {
        const updatedClasses = (d.classes || []).map((c) => {
          if (c.id === classId) {
            const newBr: DepartmentBranch = {
              id: `br_${Date.now()}`,
              name: newBranchName.trim()
            };
            return { ...c, branches: [...(c.branches || []), newBr] };
          }
          return c;
        });
        return { ...d, classes: updatedClasses };
      }
      return d;
    });
    saveDepartmentsToBackend(updated);
    setNewBranchName('');
    setAddingBranchKey(null);
  };

  const handleUpdateBranchName = (deptId: string, classId: string, branchId: string) => {
    if (!branchNameInput.trim()) return;
    const updated = departments.map((d) => {
      if (d.id === deptId) {
        const updatedClasses = (d.classes || []).map((c) => {
          if (c.id === classId) {
            const updatedBranches = (c.branches || []).map((b) => (b.id === branchId ? { ...b, name: branchNameInput.trim() } : b));
            return { ...c, branches: updatedBranches };
          }
          return c;
        });
        return { ...d, classes: updatedClasses };
      }
      return d;
    });
    saveDepartmentsToBackend(updated);
    setEditingBranchKey(null);
  };

  const handleDeleteBranch = (deptId: string, classId: string, branchId: string) => {
    const updated = departments.map((d) => {
      if (d.id === deptId) {
        const updatedClasses = (d.classes || []).map((c) => {
          if (c.id === classId) {
            return { ...c, branches: (c.branches || []).filter((b) => b.id !== branchId) };
          }
          return c;
        });
        return { ...d, classes: updatedClasses };
      }
      return d;
    });
    saveDepartmentsToBackend(updated);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-gray-600 font-medium">বিভাগ ও শ্রেণি তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">মাদরাসার বিভাগ, শ্রেণি ও শাখা ব্যবস্থাপনা</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            মাদরাসার মূল ৫টি বিভাগ (নূরানী, মক্তব, হিফজ, কিতাব, ফতোয়া) সহ সকল জামাত ও শাখার পূর্ণ রূপরেখা অ্যাডমিন প্যানেল থেকে পরিবর্তন করুন।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            নতুন বিভাগ যোগ করুন
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm">
          <Check className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Department Tree List */}
      <div className="space-y-6">
        {departments.map((dept, index) => (
          <div key={dept.id} className="border border-emerald-950/10 rounded-2xl overflow-hidden shadow-xs">
            {/* Department Header */}
            <div className="bg-emerald-800/5 p-4 border-b border-emerald-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                {editingDeptId === dept.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={deptNameInput}
                      onChange={(e) => setDeptNameInput(e.target.value)}
                      className="px-3 py-1.5 border border-emerald-500 rounded-lg text-sm font-bold text-gray-900 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleUpdateDeptName(dept.id)}
                      disabled={saving}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingDeptId(null)}
                      className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{dept.classes?.length || 0} টি জামাত / শ্রেণি অন্তর্ভুক্ত</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAddingClassDeptId(dept.id);
                    setNewClassName('');
                  }}
                  className="flex items-center gap-1.5 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  শ্রেণি/জামাত যোগ করুন
                </button>
                <button
                  onClick={() => {
                    setEditingDeptId(dept.id);
                    setDeptNameInput(dept.name);
                  }}
                  className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                  title="নাম এডিট করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDepartment(dept.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="বিভাগ মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add Class Input Row */}
            {addingClassDeptId === dept.id && (
              <div className="p-3 bg-amber-50/50 border-b border-amber-200/60 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-700" />
                <input
                  type="text"
                  placeholder="নতুন শ্রেণি/জামাতের নাম লিখুন (যেমন: তাকমিল)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-amber-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-hidden"
                />
                <button
                  onClick={() => handleAddClass(dept.id)}
                  disabled={saving}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold"
                >
                  যোগ করুন
                </button>
                <button
                  onClick={() => setAddingClassDeptId(null)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                >
                  বাতিল
                </button>
              </div>
            )}

            {/* Classes List */}
            <div className="p-4 bg-gray-50/50 space-y-3">
              {(!dept.classes || dept.classes.length === 0) ? (
                <p className="text-xs text-gray-500 italic p-2">এই বিভাগে এখনও কোনো শ্রেণি বা জামাত যুক্ত করা হয়নি।</p>
              ) : (
                dept.classes.map((cls) => (
                  <div key={cls.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        {editingClassKey?.deptId === dept.id && editingClassKey?.classId === cls.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={classNameInput}
                              onChange={(e) => setClassNameInput(e.target.value)}
                              className="px-2.5 py-1 border border-emerald-500 rounded-md text-sm font-semibold"
                            />
                            <button
                              onClick={() => handleUpdateClassName(dept.id, cls.id)}
                              className="p-1 bg-emerald-600 text-white rounded-md"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingClassKey(null)}
                              className="p-1 bg-gray-200 text-gray-700 rounded-md"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-800 text-sm">{cls.name}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setAddingBranchKey({ deptId: dept.id, classId: cls.id });
                            setNewBranchName('');
                          }}
                          className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md font-medium"
                        >
                          + শাখা যোগ করুন
                        </button>
                        <button
                          onClick={() => {
                            setEditingClassKey({ deptId: dept.id, classId: cls.id });
                            setClassNameInput(cls.name);
                          }}
                          className="text-gray-400 hover:text-gray-700 p-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(dept.id, cls.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Add Branch Input */}
                    {addingBranchKey?.deptId === dept.id && addingBranchKey?.classId === cls.id && (
                      <div className="mb-2 p-2 bg-blue-50/60 rounded-lg flex items-center gap-2 text-xs">
                        <span className="font-semibold text-blue-900">শাখা:</span>
                        <input
                          type="text"
                          placeholder="শাখার নাম (যেমন: শাখা ক)"
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-blue-300 rounded-md bg-white text-gray-900"
                        />
                        <button
                          onClick={() => handleAddBranch(dept.id, cls.id)}
                          className="px-2.5 py-1 bg-blue-700 text-white rounded-md font-semibold"
                        >
                          যোগ
                        </button>
                        <button
                          onClick={() => setAddingBranchKey(null)}
                          className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md font-semibold"
                        >
                          বাতিল
                        </button>
                      </div>
                    )}

                    {/* Branches List Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 font-semibold">শাখাসমূহ:</span>
                      {(!cls.branches || cls.branches.length === 0) ? (
                        <span className="text-xs text-gray-400">কোনো শাখা নির্দিষ্ট করা নেই</span>
                      ) : (
                        cls.branches.map((b) => (
                          <div key={b.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors">
                            {editingBranchKey?.deptId === dept.id && editingBranchKey?.classId === cls.id && editingBranchKey?.branchId === b.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={branchNameInput}
                                  onChange={(e) => setBranchNameInput(e.target.value)}
                                  className="w-20 px-1 py-0.5 border border-emerald-500 rounded-xs bg-white text-xs"
                                />
                                <button
                                  onClick={() => handleUpdateBranchName(dept.id, cls.id, b.id)}
                                  className="text-emerald-700 font-bold"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setEditingBranchKey(null)}
                                  className="text-gray-500 font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <span>{b.name}</span>
                                <button
                                  onClick={() => {
                                    setEditingBranchKey({ deptId: dept.id, classId: cls.id, branchId: b.id });
                                    setBranchNameInput(b.name);
                                  }}
                                  className="text-gray-400 hover:text-gray-700"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBranch(dept.id, cls.id, b.id)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-700" />
                নতুন বিভাগ যুক্ত করুন
              </h3>
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  বিভাগের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ইফতা বিভাগ / সাধারণ শিক্ষা"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleAddDepartment}
                  disabled={!newDeptName.trim() || saving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

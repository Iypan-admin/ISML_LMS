// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: PROPOSE FEE STRUCTURE DRAWER
// Multi-College Selection, Course-Batch Mapping, Dynamic Items & Manual Installments Engine
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  IndianRupee,
  X,
  Plus,
  Trash2,
  Calendar,
  Layers,
  GraduationCap,
  ShieldCheck,
  Building2,
  Send,
  Coins,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  SplitSquareVertical,
  Percent,
  Clock,
  Wand2,
  Globe,
  Languages,
  Check,
} from 'lucide-react';
import { mockInstitutions, mockPrograms, mockBatches } from '@/mock/superAdminData';
import realDbCourses from '@/lib/realDbCourses.json';
import { financeProposalStore } from '@/services/financeProposalStore';
import { useToast } from '@/context/ToastContext';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';

const mockCourses = (realDbCourses as any[]);

export interface ProposeFeeStructureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  initialCourseId?: string;
}

export interface DynamicFeeLineItem {
  id: string;
  name: string;
  category: 'TUITION' | 'LAB' | 'EXAM' | 'FACILITY' | 'OTHER';
  amount: number;
  isMandatory: boolean;
}

export interface CustomInstallmentItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  duePeriodDescription: string;
}

const DEFAULT_LINE_ITEMS: DynamicFeeLineItem[] = [
  { id: 'item-1', name: 'Tuition Fee (Core Curriculum)', category: 'TUITION', amount: 35000, isMandatory: true },
  { id: 'item-2', name: 'Lab & Hands-On Studio Surcharge', category: 'LAB', amount: 7000, isMandatory: true },
  { id: 'item-3', name: 'Exam, CIA & Assessment Fee', category: 'EXAM', amount: 3500, isMandatory: true },
  { id: 'item-4', name: 'Campus Facility & Digital Learning Fund', category: 'FACILITY', amount: 2500, isMandatory: false },
];

export default function ProposeFeeStructureDrawer({
  isOpen,
  onClose,
  onSubmitted,
  initialCourseId,
}: ProposeFeeStructureDrawerProps) {
  const { showSuccess, showInfo, showError } = useToast();
  const { selectedCollegeId: contextCollegeId, institutions } = useCollege();

  // Find target course if initialCourseId provided
  const targetCourseFromProp = useMemo(() => {
    return initialCourseId ? mockCourses.find((c) => c.id === initialCourseId) : null;
  }, [initialCourseId]);

  // 1. College Selection (Dropdown inside form)
  const [drawerCollegeId, setDrawerCollegeId] = useState<string>(
    targetCourseFromProp?.collegeId ||
    (contextCollegeId === OVERALL_COLLEGE_ID ? institutions[0]?.id || 'inst-01' : contextCollegeId)
  );

  useEffect(() => {
    if (targetCourseFromProp?.collegeId) {
      setDrawerCollegeId(targetCourseFromProp.collegeId);
    } else if (contextCollegeId !== OVERALL_COLLEGE_ID) {
      setDrawerCollegeId(contextCollegeId);
    }
  }, [contextCollegeId, targetCourseFromProp]);

  const targetCollege = useMemo(() => {
    return institutions.find((inst) => inst.id === drawerCollegeId) || institutions[0];
  }, [drawerCollegeId, institutions]);

  // 2. Target Course Track Selection (Real DB Courses)
  const realCoursesList = (realDbCourses as any[]);
  const scopedCourses = useMemo(() => {
    return realCoursesList.filter((c: any) => {
      if (!drawerCollegeId) return true;
      return (
        c.collegeId === drawerCollegeId ||
        c.collegeName?.toLowerCase().includes(targetCollege?.name?.toLowerCase() || '')
      );
    });
  }, [realCoursesList, drawerCollegeId, targetCollege]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || scopedCourses[0]?.id || realCoursesList[0]?.id || ''
  );

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    } else if (scopedCourses.length > 0 && !scopedCourses.some((c) => c.id === selectedCourseId)) {
      setSelectedCourseId(scopedCourses[0].id);
    }
  }, [scopedCourses, initialCourseId]);

  const selectedCourse = useMemo(() => {
    return realCoursesList.find((c: any) => c.id === selectedCourseId) || scopedCourses[0] || realCoursesList[0];
  }, [selectedCourseId, scopedCourses, realCoursesList]);

  // Target Batch Cohort
  const availableBatches = useMemo(() => {
    return [
      { id: 'batch-amer-01', name: 'MRNG BATCH (The American College)', admissionYear: 2026, graduationYear: 2029 },
      { id: 'batch-siva-01', name: 'Sivakasi Lions French Cohort A', admissionYear: 2026, graduationYear: 2027 },
      { id: 'batch-gen-01', name: 'General Executive Morning Cohort', admissionYear: 2026, graduationYear: 2029 },
    ];
  }, []);

  const [batchId, setBatchId] = useState(availableBatches[0].id);

  const selectedBatch = useMemo(() => {
    return availableBatches.find((b) => b.id === batchId) || availableBatches[0];
  }, [batchId, availableBatches]);

  // Pre-fill fees when course changes
  useEffect(() => {
    if (selectedCourse) {
      const defaultTuition = selectedCourse.courseFee && selectedCourse.courseFee > 0 ? selectedCourse.courseFee : 14500;
      setComponents([
        { id: 'item-1', name: `Tuition Fee (${selectedCourse.name})`, category: 'TUITION', amount: defaultTuition, isMandatory: true },
        { id: 'item-2', name: 'Lab Studio & Phonetics Facility', category: 'LAB', amount: 3500, isMandatory: true },
        { id: 'item-3', name: 'Assessment & Certification Exam Fee', category: 'EXAM', amount: 2500, isMandatory: true },
        { id: 'item-4', name: 'AI LSRW Speaking Platform License', category: 'FACILITY', amount: 1500, isMandatory: false },
      ]);
    }
  }, [selectedCourseId]);

  // Dynamic Fee Components
  const [components, setComponents] = useState<DynamicFeeLineItem[]>(DEFAULT_LINE_ITEMS);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentAmount, setNewComponentAmount] = useState<number | ''>('');
  const [newComponentCategory, setNewComponentCategory] = useState<DynamicFeeLineItem['category']>('OTHER');
  const [showAddForm, setShowAddForm] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026–2027');

  // Dynamic Total Calculation
  const totalAmount = useMemo(() => {
    return components.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [components]);

  // 5. MANUAL & CUSTOMIZABLE INSTALLMENTS ENGINE
  const [isEmiEnabled, setIsEmiEnabled] = useState(true);
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(15);
  const [autoEqualSplitEnabled, setAutoEqualSplitEnabled] = useState<boolean>(true);
  const [emiTrancheCount, setEmiTrancheCount] = useState<number>(2);

  // Installments list (Allows user to edit amounts, dates, and manually add/remove installments)
  const [installments, setInstallments] = useState<CustomInstallmentItem[]>([
    {
      id: 'inst-1',
      title: 'Tranche 1 — Initial Admission Tranche',
      amount: 24000,
      dueDate: '2026-07-15',
      duePeriodDescription: 'Due at start of semester / enrollment',
    },
    {
      id: 'inst-2',
      title: 'Tranche 2 — Mid-Term Settlement',
      amount: 24000,
      dueDate: '2026-10-15',
      duePeriodDescription: 'Due prior to CIA-1 assessments window',
    },
  ]);

  // Pure function to generate perfectly equalized installments
  const calculateEqualInstallments = (count: number, total: number): CustomInstallmentItem[] => {
    if (total <= 0 || count <= 0) return [];
    const basePerTerm = Math.floor(total / count);
    const remainder = total - basePerTerm * (count - 1);

    return Array.from({ length: count }).map((_, idx) => {
      const isLast = idx === count - 1;
      const amt = isLast ? remainder : basePerTerm;
      const monthOffset = (idx + 1) * 2;
      const monthNum = Math.min(12, 6 + monthOffset);
      const formattedMonth = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;

      return {
        id: `inst-${idx + 1}`,
        title: `Tranche ${idx + 1} — ${
          idx === 0
            ? 'Initial Admission Tranche'
            : idx === count - 1
            ? 'Final Term Clearance'
            : `Term Installment ${idx + 1}`
        }`,
        amount: amt,
        dueDate: `2026-${formattedMonth}-15`,
        duePeriodDescription: `Installment tranche ${idx + 1} of ${count} (${Math.round(
          (amt / total) * 100
        )}% of total fee)`,
      };
    });
  };

  // Auto-distribute equally whenever user clicks "Auto Split" or count changes
  const handleAutoSplitInstallments = (count: number) => {
    setEmiTrancheCount(count);
    if (totalAmount <= 0) return;
    const generated = calculateEqualInstallments(count, totalAmount);
    setInstallments(generated);
    showSuccess(`Auto-calculated ${count} equal installments (₹${Math.floor(totalAmount / count).toLocaleString()} / tranche)!`);
  };

  // Whenever totalAmount changes (e.g. user adds or updates components), if autoEqualSplitEnabled is on, keep them equal automatically!
  useEffect(() => {
    if (autoEqualSplitEnabled && totalAmount > 0 && isEmiEnabled) {
      const currentCount = installments.length > 0 ? installments.length : emiTrancheCount;
      const rebalanced = calculateEqualInstallments(currentCount, totalAmount);
      setInstallments(rebalanced);
    }
  }, [totalAmount, autoEqualSplitEnabled, isEmiEnabled]);

  // Equalize Existing Installments Button Handler
  const handleEqualizeExistingInstallments = () => {
    if (installments.length === 0) return;
    const count = installments.length;
    const generated = calculateEqualInstallments(count, totalAmount);
    setInstallments(generated);
    showSuccess(`Recalculated all ${count} tranches into exact equal parts matching ₹${totalAmount.toLocaleString()}!`);
  };

  // Add Manual Installment
  const handleAddManualInstallment = () => {
    const nextCount = installments.length + 1;
    setEmiTrancheCount(nextCount);

    if (autoEqualSplitEnabled) {
      // If auto-equal is ON, instantly divide total fee equally among (N+1) tranches
      const equalized = calculateEqualInstallments(nextCount, totalAmount);
      setInstallments(equalized);
      showSuccess(`Added Tranche ${nextCount} & auto-divided fee equally (₹${Math.floor(totalAmount / nextCount).toLocaleString()} each).`);
    } else {
      // Manual mode: allocate remaining unallocated sum
      const currentSum = installments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
      const unallocated = Math.max(0, totalAmount - currentSum);

      const newInst: CustomInstallmentItem = {
        id: `inst-custom-${Date.now()}`,
        title: `Tranche ${nextCount} Installment`,
        amount: unallocated,
        dueDate: '2026-11-15',
        duePeriodDescription: 'Custom scheduled installment',
      };

      setInstallments((prev) => [...prev, newInst]);
      showInfo(`Added Tranche ${nextCount}. You can customize title, amount & due date.`);
    }
  };

  // Update specific installment
  const handleUpdateInstallment = (id: string, updates: Partial<CustomInstallmentItem>) => {
    // If user manually modifies amount, disable auto-equal lock so manual preference is respected
    if (updates.amount !== undefined) {
      setAutoEqualSplitEnabled(false);
    }
    setInstallments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Remove specific installment
  const handleRemoveInstallment = (id: string) => {
    if (installments.length <= 1) {
      showError('Schedule must contain at least one installment.');
      return;
    }
    const nextCount = installments.length - 1;
    setEmiTrancheCount(nextCount);

    if (autoEqualSplitEnabled) {
      const generated = calculateEqualInstallments(nextCount, totalAmount);
      setInstallments(generated);
      showInfo(`Removed tranche. Remaining ${nextCount} tranches auto-rebalanced equally.`);
    } else {
      setInstallments((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Check installment sum vs total fee
  const installmentsTotal = useMemo(() => {
    return installments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  }, [installments]);

  const installmentDifference = totalAmount - installmentsTotal;

  const [proposalNotes, setProposalNotes] = useState(
    'Configured semester schedule mapped to cohort courses, studio labs, and custom installment milestones.'
  );

  const handleUpdateAmount = (id: string, val: number) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, amount: Math.max(0, val) } : c))
    );
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length <= 1) {
      showError('Fee structure must contain at least one component.');
      return;
    }
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddNewComponent = () => {
    if (!newComponentName.trim()) {
      showError('Please specify a component name.');
      return;
    }
    if (!newComponentAmount || Number(newComponentAmount) <= 0) {
      showError('Please enter a valid amount.');
      return;
    }

    const newItem: DynamicFeeLineItem = {
      id: `item-${Date.now()}`,
      name: newComponentName.trim(),
      category: newComponentCategory,
      amount: Number(newComponentAmount),
      isMandatory: true,
    };

    setComponents((prev) => [...prev, newItem]);
    setNewComponentName('');
    setNewComponentAmount('');
    setShowAddForm(false);
    showSuccess(`Added "${newItem.name}" to fee schedule.`);
  };

  if (!isOpen) return null;

  const handleSubmitForApproval = (e: React.FormEvent) => {
    e.preventDefault();

    if (totalAmount <= 0) {
      showError('Total proposed fee must be greater than zero.');
      return;
    }

    if (isEmiEnabled && Math.abs(installmentDifference) > 0) {
      showError(
        `Installments sum (₹${installmentsTotal.toLocaleString()}) does not match Total Fee (₹${totalAmount.toLocaleString()}). Difference: ₹${installmentDifference.toLocaleString()}`
      );
      return;
    }

    const emiSummaryText = isEmiEnabled
      ? `Custom ${installments.length} Installments: [${installments.map((i) => `${i.title}: ₹${i.amount.toLocaleString()}`).join(', ')}]. Grace: ${gracePeriodDays} days.`
      : 'One-Time payment only (No EMI).';

    const courseDisplayName = selectedCourse?.name || 'Foreign Language Course';
    const courseDisplayCode = selectedCourse?.code || 'CRS';

    const diffPayload = [
      { fieldName: 'Target Campus', oldValue: 'Global', newValue: `${targetCollege?.name}` },
      { fieldName: 'Target Course Curriculum', oldValue: 'Standard', newValue: `${courseDisplayName} (${courseDisplayCode})` },
      ...components.map((c) => ({
        fieldName: c.name,
        oldValue: '₹0',
        newValue: `₹${c.amount.toLocaleString()}`,
      })),
      {
        fieldName: 'Manual Installment Plan',
        oldValue: 'Default Split',
        newValue: emiSummaryText,
      },
      {
        fieldName: 'Total Term Package Fee',
        oldValue: '₹0',
        newValue: `₹${totalAmount.toLocaleString()}`,
      },
    ];

    const impactText = `Total proposed fee is ₹${totalAmount.toLocaleString()} per student for ${courseDisplayName} (${selectedCourse?.duration || '90 Days'}) at ${targetCollege?.name}. Installment Schedule: ${emiSummaryText}. Requires Super Admin executive authorization before student ledgers are activated.`;

    const created = financeProposalStore.submitProposal({
      requestType: 'Fee Schedule Revision',
      entityType: 'FeeStructure',
      entityName: `${courseDisplayName} (${courseDisplayCode}) — [${targetCollege?.name}]`,
      submittedBy: {
        name: 'Finance Controller',
        email: 'finance@isml.edu',
        role: 'Finance Manager',
      },
      impactAnalysis: impactText,
      diff: diffPayload,
      payload: {
        courseId: selectedCourse?.id,
        courseName: courseDisplayName,
        courseCode: courseDisplayCode,
        collegeId: targetCollege?.id,
        collegeName: targetCollege?.name,
        totalAmount: totalAmount,
        components: components,
        installments: installments,
        isEmiEnabled: isEmiEnabled,
        gracePeriodDays: gracePeriodDays,
        proposalNotes: proposalNotes,
        diff: diffPayload,
        impactAnalysis: impactText,
      },
    });

    // Also persist directly into backend /api/portals/approvals database so Super Admin sees it live immediately
    fetch('/api/portals/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: created.id,
        requestType: 'FEE_SCHEDULE_CREATION',
        module: 'Finance',
        title: `Fee Schedule: ${courseDisplayName} (${courseDisplayCode})`,
        description: `Proposed tuition fee ₹${totalAmount.toLocaleString()} for ${courseDisplayName} at ${targetCollege?.name}.`,
        entityType: 'FeeStructure',
        entityId: selectedCourse?.id || `fee-${Date.now()}`,
        requestedByUserId: 'Campus Finance Controller',
        priority: 'HIGH',
        institutionId: targetCollege?.id || 'inst-01',
        courseId: selectedCourse?.id,
        totalAmount: totalAmount,
        components: components,
        installments: installments,
        diff: diffPayload,
        impactAnalysis: impactText,
        proposalNotes: proposalNotes,
      }),
    }).catch(() => null);

    showSuccess(`Proposal ${created.id} successfully dispatched to Super Admin Approval Center! Status: Pending Approval.`);
    if (onSubmitted) onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel container: 100vw and 100dvh on mobile with zero horizontal overflow */}
      <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[92vw] sm:max-w-3xl h-[100dvh] flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-x-hidden transform transition-transform ease-out duration-300 animate-in slide-in-from-right">
          {/* ─── Header ─── */}
          <div className="p-3.5 sm:p-5 bg-gradient-to-r from-[#061A36] via-[#092B5A] to-[#0D6257] text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-400/20 text-emerald-300 uppercase tracking-wider border border-emerald-400/30 inline-block">
                  Fee Schedule Configuration
                </span>
                <h2 className="text-sm sm:text-lg font-black text-white tracking-tight truncate mt-0.5">
                  {selectedCourse?.name || 'Course Fee Package'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ─── Form Body: strictly constrained x-axis to prevent mobile horizontal scrolling ─── */}
          <form onSubmit={handleSubmitForApproval} className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 space-y-4 sm:space-y-5 pb-24 sm:pb-6 w-full max-w-full">
            {/* ─── Target Course & Campus Card Context ─── */}
            <div className="p-4 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/50 border border-emerald-200/80 rounded-2xl shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wide uppercase">
                      Target Course
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                      Code: {selectedCourse?.code || 'CRS-01'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                      Duration: {selectedCourse?.duration || '90 Days'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {selectedCourse?.name || 'Selected Foreign Language Course'}
                  </h3>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Campus: <strong>{targetCollege?.name || 'The American College'}</strong></span>
                  </p>
                </div>
              </div>
            </div>

            {/* ─── 1. Fee Component Line Items ─── */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>1. Fee Component Line Items</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Component</span>
                </button>
              </div>

              {/* Add New Component Subform */}
              {showAddForm && (
                <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-sm space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 uppercase">
                      New Fee Component
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Component Name (e.g. Foreign Language Lab Fee)"
                        value={newComponentName}
                        onChange={(e) => setNewComponentName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Amount (INR)"
                        value={newComponentAmount}
                        onChange={(e) => setNewComponentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={newComponentCategory}
                      onChange={(e) => setNewComponentCategory(e.target.value as any)}
                      className="px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none"
                    >
                      <option value="TUITION">Tuition</option>
                      <option value="LAB">Lab / Studio</option>
                      <option value="EXAM">Examination</option>
                      <option value="FACILITY">Campus Fund</option>
                      <option value="OTHER">Other Custom Fee</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleAddNewComponent}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      Save Component
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Components List */}
              <div className="space-y-2">
                {components.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 break-words">{comp.name}</span>
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {comp.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      <div className="relative flex items-center">
                        <span className="text-slate-400 text-xs font-bold absolute left-2">₹</span>
                        <input
                          type="number"
                          value={comp.amount}
                          onChange={(e) => handleUpdateAmount(comp.id, Number(e.target.value))}
                          className="w-24 sm:w-28 pl-5 pr-2 py-1.5 text-xs font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-lg text-right outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(comp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete component"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Calculation Summary Bar */}
              <div className="mt-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                    Total Proposed Term Fee
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Sum of {components.length} Line Items • Dynamic Live Sum
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-black text-emerald-950">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 block">
                    Per Enrolled Student / Term
                  </span>
                </div>
              </div>
            </div>

            {/* ─── 5. MANUAL & CUSTOMIZABLE INSTALLMENTS ENGINE ─── */}
            <div className="p-4 bg-purple-50/60 border border-purple-200/90 rounded-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                    <SplitSquareVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                      2. Scheduled Installments & Manual Tranches
                    </h3>
                    <p className="text-[11px] text-purple-800">
                      Configure custom installment breakdown, due dates, or use quick auto-splits.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEmiEnabled}
                      onChange={(e) => setIsEmiEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              {isEmiEnabled && (
                <div className="space-y-3 pt-2 border-t border-purple-200/70">
                  {/* Auto-Equal Split Controls Bar */}
                  <div className="bg-white/80 p-3 rounded-xl border border-purple-200 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5">
                          <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>EMI Equal Split Engine:</span>
                        </span>
                        <div className="flex items-center gap-1.5 bg-purple-100/70 px-2 py-0.5 rounded-lg border border-purple-200">
                          <label className="text-[11px] font-bold text-purple-900 cursor-pointer flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={autoEqualSplitEnabled}
                              onChange={(e) => {
                                setAutoEqualSplitEnabled(e.target.checked);
                                if (e.target.checked) {
                                  handleEqualizeExistingInstallments();
                                }
                              }}
                              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span>Auto-Equalize Mode</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleEqualizeExistingInstallments}
                          className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-purple-300"
                          title="Rebalance existing tranches into equal amounts"
                        >
                          Equalize Now (₹{Math.floor(totalAmount / (installments.length || 1)).toLocaleString()} each)
                        </button>
                        <button
                          type="button"
                          onClick={handleAddManualInstallment}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Installment</span>
                        </button>
                      </div>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-purple-100 text-slate-600 text-[11px]">
                      <span className="font-semibold text-slate-500">Quick Equal Splits:</span>
                      <button
                        type="button"
                        onClick={() => handleAutoSplitInstallments(2)}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          installments.length === 2 && autoEqualSplitEnabled
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                        }`}
                      >
                        2 Equal Terms (₹{Math.floor(totalAmount / 2).toLocaleString()} × 2)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSplitInstallments(3)}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          installments.length === 3 && autoEqualSplitEnabled
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                        }`}
                      >
                        3 Trimesters (₹{Math.floor(totalAmount / 3).toLocaleString()} × 3)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSplitInstallments(4)}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          installments.length === 4 && autoEqualSplitEnabled
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                        }`}
                      >
                        4 Quarterly (₹{Math.floor(totalAmount / 4).toLocaleString()} × 4)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSplitInstallments(6)}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          installments.length === 6 && autoEqualSplitEnabled
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                        }`}
                      >
                        6 Bi-Monthly (₹{Math.floor(totalAmount / 6).toLocaleString()} × 6)
                      </button>
                    </div>
                  </div>

                  {/* Manual Editable Installments Cards List */}
                  <div className="space-y-2.5">
                    {installments.map((inst, index) => (
                      <div
                        key={inst.id}
                        className="p-2.5 sm:p-3 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[170px]">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={inst.title}
                              onChange={(e) => handleUpdateInstallment(inst.id, { title: e.target.value })}
                              placeholder="Installment Title (e.g. Term 1 Tranche)"
                              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-purple-600 outline-none w-full text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            <div className="relative flex items-center">
                              <span className="text-slate-400 text-xs font-bold absolute left-2">₹</span>
                              <input
                                type="number"
                                value={inst.amount}
                                onChange={(e) =>
                                  handleUpdateInstallment(inst.id, { amount: Math.max(0, Number(e.target.value)) })
                                }
                                className="w-24 sm:w-28 pl-5 pr-2 py-1 text-xs font-black text-purple-950 bg-purple-50/50 border border-purple-200 rounded-lg text-right outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveInstallment(inst.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Installment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Due Date & Description Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-500 font-semibold shrink-0">Due Date:</span>
                            <input
                              type="date"
                              value={inst.dueDate}
                              onChange={(e) => handleUpdateInstallment(inst.id, { dueDate: e.target.value })}
                              className="px-2 py-0.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 outline-none cursor-pointer w-full min-w-0"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={inst.duePeriodDescription}
                              onChange={(e) =>
                                handleUpdateInstallment(inst.id, { duePeriodDescription: e.target.value })
                              }
                              placeholder="Remarks (e.g. Due before CIA-1)"
                              className="px-2 py-0.5 text-[11px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 outline-none w-full min-w-0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Installment Validation Status Pill */}
                  <div
                    className={`p-2.5 sm:p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs font-bold transition-all ${
                      installmentDifference === 0
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      {installmentDifference === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="text-[11px] sm:text-xs">
                        {installmentDifference === 0
                          ? `All ${installments.length} Balanced (₹${installmentsTotal.toLocaleString()})`
                          : `Difference: ${installmentDifference > 0 ? `₹${installmentDifference.toLocaleString()} Remaining` : `Over-allocated by ₹${Math.abs(installmentDifference).toLocaleString()}`}`}
                      </span>
                    </div>

                    <div className="text-right ml-auto">
                      <span className="text-xs sm:text-sm font-black">
                        ₹{installmentsTotal.toLocaleString()} / ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Proposal Notes for Super Admin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Justification & Notes for Super Admin
              </label>
              <textarea
                rows={2}
                value={proposalNotes}
                onChange={(e) => setProposalNotes(e.target.value)}
                placeholder="Specify reasons for this schedule revision..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none resize-none"
              />
            </div>

            {/* Governance Alert */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Approval Enforcement & Audit Control</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Submitting this proposal will log it into the <strong>Super Admin Approval Center</strong> as <code>SUBMITTED</code> for {targetCollege?.name}. Batches will only be billed once Super Admin authorizes the package and manual installment tranches.
              </p>
            </div>
          </form>

          {/* ─── Fixed Bottom Action Footer: Always pinned and touch-friendly on mobile & desktop ─── */}
          <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between gap-2 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
            <div className="min-w-0 pr-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Proposal
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-950 truncate block">
                ₹{totalAmount.toLocaleString()} • {installments.length} Tranches
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmitForApproval(e as any)}
                className="px-3.5 sm:px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Approval</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

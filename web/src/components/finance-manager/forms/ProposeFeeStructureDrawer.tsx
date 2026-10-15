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
import { mockInstitutions, mockPrograms, mockBatches, mockCourses } from '@/mock/superAdminData';
import { financeProposalStore } from '@/services/financeProposalStore';
import { useToast } from '@/context/ToastContext';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';

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

  // 2. Program Selection
  const [programId, setProgramId] = useState(mockPrograms[0]?.id || 'prog-bsc-cs');

  // Filter batches matching target college & program
  const availableBatches = useMemo(() => {
    const list = mockBatches.filter((b) => {
      const matchesProgram = b.programId === programId;
      const matchesCollege = b.institutionId === drawerCollegeId;
      return matchesProgram && matchesCollege;
    });
    if (list.length > 0) return list;
    return mockBatches.filter((b) => b.programId === programId);
  }, [programId, drawerCollegeId]);

  const [batchId, setBatchId] = useState(availableBatches[0]?.id || mockBatches[0].id);

  useEffect(() => {
    if (availableBatches.length > 0) {
      setBatchId(availableBatches[0].id);
    }
  }, [programId, drawerCollegeId, availableBatches]);

  const selectedBatch = useMemo(() => {
    return mockBatches.find((b) => b.id === batchId) || availableBatches[0] || mockBatches[0];
  }, [batchId, availableBatches]);

  // 3. Mapped Courses for this Batch
  const mappedCourses = useMemo(() => {
    if (!selectedBatch) return [];
    if (selectedBatch.courseIds && selectedBatch.courseIds.length > 0) {
      const bCourseIds = selectedBatch.courseIds;
      return mockCourses.filter((c) => bCourseIds.includes(c.id));
    }
    return mockCourses.filter(
      (c) => c.program === selectedBatch.programName || c.semester === selectedBatch.currentSemesterNumber
    );
  }, [selectedBatch]);

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  useEffect(() => {
    if (targetCourseFromProp) {
      setSelectedCourseIds([targetCourseFromProp.id]);
      if (targetCourseFromProp.courseFee) {
        setComponents([
          { id: 'item-1', name: `Tuition Fee (${targetCourseFromProp.name})`, category: 'TUITION', amount: targetCourseFromProp.courseFee, isMandatory: true },
          { id: 'item-2', name: 'Lab & Learning Resource Material', category: 'LAB', amount: 3500, isMandatory: true },
          { id: 'item-3', name: 'Assessment & Certification Fee', category: 'EXAM', amount: 2500, isMandatory: true },
        ]);
      }
    } else if (mappedCourses.length > 0) {
      setSelectedCourseIds(mappedCourses.map((c) => c.id));
    } else {
      setSelectedCourseIds([]);
    }
  }, [mappedCourses, targetCourseFromProp]);

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // 4. Dynamic Fee Components
  const [components, setComponents] = useState<DynamicFeeLineItem[]>(DEFAULT_LINE_ITEMS);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentAmount, setNewComponentAmount] = useState<number | ''>('');
  const [newComponentCategory, setNewComponentCategory] = useState<DynamicFeeLineItem['category']>('OTHER');
  const [showAddForm, setShowAddForm] = useState(false);

  // Term, Course Model & Duration Metadata (Support for 3-Month, 6-Month, 1-Year Language Programs)
  const [courseStructureType, setCourseStructureType] = useState<'DURATION_BASED' | 'SEMESTER_BASED'>('DURATION_BASED');
  const [durationType, setDurationType] = useState<'3_MONTHS' | '6_MONTHS' | '1_YEAR' | 'CUSTOM'>('3_MONTHS');
  const [customDurationMonths, setCustomDurationMonths] = useState<number>(3);
  const [targetLanguage, setTargetLanguage] = useState<string>('French (DELF A1/A2)');
  const [semesterNumber, setSemesterNumber] = useState(selectedBatch?.currentSemesterNumber || 1);
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

  const selectedProgram = mockPrograms.find((p) => p.id === programId) || mockPrograms[0];

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

    const courseNamesList = mockCourses
      .filter((c) => selectedCourseIds.includes(c.id))
      .map((c) => c.name);

    const durationLabel =
      courseStructureType === 'DURATION_BASED'
        ? durationType === '3_MONTHS'
          ? '3 Months (Intensive Track)'
          : durationType === '6_MONTHS'
          ? '6 Months (Diploma Track)'
          : durationType === '1_YEAR'
          ? '1 Year (Mastery Track)'
          : `${customDurationMonths} Months (Custom)`
        : `Semester ${semesterNumber}`;

    const emiSummaryText = isEmiEnabled
      ? `Custom ${installments.length} Installments: [${installments.map((i) => `${i.title}: ₹${i.amount.toLocaleString()}`).join(', ')}]. Grace: ${gracePeriodDays} days.`
      : 'One-Time payment only (No EMI).';

    const created = financeProposalStore.submitProposal({
      requestType: 'Fee Schedule Revision',
      entityType: 'FeeStructure',
      entityName: `${selectedProgram?.name} — ${selectedBatch?.name} (${durationLabel}) [${targetCollege?.name}]`,
      submittedBy: {
        name: 'Finance Controller',
        email: 'finance@isml.edu',
        role: 'Finance Manager',
      },
      impactAnalysis: `Total proposed fee is ₹${totalAmount.toLocaleString()} per student for ${selectedProgram?.name} (${durationLabel} - ${targetLanguage}) across ${selectedBatch?.name} at ${targetCollege?.name}. Mapped to ${selectedCourseIds.length} course curricula. Installment Schedule: ${emiSummaryText}. Requires Super Admin executive authorization.`,
      diff: [
        { fieldName: 'Campus', oldValue: 'Global', newValue: `${targetCollege?.name}` },
        { fieldName: 'Course Curriculum Track', oldValue: 'Standard', newValue: targetLanguage },
        { fieldName: 'Program Model', oldValue: 'Semester-Based', newValue: courseStructureType === 'DURATION_BASED' ? 'Duration / Term Based' : 'Semester-Based' },
        { fieldName: 'Duration / Term Cycle', oldValue: 'Semester', newValue: durationLabel },
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
          fieldName: 'Total Term Package',
          oldValue: 'Previous Schedule',
          newValue: `₹${totalAmount.toLocaleString()}`,
        },
      ],
    });

    showSuccess(`Proposal ${created.id} successfully dispatched to Super Admin Approval Center!`);
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
                  Campus Finance Proposal
                </span>
                <h2 className="text-sm sm:text-lg font-black text-white tracking-tight truncate mt-0.5">
                  Fee Schedule, Course-Batch & Installments
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
            {/* ─── 1. College Selection Bar (Dropdown) ─── */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Select College / Institutional Campus</span>
                </label>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Campus Scoped
                </span>
              </div>

              <select
                value={drawerCollegeId}
                onChange={(e) => setDrawerCollegeId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 outline-none shadow-2xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.name} ({inst.code}) — {inst.address}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-emerald-800">
                Fee schedules and customized installment tranches will be assigned exclusively to this campus.
              </p>
            </div>

            {/* ─── 2. Academic Scope: Course Track, Duration Model & Cohort Identification ─── */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-600" />
                  <span>2. Course Model, Language Track & Duration Cycle</span>
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {courseStructureType === 'DURATION_BASED' ? 'Duration-Based (Non-Semester)' : 'Semester-Based'}
                </span>
              </div>

              {/* Course Model Selector (Foreign Language Duration-Based vs Semester) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Course Delivery Architecture
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCourseStructureType('DURATION_BASED')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      courseStructureType === 'DURATION_BASED'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs">Duration-Based (Language Course)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">
                      Configured in 3-Month, 6-Month, or 1-Year certification tracks
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCourseStructureType('SEMESTER_BASED')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      courseStructureType === 'SEMESTER_BASED'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span className="text-xs">Regular Semester-Based</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">
                      Traditional 6-month university term (Sem 1 to Sem 8)
                    </p>
                  </button>
                </div>
              </div>

              {/* Duration-Based Specific Configuration (3M, 6M, 1Y) */}
              {courseStructureType === 'DURATION_BASED' && (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Select Course Duration Window</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Language Cycle
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: '3_MONTHS', label: '3 Months', sub: 'Crash / A1 Foundation' },
                      { type: '6_MONTHS', label: '6 Months', sub: 'Diploma / A2-B1 Track' },
                      { type: '1_YEAR', label: '1 Year', sub: 'Mastery / Advanced B2-C1' },
                    ].map((pill) => {
                      const isSelected = durationType === pill.type;
                      return (
                        <button
                          key={pill.type}
                          type="button"
                          onClick={() => setDurationType(pill.type as any)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs font-black">{pill.label}</div>
                          <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {pill.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Foreign Language Target & Track */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Foreign Language Program Track
                      </label>
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="French (DELF A1/A2/B1/B2)">🇫🇷 French (DELF Certification)</option>
                        <option value="German (Goethe-Zertifikat A1/A2/B1)">🇩🇪 German (Goethe-Institut)</option>
                        <option value="Japanese (JLPT N5/N4/N3)">🇯🇵 Japanese (JLPT Official Track)</option>
                        <option value="Spanish (DELE A1/A2/B1)">🇪🇸 Spanish (DELE Instituto Cervantes)</option>
                        <option value="Mandarin Chinese (HSK 1/2/3)">🇨🇳 Mandarin Chinese (HSK)</option>
                        <option value="Korean (TOPIK I/II)">🇰🇷 Korean (TOPIK Track)</option>
                        <option value="Arabic & Middle East Studies">🇦🇪 Arabic (Professional CEFR)</option>
                        <option value="Italian Language & Culture">🇮🇹 Italian (CILS Certification)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Academic Cycle Year
                      </label>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g. 2026–2027"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Target Language Cohort / Batch */}
              <div className="pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Language Cohort / Student Batch *
                  </label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {availableBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.admissionYear}–{b.graduationYear})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Fee structure and installment schedules apply directly to students enrolled in this language cohort.
                  </p>
                </div>
              </div>

              {/* Semester Fallback for Semester-Based Mode */}
              {courseStructureType === 'SEMESTER_BASED' && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Semester Number</label>
                    <select
                      value={semesterNumber}
                      onChange={(e) => setSemesterNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ─── 3. Course Mapping for this Batch ─── */}
            <div className="p-4 bg-blue-50/40 border border-blue-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0052CC]" />
                  <span>3. Mapped Courses for this Term</span>
                </h3>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded">
                  {selectedCourseIds.length} of {mappedCourses.length} Courses Linked
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Fees configured below will apply to students enrolled in these batch-specific course curricula.
              </p>

              {mappedCourses.length === 0 ? (
                <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs text-slate-500 text-center">
                  No courses currently assigned to this batch. Select another cohort or add courses in Academic Master.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {mappedCourses.map((crs) => {
                    const isSelected = selectedCourseIds.includes(crs.id);
                    return (
                      <div
                        key={crs.id}
                        onClick={() => toggleCourseSelection(crs.id)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-[#0052CC] shadow-2xs font-bold text-slate-900'
                            : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-[#0052CC] focus:ring-0 cursor-pointer"
                          />
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {crs.code}
                          </span>
                          <span className="truncate">{crs.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[11px]">
                          <span className="text-slate-400">{crs.credits || 4} Credits</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                            Sem {crs.semester}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── 4. Dynamic Fee Components & Calculation Engine ─── */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>4. Fee Component Line Items</span>
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
                      5. Scheduled Installments & Manual Tranches
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

// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: BULK PAYMENT & CHALLAN ENTRY DRAWER
// Multi-Student Batch Deposit, CMS Challan / Direct NEFT / Online Gateway Batch,
// Cascading Hierarchy: College -> Department -> Course -> Batch -> Multi-Student Select
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  X,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Layers,
  UploadCloud,
  FileText,
  DollarSign,
  UserCheck,
  GraduationCap,
  BookOpen,
  CreditCard,
  QrCode,
  Check,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';
import {
  mockInstitutions,
  mockDepartments,
  mockCourses,
  mockBatches,
  mockStudents,
} from '@/mock/superAdminData';
import { TransactionRecord } from '@/mock/financeManagerData';

interface BulkChallanEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tx: TransactionRecord) => void;
}

export default function BulkChallanEntryDrawer({
  isOpen,
  onClose,
  onCreated,
}: BulkChallanEntryDrawerProps) {
  const { showSuccess, showError } = useToast();
  const { selectedCollegeId: contextCollegeId, institutions } = useCollege();

  // 1. College Selection
  const [selectedCollege, setSelectedCollege] = useState<string>(
    contextCollegeId === OVERALL_COLLEGE_ID ? institutions[0]?.id || 'inst-01' : contextCollegeId
  );

  // 2. Department Selection (filtered by selected College)
  const availableDepartments = useMemo(() => {
    return mockDepartments.filter((d) => !d.institutionId || d.institutionId === selectedCollege);
  }, [selectedCollege]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    availableDepartments[0]?.name || ''
  );

  useEffect(() => {
    if (availableDepartments.length > 0) {
      setSelectedDepartment(availableDepartments[0].name);
    } else {
      setSelectedDepartment('');
    }
  }, [selectedCollege, availableDepartments]);

  // 3. Course Selection (filtered by College & Department)
  const availableCourses = useMemo(() => {
    return mockCourses.filter((c) => {
      const matchCol = !c.collegeId || c.collegeId === selectedCollege;
      const matchDept =
        !selectedDepartment ||
        c.department.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
        selectedDepartment.toLowerCase().includes(c.department.toLowerCase());
      return matchCol && matchDept;
    });
  }, [selectedCollege, selectedDepartment]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    availableCourses[0]?.id || ''
  );

  useEffect(() => {
    if (availableCourses.length > 0) {
      setSelectedCourseId(availableCourses[0].id);
    } else {
      setSelectedCourseId('');
    }
  }, [availableCourses]);

  const activeCourse = useMemo(() => {
    return mockCourses.find((c) => c.id === selectedCourseId) || availableCourses[0];
  }, [selectedCourseId, availableCourses]);

  // 4. Batch Selection (filtered by College / activeCourse)
  const availableBatches = useMemo(() => {
    return mockBatches.filter((b) => {
      const matchCol = !b.institutionId || b.institutionId === selectedCollege;
      if (activeCourse?.batchIds && activeCourse.batchIds.length > 0) {
        return matchCol && activeCourse.batchIds.includes(b.id);
      }
      return matchCol;
    });
  }, [selectedCollege, activeCourse]);

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    availableBatches[0]?.id || ''
  );

  useEffect(() => {
    if (availableBatches.length > 0) {
      setSelectedBatchId(availableBatches[0].id);
    } else {
      setSelectedBatchId('');
    }
  }, [availableBatches]);

  // 5. Students Selection (filtered by College & Batch/Course)
  const availableStudents = useMemo(() => {
    const list = mockStudents.filter((s) => {
      const matchCol = !s.collegeId || s.collegeId === selectedCollege;
      const matchBatch = !selectedBatchId || s.batchId === selectedBatchId;
      return matchCol && matchBatch;
    });
    if (list.length > 0) return list;
    return mockStudents.filter((s) => !s.collegeId || s.collegeId === selectedCollege);
  }, [selectedCollege, selectedBatchId]);

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (availableStudents.length > 0) {
      setSelectedStudentIds(availableStudents.slice(0, 3).map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  }, [availableStudents]);

  // Payment Channel Mode (Offline vs Online)
  const [paymentCategory, setPaymentCategory] = useState<'OFFLINE' | 'ONLINE'>('OFFLINE');
  const [paymentMethod, setPaymentMethod] = useState<
    'BANK_CHALLAN' | 'DEMAND_DRAFT' | 'CASH' | 'NEFT_RTGS' | 'UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'DEBIT_CARD'
  >('BANK_CHALLAN');

  // Bank & Settlement details
  const [bankName, setBankName] = useState('HDFC Bank Corporate CMS');
  const [branchName, setBranchName] = useState('College Campus Branch');
  const [refNumber, setRefNumber] = useState(
    `CHL-BULK-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [depositDate, setDepositDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedProofFile, setSelectedProofFile] = useState<string | null>(
    'Bank_Stamped_Challan_Copy.pdf'
  );

  const unitFeePerStudent = activeCourse?.courseFee || 14500;

  const totalAmount = useMemo(() => {
    return selectedStudentIds.length * unitFeePerStudent;
  }, [selectedStudentIds, unitFeePerStudent]);

  if (!isOpen) return null;

  const isOnlineMode = ['UPI', 'NET_BANKING', 'CREDIT_CARD', 'DEBIT_CARD'].includes(paymentMethod);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === availableStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(availableStudents.map((s) => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      showError('Please select at least one student for this bulk deposit.');
      return;
    }
    if (!refNumber.trim()) {
      showError('Reference number / Challan number is required.');
      return;
    }

    const colObj = mockInstitutions.find((i) => i.id === selectedCollege) || mockInstitutions[0];
    const programTitle = activeCourse ? activeCourse.name : 'College Course Program';

    const newTx: TransactionRecord = {
      id: `tx-bulk-${Date.now().toString().slice(-4)}`,
      receiptNo: `RCP-${isOnlineMode ? 'ONL-BULK' : 'BULK'}-${Date.now().toString().slice(-6)}`,
      studentId: `BATCH-${selectedStudentIds.length}`,
      studentName: `${programTitle} Batch (${selectedStudentIds.length} Students)`,
      rollNo: `COHORT-${selectedStudentIds.length}-PAID`,
      collegeId: colObj.id,
      collegeName: colObj.name,
      program: programTitle,
      semester: 1,
      amount: totalAmount,
      paymentMethod,
      channelType: isOnlineMode ? 'RAZORPAY_GATEWAY' : 'BANK_CHALLAN_BULK',
      gatewayRef: `${bankName.substring(0, 4)}-${refNumber.trim()}`,
      status: isOnlineMode ? 'SUCCESS' : 'PENDING',
      timestamp: new Date().toISOString(),
      remarks: `Bulk ${isOnlineMode ? 'Online payment' : 'Bank Challan deposit'} submitted for ${selectedStudentIds.length} students at ${branchName}.`,
      requiresFinanceApproval: !isOnlineMode,
      approvalStatus: isOnlineMode ? 'APPROVED' : 'PENDING',
      challanNumber: refNumber.trim(),
      bankBranchName: branchName,
      depositDate,
      isBulkChallanBatch: true,
      bulkBatchCode: `CMS-BATCH-${Date.now().toString().slice(-5)}`,
      bulkStudentCount: selectedStudentIds.length,
      offlineProofDocument: selectedProofFile || undefined,
    };

    onCreated(newTx);
    showSuccess(
      `Bulk ${isOnlineMode ? 'Online Payment' : 'Challan'} (${refNumber}) for ₹${totalAmount.toLocaleString()} (${selectedStudentIds.length} students) recorded!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[92vw] sm:max-w-2xl h-[100dvh] flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-x-hidden transform transition-transform ease-out duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#061A36] via-[#0B2C56] to-[#0D6257] text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-teal-400/20 text-teal-300 uppercase tracking-wider border border-teal-400/30 inline-block">
                  Campus Bank CMS & Bulk Payment
                </span>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Record Bulk Deposit (Offline & Online)
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* ── 1. Cascading Academic Hierarchy: College -> Dept -> Course -> Batch ── */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  Target Campus, Department & Course Hierarchy
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  Cascading Filter
                </span>
              </div>

              {/* 1. College / Campus */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>1. College / Institution Campus</span>
                </label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                >
                  {mockInstitutions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Department */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  <span>2. Department</span>
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                >
                  {availableDepartments.length === 0 ? (
                    <option value="">No departments available</option>
                  ) : (
                    availableDepartments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} ({dept.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 3. Course */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>3. Course</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                >
                  {availableCourses.length === 0 ? (
                    <option value="">No courses found in this department</option>
                  ) : (
                    availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) • Fee: ₹{(c.courseFee || 0).toLocaleString()} / Student
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 4. Batch / Cohort */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>4. Batch / Cohort</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                >
                  {availableBatches.length === 0 ? (
                    <option value="">No batches for this course</option>
                  ) : (
                    availableBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (AY {b.admissionYear}–{b.graduationYear})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* ── 2. Payment Channel Mode: Offline & Online switcher ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Bulk Payment Mode Channel
                </label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentCategory('OFFLINE');
                      setPaymentMethod('BANK_CHALLAN');
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      paymentCategory === 'OFFLINE'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Offline Modes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentCategory('ONLINE');
                      setPaymentMethod('UPI');
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      paymentCategory === 'ONLINE'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Online Modes
                  </button>
                </div>
              </div>

              {/* Mode Options Grid */}
              {paymentCategory === 'OFFLINE' ? (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BANK_CHALLAN', label: 'Single / Bulk Bank Challan', desc: 'Direct CMS Bank deposit slip' },
                    { id: 'DEMAND_DRAFT', label: 'Consolidated Demand Draft (DD)', desc: 'Payable to institution' },
                    { id: 'NEFT_RTGS', label: 'Direct NEFT / RTGS Remittance', desc: 'Bank transfer counter entry' },
                    { id: 'CASH', label: 'Consolidated Cash at Counter', desc: 'Accounts department physical cash' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === mode.id
                          ? 'border-teal-600 bg-teal-50/90 text-teal-950 ring-1 ring-teal-600'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'UPI', label: 'Bulk UPI / QR Pay Batch', desc: 'Consolidated UPI / Corporate QR' },
                    { id: 'NET_BANKING', label: 'Net Banking IMPS / Corporate CMS', desc: 'E-Banking multi-student batch' },
                    { id: 'CREDIT_CARD', label: 'POS / Corporate Card Swipe', desc: 'Terminal / Gateway card settlement' },
                    { id: 'DEBIT_CARD', label: 'Debit Card Portal Settlement', desc: 'RuPay / Visa / Mastercard batch' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === mode.id
                          ? 'border-blue-600 bg-blue-50/90 text-blue-950 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── 3. Deposit & Reference Details Grid ── */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-teal-600" />
                <span>
                  {isOnlineMode
                    ? 'Online Gateway / Banking Settlement Details'
                    : 'Bank Deposit & Stamped Challan Details'}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isOnlineMode ? 'Bank / Gateway Provider' : 'Deposited Bank Name / Portal'}
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                  >
                    <option value="HDFC Bank Corporate CMS">HDFC Bank Corporate CMS</option>
                    <option value="State Bank of India (SBI) PowerJyoti">State Bank of India (SBI) PowerJyoti</option>
                    <option value="Indian Overseas Bank (IOB)">Indian Overseas Bank (IOB)</option>
                    <option value="Canara Bank Collect">Canara Bank Collect</option>
                    <option value="ICICI Bank E-Challan">ICICI Bank E-Challan</option>
                    <option value="Razorpay Corporate Gateway">Razorpay Corporate Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isOnlineMode ? 'Processing Branch / Portal Desk' : 'Bank Branch Name & City'}
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Nungambakkam Branch, Chennai"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isOnlineMode
                      ? 'UTR Ref / Gateway Batch Order ID'
                      : 'Stamped Challan / Journal / DD Ref'}
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder={isOnlineMode ? 'e.g. UTR-HDFC-99120488' : 'e.g. CHL-HDFC-991204'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Date of Payment / Settlement
                  </label>
                  <input
                    type="date"
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Upload Proof Copy */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Upload Stamped Challan Counterfoil / Bank Statement / Gateway Receipt
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-slate-700">
                      {selectedProofFile || 'No file selected'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProofFile(`Settlement_Proof_${Date.now().toString().slice(-4)}.pdf`)
                    }
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg cursor-pointer"
                  >
                    Select Proof PDF
                  </button>
                </div>
              </div>
            </div>

            {/* ── 4. Select Students Cohort ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span>Select Students in Batch ({availableStudents.length} Available)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Checked students will have their fees cleared upon submission. Fee per student: ₹{unitFeePerStudent.toLocaleString()}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  {selectedStudentIds.length === availableStudents.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {availableStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No students found for this College, Department, Course and Batch combination.
                  </div>
                ) : (
                  availableStudents.map((std) => {
                    const isChecked = selectedStudentIds.includes(std.id);

                    return (
                      <div
                        key={std.id}
                        onClick={() => toggleStudent(std.id)}
                        className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-teal-50/70 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div click
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{std.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {std.studentId} • {std.departmentName || std.programName}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-900">
                            ₹{unitFeePerStudent.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-slate-400">Course Fee</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── 5. Total Summary Footer Box ── */}
            <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                  Total {isOnlineMode ? 'Online' : 'Challan'} Batch Amount ({selectedStudentIds.length} Students)
                </span>
                <span className="text-xl font-black text-teal-950">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  isOnlineMode
                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {isOnlineMode ? '⚡ Instant Gateway Reconciled' : '⏳ Awaiting Treasury Verification'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit {isOnlineMode ? 'Online Batch' : 'Bulk Challan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

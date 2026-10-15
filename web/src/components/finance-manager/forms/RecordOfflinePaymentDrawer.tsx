// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: RECORD OFFLINE PAYMENT DRAWER
// Counter Cash, Demand Draft, Single Challan, Bank Transfer Verification
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Coins,
  X,
  CreditCard,
  Building2,
  CheckCircle2,
  FileText,
  UserCheck,
  Receipt,
  FileCheck2,
  GraduationCap,
  BookOpen,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';
import { mockStudentFees, TransactionRecord } from '@/mock/financeManagerData';
import {
  mockInstitutions,
  mockDepartments,
  mockCourses,
  mockBatches,
  mockStudents,
} from '@/mock/superAdminData';

interface RecordOfflinePaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tx: TransactionRecord) => void;
}

export default function RecordOfflinePaymentDrawer({
  isOpen,
  onClose,
  onCreated,
}: RecordOfflinePaymentDrawerProps) {
  const { showSuccess, showError } = useToast();
  const { selectedCollegeId: contextCollegeId, institutions } = useCollege();

  // 1. College Selection
  const [selectedCollege, setSelectedCollege] = useState<string>(
    contextCollegeId === OVERALL_COLLEGE_ID ? institutions[0]?.id || 'inst-01' : contextCollegeId
  );

  // 2. Department Selection (filtered by selected College)
  const availableDepartments = React.useMemo(() => {
    return mockDepartments.filter((d) => !d.institutionId || d.institutionId === selectedCollege);
  }, [selectedCollege]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    availableDepartments[0]?.name || ''
  );

  React.useEffect(() => {
    if (availableDepartments.length > 0) {
      setSelectedDepartment(availableDepartments[0].name);
    } else {
      setSelectedDepartment('');
    }
  }, [selectedCollege, availableDepartments]);

  // 3. Course Selection (filtered by College & Department)
  const availableCourses = React.useMemo(() => {
    return mockCourses.filter((c) => {
      const matchCol = !c.collegeId || c.collegeId === selectedCollege;
      const matchDept = !selectedDepartment || c.department.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
        selectedDepartment.toLowerCase().includes(c.department.toLowerCase());
      return matchCol && matchDept;
    });
  }, [selectedCollege, selectedDepartment]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    availableCourses[0]?.id || ''
  );

  React.useEffect(() => {
    if (availableCourses.length > 0) {
      setSelectedCourseId(availableCourses[0].id);
    } else {
      setSelectedCourseId('');
    }
  }, [availableCourses]);

  const activeCourse = React.useMemo(() => {
    return mockCourses.find((c) => c.id === selectedCourseId) || availableCourses[0];
  }, [selectedCourseId, availableCourses]);

  // 4. Batch Selection (filtered by College / activeCourse)
  const availableBatches = React.useMemo(() => {
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

  React.useEffect(() => {
    if (availableBatches.length > 0) {
      setSelectedBatchId(availableBatches[0].id);
    } else {
      setSelectedBatchId('');
    }
  }, [availableBatches]);

  // 5. Students Selection (filtered by College & Batch/Course)
  const availableStudents = React.useMemo(() => {
    const list = mockStudents.filter((s) => {
      const matchCol = !s.collegeId || s.collegeId === selectedCollege;
      const matchBatch = !selectedBatchId || s.batchId === selectedBatchId;
      return matchCol && matchBatch;
    });
    if (list.length > 0) return list;
    return mockStudents.filter((s) => !s.collegeId || s.collegeId === selectedCollege);
  }, [selectedCollege, selectedBatchId]);

  const [studentId, setStudentId] = useState(availableStudents[0]?.id || '');

  React.useEffect(() => {
    if (availableStudents.length > 0) {
      setStudentId(availableStudents[0].id);
    } else {
      setStudentId('');
    }
  }, [availableStudents]);

  const selectedStudent = React.useMemo(() => {
    return availableStudents.find((s) => s.id === studentId) || availableStudents[0];
  }, [studentId, availableStudents]);

  // Form inputs
  const [paymentCategory, setPaymentCategory] = useState<'OFFLINE' | 'ONLINE'>('OFFLINE');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'DEMAND_DRAFT' | 'BANK_CHALLAN' | 'NEFT_RTGS' | 'UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'DEBIT_CARD'>('CASH');
  const [amount, setAmount] = useState<number>(activeCourse?.courseFee || 14500);
  const [refNumber, setRefNumber] = useState('');
  const [remarks, setRemarks] = useState('Direct student fee payment settlement.');
  const [proofDocument, setProofDocument] = useState<string | null>('Counter_Voucher_Copy.pdf');

  React.useEffect(() => {
    if (activeCourse?.courseFee) {
      setAmount(activeCourse.courseFee);
    }
  }, [activeCourse]);

  if (!isOpen) return null;

  const isOnlineMode = ['UPI', 'NET_BANKING', 'CREDIT_CARD', 'DEBIT_CARD'].includes(paymentMethod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      showError('Please enter a valid amount.');
      return;
    }

    if (!selectedStudent) {
      showError('Please select a student account.');
      return;
    }

    const prefix = isOnlineMode ? 'ONL' : 'OFF';
    const genReceipt = `RCP-${prefix}-${Date.now().toString().slice(-6)}`;
    const finalRef = refNumber.trim() || `${paymentMethod}-VOUCHER-${Date.now().toString().slice(-4)}`;

    const newTx: TransactionRecord = {
      id: `tx-${isOnlineMode ? 'online' : 'offline'}-${Date.now().toString().slice(-4)}`,
      receiptNo: genReceipt,
      studentId: selectedStudent.studentId,
      studentName: selectedStudent.name,
      rollNo: selectedStudent.studentId,
      collegeId: selectedStudent.collegeId,
      collegeName: selectedStudent.collegeName,
      program: activeCourse ? activeCourse.name : selectedStudent.programName,
      semester: selectedStudent.semesterNumber,
      amount,
      paymentMethod,
      channelType: isOnlineMode ? 'RAZORPAY_GATEWAY' : 'OFFLINE_COUNTER',
      gatewayRef: finalRef,
      status: isOnlineMode ? 'SUCCESS' : 'PENDING',
      timestamp: new Date().toISOString(),
      remarks,
      requiresFinanceApproval: !isOnlineMode,
      approvalStatus: isOnlineMode ? 'APPROVED' : 'PENDING',
      depositDate: new Date().toISOString().split('T')[0],
      offlineProofDocument: proofDocument || undefined,
    };

    onCreated(newTx);
    showSuccess(`${isOnlineMode ? 'Online' : 'Counter'} payment receipt ${genReceipt} logged for ${selectedStudent.name}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[92vw] sm:max-w-xl h-[100dvh] flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-x-hidden transform transition-transform ease-out duration-300">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#061A36] to-[#0D6257] text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400/20 text-amber-300 uppercase tracking-wider border border-amber-400/30 inline-block">
                  Direct Accounts Desk
                </span>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Record Direct Payment (Offline & Online)
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

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            {/* Direct Student Payment Callout */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/90 rounded-xl text-[11px] text-blue-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Direct Student Fee Entry (College Delay Fallback)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                When institutional bulk settlement is delayed and a student pays their course fee directly at the accounts counter, filter by college, department, course, and batch to select the student.
              </p>
            </div>

            {/* ─── Cascading Filters: College -> Department -> Course -> Batch ─── */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Target Academic Allocation Hierarchy
              </span>

              {/* 1. College Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>1. College / Campus</span>
                </label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Department Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-slate-500" />
                    <span>2. Department</span>
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    {availableDepartments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Course Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-500" />
                    <span>3. Course</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    {availableCourses.length === 0 ? (
                      <option value="">No courses found in department</option>
                    ) : (
                      availableCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* 4. Batch Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>4. Cohort Batch</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  {availableBatches.length === 0 ? (
                    <option value="">No batches assigned</option>
                  ) : (
                    availableBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (AY {b.admissionYear}–{b.graduationYear})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 5. Student Account Selection */}
              <div className="pt-1 border-t border-slate-200">
                <label className="block text-[11px] font-black text-emerald-950 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>5. Student in Batch ({availableStudents.length} Students)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                    Filtered
                  </span>
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-emerald-500 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  {availableStudents.length === 0 ? (
                    <option value="">No students found in this cohort</option>
                  ) : (
                    availableStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentId}) • {s.departmentName || s.programName}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Payment Mode Channel: Offline & Online switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-700">
                  Payment Mode Channel
                </label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentCategory('OFFLINE');
                      setPaymentMethod('CASH');
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      paymentCategory === 'OFFLINE'
                        ? 'bg-emerald-700 text-white shadow-xs'
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
                    { id: 'CASH', label: 'Cash at Counter', desc: 'Handled at cashier desk' },
                    { id: 'DEMAND_DRAFT', label: 'Demand Draft (DD)', desc: 'Payable to institution' },
                    { id: 'BANK_CHALLAN', label: 'Single Bank Challan', desc: 'Bank deposit receipt slip' },
                    { id: 'NEFT_RTGS', label: 'Direct NEFT / RTGS', desc: 'Counter bank remittance' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === mode.id
                          ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-600'
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
                    { id: 'UPI', label: 'Instant UPI / QR Pay', desc: 'GPay, PhonePe, Paytm, BHIM' },
                    { id: 'NET_BANKING', label: 'Net Banking Transfer', desc: 'Corporate / Retail IMPS / NetBanking' },
                    { id: 'CREDIT_CARD', label: 'Credit Card', desc: 'Online portal POS / Card swipe' },
                    { id: 'DEBIT_CARD', label: 'Debit Card', desc: 'RuPay / Visa / Mastercard' },
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

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Received Amount (INR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            {/* Instrument / Voucher Ref */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isOnlineMode
                  ? 'Transaction Ref ID / UPI UTR / Gateway Order Ref'
                  : 'Instrument No / DD / Challan Ref / Voucher Code'}
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder={
                  isOnlineMode
                    ? 'e.g. UPI-UTR-4091823901 / TXN-NETBANK-99120 / PAY-ORD-88219'
                    : 'e.g. DD-892102 / CHL-IOB-772 / CASH-VOUCHER-442'
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Payment Remarks / Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Verification Box */}
            <div className={`p-3 rounded-xl border ${
              isOnlineMode
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <p className="font-bold">
                {isOnlineMode ? '⚡ Instant Gateway / Direct Online Verification' : '⚠️ Dual Approval Verification Workflow'}
              </p>
              <p className={`text-[11px] mt-0.5 ${isOnlineMode ? 'text-blue-800' : 'text-amber-800'}`}>
                {isOnlineMode
                  ? 'Online payments (UPI, Net Banking, Cards) with gateway or bank UTR reference are auto-reconciled and logged as Settled.'
                  : 'Counter payments are logged in Pending status until the Finance Manager or Treasury Controller reconciles the cash/deposit slip.'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Offline Record</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

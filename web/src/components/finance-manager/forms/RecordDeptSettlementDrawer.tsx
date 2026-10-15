// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: RECORD DEPARTMENT / COHORT BULK SETTLEMENT DRAWER
// Institution-Level Lump-Sum Fee Payment for Entire Department Cohorts (e.g., 60 Students)
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
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
  Users,
  ShieldCheck,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';
import {
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches,
} from '@/mock/superAdminData';
import { TransactionRecord } from '@/mock/financeManagerData';
import { financeProposalStore } from '@/services/financeProposalStore';
import { Send } from 'lucide-react';

export interface DepartmentCohortSettlement {
  id: string;
  collegeId: string;
  collegeName: string;
  departmentId: string;
  departmentName: string;
  programId: string;
  programName: string;
  batchId: string;
  batchName: string;
  totalStudents: number;
  perStudentFee: number;
  totalLumpSumAmount: number;
  paymentMode: 'CORPORATE_RTGS' | 'BANK_CMS_CHALLAN' | 'TREASURY_TRANSFER' | 'DEMAND_DRAFT';
  bankName: string;
  referenceNumber: string; // UTR or Challan No
  depositDate: string;
  stampedChallanSlip: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  approvedBy?: string;
  settledDate: string;
}

interface RecordDeptSettlementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (settlement: DepartmentCohortSettlement, tx: TransactionRecord) => void;
}

export default function RecordDeptSettlementDrawer({
  isOpen,
  onClose,
  onCreated,
}: RecordDeptSettlementDrawerProps) {
  const { showSuccess, showError } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();

  const [collegeId, setCollegeId] = useState(
    !isOverall && selectedCollegeId ? selectedCollegeId : mockInstitutions[0].id
  );
  const [departmentId, setDepartmentId] = useState(mockDepartments[0].id);
  const [programId, setProgramId] = useState(mockPrograms[0].id);
  const [batchId, setBatchId] = useState(mockBatches[0].id);
  const [studentCohortSize, setStudentCohortSize] = useState<number>(60);
  const [perStudentFee, setPerStudentFee] = useState<number>(48000);
  const [paymentMode, setPaymentMode] = useState<DepartmentCohortSettlement['paymentMode']>('CORPORATE_RTGS');
  const [bankName, setBankName] = useState('HDFC Bank Corporate CMS');
  const [referenceNumber, setReferenceNumber] = useState(
    `UTR-RTGS-${Math.floor(10000000 + Math.random() * 90000000)}`
  );
  const [depositDate, setDepositDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [proofDocument, setProofDocument] = useState<string>('Bank_Corporate_Transfer_Advise.pdf');

  // Filtered Programs based on Department
  const availablePrograms = useMemo(() => {
    return mockPrograms.filter((p) => p.departmentId === departmentId);
  }, [departmentId]);

  // Selected details
  const selectedCollegeObj = useMemo(() => {
    return mockInstitutions.find((i) => i.id === collegeId) || mockInstitutions[0];
  }, [collegeId]);

  const selectedDeptObj = useMemo(() => {
    return mockDepartments.find((d) => d.id === departmentId) || mockDepartments[0];
  }, [departmentId]);

  const selectedProgObj = useMemo(() => {
    return mockPrograms.find((p) => p.id === programId) || availablePrograms[0] || mockPrograms[0];
  }, [programId, availablePrograms]);

  const selectedBatchObj = useMemo(() => {
    return mockBatches.find((b) => b.id === batchId) || mockBatches[0];
  }, [batchId]);

  // Total Lump-Sum calculation
  const totalLumpSum = useMemo(() => {
    return (Number(studentCohortSize) || 0) * (Number(perStudentFee) || 0);
  }, [studentCohortSize, perStudentFee]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCohortSize || studentCohortSize <= 0) {
      showError('Please enter a valid student count for this department cohort.');
      return;
    }
    if (!perStudentFee || perStudentFee <= 0) {
      showError('Please enter a valid per-student fee amount.');
      return;
    }
    if (!referenceNumber.trim()) {
      showError('UTR / Challan Reference number is mandatory for institutional settlement.');
      return;
    }

    const newSettlementId = `DEPT-SETTLE-${Date.now().toString().slice(-4)}`;
    const newReceiptNo = `RCP-INST-${Date.now().toString().slice(-6)}`;

    const newSettlement: DepartmentCohortSettlement = {
      id: newSettlementId,
      collegeId: selectedCollegeObj.id,
      collegeName: selectedCollegeObj.name,
      departmentId: selectedDeptObj.id,
      departmentName: selectedDeptObj.name,
      programId: selectedProgObj.id,
      programName: selectedProgObj.name,
      batchId: selectedBatchObj.id,
      batchName: selectedBatchObj.name,
      totalStudents: studentCohortSize,
      perStudentFee,
      totalLumpSumAmount: totalLumpSum,
      paymentMode,
      bankName,
      referenceNumber,
      depositDate,
      stampedChallanSlip: proofDocument,
      status: 'PENDING',
      settledDate: new Date().toISOString(),
    };

    const newTx: TransactionRecord = {
      id: `tx-inst-${Date.now().toString().slice(-4)}`,
      receiptNo: newReceiptNo,
      studentId: `DEPT-${selectedDeptObj.code}`,
      studentName: `${selectedProgObj.name} (${studentCohortSize} Students Lump-Sum)`,
      rollNo: `COHORT-${studentCohortSize}-PENDING`,
      collegeId: selectedCollegeObj.id,
      collegeName: selectedCollegeObj.name,
      program: selectedProgObj.name,
      semester: selectedBatchObj.currentSemesterNumber || 1,
      amount: totalLumpSum,
      paymentMethod: 'BANK_CHALLAN',
      channelType: 'BANK_CHALLAN_BULK',
      gatewayRef: referenceNumber,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      remarks: `Institution department settlement proposal: ${studentCohortSize} students in ${selectedProgObj.name} (₹${totalLumpSum.toLocaleString()}) via ${paymentMode}. Awaiting Super Admin verification.`,
      requiresFinanceApproval: true,
      approvalStatus: 'PENDING',
      challanNumber: referenceNumber,
      bankBranchName: bankName,
      depositDate,
      isBulkChallanBatch: true,
      bulkBatchCode: newSettlementId,
      bulkStudentCount: studentCohortSize,
      offlineProofDocument: proofDocument,
    };

    // Dispatch to Super Admin Approvals Center
    financeProposalStore.submitProposal({
      requestType: 'INSTITUTION_DEPT_BULK_SETTLEMENT',
      entityType: 'Department Cohort Lump-Sum Settlement',
      entityName: `${selectedCollegeObj.name} — ${selectedProgObj.name} (${studentCohortSize} Students)`,
      submittedBy: {
        name: 'Mr. Joseph Raj',
        email: 'joseph.raj@loyolacollege.edu',
        role: 'Finance Manager',
      },
      impactAnalysis: `Institution pays ₹${totalLumpSum.toLocaleString()} collectively for all ${studentCohortSize} students in ${selectedProgObj.name} (${selectedDeptObj.name}) via ${paymentMode} (Ref: ${referenceNumber}). Clears semester dues across the entire batch upon Super Admin verification.`,
      diff: [
        { fieldName: 'Campus', oldValue: 'None', newValue: selectedCollegeObj.name },
        { fieldName: 'Department', oldValue: 'None', newValue: selectedDeptObj.name },
        { fieldName: 'Program Track', oldValue: 'None', newValue: selectedProgObj.name },
        { fieldName: 'Cohort Strength', oldValue: '0', newValue: `${studentCohortSize} Students` },
        { fieldName: 'Per Student Fee', oldValue: '₹0', newValue: `₹${perStudentFee.toLocaleString()}` },
        { fieldName: 'Total Lump-Sum Amount', oldValue: '₹0', newValue: `₹${totalLumpSum.toLocaleString()}` },
        { fieldName: 'Payment Mode', oldValue: 'Unset', newValue: paymentMode.replace(/_/g, ' ') },
        { fieldName: 'Bank / UTR Reference', oldValue: 'Unset', newValue: referenceNumber },
      ],
    });

    onCreated(newSettlement, newTx);
    showSuccess(
      `Institution Lump-Sum proposal for ₹${totalLumpSum.toLocaleString()} (${studentCohortSize} students in ${selectedProgObj.name}) submitted to Super Admin Approvals Center for verification!`
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
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#061A36] via-[#092B5A] to-[#0D6257] text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-teal-400/20 text-teal-300 uppercase tracking-wider border border-teal-400/30 inline-block">
                  Institution Cohort Settlement
                </span>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Record Entire Batch Cohort Payment
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

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            {/* Campus selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Institution Campus
              </label>
              <select
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                {mockInstitutions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department & Program Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">


              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Program Degree & Course Track
                </label>
                <select
                  value={programId}
                  onChange={(e) => {
                    setProgramId(e.target.value);
                    const p = mockPrograms.find((prog) => prog.id === e.target.value);
                    if (p) setPerStudentFee(p.semesterFee || 48000);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                >
                  {availablePrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch & Cohort Details */}
            <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-teal-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Cohort Headcount & Fee Multiplier Engine</span>
                </h3>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-900 rounded font-black text-[10px]">
                  LUMP-SUM MODE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Academic Cohort Batch
                  </label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {mockBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.admissionYear}–{b.graduationYear})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Total Students in Cohort
                  </label>
                  <input
                    type="number"
                    value={studentCohortSize}
                    onChange={(e) => setStudentCohortSize(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="e.g. 60"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 60 students in section</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Term Fee per Student (INR)
                  </label>
                  <input
                    type="number"
                    value={perStudentFee}
                    onChange={(e) => setPerStudentFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="e.g. 48000"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Standard semester fee</span>
                </div>
              </div>

              {/* Dynamic Lump-Sum Result Display */}
              <div className="p-3 bg-white rounded-xl border border-teal-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-teal-800 font-bold uppercase block">
                    Calculated Institution Lump-Sum Total
                  </span>
                  <div className="text-lg font-black text-teal-950 mt-0.5">
                    ₹{totalLumpSum.toLocaleString()}
                  </div>
                </div>
                <span className="text-right text-[11px] text-slate-600 font-medium">
                  {studentCohortSize} Students × ₹{perStudentFee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bank Payment & RTGS Instrument */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-slate-600" />
                <span>Corporate Bank Settlement & UTR Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Settlement Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="CORPORATE_RTGS">Corporate RTGS Bank Transfer</option>
                    <option value="BANK_CMS_CHALLAN">Bank Corporate CMS Batch Challan</option>
                    <option value="TREASURY_TRANSFER">Inter-Institution Treasury Transfer</option>
                    <option value="DEMAND_DRAFT">Consolidated Demand Draft (DD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Deposited Bank Name / Portal
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="HDFC Bank Corporate CMS">HDFC Bank Corporate CMS</option>
                    <option value="SBI PowerJyoti Corporate Portal">SBI PowerJyoti Corporate Portal</option>
                    <option value="Indian Overseas Bank (IOB)">Indian Overseas Bank (IOB)</option>
                    <option value="Canara Bank Collect">Canara Bank Collect</option>
                    <option value="ICICI Corporate Treasury">ICICI Corporate Treasury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bank UTR Ref / Challan Transaction Code
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="e.g. UTR-HDFC-991204"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date of Deposit / Bank Value Date
                  </label>
                  <input
                    type="date"
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                </div>
              </div>

              {/* Upload Proof Copy */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Upload Stamped Bank Challan / RTGS Bank Transfer Advise
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-slate-700">
                      {proofDocument || 'No file selected'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProofDocument(`Bank_Advice_${Date.now().toString().slice(-4)}.pdf`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg cursor-pointer"
                  >
                    Select Proof PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Impact Notice */}
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Super Admin Governance Workflow:</strong> Submitting this institutional record creates an executive authorization ticket for <strong>{studentCohortSize} students</strong> in <strong>{selectedProgObj.name}</strong>. The transaction remains in <strong>PENDING VERIFICATION</strong> status until Central Super Admin verifies the bank deposit/UTR and grants final sign-off.
              </div>
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
                <Send className="w-4 h-4" />
                <span>Submit for Super Admin Verification (₹{totalLumpSum.toLocaleString()})</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

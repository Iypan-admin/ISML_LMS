// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: BULK FEES PAY & ACCESS UNLOCK CONSOLE
// (/college-admin/fees)
// Key Workflow: College can select batch / students with pending fees, review totals,
// submit bulk payment (Online Gateway / RTGS / Demand Draft), and instantly unlock LMS access.
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Search,
  Filter,
  Check,
  Receipt,
  Download,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { mockInstitutions, mockCourses, mockBatches, mockStudents } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface StudentFeeRecord {
  id: string;
  studentId: string;
  name: string;
  courseName: string;
  batchName: string;
  tuitionFee: number;
  paidAmount: number;
  dueAmount: number;
  accessStatus: 'LOCKED' | 'UNLOCKED';
}

export default function CollegeAdminBulkFeesPage() {
  const { showSuccess, showInfo } = useToast();
  const currentCollege = mockInstitutions[0]; // Loyola College of Arts & Science

  // Generate realistic student fee roster with locked/unlocked statuses
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>([
    {
      id: 'fee-01',
      studentId: 'ISML20260001',
      name: 'Aarav Sharma',
      courseName: 'French A1 Intensive Certification Program',
      batchName: 'Cohort 2026–2029 (Section A & B)',
      tuitionFee: 14500,
      paidAmount: 14500,
      dueAmount: 0,
      accessStatus: 'UNLOCKED',
    },
    {
      id: 'fee-02',
      studentId: 'ISML20260004',
      name: 'Vigneshwaran K',
      courseName: 'French A1 Intensive Certification Program',
      batchName: 'Cohort 2026–2029 (Section A & B)',
      tuitionFee: 14500,
      paidAmount: 2000,
      dueAmount: 12500,
      accessStatus: 'LOCKED',
    },
    {
      id: 'fee-03',
      studentId: 'ISML20260015',
      name: 'Deepak Rajan',
      courseName: 'German A1 Professional Career Track',
      batchName: 'Cohort 2026–2029 (BCA Section A)',
      tuitionFee: 15500,
      paidAmount: 0,
      dueAmount: 15500,
      accessStatus: 'LOCKED',
    },
    {
      id: 'fee-04',
      studentId: 'ISML20260022',
      name: 'Pooja Venkatesh',
      courseName: 'German A1 Professional Career Track',
      batchName: 'Cohort 2026–2029 (BCA Section A)',
      tuitionFee: 15500,
      paidAmount: 5000,
      dueAmount: 10500,
      accessStatus: 'LOCKED',
    },
    {
      id: 'fee-05',
      studentId: 'ISML20260033',
      name: 'Rohith Sharma R',
      courseName: 'German A1 Professional Career Track',
      batchName: 'Cohort 2026–2029 (BCA Section A)',
      tuitionFee: 15500,
      paidAmount: 0,
      dueAmount: 15500,
      accessStatus: 'LOCKED',
    },
    {
      id: 'fee-06',
      studentId: 'ISML20260041',
      name: 'Sneha Sundaram',
      courseName: 'Korean TOPIK I Intensive & Hangul Fluency Track',
      batchName: 'Cohort 2026–2029 (Korean Section A)',
      tuitionFee: 16500,
      paidAmount: 16500,
      dueAmount: 0,
      accessStatus: 'UNLOCKED',
    },
    {
      id: 'fee-07',
      studentId: 'ISML20260052',
      name: 'Karthik Subramanian',
      courseName: 'Korean TOPIK I Intensive & Hangul Fluency Track',
      batchName: 'Cohort 2026–2029 (Korean Section A)',
      tuitionFee: 16500,
      paidAmount: 2500,
      dueAmount: 14000,
      accessStatus: 'LOCKED',
    },
  ]);

  // Selected students for bulk payment
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(['fee-02', 'fee-03', 'fee-04']);
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'NEFT_RTGS' | 'CHEQUE_DD'>('ONLINE');
  const [referenceNumber, setReferenceNumber] = useState('TXN-COL-2026-9812');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Batches for filter
  const collegeBatches = mockBatches.filter((b) => b.institutionId === currentCollege.id || !b.institutionId);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all locked students
  const handleSelectAllLocked = () => {
    const lockedIds = feeRecords.filter((r) => r.accessStatus === 'LOCKED').map((r) => r.id);
    setSelectedStudentIds(lockedIds);
    showSuccess(`Selected ${lockedIds.length} locked students for bulk clearance.`);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return feeRecords.filter((r) => {
      if (filterBatch !== 'ALL' && !r.batchName.includes(filterBatch)) return false;
      if (filterStatus !== 'ALL' && r.accessStatus !== filterStatus) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.courseName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [feeRecords, filterBatch, filterStatus, searchQuery]);

  // Bulk Payment Totals
  const selectedRecords = feeRecords.filter((r) => selectedStudentIds.includes(r.id));
  const totalPayableAmount = selectedRecords.reduce((acc, r) => acc + r.dueAmount, 0);

  // Execute Bulk Settlement and Unlock
  const handleProcessBulkPayment = () => {
    if (selectedStudentIds.length === 0) {
      showInfo('Please select at least one student to process bulk fees.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setFeeRecords((prev) =>
        prev.map((r) =>
          selectedStudentIds.includes(r.id)
            ? {
                ...r,
                paidAmount: r.tuitionFee,
                dueAmount: 0,
                accessStatus: 'UNLOCKED',
              }
            : r
        )
      );
      setSelectedStudentIds([]);
      setIsProcessing(false);
      showSuccess(
        `Success! Cleared ₹${totalPayableAmount.toLocaleString()} for ${selectedRecords.length} students. LMS course portals are now INSTANTLY UNLOCKED!`
      );
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              <span>Bulk Student Fees Pay & Instant Unlock</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              FAST UNLOCK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated institutional fee remittance. Pay pending student dues as a college to immediately unlock course modules, videos & quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSelectAllLocked}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Select All Locked</span>
          </button>
          <button
            type="button"
            onClick={() => showSuccess('Exporting Student Fee Ledger Report...')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Dues CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Top Bulk Checkout Summary Banner ─── */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-emerald-800/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
              CONSOLIDATED SETTLEMENT
            </span>
            <span className="text-xs text-slate-300">
              {selectedRecords.length} Students Selected for Clearance
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight">
              ₹{totalPayableAmount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Total Tuition Due</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Upon payment confirmation, the platform automatically issues clearance receipts and lifts LMS study material lock for all selected student accounts.
          </p>
        </div>

        {/* Payment Mode Selector & Instant Action */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 min-w-[280px] sm:min-w-[340px]">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Remittance Method
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentMode('ONLINE')}
                className={`py-1.5 rounded-lg border transition ${
                  paymentMode === 'ONLINE'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Online Card/UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('NEFT_RTGS')}
                className={`py-1.5 rounded-lg border transition ${
                  paymentMode === 'NEFT_RTGS'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                RTGS / NEFT
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('CHEQUE_DD')}
                className={`py-1.5 rounded-lg border transition ${
                  paymentMode === 'CHEQUE_DD'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Demand Draft
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={selectedStudentIds.length === 0 || isProcessing}
            onClick={handleProcessBulkPayment}
            className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
              selectedStudentIds.length === 0 || isProcessing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
            }`}
          >
            {isProcessing ? (
              <span>Verifying & Unlocking Access...</span>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Pay ₹{totalPayableAmount.toLocaleString()} & Unlock Access</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Search and Filters Toolbar ─── */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll ID or course..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Filter */}
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Batches</option>
            {collegeBatches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Access Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="LOCKED">🔒 Locked Accounts Only</option>
            <option value="UNLOCKED">✓ Unlocked / Clear</option>
          </select>
        </div>
      </div>

      {/* ─── Student Fee Roster Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-800">
            Showing {filteredRecords.length} Student Accounts
          </span>
          <span>{selectedStudentIds.length} Selected for Settlement</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredRecords.length > 0 &&
                      filteredRecords.every((r) => selectedStudentIds.includes(r.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudentIds(filteredRecords.map((r) => r.id));
                      } else {
                        setSelectedStudentIds([]);
                      }
                    }}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">Student Details</th>
                <th className="p-3">Enrolled Course</th>
                <th className="p-3">Cohort Batch</th>
                <th className="p-3 text-right">Tuition Fee</th>
                <th className="p-3 text-right">Fee Due</th>
                <th className="p-3 text-center">LMS Portal Access</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.map((record) => {
                const isSelected = selectedStudentIds.includes(record.id);
                const isLocked = record.accessStatus === 'LOCKED';

                return (
                  <tr
                    key={record.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(record.id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <span className="font-black text-[#0B2447] block">{record.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{record.studentId}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {record.courseName}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-600 font-medium text-[11px]">
                        {record.batchName}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      ₹{record.tuitionFee.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {record.dueAmount > 0 ? (
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          ₹{record.dueAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700">₹0 (Clear)</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isLocked ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[10px] inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>LOCKED</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>UNLOCKED</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isLocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentIds([record.id]);
                            showInfo(`Selected ${record.name} for individual unlock.`);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Quick Pay
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => showSuccess(`Downloaded fee receipt for ${record.name}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

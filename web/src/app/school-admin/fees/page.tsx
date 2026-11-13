// ============================================================================
// ISML SCHOOL LMS — SCHOOL ADMIN: TERM FEES & BANK CHALLAN DESK
// (/school-admin/fees)
// Supports:
// 1. Bank CMS Challans & Counter Deposit Slips
// 2. Multi-Pupil Selection and Assignment
// 3. Instant sync to Finance Manager portal (/api/portals/transactions & /api/portals/student-fees)
// Scoped strictly to: Sivakasi Lions Matriculation Higher Secondary School
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
  School,
  Landmark,
  ExternalLink,
  Search,
  Upload,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface PupilFeeRecord {
  id: string;
  studentId: string;
  name: string;
  batchName: string;
  courseName: string;
  termFee: number;
  paidAmount: number;
  dueAmount: number;
  accessStatus: 'LOCKED' | 'UNLOCKED';
  paymentStatus: string;
}

export default function SchoolAdminFeesPage() {
  const { showSuccess, showError } = useToast();
  const [feeRecords, setFeeRecords] = useState<PupilFeeRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [activeSchool, setActiveSchool] = useState({
    id: 'SIVA-LIONS',
    name: 'Sivakasi Lions Matriculation Higher Secondary School',
    code: 'SIVA-LIONS',
    email: 'admin@sivakasilions.edu.in',
  });

  // Payment & Challan Details
  const [paymentMode, setPaymentMode] = useState<'BANK_CHALLAN' | 'NEFT_RTGS' | 'CHEQUE_DD' | 'ONLINE'>('BANK_CHALLAN');
  const [challanNumber, setChallanNumber] = useState(`SCH-CHL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [bankName, setBankName] = useState('Canara Bank / Tamilnad Mercantile Bank');
  const [branchName, setBranchName] = useState('Sivakasi Town Branch');
  const [depositDate, setDepositDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [challanFile, setChallanFile] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch real student fee records for Sivakasi Lions School
    fetch('/api/portals/student-fees?collegeId=SIVA-LIONS')
      .then((r) => r.json())
      .then((json) => {
        if (json && json.data && Array.isArray(json.data)) {
          const mapped: PupilFeeRecord[] = json.data.map((s: any) => {
            const tuition = s.netPayable || s.totalFees || 9500;
            const paid = typeof s.paidAmount === 'number' ? s.paidAmount : 0;
            const due = typeof s.outstandingBalance === 'number' ? s.outstandingBalance : Math.max(0, tuition - paid);
            const isUnlocked = due === 0;

            return {
              id: s.id || s.rollNo,
              studentId: s.rollNo || s.studentId || s.id,
              name: s.name,
              courseName: s.program || 'Sample Course',
              batchName: s.batch || 'Sivakasi Lions French Cohort A',
              termFee: tuition,
              paidAmount: paid,
              dueAmount: due,
              accessStatus: isUnlocked ? 'UNLOCKED' : 'LOCKED',
              paymentStatus: s.paymentStatus || (due === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING'),
            };
          });
          setFeeRecords(mapped);
          const locked = mapped.filter((r) => r.accessStatus === 'LOCKED').map((r) => r.id);
          if (locked.length > 0) {
            setSelectedIds(locked.slice(0, 3));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllLocked = () => {
    const lockedIds = feeRecords.filter((r) => r.accessStatus === 'LOCKED').map((r) => r.id);
    setSelectedIds(lockedIds);
    showSuccess(`Selected ${lockedIds.length} pupils with pending term fees.`);
  };

  const filteredRecords = useMemo(() => {
    return feeRecords.filter((r) => {
      if (filterStatus !== 'ALL' && r.accessStatus !== filterStatus) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.batchName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [feeRecords, filterStatus, searchQuery]);

  const selectedRecords = feeRecords.filter((r) => selectedIds.includes(r.id));
  const totalPayableAmount = selectedRecords.reduce((acc, r) => acc + r.dueAmount, 0);

  const totalCollectible = feeRecords.reduce((acc, r) => acc + r.termFee, 0);
  const totalCollected = feeRecords.reduce((acc, r) => acc + r.paidAmount, 0);
  const totalOutstanding = feeRecords.reduce((acc, r) => acc + r.dueAmount, 0);
  const fullyPaidCount = feeRecords.filter((r) => r.accessStatus === 'UNLOCKED').length;

  const handleProcessBulkPayment = async () => {
    if (selectedIds.length === 0) {
      showError('Please select at least one pupil.');
      return;
    }
    if (paymentMode === 'BANK_CHALLAN' && !challanNumber.trim()) {
      showError('Please enter a valid Bank Challan reference number.');
      return;
    }

    setIsProcessing(true);
    try {
      const generatedReceipt = `RCP-SCH-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const payload = {
        amount: totalPayableAmount,
        paymentMethod: paymentMode === 'BANK_CHALLAN' ? 'BANK_CHALLAN' : paymentMode,
        channelType: 'BANK_CHALLAN_BULK',
        gatewayRef: challanNumber,
        challanNumber: challanNumber,
        receiptNo: generatedReceipt,
        collegeId: activeSchool.id,
        collegeName: activeSchool.name,
        selectedStudentIds: selectedIds,
        isBulkChallanBatch: true,
        bankName,
        branchName,
        depositDate,
        offlineProofDocument: challanFile || undefined,
        remarks: `School Term Challan Deposit (${bankName}) for ${selectedRecords.length} pupils`,
      };

      const res = await fetch('/api/portals/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFeeRecords((prev) =>
          prev.map((r) =>
            selectedIds.includes(r.id)
              ? { ...r, paidAmount: r.termFee, dueAmount: 0, accessStatus: 'UNLOCKED', paymentStatus: 'PAID' }
              : r
          )
        );
        setSelectedIds([]);
        showSuccess(
          `Bank Challan ${challanNumber} for ₹${totalPayableAmount.toLocaleString()} recorded! Unlocked LMS access for ${selectedRecords.length} pupils.`
        );
      } else {
        throw new Error('Failed to record transaction');
      }
    } catch (e: any) {
      showError(e?.message || 'Error processing challan');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <School className="w-6 h-6 text-blue-600" />
              <span>School Term Fees & Bank Challan Desk</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              SIVA-LIONS REAL DB
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deposit junior language program term fees via Bank Challans or Online Gateway. Unlocks pupil LMS access in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAllLocked}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Select All Locked Pupils</span>
          </button>
        </div>
      </div>

      {/* ─── Real Stats Overview Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pupils</span>
          <div className="text-xl font-black text-slate-900 mt-1">{feeRecords.length} Pupils</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sivakasi Lions School Roster</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Collectible</span>
          <div className="text-xl font-black text-slate-900 mt-1">₹{totalCollectible.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">₹9,500 Term Fee Benchmark</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs bg-emerald-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Fees Collected</span>
          <div className="text-xl font-black text-emerald-800 mt-1">₹{totalCollected.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{fullyPaidCount} Pupils Fully Cleared</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-100 shadow-2xs bg-amber-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending Dues</span>
          <div className="text-xl font-black text-amber-800 mt-1">₹{totalOutstanding.toLocaleString()}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">{feeRecords.length - fullyPaidCount} Pending Remittance</div>
        </div>
      </div>

      {/* ─── Top Bulk Checkout & Bank Challan Form ─── */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-start justify-between gap-6 border border-slate-800">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
              SCHOOL TERM SETTLEMENT
            </span>
            <span className="text-xs text-slate-300">
              {selectedRecords.length} Pupils Selected for Clearance
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-blue-300 tracking-tight">
              ₹{totalPayableAmount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Total Payable Amount</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Record institutional bank counter deposits or CMS challans for Sivakasi Lions pupils. Each assigned pupil&apos;s portal will instantly unlock with an official clearance receipt generated and synchronized with the finance manager.
          </p>

          {/* Assigned Pupils Preview Chips */}
          {selectedRecords.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Assigned Pupils ({selectedRecords.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {selectedRecords.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-white/10 text-blue-200"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({s.studentId})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Remittance Mode & Form */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3.5 w-full lg:w-[400px]">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Payment & Challan Method
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPaymentMode('BANK_CHALLAN')}
                className={`py-2 px-1 rounded-lg border transition text-center ${
                  paymentMode === 'BANK_CHALLAN'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                Bank Challan
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('NEFT_RTGS')}
                className={`py-2 px-1 rounded-lg border transition text-center ${
                  paymentMode === 'NEFT_RTGS'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                RTGS / NEFT
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('CHEQUE_DD')}
                className={`py-2 px-1 rounded-lg border transition text-center ${
                  paymentMode === 'CHEQUE_DD'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                Cheque / DD
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('ONLINE')}
                className={`py-2 px-1 rounded-lg border transition text-center ${
                  paymentMode === 'ONLINE'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                Online
              </button>
            </div>
          </div>

          <div className="space-y-2.5 pt-1 border-t border-slate-800 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Challan / Ref Number <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                placeholder="e.g. SCH-CHL-89214"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Deposit Date
                </label>
                <input
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Bank Branch Location
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={selectedIds.length === 0 || isProcessing}
            onClick={handleProcessBulkPayment}
            className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
              selectedIds.length === 0 || isProcessing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
            }`}
          >
            {isProcessing ? (
              <span>Syncing with Finance Portal...</span>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>
                  Submit Challan & Clear {selectedRecords.length} Pupil{selectedRecords.length > 1 ? 's' : ''} (₹{totalPayableAmount.toLocaleString()})
                </span>
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
            placeholder="Search by pupil name, roll number, or cohort..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Access Status</option>
            <option value="LOCKED">Locked (Pending Due)</option>
            <option value="UNLOCKED">Unlocked (Fee Cleared)</option>
          </select>
        </div>
      </div>

      {/* ─── Student Fee Records Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
            Sivakasi Lions Pupils ({filteredRecords.length})
          </span>
          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
            {selectedIds.length} Checked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4 w-12 text-center">Select</th>
                <th className="py-3 px-4">Pupil Name & Roll No</th>
                <th className="py-3 px-4">Cohort Batch</th>
                <th className="py-3 px-4">Language Program</th>
                <th className="py-3 px-4">Term Fee</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Due Balance</th>
                <th className="py-3 px-4">Portal Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400 font-medium">
                    No pupil records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isSelected = selectedIds.includes(record.id);
                  const isLocked = record.accessStatus === 'LOCKED';

                  return (
                    <tr
                      key={record.id}
                      onClick={() => handleToggleSelect(record.id)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(record.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{record.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{record.studentId}</div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {record.batchName}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {record.courseName}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        ₹{record.termFee.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        ₹{record.paidAmount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-rose-600">
                        ₹{record.dueAmount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock className="w-3 h-3 text-rose-500" />
                            <span>LOCKED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>UNLOCKED</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

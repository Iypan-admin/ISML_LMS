// ============================================================================
// ISML SCHOOL LMS — SCHOOL ADMIN: TERM FEES & BANK CHALLAN DESK
// (/school-admin/fees)
// Supports:
// 1. Bank CMS Challans & Counter Deposit Slips
// 2. Multi-Pupil Selection and Assignment
// 3. Instant sync to Finance Manager portal (/finance-manager/transactions)
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

export default function SchoolAdminFeesPage() {
  const { showSuccess, showError } = useToast();
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Payment & Challan Details
  const [paymentMode, setPaymentMode] = useState<'BANK_CHALLAN' | 'NEFT_RTGS' | 'CHEQUE_DD' | 'ONLINE'>('BANK_CHALLAN');
  const [challanNumber, setChallanNumber] = useState(`SCH-CHL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [bankName, setBankName] = useState('Canara Bank / Tamilnad Mercantile Bank');
  const [branchName, setBranchName] = useState('Sivakasi Town Branch');
  const [depositDate, setDepositDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [challanFile, setChallanFile] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portals/students?collegeId=SIVA-LIONS')
      .then((r) => r.json())
      .then((json) => {
        if (json && json.data) {
          const mapped = json.data.map((s: any, idx: number) => {
            const isPending = idx % 2 === 0;
            return {
              id: s.id,
              studentId: s.rollNo || s.studentId || `SLS-2026-${String(idx + 1).padStart(3, '0')}`,
              name: s.name,
              batchName: s.batchName || 'Grade 9 French Cohort',
              termFee: 9500,
              paidAmount: isPending ? 0 : 9500,
              dueAmount: isPending ? 9500 : 0,
              accessStatus: isPending ? 'LOCKED' : 'UNLOCKED',
            };
          });
          setFeeRecords(mapped);
          // Auto-select locked students
          const locked = mapped.filter((r) => r.accessStatus === 'LOCKED').map((r) => r.id);
          if (locked.length > 0) {
            setSelectedIds(locked);
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

  const filteredRecords = useMemo(() => {
    return feeRecords.filter((r) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q);
      }
      return true;
    });
  }, [feeRecords, searchQuery]);

  const selectedRecords = feeRecords.filter((r) => selectedIds.includes(r.id));
  const totalAmount = selectedRecords.reduce((acc, r) => acc + r.dueAmount, 0);

  // Submit Bulk Payment / Bank Challan to Finance Manager
  const handleClearSelected = async () => {
    if (selectedIds.length === 0) {
      showError('Please select at least one pupil.');
      return;
    }
    if (paymentMode === 'BANK_CHALLAN' && !challanNumber.trim()) {
      showError('Please enter a Bank Challan reference number.');
      return;
    }

    setIsProcessing(true);
    try {
      const receiptNo = `RCP-SCH-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const payload = {
        amount: totalAmount,
        paymentMethod: paymentMode === 'BANK_CHALLAN' ? 'BANK_CHALLAN' : paymentMode,
        channelType: 'BANK_CHALLAN_BULK',
        gatewayRef: challanNumber,
        challanNumber: challanNumber,
        receiptNo,
        collegeId: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
        collegeName: 'Sivakasi Lions Matriculation Higher Secondary School',
        selectedStudentIds: selectedIds,
        isBulkChallanBatch: true,
        bankName,
        branchName,
        depositDate,
        offlineProofDocument: challanFile || undefined,
        remarks: `School Term Fees Bank Challan (${bankName}) for ${selectedRecords.length} pupils`,
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
              ? { ...r, paidAmount: r.termFee, dueAmount: 0, accessStatus: 'UNLOCKED' }
              : r
          )
        );
        setSelectedIds([]);
        showSuccess(
          `Bank Challan ${challanNumber} for ₹${totalAmount.toLocaleString()} recorded! Successfully assigned to ${selectedRecords.length} pupils and synced to Finance Manager.`
        );
      } else {
        throw new Error('Failed to record transaction');
      }
    } catch (e: any) {
      showError(e?.message || 'Error recording challan');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-6 h-6 text-blue-600" />
              <span>School Term Fees & Bank Challan Desk</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              FINANCE CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear pending term tuition fees via Bank Challan, Demand Draft or RTGS. Syncs instantly to the central Finance Manager.
          </p>
        </div>

        <Link
          href="/finance-manager/transactions"
          target="_blank"
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 w-fit"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>Finance Transactions Hub</span>
        </Link>
      </div>

      {/* Top Challan Submission Form */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-[#0B2447] to-blue-950 text-white rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-start justify-between gap-6 border border-slate-800">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
              PUPIL TERM SETTLEMENT
            </span>
            <span className="text-xs text-slate-300">
              {selectedRecords.length} Pupils Selected
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-blue-300 tracking-tight">
              ₹{totalAmount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Total Term Dues</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Record institutional school bank deposit slip. Learning portal access and study materials will be immediately unlocked.
          </p>

          {selectedRecords.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Assigned Pupils:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {selectedRecords.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 text-xs bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-cyan-200"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({s.studentId})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3.5 w-full lg:w-[380px]">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Settlement Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPaymentMode('BANK_CHALLAN')}
                className={`py-2 px-1 rounded-lg border transition text-center ${
                  paymentMode === 'BANK_CHALLAN'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
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
                    : 'bg-slate-800 text-slate-300 border-slate-700'
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
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                DD / Cheque
              </button>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Challan / Ref No <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
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
                Attach Scanned Challan Slip
              </label>
              <label className="flex items-center justify-center gap-2 p-2 bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500 rounded-lg cursor-pointer text-slate-400 hover:text-slate-200 transition">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] truncate">{challanFile || 'Upload Slip (PDF/PNG)'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setChallanFile(e.target.files[0].name);
                      showSuccess(`Uploaded: ${e.target.files[0].name}`);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            disabled={selectedIds.length === 0 || isProcessing}
            onClick={handleClearSelected}
            className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
              selectedIds.length === 0 || isProcessing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
            }`}
          >
            {isProcessing ? (
              <span>Recording & Syncing with Finance Portal...</span>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>
                  Submit Challan & Assign to {selectedRecords.length} Pupils (₹{totalAmount.toLocaleString()})
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pupil Table with Checkbox */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Enrolled Pupils ({filteredRecords.length})
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {selectedIds.length} Checked
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(filteredRecords.map((r) => r.id))}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Select All
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 font-bold hover:underline cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4 w-12 text-center">Assign</th>
                <th className="py-3 px-4">Pupil Name</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Section / Cohort</th>
                <th className="py-3 px-4">Term Fee</th>
                <th className="py-3 px-4">Due Amount</th>
                <th className="py-3 px-4">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-medium">
                    No pupil records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  const isLocked = r.accessStatus === 'LOCKED';

                  return (
                    <tr
                      key={r.id}
                      onClick={() => handleToggleSelect(r.id)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(r.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{r.studentId}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{r.batchName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        ₹{r.termFee.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">
                        ₹{r.dueAmount.toLocaleString()}
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
                            <span>CLEARED</span>
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

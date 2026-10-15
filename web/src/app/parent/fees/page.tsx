// ============================================================================
// ISML COLLEGE LMS — PARENT: COLLEGE FEES & RECEIPTS (/parent/fees)
// Semester fee ledger, online receipt downloads, payment status & concessions
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import {
  Receipt,
  Download,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileText,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useParent } from '@/context/ParentContext';

export default function ParentFeesPage() {
  const { selectedChild, selectChild, allChildren } = useParent();
  const fee = selectedChild.feeStatus;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Parent Portal', href: '/parent/dashboard' },
            { label: 'College Fees & Receipts' },
          ]}
        />
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {allChildren.map((c) => (
            <button
              key={c.id}
              onClick={() => selectChild(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                c.id === selectedChild.id
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official University Bursar Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
            Tuition Fee Account: {selectedChild.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Roll No: <strong>{selectedChild.rollNo}</strong> • {selectedChild.primaryCourse.collegeName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Payment Status</p>
            <p className={`text-base font-black ${fee.status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {fee.status === 'PAID' ? 'Full Cleared ✓' : 'Partial Due'}
            </p>
          </div>
        </div>
      </div>

      {/* FEE STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Prescribed Fee</p>
          <p className="text-2xl font-black text-[#0B2447] mt-1">₹{fee.totalFee.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Academic Year 2026 - 2027</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Amount Disbursed</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">₹{fee.paidAmount.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Bank Receipt: {fee.lastReceiptNo}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Outstanding Balance</p>
          <p className={`text-2xl font-black mt-1 ${fee.pendingAmount === 0 ? 'text-slate-400' : 'text-rose-600'}`}>
            ₹{fee.pendingAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{fee.dueDate}</p>
        </div>
      </div>

      {/* PAYMENT RECEIPT HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <h3 className="text-sm font-black text-[#0B2447]">Transaction & Bank Challan Receipts</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Description / Purpose</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-[#0B2447]">
                  {fee.lastReceiptNo}
                </td>
                <td className="py-3.5 px-4 text-slate-700 font-medium">
                  05 Aug 2026
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  Semester I French DELF Certification & Tuition Package
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  Online NetBanking (HDFC Bank)
                </td>
                <td className="py-3.5 px-4 font-black text-emerald-700">
                  ₹{fee.paidAmount.toLocaleString()}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    SETTLED
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => alert(`Downloading Official Bursar Receipt ${fee.lastReceiptNo}...`)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Receipt</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

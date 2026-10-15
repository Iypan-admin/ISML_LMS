// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: PAYMENT LEDGER & SETTLEMENT HISTORY
// (/college-admin/fees/ledger)
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building2,
  CreditCard,
  IndianRupee,
  ExternalLink,
} from 'lucide-react';
import { mockInstitutions } from '@/mock/superAdminData';

interface SettlementRecord {
  id: string;
  transactionRef: string;
  settlementDate: string;
  studentsCount: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'SUCCESS' | 'PROCESSING' | 'FLAGGED';
  receiptNo: string;
  settledBy: string;
}

const mockLedger: SettlementRecord[] = [
  {
    id: 'led-01',
    transactionRef: 'COL-FEE-PAY-20261015-9842',
    settlementDate: '15 Oct 2026, 04:30 PM',
    studentsCount: 12,
    totalAmount: 174000,
    paymentMethod: 'Corporate UPI / NetBanking',
    status: 'SUCCESS',
    receiptNo: 'REC-LOYOLA-2026-0891',
    settledBy: 'Admin Office (Registrar)',
  },
  {
    id: 'led-02',
    transactionRef: 'COL-FEE-PAY-20261008-3211',
    settlementDate: '08 Oct 2026, 11:15 AM',
    studentsCount: 25,
    totalAmount: 362500,
    paymentMethod: 'RTGS / NEFT (HDFC0001234)',
    status: 'SUCCESS',
    receiptNo: 'REC-LOYOLA-2026-0812',
    settledBy: 'Accounts Bursar',
  },
  {
    id: 'led-03',
    transactionRef: 'COL-FEE-PAY-20260920-1094',
    settlementDate: '20 Sep 2026, 02:45 PM',
    studentsCount: 8,
    totalAmount: 116000,
    paymentMethod: 'Institutional Demand Draft (DD #984201)',
    status: 'SUCCESS',
    receiptNo: 'REC-LOYOLA-2026-0745',
    settledBy: 'Admin Office (Registrar)',
  },
];

export default function CollegeAdminPaymentLedgerPage() {
  const currentCollege = mockInstitutions[0];
  const [search, setSearch] = useState('');

  const filtered = mockLedger.filter((item) =>
    item.transactionRef.toLowerCase().includes(search.toLowerCase()) ||
    item.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
    item.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/college-admin/fees"
              className="text-xs font-bold text-slate-500 hover:text-[#0052CC] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Bulk Fee Pay</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight mt-1">
            Institutional Fee Payment Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of all bulk tuition fee settlements and instant LMS unlock vouchers for {currentCollege.name}.
          </p>
        </div>

        <Link
          href="/college-admin/fees"
          className="px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Pending Dues</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Total Settled Fees</span>
          <p className="text-2xl font-black text-slate-900 font-mono">₹6,52,500</p>
          <span className="text-[11px] font-medium text-emerald-700 mt-1 block">Cleared via Institutional Accounts</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Total Unlocked Students</span>
          <p className="text-2xl font-black text-blue-700">45 Learners</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Full LMS curriculum access granted</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Audit Compliance</span>
          <p className="text-2xl font-black text-emerald-700">100%</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">All receipts verified & stamped</span>
        </div>
      </div>

      {/* Search & Roster */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Ref ID, Receipt No..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0052CC]"
            />
          </div>
          <button
            type="button"
            onClick={() => alert('Exporting full audited CSV ledger...')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-3.5">Transaction Ref & Receipt</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5 text-center">Unlocked Students</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5 text-right">Settled Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Receipt Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-[#0B2447] block">{item.transactionRef}</span>
                    <span className="text-[11px] text-slate-400 font-mono">No: {item.receiptNo}</span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">
                    {item.settlementDate}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                      {item.studentsCount} Students
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-medium text-slate-800 block">{item.paymentMethod}</span>
                    <span className="text-[10px] text-slate-400">By: {item.settledBy}</span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                    ₹{item.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading verified institutional voucher for ${item.transactionRef}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

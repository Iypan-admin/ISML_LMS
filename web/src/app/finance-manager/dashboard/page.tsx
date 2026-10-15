// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER DASHBOARD (/finance-manager/dashboard)
// College-Centric Revenue Governance, Collection Trends & Cash Flow Command Center
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  BadgeDollarSign,
  AlertCircle,
  Percent,
  Receipt,
  Users,
  CreditCard,
  RotateCcw,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Coins,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { mockStudentFees, mockTransactions, mockRefunds } from '@/mock/financeManagerData';
import { mockFeeStructures, mockApprovalRequests } from '@/mock/superAdminData';

export default function FinanceManagerDashboardPage() {
  const { selectedCollegeId, selectedCollege, isOverall } = useCollege();

  // Filter records based on selected college
  const filteredFees = isOverall
    ? mockStudentFees
    : mockStudentFees.filter((f) => f.collegeId === selectedCollegeId);

  const filteredTransactions = isOverall
    ? mockTransactions
    : mockTransactions.filter((t) => t.collegeId === selectedCollegeId);

  const filteredRefunds = isOverall
    ? mockRefunds
    : mockRefunds.filter((r) => r.collegeId === selectedCollegeId);

  // Aggregates
  const totalExpected = filteredFees.reduce((acc, f) => acc + f.netPayable, 0);
  const totalCollected = filteredFees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = filteredFees.reduce((acc, f) => acc + f.outstandingBalance, 0);
  const totalConcessions = filteredFees.reduce((acc, f) => acc + f.concessionAmount, 0);
  const collectionPercentage = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '0';

  const pendingApprovalsCount = mockApprovalRequests.filter(
    (r) => r.module === 'Finance' && (r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW')
  ).length;

  const pendingRefundsCount = filteredRefunds.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'UNDER_VERIFICATION'
  ).length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Finance Manager' }, { label: 'Dashboard' }]} />

      <CollegeFilterBar />

      {/* ─── 1. Header Hero Banner ─── */}
      <div className="bg-gradient-to-r from-[#061A36] via-[#092B5A] to-[#1E3A8A] text-white p-5 sm:p-6 rounded-2xl shadow-md border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-cyan-300" />
              <span>COLLEGE FINANCE CONTROLLER • {isOverall ? 'ALL CAMPUSES' : selectedCollege?.code}</span>
            </span>
            <span className="text-[11px] text-blue-200/90 font-medium">
              Academic Year 2026–27
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Revenue Summary & Campus Treasury Command
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Live collection analytics, student billing ledgers, installment schedules and Super Admin authorization tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href="/finance-manager/approvals"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-slate-950" />
            <span>Super Admin Approvals ({pendingApprovalsCount})</span>
          </Link>
          <Link
            href="/finance-manager/transactions"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-white/20"
          >
            <CreditCard className="w-4 h-4 text-cyan-300" />
            <span>Payments Ledger</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Key Revenue KPIs ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expected Fees"
          value={`₹ ${totalExpected.toLocaleString()}`}
          icon={TrendingUp}
          subtext="Net term demand"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Total Realized Revenue"
          value={`₹ ${totalCollected.toLocaleString()}`}
          icon={BadgeDollarSign}
          subtext={`${collectionPercentage}% collected to date`}
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Outstanding Dues"
          value={`₹ ${totalOutstanding.toLocaleString()}`}
          icon={AlertCircle}
          subtext="Pending student balances"
          iconColor="text-rose-600"
        />

        <StatCard
          title="Scholarships & Waivers"
          value={`₹ ${totalConcessions.toLocaleString()}`}
          icon={Percent}
          subtext="Approved fee concessions"
          iconColor="text-purple-600"
        />
      </div>

      {/* ─── 3. Action Hub: 3 Functional Sections ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/finance-manager/student-fees"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Student Fee Records</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Review student-wise billing profiles, term installment breakdowns, and dispatch overdue payment reminders.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0052CC]">
            <span>View {filteredFees.length} Enrolled Students</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/finance-manager/fee-structures"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Fee Structure Engine</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Build program fees, semester tuition components and prepare proposals for Super Admin sign-off.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Manage Component Schedules</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/finance-manager/approvals"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-purple-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Approvals & Governance</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Track status of proposed fee structures, submit revisions and manage executive sign-offs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
            <span>View Authorizations</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ─── 4. Dual Section: Live Transactions & High Overdue Watchlist ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Transaction Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Payment Transactions</h2>
                <p className="text-[11px] text-slate-500">Live collection feed across campus payment gateways & DDs</p>
              </div>
            </div>
            <Link
              href="/finance-manager/transactions"
              className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {filteredTransactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {tx.receiptNo}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      {tx.paymentMethod}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {tx.studentName} ({tx.rollNo}) — {tx.program}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate" suppressHydrationWarning>
                    {tx.remarks} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-slate-900">
                    ₹{tx.amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Sem {tx.semester}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Pending Approvals Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Super Admin Queue</h2>
                  <p className="text-[11px] text-slate-500">Proposals waiting for authorization</p>
                </div>
              </div>
              <Link
                href="/finance-manager/approvals"
                className="text-xs font-bold text-amber-800 hover:underline"
              >
                Track ({pendingApprovalsCount})
              </Link>
            </div>

            <div className="space-y-2.5">
              {mockApprovalRequests
                .filter((r) => r.module === 'Finance')
                .slice(0, 3)
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl border border-amber-200/70 bg-amber-50/40 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                        {req.id}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="font-bold text-slate-900 truncate">{req.entityName}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Submitted on {new Date(req.submittedDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#0B2447]">
              <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
              <span>Two-Tier Governance</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Finance Managers prepare line items & schedules; Super Admin grants cryptographic authorization before cohorts are billed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

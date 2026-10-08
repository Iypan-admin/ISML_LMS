// ============================================================================
// ISML COLLEGE LMS — MASTER FINANCE PORTAL: DASHBOARD
// High-Level Fee Governance, Institutional Policy & Control
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import {
  BadgeDollarSign,
  Receipt,
  Coins,
  FileCheck,
  TrendingUp,
  Percent,
  CreditCard,
  RotateCcw,
  BarChart2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Layers,
  GraduationCap,
  CalendarRange,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import {
  mockFeeStructures,
  mockFeeComponents,
  mockScholarships,
  mockApprovalRequests,
} from '@/mock/superAdminData';

export default function FinanceDashboardPage() {
  const { selectedCollegeId, isOverall, selectedCollege } = useCollege();
  const pendingFeeApprovals = mockApprovalRequests.filter(
    (r) => r.module === 'Finance' && (r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW')
  );

  const activeFeeStructures = mockFeeStructures.filter((f) => f.status === 'APPROVED');

  return (
    <div className="space-y-6 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Master Overview' }]} />

      <CollegeFilterBar />

      {/* ─── 1. Header Banner ─── */}
      <div className="bg-gradient-to-r from-[#0B2447] via-[#0D3166] to-[#0052CC] text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SUPER ADMIN FINANCE GOVERNANCE — {isOverall ? 'ALL CAMPUSES' : selectedCollege?.code}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Finance & Fee Governance Master
          </h1>
          <p className="text-xs text-blue-100 max-w-2xl mt-1 leading-relaxed">
            Executive control center for institutional revenue oversight, fee schedule authorizations, and pricing compliance across colleges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href="/super-admin/finance/approvals"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-amber-950" />
            <span>Pending Approvals ({pendingFeeApprovals.length})</span>
          </Link>
          <Link
            href="/super-admin/finance/fee-structures"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-white/20"
          >
            <Receipt className="w-4 h-4 text-emerald-300" />
            <span>Fee Structures</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Super Admin High-Level Financial Snapshot (Only 4 Essential KPIs) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Expected Term Revenue"
          value="₹ 1.84 Cr"
          icon={TrendingUp}
          subtext="Budgeted target (AY 2026–27)"
          iconColor="text-[#0052CC]"
        />

        <StatCard
          title="Realized Collections"
          value="₹ 1.48 Cr"
          icon={BadgeDollarSign}
          subtext="80.4% collected to date"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Outstanding Dues"
          value="₹ 36.0 L"
          icon={AlertCircle}
          subtext="Unpaid term installments"
          iconColor="text-rose-600"
        />

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/90 p-5 rounded-2xl flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Awaiting Super Admin</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
              </span>
            </div>
            <div className="text-2xl font-black text-amber-950 mt-2">
              {pendingFeeApprovals.length} <span className="text-xs font-semibold text-amber-800">Proposals</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Pending fee schedules & waiver requests</p>
          </div>
          <Link
            href="/super-admin/finance/approvals"
            className="text-xs font-bold text-amber-950 hover:text-amber-700 flex items-center gap-1.5 mt-3 pt-3 border-t border-amber-200/70 transition-colors"
          >
            <span>Open Approvals Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── 3. Executive Action Modules (What Super Admin Needs Direct Access To) ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0052CC]" />
            <span>Finance Governance Modules</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Select a module to view or configure</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/super-admin/finance/approvals"
            className="p-5 bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/40 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Fee Authorizations</h3>
                {pendingFeeApprovals.length > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {pendingFeeApprovals.length} Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review and approve/reject fee structures submitted by campus Finance Managers before they become active.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Go to Approvals</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/super-admin/finance/fee-structures"
            className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Program Fee Schedules</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Inspect active term fees, semester-wise breakdowns, tuition line items, and batch-wise fee templates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0052CC]">
              <span>Manage Schedules ({mockFeeStructures.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/super-admin/finance/course-fees"
            className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Course & Credit Pricing</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Oversee credit-hour tuition, lab surcharges, elective seat premiums, and exam fees.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>View Course Fees</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* ─── 4. Prioritized Executive Queues: Pending Approvals & Active Structures ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Approvals Action Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Pending Fee Approvals Queue
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Requires Super Admin decision before activation
                  </p>
                </div>
              </div>
              <Link
                href="/super-admin/finance/approvals"
                className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
              >
                <span>View All ({pendingFeeApprovals.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingFeeApprovals.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">All Finance Requests Approved</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending fee structure proposals requiring attention.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFeeApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/30 hover:bg-amber-50/60 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                          {req.id}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {req.entityName}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        Submitted by <span className="font-medium text-slate-700">{req.submittedBy.name}</span> ({req.submittedBy.role})
                      </p>
                    </div>

                    <Link
                      href="/super-admin/finance/approvals"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Governance Policy: Two-tier validation</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Authorized
            </span>
          </div>
        </div>

        {/* Right: Active Fee Structures Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#0052CC] rounded-xl">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Active Approved Fee Schedules
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Live fee structures governing active student cohorts
                  </p>
                </div>
              </div>
              <Link
                href="/super-admin/finance/fee-structures"
                className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
              >
                <span>View All ({activeFeeStructures.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeFeeStructures.slice(0, 3).map((fee) => (
                <div
                  key={fee.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {fee.code}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#0052CC]">
                        v{fee.version}.0
                      </span>
                      <StatusBadge status={fee.status} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {fee.programName} — Sem {fee.semesterNumber}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Batch {fee.batchName} • AY {fee.academicYear}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-slate-900">
                      ₹{fee.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {fee.components.length} Components
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link
              href="/super-admin/finance/fee-structures"
              className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
            >
              <span>+ Create / Version New Structure</span>
            </Link>
            <span className="text-slate-400">Total {mockFeeStructures.length} versioned</span>
          </div>
        </div>
      </div>
    </div>
  );
}

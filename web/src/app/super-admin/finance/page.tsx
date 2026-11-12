// ============================================================================
// ISML COLLEGE LMS — MASTER FINANCE PORTAL: DASHBOARD
// High-Level Fee Governance, Institutional Policy & Control
// Live Data Driven / Zero Mock Data Fallbacks
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { fastFetch } from '@/lib/fastCache';

export default function FinanceDashboardPage() {
  const { selectedCollegeId, isOverall, selectedCollege } = useCollege();
  
  // Real live states
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [bulkPayments, setBulkPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchFinanceMetrics = useCallback(async () => {
    fastFetch('http://localhost:4000/api/portals/finance/fee-structures', (data) => {
      if (data) setFeeStructures(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
    });

    fastFetch('http://localhost:4000/api/portals/approvals', (data) => {
      if (data) {
        const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        setApprovals(list.filter((a: any) => a.entityType === 'FEE' || a.module === 'Finance'));
      }
    });

    fastFetch('http://localhost:4000/api/portals/college/bulk-payments', (data) => {
      if (data) setBulkPayments(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchFinanceMetrics();
  }, [fetchFinanceMetrics]);

  const pendingApprovalsCount = approvals.filter((a) => a.currentStatus === 'PENDING' || a.status === 'SUBMITTED').length;
  const totalCollections = bulkPayments.reduce((acc, p) => acc + (Number(p.totalAmountPaid) || 0), 0);

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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Institutional Fee & Revenue Governance</h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl mt-1 leading-relaxed">
            Centralized policy authorization, fee schedules & course pricing, fee waivers, refund governance, and automated clearance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            onClick={fetchFinanceMetrics}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Financials</span>
          </button>
          <Link
            href="/super-admin/finance/approvals"
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#0B2447] font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-[#0B2447]" />
            <span>Review Pending Approvals ({pendingApprovalsCount})</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Top Executive Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Fee Schedules"
          value={feeStructures.length.toString()}
          subtext="Governed fee matrices"
          icon={Receipt}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovalsCount.toString()}
          subtext="Submissions awaiting sign-off"
          icon={FileCheck}
        />
        <StatCard
          title="Total Institutional Collections"
          value={`₹${totalCollections.toLocaleString()}`}
          subtext="Processed fee batches"
          icon={BadgeDollarSign}
        />
        <StatCard
          title="Bulk Payment Batches"
          value={bulkPayments.length.toString()}
          subtext="Verified payment invoices"
          icon={Coins}
        />
      </div>

      {/* ─── 3. Quick Navigation Hub ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/super-admin/finance/approvals"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Fee Approvals Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review fee schedules and tuition fee waiver proposals
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/super-admin/finance/fee-structures"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Fee Schedules & Courses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect program tuition, level pricing & fee components
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}

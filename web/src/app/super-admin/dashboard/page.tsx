// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN DASHBOARD
// Simplified Approval-First Executive Overview
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  GraduationCap,
  Layers,
  BookOpen,
  CalendarDays,
  ShieldCheck,
  CheckSquare,
  ArrowRight,
  Activity,
  CheckCircle2,
  ScrollText,
  UserCheck,
  BadgeDollarSign,
  FileBarChart2,
  Clock,
  Sparkles,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { useAuth } from '@/context/AuthRbacContext';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';
import {
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches,
  mockCourses,
  mockApprovalRequests,
  mockAuditLogs,
  mockSystemHealth,
} from '@/mock/superAdminData';

import CollegeFilterBar from '@/components/common/CollegeFilterBar';

export default function SuperAdminDashboardPage() {
  const { currentUser } = useAuth();
  const { selectedCollegeId, setSelectedCollegeId, selectedCollege, isOverall, institutions } = useCollege();

  // Dynamic statistics based on selected college or overall
  const totalStudents = isOverall
    ? institutions.reduce((acc, i) => acc + i.studentsCount, 0)
    : selectedCollege?.studentsCount || 0;

  const totalFaculty = isOverall
    ? institutions.reduce((acc, i) => acc + i.facultyCount, 0)
    : selectedCollege?.facultyCount || 0;

  const totalDepts = isOverall
    ? institutions.reduce((acc, i) => acc + i.departmentsCount, 0)
    : selectedCollege?.departmentsCount || 0;

  const pendingApprovalsCount = mockApprovalRequests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW'
  ).length;

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ─── Campus Scoping Quick Selector Bar ─── */}
      <CollegeFilterBar />

      {/* ─── 1. Welcome & Executive Status Banner ─── */}
      <div className="bg-gradient-to-r from-[#0B2447] via-[#071730] to-[#1E3A8A] text-white p-5 sm:p-6 rounded-2xl shadow-md border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SUPER ADMIN EXECUTIVE PORTAL</span>
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-cyan-200 truncate">
              {isOverall ? '🏛️ Overall (All Colleges)' : `🎓 ${selectedCollege?.name}`}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Good day, {currentUser.name}!
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {isOverall
              ? 'Consolidated multi-college view across all affiliated university campuses and autonomous colleges.'
              : `Viewing institutional metrics, student rosters and financial ledgers scoped to ${selectedCollege?.name}.`}
          </p>
        </div>

        {/* Limited Quick Actions (Rule #38: Review Approvals, View Users, View Academic, View Finance, View Reports) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            href="/super-admin/approvals"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Review Approvals ({pendingApprovalsCount})</span>
          </Link>
          <Link
            href="/super-admin/finance"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
            <span>Finance Master</span>
          </Link>
          <Link
            href="/super-admin/academic"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-cyan-300" />
            <span>Academic</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Key Executive KPIs (Prioritizing Pending Approvals) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Most Important KPI: Pending Approvals */}
        <div className="col-span-2 lg:col-span-2 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4.5 rounded-2xl border-2 border-amber-300 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending Approvals
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                Action Required
              </span>
            </div>
            <div className="text-3xl font-black text-amber-950 mt-1">
              {pendingApprovalsCount}
            </div>
            <p className="text-xs text-amber-800 mt-1">
              Requests awaiting Super Admin authorization across Academic & Finance.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200">
            <Link
              href="/super-admin/approvals"
              className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 hover:underline"
            >
              <span>View Requests in Approval Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Students */}
        <StatCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          icon={Users}
          subtext={isOverall ? 'Across all colleges' : selectedCollege?.code || 'Enrolled'}
          iconColor="text-[#0052CC]"
        />

        {/* ISML Central Tutors */}
        <StatCard
          title="ISML Tutors"
          value={totalFaculty}
          icon={UserCheck}
          subtext={isOverall ? 'Centrally deployed faculty' : `Teaching at ${selectedCollege?.code || 'campus'}`}
          iconColor="text-emerald-600"
        />

        {/* Total Programs */}
        <StatCard
          title="Total Programs"
          value={mockPrograms.length}
          icon={GraduationCap}
          subtext="Active degree tracks"
          iconColor="text-indigo-600"
        />

        {/* Active Batches */}
        <StatCard
          title="Active Batches"
          value={mockBatches.length}
          icon={Layers}
          subtext="Undergraduate cohorts"
          iconColor="text-cyan-600"
        />
      </div>

      {/* ─── 3. Main Dashboard Split: Recent Approval Requests vs System Status ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pending Approval Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <CheckSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0B2447]">
                    Recent Approval Requests
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Prepared by Academic & Finance Managers awaiting your authorization
                  </p>
                </div>
              </div>
              <Link
                href="/super-admin/approvals"
                className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
              >
                <span>Approval Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {mockApprovalRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-[#0052CC]">
                        {req.id}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                        {req.module}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {req.requestType}: {req.entityName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Submitted by <strong>{req.submittedBy.name}</strong> ({req.submittedBy.role}) • {new Date(req.submittedDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href="/super-admin/approvals"
                      className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access to Core Portals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/super-admin/academic"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-2xs group"
            >
              <div className="p-2 w-fit bg-blue-50 text-[#0052CC] rounded-lg mb-2 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Academic Structure</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Departments, Programs & Batches</p>
            </Link>

            <Link
              href="/super-admin/finance"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs group"
            >
              <div className="p-2 w-fit bg-emerald-50 text-emerald-600 rounded-lg mb-2 group-hover:scale-105 transition-transform">
                <BadgeDollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Finance Master Portal</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Fee Structures & Components</p>
            </Link>

            <Link
              href="/super-admin/reports"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all shadow-2xs group"
            >
              <div className="p-2 w-fit bg-indigo-50 text-indigo-600 rounded-lg mb-2 group-hover:scale-105 transition-transform">
                <FileBarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Executive Reports</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Compliance, Fees & Academic</p>
            </Link>
          </div>
        </div>

        {/* Right Column (1 Col): System Status & Audit Logs */}
        <div className="space-y-6">
          {/* System Health / Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#0B2447]">System Health</h2>
              </div>
              <Link
                href="/super-admin/system-monitoring"
                className="text-[11px] font-bold text-[#0052CC] hover:underline"
              >
                Monitoring
              </Link>
            </div>

            <div className="space-y-2.5">
              {mockSystemHealth.slice(0, 4).map((srv, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#0B2447] truncate">{srv.serviceName}</p>
                    <p className="text-[10px] text-slate-400">{srv.latencyMs}ms latency • 99.98% uptime</p>
                  </div>
                  <StatusBadge status={srv.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Administrative Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  <ScrollText className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#0B2447]">Recent Audit Trail</h2>
              </div>
              <Link
                href="/super-admin/audit-logs"
                className="text-[11px] font-bold text-[#0052CC] hover:underline"
              >
                All Logs
              </Link>
            </div>

            <div className="space-y-3">
              {mockAuditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-[#0052CC] pl-3 py-0.5 space-y-0.5">
                  <p className="font-bold text-[#0B2447]">{log.action}</p>
                  <p className="text-[11px] text-slate-600 truncate">{log.details}</p>
                  <p className="text-[10px] text-slate-400">
                    By {log.userName} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

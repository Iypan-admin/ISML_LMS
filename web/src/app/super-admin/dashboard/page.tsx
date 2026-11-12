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
import { fastFetch } from '@/lib/fastCache';

export default function SuperAdminDashboardPage() {
  const { currentUser } = useAuth();
  const {
    selectedCollegeId,
    setSelectedCollegeId,
    selectedCollege,
    isOverall,
    institutions,
    filteredInstitutions,
    isSchoolMode,
    isCollegeMode,
    labels,
  } = useCollege();

  // Dynamic statistics based on selected college/school or overall filtered
  const activeInstitutionsPool = isOverall ? filteredInstitutions : (selectedCollege ? [selectedCollege] : filteredInstitutions);

  const totalStudents = activeInstitutionsPool.reduce((acc, i) => acc + i.studentsCount, 0);
  const totalFaculty = activeInstitutionsPool.reduce((acc, i) => acc + i.facultyCount, 0);

  // Filter courses & batches based on active pool
  const activeInstIds = new Set(activeInstitutionsPool.map((i) => i.id));
  const activeCourses = mockCourses.filter((c) => {
    if (isOverall) {
      if (isSchoolMode) return c.collegeId?.startsWith('school');
      return !c.collegeId?.startsWith('school');
    }
    return c.collegeId === selectedCollege?.id;
  });

  const activeBatches = mockBatches.filter((b) => {
    const instId = b.institutionId || '';
    if (isOverall) {
      if (isSchoolMode) return instId.startsWith('school');
      return !instId.startsWith('school');
    }
    return instId === selectedCollege?.id;
  });

  const [dbApprovals, setDbApprovals] = React.useState<any[]>([]);
  const [dbCourses, setDbCourses] = React.useState<any[]>([]);
  const [dbMetrics, setDbMetrics] = React.useState<{
    totalStudents: number;
    totalFaculty: number;
    activeCourses: number;
    activeBatches: number;
    pendingApprovals: number;
    registeredInstitutions: number;
  } | null>(null);

  React.useEffect(() => {
    fastFetch('http://localhost:4000/api/portals/approvals', (appJson) => {
      if (appJson?.data) setDbApprovals(appJson.data);
    });
    fastFetch('http://localhost:4000/api/portals/courses', (courseJson) => {
      if (courseJson?.data) setDbCourses(courseJson.data);
    });
    fastFetch('http://localhost:4000/api/portals/executive-metrics', (metricJson) => {
      if (metricJson?.data) setDbMetrics(metricJson.data);
    });
  }, []);

  const pendingApprovalsCount = dbMetrics ? dbMetrics.pendingApprovals : dbApprovals.filter(
    (r) => r.currentStatus === 'PENDING' || r.currentStatus === 'UNDER_REVIEW'
  ).length;

  const displayApprovals = dbApprovals;

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ─── Campus Scoping Quick Selector Bar ─── */}
      <CollegeFilterBar />

      {/* ─── 1. Welcome & Executive Status Banner ─── */}
      <div className={`p-5 sm:p-6 rounded-2xl shadow-md border text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        isSchoolMode
          ? 'bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#0F766E] border-emerald-700/60'
          : 'bg-gradient-to-r from-[#0B2447] via-[#071730] to-[#1E3A8A] border-blue-900/50'
      }`}>
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border ${
              isSchoolMode
                ? 'bg-emerald-400/20 text-emerald-200 border-emerald-300/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSchoolMode ? 'SUPER ADMIN — SCHOOLS OVERSIGHT' : 'SUPER ADMIN EXECUTIVE PORTAL'}</span>
            </span>
            <span className="text-xs text-white/50">•</span>
            <span className="text-xs font-semibold text-emerald-100 truncate">
              {isOverall
                ? isSchoolMode ? '🏫 Consolidated (All K-12 Schools)' : '🏛️ Overall (All Colleges)'
                : `${isSchoolMode ? '🏫' : '🎓'} ${selectedCollege?.name}`}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Good day, {currentUser.name}!
          </h1>

          <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
            {isOverall
              ? isSchoolMode
                ? 'Consolidated Multi-School Management across CBSE, ICSE & International K-12 partner schools.'
                : 'Consolidated multi-college view across all affiliated university campuses and autonomous colleges.'
              : `Viewing institutional metrics, student rosters and financial ledgers scoped to ${selectedCollege?.name}.`}
          </p>
        </div>

        {/* Limited Quick Actions */}
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
            <BadgeDollarSign className="w-4 h-4 text-emerald-300" />
            <span>Finance Master</span>
          </Link>
          <Link
            href="/super-admin/academic"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-cyan-200" />
            <span>{isSchoolMode ? 'Grades & Curriculum' : 'Academic'}</span>
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
          title={isSchoolMode ? 'Enrolled Pupils' : 'Total Students'}
          value={dbMetrics ? dbMetrics.totalStudents.toLocaleString() : '0'}
          icon={Users}
          subtext={isOverall ? 'Admitted Students in Supabase' : selectedCollege?.code || 'Enrolled'}
          iconColor={isSchoolMode ? 'text-emerald-700' : 'text-[#0052CC]'}
        />

        {/* ISML Central Tutors / Teachers */}
        <StatCard
          title={isSchoolMode ? 'Language Teachers' : 'ISML Tutors'}
          value={dbMetrics ? dbMetrics.totalFaculty : 0}
          icon={UserCheck}
          subtext={isOverall ? 'Certified Native Faculty' : `Teaching at ${selectedCollege?.code || 'campus'}`}
          iconColor="text-emerald-600"
        />

        {/* Active Courses / Grades */}
        <StatCard
          title={isSchoolMode ? 'Grades & Subjects' : 'Active Courses'}
          value={dbMetrics ? dbMetrics.activeCourses : dbCourses.length}
          icon={BookOpen}
          subtext="CEFR Language Catalog"
          iconColor={isSchoolMode ? 'text-emerald-600' : 'text-indigo-600'}
        />

        {/* Active Batches / Class Sections */}
        <StatCard
          title={isSchoolMode ? 'Class Sections' : 'Active Batches'}
          value={dbMetrics ? dbMetrics.activeBatches : 0}
          icon={Layers}
          subtext="Language Cohorts"
          iconColor={isSchoolMode ? 'text-teal-600' : 'text-cyan-600'}
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
              {displayApprovals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No Pending Approvals</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    All workflow requests will appear here when submitted from Academic or Finance portals.
                  </p>
                </div>
              ) : (
                displayApprovals.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1 w-full">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded">
                          {req.id}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                          {req.entityType || req.module || 'Workflow'}
                        </span>
                        <StatusBadge status={req.currentStatus || req.status} />
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words">
                        <span className="text-[#0052CC] font-extrabold mr-1">{req.requestType}:</span>
                        <span>{req.title || req.entityName}</span>
                      </h3>

                      <p className="text-[11px] text-slate-500 break-words leading-relaxed">
                        Submitted by <strong className="text-slate-700">{req.submittedBy?.name || req.requestedByUserId || 'Academic Manager'}</strong> • <span suppressHydrationWarning>{new Date(req.createdAt || req.submittedDate || Date.now()).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center justify-end w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <Link
                        href="/super-admin/approvals"
                        className="w-full sm:w-auto text-center px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-sm"
                      >
                        Review Request
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time Courses & Curriculum Catalog */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-[#0052CC]">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0B2447]">
                    Live Courses & Curriculum Catalog ({dbCourses.length})
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Active language courses, CEFR modules & tracks created across academic departments
                  </p>
                </div>
              </div>
              <Link
                href="/super-admin/courses"
                className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
              >
                <span>All Courses ({dbCourses.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {dbCourses.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No courses created yet. New courses submitted from the Academic Manager portal will automatically reflect here.
                </div>
              ) : (
                dbCourses.map((crs) => (
                  <div
                    key={crs.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-black bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
                          {crs.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          AY {crs.academicYear || '2026–2027'}
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          ⏳ {crs.durationDays ? `${crs.durationDays} Days` : (crs.duration || '90 Days Track')}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            crs.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {crs.status === 'PUBLISHED' ? 'Active ✓' : 'Draft'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#0B2447] truncate">{crs.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        Lead Faculty: <strong className="text-slate-700">{crs.facultyName || 'Lead Academic Faculty'}</strong> • {crs.teachingHours || 80}h Teaching • {crs.assessmentsCount || 4} Assessments
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <Link
                        href="/super-admin/courses"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0052CC] border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Access to Core Portals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/super-admin/academic"
              className={`p-4 bg-white rounded-xl border transition-all shadow-2xs group ${
                isSchoolMode ? 'hover:border-emerald-300' : 'hover:border-blue-300'
              }`}
            >
              <div className={`p-2 w-fit rounded-lg mb-2 group-hover:scale-105 transition-transform ${
                isSchoolMode ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#0052CC]'
              }`}>
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                {isSchoolMode ? 'Grades, Terms & Sections' : 'Academic Structure'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isSchoolMode ? 'K-12 Classes, Subjects & CBSE Timetables' : 'Departments, Programs & Batches'}
              </p>
            </Link>

            <Link
              href="/super-admin/finance"
              className={`p-4 bg-white rounded-xl border transition-all shadow-2xs group ${
                isSchoolMode ? 'hover:border-teal-300' : 'hover:border-emerald-300'
              }`}
            >
              <div className={`p-2 w-fit rounded-lg mb-2 group-hover:scale-105 transition-transform ${
                isSchoolMode ? 'bg-teal-50 text-teal-700' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <BadgeDollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                {isSchoolMode ? 'School Fee & Kit Ledgers' : 'Finance Master Portal'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isSchoolMode ? 'Term Fees, Language Books & Bulk Unlock' : 'Fee Structures & Components'}
              </p>
            </Link>

            <Link
              href="/super-admin/students"
              className={`p-4 bg-white rounded-xl border transition-all shadow-2xs group ${
                isSchoolMode ? 'hover:border-purple-300' : 'hover:border-indigo-300'
              }`}
            >
              <div className={`p-2 w-fit rounded-lg mb-2 group-hover:scale-105 transition-transform ${
                isSchoolMode ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                {isSchoolMode ? 'School Pupil Directory' : 'College Students Roster'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isSchoolMode ? 'Admission IDs, Section Allocations & Wards' : 'Enrolled Undergraduates & Attendance'}
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column (1 Col): System Status & Audit Logs */}
        <div className="space-y-6">
          {/* Active Campuses / Institutions Roster Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  isSchoolMode ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#0052CC]'
                }`}>
                  {isSchoolMode ? <GraduationCap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0B2447]">
                    {isSchoolMode ? 'Affiliated K-12 Schools' : 'Affiliated Autonomous Colleges'}
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    {filteredInstitutions.length} {labels.institutionPlural} registered in portal
                  </p>
                </div>
              </div>
              <Link
                href="/super-admin/institutions"
                className={`text-[11px] font-bold hover:underline ${
                  isSchoolMode ? 'text-emerald-700' : 'text-[#0052CC]'
                }`}
              >
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {filteredInstitutions.slice(0, 4).map((inst) => {
                const isSelected = selectedCollegeId === inst.id;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setSelectedCollegeId(inst.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? isSchoolMode
                          ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-200'
                        : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#0B2447] truncate">{inst.name}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white border text-slate-600 font-mono">
                          {inst.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {inst.affiliation} • {inst.studentsCount.toLocaleString()} {labels.studentPlural.toLowerCase()}
                      </p>
                    </div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? isSchoolMode ? 'bg-emerald-600 text-white' : 'bg-[#0052CC] text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isSelected ? 'Active' : 'Select'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Health / Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#0B2447]">Service Status</h2>
              </div>
              <Link
                href="/super-admin/system-monitoring"
                className="text-[11px] font-bold text-[#0052CC] hover:underline"
              >
                All Services
              </Link>
            </div>

            <div className="space-y-2">
              {mockSystemHealth.slice(0, 3).map((srv, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#0B2447] truncate">{srv.serviceName}</p>
                    <p className="text-[10px] text-slate-400">{srv.latencyMs}ms latency • 99.98% uptime</p>
                  </div>
                  <StatusBadge status={srv.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

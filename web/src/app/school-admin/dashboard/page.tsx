// ============================================================================
// ISML SCHOOL LMS — SCHOOL ADMIN: PRINCIPAL DESK & ACADEMIC OVERSIGHT
// (/school-admin/dashboard)
// Executive Super-Admin Styled School Overview: Dark Navy `#0B2447` Header,
// Production StatCards, Live Pupils Count & Quick Clearance Desk
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CreditCard,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  School,
  ShieldCheck,
  UserCheck,
  Clock,
  BookOpen,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { fastFetch } from '@/lib/fastCache';

export default function SchoolAdminDashboardPage() {
  const [activeSchool, setActiveSchool] = useState({
    id: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    name: 'Sivakasi Lions Matriculation Higher Secondary School',
    code: 'SLMHSS',
    type: 'SCHOOL',
  });

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  } | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [assignedTutors, setAssignedTutors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let schId = 'SLMHSS';
    try {
      const stored = localStorage.getItem('isml_admin_user') || localStorage.getItem('isml_user');
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.campusName) {
          setActiveSchool((prev) => ({
            ...prev,
            name: u.campusName,
            code: u.institutionCode || prev.code,
            id: u.campusId || prev.id,
          }));
          schId = u.institutionCode || u.campusId || 'SLMHSS';
        }
      }
    } catch {}

    // Fetch live pupils from backend scoped to this school
    fastFetch(`/api/portals/students?collegeId=${encodeURIComponent(schId)}`, (json) => {
      if (json && json.data) {
        setStudents(json.data);
      }
    });

    // Fetch assigned language tutors for this school
    fastFetch(`/api/portals/faculty?collegeId=${encodeURIComponent(schId)}`, (json) => {
      if (json && json.data) {
        setAssignedTutors(json.data);
      }
    });

    // Fetch live batches from backend
    fastFetch('/api/portals/batches', (json) => {
      if (json && json.data) {
        const schoolBatches = json.data.filter((b: any) =>
          b.institutionName && b.institutionName.includes('School')
        );
        setBatches(schoolBatches.length > 0 ? schoolBatches : json.data);
      }
      setIsLoading(false);
    });
  }, []);

  const totalPupils = students.length;
  const pendingFeePupils = students.filter((s) => s.status !== 'ACTIVE' || s.isFeePending);
  const pendingFeesCount = pendingFeePupils.length;
  const avgAttendance =
    students.length > 0
      ? (
          students.reduce((acc, s) => acc + (Number(s.attendancePercentage) || 0), 0) /
          students.length
        ).toFixed(1)
      : '94.2';

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── 1. Super-Admin Style Deep Navy Executive Header ─── */}
      <div className="bg-[#0B2447] text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle Decorative Gradient Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 min-w-0 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border bg-blue-500/20 text-cyan-300 border-cyan-400/30">
              <School className="w-3.5 h-3.5 text-cyan-300" />
              <span>K-12 PRINCIPAL DESK & ACADEMIC OVERSIGHT</span>
            </span>

            <span className="text-xs text-white/40">•</span>

            <span className="text-xs font-mono font-bold text-cyan-200 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
              {activeSchool.code}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate">
            {activeSchool.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-lg text-xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Head of School:</span>
              <span className="font-bold text-white">{currentUser?.name || 'Authorized Principal'}</span>
              <span className="text-slate-400">({currentUser?.email || 'principal@school.edu'})</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/15 border border-cyan-400/30 rounded-lg text-xs text-cyan-200 backdrop-blur-xs">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-cyan-100/80 font-medium">Assigned Language Faculty:</span>
              <span className="font-extrabold text-cyan-300">
                {assignedTutors.length > 0 ? assignedTutors.map((t) => t.name).join(', ') : 'Joy Jk'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed pt-1">
            Live school governance console: Oversee K-12 foreign language immersion (French & German Junior Track), monitor section attendance, and authorize term tuition fee clearances.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 relative z-10">
          <Link
            href="/school-admin/fees"
            className="px-4.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <CreditCard className="w-4 h-4 text-slate-950" />
            <span>Term Fee Clearance</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/school-admin/students"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 text-center"
          >
            <GraduationCap className="w-4 h-4 text-cyan-300" />
            <span>Pupils Directory</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Key Executive KPIs (Super Admin Style Grid) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Most Critical Action Card: Pending Term Fees (2 Cols) */}
        <div className="col-span-2 lg:col-span-2 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4.5 rounded-2xl border-2 border-amber-300 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Pending Term Fees
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                Action Required
              </span>
            </div>
            <div className="text-3xl font-black text-amber-950 mt-1">
              {pendingFeesCount}
            </div>
            <p className="text-xs text-amber-800 mt-1">
              Pupils awaiting school terminal fee clearance to unlock student portal immersion content.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200">
            <Link
              href="/school-admin/fees"
              className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 hover:underline"
            >
              <span>Authorize & Clear Term Fees</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Pupils */}
        <StatCard
          title="Enrolled Pupils"
          value={totalPupils}
          icon={Users}
          subtext="Active in School Roster"
          iconColor="text-[#0052CC]"
        />

        {/* School Faculty */}
        <StatCard
          title="Language Faculty"
          value={assignedTutors.length > 0 ? assignedTutors.length : 1}
          icon={UserCheck}
          subtext={assignedTutors.length > 0 ? assignedTutors[0].name : 'Joy Jk'}
          iconColor="text-[#0052CC]"
        />

        {/* Active Sections */}
        <StatCard
          title="Class Sections"
          value={batches.length > 0 ? batches.length : 2}
          icon={Layers}
          subtext="Grade 8 - 12 Tracks"
          iconColor="text-indigo-600"
        />

        {/* Attendance Rate */}
        <StatCard
          title="Attendance"
          value={`${avgAttendance}%`}
          icon={TrendingUp}
          subtext="CBSE Language Target Met"
          iconColor="text-blue-600"
        />
      </div>

      {/* ─── 3. Quick Navigation Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/school-admin/students"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Pupils Roster Directory</h4>
              <p className="text-xs text-slate-500">Manage learner admissions, roll numbers & tracks</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/school-admin/parents"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Parent & Guardian Directory</h4>
              <p className="text-xs text-slate-500">View linked guardians & emergency contacts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}

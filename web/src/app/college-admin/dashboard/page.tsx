// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: CAMPUS DASHBOARD
// (/college-admin/dashboard)
// Complete Real-Time Campus Overview: Student Enrollment, Fee Unlocks, Courses,
// Batch Progress, Attendance Rates, and Quick Actions
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CreditCard,
  Users,
  BookOpen,
  Layers,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
} from 'lucide-react';
import { mockInstitutions, mockStudents, mockCourses, mockBatches } from '@/mock/superAdminData';

export default function CollegeAdminDashboardPage() {
  const currentCollege = mockInstitutions[0]; // Loyola College of Arts & Science

  // College-specific entities
  const collegeStudents = mockStudents.filter((s) => s.collegeId === currentCollege.id || !s.collegeId);
  const collegeBatches = mockBatches.filter((b) => b.institutionId === currentCollege.id || !b.institutionId);
  const collegeCourses = mockCourses.filter((c) => c.collegeId === currentCollege.id || !c.collegeId);

  // Fee calculation
  const pendingFeeStudents = collegeStudents.filter((s) => (s.attendancePercentage < 80) || s.status !== 'ACTIVE');
  const lockedAccountsCount = 14;
  const totalStudentsCount = collegeStudents.length;

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── Hero Banner Bar ─── */}
      <div className="bg-gradient-to-r from-[#0B192C] via-indigo-950 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
              CAMPUS REGISTRAR & ADMIN
            </span>
            <span className="text-[10px] font-bold text-slate-300">
              Autonomous College Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentCollege.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor real-time enrolled learners, clear bulk student fees to unlock curriculum access, track batch syllabus progress and manage faculty timetables.
          </p>
        </div>

        {/* Quick Bulk Action Button */}
        <div className="flex items-center gap-3 shrink-0 relative z-10 flex-wrap">
          <Link
            href="/college-admin/fees"
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl transition shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bulk Fees Pay & Unlock</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/college-admin/students/enroll"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll Student</span>
          </Link>
        </div>
      </div>

      {/* ─── 4 Primary KPI Summary Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Card 1: Enrolled Students */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Total Students</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#0052CC]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2447] tracking-tight">{totalStudentsCount}</h2>
            <Link
              href="/college-admin/students"
              className="text-[11px] font-bold text-[#0052CC] hover:underline flex items-center gap-1 mt-1"
            >
              <span>Manage Roster</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Locked Accounts & Fees Pending */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-amber-800">Locked / Fee Due</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">{lockedAccountsCount}</h2>
            <Link
              href="/college-admin/fees"
              className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 mt-1"
            >
              <span>Pay & Unlock Access</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Active Batches */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Active Cohorts</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">{collegeBatches.length}</h2>
            <Link
              href="/college-admin/batches"
              className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 mt-1"
            >
              <span>View Timetables</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">Campus Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">88.4%</h2>
            <Link
              href="/college-admin/attendance"
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-1"
            >
              <span>Attendance Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2-Column Responsive Workspace Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Quick Bulk Fees & Student Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Bulk Unlock Banner Card */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                FEE SETTLEMENT & ACCESS UNLOCK
              </span>
              <h3 className="text-lg font-black text-white">
                {lockedAccountsCount} Students Pending Semester Fees
              </h3>
              <p className="text-xs text-emerald-100 max-w-md">
                College can pay tuition fees in one consolidated transaction via RTGS/NEFT or Online Gateway to instantly unlock student LMS portals.
              </p>
            </div>
            <Link
              href="/college-admin/fees"
              className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-md transition shrink-0"
            >
              Review & Unlock
            </Link>
          </div>

          {/* Active Cohorts Delivery Progress */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#0B2447]">Campus Cohort Delivery Status</h3>
                <p className="text-xs text-slate-500">Live academic delivery and syllabus completion across batches.</p>
              </div>
              <Link href="/college-admin/batches" className="text-xs font-bold text-[#0052CC] hover:underline">
                View All Batches →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {collegeBatches.slice(0, 3).map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{b.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {b.studentsCount} Students • Tutor: {b.assignedFacultyName || 'Mme. Claire Fontaine'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                      {b.batchTiming || '10:00 AM - 11:30 AM'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Campus Overview & Action Cards */}
        <div className="space-y-6">
          {/* Campus Credentials Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Campus Verification</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution Code:</span>
                <strong className="text-slate-900">{currentCollege.code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address / Location:</span>
                <strong className="text-slate-900 truncate max-w-[170px]">{currentCollege.address}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Affiliation:</span>
                <strong className="text-blue-700">{currentCollege.affiliation}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Email:</span>
                <span className="text-slate-700 truncate max-w-[150px]">{currentCollege.contactEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Desk:</span>
                <span className="font-mono text-slate-800">{currentCollege.contactPhone}</span>
              </div>
            </div>
          </div>

          {/* Quick Operations Links */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Registrar Quick Operations
            </h4>

            <Link
              href="/college-admin/students/enroll"
              className="w-full p-2.5 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Enroll Single / Bulk Students</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/college-admin/fees"
              className="w-full p-2.5 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Bulk Fee Pay & Instant Unlock</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/college-admin/attendance"
              className="w-full p-2.5 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Monitor Daily Class Attendance</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

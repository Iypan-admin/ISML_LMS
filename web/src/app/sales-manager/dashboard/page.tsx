// ============================================================================
// ISML LMS — SALES & ADMISSION MANAGEMENT DASHBOARD
// (/sales-manager/dashboard)
// Executive Dashboard: Deep Navy `#0B2447` Header, Real Supabase DB Admissions,
// Institutional Intake Pipelines, Revenue/Fee Collection Metrics & Conversion Flow
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  School,
  Building2,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  Search,
  DollarSign,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
  UserCheck,
  FileCheck2,
  BadgeDollarSign,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { fastFetch } from '@/lib/fastCache';

export default function SalesManagerDashboardPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch genuine admissions from DB
    fastFetch('/api/portals/admissions', (res) => {
      if (res && res.data) {
        setAdmissions(res.data);
      }
      setIsLoading(false);
    });

    // 2. Fetch genuine partner institutions from DB
    fastFetch('/api/portals/institutions', (res) => {
      if (res && res.data) {
        setInstitutions(res.data);
      }
    });
  }, []);

  // Compute live metrics from actual DB data
  const totalAdmissions = admissions.length;
  const collegeAdmissions = admissions.filter((a) => a.admissionType !== 'SCHOOL_STUDENT');
  const schoolAdmissions = admissions.filter((a) => a.admissionType === 'SCHOOL_STUDENT');
  
  const collegePartners = institutions.filter((i) => i.type !== 'SCHOOL');
  const schoolPartners = institutions.filter((i) => i.type === 'SCHOOL');

  // Revenue computations from actual student fees paid
  const totalPaidRevenue = admissions.reduce((acc, a) => acc + (Number(a.amountPaid) || 0), 0);
  const totalPendingFees = admissions.reduce((acc, a) => acc + (Number(a.pendingAmount) || 0), 0);
  const conversionRate = totalAdmissions > 0 ? ((collegeAdmissions.length / totalAdmissions) * 100).toFixed(1) : '94.8';

  const recentAdmissions = admissions.slice(0, 6);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── 1. Super-Admin Style Deep Navy Executive Header ─── */}
      <div className="bg-[#0B2447] text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle Decorative Ambient Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 min-w-0 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border bg-blue-500/20 text-cyan-300 border-cyan-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>CENTRAL ADMISSION & SALES EXECUTIVE DESK</span>
            </span>

            <span className="text-xs text-white/40">•</span>

            <span className="text-xs font-mono font-bold text-cyan-200 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
              ACADEMIC YEAR 2026–2027
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate">
            Admission & Sales Pipeline
          </h1>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-lg text-xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Logged in as:</span>
              <span className="font-bold text-white">Karthik Subramanian (Admissions Lead)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/15 border border-cyan-400/30 rounded-lg text-xs text-cyan-200 backdrop-blur-xs">
              <Building2 className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-cyan-100/80 font-medium">Active Campus Network:</span>
              <span className="font-extrabold text-cyan-300">
                {institutions.length} Institutions ({collegePartners.length} Colleges • {schoolPartners.length} Schools)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed pt-1">
            Real-time candidate intake engine: Track student admissions across collegiate departments and K-12 junior immersion tracks, monitor tuition fee collections, and onboard partner campuses.
          </p>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 relative z-10">
          <Link
            href="/sales-manager/enroll-student"
            className="px-4.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>Add Student</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/sales-manager/onboard-institution"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 text-center"
          >
            <Building2 className="w-4 h-4 text-cyan-300" />
            <span>Add College / School</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Key Executive KPIs (Super Admin Style Grid) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Most Critical Action Card: Total Admissions Enrolled (2 Cols) */}
        <div className="col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-900/40 via-slate-900 to-[#0B2447] text-white p-4.5 rounded-2xl border-2 border-blue-500/40 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                Total Enrolled Candidates
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-cyan-300 border border-cyan-400/30">
                Live Supabase DB
              </span>
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {totalAdmissions}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Direct and institutional batch candidates successfully admitted into ISML CEFR programs.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <Link
              href="/sales-manager/admissions"
              className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 hover:underline"
            >
              <span>View Candidate Roster Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* College Admissions */}
        <StatCard
          title="College Intake"
          value={collegeAdmissions.length}
          icon={GraduationCap}
          subtext={`Across ${collegePartners.length} Colleges`}
          iconColor="text-[#0052CC]"
        />

        {/* School Pupils */}
        <StatCard
          title="School Intake"
          value={schoolAdmissions.length}
          icon={School}
          subtext={`Across ${schoolPartners.length} K-12 Schools`}
          iconColor="text-indigo-600"
        />

        {/* Active Campus Partners */}
        <StatCard
          title="Partner Network"
          value={institutions.length}
          icon={Building2}
          subtext="MoU Signed Campuses"
          iconColor="text-blue-600"
        />

        {/* Fee Collection Rate */}
        <StatCard
          title="Paid Clearance"
          value={`${((admissions.filter(a => a.paymentStatus === 'PAID').length / (totalAdmissions || 1)) * 100).toFixed(0)}%`}
          icon={TrendingUp}
          subtext="Tuition Fee Paid"
          iconColor="text-cyan-600"
        />
      </div>

      {/* ─── 3. Admissions Intake & Public Portals 2-Column Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Admissions Roster */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
                <span>Recent Candidate Admissions</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real student records synced directly from live Supabase database tables.
              </p>
            </div>
            <Link
              href="/sales-manager/admissions"
              className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
            >
              <span>Full Admissions Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student Candidate</th>
                  <th className="py-3 px-4">Admitted Institution</th>
                  <th className="py-3 px-4">Language Track</th>
                  <th className="py-3 px-4 text-center">Fee Status</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      Loading admissions records from database...
                    </td>
                  </tr>
                ) : recentAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No enrolled candidate admissions found yet.
                    </td>
                  </tr>
                ) : (
                  recentAdmissions.map((item, idx) => (
                    <tr key={item.id || `adm-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B2447]">
                          {item.fullName || `${item.firstName} ${item.lastName}`}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{item.applicationNumber || item.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block truncate max-w-[190px]">
                          {item.institutionName || 'Affiliated Campus'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.admissionType === 'SCHOOL_STUDENT' ? 'K-12 School' : 'College Campus'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                          {item.targetLanguage || 'FRENCH'} ({item.targetLevel || 'A1.1'})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.paymentStatus === 'PAID' ? 'PAID' : 'DUE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ENROLLED</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Direct Intake Desks & Action Portals */}
        <div className="space-y-6">
          {/* Direct Intake Desks */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Admission Intake Desks</span>
              </span>
              <span className="text-[10px] font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Direct
              </span>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/sales-manager/enroll-student"
                className="w-full p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-[#0052CC]" />
                  <span>Single Student Enrolment</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0052CC] transition" />
              </Link>

              <Link
                href="/sales-manager/register-college"
                className="w-full p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>College Batch Enrolment</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
              </Link>

              <Link
                href="/sales-manager/register-school"
                className="w-full p-3 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <School className="w-4 h-4 text-indigo-600" />
                  <span>School Batch Enrolment</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
              </Link>

              <Link
                href="/sales-manager/onboard-tutor"
                className="w-full p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#0052CC]" />
                  <span>Onboard Language Tutor</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0052CC] transition" />
              </Link>
            </div>
          </div>

          {/* Public Admissions Self-Registration Links */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Public Self-Registration Links
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Share these direct application links with prospective applicants or institutional partners.
            </p>

            <div className="space-y-2 pt-1">
              <Link
                href="/register/college"
                target="_blank"
                className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-blue-900 transition"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#0052CC]" />
                  <span>College Public Form</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              </Link>

              <Link
                href="/register/school"
                target="_blank"
                className="p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-indigo-950 transition"
              >
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-indigo-600" />
                  <span>School Public Form</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

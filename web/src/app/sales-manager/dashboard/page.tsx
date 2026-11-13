// ============================================================================
// ISML LMS — SALES & ADMISSION MANAGEMENT DASHBOARD
// (/sales-manager/dashboard)
// Clean, professional, streamlined admission overview and student admissions roster
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  School,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  UserPlus,
  FileCheck2,
  Search,
} from 'lucide-react';
import { fastFetch } from '@/lib/fastCache';
import { useCollege } from '@/context/CollegeContext';

export default function SalesManagerDashboardPage() {
  const { isSchoolMode, selectedCollegeId, isOverall } = useCollege();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fastFetch('/api/portals/admissions', (res) => {
      if (res && res.data) {
        setAdmissions(res.data);
      }
      setIsLoading(false);
    });

    fastFetch('/api/portals/institutions', (res) => {
      if (res && res.data) {
        setInstitutions(res.data);
      }
    });
  }, []);

  // Filter based on scope
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      const isSchool = a.admissionType === 'SCHOOL_STUDENT' || a.institutionName?.toLowerCase().includes('school');
      if (isSchoolMode && !isSchool) return false;
      if (!isSchoolMode && isSchool) return false;

      if (!isOverall && a.institutionId && a.institutionId !== selectedCollegeId) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const name = `${a.fullName || ''} ${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        const appNo = (a.applicationNumber || a.id || '').toLowerCase();
        const inst = (a.institutionName || '').toLowerCase();
        return name.includes(q) || appNo.includes(q) || inst.includes(q);
      }

      return true;
    });
  }, [admissions, isSchoolMode, isOverall, selectedCollegeId, searchQuery]);

  // Real Counts
  const totalAdmissions = filteredAdmissions.length;
  const collegeCount = admissions.filter((a) => a.admissionType !== 'SCHOOL_STUDENT').length;
  const schoolCount = admissions.filter((a) => a.admissionType === 'SCHOOL_STUDENT').length;
  const paidCount = filteredAdmissions.filter((a) => a.paymentStatus === 'PAID').length;
  const paidRate = totalAdmissions > 0 ? Math.round((paidCount / totalAdmissions) * 100) : 100;

  return (
    <div className="space-y-6 pb-10 font-sans text-slate-900">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Admission & Sales Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time candidate enrollment tracking, college and school intake, and student fee status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/sales-manager/enroll-student"
            className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </Link>
          <Link
            href="/sales-manager/onboard-institution"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Add Institution</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Enrolled</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{totalAdmissions}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Active candidates</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>College Intake</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{collegeCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">The American College</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>School Intake</span>
            <School className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{schoolCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Sivakasi Lions School</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Fee Clearance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{paidRate}%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Tuition fees cleared</p>
        </div>
      </div>

      {/* 3. Admissions Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Filter / Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
            <h2 className="text-sm font-bold text-[#0B2447]">
              Admitted Candidate Roster ({filteredAdmissions.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>
            <Link
              href="/sales-manager/admissions"
              className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Student Candidate</th>
                <th className="py-3 px-4">Institution Campus</th>
                <th className="py-3 px-4">Language Course</th>
                <th className="py-3 px-4 text-center">Fee Status</th>
                <th className="py-3 px-4 text-center">Enrollment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    Loading admissions records...
                  </td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    No candidate admissions matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.slice(0, 10).map((item, idx) => (
                  <tr key={item.id || `adm-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B2447]">
                        {item.fullName || `${item.firstName || ''} ${item.lastName || ''}`}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.applicationNumber || item.id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-[220px]">
                        {item.institutionName || 'The American College'}
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
    </div>
  );
}

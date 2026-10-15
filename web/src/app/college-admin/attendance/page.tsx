// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: ATTENDANCE & PERFORMANCE MONITOR
// (/college-admin/attendance)
// Live class attendance tracking, shortfall alerts, and batch attendance benchmarks
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { mockInstitutions, mockStudents, mockBatches } from '@/mock/superAdminData';

export default function CollegeAdminAttendancePage() {
  const currentCollege = mockInstitutions[0];
  const students = mockStudents.filter((s) => s.collegeId === currentCollege.id || !s.collegeId);
  const [searchQuery, setSearchQuery] = useState('');
  const [thresholdFilter, setThresholdFilter] = useState('ALL');

  const filteredStudents = students.filter((s) => {
    if (thresholdFilter === 'CRITICAL' && s.attendancePercentage >= 75) return false;
    if (thresholdFilter === 'GOOD' && s.attendancePercentage < 85) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        (s.batchName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = students.filter((s) => s.attendancePercentage < 75).length;
  const goodCount = students.filter((s) => s.attendancePercentage >= 85).length;

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              <span>Campus Attendance & Performance Monitor</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              88.4% Average
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time student attendance across live webinars and classroom sessions for {currentCollege.name}.
          </p>
        </div>

        <button
          type="button"
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Attendance Log</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Overall Campus Benchmark</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">88.4%</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Target CEFR 80% met</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs font-bold text-rose-800">Critical Shortfall (&lt;75%)</span>
          <p className="text-2xl font-black text-rose-950 mt-1">{criticalCount} Students</p>
          <span className="text-[10px] text-rose-700 font-bold mt-0.5 block">Notice sent to parents</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Exemplary Attendance (&gt;85%)</span>
          <p className="text-2xl font-black text-[#0B2447] mt-1">{goodCount} Students</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Eligible for certification</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Search learner or cohort..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />

          <select
            value={thresholdFilter}
            onChange={(e) => setThresholdFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="ALL">All Attendance Bands</option>
            <option value="CRITICAL">⚠️ Critical Shortfall (&lt;75%)</option>
            <option value="GOOD">✓ High Attendance (&gt;85%)</option>
          </select>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3">Student Name</th>
              <th className="p-3">Cohort Batch</th>
              <th className="p-3">Attendance %</th>
              <th className="p-3 text-center">Benchmark Band</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">{s.name} ({s.studentId})</td>
                <td className="p-3 text-slate-600">{s.batchName}</td>
                <td className="p-3 font-black text-slate-900">{s.attendancePercentage}%</td>
                <td className="p-3 text-center">
                  {s.attendancePercentage >= 85 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      EXCELLENT
                    </span>
                  ) : s.attendancePercentage >= 75 ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                      AVERAGE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                      SHORTFALL
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <span className="font-bold text-slate-500">{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

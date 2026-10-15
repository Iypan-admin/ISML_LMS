// ============================================================================
// ISML COLLEGE LMS — PARENT: LIVE ATTENDANCE LEDGER (/parent/attendance)
// Real-time roll call history, NAAC 75% compliance tracker, leave slips & export
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckSquare,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  Download,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useParent } from '@/context/ParentContext';

export default function ParentAttendancePage() {
  const { parent, selectedChild, selectChild, allChildren } = useParent();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'EXCUSED'>('ALL');

  const filteredLogs = selectedChild.attendance.recentLogs.filter((log) => {
    if (statusFilter === 'ALL') return true;
    return log.status === statusFilter;
  });

  const isSafe = selectedChild.attendance.percentage >= 75;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Parent Portal', href: '/parent/dashboard' },
            { label: 'Live Attendance Ledger' },
          ]}
        />
        {/* Child Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {allChildren.map((c) => {
            const isSelected = c.id === selectedChild.id;
            return (
              <button
                key={c.id}
                onClick={() => selectChild(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0052CC] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{c.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                  {c.attendance.percentage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official University Roll Call Sync</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
            Attendance Ledger: {selectedChild.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Roll No: <strong>{selectedChild.rollNo}</strong> • {selectedChild.primaryCourse.courseCode} ({selectedChild.primaryCourse.batchName})
          </p>
        </div>

        {/* Attendance Percentage Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cumulative Total</p>
            <p className={`text-2xl font-black ${isSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
              {selectedChild.attendance.percentage}%
            </p>
          </div>
          <div className={`p-3 rounded-2xl ${isSafe ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border ${isSafe ? 'border-emerald-200' : 'border-rose-200'}`}>
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Sessions Held</p>
          <p className="text-2xl font-black text-[#0B2447] mt-1">{selectedChild.attendance.totalWorkingDays}</p>
          <p className="text-[11px] text-slate-400 mt-1">Academic Year 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Sessions Attended</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{selectedChild.attendance.presentDays}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Live Webinar + Offline Practical</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Sessions Absent</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{selectedChild.attendance.absentDays}</p>
          <p className="text-[11px] text-slate-400 mt-1">Medical slips & college sports</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">NAAC Compliance</p>
          <p className={`text-base font-black mt-2 flex items-center gap-1.5 ${isSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
            {isSafe ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span>{isSafe ? 'Eligible for DELF Exam' : 'Below 75% Threshold'}</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Minimum 75% required by UGC</p>
        </div>
      </div>

      {/* FILTER & ATTENDANCE LOG TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-[#0B2447]">Daily Session Roll Call Records</h3>
            <p className="text-xs text-slate-500">Every live class, workshop and formative phonetics clinic timestamp</p>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'PRESENT', 'ABSENT', 'EXCUSED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-[#0B2447] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Session Title & Topic</th>
                <th className="py-3 px-4">Conducting Faculty</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tutor Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0B2447] whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {log.sessionTitle}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {log.tutorName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {log.timeIn}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        log.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'ABSENT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                    {log.remarks || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

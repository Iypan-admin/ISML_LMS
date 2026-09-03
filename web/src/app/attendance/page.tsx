"use client";

import React from 'react';
import { CalendarCheck, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { currentStudent } from '@/mock/students';
import { mockAttendanceLogs } from '@/mock/attendance';

export default function AttendancePage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <CalendarCheck className="w-4 h-4 text-[#0052CC]" />
          <span>Live Class Attendance Tracker</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Attendance Tracker</h1>
        <p className="text-xs text-slate-600">
          Attendance is automatically calculated based on live connection stay duration and approved by your batch tutor.
        </p>
      </div>

      {/* Ring Widget & Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Enrolled Attendance</span>
          <p className="text-4xl font-extrabold text-emerald-600">{currentStudent.overallAttendance}%</p>
          <p className="text-xs text-emerald-800 font-semibold flex items-center justify-center sm:justify-start gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Qualified for CEFR Final Certification
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 max-w-sm">
          <p className="font-bold text-slate-800">Attendance Calculation Standard:</p>
          <p>Students must stay connected for &gt;80% of live webinar duration to be marked PRESENT.</p>
        </div>
      </div>

      {/* Session History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[#0B2447]">Approved Session History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Session Topic</th>
                <th className="p-3">Date</th>
                <th className="p-3">Duration / Stay</th>
                <th className="p-3">Stay %</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAttendanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-[#0B2447]">{log.sessionTopic}</td>
                  <td className="p-3 text-slate-600 font-mono">{log.date}</td>
                  <td className="p-3 text-slate-600">{log.stayMins} / {log.durationMins} Mins</td>
                  <td className="p-3 font-mono font-bold text-[#0052CC]">{log.stayPercentage}%</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      PRESENT (APPROVED)
                    </span>
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

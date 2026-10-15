// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: NOTIFICATIONS
// (/academic-manager/notifications)
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Bell, Plus, CheckCircle2, Clock, Send, Users, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerNotificationsPage() {
  const { showSuccess } = useToast();

  const notices = [
    {
      id: 'nt-01',
      title: 'DELF A1 & A2 Exam Registration Window Now Active',
      target: 'All Language Cohort Learners',
      date: 'Today, 10:30 AM',
      read: false,
    },
    {
      id: 'nt-02',
      title: 'Timetable Adjustment: Friday Morning Studio Rooms Swapped',
      target: 'Faculty & French A1 Batches',
      date: 'Yesterday, 04:15 PM',
      read: true,
    },
    {
      id: 'nt-03',
      title: 'Monthly Attendance Shortfall Circular Dispatched to Parents',
      target: 'Academic Committee',
      date: 'Oct 04, 2026',
      read: true,
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Overview' }, { label: 'Notifications' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Academic Circulars & Student Notices</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast timetable updates, assessment guidelines, and campus academic announcements.
          </p>
        </div>

        <button
          onClick={() => showSuccess('Broadcast Notice composer opened.')}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast Notice</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {notices.map((n) => (
          <div key={n.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                !n.read ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500'
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{n.title}</h4>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Audience: <strong className="text-slate-700">{n.target}</strong></p>
                <p className="text-[10px] text-slate-400 font-medium">{n.date}</p>
              </div>
            </div>

            <button
              onClick={() => showSuccess(`Marked ${n.title} as read.`)}
              className="text-xs font-bold text-blue-600 hover:underline shrink-0 cursor-pointer"
            >
              Mark Read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

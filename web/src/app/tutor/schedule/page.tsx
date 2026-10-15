// ============================================================================
// ISML COLLEGE LMS — TUTOR: MY SCHEDULE & TIMETABLE (/tutor/schedule)
// Tutor Perspective: Timetable slots for Lead lectures, doubt clinics & standby
// ============================================================================

"use client";

import React from 'react';
import { CalendarDays, Clock, Users, ShieldCheck, Video, MessageSquare } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';

export default function TutorSchedulePage() {
  const { currentFaculty, myAllocations } = useTutor();

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Faculty Console', href: '/tutor/dashboard' }, { label: 'My Weekly Timetable & Schedule' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#0052CC]" />
            <span>Weekly Teaching Timetable & Doubt Hours</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official timetable allocated to {currentFaculty.name} by Academic Manager.
          </p>
        </div>

        <span className="px-3 py-1.5 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold">
          Weekly Allocated: {currentFaculty.allocatedHours} Hours
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {myAllocations.map((alloc) => (
          <div key={alloc.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#0052CC] border border-blue-200">
                  {alloc.tutorRole.replace(/_/g, ' ')}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">{alloc.subjectCode}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{alloc.subjectName}</h3>
              <p className="text-xs text-slate-500">{alloc.batchName} • {alloc.courseName}</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shrink-0">
              <Clock className="w-4 h-4 text-[#0052CC]" />
              <span>{alloc.scheduleSlots.join(' | ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

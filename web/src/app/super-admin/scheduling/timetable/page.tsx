// ============================================================================
// ISML COLLEGE LMS — COLLEGE TIMETABLE GRID
// Department → Program → Semester → Batch → Subject → Faculty → Time Slot
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import { CalendarDays, Clock, MapPin, Plus, Filter, Wifi, Building } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Can } from '@/context/AuthRbacContext';
import { mockTimetable, mockDepartments, mockPrograms } from '@/mock/superAdminData';
import { ClassSessionItem, TimetableSlot } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';
import ScheduleSessionDrawer from '@/components/super-admin/scheduling/ScheduleSessionDrawer';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;

export default function TimetablePage() {
  const { showSuccess } = useToast();
  const [selectedDept, setSelectedDept] = useState(mockDepartments[0].id);
  const [modeFilter, setModeFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(mockTimetable);

  const filteredTimetable = useMemo(() => {
    return timetable.filter((slot) => {
      if (modeFilter === 'ALL') return true;
      const isOnline = slot.deliveryMode === 'ONLINE' || slot.room?.toLowerCase().includes('studio') || slot.room?.toLowerCase().includes('webinar') || slot.room?.toLowerCase().includes('virtual');
      if (modeFilter === 'ONLINE') return isOnline;
      if (modeFilter === 'OFFLINE') return !isOnline;
      return true;
    });
  }, [timetable, modeFilter]);

  const handleSessionScheduled = (session: ClassSessionItem) => {
    const newSlot: TimetableSlot = {
      id: session.id,
      day: 'MONDAY',
      timeSlot: session.timeSlot,
      subjectCode: 'LEC',
      subjectName: session.subjectName,
      facultyName: session.facultyName,
      room: session.roomOrLink,
      deliveryMode: session.deliveryMode,
      meetingUrl: session.meetingUrl,
      batchName: session.batchName,
      department: selectedDept,
      program: 'Degree Program',
      semester: 1,
    };
    setTimetable((prev) => [newSlot, ...prev]);
    showSuccess(`Slot for ${session.subjectName} added to timetable.`);
  };

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Scheduling' }, { label: 'College Timetable' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            College Timetable Grid
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Weekly hybrid lecture allocations: Department → Program → Semester → Batch → Subject
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Online / Offline Mode Filter Segmented Control */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shadow-2xs text-xs font-bold">
            <button
              onClick={() => setModeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                modeFilter === 'ALL'
                  ? 'bg-white text-[#0B2447] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setModeFilter('ONLINE')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                modeFilter === 'ONLINE'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </button>
            <button
              onClick={() => setModeFilter('OFFLINE')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                modeFilter === 'OFFLINE'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-3 h-3" />
              <span>Offline</span>
            </button>
          </div>

          {/* Department Filter Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs text-xs">
            <span className="text-slate-400 font-semibold mr-1.5">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer"
            >
              {mockDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <Can permission="TIMETABLE_CREATE">
            <button
              onClick={() => setIsAddSlotOpen(true)}
              className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Period Slot</span>
            </button>
          </Can>
        </div>
      </div>

      {/* ─── Weekly Timetable Grid Layout ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            B.Sc Computer Science — 1st Year (Semester 1) • Cohort 2026
          </span>
          <span className="text-[11px] font-bold text-[#0052CC]">
            5 Working Days • {filteredTimetable.length} Periods Scheduled ({modeFilter === 'ALL' ? 'Hybrid Delivery' : modeFilter})
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px] divide-y divide-slate-100">
            {DAYS.map((day) => {
              const daySlots = filteredTimetable.filter((slot) => slot.day === day);

              return (
                <div key={day} className="flex items-stretch hover:bg-slate-50/50 transition-colors">
                  {/* Day Header Column */}
                  <div className="w-32 bg-slate-50 p-4 border-r border-slate-200 shrink-0 flex flex-col justify-center">
                    <span className="font-bold text-xs text-[#0B2447]">{day}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {daySlots.length} Scheduled
                    </span>
                  </div>

                  {/* Slot Cards List */}
                  <div className="flex-1 p-3 flex flex-wrap gap-2.5 items-center">
                    {daySlots.length > 0 ? (
                      daySlots.map((slot) => {
                        const isOnline = slot.deliveryMode === 'ONLINE' || slot.room?.toLowerCase().includes('studio') || slot.room?.toLowerCase().includes('webinar') || slot.room?.toLowerCase().includes('virtual');
                        return (
                          <div
                            key={slot.id}
                            className={`p-3 bg-white rounded-xl border shadow-2xs min-w-[220px] max-w-[280px] space-y-1.5 hover:shadow-xs transition-all cursor-pointer ${
                              isOnline
                                ? 'border-blue-200 hover:border-[#0052CC]'
                                : 'border-emerald-200 hover:border-emerald-600'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              <span className="font-mono font-bold text-[#0B2447] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {slot.timeSlot}
                              </span>
                              {isOnline ? (
                                <span className="inline-flex items-center gap-1 font-bold text-[#0052CC] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  <Wifi className="w-2.5 h-2.5" />
                                  <span>Online</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  <Building className="w-2.5 h-2.5 text-emerald-700" />
                                  <span>Offline</span>
                                </span>
                              )}
                            </div>

                            <p className="font-bold text-xs text-[#0B2447] truncate" title={slot.subjectName}>
                              {slot.subjectName}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                              <span className="truncate">{slot.facultyName}</span>
                              <span className={`font-semibold px-1.5 py-0.2 rounded truncate max-w-[110px] ${isOnline ? 'bg-blue-50 text-[#0052CC]' : 'bg-slate-100 text-slate-700'}`}>
                                {slot.room}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic py-2">
                        No assigned classroom slots for this day ({modeFilter.toLowerCase()} mode).
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ScheduleSessionDrawer
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        onSessionScheduled={handleSessionScheduled}
      />
    </div>
  );
}

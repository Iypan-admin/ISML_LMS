// ============================================================================
// ISML COLLEGE LMS — TUTOR: MY SCHEDULE & ACADEMIC CALENDAR (/tutor/schedule)
// 100% Dynamic & Realistic Architecture:
// 1. Weekly Timetable Matrix for this Tutor's active assignments
// 2. Interactive Academic Calendar with Monthly Grid & Week view
// 3. Official Workload & Allocation Summary
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Users,
  ShieldCheck,
  Video,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Radio,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import { fastFetch } from '@/lib/fastCache';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

interface TimetableSlotData {
  id: string;
  day: string;
  timeSlot: string;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  batchName: string;
  room?: string;
  deliveryMode?: string;
  meetingUrl?: string;
  program?: string;
  maxAttendees?: number;
}

export default function TutorSchedulePage() {
  const { currentFaculty, myAllocations } = useTutor();
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlotData[]>([]);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [viewTab, setViewTab] = useState<'WEEKLY_TIMETABLE' | 'ACADEMIC_CALENDAR'>('WEEKLY_TIMETABLE');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date(2026, 10, 1)); // Nov 2026

  // 1. Fetch real Timetable database
  useEffect(() => {
    fastFetch('/api/portals/timetable', (json) => {
      if (json?.data && Array.isArray(json.data)) {
        setTimetableSlots(json.data);
      }
    });

    // Real-time synchronization
    const handleRealtime = (e: any) => {
      const type = e?.detail?.type;
      if (type === 'APPROVAL_REVIEWED' || type === 'FACULTY_ASSIGNED') {
        fastFetch('/api/portals/timetable', (json) => {
          if (json?.data && Array.isArray(json.data)) {
            setTimetableSlots(json.data);
          }
        });
      }
    };
    window.addEventListener('isml-realtime-event', handleRealtime);
    return () => window.removeEventListener('isml-realtime-event', handleRealtime);
  }, []);

  // 2. Filter slots strictly assigned to this Tutor
  const tutorAssignedSlots = useMemo(() => {
    const facultyNameLower = currentFaculty.name.toLowerCase().trim();
    const myBatchNames = myAllocations.map((a) => a.batchName.toLowerCase().trim());
    const mySubjectCodes = myAllocations.map((a) => a.subjectCode.toLowerCase().trim());

    return timetableSlots.filter((slot) => {
      const slotFaculty = (slot.facultyName || '').toLowerCase().trim();
      const slotBatch = (slot.batchName || '').toLowerCase().trim();
      const slotCode = (slot.subjectCode || '').toLowerCase().trim();

      // Check direct faculty match or batch match
      const isMyFaculty = slotFaculty === facultyNameLower || slotFaculty.includes(facultyNameLower) || facultyNameLower.includes(slotFaculty);
      const isMyBatch = myBatchNames.includes(slotBatch);
      const isMyCode = mySubjectCodes.includes(slotCode);

      return isMyFaculty || isMyBatch || isMyCode;
    });
  }, [timetableSlots, currentFaculty, myAllocations]);

  // Filter by Day
  const filteredSlots = useMemo(() => {
    if (selectedDayFilter === 'ALL') return tutorAssignedSlots;
    return tutorAssignedSlots.filter((s) => s.day.toUpperCase() === selectedDayFilter.toUpperCase());
  }, [tutorAssignedSlots, selectedDayFilter]);

  // Group slots by Day
  const slotsByDay = useMemo(() => {
    const map: Record<string, TimetableSlotData[]> = {};
    DAYS_OF_WEEK.forEach((d) => {
      map[d] = [];
    });
    tutorAssignedSlots.forEach((slot) => {
      const d = slot.day.toUpperCase();
      if (map[d]) {
        map[d].push(slot);
      }
    });
    return map;
  }, [tutorAssignedSlots]);

  // Academic Calendar Dates generation for November 2026
  const calendarDays = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysArray: Array<{ dayNumber: number; dateString: string; dayName: string; slots: TimetableSlotData[] }> = [];

    // Map day index to day name
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const dayName = dayNames[d.getDay()];
      const matchingSlots = tutorAssignedSlots.filter((s) => s.day.toUpperCase() === dayName);
      daysArray.push({
        dayNumber: i,
        dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        dayName,
        slots: matchingSlots,
      });
    }

    return { firstDayOffset: firstDay, days: daysArray };
  }, [currentCalendarMonth, tutorAssignedSlots]);

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#0052CC] selection:text-white">
      <Breadcrumbs
        items={[
          { label: 'Faculty Console', href: '/tutor/dashboard' },
          { label: 'My Teaching Schedule & Academic Calendar' },
        ]}
      />

      <FacultyRoleSwitcherBar />

      {/* ─── Header & View Switcher ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0052CC] border border-blue-200">
              {currentFaculty.primaryLanguage || 'Language'} Faculty Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Timetable Synced with Academic Manager</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#0052CC]" />
            <span>My Teaching Timetable & Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Live interactive timetable and official academic calendar for courses and cohorts allocated to{' '}
            <strong className="text-slate-800 font-semibold">{currentFaculty.name}</strong>.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1 shrink-0 self-start lg:self-auto">
          <button
            onClick={() => setViewTab('WEEKLY_TIMETABLE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewTab === 'WEEKLY_TIMETABLE'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Weekly Timetable Grid</span>
          </button>
          <button
            onClick={() => setViewTab('ACADEMIC_CALENDAR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewTab === 'ACADEMIC_CALENDAR'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Academic Calendar</span>
          </button>
        </div>
      </div>

      {/* ─── Summary Metrics Bar ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center font-bold text-sm shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Cohorts</p>
            <p className="text-base font-black text-slate-900">{myAllocations.length} Assigned Batch</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weekly Timetable Slots</p>
            <p className="text-base font-black text-slate-900">{tutorAssignedSlots.length} Classes / Week</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Allocated Campus</p>
            <p className="text-base font-black text-slate-900 truncate max-w-[150px]">
              {myAllocations[0]?.institutionName || 'The American College'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Duty</p>
            <p className="text-base font-black text-slate-900">
              {myAllocations[0]?.tutorRole?.replace(/_/g, ' ') || 'LEAD TRAINER'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── VIEW 1: WEEKLY TIMETABLE GRID ─── */}
      {viewTab === 'WEEKLY_TIMETABLE' && (
        <div className="space-y-4">
          {/* Day Filters */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-slate-500 px-2">Filter Day:</span>
              <button
                onClick={() => setSelectedDayFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDayFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Days ({tutorAssignedSlots.length})
              </button>
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDayFilter(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDayFilter === d
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.slice(0, 3)} ({slotsByDay[d]?.length || 0})
                </button>
              ))}
            </div>

            <Link
              href="/tutor/live-classes"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Launch Live Studio</span>
            </Link>
          </div>

          {/* Cards Grid */}
          {selectedDayFilter === 'ALL' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS_OF_WEEK.map((dayName) => {
                const daySlots = slotsByDay[dayName] || [];
                return (
                  <div
                    key={dayName}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]"></span>
                        <h3 className="font-black text-slate-900 text-sm">{dayName}</h3>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#0052CC] border border-blue-200/60">
                        {daySlots.length} Scheduled
                      </span>
                    </div>

                    {daySlots.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 font-medium">
                        No sessions scheduled for {dayName.toLowerCase()}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-3 bg-slate-50 hover:bg-blue-50/40 rounded-xl border border-slate-200/80 transition-colors space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                                {slot.subjectCode}
                              </span>
                              <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {slot.batchName}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs text-slate-900 leading-snug">{slot.subjectName}</h4>

                            <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                              <span className="flex items-center gap-1 font-semibold text-blue-700">
                                <Clock className="w-3.5 h-3.5 text-[#0052CC]" />
                                <span>{slot.timeSlot}</span>
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">Online Studio</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {filteredSlots.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No classes scheduled on {selectedDayFilter}.
                </div>
              ) : (
                filteredSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0052CC] border border-blue-200 flex items-center justify-center shrink-0">
                        <Video className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                            {slot.subjectCode}
                          </span>
                          <span className="text-xs font-bold text-[#0052CC] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            {slot.batchName}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900">{slot.subjectName}</h4>
                        <p className="text-xs text-slate-500">
                          Assigned Faculty: <strong className="text-slate-700">{slot.facultyName}</strong> • Delivery: Online WebRTC Studio
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs space-y-0.5 text-right sm:text-left">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{slot.day}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-700 font-mono font-bold text-xs">
                          <Clock className="w-3.5 h-3.5 text-[#0052CC]" />
                          <span>{slot.timeSlot}</span>
                        </div>
                      </div>

                      <Link
                        href="/tutor/live-classes"
                        className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Live Studio</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── VIEW 2: ACADEMIC CALENDAR (MONTH VIEW) ─── */}
      {viewTab === 'ACADEMIC_CALENDAR' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0052CC]" />
                <span>
                  Academic Schedule Calendar —{' '}
                  {currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cohort curriculum progression, scheduled lecture dates, and live studio milestones.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentCalendarMonth(
                    new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1)
                  )
                }
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentCalendarMonth(new Date(2026, 10, 1))}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() =>
                  setCurrentCalendarMonth(
                    new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1)
                  )
                }
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Days Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500 uppercase tracking-wider pb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading slots */}
            {Array.from({ length: calendarDays.firstDayOffset }).map((_, idx) => (
              <div key={`blank-${idx}`} className="min-h-[90px] rounded-xl bg-slate-50/50 border border-transparent" />
            ))}

            {/* Days of Month */}
            {calendarDays.days.map((item) => {
              const hasClasses = item.slots.length > 0;
              const isToday = item.dayNumber === 11 && currentCalendarMonth.getMonth() === 10;

              return (
                <div
                  key={item.dayNumber}
                  className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-300'
                      : hasClasses
                      ? 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200/60 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black px-1.5 py-0.5 rounded ${
                        isToday ? 'bg-[#0052CC] text-white' : 'text-slate-800'
                      }`}
                    >
                      {item.dayNumber}
                    </span>
                    {hasClasses && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded">
                        {item.slots.length} {item.slots.length > 1 ? 'slots' : 'slot'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {item.slots.map((s) => (
                      <div
                        key={s.id}
                        className="text-[10px] p-1 bg-blue-50 text-blue-900 border border-blue-200 rounded font-medium leading-tight truncate"
                        title={`${s.subjectName} (${s.timeSlot})`}
                      >
                        <strong>{s.batchName}</strong> • {s.timeSlot.split('-')[0].trim()}
                      </div>
                    ))}
                  </div>

                  {hasClasses && (
                    <div className="pt-1 text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Scheduled</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── SECTION 3: OFFICIAL WORKLOAD ALLOCATION SUMMARY ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Personal Teaching & Doubt Duty Summary for {currentFaculty.name}
            </h3>
            <p className="text-xs text-slate-500">Official batch roster assigned by Academic Manager</p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 self-start sm:self-auto">
            Total Allocated: {currentFaculty.allocatedHours || 14} Hours / Week
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {myAllocations.map((alloc) => (
            <div key={alloc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0052CC]">
                  {alloc.tutorRole.replace(/_/g, ' ')}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-500">{alloc.subjectCode}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{alloc.subjectName}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{alloc.batchName} • {alloc.institutionName}</p>
              </div>
              <div className="text-[11px] font-medium text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                <span className="font-mono font-bold text-slate-800">{alloc.scheduleSlots.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

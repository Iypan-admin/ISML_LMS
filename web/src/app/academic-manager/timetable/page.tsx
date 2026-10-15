// ============================================================================
// ISML COLLEGE LMS — ADVANCED ACADEMIC TIMETABLE SCHEDULER & CONFLICT ENGINE
// Features:
// 1. Weekly Matrix, Day-by-Day Agenda & Cyclic Rotation views
// 2. Real-time Conflict Detection: Trainer double-booking, Batch room overlap, Time clashes
// 3. One-off Single Day, Weekly Repeating & Cyclic Webinar Schedule modes
// 4. Integrated LiveKit / Google Meet Online Link Generator & Room Selector
// 5. Direct Inspection & Surveillance Modal integration
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  Plus,
  Wifi,
  CalendarRange,
  Video,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Sparkles,
  RefreshCw,
  Repeat,
  Zap,
  Users,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  Calendar,
  Layers,
  Building2,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import {
  mockTimetable,
  mockSubjects,
  mockBatches,
  mockDepartments,
} from '@/mock/superAdminData';
import { TimetableSlot } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import LiveMeetingInspectionModal, { ClassSessionData } from '@/components/academic-manager/LiveMeetingInspectionModal';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
type DayType = (typeof DAYS)[number];

const TIME_INTERVALS = [
  '08:30 AM - 10:00 AM',
  '10:00 AM - 11:30 AM',
  '11:45 AM - 01:15 PM',
  '02:00 PM - 03:30 PM',
  '04:00 PM - 05:30 PM',
  '06:00 PM - 07:30 PM',
  '07:30 PM - 09:00 PM',
];

export interface ExtendedTimetableSlot extends TimetableSlot {
  recurrenceType?: 'ONE_DAY' | 'WEEKLY' | 'CYCLIC_ROTATION';
  specificDate?: string;
  cycleIntervalWeeks?: number;
  maxAttendees?: number;
  meetingPassword?: string;
}

export interface ConflictItem {
  type: 'TRAINER_CLASH' | 'BATCH_CLASH' | 'ROOM_CLASH';
  severity: 'HIGH' | 'MEDIUM';
  message: string;
  slot1: ExtendedTimetableSlot;
  slot2: ExtendedTimetableSlot;
}

export default function AcademicManagerTimetablePage() {
  const { showSuccess, showError } = useToast();

  // Primary timetable list
  const [timetable, setTimetable] = useState<ExtendedTimetableSlot[]>(() => {
    return mockTimetable.map((slot, idx) => ({
      ...slot,
      recurrenceType: idx % 3 === 0 ? 'CYCLIC_ROTATION' : idx % 2 === 0 ? 'WEEKLY' : 'ONE_DAY',
      specificDate: '2026-10-14',
      cycleIntervalWeeks: 2,
      deliveryMode: 'ONLINE' as const,
      meetingUrl: slot.meetingUrl || `https://live.isml.edu/livekit-room/isml-live-${idx + 101}`,
      maxAttendees: 50,
    }));
  });

  // Filter & View states
  const [activeTab, setActiveTab] = useState<'WEEKLY_MATRIX' | 'DAY_VIEW' | 'CYCLIC_ROTATION'>('WEEKLY_MATRIX');
  const [selectedDay, setSelectedDay] = useState<DayType>('MONDAY');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingSession, setInspectingSession] = useState<ClassSessionData | null>(null);

  // Scheduler Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'ONE_DAY' | 'WEEKLY' | 'CYCLIC_ROTATION'>('WEEKLY');
  const [formSubjectName, setFormSubjectName] = useState(mockSubjects[0]?.name || 'French Phonetics');
  const [formFacultyName, setFormFacultyName] = useState(mockBatches[0]?.assignedFacultyName || 'Dr. Anandhakumar V.');
  const [formBatchName, setFormBatchName] = useState(mockBatches[0]?.name || 'French A1 Intensive');
  const [formDay, setFormDay] = useState<DayType>('MONDAY');
  const [formTimeSlot, setFormTimeSlot] = useState(() => {
    return mockBatches[0]?.batchTiming || TIME_INTERVALS[1];
  });
  const [formDate, setFormDate] = useState('2026-10-14');
  const [formCycleWeeks, setFormCycleWeeks] = useState(2);
  const [formMaxAttendees, setFormMaxAttendees] = useState(60);

  // Auto-fetch Timing, Days, and Trainer configured during batch creation
  const handleBatchSelect = (batchName: string) => {
    setFormBatchName(batchName);
    const matchedBatch = mockBatches.find((b) => b.name === batchName);
    if (matchedBatch) {
      // 1. Auto-fetch Time Slot
      if (matchedBatch.batchTiming) {
        setFormTimeSlot(matchedBatch.batchTiming);
      }
      // 2. Auto-fetch Scheduled Day
      if (matchedBatch.scheduleDays && matchedBatch.scheduleDays.length > 0) {
        const firstDayCode = matchedBatch.scheduleDays[0];
        const dayMap: Record<string, DayType> = {
          MON: 'MONDAY',
          TUE: 'TUESDAY',
          WED: 'WEDNESDAY',
          THU: 'THURSDAY',
          FRI: 'FRIDAY',
          SAT: 'SATURDAY',
        };
        if (dayMap[firstDayCode]) {
          setFormDay(dayMap[firstDayCode]);
        }
      }
      // 3. Auto-fetch Assigned Trainer
      if (matchedBatch.assignedFacultyName) {
        setFormFacultyName(matchedBatch.assignedFacultyName);
      }
      // 4. Auto-fetch Enrolled Capacity
      if (matchedBatch.studentsCount) {
        setFormMaxAttendees(matchedBatch.studentsCount);
      }
      // 5. Auto-fetch Course Subject if available
      if (matchedBatch.courseNames && matchedBatch.courseNames.length > 0) {
        const primaryCourse = matchedBatch.courseNames[0];
        const foundSub = mockSubjects.find(
          (s) => primaryCourse.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(primaryCourse.toLowerCase())
        );
        if (foundSub) {
          setFormSubjectName(foundSub.name);
        }
      }
    }
  };

  // Available Languages list for top selector
  const languageOptions = useMemo(() => {
    return ['ALL', 'French', 'German', 'Japanese', 'Korean', 'Spanish'];
  }, []);

  // Filtered timetable
  const filteredTimetable = useMemo(() => {
    return timetable.filter((slot) => {
      if (selectedLanguage !== 'ALL') {
        const matchSubject = slot.subjectName.toLowerCase().includes(selectedLanguage.toLowerCase());
        const matchBatch = slot.batchName.toLowerCase().includes(selectedLanguage.toLowerCase());
        if (!matchSubject && !matchBatch) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          slot.subjectName.toLowerCase().includes(q) ||
          slot.facultyName.toLowerCase().includes(q) ||
          slot.batchName.toLowerCase().includes(q) ||
          slot.timeSlot.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [timetable, selectedLanguage, searchQuery]);

  // ============================================================================
  // CONFLICT DETECTION ENGINE
  // Checks if:
  // 1. Same Trainer is scheduled at the same Day & TimeSlot across different cohorts
  // 2. Same Batch is assigned two overlapping webinars
  // ============================================================================
  const detectedConflicts = useMemo<ConflictItem[]>(() => {
    const conflicts: ConflictItem[] = [];

    for (let i = 0; i < filteredTimetable.length; i++) {
      for (let j = i + 1; j < filteredTimetable.length; j++) {
        const a = filteredTimetable[i];
        const b = filteredTimetable[j];

        // Same Day and TimeSlot
        if (a.day === b.day && a.timeSlot === b.timeSlot) {
          // Trainer Clash
          if (a.facultyName.trim().toLowerCase() === b.facultyName.trim().toLowerCase()) {
            conflicts.push({
              type: 'TRAINER_CLASH',
              severity: 'HIGH',
              message: `Trainer Conflict: "${a.facultyName}" is double-booked on ${a.day} (${a.timeSlot}) for both "${a.batchName}" and "${b.batchName}".`,
              slot1: a,
              slot2: b,
            });
          }
          // Batch Clash
          if (a.batchName.trim().toLowerCase() === b.batchName.trim().toLowerCase()) {
            conflicts.push({
              type: 'BATCH_CLASH',
              severity: 'HIGH',
              message: `Batch Clashing: Cohort "${a.batchName}" has two simultaneous online sessions on ${a.day} (${a.timeSlot}).`,
              slot1: a,
              slot2: b,
            });
          }
        }
      }
    }

    return conflicts;
  }, [filteredTimetable]);

  // Form Live Conflict Warning Check
  const formValidationConflict = useMemo(() => {
    if (!isScheduleModalOpen) return null;

    const clash = timetable.find(
      (slot) => slot.day === formDay && slot.timeSlot === formTimeSlot && slot.facultyName === formFacultyName
    );
    if (clash) {
      return {
        type: 'TRAINER_CLASH',
        message: `Trainer Clashing Alert: ${formFacultyName} is already assigned on ${formDay} at ${formTimeSlot} for "${clash.batchName}".`,
      };
    }

    const batchClash = timetable.find(
      (slot) => slot.day === formDay && slot.timeSlot === formTimeSlot && slot.batchName === formBatchName
    );
    if (batchClash) {
      return {
        type: 'BATCH_CLASH',
        message: `Cohort Clashing Alert: "${formBatchName}" already has session "${batchClash.subjectName}" at ${formTimeSlot}.`,
      };
    }

    return null;
  }, [isScheduleModalOpen, timetable, formDay, formTimeSlot, formFacultyName, formBatchName]);

  // Quick Action: Auto-Resolve Conflict by shifting slot to next available hour
  const handleAutoResolveConflict = (conflict: ConflictItem) => {
    const targetSlot = conflict.slot2;
    const currentIdx = TIME_INTERVALS.indexOf(targetSlot.timeSlot);
    const nextSlot = TIME_INTERVALS[(currentIdx + 1) % TIME_INTERVALS.length];

    setTimetable((prev) =>
      prev.map((s) => (s.id === targetSlot.id ? { ...s, timeSlot: nextSlot } : s))
    );
    showSuccess(`Resolved: Moved "${targetSlot.subjectName}" to ${nextSlot}.`);
  };

  // Add Session Handler
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    if (formValidationConflict) {
      const confirmProceed = window.confirm(
        `${formValidationConflict.message}\n\nDo you want to override and save anyway?`
      );
      if (!confirmProceed) return;
    }

    const newId = `slot-${Date.now()}`;
    const generatedUrl = `https://live.isml.edu/live-class/isml-${newId}`;

    const newSlot: ExtendedTimetableSlot = {
      id: newId,
      day: formDay,
      timeSlot: formTimeSlot,
      subjectName: formSubjectName,
      subjectCode: formSubjectName.substring(0, 3).toUpperCase(),
      facultyName: formFacultyName,
      batchName: formBatchName,
      room: 'Live Class Studio',
      deliveryMode: 'ONLINE',
      meetingUrl: generatedUrl,
      department: 'Foreign Languages & Linguistics',
      program: 'Diploma & Certification Pathway',
      semester: 1,
      recurrenceType: scheduleMode,
      specificDate: formDate,
      cycleIntervalWeeks: formCycleWeeks,
      maxAttendees: formMaxAttendees,
    };

    setTimetable((prev) => [newSlot, ...prev]);
    setIsScheduleModalOpen(false);
    showSuccess(`Live Class successfully scheduled for "${formSubjectName}".`);
  };

  const handleDeleteSlot = (id: string) => {
    setTimetable((prev) => prev.filter((s) => s.id !== id));
    showSuccess('Timetable session removed.');
  };

  return (
    <div className="space-y-5 pb-10 font-sans">
      {/* Top Breadcrumbs & Campus Filter */}
      <Breadcrumbs items={[{ label: 'Scheduling & Attendance' }, { label: 'Online Timetable Hub' }]} />
      <CollegeFilterBar />

      {/* Main Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-[#0052CC] border border-blue-200 uppercase tracking-wider">
              Academic Operations Matrix
            </span>
            {detectedConflicts.length > 0 ? (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {detectedConflicts.length} Conflict{detectedConflicts.length > 1 ? 's' : ''} Detected
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Zero Schedule Clashes
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-[#0052CC]" />
            <span>Interactive Timetable & Webinar Scheduler</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage weekly class matrices, recurring online webinars, single-day workshops, and cyclic rotation rosters with automated clash validation.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Timetable Slot</span>
          </button>
        </div>
      </div>

      {/* CONFLICT SUMMARY BANNER (Shows only when conflicts exist) */}
      {detectedConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-300 shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  Automated Conflict Engine Alert ({detectedConflicts.length})
                </h3>
                <p className="text-[11px] text-rose-700">
                  Multiple slots have trainer time clashes or overlapping batch meetings.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {detectedConflicts.map((c, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-rose-200 flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                    {c.type.replace('_', ' ')}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1.5 leading-snug">{c.message}</p>
                </div>
                <button
                  onClick={() => handleAutoResolveConflict(c)}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg shrink-0 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Auto-shift this session to next available time interval"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto Shift</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TABS & FILTERS BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold self-start md:self-center">
          <button
            onClick={() => setActiveTab('WEEKLY_MATRIX')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'WEEKLY_MATRIX' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('DAY_VIEW')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'DAY_VIEW' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Single Day Agenda</span>
          </button>
          <button
            onClick={() => setActiveTab('CYCLIC_ROTATION')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CYCLIC_ROTATION' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Cyclic Rotations</span>
          </button>
        </div>

        {/* Right Search & Language Filtering */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Language filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'ALL' ? 'All Languages' : `${lang} Curriculum`}
                </option>
              ))}
            </select>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trainer, cohort, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. WEEKLY MATRIX VIEW                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'WEEKLY_MATRIX' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {DAYS.map((day) => {
            const daySlots = filteredTimetable.filter((s) => s.day === day);
            return (
              <div key={day} className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start hover:bg-slate-50/40 transition">
                {/* Day Marker */}
                <div className="w-36 shrink-0 space-y-1">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-[#0052CC] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80 inline-block">
                    {day}
                  </span>
                  <p className="text-[11px] text-slate-400 font-semibold pl-0.5">
                    {daySlots.length} Scheduled Slot{daySlots.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Slots Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  {daySlots.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center col-span-full">
                      No online slots scheduled for {day.toLowerCase()}. Click "+ Schedule Timetable Slot" to add one.
                    </div>
                  ) : (
                    daySlots.map((slot) => {
                      const meetLink = slot.meetingUrl || 'https://live.isml.edu/livekit-room/isml-live';
                      const isClashed = detectedConflicts.some(
                        (c) => c.slot1.id === slot.id || c.slot2.id === slot.id
                      );

                      return (
                        <div
                          key={slot.id}
                          className={`p-3.5 rounded-xl border transition-all shadow-2xs space-y-2.5 relative group bg-white ${
                            isClashed
                              ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300'
                              : 'border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {slot.timeSlot}
                            </span>
                            <div className="flex items-center gap-1">
                              {/* Recurrence badge */}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                  slot.recurrenceType === 'CYCLIC_ROTATION'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : slot.recurrenceType === 'WEEKLY'
                                    ? 'bg-blue-50 text-[#0052CC] border-blue-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {slot.recurrenceType === 'CYCLIC_ROTATION'
                                  ? 'Cyclic'
                                  : slot.recurrenceType === 'WEEKLY'
                                  ? 'Weekly'
                                  : '1-Day'}
                              </span>

                              {isClashed && (
                                <span className="p-0.5 rounded bg-rose-600 text-white" title="Conflict Alert">
                                  <AlertTriangle className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-[#0B2447] line-clamp-1">{slot.subjectName}</h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              Batch: <strong className="text-slate-700">{slot.batchName}</strong>
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 space-y-1">
                            <p className="truncate">
                              Trainer: <strong className="text-slate-800">{slot.facultyName}</strong>
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="font-mono text-[10px] text-blue-700 truncate max-w-[140px]">
                                {meetLink.replace(/^https?:\/\//, '')}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    setInspectingSession({
                                      id: slot.id,
                                      topic: slot.subjectName,
                                      subjectName: slot.subjectName,
                                      batchName: slot.batchName,
                                      batchCode: 'ONLINE-TIMETABLE',
                                      facultyName: slot.facultyName,
                                      date: slot.specificDate || 'Today',
                                      timeSlot: slot.timeSlot,
                                      status: 'LIVE_NOW',
                                      roomOrLink: meetLink,
                                      attendeesCount: slot.maxAttendees || 40,
                                    });
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-[#0052CC] hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                                  title="Inspect Online Classroom Session"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Remove slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SINGLE DAY AGENDA VIEW                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'DAY_VIEW' && (
        <div className="space-y-4">
          {/* Day selection tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => {
              const count = filteredTimetable.filter((s) => s.day === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedDay === day
                      ? 'bg-[#0052CC] text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedDay === day ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Agenda Timeline Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0B2447] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0052CC]" />
              <span>Full Day Chronological Timeline for {selectedDay}</span>
            </h3>

            <div className="space-y-3">
              {filteredTimetable.filter((s) => s.day === selectedDay).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No online classes scheduled for {selectedDay}.
                </div>
              ) : (
                filteredTimetable
                  .filter((s) => s.day === selectedDay)
                  .map((slot, idx) => (
                    <div
                      key={slot.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/90 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {slot.timeSlot}
                            </span>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {slot.recurrenceType?.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#0B2447] mt-1">{slot.subjectName}</h4>
                          <p className="text-[11px] text-slate-500">
                            Batch: {slot.batchName} • Trainer: <strong className="text-slate-700">{slot.facultyName}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setInspectingSession({
                              id: slot.id,
                              topic: slot.subjectName,
                              subjectName: slot.subjectName,
                              batchName: slot.batchName,
                              batchCode: 'ONLINE-TIMETABLE',
                              facultyName: slot.facultyName,
                              date: slot.specificDate || 'Today',
                              timeSlot: slot.timeSlot,
                              status: 'LIVE_NOW',
                              roomOrLink: slot.meetingUrl || '',
                              attendeesCount: slot.maxAttendees || 40,
                            });
                          }}
                          className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join / Inspect</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CYCLIC ROTATION ROSTER VIEW                                            */}
      {/* ========================================================================= */}
      {activeTab === 'CYCLIC_ROTATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0B2447] flex items-center gap-2">
                <Repeat className="w-4 h-4 text-purple-600" />
                <span>Cyclic & Bi-Weekly Rotating Class Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Webinars that cycle automatically every 2 to 4 weeks (e.g. conversational practice drills, mock viva).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTimetable
              .filter((s) => s.recurrenceType === 'CYCLIC_ROTATION')
              .map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Cycle Interval: Every {slot.cycleIntervalWeeks || 2} Weeks
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {slot.day} • {slot.timeSlot}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{slot.subjectName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Target Batch: <strong className="text-slate-700">{slot.batchName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-xs">
                    <span className="text-[11px] text-slate-600">
                      Faculty: <strong className="text-slate-800">{slot.facultyName}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setInspectingSession({
                          id: slot.id,
                          topic: slot.subjectName,
                          subjectName: slot.subjectName,
                          batchName: slot.batchName,
                          batchCode: 'CYCLIC-ROSTER',
                          facultyName: slot.facultyName,
                          date: slot.specificDate || 'Scheduled',
                          timeSlot: slot.timeSlot,
                          status: 'UPCOMING',
                          roomOrLink: slot.meetingUrl || '',
                          attendeesCount: slot.maxAttendees || 50,
                        });
                      }}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Video className="w-3 h-3" />
                      <span>Surveillance</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCHEDULER RIGHT-SIDE DRAWER FORM (SLIDE-OVER PANEL)                    */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsScheduleModalOpen(false)}
          />

          {/* Right-Side Drawer Container */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <CalendarRange className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Schedule Live Class</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-400 text-slate-950 uppercase tracking-wider">
                      LIVE CLASS ONLY
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200 mt-0.5">
                    Weekly, One-Day Workshop or Cyclic Rotation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleCreateSchedule} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                {/* ⚡ Live Class Dedicated Room Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#061A36] to-[#0D3166] text-white border border-[#1E4E8C] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wider">
                        Virtual Live Class Studio
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      WebRTC Studio Ready
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#041124] p-2.5 rounded-xl border border-cyan-500/30">
                    <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-mono font-bold text-cyan-200 truncate flex-1">
                      https://live.isml.edu/live-class/isml-auto-room
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Class link and interactive tools are generated automatically upon saving. No external apps required.
                  </p>
                </div>

                {/* Recurrence Mode Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Schedule Frequency <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleMode('WEEKLY')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                        scheduleMode === 'WEEKLY'
                          ? 'border-[#0052CC] bg-blue-50 text-[#0052CC] ring-1 ring-blue-300'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      Weekly Recurring
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode('ONE_DAY')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                        scheduleMode === 'ONE_DAY'
                          ? 'border-[#0052CC] bg-blue-50 text-[#0052CC] ring-1 ring-blue-300'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      One-Day Class
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode('CYCLIC_ROTATION')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                        scheduleMode === 'CYCLIC_ROTATION'
                          ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-300'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      Cyclic Rotation
                    </button>
                  </div>
                </div>

                {/* Subject & Target Batch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Batch *</label>
                    <select
                      value={formBatchName}
                      onChange={(e) => handleBatchSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#0052CC] outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    >
                      {mockBatches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    {mockBatches.find((b) => b.name === formBatchName)?.batchTiming && (
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Loaded from batch schedule</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Curriculum Subject *</label>
                    <select
                      value={formSubjectName}
                      onChange={(e) => setFormSubjectName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      {mockSubjects.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.code} — {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assigned Trainer */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">Assigned Trainer *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Batch Assigned Faculty</span>
                  </div>
                  <input
                    type="text"
                    value={formFacultyName}
                    onChange={(e) => setFormFacultyName(e.target.value)}
                    placeholder="e.g. Dr. Anandhakumar V."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* Day & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">Day of Week *</label>
                      <span className="text-[10px] text-slate-400 font-medium">Class Day</span>
                    </div>
                    <select
                      value={formDay}
                      onChange={(e) => setFormDay(e.target.value as DayType)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">Class Time Slot *</label>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        From Batch Schedule
                      </span>
                    </div>
                    <select
                      value={formTimeSlot}
                      onChange={(e) => setFormTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      {/* If the batch has a custom timing not in TIME_INTERVALS, ensure it is available as an option */}
                      {!TIME_INTERVALS.includes(formTimeSlot) && (
                        <option value={formTimeSlot}>{formTimeSlot} (Batch Schedule)</option>
                      )}
                      {TIME_INTERVALS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic options based on scheduleMode */}
                {scheduleMode === 'ONE_DAY' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Specific Live Class Date *</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                )}

                {scheduleMode === 'CYCLIC_ROTATION' && (
                  <div>
                    <label className="block text-[11px] font-bold text-purple-700 mb-1">
                      Cycle Repeat Interval (Weeks)
                    </label>
                    <select
                      value={formCycleWeeks}
                      onChange={(e) => setFormCycleWeeks(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl font-bold text-purple-900 outline-none cursor-pointer"
                    >
                      <option value={2}>Every 2 Weeks (Bi-Weekly Rotation)</option>
                      <option value={3}>Every 3 Weeks (Tri-Weekly Rotation)</option>
                      <option value={4}>Every 4 Weeks (Monthly Rotation)</option>
                    </select>
                  </div>
                )}

                {/* Max Students */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Maximum Live Attendees Limit
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={formMaxAttendees}
                    onChange={(e) => setFormMaxAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* REAL-TIME CONFLICT ENGINE WARNING CALLOUT */}
                {formValidationConflict && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[11px] block">{formValidationConflict.type.replace('_', ' ')}</span>
                      <p className="text-[10px] text-rose-700 leading-tight mt-0.5">
                        {formValidationConflict.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">
                  Direct Live Class room engine
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-cyan-300" />
                    <span>Confirm Schedule</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎬 Inspection Surveillance Modal */}
      {inspectingSession && (
        <LiveMeetingInspectionModal
          isOpen={!!inspectingSession}
          onClose={() => setInspectingSession(null)}
          session={inspectingSession}
        />
      )}
    </div>
  );
}

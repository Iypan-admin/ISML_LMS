// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: LIVE CLASSES (/academic-manager/live-classes)
// Date & Calendar-based Live Online Class Schedules, Meeting Inspection & Attendance
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  Video,
  Plus,
  Edit2,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Wifi,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  School,
  Building2,
  Radio,
  Eye,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import { ClassSessionItem } from '@/types/rbac';
import { mockBatches, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import ScheduleClassModal from '@/components/academic-manager/ScheduleClassModal';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import LiveMeetingInspectionModal, { ClassSessionData } from '@/components/academic-manager/LiveMeetingInspectionModal';

interface EnhancedLiveClass {
  id: string;
  title: string;
  language: string;
  level: string;
  courseName: string;
  batchName: string;
  batchCode: string;
  tutorName: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  timeSlot: string;
  durationMinutes: number;
  meetingUrl: string;
  roomName: string;
  status: 'LIVE' | 'TODAY' | 'UPCOMING' | 'COMPLETED' | 'DRAFT';
  isBroadcastingNow: boolean;
  tutorJoined: boolean;
  isScheduledToday: boolean;
  enrolledStudentsCount: number;
  attendedStudentsCount: number;
  recordingAvailable: boolean;
  recordingUrl?: string;
  institutionId: string;
  campusName: string;
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Monday, Tuesday...
  formattedDate: string; // "13 Nov 2026"
}

export default function AcademicManagerLiveClassesPage() {
  const { showSuccess, showWarning } = useToast();
  const { selectedCollegeId, isOverall, isSchoolMode } = useCollege();
  const [classes, setClasses] = useState<EnhancedLiveClass[]>([]);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'TABLE'>('CALENDAR');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL'); // 'ALL' | 'TODAY' | 'YYYY-MM-DD'
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE_NOW' | 'TODAY' | 'UPCOMING'>('ALL');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editSession, setEditSession] = useState<ClassSessionItem | null>(null);
  const [deleteSession, setDeleteSession] = useState<ClassSessionItem | null>(null);
  const [inspectingSession, setInspectingSession] = useState<ClassSessionData | null>(null);

  // Fetch live classes from backend API
  const fetchLiveClasses = React.useCallback(async () => {
    try {
      const res = await fetch('/api/live-classes', { cache: 'no-store' });
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        const mapped: EnhancedLiveClass[] = json.data.map((c: any) => {
          const startDate = c.scheduledStartTime ? new Date(c.scheduledStartTime) : new Date();
          const dateStr = startDate.toISOString().split('T')[0];
          const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
          const formattedDate = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

          return {
            id: c.id,
            title: c.title || c.subjectName || 'Sample Course',
            language: c.language || 'French',
            level: c.level || 'A1',
            courseName: c.courseName || 'Sample Course',
            batchName: c.batchName || 'Interactive Batch',
            batchCode: c.batchCode || 'BAT-01',
            tutorName: c.tutorName || 'Joy JK',
            scheduledStartTime: c.scheduledStartTime,
            scheduledEndTime: c.scheduledEndTime,
            timeSlot: c.timeSlot || `${c.durationMinutes || 90} Mins Session`,
            durationMinutes: c.durationMinutes || 90,
            meetingUrl: c.meetingUrl || '',
            roomName: c.roomName || '',
            status: c.isBroadcastingNow ? 'LIVE' : c.status || 'UPCOMING',
            isBroadcastingNow: Boolean(c.isBroadcastingNow),
            tutorJoined: Boolean(c.tutorJoined),
            isScheduledToday: Boolean(c.isScheduledToday),
            enrolledStudentsCount: c.enrolledStudentsCount || 10,
            attendedStudentsCount: c.attendedStudentsCount || 0,
            recordingAvailable: Boolean(c.recordingAvailable),
            recordingUrl: c.recordingUrl,
            institutionId: c.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4',
            campusName: c.campusName || 'The American College',
            dateStr,
            dayName,
            formattedDate,
          };
        });
        setClasses(mapped);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    fetchLiveClasses();
    const interval = setInterval(fetchLiveClasses, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveClasses]);

  // Filter classes based on College/School scope and status
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      // Status filter
      if (statusFilter === 'LIVE_NOW' && !c.isBroadcastingNow) return false;
      if (statusFilter === 'TODAY' && !c.isScheduledToday) return false;
      if (statusFilter === 'UPCOMING' && (c.status === 'COMPLETED' || c.isBroadcastingNow)) return false;

      // School vs College type filter
      const isClassSchool =
        c.batchName.toLowerCase().includes('school') ||
        c.batchName.includes('Grade') ||
        c.title.toLowerCase().includes('school');

      if (isSchoolMode && !isClassSchool && classes.some((cl) => cl.batchName.toLowerCase().includes('school'))) {
        return false;
      }
      if (!isSchoolMode && isClassSchool) {
        return false;
      }

      if (isOverall) return true;
      if (c.institutionId && c.institutionId === selectedCollegeId) return true;
      const batch = mockBatches.find((b) => b.name === c.batchName || b.code === c.batchCode);
      if (batch?.institutionId && batch.institutionId === selectedCollegeId) return true;
      return true;
    });
  }, [classes, statusFilter, isSchoolMode, isOverall, selectedCollegeId]);

  // Unique list of dates available in sorted order
  const dateTabs = useMemo(() => {
    const map = new Map<string, { dateStr: string; dayName: string; formattedDate: string; count: number; isToday: boolean }>();
    filteredClasses.forEach((c) => {
      if (!map.has(c.dateStr)) {
        map.set(c.dateStr, {
          dateStr: c.dateStr,
          dayName: c.dayName,
          formattedDate: c.formattedDate,
          count: 0,
          isToday: c.isScheduledToday,
        });
      }
      map.get(c.dateStr)!.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [filteredClasses]);

  // Classes filtered by the active date tab
  const activeDateClasses = useMemo(() => {
    if (selectedDayFilter === 'ALL') return filteredClasses;
    if (selectedDayFilter === 'TODAY') return filteredClasses.filter((c) => c.isScheduledToday);
    return filteredClasses.filter((c) => c.dateStr === selectedDayFilter);
  }, [filteredClasses, selectedDayFilter]);

  // Group classes by Date string for Calendar grouping view
  const groupedByDate = useMemo(() => {
    const groups: { [dateStr: string]: { dateStr: string; dayName: string; formattedDate: string; isToday: boolean; items: EnhancedLiveClass[] } } = {};
    activeDateClasses.forEach((c) => {
      if (!groups[c.dateStr]) {
        groups[c.dateStr] = {
          dateStr: c.dateStr,
          dayName: c.dayName,
          formattedDate: c.formattedDate,
          isToday: c.isScheduledToday,
          items: [],
        };
      }
      groups[c.dateStr].items.push(c);
    });
    return Object.values(groups).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [activeDateClasses]);

  // Handlers
  const handleLaunchInspect = (row: EnhancedLiveClass) => {
    if (!row.isBroadcastingNow) {
      showWarning(
        `Class is scheduled for ${row.dayName} at ${row.timeSlot}. Joy JK has not started the broadcast yet.`,
        'Session Not Live'
      );
      return;
    }
    setInspectingSession({
      id: row.id,
      topic: row.title,
      subjectName: row.courseName,
      batchName: row.batchName,
      batchCode: row.batchCode,
      facultyName: row.tutorName,
      date: row.dateStr,
      timeSlot: row.timeSlot,
      status: 'LIVE_NOW',
      roomOrLink: row.meetingUrl,
      attendeesCount: row.enrolledStudentsCount,
    });
  };

  const tableData: ClassSessionItem[] = useMemo(() => {
    return filteredClasses.map((c) => ({
      id: c.id,
      subjectName: c.title,
      programName: c.courseName,
      batchName: c.batchName,
      facultyName: c.tutorName,
      deliveryMode: 'ONLINE',
      meetingUrl: c.meetingUrl,
      roomOrLink: c.roomName || c.meetingUrl,
      date: c.dateStr,
      timeSlot: c.timeSlot,
      attendeesCount: c.enrolledStudentsCount,
      institutionId: c.institutionId,
      status: c.isBroadcastingNow ? 'LIVE_NOW' : c.status === 'DRAFT' ? 'DRAFT' : 'UPCOMING',
    }));
  }, [filteredClasses]);

  const columns: Column<ClassSessionItem>[] = [
    {
      key: 'date',
      header: 'Date & Day',
      sortable: true,
      className: 'min-w-[150px]',
      render: (row) => {
        const d = new Date(row.date);
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        return (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black uppercase text-blue-600 leading-none">{day}</span>
              <span className="text-xs font-black text-slate-800 leading-none mt-0.5">{d.getDate()}</span>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">{row.date}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{row.timeSlot}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'subjectName',
      header: 'Course & Batch',
      sortable: true,
      className: 'min-w-[200px]',
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.subjectName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {row.batchName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'facultyName',
      header: 'Assigned Tutor',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">
            {row.facultyName?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-800">{row.facultyName}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Live Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'LIVE_NOW'
              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {row.status === 'LIVE_NOW' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>Broadcasting Live</span>
            </>
          ) : (
            <span>Scheduled</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Inspection',
      className: 'text-right',
      render: (row) => {
        const isLive = row.status === 'LIVE_NOW';
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                const target = classes.find((c) => c.id === row.id);
                if (target) handleLaunchInspect(target);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isLive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isLive ? 'Inspect Live' : 'Scheduled'}</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Online Live Classes' }]} />

      <CollegeFilterBar />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[#0B2447] tracking-tight">
                Live Class Schedule & Studio
              </h1>
              <p className="text-xs text-slate-500">
                Weekly calendar timetable view of all foreign language live video classes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Filters */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Classes ({filteredClasses.length})
            </button>
            <button
              onClick={() => setStatusFilter('LIVE_NOW')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                statusFilter === 'LIVE_NOW' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Live Now
            </button>
            <button
              onClick={() => setStatusFilter('TODAY')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'TODAY' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Today
            </button>
          </div>

          {/* View Mode Toggle: Calendar vs Table */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'CALENDAR' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Calendar & Day View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Schedule Meeting Drawer Button */}
          <button
            onClick={() => {
              setEditSession(null);
              setIsScheduleOpen(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Live Class</span>
          </button>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'CALENDAR' ? (
        <div className="space-y-5">
          {/* Calendar Day Picker Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <button
                onClick={() => setSelectedDayFilter('ALL')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  selectedDayFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>All Days</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  selectedDayFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {filteredClasses.length}
                </span>
              </button>

              {dateTabs.map((tab) => {
                const isSelected = selectedDayFilter === tab.dateStr;
                return (
                  <button
                    key={tab.dateStr}
                    onClick={() => setSelectedDayFilter(tab.dateStr)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : tab.isToday
                        ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-left leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="font-bold uppercase tracking-wider text-[11px]">{tab.dayName}</span>
                        {tab.isToday && (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-black uppercase ${
                            isSelected ? 'bg-white/30 text-white' : 'bg-amber-200 text-amber-900'
                          }`}>
                            Today
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {tab.formattedDate}
                      </span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grouped Days with Session Cards */}
          {groupedByDate.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No live classes for this selection</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are no scheduled live sessions for the selected day or campus filter.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedByDate.map((group) => (
                <div key={group.dateStr} className="space-y-3">
                  {/* Date Section Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        group.isToday
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-[#0B2447] text-white'
                      }`}>
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-[#0B2447]">
                            {group.dayName}, {group.formattedDate}
                          </h2>
                          {group.isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-300">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {group.items.length} {group.items.length === 1 ? 'Live Class' : 'Live Classes'} Scheduled
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-slate-200 flex-1 ml-2" />
                  </div>

                  {/* Grid of Clean Live Class Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.map((session) => {
                      const isLive = session.isBroadcastingNow;
                      const isCompleted = session.status === 'COMPLETED';

                      return (
                        <div
                          key={session.id}
                          className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                            isLive
                              ? 'border-rose-300 ring-2 ring-rose-200/50'
                              : isCompleted
                              ? 'border-slate-200 bg-slate-50/40'
                              : 'border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          {/* Card Top: Batch + Status Badges */}
                          <div className="p-4.5 pb-3">
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <Users className="w-3 h-3 text-blue-600" />
                                {session.batchName}
                              </span>

                              {isLive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                                  Live Now
                                </span>
                              ) : isCompleted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  ✓ Scheduled
                                </span>
                              )}
                            </div>

                            {/* Class Title & Details */}
                            <h3 className="font-bold text-[#0B2447] text-sm leading-snug line-clamp-1 mb-1">
                              {session.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">
                              {session.campusName}
                            </p>

                            {/* Schedule Time & Trainer */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                              <div className="flex items-center justify-between text-slate-700 font-semibold">
                                <span className="flex items-center gap-1.5 text-slate-600">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  {session.timeSlot}
                                </span>
                                <span className="text-[11px] font-normal text-slate-500">
                                  ({session.durationMinutes} Mins)
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">
                                    {session.tutorName?.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-800">
                                    {session.tutorName}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {session.enrolledStudentsCount} Learners
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer: Join / Inspect CTA */}
                          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                              <Radio className="w-3.5 h-3.5 text-blue-500" />
                              <span>Live Class Session</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleLaunchInspect(session)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  isLive
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <Video className={`w-3.5 h-3.5 ${isLive ? 'text-white' : 'text-slate-500'}`} />
                                <span>{isLive ? 'Inspect Live' : 'Open Studio'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW (Clean fallback) */
        <DataTable<ClassSessionItem>
          data={tableData}
          columns={columns}
          rowKey={(row) => row.id}
          searchKey="subjectName"
          searchPlaceholder="Search online classes by subject, tutor, or batch..."
          pageSize={10}
          emptyTitle="No online live classes scheduled"
          emptyDescription="No online classes scheduled for this campus scope."
        />
      )}

      {/* Timetable-Style Schedule Live Class Modal */}
      <ScheduleClassModal
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setEditSession(null);
        }}
        onScheduledSuccess={() => fetchLiveClasses()}
      />

      {/* Delete / Cancel Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteSession}
        onClose={() => setDeleteSession(null)}
        onConfirm={() => {
          if (!deleteSession) return;
          showSuccess(`Online live class for "${deleteSession.subjectName}" removed.`);
          setDeleteSession(null);
        }}
        title="Cancel Online Class"
        entityType="Online Class Session"
        entityName={deleteSession?.subjectName}
        description="Are you sure you want to cancel this online session?"
      />

      {/* Google Meet / LiveKit Live Inspection Modal */}
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

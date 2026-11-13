// ============================================================================
// ISML COLLEGE LMS — TUTOR: LIVE CLASSES & TIMETABLE HUB (/tutor/live-classes)
// Timetable Matrix & Live Classroom Hub
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Video,
  Radio,
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  Filter,
  GraduationCap,
  Sparkles,
  Building2,
  ExternalLink,
  PlayCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import { useToast } from '@/context/ToastContext';
import { LiveClass } from '@/mock/liveClasses';
import LiveWebinarStudioModal from '@/components/tutor/LiveWebinarStudioModal';
import { fastFetch } from '@/lib/fastCache';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export default function TutorLiveClassesPage() {
  const { showSuccess, showInfo } = useToast();
  const { currentFaculty, myAllocations, canStartLiveClassForBatch } = useTutor();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [activeViewMode, setActiveViewMode] = useState<'WEEKLY_TIMETABLE' | 'CARDS_GRID'>('WEEKLY_TIMETABLE');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE_NOW' | 'TODAY' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWebinar, setActiveWebinar] = useState<LiveClass | null>(null);
  const [activeInspectModal, setActiveInspectModal] = useState<'COURSES' | 'BATCHES' | 'TODAY' | null>(null);

  // Month state for Interactive Calendar View
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date(2026, 10, 13)); // Nov 2026

  // Helper for calendar month navigation
  const monthName = currentCalendarDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const handlePrevMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // 1. Fetch live classes from API route
  useEffect(() => {
    fastFetch('/api/live-classes', (json) => {
      if (json?.data && Array.isArray(json.data)) {
        const mapped: LiveClass[] = json.data.map((item: any) => {
          let startDate = item.scheduledStartTime ? new Date(item.scheduledStartTime) : new Date();
          let endDate = item.scheduledEndTime ? new Date(item.scheduledEndTime) : new Date(startDate.getTime() + (item.durationMinutes || 60) * 60000);
          let duration = item.durationMinutes || 60;

          const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const formatDate = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

          const formattedTimeSlot = item.timeSlot ? item.timeSlot.replace('–', '-') : `${formatTime(startDate)} - ${formatTime(endDate)}`;
          const formattedDate = formatDate(startDate);

          let computedStatus = 'UPCOMING';
          if (item.status === 'LIVE' || item.isBroadcastingNow) {
            computedStatus = 'LIVE_NOW';
          } else if (item.status === 'COMPLETED' || item.status === 'ENDED') {
            computedStatus = 'COMPLETED';
          } else if (item.status === 'TODAY' || item.isScheduledToday) {
            computedStatus = 'TODAY';
          } else {
            computedStatus = 'UPCOMING';
          }

          return {
            id: item.id,
            topic: item.title || 'Live Interactive Class',
            tutorName: item.tutorName || currentFaculty.name,
            tutorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            tutorTitle: 'Lead Certified Faculty',
            status: computedStatus as any,
            date: formattedDate,
            timeSlot: formattedTimeSlot,
            durationMins: duration,
            batchCode: item.batchCode || 'BAT-01',
            batchName: item.batchName || 'General Batch',
            moduleName: item.courseName || 'Sample Course',
            roomToken: item.roomName || item.id,
            attendeesCount: item.enrolledStudentsCount || 10,
            recordingAvailable: item.recordingAvailable || false,
          };
        });
        setClasses(mapped);
      }
    });

    // 2. Fetch full timetable database for the matrix view
    fastFetch('/api/portals/timetable', (json) => {
      if (json?.data && Array.isArray(json.data)) {
        setTimetableSlots(json.data);
      }
    });
  }, [currentFaculty.name]);

  // Restore active webinar on client mount from localStorage / sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('isml_tutor_liveclass_active') || sessionStorage.getItem('isml_tutor_liveclass_active');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) {
            setActiveWebinar(parsed);
          }
        }
      } catch {}
    }
  }, []);

  const handleStartClass = (cls: LiveClass) => {
    setActiveWebinar(cls);
    if (typeof window !== 'undefined') {
      try {
        const val = JSON.stringify(cls);
        localStorage.setItem('isml_tutor_liveclass_active', val);
        sessionStorage.setItem('isml_tutor_liveclass_active', val);
      } catch {}
    }
  };

  const handleCloseWebinar = () => {
    setActiveWebinar(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('isml_tutor_liveclass_active');
        sessionStorage.removeItem('isml_tutor_liveclass_active');
      } catch {}
    }
  };

  // Filter classes strictly assigned to this faculty
  const myFilteredClasses = useMemo(() => {
    return classes.filter((c) => {
      // Purge mock/stale test session entries
      if (c.id === 'live-class-french-01' || c.topic.includes('live-class-french-01')) {
        return false;
      }

      // Check allocation match
      const isAllocated = myAllocations.some((a) => {
        const b1 = a.batchName?.toLowerCase().trim() || '';
        const b2 = c.batchName?.toLowerCase().trim() || '';
        return b1 === b2 || b1.includes(b2) || b2.includes(b1);
      });

      if (!isAllocated && myAllocations.length > 0) return false;

      if (statusFilter === 'LIVE_NOW' && c.status !== 'LIVE_NOW') return false;
      if (statusFilter === 'TODAY' && c.status !== 'TODAY' && c.status !== 'LIVE_NOW') return false;
      if (statusFilter === 'UPCOMING' && c.status !== 'UPCOMING') return false;
      if (statusFilter === 'COMPLETED' && c.status !== 'COMPLETED') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.topic.toLowerCase().includes(q) || c.batchName.toLowerCase().includes(q) || c.moduleName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [classes, myAllocations, statusFilter, searchQuery]);

  // Group timetable slots by day
  const slotsByDay = useMemo(() => {
    const facultyNameLower = currentFaculty.name.toLowerCase().trim();
    const myBatchNames = myAllocations.map((a) => a.batchName.toLowerCase().trim());

    // Filter slots for this tutor
    const mySlots = timetableSlots.filter((slot) => {
      const slotFaculty = (slot.facultyName || '').toLowerCase().trim();
      const slotBatch = (slot.batchName || '').toLowerCase().trim();
      return (
        slotFaculty === facultyNameLower ||
        slotFaculty.includes(facultyNameLower) ||
        facultyNameLower.includes(slotFaculty) ||
        myBatchNames.includes(slotBatch)
      );
    });

    const grouped: Record<string, any[]> = {};
    DAYS_OF_WEEK.forEach((d) => {
      grouped[d] = [];
    });

    mySlots.forEach((slot) => {
      const d = String(slot.day || 'FRIDAY').toUpperCase().trim();
      if (grouped[d]) {
        grouped[d].push(slot);
      }
    });

    return grouped;
  }, [timetableSlots, currentFaculty.name, myAllocations]);

  // Active Live Now Class (if any)
  const activeLiveNow = myFilteredClasses.find((c) => c.status === 'LIVE_NOW');
  const todayClassesCount = myFilteredClasses.filter((c) => c.status === 'TODAY' || c.status === 'LIVE_NOW').length;

  // Render Full-Screen Studio Modal if Tutor is Inside Class
  if (activeWebinar) {
    const matchingAlloc = myAllocations.find(
      (a) => a.batchName?.toLowerCase().trim() === activeWebinar.batchName?.toLowerCase().trim()
    );
    const tutorRole = matchingAlloc?.tutorRole || 'LEAD_TRAINER';
    const isLeadHost = tutorRole === 'LEAD_TRAINER';

    return (
      <LiveWebinarStudioModal
        isOpen={true}
        onClose={handleCloseWebinar}
        classId={activeWebinar.id}
        sessionTitle={activeWebinar.topic}
        batchName={activeWebinar.batchName}
        subjectCode={activeWebinar.batchCode}
        tutorName={currentFaculty.name}
        isHost={isLeadHost}
        tutorRole={tutorRole}
        onEndSession={handleCloseWebinar}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Faculty Console', href: '/tutor/dashboard' }, { label: 'Live Classes Studio' }]} />

      <FacultyRoleSwitcherBar />

      {/* ─── Simple & Clean Header: My Courses & My Batches ─── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0052CC]">
                {currentFaculty.primaryLanguage} Faculty
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {myAllocations.length} Active Batches Assigned
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              My Courses & My Batches
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live timetable schedule, assigned classroom batches, and direct studio access for {currentFaculty.name}.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {activeLiveNow ? (
              <button
                onClick={() => handleStartClass(activeLiveNow)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer animate-pulse transition-all"
              >
                <Radio className="w-4 h-4" />
                <span>🔴 Start Live ({activeLiveNow.batchName})</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Next Class at Scheduled Time</span>
              </div>
            )}
            <Link
              href="/tutor/recordings"
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4 text-blue-600" />
              <span>Recordings</span>
            </Link>
          </div>
        </div>

        {/* ─── Compact Summary of Courses & Batches (Interactive Click to View) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          
          {/* Card 1: My Courses */}
          <button
            type="button"
            onClick={() => setActiveInspectModal('COURSES')}
            className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider">My Courses</p>
                  <span className="text-[9px] bg-blue-200/60 text-blue-900 font-bold px-1.5 py-0.2 rounded">
                    {Array.from(new Set(myAllocations.map(a => a.courseName || a.subjectName))).length}
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 truncate">
                  {Array.from(new Set(myAllocations.map(a => a.courseName || a.subjectName))).join(', ') || 'Sample Course'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
              View →
            </span>
          </button>

          {/* Card 2: My Batches */}
          <button
            type="button"
            onClick={() => setActiveInspectModal('BATCHES')}
            className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">My Batches</p>
                  <span className="text-[9px] bg-emerald-200/60 text-emerald-950 font-bold px-1.5 py-0.2 rounded">
                    {myAllocations.length}
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 truncate">
                  {myAllocations.length} Assigned Cohorts
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
              View →
            </span>
          </button>

          {/* Card 3: Today's Classes */}
          <button
            type="button"
            onClick={() => setActiveInspectModal('TODAY')}
            className="p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-black text-purple-800 uppercase tracking-wider">Today&apos;s Classes</p>
                  <span className="text-[9px] bg-purple-200/60 text-purple-950 font-bold px-1.5 py-0.2 rounded">
                    {todayClassesCount}
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 truncate">
                  {todayClassesCount} Scheduled Today
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-purple-800 group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
              View →
            </span>
          </button>

        </div>
      </div>

      {/* ─── View Toggle & Search / Filter Controls ─── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* View Switcher: Weekly Timetable vs Cards Grid */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveViewMode('WEEKLY_TIMETABLE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'WEEKLY_TIMETABLE'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Timetable Matrix</span>
          </button>
          <button
            onClick={() => setActiveViewMode('CARDS_GRID')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'CARDS_GRID'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Session Cards Grid</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cohort, course or slot timing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-900 font-medium"
          />
        </div>

        {/* Status Filters (for Cards view) */}
        {activeViewMode === 'CARDS_GRID' && (
          <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
            {([
              { id: 'ALL', label: 'All Sessions' },
              { id: 'LIVE_NOW', label: '🔴 Live Now' },
              { id: 'TODAY', label: "Today" },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'COMPLETED', label: 'Completed' },
            ] as const).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── VIEW 1: WEEKLY TIMETABLE MATRIX (CALENDAR & SCHEDULE FORMAT) ─── */}
      {activeViewMode === 'WEEKLY_TIMETABLE' && (
        <div className="space-y-5">
          
          {/* Calendar Strip / Month Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {monthName}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Live Semester Term
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Weekly cyclic rotation with date, day & scheduled live interactive lecture slots
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                ← Prev Month
              </button>
              <button
                type="button"
                onClick={() => setCurrentCalendarDate(new Date(2026, 10, 13))}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 text-xs font-black transition-colors cursor-pointer"
              >
                Today (13 Nov 2026)
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Next Month →
              </button>
            </div>
          </div>

          {/* Interactive Day Tabs Filter with Date Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedDayFilter('ALL')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs ${
                selectedDayFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Full Weekly Cycle ({Object.values(slotsByDay).reduce((a, b) => a + b.length, 0)})
            </button>
            {DAYS_OF_WEEK.map((day, idx) => {
              const daySlots = slotsByDay[day] || [];
              const isSelected = selectedDayFilter === day;
              // Approximate cyclic date in current month (Nov 9 to Nov 15, 2026 for week)
              const approxDateNum = 9 + idx;
              const isTodayDay = day === 'FRIDAY'; // 13 Nov 2026 is Friday

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayFilter(day)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-md ring-2 ring-blue-400/20'
                      : isTodayDay
                      ? 'bg-rose-50 text-rose-900 border-rose-300 font-black'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[10px] w-5 h-5 rounded-lg flex items-center justify-center font-mono font-bold ${
                    isSelected ? 'bg-white/20 text-white' : isTodayDay ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {approxDateNum}
                  </span>
                  <span>{day.slice(0, 3)}</span>
                  {isTodayDay && (
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-black uppercase">
                      Today
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                    {daySlots.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Timetable Days Cards Grid (Calendar Style Layout) */}
          <div className="space-y-4">
            {DAYS_OF_WEEK.filter((d) => selectedDayFilter === 'ALL' || selectedDayFilter === d).map((day, idx) => {
              const daySlots = slotsByDay[day] || [];
              if (daySlots.length === 0 && selectedDayFilter === 'ALL') return null;

              const approxDateNum = 9 + idx;
              const formattedDateStr = `${approxDateNum} Nov 2026`;
              const isTodayDay = day === 'FRIDAY';

              return (
                <div 
                  key={day} 
                  className={`bg-white rounded-2xl border ${isTodayDay ? 'border-rose-300 ring-2 ring-rose-100 shadow-md' : 'border-slate-200/90 shadow-2xs'} overflow-hidden transition-all`}
                >
                  {/* Day Header Banner (Calendar Block) */}
                  <div className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b ${
                    isTodayDay ? 'bg-gradient-to-r from-rose-50 via-white to-blue-50/40 border-rose-200' : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border font-black shadow-2xs ${
                        isTodayDay ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-800 border-slate-200'
                      }`}>
                        <span className="text-[9px] uppercase leading-none font-bold opacity-80">{day.slice(0, 3)}</span>
                        <span className="text-sm font-black leading-none mt-0.5">{approxDateNum}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 tracking-wider uppercase">
                            {day} • {formattedDateStr}
                          </h3>
                          {isTodayDay && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs animate-pulse">
                              TODAY&apos;S SCHEDULE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {daySlots.length} {daySlots.length === 1 ? 'lecture session scheduled' : 'lecture sessions scheduled'} for this date
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {currentFaculty.primaryLanguage} Track
                      </span>
                    </div>
                  </div>

                  {/* Day Slots List */}
                  {daySlots.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No live lectures scheduled for {day} ({formattedDateStr}). Free slot.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {daySlots.map((slot) => {
                        const matchingClass = classes.find(
                          (c) => c.batchName.toLowerCase().trim() === slot.batchName?.toLowerCase().trim()
                        );
                        const isLive = matchingClass?.status === 'LIVE_NOW';

                        return (
                          <div
                            key={slot.id}
                            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                          >
                            {/* Left: Time & Slot Badge */}
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200/70 text-[#0052CC] flex flex-col items-center justify-center min-w-[115px] shrink-0 text-center shadow-2xs">
                                <Clock className="w-4 h-4 mb-1 text-[#0052CC]" />
                                <span className="font-mono text-xs font-black text-slate-900">{slot.timeSlot}</span>
                                <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                                  {formattedDateStr}
                                </span>
                              </div>

                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white font-mono">
                                    {slot.subjectCode || 'SAMPLE-CRS-101'}
                                  </span>
                                  <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                    {slot.subjectName || 'Sample Course'}
                                  </h4>
                                  {isLive && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                      <span>LIVE NOW</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                                  <span className="font-bold text-blue-700">
                                    Batch: {slot.batchName}
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{slot.room || 'Live Class Studio 1'}</span>
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-500 font-medium">
                                    {slot.department || 'Department of Foreign Languages'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                              {isLive && matchingClass ? (
                                <button
                                  onClick={() => handleStartClass(matchingClass)}
                                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer animate-pulse"
                                >
                                  <Radio className="w-4 h-4" />
                                  <span>Start Live Studio</span>
                                </button>
                              ) : (
                                <div className="px-3.5 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200">
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Opens at {slot.timeSlot.split(/[-–]/)[0]?.trim() || 'Slot Time'}</span>
                                </div>
                              )}
                              <Link
                                href={`/tutor/batches`}
                                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <span>Roster</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── VIEW 2: SESSION CARDS GRID ─── */}
      {activeViewMode === 'CARDS_GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myFilteredClasses.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No scheduled classes found.</p>
              <p className="text-xs text-slate-500">Check back later or view the Weekly Timetable Matrix above.</p>
            </div>
          ) : (
            myFilteredClasses.map((cls) => {
              const isLive = cls.status === 'LIVE_NOW';
              const isCompleted = cls.status === 'COMPLETED';

              return (
                <div
                  key={cls.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs space-y-4 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {cls.batchCode}
                      </span>
                      {isLive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          <span>LIVE NOW</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Completed • Recording Ready
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0052CC] border border-blue-200">
                          Scheduled: {cls.timeSlot}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{cls.topic}</h3>
                    <p className="text-xs font-bold text-blue-700">Batch: {cls.batchName}</p>

                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#0052CC]" />
                          <span>Slot:</span>
                        </span>
                        <span className="font-mono font-bold text-slate-800">{cls.timeSlot}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-500">Date:</span>
                        <span className="font-semibold text-slate-800">{cls.date} ({cls.durationMins}m)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Enrolled:</span>
                        </span>
                        <span className="font-bold text-slate-800">{cls.attendeesCount} Students</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isLive ? (
                      <button
                        onClick={() => handleStartClass(cls)}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer animate-pulse"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Start Live Studio (Host)</span>
                      </button>
                    ) : isCompleted ? (
                      <Link
                        href="/tutor/recordings"
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>View VOD & Attendance</span>
                      </Link>
                    ) : (
                      <div className="flex-1 py-2 text-center text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                        Opens at Slot Time
                      </div>
                    )}

                    <Link
                      href="/tutor/batches"
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>Roster</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── INTERACTIVE INSPECTION MODAL (COURSES, BATCHES & TODAY'S CLASSES) ─── */}
      {activeInspectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#0B2447] to-[#19376D] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  {activeInspectModal === 'COURSES' && <GraduationCap className="w-5 h-5 text-blue-300" />}
                  {activeInspectModal === 'BATCHES' && <Users className="w-5 h-5 text-emerald-300" />}
                  {activeInspectModal === 'TODAY' && <Calendar className="w-5 h-5 text-purple-300" />}
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    {activeInspectModal === 'COURSES' && 'My Allocated Courses'}
                    {activeInspectModal === 'BATCHES' && 'My Assigned Student Batches'}
                    {activeInspectModal === 'TODAY' && "Today's Scheduled Sessions"}
                  </h3>
                  <p className="text-xs text-blue-200">
                    {activeInspectModal === 'COURSES' && 'Course tracks assigned by Academic Manager'}
                    {activeInspectModal === 'BATCHES' && 'Active cohort cohorts under your instruction'}
                    {activeInspectModal === 'TODAY' && 'Live classes scheduled for Friday (Today)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveInspectModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {activeInspectModal === 'COURSES' && (
                <div className="space-y-3">
                  {Array.from(
                    new Map(myAllocations.map((a) => [a.courseName || a.subjectName, a])).values()
                  ).map((c, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black bg-blue-100 text-[#0052CC] px-2 py-0.5 rounded">
                          {c.courseCode || c.subjectCode || 'CRS-101'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {c.institutionName || 'The American College'}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{c.courseName || c.subjectName}</h4>
                      <p className="text-xs text-slate-600">
                        Primary Curriculum Track • Level: <strong>CEFR A1 / Beginner</strong>
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#0052CC]">
                        <span>Assigned Role: {c.tutorRole.replace(/_/g, ' ')}</span>
                        <span className="text-slate-500 text-[11px] font-normal">Active Term 2026</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeInspectModal === 'BATCHES' && (
                <div className="space-y-3">
                  {myAllocations.map((b, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                          Cohort: {b.batchName}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {b.subjectCode}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{b.courseName || b.subjectName}</p>
                        <p className="text-[11px] text-slate-500">{b.institutionName || 'The American College'}</p>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100 text-[11px] flex items-center justify-between text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{b.scheduleSlots?.[0] || '10:00 AM - 11:30 AM'}</span>
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          Role: {b.tutorRole.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeInspectModal === 'TODAY' && (
                <div className="space-y-3">
                  {classes
                    .filter((c) => c.status === 'TODAY' || c.status === 'LIVE_NOW')
                    .map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                            {item.timeSlot}
                          </span>
                          {item.status === 'LIVE_NOW' ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                              LIVE NOW
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Scheduled Today
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-900">{item.topic}</h4>
                        <p className="text-xs text-slate-600">Batch: <strong>{item.batchName}</strong> • {item.attendeesCount} Students</p>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">Date: 13 Nov 2026 (Today)</span>
                          {item.status === 'LIVE_NOW' ? (
                            <button
                              onClick={() => {
                                setActiveInspectModal(null);
                                handleStartClass(item);
                              }}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                            >
                              Join Studio Now →
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">Class Opens at Slot Time</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Official Records Synced with Academic Manager
              </span>
              <button
                onClick={() => setActiveInspectModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

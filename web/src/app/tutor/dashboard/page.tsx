// ============================================================================
// ISML COLLEGE LMS — MASTER TUTOR DASHBOARD (/tutor/dashboard)
// Multi-Role Unified Teaching Command: Lead Trainer, Substitute, Doubt Solver, Assistant Tutor
// Dynamic batch permissions assigned by Academic Manager
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Video,
  Users,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
  Unlock,
  Radio,
  FileText,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatCard from '@/components/common/StatCard';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import { mockLiveClasses } from '@/mock/liveClasses';
import { mockAssignments } from '@/mock/assignments';
import { mockDoubtThreads } from '@/mock/doubts';
import { TutorRoleType } from '@/mock/facultyAssignments';
import { useToast } from '@/context/ToastContext';
import LiveWebinarStudioModal from '@/components/tutor/LiveWebinarStudioModal';

export default function MasterTutorDashboardPage() {
  const { showSuccess, showInfo } = useToast();
  const [activeWebinar, setActiveWebinar] = useState<{ batchName: string; subjectName: string; id?: string; tutorRole?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('isml_tutor_active_webinar') || sessionStorage.getItem('isml_tutor_active_webinar');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.batchName || parsed.subjectName)) return parsed;
        }
      } catch {}
    }
    return null;
  });

  // Restore active webinar on client mount from localStorage / sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('isml_tutor_active_webinar') || sessionStorage.getItem('isml_tutor_active_webinar');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.batchName || parsed.subjectName)) {
            setActiveWebinar(parsed);
          }
        }
      } catch {}
    }
  }, []);

  const handleOpenWebinar = (data: { batchName: string; subjectName: string; id?: string }) => {
    setActiveWebinar(data);
    if (typeof window !== 'undefined') {
      try {
        const val = JSON.stringify(data);
        localStorage.setItem('isml_tutor_active_webinar', val);
        sessionStorage.setItem('isml_tutor_active_webinar', val);
      } catch {}
    }
  };

  const handleCloseWebinar = () => {
    setActiveWebinar(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('isml_tutor_active_webinar');
        sessionStorage.removeItem('isml_tutor_active_webinar');
      } catch {}
    }
  };
  const {
    currentFaculty,
    myAllocations,
    activeRoleFilter,
    setActiveRoleFilter,
    canStartLiveClassForBatch,
    canMarkAttendanceForBatch,
    canGradeAssignmentsForBatch,
    canAnswerDoubtsForBatch,
  } = useTutor();

  // Real-time slot status checker (Checks if slot is currently LIVE, UPCOMING, or CONCLUDED)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, []);

  const getSlotTimingStatus = (scheduleSlots: string[] = []) => {
    if (!scheduleSlots || scheduleSlots.length === 0) return { isLive: false, label: 'No Live Schedule', badge: 'bg-slate-100 text-slate-500' };

    const daysMap: Record<string, number> = {
      SUN: 0, SUNDAY: 0,
      MON: 1, MONDAY: 1,
      TUE: 2, TUESDAY: 2,
      WED: 3, WEDNESDAY: 3,
      THU: 4, THURSDAY: 4,
      FRI: 5, FRIDAY: 5,
      SAT: 6, SATURDAY: 6,
    };

    const currentDay = currentTime.getDay();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    let isScheduledToday = false;
    let isCurrentlyLive = false;
    let startsSoon = false;
    let timeRangeText = '';

    for (const slotStr of scheduleSlots) {
      // Parse days e.g. "Mon, Wed, Fri 07:30 PM - 09:00 PM" or "Mon & Wed 10:00 AM - 11:30 AM"
      const parts = slotStr.split(/\d/);
      const daysPart = parts[0] || '';
      const matchedDays = Object.keys(daysMap).filter((d) => new RegExp(`\\b${d}\\b`, 'i').test(daysPart));

      const matchesDay = matchedDays.some((d) => daysMap[d] === currentDay);
      if (matchesDay) {
        isScheduledToday = true;

        // Extract time range e.g. "07:30 PM - 09:00 PM"
        const timeMatch = slotStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        if (timeMatch) {
          timeRangeText = `${timeMatch[1]} - ${timeMatch[2]}`;
          const parseMinutes = (t: string) => {
            const [time, meridiem] = t.trim().split(/\s+/);
            const [h, m] = time.split(':').map(Number);
            let hours = h % 12;
            if (meridiem.toUpperCase() === 'PM') hours += 12;
            return hours * 60 + m;
          };

          const startMinutes = parseMinutes(timeMatch[1]);
          const endMinutes = parseMinutes(timeMatch[2]);

          // Enable 15 minutes before session begins up until end time
          if (currentMinutes >= startMinutes - 15 && currentMinutes <= endMinutes) {
            isCurrentlyLive = true;
          } else if (currentMinutes < startMinutes && startMinutes - currentMinutes <= 60) {
            startsSoon = true;
          }
        }
      }
    }

    if (isCurrentlyLive) {
      return { isLive: true, label: '🔴 LIVE SESSION IN PROGRESS', badge: 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse' };
    }
    if (startsSoon) {
      return { isLive: false, label: '⏳ UPCOMING IN < 1 HOUR', badge: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    if (isScheduledToday) {
      return { isLive: false, label: `SCHEDULED TODAY (${timeRangeText || 'Upcoming'})`, badge: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    return { isLive: false, label: 'NO ACTIVE SESSION NOW', badge: 'bg-slate-100 text-slate-600 border-slate-200' };
  };
  const filteredAllocations = useMemo(() => {
    if (activeRoleFilter === 'ALL') return myAllocations;
    return myAllocations.filter((a) => a.tutorRole === activeRoleFilter);
  }, [myAllocations, activeRoleFilter]);

  // Lead Batches Count
  const leadBatches = myAllocations.filter((a) => a.tutorRole === 'LEAD_TRAINER');
  const substituteBatches = myAllocations.filter((a) => a.tutorRole === 'SUBSTITUTE_TUTOR');
  const doubtBatches = myAllocations.filter((a) => a.tutorRole === 'DOUBT_SOLVING_TUTOR');
  const assistantBatches = myAllocations.filter((a) => a.tutorRole === 'ASSISTANT_TUTOR');

  // Pending Tasks
  const pendingDoubtsCount = mockDoubtThreads.filter((d) => d.status === 'OPEN').length;
  const pendingAssignmentsCount = mockAssignments.length;

  const handleStartClass = (batchName: string, subjectName: string, tutorRole: string = 'LEAD_TRAINER') => {
    handleOpenWebinar({ batchName, subjectName, id: 'live-class-french-01', tutorRole });
  };

  const handleDeniedAccess = (roleName: string) => {
    showInfo(`Access Restricted: This batch is assigned to you as "${roleName}". Live Class creation is reserved for Lead Trainers.`);
  };

  // If Tutor is inside active webinar studio, render ONLY the full-screen Studio Classroom Modal!
  // This completely eliminates any background dashboard flash during page refresh.
  if (activeWebinar) {
    const isHost = activeWebinar.tutorRole !== 'DOUBT_SOLVING_TUTOR' && activeWebinar.tutorRole !== 'ASSISTANT_TUTOR';
    return (
      <LiveWebinarStudioModal
        isOpen={true}
        onClose={handleCloseWebinar}
        classId={activeWebinar.id || 'live-class-french-01'}
        sessionTitle={`Interactive Live Webinar • ${activeWebinar.subjectName}`}
        batchName={activeWebinar.batchName}
        subjectCode="LIVE-WEBINAR-STUDIO"
        tutorName={currentFaculty.name}
        isHost={isHost}
        tutorRole={activeWebinar.tutorRole || 'LEAD_TRAINER'}
        onEndSession={handleCloseWebinar}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Faculty Console' }, { label: 'Tutor Master Dashboard' }]} />

      <FacultyRoleSwitcherBar />

      {/* ─── Page Header Title & Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              {currentFaculty.primaryLanguage} Curriculum Lead
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600">
              {myAllocations.length} Assigned Cohorts
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {currentFaculty.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your live teaching schedule, assigned student cohorts, and quick classroom actions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {leadBatches.length > 0 && (() => {
            // Find batch that is currently live today
            const liveNowBatch = leadBatches.find((b) => getSlotTimingStatus(b.scheduleSlots).isLive);
            if (liveNowBatch) {
              return (
                <button
                  onClick={() => {
                    handleStartClass(liveNowBatch.batchName, liveNowBatch.subjectName);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer animate-pulse"
                  title="Class is LIVE now! Click to enter Live Studio"
                >
                  <Radio className="w-4 h-4" />
                  <span>Enter Live Studio: {liveNowBatch.batchName}</span>
                </button>
              );
            }
            return (
              <Link
                href="/tutor/live-classes"
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-blue-600" />
                <span>Live Classes Studio</span>
              </Link>
            );
          })()}
          <Link
            href="/tutor/attendance"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4 text-[#0052CC]" />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Multi-Role KPI Summary Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Lead Trainer Cohorts"
          value={leadBatches.length}
          icon={Video}
          iconColor="text-blue-600"
          subtext="Full Live Studio & Host Access"
        />
        <StatCard
          title="Substitute Standby"
          value={substituteBatches.length}
          icon={ShieldCheck}
          iconColor="text-amber-600"
          subtext="Emergency Replacement Cover"
        />
        <StatCard
          title="Doubt Desks"
          value={doubtBatches.length}
          icon={MessageSquare}
          iconColor="text-emerald-600"
          subtext={`${pendingDoubtsCount} Open Learner Inquiries`}
        />
        <StatCard
          title="Assistant & Evaluations"
          value={assistantBatches.length}
          icon={ClipboardList}
          iconColor="text-purple-600"
          subtext="Homework & Viva Assessments"
        />
      </div>

      {/* ─── 3. Single Clean Assigned Cohorts Matrix (Unified & Intuitive) ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] border border-blue-200">
                My Cohort Assignments
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Assigned Curriculum & Cohort Batches
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Filter by your role to view class schedules, slot timings, and authorized actions.
            </p>
          </div>

          {/* Clean Segment Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeRoleFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Batches ({myAllocations.length})
            </button>
            <button
              onClick={() => setActiveRoleFilter('LEAD_TRAINER')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeRoleFilter === 'LEAD_TRAINER'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <span>Lead Trainer</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-white/20">
                {leadBatches.length}
              </span>
            </button>
            <button
              onClick={() => setActiveRoleFilter('DOUBT_SOLVING_TUTOR')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeRoleFilter === 'DOUBT_SOLVING_TUTOR'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span>Doubt Solver</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-white/20">
                {doubtBatches.length}
              </span>
            </button>
            <button
              onClick={() => setActiveRoleFilter('SUBSTITUTE_TUTOR')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeRoleFilter === 'SUBSTITUTE_TUTOR'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <span>Substitute</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-black/10">
                {substituteBatches.length}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Allocated Courses & Batches Cards */}
        {filteredAllocations.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No Batches Found Under This Filter</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Select &quot;All Batches&quot; above to view your complete teaching schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAllocations.map((alloc) => {
              const isLead = alloc.tutorRole === 'LEAD_TRAINER';
              const isSub = alloc.tutorRole === 'SUBSTITUTE_TUTOR';
              const isDoubt = alloc.tutorRole === 'DOUBT_SOLVING_TUTOR';
              const isTA = alloc.tutorRole === 'ASSISTANT_TUTOR';

              const roleBadgeColor = isLead
                ? 'bg-blue-600 text-white'
                : isSub
                ? 'bg-amber-500 text-slate-950 font-black'
                : isDoubt
                ? 'bg-emerald-600 text-white'
                : 'bg-purple-600 text-white';

              const roleLabel =
                alloc.tutorRole === 'LEAD_TRAINER'
                  ? 'LEAD TRAINER'
                  : alloc.tutorRole === 'SUBSTITUTE_TUTOR'
                  ? 'SUBSTITUTE'
                  : alloc.tutorRole === 'DOUBT_SOLVING_TUTOR'
                  ? 'DOUBT SOLVER'
                  : alloc.tutorRole === 'ASSISTANT_TUTOR'
                  ? 'ASSISTANT (TA)'
                  : alloc.tutorRole.replace(/_/g, ' ');

              const timing = getSlotTimingStatus(alloc.scheduleSlots);

              return (
                <div
                  key={alloc.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="space-y-2.5">
                    {/* Top strip: Course Code + Assigned Role Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white font-mono">
                        {alloc.courseCode || alloc.subjectCode || 'CRS'}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 ${roleBadgeColor}`}>
                        {isLead && <GraduationCap className="w-3 h-3" />}
                        {isSub && <ShieldCheck className="w-3 h-3" />}
                        {isDoubt && <MessageSquare className="w-3 h-3" />}
                        {isTA && <ClipboardList className="w-3 h-3" />}
                        <span>{roleLabel}</span>
                      </span>
                    </div>

                    {/* Course & Cohort Info */}
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {alloc.courseName || alloc.subjectName}
                      </h3>
                      <p className="text-xs font-bold text-blue-700 mt-0.5 flex items-center gap-1">
                        <span>Cohort:</span>
                        <span className="text-slate-800">{alloc.batchName}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {alloc.institutionName || 'The American College'}
                      </p>
                    </div>

                    {/* Schedule & Timing Pill */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                          <span>Days:</span>
                        </span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {alloc.scheduleSlots?.[0]?.split(/\d/)[0]?.replace(/,\s*$/, '').trim() || 'Mon, Wed, Fri'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Time:</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                          {alloc.scheduleSlots?.[0]?.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)\s*[-–]\s*\d{1,2}:\d{2}\s*(?:AM|PM))/i)?.[1] || '10:00 AM - 11:30 AM'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                        <span className="text-slate-500">Session Status:</span>
                        <span className={`font-black px-2 py-0.5 rounded-full border ${timing.badge}`}>
                          {timing.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Contextual Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {(() => {
                      if (isLead) {
                        if (timing.isLive) {
                          return (
                            <button
                              onClick={() => handleStartClass(alloc.batchName, alloc.courseName || alloc.subjectName)}
                              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer animate-pulse"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>🔴 Start Live Studio</span>
                            </button>
                          );
                        }
                        return (
                          <div className="flex-1 py-1.5 text-center text-[11px] font-semibold text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                            Opens at Slot Time
                          </div>
                        );
                      }

                      if (isDoubt) {
                        return (
                          <Link
                            href="/tutor/doubts"
                            className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Open Doubt Desk</span>
                          </Link>
                        );
                      }

                      if (isSub) {
                        return (
                          <div className="flex-1 py-1.5 text-center text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
                            Emergency Standby
                          </div>
                        );
                      }

                      return (
                        <Link
                          href="/tutor/assignments"
                          className="flex-1 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Evaluate Tasks</span>
                        </Link>
                      );
                    })()}

                    <Link
                      href={`/tutor/batches`}
                      className="px-2.5 py-1.5 text-xs font-bold text-[#0052CC] hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>Roster</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 4. Quick Action Modules (Teaching, Evaluation, Doubts) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: Live Lectures */}
        <Link
          href="/tutor/live-classes"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Online Live Classes</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Launch LiveKit video sessions for lead cohorts, screen share slides, and record audio lessons.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0052CC]">
            <span>Manage Classes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Module 2: Homework & Marking */}
        <Link
          href="/tutor/assignments"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-purple-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Assignments & Evaluation</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Grade submitted LSRW drills, mark vocabulary sheets, and provide audio pronunciation feedback.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
            <span>{pendingAssignmentsCount} Tasks to Evaluate</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Module 3: Doubts & Q&A Desk */}
        <Link
          href="/tutor/doubts"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Doubt Support Desk</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Resolve learner doubts, explain complex grammar conjugations, and review voice questions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>{pendingDoubtsCount} Open Queries</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}

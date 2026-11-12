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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              {currentFaculty.primaryLanguage} Curriculum Track
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">
              Allocated: {myAllocations.length} Active Cohorts
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {currentFaculty.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your official teaching workload and live webinar permissions assigned by the Academic Manager.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {leadBatches.length > 0 && (() => {
            const firstLead = leadBatches[0];
            const timing = getSlotTimingStatus(firstLead.scheduleSlots);
            return (
              <button
                onClick={() => {
                  if (timing.isLive) {
                    handleStartClass(firstLead.batchName, firstLead.subjectName);
                  } else {
                    showInfo(`Classroom Locked: Live Broadcast for "${firstLead.batchName}" is only available during the scheduled slot (${firstLead.scheduleSlots.join(', ')}).`);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
                  timing.isLive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer animate-pulse'
                    : 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed hover:bg-slate-200'
                }`}
                title={timing.isLive ? 'Session in progress - Enter Live Studio' : 'Scheduled class is not currently live'}
              >
                {timing.isLive ? <Radio className="w-4 h-4 animate-pulse" /> : <Lock className="w-4 h-4" />}
                <span>{timing.isLive ? `Enter Live: ${firstLead.batchName}` : `Class Locked (${firstLead.batchName})`}</span>
              </button>
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

      {/* ─── 2. Real Assigned Courses & Batches Portfolio (Dynamic from Academic Manager) ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] border border-blue-200">
                Official Workload Matrix
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                My Assigned Curriculum & Cohort Batches
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live breakdown of your active course tracks, assigned cohort batches, and timetable permissions allocated by the Academic Manager.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Faculty Profile:</span>
            <span className="text-[#0052CC] font-extrabold">{currentFaculty.name}</span>
          </div>
        </div>

        {/* Dynamic Allocated Courses & Batches Cards */}
        {myAllocations.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No Course Allocations Assigned Yet</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Your profile is active. Once the Academic Manager allocates a course track or cohort batch to you, your live classroom cards and duties will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {myAllocations.map((alloc) => {
              const isLead = alloc.tutorRole === 'LEAD_TRAINER';
              const isSub = alloc.tutorRole === 'SUBSTITUTE_TUTOR';
              const isDoubt = alloc.tutorRole === 'DOUBT_SOLVING_TUTOR';
              const isTA = alloc.tutorRole === 'ASSISTANT_TUTOR';

              const roleBadgeColor = isLead
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : isSub
                ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-xs'
                : isDoubt
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-purple-600 text-white border-purple-700 shadow-xs';

              const roleLabel =
                alloc.tutorRole === 'LEAD_TRAINER'
                  ? 'LEAD NATIVE TRAINER'
                  : alloc.tutorRole === 'SUBSTITUTE_TUTOR'
                  ? 'SUBSTITUTE TUTOR'
                  : alloc.tutorRole === 'DOUBT_SOLVING_TUTOR'
                  ? 'DOUBT SOLVING TUTOR'
                  : alloc.tutorRole === 'ASSISTANT_TUTOR'
                  ? 'ASSISTANT TUTOR (TA)'
                  : alloc.tutorRole === 'ORAL_EXAMINER'
                  ? 'HUMAN 1:1 TUTOR'
                  : alloc.tutorRole.replace(/_/g, ' ');

              const roleDescription =
                isLead
                  ? 'Primary syllabus teacher & live lecture conductor'
                  : isSub
                  ? 'Standby backup tutor for leave & emergency coverage'
                  : isDoubt
                  ? '1-on-1 Q&A desk, chat clearance & remedial clinics'
                  : 'Worksheet grading, LSRW drill evaluation & records';

              return (
                <div
                  key={alloc.id}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200/90 hover:border-blue-400 bg-gradient-to-b from-white to-slate-50/40 flex flex-col justify-between space-y-3.5 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    {/* Role Header Banner */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900 text-white font-mono tracking-wider">
                        {alloc.courseCode || alloc.subjectCode || 'CRS'}
                      </span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border flex items-center gap-1.5 ${roleBadgeColor}`}>
                        {isLead && <GraduationCap className="w-3.5 h-3.5" />}
                        {isSub && <ShieldCheck className="w-3.5 h-3.5" />}
                        {isDoubt && <MessageSquare className="w-3.5 h-3.5" />}
                        {isTA && <ClipboardList className="w-3.5 h-3.5" />}
                        <span>{roleLabel}</span>
                      </span>
                    </div>

                    {/* Role Duty Subtitle */}
                    <p className="text-[11px] font-semibold text-slate-500 italic">
                      ✨ {roleDescription}
                    </p>

                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {alloc.courseName || alloc.subjectName}
                      </h3>
                      <p className="text-xs font-bold text-blue-700 mt-0.5">
                        Batch: <span className="underline decoration-blue-300">{alloc.batchName}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Assigned Role:</span>
                        <span className="font-extrabold text-slate-900">{roleLabel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Target Campus:</span>
                        <span className="text-slate-800 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                          {alloc.institutionName || 'The American College'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Allocated Batch:</span>
                        <strong className="text-blue-800 font-bold">{alloc.batchName}</strong>
                      </div>

                      {/* 🗓️ User-Friendly Date & Live Timing Breakdown */}
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                            <span>Schedule Days:</span>
                          </span>
                          <span className="font-bold text-slate-800">
                            {alloc.scheduleSlots?.[0]?.split(/\d/)[0]?.replace(/,\s*$/, '').trim() || 'Mon & Wed'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Slot Timing:</span>
                          </span>
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-200/60">
                            {alloc.scheduleSlots?.[0]?.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)\s*[-–]\s*\d{1,2}:\d{2}\s*(?:AM|PM))/i)?.[1] || '10:00 AM - 11:30 AM'}
                          </span>
                        </div>
                        {alloc.effectiveFrom && (
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Effective Since:</span>
                            <span className="font-semibold text-slate-600">{alloc.effectiveFrom}</span>
                          </div>
                        )}
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Status:</span>
                          {(() => {
                            const timing = getSlotTimingStatus(alloc.scheduleSlots);
                            return (
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${timing.badge}`}>
                                {timing.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {(() => {
                      const timing = getSlotTimingStatus(alloc.scheduleSlots);

                      // STRICT RULE: ONLY Lead Native Trainer has permission to start and broadcast live classes!
                      if (isLead) {
                        if (timing.isLive) {
                          return (
                            <button
                              onClick={() => handleStartClass(alloc.batchName, alloc.courseName || alloc.subjectName)}
                              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer animate-pulse"
                              title="Lead Native Trainer Exclusive: Enter Live Studio Broadcast"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>🔴 Start Live Studio (Host)</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={() => {
                              showInfo(
                                `Classroom Locked: Live Broadcast for "${alloc.batchName}" is scheduled at ${alloc.scheduleSlots.join(', ')}.`
                              );
                            }}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-not-allowed"
                            title={`Locked until slot time: ${alloc.scheduleSlots.join(', ')}`}
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>🔒 Live Class ({alloc.scheduleSlots?.[0]?.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i)?.[1] || 'Scheduled'})</span>
                          </button>
                        );
                      }

                      if (isSub) {
                        return (
                          <div
                            className="flex-1 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                            title="Substitute standby duty - activated only if Lead Trainer is absent"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Standby Emergency Cover</span>
                          </div>
                        );
                      }

                      if (isTA) {
                        return (
                          <Link
                            href="/tutor/assessments"
                            className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>Evaluate Homework & Drill</span>
                          </Link>
                        );
                      }

                      return (
                        <div className="flex-1 flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartClass(alloc.batchName, alloc.courseName || alloc.subjectName, 'DOUBT_SOLVING_TUTOR')}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            title="Join live session as Doubt Solving Moderator"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Join Doubt Desk Studio</span>
                          </button>
                          <Link
                            href="/tutor/doubts"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                            title="Offline Q&A Threads"
                          >
                            Desk
                          </Link>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 3. Multi-Role KPI Summary Cards ─── */}
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

      {/* ─── 3. Segmented Role Duty Switcher Tabs ─── */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0052CC]" />
              <span>Assigned Cohorts & Role-Based Permissions Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live view of subjects assigned to you by Academic Manager and your operational access.
            </p>
          </div>

          {/* Quick Segment Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeRoleFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Duties ({myAllocations.length})
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
              onClick={() => setActiveRoleFilter('ASSISTANT_TUTOR')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeRoleFilter === 'ASSISTANT_TUTOR'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <span>Assistant</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-white/20">
                {assistantBatches.length}
              </span>
            </button>
          </div>
        </div>

        {/* ─── Assigned Batches Cards Grid ─── */}
        {filteredAllocations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No batches assigned under this specific role. Check other duty tabs or contact Academic Manager.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAllocations.map((alloc) => {
              const canStartLive = canStartLiveClassForBatch(alloc.batchId);
              const canMarkAtt = canMarkAttendanceForBatch(alloc.batchId);
              const canGrade = canGradeAssignmentsForBatch(alloc.batchId);
              const canDoubt = canAnswerDoubtsForBatch(alloc.batchId);

              // Role badge color styling
              const roleStyles = {
                LEAD_TRAINER: 'bg-blue-50 text-[#0052CC] border-blue-200',
                SUBSTITUTE_TUTOR: 'bg-amber-50 text-amber-900 border-amber-200',
                DOUBT_SOLVING_TUTOR: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                ASSISTANT_TUTOR: 'bg-purple-50 text-purple-900 border-purple-200',
                ORAL_EXAMINER: 'bg-indigo-50 text-indigo-900 border-indigo-200',
              }[alloc.tutorRole];

              return (
                <div
                  key={alloc.id}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all bg-white flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider flex items-center gap-1 ${roleStyles}`}>
                        <span>{alloc.tutorRole.replace(/_/g, ' ')}</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {alloc.subjectCode}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {alloc.subjectName}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-50 text-[#0052CC] border border-blue-200">
                          Course: {alloc.courseName || alloc.subjectName}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 font-bold mt-1">
                        Cohort: {alloc.batchName} • <span className="text-slate-500 font-medium">{alloc.institutionName || 'Affiliated Campus'}</span>
                      </p>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between gap-1.5 pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{alloc.scheduleSlots.join(', ')}</span>
                      </div>
                      {(() => {
                        const timing = getSlotTimingStatus(alloc.scheduleSlots);
                        return (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${timing.badge}`}>
                            {timing.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 🔒 Dynamic Feature Permissions Checklist */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {canStartLive ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={canStartLive ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        Live Studio Broadcast
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canMarkAtt ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={canMarkAtt ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        Roll Call Attendance
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canGrade ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={canGrade ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        Homework & Grading
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canDoubt ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={canDoubt ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        1-on-1 Doubt Clearing
                      </span>
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                    {(() => {
                      const timing = getSlotTimingStatus(alloc.scheduleSlots);

                      if (!canStartLive) {
                        return (
                          <button
                            onClick={() => handleDeniedAccess(alloc.tutorRole.replace(/_/g, ' '))}
                            className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
                            title="Only Lead or Active Substitute can start live class"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>No Live Broadcast</span>
                          </button>
                        );
                      }

                      if (timing.isLive) {
                        return (
                          <button
                            onClick={() => handleStartClass(alloc.batchName, alloc.subjectName)}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs animate-pulse"
                            title="Session live right now! Click to enter Live Studio"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>Enter Live Studio</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={() => {
                            showInfo(
                              `Class Locked: Live Studio for "${alloc.batchName}" unlocks during scheduled session hours (${alloc.scheduleSlots.join(', ')}).`
                            );
                          }}
                          className="px-3 py-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed border border-slate-200 transition-colors"
                          title={`Locked until slot time: ${alloc.scheduleSlots.join(', ')}`}
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Class Locked</span>
                        </button>
                      );
                    })()}

                    <Link
                      href={`/tutor/batches`}
                      className="px-3 py-1.5 text-xs font-bold text-[#0052CC] hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Cohort Roster</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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

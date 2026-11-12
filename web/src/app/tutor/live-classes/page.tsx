// ============================================================================
// ISML COLLEGE LMS — TUTOR: LIVE CLASSES HUB (/tutor/live-classes)
// Enforces Role Rule: Only Lead Trainer or Active Standby Substitute can Start Live Class.
// Assistants and Doubt Solvers have view/attendance access only.
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Radio,
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  Lock,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import { useToast } from '@/context/ToastContext';
import { mockLiveClasses, LiveClass } from '@/mock/liveClasses';
import LiveWebinarStudioModal from '@/components/tutor/LiveWebinarStudioModal';
import { fastFetch } from '@/lib/fastCache';

export default function TutorLiveClassesPage() {
  const { showSuccess, showInfo } = useToast();
  const { currentFaculty, myAllocations, canStartLiveClassForBatch } = useTutor();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  useEffect(() => {
    // 1. Fetch live classes from backend
    fastFetch('http://localhost:4000/api/live-classes', (json) => {
      if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
        const mapped: LiveClass[] = json.data.map((item: any) => {
          // Check if tutor allocation overrides slot timing
          const matchingAlloc = myAllocations.find(
            (a) => a.batchName?.toLowerCase().trim() === item.batchName?.toLowerCase().trim()
          );

          let startDate = item.scheduledStartTime ? new Date(item.scheduledStartTime) : new Date();
          let endDate = item.scheduledEndTime ? new Date(item.scheduledEndTime) : new Date(startDate.getTime() + (item.durationMinutes || 60) * 60000);
          let duration = item.durationMinutes || 60;
          let timeSlotFormatted = '';

          if (matchingAlloc && matchingAlloc.scheduleSlots && matchingAlloc.scheduleSlots.length > 0) {
            const timeMatch = matchingAlloc.scheduleSlots[0].match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
            if (timeMatch) {
              timeSlotFormatted = `${timeMatch[1]} – ${timeMatch[2]}`;
              const parseMinutes = (t: string) => {
                const [time, meridiem] = t.trim().split(/\s+/);
                const [h, m] = time.split(':').map(Number);
                let hours = h % 12;
                if (meridiem.toUpperCase() === 'PM') hours += 12;
                return hours * 60 + m;
              };
              const sMins = parseMinutes(timeMatch[1]);
              const eMins = parseMinutes(timeMatch[2]);
              if (eMins > sMins) {
                duration = eMins - sMins;
              }
            }
          }

          const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const formatDate = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

          const formattedTimeSlot = timeSlotFormatted || `${formatTime(startDate)} – ${formatTime(endDate)}`;
          const formattedDate = formatDate(startDate);

          // Real-time slot status check: enable button if scheduled slot is currently active!
          let isTimeSlotActive = false;
          if (matchingAlloc && matchingAlloc.scheduleSlots && matchingAlloc.scheduleSlots.length > 0) {
            const now = new Date();
            const currentDay = now.getDay();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const daysMap: Record<string, number> = {
              SUN: 0, SUNDAY: 0, MON: 1, MONDAY: 1, TUE: 2, TUESDAY: 2,
              WED: 3, WEDNESDAY: 3, THU: 4, THURSDAY: 4, FRI: 5, FRIDAY: 5, SAT: 6, SATURDAY: 6,
            };

            for (const slotStr of matchingAlloc.scheduleSlots) {
              const parts = slotStr.split(/\d/);
              const daysPart = parts[0] || '';
              const matchedDays = Object.keys(daysMap).filter((d) => new RegExp(`\\b${d}\\b`, 'i').test(daysPart));
              if (matchedDays.some((d) => daysMap[d] === currentDay)) {
                const timeMatch = slotStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
                if (timeMatch) {
                  const parseMinutes = (t: string) => {
                    const [time, meridiem] = t.trim().split(/\s+/);
                    const [h, m] = time.split(':').map(Number);
                    let hours = h % 12;
                    if (meridiem.toUpperCase() === 'PM') hours += 12;
                    return hours * 60 + m;
                  };
                  const startMinutes = parseMinutes(timeMatch[1]);
                  const endMinutes = parseMinutes(timeMatch[2]);
                  // Active from 15 mins before start until end time
                  if (currentMinutes >= startMinutes - 15 && currentMinutes <= endMinutes) {
                    isTimeSlotActive = true;
                    break;
                  }
                }
              }
            }
          }

          const isBroadcastingNow = item.status === 'LIVE' || isTimeSlotActive;

          return {
            id: item.id,
            topic: item.title || 'Live Interactive Class',
            tutorName: item.tutorName || 'Lead Trainer',
            tutorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            tutorTitle: 'Certified Faculty',
            status: isBroadcastingNow ? 'LIVE_NOW' : item.status === 'ENDED' ? 'COMPLETED' : 'TODAY',
            date: formattedDate,
            timeSlot: formattedTimeSlot,
            durationMins: duration,
            batchCode: item.batchName || 'BAT-01',
            batchName: item.batchName || 'General Batch',
            moduleName: item.courseName || 'Language Certification',
            roomToken: item.roomName || item.id,
            attendeesCount: item.enrolledStudentsCount || 0,
            recordingAvailable: false,
          };
        });
        setClasses(mapped);
      }
    });
  }, [myAllocations]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE_NOW' | 'TODAY'>('ALL');
  const [activeWebinar, setActiveWebinar] = useState<LiveClass | null>(null);

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

  const handleJoinAsAssistant = (cls: LiveClass) => {
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

  const filteredClasses = classes.filter((c) => {
    // Purge mock/stale test session entries
    if (c.id === 'live-class-french-01' || c.topic.includes('live-class-french-01')) {
      return false;
    }

    // Strictly isolate only the batches allocated to this tutor (e.g. MRNG BATCH)
    const isAllocated = myAllocations.some(
      (a) =>
        (a.batchName && c.batchName && a.batchName.toLowerCase().trim() === c.batchName.toLowerCase().trim()) ||
        (a.courseName && c.moduleName && a.courseName.toLowerCase().trim() === c.moduleName.toLowerCase().trim()) ||
        (a.subjectName && c.topic.toLowerCase().includes(a.subjectName.toLowerCase()))
    );

    if (!isAllocated && myAllocations.length > 0) return false;

    // Filter to ensure course matching
    if (myAllocations.length > 0) {
      const activeCourses = myAllocations.map(a => a.courseName?.toLowerCase().trim() || a.subjectName?.toLowerCase().trim());
      const classTopic = c.topic.toLowerCase();
      const classMod = c.moduleName?.toLowerCase() || '';
      const matchesActiveCourse = activeCourses.some(cr => cr && (classTopic.includes(cr) || classMod.includes(cr)));
      if (!matchesActiveCourse) return false;
    }

    if (statusFilter === 'LIVE_NOW' && c.status !== 'LIVE_NOW') return false;
    if (statusFilter === 'TODAY' && c.status !== 'TODAY') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.topic.toLowerCase().includes(q) || c.batchName.toLowerCase().includes(q);
    }
    return true;
  });

  // If Tutor is inside active webinar studio, render ONLY the full-screen Studio Classroom Modal!
  // This completely eliminates any background dashboard/timetable flash during page refresh.
  if (activeWebinar) {
    return (
      <LiveWebinarStudioModal
        isOpen={true}
        onClose={handleCloseWebinar}
        classId={activeWebinar.id}
        sessionTitle={activeWebinar.topic}
        batchName={activeWebinar.batchName}
        subjectCode={activeWebinar.batchCode}
        tutorName={currentFaculty.name}
        isHost={currentFaculty.assignedRoles.includes('LEAD_TRAINER')}
        onEndSession={handleCloseWebinar}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Faculty Console', href: '/tutor/dashboard' }, { label: 'Live Classes Studio' }]} />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              {currentFaculty.primaryLanguage} Language Department
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Online Interactive Live Classes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Launch live webinar sessions for your assigned cohorts or join as assistant/doubt moderator.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search class topic, grammar module, or cohort..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(['ALL', 'LIVE_NOW', 'TODAY'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Classes' : st === 'LIVE_NOW' ? '🔴 Live Now' : 'Today’s Sessions'}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClasses.map((cls) => {
          // Check if this faculty is assigned to this batch
          const myAlloc = myAllocations.find((a) => {
            const bName = a.batchName.toLowerCase();
            const cName = cls.batchName.toLowerCase();
            const sCode = a.subjectCode.toLowerCase();
            const cCode = cls.batchCode.toLowerCase();
            return bName.includes(cName) || cName.includes(bName) || sCode === cCode || (a.courseId === 'crs-01' && cls.batchCode === 'FR-101') || (a.courseId === 'crs-01-b1' && cls.batchCode === 'FR-201');
          });

          const isLead = myAlloc?.tutorRole === 'LEAD_TRAINER';
          const isSubstitute = myAlloc?.tutorRole === 'SUBSTITUTE_TUTOR';
          const isAssistantOrDoubt = myAlloc?.tutorRole === 'DOUBT_SOLVING_TUTOR' || myAlloc?.tutorRole === 'ASSISTANT_TUTOR';

          return (
            <div
              key={cls.id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {cls.batchCode}
                  </span>
                  {cls.status === 'LIVE_NOW' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                      <span>Broadcasting Now</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0052CC] border border-blue-200">
                      Scheduled {cls.date}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{cls.topic}</h3>
                <p className="text-xs text-slate-500 font-medium">{cls.batchName}</p>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-[#0052CC]" />
                    <span>{cls.timeSlot}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">
                    Date: <strong>{cls.date}</strong> ({cls.durationMins} Mins)
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#0052CC] font-bold border border-blue-200/60 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-[#0052CC]" />
                    <span>{cls.attendeesCount || 10} Verified Students (The American College)</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons based on Live Status & Role */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-slate-600">
                  {myAlloc ? (
                    <span className="text-[#0052CC] font-bold">Duty: {myAlloc.tutorRole.replace(/_/g, ' ')}</span>
                  ) : (
                    <span className="text-slate-400">Department Faculty</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Strict Live Time Enforcement: Enable if LIVE_NOW OR if tutor is LEAD_TRAINER for this cohort */}
                  {cls.status === 'LIVE_NOW' || isLead || isSubstitute ? (
                    isLead || isSubstitute ? (
                      /* Main Tutor / Host who starts the lecture */
                      <button
                        onClick={() => handleStartClass(cls)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-400/40"
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>Start Live Class Now</span>
                      </button>
                    ) : (
                      /* Assistant Tutor / Doubt Tutor joins an ongoing session */
                      <button
                        onClick={() => handleJoinAsAssistant(cls)}
                        className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ring-2 ring-blue-400/30"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Join Now (Assistant / Doubt Desk)</span>
                      </button>
                    )
                  ) : (
                    /* Disabled state when class is not live right now */
                    <button
                      disabled
                      aria-disabled="true"
                      title={`This class is scheduled for ${cls.date} (${cls.timeSlot}). Broadcast button unlocks when live time begins.`}
                      className="px-4 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-75 select-none"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Starts at {cls.timeSlot.split('-')[0].trim()}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

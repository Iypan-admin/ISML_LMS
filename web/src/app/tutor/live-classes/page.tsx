// ============================================================================
// ISML COLLEGE LMS — TUTOR: LIVE CLASSES HUB (/tutor/live-classes)
// Enforces Role Rule: Only Lead Trainer or Active Standby Substitute can Start Live Class.
// Assistants and Doubt Solvers have view/attendance access only.
// ============================================================================

"use client";

import React, { useState } from 'react';
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

export default function TutorLiveClassesPage() {
  const { showSuccess, showInfo } = useToast();
  const { currentFaculty, myAllocations, canStartLiveClassForBatch } = useTutor();
  const [classes, setClasses] = useState<LiveClass[]>(mockLiveClasses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE_NOW' | 'TODAY'>('ALL');
  const [activeWebinar, setActiveWebinar] = useState<LiveClass | null>(null);

  const filteredClasses = classes.filter((c) => {
    if (statusFilter === 'LIVE_NOW' && c.status !== 'LIVE_NOW') return false;
    if (statusFilter === 'TODAY' && c.status !== 'TODAY') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.topic.toLowerCase().includes(q) || c.batchName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStartClass = (cls: LiveClass) => {
    setActiveWebinar(cls);
  };

  const handleJoinAsAssistant = (cls: LiveClass) => {
    setActiveWebinar(cls);
  };

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

                <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cls.timeSlot}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cls.attendeesCount || 48} Enrolled Learners</span>
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
                  {/* Strict Live Time Enforcement: Only enable when status is LIVE_NOW */}
                  {cls.status === 'LIVE_NOW' ? (
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

      {/* Full Live Webinar Classroom Modal */}
      {activeWebinar && (
        <LiveWebinarStudioModal
          isOpen={Boolean(activeWebinar)}
          onClose={() => setActiveWebinar(null)}
          sessionTitle={activeWebinar.topic}
          batchName={activeWebinar.batchName}
          subjectCode={activeWebinar.batchCode}
          tutorName={currentFaculty.name}
          isHost={currentFaculty.assignedRoles.includes('LEAD_TRAINER')}
          onEndSession={() => {
            setActiveWebinar(null);
          }}
        />
      )}
    </div>
  );
}

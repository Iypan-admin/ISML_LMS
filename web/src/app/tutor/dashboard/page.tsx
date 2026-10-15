// ============================================================================
// ISML COLLEGE LMS — MASTER TUTOR DASHBOARD (/tutor/dashboard)
// Multi-Role Unified Teaching Command: Lead Trainer, Substitute, Doubt Solver, Assistant Tutor
// Dynamic batch permissions assigned by Academic Manager
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
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
  const [activeWebinar, setActiveWebinar] = useState<{ batchName: string; subjectName: string } | null>(null);
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

  // Filtered Allocations based on Duty Segment Filter (ALL vs LEAD vs SUBSTITUTE vs DOUBT vs ASSISTANT)
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

  const handleStartClass = (batchName: string, subjectName: string) => {
    setActiveWebinar({ batchName, subjectName });
  };

  const handleDeniedAccess = (roleName: string) => {
    showInfo(`Access Restricted: This batch is assigned to you as "${roleName}". Live Class creation is reserved for Lead Trainers.`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Faculty Console' }, { label: 'Tutor Master Dashboard' }]} />

      <FacultyRoleSwitcherBar />

      {/* ─── Page Header Title & Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              French CEFR Track (A1 • A2 • B1 • B2)
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">
              Allocated: {currentFaculty.allocatedHours} / {currentFaculty.weeklyHoursLimit} hrs/week
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bonjour, {currentFaculty.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your official French teaching workload and live webinar permissions assigned by the Academic Manager.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => handleStartClass('French A1 Intensive Cohort 2026', 'French A1 Language, Phonetics & Salutations')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Launch A1 Live Studio</span>
          </button>
          <Link
            href="/tutor/attendance"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4 text-[#0052CC]" />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Dedicated French CEFR Level Matrix (A1, A2, B1, B2) ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] border border-blue-200">
                Official Workload Matrix
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                My Assigned French Teaching Portfolio (A1 • A2 • B1 • B2)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Clear breakdown of your role, duties, timetable, and operational permissions for each French CEFR level.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Primary Faculty:</span>
            <span className="text-[#0052CC] font-extrabold">Jay (fac-jay)</span>
          </div>
        </div>

        {/* 4 CEFR Level Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* FRENCH A1 CARD */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/70 to-white flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-[#0052CC] text-white tracking-wide">
                  FRENCH A1
                </span>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  LEAD TRAINER
                </span>
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 leading-snug">
                FR-101: Language & Phonetics
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Cohort:</strong> Intensive Live Webinar 2026<br/>
                <strong>Schedule:</strong> Mon & Wed • 10:00 - 11:30 AM<br/>
                <strong>Access:</strong> Full Live Studio Host, 1080p Cloud Recording & Roll Call
              </p>
            </div>
            <div className="pt-2 border-t border-blue-100">
              <button
                onClick={() => handleStartClass('French A1 Intensive Cohort 2026', 'French A1 Language & Phonetics')}
                className="w-full py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Start A1 Live Webinar</span>
              </button>
            </div>
          </div>

          {/* FRENCH A2 CARD */}
          <div className="p-4 rounded-xl border-2 border-amber-200 bg-gradient-to-b from-amber-50/60 to-white flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-500 text-slate-950 tracking-wide">
                  FRENCH A2
                </span>
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  SUBSTITUTE STANDBY
                </span>
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 leading-snug">
                FR-102: Passé Composé & A2 Mocks
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Cohort:</strong> Section B Standby Cover<br/>
                <strong>Schedule:</strong> Tue & Thu • 02:00 - 03:30 PM<br/>
                <strong>Access:</strong> Emergency Broadcast Standby & DELF A2 Mock Assessments
              </p>
            </div>
            <div className="pt-2 border-t border-amber-100">
              <Link
                href="/tutor/assessments"
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Review A2 Mocks</span>
              </Link>
            </div>
          </div>

          {/* FRENCH B1 CARD */}
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-600 text-white tracking-wide">
                  FRENCH B1
                </span>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  DOUBT SOLVER
                </span>
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 leading-snug">
                FR-201: Subjunctive & Opinion Fluency
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Cohort:</strong> Executive Q&A Desk<br/>
                <strong>Schedule:</strong> Tue & Thu • 05:30 - 07:00 PM<br/>
                <strong>Access:</strong> 1-on-1 Doubt Clearing Desk & Audio Inquiries (No Live Lecture)
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-100">
              <Link
                href="/tutor/doubts"
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open B1 Doubt Desk</span>
              </Link>
            </div>
          </div>

          {/* FRENCH B2 CARD */}
          <div className="p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-b from-purple-50/60 to-white flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-purple-600 text-white tracking-wide">
                  FRENCH B2
                </span>
                <span className="text-[10px] font-extrabold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                  ASSISTANT EVALUATOR
                </span>
              </div>
              <h3 className="text-xs font-extrabold text-slate-900 leading-snug">
                FR-202: Argumentation & Viva Evaluation
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Cohort:</strong> Advanced Evaluation Desk<br/>
                <strong>Schedule:</strong> Fri • 03:00 - 05:00 PM<br/>
                <strong>Access:</strong> DELF B2 Synthesis Grading & Oral Viva Marking Rubrics
              </p>
            </div>
            <div className="pt-2 border-t border-purple-100">
              <Link
                href="/tutor/assignments"
                className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Grade B2 Essays</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Multi-Role KPI Summary Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="French A1: Lead Trainer"
          value={leadBatches.length}
          icon={Video}
          iconColor="text-blue-600"
          subtext="Full Live Class & Roster Rights"
        />
        <StatCard
          title="French A2: Standby & Mocks"
          value={substituteBatches.length}
          icon={ShieldCheck}
          iconColor="text-amber-600"
          subtext="Emergency Replacement & Mocks"
        />
        <StatCard
          title="French B1: Doubt Desks"
          value={doubtBatches.length}
          icon={MessageSquare}
          iconColor="text-emerald-600"
          subtext={`${pendingDoubtsCount} Pending Learner Q&As`}
        />
        <StatCard
          title="French B2: Assistant Evaluator"
          value={assistantBatches.length}
          icon={ClipboardList}
          iconColor="text-purple-600"
          subtext="DELF B2 Essay & Viva Grading"
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
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {alloc.subjectName}
                      </h3>
                      <p className="text-xs text-blue-600 font-bold mt-0.5">
                        {alloc.batchName}
                      </p>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{alloc.scheduleSlots.join(', ')}</span>
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
                    {canStartLive ? (
                      <button
                        onClick={() => handleStartClass(alloc.batchName, alloc.subjectName)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>Start Live Class</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeniedAccess(alloc.tutorRole.replace(/_/g, ' '))}
                        className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
                        title="Only Lead or Active Substitute can start live class"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>No Live Broadcast</span>
                      </button>
                    )}

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

      {/* Full Live Webinar Classroom Modal */}
      {activeWebinar && (
        <LiveWebinarStudioModal
          isOpen={Boolean(activeWebinar)}
          onClose={() => setActiveWebinar(null)}
          sessionTitle={`Interactive Live Webinar • ${activeWebinar.subjectName}`}
          batchName={activeWebinar.batchName}
          subjectCode="LIVE-WEBINAR-STUDIO"
          tutorName={currentFaculty.name}
          isHost={true}
          onEndSession={() => {
            setActiveWebinar(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER DASHBOARD (/academic-manager/dashboard)
// Live KPIs, Today's Class Schedule, Faculty Allocations, Attendance Rates & Requests
// ============================================================================

"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  FolderTree,
  Video,
  Clock,
  CheckSquare,
  Send,
  Building2,
  Calendar,
  ArrowRight,
  TrendingUp,
  UserCheck,
  CalendarDays,
  FileCheck2,
  AlertCircle,
  PlayCircle,
  Wifi,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';
import {
  mockDepartments,
  mockPrograms,
  mockBatches,
  mockCourses,
  mockStudents,
  mockAttendanceRecords,
  mockClassSessions,
} from '@/mock/superAdminData';
import { mockLiveClasses } from '@/mock/liveClasses';
import { financeProposalStore } from '@/services/financeProposalStore';
import LiveMeetingInspectionModal, { ClassSessionData } from '@/components/academic-manager/LiveMeetingInspectionModal';

export default function AcademicManagerDashboardPage() {
  const { selectedCollegeId, isOverall, selectedCollege, institutions } = useCollege();
  const [inspectingSession, setInspectingSession] = React.useState<ClassSessionData | null>(null);

  // Scoped Data
  const scopedDepts = useMemo(() => {
    return isOverall
      ? mockDepartments
      : mockDepartments.filter((d) => !d.institutionId || d.institutionId === selectedCollegeId);
  }, [isOverall, selectedCollegeId]);

  const scopedPrograms = useMemo(() => {
    const deptIds = scopedDepts.map((d) => d.id);
    return isOverall
      ? mockPrograms
      : mockPrograms.filter((p) => deptIds.includes(p.departmentId));
  }, [scopedDepts, isOverall]);

  const scopedBatches = useMemo(() => {
    return isOverall
      ? mockBatches
      : mockBatches.filter(
          (b) => !b.institutionId || b.institutionId === selectedCollegeId
        );
  }, [isOverall, selectedCollegeId]);

  const scopedCourses = useMemo(() => {
    return isOverall
      ? mockCourses
      : mockCourses.filter(
          (c) => !c.collegeId || c.collegeId === selectedCollegeId
        );
  }, [isOverall, selectedCollegeId]);

  // Aggregate Metrics
  const totalStudentsCount = useMemo(() => {
    if (isOverall) {
      return institutions.reduce((acc, i) => acc + i.studentsCount, 0);
    }
    return selectedCollege?.studentsCount || 0;
  }, [isOverall, institutions, selectedCollege]);

  const totalFacultyCount = useMemo(() => {
    if (isOverall) {
      return institutions.reduce((acc, i) => acc + i.facultyCount, 0);
    }
    return selectedCollege?.facultyCount || 0;
  }, [isOverall, institutions, selectedCollege]);

  // Today's Live Sessions & Attendance
  const todayLiveSessions = mockLiveClasses.filter(
    (cls) => cls.status === 'LIVE_NOW' || cls.status === 'TODAY'
  );

  const avgAttendance = useMemo(() => {
    if (mockAttendanceRecords.length === 0) return 0;
    const total = mockAttendanceRecords.reduce(
      (acc, r) => acc + r.attendancePercentage,
      0
    );
    return Math.round(total / mockAttendanceRecords.length);
  }, []);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Manager' }, { label: 'Dashboard' }]} />

      <CollegeFilterBar />

      {/* ─── 1. Welcome Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#061A36] via-[#092B5A] to-[#1E3A8A] p-5 sm:p-6 rounded-2xl text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 uppercase tracking-wider border border-cyan-400/30">
              Classes & Learning
            </span>
            <span className="text-xs text-blue-200">
              {isOverall ? 'All Campuses' : selectedCollege?.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Academic Manager Dashboard
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Monitor daily live classes, student batches, course subjects, teacher assignments, and attendance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/academic-manager/courses"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses</span>
          </Link>
          <Link
            href="/academic-manager/batches"
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/20"
          >
            <Layers className="w-4 h-4" />
            <span>Student Batches</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Key Academic KPIs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Courses"
          value={scopedCourses.length}
          icon={BookOpen}
          iconColor="text-blue-600"
          subtext="Available Courses"
        />
        <StatCard
          title="Student Batches"
          value={scopedBatches.length}
          icon={Layers}
          iconColor="text-emerald-600"
          subtext="Active Class Groups"
        />
        <StatCard
          title="Course Subjects"
          value={18}
          icon={FolderTree}
          iconColor="text-purple-600"
          subtext="Language Subjects"
        />
        <StatCard
          title="Teachers & Trainers"
          value={totalFacultyCount.toLocaleString()}
          icon={UserCheck}
          iconColor="text-amber-600"
          subtext="Assigned Faculty"
        />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Today's Live Classes</div>
            <div className="text-base font-black text-slate-900">{todayLiveSessions.length} Live Classes</div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Class Attendance</div>
            <div className="text-base font-black text-slate-900">{avgAttendance}% Present</div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Courses</div>
            <div className="text-base font-black text-slate-900">{scopedCourses.length} Courses</div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Pending Approvals</div>
            <div className="text-base font-black text-slate-900">3 Under Review</div>
          </div>
        </div>
      </div>

      {/* ─── 3. Two-Column Operational Hub ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Live Sessions & Class Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Today's Live Classes & Online Meetings
                </h2>
              </div>
              <Link
                href="/academic-manager/live-classes"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All Classes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {mockLiveClasses.slice(0, 4).map((session) => (
                <div key={session.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {session.batchCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        session.status === 'LIVE_NOW'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : session.status === 'TODAY'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {session.status === 'LIVE_NOW' ? 'Live Now' : session.status === 'TODAY' ? 'Starting Today' : session.status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {session.timeSlot}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                      {session.topic}
                    </h3>

                    <p className="text-[11px] text-slate-500">
                      Teacher: <strong className="text-slate-700">{session.tutorName}</strong> • {session.batchName}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {session.status === 'LIVE_NOW' ? (
                      <button
                        onClick={() => {
                          setInspectingSession({
                            id: session.id,
                            topic: session.topic,
                            subjectName: session.moduleName || session.topic,
                            batchName: session.batchName,
                            batchCode: session.batchCode,
                            facultyName: session.tutorName,
                            facultyAvatar: session.tutorAvatar,
                            facultyTitle: session.tutorTitle,
                            date: session.date,
                            timeSlot: session.timeSlot,
                            durationMins: session.durationMins,
                            status: session.status,
                            attendeesCount: session.attendeesCount || 28,
                          });
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer animate-pulse"
                        title="Enter Classroom to Check Attendance & Lecture"
                      >
                        <Video className="w-3.5 h-3.5 text-white" />
                        <span>Join Live</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed opacity-60"
                        title="Class has not started yet"
                      >
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                        <span>Not Started</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Courses & Batches Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Course & Batch Completion Progress
                </h2>
              </div>
              <Link
                href="/academic-manager/courses"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {scopedCourses.slice(0, 4).map((crs) => (
                <div
                  key={crs.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {crs.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{crs.department}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{crs.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Teacher: {crs.facultyName} • {crs.enrolledStudents} Students Enrolled
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Syllabus Done</div>
                    <div className="text-xs font-black text-emerald-700">{crs.completionRate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Benchmarks & Governance Tasks */}
        <div className="space-y-6">
          {/* Attendance Health Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Student Attendance Summary</span>
              </h3>
              <Link
                href="/academic-manager/attendance/sessions"
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Full Sessions
              </Link>
            </div>

            <div className="space-y-2">
              {mockAttendanceRecords.slice(0, 4).map((rec, idx) => (
                <div key={`${rec.program}-${rec.batch}-${idx}`} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[160px]">{rec.program}</span>
                    <span className={`font-black text-xs ${
                      rec.attendancePercentage >= 90 ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {rec.attendancePercentage}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                    <span>{rec.batch}</span>
                    <span>{rec.presentCount} / {rec.totalStudents} Present</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Governance Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Pending Action Items</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Computer Science Batch 2026:</strong> 2 lesson topics need approval before classes start.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>French A1 Batch:</strong> Recorded class video is processed and ready to review.
                </div>
              </div>
            </div>

            <Link
              href="/academic-manager/curriculum"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <span>Manage Curriculums</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 🎬 GOOGLE MEET STYLE LIVE INSPECTION ROOM */}
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

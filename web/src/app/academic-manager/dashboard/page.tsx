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
  mockLevels,
} from '@/mock/superAdminData';
import {
  LEVEL_PERIOD_MATRIX,
  PACING_LEVEL_MATRIX,
  PERIOD_CATEGORIES,
  PeriodCategoryKey,
} from '@/mock/curriculumMatrixData';
import { mockLiveClasses } from '@/mock/liveClasses';
import { financeProposalStore } from '@/services/financeProposalStore';
import LiveMeetingInspectionModal, { ClassSessionData } from '@/components/academic-manager/LiveMeetingInspectionModal';
import { fastFetch } from '@/lib/fastCache';

export default function AcademicManagerDashboardPage() {
  const { selectedCollegeId, isOverall, selectedCollege, institutions, isSchoolMode, institutionCategory } = useCollege();
  const [inspectingSession, setInspectingSession] = React.useState<ClassSessionData | null>(null);

  // Live Curriculum Matrices from Database
  const [schoolMatrices, setSchoolMatrices] = React.useState<any[]>([]);
  const [collegeMatrices, setCollegeMatrices] = React.useState<any[]>([]);
  const [dbCourses, setDbCourses] = React.useState<any[]>([]);
  const [dbBatches, setDbBatches] = React.useState<any[]>([]);
  const [dbLiveClasses, setDbLiveClasses] = React.useState<any[]>([]);

  React.useEffect(() => {
    fastFetch('https://ismllms-production.up.railway.app/api/portals/curriculum-matrices/schools', (data) => {
      if (data?.status === 'success' && Array.isArray(data.data)) {
        setSchoolMatrices(data.data);
      }
    });

    fastFetch('https://ismllms-production.up.railway.app/api/portals/curriculum-matrices/colleges', (data) => {
      if (data?.status === 'success' && Array.isArray(data.data)) {
        setCollegeMatrices(data.data);
      }
    });

    // Fetch live courses from DB
    fastFetch('https://ismllms-production.up.railway.app/api/portals/courses', (data) => {
      if (data?.status === 'success' && Array.isArray(data.data)) {
        setDbCourses(data.data);
      }
    });

    // Fetch live batches from DB
    fastFetch('https://ismllms-production.up.railway.app/api/portals/batches', (data) => {
      if (data?.status === 'success' && Array.isArray(data.data)) {
        setDbBatches(data.data);
      }
    });

    // Fetch live classes from DB
    fastFetch('https://ismllms-production.up.railway.app/api/live-classes', (data) => {
      if (data?.data && Array.isArray(data.data)) {
        setDbLiveClasses(data.data);
      }
    });
  }, []);

  // Scoped Data filtered dynamically by School vs College
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
    // Strictly live DB batches
    if (dbBatches.length > 0) {
      let list = dbBatches.map((b) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        status: b.status,
        startDate: b.startDate ? b.startDate.split('T')[0] : '2026-11-03',
        batchTiming: '09:00 - 10:30 AM',
        studentsCount: b.maxStudents || 45,
        completionRate: 25,
        institutionId: b.tenantId || 'inst-01',
      }));

      if (!isOverall && selectedCollegeId) {
        list = list.filter((b) => !b.institutionId || b.institutionId === selectedCollegeId);
      }
      return list;
    }
    return [];
  }, [dbBatches, isOverall, selectedCollegeId]);

  const scopedCourses = useMemo(() => {
    // Strictly live DB courses
    if (dbCourses.length > 0) {
      let filtered = dbCourses;
      if (!isOverall && selectedCollegeId) {
        filtered = filtered.filter((c) => !c.tenantId || c.tenantId === selectedCollegeId);
      }
      return filtered.map((c, i) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        department: isSchoolMode ? 'School Languages Wing' : 'College Foreign Languages',
        program: isSchoolMode ? 'K-12 School Curriculum (35m–45m Periods)' : 'Higher Education Certification Track',
        teachingHours: c.teachingHours || 80,
        assessmentsCount: c.assessmentsCount || 4,
        humanSpeakingMinutes: 10,
        aiSpeakingTimesPerDay: 3,
        targetLevel: 'A1',
        duration: isSchoolMode ? '60 Hours (Academic Term)' : '3 Months (90 Days Fast-Track)',
        completionRate: 35 + ((i * 20) % 50),
        status: c.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      }));
    }
    return [];
  }, [dbCourses, isSchoolMode, isOverall, selectedCollegeId]);

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

  // Today's Live Sessions & Attendance from DB
  const todayLiveSessions = useMemo(() => {
    if (dbLiveClasses.length > 0) {
      return dbLiveClasses.map((c) => ({
        id: c.id,
        topic: c.title,
        batchName: c.batchName || 'Interactive Batch',
        batchCode: c.batchCode || (c.batchName?.substring(0, 8) ?? 'BAT-LIVE'),
        moduleName: c.courseName || 'Curriculum Module',
        tutorName: c.tutorName || 'Academic Faculty Lead',
        tutorTitle: 'CEFR Certified Language Specialist',
        tutorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        date: c.scheduledStartTime ? c.scheduledStartTime.split('T')[0] : '2026-11-03',
        timeSlot: `${c.durationMinutes || 60} Mins Session`,
        durationMins: c.durationMinutes || 60,
        status: c.status === 'LIVE' ? 'LIVE_NOW' : 'TODAY',
        attendeesCount: c.enrolledStudentsCount || 38,
        roomToken: c.roomName || 'isml-live-room',
        recordingAvailable: false,
      }));
    }
    return [];
  }, [dbLiveClasses]);

  const avgAttendance = 88;

  // ─── Dynamic Master Matrix Calculations (Responsive to Campus & Course Scope) ───
  const dynamicMatrixMetrics = useMemo(() => {
    if (isSchoolMode) {
      const rows = schoolMatrices.length > 0 ? schoolMatrices : [];
      const totalHours = rows.reduce((acc, r) => acc + (r.durationHours || 60), 0) || (9 * 60);
      return {
        levelsCount: rows.length || 9,
        levelsLabel: `${rows.length || 9} School Sub-Levels (A1.1 to B1.4)`,
        totalTeachingHours: totalHours,
        periodCategoriesCount: 6,
        pacingTracksCount: 6,
        speakingRange: '10 – 20 Mins / 2 Wks',
        aiRange: '2 – 4x Daily Practice',
        assessRange: '4 – 6 Before Finals',
        examMode: 'Offline Center Only',
      };
    } else {
      const rows = collegeMatrices.length > 0 ? collegeMatrices : [];
      const totalHours = rows.reduce((acc, r) => acc + (r.durationHours || 100), 0) || 1160;
      return {
        levelsCount: rows.length || 8,
        levelsLabel: `${rows.length || 8} Higher Education Tracks`,
        totalTeachingHours: totalHours,
        periodCategoriesCount: 3,
        pacingTracksCount: 3,
        speakingRange: '10 – 40 Mins / Week',
        aiRange: '3 – 10x Daily Practice',
        assessRange: '4 – 6 Before Finals',
        examMode: 'Offline Center Only',
      };
    }
  }, [isSchoolMode, schoolMatrices, collegeMatrices]);

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

      {/* ─── 2. Key Academic KPIs (Dynamically Computed from Master Matrix & Scope) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Curriculum Levels"
          value={dynamicMatrixMetrics.levelsCount}
          icon={BookOpen}
          iconColor="text-blue-600"
          subtext={dynamicMatrixMetrics.levelsLabel}
        />
        <StatCard
          title="Period Categories"
          value={`${dynamicMatrixMetrics.periodCategoriesCount} Categories`}
          icon={Clock}
          iconColor="text-emerald-600"
          subtext="Cat 1 (35m) to Cat 6 (60m)"
        />
        <StatCard
          title="Pacing Tracks"
          value={`${dynamicMatrixMetrics.pacingTracksCount} Pace Modes`}
          icon={Layers}
          iconColor="text-purple-600"
          subtext="Standard | Intensive | Super"
        />
        <StatCard
          title="Total Teaching Hours"
          value={`${dynamicMatrixMetrics.totalTeachingHours} Hours`}
          icon={GraduationCap}
          iconColor="text-amber-600"
          subtext={isOverall ? 'Master Curriculums' : `${selectedCollege?.name || 'Selected Campus'}`}
        />
      </div>

      {/* Secondary Quick Metrics (Dynamically Computed from Scope & Matrix) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">1:1 Human Speaking</div>
            <div className="text-base font-black text-slate-900">{dynamicMatrixMetrics.speakingRange}</div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">AI Speaking Quota</div>
            <div className="text-base font-black text-slate-900">{dynamicMatrixMetrics.aiRange}</div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Continuous Assessments</div>
            <div className="text-base font-black text-slate-900">{dynamicMatrixMetrics.assessRange}</div>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Final Exam Protocol</div>
            <div className="text-base font-black text-slate-900">{dynamicMatrixMetrics.examMode}</div>
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
              {todayLiveSessions.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Live Classes Scheduled Today</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Classes will appear here once scheduled in Master Timetable.</p>
                </div>
              ) : (
                todayLiveSessions.map((session) => (
                  <div key={session.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {session.batchCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          session.status === 'LIVE_NOW'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {session.status === 'LIVE_NOW' ? 'Live Now' : 'Scheduled Today'}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {session.topic}
                      </h3>

                      <p className="text-[11px] text-slate-500">
                        Teacher: <strong className="text-slate-700">{session.tutorName}</strong> • {session.batchName} ({session.timeSlot})
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setInspectingSession({
                            id: session.id,
                            topic: session.topic,
                            subjectName: session.moduleName,
                            batchName: session.batchName,
                            batchCode: session.batchCode,
                            facultyName: session.tutorName,
                            facultyAvatar: session.tutorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                            facultyTitle: session.tutorTitle,
                            date: session.date,
                            timeSlot: session.timeSlot,
                            durationMins: session.durationMins,
                            status: session.status === 'LIVE_NOW' ? "LIVE_NOW" : "TODAY",
                            attendeesCount: session.attendeesCount,
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                          session.status === 'LIVE_NOW'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title="Enter Classroom to Mark Student Attendance & Inspect Session"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-white" />
                        <span>{session.status === 'LIVE_NOW' ? 'Join & Mark Attendance' : 'Open Class Roll Call'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
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
              {scopedCourses.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">No Active Courses</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Courses will appear here once registered.</p>
                </div>
              ) : (
                scopedCourses.slice(0, 5).map((crs) => (
                  <div
                    key={crs.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {crs.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{crs.department}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          crs.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        }`}>
                          {crs.status === 'PUBLISHED' ? 'Active ✓' : 'Draft (Awaiting Super Admin)'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{crs.name}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        {crs.status === 'PUBLISHED' ? 'Syllabus Done' : 'Approval Status'}
                      </div>
                      <div className={`text-xs font-black ${crs.status === 'PUBLISHED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {crs.status === 'PUBLISHED' ? `${crs.completionRate}%` : 'Pending Sign-Off'}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
              {mockAttendanceRecords.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  <CheckSquare className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">No Attendance Records</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Attendance logs will appear as classes are marked.</p>
                </div>
              ) : (
                mockAttendanceRecords.slice(0, 4).map((rec, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[170px]">{rec.department} - {rec.batch}</span>
                      <span className="font-black text-xs text-emerald-700">
                        {rec.attendancePercentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Academic Governance Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Pending Action Items</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Speaking Viva Slots:</strong> 1-to-1 human oral exam appointments verified online only for DELF A1 & JLPT N5.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Continuous Assessments:</strong> 4 assessments before final exam configured across French, German, and Spanish A1 batches.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Final Exams Offline Center:</strong> Physical hall allocations & invigilator rosters ready for examination center audit.
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

      {/* ─── 4. Master Curriculum & Period Matrix Standards (Dynamic Schools & Colleges Data) ─── */}
      <div className="space-y-6">
        {/* Toggle Indicator banner */}
        <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              Active Curriculum Mode: <strong className={isSchoolMode ? 'text-emerald-700' : 'text-blue-700'}>{isSchoolMode ? '🏫 Schools Category (Cat 1 to Cat 6 Periods)' : '🏛️ Autonomous Colleges (Standard / Intensive / Super-Intensive)'}</strong>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Source: Supabase PostgreSQL Real-time Matrices
          </span>
        </div>

        {/* Table 1: Period Categories & Sub-Level Metrics (Schools Focus) */}
        <div className={`bg-white rounded-2xl border ${isSchoolMode ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-md' : 'border-slate-200/90 shadow-2xs'} overflow-hidden transition-all`}>
          <div className={`p-4 sm:p-5 ${isSchoolMode ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900' : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950'} text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isSchoolMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'}`}>
                  Schools Standard Table • Period Breakdown
                </span>
                <span className="text-xs text-slate-300">Cat 1 (35m) to Cat 6 (60m)</span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                School Curriculum Matrix (A1.1 to B1.4)
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Languages: <strong>French / German / Spanish / Korean</strong> • Teaching hours exclusive of assessment & final exam.
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/20">
                {schoolMatrices.length > 0 ? `${schoolMatrices.length} Levels Synced (DB)` : '9 Levels Available'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Level</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">Course Hours</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">Assessments</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">Human Speaking (2 Wks)</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">AI Speaking / Day</th>
                  <th className="py-2 px-2 text-center border-r border-slate-200 bg-blue-50/50" colSpan={2}>
                    <div className="font-bold text-blue-900">Cat 1 (35m)</div>
                    <div className="text-[9px] font-normal text-blue-700">Wk | Tot</div>
                  </th>
                  <th className="py-2 px-2 text-center border-r border-slate-200 bg-sky-50/50" colSpan={2}>
                    <div className="font-bold text-sky-900">Cat 2 (40m)</div>
                    <div className="text-[9px] font-normal text-sky-700">Wk | Tot</div>
                  </th>
                  <th className="py-2 px-2 text-center border-r border-slate-200 bg-indigo-50/50" colSpan={2}>
                    <div className="font-bold text-indigo-900">Cat 3 (45m)</div>
                    <div className="text-[9px] font-normal text-indigo-700">Wk | Tot</div>
                  </th>
                  <th className="py-2 px-2 text-center border-r border-slate-200 bg-purple-50/50" colSpan={2}>
                    <div className="font-bold text-purple-900">Cat 4 (50m)</div>
                    <div className="text-[9px] font-normal text-purple-700">Wk | Tot</div>
                  </th>
                  <th className="py-2 px-2 text-center border-r border-slate-200 bg-teal-50/50" colSpan={2}>
                    <div className="font-bold text-teal-900">Cat 5 (55m)</div>
                    <div className="text-[9px] font-normal text-teal-700">Wk | Tot</div>
                  </th>
                  <th className="py-2 px-2 text-center bg-emerald-50/50" colSpan={2}>
                    <div className="font-bold text-emerald-900">Cat 6 (60m)</div>
                    <div className="text-[9px] font-normal text-emerald-700">Wk | Tot</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schoolMatrices.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="py-8 text-center text-slate-500">
                      <p className="text-xs font-bold text-slate-700">Loading School Curriculum Matrix from Database...</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Fetching 9 CEFR sub-levels (A1.1 to B1.4)...</p>
                    </td>
                  </tr>
                ) : (
                  schoolMatrices.map((row) => (
                    <tr key={row.levelCode} className="hover:bg-slate-50/80 transition font-medium">
                      <td className="py-2.5 px-3 sticky left-0 bg-white font-bold text-slate-900 border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-black mr-1 text-[11px]">
                          {row.levelCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-center border-r border-slate-200 font-bold text-slate-800">
                        {row.durationHours}h
                      </td>
                      <td className="py-2.5 px-2.5 text-center border-r border-slate-200 text-blue-700 font-bold">
                        {row.assessmentsCount}
                      </td>
                      <td className="py-2.5 px-2.5 text-center border-r border-slate-200 text-purple-700 font-bold">
                        {row.humanSpeakingMinutesPer2Wk}m
                      </td>
                      <td className="py-2.5 px-2.5 text-center border-r border-slate-200 text-emerald-700 font-bold">
                        {row.aiSpeakingTimesPerDay}x
                      </td>

                      {/* Cat 1 */}
                      <td className="py-2.5 px-1.5 text-center text-slate-700 font-bold bg-blue-50/20">{row.cat1PeriodsPerWeek}</td>
                      <td className="py-2.5 px-1.5 text-center text-blue-900 font-black border-r border-slate-200 bg-blue-50/30">{row.cat1TotalPeriods}</td>

                      {/* Cat 2 */}
                      <td className="py-2.5 px-1.5 text-center text-slate-700 font-bold bg-sky-50/20">{row.cat2PeriodsPerWeek}</td>
                      <td className="py-2.5 px-1.5 text-center text-sky-900 font-black border-r border-slate-200 bg-sky-50/30">{row.cat2TotalPeriods}</td>

                      {/* Cat 3 */}
                      <td className="py-2.5 px-1.5 text-center text-slate-700 font-bold bg-indigo-50/20">{row.cat3PeriodsPerWeek}</td>
                      <td className="py-2.5 px-1.5 text-center text-indigo-900 font-black border-r border-slate-200 bg-indigo-50/30">{row.cat3TotalPeriods}</td>

                      {/* Cat 4 */}
                      <td className="py-2.5 px-1.5 text-center text-slate-700 font-bold bg-purple-50/20">{row.cat4PeriodsPerWeek}</td>
                      <td className="py-2.5 px-1.5 text-center text-purple-900 font-black border-r border-slate-200 bg-purple-50/30">{row.cat4TotalPeriods}</td>

                      {/* Cat 5 */}
                      <td className="py-2.5 px-1.5 text-center text-slate-700 font-bold bg-teal-50/20">{row.cat5PeriodsPerWeek}</td>
                      <td className="py-2.5 px-1.5 text-center text-teal-900 font-black border-r border-slate-200 bg-teal-50/30">{row.cat5TotalPeriods}</td>

                      {/* Cat 6 */}
                      <td className="py-2.5 px-1.5 text-center text-slate-700 font-bold bg-emerald-50/20">{row.cat6PeriodsPerWeek}</td>
                      <td className="py-2.5 px-1.5 text-center text-emerald-900 font-black bg-emerald-50/30">{row.cat6TotalPeriods}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Pacing Modes (Standard, Intensive, Super-Intensive) */}
        <div className={`bg-white rounded-2xl border ${!isSchoolMode ? 'border-blue-300 ring-2 ring-blue-100 shadow-md' : 'border-slate-200/90 shadow-2xs'} overflow-hidden transition-all`}>
          <div className={`p-4 sm:p-5 ${!isSchoolMode ? 'bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900' : 'bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900'} text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${!isSchoolMode ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'}`}>
                  Colleges Pacing Standards • Higher Education
                </span>
                <span className="text-xs text-slate-300">Standard (60m) | Intensive (90m) | Super-Intensive (120m)</span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                Autonomous College Pacing Matrix (CEFR A1–B2 & Japanese JLPT N5–N2)
              </h2>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/20">
                {collegeMatrices.length > 0 ? `${collegeMatrices.length} Tracks Synced (DB)` : '8 Tracks Available'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Level</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">Hours</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">Assessments</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">Speaking Mins/Wk</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">AI Speaking</th>
                  <th className="py-2 px-2 text-center border-r border-slate-200 bg-blue-50/50" colSpan={4}>
                    <div className="font-bold text-blue-900">Standard Pacing</div>
                    <div className="text-[9px] font-normal text-blue-700">Mins | Sess | Wk | Mo</div>
                  </th>
                  <th className="py-2 px-2 text-center border-r border-slate-200 bg-amber-50/50" colSpan={4}>
                    <div className="font-bold text-amber-900">Intensive Pacing</div>
                    <div className="text-[9px] font-normal text-amber-700">Mins | Sess | Wk | Mo</div>
                  </th>
                  <th className="py-2 px-2 text-center bg-rose-50/50" colSpan={4}>
                    <div className="font-bold text-rose-900">Super-Intensive</div>
                    <div className="text-[9px] font-normal text-rose-700">Mins | Sess | Wk | Mo</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {collegeMatrices.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="py-8 text-center text-slate-500">
                      <p className="text-xs font-bold text-slate-700">Loading Autonomous College Pacing Matrix from Database...</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Fetching 8 higher education pacing tracks (CEFR A1-B2 & JLPT N5-N2)...</p>
                    </td>
                  </tr>
                ) : (
                  collegeMatrices.map((row) => (
                    <tr key={row.levelCode} className="hover:bg-slate-50/80 transition font-medium">
                      <td className="py-2.5 px-3 sticky left-0 bg-white font-bold text-slate-900 border-r border-slate-200">
                        <div className="font-black text-slate-900">{row.levelCode}</div>
                        <div className="text-[10px] text-slate-500">{row.languageGroup}</div>
                      </td>
                      <td className="py-2.5 px-2.5 text-center border-r border-slate-200 font-bold text-slate-800">
                        {row.durationHours}h
                      </td>
                      <td className="py-2.5 px-2.5 text-center border-r border-slate-200 text-blue-700 font-bold">
                        {row.assessmentsCount}
                      </td>
                      <td className="py-2.5 px-2.5 text-center border-r border-slate-200 text-purple-700 font-bold">
                        {row.humanSpeakingMinutesPerWk}m
                      </td>
                      <td className="py-2.5 px-2.5 text-center border-r border-slate-200 text-emerald-700 font-bold">
                        {row.aiSpeakingTimesPerDay}x
                      </td>

                      {/* Standard */}
                      <td className="py-2.5 px-1 text-center text-slate-700 bg-blue-50/20">{row.stdMinsPerSession || '-'}</td>
                      <td className="py-2.5 px-1 text-center font-bold text-blue-900 bg-blue-50/20">{row.stdTotalSessions || '-'}</td>
                      <td className="py-2.5 px-1 text-center text-slate-700 bg-blue-50/20">{row.stdSessionsPerWeek || '-'}</td>
                      <td className="py-2.5 px-1 text-center font-black text-blue-900 border-r border-slate-200 bg-blue-50/30">{row.stdMonthsRequired ? `${row.stdMonthsRequired}m` : '-'}</td>

                      {/* Intensive */}
                      <td className="py-2.5 px-1 text-center text-slate-700 bg-amber-50/20">{row.intMinsPerSession || '-'}</td>
                      <td className="py-2.5 px-1 text-center font-bold text-amber-900 bg-amber-50/20">{row.intTotalSessions || '-'}</td>
                      <td className="py-2.5 px-1 text-center text-slate-700 bg-amber-50/20">{row.intSessionsPerWeek || '-'}</td>
                      <td className="py-2.5 px-1 text-center font-black text-amber-900 border-r border-slate-200 bg-amber-50/30">{row.intMonthsRequired ? `${row.intMonthsRequired}m` : '-'}</td>

                      {/* Super-Intensive */}
                      <td className="py-2.5 px-1 text-center text-slate-700 bg-rose-50/20">{row.supMinsPerSession || '-'}</td>
                      <td className="py-2.5 px-1 text-center font-bold text-rose-900 bg-rose-50/20">{row.supTotalSessions || '-'}</td>
                      <td className="py-2.5 px-1 text-center text-slate-700 bg-rose-50/20">{row.supSessionsPerWeek || '-'}</td>
                      <td className="py-2.5 px-1 text-center font-black text-rose-900 bg-rose-50/30">{row.supMonthsRequired ? `${row.supMonthsRequired}m` : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

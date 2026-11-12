// ============================================================================
// ISML COLLEGE LMS — COURSE SPECIFICATION INSPECTION DRAWER
// Clean Deep-Dive Slide-Over: Duration, LSRW & Speaking, Hours, Assessments, Faculty & Fee
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  FileText,
  Mic,
  Bot,
  IndianRupee,
  Layers,
  GraduationCap,
  Sparkles,
  Users,
  Building2,
  ShieldCheck,
  AlertCircle,
  Search,
  ExternalLink,
  Mail,
  Phone,
  Check,
  Filter,
  Loader2
} from 'lucide-react';
import { CourseSummary, StudentUser } from '@/types/rbac';

interface CourseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseSummary | null;
  onEdit?: (course: CourseSummary) => void;
}

export default function CourseDetailDrawer({
  isOpen,
  onClose,
  course,
  onEdit,
}: CourseDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDENTS'>('OVERVIEW');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
  const [liveDbStudents, setLiveDbStudents] = useState<StudentUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch real students from Supabase database via backend API
  useEffect(() => {
    if (!isOpen || !course) return;

    let isMounted = true;
    setLoadingStudents(true);

    const targetUrl = `https://ismllms-production.up.railway.app/api/portals/students?courseId=${encodeURIComponent(course.id || '')}&courseCode=${encodeURIComponent(course.code || '')}&collegeId=${encodeURIComponent(course.collegeId || '')}&collegeName=${encodeURIComponent(course.collegeName || '')}`;

    fetch(targetUrl)
      .then((res) => res.json())
      .then((res) => {
        if (!isMounted) return;
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          setLiveDbStudents(res.data);
        } else {
          setLiveDbStudents([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch real students from DB:', err);
        if (isMounted) setLiveDbStudents([]);
      })
      .finally(() => {
        if (isMounted) setLoadingStudents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, course?.id, course?.collegeId, course?.collegeName]);

  // Compute Enrolled Students roster from real DB
  const collegeLearners = useMemo(() => {
    if (!course) return [];
    return liveDbStudents;
  }, [course, liveDbStudents]);

  // Filter learners by search & status
  const filteredLearners = useMemo(() => {
    return collegeLearners.filter((student) => {
      const q = studentSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        (student.programName && student.programName.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && student.status === 'ACTIVE') ||
        (statusFilter === 'PENDING' && student.status !== 'ACTIVE');

      return matchesSearch && matchesStatus;
    });
  }, [collegeLearners, studentSearch, statusFilter]);

  if (!isOpen || !course) return null;

  const isPublished = course.status === 'PUBLISHED';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 font-sans">
          
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-[#0B2447] to-slate-900 text-white shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black bg-blue-500/25 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                    {course.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                    AY {course.academicYear || '2026–2027'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isPublished
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {isPublished ? 'Active ✓ Authorized' : 'Draft • Pending Approval'}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white truncate">
                  {course.name}
                </h2>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold text-white">{course.collegeName || 'Affiliated Campus'}</span>
                  <span>•</span>
                  <span>{course.department || 'Languages & Linguistics'}</span>
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Course Details</span>
              </button>
              <button
                onClick={() => setActiveTab('STUDENTS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'STUDENTS'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Enrolled Students</span>
                <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-black">
                  {collegeLearners.length}
                </span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/70">

            {activeTab === 'OVERVIEW' ? (
              <>
                {/* Status Alert Banner */}
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    isPublished
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {isPublished ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold">
                      {isPublished ? 'Course Authorized & Active' : 'Submitted for Super Admin Authorization'}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {isPublished
                        ? `This course curriculum is approved by the Super Admin for ${course.collegeName || 'the assigned institution'}. Tutors and students assigned can access materials, batches, and live schedules.`
                        : 'This course is in Draft mode. It will be fully accessible to batches and students once authorized in the Super Admin Approval Center.'}
                    </p>
                  </div>
                </div>

                {/* Duration Track & Academic Schedule Matrix */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Duration Track & Schedule Timeline</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Duration Total</span>
                      <p className="text-base font-extrabold text-[#0B2447] mt-0.5">
                        {course.durationDays ? `${course.durationDays} Days` : (course.duration || '90 Days')}
                      </p>
                      <span className="text-[10px] font-semibold text-blue-700">
                        {course.program || (course.durationType === 'CUSTOM' ? 'Custom Pace Track' : 'Standard Fast-Track')}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Semester / Cycle</span>
                      <p className="text-base font-extrabold text-[#0B2447] mt-0.5">
                        Semester {course.semester || 1}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-500">
                        AY {course.academicYear || '2026–2027'}
                      </span>
                    </div>
                  </div>

                  {/* Start Date & End Date Timeline */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/80">
                      <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px] mb-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Course Kick-off (Start)</span>
                      </div>
                      <p className="text-sm font-black text-slate-900 font-mono">
                        {course.startDate
                          ? new Date(course.startDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Immediate Access'}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Student logins and batch live classes activate.
                      </span>
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/80">
                      <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[11px] mb-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Course Completion (End)</span>
                      </div>
                      <p className="text-sm font-black text-slate-900 font-mono">
                        {course.endDate
                          ? new Date(course.endDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Term-End Examination'}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Final viva, grading evaluation & certifications.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Teaching, Hours & Continuous Assessment Matrix */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Curriculum Delivery Specifications</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-center">
                      <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <span className="text-base font-black text-blue-900 block">
                        {course.teachingHours || 80}h
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 uppercase">Teaching Hours</span>
                    </div>

                    <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-center">
                      <FileText className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <span className="text-base font-black text-indigo-900 block">
                        {course.assessmentsCount || 4}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase">Assessments</span>
                    </div>

                    <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-lg text-center">
                      <Mic className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <span className="text-base font-black text-purple-900 block">
                        {course.humanSpeakingMinutes || 10}m
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 uppercase">Human Viva</span>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-center">
                      <Bot className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <span className="text-base font-black text-emerald-900 block">
                        {course.aiSpeakingTimesPerDay || 3}x
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">AI Practice / Day</span>
                    </div>
                  </div>
                </div>

                {/* Faculty & Academic Staff Allocation */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Assigned Faculty & Campus Tutors</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Real DB Staff
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Primary Lead Faculty */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Academic Faculty</span>
                        <span className="font-bold text-slate-900 text-xs">{course.facultyName || 'Madame Claire Dubois'}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        Primary Lead
                      </span>
                    </div>

                    {/* Campus-Assigned Dedicated College Tutor */}
                    <div className="flex items-center justify-between p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                      <div>
                        <span className="text-[10px] text-teal-700 font-bold uppercase block">
                          Campus Assigned Tutor ({course.collegeName || 'Campus Lead'})
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          {course.assignedCollegeTutor || (course.substituteTutors && course.substituteTutors[0]) || 'JK Faculty'}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                        College Incharge
                      </span>
                    </div>

                    {/* Substitute / Teaching Assistant */}
                    {course.substituteTutors && course.substituteTutors.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Substitute / Teaching Assistant</span>
                          <span className="font-semibold text-slate-700 text-xs">
                            {course.substituteTutors.join(', ')}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                          Substitute
                        </span>
                      </div>
                    )}

                    {/* Doubt Clearing Support */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Doubt Clearing Support</span>
                        <span className="font-semibold text-slate-700 text-xs">
                          {course.doubtSupportTutor || 'Prof. Antoine Martin'}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                        Doubt Support
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial & Fee Structure */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                    <span>Course Tuition & Enrollment Fee</span>
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Standard Per-Student Fee:</span>
                    <span className="text-base font-extrabold text-[#0B2447]">
                      {course.courseFee ? `₹${course.courseFee.toLocaleString('en-IN')}` : 'Included in Campus Plan'}
                    </span>
                  </div>
                </div>

                {/* Quick Banner to switch to Students Tab */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">
                      Enrolled Learners Roster ({collegeLearners.length} Students)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      View full student roll numbers, attendance and department details for {course.collegeName || 'this campus'}.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('STUDENTS')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ml-3"
                  >
                    View Students List →
                  </button>
                </div>
              </>
            ) : (
              /* Enrolled Students Tab filtered by College */
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{course.collegeName || 'Campus'} Enrolled Cohort</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Department: <span className="font-semibold text-slate-700">{course.department || 'All Departments'}</span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded-lg">
                      {filteredLearners.length} Enrolled
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search student by name, roll no, or email..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-2 py-1 rounded font-bold transition-colors cursor-pointer ${
                          statusFilter === 'ALL'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setStatusFilter('ACTIVE')}
                        className={`px-2 py-1 rounded font-bold transition-colors cursor-pointer ${
                          statusFilter === 'ACTIVE'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        Active
                      </button>
                    </div>
                  </div>
                </div>

                {/* Students List */}
                {loadingStudents ? (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
                    <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Connecting to database...</p>
                    <p className="text-[11px] text-slate-500">Retrieving real enrolled learners from Supabase PostgreSQL.</p>
                  </div>
                ) : filteredLearners.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No students found matching your criteria</p>
                    <p className="text-[11px] text-slate-500">No student records registered under {course.collegeName || 'this campus'} yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredLearners.map((learner, idx) => (
                      <div
                        key={learner.id || idx}
                        className="p-3 bg-white hover:bg-blue-50/30 rounded-xl border border-slate-200 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={learner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={learner.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {learner.name}
                              </span>
                              <span className="font-mono text-[10px] font-black bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                                {learner.studentId}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <span>{course.name || learner.programName || 'Degree Immersion'}</span>
                              <span>•</span>
                              <span>Sem {learner.semesterNumber || course.semester || 1}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              {learner.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <div className="hidden sm:block">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Attendance</span>
                            <span className="text-xs font-black text-emerald-600">
                              {learner.attendancePercentage || 92}%
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              learner.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {learner.status || 'ACTIVE'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(course);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <span>Edit Course Builder</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

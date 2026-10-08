// ============================================================================
// ISML COLLEGE LMS — DEDICATED INSTITUTION / COLLEGE PROFILE & DIRECTORY
// Deep Dive: College Scope, Enrolled Students, Linked Parents, Courses & Batches
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Award,
  Sparkles,
  UserPlus,
  ExternalLink,
  HeartHandshake,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import DataTable, { Column } from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import { Institution, StudentUser, CourseSummary, Batch } from '@/types/rbac';
import {
  mockInstitutions,
  mockStudents,
  mockCourses,
  mockBatches,
} from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import OnboardCollegeDrawer from '@/components/super-admin/institutions/OnboardCollegeDrawer';
import CreateCourseDrawer from '@/components/super-admin/academic/CreateCourseDrawer';
import CreateBatchDrawer from '@/components/super-admin/academic/CreateBatchDrawer';
import AddUserDrawer from '@/components/super-admin/users/AddUserDrawer';

type DetailTab = 'students' | 'courses' | 'batches' | 'parents';

export default function InstitutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showInfo } = useToast();

  const collegeId = (params?.id as string) || 'inst-01';

  // State for college
  const [institutions, setInstitutions] = useState<Institution[]>(mockInstitutions);
  const college = institutions.find((i) => i.id === collegeId) || institutions[0];

  // Drawers & modals state
  const [isEditCollegeOpen, setIsEditCollegeOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [editCourseTarget, setEditCourseTarget] = useState<CourseSummary | null>(null);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<CourseSummary | null>(null);

  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [editBatchTarget, setEditBatchTarget] = useState<Batch | null>(null);
  const [deleteBatchTarget, setDeleteBatchTarget] = useState<Batch | null>(null);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<DetailTab>('students');

  // Filter states
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state for courses, batches, and students for this college
  const [allCourses, setAllCourses] = useState<CourseSummary[]>(mockCourses);
  const [allBatches, setAllBatches] = useState<Batch[]>(mockBatches);
  const [allStudents, setAllStudents] = useState<StudentUser[]>(mockStudents);

  // Filtered to this college
  const collegeCourses = useMemo(() => {
    return allCourses.filter((c) => !c.collegeId || c.collegeId === college.id);
  }, [allCourses, college.id]);

  const collegeBatches = useMemo(() => {
    return allBatches.filter((b) => !b.institutionId || b.institutionId === college.id);
  }, [allBatches, college.id]);

  const collegeStudents = useMemo(() => {
    return allStudents.filter((s) => s.collegeId === college.id);
  }, [allStudents, college.id]);

  // Tab 1: Students Filtered
  const filteredStudents = useMemo(() => {
    return collegeStudents.filter((s) => {
      // Course filter
      if (courseFilter !== 'ALL' && s.enrolledCourseId !== courseFilter && s.programId !== courseFilter) {
        return false;
      }
      // Batch filter
      if (batchFilter !== 'ALL' && s.batchId !== batchFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && s.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesId = s.studentId.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesCourse = (s.enrolledCourseName || s.programName || '').toLowerCase().includes(q);
        const matchesParent = (s.parentName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesEmail && !matchesCourse && !matchesParent) {
          return false;
        }
      }
      return true;
    });
  }, [collegeStudents, courseFilter, batchFilter, statusFilter, searchQuery]);

  // Tab 4: Derived Parents List
  const collegeParents = useMemo(() => {
    return collegeStudents
      .filter((s) => Boolean(s.parentName))
      .map((s) => ({
        id: `parent-${s.id}`,
        name: s.parentName || 'Parent / Guardian',
        relationship: s.parentRelationship || 'GUARDIAN',
        mobile: s.parentMobile || s.mobile,
        email: s.parentEmail || '—',
        studentId: s.id,
        studentName: s.name,
        studentRollNo: s.studentId,
        enrolledCourse: s.enrolledCourseName || s.programName,
        batchName: s.batchName,
        portalAccess: s.parentPortalAccess !== false,
      }));
  }, [collegeStudents]);

  // Handlers
  const handleCollegeUpdated = (updated: Institution) => {
    setInstitutions((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    showSuccess(`College details for "${updated.name}" updated successfully.`);
    setIsEditCollegeOpen(false);
  };

  const handleCourseCreated = (newCourse: CourseSummary) => {
    const courseWithCollege: CourseSummary = {
      ...newCourse,
      collegeId: college.id,
      collegeName: college.name,
    };
    setAllCourses((prev) => [courseWithCollege, ...prev]);
    showSuccess(`Course "${newCourse.name}" mapped to ${college.name}.`);
    setIsCreateCourseOpen(false);
  };

  const handleCourseUpdated = (updatedCourse: CourseSummary) => {
    setAllCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
    showSuccess(`Course "${updatedCourse.name}" updated successfully.`);
    setEditCourseTarget(null);
  };

  const handleDeleteCourse = () => {
    if (!deleteCourseTarget) return;
    setAllCourses((prev) => prev.filter((c) => c.id !== deleteCourseTarget.id));
    showSuccess(`Course "${deleteCourseTarget.name}" removed from ${college.name}.`);
    setDeleteCourseTarget(null);
  };

  const handleBatchCreated = (newBatch: Batch) => {
    const batchWithCollege: Batch = {
      ...newBatch,
      institutionId: college.id,
      institutionName: college.name,
    };
    setAllBatches((prev) => [batchWithCollege, ...prev]);
    showSuccess(`Batch "${newBatch.name}" created under ${college.name}.`);
    setIsCreateBatchOpen(false);
  };

  const handleBatchUpdated = (updatedBatch: Batch) => {
    setAllBatches((prev) => prev.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)));
    showSuccess(`Batch "${updatedBatch.name}" updated successfully.`);
    setEditBatchTarget(null);
  };

  const handleDeleteBatch = () => {
    if (!deleteBatchTarget) return;
    setAllBatches((prev) => prev.filter((b) => b.id !== deleteBatchTarget.id));
    showSuccess(`Batch "${deleteBatchTarget.name}" deleted.`);
    setDeleteBatchTarget(null);
  };

  const handleStudentCreated = (newStudent: any) => {
    const studentUser: StudentUser = {
      ...newStudent,
      collegeId: college.id,
      collegeName: college.name,
      studentId: newStudent.studentId || `ISML${Date.now().toString().slice(-4)}`,
      enrolledCoursesCount: 1,
      attendancePercentage: 100,
      completedAssessmentsCount: 0,
      activeDoubtsCount: 0,
      createdDate: new Date().toISOString(),
      credentialsDelivered: true,
    };
    setAllStudents((prev) => [studentUser, ...prev]);
    showSuccess(`Student "${newStudent.name}" enrolled into ${college.name}.`);
    setIsAddStudentOpen(false);
  };

  // Switch to students tab and filter by specific course
  const viewStudentsInCourse = (courseId: string) => {
    setCourseFilter(courseId);
    setBatchFilter('ALL');
    setActiveTab('students');
  };

  // Switch to students tab and filter by specific batch
  const viewStudentsInBatch = (bId: string) => {
    setBatchFilter(bId);
    setCourseFilter('ALL');
    setActiveTab('students');
  };

  const handleToggleStudent = (student: StudentUser) => {
    const nextStatus = student.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setAllStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
    );
    if (nextStatus === 'SUSPENDED') {
      showInfo(`Student "${student.name}" account suspended.`);
    } else {
      showSuccess(`Student "${student.name}" account activated.`);
    }
  };

  const handleToggleCourse = (course: CourseSummary) => {
    const nextStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setAllCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, status: nextStatus } : c))
    );
    if (nextStatus === 'DRAFT') {
      showInfo(`Course "${course.name}" unpublished / suspended.`);
    } else {
      showSuccess(`Course "${course.name}" published.`);
    }
  };

  const handleToggleBatch = (batch: Batch) => {
    const nextStatus = batch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setAllBatches((prev) =>
      prev.map((b) => (b.id === batch.id ? { ...b, status: nextStatus } : b))
    );
    if (nextStatus === 'INACTIVE') {
      showInfo(`Batch cohort "${batch.name}" suspended.`);
    } else {
      showSuccess(`Batch cohort "${batch.name}" activated.`);
    }
  };

  // Student Columns
  const studentColumns: Column<StudentUser>[] = [
    {
      key: 'name',
      header: 'Student Name & Roll No',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0052CC]/10 text-[#0052CC] font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.name}</p>
            <span className="font-mono text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
              {row.studentId}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Enrolled Course',
      render: (row) => (
        <div>
          <p className="font-semibold text-xs text-slate-800">
            {row.enrolledCourseName || row.programName}
          </p>
          <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
            {row.enrolledCourseCode || 'CORE'}
          </span>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch Cohort',
      render: (row) => (
        <div>
          <p className="text-xs font-medium text-slate-700">{row.batchName}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Sem {row.semesterNumber}</span>
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent / Guardian',
      render: (row) => (
        <div>
          <p className="font-medium text-xs text-slate-800">{row.parentName || '—'}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            {row.parentRelationship && (
              <span className="font-bold text-blue-700 uppercase">{row.parentRelationship}</span>
            )}
            {row.parentMobile && <span>• {row.parentMobile}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-[140px]',
      render: (row) => (
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full">
          <StatusToggleSwitch
            checked={row.status === 'ACTIVE'}
            onChange={() => handleToggleStudent(row)}
            activeLabel="Active"
            inactiveLabel="Suspended"
          />
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      key: 'attendancePercentage',
      header: 'Attendance',
      sortable: true,
      render: (row) => (
        <span
          className={`font-bold text-xs ${
            row.attendancePercentage >= 85
              ? 'text-emerald-700'
              : row.attendancePercentage >= 75
              ? 'text-amber-700'
              : 'text-rose-700'
          }`}
        >
          {row.attendancePercentage}%
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (row) => (
        <Link
          href={`/super-admin/students/${row.id}`}
          className="p-1.5 text-slate-500 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors inline-block"
          title="Open Full Student Profile"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Administration', href: '/super-admin/institutions' },
          { label: 'Institutions', href: '/super-admin/institutions' },
          { label: college.name },
        ]}
      />

      {/* ─── Top Executive College Banner Card ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-[#0B2447] text-white p-4 sm:p-6 border-b border-[#1E3A8A]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-base sm:text-2xl font-extrabold text-white tracking-tight">
                    {college.name}
                  </h1>
                  <span className="font-mono text-xs font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                    {college.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {college.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {college.affiliation} • {college.type}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate max-w-[280px] sm:max-w-none">{college.address}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{college.contactEmail}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{college.contactPhone}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <Link
                href="/super-admin/institutions"
                className="px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Colleges</span>
              </Link>
              <button
                onClick={() => setIsEditCollegeOpen(true)}
                className="px-3 py-1.5 sm:py-2 bg-cyan-500 hover:bg-cyan-400 text-[#071730] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit College Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Metric Strip ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/70 p-3 sm:p-4 text-center">
          <div className="p-2 sm:p-0">
            <p className="text-xl sm:text-2xl font-black text-[#0B2447]">
              {collegeStudents.length || college.studentsCount}
            </p>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Enrolled Learners
            </p>
          </div>
          <div className="p-2 sm:p-0">
            <p className="text-xl sm:text-2xl font-black text-indigo-700">
              {collegeParents.length}
            </p>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Parents / Guardians
            </p>
          </div>
          <div className="p-2 sm:p-0">
            <p className="text-xl sm:text-2xl font-black text-purple-700">
              {collegeCourses.length}
            </p>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Active Courses
            </p>
          </div>
          <div className="p-2 sm:p-0">
            <p className="text-xl sm:text-2xl font-black text-emerald-700">
              {collegeBatches.length}
            </p>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Cohort Batches
            </p>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation Bar & Action Triggers ─── */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#0052CC] text-white shadow-sm ring-2 ring-blue-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students Directory ({filteredStudents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-[#0052CC] text-white shadow-sm ring-2 ring-blue-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses & Curricula ({collegeCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'batches'
                ? 'bg-[#0052CC] text-white shadow-sm ring-2 ring-blue-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Batches & Cohorts ({collegeBatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parents')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'parents'
                ? 'bg-[#0052CC] text-white shadow-sm ring-2 ring-blue-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Parents Directory ({collegeParents.length})</span>
          </button>
        </div>

        {/* Action Triggers based on context */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {activeTab === 'students' && (
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>+ Enroll Student</span>
            </button>
          )}

          {activeTab === 'courses' && (
            <button
              onClick={() => {
                setEditCourseTarget(null);
                setIsCreateCourseOpen(true);
              }}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>+ Add Course</span>
            </button>
          )}

          {activeTab === 'batches' && (
            <button
              onClick={() => {
                setEditBatchTarget(null);
                setIsCreateBatchOpen(true);
              }}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>+ Create Cohort Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── TAB 1: STUDENTS DIRECTORY ─── */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Quick Filter Pill Controls */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2.5 text-xs font-sans">
            {/* Search Box */}
            <div className="flex-1 min-w-[200px] flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search student name, roll number, parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-slate-800 placeholder-slate-400 outline-none w-full text-xs"
              />
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Course:</span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="ALL">All Enrolled Courses</option>
                {collegeCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Batch:</span>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="ALL">All Batches</option>
                {collegeBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            {(courseFilter !== 'ALL' || batchFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setCourseFilter('ALL');
                  setBatchFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 text-[11px] font-bold text-[#0052CC] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Students Data Table with Mobile Responsive Cards */}
          <DataTable
            data={filteredStudents}
            columns={studentColumns}
            rowKey={(s) => s.id}
            searchPlaceholder="Filter students..."
            emptyTitle={`No learners found for ${college.name}`}
            emptyDescription="Try selecting another course or batch filter above."
            mobileCardRender={(row) => (
              <div className="space-y-2.5 font-sans">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0052CC]/10 text-[#0052CC] font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                      {row.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0B2447] text-xs">{row.name}</p>
                      <span className="font-mono text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {row.studentId}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                  <StatusToggleSwitch
                    checked={row.status === 'ACTIVE'}
                    onChange={() => handleToggleStudent(row)}
                    activeLabel="Active"
                    inactiveLabel="Suspended"
                  />
                  <StatusBadge status={row.status} />
                </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Course</span>
                    <span className="font-bold text-slate-800 line-clamp-1">
                      {row.enrolledCourseName || row.programName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Batch</span>
                    <span className="font-bold text-slate-800 line-clamp-1">{row.batchName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Parent</span>
                    <span className="font-bold text-slate-800">{row.parentName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Attendance</span>
                    <span className="font-bold text-emerald-700">{row.attendancePercentage}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                  <Link
                    href={`/super-admin/students/${row.id}`}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Learner Profile</span>
                  </Link>
                </div>
              </div>
            )}
          />
        </div>
      )}

      {/* ─── TAB 2: COURSES & CURRICULA ─── */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collegeCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold bg-blue-50 text-[#0052CC] border border-blue-200 px-2.5 py-0.5 rounded-lg">
                      {c.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusToggleSwitch
                        checked={c.status === 'PUBLISHED'}
                        onChange={() => handleToggleCourse(c)}
                        activeLabel="Published"
                        inactiveLabel="Suspended"
                      />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#0B2447] leading-snug">{c.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.department}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Fee</span>
                      <span className="font-extrabold text-emerald-800">
                        ₹{(c.courseFee || 14500).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Credits</span>
                      <span className="font-bold text-slate-800">{c.credits || 4} Credits</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Faculty</span>
                      <span className="font-semibold text-slate-700 truncate block">{c.facultyName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Enrolled</span>
                      <span className="font-bold text-[#0052CC]">{c.enrolledStudents} Students</span>
                    </div>
                  </div>

                  {c.batchNames && c.batchNames.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Mapped Batches:</span>
                      <div className="flex flex-wrap gap-1">
                        {c.batchNames.map((bn, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200"
                          >
                            {bn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => viewStudentsInCourse(c.id)}
                    className="flex-1 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Students</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditCourseTarget(c);
                      setIsCreateCourseOpen(true);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Edit Course"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteCourseTarget(c)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {collegeCourses.length === 0 && (
            <EmptyState
              title="No courses configured yet"
              description={`There are currently no learning courses mapped to ${college.name}.`}
            />
          )}
        </div>
      )}

      {/* ─── TAB 3: BATCHES & COHORTS ─── */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collegeBatches.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                      Semester {b.currentSemesterNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusToggleSwitch
                        checked={b.status === 'ACTIVE'}
                        onChange={() => handleToggleBatch(b)}
                        activeLabel="Active"
                        inactiveLabel="Suspended"
                      />
                      <StatusBadge status={b.status} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#0B2447] leading-snug">{b.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{b.programName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Years</span>
                      <span className="font-bold text-slate-800">
                        {b.admissionYear} – {b.graduationYear}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Capacity</span>
                      <span className="font-bold text-[#0052CC]">{b.studentsCount} Students</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Sections</span>
                      <span className="font-semibold text-slate-700">{b.sectionsCount} Sections</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Campus</span>
                      <span className="font-semibold text-slate-700 truncate block">{college.code}</span>
                    </div>
                  </div>

                  {b.courseNames && b.courseNames.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled In Courses:</span>
                      <div className="flex flex-wrap gap-1">
                        {b.courseNames.map((cn, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200"
                          >
                            {cn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => viewStudentsInBatch(b.id)}
                    className="flex-1 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Batch Students</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditBatchTarget(b);
                      setIsCreateBatchOpen(true);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Edit Batch"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteBatchTarget(b)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                    title="Delete Batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {collegeBatches.length === 0 && (
            <EmptyState
              title="No batches registered"
              description={`There are currently no cohort batches active under ${college.name}.`}
            />
          )}
        </div>
      )}

      {/* ─── TAB 4: PARENTS & GUARDIANS DIRECTORY ─── */}
      {activeTab === 'parents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#0B2447]">Parents & Guardian Registry</h3>
                <p className="text-xs text-slate-500">
                  Registered emergency contacts and parent portal guardians for students in {college.name}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200">
                {collegeParents.length} Linked Guardians
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {collegeParents.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-extrabold flex items-center justify-center text-sm shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-xs text-[#0B2447]">{p.name}</p>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.2 rounded border border-slate-200">
                          {p.relationship}
                        </span>
                        {p.portalAccess ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Portal Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            No App Login
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.mobile}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{p.email}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Ward / Student</span>
                    <Link
                      href={`/super-admin/students/${p.studentId}`}
                      className="font-bold text-xs text-[#0052CC] hover:underline flex items-center sm:justify-end gap-1"
                    >
                      <span>{p.studentName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <span className="text-[11px] text-slate-500 block">
                      {p.enrolledCourse} • {p.batchName}
                    </span>
                  </div>
                </div>
              ))}

              {collegeParents.length === 0 && (
                <div className="p-8 text-center">
                  <EmptyState
                    title="No parent records found"
                    description={`There are currently no parent contacts associated with students in ${college.name}.`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALS & DRAWERS ─── */}

      {/* 1. Edit College Drawer */}
      <OnboardCollegeDrawer
        isOpen={isEditCollegeOpen}
        onClose={() => setIsEditCollegeOpen(false)}
        editInstitution={college}
        onInstitutionUpdated={handleCollegeUpdated}
        onInstitutionCreated={() => {}}
      />

      {/* 2. Create / Edit Course Drawer */}
      <CreateCourseDrawer
        isOpen={isCreateCourseOpen}
        onClose={() => {
          setIsCreateCourseOpen(false);
          setEditCourseTarget(null);
        }}
        onCourseCreated={handleCourseCreated}
        editCourse={editCourseTarget}
        onCourseUpdated={handleCourseUpdated}
      />

      {/* 3. Delete Course Confirmation Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteCourseTarget}
        onClose={() => setDeleteCourseTarget(null)}
        onConfirm={handleDeleteCourse}
        entityType="Academic Course"
        entityName={deleteCourseTarget?.name}
      />

      {/* 4. Create / Edit Batch Drawer */}
      <CreateBatchDrawer
        isOpen={isCreateBatchOpen}
        onClose={() => {
          setIsCreateBatchOpen(false);
          setEditBatchTarget(null);
        }}
        onBatchCreated={handleBatchCreated}
        editBatch={editBatchTarget}
        onBatchUpdated={handleBatchUpdated}
      />

      {/* 5. Delete Batch Confirmation Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteBatchTarget}
        onClose={() => setDeleteBatchTarget(null)}
        onConfirm={handleDeleteBatch}
        entityType="Cohort Batch"
        entityName={deleteBatchTarget?.name}
      />

      {/* 6. Enroll Student Drawer */}
      <AddUserDrawer
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onUserCreated={handleStudentCreated}
        initialRoleId="role-student"
      />
    </div>
  );
}

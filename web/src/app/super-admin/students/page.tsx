// ============================================================================
// ISML COLLEGE LMS — COLLEGE-WISE STUDENT MANAGEMENT
// Dedicated Learner Directory with Cascading Academic Hierarchy Filters
// RBAC: STUDENT_VIEW, STUDENT_CREATE, STUDENT_STATUS_UPDATE, STUDENT_EXPORT
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Layers,
  BookOpen,
  Calendar,
  Filter,
  Search,
  Download,
  UserPlus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  UserCheck,
  UserX,
  HelpCircle,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import { Can, useRbac } from '@/context/AuthRbacContext';
import { StudentUser, UserStatus, SuperAdminUser } from '@/types/rbac';
import {
  mockStudents,
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches,
} from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import AddUserDrawer from '@/components/super-admin/users/AddUserDrawer';
import BulkStudentUploadDrawer from '@/components/super-admin/students/BulkStudentUploadDrawer';
import StatusConfirmDialog from '@/components/super-admin/users/StatusConfirmDialog';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';

export default function StudentsPage() {
  const { hasPermission } = useRbac();
  const { showSuccess, showInfo } = useToast();
  const { selectedCollegeId, setSelectedCollegeId } = useCollege();

  const [students, setStudents] = useState<StudentUser[]>(mockStudents);

  // Cascading Hierarchy Filter States
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('ALL');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<number>(0); // 0 = ALL
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [deleteStudentTarget, setDeleteStudentTarget] = useState<StudentUser | null>(null);
  const [statusDialogTarget, setStatusDialogTarget] = useState<{
    student: StudentUser;
    action: 'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND';
  } | null>(null);

  const handleDeleteStudent = () => {
    if (!deleteStudentTarget) return;
    setStudents((prev) => prev.filter((s) => s.id !== deleteStudentTarget.id));
    showSuccess(`Student record for "${deleteStudentTarget.name}" deleted successfully.`);
    setDeleteStudentTarget(null);
  };

  // ─── CASCADING DATA COMPUTATION ───
  // Departments belonging to selected College
  const availableDepartments = useMemo(() => {
    if (selectedCollegeId === 'ALL') return mockDepartments;
    return mockDepartments.filter(
      (d) => !d.institutionId || d.institutionId === selectedCollegeId
    );
  }, [selectedCollegeId]);

  // Programs belonging to selected Department (or selected College)
  const availablePrograms = useMemo(() => {
    if (selectedDeptId !== 'ALL') {
      return mockPrograms.filter((p) => p.departmentId === selectedDeptId);
    }
    const deptIds = new Set(availableDepartments.map((d) => d.id));
    return mockPrograms.filter((p) => deptIds.has(p.departmentId));
  }, [selectedDeptId, availableDepartments]);

  // Batches belonging to selected Program
  const availableBatches = useMemo(() => {
    if (selectedProgramId !== 'ALL') {
      return mockBatches.filter((b) => b.programId === selectedProgramId);
    }
    const progIds = new Set(availablePrograms.map((p) => p.id));
    return mockBatches.filter((b) => progIds.has(b.programId));
  }, [selectedProgramId, availablePrograms]);

  // Handle Cascading Resets
  const handleCollegeChange = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    setSelectedDeptId('ALL');
    setSelectedProgramId('ALL');
    setSelectedBatchId('ALL');
    setSelectedSemester(0);
  };

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setSelectedProgramId('ALL');
    setSelectedBatchId('ALL');
    setSelectedSemester(0);
  };

  const handleProgramChange = (progId: string) => {
    setSelectedProgramId(progId);
    setSelectedBatchId('ALL');
    setSelectedSemester(0);
  };

  // ─── COLLEGE-WISE METRICS ───
  const collegeMetrics = useMemo(() => {
    const collegeStudents =
      selectedCollegeId === 'ALL'
        ? students
        : students.filter((s) => s.collegeId === selectedCollegeId);

    const total = collegeStudents.length;
    const active = collegeStudents.filter((s) => s.status === 'ACTIVE').length;
    const programsCount = new Set(collegeStudents.map((s) => s.programId)).size;
    const batchesCount = new Set(collegeStudents.map((s) => s.batchId)).size;
    const avgAttendance =
      total > 0
        ? Math.round(
            (collegeStudents.reduce((acc, s) => acc + s.attendancePercentage, 0) / total) * 10
          ) / 10
        : 0;

    return { total, active, programsCount, batchesCount, avgAttendance };
  }, [students, selectedCollegeId]);

  // ─── FILTERED STUDENT LIST ───
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedCollegeId !== 'ALL' && s.collegeId !== selectedCollegeId) return false;
      if (selectedDeptId !== 'ALL' && s.departmentId !== selectedDeptId) return false;
      if (selectedProgramId !== 'ALL' && s.programId !== selectedProgramId) return false;
      if (selectedBatchId !== 'ALL' && s.batchId !== selectedBatchId) return false;
      if (selectedSemester !== 0 && s.semesterNumber !== selectedSemester) return false;
      if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.programName.toLowerCase().includes(q) ||
          s.departmentName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [
    students,
    selectedCollegeId,
    selectedDeptId,
    selectedProgramId,
    selectedBatchId,
    selectedSemester,
    selectedStatus,
    searchQuery,
  ]);

  // Handlers
  const handleStudentCreated = (newUser: SuperAdminUser) => {
    // If student role, create a student record
    const newStudent: StudentUser = {
      id: `stu-${Date.now().toString().slice(-4)}`,
      studentId: newUser.id,
      name: newUser.name,
      firstName: newUser.firstName || newUser.name.split(' ')[0],
      lastName: newUser.lastName || '',
      email: newUser.email,
      mobile: newUser.mobile || '',
      avatarUrl: newUser.avatarUrl,
      collegeId: newUser.collegeId,
      collegeName: newUser.collegeName,
      departmentId: newUser.departmentId || 'dept-cs',
      departmentName: newUser.departmentName || 'Department of Computer Science & IT',
      programId: newUser.programId || 'prog-bsc-cs',
      programName: newUser.programName || 'B.Sc Computer Science',
      batchId: newUser.batchId || 'batch-2026-cs',
      batchName: newUser.batchName || 'Cohort 2026–2029',
      semesterNumber: newUser.semesterNumber || 1,
      admissionYear: '2026',
      academicYear: '2026–2027',
      status: 'ACTIVE',
      attendancePercentage: 100,
      enrolledCoursesCount: 5,
      completedAssessmentsCount: 0,
      activeDoubtsCount: 0,
      createdDate: new Date().toISOString(),
      credentialsDelivered: true,
    };
    setStudents((prev) => [newStudent, ...prev]);
    showSuccess(`Student account for ${newStudent.name} created successfully.`);
  };

  const handleBulkStudentsImported = (newStudents: StudentUser[]) => {
    setStudents((prev) => [...newStudents, ...prev]);
  };

  const handleStatusUpdated = (userId: string, newStatus: UserStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === userId || s.studentId === userId ? { ...s, status: newStatus } : s
      )
    );
    showSuccess(`Student account status updated to ${newStatus}.`);
  };

  const handleToggleStudent = (student: StudentUser) => {
    const nextStatus: UserStatus = student.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
    );
    if (nextStatus === 'SUSPENDED') {
      showInfo(`Student "${student.name}" account suspended.`);
    } else {
      showSuccess(`Student "${student.name}" account activated.`);
    }
  };

  const handleExportStudents = () => {
    showSuccess(
      `Exporting ${filteredStudents.length} student records for ${
        selectedCollegeId === 'ALL'
          ? 'All Colleges'
          : mockInstitutions.find((i) => i.id === selectedCollegeId)?.name
      } (CSV Format).`
    );
  };

  const selectedCollegeName = useMemo(() => {
    if (selectedCollegeId === 'ALL') return 'All Affiliated Colleges';
    return (
      mockInstitutions.find((i) => i.id === selectedCollegeId)?.name ||
      'Selected Institution'
    );
  }, [selectedCollegeId]);

  const columns: Column<StudentUser>[] = [
    {
      key: 'studentId',
      header: 'Student ID',
      render: (row) => (
        <span className="font-mono text-[11px] font-bold text-[#0B2447] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.studentId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Student & Email',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <Link
              href={`/super-admin/students/${row.id}`}
              className="font-bold text-[#0B2447] text-xs hover:text-[#0052CC] hover:underline block truncate"
            >
              {row.name}
            </Link>
            <p className="text-[11px] text-slate-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'collegeName',
      header: 'College',
      render: (row) => (
        <span
          className="text-slate-700 text-xs truncate max-w-[140px] inline-block font-medium"
          title={row.collegeName}
        >
          {row.collegeName}
        </span>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (row) => (
        <span
          className="text-slate-600 text-xs truncate max-w-[130px] inline-block"
          title={row.departmentName}
        >
          {row.departmentName}
        </span>
      ),
    },
    {
      key: 'programName',
      header: 'Program',
      render: (row) => (
        <span
          className="text-[#0052CC] font-semibold text-xs truncate max-w-[130px] inline-block"
          title={row.programName}
        >
          {row.programName}
        </span>
      ),
    },
    {
      key: 'batchName',
      header: 'Batch',
      render: (row) => (
        <span className="text-slate-600 text-xs truncate max-w-[110px] inline-block">
          {row.batchName}
        </span>
      ),
    },
    {
      key: 'semesterNumber',
      header: 'Semester',
      render: (row) => (
        <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          Sem {row.semesterNumber}
        </span>
      ),
    },
    {
      key: 'parentName',
      header: 'Guardian & Portal',
      render: (row) => (
        <div className="min-w-0 max-w-[150px]">
          {row.parentName ? (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 text-xs truncate block" title={row.parentName}>
                  {row.parentName}
                </span>
                <span className="text-[9px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.2 rounded border border-teal-200 uppercase shrink-0">
                  {row.parentRelationship || 'GUARDIAN'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate" title={row.parentEmail || row.parentMobile}>
                {row.parentEmail || row.parentMobile || 'Portal Linked'}
              </p>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Not Linked</span>
          )}
        </div>
      ),
    },
    {
      key: 'attendancePercentage',
      header: 'Attendance',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
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
      key: 'actions',
      header: '',
      className: 'text-right min-w-[70px]',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/super-admin/students/${row.id}`}
            className="p-1.5 text-slate-400 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors inline-block"
            title="View Complete Student Profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setDeleteStudentTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Student Record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 font-sans">
      <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Students' }]} />

      <CollegeFilterBar />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Students
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            View and manage students across colleges, departments, programs, and batches.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Can permission="STUDENT_EXPORT">
            <button
              onClick={handleExportStudents}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </Can>

          <Can permission="STUDENT_CREATE">
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Bulk upload student cohort with linked parent portal accounts"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Bulk Upload</span>
            </button>
          </Can>

          <Can permission="USER_CREATE">
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Enroll Student</span>
            </button>
          </Can>
        </div>
      </div>

      {/* College-Wise Institutional Dashboard Bar */}
      <div className="bg-gradient-to-r from-[#0B2447] to-[#19376D] rounded-2xl p-5 text-white shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold block">
                College Selector / Campus Context
              </span>
              <h3 className="text-base font-bold text-white">{selectedCollegeName}</h3>
            </div>
          </div>

          {/* Top College Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-blue-200 whitespace-nowrap font-medium">Switch College:</label>
            <select
              value={selectedCollegeId}
              onChange={(e) => handleCollegeChange(e.target.value)}
              className="bg-white/15 border border-white/20 text-white text-xs rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:bg-[#0B2447] cursor-pointer"
            >
              <option value="ALL" className="text-slate-900">🏛️ Overall (All Colleges)</option>
              {mockInstitutions.map((inst) => (
                <option key={inst.id} value={inst.id} className="text-slate-900">
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic College Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-blue-200 block">Total Students</span>
            <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{collegeMetrics.total}</p>
            <span className="text-[10px] text-blue-300">Enrolled records</span>
          </div>

          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-blue-200 block">Active Learners</span>
            <p className="text-xl sm:text-2xl font-bold text-emerald-300 mt-0.5">{collegeMetrics.active}</p>
            <span className="text-[10px] text-blue-300">Authorized & In-Session</span>
          </div>

          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-blue-200 block">Active Programs</span>
            <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{collegeMetrics.programsCount}</p>
            <span className="text-[10px] text-blue-300">Degree pathways</span>
          </div>

          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-blue-200 block">Batches & Cohorts</span>
            <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{collegeMetrics.batchesCount}</p>
            <span className="text-[10px] text-blue-300">Academic cohorts</span>
          </div>
        </div>
      </div>

      {/* Cascading Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B2447]">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Academic Hierarchy Cascading Filters</span>
          </div>
          {(selectedDeptId !== 'ALL' ||
            selectedProgramId !== 'ALL' ||
            selectedBatchId !== 'ALL' ||
            selectedSemester !== 0 ||
            selectedStatus !== 'ALL' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedDeptId('ALL');
                setSelectedProgramId('ALL');
                setSelectedBatchId('ALL');
                setSelectedSemester(0);
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] text-[#0052CC] font-semibold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, student ID, email or degree..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
          />
        </div>

        {/* 5-Level Cascading Hierarchy Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {/* 1. Department */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {availableDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Program */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Program / Degree
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => handleProgramChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
            >
              <option value="ALL">All Programs</option>
              {availablePrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Batch */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Batch Cohort
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
            >
              <option value="ALL">All Batches</option>
              {availableBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Semester */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
            >
              <option value={0}>All Semesters</option>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
              <option value={3}>Semester 3</option>
              <option value={4}>Semester 4</option>
              <option value={5}>Semester 5</option>
              <option value={6}>Semester 6</option>
              <option value={7}>Semester 7</option>
              <option value={8}>Semester 8</option>
            </select>
          </div>

          {/* 5. Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Table */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        rowKey={(row) => row.id}
        mobileCardRender={(student) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/super-admin/students/${student.id}`}
                    className="font-bold text-[#0B2447] text-xs hover:text-[#0052CC] hover:underline block truncate"
                  >
                    {student.name}
                  </Link>
                  <p className="text-[10px] text-slate-500 truncate">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusToggleSwitch
                  checked={student.status === 'ACTIVE'}
                  onChange={() => handleToggleStudent(student)}
                />
                <StatusBadge status={student.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded-lg">
              <div>
                <span className="text-slate-400 block font-medium">ID & Program</span>
                <span className="font-mono font-bold text-[#0052CC]">{student.studentId}</span>
                <span className="text-slate-600 block truncate">{student.programName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Cohort & Attendance</span>
                <span className="text-slate-700 font-semibold">{student.batchName} • Sem {student.semesterNumber}</span>
                <span className={`block font-bold ${student.attendancePercentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {student.attendancePercentage}% Attendance
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
              <span className="text-slate-500 truncate max-w-[130px]">
                {student.parentName ? `Guardian: ${student.parentName}` : 'No Guardian Linked'}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/super-admin/students/${student.id}`}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Profile</span>
                </Link>

                <Can permission="STUDENT_STATUS_UPDATE">
                  <button
                    onClick={() =>
                      setStatusDialogTarget({
                        student,
                        action: student.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE',
                      })
                    }
                    className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 ${
                      student.status === 'ACTIVE'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {student.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </Can>

                <button
                  onClick={() => setDeleteStudentTarget(student)}
                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md"
                  title="Delete Student"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {/* Delete Confirmation Right-Side Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteStudentTarget}
        onClose={() => setDeleteStudentTarget(null)}
        onConfirm={handleDeleteStudent}
        entityType="Student Record"
        entityName={deleteStudentTarget?.name}
      />

      {/* Add User / Enroll Student Slide-over Drawer */}
      <AddUserDrawer
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserCreated={handleStudentCreated}
        initialRoleId="role-student"
      />

      {/* Bulk Student Upload & Parent-Link Ingestion Drawer */}
      <BulkStudentUploadDrawer
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onStudentsImported={handleBulkStudentsImported}
        defaultCollegeId={selectedCollegeId !== 'ALL' ? selectedCollegeId : 'inst-01'}
      />

      {/* Status Confirm Dialog */}
      {statusDialogTarget && (
        <StatusConfirmDialog
          isOpen={!!statusDialogTarget}
          onClose={() => setStatusDialogTarget(null)}
          user={{
            id: statusDialogTarget.student.id,
            name: statusDialogTarget.student.name,
            email: statusDialogTarget.student.email,
            avatarUrl: statusDialogTarget.student.avatarUrl,
            roleId: 'role-student',
            roleName: 'Student',
            collegeId: statusDialogTarget.student.collegeId,
            collegeName: statusDialogTarget.student.collegeName,
            permissions: [],
            status: statusDialogTarget.student.status,
            lastLoginAt: 'Recent',
            createdAt: statusDialogTarget.student.createdDate,
          }}
          targetAction={statusDialogTarget.action}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}

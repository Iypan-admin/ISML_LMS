// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN: ASSESSMENTS & STUDENT MARKS LEDGER
// Oversight of Examinations, Cohorts, and Student-wise Continuous Evaluations
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Award,
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  Search,
  Filter,
  FileText,
  ClipboardList,
  Sparkles,
  ChevronRight,
  GraduationCap,
  BookOpen,
  ExternalLink,
  X,
  Printer,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { AssessmentItem } from '@/types/rbac';
import {
  mockAssessments,
  mockBatches,
  mockPrograms,
  mockCourses
} from '@/mock/superAdminData';
import {
  mockStudentMarksLedger,
  StudentMarkEntry
} from '@/mock/results';
import { useToast } from '@/context/ToastContext';
import CreateAssessmentDrawer from '@/components/super-admin/assessments/CreateAssessmentDrawer';
import ViewAssessmentDetailDrawer from '@/components/super-admin/assessments/ViewAssessmentDetailDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function SuperAdminAssessmentsPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();

  // Primary Tab: Assessments Management vs Student Marks Ledger
  const [activeMainTab, setActiveMainTab] = useState<'ASSESSMENTS' | 'STUDENT_MARKS'>('ASSESSMENTS');

  // Assessments Management State
  const [assessments, setAssessments] = useState<AssessmentItem[]>(mockAssessments);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewAssessment, setViewAssessment] = useState<AssessmentItem | null>(null);
  const [editAssessment, setEditAssessment] = useState<AssessmentItem | null>(null);
  const [deleteAssessment, setDeleteAssessment] = useState<AssessmentItem | null>(null);

  // Exam Filters State (for Tab 1: Assessments Management)
  const [selectedExamCourseFilter, setSelectedExamCourseFilter] = useState<string>('ALL');
  const [selectedExamBatchFilter, setSelectedExamBatchFilter] = useState<string>('ALL');

  // Student Marks Filter State
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [selectedItemType, setSelectedItemType] = useState<'ALL' | 'ASSESSMENT' | 'ASSIGNMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewSubMode, setViewSubMode] = useState<'ALL_RECORDS' | 'STUDENT_TRANSCRIPTS'>('ALL_RECORDS');
  const [activeStudentModal, setActiveStudentModal] = useState<string | null>(null);

  // Filter assessments based on selected college, course & batch
  const displayAssessments = useMemo(() => {
    return assessments.filter((a) => {
      if (!isOverall) {
        const batch = mockBatches.find((b) => b.name === a.batchName);
        if (batch?.institutionId && batch.institutionId !== selectedCollegeId) return false;
      }
      if (selectedExamCourseFilter !== 'ALL') {
        const crs = mockCourses.find((c) => c.id === selectedExamCourseFilter);
        if (crs) {
          const matchCourse = a.subjectName.toLowerCase().includes(crs.name.toLowerCase().split(' ')[0]) ||
            a.programName.toLowerCase().includes(crs.name.toLowerCase().split(' ')[0]);
          if (!matchCourse) return false;
        }
      }
      if (selectedExamBatchFilter !== 'ALL') {
        const targetBatch = mockBatches.find((b) => b.id === selectedExamBatchFilter);
        if (targetBatch && a.batchName !== targetBatch.name) return false;
      }
      return true;
    });
  }, [assessments, isOverall, selectedCollegeId, selectedExamCourseFilter, selectedExamBatchFilter]);

  // Available courses based on college scoping
  const availableCourses = useMemo(() => {
    if (isOverall) return mockCourses;
    return mockCourses.filter((c) => !c.collegeId || c.collegeId === selectedCollegeId);
  }, [isOverall, selectedCollegeId]);

  // Available batches for Exam tab based on selected course & college
  const availableExamBatches = useMemo(() => {
    let list = mockBatches;
    if (!isOverall) {
      list = list.filter((b) => !b.institutionId || b.institutionId === selectedCollegeId);
    }
    if (selectedExamCourseFilter !== 'ALL') {
      list = list.filter((b) => b.courseIds?.includes(selectedExamCourseFilter));
    }
    return list;
  }, [isOverall, selectedCollegeId, selectedExamCourseFilter]);

  // Available batches based on selected course and college
  const availableBatches = useMemo(() => {
    let list = mockBatches;
    if (!isOverall) {
      list = list.filter((b) => !b.institutionId || b.institutionId === selectedCollegeId);
    }
    if (selectedCourseFilter !== 'ALL') {
      list = list.filter((b) => b.courseIds?.includes(selectedCourseFilter));
    }
    return list;
  }, [isOverall, selectedCollegeId, selectedCourseFilter]);

  // Filtered Marks Ledger
  const filteredMarks = useMemo(() => {
    return mockStudentMarksLedger.filter((item) => {
      // Course filter
      if (selectedCourseFilter !== 'ALL') {
        const crs = mockCourses.find((c) => c.id === selectedCourseFilter);
        if (crs) {
          const matchByBatch = crs.batchIds?.includes(item.batchId);
          const matchByName = item.courseName.toLowerCase().includes(crs.name.toLowerCase().split(' ')[0]);
          if (!matchByBatch && !matchByName) {
            return false;
          }
        }
      }
      // Batch filter
      if (selectedBatchId !== 'ALL' && item.batchId !== selectedBatchId) {
        return false;
      }
      // Student filter
      if (selectedStudentId !== 'ALL' && item.studentId !== selectedStudentId) {
        return false;
      }
      // Activity type
      if (selectedItemType !== 'ALL' && item.itemType !== selectedItemType) {
        return false;
      }
      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.studentName.toLowerCase().includes(q) ||
          item.studentId.toLowerCase().includes(q) ||
          item.activityTitle.toLowerCase().includes(q) ||
          item.moduleName.toLowerCase().includes(q) ||
          item.evaluatedByTutor.toLowerCase().includes(q) ||
          item.batchName.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCourseFilter, selectedBatchId, selectedStudentId, selectedItemType, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = filteredMarks.length;
    if (total === 0) {
      return { total: 0, avgPercentage: 0, passCount: 0, topGradeCount: 0 };
    }
    const sumPct = filteredMarks.reduce((acc, curr) => acc + curr.percentage, 0);
    const avgPercentage = Math.round(sumPct / total);
    const passCount = filteredMarks.filter((m) => m.percentage >= 50).length;
    const topGradeCount = filteredMarks.filter((m) => m.grade === 'A+' || m.grade === 'A').length;

    return { total, avgPercentage, passCount, topGradeCount };
  }, [filteredMarks]);

  // Grouped by Student
  const studentProfiles = useMemo(() => {
    const groups = new Map<string, StudentMarkEntry[]>();
    filteredMarks.forEach((entry) => {
      if (!groups.has(entry.studentId)) {
        groups.set(entry.studentId, []);
      }
      groups.get(entry.studentId)!.push(entry);
    });

    return Array.from(groups.entries()).map(([stId, entries]) => {
      const studentName = entries[0].studentName;
      const studentEmail = entries[0].studentEmail;
      const batchName = entries[0].batchName;
      const languageFamily = entries[0].languageFamily;
      const courseName = entries[0].courseName;
      const avgScore = Math.round(
        entries.reduce((acc, c) => acc + c.percentage, 0) / entries.length
      );
      const assessmentsCount = entries.filter((e) => e.itemType === 'ASSESSMENT').length;
      const assignmentsCount = entries.filter((e) => e.itemType === 'ASSIGNMENT').length;

      return {
        studentId: stId,
        studentName,
        studentEmail,
        batchName,
        languageFamily,
        courseName,
        avgScore,
        assessmentsCount,
        assignmentsCount,
        entries,
      };
    });
  }, [filteredMarks]);

  // Student list for select dropdown
  const studentDropdownOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    filteredMarks.forEach((m) => {
      map.set(m.studentId, { id: m.studentId, name: m.studentName });
    });
    return Array.from(map.values());
  }, [filteredMarks]);

  // Selected student for Report Card Modal
  const selectedStudentForModal = useMemo(() => {
    if (!activeStudentModal) return null;
    const entries = mockStudentMarksLedger.filter((m) => m.studentId === activeStudentModal);
    if (entries.length === 0) return null;
    return {
      studentId: activeStudentModal,
      studentName: entries[0].studentName,
      studentEmail: entries[0].studentEmail,
      batchName: entries[0].batchName,
      courseName: entries[0].courseName,
      languageFamily: entries[0].languageFamily,
      entries,
      avgScore: Math.round(entries.reduce((a, b) => a + b.percentage, 0) / entries.length),
    };
  }, [activeStudentModal]);

  const handleAssessmentCreated = (newAssessment: AssessmentItem) => {
    setAssessments((prev) => [newAssessment, ...prev]);
  };

  const handleAssessmentUpdated = (updatedAssessment: AssessmentItem) => {
    setAssessments((prev) => prev.map((a) => (a.id === updatedAssessment.id ? updatedAssessment : a)));
  };

  const handleAssessmentStatusChange = (id: string, newStatus: 'PUBLISHED' | 'DRAFT' | 'CLOSED') => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (viewAssessment?.id === id) {
      setViewAssessment((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleAssessmentDeleted = () => {
    if (!deleteAssessment) return;
    setAssessments((prev) => prev.filter((a) => a.id !== deleteAssessment.id));
    showSuccess(`Assessment "${deleteAssessment.title}" deleted successfully.`);
    setDeleteAssessment(null);
  };

  const openEditDrawer = (asmt: AssessmentItem) => {
    setEditAssessment(asmt);
    setIsDrawerOpen(true);
  };

  const assessmentColumns: Column<AssessmentItem>[] = [
    {
      key: 'title',
      header: 'Assessment Title & Code',
      render: (row: AssessmentItem) => (
        <div>
          <button
            onClick={() => setViewAssessment(row)}
            className="font-bold text-[#0B2447] hover:text-[#0052CC] transition-colors text-left flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <span>{row.title}</span>
            <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-medium">
            <span className="font-mono">{row.id}</span>
            <span>•</span>
            <span className="text-slate-600 font-semibold">{row.subjectName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'batchName',
      header: 'Batch Cohort',
      render: (row: AssessmentItem) => (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {row.batchName}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Exam Type',
      render: (row: AssessmentItem) => (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
          {row.type}
        </span>
      ),
    },
    {
      key: 'totalMarks',
      header: 'Max Marks',
      render: (row: AssessmentItem) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{row.totalMarks} Marks</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row: AssessmentItem) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span suppressHydrationWarning>{row.dueDate}</span>
        </div>
      ),
    },
    {
      key: 'submissionsCount',
      header: 'Submissions',
      render: (row: AssessmentItem) => (
        <button
          onClick={() => {
            setSelectedBatchId(mockBatches.find((b) => b.name === row.batchName)?.id || 'ALL');
            setActiveMainTab('STUDENT_MARKS');
          }}
          className="text-xs font-bold text-[#0052CC] hover:underline cursor-pointer flex items-center gap-1"
          title="Inspect Student Mark List for this cohort"
        >
          <span>{row.submissionsCount} Students</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: AssessmentItem) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row: AssessmentItem) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setViewAssessment(row)}
            className="p-1.5 text-slate-500 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEditDrawer(row)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Assessment"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteAssessment(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Assessment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Assessments & Student Marks' }]} />

      <CollegeFilterBar />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Assessments & Student Marks Ledger
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Institutional oversight of examinations, course evaluations, and individual student mark sheets across cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeMainTab === 'ASSESSMENTS' && (
            <Can permission="ASSESSMENT_CREATE">
              <button
                onClick={() => {
                  setEditAssessment(null);
                  setIsDrawerOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Assessment</span>
              </button>
            </Can>
          )}

          {activeMainTab === 'STUDENT_MARKS' && (
            <button
              onClick={() => showSuccess('Exported Student Mark List (Excel) successfully!')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Marks (Excel)</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveMainTab('ASSESSMENTS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
            activeMainTab === 'ASSESSMENTS'
              ? 'text-[#0052CC]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Examinations & Assignments ({displayAssessments.length})</span>
          {activeMainTab === 'ASSESSMENTS' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0052CC] rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('STUDENT_MARKS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
            activeMainTab === 'STUDENT_MARKS'
              ? 'text-[#0052CC]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Student Marks Ledger & Report Cards</span>
          {activeMainTab === 'STUDENT_MARKS' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0052CC] rounded-t-full" />
          )}
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 1: ASSESSMENTS MANAGEMENT                                */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeMainTab === 'ASSESSMENTS' && (
        <div className="space-y-4">
          {/* Quick Filter Bar for Courses and Batches */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="w-4 h-4 text-[#0052CC] shrink-0" />
                <span>Filter Assessments by Course & Cohort:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:w-auto w-full">
                {/* 1. Select Course */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#0052CC]">
                  <BookOpen className="w-3.5 h-3.5 text-[#0052CC] mr-1.5 shrink-0" />
                  <select
                    value={selectedExamCourseFilter}
                    onChange={(e) => {
                      setSelectedExamCourseFilter(e.target.value);
                      setSelectedExamBatchFilter('ALL');
                    }}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer pr-1"
                    title="Filter by Course"
                  >
                    <option value="ALL">All Courses ({availableCourses.length})</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Batch Cohort */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#0052CC]">
                  <Users className="w-3.5 h-3.5 text-indigo-600 mr-1.5 shrink-0" />
                  <select
                    value={selectedExamBatchFilter}
                    onChange={(e) => setSelectedExamBatchFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer pr-1"
                    title="Filter by Batch"
                  >
                    <option value="ALL">All Batches ({availableExamBatches.length})</option>
                    {availableExamBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <DataTable
            data={displayAssessments}
          columns={assessmentColumns}
          rowKey={(row) => row.id}
          searchPlaceholder="Search assessment title, subject, cohort..."
          searchKey={(row) => `${row.title} ${row.subjectName} ${row.type} ${row.batchName}`}
          mobileCardRender={(row) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.subjectName} • {row.batchName}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  {row.type}
                </span>
                <span>•</span>
                <span className="font-bold text-blue-700">{row.totalMarks} Marks</span>
                <span>•</span>
                <span suppressHydrationWarning>Due: {row.dueDate}</span>
                <span>•</span>
                <button
                  onClick={() => {
                    setSelectedBatchId(mockBatches.find((b) => b.name === row.batchName)?.id || 'ALL');
                    setActiveMainTab('STUDENT_MARKS');
                  }}
                  className="font-bold text-[#0052CC] underline"
                >
                  {row.submissionsCount} Submissions
                </button>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                <button
                  onClick={() => setViewAssessment(row)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#0052CC] bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => openEditDrawer(row)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteAssessment(row)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 2: STUDENT MARKS LEDGER & REPORT CARDS                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeMainTab === 'STUDENT_MARKS' && (
        <div className="space-y-4">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Evaluated Records</span>
                <ClipboardList className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B2447]">{stats.total}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Continuous Assessments</p>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Cohort Average</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-purple-700">{stats.avgPercentage}%</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">CEFR Passing Level</p>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Distinctions (Grade A/A+)</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B2447]">{stats.topGradeCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Score &ge; 80%</p>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Pass Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">
                {stats.total > 0 ? Math.round((stats.passCount / stats.total) * 100) : 0}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Benchmark &ge; 50%</p>
            </div>
          </div>

          {/* Cascading Filter Controls: Course → Batch → Student */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Select Course */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter by Course:</span>
                </label>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => {
                    setSelectedCourseFilter(e.target.value);
                    setSelectedBatchId('ALL');
                    setSelectedStudentId('ALL');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="ALL">All Enrolled Courses ({availableCourses.length})</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Select Batch Cohort */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Filter by Batch Cohort:</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => {
                    setSelectedBatchId(e.target.value);
                    setSelectedStudentId('ALL');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="ALL">All Batches ({availableBatches.length})</option>
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Select Individual Student */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Individual Student:</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="ALL">All Students ({studentDropdownOptions.length})</option>
                  {studentDropdownOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Search Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Search Mark Sheet:</span>
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Student, activity, tutor, course..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
            </div>

            {/* Sub-modes & Activity Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Activity Type:</span>
                {(['ALL', 'ASSESSMENT', 'ASSIGNMENT'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedItemType(type)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedItemType === type
                        ? 'bg-[#0052CC] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'ALL'
                      ? 'All Assessments & Tasks'
                      : type === 'ASSESSMENT'
                      ? 'Examinations & Quizzes'
                      : 'Assignments & Homework'}
                  </button>
                ))}
              </div>

              {/* View Switcher: Table vs Student Cards */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setViewSubMode('ALL_RECORDS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewSubMode === 'ALL_RECORDS'
                      ? 'bg-white text-[#0052CC] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>All Marks Ledger ({filteredMarks.length})</span>
                </button>
                <button
                  onClick={() => setViewSubMode('STUDENT_TRANSCRIPTS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewSubMode === 'STUDENT_TRANSCRIPTS'
                      ? 'bg-white text-[#0052CC] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Report Cards ({studentProfiles.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* SUB-VIEW 1: DETAILED MARK LIST TABLE */}
          {viewSubMode === 'ALL_RECORDS' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-sm font-bold text-[#0B2447] flex items-center gap-2">
                    <span>Individual Continuous Evaluation Records</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                      {filteredMarks.length} records
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Itemized student marks, maximum scores, percentage, CEFR grade, and tutor notes.
                  </p>
                </div>
              </div>

              {filteredMarks.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700">No mark records found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try selecting a different course or batch to view marks.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Student & Cohort</th>
                        <th className="py-3 px-4">Course & Enrolled Batch</th>
                        <th className="py-3 px-4">Activity & Module</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-center">Score / Max</th>
                        <th className="py-3 px-4 text-center">Percentage</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                        <th className="py-3 px-4">Evaluating Tutor</th>
                        <th className="py-3 px-4 text-right">Report Card</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {filteredMarks.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                          {/* Student */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {item.studentName.slice(0, 1)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{item.studentName}</span>
                                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                                    ({item.studentId})
                                  </span>
                                </p>
                                <p className="text-[10px] text-slate-500">{item.studentEmail}</p>
                              </div>
                            </div>
                          </td>

                          {/* Course & Batch */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800 text-[11px] truncate max-w-[200px]" title={item.courseName}>
                              {item.courseName}
                            </p>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mt-0.5">
                              {item.batchName}
                            </span>
                          </td>

                          {/* Activity Title */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{item.activityTitle}</p>
                            <p className="text-[10px] text-slate-500">{item.moduleName}</p>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                item.itemType === 'ASSESSMENT'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.itemType}
                            </span>
                          </td>

                          {/* Score */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                            {item.score} / {item.maxScore}
                          </td>

                          {/* Percentage */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                                item.percentage >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.percentage >= 50
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.percentage}%
                            </span>
                          </td>

                          {/* Grade */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-100 text-slate-800 border border-slate-300">
                              {item.grade}
                            </span>
                          </td>

                          {/* Tutor */}
                          <td className="py-3.5 px-4 text-[11px] text-slate-600">
                            <p className="font-semibold text-slate-800">{item.evaluatedByTutor}</p>
                            <p className="italic text-slate-500 text-[10px] truncate max-w-[150px]">
                              &quot;{item.tutorFeedback}&quot;
                            </p>
                          </td>

                          {/* Report card modal button */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setActiveStudentModal(item.studentId)}
                              className="px-2.5 py-1 bg-[#0052CC]/10 hover:bg-[#0052CC]/20 text-[#0052CC] font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Inspect Individual Report Card"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Card</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: STUDENT PROFILE CARDS */}
          {viewSubMode === 'STUDENT_TRANSCRIPTS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentProfiles.map((profile) => (
                <div
                  key={profile.studentId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-blue-300 transition-all"
                >
                  <div>
                    {/* Header: Student Name & Avg Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs">
                          {profile.studentName.slice(0, 1)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {profile.studentName}
                          </h3>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {profile.studentId}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Average</span>
                        <span className="text-lg font-black text-[#0052CC]">{profile.avgScore}%</span>
                      </div>
                    </div>

                    {/* Batch & Program Info */}
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{profile.batchName}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{profile.courseName}</p>
                    </div>

                    {/* KPI metrics */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100">
                        <span className="text-[9px] text-slate-500 block font-semibold">Average</span>
                        <strong className="text-xs font-extrabold text-blue-700">{profile.avgScore}%</strong>
                      </div>
                      <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                        <span className="text-[9px] text-slate-500 block font-semibold">Assessments</span>
                        <strong className="text-xs font-extrabold text-purple-700">{profile.assessmentsCount}</strong>
                      </div>
                      <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100">
                        <span className="text-[9px] text-slate-500 block font-semibold">Assignments</span>
                        <strong className="text-xs font-extrabold text-amber-700">{profile.assignmentsCount}</strong>
                      </div>
                    </div>

                    {/* Activity highlights */}
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Recent Submissions ({profile.entries.length})
                      </span>
                      {profile.entries.slice(0, 3).map((entry) => (
                        <div
                          key={entry.id}
                          className="p-1.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs border border-slate-100"
                        >
                          <p className="font-semibold text-slate-800 text-[11px] truncate pr-2">
                            {entry.activityTitle}
                          </p>
                          <span className="font-extrabold text-slate-900 shrink-0 text-xs">
                            {entry.score}/{entry.maxScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Open Modal Button */}
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => setActiveStudentModal(profile.studentId)}
                      className="w-full py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Student Report Card</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* DRAWERS & MODALS                                             */}
      {/* ──────────────────────────────────────────────────────────── */}

      {/* View Assessment Drawer */}
      <ViewAssessmentDetailDrawer
        isOpen={!!viewAssessment}
        onClose={() => setViewAssessment(null)}
        assessment={viewAssessment}
        onEdit={(asmt) => {
          openEditDrawer(asmt);
        }}
        onDelete={(asmt) => {
          setDeleteAssessment(asmt);
        }}
        onStatusChange={handleAssessmentStatusChange}
      />

      {/* Create / Edit Assessment Drawer */}
      <CreateAssessmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditAssessment(null);
        }}
        onAssessmentCreated={handleAssessmentCreated}
        editAssessment={editAssessment}
        onAssessmentUpdated={(updated) => {
          handleAssessmentUpdated(updated);
          if (viewAssessment?.id === updated.id) {
            setViewAssessment(updated);
          }
        }}
      />

      {/* Delete Assessment Confirmation */}
      <DeleteConfirmDrawer
        isOpen={!!deleteAssessment}
        onClose={() => setDeleteAssessment(null)}
        onConfirm={handleAssessmentDeleted}
        entityType="Assessment"
        entityName={deleteAssessment?.title || ''}
        description="Deleting this examination or assignment will remove associated question papers, student submissions, and grading ledger records."
      />

      {/* INDIVIDUAL STUDENT REPORT CARD MODAL */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-lg font-bold">
                  {selectedStudentForModal.studentName.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedStudentForModal.studentName}</h3>
                  <p className="text-xs text-slate-300 font-mono">
                    ID: {selectedStudentForModal.studentId} • {selectedStudentForModal.batchName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showSuccess(`Report card for ${selectedStudentForModal.studentName} printed!`)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                  title="Print Report Card"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveStudentModal(null)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Top Banner KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-blue-900 uppercase">Enrolled Course</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {selectedStudentForModal.courseName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-900 uppercase">Cumulative Percentage</span>
                  <p className="text-xl font-extrabold text-blue-700 mt-0.5">
                    {selectedStudentForModal.avgScore}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-900 uppercase">Proficiency Level</span>
                  <p className="text-xs font-extrabold text-purple-700 mt-0.5">
                    {selectedStudentForModal.languageFamily} — CEFR A1
                  </p>
                </div>
              </div>

              {/* Assessment & Assignment Breakdown Table */}
              <div>
                <h4 className="text-xs font-bold text-[#0B2447] mb-2 uppercase tracking-wider">
                  Detailed Marks & Tutor Evaluations
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Activity / Assessment</th>
                        <th className="py-2.5 px-3">Date & Day</th>
                        <th className="py-2.5 px-3 text-center">Score</th>
                        <th className="py-2.5 px-3 text-center">Grade</th>
                        <th className="py-2.5 px-3">Tutor Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudentForModal.entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                entry.itemType === 'ASSESSMENT'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {entry.itemType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-slate-900">{entry.activityTitle}</p>
                            <p className="text-[10px] text-slate-500">{entry.moduleName}</p>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-slate-600">
                            {entry.dayOfWeek}, {entry.submissionDate}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                            {entry.score} / {entry.maxScore} ({entry.percentage}%)
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-50 text-emerald-800 border border-emerald-300">
                              {entry.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-[200px]">
                            <p className="font-semibold text-slate-800">{entry.evaluatedByTutor}</p>
                            <p className="italic text-slate-500 text-[10px]">&quot;{entry.tutorFeedback}&quot;</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">
                Official ISML Academic Record • Certified by Academic Directorate
              </span>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close Report Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

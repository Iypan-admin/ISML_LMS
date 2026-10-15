// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: ONLINE ASSESSMENTS & STUDENT MARKS
// (/academic-manager/assessments)
// Online CBT Exams, Certification Mocks, Cohort Mark Lists & Student Transcripts
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  Calendar,
  Clock,
  Wifi,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Users,
  Search,
  Filter,
  FileText,
  ClipboardList,
  Sparkles,
  ChevronRight,
  GraduationCap,
  ExternalLink,
  X,
  Printer,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  Mic,
  FileCheck2,
  PenTool,
  Volume2
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { AssessmentItem } from '@/types/rbac';
import {
  mockAssessments,
  mockBatches,
  mockCourses
} from '@/mock/superAdminData';
import {
  mockStudentMarksLedger,
  StudentMarkEntry
} from '@/mock/results';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';
import CreateOnlineAssessmentDrawer from '@/components/academic-manager/CreateOnlineAssessmentDrawer';
import { assessmentStore } from '@/services/assessmentStore';

export default function AcademicManagerAssessmentsPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();

  // Primary Tab: Online Exams Management vs Student Marks Ledger
  const [activeTab, setActiveTab] = useState<'EXAMS' | 'STUDENT_MARKS'>('EXAMS');

  // Exam Management State connected to assessmentStore
  const [assessments, setAssessments] = useState<AssessmentItem[]>(() =>
    assessmentStore.getAssessments()
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedViewingAssessment, setSelectedViewingAssessment] = useState<AssessmentItem | null>(null);

  React.useEffect(() => {
    return assessmentStore.subscribe(() => {
      setAssessments([...assessmentStore.getAssessments()]);
    });
  }, []);

  // Exam Filters State (for Tab 1: Online Exams)
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

  // Scoped exams based on campus, selected course & selected batch
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

  // Available courses based on campus
  const availableCourses = useMemo(() => {
    if (isOverall) return mockCourses;
    return mockCourses.filter((c) => !c.collegeId || c.collegeId === selectedCollegeId);
  }, [isOverall, selectedCollegeId]);

  // Available batches for Exam tab based on selected course & campus
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

  // Available batches based on selected course and campus
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

  // Student dropdown options
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
    // assessmentStore already prepends the item and notifies subscribers via useEffect.
    // We only ensure the state has the latest unique list without duplicating.
    setAssessments((prev) => {
      if (prev.some((a) => a.id === newAssessment.id)) return prev;
      return [newAssessment, ...prev];
    });
  };

  const columns: Column<AssessmentItem>[] = [
    {
      key: 'title',
      header: 'Exam / Test Title & Questionnaire',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.title}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {row.code || row.type}
            </span>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
              Max {row.totalMarks} Marks
            </span>
            <button
              onClick={() => setSelectedViewingAssessment(row)}
              className="text-[10px] font-black text-[#0052CC] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>{row.questions?.length || row.questionsCount || 5} Tasks Questionnaire</span>
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'deliveryMode',
      header: 'Format & Questions',
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Wifi className="w-2.5 h-2.5" />
            <span>Online CBT</span>
          </span>
          <p className="text-[10px] text-slate-500 font-medium">
            {row.durationMins || 90} Mins • LSRW Rubric
          </p>
        </div>
      ),
    },
    {
      key: 'subjectName',
      header: 'Subject & Cohort',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.subjectName}</p>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mt-0.5">
            {row.batchName}
          </span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Exam Due Date',
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold" suppressHydrationWarning>
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {row.dueDate}
        </span>
      ),
    },
    {
      key: 'approvalStatus',
      header: 'Admin Approval Status',
      render: (row) => {
        const isApproved = row.status === 'APPROVED' || row.approvalStatus === 'APPROVED_BY_ADMIN';
        const isPending = row.status === 'PENDING_APPROVAL' || row.approvalStatus === 'PENDING_ADMIN_APPROVAL';
        const isRejected = row.status === 'REJECTED' || row.approvalStatus === 'REJECTED';

        if (isApproved) {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Approved by Admin</span>
              </span>
              <p className="text-[9px] text-emerald-700 font-medium">Released to Student Portal</p>
            </div>
          );
        }

        if (isPending) {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Pending Admin Approval</span>
              </span>
              <p className="text-[9px] text-slate-500 font-medium">In Super Admin Queue</p>
            </div>
          );
        }

        if (isRejected) {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                <span>Changes Required / Rejected</span>
              </span>
            </div>
          );
        }

        return <StatusBadge status={row.status} />;
      },
    },
    {
      key: 'submissionsCount',
      header: 'Student Submissions',
      render: (row) => (
        <button
          onClick={() => {
            const b = mockBatches.find((item) => item.name === row.batchName);
            setSelectedBatchId(b?.id || 'ALL');
            setActiveTab('STUDENT_MARKS');
          }}
          className="text-xs font-bold text-[#0052CC] hover:underline cursor-pointer flex items-center gap-1"
          title="Inspect Student Mark List for this cohort"
        >
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
            {row.submissionsCount} Completed
          </span>
          <ArrowUpRight className="w-3 h-3 text-[#0052CC]" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Online Assessments & Student Marks' }]} />

      <CollegeFilterBar />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            <span>Online Examinations & Student Marks</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            CBT examinations, certification mocks, cohort mark lists, and individual student report cards.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'EXAMS' && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Online Exam</span>
            </button>
          )}

          {activeTab === 'STUDENT_MARKS' && (
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
          onClick={() => setActiveTab('EXAMS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
            activeTab === 'EXAMS'
              ? 'text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Online Examinations & Tests ({displayAssessments.length})</span>
          {activeTab === 'EXAMS' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('STUDENT_MARKS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
            activeTab === 'STUDENT_MARKS'
              ? 'text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Student Marks & Report Cards</span>
          {activeTab === 'STUDENT_MARKS' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 1: ONLINE EXAMS LIST                                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'EXAMS' && (
        <div className="space-y-4">
          {/* Quick Filter Bar for Courses and Batches */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Filter Exams by Course & Batch:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:w-auto w-full">
                {/* 1. Select Course */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-purple-600">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600 mr-1.5 shrink-0" />
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
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-purple-600">
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

          <DataTable<AssessmentItem>
            data={displayAssessments}
            columns={columns}
            rowKey={(row) => row.id}
            searchKey="title"
            searchPlaceholder="Search online tests by title or language subject..."
            pageSize={10}
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 2: STUDENT MARKS LEDGER                                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'STUDENT_MARKS' && (
        <div className="space-y-4">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Evaluated Tests</span>
                <ClipboardList className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B2447]">{stats.total}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Online CBT Submissions</p>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Class Average Score</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-purple-700">{stats.avgPercentage}%</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Passing Average</p>
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
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>Filter by Course:</span>
                </label>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => {
                    setSelectedCourseFilter(e.target.value);
                    setSelectedBatchId('ALL');
                    setSelectedStudentId('ALL');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="ALL">All Enrolled Courses ({availableCourses.length})</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Select Batch */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Filter by Student Batch:</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => {
                    setSelectedBatchId(e.target.value);
                    setSelectedStudentId('ALL');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'ALL'
                      ? 'All Tests & Assignments'
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
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>All Student Marks ({filteredMarks.length})</span>
                </button>
                <button
                  onClick={() => setViewSubMode('STUDENT_TRANSCRIPTS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewSubMode === 'STUDENT_TRANSCRIPTS'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Report Cards ({studentProfiles.length})</span>
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
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold">
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
                        <tr key={item.id} className="hover:bg-purple-50/40 transition-colors">
                          {/* Student */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
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
                                  ? 'bg-purple-100 text-purple-800'
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
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
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
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-purple-300 transition-all"
                >
                  <div>
                    {/* Header: Student Name & Avg Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs">
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
                        <span className="text-lg font-black text-purple-700">{profile.avgScore}%</span>
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
                      <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                        <span className="text-[9px] text-slate-500 block font-semibold">Average</span>
                        <strong className="text-xs font-extrabold text-purple-700">{profile.avgScore}%</strong>
                      </div>
                      <div className="p-2 bg-indigo-50/60 rounded-xl border border-indigo-100">
                        <span className="text-[9px] text-slate-500 block font-semibold">Assessments</span>
                        <strong className="text-xs font-extrabold text-indigo-700">{profile.assessmentsCount}</strong>
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
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
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

      <CreateOnlineAssessmentDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAssessmentCreated={handleAssessmentCreated}
      />

      {/* INDIVIDUAL STUDENT REPORT CARD MODAL */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-lg font-bold">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase">Enrolled Course</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {selectedStudentForModal.courseName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase">Cumulative Percentage</span>
                  <p className="text-xl font-extrabold text-purple-700 mt-0.5">
                    {selectedStudentForModal.avgScore}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase">Proficiency Level</span>
                  <p className="text-xs font-extrabold text-indigo-700 mt-0.5">
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

      {/* ══════════ VIEW 50 QUESTIONS QUESTIONNAIRE SLIDE-OVER DRAWER ══════════ */}
      {selectedViewingAssessment && (
        <div className="fixed inset-0 z-[110] flex justify-end font-sans">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedViewingAssessment(null)}
          />

          <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {selectedViewingAssessment.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white uppercase tracking-wider">
                      {selectedViewingAssessment.questions?.length || 0} QUESTIONS
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200 mt-0.5">
                    {selectedViewingAssessment.batchName} • Max {selectedViewingAssessment.totalMarks} Marks • Duration: {selectedViewingAssessment.durationMins || 90} Mins
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedViewingAssessment(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header with Approval Status Notice */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Approval Status:</span>
                {selectedViewingAssessment.status === 'APPROVED' || selectedViewingAssessment.approvalStatus === 'APPROVED_BY_ADMIN' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Approved by Super Admin</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Pending Super Admin Approval</span>
                  </span>
                )}
              </div>

              {selectedViewingAssessment.submittedToAdminAt && (
                <span className="text-[11px] text-slate-500">
                  Submitted: <strong className="text-slate-800">{selectedViewingAssessment.submittedToAdminAt}</strong>
                </span>
              )}
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/70">
              {(selectedViewingAssessment.questions || []).map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 font-mono font-black text-xs flex items-center justify-center">
                        #{q.id}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          q.section === 'LISTENING'
                            ? 'bg-blue-100 text-blue-800'
                            : q.section === 'READING'
                            ? 'bg-amber-100 text-amber-800'
                            : q.section === 'GRAMMAR'
                            ? 'bg-indigo-100 text-indigo-800'
                            : q.section === 'SPEAKING'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {q.section}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {q.questionType}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                      {q.marks} Marks
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {q.questionText}
                  </p>

                  {q.contextPrompt && (
                    <p className="text-[11px] text-slate-500 italic pl-1 border-l-2 border-slate-200">
                      {q.contextPrompt}
                    </p>
                  )}

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 flex items-center gap-1.5"
                        >
                          <span className="font-bold text-slate-400">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ACADEMIC MANAGER UPLOADED QUESTION ATTACHMENT (AUDIO OR DOCUMENT) */}
                  {q.questionAttachmentName && (
                    <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-bold text-[#0B2447] flex items-center gap-1.5">
                          {q.questionAttachmentType === 'AUDIO' ? (
                            <Volume2 className="w-4 h-4 text-[#0052CC]" />
                          ) : (
                            <FileText className="w-4 h-4 text-purple-700" />
                          )}
                          <span>
                            {q.questionAttachmentType === 'AUDIO'
                              ? 'Academic Manager Audio Question (Students Listen to this Question)'
                              : 'Academic Manager Question Document Attachment'}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] bg-white text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-bold">
                          {q.questionAttachmentName}
                        </span>
                      </div>

                      {q.questionAttachmentType === 'AUDIO' && (
                        <div className="p-2 bg-white rounded-lg border border-blue-200 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center shrink-0">
                            <Volume2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-slate-700 block truncate">
                              Interactive Audio Player: {q.questionAttachmentName}
                            </span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className="bg-[#0052CC] h-full w-2/5 rounded-full animate-pulse" />
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 font-semibold shrink-0">
                            00:45 / 02:30
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Listening Audio Track Stream Badge */}
                  {q.section === 'LISTENING' && (q.audioPromptUrl || q.referenceFileName) && !q.questionAttachmentName && (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <span className="font-bold text-amber-950 block">Listening Section Exam Audio Track:</span>
                          <span className="font-mono text-[10px] text-amber-800">
                            {q.referenceFileName || 'sncf_gare_de_lyon_track01.mp3'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Embedded Player Active
                      </span>
                    </div>
                  )}

                  {/* Short Answer / Long Essay Word Limit Badge */}
                  {(q.questionType === 'SHORT_ANSWER' || q.questionType === 'LONG_ESSAY') && (
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {q.questionType === 'SHORT_ANSWER' ? 'Typed Short Answer' : 'Typed Descriptive Essay'}
                      </span>
                      {q.wordLimit && (
                        <span className="text-slate-500 font-medium">Word limit: ~{q.wordLimit} words</span>
                      )}
                    </div>
                  )}

                  {/* Oral Audio Recording Info */}
                  {q.questionType === 'ORAL_AUDIO' && (
                    <div className="p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl text-[11px] space-y-1">
                      <span className="font-bold text-teal-900 flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-teal-700" />
                        <span>Student Voice Recording & Phonetics Submission</span>
                      </span>
                      <p className="text-teal-800 text-[10px]">
                        Allowed formats: {(q.allowedFileTypes || ['.mp3', '.m4a', '.wav']).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* File Upload Document Info */}
                  {q.questionType === 'FILE_UPLOAD' && (
                    <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] space-y-1">
                      <span className="font-bold text-purple-900 flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-purple-700" />
                        <span>Document / Audio / Scanned Sheet Upload Task</span>
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-slate-500 font-bold">Allowed student uploads:</span>
                        {(q.allowedFileTypes || ['.pdf', '.mp3', '.docx', '.jpg']).map((ext) => (
                          <span
                            key={ext}
                            className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 uppercase"
                          >
                            {ext}
                          </span>
                        ))}
                      </div>
                      {q.referenceFileName && (
                        <p className="text-purple-700 text-[10px] font-medium pt-0.5">
                          Attached template / reference file: <strong>{q.referenceFileName}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {q.sampleModelAnswer && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-0.5">
                      <span className="font-bold text-slate-700 block">Tutor Benchmark / Model Answer:</span>
                      <p className="text-slate-600 italic">&quot;{q.sampleModelAnswer}&quot;</p>
                    </div>
                  )}

                  {q.correctAnswer && (
                    <div className="pt-1 flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-[#0052CC]">Key / Ideal:</span>
                      <span className="text-slate-800 font-medium">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total Questions: <strong className="text-slate-800">{selectedViewingAssessment.questions?.length || 50}</strong>
              </span>
              <button
                onClick={() => setSelectedViewingAssessment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Questionnaire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

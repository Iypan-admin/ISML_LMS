// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: APPROVALS & REQUESTS HUB
// (/academic-manager/approvals)
// Step-by-Step Architecture:
// STEP 1: Select Language Course (French A1, A2, B1, B2) in pastel cards
// STEP 2: Select Assigned Batch / Cohort under the selected course
// STEP 3: Approval Requests Queue filtered by selected Course & Batch
// Right-Side Slide-Over Form Drawer for Verification & Executive Sign-Off
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Eye,
  AlertTriangle,
  User,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  UserCheck,
  FileText,
  Lock,
  ThumbsUp,
  FileCheck2,
  ChevronDown
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';
import {
  academicApprovalStore,
  AcademicApprovalItem,
  AcademicApprovalCategory,
  AcademicApprovalStatus
} from '@/services/academicApprovalStore';
import AcademicApprovalDetailDrawer from '@/components/academic-manager/approvals/AcademicApprovalDetailDrawer';

// Course Portfolio with mild pastel theme matching Batches & Attendance
interface AcademicCourseItem {
  id: string;
  code: string;
  levelBadge: string;
  name: string;
  cefrTrack: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  batches: {
    id: string;
    name: string;
    section: string;
    timing: string;
    leadTrainer: string;
  }[];
}

const ACADEMIC_COURSES: AcademicCourseItem[] = [
  {
    id: 'crs-fr-a1',
    code: 'FR-101',
    levelBadge: 'CEFR A1',
    name: 'French A1: Beginner Foundations & Phonetics',
    cefrTrack: 'DELF A1 Certification Track',
    pastelBg: 'bg-blue-50/70',
    pastelBorder: 'border-blue-200',
    accentColor: 'text-[#0052CC]',
    batches: [
      {
        id: 'batch-2026-fr-a1-morning',
        name: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
        section: 'Section A (Morning)',
        timing: 'Mon & Wed • 10:00 - 11:30 AM',
        leadTrainer: 'Jay (Lead Trainer)',
      },
      {
        id: 'batch-2026-fr-a1-weekend',
        name: 'French A1 Fast-Track Weekend Bootcamp',
        section: 'Section B (Weekend)',
        timing: 'Sat & Sun • 11:00 AM - 01:00 PM',
        leadTrainer: 'Marie Curie (Weekend Trainer)',
      },
    ],
  },
  {
    id: 'crs-fr-a2',
    code: 'FR-102',
    levelBadge: 'CEFR A2',
    name: 'French A2: Elementary Narrative & Passé Composé',
    cefrTrack: 'DELF A2 Preparation',
    pastelBg: 'bg-amber-50/70',
    pastelBorder: 'border-amber-200',
    accentColor: 'text-amber-800',
    batches: [
      {
        id: 'batch-fr-a2',
        name: 'French A2 Cohort (Section B - Standby Coverage)',
        section: 'Section B (Afternoon)',
        timing: 'Tue & Thu • 02:00 - 03:30 PM',
        leadTrainer: 'Jay (Substitute Standby)',
      },
    ],
  },
  {
    id: 'crs-fr-b1',
    code: 'FR-201',
    levelBadge: 'CEFR B1',
    name: 'French B1: Independent Fluency & Subjunctive Mood',
    cefrTrack: 'DELF B1 Intermediate Track',
    pastelBg: 'bg-emerald-50/70',
    pastelBorder: 'border-emerald-200',
    accentColor: 'text-emerald-800',
    batches: [
      {
        id: 'batch-fr-b1',
        name: 'French B1 Executive Cohort (1-on-1 Q&A Desk)',
        section: 'Section Q (Evening Clinic)',
        timing: 'Tue & Thu • 05:30 - 07:00 PM',
        leadTrainer: 'Claire Dupont (Doubt Desk)',
      },
    ],
  },
  {
    id: 'crs-fr-b2',
    code: 'FR-202',
    levelBadge: 'CEFR B2',
    name: 'French B2: Advanced Synthesis & Debate Fluency',
    cefrTrack: 'DELF B2 Academic & Career Track',
    pastelBg: 'bg-purple-50/70',
    pastelBorder: 'border-purple-200',
    accentColor: 'text-purple-800',
    batches: [
      {
        id: 'batch-fr-b2',
        name: 'French B2 Advanced Cohort (Evaluation Desk)',
        section: 'Section V (Exam Prep)',
        timing: 'Friday • 03:00 - 05:00 PM',
        leadTrainer: 'Claire Dupont (Assistant Evaluator)',
      },
    ],
  },
];

export default function AcademicManagerApprovalsPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { selectedCollegeId } = useCollege();

  // State connected to store
  const [items, setItems] = useState<AcademicApprovalItem[]>(() =>
    academicApprovalStore.getItems()
  );

  useEffect(() => {
    return academicApprovalStore.subscribe(() => {
      setItems(academicApprovalStore.getItems());
    });
  }, []);

  // STEP 1 & STEP 2: Course & Batch Selection States
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-fr-a1');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');

  // Currently selected course object
  const currentCourse = useMemo(() => {
    return ACADEMIC_COURSES.find((c) => c.id === selectedCourseId) || ACADEMIC_COURSES[0];
  }, [selectedCourseId]);

  // When course changes, reset batch selection to 'ALL'
  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedBatchId('ALL');
  };

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<AcademicApprovalCategory>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutorFilter, setSelectedTutorFilter] = useState('ALL');

  // Selected Item for Right-Side Slide-Over Drawer
  const [activeItem, setActiveItem] = useState<AcademicApprovalItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Overall Stats
  const overallStats = useMemo(() => {
    const pending = items.filter((i) => i.status === 'PENDING').length;
    const approved = items.filter((i) => i.status === 'APPROVED').length;
    const changes = items.filter((i) => i.status === 'CHANGES_REQUESTED').length;
    return { pending, approved, changes, total: items.length };
  }, [items]);

  // Count pending approvals per course
  const coursePendingCounts = useMemo(() => {
    const map: Record<string, number> = {};
    ACADEMIC_COURSES.forEach((c) => {
      const count = items.filter((i) => (i.courseCode === c.code || i.courseId === c.id) && i.status === 'PENDING').length;
      map[c.id] = count;
    });
    return map;
  }, [items]);

  // Filtered Items based on Selected Course, Selected Batch, Category, Status, Tutor, and Search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Course Match
      const matchesCourse = item.courseId === selectedCourseId || item.courseCode === currentCourse.code;
      if (!matchesCourse) return false;

      // 2. Batch Match
      if (selectedBatchId !== 'ALL') {
        const matchesBatch = item.batchId === selectedBatchId || item.batchName.toLowerCase().includes(selectedBatchId.toLowerCase());
        if (!matchesBatch) return false;
      }

      // 3. Category Match
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

      // 4. Status Match
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

      // 5. Tutor Filter
      if (selectedTutorFilter !== 'ALL' && item.submittedBy.name !== selectedTutorFilter) return false;

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.submittedBy.name.toLowerCase().includes(q) ||
          item.batchName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [items, selectedCourseId, currentCourse, selectedBatchId, selectedCategory, selectedStatus, selectedTutorFilter, searchQuery]);

  // Actions
  const handleOpenDrawer = (item: AcademicApprovalItem) => {
    setActiveItem(item);
    setIsDrawerOpen(true);
  };

  const handleQuickApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    academicApprovalStore.approve(id, 'One-click authorized by Academic Manager.');
    showSuccess(`Request ${id} approved successfully!`);
  };

  const handleDrawerApprove = (id: string, remarks?: string) => {
    academicApprovalStore.approve(id, remarks);
    showSuccess(`Request ${id} approved and operational sign-off logged.`);
  };

  const handleDrawerReject = (id: string, reason: string) => {
    academicApprovalStore.reject(id, reason);
    showError(`Request ${id} rejected.`);
  };

  const handleDrawerRequestChanges = (id: string, instructions: string) => {
    academicApprovalStore.requestChanges(id, instructions);
    showInfo(`Changes requested for ${id}. Notification sent to tutor.`);
  };

  // Category Pill Helpers
  const getCategoryBadge = (category: AcademicApprovalItem['category']) => {
    switch (category) {
      case 'TUTOR_REQUEST':
        return { label: 'Tutor Request', bg: 'bg-blue-100 text-[#0052CC] border-blue-200' };
      case 'EXAM_ASSESSMENT':
        return { label: 'Exam Blueprint', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'EVALUATION_RESULT':
        return { label: 'Result & Marks', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'ATTENDANCE_LOCK':
        return { label: 'Attendance Lock', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'SUBSTITUTE_SWAP':
        return { label: 'Schedule Swap', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: category, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Breadcrumbs & Campus Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Academic Manager', href: '/academic-manager/dashboard' },
            { label: 'Approvals & Requests' },
          ]}
        />
        <CollegeFilterBar />
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200 text-xs font-bold mb-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Academic Executive Sign-Off & Verification Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
            Course & Batch Approval Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a foreign language course and assigned batch to inspect and authorize tutor submissions.
          </p>
        </div>

        {/* Global Pending Action Counter */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{overallStats.pending} Pending Total</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{overallStats.approved} Authorized</span>
          </span>
        </div>
      </div>

      {/* STEP 1: SELECT COURSE (Mild Pastel Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-[11px] font-black flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider">
              Select Foreign Language Course
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            Showing 4 CEFR Tracks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ACADEMIC_COURSES.map((course) => {
            const isSelected = selectedCourseId === course.id;
            const pendingCount = coursePendingCounts[course.id] || 0;

            return (
              <div
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? `${course.pastelBg} ${course.pastelBorder} ring-2 ring-[#0052CC]/30 shadow-md scale-[1.01]`
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-white/90 border border-slate-200 text-[#0B2447]">
                      {course.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pendingCount > 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 font-black'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {pendingCount > 0 ? `${pendingCount} Pending` : 'All Cleared'}
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-[#0B2447] line-clamp-2 leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {course.cefrTrack}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-semibold">
                    {course.batches.length} Assigned {course.batches.length === 1 ? 'Batch' : 'Batches'}
                  </span>
                  <span className={`font-black text-xs ${course.accentColor} flex items-center gap-1`}>
                    {isSelected ? 'Active ✓' : 'Select →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: SELECT BATCH UNDER COURSE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#0B2447] text-white text-[11px] font-black flex items-center justify-center">
              2
            </span>
            <span className="text-xs font-extrabold text-[#0B2447] uppercase tracking-wider">
              Select Batch for {currentCourse.code} ({currentCourse.name.split(':')[0]})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {currentCourse.batches.length} Available Cohorts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option to view all batches under this course */}
          <div
            onClick={() => setSelectedBatchId('ALL')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedBatchId === 'ALL'
                ? 'bg-blue-50/80 border-[#0052CC] ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-[#0B2447]">All Batches Combined</span>
              <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Consolidated approvals view for all sections of {currentCourse.code}
            </p>
          </div>

          {currentCourse.batches.map((batch) => {
            const isBatchSelected = selectedBatchId === batch.id;
            return (
              <div
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isBatchSelected
                    ? 'bg-blue-50/80 border-[#0052CC] ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-[#0052CC] uppercase tracking-wider block">
                      {batch.section}
                    </span>
                    <h4 className="text-xs font-black text-[#0B2447] truncate mt-0.5">
                      {batch.name}
                    </h4>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="truncate">{batch.timing}</span>
                  <span className="font-bold text-[#0B2447] shrink-0 ml-1">{batch.leadTrainer.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 3: APPROVAL REQUESTS LEDGER */}
      <div className="space-y-3 pt-2">
        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'TUTOR_REQUEST', label: '👨‍🏫 Tutor Requests' },
            { id: 'EXAM_ASSESSMENT', label: '📝 Exam Blueprints' },
            { id: 'EVALUATION_RESULT', label: '📊 Gradebook & Marks' },
            { id: 'ATTENDANCE_LOCK', label: '🔒 Attendance Locks' },
            { id: 'SUBSTITUTE_SWAP', label: '🔄 Schedule Swaps' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id as AcademicApprovalCategory)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-[#0B2447] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search requests in ${currentCourse.code}...`}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Action Only</option>
              <option value="APPROVED">Approved & Locked</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No requests for this course / batch</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All submissions for <strong>{currentCourse.code}</strong> are currently cleared or no items match your selected filters.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const badge = getCategoryBadge(item.category);
              const isPending = item.status === 'PENDING';

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDrawer(item)}
                  className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:shadow-md ${
                    isPending
                      ? 'border-blue-300/80 hover:border-[#0052CC] ring-1 ring-blue-50'
                      : 'border-slate-200 hover:border-slate-300 opacity-95'
                  }`}
                >
                  {/* Left: Item Information */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {item.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0B2447] text-white">
                        {item.courseCode}
                      </span>
                      {item.urgency === 'CRITICAL' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                          Critical Urgency
                        </span>
                      )}
                      <span
                        className={`ml-auto md:ml-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'CHANGES_REQUESTED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800 font-extrabold'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-[#0B2447] group-hover:text-[#0052CC] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.submittedBy.name} ({item.submittedBy.role})
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {item.batchName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.submittedAt}
                      </span>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleQuickApprove(item.id, e)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          title="Instant One-Click Approval"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept / Approve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(item)}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review & Audit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(item)}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Decision Log</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right-Side Slide-Over Form Drawer */}
      <AcademicApprovalDetailDrawer
        isOpen={isDrawerOpen}
        item={activeItem}
        onClose={() => {
          setIsDrawerOpen(false);
          setActiveItem(null);
        }}
        onApprove={handleDrawerApprove}
        onReject={handleDrawerReject}
        onRequestChanges={handleDrawerRequestChanges}
      />
    </div>
  );
}

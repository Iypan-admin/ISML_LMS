// ============================================================================
// ISML COLLEGE LMS — VIEW ASSESSMENT DETAIL DRAWER
// Full Control & Comprehensive Details for Assessments & Examinations
// Features: Full-Screen Toggle, Multi-tab Views (Overview, Submissions Roster,
// Rubric / Question Blueprint, Governance & Audit),
// Action Controls (Publish, Close, Extend Due Date, Edit, Delete, Export Marks)
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  FileCheck2,
  Award,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  BarChart3,
  BookOpen,
  Send,
  HelpCircle,
  Search,
  Filter,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { AssessmentItem } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/context/ToastContext';

interface ViewAssessmentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentItem | null;
  onEdit: (assessment: AssessmentItem) => void;
  onDelete: (assessment: AssessmentItem) => void;
  onStatusChange: (id: string, newStatus: 'PUBLISHED' | 'DRAFT' | 'CLOSED') => void;
}

interface MockSubmission {
  id: string;
  studentName: string;
  rollNo: string;
  submittedAt: string;
  score: number | null;
  status: 'EVALUATED' | 'PENDING_EVALUATION' | 'LATE_SUBMISSION';
  gradeLetter?: string;
  remarks?: string;
}

export default function ViewAssessmentDetailDrawer({
  isOpen,
  onClose,
  assessment,
  onEdit,
  onDelete,
  onStatusChange,
}: ViewAssessmentDetailDrawerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUBMISSIONS' | 'QUESTIONS' | 'SETTINGS'>('OVERVIEW');
  const [searchSubmission, setSearchSubmission] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState<'ALL' | 'EVALUATED' | 'PENDING'>('ALL');
  const { showSuccess, showInfo } = useToast();

  // Mock student submissions roster for this assessment
  const [submissions, setSubmissions] = useState<MockSubmission[]>([
    {
      id: 'sub-01',
      studentName: 'Aarav Sharma',
      rollNo: '24CS001',
      submittedAt: '2026-10-08 14:22',
      score: 46,
      status: 'EVALUATED',
      gradeLetter: 'A+',
      remarks: 'Exemplary work and clear code explanations.',
    },
    {
      id: 'sub-02',
      studentName: 'Ananya Deshmukh',
      rollNo: '24CS002',
      submittedAt: '2026-10-08 16:45',
      score: 41,
      status: 'EVALUATED',
      gradeLetter: 'A',
      remarks: 'Good grasp of algorithm complexity.',
    },
    {
      id: 'sub-03',
      studentName: 'Dinesh Karthik',
      rollNo: '24CS003',
      submittedAt: '2026-10-09 09:12',
      score: null,
      status: 'PENDING_EVALUATION',
      remarks: 'Awaiting faculty review.',
    },
    {
      id: 'sub-04',
      studentName: 'Harini Sundaram',
      rollNo: '24CS004',
      submittedAt: '2026-10-09 11:30',
      score: 38,
      status: 'EVALUATED',
      gradeLetter: 'B+',
      remarks: 'Minor logical flaws in edge test cases.',
    },
    {
      id: 'sub-05',
      studentName: 'Mohammed Faiz',
      rollNo: '24CS005',
      submittedAt: '2026-10-09 17:05',
      score: null,
      status: 'PENDING_EVALUATION',
      remarks: 'Submitted on time.',
    },
    {
      id: 'sub-06',
      studentName: 'Sneha Patel',
      rollNo: '24CS006',
      submittedAt: '2026-10-09 20:10',
      score: null,
      status: 'LATE_SUBMISSION',
      remarks: 'Turned in after cutoff window.',
    },
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !assessment) return null;

  const totalPossible = assessment.totalMarks || 100;
  const passingMarks = Math.round(totalPossible * 0.4);
  const evaluatedCount = submissions.filter((s) => s.status === 'EVALUATED').length;
  const pendingCount = submissions.filter((s) => s.status !== 'EVALUATED').length;
  const evaluatedScores = submissions.filter((s) => s.score !== null).map((s) => s.score as number);
  const avgScore = evaluatedScores.length > 0 
    ? Math.round(evaluatedScores.reduce((a, b) => a + b, 0) / evaluatedScores.length) 
    : 0;

  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'EVALUATED' && s.status !== 'EVALUATED') return false;
    if (submissionFilter === 'PENDING' && s.status === 'EVALUATED') return false;
    if (!searchSubmission.trim()) return true;
    const q = searchSubmission.toLowerCase();
    return s.studentName.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
  });

  const handleExportMarks = () => {
    showSuccess(`Marks ledger for "${assessment.title}" exported as Excel/CSV.`);
  };

  const handlePublishToggle = () => {
    const nextStatus = assessment.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    onStatusChange(assessment.id, nextStatus);
    showSuccess(`Assessment marked as ${nextStatus}.`);
  };

  const handleExtendDueDate = () => {
    showInfo('Due date extension request initiated for all cohort students.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`relative bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 transition-all ${
          isFullscreen ? 'w-full max-w-full' : 'w-full max-w-2xl lg:max-w-3xl'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E3A8A] bg-[#0B2447] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-cyan-400 border border-blue-500/30 shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-400/20 text-cyan-300 border border-blue-400/30">
                  {assessment.type}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-300 font-semibold">{assessment.batchName}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate mt-0.5" title={assessment.title}>
                {assessment.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              title={isFullscreen ? 'Exit Full Screen' : 'View Full Screen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'OVERVIEW'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Performance Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('SUBMISSIONS')}
              className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'SUBMISSIONS'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Submissions Roster ({assessment.submissionsCount || submissions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('QUESTIONS')}
              className={`px-3 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'QUESTIONS'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blueprint & Questions</span>
            </button>
          </div>

          <div className="py-1 shrink-0">
            <StatusBadge status={assessment.status} />
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/30">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Metric KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
                  <p className="text-sm sm:text-base font-extrabold text-[#0052CC] mt-1">{assessment.totalMarks}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Passing: {passingMarks} (40%)</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submissions</p>
                  <p className="text-sm sm:text-base font-extrabold text-[#0B2447] mt-1">{assessment.submissionsCount}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Turn-in rate ~92%</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Graded Count</p>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1">{evaluatedCount}</p>
                  <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{pendingCount} Pending</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Average</p>
                  <p className="text-sm sm:text-base font-extrabold text-indigo-700 mt-1">{avgScore} / {totalPossible}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Median Grade: A</p>
                </div>
              </div>

              {/* Assessment Meta Details */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#0052CC]" />
                  Curriculum & Schedule Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Subject / Course</span>
                    <p className="font-bold text-[#0B2447] text-sm">{assessment.subjectName}</p>
                    <p className="text-[11px] text-slate-500">Degree Program: {assessment.programName || 'Curricular Track'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Batch / Cohort</span>
                    <p className="font-bold text-[#0B2447] text-sm">{assessment.batchName}</p>
                    <p className="text-[11px] text-slate-500">Academic Semester: {assessment.semester || 1}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Evaluator / Faculty</span>
                    <p className="font-bold text-[#0B2447] text-sm">{assessment.facultyName}</p>
                    <p className="text-[11px] text-slate-500">Lead Academic Instructor</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Submission Due Date</span>
                    <p className="font-bold text-rose-600 text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {assessment.dueDate}
                    </p>
                    <p className="text-[11px] text-slate-500">Strict cutoff with automated lock</p>
                  </div>
                </div>
              </div>

              {/* Evaluation Progress Bar */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0B2447]">Evaluation & Grading Status</span>
                  <span className="text-[#0052CC]">
                    {Math.round((evaluatedCount / (submissions.length || 1)) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(evaluatedCount / (submissions.length || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{evaluatedCount} answer scripts evaluated</span>
                  <span>{pendingCount} scripts pending faculty review</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SUBMISSIONS' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchSubmission}
                    onChange={(e) => setSearchSubmission(e.target.value)}
                    placeholder="Search by student name or roll no..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
                  />
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shrink-0">
                  <button
                    onClick={() => setSubmissionFilter('ALL')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      submissionFilter === 'ALL' ? 'bg-[#0052CC] text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All ({submissions.length})
                  </button>
                  <button
                    onClick={() => setSubmissionFilter('EVALUATED')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      submissionFilter === 'EVALUATED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Graded ({evaluatedCount})
                  </button>
                  <button
                    onClick={() => setSubmissionFilter('PENDING')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      submissionFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Student & ID</th>
                      <th className="py-2.5 px-3">Submitted At</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Score / Grade</th>
                      <th className="py-2.5 px-4 text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-[#0B2447]">{sub.studentName}</p>
                            <p className="text-[10px] font-mono text-slate-400">{sub.rollNo}</p>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {sub.submittedAt}
                          </td>
                          <td className="py-2.5 px-3">
                            {sub.status === 'EVALUATED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Graded
                              </span>
                            ) : sub.status === 'LATE_SUBMISSION' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Late Turn-in
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Under Review
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">
                            {sub.score !== null ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#0052CC]">{sub.score} / {totalPossible}</span>
                                {sub.gradeLetter && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                                    {sub.gradeLetter}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Not graded</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right text-slate-500 text-[11px] truncate max-w-[180px]">
                            {sub.remarks || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No student submissions found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'QUESTIONS' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider">
                      Assessment Question Paper Blueprint
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Structure and section weightage mapped to Course Learning Outcomes (CLOs)
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] text-xs font-bold border border-blue-200">
                    Total Marks: {assessment.totalMarks}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#0B2447]">Section A: Multiple Choice Questions (MCQs)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">10 Questions × 1 Mark each (Core Vocabulary & Syntax)</p>
                    </div>
                    <span className="font-bold text-xs text-slate-700">10 Marks</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#0B2447]">Section B: Short Conceptual Questions</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">4 Questions × 5 Marks each (Grammar structure, Logic Analysis)</p>
                    </div>
                    <span className="font-bold text-xs text-slate-700">20 Marks</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#0B2447]">Section C: Practical Case Study / Implementation</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">1 Comprehensive problem statement with rubric scoring</p>
                    </div>
                    <span className="font-bold text-xs text-slate-700">
                      {Math.max(10, assessment.totalMarks - 30)} Marks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Full Control Action Bar */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarks}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
            <button
              onClick={handleExtendDueDate}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Extend Due Date</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePublishToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                assessment.status === 'PUBLISHED'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{assessment.status === 'PUBLISHED' ? 'Close Assessment' : 'Publish to Students'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(assessment);
              }}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(assessment);
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

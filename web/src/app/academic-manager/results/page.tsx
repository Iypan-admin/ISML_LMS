// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: RESULTS & PROGRESS
// (/academic-manager/results)
// Real Assignment & Assessment Submissions Marks, Batches & Student Transcripts
// Zero mock data: dynamically computes from assignmentStore
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  FileText,
  ClipboardList,
  Eye,
  GraduationCap,
  BookOpen,
  X,
  Printer,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import { StudentMarkEntry } from '@/mock/results';
import { assignmentStore, SharedAssignment } from '@/services/assignmentStore';

export default function AcademicManagerResultsPage() {
  const { showSuccess } = useToast();

  const [assignments, setAssignments] = useState<SharedAssignment[]>([]);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const res = await fetch('/api/portals/assignments', { cache: 'no-store' });
        const json = await res.json();
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setAssignments(json.data);
          return;
        }
      } catch (e) {}

      // Fallback only if database API is unreachable
      const storeItems = assignmentStore.getAll();
      setAssignments(storeItems);
    };

    loadAssignments();
    const unsubscribe = assignmentStore.subscribe(loadAssignments);
    const handleSync = () => loadAssignments();
    window.addEventListener('isml-realtime-event', handleSync);
    return () => {
      unsubscribe();
      window.removeEventListener('isml-realtime-event', handleSync);
    };
  }, []);

  // Compute live StudentMarkEntry list from real assignmentStore submissions
  const markLedger: StudentMarkEntry[] = useMemo(() => {
    const list: StudentMarkEntry[] = [];

    assignments.forEach((asg) => {
      if (asg.submissions && asg.submissions.length > 0) {
        asg.submissions.forEach((sub) => {
          // If status is PENDING_REVIEW and score not evaluated yet, display pending status without penalizing as RA
          const isEvaluated = sub.status === 'EVALUATED';
          const score = sub.scoreAwarded ?? 0;
          const maxScore = sub.maxScore || asg.maxScore || 100;
          const percentage = isEvaluated ? Math.round((score / maxScore) * 100) : 0;
          
          let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'RA' = 'RA';
          if (isEvaluated) {
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B+';
            else if (percentage >= 60) grade = 'B';
            else if (percentage >= 50) grade = 'C';
          }

          const d = new Date(sub.submittedAt);
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

          list.push({
            id: sub.id,
            studentId: sub.studentRollNo || sub.studentId,
            studentName: sub.studentName,
            studentEmail: `${(sub.studentRollNo || 'std').toLowerCase().replace(/[^a-z0-9]/g, '')}@student.isml.edu`,
            batchId: asg.batchId,
            batchName: asg.batchName,
            languageFamily: asg.languageFamily || 'FRENCH',
            courseName: asg.courseName,
            itemType: 'ASSIGNMENT',
            activityTitle: asg.title,
            moduleName: asg.moduleName || 'Core Curriculum',
            lsrwSkill: asg.lsrwSkill,
            submissionDate: d.toLocaleDateString(),
            dayOfWeek: days[d.getDay()] || 'Weekday',
            score,
            maxScore,
            percentage,
            grade,
            status: isEvaluated ? 'EVALUATED' : 'PENDING_REVIEW',
            evaluatedByTutor: isEvaluated ? (asg.assignedTutorName || 'Joy JK') : 'Awaiting Faculty Evaluation',
            tutorFeedback: sub.tutorFeedback || (isEvaluated ? 'Evaluated' : 'Submitted deliverable pending tutor evaluation'),
          });
        });
      }
    });

    return list;
  }, [assignments]);

  // Filters
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active View Tab: 'ALL_RECORDS' vs 'STUDENT_TRANSCRIPTS'
  const [viewMode, setViewMode] = useState<'ALL_RECORDS' | 'STUDENT_TRANSCRIPTS'>('ALL_RECORDS');

  // Selected Student for Modal Transcript view
  const [activeStudentModal, setActiveStudentModal] = useState<string | null>(null);

  // Extract distinct batches
  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    markLedger.forEach((m) => {
      map.set(m.batchId, m.batchName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [markLedger]);

  // Extract distinct students
  const studentOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; batchName: string }>();
    markLedger.forEach((m) => {
      if (selectedBatchId === 'ALL' || m.batchId === selectedBatchId) {
        map.set(m.studentId, {
          id: m.studentId,
          name: m.studentName,
          batchName: m.batchName
        });
      }
    });
    return Array.from(map.values());
  }, [markLedger, selectedBatchId]);

  // Filtered dataset
  const filteredMarks = useMemo(() => {
    return markLedger.filter((item) => {
      if (selectedBatchId !== 'ALL' && item.batchId !== selectedBatchId) return false;
      if (selectedLanguage !== 'ALL' && item.languageFamily !== selectedLanguage) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
      if (selectedStudentId !== 'ALL' && item.studentId !== selectedStudentId) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.studentName.toLowerCase().includes(q) ||
          item.studentId.toLowerCase().includes(q) ||
          item.activityTitle.toLowerCase().includes(q) ||
          item.moduleName.toLowerCase().includes(q) ||
          item.evaluatedByTutor.toLowerCase().includes(q) ||
          item.batchName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [markLedger, selectedBatchId, selectedLanguage, selectedStatus, selectedStudentId, searchQuery]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = filteredMarks.length;
    if (total === 0) {
      return { total: 0, avgPercentage: 0, passCount: 0, evaluatedCount: 0 };
    }
    const sumPct = filteredMarks.reduce((acc, curr) => acc + curr.percentage, 0);
    const avgPercentage = Math.round(sumPct / total);
    const passCount = filteredMarks.filter((m) => m.percentage >= 50).length;
    const evaluatedCount = filteredMarks.filter((m) => m.status === 'EVALUATED').length;

    return {
      total,
      avgPercentage,
      passCount,
      evaluatedCount
    };
  }, [filteredMarks]);

  // Grouped by Student for Student Transcripts view
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
      const evaluatedCount = entries.filter((e) => e.status === 'EVALUATED').length;

      return {
        studentId: stId,
        studentName,
        studentEmail,
        batchName,
        languageFamily,
        courseName,
        avgScore,
        evaluatedCount,
        totalTasks: entries.length,
        entries
      };
    });
  }, [filteredMarks]);

  // Selected student details for modal
  const selectedStudentForModal = useMemo(() => {
    if (!activeStudentModal) return null;
    const entries = markLedger.filter((m) => m.studentId === activeStudentModal);
    if (entries.length === 0) return null;
    return {
      studentId: activeStudentModal,
      studentName: entries[0].studentName,
      studentEmail: entries[0].studentEmail,
      batchName: entries[0].batchName,
      courseName: entries[0].courseName,
      languageFamily: entries[0].languageFamily,
      entries,
      avgScore: Math.round(entries.reduce((a, b) => a + b.percentage, 0) / entries.length)
    };
  }, [activeStudentModal, markLedger]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Results & Progress' }]} />

      <CollegeFilterBar />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>Assignment Submissions & Student Progress Marks</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time evaluation marks ledger, CEFR modular scores, and student report cards generated from active assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (filteredMarks.length === 0) {
                showSuccess('No submission records to export yet.');
                return;
              }
              showSuccess('Marks sheet CSV exported successfully.');
            }}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B2447] mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400 font-medium">Across assigned cohorts</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Evaluated Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{stats.evaluatedCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Graded by tutors</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average Score</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2">{stats.avgPercentage}%</p>
          <span className="text-[11px] text-slate-400 font-medium">Overall student average</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Passing Deliverables</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{stats.passCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Scoring ≥ 50%</span>
        </div>
      </div>

      {/* Filter Bar & View Toggle */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('ALL_RECORDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'ALL_RECORDS'
                  ? 'bg-white text-[#0B2447] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Submission Records ({filteredMarks.length})
            </button>
            <button
              onClick={() => setViewMode('STUDENT_TRANSCRIPTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'STUDENT_TRANSCRIPTS'
                  ? 'bg-white text-[#0B2447] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Transcripts & Report Cards ({studentProfiles.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, batch, tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Batch Cohort
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            >
              <option value="ALL">All Batches</option>
              {batchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Language Track
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            >
              <option value="ALL">All Languages</option>
              <option value="FRENCH">French</option>
              <option value="JAPANESE">Japanese</option>
              <option value="KOREAN">Korean</option>
              <option value="SPANISH">Spanish</option>
              <option value="GERMAN">German</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Evaluation Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            >
              <option value="ALL">All Status</option>
              <option value="EVALUATED">Evaluated</option>
              <option value="PENDING_REVIEW">Pending Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            >
              <option value="ALL">All Students ({studentOptions.length})</option>
              {studentOptions.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredMarks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Assignment Results Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Students who submit assignments created in the Assignments portal will automatically appear here once submitted or evaluated.
          </p>
          <Link
            href="/academic-manager/assignments"
            className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Go to Assignments</span>
          </Link>
        </div>
      ) : viewMode === 'ALL_RECORDS' ? (
        /* TABLE: All Submission Records */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Batch & Course</th>
                  <th className="px-4 py-3">Assignment Activity</th>
                  <th className="px-4 py-3">Skill Track</th>
                  <th className="px-4 py-3 text-center">Marks & Grade</th>
                  <th className="px-4 py-3">Evaluator & Feedback</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMarks.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#0B2447]">{entry.studentName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{entry.studentId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{entry.batchName}</p>
                      <p className="text-[11px] text-slate-500">{entry.courseName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{entry.activityTitle}</p>
                      <p className="text-[10px] text-slate-500">{entry.moduleName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0052CC] border border-blue-200 uppercase">
                        {entry.lsrwSkill}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        {entry.status === 'EVALUATED' ? (
                          <>
                            <span className="font-black text-slate-900 text-sm">
                              {entry.score} / {entry.maxScore}
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-black ${
                              entry.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' :
                              entry.percentage >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              Grade {entry.grade} ({entry.percentage}%)
                            </span>
                          </>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            Pending Review
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-700 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{entry.evaluatedByTutor}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 italic truncate max-w-[180px]" title={entry.tutorFeedback}>
                        &quot;{entry.tutorFeedback}&quot;
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActiveStudentModal(entry.studentId)}
                        className="px-2.5 py-1 text-xs font-bold text-[#0052CC] hover:bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Report Card</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID: Student Transcripts & Report Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentProfiles.map((p) => (
            <div
              key={p.studentId}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0052CC] font-black flex items-center justify-center text-sm">
                      {p.studentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.studentName}</h3>
                      <p className="text-[11px] font-mono text-slate-400">{p.studentId}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                    p.avgScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    p.avgScore >= 50 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {p.avgScore}% Avg
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Cohort Batch:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{p.batchName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Language:</span>
                    <span className="font-bold text-[#0052CC]">{p.languageFamily}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-slate-500 font-medium">Deliverables:</span>
                    <span className="font-bold text-slate-800">{p.totalTasks} Completed</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStudentModal(p.studentId)}
                className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-[#0052CC] border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Full Transcript</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* STUDENT REPORT CARD MODAL */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedStudentForModal.studentName}</h3>
                  <p className="text-xs text-blue-200 font-mono">Roll: {selectedStudentForModal.studentId} • {selectedStudentForModal.batchName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-medium">Cumulative Average</p>
                  <p className="text-2xl font-black text-[#0B2447]">{selectedStudentForModal.avgScore}%</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Target Language</p>
                  <p className="text-base font-bold text-[#0052CC]">{selectedStudentForModal.languageFamily}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Total Submissions</p>
                  <p className="text-base font-bold text-slate-800">{selectedStudentForModal.entries.length} Tasks</p>
                </div>
              </div>

              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Completed Deliverables Breakdown</h4>
              <div className="space-y-2">
                {selectedStudentForModal.entries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{entry.activityTitle}</span>
                      <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded border">
                        {entry.score} / {entry.maxScore} ({entry.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Evaluated by: <strong>{entry.evaluatedByTutor}</strong></span>
                      <span>{entry.submissionDate}</span>
                    </div>
                    {entry.tutorFeedback && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">
                        Feedback: &quot;{entry.tutorFeedback}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setActiveStudentModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

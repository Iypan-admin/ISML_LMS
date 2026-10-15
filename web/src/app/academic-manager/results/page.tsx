// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: RESULTS & PROGRESS
// (/academic-manager/results)
// Comprehensive Batch-wise & Student-wise Assessment & Assignment Mark Lists
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Download,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  FileText,
  ClipboardList,
  Sparkles,
  ChevronRight,
  Eye,
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
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import {
  mockStudentMarksLedger,
  StudentMarkEntry
} from '@/mock/results';

export default function AcademicManagerResultsPage() {
  const { showSuccess } = useToast();

  // Filters
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedItemType, setSelectedItemType] = useState<'ALL' | 'ASSESSMENT' | 'ASSIGNMENT'>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active View Tab: 'BATCH_MATRIX' vs 'STUDENT_MARKLIST'
  const [viewMode, setViewMode] = useState<'ALL_RECORDS' | 'STUDENT_TRANSCRIPTS'>('ALL_RECORDS');

  // Selected Student for Modal Transcript view
  const [activeStudentModal, setActiveStudentModal] = useState<string | null>(null);

  // Extract distinct batches
  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    mockStudentMarksLedger.forEach((m) => {
      map.set(m.batchId, m.batchName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  // Extract distinct students (optionally scoped to batch)
  const studentOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; batchName: string }>();
    mockStudentMarksLedger.forEach((m) => {
      if (selectedBatchId === 'ALL' || m.batchId === selectedBatchId) {
        map.set(m.studentId, {
          id: m.studentId,
          name: m.studentName,
          batchName: m.batchName
        });
      }
    });
    return Array.from(map.values());
  }, [selectedBatchId]);

  // Filtered dataset
  const filteredMarks = useMemo(() => {
    return mockStudentMarksLedger.filter((item) => {
      if (selectedBatchId !== 'ALL' && item.batchId !== selectedBatchId) {
        return false;
      }
      if (selectedLanguage !== 'ALL' && item.languageFamily !== selectedLanguage) {
        return false;
      }
      if (selectedItemType !== 'ALL' && item.itemType !== selectedItemType) {
        return false;
      }
      if (selectedStudentId !== 'ALL' && item.studentId !== selectedStudentId) {
        return false;
      }
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
  }, [selectedBatchId, selectedLanguage, selectedItemType, selectedStudentId, searchQuery]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = filteredMarks.length;
    if (total === 0) {
      return { total: 0, avgPercentage: 0, passCount: 0, topGradeCount: 0 };
    }
    const sumPct = filteredMarks.reduce((acc, curr) => acc + curr.percentage, 0);
    const avgPercentage = Math.round(sumPct / total);
    const passCount = filteredMarks.filter((m) => m.percentage >= 50).length;
    const topGradeCount = filteredMarks.filter((m) => m.grade === 'A+' || m.grade === 'A').length;

    return {
      total,
      avgPercentage,
      passCount,
      topGradeCount
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
        entries
      };
    });
  }, [filteredMarks]);

  // Selected student details for modal
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
      avgScore: Math.round(entries.reduce((a, b) => a + b.percentage, 0) / entries.length)
    };
  }, [activeStudentModal]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Results & Progress' }]} />

      <CollegeFilterBar />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>Student Marks & Report Cards</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View continuous assessments, homework assignments, CEFR modular scores, and student report cards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => showSuccess('Exported Student Mark List CSV/Excel sheet successfully!')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Mark Sheet (Excel)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Evaluated Submissions</span>
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{stats.total}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Assessments & Assignments</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Class Average Score</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{stats.avgPercentage}%</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Satisfies CEFR Benchmark</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Distinction / Grade A</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{stats.topGradeCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Scores 80% and above</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Pass Clearance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">
            {stats.total > 0 ? Math.round((stats.passCount / stats.total) * 100) : 0}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Pass benchmark &gt;= 50%</p>
        </div>
      </div>

      {/* Main Filter & Navigation Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Top Filter Controls: Batch, Student, Type, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Batch Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Student Batch:</span>
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setSelectedStudentId('ALL'); // Reset student when batch changes
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            >
              <option value="ALL">All Student Batches ({batchOptions.length})</option>
              {batchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Individual Student Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Individual Student:</span>
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            >
              <option value="ALL">All Students ({studentOptions.length})</option>
              {studentOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Item Category (Assessments vs Assignments) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Activity Type:</span>
            </label>
            <select
              value={selectedItemType}
              onChange={(e) => setSelectedItemType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            >
              <option value="ALL">Assessments & Assignments (Both)</option>
              <option value="ASSESSMENT">Assessments / Quizzes / Midterms Only</option>
              <option value="ASSIGNMENT">Homework / Practice Tasks Only</option>
            </select>
          </div>

          {/* 4. Search Bar */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search Records:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, activity, tutor..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>
          </div>
        </div>

        {/* View Switcher & Language Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Language filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 mr-1 shrink-0">Language:</span>
            {['ALL', 'FRENCH', 'JAPANESE', 'KOREAN', 'SPANISH', 'GERMAN'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedLanguage === lang
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang === 'ALL' ? 'All Languages' : lang}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: All Records Table vs Student Report Cards */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto shrink-0">
            <button
              onClick={() => setViewMode('ALL_RECORDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'ALL_RECORDS'
                  ? 'bg-white text-[#0052CC] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Detailed Mark List ({filteredMarks.length})</span>
            </button>
            <button
              onClick={() => setViewMode('STUDENT_TRANSCRIPTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'STUDENT_TRANSCRIPTS'
                  ? 'bg-white text-[#0052CC] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Profile Cards ({studentProfiles.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: DETAILED MARK LIST TABLE */}
      {viewMode === 'ALL_RECORDS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-[#0B2447] flex items-center gap-2">
                <span>Assessments & Assignments Mark Sheet</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                  {filteredMarks.length} records
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Individual item-level scores, awarded grades, evaluating tutor feedback, and dates.
              </p>
            </div>
          </div>

          {filteredMarks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No mark records found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match the chosen batch, student, or activity filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Student & Batch</th>
                    <th className="py-3 px-4">Activity Title & Module</th>
                    <th className="py-3 px-4">Type & Skill</th>
                    <th className="py-3 px-4">Date & Day</th>
                    <th className="py-3 px-4 text-center">Score / Max</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4">Evaluating Tutor</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredMarks.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* Student & Batch */}
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
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mt-0.5">
                              {item.batchName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Activity Title & Module */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 leading-snug">{item.activityTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.moduleName}</p>
                      </td>

                      {/* Item Type & LSRW */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.itemType === 'ASSESSMENT'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.itemType}
                          </span>
                          <span className="block text-[10px] font-semibold text-slate-500">
                            {item.lsrwSkill}
                          </span>
                        </div>
                      </td>

                      {/* Date and Day */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{item.dayOfWeek}</p>
                        <p className="text-[11px] text-slate-500">{item.submissionDate}</p>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {item.score} <span className="text-slate-400 font-normal">/ {item.maxScore}</span>
                      </td>

                      {/* Percentage Bar */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-black text-xs ${
                              item.percentage >= 80
                                ? 'text-emerald-600'
                                : item.percentage >= 60
                                ? 'text-blue-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {item.percentage}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.percentage >= 80
                                  ? 'bg-emerald-500'
                                  : item.percentage >= 60
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Awarded Grade */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                            item.grade === 'A+' || item.grade === 'A'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.grade === 'B+' || item.grade === 'B'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {item.grade}
                        </span>
                      </td>

                      {/* Evaluating Tutor & Feedback tooltip */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-bold text-slate-800 text-xs">{item.evaluatedByTutor}</p>
                        <p className="text-[10px] text-slate-500 italic truncate mt-0.5" title={item.tutorFeedback}>
                          &quot;{item.tutorFeedback}&quot;
                        </p>
                      </td>

                      {/* Action: View Student Profile Transcript */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/academic-manager/results/${item.studentId}`}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: STUDENT PROFILE TRANSCRIPTS */}
      {viewMode === 'STUDENT_TRANSCRIPTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentProfiles.map((profile) => (
            <div
              key={profile.studentId}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden border-t-4 border-t-blue-600 p-5 space-y-4"
            >
              <div>
                {/* Header: Student Name & Batch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm shadow-2xs">
                      {profile.studentName.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B2447]">{profile.studentName}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{profile.studentId}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {profile.languageFamily}
                  </span>
                </div>

                {/* Batch & Program Info */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{profile.batchName}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{profile.courseName}</p>
                </div>

                {/* Performance Summary Pill */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-slate-500 block font-semibold">Average</span>
                    <strong className="text-base font-extrabold text-blue-700">{profile.avgScore}%</strong>
                  </div>
                  <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                    <span className="text-[10px] text-slate-500 block font-semibold">Assessments</span>
                    <strong className="text-base font-extrabold text-purple-700">{profile.assessmentsCount}</strong>
                  </div>
                  <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-slate-500 block font-semibold">Assignments</span>
                    <strong className="text-base font-extrabold text-amber-700">{profile.assignmentsCount}</strong>
                  </div>
                </div>

                {/* List of submissions */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Completed Records ({profile.entries.length})
                  </span>
                  <div className="space-y-1.5">
                    {profile.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs border border-slate-100"
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-slate-800 text-[11px] truncate">
                            {entry.activityTitle}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {entry.dayOfWeek}, {entry.submissionDate}
                          </p>
                        </div>
                        <span className="font-extrabold text-slate-900 shrink-0 text-xs">
                          {entry.score}/{entry.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* View Full Report Card Dedicated Page Link */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href={`/academic-manager/results/${profile.studentId}`}
                  className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Student Report Card</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

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

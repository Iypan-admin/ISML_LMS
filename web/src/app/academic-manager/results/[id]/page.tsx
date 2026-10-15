// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: INDIVIDUAL STUDENT REPORT CARD VIEW
// (/academic-manager/results/[id])
// Comprehensive, Responsive, Official Academic Ledger & CEFR Grade Transcript
// ============================================================================

"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  Award,
  CheckCircle2,
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  FileCheck2,
  ShieldCheck,
  Building2,
  Mail,
  User,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useToast } from '@/context/ToastContext';
import { mockStudentMarksLedger, StudentMarkEntry } from '@/mock/results';
import { mockStudents } from '@/mock/superAdminData';

export default function StudentReportCardPage() {
  const params = useParams();
  const router = useRouter();
  const studentIdParam = (params?.id as string) || '';
  const { showSuccess } = useToast();

  // Find student records in the mark ledger
  const studentMarks = useMemo(() => {
    return mockStudentMarksLedger.filter(
      (m) => m.studentId.toLowerCase() === studentIdParam.toLowerCase() ||
             m.studentName.toLowerCase().replace(/\s+/g, '-').includes(studentIdParam.toLowerCase())
    );
  }, [studentIdParam]);

  // Find basic student metadata from mockStudents as fallback/enrichment
  const studentMeta = useMemo(() => {
    return mockStudents.find(
      (s) => s.studentId.toLowerCase() === studentIdParam.toLowerCase() ||
             s.id.toLowerCase() === studentIdParam.toLowerCase()
    );
  }, [studentIdParam]);

  // If student records exist in marks ledger
  const primaryMark = studentMarks[0];
  const studentName = primaryMark?.studentName || studentMeta?.name || "Student Report";
  const studentId = primaryMark?.studentId || studentMeta?.studentId || studentIdParam;
  const batchName = primaryMark?.batchName || studentMeta?.batchName || "Cohort 2026–2029";
  const courseName = primaryMark?.courseName || studentMeta?.enrolledCourseName || "Foreign Language Certification";
  const languageFamily = primaryMark?.languageFamily || "FRENCH";

  // Calculations
  const stats = useMemo(() => {
    if (studentMarks.length === 0) {
      return {
        total: 0,
        avgPercentage: 88,
        totalScoreEarned: 0,
        totalMaxScore: 0,
        assessmentsCount: 0,
        assignmentsCount: 0,
        distinctions: 0
      };
    }

    const total = studentMarks.length;
    const earned = studentMarks.reduce((acc, curr) => acc + curr.score, 0);
    const max = studentMarks.reduce((acc, curr) => acc + curr.maxScore, 0);
    const avgPercentage = Math.round(
      studentMarks.reduce((acc, curr) => acc + curr.percentage, 0) / total
    );
    const assessmentsCount = studentMarks.filter((m) => m.itemType === 'ASSESSMENT').length;
    const assignmentsCount = studentMarks.filter((m) => m.itemType === 'ASSIGNMENT').length;
    const distinctions = studentMarks.filter((m) => m.grade === 'A+' || m.grade === 'A').length;

    return {
      total,
      avgPercentage,
      totalScoreEarned: earned,
      totalMaxScore: max,
      assessmentsCount,
      assignmentsCount,
      distinctions
    };
  }, [studentMarks]);

  // Determine CEFR level based on avgPercentage
  const cefrStanding = useMemo(() => {
    if (stats.avgPercentage >= 90) return { level: 'CEFR A1.2 Advanced High', badge: 'Distinction Scholar' };
    if (stats.avgPercentage >= 80) return { level: 'CEFR A1.1 Proficient', badge: 'First Class Grade A' };
    if (stats.avgPercentage >= 65) return { level: 'CEFR A1 Foundations', badge: 'Satisfactory Progress' };
    return { level: 'CEFR A1 In Progress', badge: 'Developing' };
  }, [stats.avgPercentage]);

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Teaching & Learning' },
          { label: 'Results & Progress', href: '/academic-manager/results' },
          { label: `${studentName} — Official Transcript` }
        ]}
      />

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/academic-manager/results"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Back to Results"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
              <span>Official Academic Report Card</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                CERTIFIED
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Authorized performance evaluation & continuous learning assessment transcript.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => showSuccess('Official Transcript PDF exported.')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report Card</span>
          </button>
        </div>
      </div>

      {/* Official Certificate & Student Master Header Banner */}
      <div className="bg-gradient-to-br from-[#0B2447] via-[#091E3A] to-[#051326] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Student Profile Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-lg shrink-0 border-2 border-white/20">
              {studentName.slice(0, 1)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{studentName}</h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white/15 text-blue-200 border border-white/20">
                  {studentId}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  {languageFamily}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-medium">
                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{batchName}</span>
              </p>

              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{courseName}</span>
              </p>
            </div>
          </div>

          {/* Academic Standing Pill & Cumulative Grade */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex items-center gap-5 shrink-0 self-stretch md:self-auto justify-around md:justify-start">
            <div className="text-center">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                Cumulative GPA / %
              </span>
              <p className="text-3xl sm:text-4xl font-black text-white mt-0.5">
                {stats.avgPercentage}%
              </p>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                {cefrStanding.badge}
              </span>
            </div>

            <div className="w-px h-12 bg-white/20" />

            <div className="text-center">
              <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider block">
                Proficiency Level
              </span>
              <p className="text-base sm:text-lg font-extrabold text-amber-300 mt-0.5">
                {cefrStanding.level}
              </p>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                ISML Academic Standard
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Continuous Assessments</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{stats.assessmentsCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">CIA Exams & Modular Quizzes</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Homework Assignments</span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{stats.assignmentsCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Worksheets & Audio Tasks</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Points Earned</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">
            {stats.totalScoreEarned} <span className="text-xs text-slate-400 font-normal">/ {stats.totalMaxScore}</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total aggregate score</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Grade A Distinctions</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{stats.distinctions}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Excellence Benchmark</p>
        </div>
      </div>

      {/* Main Evaluated Items Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0B2447] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Modular Evaluation & Task Mark List</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive list of all submitted coursework, grading rubrics, day/date timestamps, and faculty mentor feedback.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            Total Records: <strong>{studentMarks.length}</strong>
          </span>
        </div>

        {studentMarks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No mark records found for this student</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please verify the student ID or check back once continuous assessment marks are submitted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Evaluation Activity & Module</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">LSRW Skill</th>
                  <th className="py-3.5 px-4">Submission Date & Day</th>
                  <th className="py-3.5 px-4 text-center">Score / Max</th>
                  <th className="py-3.5 px-4 text-center">Percentage</th>
                  <th className="py-3.5 px-4 text-center">Awarded Grade</th>
                  <th className="py-3.5 px-4">Faculty Mentor Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {studentMarks.map((entry) => (
                  <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Activity Title & Module */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 text-xs leading-snug">{entry.activityTitle}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{entry.moduleName}</p>

                      {/* Section breakdown pill if exists */}
                      {entry.sectionBreakdown && entry.sectionBreakdown.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.sectionBreakdown.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-semibold"
                            >
                              {s.section}: <strong>{s.score}/{s.maxScore}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          entry.itemType === 'ASSESSMENT'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {entry.itemType}
                      </span>
                    </td>

                    {/* LSRW Skill */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {entry.lsrwSkill}
                      </span>
                    </td>

                    {/* Date and Day */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{entry.dayOfWeek}</p>
                      <p className="text-[11px] text-slate-500">{entry.submissionDate}</p>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 text-center font-bold text-slate-900 whitespace-nowrap">
                      {entry.score} <span className="text-slate-400 font-normal">/ {entry.maxScore}</span>
                    </td>

                    {/* Percentage */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-black text-xs ${
                            entry.percentage >= 80
                              ? 'text-emerald-600'
                              : entry.percentage >= 60
                              ? 'text-blue-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {entry.percentage}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              entry.percentage >= 80
                                ? 'bg-emerald-500'
                                : entry.percentage >= 60
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${entry.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Awarded Grade */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-black border ${
                          entry.grade === 'A+' || entry.grade === 'A'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : entry.grade === 'B+' || entry.grade === 'B'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {entry.grade}
                      </span>
                    </td>

                    {/* Faculty Feedback */}
                    <td className="py-4 px-4 max-w-[240px]">
                      <p className="font-bold text-slate-800 text-[11px]">{entry.evaluatedByTutor}</p>
                      <p className="text-[11px] text-slate-600 italic mt-0.5">
                        &quot;{entry.tutorFeedback}&quot;
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Certification Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified by ISML Foreign Language Academic Assessment Directorate</span>
            </p>
            <p className="text-[10px] text-slate-500">
              This academic report reflects authentic LMS internal continuous assessment (CIA) and homework marks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/academic-manager/results"
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Back to All Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

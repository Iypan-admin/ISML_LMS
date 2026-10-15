// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: EXAM & ASSESSMENT MARKS
// (/college-admin/assessments)
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Award,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { mockInstitutions, mockCourses, mockBatches, mockStudents } from '@/mock/superAdminData';

export default function CollegeAdminAssessmentsPage() {
  const currentCollege = mockInstitutions[0];
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [search, setSearch] = useState('');

  const marksRoster = [
    {
      studentId: 'ISML20260001',
      name: 'Aarav Sharma',
      courseName: 'French A1 Intensive',
      batchName: 'Cohort 2026–2029 (Section A)',
      internalScore: 48,
      midTermScore: 42,
      oralProficiency: 'A+',
      finalGrade: 'O (Outstanding)',
      percentage: 92,
      result: 'PASSED',
    },
    {
      studentId: 'ISML20260002',
      name: 'Diya Patel',
      courseName: 'French A1 Intensive',
      batchName: 'Cohort 2026–2029 (Section A)',
      internalScore: 45,
      midTermScore: 39,
      oralProficiency: 'A',
      finalGrade: 'A+ (Distinction)',
      percentage: 86,
      result: 'PASSED',
    },
    {
      studentId: 'ISML20260003',
      name: 'Rohan Iyer',
      courseName: 'German B1 Professional',
      batchName: 'Cohort 2026–2029 (Section B)',
      internalScore: 41,
      midTermScore: 36,
      oralProficiency: 'B+',
      finalGrade: 'A (Very Good)',
      percentage: 79,
      result: 'PASSED',
    },
    {
      studentId: 'ISML20260004',
      name: 'Ananya Deshmukh',
      courseName: 'Japanese N5 Beginner',
      batchName: 'Cohort 2026–2029 (Section A)',
      internalScore: 49,
      midTermScore: 44,
      oralProficiency: 'A+',
      finalGrade: 'O (Outstanding)',
      percentage: 95,
      result: 'PASSED',
    },
    {
      studentId: 'ISML20260005',
      name: 'Vikram Menon',
      courseName: 'Spanish A1 Conversational',
      batchName: 'Cohort 2026–2029 (Section B)',
      internalScore: 32,
      midTermScore: 28,
      oralProficiency: 'B',
      finalGrade: 'B+ (Good)',
      percentage: 64,
      result: 'PASSED',
    },
    {
      studentId: 'ISML20260006',
      name: 'Pooja Hegde',
      courseName: 'French A1 Intensive',
      batchName: 'Cohort 2026–2029 (Section A)',
      internalScore: 20,
      midTermScore: 22,
      oralProficiency: 'C',
      finalGrade: 'RA (Re-Appear)',
      percentage: 42,
      result: 'ARREAR',
    },
  ];

  const filtered = marksRoster.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || row.courseName.includes(selectedCourse);
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded-full">
            <Award className="w-3.5 h-3.5" />
            <span>Academic Performance & Grading Radar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight mt-2">
            Exam & Assessment Marks Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal assessments, mid-term examinations, and CEFR oral proficiency benchmarks for {currentCollege.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Downloading official marks statement report...')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Marks Statement</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Campus Pass Rate</span>
          <p className="text-2xl font-black text-emerald-700">94.2%</p>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Higher than state avg (88%)</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Distinction Rate</span>
          <p className="text-2xl font-black text-purple-700">41.8%</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Grade O & A+ Achievers</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Average CEFR Score</span>
          <p className="text-2xl font-black text-blue-700">79.6%</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Oral & Written composite</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Remedial Attention</span>
          <p className="text-2xl font-black text-rose-600">3 Students</p>
          <span className="text-[11px] font-medium text-rose-600 mt-1 block">Recommended for tutoring</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or roll no..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0052CC]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">All Language Courses</option>
              <option value="French">French A1</option>
              <option value="German">German B1</option>
              <option value="Japanese">Japanese N5</option>
              <option value="Spanish">Spanish A1</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-3.5">Student Details</th>
                <th className="p-3.5">Course & Cohort</th>
                <th className="p-3.5 text-center">Internal (50)</th>
                <th className="p-3.5 text-center">Mid-Term (50)</th>
                <th className="p-3.5 text-center">Oral CEFR</th>
                <th className="p-3.5 text-center">Total %</th>
                <th className="p-3.5 text-center">Final Grade</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.studentId} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-bold text-[#0B2447] block">{row.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">{row.studentId}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-800 block">{row.courseName}</span>
                    <span className="text-[10px] text-slate-400">{row.batchName}</span>
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-700">
                    {row.internalScore}/50
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-700">
                    {row.midTermScore}/50
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {row.oralProficiency}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-mono font-black text-sm text-slate-900">
                    {row.percentage}%
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="font-bold text-slate-800">{row.finalGrade}</span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        row.result === 'PASSED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {row.result === 'PASSED' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                      )}
                      <span>{row.result}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

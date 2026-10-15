// ============================================================================
// ISML COLLEGE LMS — PARENT: MARKS & GRADEBOOK (/parent/grades)
// Official DELF/CEFR Benchmark Scorecards, Oral Viva Audio Ratings,
// LSRW Radar Analysis & Faculty Remarks
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Award,
  CheckCircle2,
  FileText,
  TrendingUp,
  Sparkles,
  Download,
  AlertTriangle,
  User,
  BookOpen,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useParent } from '@/context/ParentContext';

export default function ParentGradesPage() {
  const { parent, selectedChild, selectChild, allChildren } = useParent();

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Parent Portal', href: '/parent/dashboard' },
            { label: 'Marks & DELF Gradebook' },
          ]}
        />
        {/* Child Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {allChildren.map((c) => {
            const isSelected = c.id === selectedChild.id;
            return (
              <button
                key={c.id}
                onClick={() => selectChild(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0052CC] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{c.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                  {c.lsrwRadar.overall}% Avg
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>CEFR International Language Benchmark Evaluation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
            Academic Performance: {selectedChild.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedChild.primaryCourse.courseName} • Lead Trainer: {selectedChild.primaryCourse.leadTutorName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Average</p>
            <p className="text-2xl font-black text-[#0052CC]">
              {selectedChild.lsrwRadar.overall}%
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* LSRW RADAR 4-PILLAR METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Listening (Compréhension)', score: selectedChild.lsrwRadar.listening, desc: 'Audio dialogues, metro announcements & phonetics', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Speaking (Production Orale)', score: selectedChild.lsrwRadar.speaking, desc: 'Oral viva, conversational fluency & pronunciation', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Reading (Compréhension Écrite)', score: selectedChild.lsrwRadar.reading, desc: 'Textual comprehension, articles & syntax', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
          { label: 'Writing (Production Écrite)', score: selectedChild.lsrwRadar.writing, desc: 'Essay formulation, letter writing & grammar accord', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
        ].map((pillar) => (
          <div key={pillar.label} className={`p-4 rounded-2xl border ${pillar.border} ${pillar.bg} shadow-2xs space-y-2`}>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{pillar.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${pillar.color}`}>{pillar.score}/100</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                Grade {pillar.score >= 85 ? 'A+' : pillar.score >= 75 ? 'A' : 'B+'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">{pillar.desc}</p>
          </div>
        ))}
      </div>

      {/* OFFICIAL EXAM & ASSESSMENT GRADEBOOK TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0B2447]">Term Examination & Formative Assessment Ledgers</h3>
            <p className="text-xs text-slate-500">Evaluated scorecards signed off by Academic Coordinator and Lead Tutor</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {selectedChild.gradebook.length} Assessments Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Assessment Title</th>
                <th className="py-3 px-4">Evaluation Type</th>
                <th className="py-3 px-4">Marks Obtained</th>
                <th className="py-3 px-4">Score %</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Faculty Feedback & Rubric Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedChild.gradebook.map((grd) => (
                <tr key={grd.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0B2447] whitespace-nowrap">
                    {grd.date}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {grd.assessmentTitle}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {grd.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {grd.marksObtained} / {grd.maxMarks}
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#0052CC]">
                    {grd.percentage}%
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        grd.grade.startsWith('A')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {grd.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 italic max-w-sm">
                    "{grd.tutorFeedback}"
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

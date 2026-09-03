"use client";

import React from 'react';
import { 
  BarChart3, 
  Award, 
  CheckCircle2, 
  Headphones, 
  Mic, 
  FileText, 
  PenTool, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';
import { currentStudent } from '@/mock/students';
import { mockExamResults } from '@/mock/results';

export default function ResultsPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <BarChart3 className="w-4 h-4 text-[#0052CC]" />
          <span>Academic Competency Analytics</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Results & Performance</h1>
        <p className="text-xs text-slate-600">
          Comprehensive report cards, exam scores, and LSRW 4-skill proficiency breakdown.
        </p>
      </div>

      {/* LSRW Skill Breakdown Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[#0B2447]">🎧 LSRW 4-Skill Competency Scorecard</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase">Listening (L)</span>
            <p className="text-2xl font-extrabold text-[#0052CC]">{currentStudent.lsrwScores.listening}%</p>
            <p className="text-[11px] text-slate-500 font-medium">CEFR A1 Standard Met</p>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-rose-700 uppercase">Speaking (S)</span>
            <p className="text-2xl font-extrabold text-rose-600">{currentStudent.lsrwScores.speaking}%</p>
            <p className="text-[11px] text-slate-500 font-medium">Whisper AI Evaluated</p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Reading (R)</span>
            <p className="text-2xl font-extrabold text-emerald-600">{currentStudent.lsrwScores.reading}%</p>
            <p className="text-[11px] text-slate-500 font-medium">High Accuracy</p>
          </div>

          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-purple-700 uppercase">Writing (W)</span>
            <p className="text-2xl font-extrabold text-purple-600">{currentStudent.lsrwScores.writing}%</p>
            <p className="text-[11px] text-slate-500 font-medium">Accent Keys Verified</p>
          </div>
        </div>
      </div>

      {/* Published Exam Report Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[#0B2447]">📜 Official Exam Report Cards</h2>

        {mockExamResults.map((result) => (
          <div key={result.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {result.resultStatus} • Grade {result.grade}
                </span>
                <h3 className="text-base font-bold text-[#0B2447] mt-1">{result.examTitle}</h3>
              </div>
              <p className="text-xs font-mono font-bold text-[#0052CC]">
                {result.score} / {result.maxScore} ({result.percentage}%)
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700">Section Breakdown:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {result.sectionBreakdown.map((sec, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <p className="text-slate-600 truncate">{sec.section}</p>
                    <p className="font-bold text-[#0B2447]">{sec.score} / {sec.maxScore}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600 italic pt-1">Tutor Remark: "{result.tutorNotes}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

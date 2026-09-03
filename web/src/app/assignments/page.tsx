"use client";

import React, { useState } from 'react';
import { 
  FileCheck2, 
  Clock, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  MessageSquare
} from 'lucide-react';
import { mockAssignments } from '@/mock/assignments';

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'SUBMITTED' | 'COMPLETED'>('PENDING');
  const filteredAssignments = mockAssignments.filter(a => a.status === activeTab);

  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
          <span>Academic Homework Management</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Assignments & Homework</h1>
        <p className="text-xs text-slate-600">
          Submit homework exercises, track deadlines, and view tutor question-level grades and feedback.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {['PENDING', 'SUBMITTED', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors cursor-pointer ${
              activeTab === tab 
                ? 'bg-[#0052CC] text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} Assignments
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0052CC] border border-blue-200">
                  {assignment.moduleCode}
                </span>
                <h3 className="text-base font-bold text-[#0B2447] mt-1">{assignment.title}</h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                Due: {assignment.dueDate}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{assignment.instructions}</p>

            {assignment.attachedFile && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FileText className="w-4 h-4 text-[#0052CC]" />
                  <span>{assignment.attachedFile.name} ({assignment.attachedFile.size})</span>
                </div>
                <a href="#" className="text-xs text-[#0052CC] font-bold hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
              </div>
            )}

            {/* Submission / Grade View */}
            {assignment.status === 'PENDING' && (
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2 bg-slate-50/50">
                <Upload className="w-6 h-6 text-[#0052CC] mx-auto" />
                <p className="text-xs font-bold text-slate-700">Drag & Drop Homework PDF / Voice Recording File</p>
                <button className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs">
                  Browse File & Submit Assignment
                </button>
              </div>
            )}

            {assignment.status === 'COMPLETED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Score: {assignment.scoreReceived} / {assignment.maxScore} Marks</span>
                  <span>Submitted on: {assignment.submittedDate}</span>
                </div>
                {assignment.tutorFeedback && (
                  <p className="text-xs text-emerald-800 italic">
                    Tutor Feedback: "{assignment.tutorFeedback}"
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
  MessageSquare,
  Headphones,
  Mic,
  PenTool,
  BookOpen,
  Users,
  Sparkles
} from 'lucide-react';
import { mockAssignments, HomeworkAssignment, AssignmentLsrwSkill } from '@/mock/assignments';
import { useToast } from '@/context/ToastContext';

export default function AssignmentsPage() {
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'SUBMITTED' | 'COMPLETED'>('PENDING');
  const [selectedLsrwFilter, setSelectedLsrwFilter] = useState<'ALL' | AssignmentLsrwSkill>('ALL');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const filteredAssignments = mockAssignments
    .filter(a => a.status === activeTab)
    .filter(a => selectedLsrwFilter === 'ALL' || a.lsrwSkill === selectedLsrwFilter);

  const handleSimulatedSubmit = (assignmentId: string, title: string) => {
    setSubmittingId(assignmentId);
    setTimeout(() => {
      setSubmittingId(null);
      showSuccess(`"${title}" submitted successfully for tutor evaluation!`);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
          <span>Academic Homework & LSRW Practical Portfolio</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Assignments & Homework</h1>
        <p className="text-xs text-slate-600">
          Targeted LSRW practical assignments mapped to your enrolled foreign language course and student batch cohort.
        </p>
      </div>

      {/* Tabs & LSRW Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {['PENDING', 'SUBMITTED', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-[#0052CC] text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab} Assignments
            </button>
          ))}
        </div>

        {/* LSRW Skill Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'LISTENING', 'SPEAKING', 'READING', 'WRITING'] as const).map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedLsrwFilter(skill)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedLsrwFilter === skill
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {skill === 'ALL' ? 'All Skills' : skill}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-700">No assignments found</p>
            <p className="text-xs text-slate-500 mt-0.5">You're all caught up for this skill category!</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-blue-200 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      assignment.lsrwSkill === 'LISTENING' ? 'bg-blue-100 text-blue-800' :
                      assignment.lsrwSkill === 'SPEAKING' ? 'bg-rose-100 text-rose-800' :
                      assignment.lsrwSkill === 'READING' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {assignment.lsrwSkill === 'LISTENING' && <Headphones className="w-3 h-3" />}
                      {assignment.lsrwSkill === 'SPEAKING' && <Mic className="w-3 h-3" />}
                      {assignment.lsrwSkill === 'READING' && <FileText className="w-3 h-3" />}
                      {assignment.lsrwSkill === 'WRITING' && <PenTool className="w-3 h-3" />}
                      <span>{assignment.lsrwSkill} TASK</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {assignment.subjectCode}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      {assignment.courseName}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0B2447]">{assignment.title}</h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-500" />
                    <span>Mapped Batch: <strong>{assignment.batchName}</strong></span>
                    <span>• {assignment.moduleName}</span>
                  </p>
                </div>
                <div className="text-right self-start sm:self-auto shrink-0">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                    Due: {assignment.dueDate}
                  </span>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">Max {assignment.maxScore} Marks</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                {assignment.instructions}
              </p>

              {assignment.attachedFile && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <FileText className="w-4 h-4 text-[#0052CC]" />
                    <span>{assignment.attachedFile.name} ({assignment.attachedFile.size})</span>
                  </div>
                  <button
                    onClick={() => showSuccess(`Downloading ${assignment.attachedFile?.name}...`)}
                    className="text-xs text-[#0052CC] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Materials
                  </button>
                </div>
              )}

              {/* Submission / Grade View */}
              {assignment.status === 'PENDING' && (
                <div className="p-4 border-2 border-dashed border-blue-300 rounded-xl text-center space-y-2 bg-blue-50/30">
                  <Upload className="w-6 h-6 text-[#0052CC] mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    Submit {assignment.lsrwSkill === 'SPEAKING' ? 'MP3 / WAV Audio Recording' : 'Completed Worksheet PDF / Document'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Assigned specifically to your cohort ({assignment.batchName})
                  </p>
                  <button 
                    onClick={() => handleSimulatedSubmit(assignment.id, assignment.title)}
                    disabled={submittingId === assignment.id}
                    className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {submittingId === assignment.id ? 'Uploading & Submitting...' : 'Browse File & Submit Assignment'}
                  </button>
                </div>
              )}

              {assignment.status === 'COMPLETED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Score Awarded: <strong>{assignment.scoreReceived} / {assignment.maxScore} Marks</strong>
                    </span>
                    <span>Submitted on: {assignment.submittedDate}</span>
                  </div>
                  {assignment.tutorFeedback && (
                    <div className="p-2.5 bg-white/70 rounded-lg border border-emerald-200/80 text-xs text-emerald-900">
                      <strong>Tutor Evaluation Feedback:</strong> "{assignment.tutorFeedback}"
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

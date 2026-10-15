"use client";

import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Headphones,
  Mic,
  FileText,
  PenTool,
  Layers,
  Eye,
  Volume2,
  FileCheck2,
  X,
  Download,
  CheckCircle2,
  Upload
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { mockAssignments, HomeworkAssignment, AssignmentLsrwSkill } from '@/mock/assignments';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import CreateAssignmentDrawer from '@/components/academic-manager/CreateAssignmentDrawer';

export default function AcademicManagerAssignmentsPage() {
  const { showSuccess } = useToast();
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(mockAssignments);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLsrwFilter, setSelectedLsrwFilter] = useState<'ALL' | AssignmentLsrwSkill>('ALL');
  const [viewingAssignment, setViewingAssignment] = useState<HomeworkAssignment | null>(null);

  const handleAssignmentCreated = (newAsg: HomeworkAssignment) => {
    setAssignments((prev) => [newAsg, ...prev]);
  };

  const filteredAssignments = assignments.filter((asg) => {
    if (selectedLsrwFilter !== 'ALL' && asg.lsrwSkill !== selectedLsrwFilter) return false;
    return true;
  });

  const columns: Column<HomeworkAssignment>[] = [
    {
      key: 'title',
      header: 'Assignment Task & Skill',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                row.lsrwSkill === 'LISTENING'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : row.lsrwSkill === 'SPEAKING'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : row.lsrwSkill === 'READING'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              {row.lsrwSkill === 'LISTENING' && <Headphones className="w-3 h-3" />}
              {row.lsrwSkill === 'SPEAKING' && <Mic className="w-3 h-3" />}
              {row.lsrwSkill === 'READING' && <FileText className="w-3 h-3" />}
              {row.lsrwSkill === 'WRITING' && <PenTool className="w-3 h-3" />}
              <span>{row.lsrwSkill}</span>
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded">
              {row.subjectCode}
            </span>
          </div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.title}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.moduleName}</p>
        </div>
      ),
    },
    {
      key: 'courseName',
      header: 'Course & Target Batch',
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{row.courseName}</span>
          </p>
          <p className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3 shrink-0" />
            <span>{row.batchName}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Deadline',
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {row.dueDate}
        </span>
      ),
    },
    {
      key: 'maxScore',
      header: 'Max Score',
      render: (row) => (
        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          {row.maxScore} Marks
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setViewingAssignment(row)}
          className="px-2.5 py-1 text-xs font-bold text-[#0052CC] hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Brief</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Assignments' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <span>Course Assignments & Practical Worksheets</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            LSRW mapped homework deliverables, audio recording tasks, handwriting sheets, and batch milestones.
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#0052CC] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Assignment (Full Screen)</span>
        </button>
      </div>

      {/* LSRW Skill Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['ALL', 'LISTENING', 'SPEAKING', 'READING', 'WRITING'] as const).map((skill) => (
          <button
            key={skill}
            onClick={() => setSelectedLsrwFilter(skill)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedLsrwFilter === skill
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {skill === 'ALL' ? 'All Skills' : `${skill}`}
          </button>
        ))}
      </div>

      <DataTable<HomeworkAssignment>
        data={filteredAssignments}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="title"
        searchPlaceholder="Search by assignment title, batch or course..."
        pageSize={10}
      />

      {/* FULL SCREEN ASSIGNMENT CREATOR STUDIO */}
      <CreateAssignmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAssignmentCreated={handleAssignmentCreated}
      />

      {/* RIGHT SIDE VIEW ASSIGNMENT DETAIL DRAWER */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setViewingAssignment(null)}
          />

          <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500 text-white uppercase">
                      {viewingAssignment.lsrwSkill}
                    </span>
                    <span className="font-mono text-[10px] text-blue-200">
                      {viewingAssignment.subjectCode}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-white tracking-tight mt-0.5">
                    {viewingAssignment.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setViewingAssignment(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Cohort & Deadline Info */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Target Course:</span>
                  <span className="font-bold text-slate-800">{viewingAssignment.courseName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Batch Cohort:</span>
                  <span className="font-bold text-indigo-700">{viewingAssignment.batchName}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                  <span className="text-slate-500 font-medium">Deadline:</span>
                  <span className="font-bold text-rose-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {viewingAssignment.dueDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Maximum Marks:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {viewingAssignment.maxScore} Marks
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Submission Instructions & Guidelines:
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {viewingAssignment.instructions}
                </div>
              </div>

              {/* Attached Resource File / Audio */}
              {viewingAssignment.attachedFile && (
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2">
                  <span className="text-xs font-bold text-[#0B2447] flex items-center gap-1.5">
                    {viewingAssignment.lsrwSkill === 'LISTENING' ? (
                      <Volume2 className="w-4 h-4 text-[#0052CC]" />
                    ) : (
                      <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
                    )}
                    <span>Attached Resource for Students:</span>
                  </span>

                  <div className="p-2.5 bg-white rounded-lg border border-blue-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{viewingAssignment.attachedFile.name}</p>
                      <p className="text-[10px] text-slate-500">{viewingAssignment.attachedFile.size} • Attached to Student LMS</p>
                    </div>
                    <span className="text-xs font-bold text-[#0052CC] flex items-center gap-1 cursor-pointer hover:underline">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </span>
                  </div>

                  {viewingAssignment.lsrwSkill === 'LISTENING' && (
                    <div className="p-2 bg-white rounded-lg border border-blue-200 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center shrink-0">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-700 block truncate">
                          Listening Audio Player: {viewingAssignment.attachedFile.name}
                        </span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-[#0052CC] h-full w-2/5 rounded-full" />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold shrink-0">
                        01:15 / 03:20
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
              <button
                onClick={() => setViewingAssignment(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

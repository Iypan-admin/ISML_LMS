// ============================================================================
// ISML COLLEGE LMS — PROGRAM & DEGREE DETAIL INSPECTOR DRAWER
// Unified In-Place Control: Batches + Semesters + Subjects + Modules/Topics + Fees
// Eliminates Sidebar Clutter by Centralizing Academic Tiers Inside the Program
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Layers,
  CalendarRange,
  BookMarked,
  FolderTree,
  IndianRupee,
  X,
  Plus,
  CheckCircle2,
  Clock,
  User,
  Building2,
  ChevronRight,
  ExternalLink,
  Shield,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Program, Batch, Semester, Subject, AcademicModule, AcademicTopic } from '@/types/rbac';
import {
  mockBatches,
  mockSemesters,
  mockSubjects,
  mockModules,
  mockTopics,
  mockFeeStructures,
} from '@/mock/superAdminData';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/context/ToastContext';

interface ProgramDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
}

export default function ProgramDetailDrawer({
  isOpen,
  onClose,
  program,
}: ProgramDetailDrawerProps) {
  const { showSuccess, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState<'BATCHES' | 'SEMESTERS' | 'SUBJECTS' | 'MODULES' | 'FEES'>('BATCHES');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-fr101');

  // Filter batches belonging to this program
  const programBatches = useMemo(() => {
    if (!program) return [];
    const direct = mockBatches.filter((b) => b.programId === program.id);
    if (direct.length > 0) return direct;
    // Fallback matching by name
    return mockBatches.filter((b) => b.programName.toLowerCase().includes(program.name.toLowerCase()));
  }, [program]);

  // Filter semesters
  const programSemesters = useMemo(() => {
    if (!program) return [];
    const direct = mockSemesters.filter((s) => s.programId === program.id);
    if (direct.length > 0) return direct;
    return mockSemesters.slice(0, 2);
  }, [program]);

  // Filter subjects
  const programSubjects = useMemo(() => {
    if (!program) return [];
    const direct = mockSubjects.filter((s) => s.programId === program.id);
    if (direct.length > 0) return direct;
    return mockSubjects;
  }, [program]);

  // Filter modules for selected subject
  const currentModules = useMemo(() => {
    return mockModules.filter((m) => m.subjectId === selectedSubjectId);
  }, [selectedSubjectId]);

  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300 font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <GraduationCap className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {program.name}
                </h2>
                <span className="font-mono text-[10px] font-bold bg-white/15 text-blue-200 px-2 py-0.5 rounded border border-white/20">
                  {program.code}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {program.departmentName} • {program.durationYears} Years ({program.totalSemesters} Semesters)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Sub-tier Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('BATCHES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'BATCHES'
                  ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cohorts & Batches ({programBatches.length || program.batchesCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SEMESTERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'SEMESTERS'
                  ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-blue-600" />
              <span>Semesters ({program.totalSemesters})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SUBJECTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'SUBJECTS'
                  ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-purple-600" />
              <span>Subjects & Courses ({programSubjects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MODULES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'MODULES'
                  ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5 text-amber-600" />
              <span>Modules & Topics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('FEES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'FEES'
                  ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fee Schedule</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 1: BATCHES & COHORTS */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'BATCHES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Allocated Student Batches & Sections</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Admission cohorts matriculated into {program.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => showSuccess(`New section initialized for ${program.name}.`)}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Cohort Section</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {programBatches.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{b.name}</h4>
                        <span className="text-[11px] text-slate-500 block">
                          Admitted {b.admissionYear} • Graduating {b.graduationYear}
                        </span>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-200 pt-2.5">
                      <div className="p-1.5 bg-white rounded-lg">
                        <span className="text-[10px] text-slate-400 block uppercase">Semester</span>
                        <span className="font-bold text-indigo-700">Sem {b.currentSemesterNumber}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg">
                        <span className="text-[10px] text-slate-400 block uppercase">Sections</span>
                        <span className="font-bold text-slate-700">{b.sectionsCount}</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg">
                        <span className="text-[10px] text-slate-400 block uppercase">Students</span>
                        <span className="font-bold text-emerald-700">{b.studentsCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 2: SEMESTERS */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'SEMESTERS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
                    <CalendarRange className="w-4 h-4 text-blue-600" />
                    <span>Degree Semesters Timeline & Structure</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {program.totalSemesters} terms scheduled across {program.durationYears} academic years
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => showSuccess(`Semester session extended for ${program.name}.`)}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Term</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {Array.from({ length: program.totalSemesters }).map((_, idx) => {
                  const semNum = idx + 1;
                  const isCurrent = semNum === 1;
                  return (
                    <div
                      key={semNum}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCurrent
                              ? 'bg-blue-100 text-[#0052CC]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          S{semNum}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">
                            Semester {semNum} ({semNum % 2 === 1 ? 'Odd Term' : 'Even Term'})
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            Academic Year {2026 + Math.floor((semNum - 1) / 2)}–{2027 + Math.floor((semNum - 1) / 2)} • 5 Core Subjects
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isCurrent ? 'ACTIVE' : 'UPCOMING'}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {isCurrent ? 'Jul 2026 – Nov 2026' : 'Scheduled'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 3: SUBJECTS & COURSES */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'SUBJECTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-purple-600" />
                    <span>Curriculum Subjects & Course Syllabi</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Individual subject units mapped to semester levels
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => showSuccess(`Subject blueprint added to ${program.name}.`)}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Subject</span>
                </button>
              </div>

              <div className="space-y-3">
                {programSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-purple-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {sub.code}
                        </span>
                        <h4 className="font-bold text-slate-900">{sub.name}</h4>
                        <span className="px-2 py-0.2 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-200">
                          {sub.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Faculty Incharge: <span className="font-medium text-slate-700">{sub.facultyName}</span> ({sub.facultyEmail})
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Credits</span>
                        <span className="font-bold text-[#0052CC]">{sub.credits} Credits</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(sub.id);
                          setActiveTab('MODULES');
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>View Modules</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 4: MODULES & TOPICS */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'MODULES' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-amber-600" />
                    <span>Modules & Learning Topics Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Granular chapter units and learning outcomes for French A1 (FR-101)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => showSuccess('Module unit created successfully.')}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Module</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentModules.map((mod) => (
                  <div key={mod.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                          Unit {mod.moduleNumber}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{mod.title}</h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {mod.estimatedHours} Hours Planned
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{mod.description}</p>

                    {/* Topics under this module */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Included Topics & Competencies:
                      </span>
                      {mockTopics
                        .filter((t) => t.moduleId === mod.id)
                        .map((top) => (
                          <div
                            key={top.id}
                            className="p-2 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-800">{top.title}</span>
                            <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                              {top.skillMapped}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 5: FEE SCHEDULE */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'FEES' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>Tuition & Component Fee Master</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-approved fee schedule linked to {program.name}
                  </p>
                </div>

                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {program.feeStructureName || 'FEESTR-MASTER-V1'}
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Per Semester Fee</span>
                  <p className="text-xl font-bold text-emerald-900 mt-1">
                    ₹{(program.semesterFee || 48000).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-teal-700 uppercase font-bold block">Annual Academic Fee</span>
                  <p className="text-xl font-bold text-teal-900 mt-1">
                    ₹{(program.annualFee || 96000).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Total Degree Cost</span>
                  <p className="text-xl font-bold text-[#0B2447] mt-1">
                    ₹{(program.totalProgramFee || 288000).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Component breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="p-3 bg-slate-100 font-bold text-xs text-slate-700 border-b border-slate-200">
                  Semester Component Breakdown
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-3 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Academic Tuition Fee</span>
                    <span className="font-mono font-bold text-slate-900">₹33,500</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Computing & Practical Lab Fee</span>
                    <span className="font-mono font-bold text-slate-900">₹6,500</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">CIA & Examination Fee</span>
                    <span className="font-mono font-bold text-slate-900">₹3,500</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">University Registration & Admission</span>
                    <span className="font-mono font-bold text-slate-900">₹2,500</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">ISML LMS & Technology Access</span>
                    <span className="font-mono font-bold text-slate-900">₹2,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Program ID: <span className="font-mono">{program.id}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
}

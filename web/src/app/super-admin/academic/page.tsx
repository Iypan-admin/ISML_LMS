// ============================================================================
// ISML COLLEGE LMS — ACADEMIC STRUCTURE HIERARCHY EXPLORER
// College → Department → Program → Batch → Semester → Subject → Module → Topic
// Left: Interactive Hierarchy Navigation Tree • Right: Selected Entity Inspector
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Network,
  GraduationCap,
  Layers,
  CalendarRange,
  BookMarked,
  FolderTree,
  ListTree,
  ChevronRight,
  ChevronDown,
  Eye,
  Plus,
  ExternalLink,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatusBadge from '@/components/common/StatusBadge';
import {
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches,
  mockSemesters,
  mockSubjects,
  mockModules,
  mockTopics,
} from '@/mock/superAdminData';
import { Program, Batch } from '@/types/rbac';
import CreateProgramDrawer from '@/components/super-admin/academic/CreateProgramDrawer';
import { useToast } from '@/context/ToastContext';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

type EntityType = 'COLLEGE' | 'DEPARTMENT' | 'PROGRAM' | 'BATCH' | 'SEMESTER' | 'SUBJECT' | 'MODULE' | 'TOPIC';

interface SelectedEntity {
  type: EntityType;
  id: string;
  title: string;
  subtitle: string;
  code?: string;
  details: Record<string, string | number>;
  actionsLink?: string;
}

export default function AcademicStructurePage() {
  const { selectedCollege, selectedCollegeId, isOverall } = useCollege();
  const college = selectedCollege || mockInstitutions[0];
  const { showSuccess } = useToast();
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);

  // Departments scoped by active college or overall
  const displayDepartments = isOverall
    ? mockDepartments
    : mockDepartments.filter((d) => !d.institutionId || d.institutionId === selectedCollegeId);

  const handleProgramCreated = (newProgram: Program, newBatches: Batch[]) => {
    mockPrograms.unshift(newProgram);
    newBatches.forEach((b) => mockBatches.unshift(b));
    showSuccess(`Program "${newProgram.name}" and batches linked into hierarchy tree.`);
  };

  // Tree expansion state
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({
    'dept-cs': true,
    'dept-fl': true,
  });
  const [expandedProgs, setExpandedProgs] = useState<Record<string, boolean>>({
    'prog-bsc-cs': true,
  });
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({
    'batch-2026-cs': true,
  });
  const [expandedSubjs, setExpandedSubjs] = useState<Record<string, boolean>>({
    'subj-fr101': true,
  });
  const [expandedMods, setExpandedMods] = useState<Record<string, boolean>>({
    'mod-fr-01': true,
  });

  // Selected inspector state
  const [selected, setSelected] = useState<SelectedEntity>({
    type: 'DEPARTMENT',
    id: mockDepartments[0].id,
    title: mockDepartments[0].name,
    subtitle: `HOD: ${mockDepartments[0].hodName}`,
    code: mockDepartments[0].code,
    details: {
      'HOD Email': mockDepartments[0].hodEmail,
      'Active Programs': mockDepartments[0].programsCount,
      'Total Faculty': mockDepartments[0].facultyCount,
      'Enrolled Students': mockDepartments[0].studentsCount,
      Status: mockDepartments[0].status,
    },
    actionsLink: '/super-admin/academic/departments',
  });

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic' }, { label: 'Academic Structure Tree' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Academic Structure Hierarchy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full College academic lineage: Department → Program → Batch → Semester → Subject → Module → Topic
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/super-admin/academic/departments"
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-2xs"
          >
            Manage Departments
          </Link>
          <Link
            href="/super-admin/academic/programs"
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-2xs"
          >
            Programs & Fees
          </Link>
          <button
            onClick={() => setIsCreateProgramOpen(true)}
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Program</span>
          </button>
        </div>
      </div>

      {/* ─── Two-Column Interactive Explorer ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 Cols): Hierarchy Navigation Tree */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              College Curriculum Lineage
            </span>
            <span className="text-[11px] text-[#0052CC] font-semibold">
              Select node to inspect details
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Root: College Node */}
            <div
              onClick={() =>
                setSelected({
                  type: 'COLLEGE',
                  id: isOverall ? 'ALL' : college.id,
                  title: isOverall ? 'Overall (All Campuses)' : college.name,
                  subtitle: isOverall ? 'Central Multi-Institution Scope' : college.affiliation,
                  code: isOverall ? 'ALL-CAMPUSES' : college.code,
                  details: {
                    Type: isOverall ? 'Multi-Tenant Network' : college.type,
                    Affiliation: isOverall ? 'Central Education Board' : college.affiliation,
                    Address: isOverall ? 'Central Headquarters' : college.address,
                    Students: isOverall ? '12,450 Total' : college.studentsCount,
                    Faculty: isOverall ? '840 Total' : college.facultyCount,
                  },
                  actionsLink: '/super-admin/institutions',
                })
              }
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selected.type === 'COLLEGE'
                  ? 'bg-blue-50/70 border-[#0052CC] shadow-2xs font-bold text-[#0052CC]'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-[#0B2447]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-4 h-4 text-[#0052CC] shrink-0" />
                <span className="truncate">{isOverall ? '🏛️ Overall (All Campuses)' : college.name}</span>
              </div>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                {isOverall ? 'ALL' : college.code}
              </span>
            </div>

            {/* Departments */}
            <div className="pl-4 space-y-2 border-l-2 border-slate-100 ml-3">
              {displayDepartments.map((dept) => {
                const isDeptOpen = expandedDepts[dept.id];
                const deptProgs = mockPrograms.filter((p) => p.departmentId === dept.id);

                return (
                  <div key={dept.id} className="space-y-1">
                    <div
                      className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        selected.id === dept.id
                          ? 'bg-blue-50/70 border-[#0052CC] text-[#0052CC] font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                      onClick={() =>
                        setSelected({
                          type: 'DEPARTMENT',
                          id: dept.id,
                          title: dept.name,
                          subtitle: `HOD: ${dept.hodName}`,
                          code: dept.code,
                          details: {
                            'HOD Email': dept.hodEmail,
                            'Active Programs': dept.programsCount,
                            'Total Faculty': dept.facultyCount,
                            'Enrolled Students': dept.studentsCount,
                            Status: dept.status,
                          },
                          actionsLink: '/super-admin/academic/departments',
                        })
                      }
                    >
                      <div className="flex items-center gap-2 truncate">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDepts((prev) => ({ ...prev, [dept.id]: !prev[dept.id] }));
                          }}
                          className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                        >
                          {isDeptOpen ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <Network className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{dept.name}</span>
                      </div>
                      <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {dept.code}
                      </span>
                    </div>

                    {/* Programs under Department */}
                    {isDeptOpen && (
                      <div className="pl-4 space-y-1.5 border-l-2 border-indigo-100 ml-3">
                        {deptProgs.map((prog) => {
                          const isProgOpen = expandedProgs[prog.id];
                          const progBatches = mockBatches.filter((b) => b.programId === prog.id);

                          return (
                            <div key={prog.id} className="space-y-1">
                              <div
                                className={`p-1.5 px-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                                  selected.id === prog.id
                                    ? 'bg-blue-50 border-[#0052CC] text-[#0052CC] font-bold'
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                }`}
                                onClick={() =>
                                  setSelected({
                                    type: 'PROGRAM',
                                    id: prog.id,
                                    title: prog.name,
                                    subtitle: `Degree: ${prog.degreeType} • ${prog.durationYears} Years`,
                                    code: prog.code,
                                    details: {
                                      'Degree Type': prog.degreeType,
                                      'Duration (Years)': prog.durationYears,
                                      'Total Semesters': prog.totalSemesters,
                                      'Active Batches': prog.batchesCount,
                                      'Enrolled Students': prog.studentsCount,
                                      Status: prog.status,
                                    },
                                    actionsLink: '/super-admin/academic/programs',
                                  })
                                }
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedProgs((prev) => ({
                                        ...prev,
                                        [prog.id]: !prev[prog.id],
                                      }));
                                    }}
                                    className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                                  >
                                    {isProgOpen ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </button>
                                  <GraduationCap className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                  <span className="truncate">{prog.name}</span>
                                </div>
                                <span className="font-mono text-[9px] text-slate-500">
                                  {prog.code}
                                </span>
                              </div>

                              {/* Batches under Program */}
                              {isProgOpen && (
                                <div className="pl-4 space-y-1 border-l-2 border-cyan-100 ml-3">
                                  {progBatches.map((batch) => {
                                    const isBatchOpen = expandedBatches[batch.id];

                                    return (
                                      <div key={batch.id} className="space-y-1">
                                        <div
                                          className={`p-1.5 px-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                                            selected.id === batch.id
                                              ? 'bg-blue-50 border-[#0052CC] text-[#0052CC] font-bold'
                                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                          }`}
                                          onClick={() =>
                                            setSelected({
                                              type: 'BATCH',
                                              id: batch.id,
                                              title: batch.name,
                                              subtitle: `Cohort: ${batch.admissionYear}–${batch.graduationYear}`,
                                              details: {
                                                'Current Semester': `Semester ${batch.currentSemesterNumber}`,
                                                'Admission Year': batch.admissionYear,
                                                'Graduation Year': batch.graduationYear,
                                                Sections: batch.sectionsCount,
                                                'Students Count': batch.studentsCount,
                                                Status: batch.status,
                                              },
                                              actionsLink: '/super-admin/academic/batches',
                                            })
                                          }
                                        >
                                          <div className="flex items-center gap-1.5 truncate">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedBatches((prev) => ({
                                                  ...prev,
                                                  [batch.id]: !prev[batch.id],
                                                }));
                                              }}
                                              className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                                            >
                                              {isBatchOpen ? (
                                                <ChevronDown className="w-3 h-3" />
                                              ) : (
                                                <ChevronRight className="w-3 h-3" />
                                              )}
                                            </button>
                                            <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                            <span className="truncate">{batch.name}</span>
                                          </div>
                                          <span className="text-[10px] text-slate-500">
                                            Sem {batch.currentSemesterNumber}
                                          </span>
                                        </div>

                                        {/* Subjects & Modules Drilldown */}
                                        {isBatchOpen && (
                                          <div className="pl-4 space-y-1 border-l-2 border-amber-100 ml-3">
                                            {mockSubjects.slice(0, 2).map((subj) => {
                                              const isSubjOpen = expandedSubjs[subj.id];
                                              const subjMods = mockModules.filter(
                                                (m) => m.subjectId === subj.id
                                              );

                                              return (
                                                <div key={subj.id} className="space-y-1">
                                                  <div
                                                    className={`p-1.5 px-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                                                      selected.id === subj.id
                                                        ? 'bg-blue-50 border-[#0052CC] text-[#0052CC] font-bold'
                                                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                                    }`}
                                                    onClick={() =>
                                                      setSelected({
                                                        type: 'SUBJECT',
                                                        id: subj.id,
                                                        title: subj.name,
                                                        subtitle: `Faculty: ${subj.facultyName}`,
                                                        code: subj.code,
                                                        details: {
                                                          Code: subj.code,
                                                          Credits: subj.credits,
                                                          Type: subj.type,
                                                          'Assigned Faculty': subj.facultyName,
                                                          'Faculty Email': subj.facultyEmail,
                                                          Modules: subj.modulesCount,
                                                        },
                                                        actionsLink: '/super-admin/academic/subjects',
                                                      })
                                                    }
                                                  >
                                                    <div className="flex items-center gap-1.5 truncate">
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setExpandedSubjs((prev) => ({
                                                            ...prev,
                                                            [subj.id]: !prev[subj.id],
                                                          }));
                                                        }}
                                                        className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                                                      >
                                                        {isSubjOpen ? (
                                                          <ChevronDown className="w-3 h-3" />
                                                        ) : (
                                                          <ChevronRight className="w-3 h-3" />
                                                        )}
                                                      </button>
                                                      <BookMarked className="w-3 h-3 text-[#0052CC] shrink-0" />
                                                      <span className="truncate">{subj.name}</span>
                                                    </div>
                                                    <span className="font-mono text-[9px] text-slate-400">
                                                      {subj.code}
                                                    </span>
                                                  </div>

                                                  {/* Modules under Subject */}
                                                  {isSubjOpen && (
                                                    <div className="pl-4 space-y-1 border-l-2 border-blue-100 ml-3">
                                                      {subjMods.map((mod) => {
                                                        const isModOpen = expandedMods[mod.id];
                                                        const modTopics = mockTopics.filter(
                                                          (t) => t.moduleId === mod.id
                                                        );

                                                        return (
                                                          <div key={mod.id} className="space-y-1">
                                                            <div
                                                              className={`p-1 px-2 rounded border flex items-center justify-between cursor-pointer transition-all ${
                                                                selected.id === mod.id
                                                                  ? 'bg-blue-50 border-[#0052CC] text-[#0052CC] font-bold'
                                                                  : 'bg-white border-slate-200 text-slate-600'
                                                              }`}
                                                              onClick={() =>
                                                                setSelected({
                                                                  type: 'MODULE',
                                                                  id: mod.id,
                                                                  title: mod.title,
                                                                  subtitle: mod.description,
                                                                  details: {
                                                                    'Module Number': mod.moduleNumber,
                                                                    'Estimated Hours': `${mod.estimatedHours} hrs`,
                                                                    'Topics Count': mod.topicsCount,
                                                                    Status: mod.status,
                                                                  },
                                                                  actionsLink: '/super-admin/academic/modules',
                                                                })
                                                              }
                                                            >
                                                              <div className="flex items-center gap-1.5 truncate">
                                                                <button
                                                                  type="button"
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedMods((prev) => ({
                                                                      ...prev,
                                                                      [mod.id]: !prev[mod.id],
                                                                    }));
                                                                  }}
                                                                  className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
                                                                >
                                                                  {isModOpen ? (
                                                                    <ChevronDown className="w-3 h-3" />
                                                                  ) : (
                                                                    <ChevronRight className="w-3 h-3" />
                                                                  )}
                                                                </button>
                                                                <FolderTree className="w-3 h-3 text-emerald-600 shrink-0" />
                                                                <span className="truncate">
                                                                  {mod.title}
                                                                </span>
                                                              </div>
                                                              <span className="text-[9px] text-slate-400">
                                                                {mod.estimatedHours}h
                                                              </span>
                                                            </div>

                                                            {/* Topics under Module */}
                                                            {isModOpen && (
                                                              <div className="pl-4 space-y-0.5 border-l-2 border-emerald-100 ml-3">
                                                                {modTopics.map((top) => (
                                                                  <div
                                                                    key={top.id}
                                                                    className={`p-1 px-2 rounded border flex items-center justify-between cursor-pointer text-[11px] ${
                                                                      selected.id === top.id
                                                                        ? 'bg-blue-50 border-[#0052CC] text-[#0052CC] font-bold'
                                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                                    }`}
                                                                    onClick={() =>
                                                                      setSelected({
                                                                        type: 'TOPIC',
                                                                        id: top.id,
                                                                        title: top.title,
                                                                        subtitle: top.learningObjective,
                                                                        details: {
                                                                          'Topic Number': top.topicNumber,
                                                                          'Learning Objective': top.learningObjective,
                                                                          'Mapped Skill': top.skillMapped,
                                                                          'Resources Count': top.resourcesCount,
                                                                          Status: top.status,
                                                                        },
                                                                        actionsLink: '/super-admin/academic/topics',
                                                                      })
                                                                    }
                                                                  >
                                                                    <div className="flex items-center gap-1.5 truncate">
                                                                      <ListTree className="w-3 h-3 text-purple-600 shrink-0" />
                                                                      <span className="truncate">
                                                                        {top.title}
                                                                      </span>
                                                                    </div>
                                                                    <span className="text-[9px] text-slate-400">
                                                                      {top.resourcesCount} res
                                                                    </span>
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Selected Entity Inspector Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col justify-between font-sans">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-extrabold text-[10px] uppercase px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] border border-blue-200">
                {selected.type} INSPECTOR
              </span>
              {selected.code && (
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {selected.code}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#0B2447] leading-snug">
                {selected.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selected.subtitle}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Entity Metadata
              </p>
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {Object.entries(selected.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{k}:</span>
                    <span className="font-bold text-[#0B2447] truncate max-w-[200px]">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100">
            {selected.actionsLink && (
              <Link
                href={selected.actionsLink}
                className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
              >
                <span>Open Dedicated {selected.type} Management</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <CreateProgramDrawer
        isOpen={isCreateProgramOpen}
        onClose={() => setIsCreateProgramOpen(false)}
        onProgramCreated={handleProgramCreated}
      />
    </div>
  );
}

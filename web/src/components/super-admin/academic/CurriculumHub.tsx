// ============================================================================
// ISML COLLEGE LMS — UNIFIED CURRICULUM & SYLLABUS HUB
// Subjects, Chapters (Modules) & Topics — Filtered & Mapped by Teaching Course
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  FolderTree,
  ListTree,
  Plus,
  Edit2,
  Trash2,
  BookMarked,
  Filter,
  Layers,
  GraduationCap,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Clock,
  Award,
  ChevronLeft,
  Palette,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { Subject, AcademicLevel, AcademicModule, AcademicTopic } from '@/types/rbac';
import {
  mockSubjects,
  mockLevels,
  mockModules,
  mockTopics,
  mockCourses,
  mockPrograms,
  mockDepartments,
} from '@/mock/superAdminData';
import CreateSubjectDrawer from '@/components/super-admin/academic/CreateSubjectDrawer';
import CreateLevelDrawer from '@/components/super-admin/academic/CreateLevelDrawer';
import CreateModuleDrawer from '@/components/super-admin/academic/CreateModuleDrawer';
import CreateTopicDrawer from '@/components/super-admin/academic/CreateTopicDrawer';
import TopicResourceManagerDrawer from '@/components/super-admin/academic/TopicResourceManagerDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

type ActiveTab = 'subjects' | 'levels' | 'modules' | 'topics';
type ViewMode = 'cards' | 'table';

interface CurriculumHubProps {
  portalRole?: 'super-admin' | 'academic-manager';
}

export default function CurriculumHub({ portalRole = 'super-admin' }: CurriculumHubProps) {
  const router = useRouter();
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const isSuperAdmin = portalRole === 'super-admin';

  // View presentation mode: 'cards' (drilldown cards) or 'table' (flat table view)
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Active Tab state: Subjects, Levels (Tracks), Modules (Chapters), or Topics
  const [activeTab, setActiveTab] = useState<ActiveTab>('subjects');

  // Selected Course filter: 'ALL' or specific course id
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');

  // Drilldown hierarchy states: Subject -> Level -> Unit/Chapter (Module) -> Topic
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('ALL');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('ALL');

  // Entities state
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [levels, setLevels] = useState<AcademicLevel[]>(mockLevels);
  const [modules, setModules] = useState<AcademicModule[]>(mockModules);
  const [topics, setTopics] = useState<AcademicTopic[]>(mockTopics);

  // Drawers state
  const [isSubjectDrawerOpen, setIsSubjectDrawerOpen] = useState(false);
  const [isLevelDrawerOpen, setIsLevelDrawerOpen] = useState(false);
  const [isModuleDrawerOpen, setIsModuleDrawerOpen] = useState(false);
  const [isTopicDrawerOpen, setIsTopicDrawerOpen] = useState(false);
  const [resourceDrawerTopic, setResourceDrawerTopic] = useState<AcademicTopic | null>(null);

  // Edit states
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [editLevel, setEditLevel] = useState<AcademicLevel | null>(null);
  const [editModule, setEditModule] = useState<AcademicModule | null>(null);
  const [editTopic, setEditTopic] = useState<AcademicTopic | null>(null);

  // Delete states
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);
  const [deleteLevel, setDeleteLevel] = useState<AcademicLevel | null>(null);
  const [deleteModule, setDeleteModule] = useState<AcademicModule | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<AcademicTopic | null>(null);

  // Filtered lists based on Selected Course and College
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      // If super-admin selected a specific college, filter by that college or course's college
      if (portalRole === 'super-admin' && !isOverall) {
        const crs = mockCourses.find((c) => c.id === s.courseId);
        if (crs?.collegeId && crs.collegeId !== selectedCollegeId) {
          const prog = mockPrograms.find((p) => p.id === s.programId);
          const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
          if (dept?.institutionId && dept.institutionId !== selectedCollegeId) return false;
        }
      }
      // Course filtering
      if (selectedCourseFilter !== 'ALL') {
        const assignedCourseId = s.courseId || mockCourses[0]?.id;
        if (assignedCourseId !== selectedCourseFilter) return false;
      }
      return true;
    });
  }, [subjects, portalRole, isOverall, selectedCollegeId, selectedCourseFilter]);

  // Filtered levels based on Selected Subject
  const filteredLevels = useMemo(() => {
    return levels.filter((lvl) => {
      if (selectedSubjectId !== 'ALL' && lvl.subjectId !== selectedSubjectId) return false;
      return true;
    });
  }, [levels, selectedSubjectId]);

  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      if (portalRole === 'super-admin' && !isOverall) {
        const sub = subjects.find((s) => s.id === m.subjectId);
        const crs = mockCourses.find((c) => c.id === sub?.courseId || c.id === m.courseId);
        if (crs?.collegeId && crs.collegeId !== selectedCollegeId) {
          const prog = mockPrograms.find((p) => p.id === sub?.programId);
          const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
          if (dept?.institutionId && dept.institutionId !== selectedCollegeId) return false;
        }
      }
      if (selectedCourseFilter !== 'ALL') {
        const sub = subjects.find((s) => s.id === m.subjectId);
        const assignedCourseId = m.courseId || sub?.courseId || mockCourses[0]?.id;
        if (assignedCourseId !== selectedCourseFilter) return false;
      }
      // Subject Drilldown Filter
      if (selectedSubjectId !== 'ALL') {
        if (m.subjectId !== selectedSubjectId) return false;
      }
      // Level Drilldown Filter
      if (selectedLevelId !== 'ALL') {
        if (m.levelId && m.levelId !== selectedLevelId) return false;
      }
      return true;
    });
  }, [modules, subjects, portalRole, isOverall, selectedCollegeId, selectedCourseFilter, selectedSubjectId, selectedLevelId]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (portalRole === 'super-admin' && !isOverall) {
        const mod = modules.find((m) => m.id === t.moduleId);
        const sub = subjects.find((s) => s.id === mod?.subjectId);
        const crs = mockCourses.find((c) => c.id === sub?.courseId || c.id === t.courseId);
        if (crs?.collegeId && crs.collegeId !== selectedCollegeId) {
          const prog = mockPrograms.find((p) => p.id === sub?.programId);
          const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
          if (dept?.institutionId && dept.institutionId !== selectedCollegeId) return false;
        }
      }
      if (selectedCourseFilter !== 'ALL') {
        const mod = modules.find((m) => m.id === t.moduleId);
        const sub = subjects.find((s) => s.id === mod?.subjectId);
        const assignedCourseId = t.courseId || sub?.courseId || mockCourses[0]?.id;
        if (assignedCourseId !== selectedCourseFilter) return false;
      }
      // Subject Drilldown Filter for Topics
      if (selectedSubjectId !== 'ALL') {
        const mod = modules.find((m) => m.id === t.moduleId);
        if (mod && mod.subjectId !== selectedSubjectId) return false;
      }
      // Module / Chapter Drilldown Filter for Topics
      if (selectedModuleId !== 'ALL') {
        if (t.moduleId !== selectedModuleId) return false;
      }
      return true;
    });
  }, [topics, modules, subjects, portalRole, isOverall, selectedCollegeId, selectedCourseFilter, selectedSubjectId, selectedModuleId]);

  // Active course item info
  const activeCourse = useMemo(() => {
    if (selectedCourseFilter === 'ALL') return null;
    return mockCourses.find((c) => c.id === selectedCourseFilter) || null;
  }, [selectedCourseFilter]);

  // Handlers for Subject
  const handleSubjectCreated = (newSubject: Subject) => {
    setSubjects((prev) => [newSubject, ...prev]);
  };
  const handleSubjectUpdated = (updatedSubject: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)));
  };
  const handleSubjectDeleted = () => {
    if (!deleteSubject) return;
    setSubjects((prev) => prev.filter((s) => s.id !== deleteSubject.id));
    showSuccess(`Subject "${deleteSubject.name}" (${deleteSubject.code}) removed successfully.`);
    setDeleteSubject(null);
  };

  // Handlers for Level
  const handleLevelCreated = (newLevel: AcademicLevel) => {
    setLevels((prev) => [newLevel, ...prev]);
  };
  const handleLevelUpdated = (updatedLevel: AcademicLevel) => {
    setLevels((prev) => prev.map((l) => (l.id === updatedLevel.id ? updatedLevel : l)));
  };
  const handleLevelDeleted = () => {
    if (!deleteLevel) return;
    setLevels((prev) => prev.filter((l) => l.id !== deleteLevel.id));
    showSuccess(`Level "${deleteLevel.name}" (${deleteLevel.levelCode}) removed successfully.`);
    setDeleteLevel(null);
  };

  // Handlers for Module
  const handleModuleCreated = (newMod: AcademicModule) => {
    setModules((prev) => [newMod, ...prev]);
  };
  const handleModuleUpdated = (updatedMod: AcademicModule) => {
    setModules((prev) => prev.map((m) => (m.id === updatedMod.id ? updatedMod : m)));
  };
  const handleModuleDeleted = () => {
    if (!deleteModule) return;
    setModules((prev) => prev.filter((m) => m.id !== deleteModule.id));
    showSuccess(`Module "${deleteModule.title}" removed successfully.`);
    setDeleteModule(null);
  };

  // Handlers for Topic
  const handleTopicCreated = (newTopic: AcademicTopic) => {
    setTopics((prev) => [newTopic, ...prev]);
  };
  const handleTopicUpdated = (updatedTopic: AcademicTopic) => {
    setTopics((prev) => prev.map((t) => (t.id === updatedTopic.id ? updatedTopic : t)));
  };
  const handleTopicDeleted = () => {
    if (!deleteTopic) return;
    setTopics((prev) => prev.filter((t) => t.id !== deleteTopic.id));
    showSuccess(`Topic "${deleteTopic.title}" removed successfully.`);
    setDeleteTopic(null);
  };

  // Columns for Subjects
  const subjectColumns: Column<Subject>[] = [
    {
      key: 'name',
      header: 'Subject & Course Mapping',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" />
              {row.courseName || mockCourses.find((c) => c.id === row.courseId)?.name || 'French A1 Intensive Certification Program'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {row.programName} (Term {row.semesterNumber})
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Subject Type',
      sortable: true,
      render: (row) => (
        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.type}
        </span>
      ),
    },
    {
      key: 'facultyName',
      header: 'Assigned Faculty',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{row.facultyName}</p>
          <p className="text-[10px] text-slate-400">{row.facultyEmail}</p>
        </div>
      ),
    },
    {
      key: 'modulesCount',
      header: 'Modules / Chapters',
      render: (row) => {
        const subMods = modules.filter(m => m.subjectId === row.id);
        const count = subMods.length || row.modulesCount || 0;
        return (
          <button
            type="button"
            onClick={() => {
              setSelectedSubjectId(row.id);
              setSelectedModuleId('ALL');
              setActiveTab('modules');
            }}
            className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50/70 hover:bg-blue-100/90 rounded-lg border border-blue-200 transition cursor-pointer"
            title="Drill down to view and manage chapters in this subject"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>{count} Chapters</span>
            <ArrowRight className="w-3 h-3 text-blue-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedSubjectId(row.id);
              setSelectedModuleId('ALL');
              setActiveTab('modules');
            }}
            className="px-2.5 py-1 text-[11px] font-bold text-[#0052CC] bg-blue-50/70 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="View Units / Chapters for this Subject"
          >
            <Layers className="w-3 h-3" />
            <span>{isSuperAdmin ? 'View Chapters' : 'Manage Chapters'}</span>
          </button>
          {(row.status === 'DRAFT' || row.status === 'PENDING_APPROVAL') && (
            <button
              onClick={() => {
                setSubjects((prev) =>
                  prev.map((s) => (s.id === row.id ? { ...s, status: 'PUBLISHED' } : s))
                );
                showSuccess(`Subject "${row.name}" (${row.code}) verified & approved!`);
              }}
              className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Verify & Approve Subject"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Verify & Approve</span>
            </button>
          )}
          {!isSuperAdmin && (
            <>
              <button
                onClick={() => {
                  setEditSubject(row);
                  setIsSubjectDrawerOpen(true);
                }}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Subject"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteSubject(row)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Subject"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Columns for Modules (Chapters)
  const moduleColumns: Column<AcademicModule>[] = [
    {
      key: 'title',
      header: 'Chapter / Module & Description',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              Unit {row.moduleNumber}
            </span>
            <p className="font-bold text-[#0B2447] text-xs">{row.title}</p>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.description}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
              {row.courseName || mockCourses.find((c) => c.id === row.courseId)?.name || 'French A1 Intensive Certification Program'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'subjectName',
      header: 'Parent Subject',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedSubjectId(row.subjectId);
            setActiveTab('subjects');
          }}
          className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-left transition cursor-pointer hover:border-blue-300"
          title="Filter to this subject"
        >
          {row.subjectName}
        </button>
      ),
    },
    {
      key: 'estimatedHours',
      header: 'Hours',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 w-fit">
          <Clock className="w-3 h-3" />
          {row.estimatedHours}h
        </span>
      ),
    },
    {
      key: 'topicsCount',
      header: 'Micro-Topics',
      render: (row) => {
        const modTopics = topics.filter(t => t.moduleId === row.id);
        const count = modTopics.length || row.topicsCount || 0;
        return (
          <button
            type="button"
            onClick={() => {
              if (row.subjectId) setSelectedSubjectId(row.subjectId);
              setSelectedModuleId(row.id);
              setActiveTab('topics');
            }}
            className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50/70 hover:bg-purple-100/90 rounded-lg border border-purple-200 transition cursor-pointer"
            title="Drill down to view and manage lesson topics in this chapter"
          >
            <ListTree className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
            <span>{count} Topics</span>
            <ArrowRight className="w-3 h-3 text-purple-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              if (row.subjectId) setSelectedSubjectId(row.subjectId);
              setSelectedModuleId(row.id);
              setActiveTab('topics');
            }}
            className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="View Topics & Content in this Unit"
          >
            <ListTree className="w-3 h-3" />
            <span>{isSuperAdmin ? 'View Topics' : 'Manage Topics'}</span>
          </button>
          {!isSuperAdmin && (
            <>
              <button
                onClick={() => {
                  setEditModule(row);
                  setIsModuleDrawerOpen(true);
                }}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Chapter / Module"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteModule(row)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Chapter"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Columns for Topics
  const topicColumns: Column<AcademicTopic>[] = [
    {
      key: 'title',
      header: 'Topic & Learning Objective',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              #{row.topicNumber}
            </span>
            <p className="font-bold text-[#0B2447] text-xs">{row.title}</p>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.learningObjective}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
              {row.courseName || mockCourses.find((c) => c.id === row.courseId)?.name || 'French A1 Intensive Certification Program'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'moduleTitle',
      header: 'Parent Chapter / Module',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] inline-block">
          {row.moduleTitle}
        </span>
      ),
    },
    {
      key: 'skillMapped',
      header: 'Skill Competency',
      render: (row) => (
        <span className="font-semibold text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
          {row.skillMapped}
        </span>
      ),
    },
    {
      key: 'resourcesCount',
      header: 'Attached Resources',
      render: (row) => {
        const count = row.resources?.length || row.resourcesCount || 0;
        return (
          <button
            type="button"
            onClick={() => setResourceDrawerTopic(row)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-[#0052CC] font-bold text-xs transition cursor-pointer"
            title="Manage PDFs, Docs & Web links"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{count} {count === 1 ? 'Resource' : 'Resources'}</span>
          </button>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {!isSuperAdmin && (
            <button
              onClick={() =>
                router.push(
                  `/academic-manager/curriculum/builder?topicId=${row.id}&moduleId=${row.moduleId}&subjectId=${selectedSubjectId}`
                )
              }
              className="px-2 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Open Moodle-style Course Content Builder"
            >
              <Palette className="w-3 h-3 text-purple-600" />
              <span>Builder</span>
            </button>
          )}
          <button
            onClick={() => setResourceDrawerTopic(row)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title={isSuperAdmin ? "View Attached PDFs, Docs & Links" : "Upload / Manage PDF, Docs & Links"}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {isSuperAdmin && <span>View Resources</span>}
          </button>
          {!isSuperAdmin && (
            <>
              <button
                onClick={() => {
                  setEditTopic(row);
                  setIsTopicDrawerOpen(true);
                }}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Topic"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteTopic(row)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Topic"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-10 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Academic Architecture', href: portalRole === 'super-admin' ? '/super-admin/academic' : '/academic-manager/dashboard' },
          { label: 'Curriculum & Syllabus' },
        ]}
      />

      <CollegeFilterBar />

      {/* Header and Course Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0B2447] text-white">
                CURRICULUM MATRIX
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-200">
                Course Mapped
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight mt-1.5">
              Subjects, Chapters & Lesson Topics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Centralized syllabus and pedagogical hierarchy. Manage subjects, modular chapters, and micro-topics mapped directly to active courses.
            </p>
          </div>

          {/* Quick Action Button depending on Active Tab - Hidden for Super Admin */}
          {!isSuperAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              {activeTab === 'subjects' && (
                <Can permission="SUBJECT_CREATE">
                  <button
                    onClick={() => {
                      setEditSubject(null);
                      setIsSubjectDrawerOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Subject</span>
                  </button>
                </Can>
              )}

              {activeTab === 'levels' && (
                <button
                  onClick={() => {
                    setEditLevel(null);
                    setIsLevelDrawerOpen(true);
                  }}
                  className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Proficiency Level</span>
                </button>
              )}

              {activeTab === 'modules' && (
                <Can permission="MODULE_CREATE">
                  <button
                    onClick={() => {
                      setEditModule(null);
                      setIsModuleDrawerOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Chapter / Module</span>
                  </button>
                </Can>
              )}

              {activeTab === 'topics' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(
                        `/academic-manager/curriculum/builder?moduleId=${selectedModuleId}&subjectId=${selectedSubjectId}`
                      )
                    }
                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Open Moodle-style Course Content Builder Studio"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Course Builder Studio</span>
                  </button>
                  <Can permission="TOPIC_CREATE">
                    <button
                      onClick={() => {
                        setEditTopic(null);
                        setIsTopicDrawerOpen(true);
                      }}
                      className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Lesson Topic</span>
                    </button>
                  </Can>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Course Mapping Filter Selector */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter by Teaching Course:
            </span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[260px]"
            >
              <option value="ALL">All Associated Courses ({mockCourses.length} courses)</option>
              {mockCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {activeCourse && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="font-bold text-[#0B2447]">{activeCourse.name}</span>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-slate-500">{activeCourse.duration || '6 Months'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Simple, Friendly View Mode Toggle & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => {
              setSelectedSubjectId('ALL');
              setSelectedLevelId('ALL');
              setSelectedModuleId('ALL');
              setActiveTab('subjects');
            }}
            className={`font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              selectedSubjectId === 'ALL'
                ? 'bg-blue-50 text-[#0052CC] border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Subjects ({filteredSubjects.length})</span>
          </button>

          {selectedSubjectId !== 'ALL' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => {
                  setSelectedLevelId('ALL');
                  setSelectedModuleId('ALL');
                  setActiveTab('levels');
                }}
                className={`font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'levels'
                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span className="truncate max-w-[180px]">
                  2. {subjects.find((s) => s.id === selectedSubjectId)?.name || 'Language Levels'}
                </span>
              </button>
            </>
          )}

          {selectedLevelId !== 'ALL' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => {
                  setSelectedModuleId('ALL');
                  setActiveTab('modules');
                }}
                className={`font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'modules'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate max-w-[180px]">
                  3. {levels.find((l) => l.id === selectedLevelId)?.name || 'Chapters'}
                </span>
              </button>
            </>
          )}

          {selectedModuleId !== 'ALL' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => setActiveTab('topics')}
                className="font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <ListTree className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[200px]">
                  4. {modules.find((m) => m.id === selectedModuleId)?.title || 'Topics'}
                </span>
              </button>
            </>
          )}
        </div>

        {/* View Layout Switcher (Interactive Cards vs Raw Table) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'cards'
                ? 'bg-white text-[#0B2447] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Card Studio</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-white text-[#0B2447] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE A: INTERACTIVE USER-FRIENDLY CARD DRILLDOWN STUDIO                  */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {/* LEVEL 1: SUBJECT CARDS (When on 'subjects' or when no subject is selected) */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0B2447] flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-blue-600" />
                    <span>Select a Subject to Explore Units & Content</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any subject card below to drill down and manage its syllabus chapters & topics.
                  </p>
                </div>
                <Can permission="SUBJECT_CREATE">
                  <button
                    onClick={() => {
                      setEditSubject(null);
                      setIsSubjectDrawerOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </Can>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((sub) => {
                  const subMods = modules.filter((m) => m.subjectId === sub.id);
                  const subTopics = topics.filter((t) => subMods.some((m) => m.id === t.moduleId));
                  return (
                    <div
                      key={sub.id}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Badge & Code */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {sub.code}
                          </span>
                          <StatusBadge status={sub.status} />
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-[#0B2447] text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                          {sub.name}
                        </h3>

                        {/* Course info */}
                        <p className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{sub.courseName || 'Certification Course'}</span>
                        </p>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-medium block">Chapters / Units</span>
                            <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-amber-500" />
                              {subMods.length} Units
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-medium block">Micro-Topics</span>
                            <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                              <ListTree className="w-3.5 h-3.5 text-purple-500" />
                              {subTopics.length} Topics
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {!isSuperAdmin ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditSubject(sub);
                                setIsSubjectDrawerOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Subject"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteSubject(sub)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Audited Subject
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setSelectedSubjectId(sub.id);
                            setSelectedLevelId('ALL');
                            setSelectedModuleId('ALL');
                            setActiveTab('levels');
                          }}
                          className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer group-hover:shadow-sm"
                        >
                          <Award className="w-3.5 h-3.5 text-purple-200" />
                          <span>Manage Levels</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LEVEL 2: PROFICIENCY LEVEL CARDS (When activeTab === 'levels') */}
          {activeTab === 'levels' && (
            <div className="space-y-4">
              {/* Back to Subjects bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubjectId('ALL');
                      setSelectedLevelId('ALL');
                      setSelectedModuleId('ALL');
                      setActiveTab('subjects');
                    }}
                    className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Subjects</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <div className="text-xs">
                    <span className="text-slate-500">Subject: </span>
                    <span className="font-bold text-[#0B2447]">
                      {subjects.find((s) => s.id === selectedSubjectId)?.name || 'All Scoped Subjects'}
                    </span>
                  </div>
                </div>

                {!isSuperAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditLevel(null);
                        setIsLevelDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Proficiency Level</span>
                    </button>
                  </div>
                )}
              </div>

              {filteredLevels.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
                  <Award className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-700 text-sm">No Proficiency Levels Defined</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Create language levels (e.g. A1, A2, B1 for French/German or N5, N4 for Japanese) before organizing syllabus chapters.
                  </p>
                  <button
                    onClick={() => {
                      setEditLevel(null);
                      setIsLevelDrawerOpen(true);
                    }}
                    className="mt-4 px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Create First Level (e.g. A1 / N5)
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLevels.map((lvl) => {
                    const lvlMods = modules.filter((m) => m.levelId === lvl.id || (m.subjectId === lvl.subjectId && m.levelCode === lvl.levelCode));
                    const lvlTopics = topics.filter((t) => lvlMods.some((m) => m.id === t.moduleId));
                    return (
                      <div
                        key={lvl.id}
                        className="group bg-white rounded-2xl border border-purple-200/80 hover:border-purple-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-extrabold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-200">
                              Level: {lvl.levelCode}
                            </span>
                            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                              {lvl.targetCefrOrJlpt || 'Language Track'}
                            </span>
                          </div>

                          <h3 className="font-bold text-[#0B2447] text-sm group-hover:text-purple-700 transition-colors line-clamp-2">
                            {lvl.name}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {lvl.description || 'Proficiency framework curriculum track and pedagogical milestones.'}
                          </p>

                          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-purple-100/70 text-xs">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-medium block">Chapters in Level</span>
                              <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-amber-500" />
                                {lvlMods.length} Chapters
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-medium block">Lesson Topics</span>
                              <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                                <ListTree className="w-3.5 h-3.5 text-purple-500" />
                                {lvlTopics.length} Topics
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Level Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          {!isSuperAdmin ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditLevel(lvl);
                                  setIsLevelDrawerOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                                title="Edit Level"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteLevel(lvl)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Level"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Audited Track
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setSelectedSubjectId(lvl.subjectId);
                              setSelectedLevelId(lvl.id);
                              setSelectedModuleId('ALL');
                              setActiveTab('modules');
                            }}
                            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <span>Explore Chapters</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* LEVEL 3: CHAPTERS / MODULES CARDS (When activeTab === 'modules') */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              {/* Back to Levels bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedModuleId('ALL');
                      setActiveTab('levels');
                    }}
                    className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Levels</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <div className="text-xs">
                    <span className="text-slate-500">Subject: </span>
                    <span className="font-bold text-[#0B2447]">
                      {subjects.find((s) => s.id === selectedSubjectId)?.name || 'All Scoped Subjects'}
                    </span>
                    {selectedLevelId !== 'ALL' && (
                      <>
                        <span className="text-slate-300 mx-1.5">•</span>
                        <span className="text-slate-500">Level: </span>
                        <span className="font-bold text-purple-700">
                          {levels.find((l) => l.id === selectedLevelId)?.name || selectedLevelId}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {!isSuperAdmin && (
                  <div className="flex items-center gap-2">
                    <Can permission="MODULE_CREATE">
                      <button
                        onClick={() => {
                          setEditModule(null);
                          setIsModuleDrawerOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Chapter / Unit</span>
                      </button>
                    </Can>
                  </div>
                )}
              </div>

              {filteredModules.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-700 text-sm">No Chapters Found in this Subject</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {isSuperAdmin
                      ? 'No syllabus chapters have been published for this subject yet.'
                      : 'Start structuring your curriculum by adding syllabus units/chapters to this subject.'}
                  </p>
                  {!isSuperAdmin && (
                    <button
                      onClick={() => {
                        setEditModule(null);
                        setIsModuleDrawerOpen(true);
                      }}
                      className="mt-4 px-4 py-2 bg-[#0052CC] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Create First Chapter
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredModules.map((mod) => {
                    const modTopics = topics.filter((t) => t.moduleId === mod.id);
                    return (
                      <div
                        key={mod.id}
                        className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                              Unit {mod.moduleNumber}
                            </span>
                            <span className="font-semibold text-xs text-slate-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {mod.estimatedHours}h
                            </span>
                          </div>

                          <h3 className="font-bold text-[#0B2447] text-sm group-hover:text-amber-700 transition-colors line-clamp-2">
                            {mod.title}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {mod.description}
                          </p>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 flex items-center gap-1">
                              <ListTree className="w-3.5 h-3.5" />
                              {modTopics.length} Lesson Topics
                            </span>
                            <StatusBadge status={mod.status} />
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          {!isSuperAdmin ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditModule(mod);
                                  setIsModuleDrawerOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit Chapter"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteModule(mod)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Chapter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Audited Chapter
                            </span>
                          )}

                          <button
                            onClick={() => {
                              if (mod.subjectId) setSelectedSubjectId(mod.subjectId);
                              if (mod.levelId) setSelectedLevelId(mod.levelId);
                              setSelectedModuleId(mod.id);
                              setActiveTab('topics');
                            }}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <span>Manage Topics</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* LEVEL 3: TOPICS & CONTENT CARDS (When activeTab === 'topics') */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              {/* Back to Chapters bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const currentMod = modules.find((m) => m.id === selectedModuleId);
                      if (currentMod?.levelId) {
                        setSelectedLevelId(currentMod.levelId);
                      }
                      if (currentMod?.subjectId) {
                        setSelectedSubjectId(currentMod.subjectId);
                      }
                      setSelectedModuleId('ALL');
                      setActiveTab('modules');
                    }}
                    className="p-1.5 px-2.5 text-purple-700 bg-purple-100/70 hover:bg-purple-200/80 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-2xs border border-purple-200"
                  >
                    <ArrowLeft className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Back to Chapters</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <div className="text-xs">
                    <span className="text-slate-500">Unit: </span>
                    <span className="font-bold text-[#0B2447]">
                      {modules.find((m) => m.id === selectedModuleId)?.title || 'All Scoped Units'}
                    </span>
                  </div>
                </div>

                {!isSuperAdmin && (
                  <div className="flex items-center gap-2">
                    <Can permission="TOPIC_CREATE">
                      <button
                        onClick={() => {
                          setEditTopic(null);
                          setIsTopicDrawerOpen(true);
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lesson Topic</span>
                      </button>
                    </Can>
                  </div>
                )}
              </div>

              {filteredTopics.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
                  <ListTree className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-700 text-sm">No Lesson Topics Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {isSuperAdmin
                      ? 'No micro-learning lesson topics have been published for this unit yet.'
                      : 'Create lesson topics, assign learning objectives, and attach PDFs/audio/links.'}
                  </p>
                  {!isSuperAdmin && (
                    <button
                      onClick={() => {
                        setEditTopic(null);
                        setIsTopicDrawerOpen(true);
                      }}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Create First Topic
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTopics.map((top) => {
                    const resCount = top.resources?.length || top.resourcesCount || 0;
                    return (
                      <div
                        key={top.id}
                        className="group bg-white rounded-2xl border border-slate-200 hover:border-purple-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              Lesson #{top.topicNumber}
                            </span>
                            <StatusBadge status={top.status} />
                          </div>

                          <h3 className="font-bold text-[#0B2447] text-sm group-hover:text-purple-700 transition-colors line-clamp-2">
                            {top.title}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {top.learningObjective}
                          </p>

                          <div className="mt-3">
                            <span className="font-semibold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 block truncate">
                              🎯 {top.skillMapped}
                            </span>
                          </div>
                        </div>

                        {/* Resources & Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                          <button
                            type="button"
                            onClick={() => setResourceDrawerTopic(top)}
                            className="w-full flex items-center justify-between px-3 py-1.5 bg-blue-50/70 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition border border-blue-200 cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                              <span>Attached Learning Resources</span>
                            </span>
                            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                              {resCount}
                            </span>
                          </button>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            {!isSuperAdmin ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditTopic(top);
                                      setIsTopicDrawerOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                    title="Edit Topic"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTopic(top)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Delete Topic"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setResourceDrawerTopic(top)}
                                    className="px-2.5 py-1 text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                    title="Quick Resource Attachment"
                                  >
                                    Files ({resCount})
                                  </button>
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/academic-manager/curriculum/builder?topicId=${top.id}&moduleId=${top.moduleId}&subjectId=${selectedSubjectId}`
                                      )
                                    }
                                    className="px-3 py-1 text-white bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                                    title="Open in Moodle-style Course Content Builder"
                                  >
                                    <Palette className="w-3 h-3" />
                                    <span>Manage Content</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Audited Topic
                                </span>
                                <button
                                  onClick={() => setResourceDrawerTopic(top)}
                                  className="px-2.5 py-1 text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold transition cursor-pointer border border-blue-200 flex items-center gap-1"
                                  title="View Learning Resources"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>View Files ({resCount})</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: STANDARD TABLE VIEW (Available via toggle if user wants full rows) */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {/* Tabs Bar: Subjects, Chapters / Modules, Topics */}
          <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'subjects'
                  ? 'border-[#0052CC] text-[#0052CC] bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>Subjects Catalog</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'subjects' ? 'bg-[#0052CC] text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {filteredSubjects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('modules')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'modules'
                  ? 'border-[#0052CC] text-[#0052CC] bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Chapters / Modules</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'modules' ? 'bg-[#0052CC] text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {filteredModules.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('topics')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'topics'
                  ? 'border-[#0052CC] text-[#0052CC] bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <ListTree className="w-4 h-4" />
              <span>Lesson Topics</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'topics' ? 'bg-[#0052CC] text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {filteredTopics.length}
              </span>
            </button>
          </div>

          {/* Tab Content 1: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <p>
                  Showing <span className="font-bold text-slate-700">{filteredSubjects.length}</span> subjects assigned to curriculum.
                </p>
                <button
                  onClick={() => {
                    setEditSubject(null);
                    setIsSubjectDrawerOpen(true);
                  }}
                  className="text-[#0052CC] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Subject</span>
                </button>
              </div>

              <DataTable
                data={filteredSubjects}
                columns={subjectColumns}
                rowKey={(row) => row.id}
                searchPlaceholder="Search subject name, code, faculty..."
                searchKey={(row) => `${row.name} ${row.code} ${row.facultyName} ${row.courseName || ''}`}
              />
            </div>
          )}

          {/* Tab Content 2: CHAPTERS / MODULES */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <p>
                  Showing <span className="font-bold text-slate-700">{filteredModules.length}</span> modular units and syllabus chapters.
                </p>
                <button
                  onClick={() => {
                    setEditModule(null);
                    setIsModuleDrawerOpen(true);
                  }}
                  className="text-[#0052CC] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Chapter</span>
                </button>
              </div>

              <DataTable
                data={filteredModules}
                columns={moduleColumns}
                rowKey={(row) => row.id}
                searchPlaceholder="Search chapter title, subject, course..."
                searchKey={(row) => `${row.title} ${row.subjectName} ${row.courseName || ''}`}
              />
            </div>
          )}

          {/* Tab Content 3: TOPICS */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <p>
                  Showing <span className="font-bold text-slate-700">{filteredTopics.length}</span> pedagogical lesson topics and competencies.
                </p>
                <button
                  onClick={() => {
                    setEditTopic(null);
                    setIsTopicDrawerOpen(true);
                  }}
                  className="text-[#0052CC] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Topic</span>
                </button>
              </div>

              <DataTable
                data={filteredTopics}
                columns={topicColumns}
                rowKey={(row) => row.id}
                searchPlaceholder="Search lesson topic, competency, objective..."
                searchKey={(row) => `${row.title} ${row.moduleTitle} ${row.skillMapped} ${row.courseName || ''}`}
              />
            </div>
          )}
        </div>
      )}

      {/* CREATION & EDIT DRAWERS (ONLY FOR ACADEMIC MANAGER) */}
      {!isSuperAdmin && (
        <>
          {/* SUBJECT DRAWER */}
          <CreateSubjectDrawer
            isOpen={isSubjectDrawerOpen}
            onClose={() => {
              setIsSubjectDrawerOpen(false);
              setEditSubject(null);
            }}
            onSubjectCreated={handleSubjectCreated}
            editSubject={editSubject}
            onSubjectUpdated={handleSubjectUpdated}
          />

          {/* PROFICIENCY LEVEL DRAWER (A1, A2, B1, N5, N4, TOPIK) */}
          <CreateLevelDrawer
            isOpen={isLevelDrawerOpen}
            onClose={() => {
              setIsLevelDrawerOpen(false);
              setEditLevel(null);
            }}
            onLevelCreated={handleLevelCreated}
            editLevel={editLevel}
            onLevelUpdated={handleLevelUpdated}
            defaultSubjectId={selectedSubjectId !== 'ALL' ? selectedSubjectId : undefined}
            subjectsList={subjects}
          />

          {/* MODULE / CHAPTER DRAWER */}
          <CreateModuleDrawer
            isOpen={isModuleDrawerOpen}
            onClose={() => {
              setIsModuleDrawerOpen(false);
              setEditModule(null);
            }}
            onModuleCreated={handleModuleCreated}
            editModule={editModule}
            onModuleUpdated={handleModuleUpdated}
            defaultCourseId={selectedCourseFilter !== 'ALL' ? selectedCourseFilter : undefined}
            defaultSubjectId={selectedSubjectId !== 'ALL' ? selectedSubjectId : undefined}
            defaultLevelId={selectedLevelId !== 'ALL' ? selectedLevelId : undefined}
            levelsList={levels}
          />

          {/* TOPIC DRAWER */}
          <CreateTopicDrawer
            isOpen={isTopicDrawerOpen}
            onClose={() => {
              setIsTopicDrawerOpen(false);
              setEditTopic(null);
            }}
            onTopicCreated={handleTopicCreated}
            editTopic={editTopic}
            onTopicUpdated={handleTopicUpdated}
            defaultCourseId={selectedCourseFilter !== 'ALL' ? selectedCourseFilter : undefined}
            defaultModuleId={selectedModuleId !== 'ALL' ? selectedModuleId : undefined}
          />

          {/* DELETE DIALOGS */}
          <DeleteConfirmDrawer
            isOpen={!!deleteSubject}
            onClose={() => setDeleteSubject(null)}
            onConfirm={handleSubjectDeleted}
            entityType="Curriculum Subject"
            entityName={deleteSubject?.name || ''}
            entityCode={deleteSubject?.code}
            description="Deleting this subject will remove associated module units, syllabus objectives, and faculty assignments."
          />

          <DeleteConfirmDrawer
            isOpen={!!deleteLevel}
            onClose={() => setDeleteLevel(null)}
            onConfirm={handleLevelDeleted}
            entityType="Proficiency Level"
            entityName={deleteLevel?.name || ''}
            entityCode={deleteLevel?.levelCode}
            description="Deleting this proficiency level will affect all nested chapters and syllabus tracks."
          />

          <DeleteConfirmDrawer
            isOpen={!!deleteModule}
            onClose={() => setDeleteModule(null)}
            onConfirm={handleModuleDeleted}
            entityType="Chapter / Module"
            entityName={deleteModule?.title || ''}
            entityCode={`Unit ${deleteModule?.moduleNumber}`}
            description="Deleting this chapter module will remove all underlying lesson topics and class allocations."
          />

          <DeleteConfirmDrawer
            isOpen={!!deleteTopic}
            onClose={() => setDeleteTopic(null)}
            onConfirm={handleTopicDeleted}
            entityType="Lesson Topic"
            entityName={deleteTopic?.title || ''}
            entityCode={`#${deleteTopic?.topicNumber}`}
            description="Deleting this lesson topic will remove it from the course syllabus and teacher tracking."
          />
        </>
      )}

      {/* TOPIC RESOURCE VIEWER DRAWER (PDF, DOCS, WEB LINKS, VIDEOS) */}
      <TopicResourceManagerDrawer
        isOpen={Boolean(resourceDrawerTopic)}
        onClose={() => setResourceDrawerTopic(null)}
        topic={resourceDrawerTopic}
        onUpdateTopicResources={(updated) => {
          handleTopicUpdated(updated);
          setResourceDrawerTopic(updated);
        }}
      />
    </div>
  );
}

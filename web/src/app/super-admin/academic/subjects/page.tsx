// ============================================================================
// ISML COLLEGE LMS — SUBJECTS MANAGEMENT
// ============================================================================

"use client";

import React, { useState } from 'react';
import { BookMarked, Plus, Edit2, Trash2, UserCheck } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { Subject } from '@/types/rbac';
import { mockSubjects, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import CreateSubjectDrawer from '@/components/super-admin/academic/CreateSubjectDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

export default function SubjectsPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);

  // Filter subjects based on selected college or overall
  const displaySubjects = subjects.filter((s) => {
    if (isOverall) return true;
    const prog = mockPrograms.find((p) => p.id === s.programId);
    const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleSubjectCreated = (newSubject: Subject) => {
    setSubjects((prev) => [newSubject, ...prev]);
  };

  const handleSubjectUpdated = (updatedSubject: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)));
  };

  const handleSubjectDeleted = () => {
    if (!deleteSubject) return;
    setSubjects((prev) => prev.filter((s) => s.id !== deleteSubject.id));
    showSuccess(`Subject "${deleteSubject.name}" (${deleteSubject.code}) deleted successfully.`);
    setDeleteSubject(null);
  };

  const openCreateDrawer = () => {
    setEditSubject(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (subj: Subject) => {
    setEditSubject(subj);
    setIsDrawerOpen(true);
  };

  const columns: Column<Subject>[] = [
    {
      key: 'name',
      header: 'Subject & Syllabus',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.programName} (Semester {row.semesterNumber})</p>
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
      key: 'credits',
      header: 'Credits',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-xs text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          {row.credits} Credits
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
      header: 'Modules',
      render: (row) => <span className="text-slate-600 font-semibold">{row.modulesCount} Units</span>,
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
            onClick={() => openEditDrawer(row)}
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic', href: '/super-admin/academic' }, { label: 'Subjects' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Subjects & Curriculum
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Subject credits, type allocations, and assigned college faculty.
          </p>
        </div>

        <Can permission="SUBJECT_CREATE">
          <button
            onClick={openCreateDrawer}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Add Subject</span>
          </button>
        </Can>
      </div>

      <DataTable
        data={displaySubjects}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search subject name, code, faculty..."
        searchKey={(row) => `${row.name} ${row.code} ${row.facultyName}`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.programName} (Sem {row.semesterNumber})</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {row.code}
              </span>
              <span>•</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {row.credits} Credits
              </span>
              <span>•</span>
              <span>Faculty: {row.facultyName.split(',')[0]}</span>
              <span>•</span>
              <span>{row.modulesCount} Units</span>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
              <button
                onClick={() => openEditDrawer(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteSubject(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      />

      <CreateSubjectDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditSubject(null);
        }}
        onSubjectCreated={handleSubjectCreated}
        editSubject={editSubject}
        onSubjectUpdated={handleSubjectUpdated}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteSubject}
        onClose={() => setDeleteSubject(null)}
        onConfirm={handleSubjectDeleted}
        entityType="Curriculum Subject"
        entityName={deleteSubject?.name || ''}
        entityCode={deleteSubject?.code}
        description="Deleting this subject will remove module units, syllabus objectives, and faculty assignments."
      />
    </div>
  );
}

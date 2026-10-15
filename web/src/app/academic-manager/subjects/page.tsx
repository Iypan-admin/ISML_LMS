// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: SUBJECTS (/academic-manager/subjects)
// Subject Directory, Faculty Allotment & Curriculum Modules
// ============================================================================

"use client";

import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, BookOpen, Users, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Subject } from '@/types/rbac';
import { mockSubjects, mockPrograms } from '@/mock/superAdminData';
import CreateSubjectDrawer from '@/components/super-admin/academic/CreateSubjectDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerSubjectsPage() {
  const { showSuccess } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);

  const handleSubjectCreated = (newSubject: Subject) => {
    setSubjects((prev) => [newSubject, ...prev]);
  };

  const handleSubjectUpdated = (updatedSubject: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)));
  };

  const handleSubjectDeleted = () => {
    if (!deleteSubject) return;
    setSubjects((prev) => prev.filter((s) => s.id !== deleteSubject.id));
    showSuccess(`Subject "${deleteSubject.name}" deleted.`);
    setDeleteSubject(null);
  };

  const columns: Column<Subject>[] = [
    {
      key: 'name',
      header: 'Subject & Code',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {row.code}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'programName',
      header: 'Course & Track',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-blue-900 leading-snug">
            {row.courseName || 'French A1 Intensive Certification Program'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {row.programName} • Term {row.semesterNumber} • {row.type}
          </p>
        </div>
      ),
    },
    {
      key: 'facultyName',
      header: 'Assigned Trainer',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-700">{row.facultyName}</p>
          <p className="text-[10px] text-slate-400">{row.facultyEmail}</p>
        </div>
      ),
    },
    {
      key: 'modulesCount',
      header: 'Modules',
      render: (row) => (
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.modulesCount} Modules
        </span>
      ),
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
              setEditSubject(row);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Subject"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteSubject(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Subjects' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-blue-600" />
            <span>Subject Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Subject syllabus catalogs, theory/practical classifications, and instructor mappings.
          </p>
        </div>

        <button
          onClick={() => {
            setEditSubject(null);
            setIsDrawerOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      <DataTable<Subject>
        data={subjects}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search subjects by name, code or faculty trainer..."
        pageSize={10}
      />

      <CreateSubjectDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditSubject(null);
        }}
        onSubjectCreated={handleSubjectCreated}
        onSubjectUpdated={handleSubjectUpdated}
        editSubject={editSubject}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteSubject}
        onClose={() => setDeleteSubject(null)}
        onConfirm={handleSubjectDeleted}
        title="Delete Subject"
        entityType="Subject"
        entityName={deleteSubject?.name}
        description="Are you sure you want to remove this subject? Associated curriculum modules and assessment records will be affected."
      />
    </div>
  );
}

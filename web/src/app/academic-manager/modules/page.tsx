// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: MODULES & TOPICS
// (/academic-manager/modules & /academic-manager/topics)
// Structured Curriculum Units, Chapters, Learning Objectives & LSRW Skills
// ============================================================================

"use client";

import React, { useState } from 'react';
import { ListTree, Plus, Edit2, Trash2, BookOpen, Clock, Files } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { AcademicModule } from '@/types/rbac';
import { mockModules } from '@/mock/superAdminData';
import CreateModuleDrawer from '@/components/super-admin/academic/CreateModuleDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerModulesPage() {
  const { showSuccess } = useToast();
  const [modules, setModules] = useState<AcademicModule[]>(mockModules);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editModule, setEditModule] = useState<AcademicModule | null>(null);
  const [deleteModule, setDeleteModule] = useState<AcademicModule | null>(null);

  const handleModuleCreated = (newModule: AcademicModule) => {
    setModules((prev) => [newModule, ...prev]);
  };

  const handleModuleUpdated = (updatedModule: AcademicModule) => {
    setModules((prev) => prev.map((m) => (m.id === updatedModule.id ? updatedModule : m)));
  };

  const handleModuleDeleted = () => {
    if (!deleteModule) return;
    setModules((prev) => prev.filter((m) => m.id !== deleteModule.id));
    showSuccess(`Module "${deleteModule.title}" deleted.`);
    setDeleteModule(null);
  };

  const columns: Column<AcademicModule>[] = [
    {
      key: 'title',
      header: 'Module & Title',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'subjectName',
      header: 'Parent Subject',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">{row.subjectName}</span>
      ),
    },
    {
      key: 'topicsCount',
      header: 'Topics',
      render: (row) => (
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.topicsCount} Topics
        </span>
      ),
    },
    {
      key: 'estimatedHours',
      header: 'Duration',
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.estimatedHours} Hours
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
              setEditModule(row);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Module"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteModule(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Module"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Modules & Chapters' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <ListTree className="w-6 h-6 text-blue-600" />
            <span>Curriculum Modules & Chapters</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize core curriculum chapters, estimated instructional hours, and topic distributions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditModule(null);
            setIsDrawerOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Curriculum Module</span>
        </button>
      </div>

      <DataTable<AcademicModule>
        data={modules}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="title"
        searchPlaceholder="Search modules by title or subject..."
        pageSize={10}
      />

      <CreateModuleDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditModule(null);
        }}
        onModuleCreated={handleModuleCreated}
        onModuleUpdated={handleModuleUpdated}
        editModule={editModule}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteModule}
        onClose={() => setDeleteModule(null)}
        onConfirm={handleModuleDeleted}
        title="Delete Module"
        entityType="Module"
        entityName={deleteModule?.title}
        description="Are you sure you want to remove this module? All child topics and lecture recordings linked to it will need remapping."
      />
    </div>
  );
}

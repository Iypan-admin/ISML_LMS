// ============================================================================
// ISML COLLEGE LMS — MODULES MANAGEMENT
// ============================================================================

"use client";

import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { AcademicModule } from '@/types/rbac';
import { mockModules, mockSubjects, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import CreateModuleDrawer from '@/components/super-admin/academic/CreateModuleDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

export default function ModulesPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [modules, setModules] = useState<AcademicModule[]>(mockModules);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editModule, setEditModule] = useState<AcademicModule | null>(null);
  const [deleteModule, setDeleteModule] = useState<AcademicModule | null>(null);

  // Filter modules based on selected college or overall
  const displayModules = modules.filter((m) => {
    if (isOverall) return true;
    const sub = mockSubjects.find((s) => s.id === m.subjectId);
    const prog = mockPrograms.find((p) => p.id === sub?.programId);
    const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleModuleCreated = (newModule: AcademicModule) => {
    setModules((prev) => [newModule, ...prev]);
  };

  const handleModuleUpdated = (updatedModule: AcademicModule) => {
    setModules((prev) => prev.map((m) => (m.id === updatedModule.id ? updatedModule : m)));
  };

  const handleModuleDeleted = () => {
    if (!deleteModule) return;
    setModules((prev) => prev.filter((m) => m.id !== deleteModule.id));
    showSuccess(`Module "${deleteModule.title}" deleted successfully.`);
    setDeleteModule(null);
  };

  const openCreateDrawer = () => {
    setEditModule(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (mod: AcademicModule) => {
    setEditModule(mod);
    setIsDrawerOpen(true);
  };

  const columns: Column<AcademicModule>[] = [
    {
      key: 'title',
      header: 'Module Title & Description',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'subjectName',
      header: 'Subject',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{row.subjectName}</span>,
    },
    {
      key: 'estimatedHours',
      header: 'Duration',
      render: (row) => (
        <span className="font-semibold text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {row.estimatedHours} Hours
        </span>
      ),
    },
    {
      key: 'topicsCount',
      header: 'Topics',
      sortable: true,
      render: (row) => <span className="font-bold text-[#0052CC] text-xs">{row.topicsCount} Topics</span>,
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
            title="Edit Module"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteModule(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Module"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic', href: '/super-admin/academic' }, { label: 'Modules' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Curriculum Modules
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Syllabus units, estimated lecture hours, and micro-topic containers.
          </p>
        </div>

        <Can permission="MODULE_CREATE">
          <button
            onClick={openCreateDrawer}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Create Module</span>
          </button>
        </Can>
      </div>

      <DataTable
        data={displayModules}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search module title, subject..."
        searchKey={(row) => `${row.title} ${row.subjectName}`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.title}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.subjectName}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <p className="text-[11px] text-slate-600 line-clamp-2">{row.description}</p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-600">
              <span>{row.estimatedHours} Hours • {row.topicsCount} Topics</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditDrawer(row)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteModule(row)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      />

      <CreateModuleDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditModule(null);
        }}
        onModuleCreated={handleModuleCreated}
        editModule={editModule}
        onModuleUpdated={handleModuleUpdated}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteModule}
        onClose={() => setDeleteModule(null)}
        onConfirm={handleModuleDeleted}
        entityType="Curriculum Module Unit"
        entityName={deleteModule?.title || ''}
        description="Deleting this unit module will detach child learning topics and lecture hours from the syllabus."
      />
    </div>
  );
}

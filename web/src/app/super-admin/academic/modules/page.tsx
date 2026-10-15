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
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          Audited
        </span>
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
            Curriculum Modules Oversight
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Syllabus units, estimated lecture hours, and micro-topic containers.
          </p>
        </div>
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
              <span className="text-[10px] font-bold text-slate-400">Read-Only</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

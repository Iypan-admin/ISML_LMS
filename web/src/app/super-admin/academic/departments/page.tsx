// ============================================================================
// ISML COLLEGE LMS — DEPARTMENTS MANAGEMENT
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Network, Plus, Edit2, Trash2, Eye, Users, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { Department } from '@/types/rbac';
import { mockDepartments } from '@/mock/superAdminData';
import CreateDepartmentDrawer from '@/components/super-admin/academic/CreateDepartmentDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

export default function DepartmentsPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [deleteDepartment, setDeleteDepartment] = useState<Department | null>(null);

  const displayDepartments = departments.filter((d) => {
    if (isOverall) return true;
    return !d.institutionId || d.institutionId === selectedCollegeId;
  });

  const handleDepartmentCreated = (newDept: Department) => {
    setDepartments((prev) => [newDept, ...prev]);
  };

  const handleDepartmentUpdated = (updatedDept: Department) => {
    setDepartments((prev) => prev.map((d) => (d.id === updatedDept.id ? updatedDept : d)));
  };

  const handleDepartmentDeleted = () => {
    if (!deleteDepartment) return;
    setDepartments((prev) => prev.filter((d) => d.id !== deleteDepartment.id));
    showSuccess(`Department "${deleteDepartment.name}" (${deleteDepartment.code}) has been deleted.`);
    setDeleteDepartment(null);
  };

  const openCreateDrawer = () => {
    setEditDepartment(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (dept: Department) => {
    setEditDepartment(dept);
    setIsDrawerOpen(true);
  };

  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Department Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">HOD: {row.hodName}</p>
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
      key: 'programsCount',
      header: 'Programs',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700">{row.programsCount} Programs</span>,
    },
    {
      key: 'facultyCount',
      header: 'Faculty',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700">{row.facultyCount} Members</span>,
    },
    {
      key: 'studentsCount',
      header: 'Students',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700">{row.studentsCount} Students</span>,
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
            title="Edit Department"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteDepartment(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Department"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic', href: '/super-admin/academic' }, { label: 'Departments' }]} />

      {/* College Scoping Filter Bar */}
      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Departments Management
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            College academic departments, HOD assignments, and program allocations.
          </p>
        </div>

        <Can permission="DEPARTMENT_CREATE">
          <button
            onClick={openCreateDrawer}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Create Department</span>
          </button>
        </Can>
      </div>

      <DataTable
        data={displayDepartments}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search department name, code, HOD..."
        searchKey={(row) => `${row.name} ${row.code} ${row.hodName}`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">HOD: {row.hodName}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {row.code}
              </span>
              <span>•</span>
              <span className="font-semibold">{row.programsCount} Programs</span>
              <span>•</span>
              <span>{row.facultyCount} Faculty</span>
              <span>•</span>
              <span>{row.studentsCount} Students</span>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => openEditDrawer(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteDepartment(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      />

      {/* Right-Side Create/Edit Drawer */}
      <CreateDepartmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditDepartment(null);
        }}
        onDepartmentCreated={handleDepartmentCreated}
        editDepartment={editDepartment}
        onDepartmentUpdated={handleDepartmentUpdated}
      />

      {/* Right-Side Delete Confirmation Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteDepartment}
        onClose={() => setDeleteDepartment(null)}
        onConfirm={handleDepartmentDeleted}
        entityType="Department"
        entityName={deleteDepartment?.name || ''}
        entityCode={deleteDepartment?.code}
        description="Deleting this department will unlink all associated programs, courses, and faculty allocations assigned to it."
      />
    </div>
  );
}

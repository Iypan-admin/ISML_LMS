// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: BATCHES & COHORTS (/academic-manager/batches)
// Batch Creation, Multi-Cohort Management, Capacity Limits & Student Mapping
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Users, BookOpen, Clock, Calendar } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Batch } from '@/types/rbac';
import { mockBatches, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import CreateBatchDrawer from '@/components/super-admin/academic/CreateBatchDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerBatchesPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [deleteBatch, setDeleteBatch] = useState<Batch | null>(null);

  const displayBatches = batches.filter((b) => {
    if (isOverall) return true;
    if (b.institutionId) return b.institutionId === selectedCollegeId;
    const prog = mockPrograms.find((p) => p.id === b.programId);
    const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleBatchCreated = (newBatch: Batch) => {
    setBatches((prev) => [newBatch, ...prev]);
  };

  const handleBatchUpdated = (updatedBatch: Batch) => {
    setBatches((prev) => prev.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)));
  };

  const handleBatchDeleted = () => {
    if (!deleteBatch) return;
    setBatches((prev) => prev.filter((b) => b.id !== deleteBatch.id));
    showSuccess(`Cohort Batch "${deleteBatch.name}" removed.`);
    setDeleteBatch(null);
  };

  const columns: Column<Batch>[] = [
    {
      key: 'name',
      header: 'Batch Cohort Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">AY {row.academicYear || `${row.admissionYear}–${row.graduationYear}`}</p>
        </div>
      ),
    },
    {
      key: 'programName',
      header: 'Program Pathway',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.programName}</p>
          <p className="text-[11px] text-slate-500">{row.departmentName}</p>
        </div>
      ),
    },
    {
      key: 'currentSemesterNumber',
      header: 'Current Term',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
          Term {row.currentSemesterNumber}
        </span>
      ),
    },
    {
      key: 'sectionsCount',
      header: 'Sections',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.sectionsCount} Sections
        </span>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Enrolled Strength',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 text-xs">
          <Users className="w-3.5 h-3.5" />
          {row.studentsCount} Students
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
              setEditBatch(row);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Batch"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteBatch(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Deactivate Batch"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Batches & Cohorts' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Academic Cohorts & Batch Setup</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure student admission cohorts, section divisions, intake seat capacity, and current academic cycles.
          </p>
        </div>

        <button
          onClick={() => {
            setEditBatch(null);
            setIsDrawerOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Cohort Batch</span>
        </button>
      </div>

      <DataTable<Batch>
        data={displayBatches}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search batches by cohort code, program or intake year..."
        pageSize={10}
        emptyTitle="No cohort batches"
        emptyDescription="No active batches enrolled under this campus scope."
      />

      <CreateBatchDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditBatch(null);
        }}
        onBatchCreated={handleBatchCreated}
        onBatchUpdated={handleBatchUpdated}
        editBatch={editBatch}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteBatch}
        onClose={() => setDeleteBatch(null)}
        onConfirm={handleBatchDeleted}
        title="Deactivate Cohort Batch"
        entityType="Batch"
        entityName={deleteBatch?.name}
        description="Are you sure you want to deactivate this batch? Student enrollments and scheduled lectures will be impacted."
      />
    </div>
  );
}

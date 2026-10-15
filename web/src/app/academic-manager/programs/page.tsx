// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: PROGRAMS (/academic-manager/programs)
// Degree Programs, Foreign Language Diploma Pathways, Semesters & Batches
// ============================================================================

"use client";

import React, { useState } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Eye, Layers, Users, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Program } from '@/types/rbac';
import { mockPrograms, mockDepartments } from '@/mock/superAdminData';
import CreateProgramDrawer from '@/components/super-admin/academic/CreateProgramDrawer';
import ProgramDetailDrawer from '@/components/super-admin/academic/ProgramDetailDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerProgramsPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<Program | null>(null);
  const [deleteProgram, setDeleteProgram] = useState<Program | null>(null);
  const [viewProgram, setViewProgram] = useState<Program | null>(null);

  const displayPrograms = programs.filter((p) => {
    if (isOverall) return true;
    const dept = mockDepartments.find((d) => d.id === p.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleProgramCreated = (newProgram: Program) => {
    setPrograms((prev) => [newProgram, ...prev]);
  };

  const handleProgramUpdated = (updatedProgram: Program) => {
    setPrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
  };

  const handleProgramDeleted = () => {
    if (!deleteProgram) return;
    setPrograms((prev) => prev.filter((p) => p.id !== deleteProgram.id));
    showSuccess(`Program "${deleteProgram.name}" (${deleteProgram.code}) removed.`);
    setDeleteProgram(null);
  };

  const columns: Column<Program>[] = [
    {
      key: 'name',
      header: 'Program Name & Code',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {row.code}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{row.degreeType}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Language Track',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.code.includes('FR') ? 'French' : row.code.includes('DE') ? 'German' : row.code.includes('JA') ? 'Japanese' : row.code.includes('KO') ? 'Korean' : 'Spanish'} Track
        </span>
      ),
    },
    {
      key: 'durationYears',
      header: 'Duration / Terms',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {row.durationYears} Years ({row.totalSemesters} Terms)
        </span>
      ),
    },
    {
      key: 'batchesCount',
      header: 'Batches',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          <Layers className="w-3.5 h-3.5" />
          {row.batchesCount} Cohorts
        </span>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Enrolled Learners',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-800 text-xs">
          {row.studentsCount.toLocaleString()}
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
            onClick={() => setViewProgram(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setEditProgram(row);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Program"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteProgram(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Deactivate Program"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Programs' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span>Academic Programs & Language Pathways</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Degree curricula, international language tracks, cohort setups, and semester progressions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditProgram(null);
            setIsDrawerOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Program Pathway</span>
        </button>
      </div>

      <DataTable<Program>
        data={displayPrograms}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search programs by title or degree code..."
        pageSize={10}
        emptyTitle="No academic programs"
        emptyDescription="No academic programs recorded under this campus scope."
      />

      <CreateProgramDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditProgram(null);
        }}
        onProgramCreated={handleProgramCreated}
        onProgramUpdated={handleProgramUpdated}
        editProgram={editProgram}
      />

      <ProgramDetailDrawer
        isOpen={!!viewProgram}
        onClose={() => setViewProgram(null)}
        program={viewProgram}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteProgram}
        onClose={() => setDeleteProgram(null)}
        onConfirm={handleProgramDeleted}
        title="Deactivate Program"
        entityType="Program"
        entityName={deleteProgram?.name}
        description="Are you sure you want to deactivate this program? Ongoing cohort batches and scheduled live lectures will be notified."
      />
    </div>
  );
}

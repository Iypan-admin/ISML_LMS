// ============================================================================
// ISML COLLEGE LMS — PROGRAMS & DEGREE COURSES MANAGEMENT
// Degree Programs, Per-Semester Fee Structures, Cohort Batches & Curriculum Hub
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Eye,
  Edit2,
  Trash2,
  IndianRupee,
  Layers,
  CalendarRange,
  BookMarked,
  Sparkles,
  Building2,
  Users,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { Program, Batch } from '@/types/rbac';
import { mockPrograms, mockDepartments, mockBatches } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import CreateProgramDrawer from '@/components/super-admin/academic/CreateProgramDrawer';
import ProgramDetailDrawer from '@/components/super-admin/academic/ProgramDetailDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function ProgramsPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [inspectProgram, setInspectProgram] = useState<Program | null>(null);
  const [editProgram, setEditProgram] = useState<Program | null>(null);
  const [deleteProgram, setDeleteProgram] = useState<Program | null>(null);

  // Filter programs based on selected college or overall
  const displayPrograms = programs.filter((p) => {
    if (isOverall) return true;
    const dept = mockDepartments.find((d) => d.id === p.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  // Handlers
  const handleProgramCreated = (newProgram: Program, newBatches: Batch[]) => {
    setPrograms((prev) => [newProgram, ...prev]);
    // Also simulate adding batches to mock pool
    newBatches.forEach((b) => mockBatches.unshift(b));
  };

  const handleProgramUpdated = (updatedProgram: Program) => {
    setPrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
  };

  const handleProgramDeleted = () => {
    if (!deleteProgram) return;
    setPrograms((prev) => prev.filter((p) => p.id !== deleteProgram.id));
    showSuccess(`Program "${deleteProgram.name}" (${deleteProgram.code}) deleted successfully.`);
    setDeleteProgram(null);
  };

  const openCreateDrawer = () => {
    setEditProgram(null);
    setIsCreateDrawerOpen(true);
  };

  const openEditDrawer = (prog: Program) => {
    setEditProgram(prog);
    setIsCreateDrawerOpen(true);
  };

  const columns: Column<Program>[] = [
    {
      key: 'name',
      header: 'Program / Degree Title',
      sortable: true,
      render: (row) => (
        <div className="cursor-pointer" onClick={() => setInspectProgram(row)}>
          <p className="font-bold text-[#0B2447] text-xs hover:text-[#0052CC] hover:underline flex items-center gap-1.5">
            <span>{row.name}</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">{row.departmentName}</p>
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
      key: 'degreeType',
      header: 'Degree Level',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          {row.degreeType}
        </span>
      ),
    },
    {
      key: 'durationYears',
      header: 'Duration',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.durationYears} Years ({row.totalSemesters} Sem)
        </span>
      ),
    },
    {
      key: 'batchesCount',
      header: 'Batches / Sections',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            {row.batchesCount} Batches
          </span>
        </div>
      ),
    },
    {
      key: 'semesterFee',
      header: 'Fee Structure',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-emerald-800 text-xs">
            ₹{(row.semesterFee || 48000).toLocaleString('en-IN')}{' '}
            <span className="text-[10px] text-slate-500 font-normal">/ Sem</span>
          </span>
          <p className="text-[10px] text-slate-400">
            Total: ₹{(row.totalProgramFee || (row.semesterFee || 48000) * row.totalSemesters).toLocaleString('en-IN')}
          </p>
        </div>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Enrolled',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-700 text-xs">
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
            onClick={() => setInspectProgram(row)}
            className="p-1.5 text-slate-500 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Inspect Semesters, Subjects, Batches & Fees"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEditDrawer(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Program"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteProgram(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Program"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic', href: '/super-admin/academic' }, { label: 'Programs & Courses' }]} />

      {/* College Scoping Filter Bar */}
      <CollegeFilterBar />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Programs & Degree Courses Management
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Degree curricula, per-semester tuition fees, cohort batch allocations, and semester subjects hub.
          </p>
        </div>

        <Can permission="PROGRAM_CREATE">
          <button
            onClick={openCreateDrawer}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Create Program</span>
          </button>
        </Can>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Degree Programs
          </span>
          <p className="text-lg sm:text-xl font-bold text-[#0B2447] mt-0.5">{displayPrograms.length}</p>
        </div>

        <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Active Cohorts
          </span>
          <p className="text-lg sm:text-xl font-bold text-indigo-700 mt-0.5">
            {displayPrograms.reduce((acc, p) => acc + p.batchesCount, 0)}
          </p>
        </div>

        <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Enrolled Learners
          </span>
          <p className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">
            {displayPrograms.reduce((acc, p) => acc + p.studentsCount, 0).toLocaleString()}
          </p>
        </div>

        <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Avg Fee / Sem
          </span>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            ₹
            {Math.round(
              displayPrograms.reduce((acc, p) => acc + (p.semesterFee || 45000), 0) / (displayPrograms.length || 1)
            ).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Main Programs Table */}
      <DataTable
        data={displayPrograms}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search program name, code, department..."
        searchKey={(row) => `${row.name} ${row.code} ${row.departmentName}`}
        filters={[
          {
            key: 'departmentId',
            label: 'Department',
            options: mockDepartments.map((d) => ({ label: d.code, value: d.id })),
          },
        ]}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.departmentName}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {row.code}
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {row.degreeType}
              </span>
              <span>•</span>
              <span>{row.durationYears}y ({row.totalSemesters} Sem)</span>
              <span>•</span>
              <span className="font-semibold text-indigo-700">{row.batchesCount} Batches</span>
            </div>

            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg">
              <span className="text-slate-500">Per Sem Fee:</span>
              <span className="font-bold text-emerald-800">₹{(row.semesterFee || 48000).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
              <button
                onClick={() => setInspectProgram(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>Inspect</span>
              </button>
              <button
                onClick={() => openEditDrawer(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteProgram(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      />

      {/* Create/Edit Program Slide-over Drawer */}
      <CreateProgramDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => {
          setIsCreateDrawerOpen(false);
          setEditProgram(null);
        }}
        onProgramCreated={handleProgramCreated}
        editProgram={editProgram}
        onProgramUpdated={handleProgramUpdated}
      />

      {/* In-Place Program Detail Inspector Drawer */}
      <ProgramDetailDrawer
        isOpen={!!inspectProgram}
        onClose={() => setInspectProgram(null)}
        program={inspectProgram}
      />

      {/* Delete Confirmation Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteProgram}
        onClose={() => setDeleteProgram(null)}
        onConfirm={handleProgramDeleted}
        entityType="Program"
        entityName={deleteProgram?.name || ''}
        entityCode={deleteProgram?.code}
        description="Deleting this degree program will detach curriculum semesters, cohorts, and tuition fee associations."
      />
    </div>
  );
}

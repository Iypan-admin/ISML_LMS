// ============================================================================
// ISML COLLEGE LMS — SEMESTERS MANAGEMENT
// ============================================================================

"use client";

import React, { useState } from 'react';
import { CalendarRange, Plus, Edit2, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { Semester } from '@/types/rbac';
import { mockSemesters, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import CreateSemesterDrawer from '@/components/super-admin/academic/CreateSemesterDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

export default function SemestersPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [semesters, setSemesters] = useState<Semester[]>(mockSemesters);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editSemester, setEditSemester] = useState<Semester | null>(null);
  const [deleteSemester, setDeleteSemester] = useState<Semester | null>(null);

  // Filter semesters based on selected college or overall
  const displaySemesters = semesters.filter((s) => {
    if (isOverall) return true;
    const prog = mockPrograms.find((p) => p.id === s.programId);
    const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleSemesterCreated = (newSem: Semester) => {
    setSemesters((prev) => [newSem, ...prev]);
  };

  const handleSemesterUpdated = (updatedSem: Semester) => {
    setSemesters((prev) => prev.map((s) => (s.id === updatedSem.id ? updatedSem : s)));
  };

  const handleSemesterDeleted = () => {
    if (!deleteSemester) return;
    setSemesters((prev) => prev.filter((s) => s.id !== deleteSemester.id));
    showSuccess(`Semester term "${deleteSemester.name}" deleted successfully.`);
    setDeleteSemester(null);
  };

  const openCreateDrawer = () => {
    setEditSemester(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (sem: Semester) => {
    setEditSemester(sem);
    setIsDrawerOpen(true);
  };

  const columns: Column<Semester>[] = [
    {
      key: 'name',
      header: 'Semester Term',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.programName}</p>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      render: (row) => <span className="font-semibold text-slate-700">{row.academicYear}</span>,
    },
    {
      key: 'dates',
      header: 'Timeline',
      render: (row) => (
        <span className="text-slate-600 text-xs">
          {row.startDate} to {row.endDate}
        </span>
      ),
    },
    {
      key: 'subjectsCount',
      header: 'Subjects',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700">{row.subjectsCount} Subjects</span>,
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
            title="Edit Semester"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteSemester(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Semester"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic', href: '/super-admin/academic' }, { label: 'Semesters' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Semesters Management
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Academic calendar terms, start and end dates, and semester promotion setups.
          </p>
        </div>

        <Can permission="SEMESTER_CREATE">
          <button
            onClick={openCreateDrawer}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Configure Semester</span>
          </button>
        </Can>
      </div>

      <DataTable
        data={displaySemesters}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search semester term, program, academic year..."
        searchKey={(row) => `${row.name} ${row.programName} ${row.academicYear}`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.programName}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-700">{row.academicYear}</span>
              <span>•</span>
              <span>{row.startDate} ~ {row.endDate}</span>
              <span>•</span>
              <span className="font-semibold text-blue-700">{row.subjectsCount} Subjects</span>
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
                onClick={() => setDeleteSemester(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      />

      <CreateSemesterDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditSemester(null);
        }}
        onSemesterCreated={handleSemesterCreated}
        editSemester={editSemester}
        onSemesterUpdated={handleSemesterUpdated}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteSemester}
        onClose={() => setDeleteSemester(null)}
        onConfirm={handleSemesterDeleted}
        entityType="Semester Term"
        entityName={deleteSemester?.name || ''}
        description="Deleting this semester term may affect linked curriculum courses, subject mappings, and student records."
      />
    </div>
  );
}

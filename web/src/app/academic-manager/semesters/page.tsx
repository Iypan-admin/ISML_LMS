// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: SEMESTERS (/academic-manager/semesters)
// Academic Terms, Semester Periods, Course Enrollments & Calendars
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, Calendar, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Semester } from '@/types/rbac';
import { mockSemesters, mockPrograms } from '@/mock/superAdminData';
import CreateSemesterDrawer from '@/components/super-admin/academic/CreateSemesterDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerSemestersPage() {
  const { showSuccess } = useToast();
  const [semesters, setSemesters] = useState<Semester[]>(mockSemesters);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editSemester, setEditSemester] = useState<Semester | null>(null);
  const [deleteSemester, setDeleteSemester] = useState<Semester | null>(null);

  const handleSemesterCreated = (newSemester: Semester) => {
    setSemesters((prev) => [newSemester, ...prev]);
  };

  const handleSemesterUpdated = (updatedSemester: Semester) => {
    setSemesters((prev) => prev.map((s) => (s.id === updatedSemester.id ? updatedSemester : s)));
  };

  const handleSemesterDeleted = () => {
    if (!deleteSemester) return;
    setSemesters((prev) => prev.filter((s) => s.id !== deleteSemester.id));
    showSuccess(`Semester "${deleteSemester.name}" deleted.`);
    setDeleteSemester(null);
  };

  const columns: Column<Semester>[] = [
    {
      key: 'name',
      header: 'Semester Term Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">AY {row.academicYear} • Term {row.semesterNumber}</p>
        </div>
      ),
    },
    {
      key: 'programName',
      header: 'Program Pathway',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-800">{row.programName}</span>
      ),
    },
    {
      key: 'startDate',
      header: 'Term Duration',
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {row.startDate} to {row.endDate}
        </span>
      ),
    },
    {
      key: 'subjectsCount',
      header: 'Curriculum Subjects',
      render: (row) => (
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.subjectsCount} Subjects
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
              setEditSemester(row);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Semester"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteSemester(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Semester"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Semesters' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span>Academic Semesters & Term Cycles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure calendar term milestones, start/end dates, and curriculum course mappings.
          </p>
        </div>

        <button
          onClick={() => {
            setEditSemester(null);
            setIsDrawerOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Semester Term</span>
        </button>
      </div>

      <DataTable<Semester>
        data={semesters}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search semesters by name or academic cycle..."
        pageSize={10}
      />

      <CreateSemesterDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditSemester(null);
        }}
        onSemesterCreated={handleSemesterCreated}
        onSemesterUpdated={handleSemesterUpdated}
        editSemester={editSemester}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteSemester}
        onClose={() => setDeleteSemester(null)}
        onConfirm={handleSemesterDeleted}
        title="Delete Semester Term"
        entityType="Semester"
        entityName={deleteSemester?.name}
        description="Are you sure you want to remove this semester term? Active student timetable enrollments will be archived."
      />
    </div>
  );
}

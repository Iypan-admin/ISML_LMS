// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: ACADEMIC YEARS
// (/academic-manager/academic-years)
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';
import CreateAcademicYearDrawer, { AcademicYearItem } from '@/components/super-admin/academic/CreateAcademicYearDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';

const INITIAL_YEARS: AcademicYearItem[] = [
  {
    id: 'ay-2026',
    code: 'AY-2026-2027',
    name: 'Academic Year 2026–2027',
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    isCurrent: true,
    status: 'ACTIVE',
  },
  {
    id: 'ay-2025',
    code: 'AY-2025-2026',
    name: 'Academic Year 2025–2026',
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    isCurrent: false,
    status: 'COMPLETED',
  },
  {
    id: 'ay-2027',
    code: 'AY-2027-2028',
    name: 'Academic Year 2027–2028',
    startDate: '2027-07-01',
    endDate: '2028-06-30',
    isCurrent: false,
    status: 'UPCOMING',
  },
];

export default function AcademicManagerAcademicYearsPage() {
  const { showSuccess, showInfo } = useToast();
  const [years, setYears] = useState<AcademicYearItem[]>(INITIAL_YEARS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editYear, setEditYear] = useState<AcademicYearItem | null>(null);
  const [deleteYear, setDeleteYear] = useState<AcademicYearItem | null>(null);

  const handleYearCreated = (newYear: AcademicYearItem) => {
    if (newYear.isCurrent) {
      setYears((prev) => [
        newYear,
        ...prev.map((y) => ({ ...y, isCurrent: false })),
      ]);
    } else {
      setYears((prev) => [newYear, ...prev]);
    }
  };

  const handleYearUpdated = (updatedYear: AcademicYearItem) => {
    setYears((prev) =>
      prev.map((y) => {
        if (y.id === updatedYear.id) return updatedYear;
        if (updatedYear.isCurrent) return { ...y, isCurrent: false };
        return y;
      })
    );
  };

  const handleYearDeleted = () => {
    if (!deleteYear) return;
    setYears((prev) => prev.filter((y) => y.id !== deleteYear.id));
    showSuccess(`Academic cycle "${deleteYear.name}" removed.`);
    setDeleteYear(null);
  };

  const columns: Column<AcademicYearItem>[] = [
    {
      key: 'name',
      header: 'Academic Cycle Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.name}</p>
            {row.isCurrent && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                Current Active Year
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] text-slate-500 mt-0.5">{row.code}</p>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Commencement Date',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">{row.startDate}</span>
      ),
    },
    {
      key: 'endDate',
      header: 'Conclusion Date',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">{row.endDate}</span>
      ),
    },
    {
      key: 'status',
      header: 'Cycle Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right min-w-[90px]',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setEditYear(row);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Academic Year"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteYear(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Academic Year"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Academic Years' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Academic Years & Calendar Cycles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional multi-year cycles, admissions intake windows, and regulatory terms.
          </p>
        </div>

        <button
          onClick={() => {
            setEditYear(null);
            setIsDrawerOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Academic Year</span>
        </button>
      </div>

      <DataTable<AcademicYearItem>
        data={years}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search academic years..."
        pageSize={10}
      />

      <CreateAcademicYearDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditYear(null);
        }}
        onYearCreated={handleYearCreated}
        onYearUpdated={handleYearUpdated}
        editYear={editYear}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteYear}
        onClose={() => setDeleteYear(null)}
        onConfirm={handleYearDeleted}
        title="Remove Academic Year Cycle"
        entityType="Academic Year"
        entityName={deleteYear?.name}
        description="Are you sure you want to remove this academic year? Archived terms will remain in historical audit logs."
      />
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — RESULTS & PERFORMANCE MONITORING
// ============================================================================

"use client";

import React, { useState } from 'react';
import { BarChart3, Award, FileSpreadsheet } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { ResultRecord } from '@/types/rbac';
import { mockResults } from '@/mock/superAdminData';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function ResultsPage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const [results] = useState<ResultRecord[]>(mockResults);

  const columns: Column<ResultRecord>[] = [
    {
      key: 'studentName',
      header: 'Student & Roll Number',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.studentName}</p>
          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
            {row.rollNo}
          </span>
        </div>
      ),
    },
    {
      key: 'subjectName',
      header: 'Subject & Semester',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-700">{row.subjectName}</p>
          <p className="text-[11px] text-slate-500">{row.program} (Sem {row.semester})</p>
        </div>
      ),
    },
    {
      key: 'marksObtained',
      header: 'Score',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-xs text-[#0B2447]">
          {row.marksObtained} / {row.maxMarks}
        </span>
      ),
    },
    {
      key: 'grade',
      header: 'Grade Awarded',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
          Grade {row.grade}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Outcome',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Monitoring' }, { label: 'Results' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Results & Academic Performance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal assessments, semester marks cards, and grading distribution.
          </p>
        </div>
      </div>

      <DataTable
        data={results}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search student name, roll number, subject..."
        searchKey={(row) => `${row.studentName} ${row.rollNo} ${row.subjectName}`}
      />
    </div>
  );
}

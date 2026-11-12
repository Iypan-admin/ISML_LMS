// ============================================================================
// ISML COLLEGE LMS — RESULTS & PERFORMANCE MONITORING
// Live Data Driven / Zero Hardcoded Mock Records
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart3, Award, FileSpreadsheet, RefreshCw } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { ResultRecord } from '@/types/rbac';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function ResultsPage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real student marks / assessment results from backend API
  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('https://ismllms-production.up.railway.app/api/portals/results');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setResults(list);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const displayResults = useMemo(() => {
    return results.filter((r) => {
      if (isOverall) return true;
      if (r.institutionId) return r.institutionId === selectedCollegeId;
      return true;
    });
  }, [results, isOverall, selectedCollegeId]);

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
      header: 'Subject & Stage',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-700">{row.subjectName}</p>
          <p className="text-[11px] text-slate-500">{row.program} ({row.semester ? `Sem ${row.semester}` : 'LMS Track'})</p>
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
      header: 'Grade',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.grade}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Result Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching, Faculty & Evaluation' }, { label: 'Gradebooks & Results' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Gradebooks & Results
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Institutional ledger of student performance, continuous assessment scores, and CEFR grading.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchResults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <DataTable
        data={displayResults}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search student name, roll no, subject..."
        searchKey={(row) => `${row.studentName} ${row.rollNo} ${row.subjectName}`}
        emptyTitle="No Result Records Found"
        emptyDescription="There are currently no published gradebook entries or examination results for this selection."
      />
    </div>
  );
}

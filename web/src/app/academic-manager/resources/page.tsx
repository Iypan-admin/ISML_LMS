// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: LEARNING RESOURCES
// (/academic-manager/resources)
// ============================================================================

"use client";

import React, { useState } from 'react';
import { FileText, Plus, Download, FileSpreadsheet, BookOpen, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { ResourceItem } from '@/types/rbac';
import { mockResources } from '@/mock/superAdminData';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerResourcesPage() {
  const { showSuccess } = useToast();
  const [resources] = useState<ResourceItem[]>(mockResources);

  const columns: Column<ResourceItem>[] = [
    {
      key: 'title',
      header: 'Study Document / Asset',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {row.type}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{row.fileSize}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'subjectName',
      header: 'Curriculum Hierarchy',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.subjectName}</p>
          <p className="text-[11px] text-slate-500">{row.moduleName} • {row.topicName}</p>
        </div>
      ),
    },
    {
      key: 'authorName',
      header: 'Author / Faculty',
      render: (row) => <span className="text-xs font-medium text-slate-700">{row.authorName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Learning Resources' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Learning Resources & Curriculum Study Materials</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated course handouts, audio pronunciation drills, PDF worksheets, and presentation slide decks.
          </p>
        </div>

        <button
          onClick={() => showSuccess('Upload learning resource triggered.')}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      <DataTable<ResourceItem>
        data={resources}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="title"
        searchPlaceholder="Search study materials by title or curriculum topic..."
        pageSize={10}
      />
    </div>
  );
}

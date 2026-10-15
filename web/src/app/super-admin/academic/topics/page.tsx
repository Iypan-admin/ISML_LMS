// ============================================================================
// ISML COLLEGE LMS — TOPICS MANAGEMENT
// ============================================================================

"use client";

import React, { useState } from 'react';
import { ListTree, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { AcademicTopic } from '@/types/rbac';
import { mockTopics, mockModules, mockSubjects, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import CreateTopicDrawer from '@/components/super-admin/academic/CreateTopicDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

export default function TopicsPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [topics, setTopics] = useState<AcademicTopic[]>(mockTopics);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<AcademicTopic | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<AcademicTopic | null>(null);

  // Filter topics based on selected college or overall
  const displayTopics = topics.filter((t) => {
    if (isOverall) return true;
    const mod = mockModules.find((m) => m.id === t.moduleId);
    const sub = mockSubjects.find((s) => s.id === mod?.subjectId);
    const prog = mockPrograms.find((p) => p.id === sub?.programId);
    const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleTopicCreated = (newTopic: AcademicTopic) => {
    setTopics((prev) => [newTopic, ...prev]);
  };

  const handleTopicUpdated = (updatedTopic: AcademicTopic) => {
    setTopics((prev) => prev.map((t) => (t.id === updatedTopic.id ? updatedTopic : t)));
  };

  const handleTopicDeleted = () => {
    if (!deleteTopic) return;
    setTopics((prev) => prev.filter((t) => t.id !== deleteTopic.id));
    showSuccess(`Topic "${deleteTopic.title}" deleted successfully.`);
    setDeleteTopic(null);
  };

  const openCreateDrawer = () => {
    setEditTopic(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (top: AcademicTopic) => {
    setEditTopic(top);
    setIsDrawerOpen(true);
  };

  const columns: Column<AcademicTopic>[] = [
    {
      key: 'title',
      header: 'Topic & Objective',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{row.learningObjective}</p>
        </div>
      ),
    },
    {
      key: 'moduleTitle',
      header: 'Parent Module',
      render: (row) => <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] inline-block">{row.moduleTitle}</span>,
    },
    {
      key: 'skillMapped',
      header: 'Skill Mapped',
      render: (row) => (
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          {row.skillMapped}
        </span>
      ),
    },
    {
      key: 'resourcesCount',
      header: 'Resources',
      sortable: true,
      render: (row) => <span className="font-bold text-[#0052CC] text-xs">{row.resourcesCount} Mapped</span>,
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
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          Audited
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic', href: '/super-admin/academic' }, { label: 'Topics' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Micro-Learning Topics Oversight
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Granular lesson topics mapped to LSRW skills and learning objectives.
          </p>
        </div>
      </div>

      <DataTable
        data={displayTopics}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search topic title, skill, objective..."
        searchKey={(row) => `${row.title} ${row.learningObjective} ${row.skillMapped}`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.title}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.moduleTitle}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <p className="text-[11px] text-slate-600 line-clamp-2">{row.learningObjective}</p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-indigo-700 font-semibold">{row.skillMapped}</span>
              <span className="text-[10px] font-bold text-slate-400">Read-Only</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

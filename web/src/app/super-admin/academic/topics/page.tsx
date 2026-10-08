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
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditDrawer(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Topic"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTopic(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Topic"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
            Micro-Learning Topics
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Granular lesson topics mapped to LSRW skills and learning objectives.
          </p>
        </div>

        <Can permission="TOPIC_CREATE">
          <button
            onClick={openCreateDrawer}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Create Topic</span>
          </button>
        </Can>
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditDrawer(row)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteTopic(row)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      />

      <CreateTopicDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditTopic(null);
        }}
        onTopicCreated={handleTopicCreated}
        editTopic={editTopic}
        onTopicUpdated={handleTopicUpdated}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteTopic}
        onClose={() => setDeleteTopic(null)}
        onConfirm={handleTopicDeleted}
        entityType="Curriculum Topic"
        entityName={deleteTopic?.title || ''}
        description="Deleting this lesson topic will remove attached learning materials, assessments, and skill mapping analytics."
      />
    </div>
  );
}

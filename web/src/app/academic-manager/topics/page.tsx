// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: TOPICS (/academic-manager/topics)
// Topic Directory, Learning Objectives, LSRW Skills & Resource Mappings
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Files, Plus, Edit2, Trash2, BookOpen, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { AcademicTopic } from '@/types/rbac';
import { mockTopics } from '@/mock/superAdminData';
import CreateTopicDrawer from '@/components/super-admin/academic/CreateTopicDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerTopicsPage() {
  const { showSuccess } = useToast();
  const [topics, setTopics] = useState<AcademicTopic[]>(mockTopics);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<AcademicTopic | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<AcademicTopic | null>(null);

  const handleTopicCreated = (newTopic: AcademicTopic) => {
    setTopics((prev) => [newTopic, ...prev]);
  };

  const handleTopicUpdated = (updatedTopic: AcademicTopic) => {
    setTopics((prev) => prev.map((t) => (t.id === updatedTopic.id ? updatedTopic : t)));
  };

  const handleTopicDeleted = () => {
    if (!deleteTopic) return;
    setTopics((prev) => prev.filter((t) => t.id !== deleteTopic.id));
    showSuccess(`Topic "${deleteTopic.title}" deleted.`);
    setDeleteTopic(null);
  };

  const columns: Column<AcademicTopic>[] = [
    {
      key: 'title',
      header: 'Topic & Objective',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{row.learningObjective}</p>
        </div>
      ),
    },
    {
      key: 'moduleTitle',
      header: 'Parent Module',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800 line-clamp-1">{row.moduleTitle}</p>
          <p className="text-[10px] text-slate-400">{row.subjectName}</p>
        </div>
      ),
    },
    {
      key: 'skillMapped',
      header: 'LSRW Skill Focus',
      render: (row) => (
        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          {row.skillMapped}
        </span>
      ),
    },
    {
      key: 'resourcesCount',
      header: 'Resources',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.resourcesCount} Files
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
              setEditTopic(row);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Topic"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTopic(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Topic"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Topics & Skills' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Files className="w-6 h-6 text-blue-600" />
            <span>Curriculum Topics & Skill Framework</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual lesson topics, language pedagogy objectives, listening/speaking drills, and study assets.
          </p>
        </div>

        <button
          onClick={() => {
            setEditTopic(null);
            setIsDrawerOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lesson Topic</span>
        </button>
      </div>

      <DataTable<AcademicTopic>
        data={topics}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="title"
        searchPlaceholder="Search topics by title, module or skill focus..."
        pageSize={10}
      />

      <CreateTopicDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditTopic(null);
        }}
        onTopicCreated={handleTopicCreated}
        onTopicUpdated={handleTopicUpdated}
        editTopic={editTopic}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteTopic}
        onClose={() => setDeleteTopic(null)}
        onConfirm={handleTopicDeleted}
        title="Delete Topic"
        entityType="Topic"
        entityName={deleteTopic?.title}
        description="Are you sure you want to remove this topic? Any learning resources attached to it will need to be reallocated."
      />
    </div>
  );
}

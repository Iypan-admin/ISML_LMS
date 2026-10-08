// ============================================================================
// ISML COLLEGE LMS — ASSESSMENTS MANAGEMENT
// ============================================================================

"use client";

import React, { useState } from 'react';
import { FileCheck2, Plus, Edit2, Trash2, Calendar, Award } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { AssessmentItem } from '@/types/rbac';
import { mockAssessments, mockBatches, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import CreateAssessmentDrawer from '@/components/super-admin/assessments/CreateAssessmentDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function AssessmentsPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [assessments, setAssessments] = useState<AssessmentItem[]>(mockAssessments);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editAssessment, setEditAssessment] = useState<AssessmentItem | null>(null);
  const [deleteAssessment, setDeleteAssessment] = useState<AssessmentItem | null>(null);

  // Filter assessments based on selected college or overall
  const displayAssessments = assessments.filter((a) => {
    if (isOverall) return true;
    const batch = mockBatches.find((b) => b.name === a.batchName);
    const prog = mockPrograms.find((p) => p.name === a.programName || p.id === batch?.programId);
    const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleAssessmentCreated = (newAssessment: AssessmentItem) => {
    setAssessments((prev) => [newAssessment, ...prev]);
  };

  const handleAssessmentUpdated = (updatedAssessment: AssessmentItem) => {
    setAssessments((prev) => prev.map((a) => (a.id === updatedAssessment.id ? updatedAssessment : a)));
  };

  const handleAssessmentDeleted = () => {
    if (!deleteAssessment) return;
    setAssessments((prev) => prev.filter((a) => a.id !== deleteAssessment.id));
    showSuccess(`Assessment "${deleteAssessment.title}" deleted successfully.`);
    setDeleteAssessment(null);
  };

  const openCreateDrawer = () => {
    setEditAssessment(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (assessment: AssessmentItem) => {
    setEditAssessment(assessment);
    setIsDrawerOpen(true);
  };

  const columns: Column<AssessmentItem>[] = [
    {
      key: 'title',
      header: 'Assessment Title & Type',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.title}</p>
          <span className="font-semibold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            {row.type}
          </span>
        </div>
      ),
    },
    {
      key: 'subjectName',
      header: 'Subject & Cohort',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-700">{row.subjectName}</p>
          <p className="text-[11px] text-slate-500">{row.batchName}</p>
        </div>
      ),
    },
    {
      key: 'totalMarks',
      header: 'Total Marks',
      sortable: true,
      render: (row) => <span className="font-bold text-xs text-[#0052CC]">{row.totalMarks} Marks</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => <span className="text-slate-600 text-xs">{row.dueDate}</span>,
    },
    {
      key: 'submissionsCount',
      header: 'Submissions',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700">{row.submissionsCount} Submitted</span>,
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
            title="Edit Assessment"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteAssessment(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Assessment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Assessments' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Assessments & Examinations
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Mid-term exams, homework assignments, and continuous internal assessment (CIA) grading.
          </p>
        </div>

        <Can permission="ASSESSMENT_CREATE">
          <button
            onClick={openCreateDrawer}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Create Assessment</span>
          </button>
        </Can>
      </div>

      <DataTable
        data={displayAssessments}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search assessment title, subject..."
        searchKey={(row) => `${row.title} ${row.subjectName} ${row.type}`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.title}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.subjectName} • {row.batchName}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                {row.type}
              </span>
              <span>•</span>
              <span className="font-bold text-blue-700">{row.totalMarks} Marks</span>
              <span>•</span>
              <span>Due: {row.dueDate}</span>
              <span>•</span>
              <span>{row.submissionsCount} Submissions</span>
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
                onClick={() => setDeleteAssessment(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      />

      <CreateAssessmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditAssessment(null);
        }}
        onAssessmentCreated={handleAssessmentCreated}
        editAssessment={editAssessment}
        onAssessmentUpdated={handleAssessmentUpdated}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteAssessment}
        onClose={() => setDeleteAssessment(null)}
        onConfirm={handleAssessmentDeleted}
        entityType="Assessment"
        entityName={deleteAssessment?.title || ''}
        description="Deleting this examination or assignment will remove associated question papers, student submissions, and grading ledger records."
      />
    </div>
  );
}

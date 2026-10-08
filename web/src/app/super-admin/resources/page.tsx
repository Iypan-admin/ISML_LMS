// ============================================================================
// ISML COLLEGE LMS — DIGITAL RESOURCES & REPOSITORY
// Approval, Publishing & Permission-Gated Actions
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Files,
  Upload,
  CheckCircle,
  Globe,
  Archive,
  FileText,
  Video,
  Headphones,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { ResourceItem } from '@/types/rbac';
import { mockResources } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import UploadResourceDrawer from '@/components/super-admin/resources/UploadResourceDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function ResourcesPage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const [resources, setResources] = useState<ResourceItem[]>(mockResources);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editResource, setEditResource] = useState<ResourceItem | null>(null);
  const [deleteResource, setDeleteResource] = useState<ResourceItem | null>(null);
  const { showSuccess, showInfo } = useToast();

  const handleResourceUploaded = (newRes: ResourceItem) => {
    setResources((prev) => [newRes, ...prev]);
  };

  const handleResourceUpdated = (updatedRes: ResourceItem) => {
    setResources((prev) => prev.map((r) => (r.id === updatedRes.id ? updatedRes : r)));
  };

  const handleResourceDeleted = () => {
    if (!deleteResource) return;
    setResources((prev) => prev.filter((r) => r.id !== deleteResource.id));
    showSuccess(`Resource "${deleteResource.title}" deleted successfully.`);
    setDeleteResource(null);
  };

  const handleApprove = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
    );
    showSuccess('Learning resource approved successfully.');
  };

  const handlePublish = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'PUBLISHED' } : r))
    );
    showSuccess('Resource published to student course catalog.');
  };

  const handleArchive = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'ARCHIVED' } : r))
    );
    showInfo('Resource archived.');
  };

  const openUploadDrawer = () => {
    setEditResource(null);
    setIsUploadOpen(true);
  };

  const openEditDrawer = (res: ResourceItem) => {
    setEditResource(res);
    setIsUploadOpen(true);
  };

  const columns: Column<ResourceItem>[] = [
    {
      key: 'title',
      header: 'Resource Title & Topic',
      sortable: true,
      render: (row) => (
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0052CC] mt-0.5 shrink-0">
            {row.type === 'VIDEO' ? (
              <Video className="w-4 h-4" />
            ) : row.type === 'AUDIO' ? (
              <Headphones className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="font-bold text-[#0B2447] text-xs">{row.title}</p>
            <p className="text-[11px] text-slate-500">{row.topicName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subjectName',
      header: 'Subject & Module',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-700">{row.subjectName}</p>
          <p className="text-[10px] text-slate-400">{row.moduleName}</p>
        </div>
      ),
    },
    {
      key: 'authorName',
      header: 'Author & Size',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.authorName}</p>
          <p className="text-[10px] text-slate-400">{row.fileSize}</p>
        </div>
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
          <Can permission="RESOURCE_APPROVE">
            {row.status === 'PENDING_REVIEW' && (
              <button
                onClick={() => handleApprove(row.id)}
                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                Approve
              </button>
            )}
          </Can>

          <Can permission="RESOURCE_PUBLISH">
            {row.status === 'APPROVED' && (
              <button
                onClick={() => handlePublish(row.id)}
                className="px-2 py-0.5 bg-blue-50 text-[#0052CC] hover:bg-blue-100 rounded text-[11px] font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                Publish
              </button>
            )}
          </Can>

          <Can permission="RESOURCE_UPDATE">
            {row.status === 'PUBLISHED' && (
              <button
                onClick={() => handleArchive(row.id)}
                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                title="Archive Resource"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
          </Can>

          <button
            onClick={() => openEditDrawer(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Resource"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDeleteResource(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Resource"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Resources' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Digital Resource Repository
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Curated textbooks, lecture handouts, audio pronunciation tracks, and videos.
          </p>
        </div>

        <Can permission="RESOURCE_CREATE">
          <button
            onClick={openUploadDrawer}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Upload Resource</span>
          </button>
        </Can>
      </div>

      <DataTable
        data={resources}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search title, author, topic..."
        searchKey={(row) => `${row.title} ${row.authorName} ${row.topicName}`}
        filters={[
          {
            key: 'type',
            label: 'Type',
            options: [
              { label: 'Document', value: 'DOCUMENT' },
              { label: 'Audio', value: 'AUDIO' },
              { label: 'Video', value: 'VIDEO' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Published', value: 'PUBLISHED' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Pending Review', value: 'PENDING_REVIEW' },
            ],
          },
        ]}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded bg-blue-50 text-[#0052CC] shrink-0 mt-0.5">
                  {row.type === 'VIDEO' ? (
                    <Video className="w-3.5 h-3.5" />
                  ) : row.type === 'AUDIO' ? (
                    <Headphones className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.subjectName} • {row.topicName}</p>
                </div>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>{row.authorName}</span>
              <span>{row.fileSize}</span>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
              {row.status === 'PENDING_REVIEW' && (
                <button
                  onClick={() => handleApprove(row.id)}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Approve
                </button>
              )}
              {row.status === 'APPROVED' && (
                <button
                  onClick={() => handlePublish(row.id)}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Publish
                </button>
              )}
              <button
                onClick={() => openEditDrawer(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteResource(row)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      />

      <UploadResourceDrawer
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setEditResource(null);
        }}
        onResourceUploaded={handleResourceUploaded}
        editResource={editResource}
        onResourceUpdated={handleResourceUpdated}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteResource}
        onClose={() => setDeleteResource(null)}
        onConfirm={handleResourceDeleted}
        entityType="Digital Resource"
        entityName={deleteResource?.title || ''}
        description="Deleting this digital file will remove it from learner study repositories and course syllabus downloads."
      />
    </div>
  );
}

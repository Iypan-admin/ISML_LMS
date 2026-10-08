// ============================================================================
// ISML COLLEGE LMS — FINANCE APPROVALS HUB (/super-admin/finance/approvals)
// Dedicated Executive Review for Fee Schedules, Waivers & Financial Policies
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Search,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { mockApprovalRequests } from '@/mock/superAdminData';
import { ApprovalRequest, RequestStatus } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';
import { useRBAC } from '@/context/AuthRbacContext';
import ApprovalDetailDrawer from '@/components/super-admin/approvals/ApprovalDetailDrawer';
import {
  ApprovalConfirmDialog,
  RejectRequestDialog,
  RequestChangesDialog,
} from '@/components/common/ApprovalDialogs';

export default function FinanceApprovalsPage() {
  const { hasPermission } = useRBAC();
  const { showSuccess, showError, showInfo } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();

  const [financeRequests, setFinanceRequests] = useState<ApprovalRequest[]>(
    mockApprovalRequests.filter((r) => r.module === 'Finance')
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer & Dialog State
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);
  const [targetActionRequest, setTargetActionRequest] = useState<ApprovalRequest | null>(null);

  const canApprove = hasPermission('FEE_STRUCTURE_APPROVE') || hasPermission('REQUEST_APPROVE');
  const canReject = hasPermission('FEE_STRUCTURE_REJECT') || hasPermission('REQUEST_REJECT');
  const canRequestChanges = hasPermission('FEE_STRUCTURE_REQUEST_CHANGES') || hasPermission('REQUEST_REQUEST_CHANGES');

  const filtered = financeRequests.filter(
    (r) =>
      r.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDetail = (req: ApprovalRequest) => {
    setSelectedRequest(req);
    setIsDrawerOpen(true);
  };

  const handleTriggerApprove = (req: ApprovalRequest) => {
    setTargetActionRequest(req);
    setApproveDialogOpen(true);
  };

  const handleTriggerReject = (req: ApprovalRequest) => {
    setTargetActionRequest(req);
    setRejectDialogOpen(true);
  };

  const handleTriggerChanges = (req: ApprovalRequest) => {
    setTargetActionRequest(req);
    setChangesDialogOpen(true);
  };

  const handleConfirmApprove = (comment?: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setFinanceRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'APPROVED' as RequestStatus,
              history: [
                ...r.history,
                {
                  step: 'Authorized by Super Admin',
                  userName: 'Super Administrator',
                  role: 'Super Administrator',
                  timestamp: new Date().toISOString(),
                  comment: comment || 'Fee schedule authorized for billing.',
                },
              ],
            }
          : r
      )
    );

    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
    }

    setApproveDialogOpen(false);
    setTargetActionRequest(null);
    showSuccess(`Finance proposal ${reqId} authorized and approved.`);
  };

  const handleConfirmReject = (reason: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setFinanceRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'REJECTED' as RequestStatus,
              reviewComments: reason,
              history: [
                ...r.history,
                {
                  step: 'Rejected by Super Admin',
                  userName: 'Super Administrator',
                  role: 'Super Administrator',
                  timestamp: new Date().toISOString(),
                  comment: reason,
                },
              ],
            }
          : r
      )
    );

    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'REJECTED', reviewComments: reason } : null));
    }

    setRejectDialogOpen(false);
    setTargetActionRequest(null);
    showError(`Finance proposal ${reqId} rejected. Justification recorded.`);
  };

  const handleConfirmRequestChanges = (instructions: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setFinanceRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'CHANGES_REQUIRED' as RequestStatus,
              reviewComments: instructions,
              history: [
                ...r.history,
                {
                  step: 'Changes Requested',
                  userName: 'Super Administrator',
                  role: 'Super Administrator',
                  timestamp: new Date().toISOString(),
                  comment: instructions,
                },
              ],
            }
          : r
      )
    );

    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'CHANGES_REQUIRED', reviewComments: instructions } : null));
    }

    setChangesDialogOpen(false);
    setTargetActionRequest(null);
    showInfo(`Returned ${reqId} to Finance Manager for revision.`);
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      <Breadcrumbs
        items={[{ label: 'Finance', href: '/super-admin/finance' }, { label: 'Approvals Queue' }]}
      />

      <CollegeFilterBar />

      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Finance Authorization Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review fee revisions and scholarship policies submitted by Finance Managers before student enrollment activation.
          </p>
        </div>

        <Link
          href="/super-admin/approvals"
          className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
        >
          <span>Global Approval Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ─── 2. Search & Counter Bar ─── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search finance requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        <div className="text-xs font-semibold text-slate-600">
          Showing <strong>{filtered.length}</strong> Finance Proposal{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ─── 3. Proposals Table ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Proposal Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Submitted By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => {
                const isActionable = req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW';

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(req)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#0052CC]">{req.id}</td>

                    <td className="py-3 px-4 font-bold text-slate-800">{req.requestType}</td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{req.entityName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{req.entityId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{req.submittedBy.name}</div>
                      <div className="text-[10px] text-slate-500">{req.submittedBy.role}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(req.submittedDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(req)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#0052CC] hover:text-white text-slate-700 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isActionable ? 'Review Diff' : 'View'}</span>
                        </button>

                        {isActionable && canApprove && (
                          <button
                            type="button"
                            onClick={() => handleTriggerApprove(req)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                            title="Authorize Fee Schedule"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isActionable && canRequestChanges && (
                          <button
                            type="button"
                            onClick={() => handleTriggerChanges(req)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                            title="Request Changes"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isActionable && canReject && (
                          <button
                            type="button"
                            onClick={() => handleTriggerReject(req)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Diff & Audit Drawer ─── */}
      <ApprovalDetailDrawer
        isOpen={isDrawerOpen}
        request={selectedRequest}
        onClose={() => setIsDrawerOpen(false)}
        onApproveClick={(req) => handleTriggerApprove(req)}
        onRejectClick={(req) => handleTriggerReject(req)}
        onRequestChangesClick={(req) => handleTriggerChanges(req)}
      />

      {/* ─── Responsive Action Dialogs ─── */}
      <ApprovalConfirmDialog
        isOpen={approveDialogOpen}
        request={targetActionRequest}
        onClose={() => {
          setApproveDialogOpen(false);
          setTargetActionRequest(null);
        }}
        onConfirm={handleConfirmApprove}
      />

      <RejectRequestDialog
        isOpen={rejectDialogOpen}
        request={targetActionRequest}
        onClose={() => {
          setRejectDialogOpen(false);
          setTargetActionRequest(null);
        }}
        onConfirm={handleConfirmReject}
      />

      <RequestChangesDialog
        isOpen={changesDialogOpen}
        request={targetActionRequest}
        onClose={() => {
          setChangesDialogOpen(false);
          setTargetActionRequest(null);
        }}
        onConfirm={handleConfirmRequestChanges}
      />
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — APPROVAL CENTER (/super-admin/approvals)
// Centralized Executive Authorization Hub for Academic, Finance, & Operations
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Eye,
  AlertTriangle,
  ArrowUpDown,
  Building,
  Calendar,
  Layers,
  User,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { mockApprovalRequests } from '@/mock/superAdminData';
import { ApprovalRequest, RequestStatus } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { useRBAC } from '@/context/AuthRbacContext';
import ApprovalDetailDrawer from '@/components/super-admin/approvals/ApprovalDetailDrawer';
import {
  ApprovalConfirmDialog,
  RejectRequestDialog,
  RequestChangesDialog,
} from '@/components/common/ApprovalDialogs';

export default function ApprovalCenterPage() {
  const { hasPermission } = useRBAC();
  const { showSuccess, showError, showInfo } = useToast();

  // State
  const [requests, setRequests] = useState<ApprovalRequest[]>(mockApprovalRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Drawer & Dialog State
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);
  const [targetActionRequest, setTargetActionRequest] = useState<ApprovalRequest | null>(null);

  // Check Permissions
  const canView = hasPermission('REQUEST_VIEW');
  const canApprove = hasPermission('REQUEST_APPROVE');
  const canReject = hasPermission('REQUEST_REJECT');
  const canRequestChanges = hasPermission('REQUEST_REQUEST_CHANGES');

  // KPI Calculations
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'SUBMITTED').length;
    const underReview = requests.filter((r) => r.status === 'UNDER_REVIEW').length;
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    const changesOrRejected = requests.filter(
      (r) => r.status === 'CHANGES_REQUIRED' || r.status === 'REJECTED'
    ).length;
    return { pending, underReview, approved, changesOrRejected };
  }, [requests]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Search
      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestType.toLowerCase().includes(searchQuery.toLowerCase());

      // Module
      const matchesModule =
        selectedModule === 'ALL' || req.module.toLowerCase() === selectedModule.toLowerCase();

      // Status
      const matchesStatus =
        selectedStatus === 'ALL' || req.status === selectedStatus;

      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [requests, searchQuery, selectedModule, selectedStatus]);

  // Handle Review Click (opens drawer)
  const handleOpenDetail = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  // Triggers for Dialogs
  const handleTriggerApprove = (request: ApprovalRequest) => {
    setTargetActionRequest(request);
    setApproveDialogOpen(true);
  };

  const handleTriggerReject = (request: ApprovalRequest) => {
    setTargetActionRequest(request);
    setRejectDialogOpen(true);
  };

  const handleTriggerChanges = (request: ApprovalRequest) => {
    setTargetActionRequest(request);
    setChangesDialogOpen(true);
  };

  // Execution: Confirm Approve
  const handleConfirmApprove = (comment?: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return {
            ...r,
            status: 'APPROVED' as RequestStatus,
            history: [
              ...r.history,
              {
                step: 'Approved by Super Admin',
                userName: 'Super Administrator',
                role: 'Super Administrator',
                timestamp: new Date().toISOString(),
                comment: comment || 'Executive authorization granted.',
              },
            ],
          };
        }
        return r;
      })
    );

    // Update opened drawer if matches
    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
    }

    setApproveDialogOpen(false);
    setTargetActionRequest(null);
    showSuccess(`Request ${reqId} (${targetActionRequest.entityName}) approved and activated successfully.`);
  };

  // Execution: Confirm Reject
  const handleConfirmReject = (reason: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return {
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
          };
        }
        return r;
      })
    );

    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'REJECTED', reviewComments: reason } : null));
    }

    setRejectDialogOpen(false);
    setTargetActionRequest(null);
    showError(`Request ${reqId} rejected. Reason logged in audit records.`);
  };

  // Execution: Confirm Request Changes
  const handleConfirmRequestChanges = (instructions: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return {
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
          };
        }
        return r;
      })
    );

    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'CHANGES_REQUIRED', reviewComments: instructions } : null));
    }

    setChangesDialogOpen(false);
    setTargetActionRequest(null);
    showInfo(`Changes requested for ${reqId}. Returned to operational submitter.`);
  };

  if (!canView) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          You lack the <code>REQUEST_VIEW</code> permission required to access the Approval Center.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#0052CC]/10 text-[#0052CC] rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Approval Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and authorize requests submitted by operational teams (Academic, Finance, Scheduling).
          </p>
        </div>
      </div>

      {/* ─── Top Summary KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pending Approval</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-2">{stats.pending}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Action required by Super Admin</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Under Review</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-[#0052CC]">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-2">{stats.underReview}</div>
          <p className="text-[11px] text-blue-700 mt-0.5">Being vetted by leadership</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Authorized & Active</span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-2">{stats.approved}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Executive approvals granted</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Changes / Rejected</span>
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.changesOrRejected}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Returned or non-compliant</p>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Request ID, entity name, or submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          {/* Module & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#0052CC] font-medium"
              >
                <option value="ALL">All Modules</option>
                <option value="Academic">Academic</option>
                <option value="Finance">Finance</option>
                <option value="Learning">Learning</option>
                <option value="Scheduling">Scheduling</option>
                <option value="Communication">Communication</option>
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#0052CC] font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Pending Approval</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CHANGES_REQUIRED">Changes Required</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Approval Requests Table ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No approval requests found</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or filter selections.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Request Type</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const isActionable = req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW';

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(req)}
                    >
                      {/* Request ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0052CC]">
                        {req.id}
                      </td>

                      {/* Request Type */}
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {req.requestType}
                      </td>

                      {/* Module Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                          {req.module}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{req.entityName}</div>
                        <div className="text-[10px] text-slate-600 font-mono">{req.entityId}</div>
                      </td>

                      {/* Submitted By */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{req.submittedBy.name}</div>
                        <div className="text-[10px] text-slate-600">{req.submittedBy.role}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(req.submittedDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Review & Diff View Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(req)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#0052CC] hover:text-white text-slate-700 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                            title="Inspect Before vs After Diff"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isActionable ? 'Review' : 'View'}</span>
                          </button>

                          {/* Quick Decision Actions (gated by permissions) */}
                          {isActionable && canApprove && (
                            <button
                              type="button"
                              onClick={() => handleTriggerApprove(req)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                              title="Authorize & Approve"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isActionable && canRequestChanges && (
                            <button
                              type="button"
                              onClick={() => handleTriggerChanges(req)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 rounded-lg transition-colors cursor-pointer border border-amber-200"
                              title="Request Changes"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isActionable && canReject && (
                            <button
                              type="button"
                              onClick={() => handleTriggerReject(req)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg transition-colors cursor-pointer border border-rose-200"
                              title="Reject Request"
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
        )}
      </div>

      {/* ─── Detail Drawer (Diff View & History) ─── */}
      <ApprovalDetailDrawer
        isOpen={isDrawerOpen}
        request={selectedRequest}
        onClose={() => setIsDrawerOpen(false)}
        onApproveClick={(req) => handleTriggerApprove(req)}
        onRejectClick={(req) => handleTriggerReject(req)}
        onRequestChangesClick={(req) => handleTriggerChanges(req)}
      />

      {/* ─── Responsive Modals (Zero Native Dialogs) ─── */}
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

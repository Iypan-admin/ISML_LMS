// ============================================================================
// ISML COLLEGE LMS — APPROVAL DETAIL DRAWER
// Responsive Side Drawer with Before vs After Diff View & Full Audit History
// ============================================================================

"use client";

import React, { useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  FileText,
  Building,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { ApprovalRequest } from '@/types/rbac';
import { useRBAC } from '@/context/AuthRbacContext';

interface ApprovalDetailDrawerProps {
  isOpen: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onApproveClick: (request: ApprovalRequest) => void;
  onRejectClick: (request: ApprovalRequest) => void;
  onRequestChangesClick: (request: ApprovalRequest) => void;
}

export default function ApprovalDetailDrawer({
  isOpen,
  request,
  onClose,
  onApproveClick,
  onRejectClick,
  onRequestChangesClick,
}: ApprovalDetailDrawerProps) {
  const { hasPermission } = useRBAC();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  const isPending = request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW';
  const canApprove = hasPermission('REQUEST_APPROVE');
  const canReject = hasPermission('REQUEST_REJECT');
  const canRequestChanges = hasPermission('REQUEST_REQUEST_CHANGES');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-200/80 text-slate-800 rounded">
                  {request.id}
                </span>
                <StatusBadge status={request.status} />
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {request.requestType}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Module & Entity
              </span>
              <p className="font-semibold text-slate-800">
                {request.module} • {request.entityType}
              </p>
              <p className="text-slate-600 font-medium">{request.entityName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Operational Submitter
              </span>
              <p className="font-semibold text-slate-800">{request.submittedBy.name}</p>
              <p className="text-slate-500 text-[11px]">
                {request.submittedBy.role} • {request.submittedBy.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submission Date
              </span>
              <p className="font-medium text-slate-800">
                {new Date(request.submittedDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Entity Identifier
              </span>
              <p className="font-mono text-slate-700">{request.entityId}</p>
            </div>
          </div>

          {/* Impact Analysis Banner */}
          {request.impactAnalysis && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 text-xs">Authorization Impact Analysis</h4>
                <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
                  {request.impactAnalysis}
                </p>
              </div>
            </div>
          )}

          {/* Review Comments / Changes Request Alert (if any) */}
          {request.reviewComments && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-xs">Review Notes / Reason</h4>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  {request.reviewComments}
                </p>
              </div>
            </div>
          )}

          {/* Before vs After Diff Section */}
          {(() => {
            const diffList = request.diff || [];
            return (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-[#0052CC]" />
                    Proposed Changes (Before vs. After)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {diffList.length} Field{diffList.length !== 1 ? 's' : ''} modified
                  </span>
                </div>

                {diffList.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-center text-xs">
                    No field-level diff recorded. Full entity authorization requested.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white shadow-2xs">
                    <div className="grid grid-cols-12 bg-slate-50/90 text-slate-600 font-bold px-3.5 py-2.5 text-[11px] border-b border-slate-200">
                      <div className="col-span-4">Field Attribute</div>
                      <div className="col-span-4">Current Value (Old)</div>
                      <div className="col-span-4">Requested Value (New)</div>
                    </div>

                    {diffList.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 px-3.5 py-3 items-center hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="col-span-4 font-semibold text-slate-800 pr-2">
                          {item.fieldName}
                        </div>
                        <div className="col-span-4 pr-2">
                          <span className="inline-block px-2 py-1 bg-rose-50 text-rose-700 rounded border border-rose-200 font-mono text-[11px] break-words line-through decoration-rose-400">
                            {item.oldValue || '—'}
                          </span>
                        </div>
                        <div className="col-span-4">
                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0 hidden sm:inline" />
                            <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-mono text-[11px] font-semibold break-words">
                              {item.newValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Workflow Audit Trail History */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-slate-500" />
              Workflow Audit History
            </h3>

            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {request.history.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step dot */}
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#0052CC] ring-4 ring-white" />

                  <div className="bg-slate-50/70 border border-slate-200 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{step.step}</span>
                      <span className="text-[10px] text-slate-600 font-mono">
                        {new Date(step.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong>{step.userName}</strong> ({step.role})
                    </p>
                    {step.comment && (
                      <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200/60 mt-1">
                        &quot;{step.comment}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer (Super Admin Decision Bar) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          {isPending && (
            <div className="flex items-center gap-2">
              {canRequestChanges && (
                <button
                  type="button"
                  onClick={() => onRequestChangesClick(request)}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Changes</span>
                </button>
              )}

              {canReject && (
                <button
                  type="button"
                  onClick={() => onRejectClick(request)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              )}

              {canApprove && (
                <button
                  type="button"
                  onClick={() => onApproveClick(request)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Authorize</span>
                </button>
              )}
            </div>
          )}

          {!isPending && (
            <div className="text-xs text-slate-500 font-medium">
              Workflow concluded with status: <strong>{request.status}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

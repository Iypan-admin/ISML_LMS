// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: PROPOSALS & APPROVAL DETAILS DRAWER
// Detailed inspection of submitted fee proposals and payment vouchers
// showing status, audit trail, diff analysis, and Super Admin review comments.
// ============================================================================

"use client";

import React, { useEffect, useState } from 'react';
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
  AlertTriangle,
  FileText,
  Building,
  Coins,
  History,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { ApprovalRequest } from '@/types/rbac';

interface ViewProposalDetailDrawerProps {
  isOpen: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onResubmit?: (request: ApprovalRequest) => void;
}

export default function ViewProposalDetailDrawer({
  isOpen,
  request,
  onClose,
  onResubmit,
}: ViewProposalDetailDrawerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 transition-all ${
          isFullscreen ? 'w-full max-w-full' : 'w-full max-w-2xl'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-950 rounded">
                  {request.id}
                </span>
                <StatusBadge status={request.status} />
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate mt-1" title={request.requestType}>
                {request.requestType}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg cursor-pointer transition-colors"
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Entity & Context
              </span>
              <p className="font-bold text-slate-900 text-sm">{request.entityName}</p>
              <p className="text-slate-500 text-[11px] font-mono">{request.entityType} • {request.entityId}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Submitted By
              </span>
              <p className="font-bold text-slate-900 text-sm">{request.submittedBy.name}</p>
              <p className="text-slate-500 text-[11px]">{request.submittedBy.role} ({request.submittedBy.email})</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Submission Date
              </span>
              <p className="font-semibold text-slate-800">
                {new Date(request.submittedDate).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Approval Status
              </span>
              <p className="font-bold text-slate-800">
                {request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW'
                  ? 'Awaiting Super Admin Authorization'
                  : request.status === 'APPROVED'
                  ? 'Authorized & Active'
                  : request.status === 'CHANGES_REQUIRED'
                  ? 'Revisions Required by Super Admin'
                  : 'Rejected'}
              </p>
            </div>
          </div>

          {/* Super Admin Feedback Alert if changes required or rejected */}
          {request.reviewComments && (
            <div
              className={`p-4 rounded-xl border ${
                request.status === 'CHANGES_REQUIRED'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : request.status === 'REJECTED'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {request.status === 'CHANGES_REQUIRED' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : request.status === 'REJECTED' ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Super Admin Decision Remarks</span>
              </div>
              <p className="text-xs leading-relaxed">{request.reviewComments}</p>
            </div>
          )}

          {/* Impact Analysis */}
          {request.impactAnalysis && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Impact Analysis & Justification
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {request.impactAnalysis}
              </p>
            </div>
          )}

          {/* Audit Diff Table */}
          {request.diff && request.diff.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden space-y-0">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                  Proposed Changes / Verification Diff
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{request.diff.length} Fields</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2 px-3">Field</th>
                    <th className="py-2 px-3">Previous State</th>
                    <th className="py-2 px-3">Proposed Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {request.diff.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.fieldName}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{item.oldValue}</td>
                      <td className="py-2.5 px-3 font-bold text-[#0052CC] font-mono">{item.newValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Full Audit Step History */}
          {request.history && request.history.length > 0 && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#0052CC]" />
                <span>Audit Trail & Event Log</span>
              </h4>
              <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
                {request.history.map((step, idx) => (
                  <div key={idx} className="relative space-y-0.5">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0052CC] border-2 border-white ring-2 ring-slate-100" />
                    <p className="font-bold text-slate-900">{step.step}</p>
                    <p className="text-[11px] text-slate-500">
                      {step.userName} ({step.role}) • {new Date(step.timestamp).toLocaleString()}
                    </p>
                    {step.comment && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                        "{step.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          {request.status === 'CHANGES_REQUIRED' && onResubmit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onResubmit(request);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Modify & Resubmit Proposal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

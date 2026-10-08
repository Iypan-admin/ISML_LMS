// ============================================================================
// ISML COLLEGE LMS — RESPONSIVE APPROVAL DIALOGS
// Responsive modals for Approve, Reject, and Request Changes workflows
// Zero native alert() or confirm()
// ============================================================================

"use client";

import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, AlertTriangle, ShieldCheck, MessageSquare } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { ApprovalRequest } from '@/types/rbac';

// ─── 1. APPROVE CONFIRMATION DIALOG ───
interface ApprovalConfirmDialogProps {
  isOpen: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
  isLoading?: boolean;
}

export function ApprovalConfirmDialog({
  isOpen,
  request,
  onClose,
  onConfirm,
  isLoading = false,
}: ApprovalConfirmDialogProps) {
  const [comment, setComment] = useState('');

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authorize & Approve Request"
      description={`Request ID: ${request.id} • ${request.module}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Item Summary Card */}
        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{request.requestType}: {request.entityName}</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Submitted by <strong>{request.submittedBy.name}</strong> ({request.submittedBy.role}) on{' '}
            {new Date(request.submittedDate).toLocaleDateString()}.
          </p>
        </div>

        {/* Impact Warning */}
        <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>System Impact:</strong> {request.impactAnalysis || 'Approving this request activates changes immediately across the college portal and related student batches.'}
          </p>
        </div>

        {/* Optional Authorization Comment */}
        <div>
          <label className="block text-slate-600 font-bold mb-1">
            Authorization Remarks (Optional):
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add optional notes for the audit trail..."
            rows={2}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(comment);
              setComment('');
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Authorizing...' : 'Authorize & Approve'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── 2. REJECT REQUEST DIALOG (MANDATORY REASON) ───
interface RejectRequestDialogProps {
  isOpen: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function RejectRequestDialog({
  isOpen,
  request,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectRequestDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);

  if (!request) return null;

  const handleReject = () => {
    if (!reason.trim()) {
      setError(true);
      return;
    }
    setError(false);
    onConfirm(reason);
    setReason('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Operational Request"
      description={`Request ID: ${request.id} • ${request.requestType}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-sans">
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
          <div className="flex items-center gap-2 font-bold mb-1">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Confirm Rejection of {request.entityName}</span>
          </div>
          <p className="text-[11px] text-rose-700 leading-relaxed">
            Rejecting this request closes the current workflow. A clear reason is required for compliance and reporting.
          </p>
        </div>

        {/* Mandatory Rejection Reason */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">
            Mandatory Rejection Justification <span className="text-rose-500">*</span>:
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError(false);
            }}
            placeholder="Explain why this request cannot be authorized (e.g., Conflicts with credit limits, missing NAAC documentation)..."
            rows={3}
            required
            className={`w-full p-2.5 bg-slate-50 border rounded-xl text-slate-800 outline-none text-xs ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                : 'border-slate-200 focus:ring-2 focus:ring-rose-500'
            }`}
          />
          {error && (
            <p className="text-rose-600 text-[11px] font-semibold mt-1">
              Please enter a rejection justification before proceeding.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={isLoading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Rejecting...' : 'Confirm Rejection'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── 3. REQUEST CHANGES DIALOG (MANDATORY INSTRUCTIONS) ───
interface RequestChangesDialogProps {
  isOpen: boolean;
  request: ApprovalRequest | null;
  onClose: () => void;
  onConfirm: (instructions: string) => void;
  isLoading?: boolean;
}

export function RequestChangesDialog({
  isOpen,
  request,
  onClose,
  onConfirm,
  isLoading = false,
}: RequestChangesDialogProps) {
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState(false);

  if (!request) return null;

  const handleRequestChanges = () => {
    if (!instructions.trim()) {
      setError(true);
      return;
    }
    setError(false);
    onConfirm(instructions);
    setInstructions('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Changes from Submitter"
      description={`Request ID: ${request.id} • Return to ${request.submittedBy.name}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-sans">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
          <div className="flex items-center gap-2 font-bold mb-1">
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Return Request for Correction</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            The request status will become <strong>CHANGES REQUIRED</strong>. The submitter can update the specific fields and resubmit.
          </p>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">
            Required Changes / Feedback Instructions <span className="text-amber-600">*</span>:
          </label>
          <textarea
            value={instructions}
            onChange={(e) => {
              setInstructions(e.target.value);
              if (e.target.value.trim()) setError(false);
            }}
            placeholder="e.g., Please adjust the technology fee component and align with academic semester 2 regulations before resubmitting..."
            rows={3}
            required
            className={`w-full p-2.5 bg-slate-50 border rounded-xl text-slate-800 outline-none text-xs ${
              error
                ? 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                : 'border-slate-200 focus:ring-2 focus:ring-amber-500'
            }`}
          />
          {error && (
            <p className="text-amber-700 text-[11px] font-semibold mt-1">
              Please specify the required revisions.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRequestChanges}
            disabled={isLoading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Submitting...' : 'Send Changes Request'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

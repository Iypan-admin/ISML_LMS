// ============================================================================
// ISML COLLEGE LMS — ACADEMIC APPROVAL DETAIL DRAWER
// Right-side Slide-Over Form for In-Depth Review, Decision & Audit Trail
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  User,
  BookOpen,
  Layers,
  Calendar,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
  MessageSquare,
  Award,
  CheckSquare,
  UserCheck
} from 'lucide-react';
import { AcademicApprovalItem } from '@/services/academicApprovalStore';

interface AcademicApprovalDetailDrawerProps {
  isOpen: boolean;
  item: AcademicApprovalItem | null;
  onClose: () => void;
  onApprove: (id: string, remarks?: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestChanges: (id: string, instructions: string) => void;
}

export default function AcademicApprovalDetailDrawer({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject,
  onRequestChanges,
}: AcademicApprovalDetailDrawerProps) {
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'CHANGES' | null>(null);

  useEffect(() => {
    setRemarks('');
    setActionType(null);
  }, [item]);

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

  if (!isOpen || !item) return null;

  const isPending = item.status === 'PENDING';

  const handleExecuteAction = () => {
    if (actionType === 'APPROVE') {
      onApprove(item.id, remarks || 'Approved by Academic Manager');
      onClose();
    } else if (actionType === 'REJECT') {
      if (!remarks.trim()) {
        alert('Please specify a rejection reason for the audit log.');
        return;
      }
      onReject(item.id, remarks);
      onClose();
    } else if (actionType === 'CHANGES') {
      if (!remarks.trim()) {
        alert('Please enter change instructions for the tutor/faculty.');
        return;
      }
      onRequestChanges(item.id, remarks);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Right-Side Slide-Over Form */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-[#0052CC] rounded-md">
                {item.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  item.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800'
                    : item.status === 'CHANGES_REQUESTED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800 animate-pulse'
                }`}
              >
                {item.status.replace('_', ' ')}
              </span>
              {item.urgency === 'CRITICAL' && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                  Critical Urgency
                </span>
              )}
            </div>
            <h2 className="text-base font-extrabold text-[#0B2447] mt-1.5">
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Summary Banner */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
              Core Proposal / Request Context
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {item.description}
            </p>
          </div>

          {/* Scope & Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Course & Level
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <BookOpen className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>{item.courseCode}</span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">{item.courseName}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Target Batch / Cohort
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">{item.batchName}</span>
              </div>
              {item.details.totalLearners && (
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {item.details.totalLearners} Enrolled Learners
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Requested By
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>{item.submittedBy.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.submittedBy.role}</p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Submission Timestamp
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.submittedAt}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Academic Intake 2026</p>
            </div>
          </div>

          {/* Detailed Verification Payload */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verification Checklist & Payload Data</span>
            </h3>

            {item.details.duration && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-600 font-semibold">Class / Exam Duration:</span>
                <span className="font-bold text-slate-900">{item.details.duration}</span>
              </div>
            )}

            {item.details.scoreSummary && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-600 font-semibold block">Performance & Score Summary:</span>
                <span className="font-bold text-emerald-700 block">{item.details.scoreSummary}</span>
              </div>
            )}

            {item.details.evidenceOrRemarks && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-600 font-semibold block">Tutor Justification / Documentation:</span>
                <p className="text-slate-800 leading-relaxed font-medium">{item.details.evidenceOrRemarks}</p>
              </div>
            )}

            {/* Proposed Modifications Diff */}
            {item.details.proposedChanges && item.details.proposedChanges.length > 0 && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                  Proposed Allocation / Schedule Diff
                </span>
                {item.details.proposedChanges.map((diff, dIdx) => (
                  <div key={dIdx} className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-amber-200">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Current {diff.field}:</span>
                      <span className="font-semibold text-rose-700 line-through">{diff.currentVal}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Proposed {diff.field}:</span>
                      <span className="font-bold text-emerald-700">{diff.proposedVal}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Decision History if Already Approved / Rejected */}
          {!isPending && item.decisionRemarks && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Recorded Decision Log
              </span>
              <p className="text-slate-900 font-semibold">{item.decisionRemarks}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>By: <strong>{item.decisionBy || 'Academic Manager'}</strong></span>
                <span>At: {item.decidedAt || 'Recorded'}</span>
              </div>
            </div>
          )}

          {/* Interactive Decision Form for Pending Requests */}
          {isPending && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300/80 space-y-4">
              <h3 className="text-xs font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0052CC]" />
                <span>Executive Decision Form</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('APPROVE')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('CHANGES')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    actionType === 'CHANGES'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('REJECT')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    actionType === 'REJECT'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white text-rose-800 border border-rose-300 hover:bg-rose-50'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Manager Comments & Directives {actionType === 'REJECT' || actionType === 'CHANGES' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    actionType === 'APPROVE'
                      ? 'e.g. Authorized for ERP sync and live session coverage.'
                      : actionType === 'CHANGES'
                      ? 'e.g. Please revise audio questions #4 and #7 before re-submitting.'
                      : actionType === 'REJECT'
                      ? 'e.g. Schedule clash exists with another scheduled French B2 webinar.'
                      : 'Select Approve, Changes, or Reject above, then add audit notes...'
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              {actionType && (
                <button
                  type="button"
                  onClick={handleExecuteAction}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionType === 'CHANGES'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    Confirm {actionType === 'APPROVE' ? 'Approval & Authorize' : actionType === 'CHANGES' ? 'Request Changes' : 'Rejection'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}

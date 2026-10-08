// ============================================================================
// ISML COLLEGE LMS — REUSABLE SLIDE-OVER DELETE CONFIRMATION DRAWER
// Replaces standard browser alerts & modals with a sleek right-side drawer
// ============================================================================

"use client";

import React, { useEffect, useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface DeleteConfirmDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  entityType: string;
  entityName?: string;
  entityCode?: string;
  description?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmDrawer({
  isOpen,
  onClose,
  onConfirm,
  title,
  entityType,
  entityName = '',
  entityCode,
  description,
  isDeleting = false,
}: DeleteConfirmDrawerProps) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleDelete = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform ease-out duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white flex items-center justify-between border-b border-rose-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {title || `Delete ${entityType}`}
                </h2>
                <p className="text-[11px] text-rose-300 font-medium">Permanent Record Deletion</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Warning Callout Banner */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 leading-relaxed">
                <span className="font-bold block">Caution: Irreversible Action</span>
                {description ||
                  `You are about to delete this ${entityType.toLowerCase()}. Any dependent records, analytics, and historical mappings associated with this entry will be removed or unlinked.`}
              </div>
            </div>

            {/* Target Entity Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Target {entityType}
                </span>
                {entityCode && (
                  <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {entityCode}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#0B2447] leading-snug">
                {entityName}
              </p>
            </div>

            {/* Safety confirmation reminder */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Administrative Authorization Check
              </p>
              <p className="mt-1 text-slate-600">
                Please verify that no active batches, examinations, or fee dues depend on this record before confirming deletion.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : `Confirm Delete`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

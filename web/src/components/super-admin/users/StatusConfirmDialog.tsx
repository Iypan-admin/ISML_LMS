// ============================================================================
// ISML COLLEGE LMS — USER STATUS CONFIRMATION DIALOG
// Production-Grade Activation / Deactivation / Suspension Modal
// Strictly Zero Native alerts/confirms — Responsive Action Drawer/Dialog
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Lock,
  UserX,
  UserCheck,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { SuperAdminUser, UserStatus } from '@/types/rbac';

interface StatusConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SuperAdminUser | null;
  targetAction: 'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND';
  onStatusUpdated: (userId: string, newStatus: UserStatus) => void;
}

export default function StatusConfirmDialog({
  isOpen,
  onClose,
  user,
  targetAction,
  onStatusUpdated,
}: StatusConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const getActionDetails = () => {
    switch (targetAction) {
      case 'DEACTIVATE':
        return {
          title: 'Deactivate LMS User Account?',
          newStatus: 'INACTIVE' as UserStatus,
          message: 'The user will be immediately logged out of all active web and mobile sessions. They will no longer be able to access course materials, submit assignments, or view institutional resources until reactivated.',
          confirmLabel: 'Deactivate Account',
          buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white',
          icon: <UserX className="w-5 h-5 text-rose-600" />,
          accentBg: 'bg-rose-50 border-rose-200 text-rose-800',
        };
      case 'SUSPEND':
        return {
          title: 'Suspend LMS User Account?',
          newStatus: 'SUSPENDED' as UserStatus,
          message: 'Account privileges will be suspended due to institutional review or policy non-compliance. All automated scheduled activities and notifications will be paused.',
          confirmLabel: 'Suspend Account',
          buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
          icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
          accentBg: 'bg-amber-50 border-amber-200 text-amber-800',
        };
      case 'ACTIVATE':
      default:
        return {
          title: 'Activate LMS User Account?',
          newStatus: 'ACTIVE' as UserStatus,
          message: 'Account credentials and single-sign-on access will be restored immediately. The user will regain role-permitted navigation and academic privileges.',
          confirmLabel: 'Activate Account',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
          accentBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        };
    }
  };

  const action = getActionDetails();

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onStatusUpdated(user.id, action.newStatus);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={action.title}
      description={`User ID: ${user.id} • ${user.email}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* User Card */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-10 h-10 rounded-full bg-[#0B2447] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-[#0B2447] text-sm truncate">{user.name}</h4>
            <p className="text-slate-500 truncate text-[11px]">{user.email}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Current Status</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                user.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {user.status}
            </span>
          </div>
        </div>

        {/* Warning / Impact Card */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${action.accentBg}`}>
          <div className="shrink-0 mt-0.5">{action.icon}</div>
          <div className="text-[11px] leading-relaxed">
            <p className="font-bold mb-0.5">Impact Assessment Notice</p>
            <p>{action.message}</p>
          </div>
        </div>

        {/* Audit Note */}
        <p className="text-[10px] text-slate-400 italic">
          Audit Note: This administrative lifecycle action is logged with your Super Admin session ID and IP address for compliance.
        </p>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs ${action.buttonClass} disabled:opacity-50`}
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <span>{action.confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

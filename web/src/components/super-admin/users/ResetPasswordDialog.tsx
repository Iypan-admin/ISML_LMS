// ============================================================================
// ISML COLLEGE LMS — RESET PASSWORD DIALOG
// Zero-Plaintext-Password Security Model
// Dispatches Backend Tokenized Reset Workflow & Direct Credential Email
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Lock,
  Send,
  X,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { SuperAdminUser } from '@/types/rbac';

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SuperAdminUser | null;
  onPasswordResetInitiated: (userId: string) => void;
}

export default function ResetPasswordDialog({
  isOpen,
  onClose,
  user,
  onPasswordResetInitiated,
}: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetState, setResetState] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [deliveryStatus, setDeliveryStatus] = useState<'SENT' | 'FAILED'>('SENT');

  // Reset state when opening a new user
  React.useEffect(() => {
    if (isOpen) {
      setResetState('IDLE');
      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  if (!user) return null;

  const handleTriggerReset = () => {
    setIsSubmitting(true);
    // Simulate backend cryptographic token generation & transactional email dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setResetState('SUCCESS');
      setDeliveryStatus('SENT');
      onPasswordResetInitiated(user.id);
    }, 700);
  };

  const handleRetryEmail = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setDeliveryStatus('SENT');
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Initiate Secure Password Reset"
      description={`User: ${user.name} (${user.id})`}
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
          <span className="font-semibold text-xs text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {user.roleName}
          </span>
        </div>

        {resetState === 'IDLE' ? (
          <>
            {/* Zero Password Security Notice */}
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 flex items-start gap-3 text-blue-900 leading-relaxed">
              <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs mb-1">Zero-Plaintext Security Architecture</p>
                <p className="text-[11px] text-blue-800">
                  In compliance with ISO 27001 and FERPA standards, Super Admins never view or enter passwords. 
                  When you initiate a reset:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-[11px] text-blue-800">
                  <li>The backend authentication microservice generates an encrypted temporary credential</li>
                  <li>Existing active user sessions are safely revoked</li>
                  <li>A verified password-reset magic link and initial PIN are dispatched to <strong className="font-semibold">{user.email}</strong></li>
                  <li>The user is prompted to establish a new strong password on first login</li>
                </ul>
              </div>
            </div>

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
                onClick={handleTriggerReset}
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Generating Secure Token...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Generate & Send Reset Link</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Result Confirmation View */
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Password Reset Initiated Successfully</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                A temporary credential has been securely minted on the server and queued for transactional delivery. 
                Zero passwords were exposed to the browser console, memory, or local storage.
              </p>
            </div>

            {/* Email Delivery Status Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Delivery Target:</span>
                <span className="font-mono text-slate-800 font-bold">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Email Delivery Status:</span>
                {deliveryStatus === 'SENT' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Email Sent</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Email Delivery Failed</span>
                  </span>
                )}
              </div>
            </div>

            {deliveryStatus === 'FAILED' && (
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                <span className="text-[11px]">Email gateway timed out. Retry without re-minting token?</span>
                <button
                  type="button"
                  onClick={handleRetryEmail}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Email</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#0B2447] text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

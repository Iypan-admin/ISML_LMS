// ============================================================================
// ISML COLLEGE LMS — UNIVERSAL PASSWORD CHANGE VIEW FOR ALL 9 PORTALS
// Supports: Super Admin, Academic Manager, Finance Manager, Sales Manager,
// College Admin, School Admin, Tutor, Student, Parent
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useToast } from '@/context/ToastContext';

interface ChangePasswordViewProps {
  portalRole: string; // e.g. 'SUPER_ADMIN', 'ACADEMIC_MANAGER', 'FINANCE_MANAGER', etc.
  portalTitle: string; // e.g. 'Super Admin Portal', 'Academic Manager Hub', etc.
  defaultBreadcrumbParent?: string;
  accentColor?: string; // e.g. '#0052CC', '#0B2447', etc.
}

export default function UniversalChangePasswordView({
  portalRole,
  portalTitle,
  defaultBreadcrumbParent = 'Security & Profile',
  accentColor = '#0052CC',
}: ChangePasswordViewProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [currentEmail, setCurrentEmail] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load current logged in user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('isml_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u) {
          setCurrentEmail(u.email || '');
          setCurrentName(u.name || '');
        }
      }
    } catch {}
  }, []);

  // Password Strength Evaluation
  const passwordStrength = React.useMemo(() => {
    if (!newPassword) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-600' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!oldPassword) {
      setErrorMsg('Please enter your current old password.');
      return;
    }
    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }
    if (oldPassword === newPassword) {
      setErrorMsg('New password must be different from your current old password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/portals/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentEmail,
          currentPassword: oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to update password');
      }

      setSuccessMsg(data.message || 'Password updated successfully!');
      showSuccess('Password updated successfully! Your account credentials have been synchronized.');

      // Also update localStorage so subsequent local checks pass
      try {
        const stored = localStorage.getItem('isml_user');
        if (stored) {
          const u = JSON.parse(stored);
          u.hasCustomPassword = true;
          localStorage.setItem('isml_user', JSON.stringify(u));
        }
      } catch {}

      // Reset form fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating your password.');
      showError(err.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: defaultBreadcrumbParent },
          { label: 'Security & Password Settings' },
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              {portalTitle}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600">
              Account Security & Cryptographic Auth
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-[#0052CC]" />
            <span>Change Portal Password</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your access credentials. Enforced for institutional integrity and access audit compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center font-bold text-xs shrink-0">
            {currentName ? currentName.charAt(0) : 'U'}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{currentName || 'Verified Admin'}</p>
            <p className="text-[10px] font-mono text-slate-500 truncate max-w-[160px]">{currentEmail || 'admin@isml.edu'}</p>
          </div>
        </div>
      </div>

      {/* Main Password Change Form Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900">Update Credentials</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your existing password and choose a secure replacement.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Success: </span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Email (Read-Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Email ID
              </label>
              <input
                type="text"
                value={currentEmail}
                readOnly
                aria-label="Account Email ID"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed select-all"
              />
            </div>

            {/* Old Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Current (Old) Password <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showOldPwd ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPwd(!showOldPwd)}
                  aria-label={showOldPwd ? 'Hide current password' : 'Show current password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  aria-label={showNewPwd ? 'Hide new password' : 'Show new password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={`font-bold ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  aria-label={showConfirmPwd ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Reset Fields
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0043a8] active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Security Records...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Save & Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Guidance Column */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Password Security Rules</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] mt-1.5 shrink-0" />
                <span>Minimum <strong>6 characters</strong> in length.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] mt-1.5 shrink-0" />
                <span>Include uppercase (A-Z) and numeric digits (0-9).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] mt-1.5 shrink-0" />
                <span>Never share your password or write it in plain notes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] mt-1.5 shrink-0" />
                <span>All credential revisions are logged for security compliance.</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0052CC] block">
              Multi-Portal Single Sign-On
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Updating your password here will immediately update your login authentication across both the web portals and mobile clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// ISML COLLEGE LMS — EDIT USER ROLE MODAL
// High-Impact Role Change Workflow with Permission Difference Analysis
// Production RBAC Protection (USER_ASSIGN_ROLE)
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  UserCog,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { SuperAdminUser, RoleDefinition, PermissionId } from '@/types/rbac';
import { mockRoles } from '@/mock/superAdminData';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SuperAdminUser | null;
  onRoleAssigned: (userId: string, newRoleId: string, newRoleName: string, permissions: PermissionId[]) => void;
}

export default function EditRoleModal({
  isOpen,
  onClose,
  user,
  onRoleAssigned,
}: EditRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(user?.roleId || mockRoles[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected role when user opens
  React.useEffect(() => {
    if (user?.roleId) {
      setSelectedRoleId(user.roleId);
    }
  }, [user]);

  const currentRole = useMemo(() => {
    if (!user) return null;
    return mockRoles.find((r) => r.id === user.roleId) || {
      id: user.roleId,
      name: user.roleName,
      code: user.roleCode || 'CUSTOM',
      permissions: user.permissions || [],
      description: 'Current assigned role',
    };
  }, [user]);

  const newRole = useMemo(() => {
    return mockRoles.find((r) => r.id === selectedRoleId) || mockRoles[0];
  }, [selectedRoleId]);

  const isSameRole = user?.roleId === selectedRoleId;

  // Permission difference analysis
  const currentPermSet = useMemo(() => new Set(currentRole?.permissions || []), [currentRole]);
  const newPermSet = useMemo(() => new Set(newRole.permissions || []), [newRole]);

  const addedPermissions = useMemo(() => {
    return (newRole.permissions || []).filter((p) => !currentPermSet.has(p));
  }, [newRole, currentPermSet]);

  const removedPermissions = useMemo(() => {
    return (currentRole?.permissions || []).filter((p) => !newPermSet.has(p));
  }, [currentRole, newPermSet]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSameRole) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onRoleAssigned(user.id, newRole.id, newRole.name, newRole.permissions);
      setIsSubmitting(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <UserCog className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Modify User Role & Privileges</h3>
              <p className="text-[11px] text-blue-200 truncate max-w-xs">{user.name} ({user.id})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 hidden" />
            <span className="text-sm font-bold">✕</span>
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* User Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-[#0B2447] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-[#0B2447] text-xs sm:text-sm truncate">{user.name}</h4>
              <p className="text-slate-500 truncate text-[11px]">{user.email}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Current Role</span>
              <span className="font-bold text-[11px] text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {user.roleName}
              </span>
            </div>
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 text-xs">
              Select New Platform Role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-[#0052CC] focus:border-transparent outline-none cursor-pointer"
              >
                {mockRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.permissions.length} privileges granted)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {newRole.description || 'Defines platform-wide functional capabilities and route visibility.'}
            </p>
          </div>

          {/* Role Impact Transition Summary */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-normal">From:</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-300 text-slate-800">
                  {currentRole?.name}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-normal">To:</span>
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold shadow-2xs">
                  {newRole.name}
                </span>
              </div>
            </div>

            {/* Warning Banner */}
            {!isSameRole && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Privilege & Access Reallocation Notice</p>
                  <p>
                    This role change will immediately modify the user&apos;s available navigation modules, 
                    academic data access boundaries, and operational authorization tokens.
                  </p>
                </div>
              </div>
            )}

            {/* Granular Permission Delta */}
            {!isSameRole && (
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Added Privileges ({addedPermissions.length})</span>
                  </div>
                  {addedPermissions.length > 0 ? (
                    <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px] text-emerald-700">
                      {addedPermissions.slice(0, 5).map((p) => (
                        <div key={p} className="truncate">• {p}</div>
                      ))}
                      {addedPermissions.length > 5 && (
                        <div className="text-emerald-600 font-sans italic">
                          +{addedPermissions.length - 5} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </div>

                <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="font-bold text-rose-800 flex items-center gap-1 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Revoked Privileges ({removedPermissions.length})</span>
                  </div>
                  {removedPermissions.length > 0 ? (
                    <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px] text-rose-700">
                      {removedPermissions.slice(0, 5).map((p) => (
                        <div key={p} className="truncate">• {p}</div>
                      ))}
                      {removedPermissions.length > 5 && (
                        <div className="text-rose-600 font-sans italic">
                          +{removedPermissions.length - 5} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg sm:rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer text-[11px] sm:text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSameRole}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#0052CC] text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-[11px] sm:text-xs"
            >
              {isSubmitting ? (
                <span>Updating Role...</span>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Confirm & Update Role</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

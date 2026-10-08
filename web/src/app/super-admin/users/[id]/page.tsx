// ============================================================================
// ISML COLLEGE LMS — USER ACCOUNT DETAIL PAGE
// Full IAM Profile, Academic Mapping, Security Status & Dynamic RBAC Capabilities
// Strictly Zero Plaintext Passwords — Production Grade Access Inspection
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Layers,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  UserCog,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Compass,
  FileText,
  Activity,
  History,
  CheckSquare,
  BookOpen,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatusBadge from '@/components/common/StatusBadge';
import { Can, useRbac } from '@/context/AuthRbacContext';
import { SuperAdminUser, UserStatus, PermissionId } from '@/types/rbac';
import { mockUsers, mockRoles } from '@/mock/superAdminData';
import { SUPER_ADMIN_MENU_GROUPS } from '@/config/menu';
import { useToast } from '@/context/ToastContext';
import EditRoleModal from '@/components/super-admin/users/EditRoleModal';
import StatusConfirmDialog from '@/components/super-admin/users/StatusConfirmDialog';
import ResetPasswordDialog from '@/components/super-admin/users/ResetPasswordDialog';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { hasPermission } = useRbac();
  const { showSuccess, showInfo } = useToast();

  // Find user from mock dataset
  const initialUser = useMemo(() => {
    return mockUsers.find((u) => u.id === userId) || null;
  }, [userId]);

  const [user, setUser] = useState<SuperAdminUser | null>(initialUser);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACADEMIC' | 'ACCESS' | 'ACTIVITY'>('OVERVIEW');

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [statusDialogTarget, setStatusDialogTarget] = useState<{
    action: 'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND';
  } | null>(null);

  // Derive accessible menus dynamically from centralized RBAC config
  const accessibleMenus = useMemo(() => {
    if (!user) return [];
    const userPermSet = new Set(user.permissions);
    const accessible: { id: string; label: string; group: string; route: string }[] = [];

    SUPER_ADMIN_MENU_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        const canAccess = item.requiredPermissions.every((perm) => userPermSet.has(perm));
        if (canAccess) {
          accessible.push({
            id: item.id,
            label: item.label,
            group: group.title,
            route: item.route,
          });
        }
      });
    });

    return accessible;
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6 font-sans pb-12">
        <Breadcrumbs
          items={[
            { label: 'Administration', href: '/super-admin/users' },
            { label: 'Users', href: '/super-admin/users' },
            { label: 'User Not Found' },
          ]}
        />
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0B2447]">User Account Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            No institutional user record matches identifier &ldquo;{userId}&rdquo;.
          </p>
          <Link
            href="/super-admin/users"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0052CC] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Users Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Handlers
  const handleRoleAssigned = (
    uId: string,
    newRoleId: string,
    newRoleName: string,
    permissions: PermissionId[]
  ) => {
    setUser((prev) =>
      prev ? { ...prev, roleId: newRoleId, roleName: newRoleName, permissions } : null
    );
    showSuccess(`Assigned new role "${newRoleName}" to ${user.name}.`);
  };

  const handleStatusUpdated = (uId: string, newStatus: UserStatus) => {
    setUser((prev) => (prev ? { ...prev, status: newStatus } : null));
    showSuccess(`User account status updated to ${newStatus}.`);
  };

  const handlePasswordResetInitiated = () => {
    showInfo(`Password reset workflow dispatched to ${user.email}.`);
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      <Breadcrumbs
        items={[
          { label: 'Administration', href: '/super-admin/users' },
          { label: 'Users', href: '/super-admin/users' },
          { label: user.name },
        ]}
      />

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0B2447] text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
                  {user.name}
                </h1>
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {user.id}
                </span>
                <StatusBadge status={user.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
                {user.mobile && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user.mobile}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {user.collegeName}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Can permission="USER_ASSIGN_ROLE">
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCog className="w-4 h-4" />
                <span>Change Role</span>
              </button>
            </Can>

            <Can permission="USER_RESET_PASSWORD">
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Reset Password</span>
              </button>
            </Can>

            <Can permission="USER_STATUS_UPDATE">
              <button
                onClick={() =>
                  setStatusDialogTarget({
                    action: user.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE',
                  })
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  user.status === 'ACTIVE'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {user.status === 'ACTIVE' ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Activate</span>
                  </>
                )}
              </button>
            </Can>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mt-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Security
          </button>
          <button
            onClick={() => setActiveTab('ACADEMIC')}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'ACADEMIC'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Academic Association
          </button>
          <button
            onClick={() => setActiveTab('ACCESS')}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'ACCESS'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            RBAC & Modules Access ({accessibleMenus.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVITY')}
            className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'ACTIVITY'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit & Login Activity
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Security */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity & Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal & Contact Information</span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs text-slate-600">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Full Legal Name:</span>
                <span className="font-bold text-slate-800">{user.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Primary Email:</span>
                <span className="font-medium text-slate-800">{user.email}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Mobile Phone:</span>
                <span className="font-medium text-slate-800">{user.mobile || '— Not Provided —'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Institution ID:</span>
                <span className="font-mono text-slate-800">{user.collegeId}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Account Created:</span>
                <span className="font-medium text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Account Security Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Authentication & Security Posture</span>
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Email Verification:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Password Encryption:</span>
                <span className="font-mono text-[11px] text-slate-700 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  Argon2id / PBKDF2 Hashed
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Plaintext Credentials:</span>
                <span className="text-[11px] text-slate-500 italic">Never Stored / Not Accessible</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Last Successful Login:</span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  {user.lastLoginAt.includes('T')
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : user.lastLoginAt}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
              <p className="font-bold mb-1">Zero-Plaintext Compliance Guarantee</p>
              <p>
                As Super Admin, you cannot inspect or set passwords manually. 
                Use the &ldquo;Reset Password&rdquo; control to generate a cryptographically sealed temporary access link 
                emailed directly to the verified recipient.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Academic Association */}
      {activeTab === 'ACADEMIC' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Institutional & Academic Placement</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                College / Institution
              </span>
              <p className="font-bold text-[#0B2447] text-sm mt-1">{user.collegeName}</p>
              <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">{user.collegeId}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Department
              </span>
              <p className="font-bold text-[#0B2447] text-sm mt-1">
                {user.departmentName || 'Campus Wide / All Departments'}
              </p>
              <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">
                {user.departmentId || 'GLOBAL'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Program / Degree
              </span>
              <p className="font-bold text-[#0B2447] text-sm mt-1">
                {user.programName || 'Not Restricted to Program'}
              </p>
              <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">
                {user.programId || 'ALL_PROGRAMS'}
              </span>
            </div>

            {user.batchName && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Batch Cohort
                </span>
                <p className="font-bold text-[#0B2447] text-sm mt-1">{user.batchName}</p>
                <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">{user.batchId}</span>
              </div>
            )}

            {user.semesterNumber && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Current Term
                </span>
                <p className="font-bold text-[#0B2447] text-sm mt-1">Semester {user.semesterNumber}</p>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Regular Enrollment</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Access & RBAC */}
      {activeTab === 'ACCESS' && (
        <div className="space-y-6">
          {/* Accessible Menus Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Accessible Navigation Modules</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated dynamically from role &ldquo;{user.roleName}&rdquo; required permissions
                </p>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 text-[#0052CC] rounded-lg font-bold text-xs border border-blue-200">
                {accessibleMenus.length} Navigation Menus Authorized
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {accessibleMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {menu.group}
                  </span>
                  <p className="font-bold text-[#0B2447] text-xs mt-0.5">{menu.label}</p>
                  <span className="font-mono text-[10px] text-[#0052CC] mt-1 block">
                    {menu.route}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Granular Permission Chips */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Granted Low-Level Permissions ({user.permissions.length})</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Activity */}
      {activeTab === 'ACTIVITY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>Recent Administrative & Authentication Trail</span>
          </h3>

          <div className="space-y-3">
            {[
              {
                event: 'LMS Platform SSO Login',
                timestamp: user.lastLoginAt,
                actor: user.name,
                status: 'SUCCESS',
                details: 'Authenticated via SAML/OAuth Single Sign-On session.',
              },
              {
                event: 'Assigned Role Verification',
                timestamp: '2026-10-06T10:30:00Z',
                actor: 'Super Admin Security Authority',
                status: 'AUDITED',
                details: `Entitlements checked for role "${user.roleName}".`,
              },
              {
                event: 'Account Provisioned & Initial Credentials Dispatched',
                timestamp: user.createdAt,
                actor: 'System Provisioning Engine',
                status: 'COMPLETED',
                details: 'Encrypted token sent to registered email address.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.event}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">
                    {new Date(item.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">By: {item.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        user={user}
        onRoleAssigned={handleRoleAssigned}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        user={user}
        onPasswordResetInitiated={handlePasswordResetInitiated}
      />

      {/* Status Confirm Dialog */}
      <StatusConfirmDialog
        isOpen={!!statusDialogTarget}
        onClose={() => setStatusDialogTarget(null)}
        user={user}
        targetAction={statusDialogTarget?.action || 'ACTIVATE'}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}

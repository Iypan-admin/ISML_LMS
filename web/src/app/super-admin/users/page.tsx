// ============================================================================
// ISML COLLEGE LMS — USERS MANAGEMENT
// Enterprise User Directory, Role Assignment & Account Lifecycle Controls
// RBAC: USER_VIEW, USER_CREATE, USER_ASSIGN_ROLE, USER_STATUS_UPDATE, USER_RESET_PASSWORD
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  KeyRound,
  Building2,
  Clock,
  UserCog,
  Download,
  Search,
  Filter,
  GraduationCap,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import { Can, useRbac } from '@/context/AuthRbacContext';
import { SuperAdminUser, RoleDefinition, UserStatus, PermissionId } from '@/types/rbac';
import {
  mockUsers,
  mockRoles,
  mockInstitutions,
  mockDepartments,
} from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import AddUserDrawer from '@/components/super-admin/users/AddUserDrawer';
import EditRoleModal from '@/components/super-admin/users/EditRoleModal';
import StatusConfirmDialog from '@/components/super-admin/users/StatusConfirmDialog';
import ResetPasswordDialog from '@/components/super-admin/users/ResetPasswordDialog';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function UsersPage() {
  const { hasPermission } = useRbac();
  const { showSuccess, showInfo } = useToast();
  const { selectedCollegeId, setSelectedCollegeId, isOverall } = useCollege();

  const [users, setUsers] = useState<SuperAdminUser[]>(mockUsers);
  
  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<SuperAdminUser | null>(null);
  const [resetModalUser, setResetModalUser] = useState<SuperAdminUser | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<SuperAdminUser | null>(null);
  const [statusDialogTarget, setStatusDialogTarget] = useState<{
    user: SuperAdminUser;
    action: 'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND';
  } | null>(null);

  const handleDeleteUser = () => {
    if (!deleteUserTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
    showSuccess(`User account for "${deleteUserTarget.name}" has been deleted.`);
    setDeleteUserTarget(null);
  };

  // Filter States
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    const inactive = users.filter((u) => u.status === 'INACTIVE' || u.status === 'SUSPENDED').length;
    const students = users.filter((u) => u.roleName.toLowerCase().includes('student')).length;
    return { total, active, inactive, students };
  }, [users]);

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.roleId !== roleFilter) return false;
      if (!isOverall && selectedCollegeId !== 'ALL' && u.collegeId !== selectedCollegeId) return false;
      if (deptFilter !== 'ALL' && u.departmentId !== deptFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.roleName.toLowerCase().includes(q) ||
          (u.departmentName && u.departmentName.toLowerCase().includes(q)) ||
          (u.programName && u.programName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [users, roleFilter, selectedCollegeId, isOverall, deptFilter, statusFilter, searchQuery]);

  // Handlers
  const handleUserCreated = (newUser: SuperAdminUser) => {
    setUsers((prev) => [newUser, ...prev]);
    showSuccess(`Account for ${newUser.name} created. Credentials dispatched.`);
  };

  const handleRoleAssigned = (
    userId: string,
    newRoleId: string,
    newRoleName: string,
    permissions: PermissionId[]
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, roleId: newRoleId, roleName: newRoleName, permissions }
          : u
      )
    );
    showSuccess(`Assigned new role "${newRoleName}" successfully.`);
  };

  const handleStatusUpdated = (userId: string, newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    showSuccess(`User account status updated to ${newStatus}.`);
  };

  const handleToggleUser = (user: SuperAdminUser) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    if (nextStatus === 'SUSPENDED') {
      showInfo(`User "${user.name}" account suspended.`);
    } else {
      showSuccess(`User "${user.name}" account activated.`);
    }
  };

  const handlePasswordResetInitiated = (userId: string) => {
    showInfo(`Password reset workflow initiated for user ID ${userId}.`);
  };

  const handleExportUsers = () => {
    showSuccess('Exporting user directory to CSV (FERPA & GDPR audited).');
  };

  const columns: Column<SuperAdminUser>[] = [
    {
      key: 'id',
      header: 'User ID',
      render: (row) => (
        <span className="font-mono text-[11px] font-bold text-[#0B2447] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.id}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name & Email',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0B2447] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <Link
              href={`/super-admin/users/${row.id}`}
              className="font-bold text-[#0B2447] text-xs hover:text-[#0052CC] hover:underline block truncate"
            >
              {row.name}
            </Link>
            <p className="text-[11px] text-slate-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roleName',
      header: 'Role',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-xs text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
          {row.roleName}
        </span>
      ),
    },
    {
      key: 'collegeName',
      header: 'College',
      render: (row) => (
        <span className="text-slate-700 text-xs truncate max-w-[150px] inline-block font-medium" title={row.collegeName}>
          {row.collegeName}
        </span>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (row) => (
        <span className="text-slate-600 text-xs truncate max-w-[130px] inline-block" title={row.departmentName || 'Global'}>
          {row.departmentName || '— Global Access —'}
        </span>
      ),
    },
    {
      key: 'programName',
      header: 'Program',
      render: (row) => (
        <span className="text-slate-500 text-xs truncate max-w-[120px] inline-block" title={row.programName || 'N/A'}>
          {row.programName || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-[140px]',
      render: (row) => (
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full">
          <StatusToggleSwitch
            checked={row.status === 'ACTIVE'}
            onChange={() => handleToggleUser(row)}
            activeLabel="Active"
            inactiveLabel="Suspended"
          />
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      render: (row) => (
        <span className="text-slate-500 text-[11px] whitespace-nowrap">
          {row.lastLoginAt.includes('T')
            ? new Date(row.lastLoginAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : row.lastLoginAt}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right min-w-[90px]',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* View Details */}
          <Link
            href={`/super-admin/users/${row.id}`}
            className="p-1.5 text-slate-400 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors inline-block"
            title="View User Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* Edit / Assign Role */}
          <Can permission="USER_ASSIGN_ROLE">
            <button
              onClick={() => setRoleModalUser(row)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Assign / Change Role"
            >
              <UserCog className="w-3.5 h-3.5" />
            </button>
          </Can>

          {/* Reset Password */}
          <Can permission="USER_RESET_PASSWORD">
            <button
              onClick={() => setResetModalUser(row)}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
              title="Trigger Secure Password Reset"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
          </Can>

          {/* Delete User */}
          <button
            onClick={() => setDeleteUserTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete User Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Users' }]} />

      <CollegeFilterBar />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Users
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Manage LMS accounts, roles and access across institutions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Can permission="USER_EXPORT">
            <button
              onClick={handleExportUsers}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </Can>

          <Can permission="USER_CREATE">
            <button
              id="create-user-btn"
              onClick={() => setIsAddUserOpen(true)}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>+ Create User</span>
            </button>
          </Can>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow min-h-[94px] sm:min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Total Users</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50 text-[#0052CC] flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">{metrics.total}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Institutional directory</p>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow min-h-[94px] sm:min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Active Users</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">{metrics.active}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Authorized logins</p>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow min-h-[94px] sm:min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Inactive Users</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-xl sm:text-2xl font-black text-slate-700 tracking-tight">{metrics.inactive}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Suspended / Inactive</p>
          </div>
        </div>

        {/* Card 4: Students */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow min-h-[94px] sm:min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Students</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight">{metrics.students}</p>
            <Link
              href="/super-admin/students"
              className="text-[10px] sm:text-[11px] text-[#0052CC] font-bold mt-0.5 inline-flex items-center gap-0.5 hover:underline truncate"
            >
              <span>Student Hub</span>
              <ChevronRight className="w-3 h-3 shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, user ID, role or department..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              {mockRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer truncate"
            >
              <option value="ALL">🏛️ All Colleges (Overall)</option>
              {mockInstitutions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer truncate"
            >
              <option value="ALL">All Departments</option>
              {mockDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table with Mobile Responsive Card Adaptation */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        rowKey={(row) => row.id}
        mobileCardRender={(user) => (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 font-sans transition-all hover:border-slate-300">
            {/* Top Row: User Identity & Status Badge */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B2447] to-[#0052CC] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate leading-snug">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate leading-snug">{user.email}</p>
                  <span className="font-mono text-[9px] text-slate-400 block truncate">{user.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusToggleSwitch
                  checked={user.status === 'ACTIVE'}
                  onChange={() => handleToggleUser(user)}
                  activeLabel="Active"
                  inactiveLabel="Suspended"
                />
                <StatusBadge status={user.status} />
              </div>
            </div>

            {/* Middle Row: Role & Campus Scopes */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Role</span>
                <span className="font-bold text-[#0052CC] truncate block mt-0.5">{user.roleName}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">College</span>
                <span className="font-semibold text-slate-700 truncate block mt-0.5" title={user.collegeName}>
                  {user.collegeName ? user.collegeName.split(' ')[0] : 'All'}
                </span>
              </div>
            </div>

            {/* Meta Row: Dept & Last Login */}
            <div className="text-[11px] text-slate-600 bg-slate-50/70 p-2 rounded-xl flex items-center justify-between">
              <span className="truncate max-w-[160px] text-slate-600 font-medium">
                🏛️ {user.departmentName || 'Global Access'}
              </span>
              <span className="text-[10px] text-slate-400 shrink-0">
                {user.lastLoginAt.includes('T')
                  ? new Date(user.lastLoginAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : user.lastLoginAt}
              </span>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1.5">
              <Link
                href={`/super-admin/users/${user.id}`}
                className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>

              <Can permission="USER_ASSIGN_ROLE">
                <button
                  onClick={() => setRoleModalUser(user)}
                  className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                  title="Assign / Change Role"
                >
                  <UserCog className="w-4 h-4" />
                </button>
              </Can>

              <Can permission="USER_RESET_PASSWORD">
                <button
                  onClick={() => setResetModalUser(user)}
                  className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
                  title="Reset Password"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              </Can>

              <Can permission="USER_STATUS_UPDATE">
                <button
                  onClick={() =>
                    setStatusDialogTarget({
                      user,
                      action: user.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE',
                    })
                  }
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                    user.status === 'ACTIVE'
                      ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                  title={user.status === 'ACTIVE' ? 'Deactivate User Account' : 'Activate User Account'}
                >
                  {user.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
              </Can>

              {/* Delete User */}
              <button
                onClick={() => setDeleteUserTarget(user)}
                className="p-1.5 rounded-xl transition-colors cursor-pointer text-rose-600 bg-rose-50 hover:bg-rose-100"
                title="Delete User Account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      />

      {/* Delete Confirmation Right-Side Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteUserTarget}
        onClose={() => setDeleteUserTarget(null)}
        onConfirm={handleDeleteUser}
        entityType="User Account"
        entityName={deleteUserTarget?.name}
      />

      {/* Add User Right-Side Drawer */}
      <AddUserDrawer
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Edit Role Drawer */}
      <EditRoleModal
        isOpen={!!roleModalUser}
        onClose={() => setRoleModalUser(null)}
        user={roleModalUser}
        onRoleAssigned={handleRoleAssigned}
      />

      {/* Status Confirm Dialog */}
      <StatusConfirmDialog
        isOpen={!!statusDialogTarget}
        onClose={() => setStatusDialogTarget(null)}
        user={statusDialogTarget?.user || null}
        targetAction={statusDialogTarget?.action || 'ACTIVATE'}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={!!resetModalUser}
        onClose={() => setResetModalUser(null)}
        user={resetModalUser}
        onPasswordResetInitiated={handlePasswordResetInitiated}
      />
    </div>
  );
}

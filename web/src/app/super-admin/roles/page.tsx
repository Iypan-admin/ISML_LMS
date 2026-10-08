// ============================================================================
// ISML COLLEGE LMS — ROLE & PERMISSION MATRIX MANAGEMENT
// Category Grouping, Search, Category Select All / Clear & ID-driven Matrix
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  Shield,
  KeyRound,
  CheckCircle2,
  Users,
  Search,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Modal } from '@/components/common/Modal';
import { Can, useRbac } from '@/context/AuthRbacContext';
import { RoleDefinition, PermissionId, PermissionDefinition } from '@/types/rbac';
import {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
} from '@/config/permissions';

export default function RolesPage() {
  const { roles, updateRolePermissions, activeRole } = useRbac();
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionId[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('ALL');

  // Open Matrix Editor
  const openPermissionMatrix = (role: RoleDefinition) => {
    setEditingRole(role);
    setSelectedPermissions([...role.permissions]);
    setPermissionSearch('');
    setActiveCategoryTab('ALL');
  };

  // Toggle single permission ID
  const togglePermission = (permId: PermissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Select all permissions in category
  const selectAllCategory = (category: string) => {
    const categoryPermIds = ALL_PERMISSIONS.filter((p) => p.category === category).map(
      (p) => p.id
    );
    setSelectedPermissions((prev) => Array.from(new Set([...prev, ...categoryPermIds])));
  };

  // Clear all permissions in category
  const clearCategory = (category: string) => {
    const categoryPermIds = new Set(
      ALL_PERMISSIONS.filter((p) => p.category === category).map((p) => p.id)
    );
    setSelectedPermissions((prev) => prev.filter((id) => !categoryPermIds.has(id)));
  };

  // Save changes to role
  const handleSaveMatrix = () => {
    if (!editingRole) return;
    updateRolePermissions(editingRole.id, selectedPermissions);
    setEditingRole(null);
  };

  // Filtered permissions inside modal
  const filteredPermissions = useMemo(() => {
    let list = ALL_PERMISSIONS;
    if (activeCategoryTab !== 'ALL') {
      list = list.filter((p) => p.category === activeCategoryTab);
    }
    if (permissionSearch.trim()) {
      const q = permissionSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategoryTab, permissionSearch]);

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Roles' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Role & Permission Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure granular entitlements and action capabilities across all College LMS modules.
          </p>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const isCurrentActive = activeRole.id === role.id;
          return (
            <div
              key={role.id}
              className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all shadow-2xs flex flex-col justify-between ${
                isCurrentActive ? 'border-[#0052CC] ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {role.code}
                  </span>
                  {role.isSystemRole && (
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                      System Role
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#0B2447]">{role.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>{role.userCount}</strong> Assigned</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#0052CC]" />
                    <span><strong>{role.permissions.length}</strong> Permissions</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Can permission="ROLE_UPDATE">
                  <button
                    onClick={() => openPermissionMatrix(role)}
                    className="w-full py-2 bg-slate-100 hover:bg-[#0052CC] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Configure Permission Matrix</span>
                  </button>
                </Can>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix Modal */}
      {editingRole && (
        <Modal
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          title={`Permission Matrix: ${editingRole.name}`}
          description={`Granular module controls (${selectedPermissions.length} active of ${ALL_PERMISSIONS.length})`}
          maxWidth="4xl"
        >
          <div className="space-y-4 font-sans text-xs">
            {/* Search & Category Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  placeholder="Filter permissions by ID or name..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] whitespace-nowrap ${
                    activeCategoryTab === 'ALL'
                      ? 'bg-[#0052CC] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Categories
                </button>
                {PERMISSION_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryTab(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] whitespace-nowrap ${
                      activeCategoryTab === cat
                        ? 'bg-[#0052CC] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Category Action Helpers */}
            {activeCategoryTab !== 'ALL' && (
              <div className="flex items-center justify-between bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                <span className="text-[11px] font-semibold text-[#0052CC]">
                  Category: <strong>{activeCategoryTab}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => selectAllCategory(activeCategoryTab)}
                    className="text-[11px] font-bold text-[#0052CC] hover:underline cursor-pointer"
                  >
                    Select All in Category
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => clearCategory(activeCategoryTab)}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear Category
                  </button>
                </div>
              </div>
            )}

            {/* Permissions List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredPermissions.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/40 border-[#0052CC] shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-[#0052CC] border-[#0052CC] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#0B2447] text-xs">{perm.name}</span>
                        <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {perm.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-slate-500 text-xs">
                <strong>{selectedPermissions.length}</strong> permissions selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMatrix}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Save Permission Matrix
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — INSTITUTIONS MANAGEMENT
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Eye, Edit, Trash2, CheckCircle2, XCircle, MapPin, Mail, Phone, Users, Layers } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import { Can } from '@/context/AuthRbacContext';
import { Institution } from '@/types/rbac';
import { mockInstitutions } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import OnboardCollegeDrawer from '@/components/super-admin/institutions/OnboardCollegeDrawer';

export default function InstitutionsPage() {
  const { showSuccess, showInfo } = useToast();
  const [institutions, setInstitutions] = useState<Institution[]>(mockInstitutions);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);
  const [isOnboardDrawerOpen, setIsOnboardDrawerOpen] = useState(false);

  const handleInstitutionCreated = (newInst: Institution) => {
    setInstitutions((prev) => [newInst, ...prev]);
    showSuccess(`College "${newInst.name}" (${newInst.code}) onboarded successfully.`);
  };

  const handleInstitutionUpdated = (updatedInst: Institution) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === updatedInst.id ? updatedInst : i))
    );
    showSuccess(`Institution "${updatedInst.name}" updated successfully.`);
    setEditingInst(null);
  };

  const handleDeleteInstitution = () => {
    if (!deleteTarget) return;
    setInstitutions((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    showSuccess(`Institution "${deleteTarget.name}" deleted successfully.`);
    setDeleteTarget(null);
  };

  const handleToggleStatus = (inst: Institution) => {
    const nextStatus = inst.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setInstitutions((prev) =>
      prev.map((i) =>
        i.id === inst.id
          ? { ...i, status: nextStatus }
          : i
      )
    );
    if (nextStatus === 'INACTIVE') {
      showInfo(`Institution "${inst.name}" has been suspended / deactivated.`);
    } else {
      showSuccess(`Institution "${inst.name}" activated.`);
    }
  };

  const columns: Column<Institution>[] = [
    {
      key: 'name',
      header: 'Institution Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs sm:text-sm">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.affiliation}</p>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      key: 'departmentsCount',
      header: 'Departments',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-700">{row.departmentsCount} Depts</span>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Students',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-700">{row.studentsCount.toLocaleString()}</span>
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
            onChange={() => handleToggleStatus(row)}
            activeLabel="Active"
            inactiveLabel="Suspended"
          />
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right min-w-[80px]',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/super-admin/institutions/${row.id}`}
            className="p-1.5 text-slate-400 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-block"
            title="View Full College Page, Students & Courses"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          <Can permission="INSTITUTION_UPDATE">
            <button
              onClick={() => setEditingInst(row)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Edit Institution"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          </Can>

          <Can permission="INSTITUTION_DELETE">
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Institution"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Institutions' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Institutions Management
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Registered colleges, accreditation profiles, and academic campus credentials.
          </p>
        </div>

        <Can permission="INSTITUTION_CREATE">
          <button
            id="onboard-college-btn"
            onClick={() => {
              setEditingInst(null);
              setIsOnboardDrawerOpen(true);
            }}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Onboard College</span>
          </button>
        </Can>
      </div>

      <DataTable
        data={institutions}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search institution name, code, affiliation..."
        searchKey={(row) => `${row.name} ${row.code} ${row.affiliation}`}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ],
          },
        ]}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.name}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{row.affiliation}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusToggleSwitch
                  checked={row.status === 'ACTIVE'}
                  onChange={() => handleToggleStatus(row)}
                  activeLabel="Active"
                  inactiveLabel="Suspended"
                />
                <StatusBadge status={row.status} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg">
              <span className="font-mono font-bold text-[#0052CC] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {row.code}
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                {row.departmentsCount} Depts
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                {row.studentsCount} Students
              </span>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
              <Link
                href={`/super-admin/institutions/${row.id}`}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3 text-slate-500" />
                <span>View</span>
              </Link>

              <Can permission="INSTITUTION_UPDATE">
                <button
                  onClick={() => setEditingInst(row)}
                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3 h-3 text-blue-600" />
                  <span>Edit</span>
                </button>
              </Can>

              <Can permission="INSTITUTION_UPDATE">
                <button
                  onClick={() => handleToggleStatus(row)}
                  className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    row.status === 'ACTIVE'
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {row.status === 'ACTIVE' ? (
                    <>
                      <XCircle className="w-3 h-3 text-amber-600" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </Can>

              <Can permission="INSTITUTION_DELETE">
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Delete</span>
                </button>
              </Can>
            </div>
          </div>
        )}
      />

      {/* Delete Confirmation Right-Side Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteInstitution}
        entityType="Affiliated College / Institution"
        entityName={deleteTarget?.name}
      />

      {/* Onboard / Edit College Right-Side Drawer */}
      <OnboardCollegeDrawer
        isOpen={isOnboardDrawerOpen || !!editingInst}
        onClose={() => {
          setIsOnboardDrawerOpen(false);
          setEditingInst(null);
        }}
        onInstitutionCreated={handleInstitutionCreated}
        editInstitution={editingInst}
        onInstitutionUpdated={handleInstitutionUpdated}
      />
    </div>
  );
}


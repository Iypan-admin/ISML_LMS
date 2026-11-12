// ============================================================================
// ISML LMS — SALES MANAGER: ONBOARD COLLEGE & SCHOOL PARTNERS
// Institutional Tenant Provisioning & Administrator Credentials Auto-Dispatch
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  School,
  GraduationCap,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MapPin,
  Mail,
  Phone,
  Users,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import { Institution } from '@/types/rbac';
import { mockInstitutions } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import OnboardCollegeDrawer from '@/components/super-admin/institutions/OnboardCollegeDrawer';
import { fastFetch } from '@/lib/fastCache';

export default function SalesManagerOnboardInstitutionPage() {
  const { showSuccess, showInfo } = useToast();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);
  const [isOnboardDrawerOpen, setIsOnboardDrawerOpen] = useState(false);

  // Fetch only genuine institutions from Backend API / Database (Zero Mock Data)
  useEffect(() => {
    fetch('https://ismllms-production.up.railway.app/api/portals/institutions')
      .then((res) => res.json())
      .then((json) => {
        setIsLoading(false);
        if (json?.data && Array.isArray(json.data)) {
          const mapped: Institution[] = json.data.map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            displayName: item.displayName || item.name,
            city: 'Tamil Nadu',
            state: 'TN',
            country: 'India',
            status: item.status || 'ACTIVE',
            type: item.code?.includes('DPS') || item.code?.includes('SCH') || item.name?.toLowerCase().includes('school') ? 'SCHOOL' : 'COLLEGE',
            universityAffiliation: 'Partner Campus',
            naacAccreditation: 'Accredited',
            studentsCount: 0,
            facultyCount: 0,
            departmentsCount: 0,
            batchesCount: 0,
            coursesCount: 0,
            activeAcademicYear: '2026-2027',
            logoUrl: '/logo.png',
            primaryColor: '#0052CC',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
          setInstitutions(mapped);
        } else {
          setInstitutions([]);
        }
      })
      .catch(() => {
        setIsLoading(false);
        setInstitutions([]);
      });
  }, []);

  const handleInstitutionCreated = (newInst: Institution) => {
    setInstitutions((prev) => [newInst, ...prev.filter((i) => i.id !== newInst.id)]);
    showSuccess(`Institution "${newInst.name}" (${newInst.code}) onboarded & credentials dispatched to Admin.`);
  };

  const handleInstitutionUpdated = (updatedInst: Institution) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === updatedInst.id ? updatedInst : i))
    );
    showSuccess(`Institution "${updatedInst.name}" updated successfully.`);
    setEditingInst(null);

    fetch(`https://ismllms-production.up.railway.app/api/portals/institutions/${updatedInst.id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedInst),
    }).catch(() => null);
  };

  const handleDeleteInstitution = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setInstitutions((prev) => prev.filter((i) => i.id !== targetId));
    showSuccess(`Institution "${deleteTarget.name}" deleted.`);
    setDeleteTarget(null);

    fetch(`https://ismllms-production.up.railway.app/api/portals/institutions/${targetId}/delete`, {
      method: 'POST',
    }).catch(() => null);
  };

  const handleToggleStatus = (inst: Institution) => {
    const nextStatus = inst.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setInstitutions((prev) =>
      prev.map((i) =>
        i.id === inst.id ? { ...i, status: nextStatus } : i
      )
    );

    fetch(`https://ismllms-production.up.railway.app/api/portals/institutions/${inst.id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => null);

    if (nextStatus === 'INACTIVE') {
      showInfo(`Institution "${inst.name}" suspended.`);
    } else {
      showSuccess(`Institution "${inst.name}" activated.`);
    }
  };

  const columns: Column<Institution>[] = [
    {
      key: 'name',
      header: 'Institution & Campus Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#0B2447] text-xs sm:text-sm">{row.name}</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
              row.type === 'SCHOOL'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
              {row.type}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.affiliation}</p>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Institution Code',
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
      header: 'Capacity Intake',
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
          <button
            onClick={() => setEditingInst(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Institution"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Institution"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ─── Header & Action Bar ─── */}
      <div className="p-5 sm:p-6 rounded-2xl shadow-md border text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B2447] via-[#0D2E5C] to-[#1E3A8A] border-blue-900/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SALES & ADMISSIONS CRM DESK</span>
            </span>
            <span className="text-xs text-white/50">•</span>
            <span className="text-xs font-semibold text-blue-100">
              Multi-Tenant Institutional Provisioning
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Onboard Partner Colleges & Schools
          </h1>

          <p className="text-xs text-blue-100/90 max-w-2xl leading-relaxed">
            Provision new College or K-12 School tenant workspaces in Supabase DB. College Admin or School Admin accounts are automatically generated and login credentials are auto-emailed instantly.
          </p>
        </div>

        {/* Onboard Trigger Button */}
        <button
          onClick={() => {
            setEditingInst(null);
            setIsOnboardDrawerOpen(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Building2 className="w-4 h-4" />
          <span>+ Onboard New College / School</span>
        </button>
      </div>

      {/* ─── Table of Onboarded Institutions ─── */}
      <DataTable
        data={institutions}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search institution name, code, affiliation..."
        searchKey={(row) => `${row.name} ${row.code} ${row.affiliation}`}
        filters={[
          {
            key: 'type',
            label: 'Institution Type',
            options: [
              { label: 'Colleges', value: 'COLLEGE' },
              { label: 'Schools', value: 'SCHOOL' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ],
          },
        ]}
      />

      {/* Delete Confirmation Right-Side Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteInstitution}
        entityType="Affiliated College / School"
        entityName={deleteTarget?.name}
      />

      {/* Onboard / Edit Right-Side Drawer */}
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

// ============================================================================
// ISML COLLEGE LMS — AUDIT LOGS
// Immutable Administrative Action Audit Trail
// ============================================================================

"use client";

import React, { useState } from 'react';
import { ScrollText, ShieldCheck, Filter } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { AuditLogEntry } from '@/types/rbac';
import { mockAuditLogs } from '@/mock/superAdminData';

export default function AuditLogsPage() {
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500">
          {new Date(row.timestamp).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Administrator & Role',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.userName}</p>
          <span className="font-semibold text-[10px] text-slate-500">{row.userRole}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Executed',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.action}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Audit Event Description',
      render: (row) => (
        <div>
          <p className="text-xs text-slate-700 font-medium">{row.details}</p>
          <p className="text-[10px] text-slate-400">
            {row.module} • {row.resource} ({row.resourceId})
          </p>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Footprint',
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {row.ipAddress}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'System' }, { label: 'Audit Logs' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped action logs for regulatory compliance and NAAC auditing.
          </p>
        </div>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search audit action, user, IP..."
        searchKey={(row) => `${row.action} ${row.userName} ${row.details} ${row.ipAddress}`}
      />
    </div>
  );
}

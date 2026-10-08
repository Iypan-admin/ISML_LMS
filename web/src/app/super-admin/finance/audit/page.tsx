// ============================================================================
// ISML COLLEGE LMS — FINANCE AUDIT & WORKFLOW TIMELINE
// Forensic Record of Fee Revisions, Submissions, Approvals & Rejections
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  User,
  Calendar,
} from 'lucide-react';
import { mockApprovalRequests } from '@/mock/superAdminData';

export default function FinanceAuditPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const financeAuditEntries = [
    {
      id: 'AUD-FIN-001',
      requestId: 'REQ-000125',
      entityName: 'B.Sc Computer Science — Semester 1 Fee Structure',
      action: 'FEE_STRUCTURE_SUBMITTED',
      performer: 'Suresh Narayanan',
      role: 'Finance Manager',
      timestamp: '2026-10-07T15:45:00Z',
      changeSummary: 'Advanced Computing Lab Fee revised: ₹6,000 → ₹7,500. Total: ₹45,000 → ₹48,000.',
      status: 'SUBMITTED',
    },
    {
      id: 'AUD-FIN-002',
      requestId: 'REQ-000128',
      entityName: 'Institutional Merit Scholarship Policy',
      action: 'DISCOUNT_POLICY_APPROVED',
      performer: 'Super Admin',
      role: 'Super Administrator',
      timestamp: '2026-10-05T12:30:00Z',
      changeSummary: 'Authorized 25% Tuition Fee Waiver for top 5% semester CGPA cohort students.',
      status: 'APPROVED',
    },
    {
      id: 'AUD-FIN-003',
      requestId: 'REQ-000121',
      entityName: 'BCA Semester 2 Tech Fee Surcharge',
      action: 'CHANGES_REQUESTED',
      performer: 'Super Admin',
      role: 'Super Administrator',
      timestamp: '2026-09-28T16:20:00Z',
      changeSummary: 'Returned to Finance Manager: "Split cloud lab hosting fee into optional component."',
      status: 'CHANGES_REQUIRED',
    },
    {
      id: 'AUD-FIN-004',
      requestId: 'REQ-000115',
      entityName: 'B.A. French DELF Examination Fee Scheme',
      action: 'FEE_STRUCTURE_APPROVED',
      performer: 'Super Admin',
      role: 'Super Administrator',
      timestamp: '2026-06-16T14:20:00Z',
      changeSummary: 'Authorized baseline schedule FEESTR-BA-FR-S1-V1: ₹40,000.',
      status: 'APPROVED',
    },
  ];

  const filtered = financeAuditEntries.filter(
    (e) =>
      e.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.performer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.requestId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-[#0052CC] rounded-lg">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Finance Audit & Modification Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of fee schedule proposals, submitters, before/after amount diffs, and authorizations.
          </p>
        </div>

        <Link
          href="/super-admin/audit-logs"
          className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
        >
          <span>Global System Audit Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by request ID, entity, or actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-bold text-[#0052CC]">
                  {entry.requestId}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                  {entry.action}
                </span>
              </div>

              <h2 className="font-bold text-slate-900 text-xs mt-0.5">{entry.entityName}</h2>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                {entry.changeSummary}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {entry.performer} ({entry.role})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href="/super-admin/finance/approvals"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#0052CC] hover:text-white text-slate-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
              >
                <span>Audit Request</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

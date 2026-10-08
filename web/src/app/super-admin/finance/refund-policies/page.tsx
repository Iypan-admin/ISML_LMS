// ============================================================================
// ISML COLLEGE LMS — REFUND POLICIES MASTER
// Statutory UGC & Institutional Tuition Refund Percentage Schedules
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { mockRefundPolicies } from '@/mock/superAdminData';
import { RefundPolicy } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/context/ToastContext';
import CreateRefundPolicyDrawer from '@/components/super-admin/finance/CreateRefundPolicyDrawer';

export default function RefundPoliciesPage() {
  const { showSuccess } = useToast();
  const [policies, setPolicies] = useState<RefundPolicy[]>(mockRefundPolicies);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handlePolicyCreated = (newPolicy: RefundPolicy) => {
    setPolicies((prev) => [newPolicy, ...prev]);
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Statutory Fee Refund Schedules
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional fee refund tiers, time windows, and statutory Higher Education Commission compliance guidelines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Refund Tier</span>
        </button>
      </div>

      <div className="space-y-4">
        {policies.map((p) => (
          <div
            key={p.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0052CC]" />
                <h2 className="text-sm font-bold text-slate-900">{p.policyName}</h2>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Eligibility Time Window</span>
                <p className="font-semibold text-slate-800 mt-0.5">{p.timeWindow}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Refund Return Rate</span>
                <p className="font-black text-emerald-600 text-base mt-0.5">
                  {p.refundPercentage}% Aggregate Fee
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Effective Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{p.effectiveDate}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-700">Conditions & Deductions: </span>
              {p.conditions}
            </div>
          </div>
        ))}
      </div>
      <CreateRefundPolicyDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPolicyCreated={handlePolicyCreated}
      />
    </div>
  );
}

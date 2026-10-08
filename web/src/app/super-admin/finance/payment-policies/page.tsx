// ============================================================================
// ISML COLLEGE LMS — PAYMENT POLICIES MANAGEMENT
// Installment Terms, Grace Periods, Late Fees, & Payment Modes
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { mockPaymentPolicies } from '@/mock/superAdminData';
import { PaymentPolicy } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/context/ToastContext';
import CreatePaymentPolicyDrawer from '@/components/super-admin/finance/CreatePaymentPolicyDrawer';

export default function PaymentPoliciesPage() {
  const { showSuccess } = useToast();
  const [policies, setPolicies] = useState<PaymentPolicy[]>(mockPaymentPolicies);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handlePolicyCreated = (newPolicy: PaymentPolicy) => {
    setPolicies((prev) => [newPolicy, ...prev]);
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Institutional Payment Policies
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Governing installment structures, grace period allowances, and late surcharge penalties.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Payment Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((p) => (
          <div
            key={p.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">{p.name}</h2>
              <StatusBadge status={p.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Installment Milestones</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {p.installmentsCount} Term Splits
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Grace Period</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {p.gracePeriodDays} Days after Due
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Late Penalty Rate</span>
                <p className="font-bold text-rose-700 text-sm mt-0.5">
                  {p.lateFeePercentage}% per Month
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Partial Payments</span>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">
                  {p.partialPaymentAllowed ? 'Permitted' : 'Not Allowed'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Effective From: {p.effectiveDate}
              </span>
              <span>Refund Window: {p.refundWindowDays} Days</span>
            </div>
          </div>
        ))}
      </div>
      <CreatePaymentPolicyDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPolicyCreated={handlePolicyCreated}
      />
    </div>
  );
}

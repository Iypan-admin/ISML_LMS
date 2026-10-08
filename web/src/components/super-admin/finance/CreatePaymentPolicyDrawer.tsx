// ============================================================================
// ISML COLLEGE LMS — CREATE PAYMENT POLICY DRAWER
// Institutional Installment Terms, Grace Periods & Late Surcharge Engine
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, X, Plus, Sparkles, Calendar, ShieldCheck } from 'lucide-react';
import { PaymentPolicy } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';

interface CreatePaymentPolicyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPolicyCreated: (newPolicy: PaymentPolicy) => void;
}

export default function CreatePaymentPolicyDrawer({
  isOpen,
  onClose,
  onPolicyCreated,
}: CreatePaymentPolicyDrawerProps) {
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState(2);
  const [gracePeriodDays, setGracePeriodDays] = useState(15);
  const [lateFeePercentage, setLateFeePercentage] = useState(3);
  const [partialPaymentAllowed, setPartialPaymentAllowed] = useState(true);
  const [refundWindowDays, setRefundWindowDays] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setInstallmentsCount(2);
      setGracePeriodDays(15);
      setLateFeePercentage(3);
      setPartialPaymentAllowed(true);
      setRefundWindowDays(30);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Please enter policy name.');
      return;
    }

    const newPolicy: PaymentPolicy = {
      id: `pol-${Date.now().toString().slice(-4)}`,
      name,
      installmentsCount,
      gracePeriodDays,
      lateFeePercentage,
      partialPaymentAllowed,
      refundWindowDays,
      status: 'APPROVED',
      effectiveDate: new Date().toISOString().slice(0, 10),
    };

    onPolicyCreated(newPolicy);
    showSuccess(`Payment policy "${name}" created and approved.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <CreditCard className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Create Payment Policy</h2>
              <p className="text-xs text-blue-200 mt-0.5">Define installment milestones & late surcharges</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Policy Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard 3-Tranche Installment Schedule (2026)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Installment Milestones</label>
                <select
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value={1}>1 Lump-sum (Single payment)</option>
                  <option value={2}>2 Installments (50% / 50%)</option>
                  <option value={3}>3 Installments (40% / 30% / 30%)</option>
                  <option value={4}>4 Quarterly Tranches</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grace Period (Days)</label>
                <input
                  type="number"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                  min={0}
                  max={60}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Late Fee Penalty (%)</label>
                <input
                  type="number"
                  value={lateFeePercentage}
                  onChange={(e) => setLateFeePercentage(Number(e.target.value))}
                  step={0.5}
                  min={0}
                  max={25}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refund Window (Days)</label>
                <input
                  type="number"
                  value={refundWindowDays}
                  onChange={(e) => setRefundWindowDays(Number(e.target.value))}
                  min={0}
                  max={90}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Allow Partial Student Payments</span>
              <input
                type="checkbox"
                checked={partialPaymentAllowed}
                onChange={(e) => setPartialPaymentAllowed(e.target.checked)}
                className="w-4 h-4 text-[#0052CC] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save & Activate Policy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

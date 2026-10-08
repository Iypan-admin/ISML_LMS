// ============================================================================
// ISML COLLEGE LMS — CREATE REFUND POLICY DRAWER
// Statutory UGC & Institutional Tuition Refund Percentage Schedules
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { RotateCcw, X, Plus, Sparkles, ShieldCheck, Percent } from 'lucide-react';
import { RefundPolicy } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';

interface CreateRefundPolicyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPolicyCreated: (newPolicy: RefundPolicy) => void;
}

export default function CreateRefundPolicyDrawer({
  isOpen,
  onClose,
  onPolicyCreated,
}: CreateRefundPolicyDrawerProps) {
  const { showSuccess, showError } = useToast();

  const [policyName, setPolicyName] = useState('');
  const [timeWindow, setTimeWindow] = useState('15 Days Before Formal Induction');
  const [refundPercentage, setRefundPercentage] = useState(100);
  const [conditions, setConditions] = useState('Full tuition refund with statutory administrative deduction not exceeding ₹1,000.');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    if (isOpen) {
      setPolicyName('');
      setTimeWindow('15 Days Before Formal Induction');
      setRefundPercentage(100);
      setConditions('Full tuition refund with statutory administrative deduction not exceeding ₹1,000.');
      setStatus('ACTIVE');
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
    if (!policyName.trim()) {
      showError('Please enter policy name.');
      return;
    }

    const newPolicy: RefundPolicy = {
      id: `ref-${Date.now().toString().slice(-4)}`,
      policyName,
      timeWindow,
      refundPercentage,
      conditions,
      status,
      effectiveDate: new Date().toISOString().slice(0, 10),
    };

    onPolicyCreated(newPolicy);
    showSuccess(`Refund policy "${policyName}" (${refundPercentage}% refund) activated.`);
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
              <RotateCcw className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Create Refund Schedule</h2>
              <p className="text-xs text-blue-200 mt-0.5">Define statutory UGC refund tiers & deduction rules</p>
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
                Refund Tier Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g. Pre-Commencement Withdrawal Schedule"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Time Window</label>
                <input
                  type="text"
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  placeholder="e.g. 15 Days Before Start"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refund Rate (%)</label>
                <div className="relative">
                  <span className="absolute right-3 top-2 text-slate-400 font-bold text-xs">%</span>
                  <input
                    type="number"
                    value={refundPercentage}
                    onChange={(e) => setRefundPercentage(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="w-full pr-8 pl-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Regulatory Terms & Conditions</label>
              <textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Policy Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="ACTIVE">Active (In Force)</option>
                <option value="INACTIVE">Inactive (Superseded)</option>
              </select>
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
              <span>Save & Publish Refund Policy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

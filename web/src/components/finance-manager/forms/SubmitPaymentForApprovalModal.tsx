// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: SUBMIT PAYMENT VOUCHER FOR SUPER ADMIN
// Modal allowing Finance Manager to verify instrument documents and submit
// to Super Admin for official authorization. (FM cannot directly self-approve).
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Send,
  FileText,
  Building2,
  Landmark,
  Calendar,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';
import { TransactionRecord } from '@/mock/financeManagerData';
import { financeProposalStore } from '@/services/financeProposalStore';

interface SubmitPaymentForApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionRecord | null;
  onSubmitted: (txId: string, notes: string) => void;
}

export default function SubmitPaymentForApprovalModal({
  isOpen,
  onClose,
  transaction,
  onSubmitted,
}: SubmitPaymentForApprovalModalProps) {
  const { showSuccess, showError } = useToast();
  const [managerNotes, setManagerNotes] = useState('Physical cash/bank deposit slip authenticated with campus bank branch.');

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerNotes.trim()) {
      showError('Please provide a verification note for Super Admin review.');
      return;
    }

    // Submit to shared Finance Proposal Store for Super Admin Authorization Queue
    financeProposalStore.submitProposal({
      requestType: 'Offline Payment & Bank Challan Authorization',
      entityType: 'Fee Payment Voucher',
      entityName: `${transaction.receiptNo} — ${transaction.studentName} (₹${transaction.amount.toLocaleString('en-IN')})`,
      submittedBy: {
        name: 'Finance Controller',
        email: 'finance@isml.edu',
        role: 'Finance Manager',
      },
      impactAnalysis: `Counter payment of ₹${transaction.amount.toLocaleString('en-IN')} received via ${transaction.paymentMethod} (${transaction.channelType?.replace('_', ' ')}). Reference: ${transaction.gatewayRef || transaction.challanNumber || 'N/A'}.`,
      diff: [
        { fieldName: 'Payment Instrument', oldValue: 'Unverified', newValue: `${transaction.paymentMethod}` },
        { fieldName: 'Amount Deposited', oldValue: 'Pending', newValue: `₹${transaction.amount.toLocaleString('en-IN')}` },
        { fieldName: 'Student Account', oldValue: transaction.rollNo, newValue: transaction.studentName },
      ],
    });

    onSubmitted(transaction.id, managerNotes);
    showSuccess(`Payment voucher ${transaction.receiptNo} submitted to Super Admin for executive authorization!`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Payment Voucher for Super Admin Approval"
      description={`Instrument Review: ${transaction.receiptNo} • ${transaction.paymentMethod}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
        {/* Transaction Summary Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Account / Beneficiary</span>
              <p className="text-sm font-bold text-slate-900">{transaction.studentName}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {transaction.rollNo} • {transaction.program} (Sem {transaction.semester})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Amount Deposited</span>
              <p className="text-xl font-black text-slate-950">
                ₹{transaction.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Instrument Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Method & Channel</span>
              <p className="font-bold text-slate-800">{transaction.paymentMethod}</p>
              <span className="text-[10px] text-slate-500 font-medium">
                {transaction.channelType?.replace('_', ' ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Voucher / Ref Number</span>
              <p className="font-mono font-bold text-slate-800">{transaction.gatewayRef}</p>
              {transaction.challanNumber && (
                <span className="text-[10px] text-teal-700 font-semibold font-mono block">
                  Challan: {transaction.challanNumber}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Campus Institution</span>
              <p className="font-bold text-slate-800">{transaction.collegeName}</p>
              <span className="text-[10px] text-slate-500">
                {new Date(transaction.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Note for Super Admin */}
        <div className="space-y-1.5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Dual-Control Governance: Super Admin Authorization Required</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            As Finance Manager, you are validating that physical cash, demand draft, or bank deposit slips are accounted for. Final clearance and ledger confirmation will be authorized by Super Admin.
          </p>

          <div className="pt-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Verification Notes & Audit Reference *
            </label>
            <textarea
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder="e.g. Verified with counter physical deposit scroll and bank counterfoil..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 text-xs"
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Super Admin Approval</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

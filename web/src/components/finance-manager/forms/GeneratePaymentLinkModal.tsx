// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: GENERATE STUDENT PAYMENT LINK MODAL
// Dispatches Razorpay Quick Payment Link to Student/Parent via SMS & Email
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Link as LinkIcon,
  X,
  Send,
  Copy,
  Check,
  Smartphone,
  Mail,
  ShieldCheck,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';
import { StudentFeeRecord, TransactionRecord } from '@/mock/financeManagerData';

interface GeneratePaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentFeeRecord | null;
  onGenerated?: (tx: TransactionRecord) => void;
}

export default function GeneratePaymentLinkModal({
  isOpen,
  onClose,
  student,
  onGenerated,
}: GeneratePaymentLinkModalProps) {
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState<number>(student?.outstandingBalance || 21500);
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleGenerate = () => {
    const linkId = `plink_rzp_${Math.floor(100000 + Math.random() * 900000)}`;
    const fullUrl = `https://rzp.io/l/isml-${student.rollNo.toLowerCase()}-${linkId.slice(-4)}`;
    setGeneratedLink(fullUrl);

    if (onGenerated) {
      const newTx: TransactionRecord = {
        id: `tx-link-${Date.now().toString().slice(-4)}`,
        receiptNo: `RCP-LNK-${Date.now().toString().slice(-5)}`,
        studentId: student.studentId,
        studentName: student.name,
        rollNo: student.rollNo,
        collegeId: student.collegeId,
        collegeName: student.collegeName,
        program: student.program,
        semester: student.currentSemester,
        amount,
        paymentMethod: 'UPI',
        channelType: 'PAYMENT_LINK',
        gatewayRef: linkId,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        remarks: `Razorpay Payment Link dispatched to ${student.email}. Awaiting student checkout.`,
        requiresFinanceApproval: false,
      };
      onGenerated(newTx);
    }

    showSuccess(
      `Razorpay payment link dispatched to ${student.name} via ${
        sendSms && sendEmail ? 'SMS and Email' : sendSms ? 'SMS' : 'Email'
      }!`
    );
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    showSuccess('Payment link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Razorpay Online Payment Link"
      description={`Dispatches direct UPI/Card/NetBanking checkout URL to ${student.name}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Student Mini Card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">{student.name}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              {student.rollNo} • {student.program}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Balance</span>
            <p className="text-sm font-black text-rose-600">
              ₹{student.outstandingBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Link Configuration */}
        {!generatedLink ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Installment Amount to Collect (INR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Dispatch Notification Channels
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>SMS to Parent/Student Mobile</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Official Email Alert</span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Instant Razorpay Webhook Reconciliation</span>
              </div>
              <p className="text-[11px] text-blue-800">
                When the student opens the link and pays via UPI (PhonePe, GPay), Card, or NetBanking, the LMS immediately marks the installment as PAID with zero manual effort.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Generate & Send Link</span>
              </button>
            </div>
          </div>
        ) : (
          /* Link Generated Display */
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Active Payment Link Generated!</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-emerald-300">
                <span className="font-mono text-[11px] text-slate-800 truncate flex-1 select-all">
                  {generatedLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

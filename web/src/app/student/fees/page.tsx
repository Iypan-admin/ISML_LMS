// ============================================================================
// ISML COLLEGE LMS — STUDENT: FEES & PAYMENTS (/student/fees)
// Official Student Fee Payment Portal with Razorpay Checkout
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Receipt,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Building2,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useToast } from '@/context/ToastContext';
import { initiateRazorpayPayment } from '@/lib/razorpayClient';
import StatusBadge from '@/components/common/StatusBadge';

export default function StudentFeesPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const [student, setStudent] = useState<any>({
    id: '',
    rollNo: '',
    name: 'Student',
    email: '',
    collegeName: 'The American College',
    courseName: 'French Language Certification',
    batchName: 'Morning Batch',
  });

  const [feeRecord, setFeeRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptOverride, setReceiptOverride] = useState<string | null>(null);

  // 1. Identify logged in student
  useEffect(() => {
    let roll = '';
    let sId = '';
    let sName = '';
    try {
      const stored = localStorage.getItem('isml_user') || localStorage.getItem('isml_student_profile');
      if (stored) {
        const u = JSON.parse(stored);
        roll = u.rollNo || u.studentId || '';
        sId = u.id || u.studentId || '';
        sName = u.name || 'Student';
        setStudent({
          id: sId,
          rollNo: roll,
          name: sName,
          email: u.email || 'student@isml.edu',
          collegeName: u.campusName || u.tenantName || u.collegeName || 'The American College',
          courseName: u.enrolledCourseName || u.courseName || 'French Language Certification',
          batchName: u.batchName || 'Morning Batch',
        });
      }
    } catch {}

    // 2. Fetch live fee ledger from /api/portals/student-fees
    fetch('/api/portals/student-fees')
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        const list = json?.data || [];
        const match = list.find((s: any) => {
          if (roll && s.rollNo?.toLowerCase() === roll.toLowerCase()) return true;
          if (sId && s.studentId?.toLowerCase() === sId.toLowerCase()) return true;
          if (sName && s.name?.toLowerCase().trim() === sName.toLowerCase().trim()) return true;
          return false;
        });

        if (match) {
          setFeeRecord(match);
        } else {
          // Default Unpaid Ledger for new student
          setFeeRecord({
            rollNo: roll || 'AMER-NEW',
            name: sName || 'Student',
            collegeName: 'The American College',
            program: 'French Language Certification',
            totalFees: 18500,
            paidAmount: 0,
            outstandingBalance: 18500,
            paymentStatus: 'UNPAID',
            installments: [
              {
                number: 1,
                title: 'Full Program Tuition & Lab Access Fee',
                amount: 18500,
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                status: 'UNPAID',
              },
            ],
          });
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const totalFee = feeRecord?.totalFees || 18500;
  const paidAmt = feeRecord?.paidAmount || 0;
  const pendingAmt = Math.max(0, totalFee - paidAmt);
  const isPaid = pendingAmt === 0 || feeRecord?.paymentStatus === 'PAID';

  const handlePayNow = () => {
    if (isPaid || pendingAmt <= 0) {
      showInfo('Your prescribed fees are already cleared!');
      return;
    }

    setIsProcessing(true);

    initiateRazorpayPayment({
      amount: pendingAmt,
      studentId: student.rollNo || student.id || 'std-current',
      studentName: student.name,
      studentEmail: student.email || `${student.name.toLowerCase().replace(/\s+/g, '.')}@isml.edu`,
      studentPhone: '+91 98401 22334',
      studentFeeLedgerId: feeRecord?.id,
      paymentFor: `Academic Fee Clearance • ${feeRecord?.program || student.courseName}`,
      onSuccess: async (receipt) => {
        setIsProcessing(false);
        setReceiptOverride(receipt.receiptNo);

        // Notify server API
        await fetch('/api/portals/student-fees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'PAY_FEE',
            studentId: student.id,
            rollNo: student.rollNo,
            studentName: student.name,
            studentEmail: student.email,
            amountPaid: pendingAmt,
            receiptNo: receipt.receiptNo,
            paymentRefId: receipt.transactionRef || receipt.paymentId,
          }),
        }).catch(() => {});

        // Update local state
        setFeeRecord((prev: any) => ({
          ...prev,
          paidAmount: totalFee,
          outstandingBalance: 0,
          paymentStatus: 'PAID',
          lastPaymentDate: new Date().toISOString().split('T')[0],
        }));

        // Broadcast realtime unlock
        window.dispatchEvent(new CustomEvent('isml-realtime-event', { detail: { type: 'STUDENT_FEE_PAID' } }));
        try {
          const bc = new BroadcastChannel('isml_student_status');
          bc.postMessage({ type: 'ACCESS_UNLOCKED', rollNo: student.rollNo });
          bc.close();
        } catch {}

        showSuccess(`Payment Successful! Receipt #${receipt.receiptNo} generated. Access is fully unlocked!`);
      },
      onFailure: (err) => {
        setIsProcessing(false);
        showError(`Payment failed or cancelled: ${err.description || 'Transaction declined'}`);
      },
      onDismiss: () => {
        setIsProcessing(false);
        showInfo('Payment window closed. You can complete fee clearance anytime.');
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-5xl mx-auto">
      {/* ─── Breadcrumb ─── */}
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Fee Ledger & Payment' }]} />

      {/* ─── Top Banner ─── */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Student Tuition Fee Ledger
              </h1>
              <StatusBadge status={isPaid ? 'PAID' : feeRecord?.paymentStatus || 'UNPAID'} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll No: <span className="font-mono font-bold text-slate-700">{student.rollNo || 'AMER-NEW'}</span> • {student.collegeName}
            </p>
          </div>
        </div>

        <div>
          {isPaid ? (
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full Access Unlocked (Zero Dues)</span>
            </div>
          ) : (
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0052CC] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : `Pay Course Fee (₹${pendingAmt.toLocaleString()})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 3 Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Prescribed Fee</span>
          <span className="text-2xl font-black text-slate-900 font-mono">₹{totalFee.toLocaleString()}</span>
          <p className="text-[10px] text-slate-500">{feeRecord?.program || student.courseName}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Amount Cleared</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">₹{paidAmt.toLocaleString()}</span>
          <p className="text-[10px] text-emerald-600">
            {isPaid ? '100% Cleared • Access Active' : `${Math.round((paidAmt / totalFee) * 100)}% Settled`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${pendingAmt > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            Pending Dues
          </span>
          <span className={`text-2xl font-black font-mono ${pendingAmt > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            ₹{pendingAmt.toLocaleString()}
          </span>
          <p className={`text-[10px] ${pendingAmt > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
            {pendingAmt > 0 ? 'Required after 10 Hours Free Pass' : 'No Outstanding Balance'}
          </p>
        </div>
      </div>

      {/* ─── Fee Installment Schedule & Details ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Program Installments & Clearance</h3>
            <p className="text-xs text-slate-500">Official ledger records verified by Finance Administration.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">10.0 Hours Trial Policy Compliant</span>
        </div>

        <div className="divide-y divide-slate-100">
          {(feeRecord?.installments || [
            {
              number: 1,
              title: 'Full Program Tuition & Lab Access Fee',
              amount: totalFee,
              dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              status: isPaid ? 'PAID' : 'UNPAID',
            },
          ]).map((inst: any, idx: number) => {
            const isInstPaid = inst.status === 'PAID' || isPaid;
            return (
              <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{inst.title}</span>
                    <StatusBadge status={isInstPaid ? 'PAID' : 'UNPAID'} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Due Date: <span className="font-mono text-slate-700">{inst.dueDate || 'Upon Trial Expiry'}</span>
                    {receiptOverride && <span className="text-emerald-700 ml-2 font-mono font-bold">• Receipt: #{receiptOverride}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black font-mono text-slate-900">
                    ₹{inst.amount.toLocaleString()}
                  </span>
                  {!isInstPaid ? (
                    <button
                      onClick={handlePayNow}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                      Cleared
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

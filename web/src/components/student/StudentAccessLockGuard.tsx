// ============================================================================
// ISML COLLEGE LMS — STUDENT ACCESS LOCK GUARD
// Enforces 10.0 Hours (600 Mins) Free Pass Policy for Unpaid Learners
// Locks Live Classes, Curriculum, & Practice when trial ends until payment
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, CreditCard, Sparkles, ShieldAlert, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { initiateRazorpayPayment } from '@/lib/razorpayClient';
import { useToast } from '@/context/ToastContext';

export default function StudentAccessLockGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showSuccess, showError, showInfo } = useToast();

  const [isLocked, setIsLocked] = useState(false);
  const [totalStayMins, setTotalStayMins] = useState(0);
  const [student, setStudent] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feeData, setFeeData] = useState<any>(null);

  // Excluded safe paths where student can always navigate (e.g. fee payment, change password)
  const isExemptPath = 
    pathname.startsWith('/student/fees') || 
    pathname.startsWith('/student/change-password') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/parent');

  const checkStatus = async () => {
    try {
      let roll = '';
      let sId = '';
      let sName = '';

      const stored = localStorage.getItem('isml_user') || localStorage.getItem('isml_student_profile');
      if (stored) {
        const u = JSON.parse(stored);
        // Only guard student role
        if (u.role && u.role !== 'STUDENT') return;
        roll = u.rollNo || u.studentId || '';
        sId = u.id || u.studentId || '';
        sName = u.name || '';
        setStudent(u);
      } else {
        return;
      }

      // 1. Fetch fee status from /api/portals/student-fees
      const feeRes = await fetch('/api/portals/student-fees');
      const feeJson = await feeRes.json();
      const feesList = feeJson?.data || [];
      const myFee = feesList.find((f: any) => {
        if (roll && f.rollNo?.toLowerCase() === roll.toLowerCase()) return true;
        if (sId && f.studentId?.toLowerCase() === sId.toLowerCase()) return true;
        if (sName && f.name?.toLowerCase().trim() === sName.toLowerCase().trim()) return true;
        return false;
      });

      setFeeData(myFee);

      // If fee is paid, student has full unhindered lifetime access
      const isPaid = myFee?.paymentStatus === 'PAID' || (myFee?.outstandingBalance === 0 && myFee?.paidAmount > 0);
      if (isPaid) {
        setIsLocked(false);
        return;
      }

      // 2. If UNPAID, check attended webinar minutes
      const attRes = await fetch('/api/portals/attendance');
      const attJson = await attRes.json();
      const attList = attJson?.data || [];
      const myAtt = attList.filter((a: any) => {
        if (roll && (a.studentRollNo?.toLowerCase() === roll.toLowerCase() || a.studentId?.toLowerCase() === roll.toLowerCase())) return true;
        if (sId && a.studentId?.toLowerCase() === sId.toLowerCase()) return true;
        if (sName && a.studentName?.toLowerCase().trim() === sName.toLowerCase().trim()) return true;
        return false;
      });

      const attendedMins = myAtt.reduce((sum: number, rec: any) => sum + (rec.stayMins || rec.durationMins || 60), 0);
      setTotalStayMins(attendedMins);

      // Lock if 10.0 Hours (600 Mins) completed
      if (attendedMins >= 600) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    } catch {
      // Fallback safe
    }
  };

  useEffect(() => {
    checkStatus();

    const handleSync = () => checkStatus();
    window.addEventListener('isml-realtime-event', handleSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('isml_student_status');
      bc.onmessage = (e) => {
        if (e.data?.type === 'ACCESS_UNLOCKED') {
          setIsLocked(false);
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('isml-realtime-event', handleSync);
      bc?.close();
    };
  }, [pathname]);

  const handlePayToUnlock = () => {
    const amount = feeData?.outstandingBalance || 18500;
    setIsProcessing(true);

    initiateRazorpayPayment({
      amount,
      studentId: student?.rollNo || student?.id || 'std-current',
      studentName: student?.name || 'Student',
      studentEmail: student?.email || 'student@isml.edu',
      paymentFor: 'Instant Course Access Unlock • 10 Hours Pass Expired',
      onSuccess: async (receipt) => {
        setIsProcessing(false);
        await fetch('/api/portals/student-fees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'PAY_FEE',
            studentId: student?.id,
            rollNo: student?.rollNo,
            studentName: student?.name,
            amountPaid: amount,
            receiptNo: receipt.receiptNo,
          }),
        }).catch(() => {});

        setIsLocked(false);
        showSuccess('Payment Successful! Course access has been fully unlocked.');
      },
      onFailure: (err) => {
        setIsProcessing(false);
        showError(`Payment cancelled or failed: ${err.description || 'Declined'}`);
      },
      onDismiss: () => {
        setIsProcessing(false);
        showInfo('Payment window closed. Please complete payment to unlock your portal.');
      },
    });
  };

  if (isLocked && !isExemptPath) {
    return (
      <div className="relative min-h-[550px] flex items-center justify-center p-4">
        {/* Blurred background mockup */}
        <div className="absolute inset-0 filter blur-md pointer-events-none opacity-40 overflow-hidden">
          {children}
        </div>

        {/* Lock Paywall Card */}
        <div className="relative z-20 max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800">
              10 Hours Free Access Expired
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Course Access Locked
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              You have completed your <strong>10.0 Hours Free Access Pass</strong> ({Math.round(totalStayMins / 60)} Hours consumed). Please clear your prescribed program tuition fee to continue attending live classes, accessing lecture recordings, and submitting assessments.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Free Hours Used:</span>
              <span className="font-bold text-slate-800">10.0 / 10.0 Hours (100%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Payment Status:</span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">UNPAID</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-700">Course Fee Required:</span>
              <span className="font-black text-base text-[#0052CC] font-mono">
                ₹{(feeData?.outstandingBalance || 18500).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <button
              onClick={handlePayToUnlock}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-[#0052CC] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl text-sm font-extrabold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessing ? 'Opening Payment Gateway...' : `Pay Fee & Unlock Access (₹${(feeData?.outstandingBalance || 18500).toLocaleString()})`}</span>
            </button>

            <Link
              href="/student/fees"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0052CC] transition py-1"
            >
              <span>View Full Fee Ledger & Installments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================================================
// ISML COLLEGE LMS — SEMESTER FEE PROGRESSION
// Term Progression Fee Matrix & Installment Milestones
// ============================================================================

"use client";

import React from 'react';
import Link from 'next/link';
import {
  CalendarRange,
  Receipt,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { mockFeeStructures } from '@/mock/superAdminData';
import StatusBadge from '@/components/common/StatusBadge';

export default function SemesterFeesPage() {
  const semesterBreakdown = [
    {
      semester: 'Semester 1',
      term: 'Odd Term (Jul - Nov)',
      totalFees: 48000,
      tuition: 33500,
      labAndTech: 8500,
      admissionOneTime: 2500,
      exam: 3500,
      status: 'APPROVED',
    },
    {
      semester: 'Semester 2',
      term: 'Even Term (Jan - May)',
      totalFees: 45500,
      tuition: 33500,
      labAndTech: 8500,
      admissionOneTime: 0,
      exam: 3500,
      status: 'APPROVED',
    },
    {
      semester: 'Semester 3',
      term: 'Odd Term (Jul - Nov)',
      totalFees: 46000,
      tuition: 34000,
      labAndTech: 8500,
      admissionOneTime: 0,
      exam: 3500,
      status: 'SUBMITTED',
    },
    {
      semester: 'Semester 4',
      term: 'Even Term (Jan - May)',
      totalFees: 46000,
      tuition: 34000,
      labAndTech: 8500,
      admissionOneTime: 0,
      exam: 3500,
      status: 'DRAFT',
    },
  ];

  return (
    <div className="space-y-6 pb-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-50 text-cyan-700 rounded-lg">
              <CalendarRange className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Semester Progression Fee Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Term-by-term financial obligations across undergraduate degree programs.
          </p>
        </div>

        <Link
          href="/super-admin/finance/fee-structures"
          className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Receipt className="w-4 h-4" />
          <span>Detailed Fee Schedules</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {semesterBreakdown.map((s, idx) => (
          <div
            key={idx}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{s.semester}</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.term}</p>

              <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Term Fee Total</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  ₹{s.totalFees.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tuition:</span>
                  <span className="font-semibold text-slate-800">₹{s.tuition.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lab & Technology:</span>
                  <span className="font-semibold text-slate-800">₹{s.labAndTech.toLocaleString()}</span>
                </div>
                {s.admissionOneTime > 0 && (
                  <div className="flex justify-between">
                    <span>One-time Admission:</span>
                    <span className="font-semibold text-slate-800">₹{s.admissionOneTime.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Examination:</span>
                  <span className="font-semibold text-slate-800">₹{s.exam.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Applies to Cohort 2026–2029
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

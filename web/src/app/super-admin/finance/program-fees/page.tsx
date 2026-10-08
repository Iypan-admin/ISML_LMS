// ============================================================================
// ISML COLLEGE LMS — PROGRAM FEE STRUCTURES
// Filtered Program Schedules by Department, Degree Track, Batch & Year
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { mockFeeStructures, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import StatusBadge from '@/components/common/StatusBadge';

export default function ProgramFeesPage() {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedProgram, setSelectedProgram] = useState('ALL');

  const filteredStructures = mockFeeStructures.filter((item) => {
    const matchesDept = selectedDept === 'ALL' || item.departmentName.includes(selectedDept);
    const matchesProg = selectedProgram === 'ALL' || item.programId === selectedProgram;
    return matchesDept && matchesProg;
  });

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-[#0052CC] rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Program-Wise Fee Master
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            View approved multi-semester fee schedules structured by Academic Department and Program.
          </p>
        </div>

        <Link
          href="/super-admin/finance/fee-structures"
          className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Receipt className="w-4 h-4" />
          <span>All Fee Schedules</span>
        </Link>
      </div>

      {/* ─── 2. Department & Program Filters ─── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter by:</span>
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#0052CC]"
        >
          <option value="ALL">All Departments</option>
          {mockDepartments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#0052CC]"
        >
          <option value="ALL">All Programs</option>
          {mockPrograms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* ─── 3. Program Fee Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStructures.map((fee) => (
          <div
            key={fee.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                {fee.code}
              </span>
              <StatusBadge status={fee.status} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">{fee.programName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {fee.departmentName} • {fee.batchName} ({fee.academicYear})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Semester {fee.semesterNumber} Total</span>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  ₹{fee.totalAmount.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Line Items</span>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {fee.components.length} Components
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Version {fee.version}.0 • {fee.effectiveFrom} to {fee.effectiveTo}
              </span>
              <Link
                href="/super-admin/finance/fee-structures"
                className="font-bold text-[#0052CC] hover:underline flex items-center gap-1"
              >
                <span>Breakdown</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — FINANCE REPORTS & RECONCILIATION
// Program-Wise Fee Realization, Outstanding Balances & CSV/PDF Export
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  BarChart2,
  Download,
  Filter,
  FileSpreadsheet,
  Receipt,
  TrendingUp,
  AlertCircle,
  Building,
} from 'lucide-react';
import { mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import { useRBAC } from '@/context/AuthRbacContext';

export default function FinanceReportsPage() {
  const { hasPermission } = useRBAC();
  const { showSuccess, showInfo } = useToast();

  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('2026-2027');

  const canExport = hasPermission('FINANCE_REPORT_EXPORT');

  const reportData = [
    {
      program: 'B.Sc Computer Science',
      department: 'Department of Computer Science & IT',
      studentsCount: 120,
      totalExpected: 5760000,
      totalCollected: 4896000,
      outstanding: 864000,
      collectionRate: '85.0%',
    },
    {
      program: 'Bachelor of Computer Applications (BCA)',
      department: 'Department of Computer Science & IT',
      studentsCount: 95,
      totalExpected: 4370000,
      totalCollected: 3627100,
      outstanding: 742900,
      collectionRate: '83.0%',
    },
    {
      program: 'B.A. French Language & Intercultural Studies',
      department: 'Department of Foreign Languages (ISML)',
      studentsCount: 80,
      totalExpected: 3360000,
      totalCollected: 2856000,
      outstanding: 504000,
      collectionRate: '85.0%',
    },
    {
      program: 'M.Sc Data Science & AI',
      department: 'Department of Computer Science & IT',
      studentsCount: 45,
      totalExpected: 2475000,
      totalCollected: 2103750,
      outstanding: 371250,
      collectionRate: '85.0%',
    },
  ];

  const handleExport = (format: 'CSV' | 'PDF') => {
    if (!canExport) {
      showInfo('Permission FINANCE_REPORT_EXPORT required for ledger data extraction.');
      return;
    }
    showSuccess(`Finance Report (${format}) generated and downloaded.`);
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-[#0052CC] rounded-lg">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Finance & Fee Collection Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Executive financial oversight: Program-wise realizations, outstanding balances, and audit extracts.
          </p>
        </div>

        {canExport && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport('CSV')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('PDF')}
              className="px-3 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Executive PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 2. High-Level Metrics ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Billed Fees</div>
          <div className="text-xl font-black text-slate-900 mt-1">₹ 1.59 Cr</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across 340 students</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <div className="text-[11px] font-semibold text-emerald-800">Total Realized (Paid)</div>
          <div className="text-xl font-black text-emerald-700 mt-1">₹ 1.34 Cr</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">84.3% collection efficiency</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <div className="text-[11px] font-semibold text-rose-800">Outstanding Balance</div>
          <div className="text-xl font-black text-rose-700 mt-1">₹ 24.8 Lakhs</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Installment #2 pending</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-2xs bg-purple-50/20">
          <div className="text-[11px] font-semibold text-purple-800">Waivers & Discounts</div>
          <div className="text-xl font-black text-purple-700 mt-1">₹ 8.5 Lakhs</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Merit & early admission</div>
        </div>
      </div>

      {/* ─── 3. Detailed Table ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Program-Wise Fee Realization Schedule
          </h2>
          <span className="text-[11px] text-slate-500 font-semibold">Academic Year 2026–2027</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                <th className="py-3 px-4">Program Track</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Enrolled</th>
                <th className="py-3 px-4 text-right">Expected</th>
                <th className="py-3 px-4 text-right">Collected</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.program}</td>
                  <td className="py-3 px-4 text-slate-600">{row.department}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {row.studentsCount}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    ₹{row.totalExpected.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    ₹{row.totalCollected.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600">
                    ₹{row.outstanding.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.collectionRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: COMPREHENSIVE FINANCE REPORTS & AUDIT VIEWER
// (/finance-manager/reports)
// Premium UI with Analytics Bar, Visual Progress Bars, Metric KPI Tiles,
// Tabbed Report Tables (Daily Collections, Overdue Defaulters, Program Realization,
// Campus Fee Overview), Inspection Modals & CSV/PDF Export.
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  BadgeDollarSign,
  AlertCircle,
  FileText,
  Printer,
  CheckCircle2,
  Eye,
  Filter,
  Search,
  Users,
  Coins,
  ShieldCheck,
  Building2,
  ArrowRight,
  Layers,
  GraduationCap,
  Sparkles,
  Percent,
  Clock,
  ArrowUpRight,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import { useCollege } from '@/context/CollegeContext';
import { mockStudentFees, mockTransactions, TransactionRecord, StudentFeeRecord } from '@/mock/financeManagerData';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/common/Modal';

type ReportType = 
  | 'DAILY_COLLECTIONS' 
  | 'OVERDUE_DEFAULTERS' 
  | 'PROGRAM_REALIZATION';

export default function FinanceReportsPage() {
  const { selectedCollegeId, selectedCollege, isOverall } = useCollege();
  const { showSuccess, showInfo } = useToast();

  const [activeReportTab, setActiveReportTab] = useState<ReportType>('DAILY_COLLECTIONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [detailStudent, setDetailStudent] = useState<StudentFeeRecord | null>(null);
  const [detailTx, setDetailTx] = useState<TransactionRecord | null>(null);

  // College-scoped data
  const filteredFees = useMemo(() => {
    return isOverall
      ? mockStudentFees
      : mockStudentFees.filter((f) => f.collegeId === selectedCollegeId);
  }, [isOverall, selectedCollegeId]);

  const filteredTransactions = useMemo(() => {
    return isOverall
      ? mockTransactions
      : mockTransactions.filter((t) => t.collegeId === selectedCollegeId);
  }, [isOverall, selectedCollegeId]);

  // Overall metric totals
  const totalExpected = filteredFees.reduce((acc, f) => acc + f.netPayable, 0);
  const totalCollected = filteredFees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = filteredFees.reduce((acc, f) => acc + f.outstandingBalance, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // 1. Daily Collection Transactions data
  const dailyCollectionData = useMemo(() => {
    return filteredTransactions.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.studentName.toLowerCase().includes(q) ||
        t.rollNo.toLowerCase().includes(q) ||
        t.receiptNo.toLowerCase().includes(q) ||
        t.gatewayRef.toLowerCase().includes(q);

      const matchesSem = selectedSemester === 'ALL' || t.semester.toString() === selectedSemester;
      return matchesSearch && matchesSem;
    });
  }, [filteredTransactions, searchQuery, selectedSemester]);

  // 2. Overdue Defaulters data
  const overdueDefaultersData = useMemo(() => {
    return filteredFees
      .filter((s) => s.outstandingBalance > 0)
      .filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.program.toLowerCase().includes(q);

        const matchesSem = selectedSemester === 'ALL' || s.currentSemester.toString() === selectedSemester;
        return matchesSearch && matchesSem;
      });
  }, [filteredFees, searchQuery, selectedSemester]);

  // 3. Program Realization Schedule data
  const programRealizationData = useMemo(() => {
    const progMap = new Map<string, {
      program: string;
      languageTrack: string;
      studentCount: number;
      expected: number;
      collected: number;
      outstanding: number;
    }>();

    filteredFees.forEach((s) => {
      const existing = progMap.get(s.program) || {
        program: s.program,
        languageTrack: s.program || 'Foreign Language Track',
        studentCount: 0,
        expected: 0,
        collected: 0,
        outstanding: 0,
      };

      existing.studentCount += 1;
      existing.expected += s.netPayable;
      existing.collected += s.paidAmount;
      existing.outstanding += s.outstandingBalance;
      progMap.set(s.program, existing);
    });

    return Array.from(progMap.values()).filter((row) => {
      const q = searchQuery.toLowerCase().trim();
      return !q || row.program.toLowerCase().includes(q) || row.languageTrack.toLowerCase().includes(q);
    });
  }, [filteredFees, searchQuery]);

  const handleDownloadReport = (reportName: string) => {
    showSuccess(`Exporting "${reportName}" as Excel (.xlsx) and printable PDF...`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Finance Manager' }, { label: 'Reports & Audit Ledger' }]} />

      <CollegeFilterBar />

      {/* ─── 1. Header Hero Banner ─── */}
      <div className="bg-gradient-to-r from-[#061A36] via-[#092B5A] to-[#1E3A8A] text-white p-5 sm:p-6 rounded-2xl shadow-md border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Treasury Audit Engine</span>
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-300 font-semibold">
              {isOverall ? 'All Campuses Consolidated' : selectedCollege?.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Financial Intelligence & Audit Reports</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Real-time reconciliation analytics, revenue realization rates, fee collection ledgers, and overdue defaulters tracking across degree cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => handleDownloadReport('Consolidated Master Audit Dossier')}
            className="px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Master Report (XLSX)</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Metric Overview Tiles & Realization Gauge ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Billed Net Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Billed Fees</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalExpected.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Enrolled Students</span>
            <span className="font-bold text-slate-800">{filteredFees.length} Learners</span>
          </div>
        </div>

        {/* Card 2: Total Realized Collections */}
        <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/30 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Realized Collections</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 border-t border-emerald-100">
            <span>Paid Ratio</span>
            <span className="font-bold text-emerald-900">{collectionRate}% Realized</span>
          </div>
        </div>

        {/* Card 3: Outstanding Balance Dues */}
        <div className="p-4 bg-white rounded-2xl border border-rose-200/80 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100/30 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Outstanding Dues</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-rose-800 pt-1 border-t border-rose-100">
            <span>Pending Accounts</span>
            <span className="font-bold text-rose-900">{overdueDefaultersData.length} Students</span>
          </div>
        </div>

        {/* Card 4: Overall Treasury Efficiency Gauge */}
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50/60 rounded-2xl border border-indigo-200 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Collection Velocity</span>
            <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
              FY 2026–27
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-black text-indigo-950">{collectionRate}%</span>
              <span className="text-xs font-bold text-emerald-700">On Track</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, collectionRate)}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-1 border-t border-indigo-100">
            Target benchmark: 85% by mid-term census
          </p>
        </div>
      </div>

      {/* ─── 3. Interactive Report Navigation Tabs & Tools ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Tab Selector Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              {
                id: 'DAILY_COLLECTIONS',
                label: 'Daily Collection Ledger',
                icon: TrendingUp,
                count: dailyCollectionData.length,
                badgeColor: 'bg-emerald-100 text-emerald-800',
              },
              {
                id: 'OVERDUE_DEFAULTERS',
                label: 'Overdue Defaulters Dossier',
                icon: AlertCircle,
                count: overdueDefaultersData.length,
                badgeColor: 'bg-rose-100 text-rose-800',
              },
              {
                id: 'PROGRAM_REALIZATION',
                label: 'Program Realization Matrix',
                icon: GraduationCap,
                count: programRealizationData.length,
                badgeColor: 'bg-blue-100 text-blue-800',
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeReportTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReportTab(tab.id as ReportType)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white font-bold' : tab.badgeColor
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDownloadReport(activeReportTab.replace('_', ' '))}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleDownloadReport(`${activeReportTab} Print View`)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Search & In-Table Filters */}
        <div className="p-3.5 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student, roll number, receipt, or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
            </select>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-[#0052CC] font-bold hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ─── TAB 1: DAILY COLLECTIONS VIEW ─── */}
        {activeReportTab === 'DAILY_COLLECTIONS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 pl-5">Receipt No & Date</th>
                  <th className="py-3 px-3">Student & Roll No</th>
                  <th className="py-3 px-3">Degree & Term</th>
                  <th className="py-3 px-3">Payment Channel</th>
                  <th className="py-3 px-3 text-right">Amount Paid</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyCollectionData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No collection transactions found matching query.
                    </td>
                  </tr>
                ) : (
                  dailyCollectionData.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 pl-5">
                        <span className="font-mono font-bold text-slate-900 block">{tx.receiptNo}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{tx.studentName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{tx.rollNo}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-800 font-medium block truncate max-w-[180px]">{tx.program}</span>
                        <span className="text-[10px] text-slate-400">Semester {tx.semester}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {tx.paymentMethod}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[110px]" title={tx.gatewayRef}>
                            {tx.gatewayRef}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDetailTx(tx)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#0052CC] hover:text-white text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 2: OVERDUE DEFAULTERS DOSSIER ─── */}
        {activeReportTab === 'OVERDUE_DEFAULTERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 pl-5">Student & Roll No</th>
                  <th className="py-3 px-3">Program & Batch</th>
                  <th className="py-3 px-3 text-right">Total Net Fee</th>
                  <th className="py-3 px-3 text-right">Amount Paid</th>
                  <th className="py-3 px-3 text-right">Overdue Balance</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueDefaultersData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No overdue defaulters found! All student fee accounts are settled.
                    </td>
                  </tr>
                ) : (
                  overdueDefaultersData.map((std) => (
                    <tr key={std.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-3 px-4 pl-5">
                        <span className="font-bold text-slate-900 block">{std.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{std.rollNo} • {std.email}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-800 font-medium block truncate max-w-[200px]">{std.program}</span>
                        <span className="text-[10px] text-slate-400">Sem {std.currentSemester} • {std.batch}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        ₹{std.netPayable.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        ₹{std.paidAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-rose-600 text-sm">
                        ₹{std.outstandingBalance.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={std.paymentStatus} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDetailStudent(std)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ledger</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 3: PROGRAM-WISE REALIZATION MATRIX ─── */}
        {activeReportTab === 'PROGRAM_REALIZATION' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 pl-5">Program Degree</th>
                  <th className="py-3 px-3">Language Track</th>
                  <th className="py-3 px-3 text-center">Enrolled</th>
                  <th className="py-3 px-3 text-right">Expected Revenue</th>
                  <th className="py-3 px-3 text-right">Realized (Paid)</th>
                  <th className="py-3 px-3 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-center">Collection Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programRealizationData.map((row, idx) => {
                  const rate = row.expected > 0 ? Math.round((row.collected / row.expected) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 pl-5 font-bold text-slate-900">{row.program}</td>
                      <td className="py-3 px-3 text-teal-700 font-bold">Language Track</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{row.studentCount}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        ₹{row.expected.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        ₹{row.collected.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600">
                        ₹{row.outstanding.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, rate)}%` }}
                            />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              rate >= 80
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Detail Modal: Transaction View ─── */}
      <Modal
        isOpen={!!detailTx}
        onClose={() => setDetailTx(null)}
        title="Transaction Audit Record"
        description={`Receipt: ${detailTx?.receiptNo} • ${detailTx?.paymentMethod}`}
        maxWidth="md"
      >
        {detailTx && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700">Student Name</span>
                <span className="font-black text-slate-900">{detailTx.studentName} ({detailTx.rollNo})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Program Track</span>
                <span className="font-semibold text-slate-800">{detailTx.program} — Sem {detailTx.semester}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Gateway Ref</span>
                <span className="font-mono font-bold text-slate-800">{detailTx.gatewayRef}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-black text-base text-slate-950">₹{detailTx.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Timestamp</span>
                <span className="font-medium text-slate-700">{new Date(detailTx.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={detailTx.status} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDetailTx(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Detail Modal: Student Fee Ledger View ─── */}
      <Modal
        isOpen={!!detailStudent}
        onClose={() => setDetailStudent(null)}
        title="Student Fee Account Ledger"
        description={`${detailStudent?.name} (${detailStudent?.rollNo})`}
        maxWidth="lg"
      >
        {detailStudent && (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Billed Tuition</span>
                <span className="font-bold text-slate-800 text-sm">₹{detailStudent.netPayable.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Amount Paid</span>
                <span className="font-bold text-emerald-700 text-sm">₹{detailStudent.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Overdue Balance</span>
                <span className="font-black text-rose-600 text-sm">₹{detailStudent.outstandingBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Installments Table */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                Installment Breakdown ({detailStudent.installments.length} Terms)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {detailStudent.installments.map((inst) => (
                  <div key={inst.number} className="p-3 flex items-center justify-between bg-white text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Term {inst.number}</span>
                      <span className="block text-[10px] text-slate-400">Due Date: {inst.dueDate}</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-bold text-slate-900">₹{inst.amount.toLocaleString('en-IN')}</span>
                      <StatusBadge status={inst.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailStudent(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Close Ledger
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

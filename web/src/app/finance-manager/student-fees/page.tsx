// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: STUDENT FEES (/finance-manager/student-fees)
// Student-Wise Fee Details, Installment Status, Paid & Pending Dues, Reminder Tools
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Receipt,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import { useCollege } from '@/context/CollegeContext';
import { mockStudentFees, StudentFeeRecord } from '@/mock/financeManagerData';
import { useToast } from '@/context/ToastContext';

export default function StudentFeesPage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const { showSuccess, showInfo } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'OVERDUE'>('ALL');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>('sf-02');

  // Filter based on college and inputs
  const collegeScoped = isOverall
    ? mockStudentFees
    : mockStudentFees.filter((s) => s.collegeId === selectedCollegeId);

  const filteredStudents = collegeScoped.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReminder = (student: StudentFeeRecord) => {
    showSuccess(`Overdue payment reminder dispatched to ${student.name} (${student.email}) via SMS & Email.`);
  };

  const handleExportCsv = () => {
    showInfo('Exporting student billing ledger as CSV...');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Finance Manager' }, { label: 'Student Fees' }]} />

      <CollegeFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0052CC]" />
            <span>Student Fee Ledgers & Installments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Student-level tuition accounts, concessions applied, term installment tracks and balance dues.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or degree..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(['ALL', 'PAID', 'PARTIAL', 'OVERDUE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Students List Card with Expandable Installments */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No students match the current filters.
            </div>
          ) : (
            filteredStudents.map((std) => {
              const isExpanded = expandedStudentId === std.id;

              return (
                <div key={std.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {std.name.charAt(0)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {std.name}
                          </h3>
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {std.rollNo}
                          </span>
                          <StatusBadge status={std.paymentStatus} />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {std.program} • Semester {std.currentSemester} • {std.collegeName}
                        </p>
                      </div>
                    </div>

                    {/* Financial Figures */}
                    <div className="flex items-center gap-6 self-stretch lg:self-center justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Net Payable
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          ₹{std.netPayable.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                          Paid
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                          ₹{std.paidAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                          Outstanding
                        </span>
                        <span className={`text-xs sm:text-sm font-black ${std.outstandingBalance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          ₹{std.outstandingBalance.toLocaleString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {std.outstandingBalance > 0 && (
                          <button
                            onClick={() => handleSendReminder(std)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Send due reminder"
                          >
                            <Send className="w-3 h-3" />
                            <span className="hidden sm:inline">Remind</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedStudentId(isExpanded ? null : std.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Toggle Installment Details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Installments Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 bg-slate-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Installment Breakdown ({std.installments.length} Terms)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {std.installments.map((inst) => (
                          <div
                            key={inst.number}
                            className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Term {inst.number}</span>
                              <StatusBadge status={inst.status} />
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span>Due Date:</span>
                              <span className="font-semibold text-slate-800">{inst.dueDate}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                              <span>Amount:</span>
                              <span>₹{inst.amount.toLocaleString()}</span>
                            </div>
                            {inst.receiptNo && (
                              <div className="flex items-center justify-between text-[10px] text-emerald-700 font-mono pt-1">
                                <span>Receipt:</span>
                                <span>{inst.receiptNo}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

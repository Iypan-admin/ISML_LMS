// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: PAYMENTS & TRANSACTIONS
// (/finance-manager/transactions)
// Razorpay Online Gateway, SMS Payment Links, Counter Cash/DD Offline Approvals,
// and College Bulk Bank Challan CMS Reconciliation Engine
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileCheck2,
  Coins,
  ArrowRight,
  ExternalLink,
  Plus,
  Landmark,
  ShieldCheck,
  Link as LinkIcon,
  Layers,
  Sparkles,
  Smartphone,
  Check,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import { useCollege } from '@/context/CollegeContext';
import { mockTransactions, TransactionRecord, mockStudentFees } from '@/mock/financeManagerData';
import { useToast } from '@/context/ToastContext';
import BulkChallanEntryDrawer from '@/components/finance-manager/forms/BulkChallanEntryDrawer';
import RecordOfflinePaymentDrawer from '@/components/finance-manager/forms/RecordOfflinePaymentDrawer';
import SubmitPaymentForApprovalModal from '@/components/finance-manager/forms/SubmitPaymentForApprovalModal';

export default function TransactionsPage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const { showSuccess, showInfo } = useToast();

  const [transactions, setTransactions] = useState<TransactionRecord[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ONLINE' | 'OFFLINE_APPROVALS' | 'BULK_CHALLAN'>('ALL');

  // Modals and Drawers
  const [isBulkChallanOpen, setIsBulkChallanOpen] = useState(false);
  const [isRecordOfflineOpen, setIsRecordOfflineOpen] = useState(false);
  const [submitTargetTx, setSubmitTargetTx] = useState<TransactionRecord | null>(null);

  // College-scoped transactions
  const collegeScoped = useMemo(() => {
    return isOverall
      ? transactions
      : transactions.filter((t) => t.collegeId === selectedCollegeId);
  }, [transactions, isOverall, selectedCollegeId]);

  // Tab and Filters
  const filteredTransactions = useMemo(() => {
    return collegeScoped.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.studentName.toLowerCase().includes(q) ||
        t.rollNo.toLowerCase().includes(q) ||
        t.receiptNo.toLowerCase().includes(q) ||
        t.gatewayRef.toLowerCase().includes(q) ||
        (t.challanNumber && t.challanNumber.toLowerCase().includes(q));

      const matchesMethod = methodFilter === 'ALL' || t.paymentMethod === methodFilter;
      const matchesChannel = channelFilter === 'ALL' || t.channelType === channelFilter;
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

      // Tab filtering
      if (activeTab === 'ONLINE') {
        if (t.channelType !== 'RAZORPAY_GATEWAY' && t.channelType !== 'PAYMENT_LINK') return false;
      } else if (activeTab === 'OFFLINE_APPROVALS') {
        if (!t.requiresFinanceApproval) return false;
      } else if (activeTab === 'BULK_CHALLAN') {
        if (t.channelType !== 'BANK_CHALLAN_BULK') return false;
      }

      return matchesSearch && matchesMethod && matchesChannel && matchesStatus;
    });
  }, [collegeScoped, searchQuery, methodFilter, channelFilter, statusFilter, activeTab]);

  // Counts for quick tabs
  const pendingApprovalsCount = useMemo(() => {
    return collegeScoped.filter((t) => t.requiresFinanceApproval && t.status === 'PENDING').length;
  }, [collegeScoped]);

  const bulkChallansCount = useMemo(() => {
    return collegeScoped.filter((t) => t.channelType === 'BANK_CHALLAN_BULK').length;
  }, [collegeScoped]);

  const onlineRazorpayCount = useMemo(() => {
    return collegeScoped.filter(
      (t) => t.channelType === 'RAZORPAY_GATEWAY' || t.channelType === 'PAYMENT_LINK'
    ).length;
  }, [collegeScoped]);

  // Handlers
  const handlePrintReceipt = (tx: TransactionRecord) => {
    showSuccess(`Generating official PDF receipt for ${tx.receiptNo} (${tx.studentName})...`);
  };

  const handleCreatedTx = (newTx: TransactionRecord) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleSubmitToSuperAdmin = (txId: string, notes: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'PENDING',
              approvalStatus: 'PENDING',
              remarks: `${t.remarks || ''} [Submitted to Super Admin: ${notes}]`,
            }
          : t
      )
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Finance Manager' }, { label: 'Payments & Transactions' }]} />

      <CollegeFilterBar />

      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#0052CC]" />
            <span>Payments & Cash Transactions Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated Razorpay gateway collections, counter cash/DD authorizations, and bulk campus bank challan reconciliations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRecordOfflineOpen(true)}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-amber-700" />
            <span>Direct Student Fee (Offline & Online)</span>
          </button>

          <button
            onClick={() => setIsBulkChallanOpen(true)}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Landmark className="w-4 h-4" />
            <span>Bulk Deposit (Offline & Online CMS)</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Operational Channel Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Razorpay PG */}
        <div
          onClick={() => setActiveTab('ONLINE')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'ONLINE'
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Online Gateway</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-800">Razorpay PG</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {onlineRazorpayCount} <span className="text-xs font-semibold text-slate-500">Transactions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Instant UPI, QR & NetBanking auto-cleared</p>
        </div>

        {/* Card 2: Offline Pending Verification */}
        <div
          onClick={() => setActiveTab('OFFLINE_APPROVALS')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'OFFLINE_APPROVALS'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Offline Counter Vouchers</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                {pendingApprovalsCount} Awaiting Super Admin
              </span>
            )}
          </div>
          <div className="text-xl font-black text-amber-950 mt-2">
            {pendingApprovalsCount} <span className="text-xs font-semibold text-slate-500">Submitted</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-1">Cash counters, DD vouchers & bank deposits</p>
        </div>

        {/* Card 3: Bulk Bank Challan */}
        <div
          onClick={() => setActiveTab('BULK_CHALLAN')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'BULK_CHALLAN'
              ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20'
              : 'border-slate-200 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Bank CMS Challans</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-100 text-teal-800">Batch CMS</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {bulkChallansCount} <span className="text-xs font-semibold text-slate-500">Batches</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cohort-level college bank deposit records</p>
        </div>

        {/* Card 4: Daily Collection Export */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-[#0A2347] text-white rounded-2xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Daily Reconciliation</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base font-black text-white mt-2">All Channels Active</div>
            <p className="text-[11px] text-slate-300 mt-0.5">Audit-ready treasury report</p>
          </div>
          <button
            onClick={() => showInfo('Exporting daily collection report...')}
            className="mt-3 pt-2 border-t border-white/10 text-xs font-bold text-cyan-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Download Daily PDF</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── 3. Tabs Navigation ─── */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'ALL', label: `All Transactions (${collegeScoped.length})` },
          { id: 'ONLINE', label: `Razorpay Online Gateway (${onlineRazorpayCount})` },
          { id: 'OFFLINE_APPROVALS', label: `Offline Approvals (${pendingApprovalsCount} Pending)` },
          { id: 'BULK_CHALLAN', label: `Bulk Bank Challans (${bulkChallansCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 4. Search and Filters Toolbar ─── */}
      <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by receipt no, student, roll no, challan ref or gateway ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto flex-wrap">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Payment Channels</option>
            <option value="RAZORPAY_GATEWAY">Razorpay Online Gateway</option>
            <option value="PAYMENT_LINK">Online Payment Link</option>
            <option value="OFFLINE_COUNTER">Offline Campus Counter</option>
            <option value="BANK_CHALLAN_BULK">Bulk Bank Challan</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="CASH">Cash at Counter</option>
            <option value="DEMAND_DRAFT">Demand Draft (DD)</option>
            <option value="BANK_CHALLAN">Bank Challan</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success / Approved</option>
            <option value="PENDING">Pending Approval</option>
            <option value="FAILED">Failed / Rejected</option>
          </select>

          {(searchQuery || methodFilter !== 'ALL' || channelFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setMethodFilter('ALL');
                setChannelFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ─── 5. Transactions Ledger Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3.5 pl-5">Receipt No & Date</th>
                <th className="p-3.5">Student / Beneficiary</th>
                <th className="p-3.5">Payment Channel & Method</th>
                <th className="p-3.5">Gateway / Challan Ref</th>
                <th className="p-3.5">Amount (INR)</th>
                <th className="p-3.5">Status & Approval</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No transactions match the given query.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Receipt No */}
                    <td className="p-3.5 pl-5">
                      <div className="font-mono font-bold text-slate-900">{tx.receiptNo}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(tx.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Student / Beneficiary */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{tx.studentName}</span>
                        {tx.isBulkChallanBatch && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                            BULK COHORT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {tx.rollNo} • {tx.program} (Sem {tx.semester})
                      </div>
                    </td>

                    {/* Payment Channel & Method */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {tx.paymentMethod}
                        </span>
                        {tx.channelType === 'RAZORPAY_GATEWAY' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                            Razorpay Online
                          </span>
                        )}
                        {tx.channelType === 'PAYMENT_LINK' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Payment Link
                          </span>
                        )}
                        {tx.channelType === 'OFFLINE_COUNTER' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                            Offline Counter
                          </span>
                        )}
                        {tx.channelType === 'BANK_CHALLAN_BULK' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                            Bank CMS Challan
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[190px] mt-1" title={tx.remarks}>
                        {tx.remarks}
                      </div>
                    </td>

                    {/* Ref & Challan */}
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="font-bold text-slate-800 truncate max-w-[140px]" title={tx.gatewayRef}>
                        {tx.gatewayRef}
                      </div>
                      {tx.challanNumber && (
                        <div className="text-[10px] text-teal-700 font-semibold truncate max-w-[140px]">
                          Challan: {tx.challanNumber}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ₹{tx.amount.toLocaleString()}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <StatusBadge status={tx.status} />
                        {tx.requiresFinanceApproval && (
                          <div className="text-[10px]">
                            {tx.status === 'SUCCESS' ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                            ) : tx.status === 'PENDING' ? (
                              <span className="text-amber-700 font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Awaiting Super Admin</span>
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tx.requiresFinanceApproval && tx.status === 'PENDING' && (
                          <button
                            onClick={() => setSubmitTargetTx(tx)}
                            className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            title="Submit payment voucher for Super Admin executive authorization"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                            <span>Submit to Super Admin</span>
                          </button>
                        )}

                        <button
                          onClick={() => handlePrintReceipt(tx)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Download / Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modals & Drawers ─── */}
      <BulkChallanEntryDrawer
        isOpen={isBulkChallanOpen}
        onClose={() => setIsBulkChallanOpen(false)}
        onCreated={handleCreatedTx}
      />

      <RecordOfflinePaymentDrawer
        isOpen={isRecordOfflineOpen}
        onClose={() => setIsRecordOfflineOpen(false)}
        onCreated={handleCreatedTx}
      />

      <SubmitPaymentForApprovalModal
        isOpen={!!submitTargetTx}
        onClose={() => setSubmitTargetTx(null)}
        transaction={submitTargetTx}
        onSubmitted={handleSubmitToSuperAdmin}
      />
    </div>
  );
}

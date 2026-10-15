// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: APPROVALS & PROPOSALS TRACKER
// (/finance-manager/approvals)
// Real-time tracking of Fee Structures & Payment Vouchers awaiting Super Admin authorization.
// Features: Status Filter Tabs (Awaiting Decision, Approved, Revisions Required, Rejected),
// Detailed Inspection Drawer, Super Admin Feedback, and Resubmit Workflow.
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Send,
  Eye,
  Search,
  Filter,
  Layers,
  Building2,
  Calendar,
  XCircle,
  FileText,
  Coins,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import { useCollege } from '@/context/CollegeContext';
import { ApprovalRequest, RequestStatus } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';
import { financeProposalStore } from '@/services/financeProposalStore';
import ProposeFeeStructureDrawer from '@/components/finance-manager/forms/ProposeFeeStructureDrawer';
import ViewProposalDetailDrawer from '@/components/finance-manager/forms/ViewProposalDetailDrawer';

export default function FinanceManagerApprovalsPage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const { showSuccess, showInfo } = useToast();

  const [requests, setRequests] = useState<ApprovalRequest[]>(() =>
    financeProposalStore.getFinanceOnlyRequests()
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CHANGES_REQUIRED' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Drawers State
  const [isProposeDrawerOpen, setIsProposeDrawerOpen] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState<ApprovalRequest | null>(null);

  React.useEffect(() => {
    return financeProposalStore.subscribe(() => {
      setRequests(financeProposalStore.getFinanceOnlyRequests());
    });
  }, []);

  // Filter based on tab and search
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.entityName.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q) ||
        req.requestType.toLowerCase().includes(q) ||
        req.submittedBy.name.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === 'PENDING') {
        return req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW';
      }
      if (activeTab === 'CHANGES_REQUIRED') {
        return req.status === 'CHANGES_REQUIRED';
      }
      if (activeTab === 'APPROVED') {
        return req.status === 'APPROVED';
      }
      if (activeTab === 'REJECTED') {
        return req.status === 'REJECTED';
      }
      return true;
    });
  }, [requests, searchQuery, activeTab]);

  // Counts for tabs
  const pendingCount = requests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW'
  ).length;
  const changesCount = requests.filter((r) => r.status === 'CHANGES_REQUIRED').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  const handleResubmit = (req: ApprovalRequest) => {
    setIsProposeDrawerOpen(true);
    showInfo(`Draft loaded for revising "${req.entityName}". Adjust and resubmit.`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Finance Manager' }, { label: 'Approvals & Requests' }]} />

      <CollegeFilterBar />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Super Admin Executive Queue
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Proposals & Super Admin Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of Fee Schedules & Payment Vouchers submitted for Super Admin authorization.
          </p>
        </div>

        <button
          onClick={() => setIsProposeDrawerOpen(true)}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Fee Proposal to Super Admin</span>
        </button>
      </div>

      {/* KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab('PENDING')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'PENDING' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10' : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Awaiting Super Admin</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-950 mt-2">
            {pendingCount} <span className="text-xs font-semibold text-slate-500">In Review</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-1">Pending executive sign-off</p>
        </div>

        <div
          onClick={() => setActiveTab('CHANGES_REQUIRED')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'CHANGES_REQUIRED' ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/10' : 'border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Revisions Required</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl font-black text-orange-950 mt-2">
            {changesCount} <span className="text-xs font-semibold text-slate-500">Need Action</span>
          </div>
          <p className="text-[11px] text-orange-800 mt-1">Super Admin provided feedback</p>
        </div>

        <div
          onClick={() => setActiveTab('APPROVED')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'APPROVED' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Authorized</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-950 mt-2">
            {approvedCount} <span className="text-xs font-semibold text-slate-500">Active</span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">Live in student billing portal</p>
        </div>

        <div
          onClick={() => setActiveTab('REJECTED')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'REJECTED' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10' : 'border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-950 mt-2">
            {rejectedCount} <span className="text-xs font-semibold text-slate-500">Proposals</span>
          </div>
          <p className="text-[11px] text-rose-800 mt-1">Declined with remarks</p>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 ${
              activeTab === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Proposals ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'PENDING' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Awaiting Decision ({pendingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('CHANGES_REQUIRED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'CHANGES_REQUIRED' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Revisions Required ({changesCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'APPROVED' ? 'bg-[#0052CC] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized ({approvedCount})</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search proposal, ID, submitter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900"
          />
        </div>
      </div>

      {/* Proposals List Cards */}
      <div className="space-y-3.5">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`p-5 bg-white rounded-2xl border shadow-2xs space-y-3.5 transition-all hover:border-slate-300 ${
                req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW'
                  ? 'border-l-4 border-l-amber-500'
                  : req.status === 'CHANGES_REQUIRED'
                  ? 'border-l-4 border-l-orange-500'
                  : req.status === 'APPROVED'
                  ? 'border-l-4 border-l-emerald-500'
                  : 'border-l-4 border-l-rose-500'
              }`}
            >
              {/* Row Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {req.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {req.requestType}
                  </span>
                  <StatusBadge status={req.status} />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Submitted on {new Date(req.submittedDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Entity & Submitter Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{req.entityName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prepared by <strong className="text-slate-800">{req.submittedBy.name}</strong> ({req.submittedBy.role}) • {req.submittedBy.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedDetailRequest(req)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Details</span>
                  </button>

                  {req.status === 'CHANGES_REQUIRED' && (
                    <button
                      onClick={() => handleResubmit(req)}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Resubmit Revision</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Impact Analysis Note */}
              {req.impactAnalysis && (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Proposal Impact:</strong> {req.impactAnalysis}
                </div>
              )}

              {/* Super Admin Feedback Alert if Changes Required */}
              {req.status === 'CHANGES_REQUIRED' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-orange-950">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span>Super Admin Revision Instructions:</span>
                  </div>
                  <p className="text-orange-900 pl-5 leading-relaxed">
                    {req.reviewComments || 'Please adjust the installment breakdown for early admission batches.'}
                  </p>
                </div>
              )}

              {/* Approved Notice */}
              {req.status === 'APPROVED' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-900">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Authorized by Super Admin. Live in student portal billing.</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-mono font-bold">
                    ACTIVE IN LEDGER
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No proposals found matching this filter.</p>
            <p className="text-slate-400">All submitted proposals have been processed or none have been filed yet.</p>
          </div>
        )}
      </div>

      {/* Slide-over Drawers */}
      <ProposeFeeStructureDrawer
        isOpen={isProposeDrawerOpen}
        onClose={() => setIsProposeDrawerOpen(false)}
      />

      <ViewProposalDetailDrawer
        isOpen={!!selectedDetailRequest}
        request={selectedDetailRequest}
        onClose={() => setSelectedDetailRequest(null)}
        onResubmit={handleResubmit}
      />
    </div>
  );
}

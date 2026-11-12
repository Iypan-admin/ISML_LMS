// ============================================================================
// ISML COLLEGE LMS — FINANCE PROPOSALS STORE & DISPATCHER
// Shared State Hub: Finance Manager prepares proposals -> Super Admin Authorizes
// ============================================================================

import { ApprovalRequest, RequestStatus } from '@/types/rbac';
import realDbFeeStructures from '@/lib/realDbFeeStructures.json';

// Initialize with real database pending fee structures that require Super Admin approval
const initialDbProposals: ApprovalRequest[] = (realDbFeeStructures as any[])
  .filter((s: any) => s.approvalStatus === 'PENDING')
  .map((s: any) => ({
    id: s.approvalRequestId || `REQ-FIN-${s.code}`,
    requestType: 'FEE_SCHEDULE_CREATION',
    module: 'Finance',
    entityType: 'FeeStructure',
    entityId: s.id,
    entityName: `${s.structureName} (${s.code})`,
    submittedBy: {
      name: 'Campus Finance Controller',
      email: 'finance@isml.edu',
      role: 'Finance Manager',
    },
    submittedDate: s.createdAt,
    status: 'SUBMITTED' as RequestStatus,
    impactAnalysis: `New tuition & lab studio schedule for ${s.courseName || s.structureName}. Total term fee of ₹${Number(s.totalFeeAmount).toLocaleString()} with 3-term EMI installment facility. Requires Central Super Admin sign-off before student enrollment ledgers are activated.`,
    diff: (s.components || []).map((c: any) => ({
      field: c.name,
      oldValue: '₹0 (Unassigned)',
      newValue: `₹${c.amount.toLocaleString()}`,
    })),
    history: [
      {
        step: 'Proposed by Finance Manager',
        userName: 'Campus Finance Controller',
        role: 'Finance Manager',
        timestamp: s.createdAt,
        comment: 'Proposed course fees & itemized laboratory line items for Super Admin authorization.',
      },
    ],
  }));

// In-memory global store that persists within the user's browser session (strictly DB only, zero mock data)
let globalFinanceRequests: ApprovalRequest[] = [...initialDbProposals];

// Listeners for reactive updates across components
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const financeProposalStore = {
  getRequests: (): ApprovalRequest[] => {
    return globalFinanceRequests;
  },

  getFinanceOnlyRequests: (): ApprovalRequest[] => {
    return globalFinanceRequests.filter((r) => r.module === 'Finance');
  },

  submitProposal: (proposal: {
    requestType: string;
    entityType: string;
    entityName: string;
    submittedBy: { name: string; email: string; role: string };
    impactAnalysis: string;
    diff?: ApprovalRequest['diff'];
    payload?: any;
  }): ApprovalRequest => {
    const newId = `REQ-FIN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReq: ApprovalRequest = {
      id: newId,
      requestType: proposal.requestType,
      module: 'Finance',
      entityType: proposal.entityType,
      entityId: proposal.payload?.courseId || `entity-${Date.now()}`,
      entityName: proposal.entityName,
      submittedBy: proposal.submittedBy,
      submittedDate: new Date().toISOString(),
      status: 'SUBMITTED',
      impactAnalysis: proposal.impactAnalysis,
      diff: proposal.diff || [],
      payload: proposal.payload,
      history: [
        {
          step: 'Submitted by Finance Manager',
          userName: proposal.submittedBy.name,
          role: proposal.submittedBy.role,
          timestamp: new Date().toISOString(),
          comment: 'Prepared by campus finance controller and submitted for Super Admin executive authorization.',
        },
      ],
    };

    globalFinanceRequests = [newReq, ...globalFinanceRequests];
    listeners.forEach((l) => l());
    return newReq;
  },

  updateStatus: (reqId: string, status: RequestStatus, comment?: string, reviewerName = 'Super Administrator') => {
    globalFinanceRequests = globalFinanceRequests.map((r) => {
      if (r.id === reqId) {
        return {
          ...r,
          status,
          reviewComments: comment,
          reviewedBy: reviewerName,
          reviewedDate: new Date().toISOString(),
          history: [
            ...r.history,
            {
              step: status === 'APPROVED' ? 'Authorized by Super Admin' : status === 'REJECTED' ? 'Rejected by Super Admin' : 'Changes Requested by Super Admin',
              userName: reviewerName,
              role: 'Super Administrator',
              timestamp: new Date().toISOString(),
              comment: comment || `Status updated to ${status}`,
            },
          ],
        };
      }
      return r;
    });
    listeners.forEach((l) => l());
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

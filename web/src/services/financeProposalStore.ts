// ============================================================================
// ISML COLLEGE LMS — FINANCE PROPOSALS STORE & DISPATCHER
// Shared State Hub: Finance Manager prepares proposals -> Super Admin Authorizes
// ============================================================================

import { ApprovalRequest, RequestStatus } from '@/types/rbac';
import { mockApprovalRequests } from '@/mock/superAdminData';

// In-memory global store that persists within the user's browser session
let globalFinanceRequests: ApprovalRequest[] = [...mockApprovalRequests];

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
  }): ApprovalRequest => {
    const newId = `REQ-FIN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReq: ApprovalRequest = {
      id: newId,
      requestType: proposal.requestType,
      module: 'Finance',
      entityType: proposal.entityType,
      entityId: `entity-${Date.now()}`,
      entityName: proposal.entityName,
      submittedBy: proposal.submittedBy,
      submittedDate: new Date().toISOString(),
      status: 'SUBMITTED',
      impactAnalysis: proposal.impactAnalysis,
      diff: proposal.diff || [],
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

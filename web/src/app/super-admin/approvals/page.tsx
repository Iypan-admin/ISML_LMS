// ============================================================================
// ISML COLLEGE LMS — APPROVAL CENTER (/super-admin/approvals)
// Centralized Executive Authorization Hub for Academic, Finance, & Operations
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Eye,
  AlertTriangle,
  ArrowUpDown,
  Building,
  Calendar,
  Layers,
  User,
  ShieldCheck,
  TrendingUp,
  Trash2,
  GraduationCap,
  BookOpen,
  DollarSign,
  Radio,
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { mockApprovalRequests } from '@/mock/superAdminData';
import { ApprovalRequest, RequestStatus } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { useRBAC } from '@/context/AuthRbacContext';
import ApprovalDetailDrawer from '@/components/super-admin/approvals/ApprovalDetailDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import {
  ApprovalConfirmDialog,
  RejectRequestDialog,
  RequestChangesDialog,
} from '@/components/common/ApprovalDialogs';
import { financeProposalStore } from '@/services/financeProposalStore';
import { assessmentStore } from '@/services/assessmentStore';
import { academicApprovalStore } from '@/services/academicApprovalStore';
import { useCollege } from '@/context/CollegeContext';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { fastFetch } from '@/lib/fastCache';

export default function ApprovalCenterPage() {
  const { hasPermission } = useRBAC();
  const { showSuccess, showError, showInfo } = useToast();
  const {
    selectedCollegeId,
    isOverall,
    isSchoolMode,
    selectedCollege,
    institutionCategory,
    labels,
  } = useCollege();

  // State linked strictly to real Database approvals (Zero mock data)
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  // Fetch approvals directly from backend API with local route fallback
  const fetchBackendApprovals = React.useCallback(async () => {
    try {
      let res;
      try {
        res = await fetch('/api/portals/approvals', { cache: 'no-store' });
        if (!res.ok) throw new Error('Local route error');
      } catch {
        res = await fetch('https://ismllms-production.up.railway.app/api/portals/approvals', { cache: 'no-store' });
      }
      const json = await res.json();
      const serverData = (json && json.data) ? json.data : [];
      const mapped: ApprovalRequest[] = serverData.map((item: any) => {
        const rawStatus = item.currentStatus || 'PENDING';
        let mappedStatus: RequestStatus = 'SUBMITTED';
        if (rawStatus === 'APPROVED') mappedStatus = 'APPROVED';
        else if (rawStatus === 'REJECTED') mappedStatus = 'REJECTED';
        else if (rawStatus === 'CHANGES_REQUIRED' || rawStatus === 'CHANGES_REQUESTED') mappedStatus = 'CHANGES_REQUIRED';
        else if (rawStatus === 'UNDER_REVIEW') mappedStatus = 'UNDER_REVIEW';
        else mappedStatus = 'SUBMITTED';

        let mappedModule: string = item.module || 'Academic';
        let sourcePortal = 'Academic Portal';
        if (item.requestType === 'STUDENT_ADMISSION' || item.entityType === 'STUDENT') {
          sourcePortal = item.submittedPayload?.source === 'COLLEGE_PARTNER' ? 'College Registration' : 'Student Public Hub';
          mappedModule = 'Admissions';
        } else if (item.requestType === 'INSTITUTION_CREATION' || item.entityType === 'INSTITUTION') {
          sourcePortal = item.submittedPayload?.type === 'SCHOOL' ? 'School MoU Desk' : 'College Onboarding';
          mappedModule = 'Institutions';
        } else if (item.module === 'Finance' || item.requestType === 'FEE_PROPOSAL' || item.requestType === 'PAYMENT_TRANCHE_SETUP') {
          sourcePortal = 'Finance Manager';
          mappedModule = 'Finance';
        } else if (item.entityType === 'LIVE_CLASS' || item.requestType === 'TIMETABLE_CHANGE' || item.requestType === 'TIMETABLE_SLOT' || item.entityType === 'TIMETABLE') {
          sourcePortal = 'Academic Scheduling';
          mappedModule = 'Scheduling';
        }

        return {
          id: item.id,
          requestType: item.requestType || 'COURSE_CREATION',
          module: mappedModule as any,
          sourcePortal,
          entityName: item.title,
          entityType: item.entityType || 'COURSE',
          entityId: item.entityId || item.id,
          submittedBy: {
            name: item.requestedByUserId || item.submittedPayload?.submittedBy?.name || 'Academic Manager',
            email: item.submittedPayload?.submittedBy?.email || `${item.requestedByUserId || 'academics'}@isml.edu`,
            role: item.submittedPayload?.submittedBy?.role || 'Academic Coordinator',
          },
          submittedDate: item.createdAt || new Date().toISOString(),
          status: mappedStatus,
          priority: item.priority || 'NORMAL',
          description: item.description || '',
          history: (item.history || []).map((h: any) => ({
            step: h.actionTaken,
            userName: h.actorUserId,
            role: 'Administrator',
            timestamp: h.recordedAt,
            comment: h.comments,
          })),
          payload: item.submittedPayload,
          diff: item.submittedPayload?.diff || item.diff || [],
          impactAnalysis: item.submittedPayload?.impactAnalysis || item.impactAnalysis || item.description || '',
          institutionId: item.institutionId || item.submittedPayload?.institutionId,
        };
      });

      setRequests(mapped);
    } catch (e: any) {
      console.error('Failed to fetch approvals directly:', e?.message);
    }
  }, []);

  // Polling fallback to guarantee instant data sync
  React.useEffect(() => {
    fetchBackendApprovals();
    const interval = setInterval(fetchBackendApprovals, 3000);
    return () => clearInterval(interval);
  }, [fetchBackendApprovals]);

  React.useEffect(() => {
    // Listen to instant real-time events from backend SSE Webhook stream
    const handleRealtimeEvent = (e: any) => {
      const eventType = e?.detail?.type;
      if (
        eventType === 'APPROVAL_SUBMITTED' ||
        eventType === 'APPROVAL_REVIEWED' ||
        eventType === 'COURSES_UPDATED' ||
        eventType === 'BATCHES_UPDATED' ||
        eventType === 'LIVE_CLASSES_UPDATED'
      ) {
        console.log('⚡ [Super Admin Approvals] Realtime Event Detected:', eventType);
        fetchBackendApprovals();
      }
    };

    window.addEventListener('isml-realtime-event', handleRealtimeEvent);

    const unsubStore = financeProposalStore.subscribe(() => {
      setRequests(financeProposalStore.getRequests());
    });

    return () => {
      window.removeEventListener('isml-realtime-event', handleRealtimeEvent);
      unsubStore();
    };
  }, [fetchBackendApprovals]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPortal, setSelectedPortal] = useState('ALL');

  // Drawer & Dialog State
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);
  const [targetActionRequest, setTargetActionRequest] = useState<ApprovalRequest | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<ApprovalRequest | null>(null);

  const handleDeleteApproval = async () => {
    if (!deleteRequest) return;
    const reqId = deleteRequest.id;

    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    try {
      await fetch(`https://ismllms-production.up.railway.app/api/portals/approvals/${reqId}/delete`, {
        method: 'POST',
      });
    } catch {}

    showSuccess(`Approval request ${reqId} deleted successfully.`);
    setDeleteRequest(null);
  };

  // Check Permissions
  const canView = hasPermission('REQUEST_VIEW');
  const canApprove = hasPermission('REQUEST_APPROVE');
  const canReject = hasPermission('REQUEST_REJECT');
  const canRequestChanges = hasPermission('REQUEST_REQUEST_CHANGES');

  // Category & Institution Scoped Requests
  const scopedRequests = useMemo(() => {
    return requests.filter((req: any) => {
      // If no specific college is selected, or if OVERALL scope is selected, show everything!
      if (isOverall || !selectedCollege || selectedCollegeId === 'ALL' || selectedCollegeId === 'OVERALL') {
        return true;
      }

      // Check if request is tied to this institution
      const reqInstId = req.institutionId || req.payload?.institutionId;
      if (reqInstId && (reqInstId === selectedCollege.id || reqInstId === selectedCollege.code)) {
        return true;
      }

      const queryCode = (selectedCollege.code || '').toLowerCase();
      const queryName = (selectedCollege.name || '').toLowerCase();
      const shortName = queryName.split(' ')[0].toLowerCase();
      const entityText = (req.entityName || '').toLowerCase();
      const descText = (req.description || '').toLowerCase();

      if (queryCode && (entityText.includes(queryCode) || descText.includes(queryCode))) return true;
      if (shortName.length > 2 && (entityText.includes(shortName) || descText.includes(shortName))) return true;

      // By default in approval hub, global master requests (courses, academic structure, student admissions, timetable) should remain visible to Super Admin
      if (req.entityType === 'COURSE' || req.entityType === 'TIMETABLE' || req.requestType === 'TIMETABLE_SLOT' || req.module === 'Academic' || req.module === 'Scheduling' || req.requestType === 'STUDENT_ADMISSION' || req.entityType === 'STUDENT' || (req.module as string) === 'Admissions' || !reqInstId) {
        return true;
      }

      return false;
    });
  }, [requests, isOverall, selectedCollege, selectedCollegeId]);

  // KPI Calculations based on scoped requests
  const stats = useMemo(() => {
    const pending = scopedRequests.filter((r) => r.status === 'SUBMITTED').length;
    const underReview = scopedRequests.filter((r) => r.status === 'UNDER_REVIEW').length;
    const approved = scopedRequests.filter((r) => r.status === 'APPROVED').length;
    const changesOrRejected = scopedRequests.filter(
      (r) => r.status === 'CHANGES_REQUIRED' || r.status === 'REJECTED'
    ).length;
    return { pending, underReview, approved, changesOrRejected };
  }, [scopedRequests]);

  // Filtered Requests (search, module, status)
  const filteredRequests = useMemo(() => {
    return scopedRequests.filter((req) => {
      // Search
      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestType.toLowerCase().includes(searchQuery.toLowerCase());

      // Module
      const matchesModule =
        selectedModule === 'ALL' || req.module.toLowerCase() === selectedModule.toLowerCase();

      // Status
      const matchesStatus =
        selectedStatus === 'ALL' || req.status === selectedStatus;

      // Origin / Source Portal
      const matchesPortal =
        selectedPortal === 'ALL' ||
        (selectedPortal === 'ACADEMIC' && (req.requestType === 'COURSE_CREATION' || req.requestType === 'TIMETABLE_SLOT' || req.entityType === 'TIMETABLE' || req.requestType === 'TUTOR_ONBOARDING' || req.entityType === 'COURSE' || req.entityType === 'TUTOR' || req.entityType === 'FACULTY' || (req.module === 'Academic' && req.entityType !== 'BATCH') || req.module === 'Scheduling')) ||
        (selectedPortal === 'BATCHES' && (req.requestType === 'BATCH_CREATION' || req.entityType === 'BATCH')) ||
        (selectedPortal === 'ADMISSIONS' && (req.requestType === 'STUDENT_ADMISSION' || req.entityType === 'STUDENT' || (req.module as string) === 'Admissions')) ||
        (selectedPortal === 'FINANCE' && (req.module === 'Finance' || req.entityType === 'LIVE_CLASS')) ||
        (selectedPortal === 'STUDENT' && (req.requestType === 'STUDENT_ADMISSION' || req.entityType === 'STUDENT')) ||
        (selectedPortal === 'COLLEGE' && (req.requestType === 'INSTITUTION_CREATION' || req.entityType === 'COLLEGE' || req.entityType === 'INSTITUTION'));

      return matchesSearch && matchesModule && matchesStatus && matchesPortal;
    });
  }, [scopedRequests, searchQuery, selectedModule, selectedStatus, selectedPortal]);

  // Handle Review Click (opens drawer)
  const handleOpenDetail = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  // Triggers for Dialogs
  const handleTriggerApprove = (request: ApprovalRequest) => {
    setTargetActionRequest(request);
    setApproveDialogOpen(true);
  };

  const handleTriggerReject = (request: ApprovalRequest) => {
    setTargetActionRequest(request);
    setRejectDialogOpen(true);
  };

  const handleTriggerChanges = (request: ApprovalRequest) => {
    setTargetActionRequest(request);
    setChangesDialogOpen(true);
  };

  // Execution: Confirm Approve
  const handleConfirmApprove = (comment?: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return {
            ...r,
            status: 'APPROVED' as RequestStatus,
            history: [
              ...r.history,
              {
                step: 'Approved by Super Admin',
                userName: 'Super Administrator',
                role: 'Super Administrator',
                timestamp: new Date().toISOString(),
                comment: comment || 'Executive authorization granted.',
              },
            ],
          };
        }
        return r;
      })
    );

    // If this request is an Online Assessment Approval, update assessmentStore directly
    if (targetActionRequest.requestType === 'ONLINE_ASSESSMENT_APPROVAL' || targetActionRequest.entityType === 'Online Assessment / CBT Exam') {
      const allAsms = assessmentStore.getAssessments();
      const matchAsm = allAsms.find((a) => targetActionRequest.entityName.includes(a.title));
      if (matchAsm) {
        assessmentStore.approveAssessment(matchAsm.id, 'Approved by Super Admin in Executive Approval Center.');
      }
    }

    // If this request is an Assignment Creation, approve in assignmentStore so students immediately see it
    if (targetActionRequest.requestType === 'ASSIGNMENT_CREATION' || targetActionRequest.entityType === 'ASSIGNMENT') {
      try {
        const asgId = targetActionRequest.entityId;
        const allAsgs = assignmentStore.getAll();
        const existing = allAsgs.find(a => a.id === asgId || targetActionRequest.entityName?.includes(a.title));
        if (existing) {
          existing.status = 'ACTIVE';
          assignmentStore.update(existing.id, { status: 'ACTIVE' });
        } else if (targetActionRequest.payload?.assignmentPayload) {
          assignmentStore.create({
            ...targetActionRequest.payload.assignmentPayload,
            status: 'ACTIVE'
          });
        }
      } catch (e) {
        console.warn('Assignment approval sync:', e);
      }
    }

    // If this request is a Timetable Slot Proposal, approve in academicApprovalStore and push to timetable
    if (targetActionRequest.requestType === 'TIMETABLE_SLOT' || targetActionRequest.entityType === 'TIMETABLE') {
      academicApprovalStore.approve(reqId, comment || 'Approved by Super Admin in Executive Approval Center.', 'Super Administrator');
      const slots = targetActionRequest.payload?.slotsInstances;
      if (Array.isArray(slots) && slots.length > 0) {
        slots.forEach((s) => {
          fetch('/api/portals/timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(s),
          }).catch(() => null);
        });
      } else {
        const ttPayload = targetActionRequest.payload?.timetablePayload || targetActionRequest.payload?.slotInstance;
        if (ttPayload) {
          fetch('/api/portals/timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ttPayload),
          }).catch(() => null);
        }
      }
    }

    // Update opened drawer if matches
    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
    }

    setApproveDialogOpen(false);
    setTargetActionRequest(null);

    // Sync action with backend database & activate batch
    fetch(`/api/portals/approvals/${reqId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'APPROVED', remarks: comment || 'Executive authorization granted.' }),
    })
      .then((res) => res.json())
      .then(() => {
        // Broadcast realtime event across all open tabs/portals
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('isml-realtime-event', {
              detail: {
                type: 'APPROVAL_REVIEWED',
                action: 'APPROVED',
                requestId: reqId,
              },
            })
          );
        }
      })
      .catch(() => {
        fetch(`https://ismllms-production.up.railway.app/api/portals/approvals/${reqId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'APPROVED', remarks: comment || 'Executive authorization granted.' }),
        }).catch(() => null);
      });

    showSuccess(`Request ${reqId} (${targetActionRequest.entityName}) approved and activated successfully.`);
  };

  // Execution: Confirm Reject
  const handleConfirmReject = (reason: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return {
            ...r,
            status: 'REJECTED' as RequestStatus,
            reviewComments: reason,
            history: [
              ...r.history,
              {
                step: 'Rejected by Super Admin',
                userName: 'Super Administrator',
                role: 'Super Administrator',
                timestamp: new Date().toISOString(),
                comment: reason,
              },
            ],
          };
        }
        return r;
      })
    );

    // Sync rejection with backend database
    fetch(`/api/portals/approvals/${reqId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REJECTED', remarks: reason }),
    }).catch(() => {
      fetch(`https://ismllms-production.up.railway.app/api/portals/approvals/${reqId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECTED', remarks: reason }),
      }).catch(() => null);
    });

    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'REJECTED', reviewComments: reason } : null));
    }

    setRejectDialogOpen(false);
    setTargetActionRequest(null);
    showError(`Request ${reqId} rejected. Reason logged in audit records.`);
  };

  // Execution: Confirm Request Changes
  const handleConfirmRequestChanges = (instructions: string) => {
    if (!targetActionRequest) return;
    const reqId = targetActionRequest.id;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return {
            ...r,
            status: 'CHANGES_REQUIRED' as RequestStatus,
            reviewComments: instructions,
            history: [
              ...r.history,
              {
                step: 'Changes Requested',
                userName: 'Super Administrator',
                role: 'Super Administrator',
                timestamp: new Date().toISOString(),
                comment: instructions,
              },
            ],
          };
        }
        return r;
      })
    );

    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'CHANGES_REQUIRED', reviewComments: instructions } : null));
    }

    setChangesDialogOpen(false);
    setTargetActionRequest(null);
    showInfo(`Changes requested for ${reqId}. Returned to operational submitter.`);
  };

  if (!canView) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          You lack the <code>REQUEST_VIEW</code> permission required to access the Approval Center.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#0052CC]/10 text-[#0052CC] rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isSchoolMode ? 'School' : 'College'} Approval Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and authorize requests submitted by operational teams ({isSchoolMode ? 'School Academics, Fees, Timetables' : 'Higher Education Academic, Finance, Scheduling'}).
          </p>
        </div>
      </div>

      {/* ─── School / College Campus Filter Bar ─── */}
      <CollegeFilterBar label={isSchoolMode ? 'School Approval Scope:' : 'College Approval Scope:'} />

      {/* ─── Top Summary KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pending Approval</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-2">{stats.pending}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Action required by Super Admin</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Under Review</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-[#0052CC]">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-2">{stats.underReview}</div>
          <p className="text-[11px] text-blue-700 mt-0.5">Being vetted by leadership</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Authorized & Active</span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-2">{stats.approved}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Executive approvals granted</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Changes / Rejected</span>
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.changesOrRejected}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Returned or non-compliant</p>
        </div>
      </div>

      {/* ─── Modern Portal Category Cards with Badges ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Operational Portals & Workflows</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Click any portal card to inspect pending courses, batches, admissions, and financial submissions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'ACADEMIC',
              title: 'Academic Management',
              desc: 'Courses & Curriculums',
              icon: BookOpen,
              color: 'text-blue-600',
              bg: 'bg-blue-50/70',
              border: 'border-blue-200',
              filterKey: 'Academic',
              items: scopedRequests.filter((r) => r.requestType === 'COURSE_CREATION' || r.requestType === 'TIMETABLE_SLOT' || r.entityType === 'TIMETABLE' || r.requestType === 'TUTOR_ONBOARDING' || r.entityType === 'COURSE' || r.entityType === 'TUTOR' || r.entityType === 'FACULTY' || (r.module === 'Academic' && r.entityType !== 'BATCH') || r.module === 'Scheduling'),
              pendingCount: scopedRequests.filter((r) => (r.requestType === 'COURSE_CREATION' || r.requestType === 'TIMETABLE_SLOT' || r.entityType === 'TIMETABLE' || r.requestType === 'TUTOR_ONBOARDING' || r.entityType === 'COURSE' || r.entityType === 'TUTOR' || r.entityType === 'FACULTY') && r.status === 'SUBMITTED').length,
            },
            {
              id: 'BATCHES',
              title: 'Batch & Operations',
              desc: 'Cohorts & Student Rosters',
              icon: Layers,
              color: 'text-purple-600',
              bg: 'bg-purple-50/70',
              border: 'border-purple-200',
              filterKey: 'Batches',
              items: scopedRequests.filter((r) => r.requestType === 'BATCH_CREATION' || r.entityType === 'BATCH'),
              pendingCount: scopedRequests.filter((r) => (r.requestType === 'BATCH_CREATION' || r.entityType === 'BATCH') && r.status === 'SUBMITTED').length,
            },
            {
              id: 'ADMISSIONS',
              title: 'Admissions & Sales',
              desc: 'Student & Batch Walk-ins',
              icon: GraduationCap,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50/70',
              border: 'border-emerald-200',
              filterKey: 'Admissions',
              items: scopedRequests.filter((r) => r.requestType === 'STUDENT_ADMISSION' || r.entityType === 'STUDENT' || (r.module as string) === 'Admissions'),
              pendingCount: scopedRequests.filter((r) => (r.requestType === 'STUDENT_ADMISSION' || r.entityType === 'STUDENT' || (r.module as string) === 'Admissions') && r.status === 'SUBMITTED').length,
            },
            {
              id: 'FINANCE',
              title: 'Finance & Schedules',
              desc: 'Fee Plans & Timetables',
              icon: DollarSign,
              color: 'text-amber-600',
              bg: 'bg-amber-50/70',
              border: 'border-amber-200',
              filterKey: 'Finance',
              items: scopedRequests.filter((r) => r.module === 'Finance' || r.entityType === 'LIVE_CLASS' || r.module === 'Scheduling'),
              pendingCount: scopedRequests.filter((r) => (r.module === 'Finance' || r.entityType === 'LIVE_CLASS' || r.module === 'Scheduling') && r.status === 'SUBMITTED').length,
            },
          ].map((portal) => {
            const isSelected = selectedPortal === portal.id;
            const Icon = portal.icon;
            const totalCount = portal.items.length;

            return (
              <div
                key={portal.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedPortal('ALL');
                    setSelectedModule('ALL');
                  } else {
                    setSelectedPortal(portal.id);
                    setSelectedModule('ALL');
                  }
                }}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Pending Notification Badge at Top-Right */}
                {portal.pendingCount > 0 ? (
                  <div className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[11px] shadow-sm flex items-center gap-1 animate-pulse border-2 border-white">
                    <span>{portal.pendingCount}</span>
                    <span className="text-[9px] uppercase font-bold tracking-tight">Pending</span>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {totalCount} Total
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${portal.bg} ${portal.color} border ${portal.border} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 pr-6">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{portal.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{portal.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {portal.items.filter((i) => i.status === 'APPROVED').length} Active
                      </span>
                      {portal.pendingCount > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {portal.pendingCount} Action Req.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Request ID, entity name, or submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          {/* Module, Portal & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedPortal}
                onChange={(e) => setSelectedPortal(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#0052CC] font-bold"
              >
                <option value="ALL">🌐 All Origin Portals</option>
                <option value="STUDENT">🎓 Student Public Form</option>
                <option value="COLLEGE">🏛️ College / School MoU</option>
                <option value="ACADEMIC">📚 Academic Manager</option>
                <option value="FINANCE">💰 Finance Manager</option>
              </select>
            </div>

            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#0052CC] font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Admissions">Student Admissions</option>
              <option value="Institutions">Institutions & MoUs</option>
              <option value="Academic">Academic Structure</option>
              <option value="Finance">Finance Proposals</option>
              <option value="Learning">Learning & Live</option>
              <option value="Scheduling">Scheduling</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-[#0052CC] font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Pending Approval</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CHANGES_REQUIRED">Changes Required</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Modern Card-Based Approval Hub (Responsive & Clean UI) ─── */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-7 h-7 text-slate-400" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No approval requests found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No pending or historical submissions match your selected portal filter or search keywords.
          </p>
          {(selectedPortal !== 'ALL' || selectedModule !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedPortal('ALL');
                setSelectedModule('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-3.5 py-1.5 text-xs font-bold text-[#0052CC] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <span>Showing</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold text-[11px]">
                {filteredRequests.length}
              </span>
              <span>Submissions across Modules</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Click any card to review full specs, diffs, and audit trail
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRequests.map((req) => {
              const isActionable = req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW';

              const isStudentForm = req.requestType === 'STUDENT_ADMISSION' || req.entityType === 'STUDENT';
              const isInstitutionMoU = req.requestType === 'INSTITUTION_CREATION' || req.entityType === 'INSTITUTION';
              const isFinance = req.module === 'Finance';
              const isBatch = req.requestType === 'BATCH_CREATION' || req.entityType === 'BATCH';
              const isCourse = req.requestType === 'COURSE_CREATION' || req.entityType === 'COURSE';
              const isTimetable = req.requestType === 'TIMETABLE_SLOT' || req.entityType === 'TIMETABLE';

              const portalMeta = isStudentForm
                ? { label: 'Admissions & Students', icon: GraduationCap, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
                : isTimetable
                ? { label: 'Academic Scheduling', icon: Calendar, color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' }
                : isBatch
                ? { label: 'Batch Operations', icon: Layers, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' }
                : isCourse
                ? { label: 'Academic Course', icon: BookOpen, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' }
                : isFinance
                ? { label: 'Finance & Accounts', icon: DollarSign, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
                : isInstitutionMoU
                ? { label: 'Institution & MoU', icon: Building, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' }
                : { label: req.sourcePortal || req.module, icon: Layers, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };

              const PortalIcon = portalMeta.icon;

              const cleanEntityTitle =
                req.entityName ||
                req.payload?.courseName ||
                req.payload?.liveClassTitle ||
                req.payload?.batchName ||
                req.title;

              const cleanEntitySubtitle =
                (isTimetable ? (req.payload?.timetablePayload?.day || req.payload?.day || 'SLOT') : null) ||
                req.payload?.courseCode ||
                (isBatch ? 'BATCH' : null) ||
                (req.requestType === 'TIMETABLE_CHANGE' || req.entityType === 'LIVE_CLASS' ? 'LIVE CLASS' : null) ||
                (req.entityName?.includes(':') ? req.entityName.split(':')[1]?.split('—')[0]?.trim() : req.entityType);

              return (
                <div
                  key={req.id}
                  onClick={() => handleOpenDetail(req)}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-[#0052CC]/50 shadow-2xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
                >
                  {/* Card Header: Origin Badge + Status Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${portalMeta.bg} ${portalMeta.color} ${portalMeta.border}`}>
                        <PortalIcon className="w-3.5 h-3.5" />
                        <span>{portalMeta.label}</span>
                      </span>
                      <StatusBadge status={req.status} />
                    </div>

                    {/* Entity Title & Code */}
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0052CC] transition-colors line-clamp-2" title={cleanEntityTitle}>
                        {cleanEntityTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        {cleanEntitySubtitle && (
                          <span className="font-bold text-[#0052CC] bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded text-[10px]">
                            {cleanEntitySubtitle}
                          </span>
                        )}
                        <span className="truncate font-medium text-slate-600">
                          {req.payload?.institutionName || req.institutionId || 'Campus Scope'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Submitter Section */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Submitted By</div>
                        <div className="font-semibold text-slate-800 truncate flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{req.submittedBy.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{req.submittedBy.role}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Submission Date</div>
                        <div className="font-semibold text-slate-700 mt-0.5">
                          {new Date(req.submittedDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(req.submittedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <span>ID: {req.id}</span>
                      <span>Ref: {req.entityId}</span>
                    </div>
                  </div>

                  {/* Card Footer: Quick Actions */}
                  <div
                    className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Primary Inspect/Review Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(req)}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-[#0052CC] text-slate-700 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isActionable ? 'Review & Compare' : 'View Details'}</span>
                    </button>

                    {/* Actionable Buttons */}
                    {isActionable && (
                      <div className="flex items-center gap-1">
                        {canApprove && (
                          <button
                            type="button"
                            onClick={() => handleTriggerApprove(req)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-xl transition-all cursor-pointer shadow-2xs"
                            title="Approve / Authorize"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {canRequestChanges && (
                          <button
                            type="button"
                            onClick={() => handleTriggerChanges(req)}
                            className="p-2 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-600 rounded-xl transition-all cursor-pointer shadow-2xs"
                            title="Request Changes"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {canReject && (
                          <button
                            type="button"
                            onClick={() => handleTriggerReject(req)}
                            className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-xl transition-all cursor-pointer shadow-2xs"
                            title="Reject Request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Delete Icon */}
                    <button
                      type="button"
                      onClick={() => setDeleteRequest(req)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-200"
                      title="Delete Request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Detail Drawer (Diff View & History) ─── */}
      <ApprovalDetailDrawer
        isOpen={isDrawerOpen}
        request={selectedRequest}
        onClose={() => setIsDrawerOpen(false)}
        onApproveClick={(req) => handleTriggerApprove(req)}
        onRejectClick={(req) => handleTriggerReject(req)}
        onRequestChangesClick={(req) => handleTriggerChanges(req)}
      />

      {/* ─── Responsive Modals (Zero Native Dialogs) ─── */}
      <ApprovalConfirmDialog
        isOpen={approveDialogOpen}
        request={targetActionRequest}
        onClose={() => {
          setApproveDialogOpen(false);
          setTargetActionRequest(null);
        }}
        onConfirm={handleConfirmApprove}
      />

      <RejectRequestDialog
        isOpen={rejectDialogOpen}
        request={targetActionRequest}
        onClose={() => {
          setRejectDialogOpen(false);
          setTargetActionRequest(null);
        }}
        onConfirm={handleConfirmReject}
      />

      <RequestChangesDialog
        isOpen={changesDialogOpen}
        request={targetActionRequest}
        onClose={() => {
          setChangesDialogOpen(false);
          setTargetActionRequest(null);
        }}
        onConfirm={handleConfirmRequestChanges}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteRequest}
        onClose={() => setDeleteRequest(null)}
        onConfirm={handleDeleteApproval}
        title="Delete Approval Request (Super Admin Only)"
        entityType="Approval Request"
        entityName={deleteRequest ? `${deleteRequest.id} — ${deleteRequest.entityName}` : ''}
        description="Are you sure you want to delete this approval request? It will be permanently removed from the executive approval center and database records."
      />
    </div>
  );
}

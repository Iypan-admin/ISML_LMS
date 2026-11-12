// ============================================================================
// ISML COLLEGE LMS — ACADEMIC APPROVALS STORE
// Centralized store for tutor requests, exam proposals, grade evaluations,
// attendance locks & substitute swaps requiring Academic Manager sign-off.
// ============================================================================

export type AcademicApprovalCategory =
  | 'ALL'
  | 'TIMETABLE_SLOT'
  | 'TUTOR_REQUEST'
  | 'EXAM_ASSESSMENT'
  | 'EVALUATION_RESULT'
  | 'ATTENDANCE_LOCK'
  | 'SUBSTITUTE_SWAP';

export type AcademicApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED';

export interface AcademicApprovalItem {
  id: string;
  category: 'TIMETABLE_SLOT' | 'TUTOR_REQUEST' | 'EXAM_ASSESSMENT' | 'EVALUATION_RESULT' | 'ATTENDANCE_LOCK' | 'SUBSTITUTE_SWAP';
  title: string;
  description: string;
  courseId?: string;
  courseCode: string;
  courseName: string;
  batchId?: string;
  batchName: string;
  submittedBy: {
    name: string;
    role: string;
    avatar?: string;
  };
  submittedAt: string;
  status: AcademicApprovalStatus;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  details: {
    targetId?: string;
    duration?: string;
    totalLearners?: number;
    scoreSummary?: string;
    evidenceOrRemarks?: string;
    proposedChanges?: { field: string; currentVal: string; proposedVal: string }[];
    timetablePayload?: any;
  };
  decisionRemarks?: string;
  decisionBy?: string;
  decidedAt?: string;
}

const INITIAL_ACADEMIC_APPROVALS: AcademicApprovalItem[] = [];

class AcademicApprovalStore {
  private items: AcademicApprovalItem[] = INITIAL_ACADEMIC_APPROVALS;
  private listeners: (() => void)[] = [];

  public getItems(): AcademicApprovalItem[] {
    return this.items;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public submit(item: Omit<AcademicApprovalItem, 'status' | 'submittedAt'>) {
    const newItem: AcademicApprovalItem = {
      ...item,
      status: 'PENDING',
      submittedAt: new Date().toLocaleString(),
    };
    this.items = [newItem, ...this.items];
    this.notify();
    return newItem;
  }

  public approve(id: string, remarks?: string, approverName: string = 'Academic Manager') {
    let approvedItem: AcademicApprovalItem | undefined;
    this.items = this.items.map((item) => {
      if (item.id === id) {
        approvedItem = {
          ...item,
          status: 'APPROVED',
          decisionRemarks: remarks || 'Approved by Academic Manager with full operational authorization.',
          decisionBy: approverName,
          decidedAt: new Date().toLocaleString(),
        };
        return approvedItem;
      }
      return item;
    });

    // If it's a timetable slot approval, push directly to live timetable API
    if (approvedItem && approvedItem.category === 'TIMETABLE_SLOT' && approvedItem.details?.timetablePayload) {
      fetch('/api/portals/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvedItem.details.timetablePayload),
      }).catch((e) => console.error('Failed to sync approved timetable slot:', e));
    }

    this.notify();
  }

  public reject(id: string, reason: string, approverName: string = 'Academic Manager') {
    this.items = this.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: 'REJECTED',
          decisionRemarks: reason,
          decisionBy: approverName,
          decidedAt: new Date().toLocaleString(),
        };
      }
      return item;
    });
    this.notify();
  }

  public requestChanges(id: string, instructions: string, approverName: string = 'Academic Manager') {
    this.items = this.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: 'CHANGES_REQUESTED',
          decisionRemarks: instructions,
          decisionBy: approverName,
          decidedAt: new Date().toLocaleString(),
        };
      }
      return item;
    });
    this.notify();
  }
}

export const academicApprovalStore = new AcademicApprovalStore();

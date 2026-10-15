// ============================================================================
// ISML COLLEGE LMS — ACADEMIC APPROVALS STORE
// Centralized store for tutor requests, exam proposals, grade evaluations,
// attendance locks & substitute swaps requiring Academic Manager sign-off.
// ============================================================================

export type AcademicApprovalCategory =
  | 'ALL'
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
  category: 'TUTOR_REQUEST' | 'EXAM_ASSESSMENT' | 'EVALUATION_RESULT' | 'ATTENDANCE_LOCK' | 'SUBSTITUTE_SWAP';
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
  };
  decisionRemarks?: string;
  decisionBy?: string;
  decidedAt?: string;
}

const INITIAL_ACADEMIC_APPROVALS: AcademicApprovalItem[] = [
  {
    id: 'ACAD-REQ-101',
    category: 'TUTOR_REQUEST',
    title: 'Substitute Tutor Allocation Request',
    description: 'Jay (Lead Trainer) requested Arun Kumar as substitute for FR-101 Section A morning live session due to university viva clash.',
    courseId: 'crs-fr-a1',
    courseCode: 'FR-101',
    courseName: 'French A1: Beginner Foundations & Phonetics',
    batchId: 'batch-2026-fr-a1-morning',
    batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
    submittedBy: {
      name: 'Jay (fac-jay)',
      role: 'Lead Trainer - French A1',
    },
    submittedAt: 'Today, 08:30 AM',
    status: 'PENDING',
    urgency: 'HIGH',
    details: {
      duration: 'Mon, 10:00 - 11:30 AM (90 mins)',
      totalLearners: 6,
      evidenceOrRemarks: 'Urgent substitute standby coverage needed for Session #14: Irregular Verbs.',
      proposedChanges: [
        { field: 'Lead Instructor', currentVal: 'Jay', proposedVal: 'Arun Kumar (Standby Substitute)' }
      ]
    }
  },
  {
    id: 'ACAD-REQ-102',
    category: 'EXAM_ASSESSMENT',
    title: 'Mid-Term DELF A1 CBT Examination Approval',
    description: 'Submission of 50-question LSRW examination blueprint with audio listening tracks for DELF A1 validation.',
    courseId: 'crs-fr-a1',
    courseCode: 'FR-101',
    courseName: 'French A1: Beginner Foundations & Phonetics',
    batchId: 'batch-2026-fr-a1-morning',
    batchName: 'French A1 Intensive Cohort 2026',
    submittedBy: {
      name: 'Prof. M. K. Sundaram',
      role: 'Senior Curriculum Specialist',
    },
    submittedAt: 'Yesterday, 04:15 PM',
    status: 'PENDING',
    urgency: 'CRITICAL',
    details: {
      duration: '120 Minutes (Total: 100 Marks)',
      totalLearners: 6,
      scoreSummary: 'Listening (25m), Reading (25m), Grammar (25m), Writing (25m)',
      evidenceOrRemarks: 'Includes 12 audio comprehension listening clips & model answers rubric.'
    }
  },
  {
    id: 'ACAD-REQ-103',
    category: 'EVALUATION_RESULT',
    title: 'French B1 Speaking Viva & Essay Evaluation Marks Sign-Off',
    description: 'Tutor completed marking and audio score rubric for French B1 Subjunctive Essay & Oral Viva.',
    courseId: 'crs-fr-b1',
    courseCode: 'FR-201',
    courseName: 'French B1: Independent Threshold & Subjunctive',
    batchId: 'batch-fr-b1',
    batchName: 'French B1 Executive Cohort (1-on-1 Q&A Desk)',
    submittedBy: {
      name: 'Claire Dupont',
      role: 'Doubt Clearance Specialist & Evaluator',
    },
    submittedAt: 'Oct 14, 2026',
    status: 'PENDING',
    urgency: 'NORMAL',
    details: {
      totalLearners: 2,
      scoreSummary: 'Batch Average: 88.5% (High Pass Rate • DELF Benchmark Cleared)',
      evidenceOrRemarks: 'Evaluator verified all speech recordings with zero discrepancies.'
    }
  },
  {
    id: 'ACAD-REQ-104',
    category: 'ATTENDANCE_LOCK',
    title: 'NAAC Roll Call Ledger Sign-Off & Biometric Reconciliation',
    description: 'Weekly batch attendance lock request for French A2 Section B with 83% attendance rate.',
    courseId: 'crs-fr-a2',
    courseCode: 'FR-102',
    courseName: 'French A2: Elementary Fluency & Narrative',
    batchId: 'batch-fr-a2',
    batchName: 'French A2 Cohort (Section B - Standby Coverage)',
    submittedBy: {
      name: 'Jay (fac-jay)',
      role: 'Substitute Standby',
    },
    submittedAt: 'Oct 13, 2026',
    status: 'APPROVED',
    urgency: 'NORMAL',
    details: {
      totalLearners: 3,
      scoreSummary: '83% Cumulative Attendance (NAAC Compliant > 75%)',
      evidenceOrRemarks: 'All leave requests documented with medical slips.',
    },
    decisionRemarks: 'Approved for official university ERP sync.',
    decisionBy: 'Academic Manager (Prof. Sundaram)',
    decidedAt: 'Oct 13, 2026, 06:00 PM'
  },
  {
    id: 'ACAD-REQ-105',
    category: 'TUTOR_REQUEST',
    title: 'Extra Doubt Clearance Session Booking Request',
    description: 'Tutor requested a 60-minute special LiveKit virtual room for weak students scoring below 60% in French A1 Phonetics.',
    courseId: 'crs-fr-a1',
    courseCode: 'FR-101',
    courseName: 'French A1: Beginner Foundations & Phonetics',
    batchId: 'batch-2026-fr-a1-morning',
    batchName: 'French A1 Intensive Cohort 2026',
    submittedBy: {
      name: 'Jay (fac-jay)',
      role: 'Lead Trainer',
    },
    submittedAt: 'Oct 12, 2026',
    status: 'APPROVED',
    urgency: 'HIGH',
    details: {
      duration: 'Friday, 06:00 PM - 07:00 PM',
      totalLearners: 2,
      evidenceOrRemarks: 'Remedial phonetics clinic for nasal vowel clarity.'
    },
    decisionRemarks: 'Room provisioned on LiveKit Server #03.',
    decisionBy: 'Academic Manager',
    decidedAt: 'Oct 12, 2026, 05:30 PM'
  },
  {
    id: 'ACAD-REQ-106',
    category: 'SUBSTITUTE_SWAP',
    title: 'Permanent Batch Schedule Shift Request',
    description: 'Faculty and learners mutually requested moving Weekend Bootcamp timing from 11:00 AM to 02:00 PM on Sundays.',
    courseId: 'crs-fr-a1',
    courseCode: 'FR-101',
    courseName: 'French A1: Beginner Foundations & Phonetics',
    batchId: 'batch-2026-fr-a1-weekend',
    batchName: 'French A1 Fast-Track Weekend Bootcamp',
    submittedBy: {
      name: 'Marie Curie',
      role: 'Weekend Co-Trainer',
    },
    submittedAt: 'Oct 11, 2026',
    status: 'PENDING',
    urgency: 'NORMAL',
    details: {
      totalLearners: 2,
      evidenceOrRemarks: 'Learners requested shift to accommodate offline collegiate laboratory practicals.',
      proposedChanges: [
        { field: 'Sunday Time Slot', currentVal: '11:00 AM - 01:00 PM', proposedVal: '02:00 PM - 04:00 PM' }
      ]
    }
  }
];

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

  public approve(id: string, remarks?: string, approverName: string = 'Academic Manager') {
    this.items = this.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: 'APPROVED',
          decisionRemarks: remarks || 'Approved by Academic Manager with full operational authorization.',
          decisionBy: approverName,
          decidedAt: new Date().toLocaleString(),
        };
      }
      return item;
    });
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

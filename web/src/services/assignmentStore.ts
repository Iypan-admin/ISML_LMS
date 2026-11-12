// ============================================================================
// ISML LMS — SHARED REAL-TIME ASSIGNMENT STORE
// Academic Manager creates assignment -> Assigned Tutors & Students instantly see it
// Zero mock data by default; fully persistent via localStorage + BroadcastChannel
// ============================================================================

export type AssignmentLsrwSkill = 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'INTEGRATED';

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'EVALUATED' | 'RESUBMITTED';
  submissionType: 'AUDIO' | 'PDF' | 'TEXT';
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  studentNotes?: string;
  scoreAwarded?: number;
  maxScore: number;
  tutorFeedback?: string;
  evaluatedAt?: string;
}

export interface SharedAssignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  subjectCode: string;
  subjectName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  lsrwSkill: AssignmentLsrwSkill;
  moduleCode?: string;
  moduleName?: string;
  dueDate: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  instructions: string;
  maxScore: number;
  assignedTutorName?: string;
  assignedTutorEmail?: string;
  attachedFile?: {
    name: string;
    size: string;
    downloadUrl: string;
  };
  submissions: AssignmentSubmission[];
  createdAt: string;
}

const STORAGE_KEY = 'isml_shared_assignments_v1';
const BROADCAST_KEY = 'isml_assignment_sync';

class AssignmentStore {
  private assignments: SharedAssignment[] = [];
  private listeners: Set<() => void> = new Set();
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.load();
      try {
        this.channel = new BroadcastChannel(BROADCAST_KEY);
        this.channel.onmessage = () => {
          this.load();
          this.notify();
        };
      } catch {}
    }
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.assignments = JSON.parse(raw);
      } else {
        // STRICT: Zero mock data by default
        this.assignments = [];
      }
    } catch {
      this.assignments = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assignments));
      this.channel?.postMessage({ type: 'SYNC' });
      this.notify();
    } catch (e) {
      console.error('Failed to save assignments:', e);
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getAll(): SharedAssignment[] {
    return [...this.assignments];
  }

  public getByBatch(batchId: string): SharedAssignment[] {
    return this.assignments.filter((a) => a.batchId === batchId);
  }

  public getByCourse(courseId: string): SharedAssignment[] {
    return this.assignments.filter((a) => a.courseId === courseId);
  }

  public getById(id: string): SharedAssignment | undefined {
    return this.assignments.find((a) => a.id === id);
  }

  public create(newAssignment: Omit<SharedAssignment, 'id' | 'createdAt' | 'submissions'>): SharedAssignment {
    const created: SharedAssignment = {
      ...newAssignment,
      id: `asg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      submissions: [],
    };
    this.assignments.unshift(created);
    this.save();
    return created;
  }

  public update(id: string, updates: Partial<SharedAssignment>): boolean {
    const asg = this.assignments.find((a) => a.id === id);
    if (!asg) return false;
    Object.assign(asg, updates);
    this.save();
    return true;
  }

  public delete(id: string): boolean {
    const before = this.assignments.length;
    this.assignments = this.assignments.filter((a) => a.id !== id);
    if (this.assignments.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public submitAssignment(assignmentId: string, submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): boolean {
    const asg = this.assignments.find((a) => a.id === assignmentId);
    if (!asg) return false;

    const newSub: AssignmentSubmission = {
      ...submission,
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      submittedAt: new Date().toISOString(),
    };

    asg.submissions = asg.submissions.filter((s) => s.studentId !== submission.studentId);
    asg.submissions.push(newSub);
    this.save();
    return true;
  }

  public gradeSubmission(assignmentId: string, submissionId: string, score: number, feedback: string): boolean {
    const asg = this.assignments.find((a) => a.id === assignmentId);
    if (!asg) return false;
    const sub = asg.submissions.find((s) => s.id === submissionId);
    if (!sub) return false;

    sub.scoreAwarded = score;
    sub.tutorFeedback = feedback;
    sub.status = 'EVALUATED';
    sub.evaluatedAt = new Date().toISOString();
    this.save();
    return true;
  }
}

export const assignmentStore = new AssignmentStore();


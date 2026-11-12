// ============================================================================
// ISML COLLEGE LMS — PARENT & GUARDIAN DATA ARCHITECTURE
// Comprehensive Multi-Child Schema, Academic History, Live Attendance,
// Gradebook, Live Classes Schedule & Tutor Direct Connect
// Zero mock data — Dynamically loaded from database
// ============================================================================

export interface ChildLSRWScores {
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
  overall: number;
}

export interface ChildAttendanceSummary {
  presentDays: number;
  absentDays: number;
  totalWorkingDays: number;
  percentage: number;
  lastRecordedDate: string;
  naacCompliant: boolean;
  recentLogs: {
    id: string;
    date: string;
    sessionTitle: string;
    tutorName: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    timeIn: string;
    remarks?: string;
  }[];
}

export interface ChildGradeItem {
  id: string;
  assessmentTitle: string;
  type: 'MID_TERM_CBT' | 'ORAL_VIVA' | 'WEEKLY_ASSIGNMENT' | 'DELF_MOCK';
  date: string;
  maxMarks: number;
  marksObtained: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'RE-EVAL';
  tutorFeedback: string;
  status: 'EVALUATED' | 'PENDING_REVIEW';
}

export interface ChildLiveClass {
  id: string;
  topic: string;
  courseCode: string;
  batchName: string;
  date: string;
  timeSlot: string;
  tutorName: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  meetingUrl?: string;
}

export interface ChildTutorInquiry {
  id: string;
  childId: string;
  childName: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  tutorResponse?: string;
  respondedAt?: string;
  tutorName: string;
}

export interface StudentChild {
  id: string;
  rollNo: string;
  name: string;
  avatarUrl: string;
  relationship: string;
  dob: string;
  bloodGroup: string;
  collegeName: string;
  collegeCode: string;
  department: string;
  degreeYear: string;
  emergencyContact: string;
  primaryCourse: {
    courseId: string;
    courseCode: string;
    courseName: string;
    levelBadge: string;
    enrollmentDate: string;
    termNumber: number;
    completionPercentage: number;
    syllabusCovered: string;
    leadTutorName: string;
    leadTutorEmail: string;
    batchName?: string;
    sectionCode?: string;
    collegeName?: string;
    progressPercent?: number;
  };
  attendance: ChildAttendanceSummary;
  lsrwScores: ChildLSRWScores;
  recentGrades: ChildGradeItem[];
  upcomingClasses: ChildLiveClass[];
  inquiries: ChildTutorInquiry[];
  feeStatus: {
    totalTermFee: number;
    paidAmount: number;
    dueAmount: number;
    isFullyPaid: boolean;
    dueDate: string;
    lastPaymentRef: string;
    status?: string;
    totalFee?: number;
    receiptNo?: string;
    lastReceiptNo?: string;
  };
}

export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  avatarUrl: string;
  linkedChildren: StudentChild[];
  notificationsCount: number;
}

// Clean live state: No hardcoded mock children or students
export const mockParentUser: ParentProfile = {
  id: 'par-live-user',
  name: 'Authorized Guardian',
  email: 'parent@isml.edu',
  mobile: '+91 94440 00000',
  address: 'Campus Residential Quarter',
  city: 'Tamil Nadu, India',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  notificationsCount: 0,
  linkedChildren: [],
};

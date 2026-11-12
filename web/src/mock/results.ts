// ============================================================================
// ISML COLLEGE LMS — RESULTS, ASSESSMENTS, ASSIGNMENTS & MARK LISTS
// Batch-wise & Student-wise mark records across Foreign Languages
// ============================================================================

export interface StudentMarkEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatarUrl?: string;
  batchId: string;
  batchName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  courseName: string;
  itemType: 'ASSESSMENT' | 'ASSIGNMENT';
  activityTitle: string;
  moduleName: string;
  lsrwSkill: 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'INTEGRATED';
  submissionDate: string;
  dayOfWeek: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'RA';
  status: 'EVALUATED' | 'PENDING_REVIEW' | 'ABSENT';
  evaluatedByTutor: string;
  tutorFeedback: string;
  sectionBreakdown?: { section: string; score: number; maxScore: number }[];
}

export interface ExamResultCard {
  id: string;
  examTitle: string;
  examType: string;
  completedDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  resultStatus: 'PASSED' | 'FAILED';
  sectionBreakdown: { section: string; score: number; maxScore: number }[];
  tutorNotes: string;
}

// STRICT: Complete removal of mock data
export const mockExamResults: ExamResultCard[] = [];
export const mockStudentMarksLedger: StudentMarkEntry[] = [];

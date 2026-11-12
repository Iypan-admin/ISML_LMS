export type AssignmentLsrwSkill = 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'INTEGRATED';

export interface HomeworkAssignment {
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
  moduleCode: string;
  moduleName: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'COMPLETED';
  instructions: string;
  attachedFile?: { name: string; size: string; downloadUrl: string };
  submittedDate?: string;
  submittedFile?: string;
  scoreReceived?: number;
  maxScore: number;
  tutorFeedback?: string;
}

// STRICT: Complete removal of mock data
export const mockAssignments: HomeworkAssignment[] = [];

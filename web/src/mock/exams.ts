export interface ExamModel {
  id: string;
  title: string;
  type: 'MID_TERM' | 'QUIZ' | 'FINAL_EXAM' | 'LSRW_ASSESSMENT';
  status: 'AVAILABLE' | 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  durationMins: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  scheduledWindow: string;
  scoreAchieved?: number;
  resultStatus?: 'PASSED' | 'FAILED';
  proctoringEnabled: boolean;
}

export const mockExams: ExamModel[] = [
  {
    id: "exam-201",
    title: "French A1 Mid-Term Comprehensive Assessment (Modules 1-3)",
    type: "MID_TERM",
    status: "AVAILABLE",
    durationMins: 45,
    totalQuestions: 30,
    totalMarks: 100,
    passingMarks: 60,
    scheduledWindow: "Available Sep 3, 08:00 AM - Sep 5, 11:59 PM",
    proctoringEnabled: false
  },
  {
    id: "exam-202",
    title: "French A1 Final Certification Examination",
    type: "FINAL_EXAM",
    status: "UPCOMING",
    durationMins: 90,
    totalQuestions: 60,
    totalMarks: 100,
    passingMarks: 70,
    scheduledWindow: "Scheduled for Oct 15, 2026, 10:00 AM - 11:30 AM",
    proctoringEnabled: true
  },
  {
    id: "exam-200",
    title: "Module 1 Foundations Quiz (Phonetics & Accents)",
    type: "QUIZ",
    status: "COMPLETED",
    durationMins: 20,
    totalQuestions: 15,
    totalMarks: 50,
    passingMarks: 30,
    scheduledWindow: "Completed Aug 28, 2026",
    scoreAchieved: 44,
    resultStatus: "PASSED",
    proctoringEnabled: false
  }
];

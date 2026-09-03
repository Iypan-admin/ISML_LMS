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

export const mockExamResults: ExamResultCard[] = [
  {
    id: "res-200",
    examTitle: "Module 1 Foundations Quiz (Phonetics & Accents)",
    examType: "Quiz Assessment",
    completedDate: "Aug 28, 2026",
    score: 44,
    maxScore: 50,
    percentage: 88,
    grade: "A",
    resultStatus: "PASSED",
    sectionBreakdown: [
      { section: "Listening Phonetics", score: 14, maxScore: 15 },
      { section: "Accent Identification", score: 15, maxScore: 15 },
      { section: "Vocabulary & Greetings", score: 15, maxScore: 20 }
    ],
    tutorNotes: "Great mastery of French accent rules and native phonetic differentiation."
  }
];

export type ExamLsrwFocus = 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING' | 'COMPREHENSIVE_LSRW';

export interface ExamModel {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  subjectCode: string;
  subjectName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  lsrwFocus: ExamLsrwFocus;
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
    id: "exam-fr-a1",
    title: "DELF A1 Official Benchmark Mock Exam (Compréhension & Production Orale)",
    courseId: "crs-01",
    courseName: "French A1: Beginner French & DELF A1 Foundations",
    batchId: "batch-2026-fr-a1",
    batchName: "French A1 Intensive Cohort 2026 (Live Webinar Batch)",
    subjectCode: "FR-101",
    subjectName: "French A1 Language, Phonetics & Salutations",
    languageFamily: "FRENCH",
    lsrwFocus: "COMPREHENSIVE_LSRW",
    type: "MID_TERM",
    status: "AVAILABLE",
    durationMins: 45,
    totalQuestions: 30,
    totalMarks: 100,
    passingMarks: 50,
    scheduledWindow: "Live Window: Sep 3, 08:00 AM - Sep 10, 11:59 PM",
    proctoringEnabled: false
  },
  {
    id: "exam-fr-a2-mock",
    title: "DELF A2 Full Simulation Mock Exam (Passé Composé & Imparfait Narrative)",
    courseId: "crs-01-a2",
    courseName: "French A2: Elementary Communication & DELF A2 Mocks",
    batchId: "batch-fr-a2",
    batchName: "French A2 Cohort (Section B - Standby Coverage)",
    subjectCode: "FR-102",
    subjectName: "French A2 Grammar, Passé Composé & DELF A2 Mock Exam",
    languageFamily: "FRENCH",
    lsrwFocus: "WRITING",
    type: "LSRW_ASSESSMENT",
    status: "AVAILABLE",
    durationMins: 60,
    totalQuestions: 35,
    totalMarks: 100,
    passingMarks: 50,
    scheduledWindow: "Review Window: Sep 12, 10:00 AM - Sep 18, 06:00 PM",
    proctoringEnabled: true
  },
  {
    id: "exam-fr-b1-eval",
    title: "DELF B1 Speaking & Argumentation Assessment (Subjunctive & Opinions)",
    courseId: "crs-01-b1",
    courseName: "French B1: Intermediate Fluency & Complex Structures",
    batchId: "batch-fr-b1",
    batchName: "French B1 Executive Cohort (1-on-1 Q&A Desk)",
    subjectCode: "FR-201",
    subjectName: "French B1 Subjunctive Mood, Connectors & Audio Inquiries",
    languageFamily: "FRENCH",
    lsrwFocus: "SPEAKING",
    type: "LSRW_ASSESSMENT",
    status: "ONGOING",
    durationMins: 45,
    totalQuestions: 20,
    totalMarks: 100,
    passingMarks: 60,
    scheduledWindow: "Ongoing 1-on-1 Viva: Sep 15 - Sep 22",
    proctoringEnabled: true
  },
  {
    id: "exam-fr-b2-viva",
    title: "DELF B2 Formal Synthesis & Argumentative Essay Evaluation",
    courseId: "crs-01-b2",
    courseName: "French B2: Advanced Oral Discourse & DELF B2 Synthesis",
    batchId: "batch-fr-b2",
    batchName: "French B2 Advanced Cohort (Evaluation Desk)",
    subjectCode: "FR-202",
    subjectName: "French B2 Argumentative Essay & Oral Viva Assessment",
    languageFamily: "FRENCH",
    lsrwFocus: "COMPREHENSIVE_LSRW",
    type: "FINAL_EXAM",
    status: "UPCOMING",
    durationMins: 90,
    totalQuestions: 4,
    totalMarks: 100,
    passingMarks: 60,
    scheduledWindow: "Scheduled: Oct 10, 2026, 02:00 PM - 03:30 PM",
    proctoringEnabled: true
  },
  {
    id: "exam-202",
    title: "Japanese JLPT N5 Official Mock Test (Listening & Reading Section)",
    courseId: "crs-04",
    courseName: "Japanese N5: Fast Track",
    batchId: "batch-mcc-01",
    batchName: "MCC Cohort 2026–2029 (Section A)",
    subjectCode: "JA-101",
    subjectName: "Japanese Language: JLPT N5 & Business Kanji",
    languageFamily: "JAPANESE",
    lsrwFocus: "LISTENING",
    type: "LSRW_ASSESSMENT",
    status: "AVAILABLE",
    durationMins: 60,
    totalQuestions: 40,
    totalMarks: 100,
    passingMarks: 60,
    scheduledWindow: "Available Oct 12, 09:00 AM - Oct 16, 11:59 PM",
    proctoringEnabled: true
  },
  {
    id: "exam-203",
    title: "Korean TOPIK I Level 1 Certification Benchmark Test",
    courseId: "crs-02",
    courseName: "Korean TOPIK I: Level 1 & Hangul Mastery",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    subjectCode: "KO-101",
    subjectName: "Korean Language: TOPIK I Level 1 & Hangul Mastery",
    languageFamily: "KOREAN",
    lsrwFocus: "READING",
    type: "FINAL_EXAM",
    status: "UPCOMING",
    durationMins: 90,
    totalQuestions: 50,
    totalMarks: 100,
    passingMarks: 70,
    scheduledWindow: "Scheduled for Oct 25, 2026, 10:00 AM - 11:30 AM",
    proctoringEnabled: true
  },
  {
    id: "exam-204",
    title: "Spanish DELE A1 Oral Pronunciation & Speaking Drill Evaluation",
    courseId: "crs-05",
    courseName: "Spanish DELE A1: Conversational Foundations",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    subjectCode: "ES-101",
    subjectName: "Spanish Language: DELE A1 Conversational Track",
    languageFamily: "SPANISH",
    lsrwFocus: "SPEAKING",
    type: "LSRW_ASSESSMENT",
    status: "UPCOMING",
    durationMins: 30,
    totalQuestions: 15,
    totalMarks: 50,
    passingMarks: 30,
    scheduledWindow: "Scheduled for Oct 28, 2026, 02:00 PM - 02:30 PM",
    proctoringEnabled: true
  },
  {
    id: "exam-200",
    title: "German Goethe-Zertifikat A1 Module 1 Quiz (Hören & Sprechen)",
    courseId: "crs-03",
    courseName: "German A1: Goethe-Zertifikat Prep",
    batchId: "batch-2026-bca",
    batchName: "Cohort 2026–2029 (BCA Section A)",
    subjectCode: "DE-101",
    subjectName: "German Language: Goethe-Zertifikat A1 Professional",
    languageFamily: "GERMAN",
    lsrwFocus: "LISTENING",
    type: "QUIZ",
    status: "COMPLETED",
    durationMins: 20,
    totalQuestions: 15,
    totalMarks: 50,
    passingMarks: 30,
    scheduledWindow: "Completed Aug 28, 2026",
    scoreAchieved: 46,
    resultStatus: "PASSED",
    proctoringEnabled: false
  }
];

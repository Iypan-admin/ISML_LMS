export interface HomeworkAssignment {
  id: string;
  title: string;
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

export const mockAssignments: HomeworkAssignment[] = [
  {
    id: "asg-01",
    title: "Homework Assignment 1: French Accents & Vowels Handwriting Worksheet",
    moduleCode: "MOD-01",
    moduleName: "Module 1: Accents & Phonetics",
    dueDate: "Tomorrow, Sep 4 at 11:59 PM",
    status: "PENDING",
    instructions: "Complete the handwriting worksheet on French accent marks (é, è, à, ç). Upload your handwritten document as a PDF or high-resolution photo.",
    attachedFile: { name: "Module1_Accents_Worksheet.pdf", size: "1.4 MB", downloadUrl: "#" },
    maxScore: 100
  },
  {
    id: "asg-02",
    title: "Homework Assignment 2: Audio Recording — Reading Dialogue 2 Aloud",
    moduleCode: "MOD-02",
    moduleName: "Module 2: Daily Greetings",
    dueDate: "Sep 1, 2026",
    status: "COMPLETED",
    instructions: "Record yourself reading Dialogue 2 from the textbook (page 14) with proper French intonation.",
    submittedDate: "Aug 31, 2026",
    submittedFile: "Arun_Kumar_Dialogue2_Audio.mp3",
    scoreReceived: 92,
    maxScore: 100,
    tutorFeedback: "Excellent pronunciation of nasal vowels! Watch out for silent 's' in 'vous'."
  }
];

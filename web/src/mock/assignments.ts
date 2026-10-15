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

export const mockAssignments: HomeworkAssignment[] = [
  {
    id: "asg-fr-a1-01",
    title: "French A1 Writing Worksheet: Accents, Vowels & Basic Greetings (Salutations)",
    courseId: "crs-01",
    courseName: "French A1: Beginner French & DELF A1 Foundations",
    batchId: "batch-2026-fr-a1",
    batchName: "French A1 Intensive Cohort 2026 (Live Webinar Batch)",
    subjectCode: "FR-101",
    subjectName: "French A1 Language, Phonetics & Salutations",
    languageFamily: "FRENCH",
    lsrwSkill: "WRITING",
    moduleCode: "MOD-FR-01",
    moduleName: "Module 1: Salutations, Les Chiffres et Présentations",
    dueDate: "Tomorrow, Sep 4 at 11:59 PM",
    status: "PENDING",
    instructions: "Complete the handwriting drill on French accent marks (é, è, à, ç). Upload your handwritten PDF or photograph.",
    attachedFile: { name: "French_A1_Accents_Worksheet.pdf", size: "1.4 MB", downloadUrl: "#" },
    maxScore: 100
  },
  {
    id: "asg-fr-a2-02",
    title: "French A2 Writing Drill: Passé Composé vs Imparfait Holiday Narrative",
    courseId: "crs-01-a2",
    courseName: "French A2: Elementary Communication & DELF A2 Mocks",
    batchId: "batch-fr-a2",
    batchName: "French A2 Cohort (Section B - Standby Coverage)",
    subjectCode: "FR-102",
    subjectName: "French A2 Grammar, Passé Composé & DELF A2 Mock Exam",
    languageFamily: "FRENCH",
    lsrwSkill: "WRITING",
    moduleCode: "MOD-FR-02",
    moduleName: "Module 2: Raconter un Souvenir de Vacances",
    dueDate: "Sep 8, 2026",
    status: "PENDING",
    instructions: "Write a 120-word narrative recounting a past journey using both Passé Composé and Imparfait with auxiliary 'être' and 'avoir'.",
    attachedFile: { name: "A2_Narrative_Rubric.pdf", size: "850 KB", downloadUrl: "#" },
    maxScore: 100
  },
  {
    id: "asg-fr-b1-03",
    title: "French B1 Audio Recording: Expressing Doubts & Hypotheses using Subjunctive",
    courseId: "crs-01-b1",
    courseName: "French B1: Intermediate Fluency & Complex Structures",
    batchId: "batch-fr-b1",
    batchName: "French B1 Executive Cohort (1-on-1 Q&A Desk)",
    subjectCode: "FR-201",
    subjectName: "French B1 Subjunctive Mood, Connectors & Audio Inquiries",
    languageFamily: "FRENCH",
    lsrwSkill: "SPEAKING",
    moduleCode: "MOD-FR-03",
    moduleName: "Module 3: Le Subjonctif Présent & Exprimer son Opinion",
    dueDate: "Sep 12, 2026",
    status: "COMPLETED",
    instructions: "Record a 2-minute voice note debating environmental policies using 'Il faut que...', 'Bien que...', and 'Je doute que...'.",
    attachedFile: { name: "B1_Subjunctive_Prompts.pdf", size: "620 KB", downloadUrl: "#" },
    submittedDate: "Aug 31, 2026",
    submittedFile: "Student_B1_Subjunctive_Speech.mp3",
    scoreReceived: 88,
    maxScore: 100,
    tutorFeedback: "Great mastery of subjunctive stems! Watch out for irregular forms like 'fassions' and 'puissions'."
  },
  {
    id: "asg-fr-b2-04",
    title: "French B2 DELF Essay: 'Le Télétravail et l'Équilibre de Vie' (Formal Synthesis)",
    courseId: "crs-01-b2",
    courseName: "French B2: Advanced Oral Discourse & DELF B2 Synthesis",
    batchId: "batch-fr-b2",
    batchName: "French B2 Advanced Cohort (Evaluation Desk)",
    subjectCode: "FR-202",
    subjectName: "French B2 Argumentative Essay & Oral Viva Assessment",
    languageFamily: "FRENCH",
    lsrwSkill: "INTEGRATED",
    moduleCode: "MOD-FR-04",
    moduleName: "Module 4: Synthèse de Documents & Argumentation Formelle",
    dueDate: "Sep 15, 2026",
    status: "PENDING",
    instructions: "Synthesize two contradictory French press articles into a 250-word formal structured essay with introduction, thesis, antithesis, and conclusion.",
    attachedFile: { name: "DELF_B2_Dossier_Synthese.pdf", size: "1.9 MB", downloadUrl: "#" },
    maxScore: 100
  },
  {
    id: "asg-03",
    title: "Writing Assignment: Japanese Hiragana & Katakana Stroke Order Practice",
    courseId: "crs-04",
    courseName: "Japanese N5: Fast Track",
    batchId: "batch-mcc-01",
    batchName: "MCC Cohort 2026–2029 (Section A)",
    subjectCode: "JA-101",
    subjectName: "Japanese Language: JLPT N5 & Business Kanji",
    languageFamily: "JAPANESE",
    lsrwSkill: "WRITING",
    moduleCode: "MOD-JA-01",
    moduleName: "Module 1: Hiragana, Katakana & Basic Greetings",
    dueDate: "Oct 18, 2026 at 11:59 PM",
    status: "PENDING",
    instructions: "Write out the 46 Hiragana characters twice with proper stroke order as demonstrated in class. Upload scanned worksheet PDF.",
    attachedFile: { name: "JLPT_N5_Hiragana_Grid_Sheet.pdf", size: "2.1 MB", downloadUrl: "#" },
    maxScore: 50
  },
  {
    id: "asg-04",
    title: "Listening Comprehension: Korean Hangul Syllables & Number Dictation",
    courseId: "crs-02",
    courseName: "Korean TOPIK I: Level 1 & Hangul Mastery",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    subjectCode: "KO-101",
    subjectName: "Korean Language: TOPIK I Level 1 & Hangul Mastery",
    languageFamily: "KOREAN",
    lsrwSkill: "LISTENING",
    moduleCode: "MOD-KO-01",
    moduleName: "Module 1: Hangul Alphabet (Vowels, Consonants & Batchim)",
    dueDate: "Oct 20, 2026 at 06:00 PM",
    status: "PENDING",
    instructions: "Listen to the attached native Seoul recording and transcribe the 15 spoken Korean numbers into Sino-Korean Hangul.",
    attachedFile: { name: "Korean_Listening_Numbers_Track.mp3", size: "4.8 MB", downloadUrl: "#" },
    maxScore: 75
  },
  {
    id: "asg-05",
    title: "Reading Comprehension: German Dialogues in Munich (Alltag und Beruf)",
    courseId: "crs-03",
    courseName: "German A1: Goethe-Zertifikat Prep",
    batchId: "batch-2026-bca",
    batchName: "Cohort 2026–2029 (BCA Section A)",
    subjectCode: "DE-101",
    subjectName: "German Language: Goethe-Zertifikat A1 Professional",
    languageFamily: "GERMAN",
    lsrwSkill: "READING",
    moduleCode: "MOD-DE-01",
    moduleName: "Module 1: Hallo! Erste Schritte auf Deutsch",
    dueDate: "Sep 28, 2026",
    status: "COMPLETED",
    instructions: "Read the article describing everyday life in Berlin and answer the 10 multiple-choice questions.",
    attachedFile: { name: "German_A1_Reading_Passage.pdf", size: "850 KB", downloadUrl: "#" },
    submittedDate: "Sep 27, 2026",
    submittedFile: "German_Reading_Answers.pdf",
    scoreReceived: 48,
    maxScore: 50,
    tutorFeedback: "Gut gemacht! Accurate comprehension of definite articles and cases."
  }
];

// ============================================================================
// ISML COLLEGE LMS — MOCK RESULTS, ASSESSMENTS, ASSIGNMENTS & MARK LISTS
// Batch-wise & Student-wise mark records across Foreign Languages
// ============================================================================

export interface StudentMarkEntry {
  id: string;
  studentId: string; // e.g. ISML20260001
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

export const mockStudentMarksLedger: StudentMarkEntry[] = [
  // Bharathi M (stu-001) - French A1 Cohort
  {
    id: "mark-101",
    studentId: "ISML20260001",
    studentName: "Bharathi M",
    studentEmail: "bharathi.m@loyolacollege.edu",
    avatarUrl: "/avatars/bharathi.png",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    languageFamily: "FRENCH",
    courseName: "French A1 Intensive Certification Program",
    itemType: "ASSESSMENT",
    activityTitle: "French A1 Continuous Internal Assessment (CIA-1)",
    moduleName: "Module 1: Salutations & Phonetics",
    lsrwSkill: "INTEGRATED",
    submissionDate: "Oct 12, 2026",
    dayOfWeek: "Monday",
    score: 48,
    maxScore: 50,
    percentage: 96,
    grade: "A+",
    status: "EVALUATED",
    evaluatedByTutor: "Mme. Claire Fontaine",
    tutorFeedback: "Outstanding pronunciation and flawless conjugations in greetings dialogues.",
    sectionBreakdown: [
      { section: "Listening & Dictation", score: 15, maxScore: 15 },
      { section: "Grammar & Orthography", score: 19, maxScore: 20 },
      { section: "Oral Response", score: 14, maxScore: 15 }
    ]
  },
  {
    id: "mark-102",
    studentId: "ISML20260001",
    studentName: "Bharathi M",
    studentEmail: "bharathi.m@loyolacollege.edu",
    avatarUrl: "/avatars/bharathi.png",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    languageFamily: "FRENCH",
    courseName: "French A1 Intensive Certification Program",
    itemType: "ASSIGNMENT",
    activityTitle: "Writing Worksheet: French Accents & Vowels Handwriting",
    moduleName: "Module 1: Salutations, Les Chiffres et Présentations",
    lsrwSkill: "WRITING",
    submissionDate: "Sep 28, 2026",
    dayOfWeek: "Monday",
    score: 95,
    maxScore: 100,
    percentage: 95,
    grade: "A+",
    status: "EVALUATED",
    evaluatedByTutor: "Mme. Claire Fontaine",
    tutorFeedback: "Neat handwriting, accurate placement of cédille and accent grave."
  },
  {
    id: "mark-103",
    studentId: "ISML20260001",
    studentName: "Bharathi M",
    studentEmail: "bharathi.m@loyolacollege.edu",
    avatarUrl: "/avatars/bharathi.png",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    languageFamily: "FRENCH",
    courseName: "French A1 Intensive Certification Program",
    itemType: "ASSIGNMENT",
    activityTitle: "Speaking Task: Audio Recording — French Bistro Dialogue Aloud",
    moduleName: "Module 2: Daily Social Life & Dining Out",
    lsrwSkill: "SPEAKING",
    submissionDate: "Oct 05, 2026",
    dayOfWeek: "Monday",
    score: 46,
    maxScore: 50,
    percentage: 92,
    grade: "A",
    status: "EVALUATED",
    evaluatedByTutor: "M. Jean Dupont",
    tutorFeedback: "Natural cadence in ordering food; clear nasal vowel sounds."
  },

  // Alex D'Souza (stu-003) - French A1 Cohort
  {
    id: "mark-104",
    studentId: "ISML20260003",
    studentName: "Alex D'Souza",
    studentEmail: "alex.dsouza@loyolacollege.edu",
    avatarUrl: "/avatars/alex.png",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    languageFamily: "FRENCH",
    courseName: "French A1 Intensive Certification Program",
    itemType: "ASSESSMENT",
    activityTitle: "French A1 Continuous Internal Assessment (CIA-1)",
    moduleName: "Module 1: Salutations & Phonetics",
    lsrwSkill: "INTEGRATED",
    submissionDate: "Oct 12, 2026",
    dayOfWeek: "Monday",
    score: 42,
    maxScore: 50,
    percentage: 84,
    grade: "A",
    status: "EVALUATED",
    evaluatedByTutor: "Mme. Claire Fontaine",
    tutorFeedback: "Solid grammar understanding; need minor revision in silent letter liaisons.",
    sectionBreakdown: [
      { section: "Listening & Dictation", score: 12, maxScore: 15 },
      { section: "Grammar & Orthography", score: 18, maxScore: 20 },
      { section: "Oral Response", score: 12, maxScore: 15 }
    ]
  },
  {
    id: "mark-105",
    studentId: "ISML20260003",
    studentName: "Alex D'Souza",
    studentEmail: "alex.dsouza@loyolacollege.edu",
    avatarUrl: "/avatars/alex.png",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    languageFamily: "FRENCH",
    courseName: "French A1 Intensive Certification Program",
    itemType: "ASSIGNMENT",
    activityTitle: "Writing Worksheet: French Accents & Vowels Handwriting",
    moduleName: "Module 1: Salutations, Les Chiffres et Présentations",
    lsrwSkill: "WRITING",
    submissionDate: "Sep 28, 2026",
    dayOfWeek: "Monday",
    score: 82,
    maxScore: 100,
    percentage: 82,
    grade: "A",
    status: "EVALUATED",
    evaluatedByTutor: "Mme. Claire Fontaine",
    tutorFeedback: "Good work. Keep practicing accent aigu direction."
  },

  // Pooja R (stu-002) - German A1 Cohort
  {
    id: "mark-106",
    studentId: "ISML20260002",
    studentName: "Pooja R",
    studentEmail: "pooja.r@loyolacollege.edu",
    avatarUrl: "/avatars/pooja.png",
    batchId: "batch-2026-bca",
    batchName: "Cohort 2026–2029 (BCA Section A)",
    languageFamily: "GERMAN",
    courseName: "German A1 Professional Career Track",
    itemType: "ASSESSMENT",
    activityTitle: "German A1 Mid-Term Modular Examination",
    moduleName: "Module 1: Begrüßung & Alphabet",
    lsrwSkill: "INTEGRATED",
    submissionDate: "Oct 08, 2026",
    dayOfWeek: "Thursday",
    score: 47,
    maxScore: 50,
    percentage: 94,
    grade: "A+",
    status: "EVALUATED",
    evaluatedByTutor: "Herr. Hans Müller",
    tutorFeedback: "Exceptional article gender memory (der, die, das) and umlaut pronunciation.",
    sectionBreakdown: [
      { section: "Hören (Listening)", score: 14, maxScore: 15 },
      { section: "Lesen & Grammatik", score: 19, maxScore: 20 },
      { section: "Sprechen (Oral)", score: 14, maxScore: 15 }
    ]
  },
  {
    id: "mark-107",
    studentId: "ISML20260002",
    studentName: "Pooja R",
    studentEmail: "pooja.r@loyolacollege.edu",
    avatarUrl: "/avatars/pooja.png",
    batchId: "batch-2026-bca",
    batchName: "Cohort 2026–2029 (BCA Section A)",
    languageFamily: "GERMAN",
    courseName: "German A1 Professional Career Track",
    itemType: "ASSIGNMENT",
    activityTitle: "German Writing Task: Self-Introduction Paragraph (Vorstellung)",
    moduleName: "Module 1: Begrüßung & Alphabet",
    lsrwSkill: "WRITING",
    submissionDate: "Oct 02, 2026",
    dayOfWeek: "Friday",
    score: 96,
    maxScore: 100,
    percentage: 96,
    grade: "A+",
    status: "EVALUATED",
    evaluatedByTutor: "Herr. Hans Müller",
    tutorFeedback: "Flawless sentence syntax and verb-second rule application."
  },

  // Rohith Sharma R (stu-006) - German A1 Cohort
  {
    id: "mark-108",
    studentId: "ISML20250033",
    studentName: "Rohith Sharma R",
    studentEmail: "rohith.sharma@loyolacollege.edu",
    avatarUrl: "/avatars/rohith.png",
    batchId: "batch-2026-bca",
    batchName: "Cohort 2026–2029 (BCA Section A)",
    languageFamily: "GERMAN",
    courseName: "German A1 Professional Career Track",
    itemType: "ASSESSMENT",
    activityTitle: "German A1 Mid-Term Modular Examination",
    moduleName: "Module 1: Begrüßung & Alphabet",
    lsrwSkill: "INTEGRATED",
    submissionDate: "Oct 08, 2026",
    dayOfWeek: "Thursday",
    score: 34,
    maxScore: 50,
    percentage: 68,
    grade: "B",
    status: "EVALUATED",
    evaluatedByTutor: "Herr. Hans Müller",
    tutorFeedback: "Requires more practice with separable verbs and case accusative."
  },

  // Vigneshwaran K (stu-004) - Japanese N5 Cohort
  {
    id: "mark-109",
    studentId: "ISML20260004",
    studentName: "Vigneshwaran K",
    studentEmail: "vignesh.k@loyolacollege.edu",
    avatarUrl: "/avatars/vignesh.png",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    languageFamily: "JAPANESE",
    courseName: "Japanese N5 Foundation & JLPT Mastery",
    itemType: "ASSESSMENT",
    activityTitle: "JLPT N5 Kana & Kanji Benchmark Quiz",
    moduleName: "Module 1: Hiragana & Katakana Mastery",
    lsrwSkill: "READING",
    submissionDate: "Oct 09, 2026",
    dayOfWeek: "Friday",
    score: 39,
    maxScore: 50,
    percentage: 78,
    grade: "B+",
    status: "EVALUATED",
    evaluatedByTutor: "Kenji Sato Sensei",
    tutorFeedback: "Good recognition of dakuten and handakuten; practice Katakana stroke order."
  },
  {
    id: "mark-110",
    studentId: "ISML20260004",
    studentName: "Vigneshwaran K",
    studentEmail: "vignesh.k@loyolacollege.edu",
    avatarUrl: "/avatars/vignesh.png",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    languageFamily: "JAPANESE",
    courseName: "Japanese N5 Foundation & JLPT Mastery",
    itemType: "ASSIGNMENT",
    activityTitle: "Hiragana Stroke Order Workbook Upload (46 Characters)",
    moduleName: "Module 1: Hiragana & Katakana Mastery",
    lsrwSkill: "WRITING",
    submissionDate: "Sep 25, 2026",
    dayOfWeek: "Friday",
    score: 84,
    maxScore: 100,
    percentage: 84,
    grade: "A",
    status: "EVALUATED",
    evaluatedByTutor: "Kenji Sato Sensei",
    tutorFeedback: "Well written characters. Stop hook at the end of 'tsu' needs attention."
  },

  // Sneha Sundaram (stu-005) - Korean TOPIK Cohort
  {
    id: "mark-111",
    studentId: "ISML20250012",
    studentName: "Sneha Sundaram",
    studentEmail: "sneha.s@loyolacollege.edu",
    avatarUrl: "/avatars/sneha.png",
    batchId: "batch-2025-cs",
    batchName: "Cohort 2025–2028 (Section A & B)",
    languageFamily: "KOREAN",
    courseName: "Korean TOPIK I Level 1 Intensive",
    itemType: "ASSESSMENT",
    activityTitle: "Hangul Phonology & Syllable Block Benchmark Assessment",
    moduleName: "Module 1: Hangul Vowels & Consonants",
    lsrwSkill: "INTEGRATED",
    submissionDate: "Oct 07, 2026",
    dayOfWeek: "Wednesday",
    score: 49,
    maxScore: 50,
    percentage: 98,
    grade: "A+",
    status: "EVALUATED",
    evaluatedByTutor: "Park Min-ji Seonsaengnim",
    tutorFeedback: "Exemplary Hangul syllable block construction and batchim pronunciation.",
    sectionBreakdown: [
      { section: "Listening Audio", score: 15, maxScore: 15 },
      { section: "Reading & Syllables", score: 20, maxScore: 20 },
      { section: "Speaking Drill", score: 14, maxScore: 15 }
    ]
  },
  {
    id: "mark-112",
    studentId: "ISML20250012",
    studentName: "Sneha Sundaram",
    studentEmail: "sneha.s@loyolacollege.edu",
    avatarUrl: "/avatars/sneha.png",
    batchId: "batch-2025-cs",
    batchName: "Cohort 2025–2028 (Section A & B)",
    languageFamily: "KOREAN",
    courseName: "Korean TOPIK I Level 1 Intensive",
    itemType: "ASSIGNMENT",
    activityTitle: "Audio Submission: Korean Self-Introduction (Chogimyeong)",
    moduleName: "Module 1: Hangul Vowels & Consonants",
    lsrwSkill: "SPEAKING",
    submissionDate: "Sep 30, 2026",
    dayOfWeek: "Wednesday",
    score: 98,
    maxScore: 100,
    percentage: 98,
    grade: "A+",
    status: "EVALUATED",
    evaluatedByTutor: "Park Min-ji Seonsaengnim",
    tutorFeedback: "Natural intonation and clear polite sentence endings (-imnida / -seumnida)."
  },

  // Ananya Krishnan (stu-007) - Spanish DELE A1 Cohort
  {
    id: "mark-113",
    studentId: "ISML20260021",
    studentName: "Ananya Krishnan",
    studentEmail: "ananya.k@loyolacollege.edu",
    avatarUrl: "/avatars/ananya.png",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    languageFamily: "SPANISH",
    courseName: "Spanish DELE A1 Conversational Track",
    itemType: "ASSESSMENT",
    activityTitle: "Spanish DELE A1 Diagnostic Midterm",
    moduleName: "Module 1: Saludos, Género y Números",
    lsrwSkill: "INTEGRATED",
    submissionDate: "Oct 11, 2026",
    dayOfWeek: "Sunday",
    score: 45,
    maxScore: 50,
    percentage: 90,
    grade: "A",
    status: "EVALUATED",
    evaluatedByTutor: "Prof. Carlos Mendoza",
    tutorFeedback: "Fluent handling of gender agreements and basic regular verb conjugations (hablar, comer).",
    sectionBreakdown: [
      { section: "Comprensión auditiva", score: 14, maxScore: 15 },
      { section: "Gramática y Léxico", score: 18, maxScore: 20 },
      { section: "Expresión oral", score: 13, maxScore: 15 }
    ]
  },
  {
    id: "mark-114",
    studentId: "ISML20260021",
    studentName: "Ananya Krishnan",
    studentEmail: "ananya.k@loyolacollege.edu",
    avatarUrl: "/avatars/ananya.png",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    languageFamily: "SPANISH",
    courseName: "Spanish DELE A1 Conversational Track",
    itemType: "ASSIGNMENT",
    activityTitle: "Spanish Writing: Mi Familia y Mi Rutina Diaria",
    moduleName: "Module 1: Saludos, Género y Números",
    lsrwSkill: "WRITING",
    submissionDate: "Oct 04, 2026",
    dayOfWeek: "Sunday",
    score: 92,
    maxScore: 100,
    percentage: 92,
    grade: "A",
    status: "EVALUATED",
    evaluatedByTutor: "Prof. Carlos Mendoza",
    tutorFeedback: "Great use of adjectives and articles. Keep practicing irregular verbs."
  }
];

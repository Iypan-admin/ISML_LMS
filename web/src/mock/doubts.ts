// ============================================================================
// ISML COLLEGE LMS — MOCK ACADEMIC DOUBT RESOLUTION & TUTOR TICKETING
// Live student academic doubts, audio questions, and faculty allocations
// ============================================================================

export interface DoubtThread {
  id: string;
  topicTitle: string;
  category: 'Grammar' | 'Pronunciation' | 'Homework' | 'Exam Doubt';
  status: 'RESOLVED' | 'OPEN' | 'IN_PROGRESS';
  assignedTutorName: string;
  assignedTutorRole: 'Assistant Doubt Tutor' | 'Main Tutor';
  createdAt: string;
  messages: {
    id: string;
    sender: 'STUDENT' | 'TUTOR' | 'AI_ASSISTANT';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export const mockDoubtThreads: DoubtThread[] = [
  {
    id: "dbt-101",
    topicTitle: "Difference between 'C'est' and 'Il est' in French sentences",
    category: "Grammar",
    status: "RESOLVED",
    assignedTutorName: "Assistant Tutor Ananya",
    assignedTutorRole: "Assistant Doubt Tutor",
    createdAt: "Yesterday, 3:45 PM",
    messages: [
      {
        id: "msg-1",
        sender: "STUDENT",
        senderName: "Bharathi M",
        text: "Hi Mam! When should I use 'C'est un professeur' versus 'Il est professeur'?",
        timestamp: "Yesterday, 3:45 PM"
      },
      {
        id: "msg-2",
        sender: "AI_ASSISTANT",
        senderName: "AI Tutor Suggestion",
        text: "Quick AI Tip: Use 'C'est' + Article + Noun (e.g. C'est un professeur). Use 'Il est' + Noun without article (e.g. Il est professeur).",
        timestamp: "Yesterday, 3:45 PM"
      },
      {
        id: "msg-3",
        sender: "TUTOR",
        senderName: "Assistant Tutor Ananya",
        text: "Spot on! AI suggestion is correct. Remember: 'C'est' is used when introducing someone with a modified noun (e.g., C'est un grand homme).",
        timestamp: "Yesterday, 4:02 PM"
      }
    ]
  }
];

export interface DoubtTicket {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  batchId: string;
  batchName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  courseName: string;
  moduleName: string;
  topicTitle: string;
  category: 'Grammar' | 'Pronunciation' | 'Homework' | 'Exam Doubt' | 'LSRW Oral';
  status: 'RESOLVED' | 'OPEN' | 'IN_PROGRESS';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTutorName: string;
  assignedTutorRole: 'Lead Instructor' | 'Assistant Doubt Tutor' | 'Substitute Tutor';
  createdAt: string;
  resolvedAt?: string;
  messagesCount: number;
  lastReplyBy: 'STUDENT' | 'TUTOR' | 'AI_ASSISTANT';
  studentQuery: string;
  tutorSolution?: string;
}

export const mockDoubtTickets: DoubtTicket[] = [
  {
    id: "dbt-101",
    ticketNumber: "DBT-2026-FR-101",
    studentId: "ISML20260001",
    studentName: "Bharathi M",
    studentEmail: "bharathi.m@loyolacollege.edu",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    languageFamily: "FRENCH",
    courseName: "French A1 Intensive Certification Program",
    moduleName: "Module 1: Salutations & Phonetics",
    topicTitle: "Difference between 'C'est' and 'Il est' in French greetings",
    category: "Grammar",
    status: "RESOLVED",
    priority: "MEDIUM",
    assignedTutorName: "Mme. Claire Fontaine",
    assignedTutorRole: "Lead Instructor",
    createdAt: "Yesterday, 3:45 PM",
    resolvedAt: "Yesterday, 4:02 PM",
    messagesCount: 3,
    lastReplyBy: "TUTOR",
    studentQuery: "When introducing someone, should I use 'C'est un professeur' or 'Il est professeur'?",
    tutorSolution: "Use 'C'est' with an article and modified noun (e.g., C'est un professeur). Use 'Il est' directly with un-modified professions (e.g., Il est professeur)."
  },
  {
    id: "dbt-fr-b1-201",
    ticketNumber: "DBT-2026-FR-B1-201",
    studentId: "ISML20260012",
    studentName: "Sophie Martin",
    studentEmail: "sophie.m@isml.edu",
    batchId: "batch-fr-b1",
    batchName: "French B1 Executive Cohort (1-on-1 Q&A Desk)",
    languageFamily: "FRENCH",
    courseName: "French B1: Intermediate Fluency & Complex Structures",
    moduleName: "Module 3: Le Subjonctif Présent & Exprimer son Opinion",
    topicTitle: "Why does 'Penser que' take Indicative while 'Ne pas penser que' takes Subjunctive?",
    category: "Grammar",
    status: "OPEN",
    priority: "HIGH",
    assignedTutorName: "Jay (Foreign Language Faculty)",
    assignedTutorRole: "Assistant Doubt Tutor",
    createdAt: "Today, 09:15 AM",
    messagesCount: 1,
    lastReplyBy: "STUDENT",
    studentQuery: "Bonjour Jay sir! In my B1 oral drill, why is 'Je pense qu'il vient' indicative, but 'Je ne pense pas qu'il vienne' subjunctive? How to explain this rule in conversation?",
    tutorSolution: ""
  },
  {
    id: "dbt-fr-b1-202",
    ticketNumber: "DBT-2026-FR-B1-202",
    studentId: "ISML20260018",
    studentName: "Dinesh Kumar",
    studentEmail: "dinesh.k@isml.edu",
    batchId: "batch-fr-b1",
    batchName: "French B1 Executive Cohort (1-on-1 Q&A Desk)",
    languageFamily: "FRENCH",
    courseName: "French B1: Intermediate Fluency & Complex Structures",
    moduleName: "Module 3: Audio Phonetics & Liaisons",
    topicTitle: "Audio pronunciation doubt on obligatory liaison in 'Ils ont' vs 'Ils sont'",
    category: "Pronunciation",
    status: "OPEN",
    priority: "MEDIUM",
    assignedTutorName: "Jay (Foreign Language Faculty)",
    assignedTutorRole: "Assistant Doubt Tutor",
    createdAt: "Today, 10:45 AM",
    messagesCount: 2,
    lastReplyBy: "STUDENT",
    studentQuery: "Students in my group keep confusing the 'Z' sound in 'Ils ont' [il z‿ɔ̃] and the sharp 'S' sound in 'Ils sont' [il sɔ̃]. Please review my recorded audio clip.",
    tutorSolution: ""
  },
  {
    id: "dbt-103",
    ticketNumber: "DBT-2026-DE-103",
    studentId: "ISML20260002",
    studentName: "Pooja R",
    studentEmail: "pooja.r@loyolacollege.edu",
    batchId: "batch-2026-bca",
    batchName: "Cohort 2026–2029 (BCA Section A)",
    languageFamily: "GERMAN",
    courseName: "German A1 Professional Career Track",
    moduleName: "Module 1: Begrüßung & Alphabet",
    topicTitle: "Accusative case direct object gender change for masculine articles",
    category: "Grammar",
    status: "OPEN",
    priority: "MEDIUM",
    assignedTutorName: "Herr. Hans Müller",
    assignedTutorRole: "Lead Instructor",
    createdAt: "Today, 11:30 AM",
    messagesCount: 1,
    lastReplyBy: "STUDENT",
    studentQuery: "Why does 'der Apfel' become 'den Apfel' in 'Ich esse einen Apfel', but 'das Buch' stays 'das Buch'?",
    tutorSolution: ""
  },
  {
    id: "dbt-104",
    ticketNumber: "DBT-2026-JP-104",
    studentId: "ISML20260004",
    studentName: "Vigneshwaran K",
    studentEmail: "vignesh.k@loyolacollege.edu",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    languageFamily: "JAPANESE",
    courseName: "Japanese N5 Foundation & JLPT Mastery",
    moduleName: "Module 1: Hiragana & Katakana Mastery",
    topicTitle: "Confusion between Katakana 'shi' (シ) and 'tsu' (ツ)",
    category: "Homework",
    status: "RESOLVED",
    priority: "LOW",
    assignedTutorName: "Kenji Sato Sensei",
    assignedTutorRole: "Lead Instructor",
    createdAt: "Oct 11, 2026",
    resolvedAt: "Oct 11, 2026",
    messagesCount: 4,
    lastReplyBy: "TUTOR",
    studentQuery: "The stroke directions for 'shi' and 'tsu' look almost identical in printed font. How do I differentiate?",
    tutorSolution: "For 'shi' (シ), the strokes are more horizontal and bottom-to-top. For 'tsu' (ツ), the strokes are vertical and top-to-bottom."
  },
  {
    id: "dbt-105",
    ticketNumber: "DBT-2026-KO-105",
    studentId: "ISML20250012",
    studentName: "Sneha Sundaram",
    studentEmail: "sneha.s@loyolacollege.edu",
    batchId: "batch-2025-cs",
    batchName: "Cohort 2025–2028 (Section A & B)",
    languageFamily: "KOREAN",
    courseName: "Korean TOPIK I Level 1 Intensive",
    moduleName: "Module 1: Hangul Vowels & Consonants",
    topicTitle: "Batchim liaison pronunciation before initial circle consonant 'ㅇ'",
    category: "Pronunciation",
    status: "RESOLVED",
    priority: "MEDIUM",
    assignedTutorName: "Park Min-ji Seonsaengnim",
    assignedTutorRole: "Lead Instructor",
    createdAt: "Oct 09, 2026",
    resolvedAt: "Oct 09, 2026",
    messagesCount: 2,
    lastReplyBy: "TUTOR",
    studentQuery: "In '한국어' (Hangugeo), why is the 'ㄱ' pronounced with '어' instead of stopping?",
    tutorSolution: "That is the resyllabification rule! An empty 'ㅇ' allows the bottom final consonant to slide into the next syllable."
  }
];

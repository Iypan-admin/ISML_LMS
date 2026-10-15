// ============================================================================
// ISML COLLEGE LMS — PRE-RECORDED LECTURE SESSIONS MASTER FIXTURE
// Shared across Academic Manager (/academic-manager/recorded-sessions) and Student Portal (/pre-recorded)
// Includes Batch Mapping, Date, Day, Tutor, and Module Details
// ============================================================================

export interface LessonResource {
  title: string;
  type: 'PDF' | 'PPT' | 'AUDIO' | 'DOCX' | 'VIDEO';
  size: string;
  downloadUrl: string;
}

export interface PreRecordedSession {
  id: string;
  subLevel: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  subjectCode: string;
  subjectName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  moduleCode: string;
  moduleName: string;
  sessionTitle: string;
  topicName: string;
  description: string;
  durationMins: number;
  watchedMins: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
  thumbnailUrl: string;
  videoUrl: string;
  videoFileName?: string;
  videoFileSize?: string;
  resolution: '1080p Full HD' | '720p HD' | '4K UHD';
  instructorName: string;
  resources: LessonResource[];
  assignmentId?: string;
  lsrwType?: 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING';
  viewsCount: number;
  lectureDate: string; // e.g. "Oct 12, 2026"
  lectureDay: string;  // e.g. "Monday"
  uploadedAt: string;
}

export const mockPreRecordedSessions: PreRecordedSession[] = [
  {
    id: "pr-sess-01",
    subLevel: "DELF A1",
    courseId: "crs-01",
    courseName: "French A1: Beginner French",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    subjectCode: "FR-101",
    subjectName: "French Language: DELF A1 & A2 (Foundations & Oral)",
    languageFamily: "FRENCH",
    moduleCode: "MOD-FR-01",
    moduleName: "Module 1: French Accents & Phonetics Mastery",
    sessionTitle: "Session 01: Understanding French Vowels and Silent Endings",
    topicName: "Les Voyelles et Consonnes Muettes (Silent Endings & Nasal Vowels)",
    description: "In this core pre-recorded session, master native Parisian pronunciation rules for French vowels, nasal sounds (an, in, on), and silent final consonants (e.g., 'Paris', 'Salut').",
    durationMins: 35,
    watchedMins: 18,
    status: "IN_PROGRESS",
    thumbnailUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    videoFileName: "french_a1_vowels_silent_consonants.mp4",
    videoFileSize: "185 MB",
    resolution: "1080p Full HD",
    instructorName: "Prof. Marie Delacroix",
    resources: [
      { title: "French Vowel Pronunciation Guide Chart.pdf", type: "PDF", size: "2.4 MB", downloadUrl: "#" },
      { title: "Audio Drill Native Speaker Samples.zip", type: "AUDIO", size: "14.8 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-01",
    lsrwType: "SPEAKING",
    viewsCount: 284,
    lectureDate: "Oct 12, 2026",
    lectureDay: "Monday",
    uploadedAt: "Oct 12, 2026"
  },
  {
    id: "pr-sess-02",
    subLevel: "DELF A1",
    courseId: "crs-01",
    courseName: "French A1: Beginner French",
    batchId: "batch-2026-fr",
    batchName: "Cohort 2026–2029 (ISML Global)",
    subjectCode: "FR-101",
    subjectName: "French Language: DELF A1 & A2 (Foundations & Oral)",
    languageFamily: "FRENCH",
    moduleCode: "MOD-FR-01",
    moduleName: "Module 1: French Accents & Phonetics Mastery",
    sessionTitle: "Session 02: Accents & Special Keys (É, È, À, Ç, Œ et Tréma)",
    topicName: "French Orthographic Accents & Soft Virtual Keyboard Typing",
    description: "Learn how accent marks change vowel sounds in French words, and how to type them effortlessly using the ISML Virtual Soft Accent Keyboard.",
    durationMins: 40,
    watchedMins: 40,
    status: "COMPLETED",
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    videoFileName: "french_accents_virtual_keyboard.mp4",
    videoFileSize: "210 MB",
    resolution: "1080p Full HD",
    instructorName: "Prof. Marie Delacroix",
    resources: [
      { title: "Virtual Accent Keyboard Layout Sheet.pdf", type: "PDF", size: "1.1 MB", downloadUrl: "#" },
      { title: "Lesson Slide Deck.pptx", type: "PPT", size: "12.4 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-02",
    lsrwType: "WRITING",
    viewsCount: 318,
    lectureDate: "Oct 09, 2026",
    lectureDay: "Friday",
    uploadedAt: "Oct 09, 2026"
  },
  {
    id: "pr-sess-03",
    subLevel: "JLPT N5",
    courseId: "crs-04",
    courseName: "Japanese N5: Fast Track",
    batchId: "batch-mcc-01",
    batchName: "MCC Cohort 2026–2029 (Section A)",
    subjectCode: "JA-101",
    subjectName: "Japanese Language: JLPT N5 & Business Kanji",
    languageFamily: "JAPANESE",
    moduleCode: "MOD-JA-01",
    moduleName: "Module 1: Hiragana, Katakana & Basic Greetings",
    sessionTitle: "Session 03: Hiragana 46 Basic Syllables & Stroke Order Principles",
    topicName: "Hiragana Ka-Ta-Na Brush Balance & Dakuten / Handakuten Rules",
    description: "Step-by-step native breakdown of writing Hiragana characters from A-Ka-Sa-Ta-Na with correct brush balance, dakuten and handanuten rules.",
    durationMins: 48,
    watchedMins: 0,
    status: "NOT_STARTED",
    thumbnailUrl: "https://images.unsplash.com/photo-1528164344705-475426879c0d?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoFileName: "japanese_hiragana_stroke_order_masterclass.mp4",
    videoFileSize: "245 MB",
    resolution: "1080p Full HD",
    instructorName: "Kenji Takahashi Sensei",
    resources: [
      { title: "JLPT N5 Hiragana Practice Grid.pdf", type: "PDF", size: "2.1 MB", downloadUrl: "#" },
      { title: "Hiragana Flashcards Deck.pptx", type: "PPT", size: "6.8 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-03",
    lsrwType: "WRITING",
    viewsCount: 412,
    lectureDate: "Oct 08, 2026",
    lectureDay: "Thursday",
    uploadedAt: "Oct 08, 2026"
  },
  {
    id: "pr-sess-04",
    subLevel: "TOPIK I Level 1",
    courseId: "crs-02",
    courseName: "Korean TOPIK I: Level 1 & Hangul Mastery",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    subjectCode: "KO-101",
    subjectName: "Korean Language: TOPIK I Level 1 & Hangul Mastery",
    languageFamily: "KOREAN",
    moduleCode: "MOD-KO-01",
    moduleName: "Module 1: Hangul Alphabet (Vowels, Consonants & Batchim)",
    sessionTitle: "Session 04: The Logic of King Sejong's Hangul & Syllable Block Building",
    topicName: "Hangul 14 Consonants, 10 Vowels & Final Batchim Phonetics",
    description: "Discover the scientific phonetic design behind Hangul consonants and vowels, and practice assembling 2-letter, 3-letter, and final consonant Batchim blocks.",
    durationMins: 52,
    watchedMins: 24,
    status: "IN_PROGRESS",
    thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    videoFileName: "korean_hangul_batchim_phonetics.mp4",
    videoFileSize: "280 MB",
    resolution: "1080p Full HD",
    instructorName: "Park Ji-Hoon Sonsaengnim",
    resources: [
      { title: "Hangul Syllable Block Formula Guide.pdf", type: "PDF", size: "3.5 MB", downloadUrl: "#" },
      { title: "Seoul Accent Audio Drills.mp3", type: "AUDIO", size: "8.2 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-04",
    lsrwType: "LISTENING",
    viewsCount: 350,
    lectureDate: "Oct 06, 2026",
    lectureDay: "Tuesday",
    uploadedAt: "Oct 06, 2026"
  },
  {
    id: "pr-sess-05",
    subLevel: "Goethe A1",
    courseId: "crs-03",
    courseName: "German A1: Goethe-Zertifikat Prep",
    batchId: "batch-2026-bca",
    batchName: "Cohort 2026–2029 (BCA Section A)",
    subjectCode: "DE-101",
    subjectName: "German Language: Goethe-Zertifikat A1 Professional",
    languageFamily: "GERMAN",
    moduleCode: "MOD-DE-01",
    moduleName: "Module 1: Hallo! Erste Schritte auf Deutsch",
    sessionTitle: "Session 05: German Articles (Der, Die, Das) & Basic Sentence Order",
    topicName: "Grammatical Gender & Nominative Sentence Syntax",
    description: "Master grammatical gender in German, definite and indefinite articles, nominative case usage, and verb-in-second-position word order.",
    durationMins: 42,
    watchedMins: 0,
    status: "NOT_STARTED",
    thumbnailUrl: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    videoFileName: "german_articles_grammar_mastery.mp4",
    videoFileSize: "215 MB",
    resolution: "1080p Full HD",
    instructorName: "Helena Schmidt",
    resources: [
      { title: "German Noun Gender Cheat Sheet.pdf", type: "PDF", size: "1.8 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-05",
    lsrwType: "READING",
    viewsCount: 220,
    lectureDate: "Oct 05, 2026",
    lectureDay: "Monday",
    uploadedAt: "Oct 05, 2026"
  },
  {
    id: "pr-sess-06",
    subLevel: "DELE A1",
    courseId: "crs-05",
    courseName: "Spanish DELE A1: Conversational Foundations",
    batchId: "batch-2026-cs",
    batchName: "Cohort 2026–2029 (Section A & B)",
    subjectCode: "ES-101",
    subjectName: "Spanish Language: DELE A1 Conversational Track",
    languageFamily: "SPANISH",
    moduleCode: "MOD-ES-01",
    moduleName: "Module 1: Saludos, Presentaciones y Vocabulario Básico",
    sessionTitle: "Session 06: Spanish Alphabet, Rolling 'R' & Essential Greetings",
    topicName: "El Alfabeto Español, Fonética y Saludos Diarios",
    description: "Learn Castilian and Latin American pronunciation guidelines, rolling double 'rr', and formal vs informal greeting formulas in Madrid.",
    durationMins: 38,
    watchedMins: 10,
    status: "IN_PROGRESS",
    thumbnailUrl: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    videoFileName: "spanish_alphabet_greetings_mastery.mp4",
    videoFileSize: "190 MB",
    resolution: "1080p Full HD",
    instructorName: "Alejandro Morales",
    resources: [
      { title: "Spanish Pronunciation Key.pdf", type: "PDF", size: "1.4 MB", downloadUrl: "#" },
      { title: "Audio Practice Drills.mp3", type: "AUDIO", size: "5.5 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-06",
    lsrwType: "SPEAKING",
    viewsCount: 195,
    lectureDate: "Oct 07, 2026",
    lectureDay: "Wednesday",
    uploadedAt: "Oct 07, 2026"
  }
];

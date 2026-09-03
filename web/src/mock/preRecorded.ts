export interface PreRecordedSession {
  id: string;
  subLevel: string;
  moduleCode: string;
  moduleName: string;
  sessionTitle: string;
  description: string;
  durationMins: number;
  watchedMins: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
  thumbnailUrl: string;
  videoUrl: string;
  resources: { title: string; type: 'PDF' | 'PPT' | 'AUDIO'; size: string; downloadUrl: string }[];
  assignmentId?: string;
  lsrwType?: 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING';
}

export const mockPreRecordedSessions: PreRecordedSession[] = [
  {
    id: "pr-sess-01",
    subLevel: "A1.1",
    moduleCode: "MOD-01",
    moduleName: "Module 1: French Accents & Phonetics Mastery",
    sessionTitle: "Session 01: Understanding French Vowels and Silent Endings (Les Voyelles et Consonnes Muettes)",
    description: "In this core pre-recorded session, master the native pronunciation rules for French vowels, nasal sounds (an, in, on), and silent final consonants (e.g., 'Paris', 'Salut').",
    durationMins: 35,
    watchedMins: 18,
    status: "IN_PROGRESS",
    thumbnailUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    resources: [
      { title: "French Vowel Pronunciation Guide Chart.pdf", type: "PDF", size: "2.4 MB", downloadUrl: "#" },
      { title: "Audio Drill Native Speaker Samples.zip", type: "AUDIO", size: "14.8 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-01",
    lsrwType: "SPEAKING"
  },
  {
    id: "pr-sess-02",
    subLevel: "A1.1",
    moduleCode: "MOD-01",
    moduleName: "Module 1: French Accents & Phonetics Mastery",
    sessionTitle: "Session 02: Accents & Special Keys (É, È, À, Ç, Œ et Tréma)",
    description: "Learn how accent marks change vowel sounds in French words, and how to type them effortlessly using the ISML Virtual Soft Accent Keyboard.",
    durationMins: 40,
    watchedMins: 40,
    status: "COMPLETED",
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    resources: [
      { title: "Virtual Accent Keyboard Layout Sheet.pdf", type: "PDF", size: "1.1 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-02",
    lsrwType: "WRITING"
  },
  {
    id: "pr-sess-03",
    subLevel: "A1.1",
    moduleCode: "MOD-02",
    moduleName: "Module 2: Essential Daily Expressions & Greetings",
    sessionTitle: "Session 03: Formal vs Informal Greetings (Bonjour, Bonsoir et Salut)",
    description: "Master the cultural nuances of formal greeting (Vous) vs informal greeting (Tu) when interacting with colleagues, professors, or friends in France.",
    durationMins: 30,
    watchedMins: 0,
    status: "NOT_STARTED",
    thumbnailUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    resources: [
      { title: "Greeting Dialogues & Phrasebook.pdf", type: "PDF", size: "3.2 MB", downloadUrl: "#" },
      { title: "Lecture Presentation Slides.ppt", type: "PPT", size: "8.5 MB", downloadUrl: "#" }
    ],
    assignmentId: "asg-03",
    lsrwType: "READING"
  }
];

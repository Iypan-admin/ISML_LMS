// ============================================================================
// ISML OFFICIAL CURRICULUM CATALOG & PEDAGOGICAL TRACKS
// Distinct Per-Language & Per-Level Dedicated Course Cards
// ============================================================================

export interface CollegeTrackOption {
  trackType: 'Standard' | 'Intensive' | 'Super-Intensive';
  minsPerSession: number;
  sessionsRequired: number;
  sessionsPerWeek: number;
  monthsToComplete: number;
}

export interface CollegeCurriculumItem {
  id: string;
  language: 'French' | 'German' | 'Spanish' | 'Korean' | 'Japanese';
  level: string;
  levelCode: string;
  courseTitle: string;
  cefrEquiv: string;
  courseDurationHours: number;
  assessmentsCount: number;
  humanSpeakingMinsPerWeek: number;
  aiSpeakingPracticePerDay: number;
  flagEmoji: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  tracks: {
    standard?: CollegeTrackOption;
    intensive?: CollegeTrackOption;
    superIntensive?: CollegeTrackOption;
  };
}

export interface SchoolCurriculumItem {
  id: string;
  language: 'French' | 'German' | 'Spanish' | 'Korean';
  level: string;
  courseTitle: string;
  courseDurationHours: number;
  assessmentsCount: number;
  humanSpeakingMinsBiWeekly: number;
  aiSpeakingPracticePerDay: number;
  flagEmoji: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  categories: {
    cat1: { minsPerPeriod: 35; periodsPerWeek: number; totalPeriods: number };
    cat2: { minsPerPeriod: 40; periodsPerWeek: number; totalPeriods: number };
    cat3: { minsPerPeriod: 45; periodsPerWeek: number; totalPeriods: number };
    cat4: { minsPerPeriod: 50; periodsPerWeek: number; totalPeriods: number };
    cat5: { minsPerPeriod: 55; periodsPerWeek: number; totalPeriods: number };
    cat6: { minsPerPeriod: 60; periodsPerWeek: number; totalPeriods: number };
  };
}

const LANG_THEMES: Record<string, { flag: string; bg: string; border: string; text: string }> = {
  French: { flag: '🇫🇷', bg: 'bg-blue-50/70', border: 'border-blue-200', text: 'text-[#0052CC]' },
  German: { flag: '🇩🇪', bg: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-800' },
  Spanish: { flag: '🇪🇸', bg: 'bg-rose-50/70', border: 'border-rose-200', text: 'text-rose-700' },
  Korean: { flag: '🇰🇷', bg: 'bg-indigo-50/70', border: 'border-indigo-200', text: 'text-indigo-700' },
  Japanese: { flag: '🇯🇵', bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-700' },
};

// 1. College Catalog: Discrete individual language & level cards
const BASE_COLLEGE_LEVELS = [
  {
    level: 'A1 / L1',
    levelCode: 'A1',
    cefrEquiv: 'Beginner Breakthrough',
    hours: 80,
    assessments: 4,
    humanSpeaking: 10,
    aiDaily: 3,
    standard: { trackType: 'Standard' as const, minsPerSession: 60, sessionsRequired: 80, sessionsPerWeek: 2, monthsToComplete: 11 },
    intensive: { trackType: 'Intensive' as const, minsPerSession: 90, sessionsRequired: 54, sessionsPerWeek: 2, monthsToComplete: 7 },
    superIntensive: { trackType: 'Super-Intensive' as const, minsPerSession: 120, sessionsRequired: 40, sessionsPerWeek: 3, monthsToComplete: 4 },
  },
  {
    level: 'A2 / L2',
    levelCode: 'A2',
    cefrEquiv: 'Elementary Stage',
    hours: 100,
    assessments: 4,
    humanSpeaking: 20,
    aiDaily: 5,
    standard: { trackType: 'Standard' as const, minsPerSession: 60, sessionsRequired: 100, sessionsPerWeek: 3, monthsToComplete: 8 },
    intensive: { trackType: 'Intensive' as const, minsPerSession: 90, sessionsRequired: 67, sessionsPerWeek: 3, monthsToComplete: 6 },
    superIntensive: { trackType: 'Super-Intensive' as const, minsPerSession: 120, sessionsRequired: 50, sessionsPerWeek: 3, monthsToComplete: 4 },
  },
  {
    level: 'B1 / L3',
    levelCode: 'B1',
    cefrEquiv: 'Intermediate Threshold',
    hours: 140,
    assessments: 5,
    humanSpeaking: 30,
    aiDaily: 7,
    standard: { trackType: 'Standard' as const, minsPerSession: 60, sessionsRequired: 140, sessionsPerWeek: 4, monthsToComplete: 8 },
    intensive: { trackType: 'Intensive' as const, minsPerSession: 90, sessionsRequired: 94, sessionsPerWeek: 4, monthsToComplete: 6 },
    superIntensive: { trackType: 'Super-Intensive' as const, minsPerSession: 120, sessionsRequired: 70, sessionsPerWeek: 4, monthsToComplete: 4 },
  },
  {
    level: 'B2 / L4',
    levelCode: 'B2',
    cefrEquiv: 'Vantage Professional',
    hours: 180,
    assessments: 5,
    humanSpeaking: 40,
    aiDaily: 10,
    standard: { trackType: 'Standard' as const, minsPerSession: 60, sessionsRequired: 180, sessionsPerWeek: 5, monthsToComplete: 9 },
    intensive: { trackType: 'Intensive' as const, minsPerSession: 90, sessionsRequired: 120, sessionsPerWeek: 5, monthsToComplete: 6 },
    superIntensive: { trackType: 'Super-Intensive' as const, minsPerSession: 120, sessionsRequired: 90, sessionsPerWeek: 5, monthsToComplete: 5 },
  },
];

const JAPANESE_COLLEGE_LEVELS = [
  {
    level: 'N5',
    levelCode: 'N5',
    cefrEquiv: 'JLPT N5 Basic Kana & Kanji',
    hours: 100,
    assessments: 5,
    humanSpeaking: 10,
    aiDaily: 3,
    standard: undefined,
    intensive: { trackType: 'Intensive' as const, minsPerSession: 90, sessionsRequired: 67, sessionsPerWeek: 2, monthsToComplete: 8 },
    superIntensive: { trackType: 'Super-Intensive' as const, minsPerSession: 120, sessionsRequired: 50, sessionsPerWeek: 3, monthsToComplete: 4 },
  },
  {
    level: 'N4',
    levelCode: 'N4',
    cefrEquiv: 'JLPT N4 Elementary Conversation',
    hours: 120,
    assessments: 5,
    humanSpeaking: 20,
    aiDaily: 5,
    standard: { trackType: 'Standard' as const, minsPerSession: 60, sessionsRequired: 120, sessionsPerWeek: 3, monthsToComplete: 10 },
    intensive: { trackType: 'Intensive' as const, minsPerSession: 90, sessionsRequired: 80, sessionsPerWeek: 3, monthsToComplete: 7 },
    superIntensive: { trackType: 'Super-Intensive' as const, minsPerSession: 120, sessionsRequired: 60, sessionsPerWeek: 3, monthsToComplete: 5 },
  },
  {
    level: 'N3',
    levelCode: 'N3',
    cefrEquiv: 'JLPT N3 Intermediate Bridge',
    hours: 160,
    assessments: 6,
    humanSpeaking: 30,
    aiDaily: 7,
    standard: { trackType: 'Standard' as const, minsPerSession: 60, sessionsRequired: 160, sessionsPerWeek: 4, monthsToComplete: 10 },
    intensive: { trackType: 'Intensive' as const, minsPerSession: 90, sessionsRequired: 107, sessionsPerWeek: 4, monthsToComplete: 7 },
    superIntensive: { trackType: 'Super-Intensive' as const, minsPerSession: 120, sessionsRequired: 80, sessionsPerWeek: 4, monthsToComplete: 5 },
  },
  {
    level: 'N2',
    levelCode: 'N2',
    cefrEquiv: 'JLPT N2 Business Professional',
    hours: 200,
    assessments: 6,
    humanSpeaking: 40,
    aiDaily: 10,
    standard: { trackType: 'Standard' as const, minsPerSession: 60, sessionsRequired: 200, sessionsPerWeek: 5, monthsToComplete: 10 },
    intensive: { trackType: 'Intensive' as const, minsPerSession: 90, sessionsRequired: 134, sessionsPerWeek: 5, monthsToComplete: 7 },
    superIntensive: { trackType: 'Super-Intensive' as const, minsPerSession: 120, sessionsRequired: 100, sessionsPerWeek: 5, monthsToComplete: 5 },
  },
];

export const COLLEGE_CURRICULUM_CATALOG: CollegeCurriculumItem[] = [
  ...(['French', 'German', 'Spanish', 'Korean'] as const).flatMap((lang) =>
    BASE_COLLEGE_LEVELS.map((lvl) => ({
      id: `col-${lang.toLowerCase()}-${lvl.levelCode.toLowerCase()}`,
      language: lang,
      level: lvl.level,
      levelCode: lvl.levelCode,
      courseTitle: `${lang} ${lvl.levelCode} Certification`,
      cefrEquiv: lvl.cefrEquiv,
      courseDurationHours: lvl.hours,
      assessmentsCount: lvl.assessments,
      humanSpeakingMinsPerWeek: lvl.humanSpeaking,
      aiSpeakingPracticePerDay: lvl.aiDaily,
      flagEmoji: LANG_THEMES[lang].flag,
      accentBg: LANG_THEMES[lang].bg,
      accentBorder: LANG_THEMES[lang].border,
      accentText: LANG_THEMES[lang].text,
      tracks: {
        standard: lvl.standard,
        intensive: lvl.intensive,
        superIntensive: lvl.superIntensive,
      },
    }))
  ),
  ...JAPANESE_COLLEGE_LEVELS.map((lvl) => ({
    id: `col-japanese-${lvl.levelCode.toLowerCase()}`,
    language: 'Japanese' as const,
    level: lvl.level,
    levelCode: lvl.levelCode,
    courseTitle: `Japanese ${lvl.levelCode} JLPT Prep`,
    cefrEquiv: lvl.cefrEquiv,
    courseDurationHours: lvl.hours,
    assessmentsCount: lvl.assessments,
    humanSpeakingMinsPerWeek: lvl.humanSpeaking,
    aiSpeakingPracticePerDay: lvl.aiDaily,
    flagEmoji: LANG_THEMES.Japanese.flag,
    accentBg: LANG_THEMES.Japanese.bg,
    accentBorder: LANG_THEMES.Japanese.border,
    accentText: LANG_THEMES.Japanese.text,
    tracks: {
      standard: lvl.standard,
      intensive: lvl.intensive,
      superIntensive: lvl.superIntensive,
    },
  })),
];

// 2. School Catalog: Discrete individual language & level cards
const BASE_SCHOOL_LEVELS = [
  {
    level: 'A1.1',
    hours: 60,
    assessments: 4,
    humanSpeaking: 10,
    aiDaily: 2,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 3, totalPeriods: 103 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 3, totalPeriods: 90 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 3, totalPeriods: 80 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 3, totalPeriods: 72 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 2, totalPeriods: 70 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 2, totalPeriods: 70 },
    },
  },
  {
    level: 'A1.2',
    hours: 60,
    assessments: 4,
    humanSpeaking: 10,
    aiDaily: 2,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 3, totalPeriods: 103 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 3, totalPeriods: 90 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 3, totalPeriods: 80 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 3, totalPeriods: 72 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 2, totalPeriods: 70 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 2, totalPeriods: 70 },
    },
  },
  {
    level: 'A2.1',
    hours: 80,
    assessments: 5,
    humanSpeaking: 15,
    aiDaily: 3,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 4, totalPeriods: 138 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 4, totalPeriods: 120 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 3, totalPeriods: 107 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 3, totalPeriods: 96 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 3, totalPeriods: 105 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    level: 'A2.2',
    hours: 80,
    assessments: 5,
    humanSpeaking: 15,
    aiDaily: 3,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 4, totalPeriods: 138 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 4, totalPeriods: 120 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 3, totalPeriods: 107 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 3, totalPeriods: 96 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 3, totalPeriods: 105 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    level: 'A2.3',
    hours: 80,
    assessments: 5,
    humanSpeaking: 15,
    aiDaily: 3,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 4, totalPeriods: 138 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 4, totalPeriods: 120 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 3, totalPeriods: 107 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 3, totalPeriods: 96 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 3, totalPeriods: 105 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    level: 'B1.1',
    hours: 100,
    assessments: 6,
    humanSpeaking: 20,
    aiDaily: 4,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 5, totalPeriods: 172 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 4, totalPeriods: 150 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 4, totalPeriods: 134 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 4, totalPeriods: 120 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 4, totalPeriods: 140 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    level: 'B1.2',
    hours: 100,
    assessments: 6,
    humanSpeaking: 20,
    aiDaily: 4,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 5, totalPeriods: 172 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 4, totalPeriods: 150 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 4, totalPeriods: 134 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 4, totalPeriods: 120 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 4, totalPeriods: 140 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    level: 'B1.3',
    hours: 100,
    assessments: 6,
    humanSpeaking: 20,
    aiDaily: 4,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 5, totalPeriods: 172 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 4, totalPeriods: 150 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 4, totalPeriods: 134 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 4, totalPeriods: 120 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 4, totalPeriods: 140 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    level: 'B1.4',
    hours: 100,
    assessments: 6,
    humanSpeaking: 20,
    aiDaily: 4,
    categories: {
      cat1: { minsPerPeriod: 35, periodsPerWeek: 5, totalPeriods: 172 },
      cat2: { minsPerPeriod: 40, periodsPerWeek: 4, totalPeriods: 150 },
      cat3: { minsPerPeriod: 45, periodsPerWeek: 4, totalPeriods: 134 },
      cat4: { minsPerPeriod: 50, periodsPerWeek: 4, totalPeriods: 120 },
      cat5: { minsPerPeriod: 55, periodsPerWeek: 4, totalPeriods: 140 },
      cat6: { minsPerPeriod: 60, periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
];

export const SCHOOL_CURRICULUM_CATALOG: SchoolCurriculumItem[] = (
  ['French', 'German', 'Spanish', 'Korean'] as const
).flatMap((lang) =>
  BASE_SCHOOL_LEVELS.map((lvl) => ({
    id: `sch-${lang.toLowerCase()}-${lvl.level.replace('.', '')}`,
    language: lang,
    level: lvl.level,
    courseTitle: `${lang} Junior Immersion • Level ${lvl.level}`,
    courseDurationHours: lvl.hours,
    assessmentsCount: lvl.assessments,
    humanSpeakingMinsBiWeekly: lvl.humanSpeaking,
    aiSpeakingPracticePerDay: lvl.aiDaily,
    flagEmoji: LANG_THEMES[lang].flag,
    accentBg: LANG_THEMES[lang].bg,
    accentBorder: LANG_THEMES[lang].border,
    accentText: LANG_THEMES[lang].text,
    categories: lvl.categories,
  }))
);

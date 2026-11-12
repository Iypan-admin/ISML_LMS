// ============================================================================
// ISML CURRICULUM STANDARDS: SCHOOLS (PERIOD CATEGORIES) & COLLEGES (PACING TRACKS)
// ============================================================================

export interface SchoolCurriculumLevel {
  levelCode: string; // e.g. A1.1, A1.2, A2.1, A2.2, A2.3, B1.1, B1.2, B1.3, B1.4
  languages: string[]; // French, German, Spanish, Korean
  durationHours: number;
  assessmentsCount: number;
  speakingMinsPer2Weeks: number;
  aiSpeakingPerDay: number;
  categories: {
    cat1: { name: 'Cat 1 (35 min/period)'; periodsPerWeek: number; totalPeriods: number };
    cat2: { name: 'Cat 2 (40 min/period)'; periodsPerWeek: number; totalPeriods: number };
    cat3: { name: 'Cat 3 (45 min/period)'; periodsPerWeek: number; totalPeriods: number };
    cat4: { name: 'Cat 4 (50 min/period)'; periodsPerWeek: number; totalPeriods: number };
    cat5: { name: 'Cat 5 (55 min/period)'; periodsPerWeek: number; totalPeriods: number };
    cat6: { name: 'Cat 6 (60 min/period)'; periodsPerWeek: number; totalPeriods: number };
  };
}

export const SCHOOL_CURRICULUM_DATA: SchoolCurriculumLevel[] = [
  {
    levelCode: 'A1.1',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 60,
    assessmentsCount: 4,
    speakingMinsPer2Weeks: 10,
    aiSpeakingPerDay: 2,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 3, totalPeriods: 103 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 3, totalPeriods: 90 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 3, totalPeriods: 80 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 3, totalPeriods: 72 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 2, totalPeriods: 70 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 2, totalPeriods: 70 },
    },
  },
  {
    levelCode: 'A1.2',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 60,
    assessmentsCount: 4,
    speakingMinsPer2Weeks: 10,
    aiSpeakingPerDay: 2,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 3, totalPeriods: 103 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 3, totalPeriods: 90 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 3, totalPeriods: 80 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 3, totalPeriods: 72 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 2, totalPeriods: 70 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 2, totalPeriods: 70 },
    },
  },
  {
    levelCode: 'A2.1',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 80,
    assessmentsCount: 5,
    speakingMinsPer2Weeks: 15,
    aiSpeakingPerDay: 3,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 4, totalPeriods: 138 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 4, totalPeriods: 120 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 3, totalPeriods: 107 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 3, totalPeriods: 96 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    levelCode: 'A2.2',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 80,
    assessmentsCount: 5,
    speakingMinsPer2Weeks: 15,
    aiSpeakingPerDay: 3,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 4, totalPeriods: 138 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 4, totalPeriods: 120 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 3, totalPeriods: 107 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 3, totalPeriods: 96 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    levelCode: 'A2.3',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 80,
    assessmentsCount: 5,
    speakingMinsPer2Weeks: 15,
    aiSpeakingPerDay: 3,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 4, totalPeriods: 138 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 4, totalPeriods: 120 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 3, totalPeriods: 107 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 3, totalPeriods: 96 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    levelCode: 'B1.1',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 100,
    assessmentsCount: 6,
    speakingMinsPer2Weeks: 20,
    aiSpeakingPerDay: 4,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 5, totalPeriods: 172 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 4, totalPeriods: 150 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 4, totalPeriods: 134 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 4, totalPeriods: 120 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 4, totalPeriods: 140 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    levelCode: 'B1.2',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 100,
    assessmentsCount: 6,
    speakingMinsPer2Weeks: 20,
    aiSpeakingPerDay: 4,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 5, totalPeriods: 172 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 4, totalPeriods: 150 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 4, totalPeriods: 134 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 4, totalPeriods: 120 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 4, totalPeriods: 140 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    levelCode: 'B1.3',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 100,
    assessmentsCount: 6,
    speakingMinsPer2Weeks: 20,
    aiSpeakingPerDay: 4,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 5, totalPeriods: 172 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 4, totalPeriods: 150 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 4, totalPeriods: 134 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 4, totalPeriods: 120 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 4, totalPeriods: 140 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
  {
    levelCode: 'B1.4',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    durationHours: 100,
    assessmentsCount: 6,
    speakingMinsPer2Weeks: 20,
    aiSpeakingPerDay: 4,
    categories: {
      cat1: { name: 'Cat 1 (35 min/period)', periodsPerWeek: 5, totalPeriods: 172 },
      cat2: { name: 'Cat 2 (40 min/period)', periodsPerWeek: 4, totalPeriods: 150 },
      cat3: { name: 'Cat 3 (45 min/period)', periodsPerWeek: 4, totalPeriods: 134 },
      cat4: { name: 'Cat 4 (50 min/period)', periodsPerWeek: 4, totalPeriods: 120 },
      cat5: { name: 'Cat 5 (55 min/period)', periodsPerWeek: 4, totalPeriods: 140 },
      cat6: { name: 'Cat 6 (60 min/period)', periodsPerWeek: 3, totalPeriods: 105 },
    },
  },
];

export interface CollegePacingTrackMetrics {
  minsPerSession: number;
  sessionsRequired: number;
  sessionsPerWeek: number;
  monthsRequired: number;
}

export interface CollegeCurriculumLevel {
  languageGroup: string; // "French / German / Spanish / Korean" | "Japanese"
  languages: string[];
  levelCode: string; // e.g. "A1 / L1", "A2 / L2", "B1 / L3", "B2 / L4", "N5", "N4", "N3", "N2"
  durationHours: number;
  assessmentsCount: number;
  speakingMinsPerWeek: number;
  aiSpeakingPerDay: number;
  standard?: CollegePacingTrackMetrics;
  intensive?: CollegePacingTrackMetrics;
  superIntensive?: CollegePacingTrackMetrics;
}

export const COLLEGE_CURRICULUM_DATA: CollegeCurriculumLevel[] = [
  {
    languageGroup: 'French / German / Spanish / Korean',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    levelCode: 'A1 / L1',
    durationHours: 80,
    assessmentsCount: 4,
    speakingMinsPerWeek: 10,
    aiSpeakingPerDay: 3,
    standard: { minsPerSession: 60, sessionsRequired: 80, sessionsPerWeek: 2, monthsRequired: 11 },
    intensive: { minsPerSession: 90, sessionsRequired: 54, sessionsPerWeek: 2, monthsRequired: 7 },
    superIntensive: { minsPerSession: 120, sessionsRequired: 40, sessionsPerWeek: 2, monthsRequired: 5 },
  },
  {
    languageGroup: 'French / German / Spanish / Korean',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    levelCode: 'A2 / L2',
    durationHours: 100,
    assessmentsCount: 4,
    speakingMinsPerWeek: 20,
    aiSpeakingPerDay: 5,
    standard: { minsPerSession: 60, sessionsRequired: 100, sessionsPerWeek: 3, monthsRequired: 8 },
    intensive: { minsPerSession: 90, sessionsRequired: 67, sessionsPerWeek: 3, monthsRequired: 6 },
    superIntensive: { minsPerSession: 120, sessionsRequired: 50, sessionsPerWeek: 3, monthsRequired: 4 },
  },
  {
    languageGroup: 'French / German / Spanish / Korean',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    levelCode: 'B1 / L3',
    durationHours: 140,
    assessmentsCount: 5,
    speakingMinsPerWeek: 30,
    aiSpeakingPerDay: 7,
    standard: { minsPerSession: 60, sessionsRequired: 140, sessionsPerWeek: 4, monthsRequired: 8 },
    intensive: { minsPerSession: 90, sessionsRequired: 94, sessionsPerWeek: 4, monthsRequired: 6 },
    superIntensive: { minsPerSession: 120, sessionsRequired: 70, sessionsPerWeek: 4, monthsRequired: 4 },
  },
  {
    languageGroup: 'French / German / Spanish / Korean',
    languages: ['French', 'German', 'Spanish', 'Korean'],
    levelCode: 'B2 / L4',
    durationHours: 180,
    assessmentsCount: 5,
    speakingMinsPerWeek: 40,
    aiSpeakingPerDay: 10,
    standard: { minsPerSession: 60, sessionsRequired: 180, sessionsPerWeek: 5, monthsRequired: 9 },
    intensive: { minsPerSession: 90, sessionsRequired: 120, sessionsPerWeek: 5, monthsRequired: 6 },
    superIntensive: { minsPerSession: 120, sessionsRequired: 90, sessionsPerWeek: 5, monthsRequired: 5 },
  },
  {
    languageGroup: 'Japanese',
    languages: ['Japanese'],
    levelCode: 'N5',
    durationHours: 100,
    assessmentsCount: 5,
    speakingMinsPerWeek: 10,
    aiSpeakingPerDay: 3,
    standard: { minsPerSession: 60, sessionsRequired: 100, sessionsPerWeek: 2, monthsRequired: 12 },
    intensive: { minsPerSession: 90, sessionsRequired: 67, sessionsPerWeek: 2, monthsRequired: 8 },
    superIntensive: { minsPerSession: 120, sessionsRequired: 50, sessionsPerWeek: 3, monthsRequired: 4 },
  },
  {
    languageGroup: 'Japanese',
    languages: ['Japanese'],
    levelCode: 'N4',
    durationHours: 120,
    assessmentsCount: 5,
    speakingMinsPerWeek: 20,
    aiSpeakingPerDay: 5,
    standard: { minsPerSession: 60, sessionsRequired: 120, sessionsPerWeek: 3, monthsRequired: 10 },
    intensive: { minsPerSession: 90, sessionsRequired: 80, sessionsPerWeek: 3, monthsRequired: 7 },
    superIntensive: { minsPerSession: 120, sessionsRequired: 60, sessionsPerWeek: 3, monthsRequired: 5 },
  },
  {
    languageGroup: 'Japanese',
    languages: ['Japanese'],
    levelCode: 'N3',
    durationHours: 160,
    assessmentsCount: 6,
    speakingMinsPerWeek: 30,
    aiSpeakingPerDay: 7,
    standard: { minsPerSession: 60, sessionsRequired: 160, sessionsPerWeek: 4, monthsRequired: 10 },
    intensive: { minsPerSession: 90, sessionsRequired: 107, sessionsPerWeek: 4, monthsRequired: 7 },
    superIntensive: { minsPerSession: 120, sessionsRequired: 80, sessionsPerWeek: 4, monthsRequired: 5 },
  },
  {
    languageGroup: 'Japanese',
    languages: ['Japanese'],
    levelCode: 'N2',
    durationHours: 200,
    assessmentsCount: 6,
    speakingMinsPerWeek: 40,
    aiSpeakingPerDay: 10,
    standard: { minsPerSession: 60, sessionsRequired: 200, sessionsPerWeek: 5, monthsRequired: 10 },
    intensive: { minsPerSession: 90, sessionsRequired: 134, sessionsPerWeek: 5, monthsRequired: 7 },
    superIntensive: { minsPerSession: 120, sessionsRequired: 100, sessionsPerWeek: 5, monthsRequired: 5 },
  },
];


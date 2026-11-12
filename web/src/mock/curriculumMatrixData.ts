// ============================================================================
// ISML COLLEGE LMS — MASTER CURRICULUM PERIOD & PACING MATRIX
// Dynamic Matrix Types & Helper Accessors
// ============================================================================

export type LanguageCode = 'FRENCH' | 'GERMAN' | 'SPANISH' | 'KOREAN' | 'JAPANESE';
export type CefrSubLevel = 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2' | 'B1.1' | 'B1.2' | 'B1.3' | 'B1.4';
export type PeriodCategoryKey = 'CAT_1_35M' | 'CAT_2_40M' | 'CAT_3_45M' | 'CAT_4_50M' | 'CAT_5_55M' | 'CAT_6_60M';

export interface PeriodCategoryLevelMetrics {
  category: PeriodCategoryKey;
  minutesPerPeriod: number;
  periodsPerWeek: number;
  totalPeriods: number;
  monthsToComplete: number;
}

export interface LevelPeriodMatrixItem {
  languages: ('FRENCH' | 'GERMAN' | 'SPANISH' | 'KOREAN')[];
  level: CefrSubLevel;
  courseDurationHours: number;
  assessmentsBeforeFinalExam: number;
  humanSpeakingMinutesPerSession: number;
  humanSpeakingFrequencyDescription: string;
  aiSpeakingPracticePerDay: number;
  periodCategories: Record<PeriodCategoryKey, PeriodCategoryLevelMetrics>;
}

export const LEVEL_PERIOD_MATRIX: LevelPeriodMatrixItem[] = [];

export type CoursePacingTrack = 'STANDARD' | 'INTENSIVE' | 'SUPER_INTENSIVE';

export interface PacingTrackMetrics {
  minutesPerSession?: number;
  sessionsRequiredForCompletion?: number;
  sessionsPerWeek?: number;
  monthsRequiredForCompletion?: number;
}

export interface PacingLevelMatrixItem {
  languages: LanguageCode[];
  levelCode: string;
  levelLabel: string;
  courseDurationHours: number;
  assessmentsBeforeFinalExam: number;
  humanSpeakingMinutesPerWeek: number;
  aiSpeakingPracticePerDay: number;
  standard?: PacingTrackMetrics;
  intensive?: PacingTrackMetrics;
  superIntensive?: PacingTrackMetrics;
}

export const PACING_LEVEL_MATRIX: PacingLevelMatrixItem[] = [];

export function getLevelPeriodMatrix(level: CefrSubLevel): LevelPeriodMatrixItem | undefined {
  return LEVEL_PERIOD_MATRIX.find(m => m.level === level);
}

export function getPacingMetrics(levelCode: string, track: CoursePacingTrack): PacingTrackMetrics | undefined {
  const item = PACING_LEVEL_MATRIX.find(
    m => m.levelCode.toLowerCase() === levelCode.toLowerCase() || m.levelCode.includes(levelCode)
  );
  if (!item) return undefined;
  if (track === 'STANDARD') return item.standard;
  if (track === 'INTENSIVE') return item.intensive;
  if (track === 'SUPER_INTENSIVE') return item.superIntensive;
  return undefined;
}

export const PERIOD_CATEGORIES: Array<{ key: PeriodCategoryKey; name: string; minutes: number }> = [
  { key: 'CAT_1_35M', name: 'Category 1 (35 mins)', minutes: 35 },
  { key: 'CAT_2_40M', name: 'Category 2 (40 mins)', minutes: 40 },
  { key: 'CAT_3_45M', name: 'Category 3 (45 mins)', minutes: 45 },
  { key: 'CAT_4_50M', name: 'Category 4 (50 mins)', minutes: 50 },
  { key: 'CAT_5_55M', name: 'Category 5 (55 mins)', minutes: 55 },
  { key: 'CAT_6_60M', name: 'Category 6 (60 mins)', minutes: 60 },
];

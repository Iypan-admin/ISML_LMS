import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCurriculumMatrices() {
  console.log('🌱 Seeding Schools & Colleges Curriculum Matrices into Supabase...');

  // 1. School Curriculum Matrix Data
  const schoolRows = [
    {
      levelCode: 'A1.1',
      cefrSubLevel: 'A1_1' as const,
      durationHours: 60,
      assessmentsCount: 4,
      humanSpeakingMinutesPer2Wk: 10,
      aiSpeakingTimesPerDay: 2,
      cat1PeriodsPerWeek: 3, cat1TotalPeriods: 103,
      cat2PeriodsPerWeek: 3, cat2TotalPeriods: 90,
      cat3PeriodsPerWeek: 3, cat3TotalPeriods: 80,
      cat4PeriodsPerWeek: 3, cat4TotalPeriods: 72,
      cat5PeriodsPerWeek: 2, cat5TotalPeriods: 70,
      cat6PeriodsPerWeek: 2, cat6TotalPeriods: 70,
    },
    {
      levelCode: 'A1.2',
      cefrSubLevel: 'A1_2' as const,
      durationHours: 60,
      assessmentsCount: 4,
      humanSpeakingMinutesPer2Wk: 10,
      aiSpeakingTimesPerDay: 2,
      cat1PeriodsPerWeek: 3, cat1TotalPeriods: 103,
      cat2PeriodsPerWeek: 3, cat2TotalPeriods: 90,
      cat3PeriodsPerWeek: 3, cat3TotalPeriods: 80,
      cat4PeriodsPerWeek: 3, cat4TotalPeriods: 72,
      cat5PeriodsPerWeek: 2, cat5TotalPeriods: 70,
      cat6PeriodsPerWeek: 2, cat6TotalPeriods: 70,
    },
    {
      levelCode: 'A2.1',
      cefrSubLevel: 'A2_1' as const,
      durationHours: 80,
      assessmentsCount: 5,
      humanSpeakingMinutesPer2Wk: 15,
      aiSpeakingTimesPerDay: 3,
      cat1PeriodsPerWeek: 4, cat1TotalPeriods: 138,
      cat2PeriodsPerWeek: 4, cat2TotalPeriods: 120,
      cat3PeriodsPerWeek: 3, cat3TotalPeriods: 107,
      cat4PeriodsPerWeek: 3, cat4TotalPeriods: 96,
      cat5PeriodsPerWeek: 3, cat5TotalPeriods: 105,
      cat6PeriodsPerWeek: 3, cat6TotalPeriods: 105,
    },
    {
      levelCode: 'A2.2',
      cefrSubLevel: 'A2_2' as const,
      durationHours: 80,
      assessmentsCount: 5,
      humanSpeakingMinutesPer2Wk: 15,
      aiSpeakingTimesPerDay: 3,
      cat1PeriodsPerWeek: 4, cat1TotalPeriods: 138,
      cat2PeriodsPerWeek: 4, cat2TotalPeriods: 120,
      cat3PeriodsPerWeek: 3, cat3TotalPeriods: 107,
      cat4PeriodsPerWeek: 3, cat4TotalPeriods: 96,
      cat5PeriodsPerWeek: 3, cat5TotalPeriods: 105,
      cat6PeriodsPerWeek: 3, cat6TotalPeriods: 105,
    },
    {
      levelCode: 'A2.3',
      cefrSubLevel: 'A2_3' as const,
      durationHours: 80,
      assessmentsCount: 5,
      humanSpeakingMinutesPer2Wk: 15,
      aiSpeakingTimesPerDay: 3,
      cat1PeriodsPerWeek: 4, cat1TotalPeriods: 138,
      cat2PeriodsPerWeek: 4, cat2TotalPeriods: 120,
      cat3PeriodsPerWeek: 3, cat3TotalPeriods: 107,
      cat4PeriodsPerWeek: 3, cat4TotalPeriods: 96,
      cat5PeriodsPerWeek: 3, cat5TotalPeriods: 105,
      cat6PeriodsPerWeek: 3, cat6TotalPeriods: 105,
    },
    {
      levelCode: 'B1.1',
      cefrSubLevel: 'B1_1' as const,
      durationHours: 100,
      assessmentsCount: 6,
      humanSpeakingMinutesPer2Wk: 20,
      aiSpeakingTimesPerDay: 4,
      cat1PeriodsPerWeek: 5, cat1TotalPeriods: 172,
      cat2PeriodsPerWeek: 4, cat2TotalPeriods: 150,
      cat3PeriodsPerWeek: 4, cat3TotalPeriods: 134,
      cat4PeriodsPerWeek: 4, cat4TotalPeriods: 120,
      cat5PeriodsPerWeek: 4, cat5TotalPeriods: 140,
      cat6PeriodsPerWeek: 3, cat6TotalPeriods: 105,
    },
    {
      levelCode: 'B1.2',
      cefrSubLevel: 'B1_2' as const,
      durationHours: 100,
      assessmentsCount: 6,
      humanSpeakingMinutesPer2Wk: 20,
      aiSpeakingTimesPerDay: 4,
      cat1PeriodsPerWeek: 5, cat1TotalPeriods: 172,
      cat2PeriodsPerWeek: 4, cat2TotalPeriods: 150,
      cat3PeriodsPerWeek: 4, cat3TotalPeriods: 134,
      cat4PeriodsPerWeek: 4, cat4TotalPeriods: 120,
      cat5PeriodsPerWeek: 4, cat5TotalPeriods: 140,
      cat6PeriodsPerWeek: 3, cat6TotalPeriods: 105,
    },
    {
      levelCode: 'B1.3',
      cefrSubLevel: 'B1_3' as const,
      durationHours: 100,
      assessmentsCount: 6,
      humanSpeakingMinutesPer2Wk: 20,
      aiSpeakingTimesPerDay: 4,
      cat1PeriodsPerWeek: 5, cat1TotalPeriods: 172,
      cat2PeriodsPerWeek: 4, cat2TotalPeriods: 150,
      cat3PeriodsPerWeek: 4, cat3TotalPeriods: 134,
      cat4PeriodsPerWeek: 4, cat4TotalPeriods: 120,
      cat5PeriodsPerWeek: 4, cat5TotalPeriods: 140,
      cat6PeriodsPerWeek: 3, cat6TotalPeriods: 105,
    },
    {
      levelCode: 'B1.4',
      cefrSubLevel: 'B1_4' as const,
      durationHours: 100,
      assessmentsCount: 6,
      humanSpeakingMinutesPer2Wk: 20,
      aiSpeakingTimesPerDay: 4,
      cat1PeriodsPerWeek: 5, cat1TotalPeriods: 172,
      cat2PeriodsPerWeek: 4, cat2TotalPeriods: 150,
      cat3PeriodsPerWeek: 4, cat3TotalPeriods: 134,
      cat4PeriodsPerWeek: 4, cat4TotalPeriods: 120,
      cat5PeriodsPerWeek: 4, cat5TotalPeriods: 140,
      cat6PeriodsPerWeek: 3, cat6TotalPeriods: 105,
    },
  ];

  for (const row of schoolRows) {
    await prisma.schoolCurriculumMatrix.upsert({
      where: { levelCode: row.levelCode },
      update: row,
      create: row,
    });
  }
  console.log(`✅ Seeded ${schoolRows.length} School Curriculum rows.`);

  // 2. College Pacing Matrix Data
  const collegeRows = [
    {
      languageGroup: 'French / German / Spanish / Korean',
      levelCode: 'A1 / L1',
      cefrSubLevel: 'A1_L1' as const,
      durationHours: 80,
      assessmentsCount: 4,
      humanSpeakingMinutesPerWk: 10,
      aiSpeakingTimesPerDay: 3,
      stdMinsPerSession: 60, stdTotalSessions: 80, stdSessionsPerWeek: 2, stdMonthsRequired: 11,
      intMinsPerSession: 90, intTotalSessions: 54, intSessionsPerWeek: 2, intMonthsRequired: 7,
      supMinsPerSession: 120, supTotalSessions: null, supSessionsPerWeek: null, supMonthsRequired: null,
    },
    {
      languageGroup: 'French / German / Spanish / Korean',
      levelCode: 'A2 / L2',
      cefrSubLevel: 'A2_L2' as const,
      durationHours: 100,
      assessmentsCount: 4,
      humanSpeakingMinutesPerWk: 20,
      aiSpeakingTimesPerDay: 5,
      stdMinsPerSession: 60, stdTotalSessions: 100, stdSessionsPerWeek: 3, stdMonthsRequired: 8,
      intMinsPerSession: 90, intTotalSessions: 67, intSessionsPerWeek: 3, intMonthsRequired: 6,
      supMinsPerSession: 120, supTotalSessions: 50, supSessionsPerWeek: 3, supMonthsRequired: 4,
    },
    {
      languageGroup: 'French / German / Spanish / Korean',
      levelCode: 'B1 / L3',
      cefrSubLevel: 'B1_L3' as const,
      durationHours: 140,
      assessmentsCount: 5,
      humanSpeakingMinutesPerWk: 30,
      aiSpeakingTimesPerDay: 7,
      stdMinsPerSession: 60, stdTotalSessions: 140, stdSessionsPerWeek: 4, stdMonthsRequired: 8,
      intMinsPerSession: 90, intTotalSessions: 94, intSessionsPerWeek: 4, intMonthsRequired: 6,
      supMinsPerSession: 120, supTotalSessions: 70, supSessionsPerWeek: 4, supMonthsRequired: 4,
    },
    {
      languageGroup: 'French / German / Spanish / Korean',
      levelCode: 'B2 / L4',
      cefrSubLevel: 'B2_L4' as const,
      durationHours: 180,
      assessmentsCount: 5,
      humanSpeakingMinutesPerWk: 40,
      aiSpeakingTimesPerDay: 10,
      stdMinsPerSession: 60, stdTotalSessions: 180, stdSessionsPerWeek: 5, stdMonthsRequired: 9,
      intMinsPerSession: 90, intTotalSessions: 120, intSessionsPerWeek: 5, intMonthsRequired: 6,
      supMinsPerSession: 120, supTotalSessions: 90, supSessionsPerWeek: 5, supMonthsRequired: 5,
    },
    {
      languageGroup: 'Japanese',
      levelCode: 'N5',
      cefrSubLevel: 'JLPT_N5' as const,
      durationHours: 100,
      assessmentsCount: 5,
      humanSpeakingMinutesPerWk: 10,
      aiSpeakingTimesPerDay: 3,
      stdMinsPerSession: 60, stdTotalSessions: null, stdSessionsPerWeek: null, stdMonthsRequired: null,
      intMinsPerSession: 90, intTotalSessions: 67, intSessionsPerWeek: 2, intMonthsRequired: 8,
      supMinsPerSession: 120, supTotalSessions: 50, supSessionsPerWeek: 3, supMonthsRequired: 4,
    },
    {
      languageGroup: 'Japanese',
      levelCode: 'N4',
      cefrSubLevel: 'JLPT_N4' as const,
      durationHours: 120,
      assessmentsCount: 5,
      humanSpeakingMinutesPerWk: 20,
      aiSpeakingTimesPerDay: 5,
      stdMinsPerSession: 60, stdTotalSessions: 120, stdSessionsPerWeek: 3, stdMonthsRequired: 10,
      intMinsPerSession: 90, intTotalSessions: 80, intSessionsPerWeek: 3, intMonthsRequired: 7,
      supMinsPerSession: 120, supTotalSessions: 60, supSessionsPerWeek: 3, supMonthsRequired: 5,
    },
    {
      languageGroup: 'Japanese',
      levelCode: 'N3',
      cefrSubLevel: 'JLPT_N3' as const,
      durationHours: 160,
      assessmentsCount: 6,
      humanSpeakingMinutesPerWk: 30,
      aiSpeakingTimesPerDay: 7,
      stdMinsPerSession: 60, stdTotalSessions: 160, stdSessionsPerWeek: 4, stdMonthsRequired: 10,
      intMinsPerSession: 90, intTotalSessions: 107, intSessionsPerWeek: 4, intMonthsRequired: 7,
      supMinsPerSession: 120, supTotalSessions: 80, supSessionsPerWeek: 4, supMonthsRequired: 5,
    },
    {
      languageGroup: 'Japanese',
      levelCode: 'N2',
      cefrSubLevel: 'JLPT_N2' as const,
      durationHours: 200,
      assessmentsCount: 6,
      humanSpeakingMinutesPerWk: 40,
      aiSpeakingTimesPerDay: 10,
      stdMinsPerSession: 60, stdTotalSessions: 200, stdSessionsPerWeek: 5, stdMonthsRequired: 10,
      intMinsPerSession: 90, intTotalSessions: 134, intSessionsPerWeek: 5, intMonthsRequired: 7,
      supMinsPerSession: 120, supTotalSessions: 100, supSessionsPerWeek: 5, supMonthsRequired: 5,
    },
  ];

  for (const row of collegeRows) {
    await prisma.collegePacingMatrix.upsert({
      where: { levelCode: row.levelCode },
      update: row,
      create: row,
    });
  }
  console.log(`✅ Seeded ${collegeRows.length} College Pacing rows.`);
}

seedCurriculumMatrices()
  .catch((e) => {
    console.error('Error seeding matrices:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

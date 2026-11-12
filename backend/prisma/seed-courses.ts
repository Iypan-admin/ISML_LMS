import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Languages to ensure exist
const LANGUAGES = [
  { code: 'FR', name: 'French', nativeName: 'Français', sttLanguageCode: 'fr-FR' },
  { code: 'DE', name: 'German', nativeName: 'Deutsch', sttLanguageCode: 'de-DE' },
  { code: 'ES', name: 'Spanish', nativeName: 'Español', sttLanguageCode: 'es-ES' },
  { code: 'KO', name: 'Korean', nativeName: '한국어', sttLanguageCode: 'ko-KR' },
  { code: 'JA', name: 'Japanese', nativeName: '日本語', sttLanguageCode: 'ja-JP' },
];

async function main() {
  console.log('🚀 Seeding real Courses from Curriculum & Pacing rules...');

  // 1. Ensure languages exist
  const langMap: Record<string, string> = {};
  for (const l of LANGUAGES) {
    const lang = await prisma.languages.upsert({
      where: { code: l.code },
      update: { name: l.name, nativeName: l.nativeName, sttLanguageCode: l.sttLanguageCode },
      create: { code: l.code, name: l.name, nativeName: l.nativeName, sttLanguageCode: l.sttLanguageCode },
    });
    langMap[l.name] = lang.id;
  }
  console.log('✅ Languages verified:', langMap);

  // 2. Fetch Institutions for College & School
  const institutions = await prisma.institutions.findMany();
  const college = institutions.find(i => i.name.toLowerCase().includes('american') || i.name.toLowerCase().includes('college'));
  const school = institutions.find(i => i.name.toLowerCase().includes('school') || i.name.toLowerCase().includes('sivakasi'));
  
  const collegeId = college ? college.id : null;
  const schoolId = school ? school.id : null;

  console.log(`🏛️ Target College: ${college?.name} (${collegeId})`);
  console.log(`🏫 Target School: ${school?.name} (${schoolId})`);

  // 3. Define College Courses (from College Pacing Matrix)
  // French, German, Spanish, Korean: A1, A2, B1, B2
  // Japanese: N5, N4, N3, N2
  const collegeTracks = [
    { lang: 'French', code: 'FR', level: 'A1 / L1', hours: 80, assessments: 4, humanMins: 10, aiDaily: 3, track: 'STANDARD' as const },
    { lang: 'French', code: 'FR', level: 'A2 / L2', hours: 100, assessments: 4, humanMins: 20, aiDaily: 5, track: 'STANDARD' as const },
    { lang: 'French', code: 'FR', level: 'B1 / L3', hours: 140, assessments: 5, humanMins: 30, aiDaily: 7, track: 'STANDARD' as const },
    { lang: 'French', code: 'FR', level: 'B2 / L4', hours: 180, assessments: 5, humanMins: 40, aiDaily: 10, track: 'INTENSIVE' as const },

    { lang: 'German', code: 'DE', level: 'A1 / L1', hours: 80, assessments: 4, humanMins: 10, aiDaily: 3, track: 'STANDARD' as const },
    { lang: 'German', code: 'DE', level: 'A2 / L2', hours: 100, assessments: 4, humanMins: 20, aiDaily: 5, track: 'STANDARD' as const },
    { lang: 'German', code: 'DE', level: 'B1 / L3', hours: 140, assessments: 5, humanMins: 30, aiDaily: 7, track: 'STANDARD' as const },
    { lang: 'German', code: 'DE', level: 'B2 / L4', hours: 180, assessments: 5, humanMins: 40, aiDaily: 10, track: 'INTENSIVE' as const },

    { lang: 'Spanish', code: 'ES', level: 'A1 / L1', hours: 80, assessments: 4, humanMins: 10, aiDaily: 3, track: 'STANDARD' as const },
    { lang: 'Spanish', code: 'ES', level: 'A2 / L2', hours: 100, assessments: 4, humanMins: 20, aiDaily: 5, track: 'STANDARD' as const },
    { lang: 'Spanish', code: 'ES', level: 'B1 / L3', hours: 140, assessments: 5, humanMins: 30, aiDaily: 7, track: 'STANDARD' as const },
    { lang: 'Spanish', code: 'ES', level: 'B2 / L4', hours: 180, assessments: 5, humanMins: 40, aiDaily: 10, track: 'INTENSIVE' as const },

    { lang: 'Korean', code: 'KO', level: 'A1 / L1', hours: 80, assessments: 4, humanMins: 10, aiDaily: 3, track: 'STANDARD' as const },
    { lang: 'Korean', code: 'KO', level: 'A2 / L2', hours: 100, assessments: 4, humanMins: 20, aiDaily: 5, track: 'STANDARD' as const },

    { lang: 'Japanese', code: 'JA', level: 'N5', hours: 100, assessments: 5, humanMins: 10, aiDaily: 3, track: 'INTENSIVE' as const },
    { lang: 'Japanese', code: 'JA', level: 'N4', hours: 120, assessments: 5, humanMins: 20, aiDaily: 5, track: 'STANDARD' as const },
    { lang: 'Japanese', code: 'JA', level: 'N3', hours: 160, assessments: 6, humanMins: 30, aiDaily: 7, track: 'STANDARD' as const },
    { lang: 'Japanese', code: 'JA', level: 'N2', hours: 200, assessments: 6, humanMins: 40, aiDaily: 10, track: 'INTENSIVE' as const },
  ];

  for (const c of collegeTracks) {
    const code = `COL-${c.code}-${c.level.replace(/[^a-zA-Z0-9]/g, '')}`;
    const name = `${c.lang} ${c.level} Higher Education Program`;
    const languageId = langMap[c.lang];

    const course = await prisma.courses.upsert({
      where: {
        tenantId_code: {
          tenantId: collegeId || '',
          code: code
        }
      },
      update: {
        name,
        displayName: name,
        teachingHours: c.hours,
        totalHours: c.hours + 20,
        assessmentsCount: c.assessments,
        humanSpeakingMinutes: c.humanMins,
        aiSpeakingPracticeDaily: c.aiDaily,
        defaultPacingTrack: c.track,
        status: 'PUBLISHED',
        isActive: true
      },
      create: {
        tenantId: collegeId,
        languageId,
        code,
        name,
        displayName: name,
        description: `Official CEFR/JLPT certified ${c.lang} language program designed for colleges and universities. Includes ${c.hours} hours of live training, ${c.assessments} continuous assessments, and AI speaking practice.`,
        teachingHours: c.hours,
        totalHours: c.hours + 20,
        assessmentsCount: c.assessments,
        humanSpeakingMinutes: c.humanMins,
        aiSpeakingPracticeDaily: c.aiDaily,
        defaultPacingTrack: c.track,
        status: 'PUBLISHED',
        isActive: true
      }
    });

    console.log(`  ✓ College Course created: ${course.code} - ${course.name}`);
  }

  // 4. Define School Courses (from School Curriculum Matrix)
  // French, German, Spanish, Korean: A1.1, A1.2, A2.1, A2.2, A2.3, B1.1
  const schoolTracks = [
    { lang: 'French', code: 'FR', level: 'A1.1', hours: 60, assessments: 4, humanMins: 10, aiDaily: 2, cat: 'CAT_3_45M' as const },
    { lang: 'French', code: 'FR', level: 'A1.2', hours: 60, assessments: 4, humanMins: 10, aiDaily: 2, cat: 'CAT_3_45M' as const },
    { lang: 'French', code: 'FR', level: 'A2.1', hours: 80, assessments: 5, humanMins: 15, aiDaily: 3, cat: 'CAT_3_45M' as const },

    { lang: 'German', code: 'DE', level: 'A1.1', hours: 60, assessments: 4, humanMins: 10, aiDaily: 2, cat: 'CAT_3_45M' as const },
    { lang: 'German', code: 'DE', level: 'A1.2', hours: 60, assessments: 4, humanMins: 10, aiDaily: 2, cat: 'CAT_3_45M' as const },

    { lang: 'Spanish', code: 'ES', level: 'A1.1', hours: 60, assessments: 4, humanMins: 10, aiDaily: 2, cat: 'CAT_3_45M' as const },
    { lang: 'Spanish', code: 'ES', level: 'A1.2', hours: 60, assessments: 4, humanMins: 10, aiDaily: 2, cat: 'CAT_3_45M' as const },

    { lang: 'Korean', code: 'KO', level: 'A1.1', hours: 60, assessments: 4, humanMins: 10, aiDaily: 2, cat: 'CAT_3_45M' as const },
    { lang: 'Korean', code: 'KO', level: 'A1.2', hours: 60, assessments: 4, humanMins: 10, aiDaily: 2, cat: 'CAT_3_45M' as const },
  ];

  for (const s of schoolTracks) {
    const code = `SCH-${s.code}-${s.level.replace(/[^a-zA-Z0-9]/g, '')}`;
    const name = `${s.lang} ${s.level} School Foundation Course`;
    const languageId = langMap[s.lang];

    const course = await prisma.courses.upsert({
      where: {
        tenantId_code: {
          tenantId: schoolId || '',
          code: code
        }
      },
      update: {
        name,
        displayName: name,
        teachingHours: s.hours,
        totalHours: s.hours + 15,
        assessmentsCount: s.assessments,
        humanSpeakingMinutes: s.humanMins,
        aiSpeakingPracticeDaily: s.aiDaily,
        defaultPeriodCategory: s.cat,
        status: 'PUBLISHED',
        isActive: true
      },
      create: {
        tenantId: schoolId,
        languageId,
        code,
        name,
        displayName: name,
        description: `School curriculum aligned foreign language program for ${s.lang} (${s.level}). Cat 1 to Cat 6 period category compliant.`,
        teachingHours: s.hours,
        totalHours: s.hours + 15,
        assessmentsCount: s.assessments,
        humanSpeakingMinutes: s.humanMins,
        aiSpeakingPracticeDaily: s.aiDaily,
        defaultPeriodCategory: s.cat,
        status: 'PUBLISHED',
        isActive: true
      }
    });

    console.log(`  ✓ School Course created: ${course.code} - ${course.name}`);
  }

  console.log('🎉 All Courses successfully seeded into Supabase DB!');
}

main()
  .catch((e) => {
    console.error('Error seeding courses:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function seedSampleCourseAndBatches() {
  console.log('🚀 Creating and Seeding Sample Course & Batches (MRNG & EVNG)...');

  // 1. Get American College or default Institution
  const institutions = await prisma.institutions.findMany();
  const college = institutions.find(i => i.name.toLowerCase().includes('american') || i.name.toLowerCase().includes('college')) || institutions[0];
  const collegeId = college ? college.id : '521323cd-00da-49a6-98ed-6b7918d181b4';
  const collegeName = college ? college.name : 'The American College';

  // 2. Ensure language exists (e.g. English / International Language Track or French)
  let language = await prisma.languages.findFirst({ where: { code: 'EN' } });
  if (!language) {
    language = await prisma.languages.findFirst({ where: { code: 'FR' } });
  }
  if (!language) {
    language = await prisma.languages.create({
      data: {
        code: 'EN',
        name: 'English',
        nativeName: 'English',
        sttLanguageCode: 'en-US'
      }
    });
  }

  // 3. Upsert Course "Sample Course"
  const courseCode = 'SAMPLE-CRS-101';
  const courseName = 'Sample Course';
  const courseDesc = 'Comprehensive Sample Course designed with dual cohorts: Morning Batch and Evening Batch for active live learning and skill assessments.';

  const course = await prisma.courses.upsert({
    where: {
      tenantId_code: {
        tenantId: collegeId,
        code: courseCode
      }
    },
    update: {
      name: courseName,
      displayName: courseName,
      description: courseDesc,
      teachingHours: 80,
      totalHours: 100,
      assessmentsCount: 4,
      humanSpeakingMinutes: 20,
      aiSpeakingPracticeDaily: 3,
      status: 'PUBLISHED',
      isActive: true
    },
    create: {
      tenantId: collegeId,
      languageId: language.id,
      code: courseCode,
      name: courseName,
      displayName: courseName,
      description: courseDesc,
      teachingHours: 80,
      totalHours: 100,
      assessmentsCount: 4,
      humanSpeakingMinutes: 20,
      aiSpeakingPracticeDaily: 3,
      status: 'PUBLISHED',
      isActive: true
    }
  });

  console.log(`✅ Sample Course Ready: [${course.code}] ${course.name} (ID: ${course.id})`);

  // 4. Create Morning Batch & Evening Batch
  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  const batchesToCreate = [
    {
      code: 'BAT-SAMPLE-MRNG',
      name: 'Morning Batch',
      timing: '09:00 AM – 10:30 AM',
      days: ['MON', 'WED', 'FRI'],
      maxSeats: 60,
    },
    {
      code: 'BAT-SAMPLE-EVNG',
      name: 'Evening Batch',
      timing: '06:00 PM – 07:30 PM',
      days: ['TUE', 'THU', 'SAT'],
      maxSeats: 60,
    }
  ];

  const createdBatches = [];

  for (const b of batchesToCreate) {
    const batch = await prisma.batches.upsert({
      where: { code: b.code },
      update: {
        tenantId: collegeId,
        courseId: course.id,
        name: b.name,
        maxStudents: b.maxSeats,
        startDate: now,
        endDate: nextYear,
        status: 'ONGOING'
      },
      create: {
        tenantId: collegeId,
        courseId: course.id,
        durationPatternId: 'pattern-regular-term',
        code: b.code,
        name: b.name,
        maxStudents: b.maxSeats,
        startDate: now,
        endDate: nextYear,
        status: 'ONGOING'
      }
    });

    // Also link BatchInstitution
    await prisma.batchInstitutions.upsert({
      where: {
        batchId_institutionId: {
          batchId: batch.id,
          institutionId: collegeId
        }
      },
      update: { maxSeatsAllocated: b.maxSeats },
      create: {
        batchId: batch.id,
        institutionId: collegeId,
        maxSeatsAllocated: b.maxSeats
      }
    });

    createdBatches.push({
      id: batch.id,
      code: batch.code,
      name: batch.name,
      timing: b.timing,
      scheduleDays: b.days,
      institutionId: collegeId,
      institutionName: collegeName,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      status: 'ACTIVE'
    });

    console.log(`  ✓ Batch Seeded: [${batch.code}] ${batch.name} (${b.timing})`);
  }

  // 5. Also sync to realDbCourses.json and realDbBatches.json so all UI views (Super Admin, Academic Manager, Student, Tutor) reflect it instantly
  const realDbCoursesPaths = [
    path.join(__dirname, '..', '..', 'web', 'src', 'lib', 'realDbCourses.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbCourses.json')
  ];

  const courseJsonEntry = {
    id: course.id,
    code: course.code,
    name: course.name,
    displayName: course.displayName,
    collegeId: collegeId,
    collegeName: collegeName,
    department: 'Department of Foreign Languages',
    program: 'Sample Course Program Track',
    semester: 1,
    academicYear: '2026–2027',
    duration: '80 Hours',
    durationDays: 120,
    durationType: '4_MONTHS',
    facultyName: 'Lead Academic Faculty',
    substituteTutors: [],
    enrolledStudents: 12,
    completionRate: 0,
    courseFee: 18500,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString()
  };

  for (const cPath of realDbCoursesPaths) {
    if (fs.existsSync(cPath)) {
      try {
        const existingCourses = JSON.parse(fs.readFileSync(cPath, 'utf8'));
        const idx = existingCourses.findIndex((c: any) => c.code === course.code || c.id === course.id);
        if (idx !== -1) {
          existingCourses[idx] = { ...existingCourses[idx], ...courseJsonEntry };
        } else {
          existingCourses.unshift(courseJsonEntry);
        }
        fs.writeFileSync(cPath, JSON.stringify(existingCourses, null, 2), 'utf8');
        console.log(`📁 Synced course to ${cPath}`);
      } catch (err) {
        console.error('Failed syncing course JSON:', err);
      }
    }
  }

  const realDbBatchesPaths = [
    path.join(__dirname, '..', '..', 'web', 'src', 'lib', 'realDbBatches.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbBatches.json')
  ];

  for (const bPath of realDbBatchesPaths) {
    try {
      let existingBatches: any[] = [];
      if (fs.existsSync(bPath)) {
        try {
          existingBatches = JSON.parse(fs.readFileSync(bPath, 'utf8'));
        } catch {
          existingBatches = [];
        }
      }
      for (const b of createdBatches) {
        const batchEntry = {
          id: b.id,
          name: b.name,
          code: b.code,
          institutionId: b.institutionId,
          institutionName: b.institutionName,
          programId: course.id,
          programName: course.name,
          departmentName: 'Department of Foreign Languages',
          academicYear: '2026–2027',
          admissionYear: 2026,
          graduationYear: 2027,
          currentSemesterNumber: 1,
          sectionsCount: 1,
          studentsCount: 25,
          courseIds: [course.id],
          courseNames: [course.name],
          batchTiming: b.timing,
          scheduleDays: b.scheduleDays,
          assignedFacultyName: 'Joy JK',
          assignedStaffNames: ['Joy JK'],
          leadFacultyId: 'fac-201834',
          leadFacultyName: 'Joy JK',
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };
        const idx = existingBatches.findIndex((eb: any) => eb.code === b.code || eb.id === b.id);
        if (idx !== -1) {
          existingBatches[idx] = { ...existingBatches[idx], ...batchEntry };
        } else {
          existingBatches.unshift(batchEntry);
        }
      }
      fs.writeFileSync(bPath, JSON.stringify(existingBatches, null, 2), 'utf8');
      console.log(`📁 Synced batches to ${bPath}`);
    } catch (err) {
      console.error('Failed syncing batches JSON:', err);
    }
  }

  console.log('🎉 Sample Course and Morning & Evening Batches fully seeded!');
}

seedSampleCourseAndBatches()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

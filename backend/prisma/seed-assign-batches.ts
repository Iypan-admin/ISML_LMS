import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function assignStudentsToBatches() {
  console.log('🚀 Assigning American College students to Morning Batch & Evening Batch...');

  // 1. Get Course and Batches
  const sampleCourse = await prisma.courses.findFirst({
    where: { code: 'SAMPLE-CRS-101' }
  });

  const mrngBatch = await prisma.batches.findFirst({
    where: { code: 'BAT-SAMPLE-MRNG' }
  });

  const evngBatch = await prisma.batches.findFirst({
    where: { code: 'BAT-SAMPLE-EVNG' }
  });

  if (!mrngBatch || !evngBatch) {
    throw new Error('Morning or Evening batch not found in database!');
  }

  console.log(`Morning Batch: ${mrngBatch.name} (${mrngBatch.id})`);
  console.log(`Evening Batch: ${evngBatch.name} (${evngBatch.id})`);

  // 2. Load all students from realDbStudents.json
  const realDbStudentsPath = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStudents.json');
  let students = JSON.parse(fs.readFileSync(realDbStudentsPath, 'utf8'));

  // American college students:
  // AMER-2026-001 (Muthu Pandian) -> Morning Batch
  // AMER-2026-002 (Jeyashree Rajan) -> Morning Batch
  // AMER-2026-003 (Saravanan Karthik) -> Morning Batch
  // AMER-2026-004 (Divya Bharathi) -> Evening Batch
  // AMER-2026-005 (Vijay Anand) -> Evening Batch
  // AMER-2026-006 (Abinaya Sundaram) -> Evening Batch

  const assignments = [
    { studentId: 'AMER-2026-001', batch: mrngBatch },
    { studentId: 'AMER-2026-002', batch: mrngBatch },
    { studentId: 'AMER-2026-003', batch: mrngBatch },
    { studentId: 'AMER-2026-004', batch: evngBatch },
    { studentId: 'AMER-2026-005', batch: evngBatch },
    { studentId: 'AMER-2026-006', batch: evngBatch }
  ];

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  for (const asg of assignments) {
    // A. Update local JSON
    const sIndex = students.findIndex((s: any) => s.studentId === asg.studentId);
    if (sIndex !== -1) {
      students[sIndex].batchId = asg.batch.id;
      students[sIndex].batchCode = asg.batch.code;
      students[sIndex].batchName = asg.batch.name;
      students[sIndex].enrolledCourseId = sampleCourse ? sampleCourse.id : students[sIndex].enrolledCourseId;
      students[sIndex].enrolledCourseCode = sampleCourse ? sampleCourse.code : students[sIndex].enrolledCourseCode;
      students[sIndex].enrolledCourseName = sampleCourse ? sampleCourse.name : students[sIndex].enrolledCourseName;
      console.log(`  ✓ Updated JSON: ${students[sIndex].name} -> ${asg.batch.name}`);
    }

    // B. Find or update in Supabase / Prisma DB
    const studentUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: students[sIndex]?.email },
          { firstName: students[sIndex]?.firstName }
        ]
      }
    });

    if (studentUser) {
      const enrollNumber = `ENR-${asg.batch.code}-${asg.studentId}`;
      await prisma.studentBatchEnrollments.upsert({
        where: { enrollmentNumber: enrollNumber },
        update: {
          batchId: asg.batch.id,
          status: 'ACTIVE',
          validityExpiresAt: nextYear
        },
        create: {
          tenantId: asg.batch.tenantId || '521323cd-00da-49a6-98ed-6b7918d181b4',
          studentUserId: studentUser.id,
          batchId: asg.batch.id,
          enrollmentNumber: enrollNumber,
          status: 'ACTIVE',
          validityExpiresAt: nextYear
        }
      });
      console.log(`  ✓ Enrolled in DB: ${studentUser.firstName} ${studentUser.lastName} -> ${asg.batch.name}`);
    }
  }

  // Save back to realDbStudents.json
  fs.writeFileSync(realDbStudentsPath, JSON.stringify(students, null, 2), 'utf8');

  // Also update realDbBatches.json with student counts and IDs
  const realDbBatchesPath = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbBatches.json');
  if (fs.existsSync(realDbBatchesPath)) {
    try {
      const batchesData = JSON.parse(fs.readFileSync(realDbBatchesPath, 'utf8'));
      for (const b of batchesData) {
        if (b.code === 'BAT-SAMPLE-MRNG') {
          b.studentsCount = 3;
          b.studentIds = ['AMER-2026-001', 'AMER-2026-002', 'AMER-2026-003'];
        } else if (b.code === 'BAT-SAMPLE-EVNG') {
          b.studentsCount = 3;
          b.studentIds = ['AMER-2026-004', 'AMER-2026-005', 'AMER-2026-006'];
        }
      }
      fs.writeFileSync(realDbBatchesPath, JSON.stringify(batchesData, null, 2), 'utf8');
      console.log('📁 Synced batch student counts to realDbBatches.json');
    } catch (e) {
      console.error('Failed to update realDbBatches.json:', e);
    }
  }

  console.log('🎉 Successfully assigned American College students to Morning & Evening Batches!');
}

assignStudentsToBatches()
  .catch((e) => {
    console.error('Error assigning students:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

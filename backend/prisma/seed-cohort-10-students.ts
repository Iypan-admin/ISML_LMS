import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 10 Students for Morning Batch
const MORNING_STUDENTS = [
  { studentId: 'AMER-2026-001', firstName: 'Muthu', lastName: 'Pandian', email: 'muthu.pandian@americancollege.edu.in', phone: '+91 97890 11001', gender: 'MALE' as const, cgpa: 8.8, att: 94.2 },
  { studentId: 'AMER-2026-002', firstName: 'Jeyashree', lastName: 'Rajan', email: 'jeyashree.rajan@americancollege.edu.in', phone: '+91 97890 11002', gender: 'FEMALE' as const, cgpa: 9.1, att: 96.0 },
  { studentId: 'AMER-2026-003', firstName: 'Saravanan', lastName: 'Karthik', email: 'saravanan.k@americancollege.edu.in', phone: '+91 97890 11003', gender: 'MALE' as const, cgpa: 8.4, att: 91.5 },
  { studentId: 'AMER-2026-004', firstName: 'Divya', lastName: 'Bharathi', email: 'divya.b@americancollege.edu.in', phone: '+91 97890 11004', gender: 'FEMALE' as const, cgpa: 9.3, att: 98.0 },
  { studentId: 'AMER-2026-005', firstName: 'Vijay', lastName: 'Anand', email: 'vijay.a@americancollege.edu.in', phone: '+91 97890 11005', gender: 'MALE' as const, cgpa: 8.7, att: 93.0 },
  { studentId: 'AMER-2026-006', firstName: 'Abinaya', lastName: 'Sundaram', email: 'abinaya.s@americancollege.edu.in', phone: '+91 97890 11006', gender: 'FEMALE' as const, cgpa: 9.0, att: 95.5 },
  { studentId: 'AMER-2026-007', firstName: 'Kavitha', lastName: 'Ramesh', email: 'kavitha.r@americancollege.edu.in', phone: '+91 97890 11007', gender: 'FEMALE' as const, cgpa: 8.9, att: 94.0 },
  { studentId: 'AMER-2026-008', firstName: 'Praveen', lastName: 'Kumar', email: 'praveen.k@americancollege.edu.in', phone: '+91 97890 11008', gender: 'MALE' as const, cgpa: 8.5, att: 92.5 },
  { studentId: 'AMER-2026-009', firstName: 'Sneha', lastName: 'Gopal', email: 'sneha.g@americancollege.edu.in', phone: '+91 97890 11009', gender: 'FEMALE' as const, cgpa: 9.2, att: 97.0 },
  { studentId: 'AMER-2026-010', firstName: 'Dinesh', lastName: 'Murugan', email: 'dinesh.m@americancollege.edu.in', phone: '+91 97890 11010', gender: 'MALE' as const, cgpa: 8.6, att: 91.0 },
];

// 10 Students for Evening Batch
const EVENING_STUDENTS = [
  { studentId: 'AMER-2026-011', firstName: 'Aravind', lastName: 'Swamy', email: 'aravind.s@americancollege.edu.in', phone: '+91 97890 11011', gender: 'MALE' as const, cgpa: 8.7, att: 93.5 },
  { studentId: 'AMER-2026-012', firstName: 'Deepika', lastName: 'Mani', email: 'deepika.m@americancollege.edu.in', phone: '+91 97890 11012', gender: 'FEMALE' as const, cgpa: 9.4, att: 98.2 },
  { studentId: 'AMER-2026-013', firstName: 'Ganesh', lastName: 'Moorthy', email: 'ganesh.m@americancollege.edu.in', phone: '+91 97890 11013', gender: 'MALE' as const, cgpa: 8.3, att: 90.0 },
  { studentId: 'AMER-2026-014', firstName: 'Hema', lastName: 'Malini', email: 'hema.m@americancollege.edu.in', phone: '+91 97890 11014', gender: 'FEMALE' as const, cgpa: 9.1, att: 95.0 },
  { studentId: 'AMER-2026-015', firstName: 'Karthik', lastName: 'Rajan', email: 'karthik.r@americancollege.edu.in', phone: '+91 97890 11015', gender: 'MALE' as const, cgpa: 8.8, att: 94.0 },
  { studentId: 'AMER-2026-016', firstName: 'Keerthana', lastName: 'Suresh', email: 'keerthana.s@americancollege.edu.in', phone: '+91 97890 11016', gender: 'FEMALE' as const, cgpa: 9.5, att: 99.0 },
  { studentId: 'AMER-2026-017', firstName: 'Manikandan', lastName: 'V', email: 'manikandan.v@americancollege.edu.in', phone: '+91 97890 11017', gender: 'MALE' as const, cgpa: 8.5, att: 92.0 },
  { studentId: 'AMER-2026-018', firstName: 'Nandhini', lastName: 'Prabhu', email: 'nandhini.p@americancollege.edu.in', phone: '+91 97890 11018', gender: 'FEMALE' as const, cgpa: 9.0, att: 96.5 },
  { studentId: 'AMER-2026-019', firstName: 'Pradeep', lastName: 'Chandran', email: 'pradeep.c@americancollege.edu.in', phone: '+91 97890 11019', gender: 'MALE' as const, cgpa: 8.6, att: 91.5 },
  { studentId: 'AMER-2026-020', firstName: 'Ramya', lastName: 'Krishnan', email: 'ramya.k@americancollege.edu.in', phone: '+91 97890 11020', gender: 'FEMALE' as const, cgpa: 9.2, att: 97.5 },
];

async function seed10Plus10Students() {
  console.log('🚀 Seeding 10 Students for Morning Batch and 10 Students for Evening Batch into Supabase DB & Local Stores...');

  const collegeId = '521323cd-00da-49a6-98ed-6b7918d181b4';
  const collegeName = 'The American College';

  // Find Course & Batches
  const sampleCourse = await prisma.courses.findFirst({ where: { code: 'SAMPLE-CRS-101' } });
  const mrngBatch = await prisma.batches.findFirst({ where: { code: 'BAT-SAMPLE-MRNG' } });
  const evngBatch = await prisma.batches.findFirst({ where: { code: 'BAT-SAMPLE-EVNG' } });

  if (!mrngBatch || !evngBatch || !sampleCourse) {
    throw new Error('Course or Batches missing!');
  }

  const allCohortAssignments = [
    ...MORNING_STUDENTS.map(s => ({ ...s, batch: mrngBatch, batchLabel: 'Morning Batch' })),
    ...EVENING_STUDENTS.map(s => ({ ...s, batch: evngBatch, batchLabel: 'Evening Batch' }))
  ];

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  // 1. Seed into Prisma DB (Users, StudentProfiles, StudentBatchEnrollments)
  for (const s of allCohortAssignments) {
    const user = await prisma.users.upsert({
      where: {
        tenantId_email: {
          tenantId: collegeId,
          email: s.email
        }
      },
      update: {
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        userType: 'STUDENT',
        status: 'ACTIVE'
      },
      create: {
        tenantId: collegeId,
        email: s.email,
        passwordHash: '$2b$10$Wp8u9Qp19VlP6t5qHnU.aefsX91hM4Gf7k8V29/aG4Zl62b',
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        userType: 'STUDENT',
        status: 'ACTIVE'
      }
    });

    const dob = new Date('2004-05-15');
    await prisma.studentProfiles.upsert({
      where: {
        tenantId_studentCode: {
          tenantId: collegeId,
          studentCode: s.studentId
        }
      },
      update: {
        userId: user.id,
        dateOfBirth: dob,
        gender: s.gender,
        academicStatus: 'ACTIVE'
      },
      create: {
        userId: user.id,
        tenantId: collegeId,
        studentCode: s.studentId,
        dateOfBirth: dob,
        gender: s.gender,
        academicStatus: 'ACTIVE'
      }
    });

    const enrollNumber = `ENR-${s.batch.code}-${s.studentId}`;
    await prisma.studentBatchEnrollments.upsert({
      where: { enrollmentNumber: enrollNumber },
      update: {
        batchId: s.batch.id,
        status: 'ACTIVE',
        validityExpiresAt: nextYear
      },
      create: {
        tenantId: collegeId,
        studentUserId: user.id,
        batchId: s.batch.id,
        enrollmentNumber: enrollNumber,
        status: 'ACTIVE',
        validityExpiresAt: nextYear
      }
    });

    console.log(`  ✓ DB Enrolled: ${s.studentId} - ${s.firstName} ${s.lastName} -> ${s.batchLabel}`);
  }

  // 2. Load existing realDbStudents.json and update / insert
  const realDbStudentsPath = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStudents.json');
  let currentStudents: any[] = [];
  if (fs.existsSync(realDbStudentsPath)) {
    try {
      currentStudents = JSON.parse(fs.readFileSync(realDbStudentsPath, 'utf8'));
    } catch {
      currentStudents = [];
    }
  }

  // Keep Sivakasi Lions school students intact
  const schoolStudents = currentStudents.filter((s: any) => s.studentId?.startsWith('SLS-') || s.collegeName?.includes('School') || s.collegeName?.includes('Lions'));

  const newCollegeStudentsList: any[] = [];

  for (const s of allCohortAssignments) {
    const studentEntry = {
      id: `std-${s.studentId.toLowerCase()}`,
      studentId: s.studentId,
      name: `${s.firstName} ${s.lastName}`,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      mobile: s.phone,
      avatarUrl: `/avatars/${s.firstName.toLowerCase()}.png`,
      collegeId: collegeId,
      collegeName: collegeName,
      tenantId: collegeId,
      tenantCode: 'AMER-COL',
      tenantName: collegeName,
      departmentId: 'dept-col-01',
      departmentName: 'Department of Foreign Languages',
      programId: sampleCourse.id,
      programName: 'Sample Course Program Track',
      batchId: s.batch.id,
      batchCode: s.batch.code,
      batchName: s.batchLabel,
      semesterNumber: 1,
      gender: s.gender,
      admissionYear: '2026',
      academicYear: '2026–2027',
      status: 'ACTIVE',
      attendancePercentage: s.att,
      enrolledCoursesCount: 1,
      completedAssessmentsCount: 4,
      activeDoubtsCount: 0,
      cgpa: s.cgpa,
      createdDate: new Date().toISOString(),
      credentialsDelivered: true,
      enrolledCourseId: sampleCourse.id,
      enrolledCourseName: sampleCourse.name,
      enrolledCourseCode: sampleCourse.code,
      parentName: `${s.lastName} Parent`,
      parentEmail: `${s.firstName.toLowerCase()}.parent@gmail.com`,
      parentMobile: s.phone,
      parentRelationship: 'PARENT',
      parentPortalAccess: true
    };
    newCollegeStudentsList.push(studentEntry);
  }

  const consolidatedStudents = [...newCollegeStudentsList, ...schoolStudents];
  fs.writeFileSync(realDbStudentsPath, JSON.stringify(consolidatedStudents, null, 2), 'utf8');
  console.log(`📁 Saved ${consolidatedStudents.length} total students to realDbStudents.json`);

  // 3. Update realDbBatches.json
  const realDbBatchesPath = path.join(process.cwd(), 'web', 'src', 'lib', 'realDbBatches.json');
  if (fs.existsSync(realDbBatchesPath)) {
    try {
      const batchesData = JSON.parse(fs.readFileSync(realDbBatchesPath, 'utf8'));
      for (const b of batchesData) {
        if (b.code === 'BAT-SAMPLE-MRNG' || b.name === 'Morning Batch') {
          b.studentsCount = MORNING_STUDENTS.length;
          b.studentIds = MORNING_STUDENTS.map(s => s.studentId);
          b.institutionId = collegeId;
          b.institutionName = collegeName;
          b.status = 'ACTIVE';
        } else if (b.code === 'BAT-SAMPLE-EVNG' || b.name === 'Evening Batch') {
          b.studentsCount = EVENING_STUDENTS.length;
          b.studentIds = EVENING_STUDENTS.map(s => s.studentId);
          b.institutionId = collegeId;
          b.institutionName = collegeName;
          b.status = 'ACTIVE';
        }
      }
      fs.writeFileSync(realDbBatchesPath, JSON.stringify(batchesData, null, 2), 'utf8');
      console.log('📁 Updated batch student counts & IDs in realDbBatches.json');
    } catch (e) {
      console.error('Failed to update realDbBatches.json:', e);
    }
  }

  console.log('🎉 10 Morning Batch + 10 Evening Batch students successfully seeded!');
}

seed10Plus10Students()
  .catch((e) => {
    console.error('Error seeding 10+10 students:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

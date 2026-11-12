import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The 12 Real Students matching The American College & Sivakasi Lions School
const STUDENTS_TO_SEED = [
  // The American College (College ID: 521323cd-00da-49a6-98ed-6b7918d181b4)
  {
    studentId: 'AMER-2026-001',
    firstName: 'Muthu',
    lastName: 'Pandian',
    email: 'muthu.pandian@americancollege.edu.in',
    phone: '+91 97890 11001',
    collegeId: '521323cd-00da-49a6-98ed-6b7918d181b4',
    collegeName: 'The American College',
    departmentName: 'Department of Foreign Languages',
    programName: 'French A1 Intensive Certification Program',
    courseName: 'French A1 / L1 Higher Education Program',
    courseCode: 'COL-FR-A1L1',
    batchName: 'MRNG BATCH',
    attendance: 94.2,
    cgpa: 8.8,
    gender: 'MALE' as const,
    dob: new Date('2004-05-14'),
    parentName: 'Sundara Pandian',
    parentRelation: 'FATHER',
    parentPhone: '+91 94431 11001'
  },
  {
    studentId: 'AMER-2026-002',
    firstName: 'Jeyashree',
    lastName: 'Rajan',
    email: 'jeyashree.rajan@americancollege.edu.in',
    phone: '+91 97890 11002',
    collegeId: '521323cd-00da-49a6-98ed-6b7918d181b4',
    collegeName: 'The American College',
    departmentName: 'Department of Foreign Languages',
    programName: 'German A1 Professional Career Track',
    courseName: 'German A1 / L1 Higher Education Program',
    courseCode: 'COL-DE-A1L1',
    batchName: 'MRNG BATCH',
    attendance: 96.0,
    cgpa: 9.1,
    gender: 'FEMALE' as const,
    dob: new Date('2004-08-22'),
    parentName: 'Sundara Pandian',
    parentRelation: 'FATHER',
    parentPhone: '+91 94431 11001'
  },
  {
    studentId: 'AMER-2026-003',
    firstName: 'Saravanan',
    lastName: 'Karthik',
    email: 'saravanan.k@americancollege.edu.in',
    phone: '+91 97890 11003',
    collegeId: '521323cd-00da-49a6-98ed-6b7918d181b4',
    collegeName: 'The American College',
    departmentName: 'Department of Foreign Languages',
    programName: 'French A1 Intensive Certification Program',
    courseName: 'French A1 / L1 Higher Education Program',
    courseCode: 'COL-FR-A1L1',
    batchName: 'MRNG BATCH',
    attendance: 91.5,
    cgpa: 8.4,
    gender: 'MALE' as const,
    dob: new Date('2004-03-10'),
    parentName: 'Karthikeyan P',
    parentRelation: 'FATHER',
    parentPhone: '+91 94431 11002'
  },
  {
    studentId: 'AMER-2026-004',
    firstName: 'Divya',
    lastName: 'Bharathi',
    email: 'divya.b@americancollege.edu.in',
    phone: '+91 97890 11004',
    collegeId: '521323cd-00da-49a6-98ed-6b7918d181b4',
    collegeName: 'The American College',
    departmentName: 'Department of Foreign Languages',
    programName: 'French A1 Intensive Certification Program',
    courseName: 'French A1 / L1 Higher Education Program',
    courseCode: 'COL-FR-A1L1',
    batchName: 'MRNG BATCH',
    attendance: 93.0,
    cgpa: 8.7,
    gender: 'FEMALE' as const,
    dob: new Date('2004-11-05'),
    parentName: 'Meenakshi Sundaram',
    parentRelation: 'MOTHER',
    parentPhone: '+91 94431 11003'
  },
  {
    studentId: 'AMER-2026-005',
    firstName: 'Vijay',
    lastName: 'Anand',
    email: 'vijay.anand@americancollege.edu.in',
    phone: '+91 97890 11005',
    collegeId: '521323cd-00da-49a6-98ed-6b7918d181b4',
    collegeName: 'The American College',
    departmentName: 'Department of Foreign Languages',
    programName: 'French A1 Intensive Certification Program',
    courseName: 'French A1 / L1 Higher Education Program',
    courseCode: 'COL-FR-A1L1',
    batchName: 'MRNG BATCH',
    attendance: 88.5,
    cgpa: 7.9,
    gender: 'MALE' as const,
    dob: new Date('2004-01-19'),
    parentName: 'Alagappan Chettiar',
    parentRelation: 'FATHER',
    parentPhone: '+91 94431 11004'
  },
  {
    studentId: 'AMER-2026-006',
    firstName: 'Abinaya',
    lastName: 'Sundaram',
    email: 'abinaya.s@americancollege.edu.in',
    phone: '+91 97890 11006',
    collegeId: '521323cd-00da-49a6-98ed-6b7918d181b4',
    collegeName: 'The American College',
    departmentName: 'Department of Foreign Languages',
    programName: 'French A1 Intensive Certification Program',
    courseName: 'French A1 / L1 Higher Education Program',
    courseCode: 'COL-FR-A1L1',
    batchName: 'MRNG BATCH',
    attendance: 95.5,
    cgpa: 9.3,
    gender: 'FEMALE' as const,
    dob: new Date('2004-09-12'),
    parentName: 'Senthil Nathan',
    parentRelation: 'FATHER',
    parentPhone: '+91 94431 11005'
  },

  // Sivakasi Lions Matriculation Higher Secondary School (School ID: c37b62d5-6ca4-47cb-bed7-899ad75a3144)
  {
    studentId: 'SLS-2026-001',
    firstName: 'Gokul',
    lastName: 'Nath',
    email: 'gokul.nath@sivakasilions.edu.in',
    phone: '+91 98940 22001',
    collegeId: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    collegeName: 'Sivakasi Lions Matriculation Higher Secondary School',
    departmentName: 'Secondary School Foreign Languages',
    programName: 'French A1.1 School Foundation Course',
    courseName: 'French A1.1 School Foundation Course',
    courseCode: 'SCH-FR-A11',
    batchName: 'Sivakasi Lions French Cohort A',
    attendance: 96.5,
    cgpa: 9.4,
    gender: 'MALE' as const,
    dob: new Date('2009-04-18'),
    parentName: 'Murugan G',
    parentRelation: 'FATHER',
    parentPhone: '+91 94420 22001'
  },
  {
    studentId: 'SLS-2026-002',
    firstName: 'Haritha',
    lastName: 'Selvam',
    email: 'haritha.s@sivakasilions.edu.in',
    phone: '+91 98940 22002',
    collegeId: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    collegeName: 'Sivakasi Lions Matriculation Higher Secondary School',
    departmentName: 'Secondary School Foreign Languages',
    programName: 'French A1.1 School Foundation Course',
    courseName: 'French A1.1 School Foundation Course',
    courseCode: 'SCH-FR-A11',
    batchName: 'Sivakasi Lions French Cohort A',
    attendance: 98.0,
    cgpa: 9.6,
    gender: 'FEMALE' as const,
    dob: new Date('2009-07-25'),
    parentName: 'Murugan G',
    parentRelation: 'FATHER',
    parentPhone: '+91 94420 22001'
  },
  {
    studentId: 'SLS-2026-003',
    firstName: 'Siva',
    lastName: 'Balaji',
    email: 'siva.balaji@sivakasilions.edu.in',
    phone: '+91 98940 22003',
    collegeId: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    collegeName: 'Sivakasi Lions Matriculation Higher Secondary School',
    departmentName: 'Secondary School Foreign Languages',
    programName: 'French A1.1 School Foundation Course',
    courseName: 'French A1.1 School Foundation Course',
    courseCode: 'SCH-FR-A11',
    batchName: 'Sivakasi Lions French Cohort A',
    attendance: 92.0,
    cgpa: 8.5,
    gender: 'MALE' as const,
    dob: new Date('2009-02-14'),
    parentName: 'Balamurugan R',
    parentRelation: 'FATHER',
    parentPhone: '+91 94420 22002'
  },
  {
    studentId: 'SLS-2026-004',
    firstName: 'Pavithra',
    lastName: 'Ramesh',
    email: 'pavithra.r@sivakasilions.edu.in',
    phone: '+91 98940 22004',
    collegeId: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    collegeName: 'Sivakasi Lions Matriculation Higher Secondary School',
    departmentName: 'Secondary School Foreign Languages',
    programName: 'French A1.1 School Foundation Course',
    courseName: 'French A1.1 School Foundation Course',
    courseCode: 'SCH-FR-A11',
    batchName: 'Sivakasi Lions French Cohort A',
    attendance: 94.0,
    cgpa: 8.9,
    gender: 'FEMALE' as const,
    dob: new Date('2009-10-30'),
    parentName: 'Ramesh Kumar M',
    parentRelation: 'FATHER',
    parentPhone: '+91 94420 22003'
  },
  {
    studentId: 'SLS-2026-005',
    firstName: 'Karthikeyan',
    lastName: 'Vetrivel',
    email: 'karthikeyan.v@sivakasilions.edu.in',
    phone: '+91 98940 22005',
    collegeId: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    collegeName: 'Sivakasi Lions Matriculation Higher Secondary School',
    departmentName: 'Secondary School Foreign Languages',
    programName: 'French A1.1 School Foundation Course',
    courseName: 'French A1.1 School Foundation Course',
    courseCode: 'SCH-FR-A11',
    batchName: 'Sivakasi Lions French Cohort A',
    attendance: 95.0,
    cgpa: 9.0,
    gender: 'MALE' as const,
    dob: new Date('2009-06-08'),
    parentName: 'Vetrivel Pandian',
    parentRelation: 'FATHER',
    parentPhone: '+91 94420 22004'
  },
  {
    studentId: 'SLS-2026-006',
    firstName: 'Swetha',
    lastName: 'Narayanan',
    email: 'swetha.n@sivakasilions.edu.in',
    phone: '+91 98940 22006',
    collegeId: 'c37b62d5-6ca4-47cb-bed7-899ad75a3144',
    collegeName: 'Sivakasi Lions Matriculation Higher Secondary School',
    departmentName: 'Secondary School Foreign Languages',
    programName: 'French A1.1 School Foundation Course',
    courseName: 'French A1.1 School Foundation Course',
    courseCode: 'SCH-FR-A11',
    batchName: 'Sivakasi Lions French Cohort A',
    attendance: 97.5,
    cgpa: 9.5,
    gender: 'FEMALE' as const,
    dob: new Date('2009-12-11'),
    parentName: 'Narayanan S',
    parentRelation: 'FATHER',
    parentPhone: '+91 94420 22005'
  }
];

async function seedStudents() {
  console.log('🌱 Inserting 12 real students into Supabase Users & StudentProfiles...');

  for (const s of STUDENTS_TO_SEED) {
    const user = await prisma.users.upsert({
      where: {
        tenantId_email: {
          tenantId: s.collegeId,
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
        tenantId: s.collegeId,
        email: s.email,
        passwordHash: '$2b$10$Wp8u9Qp19VlP6t5qHnU.aefsX91hM4Gf7k8V29/aG4Zl62b',
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        userType: 'STUDENT',
        status: 'ACTIVE'
      }
    });

    await prisma.studentProfiles.upsert({
      where: { userId: user.id },
      update: {
        tenantId: s.collegeId,
        studentCode: s.studentId,
        dateOfBirth: s.dob,
        gender: s.gender,
        academicStatus: 'ACTIVE'
      },
      create: {
        userId: user.id,
        tenantId: s.collegeId,
        studentCode: s.studentId,
        dateOfBirth: s.dob,
        gender: s.gender,
        academicStatus: 'ACTIVE'
      }
    });

    console.log(`  ✓ Inserted Student: ${s.studentId} - ${s.firstName} ${s.lastName} (${s.email})`);
  }

  console.log('🎉 12 real students successfully inserted into database!');
}

seedStudents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

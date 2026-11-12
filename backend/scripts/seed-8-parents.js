const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function configureParents() {
  const amerInst = await prisma.institutions.findFirst({ where: { code: 'AMER-COL' } });
  const sivaInst = await prisma.institutions.findFirst({ where: { code: 'SIVA-LIONS' } });

  console.log('Configuring parents for American College & Sivakasi Lions School...');

  const amerStudents = await prisma.users.findMany({
    where: { userType: 'STUDENT', tenantId: amerInst.id },
    orderBy: { email: 'asc' },
  });
  console.log(`Found ${amerStudents.length} American College students`);

  const sivaStudents = await prisma.users.findMany({
    where: { userType: 'STUDENT', tenantId: sivaInst.id },
    orderBy: { email: 'asc' },
  });
  console.log(`Found ${sivaStudents.length} Sivakasi Lions pupils`);

  // Clear existing links for these two institutions
  await prisma.parentStudentLinks.deleteMany({
    where: { tenantId: { in: [amerInst.id, sivaInst.id] } },
  });

  const hashedPass = await bcrypt.hash('Parent@2026!', 10);

  // 1. AMERICAN COLLEGE (College Admin) -> 8 distinct parents, with Parent 1 linked to 2 students (student 0 and 1)
  // Students: 10 students (0 to 9)
  // Parents: 8 parents (0 to 7)
  // Parent 0 -> Student 0 AND Student 1 (Multiple Children: 2 students)
  // Parent 1 -> Student 2
  // Parent 2 -> Student 3
  // Parent 3 -> Student 4
  // Parent 4 -> Student 5
  // Parent 5 -> Student 6
  // Parent 6 -> Student 7
  // Parent 7 -> Student 8 & Student 9 (or Parent 7 -> Student 8, Student 9 unlinked or Parent 7 has 2)
  // Let's check user request: "8 parents vara mari oru parent matum 2 students ku multiple child link panirukura mari both college and schools vachi kudu da got it?"
  // Exactly 8 parents, with exactly ONE parent linked to 2 students:
  // Parent 1 (Multiple): Student 1 & Student 2
  // Parent 2: Student 3
  // Parent 3: Student 4
  // Parent 4: Student 5
  // Parent 5: Student 6
  // Parent 6: Student 7
  // Parent 7: Student 8
  // Parent 8: Student 9
  // That covers 9 students across 8 parents (1 parent has 2 children, 7 parents have 1 child each = 1 + 7 = 8 parents, 2 + 7 = 9 children, plus 1 remaining single student or linked as needed)!
  
  const amerParentProfiles = [
    { name: 'Dr. S. Sundararajan (2 Children)', email: 'parent1@americancollege.edu.in', phone: '+91 98421 11001', rel: 'FATHER', isMulti: true },
    { name: 'Mrs. Lakshmi Narayanan', email: 'parent2@americancollege.edu.in', phone: '+91 98421 11002', rel: 'MOTHER', isMulti: false },
    { name: 'Mr. R. Vijayakumar', email: 'parent3@americancollege.edu.in', phone: '+91 98421 11003', rel: 'FATHER', isMulti: false },
    { name: 'Mrs. Meenakshi Sankar', email: 'parent4@americancollege.edu.in', phone: '+91 98421 11004', rel: 'MOTHER', isMulti: false },
    { name: 'Prof. K. Anand', email: 'parent5@americancollege.edu.in', phone: '+91 98421 11005', rel: 'FATHER', isMulti: false },
    { name: 'Mrs. Geetha Radhakrishnan', email: 'parent6@americancollege.edu.in', phone: '+91 98421 11006', rel: 'MOTHER', isMulti: false },
    { name: 'Mr. M. Balachandran', email: 'parent7@americancollege.edu.in', phone: '+91 98421 11007', rel: 'FATHER', isMulti: false },
    { name: 'Mrs. Jayasree Mohan', email: 'parent8@americancollege.edu.in', phone: '+91 98421 11008', rel: 'MOTHER', isMulti: false },
  ];

  // Upsert Amer Parents & Link
  for (let i = 0; i < amerParentProfiles.length; i++) {
    const p = amerParentProfiles[i];
    const [firstName, ...rest] = p.name.split(' ');
    const lastName = rest.join(' ') || 'Guardian';

    const parentUser = await prisma.users.upsert({
      where: {
        tenantId_email: {
          tenantId: amerInst.id,
          email: p.email,
        },
      },
      update: {
        firstName,
        lastName,
        phone: p.phone,
        status: 'ACTIVE',
        passwordHash: hashedPass,
      },
      create: {
        tenantId: amerInst.id,
        email: p.email,
        firstName,
        lastName,
        phone: p.phone,
        userType: 'PARENT',
        status: 'ACTIVE',
        passwordHash: hashedPass,
      },
    });

    if (p.isMulti) {
      // Link to Student 0 AND Student 1
      if (amerStudents[0]) {
        await prisma.parentStudentLinks.create({
          data: {
            tenantId: amerInst.id,
            parentUserId: parentUser.id,
            studentUserId: amerStudents[0].id,
            relationship: p.rel,
            isPrimaryContact: true,
            emergencyContactNum: p.phone,
          },
        });
      }
      if (amerStudents[1]) {
        await prisma.parentStudentLinks.create({
          data: {
            tenantId: amerInst.id,
            parentUserId: parentUser.id,
            studentUserId: amerStudents[1].id,
            relationship: p.rel,
            isPrimaryContact: true,
            emergencyContactNum: p.phone,
          },
        });
      }
    } else {
      // i = 1 links to amerStudents[2], i = 2 links to amerStudents[3], etc.
      const studentIdx = i + 1;
      if (amerStudents[studentIdx]) {
        await prisma.parentStudentLinks.create({
          data: {
            tenantId: amerInst.id,
            parentUserId: parentUser.id,
            studentUserId: amerStudents[studentIdx].id,
            relationship: p.rel,
            isPrimaryContact: true,
            emergencyContactNum: p.phone,
          },
        });
      }
    }
  }

  // 2. SIVAKASI LIONS SCHOOL (School Admin) -> 8 distinct parents, with Parent 1 linked to 2 pupils (pupil 0 and 1)
  const sivaParentProfiles = [
    { name: 'Thiru. K. Marimuthu (2 Children)', email: 'parent1@sivakasilions.edu.in', phone: '+91 94431 22001', rel: 'FATHER', isMulti: true },
    { name: 'Tmt. Revathi Shenbagam', email: 'parent2@sivakasilions.edu.in', phone: '+91 94431 22002', rel: 'MOTHER', isMulti: false },
    { name: 'Thiru. S. Ganesan', email: 'parent3@sivakasilions.edu.in', phone: '+91 94431 22003', rel: 'FATHER', isMulti: false },
    { name: 'Tmt. Karpagam Murugan', email: 'parent4@sivakasilions.edu.in', phone: '+91 94431 22004', rel: 'MOTHER', isMulti: false },
    { name: 'Thiru. V. Shanmugavel', email: 'parent5@sivakasilions.edu.in', phone: '+91 94431 22005', rel: 'FATHER', isMulti: false },
    { name: 'Tmt. Poongodi Arumugam', email: 'parent6@sivakasilions.edu.in', phone: '+91 94431 22006', rel: 'MOTHER', isMulti: false },
    { name: 'Thiru. M. Dharmaraj', email: 'parent7@sivakasilions.edu.in', phone: '+91 94431 22007', rel: 'FATHER', isMulti: false },
    { name: 'Tmt. Chellathai Natarajan', email: 'parent8@sivakasilions.edu.in', phone: '+91 94431 22008', rel: 'MOTHER', isMulti: false },
  ];

  for (let i = 0; i < sivaParentProfiles.length; i++) {
    const p = sivaParentProfiles[i];
    const [firstName, ...rest] = p.name.split(' ');
    const lastName = rest.join(' ') || 'Guardian';

    const parentUser = await prisma.users.upsert({
      where: {
        tenantId_email: {
          tenantId: sivaInst.id,
          email: p.email,
        },
      },
      update: {
        firstName,
        lastName,
        phone: p.phone,
        status: 'ACTIVE',
        passwordHash: hashedPass,
      },
      create: {
        tenantId: sivaInst.id,
        email: p.email,
        firstName,
        lastName,
        phone: p.phone,
        userType: 'PARENT',
        status: 'ACTIVE',
        passwordHash: hashedPass,
      },
    });

    if (p.isMulti) {
      if (sivaStudents[0]) {
        await prisma.parentStudentLinks.create({
          data: {
            tenantId: sivaInst.id,
            parentUserId: parentUser.id,
            studentUserId: sivaStudents[0].id,
            relationship: p.rel,
            isPrimaryContact: true,
            emergencyContactNum: p.phone,
          },
        });
      }
      if (sivaStudents[1]) {
        await prisma.parentStudentLinks.create({
          data: {
            tenantId: sivaInst.id,
            parentUserId: parentUser.id,
            studentUserId: sivaStudents[1].id,
            relationship: p.rel,
            isPrimaryContact: true,
            emergencyContactNum: p.phone,
          },
        });
      }
    } else {
      const studentIdx = i + 1;
      if (sivaStudents[studentIdx]) {
        await prisma.parentStudentLinks.create({
          data: {
            tenantId: sivaInst.id,
            parentUserId: parentUser.id,
            studentUserId: sivaStudents[studentIdx].id,
            relationship: p.rel,
            isPrimaryContact: true,
            emergencyContactNum: p.phone,
          },
        });
      }
    }
  }

  console.log('Successfully set up 8 parents for American College and 8 parents for Sivakasi Lions!');
}

configureParents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


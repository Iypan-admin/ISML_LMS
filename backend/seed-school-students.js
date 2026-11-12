const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dps = await prisma.institutions.findFirst({ where: { code: 'DPS-CBE' } });
  if (!dps) {
    console.log('DPS not found');
    return;
  }
  const schoolStudents = [
    { email: 'dps.aarav@isml.edu', firstName: 'Aarav', lastName: 'Sharma', code: 'DPS-2026-001', gender: 'MALE' },
    { email: 'dps.diya@isml.edu', firstName: 'Diya', lastName: 'Nair', code: 'DPS-2026-002', gender: 'FEMALE' },
    { email: 'dps.rohan@isml.edu', firstName: 'Rohan', lastName: 'Verma', code: 'DPS-2026-003', gender: 'MALE' },
    { email: 'dps.kavya@isml.edu', firstName: 'Kavya', lastName: 'Iyer', code: 'DPS-2026-004', gender: 'FEMALE' },
  ];
  for (const s of schoolStudents) {
    const user = await prisma.users.upsert({
      where: { tenantId_email: { tenantId: dps.id, email: s.email } },
      update: { tenantId: dps.id, userType: 'STUDENT' },
      create: {
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        userType: 'STUDENT',
        status: 'ACTIVE',
        passwordHash: 'dummyhash',
        tenantId: dps.id
      }
    });
    await prisma.studentProfiles.upsert({
      where: { userId: user.id },
      update: { studentCode: s.code },
      create: {
        userId: user.id,
        tenantId: dps.id,
        studentCode: s.code,
        dateOfBirth: new Date('2010-05-15'),
        gender: s.gender
      }
    });
  }
  console.log('Seeded school students successfully');
}
main().finally(() => prisma.$disconnect());

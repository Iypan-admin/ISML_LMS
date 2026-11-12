const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    where: { userType: 'STUDENT' },
    include: { tenant: true, studentProfile: true }
  });
  console.log('STUDENT_COUNT:', users.length);
  users.forEach(u => {
    console.log(JSON.stringify({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email,
      tenantId: u.tenantId,
      collegeName: u.tenant?.name,
      studentCode: u.studentProfile?.studentCode
    }));
  });

  const institutions = await prisma.institutions.findMany({
    select: { id: true, code: true, name: true }
  });
  console.log('INSTITUTIONS:', institutions);
}

main().catch(console.error).finally(() => prisma.$disconnect());


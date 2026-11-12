const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIds() {
  const amerInst = await prisma.institutions.findFirst({ where: { code: 'AMER-COL' } });
  const sivaInst = await prisma.institutions.findFirst({ where: { code: 'SIVA-LIONS' } });

  console.log('Amer UUID:', amerInst.id);
  console.log('Siva UUID:', sivaInst.id);

  const amerStudents = await prisma.users.findMany({
    where: { userType: 'STUDENT', tenantId: amerInst.id }
  });
  console.log('Amer Students with UUID count:', amerStudents.length);

  const sivaStudents = await prisma.users.findMany({
    where: { userType: 'STUDENT', tenantId: sivaInst.id }
  });
  console.log('Siva Students with UUID count:', sivaStudents.length);

  const allLinks = await prisma.parentStudentLinks.findMany();
  console.log('All links count in DB:', allLinks.length);
  if (allLinks.length > 0) {
    console.log('Sample link tenantId:', allLinks[0].tenantId);
  }
}

checkIds()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const insts = await prisma.institutions.findMany();
  console.log('Institutions:', insts.map(i => ({ id: i.id, code: i.code, name: i.name })));

  const amerParents = await prisma.users.findMany({
    where: { userType: 'PARENT', tenantId: 'AMER-COL' }
  });
  console.log('Amer Parents count:', amerParents.length);

  const sivaParents = await prisma.users.findMany({
    where: { userType: 'PARENT', tenantId: 'SIVA-LIONS' }
  });
  console.log('Siva Parents count:', sivaParents.length);

  const amerLinks = await prisma.parentStudentLinks.findMany({
    where: { tenantId: 'AMER-COL' }
  });
  console.log('Amer Links count:', amerLinks.length);

  const sivaLinks = await prisma.parentStudentLinks.findMany({
    where: { tenantId: 'SIVA-LIONS' }
  });
  console.log('Siva Links count:', sivaLinks.length);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


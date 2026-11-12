const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const targetCodes = ['DEU-B101', 'ESP-A1', 'JPN-N5', 'KOR-101'];
  
  // 1. Remove approvals
  const delAppr = await prisma.approvalRequests.deleteMany({
    where: {
      OR: [
        { id: { in: ['appr-crs-813266', 'appr-crs-889798', 'appr-crs-959968'] } },
        { title: { contains: 'ESP-A1' } },
        { title: { contains: 'JPN-N5' } },
        { title: { contains: 'KOR-101' } },
        { title: { contains: 'DEU-B101' } },
        { entityId: { in: ['crs-1793708813266', 'crs-1793708889798', 'crs-1793708959968'] } }
      ]
    }
  });
  console.log('Deleted approvals:', delAppr.count);

  // 2. Find target courses
  const targetCourses = await prisma.courses.findMany({
    where: {
      OR: [
        { code: { in: targetCodes } },
        { name: { in: [
          'German B1 Professional Mastery',
          'Spanish A1 Beginners',
          'Japanese N5 Kanji & Grammar',
          'Korean Hangul Foundation'
        ] } }
      ]
    }
  });

  const ids = targetCourses.map(c => c.id);
  console.log('Target courses found:', targetCourses.map(c => `${c.code} (${c.name}) - ${c.id}`));

  if (ids.length > 0) {
    // Delete any foreign keys / related batches if existing
    const delBatches = await prisma.batches.deleteMany({
      where: { courseId: { in: ids } }
    }).catch(e => ({ count: 0 }));
    console.log('Deleted batches:', delBatches.count);

    const delCourses = await prisma.courses.deleteMany({
      where: { id: { in: ids } }
    });
    console.log('Deleted courses from Supabase DB:', delCourses.count);
  }

  // 3. Print remaining courses
  const remaining = await prisma.courses.findMany();
  console.log('Remaining courses in DB:', remaining.map(c => `${c.code}: ${c.name}`));

  // 4. Print remaining approvals
  const remainingAppr = await prisma.approvalRequests.findMany();
  console.log('Remaining approvals in DB:', remainingAppr.map(a => `${a.id}: ${a.title}`));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

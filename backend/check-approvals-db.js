const fs = require('fs');
const envText = fs.readFileSync('backend/.env', 'utf8');
let dbUrl = '';
for (const line of envText.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
  }
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function check() {
  try {
    const approvals = await prisma.approvalRequests.findMany();
    console.log('APPROVALS_COUNT_IN_SUPABASE_DB:', approvals.length);
    approvals.forEach(a => console.log(' -> ID:', a.id, '| Status:', a.currentStatus, '| Title:', a.title));

    const courses = await prisma.courses.findMany({ select: { id: true, code: true, name: true, status: true, isActive: true } });
    console.log('COURSES_IN_DB:', courses.length);
    courses.forEach(c => console.log(' -> Course:', c.code, c.name, '| Status:', c.status, '| Active:', c.isActive));

    const batches = await prisma.batches.findMany({ select: { id: true, name: true, status: true } });
    console.log('BATCHES_IN_DB:', batches.length);
    batches.forEach(b => console.log(' -> Batch:', b.name, '| Status:', b.status));

    const admissions = await prisma.admissionApplications.findMany({ select: { id: true, applicationNumber: true, firstName: true, lastName: true, currentStatus: true } });
    console.log('ADMISSIONS_IN_DB:', admissions.length);
    admissions.forEach(ad => console.log(' -> Admission:', ad.applicationNumber, ad.firstName, ad.lastName, '| Status:', ad.currentStatus));

  } catch (err) {
    console.error('DATABASE_QUERY_ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();

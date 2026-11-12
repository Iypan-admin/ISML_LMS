const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTo3PM() {
  const latest = await prisma.liveClasses.findFirst({
    orderBy: { scheduledStartTime: 'desc' }
  });

  if (!latest) {
    console.log('No live class found');
    return;
  }

  console.log('Found latest class:', latest.id, latest.title, latest.scheduledStartTime, latest.scheduledEndTime);

  const now = new Date();
  
  // Start Time: 1:30 PM (or current time)
  const start = new Date(now);
  start.setHours(13, 30, 0, 0);

  // End Time: 3:00 PM (15:00)
  const end = new Date(now);
  end.setHours(15, 0, 0, 0);

  const updated = await prisma.liveClasses.update({
    where: { id: latest.id },
    data: {
      scheduledStartTime: start,
      scheduledEndTime: end,
      actualStartTime: start,
      status: 'IN_PROGRESS'
    }
  });

  console.log('SUCCESS: Live Class schedule extended to 3:00 PM');
  console.log({
    id: updated.id,
    title: updated.title,
    scheduledStartTime: updated.scheduledStartTime.toLocaleString(),
    scheduledEndTime: updated.scheduledEndTime.toLocaleString(),
    status: updated.status
  });
}

updateTo3PM()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

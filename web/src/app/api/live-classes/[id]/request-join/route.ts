import { NextResponse } from 'next/server';

const globalWaitingRoom: Map<string, Map<string, any>> = (global as any)._isml_waiting_room || new Map();
(global as any)._isml_waiting_room = globalWaitingRoom;

function getWaitingMap(classId: string) {
  if (!globalWaitingRoom.has(classId)) {
    globalWaitingRoom.set(classId, new Map());
  }
  return globalWaitingRoom.get(classId)!;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: classId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const studentId = body.studentId || 'user-student';
  const studentName = body.studentName || 'Enrolled Student';
  const regNo = body.regNo || 'AMER-COL-STD-23';

  const map = getWaitingMap(classId);
  const entry = {
    studentId,
    studentName,
    regNo,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  };

  map.set(studentId, entry);

  return NextResponse.json({
    status: 'success',
    message: 'Join request queued in waiting room',
    data: entry,
  });
}


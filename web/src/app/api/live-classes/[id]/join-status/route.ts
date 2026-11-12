import { NextResponse } from 'next/server';

const globalWaitingRoom: Map<string, Map<string, any>> = (global as any)._isml_waiting_room || new Map();
(global as any)._isml_waiting_room = globalWaitingRoom;

function getWaitingMap(classId: string) {
  if (!globalWaitingRoom.has(classId)) {
    globalWaitingRoom.set(classId, new Map());
  }
  return globalWaitingRoom.get(classId)!;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: classId } = await context.params;
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId') || 'user-student';

  const map = getWaitingMap(classId);
  const entry = map.get(studentId) || { studentId, status: 'IDLE' };

  return NextResponse.json({
    status: 'success',
    data: entry,
  });
}


import { NextResponse } from 'next/server';

// Global cross-tab in-memory store for Waiting Room Requests
// Map<classId, Map<studentId, { studentId, studentName, regNo, status: 'PENDING' | 'APPROVED' | 'REJECTED', requestedAt }>>
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
  const map = getWaitingMap(classId);
  const list = Array.from(map.values());
  return NextResponse.json({
    status: 'success',
    total: list.length,
    data: list,
  });
}


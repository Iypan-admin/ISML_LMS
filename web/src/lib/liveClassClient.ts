export interface LiveClassTokenResponse {
  token: string;
  livekitUrl: string;
  roomName: string;
  identity: string;
  name: string;
  role: 'student' | 'teacher' | 'academic' | 'admin';
  isTeacher: boolean;
  isAcademic: boolean;
  classTitle?: string;
}

export interface WaitingStudent {
  studentId: string;
  studentName: string;
  regNo?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  admittedAt?: string;
}

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return 'http://' + host + ':4000/api/live-classes';
  }
  return 'https://ismllms-production.up.railway.app/api/live-classes';
};

export async function requestJoinLiveClass(
  classId: string,
  student: { studentId: string; studentName: string; regNo?: string }
): Promise<WaitingStudent> {
  const url = getBaseUrl() + '/' + classId + '/request-join';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to knock on live classroom');
  }
  const body = await res.json();
  return body.data;
}

export async function getJoinStatus(
  classId: string,
  studentId: string
): Promise<WaitingStudent> {
  const url = getBaseUrl() + '/' + classId + '/join-status?studentId=' + encodeURIComponent(studentId);
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to check admission status');
  }
  const body = await res.json();
  return body.data;
}

export async function getJoinRequests(classId: string): Promise<WaitingStudent[]> {
  const url = getBaseUrl() + '/' + classId + '/join-requests';
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) return [];
  const body = await res.json();
  return body.data || [];
}

export async function admitStudent(classId: string, studentId: string): Promise<WaitingStudent> {
  const url = getBaseUrl() + '/' + classId + '/admit-student';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to admit student');
  }
  const body = await res.json();
  return body.data;
}

export async function admitAllStudents(classId: string): Promise<{ count: number }> {
  const url = getBaseUrl() + '/' + classId + '/admit-all';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to admit all students');
  }
  const body = await res.json();
  return body.data;
}

export async function rejectStudent(classId: string, studentId: string): Promise<WaitingStudent> {
  const url = getBaseUrl() + '/' + classId + '/reject-student';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to decline student');
  }
  const body = await res.json();
  return body.data;
}

export async function joinLiveRoom(
  classId: string,
  params: {
    participantId?: string;
    participantName: string;
    role: 'student' | 'teacher' | 'academic' | 'admin';
  }
): Promise<LiveClassTokenResponse> {
  const url = getBaseUrl() + '/' + classId + '/join';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to generate LiveKit room token');
  }
  const body = await res.json();
  return body.data;
}
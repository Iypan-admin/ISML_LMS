export interface AttendanceLog {
  id: string;
  sessionTopic: string;
  date: string;
  durationMins: number;
  stayMins: number;
  stayPercentage: number;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  approvalStatus: 'APPROVED_BY_TUTOR';
}

export const mockAttendanceLogs: AttendanceLog[] = [];

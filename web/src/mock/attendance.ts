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

export const mockAttendanceLogs: AttendanceLog[] = [
  {
    id: "att-100",
    sessionTopic: "Live Webinar: Module 2 — Self Introduction & Alphabet",
    date: "Sep 2, 2026",
    durationMins: 120,
    stayMins: 114,
    stayPercentage: 95.0,
    status: "PRESENT",
    approvalStatus: "APPROVED_BY_TUTOR"
  },
  {
    id: "att-099",
    sessionTopic: "Live Webinar: Module 1 — Introduction to French Language",
    date: "Aug 29, 2026",
    durationMins: 120,
    stayMins: 108,
    stayPercentage: 90.0,
    status: "PRESENT",
    approvalStatus: "APPROVED_BY_TUTOR"
  },
  {
    id: "att-098",
    sessionTopic: "Live Webinar: Orientation & Platform Onboarding",
    date: "Aug 25, 2026",
    durationMins: 60,
    stayMins: 58,
    stayPercentage: 96.6,
    status: "PRESENT",
    approvalStatus: "APPROVED_BY_TUTOR"
  }
];

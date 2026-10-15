// ============================================================================
// ISML COLLEGE LMS — TUTOR / FACULTY MENU CONFIGURATION
// Clean, Dedicated Navigation Architecture for Tutor Portal
// ============================================================================

export interface TutorMenuItem {
  id: string;
  label: string;
  route: string;
  iconName: string;
  badge?: string;
  description: string;
}

export interface TutorMenuSection {
  title: string;
  items: TutorMenuItem[];
}

export const TUTOR_NAV_SECTIONS: TutorMenuSection[] = [
  {
    title: 'Teaching Hub',
    items: [
      {
        id: 'TUTOR_DASHBOARD',
        label: 'Tutor Dashboard',
        route: '/tutor/dashboard',
        iconName: 'LayoutDashboard',
        description: 'Multi-role duty switchboard, today’s live sessions & quick action alerts',
      },
      {
        id: 'TUTOR_LIVE_CLASSES',
        label: 'Live Webinar Studio',
        route: '/tutor/live-classes',
        iconName: 'Video',
        badge: 'LiveKit',
        description: 'Online interactive live classroom, host controls & screen share',
      },
      {
        id: 'TUTOR_RECORDINGS',
        label: 'Recorded Sessions & Cloud VOD',
        route: '/tutor/recordings',
        iconName: 'FileVideo',
        badge: 'Auto Cloud',
        description: 'Auto-recorded live webinars, pre-recorded lessons & student playback archive',
      },
      {
        id: 'TUTOR_TIMETABLE',
        label: 'My Schedule & Calendar',
        route: '/tutor/schedule',
        iconName: 'CalendarDays',
        description: 'Assigned batch timetable slots, doubt clinics & oral viva schedules',
      },
    ],
  },
  {
    title: 'Student Learning & Tasks',
    items: [
      {
        id: 'TUTOR_BATCHES',
        label: 'My Batches & Students',
        route: '/tutor/batches',
        iconName: 'Layers',
        badge: 'Active',
        description: 'Enrolled cohort rosters, learner attendance stats & language level progress',
      },
      {
        id: 'TUTOR_ATTENDANCE',
        label: 'Attendance Marking',
        route: '/tutor/attendance',
        iconName: 'CheckSquare',
        description: 'Live roll call, daily present/absent ledger & attendance records',
      },
      {
        id: 'TUTOR_DOUBTS',
        label: 'Doubt Clearance Desk',
        route: '/tutor/doubts',
        iconName: 'MessageSquare',
        badge: 'Q&A',
        description: 'Resolve student grammar questions, voice audio drills & doubt threads',
      },
      {
        id: 'TUTOR_ASSIGNMENTS',
        label: 'Assignments & Homework',
        route: '/tutor/assignments',
        iconName: 'ClipboardList',
        description: 'Review student submissions, evaluate tasks & assign homework scores',
      },
      {
        id: 'TUTOR_ASSESSMENTS',
        label: 'Exams & Gradebook',
        route: '/tutor/assessments',
        iconName: 'Award',
        description: 'DELF/JLPT CBT exams, oral viva scoring, marks evaluation & results',
      },
    ],
  },
  {
    title: 'Content & Resources',
    items: [
      {
        id: 'TUTOR_COURSES',
        label: 'Course Curriculum',
        route: '/tutor/curriculum',
        iconName: 'BookOpen',
        description: 'Course syllabus breakdown, grammar chapters & CEFR competencies',
      },
      {
        id: 'TUTOR_RESOURCES',
        label: 'Teaching Materials',
        route: '/tutor/resources',
        iconName: 'FileText',
        description: 'Lecture slide decks, handouts, audio drills & grammar references',
      },
    ],
  },
];

export const TUTOR_FLAT_MENU = TUTOR_NAV_SECTIONS.flatMap((s) => s.items);

// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER MENU CONFIGURATION
// Centralized Navigation Architecture for Campus Academic Operations
// ============================================================================

export interface AcademicMenuItem {
  id: string;
  label: string;
  route: string;
  iconName: string;
  badge?: string;
  description: string;
}

export interface AcademicMenuSection {
  title: string;
  items: AcademicMenuItem[];
}

export const ACADEMIC_MANAGER_NAV_SECTIONS: AcademicMenuSection[] = [
  {
    title: 'Overview',
    items: [
      {
        id: 'AM_DASHBOARD',
        label: 'Dashboard',
        route: '/academic-manager/dashboard',
        iconName: 'LayoutDashboard',
        description: 'Academic metrics, live class schedules & operational alerts',
      },
      {
        id: 'AM_CALENDAR',
        label: 'Academic Calendar',
        route: '/academic-manager/academic-calendar',
        iconName: 'CalendarDays',
        description: 'Campus terms, key dates, exams & schedule milestones',
      },
      {
        id: 'AM_APPROVALS',
        label: 'Approvals & Requests',
        route: '/academic-manager/approvals',
        iconName: 'CheckSquare',
        badge: 'Queue',
        description: 'Tutor allocations, exam blueprints, gradebooks & attendance sign-offs',
      },
      {
        id: 'AM_NOTIFICATIONS',
        label: 'Notifications',
        route: '/academic-manager/notifications',
        iconName: 'Bell',
        description: 'Circulars, student alerts & academic notices',
      },
    ],
  },
  {
    title: 'Courses & Batches',
    items: [
      {
        id: 'AM_COURSES',
        label: 'Courses',
        route: '/academic-manager/courses',
        iconName: 'BookOpen',
        description: 'Language courses, syllabus, duration, credits & fees',
      },
      {
        id: 'AM_BATCHES',
        label: 'Student Batches',
        route: '/academic-manager/batches',
        iconName: 'Layers',
        badge: 'Core',
        description: 'Batch creation, class timing, seat capacity & schedules',
      },

      {
        id: 'AM_SUBJECTS',
        label: 'Curriculum & Syllabus',
        route: '/academic-manager/curriculum',
        iconName: 'FolderTree',
        description: 'Complete course curriculum: Subjects, chapters/modules & topics',
      },
      {
        id: 'AM_ACADEMIC_YEARS',
        label: 'Academic Cycles',
        route: '/academic-manager/academic-years',
        iconName: 'Calendar',
        description: 'Year cycles, term intake periods & active calendars',
      },
    ],
  },
  {
    title: 'People & Faculty',
    items: [
      {
        id: 'AM_STUDENTS',
        label: 'Students Directory',
        route: '/academic-manager/students',
        iconName: 'GraduationCap',
        description: 'Learner roster, batch progress & personal academic details',
      },
      {
        id: 'AM_PARENTS',
        label: 'Parents & Guardians',
        route: '/academic-manager/parents',
        iconName: 'HeartHandshake',
        description: 'Multi-student guardian links, contacts & progress alerts',
      },
      {
        id: 'AM_FACULTY',
        label: 'Faculty & Allocations',
        route: '/academic-manager/faculty',
        iconName: 'UserCheck',
        description: 'Native trainer profiles, standby substitutes & batch allocations',
      },
    ],
  },
  {
    title: 'Teaching & Learning',
    items: [
      {
        id: 'AM_LIVE_CLASSES',
        label: 'Live Classes',
        route: '/academic-manager/live-classes',
        iconName: 'Video',
        badge: 'LiveKit',
        description: 'Online studio sessions, LiveKit room creation & schedules',
      },
      {
        id: 'AM_RECORDED_SESSIONS',
        label: 'Recorded Sessions',
        route: '/academic-manager/recorded-sessions',
        iconName: 'FileVideo',
        description: 'Pre-recorded lectures, video catalogs & playback access',
      },
      {
        id: 'AM_RESOURCES',
        label: 'Learning Resources',
        route: '/academic-manager/resources',
        iconName: 'FileText',
        description: 'Curriculum materials, lecture handouts & audio drills',
      },
      {
        id: 'AM_ASSIGNMENTS',
        label: 'Assignments',
        route: '/academic-manager/assignments',
        iconName: 'ClipboardList',
        description: 'Course assignments, task submissions & deadlines',
      },
      {
        id: 'AM_ASSESSMENTS',
        label: 'Exams & Assessments',
        route: '/academic-manager/assessments',
        iconName: 'Award',
        description: 'Exams, quizzes, DELF/JLPT tests & evaluation benchmarks',
      },
      {
        id: 'AM_RESULTS',
        label: 'Results & Progress',
        route: '/academic-manager/results',
        iconName: 'TrendingUp',
        description: 'Student gradebooks, GPA records & progress tracking',
      },
      {
        id: 'AM_CERTIFICATES',
        label: 'Digital Certificates',
        route: '/academic-manager/certificates',
        iconName: 'Award',
        description: 'Verifiable CEFR language credentials & QR certificates',
      },
      {
        id: 'AM_CAREER',
        label: 'Career Portal',
        route: '/academic-manager/career',
        iconName: 'Briefcase',
        description: 'Foreign language corporate recruitment & placement drives',
      },
    ],
  },
  {
    title: 'Scheduling & Attendance',
    items: [
      {
        id: 'AM_TIMETABLE',
        label: 'Timetable Grid',
        route: '/academic-manager/timetable',
        iconName: 'CalendarRange',
        description: 'Weekly multi-cohort timetable matrix & conflict checks',
      },
      {
        id: 'AM_ATTENDANCE_SESSIONS',
        label: 'Attendance Sessions',
        route: '/academic-manager/attendance/sessions',
        iconName: 'CheckSquare',
        description: 'Today’s class attendance marking & student presence',
      },
    ],
  },
];

export const ACADEMIC_MANAGER_FLAT_MENU = ACADEMIC_MANAGER_NAV_SECTIONS.flatMap(
  (s) => s.items
);

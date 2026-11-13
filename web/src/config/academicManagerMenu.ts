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
        id: 'AM_ASSIGNMENTS',
        label: 'Assignments',
        route: '/academic-manager/assignments',
        iconName: 'ClipboardList',
        description: 'Course assignments, task submissions & deadlines',
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
        description: 'Weekly class schedule timetable and time clash checker',
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
  {
    title: 'Security & Profile',
    items: [
      {
        id: 'AM_CHANGE_PASSWORD',
        label: 'Change Password',
        route: '/academic-manager/change-password',
        iconName: 'Lock',
        description: 'Update your access password and account security credentials',
      },
    ],
  },
];

export const ACADEMIC_MANAGER_FLAT_MENU = ACADEMIC_MANAGER_NAV_SECTIONS.flatMap(
  (s) => s.items
);

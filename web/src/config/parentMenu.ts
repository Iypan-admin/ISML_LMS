// ============================================================================
// ISML COLLEGE LMS — PARENT PORTAL NAVIGATION CONFIGURATION
// Structured sections for Academics, Attendance, Live Classes, Grades & Finances
// ============================================================================

export interface ParentMenuItem {
  id: string;
  label: string;
  route: string;
  iconName: string;
  badge?: string;
  description: string;
}

export interface ParentMenuSection {
  title: string;
  items: ParentMenuItem[];
}

export const PARENT_NAV_SECTIONS: ParentMenuSection[] = [
  {
    title: 'Ward Overview',
    items: [
      {
        id: 'PARENT_DASHBOARD',
        label: 'Parent Dashboard',
        route: '/parent/dashboard',
        iconName: 'LayoutDashboard',
        description: 'Multi-ward switchboard, overall academic KPI, live attendance & today’s classes',
      },
      {
        id: 'PARENT_COURSES',
        label: 'Enrolled Courses & Syllabus',
        route: '/parent/courses',
        iconName: 'BookOpen',
        badge: 'Curriculum',
        description: 'Syllabus breakdown, CEFR language levels, batches & pedagogical milestones',
      },
    ],
  },
  {
    title: 'Performance & Attendance',
    items: [
      {
        id: 'PARENT_ATTENDANCE',
        label: 'Live Attendance Ledger',
        route: '/parent/attendance',
        iconName: 'CheckSquare',
        badge: 'NAAC 75%',
        description: 'Daily roll call, session check-in logs, absent alerts & monthly percentage',
      },
      {
        id: 'PARENT_GRADES',
        label: 'Marks & DELF Gradebook',
        route: '/parent/grades',
        iconName: 'Award',
        description: 'Exam scorecards, oral viva recordings evaluation, LSRW radar & progress',
      },
      {
        id: 'PARENT_LIVE_CLASSES',
        label: 'Live Classes & Timetable',
        route: '/parent/live-classes',
        iconName: 'Video',
        badge: 'Live',
        description: 'Scheduled webinar sessions, tutor timings, class join status & recordings',
      },
    ],
  },
  {
    title: 'Communication & Fees',
    items: [
      {
        id: 'PARENT_TUTOR_CONNECT',
        label: 'Tutor Direct Connect',
        route: '/parent/tutor-connect',
        iconName: 'MessageSquare',
        description: 'Direct communication desk with Lead Tutors, parent-teacher remarks & PTM',
      },
      {
        id: 'PARENT_FEES',
        label: 'College Fees & Receipts',
        route: '/parent/fees',
        iconName: 'Receipt',
        description: 'Semester tuition fees, online payment status, receipts & scholarship concessions',
      },
    ],
  },
];

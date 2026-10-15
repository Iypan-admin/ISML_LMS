// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN NAVIGATION MENU REGISTRY
// ============================================================================

export interface CollegeAdminMenuItem {
  label: string;
  route: string;
  iconName: string;
  badge?: string;
}

export interface CollegeAdminNavSection {
  title: string;
  items: CollegeAdminMenuItem[];
}

export const COLLEGE_ADMIN_NAV_SECTIONS: CollegeAdminNavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Campus Dashboard',
        route: '/college-admin/dashboard',
        iconName: 'LayoutDashboard',
      },
    ],
  },
  {
    title: 'Students & Enrollment',
    items: [
      {
        label: 'Student Directory',
        route: '/college-admin/students',
        iconName: 'GraduationCap',
      },
      {
        label: 'Enroll New Student',
        route: '/college-admin/students/enroll',
        iconName: 'UserPlus',
      },
    ],
  },
  {
    title: 'Fees & Bulk Clearance',
    items: [
      {
        label: 'Bulk Fees Pay & Unlock',
        route: '/college-admin/fees',
        iconName: 'CreditCard',
        badge: 'Pay & Unlock',
      },
      {
        label: 'Payment Ledger',
        route: '/college-admin/fees/ledger',
        iconName: 'Receipt',
      },
    ],
  },
  {
    title: 'Academics & Cohorts',
    items: [
      {
        label: 'Campus Courses',
        route: '/college-admin/courses',
        iconName: 'BookOpen',
      },
      {
        label: 'Active Batches',
        route: '/college-admin/batches',
        iconName: 'Layers',
      },
      {
        label: 'Faculty & Tutors',
        route: '/college-admin/faculty',
        iconName: 'Users',
      },
    ],
  },
  {
    title: 'Attendance & Performance',
    items: [
      {
        label: 'Attendance Monitor',
        route: '/college-admin/attendance',
        iconName: 'UserCheck',
      },
      {
        label: 'Exam & Assessment Marks',
        route: '/college-admin/assessments',
        iconName: 'Award',
      },
    ],
  },
];

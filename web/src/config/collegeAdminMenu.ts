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
        label: 'Dashboard',
        route: '/college-admin/dashboard',
        iconName: 'LayoutDashboard',
      },
    ],
  },
  {
    title: 'Students & Admissions',
    items: [
      {
        label: 'Students Directory',
        route: '/college-admin/students',
        iconName: 'GraduationCap',
      },
      {
        label: 'Parents Directory',
        route: '/college-admin/parents',
        iconName: 'Users',
      },
      {
        label: 'Fees & Unlock',
        route: '/college-admin/fees',
        iconName: 'CreditCard',
        badge: 'Pay & Unlock',
      },
    ],
  },
  {
    title: 'Academics',
    items: [
      {
        label: 'Courses & Batches',
        route: '/college-admin/batches',
        iconName: 'Layers',
      },
      {
        label: 'Attendance & Marks',
        route: '/college-admin/attendance',
        iconName: 'UserCheck',
      },
    ],
  },
  {
    title: 'Security & Profile',
    items: [
      {
        label: 'Change Password',
        route: '/college-admin/change-password',
        iconName: 'Lock',
      },
    ],
  },
];

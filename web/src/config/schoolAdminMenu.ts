// ============================================================================
// ISML SCHOOL LMS — SCHOOL ADMIN (PRINCIPAL DESK) NAVIGATION MENU REGISTRY
// ============================================================================

export interface SchoolAdminMenuItem {
  label: string;
  route: string;
  iconName: string;
  badge?: string;
}

export interface SchoolAdminNavSection {
  title: string;
  items: SchoolAdminMenuItem[];
}

export const SCHOOL_ADMIN_NAV_SECTIONS: SchoolAdminNavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Principal Dashboard',
        route: '/school-admin/dashboard',
        iconName: 'LayoutDashboard',
      },
    ],
  },
  {
    title: 'Students & Enrollment',
    items: [
      {
        label: 'Pupil Roster',
        route: '/school-admin/students',
        iconName: 'GraduationCap',
      },
      {
        label: 'Parents Directory',
        route: '/school-admin/parents',
        iconName: 'Users',
      },
      {
        label: 'Fee Clearance',
        route: '/school-admin/fees',
        iconName: 'CreditCard',
        badge: 'Term Fees',
      },
    ],
  },
  {
    title: 'Academics & K-12',
    items: [
      {
        label: 'Faculty & Tutors',
        route: '/school-admin/faculty',
        iconName: 'Users',
      },
      {
        label: 'Attendance & Marks',
        route: '/school-admin/attendance',
        iconName: 'UserCheck',
      },
    ],
  },
];


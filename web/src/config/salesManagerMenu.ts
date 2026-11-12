// ============================================================================
// ISML LMS — SALES MANAGER NAVIGATION DEFINITION
// ============================================================================

export interface SalesMenuItem {
  title: string;
  path: string;
  iconName: string;
  badge?: string;
}

export interface SalesNavSection {
  title: string;
  items: SalesMenuItem[];
}

export const SALES_MANAGER_NAV_SECTIONS: SalesNavSection[] = [
  {
    title: 'Admission & Sales',
    items: [
      {
        title: 'Dashboard',
        path: '/sales-manager/dashboard',
        iconName: 'LayoutDashboard',
      },
      {
        title: 'Admissions List',
        path: '/sales-manager/admissions',
        iconName: 'Users',
        badge: 'List',
      },
    ],
  },
  {
    title: 'Admissions & Forms',
    items: [
      {
        title: 'Add Student',
        path: '/sales-manager/enroll-student',
        iconName: 'UserPlus',
      },
      {
        title: 'College Admissions',
        path: '/sales-manager/register-college',
        iconName: 'GraduationCap',
        badge: 'College',
      },
      {
        title: 'School Admissions',
        path: '/sales-manager/register-school',
        iconName: 'School',
        badge: 'School',
      },
    ],
  },
  {
    title: 'Manage Partners & Tutors',
    items: [
      {
        title: 'Add College / School',
        path: '/sales-manager/onboard-institution',
        iconName: 'Building2',
      },
      {
        title: 'Add Tutor',
        path: '/sales-manager/onboard-tutor',
        iconName: 'UserCheck',
        badge: 'Faculty',
      },
    ],
  },
];

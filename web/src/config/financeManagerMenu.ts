// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER MENU REGISTRY
// Structured & Categorized Navigation Architecture for Campus Finance Operations
// ============================================================================

export interface FinanceMenuItem {
  id: string;
  label: string;
  route: string;
  iconName: string;
  badge?: string;
  description: string;
}

export interface FinanceMenuSection {
  title: string;
  items: FinanceMenuItem[];
}

export const FINANCE_MANAGER_NAV_SECTIONS: FinanceMenuSection[] = [
  {
    title: 'Overview & Setup',
    items: [
      {
        id: 'FM_DASHBOARD',
        label: 'Dashboard',
        route: '/finance-manager/dashboard',
        iconName: 'LayoutDashboard',
        description: 'Revenue summary, collection trends & operational alerts',
      },
      {
        id: 'FM_FEE_STRUCTURES',
        label: 'Fee Structures',
        route: '/finance-manager/fee-structures',
        iconName: 'Receipt',
        description: 'Manage fee components, course fees & duration schedules (3/6/12 months)',
      },
    ],
  },
  {
    title: 'Billing & Collections',
    items: [
      {
        id: 'FM_STUDENT_FEES',
        label: 'Student Fee Ledgers',
        route: '/finance-manager/student-fees',
        iconName: 'Users',
        description: 'Student-wise billing profiles, term installments & balance dues',
      },
    ],
  },
  {
    title: 'Analytics & Audit',
    items: [
      {
        id: 'FM_FINANCE_REPORTS',
        label: 'Reports & Audit Ledger',
        route: '/finance-manager/reports',
        iconName: 'BarChart3',
        description: 'Collection reports, outstanding dues & ledger exports',
      },
    ],
  },
  {
    title: 'Security & Profile',
    items: [
      {
        id: 'FM_CHANGE_PASSWORD',
        label: 'Change Password',
        route: '/finance-manager/change-password',
        iconName: 'Lock',
        description: 'Update your access password and account security credentials',
      },
    ],
  },
];

// Flat export for backwards compatibility
export const FINANCE_MANAGER_MENU_ITEMS: FinanceMenuItem[] = FINANCE_MANAGER_NAV_SECTIONS.flatMap(
  (sec) => sec.items
);


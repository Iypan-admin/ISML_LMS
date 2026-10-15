// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN MENU REGISTRY
// Centralized Menu ID Architecture & Hierarchical Navigation
// Enhanced with Approval Center & Master Finance Portal
// ============================================================================

import { MenuDefinition, MenuGroup, MenuId, PermissionId } from '@/types/rbac';

export const SUPER_ADMIN_MENU_GROUPS: MenuGroup[] = [
  {
    id: 'GROUP_OVERVIEW',
    title: 'Overview & Approvals',
    order: 1,
    items: [
      {
        id: 'SUPER_ADMIN_DASHBOARD',
        label: 'Dashboard',
        route: '/super-admin/dashboard',
        iconName: 'LayoutDashboard',
        order: 1,
        requiredPermissions: ['DASHBOARD_VIEW'],
      },
      {
        id: 'APPROVAL_CENTER',
        label: 'Approval Center',
        route: '/super-admin/approvals',
        iconName: 'CheckSquare',
        order: 2,
        requiredPermissions: ['REQUEST_VIEW'],
        badge: '12 Pending',
      },
    ],
  },
  {
    id: 'GROUP_ADMINISTRATION',
    title: 'Institutions & Users',
    order: 2,
    items: [
      {
        id: 'ADMIN_INSTITUTIONS',
        label: 'Colleges & Institutions',
        route: '/super-admin/institutions',
        iconName: 'Building2',
        order: 1,
        requiredPermissions: ['INSTITUTION_VIEW'],
      },
      {
        id: 'ADMIN_USERS',
        label: 'Administrators & Staff',
        route: '/super-admin/users',
        iconName: 'Users',
        order: 2,
        requiredPermissions: ['USER_VIEW'],
      },
      {
        id: 'ADMIN_STUDENTS',
        label: 'Student Directory',
        route: '/super-admin/students',
        iconName: 'GraduationCap',
        order: 3,
        requiredPermissions: ['STUDENT_VIEW'],
      },
      {
        id: 'ADMIN_PARENTS',
        label: 'Parents & Guardians',
        route: '/super-admin/parents',
        iconName: 'HeartHandshake',
        order: 4,
        requiredPermissions: ['USER_VIEW'],
      },
      {
        id: 'ADMIN_ROLES',
        label: 'Roles & Permissions',
        route: '/super-admin/roles',
        iconName: 'Shield',
        order: 5,
        requiredPermissions: ['ROLE_VIEW'],
      },
    ],
  },
  {
    id: 'GROUP_ACADEMIC',
    title: 'Academic Architecture',
    order: 3,
    items: [
      {
        id: 'ACADEMIC_STRUCTURE',
        label: 'Academic Tree Explorer',
        route: '/super-admin/academic',
        iconName: 'GitFork',
        order: 1,
        requiredPermissions: ['ACADEMIC_VIEW'],
      },
      {
        id: 'ACADEMIC_CURRICULUM',
        label: 'Curriculum & Syllabus Hub',
        route: '/super-admin/academic/curriculum',
        iconName: 'FolderTree',
        order: 2,
        requiredPermissions: ['ACADEMIC_VIEW'],
      },
      {
        id: 'ACADEMIC_BATCHES',
        label: 'Batches & Cohorts',
        route: '/super-admin/academic/batches',
        iconName: 'Layers',
        order: 3,
        requiredPermissions: ['BATCH_VIEW'],
      },
      {
        id: 'LEARNING_COURSES',
        label: 'Courses Catalog',
        route: '/super-admin/courses',
        iconName: 'BookOpen',
        order: 4,
        requiredPermissions: ['COURSE_VIEW'],
      },
      {
        id: 'ACADEMIC_CALENDAR',
        label: 'Academic Calendar & Cycles',
        route: '/super-admin/academic/calendar',
        iconName: 'CalendarDays',
        order: 5,
        requiredPermissions: ['ACADEMIC_VIEW'],
      },
    ],
  },
  {
    id: 'GROUP_LEARNING',
    title: 'Teaching, Faculty & Evaluation',
    order: 4,
    items: [
      {
        id: 'ACADEMIC_FACULTY',
        label: 'Faculty & Allocations',
        route: '/super-admin/faculty',
        iconName: 'UserCheck',
        order: 1,
        requiredPermissions: ['USER_VIEW'],
      },
      {
        id: 'LEARNING_CLASSES',
        label: 'Live & Recorded Classes',
        route: '/super-admin/classes',
        iconName: 'Video',
        order: 2,
        requiredPermissions: ['CLASS_VIEW'],
      },
      {
        id: 'SCHEDULING_TIMETABLE',
        label: 'Master Timetable',
        route: '/super-admin/scheduling/timetable',
        iconName: 'CalendarRange',
        order: 3,
        requiredPermissions: ['TIMETABLE_VIEW'],
      },
      {
        id: 'MONITORING_ATTENDANCE',
        label: 'Attendance Monitoring',
        route: '/super-admin/attendance',
        iconName: 'CheckSquare',
        order: 4,
        requiredPermissions: ['ATTENDANCE_VIEW'],
      },
      {
        id: 'LEARNING_RESOURCES',
        label: 'Learning Content',
        route: '/super-admin/resources',
        iconName: 'Files',
        order: 5,
        requiredPermissions: ['RESOURCE_VIEW'],
      },
      {
        id: 'ACADEMIC_ASSIGNMENTS',
        label: 'Assignments & Homework',
        route: '/super-admin/academic/assignments',
        iconName: 'ClipboardList',
        order: 6,
        requiredPermissions: ['ASSESSMENT_VIEW'],
      },
      {
        id: 'LEARNING_ASSESSMENTS',
        label: 'Exams & Assessments',
        route: '/super-admin/assessments',
        iconName: 'FileCheck2',
        order: 7,
        requiredPermissions: ['ASSESSMENT_VIEW'],
      },
      {
        id: 'MONITORING_RESULTS',
        label: 'Gradebooks & Results',
        route: '/super-admin/results',
        iconName: 'BarChart2',
        order: 8,
        requiredPermissions: ['RESULT_VIEW'],
      },
      {
        id: 'ACADEMIC_CERTIFICATES',
        label: 'CEFR Digital Certificates',
        route: '/super-admin/certificates',
        iconName: 'Award',
        order: 9,
        requiredPermissions: ['REPORT_VIEW'],
      },
    ],
  },
  {
    id: 'GROUP_FINANCE',
    title: 'Finance Governance',
    order: 5,
    items: [
      {
        id: 'FINANCE_DASHBOARD',
        label: 'Finance Overview',
        route: '/super-admin/finance',
        iconName: 'BadgeDollarSign',
        order: 1,
        requiredPermissions: ['FEE_STRUCTURE_VIEW'],
      },
      {
        id: 'FINANCE_APPROVALS',
        label: 'Fee Approvals Queue',
        route: '/super-admin/finance/approvals',
        iconName: 'FileCheck',
        order: 2,
        requiredPermissions: ['FEE_STRUCTURE_APPROVE'],
        badge: '4 Review',
      },
      {
        id: 'FINANCE_FEE_STRUCTURES',
        label: 'Fee Schedules & Courses',
        route: '/super-admin/finance/fee-structures',
        iconName: 'Receipt',
        order: 3,
        requiredPermissions: ['FEE_STRUCTURE_VIEW'],
      },
    ],
  },
];

// Flat list of all items for quick lookups
export const ALL_MENU_ITEMS: MenuDefinition[] = SUPER_ADMIN_MENU_GROUPS.flatMap(
  (group) => group.items
);

export const MENU_BY_ID_MAP: Record<MenuId, MenuDefinition> = ALL_MENU_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<MenuId, MenuDefinition>
);

/**
 * Filter menu groups by user permissions.
 * Groups with 0 accessible items are automatically pruned.
 */
export function getAccessibleMenuGroups(
  userPermissions: PermissionId[],
  isAdminOverride = false
): MenuGroup[] {
  if (isAdminOverride) {
    return SUPER_ADMIN_MENU_GROUPS;
  }

  const permissionSet = new Set(userPermissions);

  return SUPER_ADMIN_MENU_GROUPS.map((group) => {
    const accessibleItems = group.items.filter((item) => {
      if (item.requiredPermissions.length === 0) return true;
      return item.requiredPermissions.some((perm) => permissionSet.has(perm));
    });

    return {
      ...group,
      items: accessibleItems,
    };
  }).filter((group) => group.items.length > 0);
}

/**
 * Find menu definition corresponding to an active pathname
 */
export function findMenuByRoute(pathname: string): MenuDefinition | undefined {
  const exact = ALL_MENU_ITEMS.find((item) => item.route === pathname);
  if (exact) return exact;

  const matching = ALL_MENU_ITEMS.filter((item) => pathname.startsWith(item.route)).sort(
    (a, b) => b.route.length - a.route.length
  );
  return matching[0];
}

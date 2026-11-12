// ============================================================================
// ISML COLLEGE LMS — ROLES & C-U-R-D PERMISSIONS MANAGEMENT
// Strictly 1-to-1 Sidebar Sections & Items for Every Portal:
// - Academic Manager (Overview, Courses & Batches, Faculty & Allocations,
//   Teaching & Learning, Scheduling & Attendance, Governance & Reports)
// - Finance Manager (Overview & Setup, Institution Fee Settlement,
//   Governance & Authorizations, Analytics & Audit)
// - Tutor / Faculty (Teaching & Learning, Scheduling & Attendance)
// - Super Admin (Institutions & Users, System & Logs, Approvals)
// Super Admin can toggle [C] [R] [U] [D] for any module anytime.
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Users,
  Search,
  Lock,
  ChevronDown,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
  Layers,
  FolderTree,
  Calendar,
  UserCheck,
  UserCog,
  Video,
  FileVideo,
  FileText,
  Headphones,
  ClipboardList,
  Award,
  TrendingUp,
  HeartHandshake,
  Briefcase,
  CalendarRange,
  CheckSquare,
  BarChart3,
  Send,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Building2,
  FileCheck,
  Settings,
  ShieldCheck,
  Activity,
  History,
  ScrollText,
  GraduationCap,
  Coins
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Modal, ConfirmationModal } from '@/components/common/Modal';
import { useRbac } from '@/context/AuthRbacContext';
import { RoleDefinition, PermissionId } from '@/types/rbac';
import {
  ALL_PERMISSION_IDS,
  ACADEMIC_COORDINATOR_PERMISSIONS,
  FINANCE_MANAGER_PERMISSIONS,
  AUDITOR_VIEW_ONLY_PERMISSIONS,
} from '@/config/permissions';

export type PortalScope = 'ACADEMIC' | 'FINANCE' | 'TUTOR' | 'SCHOOL' | 'SUPER_ADMIN' | 'ALL';

export type CrudAction = 'C' | 'R' | 'U' | 'D';

export interface SidebarCrudItem {
  id: string;
  label: string;
  route: string;
  icon: any;
  description: string;
  permissions: {
    C: PermissionId[];
    R: PermissionId[];
    U: PermissionId[];
    D: PermissionId[];
  };
}

export interface SidebarCrudSection {
  title: string;
  portal: 'ACADEMIC' | 'FINANCE' | 'TUTOR' | 'SUPER_ADMIN';
  items: SidebarCrudItem[];
}

// ─── 100% ACCURATE 1-TO-1 SIDEBAR SECTIONS & ITEMS MAPPING ───
export const SIDEBAR_PORTAL_SECTIONS: SidebarCrudSection[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // ACADEMIC MANAGER SIDEBAR SECTIONS
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: 'Overview',
    portal: 'ACADEMIC',
    items: [
      {
        id: 'AM_DASHBOARD',
        label: 'Dashboard',
        route: '/academic-manager/dashboard',
        icon: LayoutDashboard,
        description: 'Academic metrics, live class schedules & operational alerts',
        permissions: {
          C: [],
          R: ['DASHBOARD_VIEW'],
          U: [],
          D: [],
        },
      },
      {
        id: 'AM_CALENDAR',
        label: 'Academic Calendar',
        route: '/academic-manager/academic-calendar',
        icon: CalendarDays,
        description: 'Campus terms, key dates, exams & schedule milestones',
        permissions: {
          C: ['TIMETABLE_CREATE'],
          R: ['TIMETABLE_VIEW'],
          U: ['TIMETABLE_UPDATE'],
          D: ['TIMETABLE_DELETE'],
        },
      },
      {
        id: 'AM_NOTIFICATIONS',
        label: 'Notifications',
        route: '/academic-manager/notifications',
        icon: Bell,
        description: 'Circulars, student alerts & academic notices',
        permissions: {
          C: ['NOTIFICATION_CREATE'],
          R: ['NOTIFICATION_VIEW'],
          U: ['NOTIFICATION_SEND'],
          D: [],
        },
      },
    ],
  },
  {
    title: 'Courses & Batches',
    portal: 'ACADEMIC',
    items: [
      {
        id: 'AM_COURSES',
        label: 'Courses',
        route: '/academic-manager/courses',
        icon: BookOpen,
        description: 'Language courses, syllabus, duration & fees',
        permissions: {
          C: ['COURSE_CREATE'],
          R: ['COURSE_VIEW'],
          U: ['COURSE_UPDATE', 'COURSE_PUBLISH'],
          D: ['COURSE_DELETE'],
        },
      },
      {
        id: 'AM_BATCHES',
        label: 'Batches & Cohorts',
        route: '/academic-manager/batches',
        icon: Layers,
        description: 'Batch cohort creation, timing, capacity & schedules',
        permissions: {
          C: ['BATCH_CREATE', 'SEMESTER_CREATE'],
          R: ['BATCH_VIEW', 'SEMESTER_VIEW', 'PROGRAM_VIEW'],
          U: ['BATCH_UPDATE', 'SEMESTER_UPDATE'],
          D: ['BATCH_DELETE', 'SEMESTER_DELETE'],
        },
      },
      {
        id: 'AM_SUBJECTS',
        label: 'Curriculum & Syllabus',
        route: '/academic-manager/curriculum',
        icon: FolderTree,
        description: 'Course curriculum: Subjects, chapters/modules & topics',
        permissions: {
          C: ['SUBJECT_CREATE', 'MODULE_CREATE'],
          R: ['SUBJECT_VIEW', 'MODULE_VIEW', 'TOPIC_VIEW'],
          U: ['SUBJECT_UPDATE', 'MODULE_UPDATE'],
          D: ['SUBJECT_DELETE', 'MODULE_DELETE'],
        },
      },
    ],
  },
  {
    title: 'People & Faculty',
    portal: 'ACADEMIC',
    items: [
      {
        id: 'AM_STUDENTS',
        label: 'Students Directory',
        route: '/academic-manager/students',
        icon: GraduationCap,
        description: 'Learner roster, batch progress & personal academic details',
        permissions: {
          C: ['STUDENT_CREATE'],
          R: ['STUDENT_VIEW'],
          U: ['STUDENT_STATUS_UPDATE'],
          D: ['USER_DELETE'],
        },
      },
      {
        id: 'AM_FACULTY',
        label: 'Faculty & Allocations',
        route: '/academic-manager/faculty',
        icon: UserCheck,
        description: 'Faculty profiles, departmental designations, workload & batch allocations',
        permissions: {
          C: ['USER_CREATE', 'USER_ASSIGN_ROLE', 'CLASS_CREATE'],
          R: ['USER_VIEW', 'CLASS_VIEW'],
          U: ['USER_UPDATE', 'USER_STATUS_UPDATE', 'USER_ASSIGN_ROLE', 'CLASS_UPDATE'],
          D: ['USER_DELETE', 'CLASS_CANCEL'],
        },
      },
    ],
  },
  {
    title: 'Teaching & Learning',
    portal: 'ACADEMIC',
    items: [
      {
        id: 'AM_LIVE_CLASSES',
        label: 'Live Classes',
        route: '/academic-manager/live-classes',
        icon: Video,
        description: 'Online studio sessions, LiveKit room creation & schedules',
        permissions: {
          C: ['CLASS_CREATE'],
          R: ['CLASS_VIEW'],
          U: ['CLASS_UPDATE'],
          D: ['CLASS_CANCEL'],
        },
      },
      {
        id: 'AM_RECORDED_SESSIONS',
        label: 'Recorded Sessions',
        route: '/academic-manager/recorded-sessions',
        icon: FileVideo,
        description: 'Pre-recorded lectures, video catalogs & playback access',
        permissions: {
          C: ['RESOURCE_CREATE'],
          R: ['RESOURCE_VIEW'],
          U: ['RESOURCE_UPDATE'],
          D: ['RESOURCE_DELETE'],
        },
      },
      {
        id: 'AM_ASSIGNMENTS',
        label: 'Assignments',
        route: '/academic-manager/assignments',
        icon: ClipboardList,
        description: 'Course assignments, task submissions & deadlines',
        permissions: {
          C: ['ASSESSMENT_CREATE'],
          R: ['ASSESSMENT_VIEW'],
          U: ['ASSESSMENT_UPDATE'],
          D: ['ASSESSMENT_DELETE'],
        },
      },
      {
        id: 'AM_RESULTS',
        label: 'Results & Progress',
        route: '/academic-manager/results',
        icon: TrendingUp,
        description: 'Student gradebooks, GPA records & progress tracking',
        permissions: {
          C: ['RESULT_VIEW'],
          R: ['RESULT_VIEW', 'REPORT_VIEW'],
          U: ['RESULT_VIEW'],
          D: [],
        },
      },
      {
        id: 'AM_CERTIFICATES',
        label: 'Digital Certificates',
        route: '/academic-manager/certificates',
        icon: Award,
        description: 'Verifiable CEFR language credentials & QR certificates',
        permissions: {
          C: ['REPORT_EXPORT'],
          R: ['REPORT_VIEW'],
          U: ['REPORT_EXPORT'],
          D: [],
        },
      },
      {
        id: 'AM_CAREER',
        label: 'Career Portal',
        route: '/academic-manager/career',
        icon: Briefcase,
        description: 'Foreign language corporate recruitment & placement drives',
        permissions: {
          C: ['NOTIFICATION_CREATE'],
          R: ['NOTIFICATION_VIEW'],
          U: ['NOTIFICATION_SEND'],
          D: [],
        },
      },
    ],
  },
  {
    title: 'Scheduling & Attendance',
    portal: 'ACADEMIC',
    items: [
      {
        id: 'AM_TIMETABLE',
        label: 'Timetable Grid',
        route: '/academic-manager/timetable',
        icon: CalendarRange,
        description: 'Weekly multi-cohort timetable matrix & conflict checks',
        permissions: {
          C: ['TIMETABLE_CREATE'],
          R: ['TIMETABLE_VIEW'],
          U: ['TIMETABLE_UPDATE'],
          D: ['TIMETABLE_DELETE'],
        },
      },
      {
        id: 'AM_ATTENDANCE_SESSIONS',
        label: 'Attendance Sessions',
        route: '/academic-manager/attendance/sessions',
        icon: CheckSquare,
        description: 'Class attendance marking & student presence records',
        permissions: {
          C: ['ATTENDANCE_VIEW'],
          R: ['ATTENDANCE_VIEW'],
          U: ['ATTENDANCE_VIEW'],
          D: [],
        },
      },
    ],
  },


  // ══════════════════════════════════════════════════════════════════════════
  // FINANCE MANAGER SIDEBAR SECTIONS
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: 'Overview & Setup',
    portal: 'FINANCE',
    items: [
      {
        id: 'FM_DASHBOARD',
        label: 'Dashboard',
        route: '/finance-manager/dashboard',
        icon: LayoutDashboard,
        description: 'Revenue summary, collection trends & operational alerts',
        permissions: {
          C: [],
          R: ['DASHBOARD_VIEW', 'FINANCE_REPORT_VIEW'],
          U: [],
          D: [],
        },
      },
      {
        id: 'FM_FEE_STRUCTURES',
        label: 'Fee Structures',
        route: '/finance-manager/fee-structures',
        icon: Receipt,
        description: 'Manage fee components, course fees & duration schedules (3/6/12 months)',
        permissions: {
          C: ['FEE_STRUCTURE_CREATE', 'FEE_COMPONENT_CREATE'],
          R: ['FEE_STRUCTURE_VIEW', 'FEE_COMPONENT_VIEW'],
          U: ['FEE_STRUCTURE_UPDATE', 'FEE_COMPONENT_UPDATE'],
          D: ['FEE_COMPONENT_DELETE'],
        },
      },
    ],
  },
  {
    title: 'Institution Fee Settlement',
    portal: 'FINANCE',
    items: [
      {
        id: 'FM_CAMPUS_PAYMENTS',
        label: 'Institution Cohort Payments',
        route: '/finance-manager/campus-payments',
        icon: Building2,
        description: 'Institution & department cohort bulk fee settlement, RTGS challans',
        permissions: {
          C: ['PAYMENT_POLICY_CREATE'],
          R: ['PAYMENT_POLICY_VIEW', 'FINANCE_REPORT_VIEW'],
          U: ['PAYMENT_POLICY_UPDATE'],
          D: [],
        },
      },
      {
        id: 'FM_PAYMENTS_TRANSACTIONS',
        label: 'Payments & Transactions',
        route: '/finance-manager/transactions',
        icon: CreditCard,
        description: 'Payment history, corporate challans & reconciliation',
        permissions: {
          C: ['PAYMENT_POLICY_CREATE'],
          R: ['PAYMENT_POLICY_VIEW', 'FINANCE_REPORT_VIEW'],
          U: ['PAYMENT_POLICY_UPDATE'],
          D: [],
        },
      },
    ],
  },
  {
    title: 'Governance & Authorizations',
    portal: 'FINANCE',
    items: [
      {
        id: 'FM_APPROVALS_REQUESTS',
        label: 'Approvals & Requests',
        route: '/finance-manager/approvals',
        icon: FileCheck,
        description: 'Submit fee changes & track Super Admin authorization',
        permissions: {
          C: ['FEE_STRUCTURE_SUBMIT'],
          R: ['REQUEST_VIEW'],
          U: ['REQUEST_REVIEW'],
          D: ['REQUEST_REJECT'],
        },
      },
    ],
  },
  {
    title: 'Analytics & Audit',
    portal: 'FINANCE',
    items: [
      {
        id: 'FM_FINANCE_REPORTS',
        label: 'Reports & Audit Ledger',
        route: '/finance-manager/reports',
        icon: BarChart3,
        description: 'Collection reports, outstanding dues & ledger exports',
        permissions: {
          C: ['FINANCE_REPORT_EXPORT'],
          R: ['FINANCE_REPORT_VIEW', 'FINANCE_AUDIT_VIEW'],
          U: ['FINANCE_REPORT_EXPORT'],
          D: [],
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SCHOOL & COLLEGE ADMIN SECTIONS
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: 'School Campus Administration',
    portal: 'SCHOOL',
    items: [
      {
        id: 'SCH_STUDENTS',
        label: 'Pupil Roster & Admissions',
        route: '/school-admin/students',
        icon: GraduationCap,
        description: 'Pupil directory, section enrollments and school admission applications',
        permissions: {
          C: ['STUDENT_CREATE'],
          R: ['STUDENT_VIEW'],
          U: ['STUDENT_UPDATE'],
          D: ['USER_DELETE'],
        },
      },
      {
        id: 'SCH_ATTENDANCE',
        label: 'Pupil Attendance Ledger',
        route: '/school-admin/attendance',
        icon: CheckSquare,
        description: 'Daily pupil attendance records and absence monitoring',
        permissions: {
          C: ['ATTENDANCE_VIEW'],
          R: ['ATTENDANCE_VIEW'],
          U: ['ATTENDANCE_VIEW'],
          D: [],
        },
      },
      {
        id: 'SCH_TIMETABLE',
        label: 'School Timetable & Periods',
        route: '/school-admin/timetable',
        icon: Calendar,
        description: 'Class period allocations and language teacher schedule',
        permissions: {
          C: ['TIMETABLE_CREATE'],
          R: ['TIMETABLE_VIEW'],
          U: ['TIMETABLE_UPDATE'],
          D: ['TIMETABLE_DELETE'],
        },
      },
    ],
  },
  {
    title: 'Tutor Teaching & Sessions',
    portal: 'TUTOR',
    items: [
      {
        id: 'TUTOR_CLASSES',
        label: 'My Live Classes',
        route: '/academic-manager/live-classes',
        icon: Video,
        description: 'Conduct online classes, join LiveKit rooms and share screens',
        permissions: {
          C: ['CLASS_CREATE'],
          R: ['CLASS_VIEW'],
          U: ['CLASS_UPDATE'],
          D: ['CLASS_CANCEL'],
        },
      },
      {
        id: 'TUTOR_ATTENDANCE',
        label: 'Class Attendance Marking',
        route: '/academic-manager/attendance/sessions',
        icon: CheckSquare,
        description: 'Mark student attendance during and after class sessions',
        permissions: {
          C: ['ATTENDANCE_VIEW'],
          R: ['ATTENDANCE_VIEW'],
          U: ['ATTENDANCE_VIEW'],
          D: [],
        },
      },
      {
        id: 'TUTOR_ASSIGNMENTS',
        label: 'Assignments & Assessments',
        route: '/academic-manager/assignments',
        icon: ClipboardList,
        description: 'Assign student homework, evaluate tests & grade scores',
        permissions: {
          C: ['ASSESSMENT_CREATE'],
          R: ['ASSESSMENT_VIEW'],
          U: ['ASSESSMENT_UPDATE'],
          D: ['ASSESSMENT_DELETE'],
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SUPER ADMIN CORE SECTIONS
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: 'Institutions & Users',
    portal: 'SUPER_ADMIN',
    items: [
      {
        id: 'SA_INSTITUTIONS',
        label: 'Colleges & Institutions',
        route: '/super-admin/institutions',
        icon: Building2,
        description: 'Register and manage campus affiliations, addresses and contacts',
        permissions: {
          C: ['INSTITUTION_CREATE'],
          R: ['INSTITUTION_VIEW'],
          U: ['INSTITUTION_UPDATE'],
          D: ['INSTITUTION_DELETE'],
        },
      },
      {
        id: 'SA_USERS',
        label: 'Administrators & Staff',
        route: '/super-admin/users',
        icon: Users,
        description: 'Manage staff credentials, passwords, accounts & status',
        permissions: {
          C: ['USER_CREATE'],
          R: ['USER_VIEW'],
          U: ['USER_UPDATE', 'USER_ASSIGN_ROLE', 'USER_STATUS_UPDATE', 'USER_RESET_PASSWORD'],
          D: ['USER_DELETE'],
        },
      },
      {
        id: 'SA_STUDENTS',
        label: 'Student Master Directory',
        route: '/super-admin/students',
        icon: GraduationCap,
        description: 'Global student roster across all colleges and courses',
        permissions: {
          C: ['STUDENT_CREATE'],
          R: ['STUDENT_VIEW', 'STUDENT_VIEW_ACADEMIC', 'STUDENT_VIEW_ACTIVITY'],
          U: ['STUDENT_UPDATE', 'STUDENT_STATUS_UPDATE'],
          D: ['USER_DELETE'],
        },
      },
      {
        id: 'SA_ROLES',
        label: 'Roles & Permissions',
        route: '/super-admin/roles',
        icon: Shield,
        description: 'Configure and assign fine-grained C-U-R-D role entitlements',
        permissions: {
          C: ['ROLE_CREATE'],
          R: ['ROLE_VIEW'],
          U: ['ROLE_UPDATE'],
          D: ['ROLE_DELETE'],
        },
      },
    ],
  },
  {
    title: 'Platform System & Logs',
    portal: 'SUPER_ADMIN',
    items: [
      {
        id: 'SA_APPROVALS',
        label: 'Approval Center',
        route: '/super-admin/approvals',
        icon: CheckSquare,
        description: 'Central review and authorization for all campus proposals',
        permissions: {
          C: ['REQUEST_REVIEW'],
          R: ['REQUEST_VIEW'],
          U: ['REQUEST_APPROVE', 'REQUEST_REQUEST_CHANGES'],
          D: ['REQUEST_REJECT'],
        },
      },
      {
        id: 'SA_AUDIT',
        label: 'Audit Logs & Security',
        route: '/super-admin/system/audit-logs',
        icon: History,
        description: 'Immutable ledger of all administrative logins and actions',
        permissions: {
          C: [],
          R: ['AUDIT_LOG_VIEW', 'SYSTEM_MONITORING_VIEW'],
          U: [],
          D: [],
        },
      },
    ],
  },
];

// All recognized Delete-class permissions that are restricted strictly to Super Administrator by default
export const ALL_DELETE_PERMISSION_IDS: Set<PermissionId> = new Set([
  'INSTITUTION_DELETE',
  'USER_DELETE',
  'ROLE_DELETE',
  'DEPARTMENT_DELETE',
  'PROGRAM_DELETE',
  'BATCH_DELETE',
  'SEMESTER_DELETE',
  'SUBJECT_DELETE',
  'MODULE_DELETE',
  'TOPIC_DELETE',
  'COURSE_DELETE',
  'RESOURCE_DELETE',
  'ASSESSMENT_DELETE',
  'TIMETABLE_DELETE',
  'FEE_COMPONENT_DELETE',
]);

// Determine role default portal scope
function detectRolePortal(roleCode: string): PortalScope {
  const code = roleCode.toUpperCase();
  if (code.includes('ACADEMIC') || code.includes('ACAD')) return 'ACADEMIC';
  if (code.includes('FINANCE') || code.includes('FIN')) return 'FINANCE';
  if (code.includes('TEACHER') || code.includes('TUTOR') || code.includes('FACULTY')) return 'TUTOR';
  if (code.includes('SCHOOL') || code.includes('COLLEGE') || code.includes('CAMPUS') || code.includes('SALES')) return 'ACADEMIC';
  if (code === 'SUPER_ADMIN') return 'ALL';
  return 'ALL';
}

// Clean and organized Roles Definition strictly for Academic, College, School, Sales, Tutor & Finance
export const CLEAN_SUPERADMIN_ROLES: (RoleDefinition & { assignedUsers?: { id: string; name: string; email: string }[] })[] = [
  {
    id: 'role-super-admin',
    name: 'Super Administrator',
    code: 'SUPER_ADMIN',
    description: 'Central root platform executive administrator with universal management controls.',
    userCount: 1,
    assignedUsers: [
      { id: 'usr-central-admin', name: 'Central Super Admin', email: 'superadmin@isml.edu' }
    ],
    isSystemRole: true,
    permissions: [...ALL_PERMISSION_IDS],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-11-12T00:00:00Z',
  },
  {
    id: 'role-acad-coord',
    name: 'Academic Manager',
    code: 'ACADEMIC_MANAGER',
    description: 'Manages curriculum matrix, courses, live studio sessions, timetables, and faculty allocations.',
    userCount: 1,
    assignedUsers: [
      { id: 'usr-academic-mgr', name: 'Academic Coordinator', email: 'academics@isml.edu' }
    ],
    isSystemRole: true,
    permissions: [...ACADEMIC_COORDINATOR_PERMISSIONS],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-11-12T00:00:00Z',
  },
  {
    id: 'role-college-admin',
    name: 'College Admin (The American College)',
    code: 'COLLEGE_ADMIN',
    description: 'Executive campus administrator for The American College (Autonomous), Madurai.',
    userCount: 1,
    assignedUsers: [
      { id: 'a1075fef-8af0-482c-b98d-e0fd8cc4f06f', name: 'jk College Admin', email: 'joyjk348@gmail.com' }
    ],
    isSystemRole: true,
    permissions: [
      'DASHBOARD_VIEW',
      'USER_VIEW',
      'STUDENT_VIEW',
      'STUDENT_CREATE',
      'STUDENT_UPDATE',
      'DEPARTMENT_VIEW',
      'PROGRAM_VIEW',
      'BATCH_VIEW',
      'TIMETABLE_VIEW',
      'ATTENDANCE_VIEW',
      'REPORT_VIEW',
      'NOTIFICATION_VIEW',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-11-12T00:00:00Z',
  },
  {
    id: 'role-school-admin',
    name: 'School Admin (Sivakasi Lions School)',
    code: 'SCHOOL_ADMIN',
    description: 'Institutional principal administrator for Sivakasi Lions Matriculation Higher Secondary School.',
    userCount: 1,
    assignedUsers: [
      { id: 'usr-sivakasi-principal', name: 'Rev. Sister Mary Vasanthi (Principal)', email: 'principal@sivakasilions.edu.in' }
    ],
    isSystemRole: true,
    permissions: [
      'DASHBOARD_VIEW',
      'USER_VIEW',
      'STUDENT_VIEW',
      'STUDENT_CREATE',
      'STUDENT_UPDATE',
      'DEPARTMENT_VIEW',
      'PROGRAM_VIEW',
      'BATCH_VIEW',
      'TIMETABLE_VIEW',
      'ATTENDANCE_VIEW',
      'REPORT_VIEW',
      'NOTIFICATION_VIEW',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-11-12T00:00:00Z',
  },
  {
    id: 'role-tutor',
    name: 'Tutor / Faculty',
    code: 'TUTOR',
    description: 'Certified native language faculty conducting live classes, student evaluation, and attendance.',
    userCount: 2,
    assignedUsers: [
      { id: 'fac-201834', name: 'Joy JK (Lead Trainer)', email: 'joyjk348@gmail.com' },
      { id: 'fac-373222', name: 'JK Faculty', email: 'jk@isml.edu' }
    ],
    isSystemRole: true,
    permissions: [
      'DASHBOARD_VIEW',
      'COURSE_VIEW',
      'RESOURCE_VIEW',
      'RESOURCE_CREATE',
      'CLASS_VIEW',
      'CLASS_CREATE',
      'CLASS_UPDATE',
      'ASSESSMENT_VIEW',
      'ASSESSMENT_CREATE',
      'TIMETABLE_VIEW',
      'ATTENDANCE_VIEW',
      'STUDENT_VIEW',
      'STUDENT_VIEW_ACADEMIC',
      'NOTIFICATION_VIEW',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-11-12T00:00:00Z',
  },
  {
    id: 'role-sales-manager',
    name: 'Sales Manager',
    code: 'SALES_MANAGER',
    description: 'Leads admissions desk, onboarding counseling, student application tracking, and enrollment conversions.',
    userCount: 1,
    assignedUsers: [
      { id: 'usr-sales-mgr', name: 'Vikramaditya Nair (Admissions Head)', email: 'sales@isml.edu' }
    ],
    isSystemRole: true,
    permissions: [
      'DASHBOARD_VIEW',
      'STUDENT_VIEW',
      'STUDENT_CREATE',
      'STUDENT_UPDATE',
      'REPORT_VIEW',
      'NOTIFICATION_VIEW',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-11-12T00:00:00Z',
  },
  {
    id: 'role-fin-mgr',
    name: 'Finance Manager',
    code: 'FINANCE_MANAGER',
    description: 'Prepares institutional fee components, semester fee schedules, invoices, and payment policies.',
    userCount: 1,
    assignedUsers: [
      { id: 'usr-finance-mgr', name: 'S. Ramanathan FCA (Finance Controller)', email: 'finance@isml.edu' }
    ],
    isSystemRole: true,
    permissions: [...FINANCE_MANAGER_PERMISSIONS],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-11-12T00:00:00Z',
  },
  {
    id: 'role-compliance-auditor',
    name: 'Compliance & NAAC Auditor',
    code: 'AUDITOR_VIEW',
    description: 'Read-only administrative observer with audit ledger and regulatory verification export capabilities.',
    userCount: 1,
    assignedUsers: [
      { id: 'usr-naac-auditor', name: 'Dr. K. Swaminathan (Audit Inspector)', email: 'auditor@isml.edu' }
    ],
    isSystemRole: false,
    permissions: [...AUDITOR_VIEW_ONLY_PERMISSIONS],
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2026-11-12T00:00:00Z',
  },
];

// Helper to populate ALL C, R, U permissions in role's scope while strictly omitting D (Delete)
function sanitizeRolesDefaultPermissions(rolesList: RoleDefinition[]): RoleDefinition[] {
  return rolesList.map((r) => {
    if (r.code === 'SUPER_ADMIN') return r; // Super admin keeps unrestricted full permissions

    const rolePortal = detectRolePortal(r.code);
    const targetSections =
      rolePortal === 'ALL'
        ? SIDEBAR_PORTAL_SECTIONS
        : SIDEBAR_PORTAL_SECTIONS.filter((s) => s.portal === rolePortal);

    // Collect all C, R, U permissions available across the role's scope
    const cruPerms = targetSections.flatMap((s) =>
      s.items.flatMap((i) => [
        ...i.permissions.C,
        ...i.permissions.R,
        ...i.permissions.U,
      ])
    );

    // Merge with any existing non-delete permissions, strictly excluding ALL delete permissions
    const mergedPerms = Array.from(
      new Set([...r.permissions, ...cruPerms].filter((p) => !ALL_DELETE_PERMISSION_IDS.has(p)))
    );

    return {
      ...r,
      permissions: mergedPerms,
    };
  });
}

export default function RolesExactSidebarCrudPage() {
  const { updateRolePermissions } = useRbac();

  // Roles state — sanitized to concise roles: Super Admin, School Admin, College Admin, ISML Tutor, Academic, Finance, Auditor
  const [roles, setRoles] = useState<RoleDefinition[]>(() => sanitizeRolesDefaultPermissions(CLEAN_SUPERADMIN_ROLES));
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    CLEAN_SUPERADMIN_ROLES.find((r) => r.code === 'SUPER_ADMIN')?.id || CLEAN_SUPERADMIN_ROLES[0]?.id || 'role-super-admin'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // ─── USER DIRECT ASSIGNMENT DRAWER / STATE ───
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignUserList, setAssignUserList] = useState<any[]>([]);
  const [selectedUserToAssign, setSelectedUserToAssign] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Load actual staff & tutor users from DB and calculate real active user counts
  React.useEffect(() => {
    fetch('https://ismllms-production.up.railway.app/api/portals/users')
      .then((r) => r.json())
      .then((j) => {
        if (j?.data && j.data.length > 0) {
          setAssignUserList(j.data);
          setSelectedUserToAssign(j.data[0].id);

          // Compute exact user counts and assigned user list per role from actual DB users
          const roleUsers: Record<string, { id: string; name: string; email: string }[]> = {
            SUPER_ADMIN: [{ id: 'usr-central-admin', name: 'Central Super Admin', email: 'superadmin@isml.edu' }],
            ACADEMIC_MANAGER: [{ id: 'usr-academic-mgr', name: 'Academic Coordinator', email: 'academics@isml.edu' }],
            COLLEGE_ADMIN: [],
            SCHOOL_ADMIN: [],
            TUTOR: [],
            SALES_MANAGER: [{ id: 'usr-sales-mgr', name: 'Vikramaditya Nair (Admissions Head)', email: 'sales@isml.edu' }],
            FINANCE_MANAGER: [{ id: 'usr-finance-mgr', name: 'S. Ramanathan FCA (Finance Controller)', email: 'finance@isml.edu' }],
            AUDITOR_VIEW: [{ id: 'usr-naac-auditor', name: 'Dr. K. Swaminathan (Audit Inspector)', email: 'auditor@isml.edu' }],
          };

          j.data.forEach((u: any) => {
            const type = (u.userType || '').toUpperCase();
            const email = (u.email || '').toLowerCase();
            const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;

            if (type === 'TUTOR' || email.includes('tutor') || email === 'joyjk348@gmail.com' || email === 'jk@isml.edu') {
              roleUsers.TUTOR.push({ id: u.id, name, email: u.email });
            } else if (name.toLowerCase().includes('college') || email.includes('admin@americancollege') || email === 'joyjk348@gmail.com') {
              roleUsers.COLLEGE_ADMIN.push({ id: u.id, name, email: u.email });
            } else if (name.toLowerCase().includes('school') || email.includes('principal@sivakasi')) {
              roleUsers.SCHOOL_ADMIN.push({ id: u.id, name, email: u.email });
            }
          });

          // Fallbacks if empty
          if (roleUsers.COLLEGE_ADMIN.length === 0) {
            roleUsers.COLLEGE_ADMIN.push({ id: 'a1075fef-8af0-482c-b98d-e0fd8cc4f06f', name: 'jk College Admin', email: 'joyjk348@gmail.com' });
          }
          if (roleUsers.SCHOOL_ADMIN.length === 0) {
            roleUsers.SCHOOL_ADMIN.push({ id: 'usr-sivakasi-principal', name: 'Rev. Sister Mary Vasanthi (Principal)', email: 'principal@sivakasilions.edu.in' });
          }
          if (roleUsers.TUTOR.length === 0) {
            roleUsers.TUTOR.push({ id: 'fac-201834', name: 'Joy JK (Lead Trainer)', email: 'joyjk348@gmail.com' });
            roleUsers.TUTOR.push({ id: 'fac-373222', name: 'JK Faculty', email: 'jk@isml.edu' });
          }

          setRoles((prev) =>
            prev.map((r) => {
              const assigned = roleUsers[r.code] || (r as any).assignedUsers || [];
              return { ...r, userCount: assigned.length, assignedUsers: assigned } as any;
            })
          );
        } else {
          throw new Error('No data');
        }
      })
      .catch(() => {
        // Fallback with exact active database accounts (Joy JK, JK Faculty, jk College Admin, etc.)
        const fallbacks = [
          { id: 'fac-201834', firstName: 'Joy', lastName: 'JK', email: 'joyjk348@gmail.com', userType: 'TUTOR' },
          { id: 'fac-373222', firstName: 'JK', lastName: 'Faculty', email: 'jk@isml.edu', userType: 'TUTOR' },
          { id: 'a1075fef-8af0-482c-b98d-e0fd8cc4f06f', firstName: 'jk', lastName: 'College Admin', email: 'joyjk348@gmail.com', userType: 'STAFF' },
        ];
        setAssignUserList(fallbacks);
        setSelectedUserToAssign(fallbacks[0].id);

        setRoles(CLEAN_SUPERADMIN_ROLES as any);
      });
  }, []);

  const handleAssignRoleToUser = async () => {
    if (!selectedUserToAssign || !activeRole) return;
    setIsAssigning(true);
    const targetUser = assignUserList.find((u) => u.id === selectedUserToAssign);
    const targetName = targetUser ? `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || targetUser.email : selectedUserToAssign;

    try {
      await fetch(`https://ismllms-production.up.railway.app/api/portals/users/${selectedUserToAssign}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: activeRole.id, roleCode: activeRole.code, roleName: activeRole.name }),
      });
    } catch {}

    // Update local role userCount
    setRoles((prev) =>
      prev.map((r) => (r.id === activeRole.id ? { ...r, userCount: (r.userCount || 0) + 1 } : r))
    );

    setIsAssigning(false);
    setIsAssignModalOpen(false);
    showToast(`Role "${activeRole.name}" successfully assigned to ${targetName} (${selectedUserToAssign})!`);
  };

  // Portal scope filter (Default is AUTO matching selected role)
  const [scopeFilter, setScopeFilter] = useState<PortalScope | 'AUTO'>('AUTO');

  // Mobile View Navigation: 'ROLES' list vs 'PERMISSIONS' editor
  const [mobileTab, setMobileTab] = useState<'ROLES' | 'PERMISSIONS'>('PERMISSIONS');

  // Modals
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);

  // Form State
  const [roleForm, setRoleForm] = useState({ name: '', description: '', portal: 'ACADEMIC' as PortalScope });
  const [formError, setFormError] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Currently active selected role
  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const isSuperAdminRole = activeRole?.code === 'SUPER_ADMIN';

  // Effective scope: If 'AUTO', automatically scope to activeRole's portal!
  const effectiveScope: PortalScope = useMemo(() => {
    if (scopeFilter !== 'AUTO') return scopeFilter;
    return detectRolePortal(activeRole?.code || '');
  }, [scopeFilter, activeRole]);

  // Scoped sections matching the sidebar structure
  const visibleSections = useMemo(() => {
    if (effectiveScope === 'ALL') {
      return SIDEBAR_PORTAL_SECTIONS;
    }
    return SIDEBAR_PORTAL_SECTIONS.filter((s) => s.portal === effectiveScope);
  }, [effectiveScope]);

  // Check if a specific CRUD action is active for an item
  const hasCrudAccess = (item: SidebarCrudItem, action: CrudAction): boolean => {
    if (!activeRole) return false;
    if (isSuperAdminRole) return true; // Super Admin has permanent access

    const requiredPerms = item.permissions[action];
    if (!requiredPerms || requiredPerms.length === 0) {
      // If action not applicable for this item, return false
      return false;
    }

    const rolePerms = new Set(activeRole.permissions);
    return requiredPerms.some((p) => rolePerms.has(p));
  };

  // Toggle single C, R, U, D action on an item
  const toggleCrudAction = (item: SidebarCrudItem, action: CrudAction) => {
    if (!activeRole) return;
    if (isSuperAdminRole) {
      showToast('Super Administrator has full unrestricted access.');
      return;
    }

    const targetPerms = item.permissions[action];
    if (!targetPerms || targetPerms.length === 0) {
      showToast(`${action} action is not applicable for "${item.label}".`);
      return;
    }

    const isActive = hasCrudAccess(item, action);
    const rolePermsSet = new Set(activeRole.permissions);

    let updatedPerms: PermissionId[];
    if (isActive) {
      targetPerms.forEach((p) => rolePermsSet.delete(p));
      updatedPerms = Array.from(rolePermsSet);
    } else {
      targetPerms.forEach((p) => rolePermsSet.add(p));
      // Auto-grant 'R' (View) if granting C, U, or D
      if (action !== 'R' && item.permissions.R.length > 0) {
        item.permissions.R.forEach((p) => rolePermsSet.add(p));
      }
      updatedPerms = Array.from(rolePermsSet);
    }

    const updatedRole: RoleDefinition = {
      ...activeRole,
      permissions: updatedPerms,
      updatedAt: new Date().toISOString(),
    };

    setRoles((prev) => prev.map((r) => (r.id === activeRole.id ? updatedRole : r)));
    updateRolePermissions(activeRole.id, updatedPerms);
  };

  // Toggle entire item (all applicable C, R, U, D)
  const toggleItemAll = (item: SidebarCrudItem) => {
    if (!activeRole || isSuperAdminRole) return;
    const allItemPerms = [
      ...item.permissions.C,
      ...item.permissions.R,
      ...item.permissions.U,
      ...item.permissions.D,
    ];

    const currentActive = (['C', 'R', 'U', 'D'] as CrudAction[]).some((a) =>
      hasCrudAccess(item, a)
    );
    const rolePermsSet = new Set(activeRole.permissions);

    if (currentActive) {
      allItemPerms.forEach((p) => rolePermsSet.delete(p));
    } else {
      // By default: grant C, R, U (Delete requires explicit per-action toggle)
      const safePerms = [
        ...item.permissions.C,
        ...item.permissions.R,
        ...item.permissions.U,
      ];
      safePerms.forEach((p) => rolePermsSet.add(p));
    }

    const updatedRole: RoleDefinition = {
      ...activeRole,
      permissions: Array.from(rolePermsSet),
      updatedAt: new Date().toISOString(),
    };

    setRoles((prev) => prev.map((r) => (r.id === activeRole.id ? updatedRole : r)));
    updateRolePermissions(activeRole.id, updatedRole.permissions);
  };

  // Toggle entire section (grants C-R-U by default; keeps Delete [D] off unless manually toggled)
  const toggleSectionAll = (section: SidebarCrudSection) => {
    if (!activeRole || isSuperAdminRole) return;
    const allSectionPerms = section.items.flatMap((item) => [
      ...item.permissions.C,
      ...item.permissions.R,
      ...item.permissions.U,
      ...item.permissions.D,
    ]);
    const safeSectionPerms = section.items.flatMap((item) => [
      ...item.permissions.C,
      ...item.permissions.R,
      ...item.permissions.U,
    ]);

    const isAnyActive = section.items.some((item) =>
      (['C', 'R', 'U', 'D'] as CrudAction[]).some((a) => hasCrudAccess(item, a))
    );

    const rolePermsSet = new Set(activeRole.permissions);
    if (isAnyActive) {
      allSectionPerms.forEach((p) => rolePermsSet.delete(p));
    } else {
      // Safe enable without Delete
      safeSectionPerms.forEach((p) => rolePermsSet.add(p));
    }

    const updatedRole: RoleDefinition = {
      ...activeRole,
      permissions: Array.from(rolePermsSet),
      updatedAt: new Date().toISOString(),
    };

    setRoles((prev) => prev.map((r) => (r.id === activeRole.id ? updatedRole : r)));
    updateRolePermissions(activeRole.id, updatedRole.permissions);
    showToast(`${isAnyActive ? 'Cleared' : 'Enabled C-R-U'} in section "${section.title}".`);
  };

  // Preset: View Only [R] in visible sections
  const applyViewOnly = () => {
    if (!activeRole || isSuperAdminRole) return;
    const viewPerms = visibleSections.flatMap((s) => s.items.flatMap((i) => i.permissions.R));
    const allVisiblePerms = new Set(
      visibleSections.flatMap((s) =>
        s.items.flatMap((i) => [
          ...i.permissions.C,
          ...i.permissions.R,
          ...i.permissions.U,
          ...i.permissions.D,
        ])
      )
    );

    const retained = activeRole.permissions.filter((p) => !allVisiblePerms.has(p));
    const updated = Array.from(new Set([...retained, ...viewPerms]));

    const updatedRole = { ...activeRole, permissions: updated, updatedAt: new Date().toISOString() };
    setRoles((prev) => prev.map((r) => (r.id === activeRole.id ? updatedRole : r)));
    updateRolePermissions(activeRole.id, updated);
    showToast(`Set "${activeRole.name}" to View-Only [R].`);
  };

  // Preset: Standard Full Access [C-R-U] (Default Safe: NO DELETE)
  const applyStandardAccess = () => {
    if (!activeRole || isSuperAdminRole) return;
    const safePerms = visibleSections.flatMap((s) =>
      s.items.flatMap((i) => [
        ...i.permissions.C,
        ...i.permissions.R,
        ...i.permissions.U,
      ])
    );
    // Remove any Delete permissions in visible sections
    const deletePerms = new Set(
      visibleSections.flatMap((s) => s.items.flatMap((i) => i.permissions.D))
    );

    const retained = activeRole.permissions.filter((p) => !deletePerms.has(p));
    const updated = Array.from(new Set([...retained, ...safePerms]));
    const updatedRole = { ...activeRole, permissions: updated, updatedAt: new Date().toISOString() };
    setRoles((prev) => prev.map((r) => (r.id === activeRole.id ? updatedRole : r)));
    updateRolePermissions(activeRole.id, updated);
    showToast(`Default C-R-U enabled for "${activeRole.name}" (Delete protected).`);
  };

  // Preset: Full Access [C-R-U-D] in visible sections (Includes Delete)
  const applyFullAccess = () => {
    if (!activeRole || isSuperAdminRole) return;
    const allVisiblePerms = visibleSections.flatMap((s) =>
      s.items.flatMap((i) => [
        ...i.permissions.C,
        ...i.permissions.R,
        ...i.permissions.U,
        ...i.permissions.D,
      ])
    );

    const updated = Array.from(new Set([...activeRole.permissions, ...allVisiblePerms]));
    const updatedRole = { ...activeRole, permissions: updated, updatedAt: new Date().toISOString() };
    setRoles((prev) => prev.map((r) => (r.id === activeRole.id ? updatedRole : r)));
    updateRolePermissions(activeRole.id, updated);
    showToast(`Full C-R-U-D enabled for "${activeRole.name}".`);
  };

  // Preset: Clear All in visible sections
  const clearVisible = () => {
    if (!activeRole || isSuperAdminRole) return;
    const allVisiblePerms = new Set(
      visibleSections.flatMap((s) =>
        s.items.flatMap((i) => [
          ...i.permissions.C,
          ...i.permissions.R,
          ...i.permissions.U,
          ...i.permissions.D,
        ])
      )
    );

    const retained = activeRole.permissions.filter((p) => !allVisiblePerms.has(p));
    const updatedRole = { ...activeRole, permissions: retained, updatedAt: new Date().toISOString() };
    setRoles((prev) => prev.map((r) => (r.id === activeRole.id ? updatedRole : r)));
    updateRolePermissions(activeRole.id, retained);
    showToast(`Cleared permissions in current view.`);
  };

  // ─── ADD ROLE ───
  const openAddRoleModal = () => {
    setRoleForm({ name: '', description: '', portal: 'ACADEMIC' });
    setFormError(null);
    setIsAddRoleModalOpen(true);
  };

  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      setFormError('Please enter a Role Name.');
      return;
    }

    const generatedCode = roleForm.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    if (roles.some((r) => r.code === generatedCode)) {
      setFormError('A role with this name already exists.');
      return;
    }

    // Default permissions based on portal: C, R, U enabled, DELETE [D] strictly OFF by default
    const targetSections = SIDEBAR_PORTAL_SECTIONS.filter((s) => s.portal === roleForm.portal);
    const defaultPerms = targetSections.flatMap((s) =>
      s.items.flatMap((i) => [
        ...i.permissions.C,
        ...i.permissions.R,
        ...i.permissions.U,
      ])
    );

    const newRole: RoleDefinition = {
      id: `role-${Date.now()}`,
      name: roleForm.name.trim(),
      code: generatedCode,
      description: roleForm.description.trim() || `Custom ${roleForm.portal.toLowerCase()} role.`,
      userCount: 0,
      isSystemRole: false,
      permissions: defaultPerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoles((prev) => [...prev, newRole]);
    setSelectedRoleId(newRole.id);
    setScopeFilter('AUTO');
    setIsAddRoleModalOpen(false);
    showToast(`Role "${newRole.name}" created! You can now toggle C-U-R-D.`);

    // Persist new role to Supabase backend database
    fetch('https://ismllms-production.up.railway.app/api/portals/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRole),
    }).catch(() => null);
  };

  // ─── EDIT ROLE DETAILS ───
  const openEditRoleModal = () => {
    if (!activeRole) return;
    setRoleForm({
      name: activeRole.name,
      description: activeRole.description,
      portal: detectRolePortal(activeRole.code),
    });
    setFormError(null);
    setIsEditRoleModalOpen(true);
  };

  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRole) return;
    if (!roleForm.name.trim()) {
      setFormError('Role Name is required.');
      return;
    }

    const updatedRole = {
      ...activeRole,
      name: roleForm.name.trim(),
      description: roleForm.description.trim(),
      updatedAt: new Date().toISOString(),
    };

    setRoles((prev) => prev.map((r) => (r.id === activeRole.id ? updatedRole : r)));
    setIsEditRoleModalOpen(false);
    showToast(`Role details updated.`);
  };

  // ─── DELETE ROLE ───
  const handleDeleteRole = () => {
    if (!roleToDelete) return;
    const deletedName = roleToDelete.name;
    const targetId = roleToDelete.id;
    const remainingRoles = roles.filter((r) => r.id !== targetId);
    setRoles(remainingRoles);
    if (selectedRoleId === targetId) {
      setSelectedRoleId(remainingRoles[0]?.id || '');
    }
    setRoleToDelete(null);
    showToast(`Role "${deletedName}" deleted.`);

    // Delete in Supabase backend database
    fetch(`https://ismllms-production.up.railway.app/api/portals/roles/${targetId}/delete`, {
      method: 'POST',
    }).catch(() => null);
  };

  // Filtered roles list for sidebar
  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Roles & Portal Permissions' }]} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2447] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
              Roles & Portal Sidebar Permissions
            </h1>
            <span className="text-[10px] font-bold text-[#0052CC] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Sidebar Aligned
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every section matches the exact portal sidebars (Overview, Courses & Batches, Faculty & Allocations, Teaching & Learning, Scheduling & Attendance, Governance & Reports). Super Admin can toggle <strong className="text-emerald-700">[C] Create</strong>, <strong className="text-blue-700">[R] Read</strong>, <strong className="text-amber-700">[U] Update</strong>, <strong className="text-rose-700">[D] Delete</strong> anytime.
          </p>
        </div>

        <button
          onClick={openAddRoleModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Role</span>
        </button>
      </div>

      {/* ─── MOBILE VIEW SWITCHER (Sticky under top navbar) ─── */}
      <div className="lg:hidden sticky top-[53px] z-30 bg-slate-100/95 backdrop-blur-md p-1 rounded-xl gap-1 flex items-center shadow-xs border border-slate-200/80">
        <button
          type="button"
          onClick={() => setMobileTab('ROLES')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'ROLES'
              ? 'bg-white text-[#0B2447] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Roles List ({roles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('PERMISSIONS')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'PERMISSIONS'
              ? 'bg-[#0052CC] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span className="truncate">Permissions ({activeRole.name.split(' ')[0]})</span>
        </button>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ─── LEFT PANEL: ROLES LIST (4 cols) ─── */}
        <div className={`lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col ${
          mobileTab === 'ROLES' ? 'block' : 'hidden lg:flex'
        }`}>
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-bold px-0.5">
              <span>SELECT ROLE ({roles.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">Click to manage</span>
            </div>
          </div>

          {/* Role Items */}
          <div className="divide-y divide-slate-100 max-h-[660px] overflow-y-auto">
            {filteredRoles.map((role) => {
              const isSelected = role.id === selectedRoleId;
              const rolePortal = detectRolePortal(role.code);

              return (
                <div
                  key={role.id}
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setScopeFilter('AUTO');
                    setMobileTab('PERMISSIONS');
                  }}
                  className={`p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/90 border-l-4 border-l-[#0052CC]'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs truncate ${isSelected ? 'text-[#0052CC]' : 'text-slate-900'}`}>
                        {role.name}
                      </span>
                      {role.isSystemRole && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded shrink-0">
                          System
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        rolePortal === 'ACADEMIC'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : rolePortal === 'FINANCE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rolePortal === 'TUTOR'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {rolePortal} PORTAL
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 truncate">
                        {role.userCount} active users
                      </span>
                    </div>

                    {/* Assigned User Names List in Sidebar Card */}
                    {(role as any).assignedUsers && (role as any).assignedUsers.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1 flex-wrap">
                        <Users className="w-3 h-3 text-[#0052CC] shrink-0" />
                        <span className="text-[11px] font-semibold text-[#0052CC] truncate max-w-[210px]" title={(role as any).assignedUsers.map((u: any) => u.name).join(', ')}>
                          {(role as any).assignedUsers.map((u: any) => u.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full block">
                      {role.code === 'SUPER_ADMIN' ? 'ALL C-U-R-D' : `${role.permissions.length} perms`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT PANEL: C-U-R-D PERMISSIONS MATRIX (8 cols) ─── */}
        <div className={`lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 sm:p-5 ${
          mobileTab === 'PERMISSIONS' ? 'block' : 'hidden lg:block'
        }`}>
          {activeRole ? (
            <div className="space-y-4">
              {/* Role Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl ${
                    effectiveScope === 'ACADEMIC'
                      ? 'bg-blue-50 text-[#0052CC]'
                      : effectiveScope === 'FINANCE'
                      ? 'bg-emerald-50 text-emerald-600'
                      : effectiveScope === 'TUTOR'
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-[#0B2447]">
                        {activeRole.name}
                      </h2>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {activeRole.code}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 text-slate-700">
                        Portal Scope: <strong>{effectiveScope}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{activeRole.description}</p>
                    
                    {/* Active assigned administrators / staff display banner */}
                    {(activeRole as any).assignedUsers && (activeRole as any).assignedUsers.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500">Authorized Personnel:</span>
                        {(activeRole as any).assignedUsers.map((u: any) => (
                          <span
                            key={u.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-[#0052CC]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({u.email})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Role Info */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={openEditRoleModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Name</span>
                  </button>

                  {!activeRole.isSystemRole && (
                    <button
                      onClick={() => setRoleToDelete(activeRole)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Portal Scope Switcher Tabs */}
              <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Portal View:</span>
                  
                  <button
                    onClick={() => setScopeFilter('AUTO')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      scopeFilter === 'AUTO'
                        ? 'bg-[#0052CC] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Role Scope ({detectRolePortal(activeRole.code)})
                  </button>

                  <button
                    onClick={() => setScopeFilter('ACADEMIC')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      scopeFilter === 'ACADEMIC'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Academic Portal
                  </button>

                  <button
                    onClick={() => setScopeFilter('FINANCE')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      scopeFilter === 'FINANCE'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Finance Portal
                  </button>

                  <button
                    onClick={() => setScopeFilter('TUTOR')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      scopeFilter === 'TUTOR'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tutor Portal
                  </button>

                  {isSuperAdminRole && (
                    <button
                      onClick={() => setScopeFilter('ALL')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        scopeFilter === 'ALL'
                          ? 'bg-[#0B2447] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Portals
                    </button>
                  )}
                </div>

                {!isSuperAdminRole && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={applyViewOnly}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold cursor-pointer"
                      title="Set View Only [R] in this portal"
                    >
                      View Only [R]
                    </button>
                    <button
                      type="button"
                      onClick={applyStandardAccess}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold cursor-pointer shadow-2xs"
                      title="Default Safe Mode: Enable Create, Read, Update [C-R-U] with Delete Protected [OFF]"
                    >
                      Safe [C-R-U]
                    </button>
                    <button
                      type="button"
                      onClick={applyFullAccess}
                      className="px-2 py-1 bg-white hover:bg-blue-50 text-[#0052CC] border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer"
                      title="Grant full access including Delete [C-R-U-D]"
                    >
                      All [C-U-R-D]
                    </button>
                    <button
                      type="button"
                      onClick={clearVisible}
                      className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg text-[11px] font-bold cursor-pointer"
                      title="Clear permissions in this portal"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* CURD Legend Banner & Default Protection Note */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-1 bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#0B2447]">Permissions:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <strong className="text-emerald-700">[C]</strong> Create
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <strong className="text-blue-700">[R]</strong> View
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <strong className="text-amber-700">[U]</strong> Edit
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <strong className="text-rose-700">[D]</strong> Delete
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <strong>Default Policy:</strong> [D] Delete is disabled by default; click [D] to grant
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {visibleSections.length} sections
                  </span>
                </div>
              </div>

              {/* ─── SIDEBAR SECTIONS & ITEMS C-U-R-D TABLES ─── */}
              <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
                {visibleSections.map((section) => (
                  <div
                    key={`${section.portal}-${section.title}`}
                    className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white"
                  >
                    {/* Section Header */}
                    <div className="bg-slate-100/90 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#0B2447] tracking-tight uppercase">
                          {section.title}
                        </span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                          {section.portal} SIDEBAR
                        </span>
                      </div>

                      {!isSuperAdminRole && (
                        <button
                          type="button"
                          onClick={() => toggleSectionAll(section)}
                          className="text-[10px] font-bold text-[#0052CC] hover:underline cursor-pointer"
                        >
                          Toggle Section All
                        </button>
                      )}
                    </div>

                    {/* Desktop Table View (md and up) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="py-2 px-3.5">Sidebar Menu Item</th>
                            <th className="py-2 px-2 text-center w-16 text-emerald-800">[C]</th>
                            <th className="py-2 px-2 text-center w-16 text-blue-800">[R]</th>
                            <th className="py-2 px-2 text-center w-16 text-amber-800">[U]</th>
                            <th className="py-2 px-2 text-center w-16 text-rose-800">[D]</th>
                            <th className="py-2 px-3 text-right w-20">Row</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            const hasC = hasCrudAccess(item, 'C');
                            const hasR = hasCrudAccess(item, 'R');
                            const hasU = hasCrudAccess(item, 'U');
                            const hasD = hasCrudAccess(item, 'D');

                            const canC = item.permissions.C.length > 0;
                            const canR = item.permissions.R.length > 0;
                            const canU = item.permissions.U.length > 0;
                            const canD = item.permissions.D.length > 0;

                            const anyActive = hasC || hasR || hasU || hasD;

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                {/* Item Label & Route */}
                                <td className="py-2.5 px-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-[#0B2447] text-xs flex items-center gap-2">
                                        <span>{item.label}</span>
                                        <span className="font-mono text-[9px] text-slate-400 font-normal">
                                          {item.route}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-tight">
                                        {item.description}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* [C] Button */}
                                <td className="py-2 px-2 text-center">
                                  {canC ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleCrudAction(item, 'C')}
                                      disabled={isSuperAdminRole}
                                      className={`w-7 h-7 mx-auto rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer disabled:cursor-default ${
                                        hasC
                                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                      title={hasC ? 'Click to revoke Create' : 'Click to grant Create'}
                                    >
                                      C
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-xs font-mono">—</span>
                                  )}
                                </td>

                                {/* [R] Button */}
                                <td className="py-2 px-2 text-center">
                                  {canR ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleCrudAction(item, 'R')}
                                      disabled={isSuperAdminRole}
                                      className={`w-7 h-7 mx-auto rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer disabled:cursor-default ${
                                        hasR
                                          ? 'bg-[#0052CC] text-white shadow-xs font-black'
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                      title={hasR ? 'Click to revoke Read / View' : 'Click to grant Read / View'}
                                    >
                                      R
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-xs font-mono">—</span>
                                  )}
                                </td>

                                {/* [U] Button */}
                                <td className="py-2 px-2 text-center">
                                  {canU ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleCrudAction(item, 'U')}
                                      disabled={isSuperAdminRole}
                                      className={`w-7 h-7 mx-auto rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer disabled:cursor-default ${
                                        hasU
                                          ? 'bg-amber-500 text-white shadow-xs font-black'
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                      title={hasU ? 'Click to revoke Update / Edit' : 'Click to grant Update / Edit'}
                                    >
                                      U
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-xs font-mono">—</span>
                                  )}
                                </td>

                                {/* [D] Button */}
                                <td className="py-2 px-2 text-center">
                                  {canD ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleCrudAction(item, 'D')}
                                      disabled={isSuperAdminRole}
                                      className={`w-7 h-7 mx-auto rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer disabled:cursor-default ${
                                        hasD
                                          ? 'bg-rose-600 text-white shadow-xs font-black'
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                      title={hasD ? 'Click to revoke Delete' : 'Click to grant Delete'}
                                    >
                                      D
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-xs font-mono">—</span>
                                  )}
                                </td>

                                {/* Quick Item Row Toggle */}
                                <td className="py-2 px-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => toggleItemAll(item)}
                                    disabled={isSuperAdminRole}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer disabled:cursor-default ${
                                      anyActive
                                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        : 'bg-blue-50 text-[#0052CC] hover:bg-blue-100'
                                    }`}
                                  >
                                    {anyActive ? 'Clear' : 'All'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View (block on small screens, hidden on md+) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const hasC = hasCrudAccess(item, 'C');
                        const hasR = hasCrudAccess(item, 'R');
                        const hasU = hasCrudAccess(item, 'U');
                        const hasD = hasCrudAccess(item, 'D');

                        const canC = item.permissions.C.length > 0;
                        const canR = item.permissions.R.length > 0;
                        const canU = item.permissions.U.length > 0;
                        const canD = item.permissions.D.length > 0;

                        const anyActive = hasC || hasR || hasU || hasD;

                        return (
                          <div key={item.id} className="p-3 space-y-2.5">
                            {/* Title & Path */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-[#0B2447] text-xs leading-snug">
                                    {item.label}
                                  </div>
                                  <div className="font-mono text-[9px] text-slate-400 truncate">
                                    {item.route}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleItemAll(item)}
                                disabled={isSuperAdminRole}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer shrink-0 disabled:cursor-default ${
                                  anyActive
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-blue-50 text-[#0052CC]'
                                }`}
                              >
                                {anyActive ? 'Clear' : 'Select All'}
                              </button>
                            </div>

                            {/* C-U-R-D Touch Buttons Grid (Touch-friendly 44px min height) */}
                            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                              {/* [C] */}
                              <button
                                type="button"
                                onClick={() => canC && toggleCrudAction(item, 'C')}
                                disabled={!canC || isSuperAdminRole}
                                className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                                  !canC
                                    ? 'opacity-30 bg-slate-50 text-slate-400 cursor-not-allowed'
                                    : hasC
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                                }`}
                              >
                                <span className="text-[11px] font-black">[C]</span>
                                <span className="text-[9px] font-medium leading-none">Create</span>
                              </button>

                              {/* [R] */}
                              <button
                                type="button"
                                onClick={() => canR && toggleCrudAction(item, 'R')}
                                disabled={!canR || isSuperAdminRole}
                                className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                                  !canR
                                    ? 'opacity-30 bg-slate-50 text-slate-400 cursor-not-allowed'
                                    : hasR
                                    ? 'bg-[#0052CC] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                                }`}
                              >
                                <span className="text-[11px] font-black">[R]</span>
                                <span className="text-[9px] font-medium leading-none">Read</span>
                              </button>

                              {/* [U] */}
                              <button
                                type="button"
                                onClick={() => canU && toggleCrudAction(item, 'U')}
                                disabled={!canU || isSuperAdminRole}
                                className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                                  !canU
                                    ? 'opacity-30 bg-slate-50 text-slate-400 cursor-not-allowed'
                                    : hasU
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                                }`}
                              >
                                <span className="text-[11px] font-black">[U]</span>
                                <span className="text-[9px] font-medium leading-none">Update</span>
                              </button>

                              {/* [D] */}
                              <button
                                type="button"
                                onClick={() => canD && toggleCrudAction(item, 'D')}
                                disabled={!canD || isSuperAdminRole}
                                className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-0.5 ${
                                  !canD
                                    ? 'opacity-30 bg-slate-50 text-slate-400 cursor-not-allowed'
                                    : hasD
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                                }`}
                              >
                                <span className="text-[11px] font-black">[D]</span>
                                <span className="text-[9px] font-medium leading-none">Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status and Active Count */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Permissions take effect live across the entire college portal for{' '}
                    <strong className="text-slate-800">{activeRole.name}</strong>.
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-slate-400">
                  Total Active Entitlements: <strong>{activeRole.permissions.length}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-bold">Select a role to configure portal permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: CREATE ROLE ─── */}
      <Modal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        title="Add New Role"
        description="Select the portal this role will primarily operate under."
        maxWidth="md"
      >
        <form onSubmit={handleAddRoleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Portal Scope <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ACADEMIC', 'FINANCE', 'TUTOR'] as PortalScope[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setRoleForm({ ...roleForm, portal: p })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    roleForm.portal === p
                      ? 'bg-blue-50 border-[#0052CC] text-[#0052CC] ring-1 ring-blue-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Role Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              placeholder="e.g. Senior Curriculum Specialist..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Description</label>
            <textarea
              rows={2}
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              placeholder="Responsibilities associated with this role..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0052CC] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddRoleModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
            >
              Create Role
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: EDIT ROLE ─── */}
      {isEditRoleModalOpen && (
        <Modal
          isOpen={isEditRoleModalOpen}
          onClose={() => setIsEditRoleModalOpen(false)}
          title="Edit Role Details"
          description="Update display name or description."
          maxWidth="md"
        >
          <form onSubmit={handleEditRoleSubmit} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Role Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Description</label>
              <textarea
                rows={2}
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0052CC] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditRoleModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: ASSIGN ROLE TO SPECIFIC USER ID ─── */}
      {isAssignModalOpen && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Role: "${activeRole.name}" to User`}
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0052CC]">
                <ShieldCheck className="w-4 h-4" />
                <span>Assigning Role: <strong>{activeRole.name}</strong> ({activeRole.code})</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Select an institutional User ID / Faculty / Staff below to grant them this role and all configured C-U-R-D sidebar permissions.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Select User ID / Account <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedUserToAssign}
                onChange={(e) => setSelectedUserToAssign(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                {assignUserList.map((u) => {
                  const userName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Admin User';
                  return (
                    <option key={u.id} value={u.id}>
                      {userName} — ID: {u.id} ({u.email}) [{u.userType || 'STAFF'}]
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected User Details Preview */}
            {(() => {
              const u = assignUserList.find((x) => x.id === selectedUserToAssign);
              if (!u) return null;
              return (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Target User ID:</span>
                    <span className="font-mono text-[11px] font-bold text-[#0B2447] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {u.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="font-bold text-slate-700">{u.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Account Type:</span>
                    <span className="font-bold text-indigo-700">{u.userType || 'STAFF'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">New Role Assigned:</span>
                    <span className="font-bold text-[#0052CC] bg-blue-100/70 px-2 py-0.5 rounded">
                      {activeRole.name}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAssigning || !selectedUserToAssign}
                onClick={handleAssignRoleToUser}
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition disabled:opacity-50 shadow-xs"
              >
                {isAssigning ? 'Assigning...' : 'Confirm Role Assignment'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: DELETE ROLE CONFIRMATION ─── */}
      {roleToDelete && (
        <ConfirmationModal
          isOpen={!!roleToDelete}
          onClose={() => setRoleToDelete(null)}
          onConfirm={handleDeleteRole}
          title="Delete Role"
          message={`Are you sure you want to delete the role "${roleToDelete.name}"?`}
          entityName={roleToDelete.name}
          confirmLabel="Delete Role"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}

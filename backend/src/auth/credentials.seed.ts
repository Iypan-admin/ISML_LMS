// ============================================================================
// ISML ENTERPRISE PRE-SEEDED CREDENTIALS (ALL 8 PORTAL ROLES)
// ============================================================================

export interface SeedUserCredential {
  id: string;
  email: string;
  passwordHash: string; // Plaintext for demo login fallback: "Isml@2026!"
  plainPassword: string;
  name: string;
  role: string;
  portalRoute: string;
  campusId: string;
  campusName: string;
}

export const SEED_CREDENTIALS: SeedUserCredential[] = [
  {
    id: 'user-super-admin',
    email: 'admin@isml.edu',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'SuperAdmin@2026!',
    name: 'Dr. Rajesh Sundaram',
    role: 'SUPER_ADMIN',
    portalRoute: '/super-admin/dashboard',
    campusId: 'inst-global',
    campusName: 'Consolidated Global Campus',
  },
  {
    id: 'user-academic-manager',
    email: 'academics@isml.edu',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'Academic@2026!',
    name: 'Prof. Meenakshi Sundaram',
    role: 'ACADEMIC_MANAGER',
    portalRoute: '/academic-manager/dashboard',
    campusId: 'inst-01',
    campusName: 'Loyola College of Arts & Science',
  },
  {
    id: 'user-finance-manager',
    email: 'finance@isml.edu',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'Finance@2026!',
    name: 'S. Ramanathan FCA',
    role: 'FINANCE_MANAGER',
    portalRoute: '/finance-manager/dashboard',
    campusId: 'inst-global',
    campusName: 'Consolidated Global Campus',
  },
  {
    id: 'user-sales-manager',
    email: 'sales@isml.edu',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'Sales@2026!',
    name: 'Vikramaditya Nair',
    role: 'SALES_MANAGER',
    portalRoute: '/sales-manager/dashboard',
    campusId: 'inst-global',
    campusName: 'Central Admissions Desk',
  },
  {
    id: 'user-college-admin',
    email: 'collegeadmin@loyola.isml.edu',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'College@2026!',
    name: 'Dr. Joseph Antonysamy',
    role: 'COLLEGE_ADMIN',
    portalRoute: '/college-admin/dashboard',
    campusId: 'inst-01',
    campusName: 'Loyola College of Arts & Science',
  },
  {
    id: 'fac-201834',
    email: 'joyjk348@gmail.com',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'Tutor@2026!',
    name: 'Joy JK',
    role: 'TUTOR',
    portalRoute: '/tutor/dashboard',
    campusId: '521323cd-00da-49a6-98ed-6b7918d181b4',
    campusName: 'The American College',
  },
  {
    id: 'user-tutor',
    email: 'tutor@isml.edu',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'Tutor@2026!',
    name: 'Madame Claire Dubois',
    role: 'TUTOR',
    portalRoute: '/tutor/dashboard',
    campusId: 'inst-01',
    campusName: 'Loyola College of Arts & Science',
  },
  {
    id: 'user-student',
    email: 'student@isml.edu',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'Student@2026!',
    name: 'Aarav Sharma',
    role: 'STUDENT',
    portalRoute: '/dashboard',
    campusId: 'inst-01',
    campusName: 'Loyola College of Arts & Science',
  },
  {
    id: 'user-parent',
    email: 'parent@isml.edu',
    passwordHash: '$2b$10$954t94h4fC60XoXg3lQG3OqZ2O7OQv5Vq1R0e0KkE1b4m0ZgJ4g2S',
    plainPassword: 'Parent@2026!',
    name: 'Ramesh Sharma',
    role: 'PARENT',
    portalRoute: '/parent/dashboard',
    campusId: 'inst-01',
    campusName: 'Loyola College of Arts & Science',
  },
];

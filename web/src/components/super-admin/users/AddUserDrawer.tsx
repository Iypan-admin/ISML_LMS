// ============================================================================
// ISML COLLEGE LMS — ADD USER SLIDE-OVER DRAWER
// Enterprise Right-Side Slide-Over Provisioning Panel
// Global Scope + Menu ID Access + Unified Student & Parent Portal Co-Provisioning
// Strictly Zero Plaintext Passwords — System Generated & Emailed Credentials
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  UserPlus,
  Shield,
  ShieldCheck,
  Building2,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Phone,
  Lock,
  Search,
  Sparkles,
  HelpCircle,
  Coins,
  Briefcase,
  AlertTriangle,
  RotateCcw,
  Globe2,
  CheckSquare,
  Square,
  KeyRound,
  LayoutDashboard,
  Compass,
  Users,
  HeartHandshake,
  UserCheck,
  Link2,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  mockRoles,
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches,
  mockStudents,
  mockUsers,
} from '@/mock/superAdminData';
import { SUPER_ADMIN_MENU_GROUPS } from '@/config/menu';
import { SuperAdminUser, RoleDefinition, MenuId, StudentUser } from '@/types/rbac';

interface AddUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: SuperAdminUser) => void;
  initialRoleId?: string;
}

// Role visualization metadata
const ROLE_META: Record<
  string,
  {
    icon: React.ElementType;
    category: 'ADMIN' | 'ACADEMIC' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'FINANCE';
    categoryLabel: string;
    badgeClass: string;
    description: string;
  }
> = {
  'role-super-admin': {
    icon: ShieldCheck,
    category: 'ADMIN',
    categoryLabel: 'System Authority',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Full platform administrative control, institutional security & master governance.',
  },
  'role-manager': {
    icon: Briefcase,
    category: 'ADMIN',
    categoryLabel: 'Operations',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    description: 'Campus operations, departmental schedules, batch allocations and facility coordination.',
  },
  'role-finance-mgr': {
    icon: Coins,
    category: 'FINANCE',
    categoryLabel: 'Finance & Accounts',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Tuition fees, program structures, installment plans, receipts & financial audit oversight.',
  },
  'role-acad-coord': {
    icon: Layers,
    category: 'ACADEMIC',
    categoryLabel: 'Academic Coordination',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Syllabus approvals, curriculum management, academic calendars and course coordination.',
  },
  'role-teacher': {
    icon: BookOpen,
    category: 'FACULTY',
    categoryLabel: 'Teaching Faculty',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Conducts classes, uploads course resources, publishes assessments and submits term marks.',
  },
  'role-asst-teacher': {
    icon: BookOpen,
    category: 'FACULTY',
    categoryLabel: 'Teaching Faculty',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Assists faculty with lecture materials, attendance tracking and student practical exercises.',
  },
  'role-doubt-teacher': {
    icon: HelpCircle,
    category: 'FACULTY',
    categoryLabel: 'Academic Support',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    description: 'Specialized 1-on-1 and cohort doubt resolution, problem clearing, and forum moderation.',
  },
  'role-asst-doubt-teacher': {
    icon: HelpCircle,
    category: 'FACULTY',
    categoryLabel: 'Academic Support',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: 'Provides auxiliary tutoring, answers forum inquiries, and assists primary doubt faculty.',
  },
  'role-student': {
    icon: GraduationCap,
    category: 'STUDENT',
    categoryLabel: 'Learner Cohort',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Access to learning materials, live sessions, assignments, doubt tickets & term results.',
  },
  'role-parent': {
    icon: Users,
    category: 'PARENT',
    categoryLabel: 'Parent & Guardian',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    description: 'Parent Portal access to monitor child attendance, term fee receipts, academic progress & doubts.',
  },
  'role-auditor': {
    icon: Shield,
    category: 'ADMIN',
    categoryLabel: 'Compliance & Audit',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Read-only compliance verification, security event trail inspection & institutional review.',
  },
};

export default function AddUserDrawer({
  isOpen,
  onClose,
  onUserCreated,
  initialRoleId,
}: AddUserDrawerProps) {
  // Navigation: 'ROLE_SELECT' | 'FORM' | 'SUCCESS'
  const [currentStep, setCurrentStep] = useState<'ROLE_SELECT' | 'FORM' | 'SUCCESS'>(
    initialRoleId ? 'FORM' : 'ROLE_SELECT'
  );

  // Selected Role
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialRoleId || 'role-super-admin'
  );
  const [roleSearch, setRoleSearch] = useState('');
  const [roleCategoryFilter, setRoleCategoryFilter] = useState<string>('ALL');

  // Form Fields — Primary User
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // College Scope: 'ALL_COLLEGES' (default) vs 'SPECIFIC_COLLEGE'
  const [scopeMode, setScopeMode] = useState<'ALL_COLLEGES' | 'SPECIFIC_COLLEGE'>('ALL_COLLEGES');
  const [specificCollegeId, setSpecificCollegeId] = useState<string>(
    mockInstitutions[0]?.id || 'inst-01'
  );

  // Student-specific fields (ONLY shown when role is Student)
  const [studentCollegeId, setStudentCollegeId] = useState<string>(mockInstitutions[0]?.id || 'inst-01');
  const [studentDeptId, setStudentDeptId] = useState<string>(mockDepartments[0]?.id || 'dept-cs');
  const [studentProgId, setStudentProgId] = useState<string>(mockPrograms[0]?.id || 'prog-bsc-cs');
  const [studentBatchId, setStudentBatchId] = useState<string>(mockBatches[0]?.id || 'batch-2026-cs');
  const [studentSemester, setStudentSemester] = useState<number>(1);

  // Parent Co-Provisioning Fields (When creating a Student)
  const [autoCreateParent, setAutoCreateParent] = useState<boolean>(true);
  const [parentName, setParentName] = useState<string>('');
  const [parentRelationship, setParentRelationship] = useState<string>('FATHER');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [parentMobile, setParentMobile] = useState<string>('');

  // Parent Account Fields (When creating a Parent directly)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  // Menu ID Access State (Checked Menu IDs)
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ACCOUNT' | 'MENU_ACCESS'>('ACCOUNT');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<SuperAdminUser | null>(null);
  const [createdParentInfo, setCreatedParentInfo] = useState<{
    id: string;
    name: string;
    email: string;
    relationship: string;
  } | null>(null);

  // Selected role definition
  const selectedRole = useMemo(() => {
    return mockRoles.find((r) => r.id === selectedRoleId) || mockRoles[0];
  }, [selectedRoleId]);

  const isStudentRole =
    selectedRole.id === 'role-student' || selectedRole.name.toLowerCase().includes('student');
  const isParentRole =
    selectedRole.id === 'role-parent' || selectedRole.name.toLowerCase().includes('parent');

  // Derive initial Menu IDs from role permissions when role changes
  const roleDefaultMenuIds = useMemo(() => {
    const permSet = new Set(selectedRole.permissions || []);
    const matchingMenuIds: string[] = [];

    SUPER_ADMIN_MENU_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        const hasAccess =
          selectedRole.id === 'role-super-admin' ||
          item.requiredPermissions.some((p) => permSet.has(p));
        if (hasAccess) {
          matchingMenuIds.push(item.id);
        }
      });
    });

    return matchingMenuIds;
  }, [selectedRole]);

  // Synchronize Menu IDs when role changes
  useEffect(() => {
    setSelectedMenuIds(roleDefaultMenuIds);
  }, [roleDefaultMenuIds]);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      if (initialRoleId) {
        setSelectedRoleId(initialRoleId);
        setCurrentStep('FORM');
      } else {
        setCurrentStep('ROLE_SELECT');
      }
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobile('');
      setScopeMode('ALL_COLLEGES');
      setCreatedUser(null);
      setCreatedParentInfo(null);
      setIsSubmitting(false);
      setActiveTab('ACCOUNT');
      // Reset parent fields
      setAutoCreateParent(true);
      setParentName('');
      setParentRelationship('FATHER');
      setParentEmail('');
      setParentMobile('');
      setSelectedStudentIds([]);
      setStudentSearchQuery('');
    }
  }, [isOpen, initialRoleId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Toggle single Menu ID
  const toggleMenuId = (menuId: string) => {
    setSelectedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  // Toggle entire Menu Group
  const toggleMenuGroup = (items: { id: string }[]) => {
    const itemIds = items.map((i) => i.id);
    const allSelected = itemIds.every((id) => selectedMenuIds.includes(id));
    if (allSelected) {
      setSelectedMenuIds((prev) => prev.filter((id) => !itemIds.includes(id)));
    } else {
      setSelectedMenuIds((prev) => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  // Select all Menu IDs
  const handleSelectAllMenus = () => {
    const allIds: string[] = [];
    SUPER_ADMIN_MENU_GROUPS.forEach((g) => g.items.forEach((i) => allIds.push(i.id)));
    setSelectedMenuIds(allIds);
  };

  // Reset to default Menu IDs
  const handleResetToRoleDefaults = () => {
    setSelectedMenuIds(roleDefaultMenuIds);
  };

  // Search filtered students for Parent Role linking
  const searchableStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return mockStudents.slice(0, 4);
    const q = studentSearchQuery.toLowerCase();
    return mockStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.programName.toLowerCase().includes(q)
    );
  }, [studentSearchQuery]);

  // Filtered Roles List for Step 1
  const filteredRoles = useMemo(() => {
    return mockRoles.filter((r) => {
      const meta = ROLE_META[r.id];
      if (roleCategoryFilter !== 'ALL' && meta?.category !== roleCategoryFilter) {
        return false;
      }
      if (roleSearch.trim()) {
        const q = roleSearch.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          meta?.categoryLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [roleSearch, roleCategoryFilter]);

  if (!isOpen) return null;

  // Handle Role Selection -> Proceed to Form
  const handleSelectRole = (rId: string) => {
    setSelectedRoleId(rId);
    setCurrentStep('FORM');
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const collegeObj =
        scopeMode === 'SPECIFIC_COLLEGE'
          ? mockInstitutions.find((c) => c.id === specificCollegeId)
          : null;

      const generatedId = isStudentRole
        ? `ISML${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
        : isParentRole
        ? `PAR${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
        : `USR${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser: SuperAdminUser = {
        id: generatedId,
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        mobile: mobile.trim() || undefined,
        avatarUrl: `/avatars/${firstName.toLowerCase().replace(/\s+/g, '')}.png`,
        roleId: selectedRole.id,
        roleName: selectedRole.name,
        roleCode: selectedRole.code,
        collegeId:
          isStudentRole
            ? studentCollegeId
            : scopeMode === 'SPECIFIC_COLLEGE'
            ? specificCollegeId
            : 'INST_ALL',
        collegeName: isStudentRole
          ? mockInstitutions.find((c) => c.id === studentCollegeId)?.name || 'ISML Campus'
          : scopeMode === 'SPECIFIC_COLLEGE'
          ? collegeObj?.name || 'Assigned College'
          : 'All Institutions (Global Access)',
        departmentId: isStudentRole ? studentDeptId : undefined,
        departmentName: isStudentRole
          ? mockDepartments.find((d) => d.id === studentDeptId)?.name
          : undefined,
        programId: isStudentRole ? studentProgId : undefined,
        programName: isStudentRole
          ? mockPrograms.find((p) => p.id === studentProgId)?.name
          : undefined,
        batchId: isStudentRole ? studentBatchId : undefined,
        batchName: isStudentRole
          ? mockBatches.find((b) => b.id === studentBatchId)?.name
          : undefined,
        semesterNumber: isStudentRole ? studentSemester : undefined,
        permissions: selectedRole.permissions,
        status: 'ACTIVE',
        lastLoginAt: 'Never',
        createdAt: new Date().toISOString(),
        emailVerified: true,
        credentialsDelivered: true,
        linkedStudentIds: isParentRole ? selectedStudentIds : undefined,
        linkedStudentsCount: isParentRole ? selectedStudentIds.length : undefined,
        parentRelationship: isParentRole ? parentRelationship : undefined,
      };

      // If Student role and auto-create parent is active
      if (isStudentRole && autoCreateParent && parentName.trim() && parentEmail.trim()) {
        const parentId = `PAR${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
        const linkedParent: SuperAdminUser = {
          id: parentId,
          name: parentName.trim(),
          email: parentEmail.trim(),
          mobile: parentMobile.trim() || undefined,
          avatarUrl: '/avatars/parent.png',
          roleId: 'role-parent',
          roleName: 'Parent / Guardian',
          roleCode: 'PARENT_GUARDIAN',
          collegeId: studentCollegeId,
          collegeName: newUser.collegeName,
          permissions: ['STUDENT_VIEW', 'DASHBOARD_VIEW'],
          status: 'ACTIVE',
          lastLoginAt: 'Never',
          createdAt: new Date().toISOString(),
          emailVerified: true,
          credentialsDelivered: true,
          linkedStudentIds: [generatedId],
          linkedStudentsCount: 1,
          parentRelationship: parentRelationship,
        };
        mockUsers.unshift(linkedParent);
        setCreatedParentInfo({
          id: parentId,
          name: parentName.trim(),
          email: parentEmail.trim(),
          relationship: parentRelationship,
        });
      }

      onUserCreated(newUser);
      setCreatedUser(newUser);
      setIsSubmitting(false);
      setCurrentStep('SUCCESS');
    }, 650);
  };

  const totalPossibleMenuCount = SUPER_ADMIN_MENU_GROUPS.reduce(
    (acc, g) => acc + g.items.length,
    0
  );

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl md:max-w-2xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
          {/* Header Bar */}
          <div className="px-5 py-4 bg-[#0B2447] text-white flex items-center justify-between shrink-0 border-b border-[#1E3A8A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {currentStep === 'ROLE_SELECT'
                    ? 'Select Role for New User'
                    : currentStep === 'SUCCESS'
                    ? 'Account Provisioned'
                    : `Create ${selectedRole.name}`}
                </h2>
                <p className="text-[11px] text-blue-200">
                  {currentStep === 'ROLE_SELECT'
                    ? 'Step 1: Choose target platform role (Admin, Student, Parent, Faculty)'
                    : currentStep === 'SUCCESS'
                    ? 'Zero-Plaintext Credentials Dispatched'
                    : isStudentRole
                    ? 'Step 2: Student identity, Academic cohort & Parent portal linkage'
                    : isParentRole
                    ? 'Step 2: Parent identity & Enrolled student linkage'
                    : 'Step 2: User details, College scope & Menu ID permissions'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Close panel (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-slate-700 space-y-6">
            {/* ══════════════════════════════════════════════════════════
                STEP 1: ROLE SELECTION CARDS
               ══════════════════════════════════════════════════════════ */}
            {currentStep === 'ROLE_SELECT' && (
              <div className="space-y-4">
                {/* Search & Category Filter */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      placeholder="Search role by name or capability..."
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    {[
                      { id: 'ALL', label: 'All Roles' },
                      { id: 'ADMIN', label: 'Admin & Ops' },
                      { id: 'STUDENT', label: 'Students' },
                      { id: 'PARENT', label: 'Parents / Guardians' },
                      { id: 'FACULTY', label: 'Faculty & Doubt' },
                      { id: 'ACADEMIC', label: 'Academic Mgmt' },
                      { id: 'FINANCE', label: 'Finance' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setRoleCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                          roleCategoryFilter === cat.id
                            ? 'bg-[#0052CC] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <p className="text-[11px] text-slate-500 font-semibold mb-2">
                    Click a role below to configure user identity & permissions:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredRoles.map((role) => {
                      const meta = ROLE_META[role.id] || {
                        icon: Shield,
                        categoryLabel: 'Role',
                        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
                        description: role.description,
                      };
                      const IconComponent = meta.icon;

                      return (
                        <div
                          key={role.id}
                          onClick={() => handleSelectRole(role.id)}
                          className="group p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between text-left"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-[#0052CC] text-blue-700 group-hover:text-white flex items-center justify-center transition-colors">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${meta.badgeClass}`}
                              >
                                {meta.categoryLabel}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#0052CC] transition-colors">
                              {role.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {meta.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-500">
                              {role.permissions.length} Privileges
                            </span>
                            <span className="font-bold text-[#0052CC] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>Configure</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 2: FORM DETAILS & ROLE-SPECIFIC SECTIONS
               ══════════════════════════════════════════════════════════ */}
            {currentStep === 'FORM' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Switcher Banner */}
                <div className="flex items-center justify-between p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0052CC] text-white flex items-center justify-center shrink-0">
                      {React.createElement(ROLE_META[selectedRole.id]?.icon || Shield, {
                        className: 'w-4 h-4',
                      })}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">
                        Target Role
                      </span>
                      <h4 className="font-bold text-[#0B2447] text-sm">{selectedRole.name}</h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('ROLE_SELECT')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#0052CC] rounded-lg font-bold text-[11px] border border-blue-200 transition-colors cursor-pointer"
                  >
                    Change Role
                  </button>
                </div>

                {/* Sub-Tabs: Account Details vs Menu ID Access (Only for Admin/Staff) */}
                {!isStudentRole && !isParentRole && (
                  <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ACCOUNT')}
                      className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
                        activeTab === 'ACCOUNT'
                          ? 'border-[#0052CC] text-[#0052CC]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      1. Account & College Scope
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('MENU_ACCESS')}
                      className={`pb-2.5 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'MENU_ACCESS'
                          ? 'border-[#0052CC] text-[#0052CC]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>2. Menu ID & Module Access</span>
                      <span className="px-1.5 py-0.2 bg-blue-100 text-[#0052CC] rounded-full text-[10px] font-bold">
                        {selectedMenuIds.length}
                      </span>
                    </button>
                  </div>
                )}

                {/* TAB 1: Account & Details */}
                {(activeTab === 'ACCOUNT' || isStudentRole || isParentRole) && (
                  <div className="space-y-5">
                    {/* Primary Personal Information */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-[#0B2447] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {isParentRole ? 'Parent / Guardian Personal Information' : 'Personal Information'}
                        </span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 text-xs">
                            First Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="e.g. Arun"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 text-xs">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="e.g. Kumar"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 text-xs">
                            Primary Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 text-xs">
                            Mobile Phone Number
                          </label>
                          <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="+91 98401 23456"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ─── CASE A: PARENT ROLE — LINK ENROLLED STUDENTS ─── */}
                    {isParentRole && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-[#0B2447] text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                            <span>Link Enrolled Students (Children / Wards)</span>
                          </h3>
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                            {selectedStudentIds.length} Students Linked
                          </span>
                        </div>

                        {/* Relationship selector */}
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1 text-xs">
                            Relationship to Student(s) <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={parentRelationship}
                            onChange={(e) => setParentRelationship(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
                          >
                            <option value="FATHER">Father</option>
                            <option value="MOTHER">Mother</option>
                            <option value="GUARDIAN">Legal Guardian</option>
                            <option value="SPONSOR">Educational Sponsor</option>
                          </select>
                        </div>

                        {/* Student Search & Picker */}
                        <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={studentSearchQuery}
                              onChange={(e) => setStudentSearchQuery(e.target.value)}
                              placeholder="Search student by name, student ID (e.g. ISML20260001)..."
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-teal-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>

                          {/* Quick Student Suggestions */}
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {searchableStudents.map((s) => {
                              const isLinked = selectedStudentIds.includes(s.id);
                              return (
                                <div
                                  key={s.id}
                                  className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                                    isLinked
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold">{s.name}</span>
                                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                                        {s.studentId}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{s.programName}</p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isLinked) {
                                        setSelectedStudentIds((prev) =>
                                          prev.filter((id) => id !== s.id)
                                        );
                                      } else {
                                        setSelectedStudentIds((prev) => [...prev, s.id]);
                                      }
                                    }}
                                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                      isLinked
                                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                        : 'bg-[#0052CC] text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    {isLinked ? 'Remove' : '+ Link'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Linked Students Summary Chips */}
                        {selectedStudentIds.length > 0 && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Currently Linked Students ({selectedStudentIds.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedStudentIds.map((sId) => {
                                const st = mockStudents.find((s) => s.id === sId);
                                return (
                                  <span
                                    key={sId}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-teal-300 text-teal-900 rounded-lg text-xs font-semibold shadow-2xs"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                                    <span>{st?.name || sId}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedStudentIds((prev) =>
                                          prev.filter((id) => id !== sId)
                                        )
                                      }
                                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── CASE B: STUDENT ROLE — ACADEMIC COHORT & PARENT CO-PROVISIONING ─── */}
                    {isStudentRole && (
                      <div className="space-y-4 pt-2">
                        {/* Student Academic Details */}
                        <div className="space-y-3">
                          <h3 className="font-bold text-[#0B2447] text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Student Academic Cohort Placement</span>
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                                College / Institution
                              </label>
                              <select
                                value={studentCollegeId}
                                onChange={(e) => setStudentCollegeId(e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                              >
                                {mockInstitutions.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                                Department
                              </label>
                              <select
                                value={studentDeptId}
                                onChange={(e) => setStudentDeptId(e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                              >
                                {mockDepartments.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                                Program
                              </label>
                              <select
                                value={studentProgId}
                                onChange={(e) => setStudentProgId(e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                              >
                                {mockPrograms.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                                Batch Cohort
                              </label>
                              <select
                                value={studentBatchId}
                                onChange={(e) => setStudentBatchId(e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                              >
                                {mockBatches.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                                Semester
                              </label>
                              <select
                                value={studentSemester}
                                onChange={(e) => setStudentSemester(Number(e.target.value))}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                  <option key={s} value={s}>
                                    Semester {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Parent / Guardian Co-Provisioning Box */}
                        <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HeartHandshake className="w-4 h-4 text-teal-700" />
                              <span className="font-bold text-teal-950 text-xs">
                                Parent / Guardian Account Co-Provisioning
                              </span>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={autoCreateParent}
                                onChange={(e) => setAutoCreateParent(e.target.checked)}
                                className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-teal-800">
                                Auto-provision Parent Portal
                              </span>
                            </label>
                          </div>

                          <p className="text-[11px] text-teal-800 leading-relaxed">
                            Creating this student will automatically generate a linked Parent account. 
                            The parent will receive Parent Portal login credentials to monitor their ward&apos;s attendance, 
                            fee receipts, term results, and doubt tickets.
                          </p>

                          {autoCreateParent && (
                            <div className="space-y-3 pt-1 border-t border-teal-200/60">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                                    Parent Legal Name <span className="text-rose-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={parentName}
                                    onChange={(e) => setParentName(e.target.value)}
                                    placeholder="e.g. Meenakshi Sundaram"
                                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500"
                                    required={autoCreateParent}
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                                    Relationship <span className="text-rose-500">*</span>
                                  </label>
                                  <select
                                    value={parentRelationship}
                                    onChange={(e) => setParentRelationship(e.target.value)}
                                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                  >
                                    <option value="FATHER">Father</option>
                                    <option value="MOTHER">Mother</option>
                                    <option value="GUARDIAN">Legal Guardian</option>
                                    <option value="SPONSOR">Educational Sponsor</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                                    Parent Email (For Portal Credentials) <span className="text-rose-500">*</span>
                                  </label>
                                  <input
                                    type="email"
                                    value={parentEmail}
                                    onChange={(e) => setParentEmail(e.target.value)}
                                    placeholder="parent@example.com"
                                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500"
                                    required={autoCreateParent}
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                                    Parent Mobile Phone
                                  </label>
                                  <input
                                    type="tel"
                                    value={parentMobile}
                                    onChange={(e) => setParentMobile(e.target.value)}
                                    placeholder="+91 94440 12345"
                                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ─── CASE C: ADMIN & STAFF — GLOBAL SCOPE SELECTOR ─── */}
                    {!isStudentRole && !isParentRole && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-[#0B2447] text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>College Scope & Access Level</span>
                          </h3>
                          <span className="text-[11px] text-slate-400 font-normal">
                            (No forced department mapping)
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {/* Option 1: All Colleges (Default) */}
                          <label
                            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                              scopeMode === 'ALL_COLLEGES'
                                ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="scopeMode"
                              checked={scopeMode === 'ALL_COLLEGES'}
                              onChange={() => setScopeMode('ALL_COLLEGES')}
                              className="mt-0.5 text-[#0052CC] focus:ring-[#0052CC] cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">
                                  All Colleges & Institutions (Global Platform Admin)
                                </span>
                                <span className="text-[10px] bg-blue-100 text-[#0052CC] px-2 py-0.2 rounded-full font-bold">
                                  Default
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                This user oversees all affiliated colleges. They can toggle and govern any campus without restricted boundaries.
                              </p>
                            </div>
                          </label>

                          {/* Option 2: Specific College */}
                          <label
                            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                              scopeMode === 'SPECIFIC_COLLEGE'
                                ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="scopeMode"
                              checked={scopeMode === 'SPECIFIC_COLLEGE'}
                              onChange={() => setScopeMode('SPECIFIC_COLLEGE')}
                              className="mt-0.5 text-[#0052CC] focus:ring-[#0052CC] cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="font-bold text-slate-900 text-xs">
                                Specific College / Campus Only
                              </span>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                Restrict this user&apos;s administrative view strictly to a single designated institution.
                              </p>

                              {scopeMode === 'SPECIFIC_COLLEGE' && (
                                <div className="mt-2.5">
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Select Restricted College:
                                  </label>
                                  <select
                                    value={specificCollegeId}
                                    onChange={(e) => setSpecificCollegeId(e.target.value)}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
                                  >
                                    {mockInstitutions.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Zero-Plaintext Security Banner */}
                    <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold mb-0.5">Zero-Plaintext Security Architecture</p>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          Initial passwords will be cryptographically minted on the server and delivered directly to{' '}
                          <strong className="font-semibold">{email || 'the registered user'}</strong>.
                          {isStudentRole && autoCreateParent && parentEmail && (
                            <> Parent portal credentials will be dispatched to <strong className="font-semibold">{parentEmail}</strong>.</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Menu ID & Module Access (For Staff / Admins) */}
                {activeTab === 'MENU_ACCESS' && !isStudentRole && !isParentRole && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-[#0B2447] text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-blue-600" />
                          <span>Platform Menu ID Privileges</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Configure which navigation modules this user is authorized to access:
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllMenus}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleResetToRoleDefaults}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Role Defaults
                        </button>
                      </div>
                    </div>

                    {/* Counter Banner */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Selected Authorized Modules:</span>
                      <span className="font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {selectedMenuIds.length} of {totalPossibleMenuCount} Menu IDs Authorized
                      </span>
                    </div>

                    {/* Grouped Menu ID Checklists */}
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                      {SUPER_ADMIN_MENU_GROUPS.map((group) => {
                        const groupItemIds = group.items.map((i) => i.id);
                        const isAllGroupSelected = groupItemIds.every((id) =>
                          selectedMenuIds.includes(id)
                        );

                        return (
                          <div
                            key={group.id}
                            className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                                <span>{group.title}</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleMenuGroup(group.items)}
                                className="text-[10px] text-[#0052CC] hover:underline font-semibold cursor-pointer"
                              >
                                {isAllGroupSelected ? 'Deselect Group' : 'Select All in Group'}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {group.items.map((item) => {
                                const isChecked = selectedMenuIds.includes(item.id);
                                return (
                                  <label
                                    key={item.id}
                                    className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                                      isChecked
                                        ? 'bg-blue-50/80 border-blue-200 text-slate-900'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleMenuId(item.id)}
                                      className="rounded text-[#0052CC] focus:ring-[#0052CC] cursor-pointer"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-xs truncate">{item.label}</p>
                                      <span className="font-mono text-[9px] text-slate-400 block truncate">
                                        {item.id}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('ROLE_SELECT')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Roles</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !firstName.trim() || !email.trim()}
                      className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span>Creating Account...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Create {selectedRole.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ══════════════════════════════════════════════════════════
                STEP 3: SUCCESS VIEW
               ══════════════════════════════════════════════════════════ */}
            {currentStep === 'SUCCESS' && createdUser && (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#0B2447]">
                    User Account Created Successfully
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Single sign-on profile has been registered in the institutional IAM directory.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Assigned User ID:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      {createdUser.id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Assigned Role:</span>
                    <span className="font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {createdUser.roleName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Registered Email:</span>
                    <span className="font-medium text-slate-800">{createdUser.email}</span>
                  </div>

                  {createdUser.collegeName && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">College Scope:</span>
                      <span className="font-medium text-slate-800">{createdUser.collegeName}</span>
                    </div>
                  )}

                  {/* If student with linked parent created */}
                  {createdParentInfo && (
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-1.5 my-1">
                      <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                        <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
                        <span>Linked Parent Portal Account Provisioned</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-teal-800">
                        <span>Parent: {createdParentInfo.name} ({createdParentInfo.relationship})</span>
                        <span className="font-mono">{createdParentInfo.id}</span>
                      </div>
                      <p className="text-[10px] text-teal-700">
                        Parent Portal login credentials dispatched to <strong>{createdParentInfo.email}</strong>
                      </p>
                    </div>
                  )}

                  {/* If parent with linked students */}
                  {isParentRole && selectedStudentIds.length > 0 && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Linked Students:</span>
                      <span className="font-bold text-teal-700">
                        {selectedStudentIds.length} Enrolled Learner(s) Linked
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Credential Status:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Credentials sent to email</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('ROLE_SELECT');
                      setFirstName('');
                      setLastName('');
                      setEmail('');
                      setMobile('');
                      setParentName('');
                      setParentEmail('');
                      setSelectedStudentIds([]);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Another User</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-[#0B2447] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

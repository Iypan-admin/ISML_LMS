// ============================================================================
// ISML COLLEGE LMS — AUTH & RBAC CONTEXT PROVIDER
// Centralized Permission Checking, Menu Access Control & Dynamic Role Switching
// ============================================================================

"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  MenuId,
  PermissionId,
  RoleDefinition,
  SuperAdminUser,
  MenuGroup,
  MenuDefinition,
} from '@/types/rbac';
import { ALL_PERMISSIONS, ALL_PERMISSION_IDS } from '@/config/permissions';
import {
  SUPER_ADMIN_MENU_GROUPS,
  MENU_BY_ID_MAP,
  getAccessibleMenuGroups,
  findMenuByRoute,
} from '@/config/menu';
import { mockRoles, mockUsers } from '@/mock/superAdminData';

interface AuthRbacContextType {
  currentUser: SuperAdminUser;
  roles: RoleDefinition[];
  permissions: typeof ALL_PERMISSIONS;
  activeRole: RoleDefinition;
  accessibleMenuGroups: MenuGroup[];
  hasPermission: (permissionId: PermissionId) => boolean;
  hasAnyPermission: (permissionIds: PermissionId[]) => boolean;
  hasAllPermissions: (permissionIds: PermissionId[]) => boolean;
  hasMenuAccess: (menuId: MenuId) => boolean;
  canAccessRoute: (route: string) => boolean;
  switchActiveRole: (roleId: string) => void;
  updateRolePermissions: (roleId: string, newPermissions: PermissionId[]) => void;
  logout: () => void;
}

const AuthRbacContext = createContext<AuthRbacContextType | null>(null);

const DEFAULT_SUPER_ADMIN_ROLE: RoleDefinition = {
  id: 'role-super-admin',
  name: 'Super Administrator',
  code: 'SUPER_ADMIN',
  description: 'Full system-wide administrative access',
  userCount: 1,
  isSystemRole: true,
  permissions: ALL_PERMISSION_IDS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SUPER_ADMIN_USER: SuperAdminUser = {
  id: 'usr-super-admin',
  name: 'Super Admin',
  email: 'superadmin@isml.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  roleId: 'role-super-admin',
  roleName: 'Super Administrator',
  roleCode: 'SUPER_ADMIN',
  collegeId: 'ALL',
  collegeName: 'Overall (All Colleges)',
  permissions: ALL_PERMISSION_IDS,
  status: 'ACTIVE',
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export function AuthRbacProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const initialRoles = mockRoles.length > 0 ? mockRoles : [DEFAULT_SUPER_ADMIN_ROLE];
  const initialUser = mockUsers.length > 0 ? mockUsers[0] : DEFAULT_SUPER_ADMIN_USER;

  const [roles, setRoles] = useState<RoleDefinition[]>(initialRoles);
  const [currentUser, setCurrentUser] = useState<SuperAdminUser>(initialUser);
  const [activeRoleId, setActiveRoleId] = useState<string>(
    initialRoles.find((r) => r.code === 'SUPER_ADMIN')?.id || initialRoles[0]?.id || DEFAULT_SUPER_ADMIN_ROLE.id
  );

  // Active role entity
  const activeRole = useMemo(() => {
    return roles.find((r) => r.id === activeRoleId) || roles[0] || DEFAULT_SUPER_ADMIN_ROLE;
  }, [roles, activeRoleId]);

  // Current effective permissions derived from active role
  const effectivePermissions = useMemo(() => {
    return activeRole?.permissions || ALL_PERMISSION_IDS;
  }, [activeRole]);

  // Memoized Permission Checking Functions
  const hasPermission = useCallback(
    (permissionId: PermissionId): boolean => {
      // Super admin role gets universal access
      if (activeRole.code === 'SUPER_ADMIN') return true;
      return effectivePermissions.includes(permissionId);
    },
    [activeRole.code, effectivePermissions]
  );

  const hasAnyPermission = useCallback(
    (permissionIds: PermissionId[]): boolean => {
      if (permissionIds.length === 0) return true;
      if (activeRole.code === 'SUPER_ADMIN') return true;
      return permissionIds.some((p) => effectivePermissions.includes(p));
    },
    [activeRole.code, effectivePermissions]
  );

  const hasAllPermissions = useCallback(
    (permissionIds: PermissionId[]): boolean => {
      if (permissionIds.length === 0) return true;
      if (activeRole.code === 'SUPER_ADMIN') return true;
      return permissionIds.every((p) => effectivePermissions.includes(p));
    },
    [activeRole.code, effectivePermissions]
  );

  // Menu Access Control
  const hasMenuAccess = useCallback(
    (menuId: MenuId): boolean => {
      const menu = MENU_BY_ID_MAP[menuId];
      if (!menu) return false;
      if (menu.requiredPermissions.length === 0) return true;
      return hasAnyPermission(menu.requiredPermissions);
    },
    [hasAnyPermission]
  );

  // Route Authorization Check
  const canAccessRoute = useCallback(
    (route: string): boolean => {
      const menu = findMenuByRoute(route);
      if (!menu) return true; // Unregistered public sub-routes allow fallback
      if (menu.requiredPermissions.length === 0) return true;
      return hasAnyPermission(menu.requiredPermissions);
    },
    [hasAnyPermission]
  );

  // Dynamically filtered accessible menu groups
  const accessibleMenuGroups = useMemo(() => {
    return getAccessibleMenuGroups(effectivePermissions, activeRole.code === 'SUPER_ADMIN');
  }, [effectivePermissions, activeRole.code]);

  // Switch role to test RBAC live
  const switchActiveRole = useCallback(
    (roleId: string) => {
      const targetRole = roles.find((r) => r.id === roleId);
      if (targetRole) {
        setActiveRoleId(roleId);
        setCurrentUser((prev) => ({
          ...prev,
          roleId: targetRole.id,
          roleName: targetRole.name,
          permissions: targetRole.permissions,
        }));
      }
    },
    [roles]
  );

  // Update role permissions in memory & sync with Supabase PostgreSQL DB
  const updateRolePermissions = useCallback((roleId: string, newPermissions: PermissionId[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: newPermissions } : r))
    );

    // Asynchronously synchronize with Enterprise Backend DB
    fetch(`https://ismllms-production.up.railway.app/api/portals/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: newPermissions }),
    }).catch(() => {
      // Backend sync fallback
    });
  }, []);

  const logout = useCallback(() => {
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({
      currentUser,
      roles,
      permissions: ALL_PERMISSIONS,
      activeRole,
      accessibleMenuGroups,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasMenuAccess,
      canAccessRoute,
      switchActiveRole,
      updateRolePermissions,
      logout,
    }),
    [
      currentUser,
      roles,
      activeRole,
      accessibleMenuGroups,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasMenuAccess,
      canAccessRoute,
      switchActiveRole,
      updateRolePermissions,
      logout,
    ]
  );

  return <AuthRbacContext.Provider value={value}>{children}</AuthRbacContext.Provider>;
}

// Custom Hook to consume RBAC state & checks
export function useRbac() {
  const context = useContext(AuthRbacContext);
  if (!context) {
    throw new Error('useRbac must be used within an AuthRbacProvider');
  }
  return context;
}

export const useRBAC = useRbac;

export function useAuth() {
  const context = useContext(AuthRbacContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthRbacProvider');
  }
  return {
    currentUser: context.currentUser,
    roles: context.roles,
    activeRole: context.activeRole,
    logout: context.logout,
    switchActiveRole: context.switchActiveRole,
  };
}

// ─── PERMISSION-AWARE REUSABLE COMPONENT: <Can> ───
interface CanProps {
  permission?: PermissionId;
  anyPermissions?: PermissionId[];
  allPermissions?: PermissionId[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallback = null,
}: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRbac();

  let isAllowed = true;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (anyPermissions) {
    isAllowed = hasAnyPermission(anyPermissions);
  } else if (allPermissions) {
    isAllowed = hasAllPermissions(allPermissions);
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

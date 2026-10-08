// ============================================================================
// ISML COLLEGE LMS — ROLE & PERMISSION MATRIX SERVICE CONTRACT
// ============================================================================

import { RoleDefinition, PermissionId } from '@/types/rbac';
import { mockRoles } from '@/mock/superAdminData';

export const roleService = {
  async getRoles(): Promise<RoleDefinition[]> {
    await new Promise((r) => setTimeout(r, 80));
    return [...mockRoles];
  },

  async getRoleById(id: string): Promise<RoleDefinition | null> {
    return mockRoles.find((r) => r.id === id) || null;
  },

  async updateRolePermissions(roleId: string, permissions: PermissionId[]): Promise<RoleDefinition> {
    const role = mockRoles.find((r) => r.id === roleId);
    if (!role) throw new Error('Role not found');
    role.permissions = permissions;
    role.updatedAt = new Date().toISOString();
    return { ...role };
  },
};

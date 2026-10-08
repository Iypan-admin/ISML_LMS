// ============================================================================
// ISML COLLEGE LMS — USER & STUDENT MANAGEMENT API SERVICE CONTRACT
// Production Backend Integration Layer for IAM & College-Wise Student Operations
// ============================================================================

import { SuperAdminUser, StudentUser, PermissionId, UserStatus } from '@/types/rbac';
import { mockUsers, mockStudents } from '@/mock/superAdminData';

export interface UserFilterParams {
  roleId?: string;
  collegeId?: string;
  departmentId?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface StudentFilterParams {
  collegeId?: string;
  departmentId?: string;
  programId?: string;
  batchId?: string;
  semesterNumber?: number;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const userService = {
  // ─── USER DIRECTORY ───
  async getUsers(params?: UserFilterParams): Promise<SuperAdminUser[]> {
    await new Promise((r) => setTimeout(r, 60));
    let data = [...mockUsers];
    if (params?.roleId && params.roleId !== 'ALL') {
      data = data.filter((u) => u.roleId === params.roleId);
    }
    if (params?.collegeId && params.collegeId !== 'ALL') {
      data = data.filter((u) => u.collegeId === params.collegeId);
    }
    if (params?.departmentId && params.departmentId !== 'ALL') {
      data = data.filter((u) => u.departmentId === params.departmentId);
    }
    if (params?.status && params.status !== 'ALL') {
      data = data.filter((u) => u.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.roleName.toLowerCase().includes(q)
      );
    }
    return data;
  },

  async getUserById(id: string): Promise<SuperAdminUser | null> {
    await new Promise((r) => setTimeout(r, 40));
    return mockUsers.find((u) => u.id === id) || null;
  },

  async createUser(userPayload: Omit<SuperAdminUser, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<SuperAdminUser> {
    await new Promise((r) => setTimeout(r, 120));
    const newId = `usr-${String(mockUsers.length + 1).padStart(3, '0')}`;
    const newUser: SuperAdminUser = {
      ...userPayload,
      id: newId,
      createdAt: new Date().toISOString(),
      lastLoginAt: 'Never',
      credentialsDelivered: true,
    };
    mockUsers.unshift(newUser);
    return newUser;
  },

  async updateUserRole(
    userId: string,
    roleId: string,
    roleName: string,
    permissions: PermissionId[]
  ): Promise<SuperAdminUser> {
    await new Promise((r) => setTimeout(r, 80));
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.roleId = roleId;
    user.roleName = roleName;
    user.permissions = permissions;
    return { ...user };
  },

  async updateUserStatus(userId: string, status: UserStatus): Promise<SuperAdminUser> {
    await new Promise((r) => setTimeout(r, 60));
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.status = status;
    return { ...user };
  },

  async resetPassword(userId: string): Promise<{ success: boolean; emailDelivered: boolean }> {
    // Production API contract: Generates crypto temporary password on backend & sends transactional email
    await new Promise((r) => setTimeout(r, 100));
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return { success: true, emailDelivered: true };
  },

  // ─── STUDENT DIRECTORY ───
  async getStudents(params?: StudentFilterParams): Promise<StudentUser[]> {
    await new Promise((r) => setTimeout(r, 60));
    let data = [...mockStudents];

    if (params?.collegeId && params.collegeId !== 'ALL') {
      data = data.filter((s) => s.collegeId === params.collegeId);
    }
    if (params?.departmentId && params.departmentId !== 'ALL') {
      data = data.filter((s) => s.departmentId === params.departmentId);
    }
    if (params?.programId && params.programId !== 'ALL') {
      data = data.filter((s) => s.programId === params.programId);
    }
    if (params?.batchId && params.batchId !== 'ALL') {
      data = data.filter((s) => s.batchId === params.batchId);
    }
    if (params?.semesterNumber && params.semesterNumber !== 0) {
      data = data.filter((s) => s.semesterNumber === params.semesterNumber);
    }
    if (params?.status && params.status !== 'ALL') {
      data = data.filter((s) => s.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.programName.toLowerCase().includes(q)
      );
    }
    return data;
  },

  async getStudentById(id: string): Promise<StudentUser | null> {
    await new Promise((r) => setTimeout(r, 40));
    return mockStudents.find((s) => s.id === id || s.studentId === id) || null;
  },

  async updateStudentStatus(studentId: string, status: UserStatus): Promise<StudentUser> {
    await new Promise((r) => setTimeout(r, 60));
    const student = mockStudents.find((s) => s.id === studentId || s.studentId === studentId);
    if (!student) throw new Error('Student not found');
    student.status = status;
    return { ...student };
  },
};

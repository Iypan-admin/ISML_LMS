// ============================================================================
// ISML COLLEGE LMS — INSTITUTION API SERVICE CONTRACT
// ============================================================================

import { Institution } from '@/types/rbac';
import { mockInstitutions } from '@/mock/superAdminData';

export interface InstitutionFilterParams {
  type?: string;
  status?: string;
  search?: string;
}

export const institutionService = {
  async getInstitutions(params?: InstitutionFilterParams): Promise<Institution[]> {
    // Simulated network delay
    await new Promise((r) => setTimeout(r, 80));
    let data = [...mockInstitutions];
    if (params?.status && params.status !== 'ALL') {
      data = data.filter((i) => i.status === params.status);
    }
    return data;
  },

  async getInstitutionById(id: string): Promise<Institution | null> {
    const found = mockInstitutions.find((i) => i.id === id);
    return found || null;
  },

  async toggleInstitutionStatus(id: string): Promise<Institution> {
    const inst = mockInstitutions.find((i) => i.id === id);
    if (!inst) throw new Error('Institution not found');
    inst.status = inst.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return { ...inst };
  },
};

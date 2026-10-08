// ============================================================================
// ISML COLLEGE LMS — DIGITAL REPOSITORY & RESOURCE SERVICE CONTRACT
// ============================================================================

import { ResourceItem } from '@/types/rbac';
import { mockResources } from '@/mock/superAdminData';

export const resourceService = {
  async getResources(): Promise<ResourceItem[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockResources];
  },

  async approveResource(id: string): Promise<ResourceItem> {
    const res = mockResources.find((r) => r.id === id);
    if (!res) throw new Error('Resource not found');
    res.status = 'APPROVED';
    return { ...res };
  },

  async publishResource(id: string): Promise<ResourceItem> {
    const res = mockResources.find((r) => r.id === id);
    if (!res) throw new Error('Resource not found');
    res.status = 'PUBLISHED';
    return { ...res };
  },

  async archiveResource(id: string): Promise<ResourceItem> {
    const res = mockResources.find((r) => r.id === id);
    if (!res) throw new Error('Resource not found');
    res.status = 'ARCHIVED';
    return { ...res };
  },
};

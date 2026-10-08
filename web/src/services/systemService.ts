// ============================================================================
// ISML COLLEGE LMS — SYSTEM, AUDIT & NOTIFICATION SERVICE CONTRACT
// ============================================================================

import { AuditLogEntry, SystemServiceHealth, NotificationItem } from '@/types/rbac';
import { mockAuditLogs, mockSystemHealth, mockNotifications } from '@/mock/superAdminData';

export const systemService = {
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockAuditLogs];
  },

  async getSystemHealth(): Promise<SystemServiceHealth[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockSystemHealth];
  },

  async getNotifications(): Promise<NotificationItem[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockNotifications];
  },
};

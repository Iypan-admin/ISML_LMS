// ============================================================================
// ISML COLLEGE LMS — MONITORING & REPORTING SERVICE CONTRACT
// ============================================================================

import { AttendanceRecord, ResultRecord } from '@/types/rbac';
import { mockAttendanceRecords, mockResults } from '@/mock/superAdminData';

export const monitoringService = {
  async getAttendanceSummary(): Promise<AttendanceRecord[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockAttendanceRecords];
  },

  async getResults(): Promise<ResultRecord[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockResults];
  },
};

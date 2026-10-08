// ============================================================================
// ISML COLLEGE LMS — SCHEDULING & TIMETABLE SERVICE CONTRACT
// ============================================================================

import { TimetableSlot } from '@/types/rbac';
import { mockTimetable } from '@/mock/superAdminData';

export const schedulingService = {
  async getTimetable(): Promise<TimetableSlot[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockTimetable];
  },
};

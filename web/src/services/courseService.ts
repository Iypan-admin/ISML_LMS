// ============================================================================
// ISML COLLEGE LMS — COURSE & CLASS SERVICE CONTRACT
// ============================================================================

import { CourseSummary, ClassSessionItem, AssessmentItem } from '@/types/rbac';
import { mockCourses, mockClassSessions, mockAssessments } from '@/mock/superAdminData';

export const courseService = {
  async getCourses(): Promise<CourseSummary[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockCourses];
  },

  async getClasses(): Promise<ClassSessionItem[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockClassSessions];
  },

  async getAssessments(): Promise<AssessmentItem[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockAssessments];
  },

  async toggleCoursePublish(id: string): Promise<CourseSummary> {
    const course = mockCourses.find((c) => c.id === id);
    if (!course) throw new Error('Course not found');
    course.status = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    return { ...course };
  },
};

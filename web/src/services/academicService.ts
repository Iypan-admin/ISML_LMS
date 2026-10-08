// ============================================================================
// ISML COLLEGE LMS — ACADEMIC HIERARCHY SERVICE CONTRACT
// Department → Program → Batch → Semester → Subject → Module → Topic
// ============================================================================

import {
  Department,
  Program,
  Batch,
  Semester,
  Subject,
  AcademicModule,
  AcademicTopic,
} from '@/types/rbac';
import {
  mockDepartments,
  mockPrograms,
  mockBatches,
  mockSemesters,
  mockSubjects,
  mockModules,
  mockTopics,
} from '@/mock/superAdminData';

export const academicService = {
  // Departments
  async getDepartments(): Promise<Department[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [...mockDepartments];
  },

  // Programs
  async getPrograms(departmentId?: string): Promise<Program[]> {
    await new Promise((r) => setTimeout(r, 60));
    if (departmentId && departmentId !== 'ALL') {
      return mockPrograms.filter((p) => p.departmentId === departmentId);
    }
    return [...mockPrograms];
  },

  // Batches
  async getBatches(programId?: string): Promise<Batch[]> {
    await new Promise((r) => setTimeout(r, 60));
    if (programId && programId !== 'ALL') {
      return mockBatches.filter((b) => b.programId === programId);
    }
    return [...mockBatches];
  },

  // Semesters
  async getSemesters(programId?: string): Promise<Semester[]> {
    await new Promise((r) => setTimeout(r, 60));
    if (programId && programId !== 'ALL') {
      return mockSemesters.filter((s) => s.programId === programId);
    }
    return [...mockSemesters];
  },

  // Subjects
  async getSubjects(programId?: string, semesterNumber?: number): Promise<Subject[]> {
    await new Promise((r) => setTimeout(r, 60));
    let data = [...mockSubjects];
    if (programId && programId !== 'ALL') {
      data = data.filter((s) => s.programId === programId);
    }
    if (semesterNumber) {
      data = data.filter((s) => s.semesterNumber === semesterNumber);
    }
    return data;
  },

  // Modules
  async getModules(subjectId?: string): Promise<AcademicModule[]> {
    await new Promise((r) => setTimeout(r, 60));
    if (subjectId && subjectId !== 'ALL') {
      return mockModules.filter((m) => m.subjectId === subjectId);
    }
    return [...mockModules];
  },

  // Topics
  async getTopics(moduleId?: string): Promise<AcademicTopic[]> {
    await new Promise((r) => setTimeout(r, 60));
    if (moduleId && moduleId !== 'ALL') {
      return mockTopics.filter((t) => t.moduleId === moduleId);
    }
    return [...mockTopics];
  },
};

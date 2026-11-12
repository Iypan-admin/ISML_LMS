export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  avatarUrl: string;
  collegeName: string;
  collegeCode: string;
  campusName: string;
  department: string;
  academicYear: string;
  enrolledLanguage: string;
  enrolledCourse: string;
  currentLevel: string;
  subLevel: string;
  batchName: string;
  batchCode: string;
  mainTutor: string;
  backupTutor: string;
  overallAttendance: number;
  overallProgress: number;
  averageScore: number;
  lsrwScores: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
}

// Fallback student profile type definition — Real user values are dynamically populated from localStorage or DB session
export const currentStudent: StudentProfile = {
  id: "",
  name: "Enrolled Student",
  email: "student@isml.edu",
  rollNo: "STUDENT",
  avatarUrl: "/avatars/default.png",
  collegeName: "Affiliated Institution",
  collegeCode: "CAMPUS",
  campusName: "Campus",
  department: "Foreign Languages",
  academicYear: "2026 - 2027",
  enrolledLanguage: "French",
  enrolledCourse: "Foreign Language Track",
  currentLevel: "A1",
  subLevel: "A1.1",
  batchName: "Active Cohort",
  batchCode: "COHORT",
  mainTutor: "Faculty Trainer",
  backupTutor: "Substitute Faculty",
  overallAttendance: 0,
  overallProgress: 0,
  averageScore: 0,
  lsrwScores: {
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
  },
};

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

export const currentStudent: StudentProfile = {
  id: "std-2026-089",
  name: "Bharathi M",
  email: "bharathi.m@annauniv.edu",
  rollNo: "2026-FR-8942",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  collegeName: "Anna University",
  collegeCode: "ANNA_UNIV",
  campusName: "Guindy Campus, Chennai",
  department: "Computer Science & Engineering",
  academicYear: "2026 - 2027",
  enrolledLanguage: "French (Français)",
  enrolledCourse: "French A1 Master Certificate",
  currentLevel: "A1",
  subLevel: "A1.1",
  batchName: "French A1 Morning Batch A",
  batchCode: "FR-A1-2026-A",
  mainTutor: "Prof. Hélène Dubois",
  backupTutor: "Dr. Rajesh Varma",
  overallAttendance: 87.5,
  overallProgress: 42,
  averageScore: 86.4,
  lsrwScores: {
    listening: 88,
    speaking: 82,
    reading: 90,
    writing: 85
  }
};

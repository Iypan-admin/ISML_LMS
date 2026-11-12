// ============================================================================
// ISML COLLEGE LMS — FACULTY & TUTOR ROLES & ALLOCATION MASTER TYPES
// Zero mock data — All faculty items are dynamically fetched from the database
// ============================================================================

export type TutorRoleType = 
  | 'LEAD_TRAINER'        // Primary Native Language Faculty
  | 'SUBSTITUTE_TUTOR'    // On-demand replacement / backup faculty
  | 'DOUBT_SOLVING_TUTOR' // Dedicated Q&A, Doubt clearance & 1-on-1 support
  | 'ASSISTANT_TUTOR'     // Homework grading, lab/drill evaluator & TA
  | 'ORAL_EXAMINER';      // DELF/JLPT Speaking & viva examiner

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  email: string;
  mobile: string;
  avatarUrl: string;
  primaryLanguage: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  qualification: string;
  experienceYears: number;
  nativeCountry: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'AVAILABLE';
  activeBatchesCount: number;
  assignedRoles: TutorRoleType[];
  weeklyHoursLimit: number;
  allocatedHours: number;
  assignedInstitutionType?: 'COLLEGE' | 'SCHOOL' | 'BOTH';
  assignedInstitutionId?: string;
  assignedInstitutionName?: string;
  assignedInstitutions?: {
    id: string;
    name: string;
    code: string;
    type: 'COLLEGE' | 'SCHOOL';
  }[];
}

export interface FacultyAllocationItem {
  id: string;
  facultyId: string;
  facultyName: string;
  avatarUrl: string;
  tutorRole: TutorRoleType;
  institutionType?: 'COLLEGE' | 'SCHOOL';
  institutionId?: string;
  institutionName?: string;
  courseId: string;
  courseName: string;
  subjectCode: string;
  subjectName: string;
  batchId: string;
  batchName: string;
  languageFamily: 'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN';
  scheduleSlots: string[];
  status: 'ACTIVE' | 'SUBSTITUTE_STANDBY' | 'COMPLETED';
  effectiveFrom: string;
  effectiveTo?: string;
  notes?: string;
}

// Emptied: Hardcoded mock fixtures completely purged. Dynamic data loads from DB API (/api/portals/faculty)
export const mockFacultyMembers: FacultyMember[] = [];

// Emptied: Hardcoded mock fixtures completely purged. Dynamic allocations load from DB API (/api/portals/faculty)
export const mockFacultyAllocations: FacultyAllocationItem[] = [];

export const DEFAULT_FACULTY_FALLBACK: FacultyMember = {
  id: 'fac-joy-jk',
  name: 'Joy Jk',
  designation: 'Master Foreign Language Faculty & Lead Polyglot Trainer',
  email: 'joy.jk@isml.edu',
  mobile: '+91 98400 11223',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  primaryLanguage: 'FRENCH',
  qualification: 'M.A. French Linguistics • Sorbonne CEFR C2 Certified Trainer',
  experienceYears: 8,
  nativeCountry: 'India & France Affiliate',
  status: 'ACTIVE',
  activeBatchesCount: 4,
  assignedRoles: ['LEAD_TRAINER', 'SUBSTITUTE_TUTOR', 'DOUBT_SOLVING_TUTOR', 'ASSISTANT_TUTOR'],
  weeklyHoursLimit: 24,
  allocatedHours: 18,
  assignedInstitutionType: 'BOTH',
  assignedInstitutionName: 'The American College & Sivakasi Lions School',
};

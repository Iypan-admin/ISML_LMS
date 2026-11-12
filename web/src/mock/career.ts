// ============================================================================
// ISML COLLEGE LMS — MOCK CAREER PORTAL & PLACEMENT ASSISTANCE
// Foreign Language Industry Jobs, Internships & Batch Placements
// ============================================================================

export interface JobPosting {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  location: string;
  requiredLanguage: 'French' | 'German' | 'Japanese' | 'Korean' | 'Spanish';
  requiredCefrLevel: string;
  salaryRange: string;
  jobType: 'Full-time' | 'Contract' | 'Remote' | 'Internship';
  postedDate: string;
  openingsCount: number;
  applicantsCount: number;
  status: 'ACTIVE' | 'CLOSING_SOON' | 'FILLED';
  description: string;
  skills: string[];
}

export const mockJobPostings: JobPosting[] = [];

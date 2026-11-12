// ============================================================================
// ISML LMS — SALES & ADMISSION CRM TYPE DEFINITIONS
// Covers School vs College Admissions, Lead Pipeline, Inquiries, Registration Forms & Public Application
// ============================================================================

export type InstitutionCategory = 'COLLEGE' | 'SCHOOL';

export type LeadStage =
  | 'NEW_INQUIRY'
  | 'COUNSELING_SCHEDULED'
  | 'FORM_SUBMITTED'
  | 'DOCS_PENDING'
  | 'UNDER_VERIFICATION'
  | 'SEAT_OFFERED'
  | 'FEES_PAID'
  | 'ENROLLED'
  | 'DROPPED';

export type LeadSource =
  | 'DIRECT_WALKIN'
  | 'COLLEGE_PARTNER'
  | 'SCHOOL_MOU'
  | 'WEBSITE_FORM'
  | 'EDTECH_FAIR'
  | 'PHONE_INQUIRY'
  | 'REFERRAL'
  | 'SOCIAL_MEDIA';

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'REFUNDED';

export type EnrollmentMode = 'INSTITUTION_PARTNER' | 'INDIVIDUAL_STUDENT';
export type AdmissionEntryType = 'INDIVIDUAL' | 'COLLEGE_BATCH_SIGN';

export interface BulkStudentRosterItem {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  department: string;
  semester: string;
  languageSelected: string;
  proficiencyLevel: string;
}

// ─── 1. College Specific Registration Form Data ───
export interface CollegeRegistrationFormData {
  enrollmentMode?: EnrollmentMode; // INSTITUTION_PARTNER vs INDIVIDUAL_STUDENT
  collegeName: string;
  collegeCode: string;
  collegeAddress?: {
    campusArea: string;
    city: string;
    state: string;
    pincode: string;
  };
  collegeContactPerson?: string;
  department: string;
  degreeProgram: string;       // e.g., "B.Sc Computer Science", "B.Com Corporate Secretaryship"
  semester: string;            // e.g., "Semester 1", "Semester 3"
  currentRollNumber?: string;
  languageSelected: string;    // e.g., "French", "German", "Japanese", "Spanish"
  proficiencyLevel: string;    // e.g., "A1 (Beginner)", "A2", "JLPT N5"
  preferredBatchTiming: string;// e.g., "Batch F01 — Mon/Wed/Fri — 6:00 PM IST"
  hostelDayScholar: 'DAY_SCHOLAR' | 'HOSTELER';
  cgpaPercentage?: string;
}

// ─── 2. School Specific Registration Form Data ───
export interface SchoolRegistrationFormData {
  enrollmentMode?: EnrollmentMode; // INSTITUTION_PARTNER vs INDIVIDUAL_STUDENT
  schoolName: string;
  schoolCode: string;
  schoolAddress?: {
    campusArea: string;
    city: string;
    state: string;
    pincode: string;
  };
  schoolPrincipalContact?: string;
  boardAffiliation: 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'IB' | 'CAMBRIDGE';
  gradeClass: string;          // e.g., "Class 6", "Class 8", "Class 9", "Class 10"
  section: string;             // e.g., "Section A", "Section B", "Section Alpha"
  academicYear: string;        // e.g., "2026–2027"
  parentFatherName: string;
  parentMotherName: string;
  parentOccupation?: string;
  parentEmergencyPhone: string;
  languageTrack: string;       // e.g., "French Junior A1", "German Fit in Deutsch", "Japanese Elementary Kanji"
  schoolBatchSlot: string;     // e.g., "Slot S1 — Tue/Thu — 08:30 AM to 09:30 AM"
  transportMode: 'SCHOOL_BUS' | 'PARENT_DROP' | 'OWN_CYCLE_WALK';
}

// ─── 3. Unified Lead / Admission Application Record ───
export interface AdmissionApplication {
  id: string;                  // e.g. "ADM-COL-2026-001" or "ADM-SCH-2026-001"
  applicationNumber: string;   // e.g. "ISML-2026-9481"
  category: InstitutionCategory;
  institutionId: string;
  institutionName: string;

  // Applicant Profile
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Discriminated Detail Models
  collegeDetails?: CollegeRegistrationFormData;
  schoolDetails?: SchoolRegistrationFormData;

  // Commercial / Sales Tracking
  courseFee: number;
  discountScholarship: number;
  finalPayable: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentRefId?: string;

  // Sales CRM Pipeline
  stage: LeadStage;
  source: LeadSource;
  assignedSalesOfficer: string;
  assignedOfficerEmail: string;
  leadScore: number;           // 1 to 100
  notes: string[];
  lastContactedAt?: string;
  counselingDate?: string;

  // Timestamps
  submittedAt: string;
  updatedAt: string;
}

// ─── 4. Sales Portal KPI Metrics ───
export interface SalesDashboardMetrics {
  totalInquiries: number;
  collegeAdmissions: number;
  schoolAdmissions: number;
  conversionRate: number;      // %
  revenueCollected: number;    // INR
  revenuePipeline: number;     // INR
  counselingPending: number;
  formsUnderVerification: number;
  enrolledStudentsCount: number;
}

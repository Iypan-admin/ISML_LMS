// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN PORTAL
// RBAC + MENU ID + PERMISSION ID TYPE DEFINITIONS
// Enhanced with Approval Workflow, Master Finance & Global Request Lifecycles
// ============================================================================

export type PermissionId =
  // Dashboard
  | 'DASHBOARD_VIEW'

  // Centralized Approvals
  | 'REQUEST_VIEW'
  | 'REQUEST_REVIEW'
  | 'REQUEST_APPROVE'
  | 'REQUEST_REJECT'
  | 'REQUEST_REQUEST_CHANGES'
  
  // Administration - Institutions
  | 'INSTITUTION_VIEW'
  | 'INSTITUTION_CREATE'
  | 'INSTITUTION_UPDATE'
  | 'INSTITUTION_DELETE'

  // Administration - Users & Students
  | 'USER_VIEW'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'USER_ASSIGN_ROLE'
  | 'USER_STATUS_UPDATE'
  | 'USER_RESET_PASSWORD'
  | 'USER_VIEW_ACTIVITY'
  | 'USER_VIEW_PERMISSIONS'
  | 'USER_EXPORT'
  | 'STUDENT_VIEW'
  | 'STUDENT_CREATE'
  | 'STUDENT_UPDATE'
  | 'STUDENT_STATUS_UPDATE'
  | 'STUDENT_VIEW_ACADEMIC'
  | 'STUDENT_VIEW_ACTIVITY'
  | 'STUDENT_EXPORT'

  // Administration - Roles
  | 'ROLE_VIEW'
  | 'ROLE_CREATE'
  | 'ROLE_UPDATE'
  | 'ROLE_DELETE'

  // Administration - Permissions
  | 'PERMISSION_VIEW'
  | 'PERMISSION_MANAGE'

  // Academic Structure & Entities
  | 'ACADEMIC_VIEW'
  | 'DEPARTMENT_VIEW'
  | 'DEPARTMENT_CREATE'
  | 'DEPARTMENT_UPDATE'
  | 'DEPARTMENT_DELETE'

  | 'PROGRAM_VIEW'
  | 'PROGRAM_CREATE'
  | 'PROGRAM_UPDATE'
  | 'PROGRAM_DELETE'

  | 'BATCH_VIEW'
  | 'BATCH_CREATE'
  | 'BATCH_UPDATE'
  | 'BATCH_DELETE'

  | 'SEMESTER_VIEW'
  | 'SEMESTER_CREATE'
  | 'SEMESTER_UPDATE'
  | 'SEMESTER_DELETE'

  | 'SUBJECT_VIEW'
  | 'SUBJECT_CREATE'
  | 'SUBJECT_UPDATE'
  | 'SUBJECT_DELETE'

  | 'MODULE_VIEW'
  | 'MODULE_CREATE'
  | 'MODULE_UPDATE'
  | 'MODULE_DELETE'

  | 'TOPIC_VIEW'
  | 'TOPIC_CREATE'
  | 'TOPIC_UPDATE'
  | 'TOPIC_DELETE'

  // Teaching & Learning
  | 'COURSE_VIEW'
  | 'COURSE_CREATE'
  | 'COURSE_UPDATE'
  | 'COURSE_SUBMIT'
  | 'COURSE_APPROVE'
  | 'COURSE_REJECT'
  | 'COURSE_REQUEST_CHANGES'
  | 'COURSE_DELETE'
  | 'COURSE_PUBLISH'

  | 'RESOURCE_VIEW'
  | 'RESOURCE_CREATE'
  | 'RESOURCE_UPDATE'
  | 'RESOURCE_DELETE'
  | 'RESOURCE_APPROVE'
  | 'RESOURCE_PUBLISH'

  | 'CLASS_VIEW'
  | 'CLASS_CREATE'
  | 'CLASS_UPDATE'
  | 'CLASS_CANCEL'

  | 'ASSESSMENT_VIEW'
  | 'ASSESSMENT_CREATE'
  | 'ASSESSMENT_UPDATE'
  | 'ASSESSMENT_DELETE'

  // Scheduling
  | 'TIMETABLE_VIEW'
  | 'TIMETABLE_CREATE'
  | 'TIMETABLE_UPDATE'
  | 'TIMETABLE_DELETE'

  // Finance - Master Management & Approvals
  | 'FEE_STRUCTURE_VIEW'
  | 'FEE_STRUCTURE_CREATE'
  | 'FEE_STRUCTURE_UPDATE'
  | 'FEE_STRUCTURE_SUBMIT'
  | 'FEE_STRUCTURE_REVIEW'
  | 'FEE_STRUCTURE_APPROVE'
  | 'FEE_STRUCTURE_REJECT'
  | 'FEE_STRUCTURE_REQUEST_CHANGES'

  | 'FEE_COMPONENT_VIEW'
  | 'FEE_COMPONENT_CREATE'
  | 'FEE_COMPONENT_UPDATE'
  | 'FEE_COMPONENT_DELETE'

  | 'DISCOUNT_VIEW'
  | 'DISCOUNT_CREATE'
  | 'DISCOUNT_UPDATE'
  | 'DISCOUNT_APPROVE'
  | 'DISCOUNT_REJECT'

  | 'PAYMENT_POLICY_VIEW'
  | 'PAYMENT_POLICY_CREATE'
  | 'PAYMENT_POLICY_UPDATE'
  | 'PAYMENT_POLICY_APPROVE'
  | 'PAYMENT_POLICY_REJECT'

  | 'REFUND_POLICY_VIEW'
  | 'REFUND_POLICY_CREATE'
  | 'REFUND_POLICY_UPDATE'
  | 'REFUND_POLICY_APPROVE'
  | 'REFUND_POLICY_REJECT'

  | 'FINANCE_REPORT_VIEW'
  | 'FINANCE_REPORT_EXPORT'
  | 'FINANCE_AUDIT_VIEW'

  // Monitoring
  | 'ATTENDANCE_VIEW'
  | 'RESULT_VIEW'
  | 'REPORT_VIEW'
  | 'REPORT_EXPORT'

  // Communication
  | 'NOTIFICATION_VIEW'
  | 'NOTIFICATION_CREATE'
  | 'NOTIFICATION_SEND'

  // System
  | 'AUDIT_LOG_VIEW'
  | 'SYSTEM_MONITORING_VIEW'
  | 'SYSTEM_SETTINGS_VIEW'
  | 'SYSTEM_SETTINGS_UPDATE';

export type MenuId =
  | 'SUPER_ADMIN_DASHBOARD'
  | 'APPROVAL_CENTER'
  | 'ADMIN_INSTITUTIONS'
  | 'ADMIN_USERS'
  | 'ADMIN_STUDENTS'
  | 'ADMIN_ROLES'
  | 'ACADEMIC_STRUCTURE'
  | 'ACADEMIC_DEPARTMENTS'
  | 'ACADEMIC_PROGRAMS'
  | 'ACADEMIC_BATCHES'
  | 'ACADEMIC_SEMESTERS'
  | 'ACADEMIC_SUBJECTS'
  | 'ACADEMIC_MODULES'
  | 'ACADEMIC_TOPICS'
  | 'LEARNING_COURSES'
  | 'LEARNING_RESOURCES'
  | 'LEARNING_CLASSES'
  | 'LEARNING_ASSESSMENTS'
  | 'SCHEDULING_TIMETABLE'
  | 'SCHEDULING_MANAGEMENT'
  | 'FINANCE_DASHBOARD'
  | 'FINANCE_FEE_STRUCTURES'
  | 'FINANCE_FEE_COMPONENTS'
  | 'FINANCE_PROGRAM_FEES'
  | 'FINANCE_COURSE_FEES'
  | 'FINANCE_SEMESTER_FEES'
  | 'FINANCE_DISCOUNTS'
  | 'FINANCE_PAYMENT_POLICIES'
  | 'FINANCE_REFUND_POLICIES'
  | 'FINANCE_APPROVALS'
  | 'FINANCE_REPORTS'
  | 'FINANCE_AUDIT'
  | 'MONITORING_ATTENDANCE'
  | 'MONITORING_RESULTS'
  | 'MONITORING_REPORTS'
  | 'COMMUNICATION_NOTIFICATIONS'
  | 'SYSTEM_AUDIT_LOGS'
  | 'SYSTEM_MONITORING'
  | 'SYSTEM_SETTINGS';

export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface PermissionDefinition {
  id: PermissionId;
  name: string;
  module: string;
  resource: string;
  action:
    | 'VIEW'
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'ASSIGN'
    | 'MANAGE'
    | 'APPROVE'
    | 'REJECT'
    | 'SUBMIT'
    | 'REVIEW'
    | 'PUBLISH'
    | 'CANCEL'
    | 'EXPORT'
    | 'SEND';
  category: 'Dashboard' | 'Approvals' | 'Administration' | 'Academic' | 'Learning' | 'Scheduling' | 'Finance' | 'Monitoring' | 'Communication' | 'System';
  description: string;
}

export interface MenuDefinition {
  id: MenuId;
  label: string;
  route: string;
  iconName: string;
  parentId?: string;
  order: number;
  requiredPermissions: PermissionId[];
  badge?: string;
  badgeCount?: number;
  children?: MenuDefinition[];
}

export interface MenuGroup {
  id: string;
  title: string;
  order: number;
  items: MenuDefinition[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  userCount: number;
  isSystemRole: boolean;
  permissions: PermissionId[];
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';

export interface SuperAdminUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  mobile?: string;
  avatarUrl: string;
  roleId: string;
  roleName: string;
  roleCode?: string;
  collegeId: string;
  collegeName: string;
  departmentId?: string;
  departmentName?: string;
  programId?: string;
  programName?: string;
  batchId?: string;
  batchName?: string;
  semesterNumber?: number;
  subjects?: string[];
  permissions: PermissionId[];
  status: UserStatus;
  lastLoginAt: string;
  createdAt: string;
  emailVerified?: boolean;
  credentialsDelivered?: boolean;
  linkedStudentIds?: string[];
  linkedStudentsCount?: number;
  parentRelationship?: string;
}

export interface StudentUser {
  id: string;
  studentId: string; // e.g. "ISML20260042"
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  avatarUrl: string;
  collegeId: string;
  collegeName: string;
  departmentId: string;
  departmentName: string;
  programId: string;
  programName: string;
  batchId: string;
  batchName: string;
  semesterNumber: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  admissionYear: string;
  academicYear: string;
  status: UserStatus;
  attendancePercentage: number;
  enrolledCoursesCount: number;
  completedAssessmentsCount: number;
  activeDoubtsCount: number;
  cgpa?: number;
  createdDate: string;
  credentialsDelivered: boolean;
  // Parent & Guardian Details
  parentName?: string;
  parentEmail?: string;
  parentMobile?: string;
  parentRelationship?: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  parentId?: string;
  parentPortalAccess?: boolean;
  enrolledCourseId?: string;
  enrolledCourseName?: string;
  enrolledCourseCode?: string;
}

export interface ParentUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  status: UserStatus;
  linkedStudents: {
    studentId: string;
    studentName: string;
    programName: string;
    collegeName: string;
    attendancePercentage: number;
    feePendingAmount?: number;
  }[];
  portalLastLogin?: string;
  credentialsDelivered: boolean;
  createdAt: string;
}

// ─── APPROVAL WORKFLOW MODELS ───
export interface RequestHistoryStep {
  step: string;
  userName: string;
  role: string;
  timestamp: string;
  comment?: string;
}

export interface RequestDiffItem {
  fieldName: string;
  oldValue: string | number;
  newValue: string | number;
}

export interface ApprovalRequest {
  id: string; // e.g. 'REQ-000124'
  requestType: string; // e.g. 'Program Update', 'Fee Structure Approval'
  module: 'Academic' | 'Finance' | 'Scheduling' | 'Learning' | 'System';
  entityType: string;
  entityId: string;
  entityName: string;
  submittedBy: {
    name: string;
    email: string;
    role: string;
  };
  submittedDate: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewComments?: string;
  diff?: RequestDiffItem[];
  history: RequestHistoryStep[];
  impactAnalysis?: string;
}

// ─── MASTER FINANCE MODELS ───
export interface FeeComponent {
  id: string;
  code: string;
  name: string;
  description: string;
  defaultAmount: number;
  isMandatory: boolean;
  frequency: 'SEMESTER' | 'ANNUAL' | 'ONE_TIME';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FeeStructureItem {
  componentCode: string;
  componentName: string;
  amount: number;
  isOptional: boolean;
}

export interface FeeStructure {
  id: string;
  code: string;
  programId: string;
  programName: string;
  departmentName: string;
  batchId: string;
  batchName: string;
  semesterNumber: number;
  academicYear: string;
  version: number;
  totalAmount: number;
  components: FeeStructureItem[];
  effectiveFrom: string;
  effectiveTo: string;
  status: RequestStatus;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ScholarshipDiscount {
  id: string;
  name: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number; // e.g. 20 or 15000
  eligibility: string;
  applicableProgram: string;
  applicableBatch: string;
  validUntil: string;
  status: RequestStatus;
}

export interface PaymentPolicy {
  id: string;
  name: string;
  installmentsCount: number;
  gracePeriodDays: number;
  lateFeePercentage: number;
  partialPaymentAllowed: boolean;
  refundWindowDays: number;
  status: RequestStatus;
  effectiveDate: string;
}

export interface RefundPolicy {
  id: string;
  policyName: string;
  timeWindow: string;
  refundPercentage: number;
  conditions: string;
  status: 'ACTIVE' | 'INACTIVE';
  effectiveDate: string;
}

// Academic Hierarchy Model
export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'COLLEGE' | 'UNIVERSITY' | 'INSTITUTE';
  status: 'ACTIVE' | 'INACTIVE';
  affiliation: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  departmentsCount: number;
  studentsCount: number;
  facultyCount: number;
  createdAt: string;
}

export interface Department {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  hodName: string;
  hodEmail: string;
  programsCount: number;
  facultyCount: number;
  studentsCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Program {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string;
  code: string;
  degreeType: 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DIPLOMA' | 'DOCTORAL';
  durationYears: number;
  totalSemesters: number;
  batchesCount: number;
  studentsCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  // Fees configuration
  semesterFee?: number;
  annualFee?: number;
  admissionFee?: number;
  labFee?: number;
  totalProgramFee?: number;
  feeStructureId?: string;
  feeStructureName?: string;
  // Linked batches
  initialBatches?: {
    name: string;
    intakeCapacity: number;
    shift: string;
  }[];
}

export interface Batch {
  id: string;
  programId: string;
  programName: string;
  departmentName: string;
  name: string;
  admissionYear: number;
  graduationYear: number;
  currentSemesterNumber: number;
  sectionsCount: number;
  studentsCount: number;
  status: 'ACTIVE' | 'GRADUATED' | 'INACTIVE';
  createdAt: string;
  institutionId?: string;
  institutionName?: string;
  courseIds?: string[];
  courseNames?: string[];
}

export interface Semester {
  id: string;
  programId: string;
  programName: string;
  semesterNumber: number;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  subjectsCount: number;
}

export interface Subject {
  id: string;
  programId: string;
  programName: string;
  semesterNumber: number;
  name: string;
  code: string;
  credits: number;
  type: 'THEORY' | 'PRACTICAL' | 'ELECTIVE';
  facultyName: string;
  facultyEmail: string;
  modulesCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AcademicModule {
  id: string;
  subjectId: string;
  subjectName: string;
  moduleNumber: number;
  title: string;
  description: string;
  topicsCount: number;
  estimatedHours: number;
  status: 'ACTIVE' | 'DRAFT';
}

export interface AcademicTopic {
  id: string;
  moduleId: string;
  moduleTitle: string;
  subjectName: string;
  topicNumber: number;
  title: string;
  learningObjective: string;
  skillMapped: string;
  resourcesCount: number;
  status: 'ACTIVE' | 'DRAFT';
}

// Operational Entities
export interface CourseSummary {
  id: string;
  code: string;
  name: string;
  department: string;
  program: string;
  semester: number;
  facultyName: string;
  enrolledStudents: number;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  completionRate: number;
  courseFee?: number;
  credits?: number;
  collegeId?: string;
  collegeName?: string;
  batchIds?: string[];
  batchNames?: string[];
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'DOCUMENT' | 'VIDEO' | 'PRESENTATION' | 'WORKSHEET' | 'AUDIO';
  subjectName: string;
  moduleName: string;
  topicName: string;
  authorName: string;
  fileSize: string;
  status: 'APPROVED' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
}

export interface ClassSessionItem {
  id: string;
  subjectName: string;
  facultyName: string;
  programName: string;
  batchName: string;
  roomOrLink: string;
  date: string;
  timeSlot: string;
  attendeesCount: number;
  deliveryMode?: 'ONLINE' | 'OFFLINE';
  meetingUrl?: string;
  venueRoom?: string;
  status: 'UPCOMING' | 'LIVE_NOW' | 'COMPLETED' | 'CANCELLED';
}

export interface TimetableSlot {
  id: string;
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  timeSlot: string;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  room: string;
  batchName: string;
  department: string;
  program: string;
  deliveryMode?: 'ONLINE' | 'OFFLINE';
  meetingUrl?: string;
  semester: number;
}

export interface AssessmentItem {
  id: string;
  title: string;
  subjectName: string;
  programName: string;
  semester: number;
  batchName: string;
  facultyName: string;
  type: 'MID_TERM' | 'FINAL_EXAM' | 'QUIZ' | 'ASSIGNMENT';
  totalMarks: number;
  dueDate: string;
  submissionsCount: number;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
}

export interface AttendanceRecord {
  department: string;
  program: string;
  batch: string;
  semester: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  lastUpdated: string;
}

export interface ResultRecord {
  id: string;
  studentName: string;
  rollNo: string;
  department: string;
  program: string;
  batch: string;
  semester: number;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  status: 'PASS' | 'FAIL' | 'PENDING';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  userEmail: string;
  action: string;
  module: string;
  resource: string;
  resourceId: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  ipAddress: string;
  details: string;
}

export interface SystemServiceHealth {
  serviceName: string;
  category: 'CORE' | 'STORAGE' | 'MEDIA' | 'AI' | 'DATABASE';
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  latencyMs: number;
  uptimePercentage: number;
  lastChecked: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ANNOUNCEMENT' | 'ALERT' | 'ACADEMIC' | 'SYSTEM';
  audience: 'ALL_STUDENTS' | 'ALL_FACULTY' | 'ALL_DEPARTMENTS' | 'SUPER_ADMINS';
  sentBy: string;
  sentAt: string;
  status: 'SENT' | 'SCHEDULED' | 'DRAFT';
}

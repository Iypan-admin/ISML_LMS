// ============================================================================
// ISML COLLEGE LMS — BULK STUDENT INGESTION & PARENT-LINK PROVISIONING DRAWER
// Batch Ingest Learners + Auto-link Co-provisioned Parent Portal Accounts
// Zero-Plaintext Security Architecture + Downloadable Verified CSV Template
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  ArrowRight,
  Users,
  GraduationCap,
  Building2,
  HeartHandshake,
  Mail,
  Phone,
  ShieldCheck,
  Eye,
  RefreshCw,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  Info,
  HelpCircle,
} from 'lucide-react';
import { StudentUser, UserStatus } from '@/types/rbac';
import {
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches,
} from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

export interface ParsedStudentRow {
  id: string;
  tempId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobile: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  collegeId: string;
  collegeName: string;
  departmentId: string;
  departmentName: string;
  programId: string;
  programName: string;
  batchId: string;
  batchName: string;
  semesterNumber: number;
  admissionYear: string;
  academicYear: string;
  // Parent / Guardian linking fields
  parentName: string;
  parentRelationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  parentEmail: string;
  parentMobile: string;
  autoCreateParentPortal: boolean;
  // Validation status
  status: 'VALID' | 'WARNING' | 'ERROR';
  validationIssues: string[];
}

interface BulkStudentUploadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentsImported: (newStudents: StudentUser[]) => void;
  defaultCollegeId?: string;
}

// Canonical CSV template header columns
const TEMPLATE_HEADERS = [
  'student_first_name',
  'student_last_name',
  'student_email',
  'student_mobile',
  'gender',
  'college_id',
  'department_id',
  'program_id',
  'batch_id',
  'semester_number',
  'admission_year',
  'parent_name',
  'parent_relationship',
  'parent_email',
  'parent_mobile',
  'auto_create_parent_portal',
];

// Rich sample rows for Loyola College / B.Sc CS & BCA cohorts
const SAMPLE_CSV_ROWS = [
  [
    'Aravind',
    'Sundaram',
    'aravind.sundaram@loyolacollege.edu',
    '+91 98765 43210',
    'MALE',
    'inst-01',
    'dept-cs',
    'prog-bsc-cs',
    'batch-2026-cs',
    '1',
    '2026',
    'Sundaram K',
    'FATHER',
    'sundaram.k@gmail.com',
    '+91 94441 12345',
    'YES',
  ],
  [
    'Divya',
    'Ranganathan',
    'divya.ranganathan@loyolacollege.edu',
    '+91 98765 43211',
    'FEMALE',
    'inst-01',
    'dept-cs',
    'prog-bsc-cs',
    'batch-2026-cs',
    '1',
    '2026',
    'Meenakshi Ranganathan',
    'MOTHER',
    'meenakshi.r@gmail.com',
    '+91 94441 12346',
    'YES',
  ],
  [
    'Kavitha',
    'Natarajan',
    'kavitha.natarajan@loyolacollege.edu',
    '+91 98765 43212',
    'FEMALE',
    'inst-01',
    'dept-cs',
    'prog-bca',
    'batch-2026-cs',
    '1',
    '2026',
    'Lakshmi Natarajan',
    'MOTHER',
    'lakshmi.natarajan@gmail.com',
    '+91 94441 12347',
    'YES',
  ],
  [
    'Mohammed',
    'Farhan',
    'mohammed.farhan@loyolacollege.edu',
    '+91 98765 43213',
    'MALE',
    'inst-01',
    'dept-cs',
    'prog-bsc-cs',
    'batch-2026-cs',
    '1',
    '2026',
    'Abdul Farhan',
    'FATHER',
    'abdul.farhan@gmail.com',
    '+91 94441 12348',
    'YES',
  ],
  [
    'Sneha',
    'Venkatesh',
    'sneha.venkatesh@loyolacollege.edu',
    '+91 98765 43214',
    'FEMALE',
    'inst-01',
    'dept-eng',
    'prog-ba-french',
    'batch-2026-cs',
    '1',
    '2026',
    'Venkatesh Raman',
    'GUARDIAN',
    'venkatesh.raman@gmail.com',
    '+91 94441 12349',
    'YES',
  ],
];

// Specification guide for columns shown in the in-drawer guide
const COLUMN_SPECS = [
  {
    col: 'student_first_name',
    name: 'Student First Name',
    required: true,
    desc: 'Given name of the enrolling learner',
    example: 'Aravind',
  },
  {
    col: 'student_last_name',
    name: 'Student Last Name',
    required: false,
    desc: 'Surname or initial',
    example: 'Sundaram',
  },
  {
    col: 'student_email',
    name: 'Institutional Email',
    required: true,
    desc: 'Primary email address for login & notifications',
    example: 'aravind.s@loyolacollege.edu',
  },
  {
    col: 'student_mobile',
    name: 'Mobile Phone',
    required: false,
    desc: 'Learner contact number with country code',
    example: '+91 98765 43210',
  },
  {
    col: 'gender',
    name: 'Gender',
    required: false,
    desc: 'MALE / FEMALE / OTHER',
    example: 'MALE',
  },
  {
    col: 'college_id',
    name: 'College Identifier',
    required: true,
    desc: 'Institutional code (e.g., inst-01 or Loyola)',
    example: 'inst-01',
  },
  {
    col: 'department_id',
    name: 'Department ID',
    required: true,
    desc: 'Academic department code (e.g. dept-cs)',
    example: 'dept-cs',
  },
  {
    col: 'program_id',
    name: 'Degree Program ID',
    required: true,
    desc: 'Degree code (e.g., prog-bsc-cs, prog-bca)',
    example: 'prog-bsc-cs',
  },
  {
    col: 'batch_id',
    name: 'Batch Cohort ID',
    required: true,
    desc: 'Graduation cohort code (e.g., batch-2026-cs)',
    example: 'batch-2026-cs',
  },
  {
    col: 'semester_number',
    name: 'Current Semester',
    required: true,
    desc: '1 through 8',
    example: '1',
  },
  {
    col: 'admission_year',
    name: 'Admission Year',
    required: false,
    desc: 'Year of matriculation',
    example: '2026',
  },
  {
    col: 'parent_name',
    name: 'Parent / Guardian Legal Name',
    required: true,
    desc: 'Full name of the authorized guardian',
    example: 'Sundaram K',
  },
  {
    col: 'parent_relationship',
    name: 'Parent Relationship',
    required: true,
    desc: 'FATHER / MOTHER / GUARDIAN / OTHER',
    example: 'FATHER',
  },
  {
    col: 'parent_email',
    name: 'Parent Email Address',
    required: true,
    desc: 'Guardian email for portal single-sign-on & credentials',
    example: 'sundaram.k@gmail.com',
  },
  {
    col: 'parent_mobile',
    name: 'Parent Contact Number',
    required: true,
    desc: 'Guardian mobile for emergency SMS and OTP',
    example: '+91 94441 12345',
  },
  {
    col: 'auto_create_parent_portal',
    name: 'Auto-Create Parent Portal',
    required: false,
    desc: 'YES / NO (defaults to YES)',
    example: 'YES',
  },
];

export default function BulkStudentUploadDrawer({
  isOpen,
  onClose,
  onStudentsImported,
  defaultCollegeId = 'inst-01',
}: BulkStudentUploadDrawerProps) {
  const { showSuccess, showError, showInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active step / view
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'TEMPLATE_GUIDE' | 'PREVIEW' | 'EXECUTING' | 'SUCCESS'>('UPLOAD');

  // Institution scope override (optional: defaults to selected or CSV row)
  const [selectedCollegeOverride, setSelectedCollegeOverride] = useState<string>(defaultCollegeId);

  // File parsing states
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [filterPreviewStatus, setFilterPreviewStatus] = useState<'ALL' | 'VALID' | 'WARNING' | 'ERROR'>('ALL');

  // Execution states
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionStage, setExecutionStage] = useState('');
  const [createdResults, setCreatedResults] = useState<{
    studentsCount: number;
    parentsLinkedCount: number;
    cohortBatchName: string;
  } | null>(null);

  // Reset when drawer opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('UPLOAD');
      setUploadedFileName(null);
      setParsedRows([]);
      setExecutionProgress(0);
      setExecutionStage('');
      setCreatedResults(null);
      setSelectedCollegeOverride(defaultCollegeId);
    }
  }, [isOpen, defaultCollegeId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && activeTab !== 'EXECUTING') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeTab, onClose]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter((r) => r.status === 'VALID').length;
    const warnings = parsedRows.filter((r) => r.status === 'WARNING').length;
    const errors = parsedRows.filter((r) => r.status === 'ERROR').length;
    const parentsToLink = parsedRows.filter(
      (r) => r.status !== 'ERROR' && r.autoCreateParentPortal && r.parentEmail
    ).length;
    return { total, valid, warnings, errors, parentsToLink };
  }, [parsedRows]);

  // Filtered rows for pre-import review table
  const displayedRows = useMemo(() => {
    if (filterPreviewStatus === 'ALL') return parsedRows;
    return parsedRows.filter((r) => r.status === filterPreviewStatus);
  }, [parsedRows, filterPreviewStatus]);

  // ──────────────────────────────────────────────────────────────────────────
  // CSV TEMPLATE DOWNLOAD GENERATOR
  // ──────────────────────────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const csvContent = [
      TEMPLATE_HEADERS.join(','),
      ...SAMPLE_CSV_ROWS.map((row) =>
        row
          .map((val) => {
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.setAttribute(
      'download',
      `ISML_Students_Parents_Bulk_Upload_Template_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);

    showSuccess('Template downloaded. Open in Excel, Google Sheets, or any text editor.');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // PARSER HELPER: Convert CSV text into validated ParsedStudentRow[]
  // ──────────────────────────────────────────────────────────────────────────
  const parseCSVContent = (content: string, fileName: string) => {
    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      showError('The provided CSV file contains no records. Please review the template.');
      return;
    }

    // Parse header row
    const rawHeaders = lines[0]
      .split(',')
      .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    const records: ParsedStudentRow[] = [];

    // Simple line parser taking quotes into account
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => c === '')) continue;

      const getVal = (headerKey: string, fallbackIdx: number): string => {
        const index = rawHeaders.indexOf(headerKey.toLowerCase());
        if (index !== -1 && cols[index] !== undefined) {
          return cols[index].replace(/^["']|["']$/g, '').trim();
        }
        return cols[fallbackIdx] !== undefined ? cols[fallbackIdx].replace(/^["']|["']$/g, '').trim() : '';
      };

      const firstName = getVal('student_first_name', 0) || getVal('first_name', 0);
      const lastName = getVal('student_last_name', 1) || getVal('last_name', 1);
      const email = getVal('student_email', 2) || getVal('email', 2);
      const mobile = getVal('student_mobile', 3) || getVal('mobile', 3);
      const genderRaw = (getVal('gender', 4) || 'MALE').toUpperCase();
      const collegeIdRaw = getVal('college_id', 5) || selectedCollegeOverride;
      const deptIdRaw = getVal('department_id', 6) || 'dept-cs';
      const progIdRaw = getVal('program_id', 7) || 'prog-bsc-cs';
      const batchIdRaw = getVal('batch_id', 8) || 'batch-2026-cs';
      const semRaw = parseInt(getVal('semester_number', 9) || '1', 10);
      const admissionYear = getVal('admission_year', 10) || '2026';

      // Parent details
      const parentName = getVal('parent_name', 11);
      const relationshipRaw = (getVal('parent_relationship', 12) || 'FATHER').toUpperCase();
      const parentEmail = getVal('parent_email', 13);
      const parentMobile = getVal('parent_mobile', 14);
      const autoCreateRaw = (getVal('auto_create_parent_portal', 15) || 'YES').toUpperCase();

      // Resolve academic names
      const collegeObj =
        mockInstitutions.find((c) => c.id === collegeIdRaw || c.name.toLowerCase().includes(collegeIdRaw.toLowerCase())) ||
        mockInstitutions[0];
      const deptObj =
        mockDepartments.find((d) => d.id === deptIdRaw || d.name.toLowerCase().includes(deptIdRaw.toLowerCase())) ||
        mockDepartments[0];
      const progObj =
        mockPrograms.find((p) => p.id === progIdRaw || p.code.toLowerCase() === progIdRaw.toLowerCase()) ||
        mockPrograms[0];
      const batchObj =
        mockBatches.find((b) => b.id === batchIdRaw || b.name.toLowerCase().includes(batchIdRaw.toLowerCase())) ||
        mockBatches[0];

      // Validation
      const issues: string[] = [];
      let rowStatus: 'VALID' | 'WARNING' | 'ERROR' = 'VALID';

      if (!firstName) {
        issues.push('Missing Student First Name');
        rowStatus = 'ERROR';
      }
      if (!email || !email.includes('@')) {
        issues.push('Invalid or Missing Student Email');
        rowStatus = 'ERROR';
      }
      if (!parentName) {
        issues.push('Missing Parent/Guardian Legal Name');
        rowStatus = rowStatus === 'ERROR' ? 'ERROR' : 'WARNING';
      }
      if (parentEmail && !parentEmail.includes('@')) {
        issues.push('Invalid Parent Email address');
        rowStatus = 'ERROR';
      }
      if (!parentEmail && autoCreateRaw !== 'NO') {
        issues.push('Parent Email recommended for portal Single-Sign-On invite');
        if (rowStatus !== 'ERROR') rowStatus = 'WARNING';
      }

      const relationshipValid = ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'].includes(relationshipRaw);
      const relationship = (relationshipValid ? relationshipRaw : 'GUARDIAN') as 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';

      records.push({
        id: `row-${i}-${Date.now().toString().slice(-4)}`,
        tempId: `ISML2026${(40 + i).toString().padStart(4, '0')}`,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        mobile,
        gender: ['MALE', 'FEMALE', 'OTHER'].includes(genderRaw) ? (genderRaw as any) : 'OTHER',
        collegeId: collegeObj.id,
        collegeName: collegeObj.name,
        departmentId: deptObj.id,
        departmentName: deptObj.name,
        programId: progObj.id,
        programName: progObj.name,
        batchId: batchObj.id,
        batchName: batchObj.name,
        semesterNumber: isNaN(semRaw) ? 1 : semRaw,
        admissionYear,
        academicYear: '2026–2027',
        parentName: parentName || 'Authorized Guardian',
        parentRelationship: relationship,
        parentEmail: parentEmail || '',
        parentMobile: parentMobile || '',
        autoCreateParentPortal: autoCreateRaw !== 'NO',
        status: rowStatus,
        validationIssues: issues,
      });
    }

    setUploadedFileName(fileName);
    setParsedRows(records);
    setActiveTab('PREVIEW');
    showSuccess(`Successfully parsed ${records.length} student and parent records from ${fileName}.`);
  };

  // File drop / select handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseCSVContent(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  // Drag-and-drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseCSVContent(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ONE-CLICK QUICK TEST: Load Sample Loyola Cohort with Parents
  // ──────────────────────────────────────────────────────────────────────────
  const handleLoadDemoCohort = () => {
    const demoCSV = [
      TEMPLATE_HEADERS.join(','),
      ...SAMPLE_CSV_ROWS.map((r) => r.join(',')),
    ].join('\n');
    parseCSVContent(demoCSV, 'ISML_Demo_Cohort_Loyola_CS_2026.csv');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // EXECUTION: Simulate enterprise multi-tenant provisioning pipeline
  // ──────────────────────────────────────────────────────────────────────────
  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter((r) => r.status !== 'ERROR');
    if (validRows.length === 0) {
      showError('Cannot initiate import. There are no valid student records to process.');
      return;
    }

    setActiveTab('EXECUTING');
    setExecutionProgress(10);
    setExecutionStage('Validating institutional academic hierarchy & department capacity...');

    await new Promise((r) => setTimeout(r, 600));
    setExecutionProgress(35);
    setExecutionStage('Minting cryptographic Student IDs and temporary SSO tokens...');

    await new Promise((r) => setTimeout(r, 700));
    setExecutionProgress(65);
    setExecutionStage('Co-provisioning Parent Portal accounts & establishing family link graph...');

    await new Promise((r) => setTimeout(r, 700));
    setExecutionProgress(90);
    setExecutionStage('Dispatching zero-plaintext credentials & onboarding links via email...');

    await new Promise((r) => setTimeout(r, 500));
    setExecutionProgress(100);
    setExecutionStage('Batch ingestion completed successfully.');

    // Build StudentUser[] array to inject into state
    const createdStudents: StudentUser[] = validRows.map((r, idx) => ({
      id: `stu-${Date.now().toString().slice(-4)}-${idx + 1}`,
      studentId: r.tempId,
      name: r.fullName,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      mobile: r.mobile,
      avatarUrl: `/avatars/avatar-${(idx % 6) + 1}.png`,
      collegeId: r.collegeId,
      collegeName: r.collegeName,
      departmentId: r.departmentId,
      departmentName: r.departmentName,
      programId: r.programId,
      programName: r.programName,
      batchId: r.batchId,
      batchName: r.batchName,
      semesterNumber: r.semesterNumber,
      gender: r.gender,
      admissionYear: r.admissionYear,
      academicYear: r.academicYear,
      status: 'ACTIVE' as UserStatus,
      attendancePercentage: 100,
      enrolledCoursesCount: 5,
      completedAssessmentsCount: 0,
      activeDoubtsCount: 0,
      createdDate: new Date().toISOString(),
      credentialsDelivered: true,
      // Parent linking
      parentName: r.parentName,
      parentEmail: r.parentEmail,
      parentMobile: r.parentMobile,
      parentRelationship: r.parentRelationship,
      parentId: `parent-${Date.now().toString().slice(-4)}-${idx + 1}`,
      parentPortalAccess: r.autoCreateParentPortal,
    }));

    setCreatedResults({
      studentsCount: createdStudents.length,
      parentsLinkedCount: validRows.filter((r) => r.autoCreateParentPortal && r.parentEmail).length,
      cohortBatchName: validRows[0]?.batchName || 'Cohort 2026–2029',
    });

    onStudentsImported(createdStudents);
    setActiveTab('SUCCESS');
    showSuccess(`Enrolled ${createdStudents.length} students and co-provisioned linked Parent Portal accounts.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (activeTab !== 'EXECUTING') onClose();
        }}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300 font-sans">
        {/* Drawer Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <UploadCloud className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Bulk Student Ingestion & Parent Linking
                </h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  CSV Engine v2.4
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Batch ingest learners, auto-map institutional hierarchy & co-provision Parent Portal credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/20 cursor-pointer"
              title="Download standardized CSV template with sample data"
            >
              <Download className="w-3.5 h-3.5 text-blue-200" />
              <span>Download CSV Template</span>
            </button>

            <button
              onClick={() => {
                if (activeTab !== 'EXECUTING') onClose();
              }}
              disabled={activeTab === 'EXECUTING'}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        {activeTab !== 'EXECUTING' && activeTab !== 'SUCCESS' && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('UPLOAD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'UPLOAD'
                    ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TEMPLATE_GUIDE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'TEMPLATE_GUIDE'
                    ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Template Specification & Guide</span>
              </button>

              {parsedRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('PREVIEW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'PREVIEW'
                      ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Validation Preview ({parsedRows.length})
                  </span>
                </button>
              )}
            </div>

            {/* Quick Demo Button */}
            <button
              type="button"
              onClick={handleLoadDemoCohort}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-blue-200 cursor-pointer"
              title="Loads 5 sample students with linked parents for instant verification"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Load Demo Cohort (5 Students + Parents)</span>
            </button>
          </div>
        )}

        {/* Drawer Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 1: UPLOAD ZONE */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'UPLOAD' && (
            <div className="space-y-6">
              {/* Institution Context Selector */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Target Institution Scope
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      Fallback College Assignment (Used when CSV does not specify college_id)
                    </p>
                  </div>
                </div>

                <select
                  value={selectedCollegeOverride}
                  onChange={(e) => setSelectedCollegeOverride(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {mockInstitutions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and drop upload container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-[#0052CC] bg-blue-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#0052CC] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h3 className="font-bold text-slate-800 text-sm">
                  {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Drag & drop your populated CSV file here'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Supports comma-delimited (.csv) files containing learner profiles and linked parent/guardian metadata.
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Browse Files from Computer</span>
                  </button>
                </div>
              </div>

              {/* Key Features & Architecture Notice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                    <HeartHandshake className="w-4 h-4 text-teal-600" />
                    <span>Parent Portal Co-Provisioning</span>
                  </div>
                  <p className="text-[11px] text-teal-800 leading-relaxed">
                    Every student record includes linked guardian columns. The system automatically creates a Parent Portal SSO profile, links their child's attendance and gradebook, and queues portal credentials.
                  </p>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Zero-Plaintext Credentials</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Neither admins nor CSV files contain plaintext passwords. Upon bulk ingestion, the security engine generates temporary one-time access tokens dispatched directly to student & parent emails.
                  </p>
                </div>
              </div>

              {/* Direct Quick Action to Template */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Need the standard column layout?
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Download the official template or view the column specification table below.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('TEMPLATE_GUIDE')}
                    className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100/50 transition-colors cursor-pointer"
                  >
                    View Column Guide
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 2: TEMPLATE SPECIFICATION & INTERACTIVE PREVIEW GUIDE */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'TEMPLATE_GUIDE' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-bold text-[#0B2447] text-sm">
                    ISML Standard Bulk CSV Format Specification
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Required and optional columns for automated student enrollment and parent linking.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .CSV File</span>
                </button>
              </div>

              {/* Sample Data Table Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Live Sample Cohort Data (Previewing Template Content)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">5 Pre-configured Records</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Learner Name</th>
                        <th className="p-2.5">Student Email</th>
                        <th className="p-2.5">College & Dept</th>
                        <th className="p-2.5">Program & Batch</th>
                        <th className="p-2.5">Parent / Guardian</th>
                        <th className="p-2.5">Relation</th>
                        <th className="p-2.5">Parent Email & Mobile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {SAMPLE_CSV_ROWS.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-bold text-slate-900">
                            {row[0]} {row[1]}
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">{row[2]}</td>
                          <td className="p-2.5 text-slate-700">{row[5]} / {row[6]}</td>
                          <td className="p-2.5 text-[#0052CC] font-semibold">{row[7]} (Sem {row[9]})</td>
                          <td className="p-2.5 font-semibold text-slate-900">{row[11]}</td>
                          <td className="p-2.5">
                            <span className="bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {row[12]}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {row[13]}
                            <span className="block text-[10px] text-slate-400">{row[14]}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Column Reference Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Detailed Column Reference Dictionary</span>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">CSV Column Header</th>
                        <th className="p-2.5">Display Field</th>
                        <th className="p-2.5">Requirement</th>
                        <th className="p-2.5">Description & Accepted Values</th>
                        <th className="p-2.5">Example Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                      {COLUMN_SPECS.map((c) => (
                        <tr key={c.col} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-mono font-bold text-[#0052CC] bg-blue-50/40">
                            {c.col}
                          </td>
                          <td className="p-2.5 font-semibold text-slate-900">{c.name}</td>
                          <td className="p-2.5">
                            {c.required ? (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold text-[10px] border border-rose-200">
                                Required
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium text-[10px]">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-600">{c.desc}</td>
                          <td className="p-2.5 font-mono text-slate-500">{c.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 3: PRE-IMPORT LIVE VALIDATION & DATA GRID */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'PREVIEW' && (
            <div className="space-y-5">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Total Ingest Rows
                  </span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                    Valid Records
                  </span>
                  <p className="text-xl font-bold text-emerald-800 mt-0.5">{stats.valid}</p>
                </div>

                <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">
                    Parents to Link
                  </span>
                  <p className="text-xl font-bold text-teal-800 mt-0.5">{stats.parentsToLink}</p>
                </div>

                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">
                    Rows with Errors
                  </span>
                  <p className="text-xl font-bold text-rose-800 mt-0.5">{stats.errors}</p>
                </div>
              </div>

              {/* Filter Pills & Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Show:</span>
                  {(['ALL', 'VALID', 'WARNING', 'ERROR'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setFilterPreviewStatus(filter)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        filterPreviewStatus === filter
                          ? 'bg-[#0B2447] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('UPLOAD')}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Different File</span>
                  </button>
                </div>
              </div>

              {/* Tabular Preview of Parsed Students & Parents */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-[420px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Learner & ID</th>
                        <th className="p-2.5">Academic Placement</th>
                        <th className="p-2.5">Linked Parent / Guardian</th>
                        <th className="p-2.5">Parent Portal SSO</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {displayedRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80">
                          {/* Student Details */}
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {row.firstName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">
                                  {row.fullName}
                                </span>
                                <span className="text-[11px] text-slate-500 block truncate">
                                  {row.email}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  ID: {row.tempId}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Academic Placement */}
                          <td className="p-2.5">
                            <span className="font-semibold text-[#0052CC] block truncate max-w-[170px]">
                              {row.programName}
                            </span>
                            <span className="text-[11px] text-slate-600 block truncate max-w-[170px]">
                              {row.departmentName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {row.batchName} • Sem {row.semesterNumber}
                            </span>
                          </td>

                          {/* Linked Parent Details */}
                          <td className="p-2.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 truncate">
                                  {row.parentName}
                                </span>
                                <span className="px-1.5 py-0.2 bg-teal-50 text-teal-800 rounded font-bold text-[10px] border border-teal-200 uppercase">
                                  {row.parentRelationship}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-600 block truncate">
                                {row.parentEmail || 'No email provided'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {row.parentMobile || 'No mobile provided'}
                              </span>
                            </div>
                          </td>

                          {/* Parent Portal Status */}
                          <td className="p-2.5">
                            {row.autoCreateParentPortal && row.parentEmail ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                <Check className="w-3 h-3 text-teal-600" />
                                <span>Auto-Provision</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Disabled
                              </span>
                            )}
                          </td>

                          {/* Validation Status */}
                          <td className="p-2.5">
                            {row.status === 'VALID' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Ready</span>
                              </span>
                            )}
                            {row.status === 'WARNING' && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 cursor-help"
                                title={row.validationIssues.join(', ')}
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Notice</span>
                              </span>
                            )}
                            {row.status === 'ERROR' && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
                                title={row.validationIssues.join(', ')}
                              >
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                <span>Rejected</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 4: EXECUTING INGESTION PIPELINE */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'EXECUTING' && (
            <div className="py-12 px-6 text-center space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0052CC] flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Executing Bulk Provisioning Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-1">{executionStage}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-[#0052CC] to-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${executionProgress}%` }}
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Validating academic hierarchy & cohort constraints</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      executionProgress >= 35 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span>Minting student IDs & temporary access credentials</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      executionProgress >= 65 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span>Co-provisioning linked Parent Portal accounts</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      executionProgress >= 90 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span>Queuing zero-plaintext onboarding emails</span>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* TAB 5: SUCCESS STATE */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'SUCCESS' && createdResults && (
            <div className="py-8 px-6 text-center space-y-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-xl tracking-tight">
                  Bulk Enrollment & Parent Linking Completed!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  All learners and their authorized guardians have been successfully provisioned.
                </p>
              </div>

              {/* Results Cards */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Enrolled Students</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0B2447] mt-1">
                    {createdResults.studentsCount}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Added to learner directory
                  </span>
                </div>

                <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                    <HeartHandshake className="w-4 h-4 text-teal-600" />
                    <span>Parents Linked</span>
                  </div>
                  <p className="text-2xl font-bold text-teal-900 mt-1">
                    {createdResults.parentsLinkedCount}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Parent portal access granted
                  </span>
                </div>
              </div>

              {/* Zero-Plaintext Security Audit Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Zero-Plaintext Security Architecture</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Cryptographic temporary access tokens and single-sign-on activation links were dispatched to student and parent registered email addresses. No plaintext credentials were displayed or stored.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Done & View Students in Directory</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {activeTab !== 'EXECUTING' && activeTab !== 'SUCCESS' && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div>
              {activeTab === 'PREVIEW' && (
                <span className="text-xs text-slate-600 font-medium">
                  {stats.valid} of {stats.total} records ready to import ({stats.parentsToLink} parents)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {activeTab === 'UPLOAD' && parsedRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('PREVIEW')}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Validation Preview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {activeTab === 'TEMPLATE_GUIDE' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('UPLOAD')}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Back to File Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {activeTab === 'PREVIEW' && (
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={stats.valid === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Import & Provision {stats.valid} Students
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

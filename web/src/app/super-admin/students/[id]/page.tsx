// ============================================================================
// ISML COLLEGE LMS — STUDENT DETAIL VIEW
// 360-Degree Learner Overview: Academics, Attendance, Courses, Doubts & Security
// RBAC: STUDENT_VIEW, STUDENT_STATUS_UPDATE, USER_RESET_PASSWORD, STUDENT_EXPORT
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Layers,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  Download,
  UserCheck,
  UserX,
  Award,
  HelpCircle,
  FileCheck,
  TrendingUp,
  Lock,
  History,
  Activity,
  ShieldCheck,
  Users,
  HeartHandshake,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatusBadge from '@/components/common/StatusBadge';
import { Can, useRbac } from '@/context/AuthRbacContext';
import { StudentUser, UserStatus } from '@/types/rbac';
import {
  mockStudents,
  mockSubjects,
} from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import ResetPasswordDialog from '@/components/super-admin/users/ResetPasswordDialog';
import StatusConfirmDialog from '@/components/super-admin/users/StatusConfirmDialog';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentIdParam = params?.id as string;
  const { hasPermission } = useRbac();
  const { showSuccess, showInfo } = useToast();

  // Find student by id or studentId (roll no)
  const initialStudent = useMemo(() => {
    return (
      mockStudents.find(
        (s) => s.id === studentIdParam || s.studentId === studentIdParam
      ) || null
    );
  }, [studentIdParam]);

  const [student, setStudent] = useState<StudentUser | null>(initialStudent);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'ACADEMIC' | 'COURSES' | 'ATTENDANCE' | 'ASSESSMENTS' | 'DOUBTS' | 'PARENT' | 'SECURITY'
  >('ACADEMIC');

  // Modals state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Enrolled subjects tailored to the student's program
  const enrolledCourses = useMemo(() => {
    if (!student) return [];
    return [
      {
        code: 'CS-101',
        title: 'Problem Solving & Programming in Python',
        credits: 4,
        faculty: 'Dr. Anandhakumar V.',
        attendance: 95,
        grade: 'A+',
        status: 'IN_PROGRESS',
      },
      {
        code: 'CS-102',
        title: 'Digital Logic & Computer Architecture',
        credits: 3,
        faculty: 'Prof. Mary Priyanka',
        attendance: 92,
        grade: 'A',
        status: 'IN_PROGRESS',
      },
      {
        code: 'MAT-101',
        title: 'Discrete Mathematics & Graph Theory',
        credits: 4,
        faculty: 'Dr. P. Srinivasan',
        attendance: 94,
        grade: 'A+',
        status: 'IN_PROGRESS',
      },
      {
        code: 'ENG-101',
        title: 'Professional Technical Communication',
        credits: 2,
        faculty: 'Dr. Sharon Joseph',
        attendance: 91,
        grade: 'B+',
        status: 'IN_PROGRESS',
      },
      {
        code: 'FR-101',
        title: 'French Language Foundation (A1.1)',
        credits: 2,
        faculty: 'Prof. Marie Delacroix',
        attendance: 96,
        grade: 'A',
        status: 'IN_PROGRESS',
      },
    ];
  }, [student]);

  if (!student) {
    return (
      <div className="space-y-6 font-sans pb-12">
        <Breadcrumbs
          items={[
            { label: 'Administration', href: '/super-admin/users' },
            { label: 'Students', href: '/super-admin/students' },
            { label: 'Student Not Found' },
          ]}
        />
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0B2447]">Student Record Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            No institutional learner record corresponds to &ldquo;{studentIdParam}&rdquo;.
          </p>
          <Link
            href="/super-admin/students"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0052CC] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Students Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  // Handlers
  const handleStatusUpdated = (userId: string, newStatus: UserStatus) => {
    setStudent((prev) => (prev ? { ...prev, status: newStatus } : null));
    showSuccess(`Student account status updated to ${newStatus}.`);
  };

  const handlePasswordResetInitiated = () => {
    showInfo(`Password reset workflow initiated for student ${student.studentId}.`);
  };

  const handleExportTranscript = () => {
    showSuccess(`Generating official student academic docket for ${student.name} (PDF format).`);
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      <Breadcrumbs
        items={[
          { label: 'Administration', href: '/super-admin/users' },
          { label: 'Students', href: '/super-admin/students' },
          { label: student.name },
        ]}
      />

      {/* Header Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight">
                  {student.name}
                </h1>
                <span className="font-mono text-xs font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {student.studentId}
                </span>
                <StatusBadge status={student.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                {student.mobile && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {student.mobile}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {student.collegeName}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Can permission="STUDENT_EXPORT">
              <button
                onClick={handleExportTranscript}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Academic Docket</span>
              </button>
            </Can>

            <Can permission="USER_RESET_PASSWORD">
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Reset Credentials</span>
              </button>
            </Can>

            <Can permission="STUDENT_STATUS_UPDATE">
              <button
                onClick={() => setIsStatusDialogOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  student.status === 'ACTIVE'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {student.status === 'ACTIVE' ? (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Activate</span>
                  </>
                )}
              </button>
            </Can>
          </div>
        </div>

        {/* Learner KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Overall Attendance</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-700">
                {student.attendancePercentage}%
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">(Eligible for Exams)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Enrolled Courses</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-[#0B2447]">
                {student.enrolledCoursesCount}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">(15 Total Credits)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Cumulative GPA</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-blue-700">
                {student.cgpa ? `${student.cgpa} / 10.0` : '— In Progress —'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Active Doubts</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-indigo-700">
                {student.activeDoubtsCount} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mt-6 gap-6 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'ACADEMIC', label: 'Academic Hierarchy' },
            { id: 'COURSES', label: `Courses (${enrolledCourses.length})` },
            { id: 'ATTENDANCE', label: 'Attendance Breakdown' },
            { id: 'ASSESSMENTS', label: 'Assessments & Marks' },
            { id: 'DOUBTS', label: 'Doubt Clearing Activity' },
            { id: 'PARENT', label: 'Parent & Guardian Portal' },
            { id: 'SECURITY', label: 'Account Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Academic Hierarchy */}
      {activeTab === 'ACADEMIC' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Academic Association & Cohort Placement</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                College / Institution
              </span>
              <p className="font-bold text-[#0B2447] text-sm mt-1">{student.collegeName}</p>
              <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">{student.collegeId}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Department
              </span>
              <p className="font-bold text-[#0B2447] text-sm mt-1">{student.departmentName}</p>
              <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">{student.departmentId}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Program / Degree
              </span>
              <p className="font-bold text-[#0B2447] text-sm mt-1">{student.programName}</p>
              <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">{student.programId}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Batch Cohort
              </span>
              <p className="font-bold text-[#0B2447] text-sm mt-1">{student.batchName}</p>
              <span className="font-mono text-[11px] text-slate-500 mt-0.5 block">{student.batchId}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Current Semester
              </span>
              <p className="font-bold text-indigo-700 text-sm mt-1">Semester {student.semesterNumber}</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Full-time Regular</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Academic & Admission Year
              </span>
              <p className="font-bold text-slate-800 text-sm mt-1">
                Admitted: {student.admissionYear} • Year {student.academicYear}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Gender: {student.gender || 'Not Specified'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Enrolled Courses */}
      {activeTab === 'COURSES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Current Semester Enrolled Subjects</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Semester {student.semesterNumber}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {enrolledCourses.map((c) => (
              <div
                key={c.code}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.code}
                    </span>
                    <span className="font-bold text-slate-900">{c.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Faculty: {c.faculty} • Credits: {c.credits}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Attendance</span>
                    <span className="font-bold text-emerald-700 text-xs">{c.attendance}%</span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold text-xs border border-blue-200">
                    Grade {c.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Attendance Breakdown */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Attendance Summary & Regulatory Compliance</span>
          </h3>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3 text-emerald-900 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Exam Eligibility Status: SATISFACTORY ({student.attendancePercentage}%)</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                The minimum mandatory attendance stipulated by UGC/University regulations is 75.0%. 
                This student currently satisfies all academic standing requirements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px]">Total Lectures Scheduled:</span>
              <p className="text-base font-bold text-slate-900 mt-1">120 Sessions</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px]">Lectures Attended:</span>
              <p className="text-base font-bold text-emerald-700 mt-1">112 Sessions</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[11px]">Authorized Leaves / Absences:</span>
              <p className="text-base font-bold text-slate-600 mt-1">8 Sessions</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Assessments & Marks */}
      {activeTab === 'ASSESSMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Internal Assessments & Mid-Term Scores</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              {
                title: 'Python Mid-Semester Practical Examination',
                subject: 'Problem Solving & Programming in Python (CS-101)',
                type: 'PRACTICAL',
                score: '48 / 50',
                grade: 'O (Outstanding)',
              },
              {
                title: 'Discrete Structures Unit Quiz 1',
                subject: 'Discrete Mathematics & Graph Theory (MAT-101)',
                type: 'QUIZ',
                score: '23 / 25',
                grade: 'A+',
              },
              {
                title: 'Digital Logic Circuit Lab Assignment',
                subject: 'Digital Logic & Computer Architecture (CS-102)',
                type: 'ASSIGNMENT',
                score: '20 / 20',
                grade: 'O',
              },
              {
                title: 'French Oral Comprehension Assessment',
                subject: 'French Language Foundation (FR-101)',
                type: 'VIVA',
                score: '28 / 30',
                grade: 'A+',
              },
            ].map((item, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.subject}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded">
                    {item.score}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold text-xs border border-indigo-200">
                    {item.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Doubt Clearing Activity */}
      {activeTab === 'DOUBTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Interactive Doubt Clearing Log</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Question: Equivalence Relations in Set Partitioning
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                  Pending Resolution
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Assigned to: Doubt Teacher (Prof. Karthik) • Submitted 2 hours ago
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Question: Recursion Stack Frame vs Iteration Memory Cost
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                  Resolved
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Answered by: Dr. Anandhakumar V. with code snippet attachment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Parent & Guardian Portal */}
      {activeTab === 'PARENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-teal-600" />
                <span>Linked Parent / Guardian Portal Account</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized guardian profile linked to learner {student.name} ({student.studentId})
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                showSuccess(
                  `Parent Portal access link & credentials re-dispatched to ${
                    student.parentEmail || 'parent email address'
                  }.`
                )
              }
              className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              <span>Resend Parent Portal Invite</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guardian Profile Card */}
            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-3">
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                Guardian Profile
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-teal-100">
                  <span className="text-slate-500">Legal Name:</span>
                  <span className="font-bold text-slate-900">
                    {student.parentName || 'Meenakshi Sundaram'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-teal-100">
                  <span className="text-slate-500">Relationship:</span>
                  <span className="font-semibold text-teal-800 bg-teal-100 px-2 py-0.2 rounded">
                    {student.parentRelationship || 'MOTHER'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-teal-100">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-800">
                    {student.parentEmail || 'meenakshi.s@gmail.com'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Mobile:</span>
                  <span className="font-medium text-slate-800">
                    {student.parentMobile || '+91 94440 12345'}
                  </span>
                </div>
              </div>
            </div>

            {/* Portal Entitlements & Security */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Parent Portal Capabilities & Status
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Portal Account Status:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active & Linked</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Daily Attendance Alert:</span>
                  <span className="font-semibold text-slate-700">SMS & Email Enabled</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500">Fee Invoices & Receipts:</span>
                  <span className="font-semibold text-slate-700">Online Direct Payment</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Academic Reports:</span>
                  <span className="font-semibold text-slate-700">Mid-Term & End-Term Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Account Security */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Learner Identity & Credential Security</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Access Status:</span>
              <StatusBadge status={student.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Initial Password Dispatch:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Credentials Sent to Email</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Encrypted Password Hash:</span>
              <span className="font-mono text-[11px] text-slate-700 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                Bcrypt (Cost 12) — System Managed
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Plaintext Passwords:</span>
              <span className="text-[11px] text-slate-500 italic">Strict Zero-Storage Policy</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs">
            <div>
              <p className="font-bold text-blue-900">Forgot / Locked Credentials?</p>
              <p className="text-[11px] text-blue-800">
                Trigger a server-generated secure password reset token dispatched to {student.email}.
              </p>
            </div>
            <Can permission="USER_RESET_PASSWORD">
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                Reset Password
              </button>
            </Can>
          </div>
        </div>
      )}

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        user={{
          id: student.studentId,
          name: student.name,
          email: student.email,
          avatarUrl: student.avatarUrl,
          roleId: 'role-student',
          roleName: 'Student',
          collegeId: student.collegeId,
          collegeName: student.collegeName,
          permissions: [],
          status: student.status,
          lastLoginAt: 'Recent',
          createdAt: student.createdDate,
        }}
        onPasswordResetInitiated={handlePasswordResetInitiated}
      />

      {/* Status Confirm Dialog */}
      <StatusConfirmDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        user={{
          id: student.studentId,
          name: student.name,
          email: student.email,
          avatarUrl: student.avatarUrl,
          roleId: 'role-student',
          roleName: 'Student',
          collegeId: student.collegeId,
          collegeName: student.collegeName,
          permissions: [],
          status: student.status,
          lastLoginAt: 'Recent',
          createdAt: student.createdDate,
        }}
        targetAction={student.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}

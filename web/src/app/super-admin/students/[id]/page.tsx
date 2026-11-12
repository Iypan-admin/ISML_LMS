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

  // Fallback: If not in static mockStudents, fetch or synthesize from real admissions / roster
  React.useEffect(() => {
    if (studentIdParam) {
      // Check local API first
      fetch(`/api/portals/students?collegeId=ALL`)
        .then((r) => r.json())
        .then((json) => {
          if (json && json.data) {
            const found = json.data.find(
              (s: any) => s.id === studentIdParam || s.studentId === studentIdParam || s.id === `amer-${studentIdParam}`
            );
            if (found) {
              setStudent({
                id: found.id,
                studentId: found.studentId,
                name: found.name,
                email: found.email,
                phone: found.phone || '+91 98421 00001',
                role: 'STUDENT',
                status: found.status || 'ACTIVE',
                institutionId: 'inst-amer',
                institutionName: 'The American College',
                departmentId: 'dept-lang',
                departmentName: 'Department of Foreign Languages',
                programId: 'prog-lang',
                programName: found.courseName || 'German A1 Professional Track',
                batchId: 'batch-2026',
                batchName: found.batchName || 'AY 2026–2027 Cohort',
                currentSemester: 1,
                attendancePercentage: found.attendancePercentage || 95,
                academicStanding: 'EXCELLENT',
                feeStatus: 'PAID',
                courseName: found.courseName || 'German A1 Professional Track',
                createdAt: '2026-01-15T09:00:00Z',
                lastLoginAt: new Date().toISOString(),
              } as any);
              return;
            }
          }
        })
        .catch(() => {});
    }
  }, [studentIdParam]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'ACADEMIC' | 'COURSES' | 'ATTENDANCE' | 'ASSESSMENTS' | 'DOUBTS' | 'PARENT' | 'SECURITY'
  >('ACADEMIC');

  // Modals state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Enrolled subjects — strictly empty until assigned by Academic Manager / Admin
  const enrolledCourses = useMemo(() => {
    return [];
  }, []);

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
              <span className="text-xl font-bold text-slate-700">0%</span>
              <span className="text-[10px] text-slate-400 font-medium">(No records)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Enrolled Courses</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-700">0</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Cumulative GPA</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-500">—</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Active Doubts</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-700">0</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No Academic Hierarchy Configured</h4>
          <p className="text-xs text-slate-400 mt-1">
            Department and degree hierarchy will appear once configured in Academic Architecture.
          </p>
        </div>
      )}

      {/* Tab 2: Enrolled Courses */}
      {activeTab === 'COURSES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No Courses Enrolled</h4>
          <p className="text-xs text-slate-400 mt-1">
            This student has not been enrolled in any courses or batches yet.
          </p>
        </div>
      )}

      {/* Tab 3: Attendance Breakdown */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No Attendance Records</h4>
          <p className="text-xs text-slate-400 mt-1">
            No webinar or classroom attendance logs recorded yet for this student.
          </p>
        </div>
      )}

      {/* Tab 4: Assessments & Marks */}
      {activeTab === 'ASSESSMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No Assessments Completed</h4>
          <p className="text-xs text-slate-400 mt-1">
            No marks or viva examination evaluations logged for this student yet.
          </p>
        </div>
      )}

      {/* Tab 5: Doubt Clearing Activity */}
      {activeTab === 'DOUBTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No Doubts Raised</h4>
          <p className="text-xs text-slate-400 mt-1">
            No 1:1 faculty doubts submitted by this student yet.
          </p>
        </div>
      )}

      {/* Tab: Parent & Guardian Portal */}
      {activeTab === 'PARENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center">
          <HeartHandshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No Parent Linked</h4>
          <p className="text-xs text-slate-400 mt-1">
            No guardian profile has been linked to this student record yet.
          </p>
        </div>
      )}

      {/* Tab 6: Account Security */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center">
          <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Account Security</h4>
          <p className="text-xs text-slate-400 mt-1">
            Standard encrypted credentials. No security incidents or lockouts logged.
          </p>
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

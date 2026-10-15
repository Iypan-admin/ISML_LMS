// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: STUDENTS DIRECTORY
// (/academic-manager/students)
// Dedicated Academic Learner Roster, Batch Tracking & Personal Details
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Layers,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ShieldCheck,
  Globe2,
  HeartHandshake,
  Download,
  X
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import { useToast } from '@/context/ToastContext';
import { StudentUser, UserStatus } from '@/types/rbac';
import {
  mockStudents,
  mockInstitutions,
  mockDepartments,
  mockPrograms,
  mockBatches
} from '@/mock/superAdminData';

export default function AcademicManagerStudentsPage() {
  const { showSuccess, showInfo } = useToast();
  const [students, setStudents] = useState<StudentUser[]>(mockStudents);

  // Filters
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Student for Quick Slide-Over Inspection
  const [inspectStudent, setInspectStudent] = useState<StudentUser | null>(null);

  const handleToggleStudentStatus = (studentId: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: nextStatus } : s))
    );
    if (nextStatus === 'ACTIVE') {
      showSuccess(`Student account activated.`);
    } else {
      showInfo(`Student account suspended.`);
    }
  };

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedBatch !== 'ALL' && s.batchId !== selectedBatch) return false;
      if (selectedProgram !== 'ALL' && s.programId !== selectedProgram) return false;
      if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.batchName.toLowerCase().includes(q) ||
          s.mobile.includes(q) ||
          (s.parentName && s.parentName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [students, selectedBatch, selectedProgram, selectedStatus, searchQuery]);

  // Summary Metrics
  const totalEnrolled = students.length;
  const activeCount = students.filter(s => s.status === 'ACTIVE').length;
  const avgAttendance = (students.reduce((acc, s) => acc + s.attendancePercentage, 0) / (students.length || 1)).toFixed(1);
  const totalParentsLinked = students.filter(s => s.parentName).length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'People & Faculty' }, { label: 'Students Directory' }]} />

      <CollegeFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#0052CC]" />
            <span>Learners & Student Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of enrolled foreign language students, academic cohorts, attendance rates & linked guardians.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/academic-manager/parents"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-200 cursor-pointer shadow-2xs"
          >
            <HeartHandshake className="w-4 h-4 text-indigo-600" />
            <span>View Parents & Guardians</span>
          </Link>
          <button
            onClick={() => showSuccess('Exporting student directory CSV report...')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-600">Total Enrolled</span>
            <Users className="w-4 h-4 text-[#0052CC]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{totalEnrolled}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across all language cohorts</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-emerald-700">Active Students</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{activeCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Live portal login enabled</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-blue-700">Avg. Live Attendance</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{avgAttendance}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Automated studio sync</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-purple-700">Parents Linked</span>
            <HeartHandshake className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{totalParentsLinked}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">SMS & progress reports</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, mobile, email or parent..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Cohorts / Batches</option>
            {mockBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4">Student Info</th>
                <th className="py-3.5 px-4">Enrolled Course & Batch</th>
                <th className="py-3.5 px-4">Attendance & Academic</th>
                <th className="py-3.5 px-4">Parent / Guardian</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0052CC] to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-snug">{s.name}</p>
                          <p className="text-[11px] font-mono text-slate-500">{s.studentId}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span>{s.email}</span>
                            <span>•</span>
                            <span>{s.mobile}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Course & Batch */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-800 text-xs leading-snug">
                          {s.enrolledCourseName || s.programName}
                        </p>
                        <p className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
                          <Layers className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{s.batchName}</span>
                        </p>
                        <span className="text-[10px] text-slate-400">Semester {s.semesterNumber}</span>
                      </div>
                    </td>

                    {/* Attendance & CGPA */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs ${
                            s.attendancePercentage >= 85 ? 'text-emerald-700' :
                            s.attendancePercentage >= 75 ? 'text-amber-700' : 'text-rose-600'
                          }`}>
                            {s.attendancePercentage}% Attendance
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.attendancePercentage >= 85 ? 'bg-emerald-600' :
                              s.attendancePercentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${s.attendancePercentage}%` }}
                          />
                        </div>
                        {s.cgpa && (
                          <p className="text-[10px] text-slate-500">
                            CGPA: <strong className="text-slate-800 font-bold">{s.cgpa}</strong>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Parent Details */}
                    <td className="py-3.5 px-4">
                      {s.parentName ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{s.parentName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600">
                              {s.parentRelationship || 'PARENT'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{s.parentMobile || 'Not provided'}</span>
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No parent linked</span>
                      )}
                    </td>

                    {/* Status with Interactive Toggle Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <StatusToggleSwitch
                          checked={s.status === 'ACTIVE'}
                          onChange={() => handleToggleStudentStatus(s.id, s.status)}
                          activeLabel="Active"
                          inactiveLabel="Inactive"
                          showLabels={false}
                        />
                        <StatusBadge status={s.status} />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectStudent(s)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs italic">
                    No student records found matching the active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Student 360 Profile Quick Drawer ─── */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-sm border border-white/20">
                    {inspectStudent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{inspectStudent.name}</h3>
                    <p className="text-xs text-blue-200 font-mono mt-0.5">{inspectStudent.studentId}</p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectStudent(null)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 space-y-5 text-xs text-slate-700">
                {/* Academic Enrollment Snapshot */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Academic & Enrollment Details
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Program / Degree:</span>
                      <strong className="text-slate-900 text-right">{inspectStudent.programName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Batch Cohort:</span>
                      <strong className="text-[#0052CC]">{inspectStudent.batchName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Semester:</span>
                      <strong className="text-slate-900">Semester {inspectStudent.semesterNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Academic Year:</span>
                      <strong className="text-slate-900">{inspectStudent.academicYear}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Institution:</span>
                      <strong className="text-slate-900 truncate max-w-[200px]">{inspectStudent.collegeName}</strong>
                    </div>
                  </div>
                </div>

                {/* Performance & Live Attendance */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    LMS Learning Activity & Performance
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                      <span className="text-[10px] text-blue-700 font-bold block">Live Attendance</span>
                      <p className="text-lg font-extrabold text-[#0052CC] mt-0.5">{inspectStudent.attendancePercentage}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                      <span className="text-[10px] text-purple-700 font-bold block">Enrolled Courses</span>
                      <p className="text-lg font-extrabold text-purple-900 mt-0.5">{inspectStudent.enrolledCoursesCount}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] text-emerald-700 font-bold block">CGPA Score</span>
                      <p className="text-lg font-extrabold text-emerald-900 mt-0.5">{inspectStudent.cgpa || '8.2'}</p>
                    </div>
                  </div>
                </div>

                {/* Parent & Guardian Link Block */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Linked Parent / Guardian Info
                  </h4>
                  {inspectStudent.parentName ? (
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-950 text-sm">{inspectStudent.parentName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-200 text-indigo-900">
                          {inspectStudent.parentRelationship || 'GUARDIAN'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-indigo-200/60">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{inspectStudent.parentMobile || 'Not registered'}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{inspectStudent.parentEmail || 'Not registered'}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400 italic">
                      No parent profile linked for this student.
                    </div>
                  )}
                </div>

                {/* Contact & Personal Details */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Contact & Portal Access
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Student Email:</span>
                      <strong className="text-slate-800">{inspectStudent.email}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Mobile Phone:</span>
                      <strong className="text-slate-800">{inspectStudent.mobile}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Portal Credentials:</span>
                      <span className="font-bold text-emerald-700">Delivered & Active</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close Drawer
              </button>
              <button
                onClick={() => {
                  showSuccess(`Direct notification dispatched to ${inspectStudent.name}'s parent portal.`);
                  setInspectStudent(null);
                }}
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
              >
                Notify Parent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

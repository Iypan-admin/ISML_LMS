// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: STUDENT DIRECTORY
// (/college-admin/students)
// College-specific student directory with responsive Course/Batch filters,
// attendance metrics, account status controls, and direct fee clearance.
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  BookOpen,
  Layers,
  Lock,
  Unlock,
  Building2,
  Phone,
  Mail,
  ShieldAlert,
  CreditCard,
} from 'lucide-react';
import { mockInstitutions, mockCourses, mockBatches, mockStudents } from '@/mock/superAdminData';
import { StudentUser } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';

export default function CollegeAdminStudentsPage() {
  const { showSuccess, showInfo } = useToast();
  const currentCollege = mockInstitutions[0];

  // College students list
  const [students, setStudents] = useState<StudentUser[]>(
    mockStudents.filter((s) => s.collegeId === currentCollege.id || !s.collegeId)
  );

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // College-specific courses and batches
  const collegeCourses = mockCourses.filter((c) => c.collegeId === currentCollege.id || !c.collegeId);
  const collegeBatches = mockBatches.filter((b) => b.institutionId === currentCollege.id || !b.institutionId);

  // Toggle student status
  const handleToggleStudent = (student: StudentUser) => {
    const nextStatus = student.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
    );
    if (nextStatus === 'ACTIVE') {
      showSuccess(`Activated student "${student.name}".`);
    } else {
      showInfo(`Suspended student "${student.name}".`);
    }
  };

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedCourseFilter !== 'ALL' && s.enrolledCourseId !== selectedCourseFilter && s.programId !== selectedCourseFilter) {
        return false;
      }
      if (selectedBatchFilter !== 'ALL' && s.batchId !== selectedBatchFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'ALL' && s.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.enrolledCourseName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, selectedCourseFilter, selectedBatchFilter, selectedStatusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#0052CC]" />
              <span>Campus Student Directory</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
              {students.length} Learners
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered student roll, enrolled courses, batch allocations, attendance benchmarks and fee status.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/college-admin/students/enroll"
            className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll Student</span>
          </Link>
          <Link
            href="/college-admin/fees"
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <CreditCardIcon className="w-4 h-4 text-emerald-600" />
            <span>Bulk Fees Unlock</span>
          </Link>
        </div>
      </div>

      {/* ─── Filter Cards for Courses & Batches ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Course Filter Card */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            Filter by Enrolled Course
          </label>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-white transition"
          >
            <option value="ALL">All Campus Courses ({collegeCourses.length})</option>
            {collegeCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Filter Card */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            Filter by Cohort / Batch
          </label>
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-white transition"
          >
            <option value="ALL">All Batches ({collegeBatches.length})</option>
            {collegeBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.studentsCount} Students)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Search and Status Filter Toolbar ─── */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, roll ID, email or course..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Account Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* ─── Student Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-800">
            Showing {filteredStudents.length} Students
          </span>
          <span>Campus Roster Real-time Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Student Name & ID</th>
                <th className="p-3">Course Track</th>
                <th className="p-3">Batch Allocation</th>
                <th className="p-3 text-center">Attendance</th>
                <th className="p-3 text-center">Account Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-[#0B2447] block">{student.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{student.studentId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800 block line-clamp-1">
                      {student.enrolledCourseName || student.programName}
                    </span>
                    <span className="text-[10px] text-slate-400">Semester {(student as any).currentSemester || 1}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-slate-700 block">
                      {student.batchName}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        student.attendancePercentage >= 85
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : student.attendancePercentage >= 75
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {student.attendancePercentage}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <StatusToggleSwitch
                        checked={student.status === 'ACTIVE'}
                        onChange={() => handleToggleStudent(student)}
                      />
                      <StatusBadge status={student.status} />
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/super-admin/students/${student.id}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Profile</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreditCardIcon(props: any) {
  return <CreditCard {...props} />;
}

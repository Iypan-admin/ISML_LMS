// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: ATTENDANCE SESSIONS & REPORTS
// Batch-wise & Student-level Attendance Ledger, Daily Roll Call, and NAAC Audit
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Users,
  Calendar,
  Filter,
  CheckSquare,
  Search,
  Download,
  Clock,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Sparkles,
  UserX,
  Mail,
  Phone,
  CalendarDays,
  Percent,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { AttendanceRecord, StudentUser } from '@/types/rbac';
import { mockAttendanceRecords, mockStudents, mockBatches, mockSubjects } from '@/mock/superAdminData';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface StudentAttendanceEntry {
  student: StudentUser;
  status: AttendanceStatus;
  checkInTime: string;
  notes?: string;
  totalPresent: number;
  totalClasses: number;
  overallPercentage: number;
}

export default function AcademicManagerAttendancePage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const { showSuccess, showError } = useToast();

  // Navigation view: 'BATCH_LIST' or 'STUDENT_LEDGER'
  const [activeView, setActiveView] = useState<'BATCH_LIST' | 'STUDENT_LEDGER'>('BATCH_LIST');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('batch-2026-cs');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'DEFAULTER'>('ALL');
  const [selectedDate, setSelectedDate] = useState('2026-10-14');
  const [selectedSubjectId, setSelectedSubjectId] = useState('subj-fr101');

  // Filter batches by college if applicable
  const availableBatches = useMemo(() => {
    return mockBatches.filter(
      (b) => isOverall || !b.institutionId || b.institutionId === selectedCollegeId
    );
  }, [selectedCollegeId, isOverall]);

  // Active Selected Batch
  const activeBatch = useMemo(() => {
    return (
      mockBatches.find((b) => b.id === selectedBatchId) ||
      availableBatches[0] ||
      mockBatches[0]
    );
  }, [selectedBatchId, availableBatches]);

  // Students belonging to the active batch (fallback to pool of students mapped to batch or course)
  const batchStudents = useMemo(() => {
    const directMatches = mockStudents.filter(
      (s) =>
        s.batchId === activeBatch.id ||
        s.programName?.toLowerCase() === activeBatch.programName?.toLowerCase() ||
        s.batchName?.toLowerCase().includes(activeBatch.name?.toLowerCase().slice(0, 10))
    );

    // If direct matches are few, take from general mock pool so the ledger is rich
    if (directMatches.length >= 3) return directMatches;
    return mockStudents;
  }, [activeBatch]);

  // Mock student daily attendance state (allows Academic Manager to toggle Present/Absent/Late)
  const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, AttendanceStatus>>({
    'stu-001': 'PRESENT',
    'stu-002': 'PRESENT',
    'stu-003': 'PRESENT',
    'stu-004': 'ABSENT',
    'stu-005': 'PRESENT',
    'stu-006': 'ABSENT',
    'stu-007': 'PRESENT',
    'stu-008': 'LATE',
  });

  const toggleStudentStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setStudentAttendanceMap((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
    showSuccess(`Attendance updated for student.`);
  };

  const markAllAs = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    batchStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setStudentAttendanceMap((prev) => ({ ...prev, ...updated }));
    showSuccess(`Marked all ${batchStudents.length} students as ${status}.`);
  };

  // Student Attendance Entries with computed stats
  const studentEntries: StudentAttendanceEntry[] = useMemo(() => {
    return batchStudents.map((st, idx) => {
      const status = studentAttendanceMap[st.id] || (idx % 7 === 0 ? 'ABSENT' : idx % 9 === 0 ? 'LATE' : 'PRESENT');
      const totalClasses = 32;
      const basePercentage = st.attendancePercentage || 88;
      const totalPresent = Math.round((basePercentage / 100) * totalClasses);

      let checkInTime = '09:02 AM';
      if (status === 'ABSENT') checkInTime = '—';
      else if (status === 'LATE') checkInTime = '09:28 AM';
      else if (idx % 3 === 0) checkInTime = '08:55 AM';

      return {
        student: st,
        status,
        checkInTime,
        totalPresent,
        totalClasses,
        overallPercentage: basePercentage,
      };
    });
  }, [batchStudents, studentAttendanceMap]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return studentEntries.filter(({ student, status, overallPercentage }) => {
      const matchesSearch =
        searchQuery === '' ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'PRESENT') return status === 'PRESENT';
      if (statusFilter === 'ABSENT') return status === 'ABSENT' || status === 'LATE';
      if (statusFilter === 'DEFAULTER') return overallPercentage < 80;
      return true;
    });
  }, [studentEntries, searchQuery, statusFilter]);

  // Aggregate Batch Stats
  const batchStats = useMemo(() => {
    const total = studentEntries.length;
    const present = studentEntries.filter((e) => e.status === 'PRESENT').length;
    const absent = studentEntries.filter((e) => e.status === 'ABSENT').length;
    const late = studentEntries.filter((e) => e.status === 'LATE').length;
    const defaulters = studentEntries.filter((e) => e.overallPercentage < 80).length;
    const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

    return { total, present, absent, late, defaulters, rate };
  }, [studentEntries]);

  // Open Detailed Student Ledger for a specific batch
  const handleOpenBatchLedger = (batchId: string) => {
    setSelectedBatchId(batchId);
    setActiveView('STUDENT_LEDGER');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Scheduling & Attendance' },
          { label: 'Attendance Sessions', href: activeView === 'STUDENT_LEDGER' ? '#' : undefined },
          ...(activeView === 'STUDENT_LEDGER'
            ? [{ label: activeBatch.name }]
            : []),
        ]}
      />

      <CollegeFilterBar />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {activeView === 'STUDENT_LEDGER' && (
              <button
                onClick={() => setActiveView('BATCH_LIST')}
                className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                title="Back to Batches Overview"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-emerald-600" />
              <span>
                {activeView === 'BATCH_LIST'
                  ? 'Batch Attendance Sessions & Regulatory Reports'
                  : `Student Attendance Ledger — ${activeBatch.name}`}
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeView === 'BATCH_LIST'
              ? 'Select any batch to inspect student roll-call records, presence logs, and NAAC 80% compliance.'
              : `Viewing individual student records for ${activeBatch.programName} (${activeBatch.departmentName}).`}
          </p>
        </div>

        {/* Global Action CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeView === 'STUDENT_LEDGER' ? (
            <>
              <button
                onClick={() => markAllAs('PRESENT')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={() => showSuccess(`Exported student attendance ledger for ${activeBatch.name} (Excel/CSV).`)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Ledger</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => showSuccess('Comprehensive institutional attendance audit downloaded.')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Audit</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: BATCH-WISE ATTENDANCE SESSIONS OVERVIEW                            */}
      {/* ========================================================================= */}
      {activeView === 'BATCH_LIST' && (
        <div className="space-y-6">
          {/* Institutional KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              title="Avg Attendance Rate"
              value="92.4%"
              icon={UserCheck}
              iconColor="text-emerald-600"
              subtext="Institution Active Rate"
            />
            <StatCard
              title="Active Batches"
              value={`${availableBatches.length} Cohorts`}
              icon={Layers}
              iconColor="text-blue-600"
              subtext="Monitoring Daily Sessions"
            />
            <StatCard
              title="Defaulters Alert (<80%)"
              value="7 Learners"
              icon={AlertTriangle}
              iconColor="text-amber-600"
              subtext="Advisory Notices Triggered"
            />
            <StatCard
              title="Verified Sessions Today"
              value="14 Verified"
              icon={CheckSquare}
              iconColor="text-purple-600"
              subtext="Live Class Join & LMS Portal Sync"
            />
          </div>

          {/* Batches Attendance Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0B2447] uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#0052CC]" />
                <span>Select Batch to View Individual Student Records</span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                {availableBatches.length} Total Cohorts Monitored
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBatches.map((batch) => {
                // Find matching mock record or compute realistic cohort telemetry
                const mockRec = mockAttendanceRecords.find(
                  (r) =>
                    r.batch.toLowerCase().includes(batch.name.toLowerCase().slice(0, 10)) ||
                    r.program.toLowerCase().includes(batch.programName.toLowerCase())
                );

                const studentCount = batch.studentsCount || 60;
                const attendancePct = mockRec ? mockRec.attendancePercentage : 91.5;
                const presentCount = Math.round((attendancePct / 100) * studentCount);
                const absentCount = studentCount - presentCount;
                const isGood = attendancePct >= 85;

                return (
                  <div
                    key={batch.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0052CC]/50 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Batch Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-[#0052CC] border border-blue-200/60 px-2 py-0.5 rounded-md inline-block">
                            Sem {batch.currentSemesterNumber || 1} • {batch.admissionYear}–{batch.graduationYear}
                          </span>
                          <h3 className="text-sm font-bold text-[#0B2447] truncate group-hover:text-[#0052CC] transition-colors">
                            {batch.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate font-medium">
                            {batch.programName}
                          </p>
                        </div>

                        {/* Attendance % Ring / Pill */}
                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                              isGood
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {attendancePct}%
                          </span>
                        </div>
                      </div>

                      {/* Department & Faculty Info */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400 font-medium">Department:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                            {batch.departmentName}
                          </span>
                        </div>
                        {batch.batchTiming && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400 font-medium">Lecture Slot:</span>
                            <span className="font-mono text-slate-700 font-bold">
                              {batch.batchTiming}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400 font-medium">Enrolled Strength:</span>
                          <span className="font-bold text-slate-900">{studentCount} Students</span>
                        </div>
                      </div>

                      {/* Present vs Absent Ratio Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-emerald-700 font-bold text-[11px]">
                            {presentCount} Present
                          </span>
                          <span className="text-rose-600 font-bold text-[11px]">
                            {absentCount} Absent
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${attendancePct}%` }}
                            className="bg-emerald-500 h-full rounded-full transition-all"
                          />
                          <div
                            style={{ width: `${100 - attendancePct}%` }}
                            className="bg-rose-400 h-full rounded-full transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* View Student Records Action Button */}
                    <div className="pt-4 mt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenBatchLedger(batch.id)}
                        className="w-full py-2 bg-slate-50 hover:bg-[#0052CC] text-[#0052CC] hover:text-white border border-blue-200 hover:border-transparent rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer group-hover:bg-[#0052CC] group-hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Student-Wise Attendance</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INDIVIDUAL STUDENT ATTENDANCE LEDGER                               */}
      {/* ========================================================================= */}
      {activeView === 'STUDENT_LEDGER' && (
        <div className="space-y-6">
          {/* Active Batch Summary Banner */}
          <div className="bg-gradient-to-r from-[#0B2447] via-[#1E3A8A] to-[#0052CC] text-white rounded-3xl p-6 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                    Cohort Roster
                  </span>
                  <span className="text-xs text-blue-200">
                    Semester {activeBatch.currentSemesterNumber || 1} • Academic Year 2026–2027
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{activeBatch.name}</h2>
                <p className="text-xs text-blue-100 max-w-xl">
                  {activeBatch.programName} — {activeBatch.departmentName}
                </p>
              </div>

              {/* Quick Batch Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <div className="text-center px-2">
                  <span className="text-[10px] text-blue-200 font-bold uppercase block">Enrolled</span>
                  <span className="text-lg font-black text-white">{batchStats.total}</span>
                </div>
                <div className="text-center px-2 border-l border-white/10">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Present</span>
                  <span className="text-lg font-black text-emerald-300">{batchStats.present}</span>
                </div>
                <div className="text-center px-2 border-l border-white/10">
                  <span className="text-[10px] text-rose-300 font-bold uppercase block">Absent</span>
                  <span className="text-lg font-black text-rose-300">{batchStats.absent}</span>
                </div>
                <div className="text-center px-2 border-l border-white/10">
                  <span className="text-[10px] text-amber-300 font-bold uppercase block">Defaulters</span>
                  <span className="text-lg font-black text-amber-300">{batchStats.defaulters}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Batch Session Control Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Batch Switcher Dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  Switch Batch:
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer max-w-xs truncate"
                >
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.programName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Subject Pickers */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  />
                </div>

                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  {mockSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name, register roll no, or email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold shrink-0">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  All ({studentEntries.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PRESENT')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'PRESENT' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Present ({batchStats.present})
                </button>
                <button
                  onClick={() => setStatusFilter('ABSENT')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'ABSENT' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Absent / Late ({batchStats.absent + batchStats.late})
                </button>
                <button
                  onClick={() => setStatusFilter('DEFAULTER')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'DEFAULTER' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Defaulters &lt;80% ({batchStats.defaulters})
                </button>
              </div>
            </div>
          </div>

          {/* Student Roster Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-4">Student Identification</th>
                    <th className="py-3 px-4">Roll / Reg Number</th>
                    <th className="py-3 px-4">Today Status ({selectedDate})</th>
                    <th className="py-3 px-4">Check-In Timestamp</th>
                    <th className="py-3 px-4">Semester Benchmark %</th>
                    <th className="py-3 px-4 text-center">Quick Mark Attendance</th>
                    <th className="py-3 px-4 text-right">Parent Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        No student records match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(({ student, status, checkInTime, totalPresent, totalClasses, overallPercentage }) => {
                      const isDefaulter = overallPercentage < 80;

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          {/* Student Identification */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                {student.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{student.name}</p>
                                <p className="text-[11px] text-slate-400 truncate">{student.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Roll Number */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {student.studentId}
                          </td>

                          {/* Today Attendance Status Pill */}
                          <td className="py-3 px-4">
                            {status === 'PRESENT' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Present</span>
                              </span>
                            )}
                            {status === 'ABSENT' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Absent</span>
                              </span>
                            )}
                            {status === 'LATE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Late Arrival</span>
                              </span>
                            )}
                          </td>

                          {/* Check-In Time */}
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {checkInTime}
                          </td>

                          {/* Semester Cumulative Attendance % */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-black text-xs px-2 py-0.5 rounded-md ${
                                  overallPercentage >= 85
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : overallPercentage >= 80
                                    ? 'text-blue-700 bg-blue-50'
                                    : 'text-rose-700 bg-rose-50 border border-rose-200'
                                }`}
                              >
                                {overallPercentage}%
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({totalPresent}/{totalClasses} sessions)
                              </span>
                              {isDefaulter && (
                                <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                                  Defaulter
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Toggle Action Buttons */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                              <button
                                onClick={() => toggleStudentStatus(student.id, 'PRESENT')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                  status === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-emerald-700'
                                }`}
                                title="Mark Present"
                              >
                                P
                              </button>
                              <button
                                onClick={() => toggleStudentStatus(student.id, 'LATE')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                  status === 'LATE'
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-amber-700'
                                }`}
                                title="Mark Late"
                              >
                                L
                              </button>
                              <button
                                onClick={() => toggleStudentStatus(student.id, 'ABSENT')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                  status === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-rose-700'
                                }`}
                                title="Mark Absent"
                              >
                                A
                              </button>
                            </div>
                          </td>

                          {/* Parent Contact Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {student.parentMobile && (
                                <a
                                  href={`tel:${student.parentMobile}`}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
                                  title={`Call parent: ${student.parentName || 'Guardian'} (${student.parentMobile})`}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {student.parentEmail && (
                                <a
                                  href={`mailto:${student.parentEmail}?subject=Attendance Advisory: ${student.name}`}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
                                  title={`Email parent: ${student.parentEmail}`}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <span>
                Showing {filteredStudents.length} of {studentEntries.length} enrolled students
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt;85% Satisfactory
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> 80%–85% Caution
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;80% Defaulter
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

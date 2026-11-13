// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: ATTENDANCE & PERFORMANCE MONITOR
// (/college-admin/attendance)
// Batch-Wise & Class-Wise Live Attendance Tracking with Modal Roll Call Drawer
// Scoped strictly to: The American College (AMER-COL)
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Clock,
  Award,
  BookOpen,
  Layers,
  ChevronRight,
  Video,
  XCircle,
  X,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  sessionTopic: string;
  courseName: string;
  batchName: string;
  batchCode: string;
  facultyName: string;
  date: string;
  timeSlot: string;
  durationMins: number;
  stayMins: number;
  stayPercentage: number;
  status: 'PRESENT' | 'ABSENT' | 'PENDING';
  connectionStatus: string;
  approvedBy: string;
}

export default function CollegeAdminAttendancePage() {
  const { showSuccess } = useToast();

  const [currentCollege, setCurrentCollege] = useState({
    id: '521323cd-00da-49a6-98ed-6b7918d181b4',
    name: 'The American College',
    code: 'AMER-COL',
    email: 'admin@americancollege.edu.in',
  });

  const [activeTab, setActiveTab] = useState<'CLASS_WISE' | 'BATCH_SUMMARY'>('CLASS_WISE');
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [thresholdFilter, setThresholdFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Drawer state for viewing specific class roll call
  const [activeModalSession, setActiveModalSession] = useState<any | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('isml_admin_user') || localStorage.getItem('isml_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.campusName || u.tenantName) {
            setCurrentCollege({
              id: u.campusId || u.tenantId || '521323cd-00da-49a6-98ed-6b7918d181b4',
              name: u.campusName || u.tenantName || 'The American College',
              code: u.institutionCode || u.tenantCode || 'AMER-COL',
              email: u.email || 'admin@americancollege.edu.in',
            });
          }
        }
      }
    } catch {}

    // 1. Fetch Students
    fetch('/api/portals/students?collegeId=AMER-COL')
      .then((r) => r.json())
      .then((json) => {
        if (json && json.data) setStudents(json.data);
      })
      .catch(() => {});

    // 2. Fetch Batches
    fetch('/api/portals/batches')
      .then((r) => r.json())
      .then((json) => {
        if (json && json.data) {
          const amerBatches = json.data.filter(
            (b: any) =>
              b.institutionId === '521323cd-00da-49a6-98ed-6b7918d181b4' ||
              b.institutionName?.toLowerCase().includes('american') ||
              b.code?.startsWith('BAT-SAMPLE')
          );
          setBatches(amerBatches);
        }
      })
      .catch(() => {});

    // 3. Fetch Class-wise Attendance Records
    fetch('/api/portals/attendance')
      .then((r) => r.json())
      .then((json) => {
        if (json && json.data) setAttendanceRecords(json.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Distinct Classes / Live Sessions with Pending / Marked Status
  const distinctSessions = useMemo(() => {
    const map = new Map<string, any>();
    attendanceRecords.forEach((r) => {
      if (!map.has(r.sessionId)) {
        map.set(r.sessionId, {
          sessionId: r.sessionId,
          sessionTopic: r.sessionTopic,
          batchName: r.batchName,
          batchCode: r.batchCode,
          courseName: r.courseName,
          date: r.date,
          timeSlot: r.timeSlot,
          facultyName: r.facultyName,
          totalStudents: 0,
          presentCount: 0,
          absentCount: 0,
          pendingCount: 0,
          records: [],
        });
      }
      const s = map.get(r.sessionId);
      s.totalStudents += 1;
      s.records.push(r);
      if (r.status === 'PRESENT') s.presentCount += 1;
      else if (r.status === 'ABSENT') s.absentCount += 1;
      else s.pendingCount += 1;
    });

    return Array.from(map.values()).map((s) => {
      const isPending = s.pendingCount > 0 && s.presentCount === 0 && s.absentCount === 0;
      const evaluatedTotal = s.presentCount + s.absentCount;
      const attendancePercentage = evaluatedTotal > 0 ? Math.round((s.presentCount / evaluatedTotal) * 100) : null;
      return {
        ...s,
        isAttendancePending: isPending,
        attendancePercentage,
      };
    });
  }, [attendanceRecords]);

  // Batch-wise Aggregations
  const batchStats = useMemo(() => {
    const list = [
      { name: 'Morning Batch', code: 'BAT-SAMPLE-MRNG' },
      { name: 'Evening Batch', code: 'BAT-SAMPLE-EVNG' },
    ];

    return list.map((b) => {
      const bStudents = students.filter((s) => s.batchName === b.name || s.batchCode === b.code);
      const bAttendance = attendanceRecords.filter((r) => r.batchName === b.name || r.batchCode === b.code);
      const bSessions = distinctSessions.filter((s) => s.batchName === b.name || s.batchCode === b.code);

      const totalPresent = bAttendance.filter((r) => r.status === 'PRESENT').length;
      const evaluatedRecords = bAttendance.filter((r) => r.status !== 'PENDING').length;
      const rate = evaluatedRecords > 0 ? Math.round((totalPresent / evaluatedRecords) * 100) : 100;

      const pendingClassesCount = bSessions.filter((s) => s.isAttendancePending).length;

      return {
        batchName: b.name,
        batchCode: b.code,
        studentsCount: bStudents.length,
        classesConducted: bSessions.length,
        pendingClassesCount,
        attendanceRate: rate,
        leadFaculty: 'Joy JK',
        scheduleTiming: b.name.includes('Morning') ? 'Mon–Sat 09:00 AM – 10:30 AM' : 'Mon–Sat 06:30 PM – 08:30 PM',
        students: bStudents,
      };
    });
  }, [students, attendanceRecords, distinctSessions]);

  // Filtered Class-wise Sessions
  const filteredSessions = useMemo(() => {
    return distinctSessions.filter((s) => {
      if (selectedBatch !== 'ALL' && s.batchName !== selectedBatch && s.batchCode !== selectedBatch) return false;
      if (thresholdFilter === 'MARKED' && s.isAttendancePending) return false;
      if (thresholdFilter === 'PENDING' && !s.isAttendancePending) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          s.sessionTopic.toLowerCase().includes(q) ||
          s.batchName.toLowerCase().includes(q) ||
          s.date.includes(q)
        );
      }
      return true;
    });
  }, [distinctSessions, selectedBatch, thresholdFilter, searchQuery]);

  // Overall Campus Stats
  const avgAttendance = useMemo(() => {
    const evaluated = attendanceRecords.filter((r) => r.status !== 'PENDING');
    if (evaluated.length === 0) return '100.0';
    const present = evaluated.filter((r) => r.status === 'PRESENT').length;
    return ((present / evaluated.length) * 100).toFixed(1);
  }, [attendanceRecords]);

  const totalPendingSessions = distinctSessions.filter((s) => s.isAttendancePending).length;
  const totalMarkedSessions = distinctSessions.length - totalPendingSessions;

  const handleExport = () => {
    const headers = ['Session Date', 'Topic', 'Batch', 'Student ID', 'Student Name', 'Status', 'Duration Mins', 'Stay Mins', 'Faculty'];
    const rows = attendanceRecords.map((r) => [
      r.date,
      `"${r.sessionTopic}"`,
      `"${r.batchName}"`,
      r.studentId,
      `"${r.studentName}"`,
      r.status,
      r.durationMins,
      r.stayMins,
      `"${r.facultyName}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AMER-COL_Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Attendance log exported successfully!');
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              <span>Campus Attendance & Performance Monitor</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              AMER-COL • {avgAttendance}% Verified Average
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time batch-wise monitoring, class-by-class live attendance status, and pending tutor roll call verification for {currentCollege.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Attendance Log</span>
          </button>
        </div>
      </div>

      {/* ─── Top KPI Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{students.length} Learners</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Morning (10) • Evening (10)</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classes Conducted</span>
          <div className="text-2xl font-black text-[#0B2447] mt-1">{distinctSessions.length} Live Classes</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Faculty: Joy JK</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Attendance Submitted</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{totalMarkedSessions} Classes</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Roll call verified & signed off</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-100 bg-amber-50/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Attendance Pending</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{totalPendingSessions} Classes</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Awaiting tutor roll call submission</div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CLASS_WISE')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === 'CLASS_WISE'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Class-Wise Sessions ({distinctSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BATCH_SUMMARY')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === 'BATCH_SUMMARY'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Batch-Wise Attendance</span>
        </button>
      </div>

      {/* ─── TAB 1: CLASS-WISE SESSIONS ─── */}
      {activeTab === 'CLASS_WISE' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search class lecture topic or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer text-slate-700"
              >
                <option value="ALL">All Batches</option>
                <option value="Morning Batch">Morning Batch</option>
                <option value="Evening Batch">Evening Batch</option>
              </select>

              <select
                value={thresholdFilter}
                onChange={(e) => setThresholdFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer text-slate-700"
              >
                <option value="ALL">All Submission Status</option>
                <option value="MARKED">✓ Attendance Marked Only</option>
                <option value="PENDING">⏳ Attendance Pending Only</option>
              </select>
            </div>
          </div>

          {/* Classes Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Live Webinar Class Roll Call Registry ({filteredSessions.length})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {totalMarkedSessions} Marked • {totalPendingSessions} Pending
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                Assigned Faculty: Joy JK
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Class Date & Time</th>
                    <th className="py-3 px-4">Cohort Batch</th>
                    <th className="py-3 px-4">Class Lecture Topic</th>
                    <th className="py-3 px-4">Tutor</th>
                    <th className="py-3 px-4 text-center">Enrolled</th>
                    <th className="py-3 px-4 text-center">Present</th>
                    <th className="py-3 px-4 text-center">Absent</th>
                    <th className="py-3 px-4 text-center">Class Attendance</th>
                    <th className="py-3 px-4 text-center">Roll Call Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-xs text-slate-400 font-medium">
                        No classes found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((sess) => {
                      const isPending = sess.isAttendancePending;

                      return (
                        <tr key={sess.sessionId} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{sess.date}</div>
                            <div className="text-[10px] text-slate-500">{sess.timeSlot}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800">{sess.batchName}</span>
                            <div className="text-[10px] font-mono text-slate-400">{sess.batchCode}</div>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 truncate">{sess.sessionTopic}</div>
                            <div className="text-[10px] text-slate-500">{sess.courseName}</div>
                          </td>

                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {sess.facultyName}
                          </td>

                          <td className="py-3 px-4 text-center font-bold text-slate-700">
                            {sess.totalStudents}
                          </td>

                          <td className="py-3 px-4 text-center font-black">
                            {isPending ? (
                              <span className="text-slate-400 font-mono">—</span>
                            ) : (
                              <span className="text-emerald-700 font-mono">{sess.presentCount}</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center font-black">
                            {isPending ? (
                              <span className="text-slate-400 font-mono">—</span>
                            ) : (
                              <span className="text-rose-600 font-mono">{sess.absentCount}</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                                Not Evaluated
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {sess.attendancePercentage}%
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                <span>PENDING ROLL CALL</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>SUBMITTED & VERIFIED</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setActiveModalSession(sess)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                isPending
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                              }`}
                            >
                              {isPending ? 'Inspect Roster' : 'View Roll Call'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: BATCH-WISE SUMMARY ─── */}
      {activeTab === 'BATCH_SUMMARY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchStats.map((b) => (
              <div
                key={b.batchCode}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 hover:border-emerald-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      {b.batchCode}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{b.batchName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Sample Course • {b.scheduleTiming}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-700">{b.attendanceRate}%</span>
                    <span className="block text-[10px] font-bold text-slate-400">Verified Rate</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block">ENROLLED</span>
                    <span className="text-xs font-black text-slate-900">{b.studentsCount} Students</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block">CLASSES</span>
                    <span className="text-xs font-black text-slate-900">{b.classesConducted} Total</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block">PENDING</span>
                    <span className="text-xs font-black text-amber-700">{b.pendingClassesCount} Classes</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span className="text-slate-600">Batch Attendance Benchmark</span>
                    <span className="text-emerald-700">{b.attendanceRate}% / 100%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${b.attendanceRate}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedBatch(b.batchName);
                      setActiveTab('CLASS_WISE');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Conducted Classes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Pop-up Modal / Drawer for Viewing Specific Class Roll Call ─── */}
      {activeModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {activeModalSession.batchName}
                  </span>
                  <span className="text-xs text-slate-500">{activeModalSession.date} • {activeModalSession.timeSlot}</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                  {activeModalSession.sessionTopic}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Faculty In-Charge: {activeModalSession.facultyName}</p>
              </div>

              <button
                onClick={() => setActiveModalSession(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subheader summary */}
            <div className="px-5 py-3 bg-emerald-50/40 border-b border-slate-100 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-3">
                <span className="text-slate-600">
                  Enrolled: <strong className="text-slate-900">{activeModalSession.totalStudents}</strong>
                </span>
                <span className="text-emerald-700">
                  Present: <strong>{activeModalSession.isAttendancePending ? '—' : activeModalSession.presentCount}</strong>
                </span>
                <span className="text-rose-600">
                  Absent: <strong>{activeModalSession.isAttendancePending ? '—' : activeModalSession.absentCount}</strong>
                </span>
              </div>

              {activeModalSession.isAttendancePending ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                  ROLL CALL PENDING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  SUBMITTED & VERIFIED
                </span>
              )}
            </div>

            {/* Modal Roll Call Table */}
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Roll Number</th>
                    <th className="py-2.5 px-3">Duration / Stay</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeModalSession.records.map((r: AttendanceRecord) => {
                    const isPending = r.status === 'PENDING';
                    const isPresent = r.status === 'PRESENT';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {r.studentName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {r.studentId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {isPending ? (
                            <span className="text-slate-400">Awaiting class</span>
                          ) : (
                            `${r.stayMins} / ${r.durationMins} mins (${r.stayPercentage}%)`
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                              PENDING
                            </span>
                          ) : isPresent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              PRESENT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                              ABSENT
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                {activeModalSession.isAttendancePending
                  ? 'Attendance roll call will update when tutor marks submission.'
                  : `Signed off by ${activeModalSession.facultyName} (Tutor Roll Call)`}
              </span>
              <button
                type="button"
                onClick={() => setActiveModalSession(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

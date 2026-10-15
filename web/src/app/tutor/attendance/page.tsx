// ============================================================================
// ISML COLLEGE LMS — TUTOR: ATTENDANCE ROLL CALL (/tutor/attendance)
// Step-by-Step Clean & User-Friendly Hierarchy:
// STEP 1: Select Course (French A1, French A2, French B1, French B2) in pastel cards
// STEP 2: Select Batch / Cohort under that course
// STEP 3: Roll Call Ledger with live summary and quick actions
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Save,
  Download,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  TrendingUp,
  Layers,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import { useToast } from '@/context/ToastContext';

type AttendanceState = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface RollCallStudent {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  avatarUrl: string;
  collegeName: string;
  overallAttendancePct: number;
  status: AttendanceState;
  checkInTime: string;
  remarks?: string;
}

interface BatchItem {
  batchId: string;
  batchName: string;
  sectionCode: string;
  schedule: string;
  dutyRole: string;
  dutyBadgeColor: string;
  students: RollCallStudent[];
}

interface CourseItem {
  id: string;
  code: string;
  levelBadge: string;
  name: string;
  cefrTrack: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  iconBg: string;
  batches: BatchItem[];
}

// Master Course & Batch Hierarchical Data Structure
const COURSES_DATA: CourseItem[] = [
  {
    id: 'crs-fr-a1',
    code: 'FR-101',
    levelBadge: 'CEFR A1',
    name: 'French A1: Beginner Foundations & Phonetics',
    cefrTrack: 'DELF A1 Certification',
    pastelBg: 'bg-blue-50/70',
    pastelBorder: 'border-blue-200',
    accentColor: 'text-[#0052CC]',
    iconBg: 'bg-blue-100 text-[#0052CC]',
    batches: [
      {
        batchId: 'batch-2026-fr-a1-morning',
        batchName: 'French A1 Intensive Cohort 2026 (Live Webinar Batch)',
        sectionCode: 'Section A (Morning)',
        schedule: 'Mon & Wed • 10:00 - 11:30 AM',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        students: [
          {
            id: 'std-a1-01',
            name: 'Bharathi M',
            rollNo: '2026-FR-8942',
            email: 'bharathi.m@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University, Chennai',
            overallAttendancePct: 94.5,
            status: 'PRESENT',
            checkInTime: '10:01 AM',
          },
          {
            id: 'std-a1-02',
            name: 'Karthikeyan S',
            rollNo: '2026-FR-8943',
            email: 'karthik.s@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            overallAttendancePct: 88.0,
            status: 'PRESENT',
            checkInTime: '10:04 AM',
          },
          {
            id: 'std-a1-03',
            name: 'Divya Lakshmi R',
            rollNo: '2026-FR-8944',
            email: 'divya.r@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Madras Christian College (MCC)',
            overallAttendancePct: 96.0,
            status: 'PRESENT',
            checkInTime: '09:58 AM',
          },
          {
            id: 'std-a1-04',
            name: 'Naveen Kumar B',
            rollNo: '2026-FR-8945',
            email: 'naveen.b@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            collegeName: 'PSG College of Technology',
            overallAttendancePct: 68.5,
            status: 'ABSENT',
            checkInTime: '--:--',
            remarks: 'Uninformed absence',
          },
          {
            id: 'std-a1-05',
            name: 'Ananya Deshmukh',
            rollNo: '2026-FR-8946',
            email: 'ananya.d@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Stella Maris College',
            overallAttendancePct: 91.0,
            status: 'LATE',
            checkInTime: '10:14 AM',
            remarks: 'Joined after 15 mins (Network glitch)',
          },
          {
            id: 'std-a1-06',
            name: 'Siddharth Rao',
            rollNo: '2026-FR-8947',
            email: 'siddharth.r@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University Guindy',
            overallAttendancePct: 85.0,
            status: 'PRESENT',
            checkInTime: '10:02 AM',
          },
        ],
      },
      {
        batchId: 'batch-2026-fr-a1-weekend',
        batchName: 'French A1 Fast-Track Weekend Bootcamp',
        sectionCode: 'Section B (Weekend)',
        schedule: 'Sat & Sun • 11:00 AM - 01:00 PM',
        dutyRole: 'Lead Trainer',
        dutyBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        students: [
          {
            id: 'std-a1-07',
            name: 'Preethi Sundar',
            rollNo: '2026-FR-9011',
            email: 'preethi.s@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Women\'s Christian College (WCC)',
            overallAttendancePct: 95.0,
            status: 'PRESENT',
            checkInTime: '11:00 AM',
          },
          {
            id: 'std-a1-08',
            name: 'Varun Nair',
            rollNo: '2026-FR-9012',
            email: 'varun.n@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            overallAttendancePct: 91.0,
            status: 'PRESENT',
            checkInTime: '11:02 AM',
          },
        ],
      },
    ],
  },
  {
    id: 'crs-fr-a2',
    code: 'FR-102',
    levelBadge: 'CEFR A2',
    name: 'French A2: Elementary Narrative & Passé Composé',
    cefrTrack: 'DELF A2 Preparation',
    pastelBg: 'bg-amber-50/70',
    pastelBorder: 'border-amber-200',
    accentColor: 'text-amber-800',
    iconBg: 'bg-amber-100 text-amber-800',
    batches: [
      {
        batchId: 'batch-fr-a2',
        batchName: 'French A2 Cohort (Section B - Standby Coverage)',
        sectionCode: 'Section B (Afternoon)',
        schedule: 'Tue & Thu • 02:00 - 03:30 PM',
        dutyRole: 'Substitute Standby',
        dutyBadgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
        students: [
          {
            id: 'std-a2-01',
            name: 'Alex D\'Souza',
            rollNo: '2026-FR-A2-101',
            email: 'alex.dsouza@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            overallAttendancePct: 92.5,
            status: 'PRESENT',
            checkInTime: '02:00 PM',
          },
          {
            id: 'std-a2-02',
            name: 'Pooja Ramachandran',
            rollNo: '2026-FR-A2-102',
            email: 'pooja.r@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University, CEG',
            overallAttendancePct: 95.0,
            status: 'PRESENT',
            checkInTime: '01:58 PM',
          },
          {
            id: 'std-a2-03',
            name: 'Rohan Mehra',
            rollNo: '2026-FR-A2-103',
            email: 'rohan.m@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
            collegeName: 'MCC Chennai',
            overallAttendancePct: 74.0,
            status: 'EXCUSED',
            checkInTime: '--:--',
            remarks: 'Medical leave approved by Academic Dean',
          },
        ],
      },
    ],
  },
  {
    id: 'crs-fr-b1',
    code: 'FR-201',
    levelBadge: 'CEFR B1',
    name: 'French B1: Independent Fluency & Subjunctive Mood',
    cefrTrack: 'DELF B1 Intermediate',
    pastelBg: 'bg-emerald-50/70',
    pastelBorder: 'border-emerald-200',
    accentColor: 'text-emerald-800',
    iconBg: 'bg-emerald-100 text-emerald-800',
    batches: [
      {
        batchId: 'batch-fr-b1',
        batchName: 'French B1 Executive Cohort (1-on-1 Q&A Desk)',
        sectionCode: 'Section Q (Evening Clinic)',
        schedule: 'Tue & Thu • 05:30 - 07:00 PM',
        dutyRole: 'Doubt Clearance Specialist',
        dutyBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        students: [
          {
            id: 'std-b1-01',
            name: 'Sophie Martin',
            rollNo: '2026-FR-B1-201',
            email: 'sophie.m@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            collegeName: 'ISML Global Executive Track',
            overallAttendancePct: 97.0,
            status: 'PRESENT',
            checkInTime: '05:28 PM',
          },
          {
            id: 'std-b1-02',
            name: 'Dinesh Kumar',
            rollNo: '2026-FR-B1-202',
            email: 'dinesh.k@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            collegeName: 'PSG Tech Coimbatore',
            overallAttendancePct: 89.5,
            status: 'PRESENT',
            checkInTime: '05:31 PM',
          },
        ],
      },
    ],
  },
  {
    id: 'crs-fr-b2',
    code: 'FR-202',
    levelBadge: 'CEFR B2',
    name: 'French B2: Advanced Oral Discourse & DELF Synthesis',
    cefrTrack: 'DELF B2 Advanced Fluency',
    pastelBg: 'bg-purple-50/70',
    pastelBorder: 'border-purple-200',
    accentColor: 'text-purple-800',
    iconBg: 'bg-purple-100 text-purple-800',
    batches: [
      {
        batchId: 'batch-fr-b2',
        batchName: 'French B2 Advanced Cohort (Evaluation Desk)',
        sectionCode: 'Section V (Evaluation)',
        schedule: 'Friday • 03:00 - 05:00 PM',
        dutyRole: 'Assistant Evaluator',
        dutyBadgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
        students: [
          {
            id: 'std-b2-01',
            name: 'Akash Sundaram',
            rollNo: '2026-FR-B2-301',
            email: 'akash.s@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Anna University Guindy',
            overallAttendancePct: 98.0,
            status: 'PRESENT',
            checkInTime: '03:00 PM',
          },
          {
            id: 'std-b2-02',
            name: 'Meera Krishnan',
            rollNo: '2026-FR-B2-302',
            email: 'meera.k@isml.edu',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            collegeName: 'Loyola College (Autonomous)',
            overallAttendancePct: 93.0,
            status: 'PRESENT',
            checkInTime: '03:02 PM',
          },
        ],
      },
    ],
  },
];

export default function TutorAttendancePage() {
  const { showSuccess, showInfo } = useToast();
  const { currentFaculty } = useTutor();

  // STEP 1: Selected Course ID (Defaults to French A1)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-fr-a1');

  // STEP 2: Selected Batch ID (Defaults to first batch of selected course)
  const [selectedBatchId, setSelectedBatchId] = useState<string>('batch-2026-fr-a1-morning');

  const [sessionDate, setSessionDate] = useState<string>('2026-10-15');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceState>('ALL');

  // Active selected Course
  const activeCourse = useMemo(() => {
    return COURSES_DATA.find((c) => c.id === selectedCourseId) || COURSES_DATA[0];
  }, [selectedCourseId]);

  // Available batches under selected course
  const availableBatches = activeCourse.batches;

  // Active selected Batch
  const activeBatch = useMemo(() => {
    return availableBatches.find((b) => b.batchId === selectedBatchId) || availableBatches[0];
  }, [availableBatches, selectedBatchId]);

  // Dynamic Roster state per selected batch
  const [rosters, setRosters] = useState<Record<string, RollCallStudent[]>>(() => {
    const initial: Record<string, RollCallStudent[]> = {};
    COURSES_DATA.forEach((crs) => {
      crs.batches.forEach((b) => {
        initial[b.batchId] = b.students;
      });
    });
    return initial;
  });

  const currentStudents = rosters[activeBatch.batchId] || [];

  // Filtered Students in table
  const filteredStudents = useMemo(() => {
    return currentStudents.filter((st) => {
      if (statusFilter !== 'ALL' && st.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return st.name.toLowerCase().includes(q) || st.rollNo.toLowerCase().includes(q);
      }
      return true;
    });
  }, [currentStudents, statusFilter, searchQuery]);

  // When course changes, automatically set first batch
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const crs = COURSES_DATA.find((c) => c.id === courseId);
    if (crs && crs.batches.length > 0) {
      setSelectedBatchId(crs.batches[0].batchId);
    }
  };

  // Status Toggles
  const setStudentStatus = (studentId: string, newStatus: AttendanceState) => {
    setRosters((prev) => ({
      ...prev,
      [activeBatch.batchId]: prev[activeBatch.batchId].map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: newStatus,
              checkInTime: newStatus === 'ABSENT' || newStatus === 'EXCUSED' ? '--:--' : s.checkInTime === '--:--' ? '10:05 AM' : s.checkInTime,
            }
          : s
      ),
    }));
  };

  // Bulk Actions
  const handleMarkAll = (status: AttendanceState) => {
    setRosters((prev) => ({
      ...prev,
      [activeBatch.batchId]: prev[activeBatch.batchId].map((s) => ({
        ...s,
        status,
        checkInTime: status === 'ABSENT' || status === 'EXCUSED' ? '--:--' : '10:00 AM',
      })),
    }));
    showInfo(`All students marked as ${status} for ${activeBatch.batchName}.`);
  };

  const handleSaveAttendance = () => {
    showSuccess(
      `Attendance finalized & signed for ${activeCourse.code} • ${activeBatch.batchName} (${sessionDate}). Synced to NAAC records.`
    );
  };

  // Metrics
  const totalCount = currentStudents.length;
  const presentCount = currentStudents.filter((s) => s.status === 'PRESENT').length;
  const absentCount = currentStudents.filter((s) => s.status === 'ABSENT').length;
  const lateCount = currentStudents.filter((s) => s.status === 'LATE').length;
  const excusedCount = currentStudents.filter((s) => s.status === 'EXCUSED').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Faculty Console', href: '/tutor/dashboard' },
          { label: 'Attendance Roll Call' },
        ]}
      />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Daily Attendance & Student Roll Call
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select course and cohort to mark attendance and review student roll call ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveAttendance}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Finalize & Submit Roll Call</span>
          </button>
        </div>
      </div>

      {/* ─── STEP 1: SELECT COURSE (Mild Pastel Cards) ─── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Select Language Course
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Click course card to reveal batches
          </span>
        </div>

        {/* 4 Mild Pastel Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {COURSES_DATA.map((crs) => {
            const isSelected = selectedCourseId === crs.id;
            const totalCourseStudents = crs.batches.reduce((acc, b) => acc + (rosters[b.batchId]?.length || 0), 0);

            return (
              <button
                key={crs.id}
                onClick={() => handleSelectCourse(crs.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isSelected
                    ? `${crs.pastelBg} border-[#0052CC] ring-2 ring-blue-500/20 shadow-md`
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs'
                }`}
              >
                {/* Active selection ribbon */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]"></span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${crs.iconBg}`}>
                      {crs.code}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500">
                      {crs.levelBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xs font-black leading-snug ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                      {crs.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {crs.cefrTrack}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600">
                    {crs.batches.length} {crs.batches.length === 1 ? 'Batch' : 'Batches'}
                  </span>
                  <span className={crs.accentColor}>
                    {totalCourseStudents} Students
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 2: SELECT BATCH (Under Selected Course) ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center shrink-0">
              2
            </span>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Select Batch for <span className="text-[#0052CC]">{activeCourse.code}: {activeCourse.name}</span>
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 shrink-0">
            {availableBatches.length} Active {availableBatches.length === 1 ? 'Batch' : 'Batches'}
          </span>
        </div>

        {/* Batch Selection Pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableBatches.map((b) => {
            const isSelected = selectedBatchId === b.batchId;
            const bStudents = rosters[b.batchId] || [];
            const pres = bStudents.filter((s) => s.status === 'PRESENT' || s.status === 'LATE').length;
            const rate = bStudents.length > 0 ? Math.round((pres / bStudents.length) * 100) : 0;

            return (
              <button
                key={b.batchId}
                onClick={() => setSelectedBatchId(b.batchId)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50/90 border-[#0052CC] ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${b.dutyBadgeColor}`}>
                      {b.dutyRole}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {b.sectionCode}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {b.batchName}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{b.schedule}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-slate-900">
                    {bStudents.length} Learners
                  </div>
                  <div className={`text-[11px] font-black ${rate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {rate}% Live Attended
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 3: ATTENDANCE LEDGER & ROLL CALL ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        {/* Context bar with Date Picker */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center">
                3
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-[#0052CC]">
                {activeCourse.code} • {activeBatch.sectionCode}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {activeBatch.batchName}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Duty: <strong>{activeBatch.dutyRole}</strong> • Session: {activeBatch.schedule}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Roll Call Date:</span>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-[#0052CC]" />
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4 Mild Pastel KPI Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">PRESENT TODAY</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-emerald-950">{presentCount}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {attendanceRate}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">ABSENT</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-rose-950">{absentCount}</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                Unexcused
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">LATE CHECK-IN</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-amber-950">{lateCount}</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                &gt;10 mins
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">TOTAL LEARNERS</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-blue-950">{totalCount}</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                Roster
              </span>
            </div>
          </div>
        </div>

        {/* Quick Bulk Actions Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">Quick Mark:</span>
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Mark All Absent</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-slate-800 w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All States ({totalCount})</option>
              <option value="PRESENT">Present ({presentCount})</option>
              <option value="ABSENT">Absent ({absentCount})</option>
              <option value="LATE">Late ({lateCount})</option>
              <option value="EXCUSED">Excused ({excusedCount})</option>
            </select>
          </div>
        </div>

        {/* Student Roll Call Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-4">Learner Profile</th>
                <th className="py-3 px-4">Roll No & College</th>
                <th className="py-3 px-4">Historical Att. %</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4 text-center">Mark Status</th>
                <th className="py-3 px-4">Remarks / Exception</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No students found matching this criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Learner */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={st.avatarUrl}
                          alt={st.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <div className="text-[11px] text-slate-500">{st.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] font-bold text-slate-800">{st.rollNo}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{st.collegeName}</div>
                    </td>

                    {/* Overall Attendance */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              st.overallAttendancePct >= 85
                                ? 'bg-emerald-500'
                                : st.overallAttendancePct >= 75
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${st.overallAttendancePct}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">{st.overallAttendancePct}%</span>
                      </div>
                    </td>

                    {/* Check In Time */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {st.checkInTime}
                    </td>

                    {/* Toggle Status Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                          onClick={() => setStudentStatus(st.id, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                            st.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => setStudentStatus(st.id, 'LATE')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                            st.status === 'LATE'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => setStudentStatus(st.id, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                            st.status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => setStudentStatus(st.id, 'EXCUSED')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                            st.status === 'EXCUSED'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-blue-700'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>

                    {/* Remarks */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {st.remarks || <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Attendance ledger is compliant with NAAC Criterion II records.</span>
          </div>

          <button
            onClick={handleSaveAttendance}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Finalize Attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
}

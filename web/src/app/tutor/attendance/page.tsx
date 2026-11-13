// ============================================================================
// ISML COLLEGE LMS — TUTOR: SCHEDULE-BASED ATTENDANCE ROLL CALL (/tutor/attendance)
// Features:
// 1. Interactive Responsive Month Calendar & Scheduled Sessions Carousel
// 2. Strict Schedule-Based Session Detection (Mon, Wed, Fri etc. based on allocated timetable)
// 3. Status Badging:
//    - ✅ MARKED (Recorded & Signed)
//    - ⚠️ PENDING (Scheduled today / past without submission)
//    - 🔒 UPCOMING (Future date - disabled for marking)
// 4. Batch-isolated roster (Morning Batch vs Evening Batch)
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  Lock,
  CalendarDays,
  ChevronLeft,
  Calendar as CalendarIcon,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FacultyRoleSwitcherBar from '@/components/tutor/FacultyRoleSwitcherBar';
import { useTutor } from '@/context/TutorContext';
import { useToast } from '@/context/ToastContext';
import { fastFetch } from '@/lib/fastCache';

type AttendanceState = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'PENDING';

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
  scheduleDays: string[];
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

const PASTEL_STYLES = [
  {
    pastelBg: 'bg-emerald-50/70',
    pastelBorder: 'border-emerald-200',
    accentColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    pastelBg: 'bg-indigo-50/70',
    pastelBorder: 'border-indigo-200',
    accentColor: 'text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-700',
  },
  {
    pastelBg: 'bg-amber-50/70',
    pastelBorder: 'border-amber-200',
    accentColor: 'text-amber-700',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    pastelBg: 'bg-rose-50/70',
    pastelBorder: 'border-rose-200',
    accentColor: 'text-rose-700',
    iconBg: 'bg-rose-100 text-rose-700',
  },
];

export default function TutorAttendancePage() {
  const { showSuccess, showInfo, showError } = useToast();
  const { currentFaculty, myAllocations } = useTutor();

  const [coursesData, setCoursesData] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>('2026-11-13');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceState>('ALL');

  // Calendar View State: 'FULL_CALENDAR' vs 'SESSION_CAROUSEL'
  const [calendarViewMode, setCalendarViewMode] = useState<'FULL_CALENDAR' | 'SESSION_CAROUSEL'>('FULL_CALENDAR');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date(2026, 10, 1)); // Nov 2026

  // Multi-date roster store: key = `${batchId}__${date}`
  const [dateRosters, setDateRosters] = useState<Record<string, RollCallStudent[]>>({});
  const [databaseAttendance, setDatabaseAttendance] = useState<any[]>([]);

  // 1. Dynamic Portfolio & Roster Loading
  useEffect(() => {
    let isCancelled = false;

    async function loadAttendanceData() {
      try {
        let rawCourses: any[] = [];
        let rawBatches: any[] = [];
        let rawStudents: any[] = [];
        let rawAttendance: any[] = [];

        await Promise.all([
          fastFetch('/api/portals/courses', (cJson) => {
            if (cJson?.data) rawCourses = cJson.data;
          }),
          fastFetch('/api/portals/batches', (bJson) => {
            if (bJson?.data) rawBatches = bJson.data;
          }),
          fastFetch('/api/portals/students?collegeId=AMER-COL', (sJson) => {
            if (sJson?.data) rawStudents = sJson.data;
          }),
          fastFetch('/api/portals/attendance', (aJson) => {
            if (aJson?.data) rawAttendance = aJson.data;
          }),
        ]);

        if (isCancelled) return;

        setDatabaseAttendance(rawAttendance);

        const allocatedCourseIds = new Set(myAllocations.map((a) => a.courseId).filter(Boolean));
        const allocatedCourseNames = new Set(myAllocations.map((a) => a.courseName?.toLowerCase()).filter(Boolean));
        const allocatedSubjectCodes = new Set(myAllocations.map((a) => a.subjectCode?.toLowerCase()).filter(Boolean));
        const allocatedBatchIds = new Set(myAllocations.map((a) => a.batchId).filter(Boolean));
        const allocatedBatchNames = new Set(myAllocations.map((a) => a.batchName?.toLowerCase()).filter(Boolean));

        const assignedCourses = rawCourses.filter((c: any) => {
          if (myAllocations.length === 0) return true;
          return (
            allocatedCourseIds.has(c.id) ||
            allocatedCourseNames.has(c.name?.toLowerCase()) ||
            allocatedSubjectCodes.has(c.code?.toLowerCase())
          );
        });

        const parsedCourses: CourseItem[] = assignedCourses.map((c: any, idx: number) => {
          const style = PASTEL_STYLES[idx % PASTEL_STYLES.length];
          const courseBatches: BatchItem[] = rawBatches
            .filter((b: any) => {
              const matchesCourse =
                b.programId === c.id ||
                b.courseIds?.includes(c.id) ||
                (b.programName && c.name && b.programName.toLowerCase() === c.name.toLowerCase()) ||
                (b.code && c.code && b.code.toLowerCase().includes(c.code.toLowerCase()));
              const matchesAllocation =
                myAllocations.length === 0 ||
                allocatedBatchIds.has(b.id) ||
                allocatedBatchNames.has(b.name?.toLowerCase());
              return matchesCourse || matchesAllocation;
            })
            .map((b: any, bIdx: number) => {
              const matchedAlloc = myAllocations.find(
                (a) => a.batchId === b.id || a.batchName?.toLowerCase() === b.name?.toLowerCase()
              );
              const dutyRole =
                matchedAlloc?.tutorRole === 'LEAD_TRAINER'
                  ? 'Lead Native Trainer'
                  : matchedAlloc?.tutorRole === 'SUBSTITUTE_TUTOR'
                    ? 'Substitute Standby'
                    : matchedAlloc?.tutorRole === 'DOUBT_SOLVING_TUTOR'
                      ? 'Doubt Clearing Faculty'
                      : 'Assistant Evaluator';

              const schedule = matchedAlloc?.scheduleSlots?.[0] || b.batchTiming || '09:00 AM – 10:30 AM';

              // Parse scheduled days from allocation e.g. "Mon, Wed, Fri"
              const scheduleDays = b.scheduleDays || ['MON', 'WED', 'FRI'];

              // Strictly isolate students to this specific batch
              const batchStudentIds = new Set(Array.isArray(b.studentIds) ? b.studentIds : []);
              const batchStudents = (rawStudents || []).filter((std: any) => {
                const stdId = std.id || std.studentId;
                if (batchStudentIds.size > 0 && batchStudentIds.has(stdId)) return true;
                if (std.batchId && (std.batchId === b.id || std.batchId === b.batchId)) return true;
                if (std.batchName && b.name && std.batchName.toLowerCase().trim() === b.name.toLowerCase().trim()) return true;
                return false;
              });

              const studentsForThisBatch: RollCallStudent[] = batchStudents.map((std: any, sIdx: number) => ({
                id: std.id || std.studentId || `std-${sIdx + 1}`,
                name: std.name || 'Verified Student',
                rollNo: std.studentId || std.rollNo || `AMER-STD-${100 + sIdx}`,
                email: std.email || `student${sIdx + 1}@americancollege.edu.in`,
                avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + sIdx}?w=150`,
                collegeName: std.tenantName || 'The American College',
                overallAttendancePct: std.attendancePercentage || 95,
                status: 'PENDING' as AttendanceState,
                checkInTime: '--:--',
                remarks: 'Attendance Pending Submission',
              }));

              return {
                batchId: b.id,
                batchName: b.name,
                sectionCode: `SEC-${String.fromCharCode(65 + bIdx)}`,
                schedule,
                dutyRole,
                dutyBadgeColor: 'bg-blue-50 text-[#0052CC] border-blue-200',
                scheduleDays,
                students: studentsForThisBatch,
              };
            });

          return {
            id: c.id,
            code: c.code || `CRS-${idx + 1}`,
            levelBadge: c.program || 'Certificate',
            name: c.name,
            cefrTrack: `${c.department || 'Languages'} • ${c.duration || '90 Days'}`,
            ...style,
            batches: courseBatches,
          };
        });

        if (!isCancelled) {
          setCoursesData(parsedCourses);
          if (parsedCourses.length > 0) {
            setSelectedCourseId(parsedCourses[0].id);
            if (parsedCourses[0].batches.length > 0) {
              setSelectedBatchId(parsedCourses[0].batches[0].batchId);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load tutor attendance data:', err);
      }
    }

    loadAttendanceData();

    // Listen to live attendance updates
    const handleLiveAttendanceUpdated = (e: any) => {
      if (e?.detail?.students && Array.isArray(e.detail.students) && e.detail.batchId) {
        const bId = e.detail.batchId;
        const targetDate = e.detail.date || sessionDate;
        const key = `${bId}__${targetDate}`;
        setDateRosters((prev) => ({
          ...prev,
          [key]: e.detail.students,
        }));
      }
    };
    window.addEventListener('isml-live-attendance-updated', handleLiveAttendanceUpdated);

    return () => {
      isCancelled = true;
      window.removeEventListener('isml-live-attendance-updated', handleLiveAttendanceUpdated);
    };
  }, [myAllocations]);

  // Active selected Course & Batch
  const activeCourse = useMemo(() => {
    return coursesData.find((c) => c.id === selectedCourseId) || coursesData[0] || {
      id: 'crs-none',
      code: 'SAMPLE-CRS-101',
      levelBadge: 'CEFR A1',
      name: 'Sample Course',
      cefrTrack: 'Languages • 90 Days',
      pastelBg: 'bg-slate-50',
      pastelBorder: 'border-slate-200',
      accentColor: 'text-slate-800',
      iconBg: 'bg-slate-100 text-slate-800',
      batches: [],
    };
  }, [coursesData, selectedCourseId]);

  const availableBatches = useMemo(() => {
    return activeCourse.batches || [];
  }, [activeCourse]);

  const activeBatch = useMemo(() => {
    return availableBatches.find((b) => b.batchId === selectedBatchId) || availableBatches[0] || {
      batchId: 'none',
      batchName: 'No Batch',
      sectionCode: 'SEC-A',
      schedule: '09:00 AM - 10:30 AM',
      dutyRole: 'Lead Trainer',
      dutyBadgeColor: 'bg-blue-50 text-blue-700',
      scheduleDays: ['MON', 'WED', 'FRI'],
      students: [],
    };
  }, [availableBatches, selectedBatchId]);

  // Auto-switch batch if selected batch doesn't exist in current course
  useEffect(() => {
    if (availableBatches.length > 0 && !availableBatches.some((b) => b.batchId === selectedBatchId)) {
      setSelectedBatchId(availableBatches[0].batchId);
    }
  }, [availableBatches, selectedBatchId]);

  // Helper function to calculate attendance status for any given date
  const getDateAttendanceStatus = (dateStr: string): 'MARKED' | 'PENDING' | 'UPCOMING' => {
    const isFuture = dateStr > '2026-11-13';
    const key = `${activeBatch.batchId}__${dateStr}`;
    const memorySaved = dateRosters[key];
    const hasMemoryMarked = memorySaved && memorySaved.some((s) => s.status !== 'PENDING');

    let hasLocalSaved = false;
    try {
      if (typeof window !== 'undefined') {
        const lRaw = localStorage.getItem(`isml_batch_attendance_${activeBatch.batchId}__${dateStr}`);
        if (lRaw) {
          const parsed = JSON.parse(lRaw);
          if (Array.isArray(parsed) && parsed.some((s) => s.status !== 'PENDING')) {
            hasLocalSaved = true;
          }
        }
      }
    } catch {}

    const hasDbMarked = databaseAttendance.some(
      (rec) =>
        rec.date === dateStr &&
        (rec.batchName?.toLowerCase() === activeBatch.batchName?.toLowerCase() || rec.batchId === activeBatch.batchId) &&
        rec.status &&
        rec.status !== 'PENDING'
    );

    if (hasMemoryMarked || hasLocalSaved || hasDbMarked) {
      return 'MARKED';
    }
    if (isFuture) {
      return 'UPCOMING';
    }
    return 'PENDING';
  };

  // 2. Generate Schedule Session Dates (e.g. Past 7 days + Today + Next 7 days)
  const scheduledSessionDates = useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayOfWeek: string;
      dayNumber: number;
      monthShort: string;
      isToday: boolean;
      isFuture: boolean;
      isPast: boolean;
      status: 'MARKED' | 'PENDING' | 'UPCOMING';
    }> = [];

    const today = new Date(2026, 10, 13);
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const shortDayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const scheduledDaysSet = new Set(
      (activeBatch.scheduleDays || ['MON', 'WED', 'FRI']).map((d) => d.toUpperCase().slice(0, 3))
    );

    for (let offset = -7; offset <= 7; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);

      const dayIdx = d.getDay();
      const shortDay = shortDayNames[dayIdx];

      const isBatchDay = scheduledDaysSet.has(shortDay) || scheduledDaysSet.has(dayNames[dayIdx].slice(0, 3));
      if (!isBatchDay && offset !== 0) continue;

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNum}`;

      const isToday = offset === 0;
      const isFuture = offset > 0;
      const isPast = offset < 0;
      const status = getDateAttendanceStatus(dateStr);

      list.push({
        dateStr,
        dayOfWeek: shortDay,
        dayNumber: d.getDate(),
        monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday,
        isFuture,
        isPast,
        status,
      });
    }

    return list;
  }, [activeBatch, dateRosters, databaseAttendance]);

  // 3. Full Responsive Month Calendar Generation (Month Matrix)
  const monthCalendarMatrix = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const scheduledDaysSet = new Set(
      (activeBatch.scheduleDays || ['MON', 'WED', 'FRI']).map((d) => d.toUpperCase().slice(0, 3))
    );
    const shortDayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const daysList = [];

    // Blank cells before the 1st of month
    for (let b = 0; b < firstDayIndex; b++) {
      daysList.push({ isBlank: true, key: `blank-${b}` });
    }

    // Actual calendar days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day);
      const dayIdx = d.getDay();
      const shortDay = shortDayNames[dayIdx];
      const isScheduledClass = scheduledDaysSet.has(shortDay);

      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      const isToday = dateStr === '2026-11-13';
      const isFuture = dateStr > '2026-11-13';
      const status = isScheduledClass ? getDateAttendanceStatus(dateStr) : null;

      daysList.push({
        isBlank: false,
        dayNumber: day,
        dateStr,
        dayOfWeek: shortDay,
        isScheduledClass,
        isToday,
        isFuture,
        status,
        key: dateStr,
      });
    }

    return daysList;
  }, [currentCalendarMonth, activeBatch, dateRosters, databaseAttendance]);

  // Selected Date Info
  const activeDateInfo = useMemo(() => {
    const found = scheduledSessionDates.find((s) => s.dateStr === sessionDate);
    if (found) return found;

    const d = new Date(sessionDate);
    const shortDayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const shortDay = shortDayNames[d.getDay()] || 'FRI';
    const status = getDateAttendanceStatus(sessionDate);

    return {
      dateStr: sessionDate,
      dayOfWeek: shortDay,
      dayNumber: d.getDate() || 13,
      monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: sessionDate === '2026-11-13',
      isFuture: sessionDate > '2026-11-13',
      isPast: sessionDate < '2026-11-13',
      status,
    };
  }, [scheduledSessionDates, sessionDate, activeBatch, dateRosters, databaseAttendance]);

  const isUpcomingDisabled = activeDateInfo.isFuture;

  // Month navigation
  const monthName = currentCalendarMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const handlePrevMonth = () => {
    setCurrentCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // 4. Resolve Current Students for Active Batch & Date
  const currentStudents = useMemo(() => {
    const key = `${activeBatch.batchId}__${sessionDate}`;

    // 1. In-memory date roster
    if (dateRosters[key] && dateRosters[key].length > 0) {
      return dateRosters[key];
    }

    // 2. LocalStorage date roster
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`isml_batch_attendance_${activeBatch.batchId}__${sessionDate}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}

    // 3. Check database attendance records for this batch & date
    const dbRecords = databaseAttendance.filter(
      (rec) =>
        rec.date === sessionDate &&
        (rec.batchName?.toLowerCase() === activeBatch.batchName?.toLowerCase() || rec.batchId === activeBatch.batchId)
    );

    if (dbRecords.length > 0) {
      return activeBatch.students.map((baseStd) => {
        const found = dbRecords.find((r) => r.studentId === baseStd.rollNo || r.studentName === baseStd.name);
        if (found) {
          return {
            ...baseStd,
            status: found.status as AttendanceState,
            checkInTime: found.status === 'ABSENT' || found.status === 'EXCUSED' ? '--:--' : '09:05 AM',
            remarks: found.remarks || 'Recorded in Database',
          };
        }
        return baseStd;
      });
    }

    // 4. Default: Base student roster with PENDING state
    return activeBatch.students.map((s) => ({
      ...s,
      status: 'PENDING' as AttendanceState,
      checkInTime: '--:--',
      remarks: activeDateInfo.isFuture ? 'Class Scheduled in Future' : 'Attendance Pending Submission',
    }));
  }, [activeBatch, sessionDate, dateRosters, databaseAttendance, activeDateInfo.isFuture]);

  // Set single student status
  const setStudentStatus = (studentId: string, newStatus: AttendanceState) => {
    if (isUpcomingDisabled) {
      showError('Cannot mark attendance for future upcoming dates! Please select today or a past scheduled date.');
      return;
    }

    const key = `${activeBatch.batchId}__${sessionDate}`;
    setDateRosters((prev) => {
      const currentList = prev[key] || currentStudents;
      return {
        ...prev,
        [key]: currentList.map((s) =>
          s.id === studentId
            ? {
                ...s,
                status: newStatus,
                checkInTime:
                  newStatus === 'ABSENT' || newStatus === 'EXCUSED'
                    ? '--:--'
                    : s.checkInTime === '--:--'
                    ? '09:05 AM'
                    : s.checkInTime,
                remarks: newStatus === 'EXCUSED' ? 'Leave Application Approved' : 'Marked by Faculty',
              }
            : s
        ),
      };
    });
  };

  // Bulk Actions
  const handleMarkAll = (status: AttendanceState) => {
    if (isUpcomingDisabled) {
      showError('Cannot mark attendance for future upcoming dates!');
      return;
    }

    const key = `${activeBatch.batchId}__${sessionDate}`;
    setDateRosters((prev) => ({
      ...prev,
      [key]: currentStudents.map((s) => ({
        ...s,
        status,
        checkInTime: status === 'ABSENT' || status === 'EXCUSED' ? '--:--' : '09:00 AM',
        remarks: `Marked ${status} by Faculty`,
      })),
    }));
    showInfo(`All students marked as ${status} for ${activeBatch.batchName} (${sessionDate}).`);
  };

  // Save & Finalize Attendance
  const handleSaveAttendance = async () => {
    if (isUpcomingDisabled) {
      showError('Cannot submit attendance for future upcoming dates!');
      return;
    }

    try {
      const updatedStudents = currentStudents.map((s) => ({
        ...s,
        status: (s.status === 'PENDING' ? 'PRESENT' : s.status) as AttendanceState,
        checkInTime: s.status === 'PENDING' || s.checkInTime === '--:--' ? '09:00 AM' : s.checkInTime,
        remarks: s.status === 'PENDING' ? 'Verified by Faculty Roll Call' : s.remarks,
      }));

      const key = `${activeBatch.batchId}__${sessionDate}`;
      setDateRosters((prev) => ({
        ...prev,
        [key]: updatedStudents,
      }));

      const recordsToSync = updatedStudents.map((s) => ({
        id: `att-${s.rollNo}-${sessionDate}`,
        studentId: s.rollNo,
        studentName: s.name,
        sessionTopic: `${activeCourse.code}: ${activeCourse.name} Live Lecture & Roll Call`,
        courseName: activeCourse.name,
        batchName: activeBatch.batchName,
        batchId: activeBatch.batchId,
        facultyName: currentFaculty.name,
        date: sessionDate,
        timeSlot: activeBatch.schedule || '09:00 AM - 10:30 AM',
        durationMins: 90,
        stayMins: s.status === 'PRESENT' ? 88 : s.status === 'LATE' ? 65 : 0,
        stayPercentage: s.status === 'PRESENT' ? 98 : s.status === 'LATE' ? 72 : 0,
        status: s.status,
        connectionStatus: s.status === 'PRESENT' ? 'VERIFIED_STABLE' : s.status === 'LATE' ? 'JOINED_LATE' : 'NO_CONNECTION',
        approvedBy: `${currentFaculty.name} (Tutor Roll Call)`,
      }));

      // 1. Sync to local database API
      await fetch('/api/portals/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_ROLL_CALL',
          records: recordsToSync,
        }),
      });

      // 2. Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`isml_batch_attendance_${activeBatch.batchId}__${sessionDate}`, JSON.stringify(updatedStudents));
        localStorage.setItem(`isml_batch_attendance_${activeBatch.batchId}`, JSON.stringify(updatedStudents));
        localStorage.setItem('isml_live_roll_call', JSON.stringify(recordsToSync));

        // Update database attendance cache in state
        setDatabaseAttendance((prev) => {
          const filtered = prev.filter(
            (it) => !(it.date === sessionDate && (it.batchName === activeBatch.batchName || it.batchId === activeBatch.batchId))
          );
          return [...recordsToSync, ...filtered];
        });

        // Broadcast cross-tab and cross-component realtime sync event
        window.dispatchEvent(
          new CustomEvent('isml-realtime-event', {
            detail: {
              type: 'ATTENDANCE_UPDATED',
              batchId: activeBatch.batchId,
              date: sessionDate,
              records: recordsToSync,
            },
          })
        );
        window.dispatchEvent(
          new CustomEvent('isml-live-attendance-updated', {
            detail: {
              batchId: activeBatch.batchId,
              batchName: activeBatch.batchName,
              date: sessionDate,
              students: updatedStudents,
            },
          })
        );
      }

      showSuccess(
        `✅ Attendance finalized & submitted for ${activeBatch.batchName} (${sessionDate})! Synced to student & parent portals.`
      );
    } catch (e) {
      console.warn('Error saving attendance:', e);
      showError('Failed to save attendance record.');
    }
  };

  // Metrics
  const totalCount = currentStudents.length;
  const presentCount = currentStudents.filter((s) => s.status === 'PRESENT').length;
  const absentCount = currentStudents.filter((s) => s.status === 'ABSENT').length;
  const lateCount = currentStudents.filter((s) => s.status === 'LATE').length;
  const excusedCount = currentStudents.filter((s) => s.status === 'EXCUSED').length;
  const pendingCount = currentStudents.filter((s) => s.status === 'PENDING').length;
  const isPendingAttendance = pendingCount > 0 && presentCount === 0 && absentCount === 0 && lateCount === 0;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  // Filtered students by search & status
  const filteredStudents = useMemo(() => {
    return currentStudents.filter((s) => {
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [currentStudents, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs
        items={[
          { label: 'Faculty Console', href: '/tutor/dashboard' },
          { label: 'Attendance Roll Call' },
        ]}
      />

      {/* ─── Page Header Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC]">
              {currentFaculty.primaryLanguage} Lead
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600">
              Interactive Calendar & Timetable Roll Call
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Daily Attendance & Student Roll Call
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full responsive calendar view, scheduled cohort timetable tracking, and official NAAC roll call records.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveAttendance}
            disabled={isUpcomingDisabled}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isUpcomingDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
          >
            {isUpcomingDisabled ? <Lock className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isUpcomingDisabled ? 'Upcoming (Locked)' : 'Finalize & Submit Roll Call'}</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {coursesData.map((crs) => {
            const isSelected = selectedCourseId === crs.id;
            const totalCourseStudents = crs.batches.reduce((acc, b) => acc + (b.students?.length || 0), 0);

            return (
              <button
                key={crs.id}
                onClick={() => setSelectedCourseId(crs.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isSelected
                    ? `${crs.pastelBg} border-[#0052CC] ring-2 ring-blue-500/20 shadow-md`
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs'
                }`}
              >
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

        {/* Batch Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableBatches.map((b) => {
            const isSelected = selectedBatchId === b.batchId;
            const bStudents = b.students || [];

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
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-[#0052CC] border border-blue-200 mt-1">
                    {b.scheduleDays.join(', ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 3: INTERACTIVE RESPONSIVE CALENDAR MATRIX ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        {/* Calendar Header with Mode Toggles and Month Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                Attendance Calendar for {activeBatch.batchName}
              </h3>
              <p className="text-[11px] text-slate-500">
                Click any scheduled date to inspect attendance, submit pending roll calls, or view past records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setCalendarViewMode('FULL_CALENDAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  calendarViewMode === 'FULL_CALENDAR'
                    ? 'bg-white text-[#0052CC] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Month Calendar</span>
              </button>
              <button
                onClick={() => setCalendarViewMode('SESSION_CAROUSEL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  calendarViewMode === 'SESSION_CAROUSEL'
                    ? 'bg-white text-[#0052CC] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Class Carousel</span>
              </button>
            </div>

            {/* Month Switcher */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
              <button
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 px-1 font-mono">{monthName}</span>
              <button
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs font-bold">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Marked & Verified</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Pending Roll Call</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span>Upcoming Class (Locked)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-slate-300"></span>
              <span className="text-slate-400 font-normal">Off Day / Free</span>
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Timetable Days: <strong>{activeBatch.scheduleDays.join(', ')}</strong>
          </div>
        </div>

        {/* MODE A: FULL RESPONSIVE MONTH CALENDAR GRID */}
        {calendarViewMode === 'FULL_CALENDAR' && (
          <div className="space-y-2">
            {/* Day Header Row */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 py-1">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {monthCalendarMatrix.map((cell) => {
                if (cell.isBlank) {
                  return <div key={cell.key} className="h-16 sm:h-20 bg-slate-50/30 rounded-xl" />;
                }

                const isSelected = sessionDate === cell.dateStr;
                const isScheduled = cell.isScheduledClass;

                let cellBg = 'bg-white hover:bg-slate-50 border-slate-200/80';
                let badge = null;

                if (isScheduled) {
                  if (cell.status === 'MARKED') {
                    cellBg = 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-300';
                    badge = (
                      <span className="inline-block px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Marked
                      </span>
                    );
                  } else if (cell.status === 'UPCOMING') {
                    cellBg = 'bg-slate-50/60 hover:bg-slate-100 border-slate-200';
                    badge = (
                      <span className="inline-block px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
                        Upcoming
                      </span>
                    );
                  } else {
                    cellBg = 'bg-amber-50/60 hover:bg-amber-100/60 border-amber-300';
                    badge = (
                      <span className="inline-block px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                        Pending
                      </span>
                    );
                  }
                } else {
                  cellBg = 'bg-slate-50/40 border-dashed border-slate-200/70 opacity-60 hover:opacity-100';
                }

                if (isSelected) {
                  cellBg = 'bg-blue-50/90 border-[#0052CC] ring-2 ring-blue-500/40 shadow-xs';
                }

                return (
                  <button
                    key={cell.key}
                    onClick={() => setSessionDate(cell.dateStr)}
                    className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${cellBg}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs sm:text-sm font-black ${isSelected ? 'text-[#0052CC]' : 'text-slate-800'}`}>
                        {cell.dayNumber}
                      </span>
                      {cell.isToday && (
                        <span className="px-1.5 py-0.2 bg-[#0052CC] text-white text-[8px] font-black rounded-full uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="w-full truncate">
                      {isScheduled ? (
                        badge
                      ) : (
                        <span className="text-[9px] text-slate-400 italic hidden sm:inline">No class</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE B: CLASS SESSION CAROUSEL STRIP */}
        {calendarViewMode === 'SESSION_CAROUSEL' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 pt-1">
            {scheduledSessionDates.map((session) => {
              const isSelected = sessionDate === session.dateStr;

              let badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
              let badgeText = 'Pending';
              if (session.status === 'MARKED') {
                badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                badgeText = 'Marked';
              } else if (session.status === 'UPCOMING') {
                badgeStyle = 'bg-slate-100 text-slate-500 border-slate-200';
                badgeText = 'Upcoming';
              }

              return (
                <button
                  key={session.dateStr}
                  onClick={() => setSessionDate(session.dateStr)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/90 border-[#0052CC] ring-2 ring-blue-500/30 shadow-xs'
                      : session.isFuture
                      ? 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {session.isToday && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#0052CC] text-white text-[8px] font-black rounded-full uppercase tracking-wider shadow-2xs">
                      Today
                    </span>
                  )}

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      {session.dayOfWeek}
                    </span>
                    <span className="text-base font-black text-slate-900 block mt-0.5">
                      {session.dayNumber} {session.monthShort}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block">
                      {session.dateStr}
                    </span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-100">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                      {badgeText}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── STEP 4: ATTENDANCE LEDGER & ROLL CALL TABLE ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        {/* Context Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center">
                4
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-[#0052CC]">
                {activeCourse.code} • {activeBatch.sectionCode}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {activeBatch.batchName} Ledger
              </h3>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {sessionDate} ({activeDateInfo.dayOfWeek})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Duty: <strong>{activeBatch.dutyRole}</strong> • Session: {activeBatch.schedule}
            </p>
          </div>

          {/* Date Info Badge / State */}
          <div className="flex items-center gap-2">
            {activeDateInfo.status === 'MARKED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Attendance Submitted & Verified</span>
              </span>
            ) : isUpcomingDisabled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Future Class (Marking Disabled)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Attendance Pending Submission</span>
              </span>
            )}
          </div>
        </div>

        {/* 4 Mild Pastel KPI Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">PRESENT LEARNERS</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-emerald-950">{presentCount}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isPendingAttendance ? 'text-amber-800 bg-amber-100' : 'text-emerald-700 bg-emerald-100'
              }`}>
                {isPendingAttendance ? 'Pending' : `${attendanceRate}%`}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">ABSENT</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-rose-950">{absentCount}</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                {isPendingAttendance ? 'Not Taken' : 'Unexcused'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">
              {isPendingAttendance ? 'PENDING ROLL CALL' : 'LATE CHECK-IN'}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-amber-950">
                {isPendingAttendance ? pendingCount : lateCount}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                {isPendingAttendance ? 'Pending' : '>10 mins'}
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

        {/* Notice for Future Date */}
        {isUpcomingDisabled && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="text-xs text-slate-600">
              <strong>Upcoming Scheduled Session:</strong> This class date ({sessionDate}) is in the future. Attendance marking controls are locked until the scheduled session day.
            </div>
          </div>
        )}

        {/* Quick Bulk Actions Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">Quick Mark:</span>
            <button
              onClick={() => handleMarkAll('PRESENT')}
              disabled={isUpcomingDisabled}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                isUpcomingDisabled
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 cursor-pointer'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              disabled={isUpcomingDisabled}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                isUpcomingDisabled
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-rose-100 hover:bg-rose-200 text-rose-900 cursor-pointer'
              }`}
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
              {pendingCount > 0 && <option value="PENDING">Pending ({pendingCount})</option>}
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
                <th className="py-3 px-4">Roll No & Campus</th>
                <th className="py-3 px-4">Overall Att. %</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4 text-center">Mark Status</th>
                <th className="py-3 px-4">Session Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No learners found matching this criteria.
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
                        {st.status === 'PENDING' && (
                          <span className="px-2.5 py-1 text-[11px] font-extrabold bg-amber-100 text-amber-800 rounded-lg shadow-2xs mr-1">
                            Pending
                          </span>
                        )}
                        <button
                          onClick={() => setStudentStatus(st.id, 'PRESENT')}
                          disabled={isUpcomingDisabled}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                            isUpcomingDisabled
                              ? 'opacity-50 cursor-not-allowed text-slate-400'
                              : st.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs cursor-pointer'
                              : 'text-slate-600 hover:text-emerald-700 cursor-pointer'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => setStudentStatus(st.id, 'LATE')}
                          disabled={isUpcomingDisabled}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                            isUpcomingDisabled
                              ? 'opacity-50 cursor-not-allowed text-slate-400'
                              : st.status === 'LATE'
                              ? 'bg-amber-500 text-slate-950 shadow-xs cursor-pointer'
                              : 'text-slate-600 hover:text-amber-700 cursor-pointer'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => setStudentStatus(st.id, 'ABSENT')}
                          disabled={isUpcomingDisabled}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                            isUpcomingDisabled
                              ? 'opacity-50 cursor-not-allowed text-slate-400'
                              : st.status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs cursor-pointer'
                              : 'text-slate-600 hover:text-rose-700 cursor-pointer'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => setStudentStatus(st.id, 'EXCUSED')}
                          disabled={isUpcomingDisabled}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                            isUpcomingDisabled
                              ? 'opacity-50 cursor-not-allowed text-slate-400'
                              : st.status === 'EXCUSED'
                              ? 'bg-blue-600 text-white shadow-xs cursor-pointer'
                              : 'text-slate-600 hover:text-blue-700 cursor-pointer'
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
            disabled={isUpcomingDisabled}
            className={`px-4 py-2 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 ${
              isUpcomingDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Finalize Attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
}

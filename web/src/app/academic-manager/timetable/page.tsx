// ============================================================================
// ISML COLLEGE LMS — ADVANCED ACADEMIC TIMETABLE SCHEDULER & CONFLICT ENGINE
// Features:
// 1. Weekly Matrix, Day-by-Day Agenda & Cyclic Rotation views
// 2. Real-time Conflict Detection: Trainer double-booking, Batch room overlap, Time clashes
// 3. One-off Single Day, Weekly Repeating & Cyclic Webinar Schedule modes
// 4. Integrated LiveKit / Google Meet Online Link Generator & Room Selector
// 5. Direct Inspection & Surveillance Modal integration
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Plus,
  Wifi,
  CalendarRange,
  Video,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Sparkles,
  RefreshCw,
  Repeat,
  Zap,
  Users,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  Calendar,
  Layers,
  Building2,
  SlidersHorizontal,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Edit2,
  GraduationCap,
  Eye,
  BookOpen,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { TimetableSlot } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import LiveMeetingInspectionModal, { ClassSessionData } from '@/components/academic-manager/LiveMeetingInspectionModal';
import { useCollege } from '@/context/CollegeContext';
import { academicApprovalStore } from '@/services/academicApprovalStore';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
type DayType = (typeof DAYS)[number];

const TIME_INTERVALS = [
  '08:30 AM - 10:00 AM',
  '10:00 AM - 11:30 AM',
  '11:45 AM - 01:15 PM',
  '02:00 PM - 03:30 PM',
  '04:00 PM - 05:30 PM',
  '06:00 PM - 07:30 PM',
  '07:30 PM - 09:00 PM',
];

export interface ExtendedTimetableSlot extends TimetableSlot {
  recurrenceType?: 'ONE_DAY' | 'WEEKLY' | 'CYCLIC_ROTATION';
  sessionFormat?: 'GROUP_WEBINAR' | 'ONE_ON_ONE_HUMAN_TUTOR';
  targetStudentName?: string;
  targetStudentRoll?: string;
  targetCollege?: string;
  oneOnOnePurpose?: string;
  specificDate?: string;
  cycleIntervalWeeks?: number;
  maxAttendees?: number;
  meetingPassword?: string;
}

export interface ConflictItem {
  type: 'TRAINER_CLASH' | 'BATCH_CLASH' | 'ROOM_CLASH';
  severity: 'HIGH' | 'MEDIUM';
  message: string;
  slot1: ExtendedTimetableSlot;
  slot2: ExtendedTimetableSlot;
}

export default function AcademicManagerTimetablePage() {
  const { showSuccess, showError, showWarning } = useToast();
  const { isSchoolMode, selectedCollegeId, isOverall } = useCollege();

  // Primary timetable list (backed strictly by authentic DB entities)
  const [timetable, setTimetable] = useState<ExtendedTimetableSlot[]>([]);
  const [liveStudentsList, setLiveStudentsList] = useState<any[]>([]);
  const [liveFacultyList, setLiveFacultyList] = useState<any[]>([]);
  const [liveCoursesList, setLiveCoursesList] = useState<any[]>([]);
  const [liveBatchesList, setLiveBatchesList] = useState<any[]>([]);

  // Fetch live timetable, live classes & registered students from DB on mount
  useEffect(() => {
    // 1. Fetch live timetable entries from DB route and pending proposals
    const loadTimetableData = async () => {
      try {
        const [ttRes, apprRes] = await Promise.all([
          fetch('/api/portals/timetable', { cache: 'no-store' }),
          fetch('/api/portals/approvals', { cache: 'no-store' }),
        ]);

        const ttJson = await ttRes.json().catch(() => ({ data: [] }));
        const apprJson = await apprRes.json().catch(() => ({ data: [] }));

        const serverData = Array.isArray(ttJson?.data) ? ttJson.data : Array.isArray(ttJson) ? ttJson : [];
        const approvalsData = Array.isArray(apprJson?.data) ? apprJson.data : [];

        // Extract draft slots from pending approvals
        const pendingApprovalSlots: any[] = [];
        approvalsData
          .filter((a: any) => (a.requestType === 'TIMETABLE_SLOT' || a.entityType === 'TIMETABLE') && (a.currentStatus === 'PENDING' || a.status === 'SUBMITTED'))
          .forEach((a: any) => {
            const slots = a.submittedPayload?.details?.slotsInstances || a.submittedPayload?.slotsInstances || a.details?.slotsInstances;
            if (Array.isArray(slots) && slots.length > 0) {
              slots.forEach((s: any) => pendingApprovalSlots.push({ ...s, status: 'PENDING_APPROVAL' }));
            } else {
              const p = a.submittedPayload?.details?.timetablePayload || a.submittedPayload?.timetablePayload || a.submittedPayload?.slotInstance;
              if (p) pendingApprovalSlots.push({ ...p, status: 'PENDING_APPROVAL' });
            }
          });

        // Also merge in-memory pending items
        academicApprovalStore
          .getItems()
          .filter((item) => (item.category === 'TIMETABLE_SLOT' || (item as any).entityType === 'TIMETABLE') && item.status === 'PENDING')
          .forEach((item) => {
            const slots = (item as any).details?.slotsInstances || (item as any).submittedPayload?.slotsInstances;
            if (Array.isArray(slots) && slots.length > 0) {
              slots.forEach((s: any) => pendingApprovalSlots.push({ ...s, status: 'PENDING_APPROVAL' }));
            } else {
              const p = item.details?.timetablePayload || (item as any).submittedPayload?.timetablePayload;
              if (p) pendingApprovalSlots.push({ ...p, status: 'PENDING_APPROVAL' });
            }
          });

        const merged = [...serverData];
        pendingApprovalSlots.forEach((pSlot: any) => {
          if (!merged.some((m) => m.id === pSlot.id)) {
            merged.push(pSlot);
          }
        });

        setTimetable(merged);
      } catch (err: any) {
        console.log('Notice: Timetable live DB fetch:', err?.message);
      }
    };

    loadTimetableData();

    // Subscribe to academicApprovalStore so that when a timetable proposal is approved or submitted, it immediately updates
    const unsubscribe = academicApprovalStore.subscribe(() => {
      loadTimetableData();
    });

    const handleRealtime = (e: any) => {
      if (e?.detail?.type === 'APPROVAL_REVIEWED' || e?.detail?.type === 'APPROVAL_SUBMITTED') {
        loadTimetableData();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('isml-realtime-event', handleRealtime);
    }

    // 3. Fetch real admitted students from database for 1:1 student dropdown selector
    fetch('/api/portals/students')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setLiveStudentsList(res.data);
          if (res.data.length > 0) {
            const first = res.data[0];
            setFormOneOnOneStudent(`${first.name} (${first.collegeName || 'Partner College'})`);
          }
        }
      })
      .catch(() => { });

    // 4. Fetch real assigned faculty from database
    fetch('/api/portals/faculty')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setLiveFacultyList(res.data);
          setFormFacultyName(res.data[0].name);
        }
      })
      .catch(() => { });

    // 5. Fetch genuine Courses from database
    fetch('/api/portals/courses')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setLiveCoursesList(res.data);
        }
      })
      .catch(() => { });

    // 6. Fetch genuine Batches from database
    fetch('/api/portals/batches')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setLiveBatchesList(res.data);
        }
      })
      .catch(() => { });

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('isml-realtime-event', handleRealtime);
      }
    };
  }, []);

  // Filter & View states
  const [activeTab, setActiveTab] = useState<'WEEKLY_MATRIX' | 'DAY_VIEW' | 'CYCLIC_ROTATION' | 'ONE_ON_ONE_HUMAN'>('WEEKLY_MATRIX');
  const [selectedDay, setSelectedDay] = useState<DayType>('MONDAY');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingSession, setInspectingSession] = useState<ClassSessionData | null>(null);
  const [viewingSlotRoster, setViewingSlotRoster] = useState<ExtendedTimetableSlot | null>(null);

  // Scheduler Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [sessionFormat, setSessionFormat] = useState<'GROUP_WEBINAR' | 'ONE_ON_ONE_HUMAN_TUTOR'>('GROUP_WEBINAR');
  const [formOneOnOneStudent, setFormOneOnOneStudent] = useState('');
  const [formOneOnOnePurpose, setFormOneOnOnePurpose] = useState('CEFR Speaking Drill & Phonetics Doubt Solving');
  const [scheduleMode, setScheduleMode] = useState<'ONE_DAY' | 'WEEKLY' | 'CYCLIC_ROTATION'>('WEEKLY');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [formSubjectName, setFormSubjectName] = useState('');
  const [formFacultyName, setFormFacultyName] = useState('Joy JK');
  const [formBatchName, setFormBatchName] = useState('');
  const [formDay, setFormDay] = useState<DayType>('MONDAY');
  const [formDays, setFormDays] = useState<DayType[]>(['MONDAY']);
  const [formTimeSlot, setFormTimeSlot] = useState(() => TIME_INTERVALS[1]);
  const [isCustomTimeSlot, setIsCustomTimeSlot] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('07:30 PM');
  const [customEndTime, setCustomEndTime] = useState('09:00 PM');
  const [formDate, setFormDate] = useState('2026-10-14');
  const [formCycleWeeks, setFormCycleWeeks] = useState(2);
  const [formMaxAttendees, setFormMaxAttendees] = useState(60);

  // Responsive Conflict Confirmation Modal State (replaces browser window.confirm)
  const [pendingConflictData, setPendingConflictData] = useState<{
    type: string;
    message: string;
    trainerName: string;
    timeSlot: string;
    day: string;
    cohort: string;
  } | null>(null);

  // Available batches filtered strictly by the selected Course
  const availableBatchesForCourse = useMemo(() => {
    if (!selectedCourseId) return [];
    const selectedCourse = liveCoursesList.find((c) => c.id === selectedCourseId);
    const targetCourseName = (selectedCourse?.name || selectedCourse?.title || formSubjectName || '').trim().toLowerCase();
    const targetCourseCode = (selectedCourse?.code || '').trim().toLowerCase();

    return liveBatchesList.filter((b) => {
      // 1. Direct Course ID match
      if (b.courseId === selectedCourseId || b.programId === selectedCourseId) return true;
      if (Array.isArray(b.courseIds) && b.courseIds.includes(selectedCourseId)) return true;

      // 2. Direct Course Name match
      if (b.courseName && b.courseName.trim().toLowerCase() === targetCourseName) return true;
      if (b.programName && b.programName.trim().toLowerCase() === targetCourseName) return true;
      if (Array.isArray(b.courseNames) && b.courseNames.some((cn: string) => cn?.trim().toLowerCase() === targetCourseName)) return true;

      // 3. Match code
      if (targetCourseCode && (b.courseCode?.trim().toLowerCase() === targetCourseCode || b.code?.toLowerCase().includes(targetCourseCode))) return true;

      return false;
    });
  }, [liveBatchesList, liveCoursesList, selectedCourseId, formSubjectName]);

  // Handle course selection: resets batch and auto-suggests subject name
  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setFormBatchName(''); // reset batch
    const selectedCourse = liveCoursesList.find((c) => c.id === courseId);
    if (selectedCourse) {
      setFormSubjectName(selectedCourse.title || selectedCourse.name);
      if (selectedCourse.faculty) {
        setFormFacultyName(selectedCourse.faculty);
      }
    }
  };

  // Auto-fetch Timing, Days, and Trainer configured during batch creation
  const handleBatchSelect = (batchName: string) => {
    setFormBatchName(batchName);
    const matchedBatch = liveBatchesList.find((b: any) => b.name === batchName);
    if (matchedBatch) {
      // 1. Auto-fetch Time Slot
      if (matchedBatch.timing || matchedBatch.batchTiming) {
        setFormTimeSlot(matchedBatch.timing || matchedBatch.batchTiming);
      }
      // 2. Auto-fetch Scheduled Days (Supports multiple days: MON, WED, FRI etc.)
      const batchScheduleDays: DayType[] = [];
      const daysArr = Array.isArray(matchedBatch.scheduleDays)
        ? matchedBatch.scheduleDays
        : typeof matchedBatch.days === 'string'
          ? matchedBatch.days.split(/[,/&]+/)
          : [];

      daysArr.forEach((dItem: string) => {
        const dUpper = String(dItem).toUpperCase().trim();
        if (dUpper.includes('MON') && !batchScheduleDays.includes('MONDAY')) batchScheduleDays.push('MONDAY');
        if (dUpper.includes('TUE') && !batchScheduleDays.includes('TUESDAY')) batchScheduleDays.push('TUESDAY');
        if (dUpper.includes('WED') && !batchScheduleDays.includes('WEDNESDAY')) batchScheduleDays.push('WEDNESDAY');
        if (dUpper.includes('THU') && !batchScheduleDays.includes('THURSDAY')) batchScheduleDays.push('THURSDAY');
        if (dUpper.includes('FRI') && !batchScheduleDays.includes('FRIDAY')) batchScheduleDays.push('FRIDAY');
        if (dUpper.includes('SAT') && !batchScheduleDays.includes('SATURDAY')) batchScheduleDays.push('SATURDAY');
      });

      if (batchScheduleDays.length > 0) {
        setFormDays(batchScheduleDays);
        setFormDay(batchScheduleDays[0]);
      } else if (matchedBatch.days || matchedBatch.scheduleDays) {
        const daysStr = String(matchedBatch.days || matchedBatch.scheduleDays[0]).toUpperCase();
        if (daysStr.includes('MON')) { setFormDay('MONDAY'); setFormDays(['MONDAY']); }
        else if (daysStr.includes('TUE')) { setFormDay('TUESDAY'); setFormDays(['TUESDAY']); }
        else if (daysStr.includes('WED')) { setFormDay('WEDNESDAY'); setFormDays(['WEDNESDAY']); }
        else if (daysStr.includes('THU')) { setFormDay('THURSDAY'); setFormDays(['THURSDAY']); }
        else if (daysStr.includes('FRI')) { setFormDay('FRIDAY'); setFormDays(['FRIDAY']); }
        else if (daysStr.includes('SAT')) { setFormDay('SATURDAY'); setFormDays(['SATURDAY']); }
      }
      // 3. Auto-fetch Assigned Trainer
      if (matchedBatch.assignedFacultyName) {
        setFormFacultyName(matchedBatch.assignedFacultyName);
      }
      // 4. Auto-fetch Enrolled Capacity
      if (matchedBatch.totalStudents || matchedBatch.studentsCount) {
        setFormMaxAttendees(matchedBatch.totalStudents || matchedBatch.studentsCount);
      }
    }
  };

  // Available Languages list for top selector
  const languageOptions = useMemo(() => {
    return ['ALL', 'French', 'German', 'Japanese', 'Korean', 'Spanish'];
  }, []);

  // Filtered timetable
  const filteredTimetable = useMemo(() => {
    return timetable.filter((slot) => {
      // School vs College type check
      const isSlotSchool = slot.batchName.toLowerCase().includes('school') ||
        slot.batchName.includes('Grade') ||
        slot.subjectName.toLowerCase().includes('school') ||
        slot.timeSlot.includes('Period');
      if (isSchoolMode && !isSlotSchool && timetable.some(t => t.batchName.toLowerCase().includes('school') || t.batchName.includes('Grade'))) {
        return false;
      }
      if (!isSchoolMode && isSlotSchool) {
        return false;
      }

      if (selectedLanguage !== 'ALL') {
        const matchSubject = slot.subjectName.toLowerCase().includes(selectedLanguage.toLowerCase());
        const matchBatch = slot.batchName.toLowerCase().includes(selectedLanguage.toLowerCase());
        if (!matchSubject && !matchBatch) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          slot.subjectName.toLowerCase().includes(q) ||
          slot.facultyName.toLowerCase().includes(q) ||
          slot.batchName.toLowerCase().includes(q) ||
          slot.timeSlot.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [timetable, selectedLanguage, searchQuery, isSchoolMode]);

  // ============================================================================
  // CONFLICT DETECTION ENGINE
  // Checks if:
  // 1. Same Trainer is scheduled at the same Day & TimeSlot across different cohorts
  // 2. Same Batch is assigned two overlapping webinars
  // ============================================================================
  const detectedConflicts = useMemo<ConflictItem[]>(() => {
    const conflicts: ConflictItem[] = [];

    for (let i = 0; i < filteredTimetable.length; i++) {
      for (let j = i + 1; j < filteredTimetable.length; j++) {
        const a = filteredTimetable[i];
        const b = filteredTimetable[j];

        // Same Day and TimeSlot
        if (a.day === b.day && a.timeSlot === b.timeSlot) {
          // Trainer Clash: Only if trainer is booked for TWO DIFFERENT BATCHES at same time
          if (
            a.facultyName.trim().toLowerCase() === b.facultyName.trim().toLowerCase() &&
            a.batchName.trim().toLowerCase() !== b.batchName.trim().toLowerCase()
          ) {
            conflicts.push({
              type: 'TRAINER_CLASH',
              severity: 'HIGH',
              message: `Trainer Conflict: "${a.facultyName}" is double-booked on ${a.day} (${a.timeSlot}) for both "${a.batchName}" and "${b.batchName}".`,
              slot1: a,
              slot2: b,
            });
          }
          // Batch Clash: Only if same batch has TWO DIFFERENT SUBJECTS at same time
          if (
            a.batchName.trim().toLowerCase() === b.batchName.trim().toLowerCase() &&
            a.subjectName.trim().toLowerCase() !== b.subjectName.trim().toLowerCase()
          ) {
            conflicts.push({
              type: 'BATCH_CLASH',
              severity: 'HIGH',
              message: `Batch Clashing: Cohort "${a.batchName}" has two simultaneous online sessions on ${a.day} (${a.timeSlot}).`,
              slot1: a,
              slot2: b,
            });
          }
        }
      }
    }

    return conflicts;
  }, [filteredTimetable]);

  // Form Live Conflict Warning Check
  const formValidationConflict = useMemo(() => {
    if (!isScheduleModalOpen) return null;

    // Filter out the slot being edited (if editing)
    const activeSlots = timetable.filter((s) => !editingSlotId || s.id !== editingSlotId);
    const targetDays = formDays.length > 0 ? formDays : [formDay];

    for (const d of targetDays) {
      // 1. Trainer Clash: Only conflict if trainer is scheduled with a DIFFERENT batch at the exact same day & time
      const trainerClash = activeSlots.find(
        (slot) => slot.day === d && slot.timeSlot === formTimeSlot &&
          slot.facultyName.trim().toLowerCase() === formFacultyName.trim().toLowerCase() &&
          slot.batchName.trim().toLowerCase() !== formBatchName.trim().toLowerCase()
      );
      if (trainerClash) {
        return {
          type: 'TRAINER_CLASH',
          message: `Trainer Conflict: ${formFacultyName} is already assigned on ${d} at ${formTimeSlot} for another cohort "${trainerClash.batchName}".`,
        };
      }

      // 2. Batch Clash: Only conflict if this cohort already has a DIFFERENT subject at the exact same day & time
      const batchClash = activeSlots.find(
        (slot) => slot.day === d && slot.timeSlot === formTimeSlot &&
          slot.batchName.trim().toLowerCase() === formBatchName.trim().toLowerCase() &&
          slot.subjectName.trim().toLowerCase() !== formSubjectName.trim().toLowerCase()
      );
      if (batchClash) {
        return {
          type: 'BATCH_CLASH',
          message: `Cohort Clashing Alert: "${formBatchName}" already has a different session "${batchClash.subjectName}" on ${d} at ${formTimeSlot}.`,
        };
      }
    }

    return null;
  }, [isScheduleModalOpen, timetable, editingSlotId, formDays, formDay, formTimeSlot, formFacultyName, formBatchName, formSubjectName]);

  // Quick Action: Auto-Resolve Conflict by shifting slot to next available hour
  const handleAutoResolveConflict = (conflict: ConflictItem) => {
    const targetSlot = conflict.slot2;
    const currentIdx = TIME_INTERVALS.indexOf(targetSlot.timeSlot);
    const nextSlot = TIME_INTERVALS[(currentIdx + 1) % TIME_INTERVALS.length];

    setTimetable((prev) =>
      prev.map((s) => (s.id === targetSlot.id ? { ...s, timeSlot: nextSlot } : s))
    );
    showSuccess(`Resolved: Moved "${targetSlot.subjectName}" to ${nextSlot}.`);
  };

  // Open modal in edit mode with pre-filled slot data
  const handleEditSlot = (slot: ExtendedTimetableSlot) => {
    setEditingSlotId(slot.id);
    setSessionFormat(slot.sessionFormat || 'GROUP_WEBINAR');
    setScheduleMode(slot.recurrenceType || 'WEEKLY');

    // 1. Precise Course Matching across ID, title, name, program, code
    const slotCleanSubject = slot.subjectName.replace(' (1-on-1 Human Tutoring)', '').trim();
    const matchedCourse = liveCoursesList.find((c) => {
      const cId = c.id;
      const cTitle = (c.title || c.name || '').trim().toLowerCase();
      const cCode = (c.code || '').trim().toLowerCase();
      const sSub = slotCleanSubject.toLowerCase();
      const sProg = (slot.program || '').trim().toLowerCase();
      const sCode = (slot.subjectCode || '').trim().toLowerCase();

      return (
        (cCode && sCode && cCode === sCode) ||
        (cTitle && sSub && (cTitle === sSub || sSub.includes(cTitle) || cTitle.includes(sSub))) ||
        (cTitle && sProg && (cTitle === sProg || sProg.includes(cTitle)))
      );
    });

    if (matchedCourse) {
      setSelectedCourseId(matchedCourse.id);
      setFormSubjectName(matchedCourse.name || matchedCourse.title || slotCleanSubject);
    } else {
      setFormSubjectName(slotCleanSubject);
      if (liveCoursesList.length > 0) {
        setSelectedCourseId(liveCoursesList[0].id);
      }
    }

    // 2. Pre-fill Batch Name & Faculty
    setFormBatchName(slot.batchName);
    setFormFacultyName(slot.facultyName || 'Joy JK');

    // 3. Pre-fill Days (Find all days this batch is scheduled for)
    const matchingDaySlots = timetable
      .filter((t) => t.batchName === slot.batchName && t.subjectName === slot.subjectName)
      .map((t) => t.day as DayType);

    if (matchingDaySlots.length > 0) {
      setFormDays(Array.from(new Set(matchingDaySlots)));
    } else {
      setFormDays([slot.day]);
    }
    setFormDay(slot.day);

    // 4. Pre-fill Time Slot
    setFormTimeSlot(slot.timeSlot);
    if (slot.timeSlot && slot.timeSlot.includes(' - ')) {
      const [s, e] = slot.timeSlot.split(' - ');
      setCustomStartTime(s.trim());
      setCustomEndTime(e.trim());
    }
    setIsCustomTimeSlot(!TIME_INTERVALS.includes(slot.timeSlot));

    // 5. Pre-fill Dates, Capacity & 1:1 specifics
    setFormDate(slot.specificDate || '2026-10-14');
    setFormCycleWeeks(slot.cycleIntervalWeeks || 2);
    setFormMaxAttendees(slot.maxAttendees || 10);
    if (slot.targetStudentName) {
      setFormOneOnOneStudent(slot.targetStudentName + (slot.targetCollege ? ` (${slot.targetCollege})` : ''));
    }
    if (slot.oneOnOnePurpose) {
      setFormOneOnOnePurpose(slot.oneOnOnePurpose);
    }
    setIsScheduleModalOpen(true);
  };

  // Actual session save committer with PostgreSQL persistence
  const commitScheduleSession = async () => {
    const isEdit = Boolean(editingSlotId);
    const newId = editingSlotId || `slot-${Date.now()}`;
    const generatedUrl = `https://live.isml.edu/live-class/isml-${newId}`;

    const isOneOnOne = sessionFormat === 'ONE_ON_ONE_HUMAN_TUTOR';
    const selectedBatch = liveBatchesList.find((b) => b.name === formBatchName);
    const selectedCourse = liveCoursesList.find((c) => c.id === selectedCourseId);
    const courseTitle = selectedCourse?.name || selectedCourse?.title || formSubjectName;
    const resolvedInstitutionId = selectedBatch?.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4';
    const resolvedInstitutionName = selectedBatch?.institutionName || 'The American College';

    const newSlot: ExtendedTimetableSlot = {
      id: newId,
      day: formDay,
      timeSlot: formTimeSlot,
      subjectName: isOneOnOne ? `${formSubjectName} (1-on-1 Human Tutoring)` : formSubjectName,
      subjectCode: selectedCourse?.code || formSubjectName.substring(0, 3).toUpperCase(),
      facultyName: formFacultyName,
      batchName: isOneOnOne ? `1:1 • ${formOneOnOneStudent}` : formBatchName,
      sessionFormat,
      targetStudentName: isOneOnOne ? formOneOnOneStudent.split('(')[0].trim() : undefined,
      targetCollege: isOneOnOne && formOneOnOneStudent.includes('(') ? formOneOnOneStudent.split('(')[1].replace(')', '').trim() : undefined,
      oneOnOnePurpose: isOneOnOne ? formOneOnOnePurpose : undefined,
      room: isOneOnOne ? '1:1 Private Human Clinic Studio' : 'Live Class Studio',
      deliveryMode: 'ONLINE',
      meetingUrl: generatedUrl,
      department: selectedBatch?.departmentName || 'Languages & Humanities',
      program: courseTitle,
      semester: 1,
      recurrenceType: scheduleMode,
      specificDate: formDate,
      cycleIntervalWeeks: formCycleWeeks,
      maxAttendees: isOneOnOne ? 1 : formMaxAttendees,
    };

    // If creating a new slot, submit a single consolidated Approval Request covering all selected days!
    if (!isEdit) {
      const targetDays = formDays.length > 0 ? formDays : [formDay];
      const targetDaysShort = targetDays.map((d) => d.slice(0, 3)).join(', ');

      const slotsInstances: ExtendedTimetableSlot[] = targetDays.map((dayItem, idx) => ({
        ...newSlot,
        id: `${newId}-${idx}`,
        day: dayItem,
      }));

      // Immediately add as pending/draft to local timetable so user sees it right away
      setTimetable((prev) => {
        const next = [...prev];
        slotsInstances.forEach((slotInstance) => {
          if (!next.some((s) => s.id === slotInstance.id)) {
            next.push(slotInstance as any);
          }
        });
        return next;
      });

      const singleApprovalId = `appr-tt-${Date.now()}`;
      const approvalItem = {
        id: singleApprovalId,
        category: 'TIMETABLE_SLOT',
        requestType: 'TIMETABLE_SLOT',
        entityType: 'TIMETABLE',
        module: 'Academic',
        title: `Timetable Schedule: ${courseTitle} (${targetDaysShort})`,
        description: `Proposed ${targetDays.join(', ')} (${newSlot.timeSlot}) for cohort "${newSlot.batchName}" taught by ${newSlot.facultyName} at ${resolvedInstitutionName}.`,
        courseCode: newSlot.subjectCode,
        courseName: courseTitle,
        batchName: newSlot.batchName,
        priority: 'HIGH',
        institutionId: resolvedInstitutionId,
        institutionName: resolvedInstitutionName,
        submittedBy: {
          name: 'Academic Coordinator',
          role: 'Academic Operations',
          avatar: '/avatars/default.png',
        },
        urgency: 'HIGH',
        details: {
          duration: newSlot.timeSlot,
          days: targetDays,
          daysFormatted: targetDaysShort,
          totalLearners: newSlot.maxAttendees,
          evidenceOrRemarks: `Delivery Mode: ${newSlot.deliveryMode} | Room: ${newSlot.room}`,
          slotsInstances,
          timetablePayload: newSlot,
        },
        submittedPayload: {
          slotsInstances,
          timetablePayload: newSlot,
          batchName: newSlot.batchName,
          courseName: courseTitle,
          facultyName: newSlot.facultyName,
          institutionId: resolvedInstitutionId,
          institutionName: resolvedInstitutionName,
          days: targetDays,
          daysFormatted: targetDaysShort,
          timeSlot: newSlot.timeSlot,
        },
      };

      // 1. Submit to local store
      academicApprovalStore.submit(approvalItem as any);

      // 2. Submit single consolidated approval request to Next.js API & Backend Express API
      (async () => {
        try {
          await fetch('/api/portals/approvals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(approvalItem),
          });
        } catch { }

        try {
          await fetch('https://ismllms-production.up.railway.app/api/portals/approvals/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(approvalItem),
          });
        } catch { }

        // 3. Dispatch realtime event for instant chime sound & table update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('isml-realtime-event', {
              detail: {
                type: 'APPROVAL_SUBMITTED',
                payload: approvalItem,
              },
            })
          );
        }
      })();

      setIsScheduleModalOpen(false);
      setEditingSlotId(null);
      setPendingConflictData(null);
      showSuccess(
        `Timetable schedule proposal for "${courseTitle}" (${targetDaysShort}) submitted for Super Admin approval!`
      );
      return;
    }

    // If Editing an existing approved slot:
    try {
      await fetch('/api/portals/timetable', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot),
      });

      // Also directly update corresponding allocation in realDbFacultyAllocations so Tutor Dashboard immediately reflects changes
      await fetch('/api/portals/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN',
          facultyName: newSlot.facultyName,
          batchName: newSlot.batchName,
          courseName: courseTitle,
          subjectName: newSlot.subjectName,
          scheduleSlots: [`${formDays.map((d) => d.slice(0, 3)).join(', ')} ${newSlot.timeSlot}`],
          institutionName: resolvedInstitutionName,
          institutionId: resolvedInstitutionId,
          tutorRole: 'LEAD_TRAINER',
        }),
      });

      // Dispatch realtime event so Tutor Dashboard auto-revalidates without needing a manual full reload
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('isml-realtime-event', {
            detail: {
              type: 'FACULTY_ASSIGNED',
              payload: newSlot,
            },
          })
        );
      }
    } catch (err) {
      console.error('Failed to sync timetable to DB:', err);
    }

    setTimetable((prev) => prev.map((s) => (s.id === newId ? newSlot : s)));
    setIsScheduleModalOpen(false);
    setEditingSlotId(null);
    setPendingConflictData(null);
    showSuccess(`Timetable slot for "${newSlot.subjectName}" updated successfully!`);
    showSuccess(
      isEdit
        ? `Timetable slot for "${newSlot.subjectName}" updated successfully!`
        : isOneOnOne
          ? `1-on-1 Human Teacher session scheduled with ${formOneOnOneStudent}!`
          : `Live Class successfully scheduled for "${formSubjectName}".`
    );
  };

  // Add Session Handler with Responsive Pop-up Trigger (No window.confirm!)
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    if (formValidationConflict) {
      setPendingConflictData({
        type: formValidationConflict.type,
        message: formValidationConflict.message,
        trainerName: formFacultyName,
        timeSlot: formTimeSlot,
        day: formDay,
        cohort: formBatchName,
      });
      return;
    }

    commitScheduleSession();
  };

  return (
    <div className="space-y-5 pb-10 font-sans">
      {/* Top Breadcrumbs & Campus Filter */}
      <Breadcrumbs items={[{ label: 'Scheduling & Attendance' }, { label: 'Online Timetable Hub' }]} />
      <CollegeFilterBar />

      {/* Main Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-[#0052CC] border border-blue-200 uppercase tracking-wider">
              Class Timetable Overview
            </span>
            {detectedConflicts.length > 0 ? (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {detectedConflicts.length} Time Clash{detectedConflicts.length > 1 ? 'es' : ''} Detected
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Zero Schedule Clashes
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-[#0052CC]" />
            <span>Class Timetable & Session Scheduler</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage weekly class schedules, recurring live classes, workshops, and faculty rosters with automatic time clash prevention.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setEditingSlotId(null);
              setIsScheduleModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Timetable Slot</span>
          </button>
        </div>
      </div>

      {/* CONFLICT SUMMARY BANNER (Shows only when conflicts exist) */}
      {detectedConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-300 shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  Schedule Clash Alert ({detectedConflicts.length})
                </h3>
                <p className="text-[11px] text-rose-700">
                  Multiple slots have trainer time clashes or overlapping batch meetings.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {detectedConflicts.map((c, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-rose-200 flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                    {c.type.replace('_', ' ')}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1.5 leading-snug">{c.message}</p>
                </div>
                <button
                  onClick={() => handleAutoResolveConflict(c)}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg shrink-0 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Auto-shift this session to next available time interval"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto Shift</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TABS & FILTERS BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold self-start md:self-center overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('WEEKLY_MATRIX')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'WEEKLY_MATRIX' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Timetable</span>
          </button>
          <button
            onClick={() => setActiveTab('DAY_VIEW')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'DAY_VIEW' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Single Day Agenda</span>
          </button>
          <button
            onClick={() => setActiveTab('CYCLIC_ROTATION')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'CYCLIC_ROTATION' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Cyclic Rotations</span>
          </button>
          <button
            onClick={() => setActiveTab('ONE_ON_ONE_HUMAN')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'ONE_ON_ONE_HUMAN' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-emerald-800 hover:bg-emerald-50'
              }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1:1 Human Teacher Sessions</span>
          </button>
        </div>

        {/* Right Search & Language Filtering */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Language filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'ALL' ? 'All Languages' : `${lang} Curriculum`}
                </option>
              ))}
            </select>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trainer, cohort, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. WEEKLY MATRIX VIEW                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'WEEKLY_MATRIX' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {DAYS.map((day) => {
            const daySlots = filteredTimetable.filter((s) => s.day === day);
            return (
              <div key={day} className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start hover:bg-slate-50/40 transition">
                {/* Day Marker */}
                <div className="w-36 shrink-0 space-y-1">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-[#0052CC] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80 inline-block">
                    {day}
                  </span>
                  <p className="text-[11px] text-slate-400 font-semibold pl-0.5">
                    {daySlots.length} Scheduled Slot{daySlots.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Slots Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  {daySlots.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center col-span-full">
                      No online slots scheduled for {day.toLowerCase()}. Click "+ Schedule Timetable Slot" to add one.
                    </div>
                  ) : (
                    daySlots.map((slot) => {
                      const meetLink = slot.meetingUrl || 'https://live.isml.edu/livekit-room/isml-live';
                      const isClashed = detectedConflicts.some(
                        (c) => c.slot1.id === slot.id || c.slot2.id === slot.id
                      );

                      return (
                        <div
                          key={slot.id}
                          className={`p-3.5 rounded-xl border transition-all shadow-2xs space-y-2.5 relative group bg-white ${isClashed
                            ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300'
                            : 'border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {slot.timeSlot}
                            </span>
                            <div className="flex items-center gap-1">
                              {/* Recurrence badge & Pending Draft badge */}
                              {(slot as any).status === 'PENDING_APPROVAL' ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                  Draft (Pending Approval)
                                </span>
                              ) : (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${slot.recurrenceType === 'CYCLIC_ROTATION'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : slot.recurrenceType === 'WEEKLY'
                                      ? 'bg-blue-50 text-[#0052CC] border-blue-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                >
                                  {slot.recurrenceType === 'CYCLIC_ROTATION'
                                    ? 'Cyclic'
                                    : slot.recurrenceType === 'WEEKLY'
                                      ? 'Weekly'
                                      : '1-Day'}
                                </span>
                              )}

                              {isClashed && (
                                <span className="p-0.5 rounded bg-rose-600 text-white" title="Conflict Alert">
                                  <AlertTriangle className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-[#0B2447] line-clamp-1">{slot.subjectName}</h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              Batch: <strong className="text-slate-700">{slot.batchName}</strong>
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 space-y-1">
                            <p className="truncate">
                              Trainer: <strong className="text-slate-800">{slot.facultyName}</strong>
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="inline-flex items-center gap-1 font-bold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 text-[10px]">
                                <Wifi className="w-2.5 h-2.5" />
                                <span>Interactive Studio</span>
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => setViewingSlotRoster(slot)}
                                  className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#0052CC] border border-indigo-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                  title="View Assigned Students & Tutors"
                                >
                                  <Eye className="w-3 h-3 text-[#0052CC]" />
                                  <span>View Roster</span>
                                </button>

                                <button
                                  onClick={() => handleEditSlot(slot)}
                                  className="p-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                                  title="Edit Timetable Slot"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={async () => {
                                    // Check if the live class session has been started by tutor
                                    try {
                                      const res = await fetch(`https://ismllms-production.up.railway.app/api/live-classes/${slot.id}`);
                                      const json = await res.json();
                                      const isLive = json?.data?.status === 'LIVE' || json?.data?.tutorJoined === true;
                                      if (!isLive) {
                                        showWarning(
                                          'Live class has not started yet by tutor. Please wait for the faculty to launch the live broadcast.',
                                          'Class Not Live Yet'
                                        );
                                        return;
                                      }
                                    } catch {
                                      showWarning(
                                        'Live class has not started yet by tutor. Please wait for the faculty to launch the live broadcast.',
                                        'Class Not Live Yet'
                                      );
                                      return;
                                    }

                                    setInspectingSession({
                                      id: slot.id,
                                      topic: slot.subjectName,
                                      subjectName: slot.subjectName,
                                      batchName: slot.batchName,
                                      batchCode: 'ONLINE-TIMETABLE',
                                      facultyName: slot.facultyName,
                                      date: slot.specificDate || 'Today',
                                      timeSlot: slot.timeSlot,
                                      status: 'LIVE_NOW',
                                      roomOrLink: meetLink,
                                      attendeesCount: slot.maxAttendees || 40,
                                    });
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-[#0052CC] hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                                  title="Inspect Online Classroom Session"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Inspect</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SINGLE DAY AGENDA VIEW                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'DAY_VIEW' && (
        <div className="space-y-4">
          {/* Day selection tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => {
              const count = filteredTimetable.filter((s) => s.day === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${selectedDay === day
                    ? 'bg-[#0052CC] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <span>{day}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedDay === day ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Agenda Timeline Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0B2447] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0052CC]" />
              <span>Full Day Chronological Timeline for {selectedDay}</span>
            </h3>

            <div className="space-y-3">
              {filteredTimetable.filter((s) => s.day === selectedDay).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No online classes scheduled for {selectedDay}.
                </div>
              ) : (
                filteredTimetable
                  .filter((s) => s.day === selectedDay)
                  .map((slot, idx) => (
                    <div
                      key={slot.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/90 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {slot.timeSlot}
                            </span>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {slot.recurrenceType?.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#0B2447] mt-1">{slot.subjectName}</h4>
                          <p className="text-[11px] text-slate-500">
                            Batch: {slot.batchName} • Trainer: <strong className="text-slate-700">{slot.facultyName}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => setViewingSlotRoster(slot)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#0052CC] border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          title="View Enrolled Students & Tutors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#0052CC]" />
                          <span>View Roster</span>
                        </button>
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-slate-200"
                          title="Edit Schedule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setInspectingSession({
                              id: slot.id,
                              topic: slot.subjectName,
                              subjectName: slot.subjectName,
                              batchName: slot.batchName,
                              batchCode: 'ONLINE-TIMETABLE',
                              facultyName: slot.facultyName,
                              date: slot.specificDate || 'Today',
                              timeSlot: slot.timeSlot,
                              status: 'LIVE_NOW',
                              roomOrLink: slot.meetingUrl || '',
                              attendeesCount: slot.maxAttendees || 40,
                            });
                          }}
                          className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join / Inspect</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CYCLIC ROTATION ROSTER VIEW                                            */}
      {/* ========================================================================= */}
      {activeTab === 'CYCLIC_ROTATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0B2447] flex items-center gap-2">
                <Repeat className="w-4 h-4 text-purple-600" />
                <span>Cyclic & Bi-Weekly Rotating Class Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Webinars that cycle automatically every 2 to 4 weeks (e.g. conversational practice drills, mock viva).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTimetable
              .filter((s) => s.recurrenceType === 'CYCLIC_ROTATION')
              .map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Cycle Interval: Every {slot.cycleIntervalWeeks || 2} Weeks
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {slot.day} • {slot.timeSlot}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{slot.subjectName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Target Batch: <strong className="text-slate-700">{slot.batchName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-xs">
                    <span className="text-[11px] text-slate-600">
                      Faculty: <strong className="text-slate-800">{slot.facultyName}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="p-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition cursor-pointer"
                        title="Edit Cyclic Schedule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setInspectingSession({
                            id: slot.id,
                            topic: slot.subjectName,
                            subjectName: slot.subjectName,
                            batchName: slot.batchName,
                            batchCode: 'CYCLIC-ROSTER',
                            facultyName: slot.facultyName,
                            date: slot.specificDate || 'Scheduled',
                            timeSlot: slot.timeSlot,
                            status: 'UPCOMING',
                            roomOrLink: slot.meetingUrl || '',
                            attendeesCount: slot.maxAttendees || 50,
                          });
                        }}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Video className="w-3 h-3" />
                        <span>Surveillance</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3B. TAB 4: 1-ON-1 HUMAN TEACHER SESSIONS VIEW                            */}
      {/* ========================================================================= */}
      {activeTab === 'ONE_ON_ONE_HUMAN' && (
        <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Personal Mentorship & Doubt Hub
                </span>
                <span className="text-xs font-bold text-slate-700">Dedicated Human Teacher Roster</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                Individual 1:1 Live Teaching Clinics
              </h3>
              <p className="text-xs text-slate-500">
                Private human teacher coaching sessions scheduled for individual students across partner colleges.
              </p>
            </div>

            <button
              onClick={() => {
                setSessionFormat('ONE_ON_ONE_HUMAN_TUTOR');
                setFormMaxAttendees(1);
                setIsScheduleModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Schedule 1:1 Human Session</span>
            </button>
          </div>

          {/* 1:1 Coaching Cards or Empty State */}
          {timetable.filter((slot) => slot.sessionFormat === 'ONE_ON_ONE_HUMAN_TUTOR' || slot.maxAttendees === 1).length === 0 ? (
            <div className="py-12 px-6 rounded-2xl border-2 border-dashed border-emerald-200/80 bg-emerald-50/20 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">No 1:1 Human Mentoring Sessions Scheduled</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  There are currently no active private 1-on-1 human coaching sessions in the database. Click "+ Schedule 1:1 Human Session" above to assign a dedicated teacher to any enrolled student.
                </p>
              </div>
              <button
                onClick={() => {
                  setSessionFormat('ONE_ON_ONE_HUMAN_TUTOR');
                  setFormMaxAttendees(1);
                  setIsScheduleModalOpen(true);
                }}
                className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule First 1:1 Session</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetable
                .filter((slot) => slot.sessionFormat === 'ONE_ON_ONE_HUMAN_TUTOR' || slot.maxAttendees === 1)
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3 relative hover:border-emerald-400 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          1:1 Human Coaching
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-700">
                          {slot.day} • {slot.timeSlot}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {slot.subjectName}
                      </h4>

                      {/* Student & College info */}
                      <div className="bg-white border border-emerald-100 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Target Student:</span>
                          <strong className="text-slate-900 font-bold">
                            {slot.targetStudentName || slot.batchName.replace('1:1 •', '').trim()}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Campus:</span>
                          <span className="font-semibold text-slate-700">
                            {slot.targetCollege || 'Partner College Campus'}
                          </span>
                        </div>
                        {slot.oneOnOnePurpose && (
                          <div className="border-t border-slate-100 pt-1.5 text-[11px] text-emerald-800 font-medium italic">
                            "{slot.oneOnOnePurpose}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Assigned Human Teacher:</span>
                        <span className="font-bold text-slate-900">{slot.facultyName}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className="p-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                          title="Edit 1:1 Session"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setInspectingSession({
                              id: slot.id,
                              topic: slot.subjectName,
                              subjectName: slot.subjectName,
                              batchName: slot.batchName,
                              batchCode: '1-ON-1-PRIVATE',
                              facultyName: slot.facultyName,
                              date: slot.specificDate || 'Active',
                              timeSlot: slot.timeSlot,
                              status: 'UPCOMING',
                              roomOrLink: slot.meetingUrl || '',
                              attendeesCount: 1,
                            });
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Live Studio</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCHEDULER RIGHT-SIDE DRAWER FORM (SLIDE-OVER PANEL)                    */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsScheduleModalOpen(false)}
          />

          {/* Right-Side Drawer Container */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <CalendarRange className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {editingSlotId ? 'Edit Timetable Schedule' : 'Schedule Live Class'}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-400 text-slate-950 uppercase tracking-wider">
                      {editingSlotId ? 'EDIT MODE' : 'LIVE CLASS ONLY'}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200 mt-0.5">
                    {editingSlotId ? 'Modify time slot, trainer, date or cohort settings' : 'Weekly, One-Day Workshop or Cyclic Rotation'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleCreateSchedule} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                {/* ⚡ Professional Clean Session Status Card (No raw links shown) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-200/80 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0052CC] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Video className="w-4 h-4 text-cyan-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#0B2447]">ISML Live WebRTC Studio</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Interactive whiteboard, HD video & surveillance auto-provisioned
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-full shrink-0">
                    System Ready
                  </span>
                </div>

                {/* ─── NEW: SESSION DELIVERY FORMAT SWITCH (BATCH WEBINAR vs 1-TO-1 HUMAN TEACHER) ─── */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Session Delivery Format <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSessionFormat('GROUP_WEBINAR');
                        setFormMaxAttendees(60);
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${sessionFormat === 'GROUP_WEBINAR'
                        ? 'border-[#0052CC] bg-blue-50/80 text-[#0052CC] ring-2 ring-[#0052CC] shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-extrabold text-xs">Batch Live Webinar</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Group broadcast across college cohorts</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSessionFormat('ONE_ON_ONE_HUMAN_TUTOR');
                        setFormMaxAttendees(1);
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${sessionFormat === 'ONE_ON_ONE_HUMAN_TUTOR'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-600 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-extrabold text-xs">1-on-1 Human Teacher</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Private dedicated student coaching</p>
                    </button>
                  </div>
                </div>

                {/* If 1-to-1 Human Session Selected: Student & Purpose Picker */}
                {sessionFormat === 'ONE_ON_ONE_HUMAN_TUTOR' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>1:1 Student Personal Mentoring Details</span>
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        Max Capacity: 1 Student
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Student & College *</label>
                        <select
                          value={formOneOnOneStudent}
                          onChange={(e) => setFormOneOnOneStudent(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                        >
                          {liveStudentsList.length > 0 ? (
                            liveStudentsList.map((stu) => (
                              <option
                                key={stu.id}
                                value={`${stu.name} (${stu.collegeName || 'Partner College'})`}
                              >
                                {stu.name} ({stu.collegeName || 'Partner College'} • {stu.studentId || stu.id.substring(0, 8)})
                              </option>
                            ))
                          ) : (
                            <option value="">No admitted students found in database</option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Human Tutoring Focus / Purpose *</label>
                        <input
                          type="text"
                          value={formOneOnOnePurpose}
                          onChange={(e) => setFormOneOnOnePurpose(e.target.value)}
                          placeholder="e.g. CEFR Speaking Drill & Phonetics Doubt Solving"
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Recurrence Mode Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Schedule Frequency <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleMode('WEEKLY')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${scheduleMode === 'WEEKLY'
                        ? 'border-[#0052CC] bg-blue-50 text-[#0052CC] ring-1 ring-blue-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                    >
                      Weekly Recurring
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode('ONE_DAY')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${scheduleMode === 'ONE_DAY'
                        ? 'border-[#0052CC] bg-blue-50 text-[#0052CC] ring-1 ring-blue-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                    >
                      One-Day Class
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode('CYCLIC_ROTATION')}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${scheduleMode === 'CYCLIC_ROTATION'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                    >
                      Cyclic Rotation
                    </button>
                  </div>
                </div>

                {/* ─── STEP 1: SELECT COURSE FIRST → THEN BATCH UNLOCKS ─── */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      1. Select Language Course <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => handleCourseSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl font-bold text-[#0052CC] outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer text-xs"
                      required
                    >
                      <option value="">-- Choose Course Track First --</option>
                      {liveCoursesList.map((c) => {
                        const courseName = c.name || c.title || c.code;
                        return (
                          <option key={c.id} value={c.id}>
                            {courseName} {c.code && courseName !== c.code ? `(${c.code})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        2. Select Student Batch Cohort <span className="text-rose-500">*</span>
                      </label>
                      {!selectedCourseId && (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Disabled (Select course above)
                        </span>
                      )}
                    </div>
                    <select
                      value={formBatchName}
                      disabled={!selectedCourseId}
                      onChange={(e) => handleBatchSelect(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl font-bold text-xs outline-none transition-all ${!selectedCourseId
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-100 cursor-pointer'
                        }`}
                      required
                    >
                      <option value="">
                        {!selectedCourseId ? '🔒 Select Course above to view batches' : '-- Choose Batch Cohort --'}
                      </option>
                      {/* In Edit mode, always ensure the slot's current batch is included even if course list is still resolving */}
                      {formBatchName && !availableBatchesForCourse.some((b) => b.name === formBatchName) && (
                        <option value={formBatchName}>
                          {formBatchName} (The American College)
                        </option>
                      )}
                      {availableBatchesForCourse.length > 0
                        ? availableBatchesForCourse.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name} ({b.institutionName || b.campusCode})
                          </option>
                        ))
                        : selectedCourseId && (
                          <option value="" disabled>
                            No active batches found for this course
                          </option>
                        )}
                    </select>
                    {formBatchName && (
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Batch schedule & faculty auto-linked</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned Trainer */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">Assigned Human Teacher / Trainer *</label>
                    <span className="text-[10px] text-slate-400 font-medium">Batch Assigned Faculty</span>
                  </div>
                  {liveFacultyList.length > 0 ? (
                    <select
                      value={formFacultyName}
                      onChange={(e) => setFormFacultyName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    >
                      {liveFacultyList.map((fac) => (
                        <option key={fac.id} value={fac.name}>
                          {fac.name} ({fac.primaryLanguage || 'Faculty'} • {fac.department || 'ISML'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formFacultyName}
                      onChange={(e) => setFormFacultyName(e.target.value)}
                      placeholder="e.g. Dr. Anandhakumar V."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  )}
                </div>

                {/* Day(s) & Time Slot */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Day(s) of Week <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {formDays.length > 0 ? `${formDays.length} day(s) selected` : 'Choose days'}
                      </span>
                    </div>

                    {/* Interactive Multi-Select Day Pills */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {DAYS.map((d) => {
                        const isSelected = formDays.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                if (formDays.length > 1) {
                                  const updated = formDays.filter((x) => x !== d);
                                  setFormDays(updated);
                                  setFormDay(updated[0]);
                                }
                              } else {
                                const updated = [...formDays, d];
                                setFormDays(updated);
                                setFormDay(d);
                              }
                            }}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${isSelected
                                ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                          >
                            {d.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">Class Time Slot *</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isCustomTimeSlot;
                            setIsCustomTimeSlot(next);
                            if (next) {
                              setFormTimeSlot(`${customStartTime} - ${customEndTime}`);
                            } else {
                              setFormTimeSlot(TIME_INTERVALS[0]);
                            }
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${isCustomTimeSlot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            }`}
                        >
                          {isCustomTimeSlot ? '✓ Custom Time Active' : '✏️ Custom Time'}
                        </button>
                        {!isCustomTimeSlot && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Preset Slots
                          </span>
                        )}
                      </div>
                    </div>

                    {!isCustomTimeSlot ? (
                      <select
                        value={formTimeSlot}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM_MANUAL') {
                            setIsCustomTimeSlot(true);
                            setFormTimeSlot(`${customStartTime} - ${customEndTime}`);
                          } else {
                            setFormTimeSlot(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
                      >
                        {!TIME_INTERVALS.includes(formTimeSlot) && (
                          <option value={formTimeSlot}>{formTimeSlot} (Active Slot)</option>
                        )}
                        {TIME_INTERVALS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                        <option value="CUSTOM_MANUAL">✏️ Enter Custom Start & End Time...</option>
                      </select>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-600 mb-1">Start Time</span>
                            <input
                              type="text"
                              value={customStartTime}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomStartTime(val);
                                setFormTimeSlot(`${val} - ${customEndTime}`);
                              }}
                              placeholder="07:30 PM"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-600 mb-1">End Time</span>
                            <input
                              type="text"
                              value={customEndTime}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomEndTime(val);
                                setFormTimeSlot(`${customStartTime} - ${val}`);
                              }}
                              placeholder="09:00 PM"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-blue-200/60">
                          <span className="text-slate-500 font-medium">Resulting Slot:</span>
                          <span className="font-mono font-black text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                            {formTimeSlot}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic options based on scheduleMode */}
                {scheduleMode === 'ONE_DAY' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Specific Live Class Date *</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                )}

                {scheduleMode === 'CYCLIC_ROTATION' && (
                  <div>
                    <label className="block text-[11px] font-bold text-purple-700 mb-1">
                      Cycle Repeat Interval (Weeks)
                    </label>
                    <select
                      value={formCycleWeeks}
                      onChange={(e) => setFormCycleWeeks(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl font-bold text-purple-900 outline-none cursor-pointer"
                    >
                      <option value={2}>Every 2 Weeks (Bi-Weekly Rotation)</option>
                      <option value={3}>Every 3 Weeks (Tri-Weekly Rotation)</option>
                      <option value={4}>Every 4 Weeks (Monthly Rotation)</option>
                    </select>
                  </div>
                )}

                {/* Max Students */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Maximum Live Attendees Limit
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={formMaxAttendees}
                    onChange={(e) => setFormMaxAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* REAL-TIME CONFLICT ENGINE WARNING CALLOUT */}
                {formValidationConflict && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[11px] block">{formValidationConflict.type.replace('_', ' ')}</span>
                      <p className="text-[10px] text-rose-700 leading-tight mt-0.5">
                        {formValidationConflict.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">
                  Direct Live Class room engine
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-cyan-300" />
                    <span>{editingSlotId ? 'Save Changes' : 'Confirm Schedule'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎬 Inspection Surveillance Modal */}
      {inspectingSession && (
        <LiveMeetingInspectionModal
          isOpen={!!inspectingSession}
          onClose={() => setInspectingSession(null)}
          session={inspectingSession}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. ENROLLED STUDENTS & ASSIGNED TUTORS ROSTER INSPECTION MODAL            */}
      {/* ========================================================================= */}
      {viewingSlotRoster && (() => {
        // Find matching batch
        const matchedBatch = liveBatchesList.find(
          (b) => b.name === viewingSlotRoster.batchName
        );

        // Find enrolled students for this batch or college
        const enrolledStudents = liveStudentsList.filter((s) => {
          if (s.batchName && s.batchName.toLowerCase() === viewingSlotRoster.batchName.toLowerCase()) return true;
          if (matchedBatch && s.tenantId === matchedBatch.institutionId) return true;
          return false;
        });

        // Fallback to top enrolled students if direct cohort tag empty
        const displayStudents = enrolledStudents.length > 0 ? enrolledStudents : liveStudentsList.slice(0, 10);

        // Assigned teaching faculty members
        const assignedFacultyList = liveFacultyList.filter((f) => {
          if (f.name === viewingSlotRoster.facultyName) return true;
          if (matchedBatch?.assignedFacultyName === f.name) return true;
          if (Array.isArray(matchedBatch?.assignedStaffNames) && matchedBatch.assignedStaffNames.some((n: string) => n.includes(f.name))) return true;
          return false;
        });

        // Additional standby / doubt solvers if any
        const staffNames = matchedBatch?.assignedStaffNames || [];

        return (
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
            <div
              className="fixed inset-0"
              onClick={() => setViewingSlotRoster(null)}
            />
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0B2447] via-[#0D3166] to-[#0052CC] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {viewingSlotRoster.subjectName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950 uppercase">
                        {viewingSlotRoster.day}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-0.5">
                      Batch: <strong className="text-white">{viewingSlotRoster.batchName}</strong> • {viewingSlotRoster.timeSlot}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingSlotRoster(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700">
                {/* ── Section 1: Assigned Teaching Staff / Tutors ── */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#0052CC]" />
                      <span>Assigned Faculty & Tutors</span>
                    </span>
                    <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {assignedFacultyList.length > 0 ? assignedFacultyList.length : 1} Staff Allocated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Primary Lead Faculty */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {viewingSlotRoster.facultyName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {viewingSlotRoster.facultyName}
                          </p>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-600 text-white uppercase">
                            Lead Faculty
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-800 font-medium truncate mt-0.5">
                          Assigned Studio Trainer
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active Broadcast Host</span>
                        </p>
                      </div>
                    </div>

                    {/* Support Tutors / Co-trainers if any */}
                    {staffNames.filter((n: string) => !n.includes(viewingSlotRoster.facultyName)).map((staffName: string, sIdx: number) => (
                      <div key={sIdx} className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {staffName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900 text-xs truncate">{staffName}</p>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-600 text-white uppercase">
                              Support Tutor
                            </span>
                          </div>
                          <p className="text-[11px] text-indigo-700 font-medium truncate mt-0.5">
                            Doubt Solving & Evaluation
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                            <span>Co-Trainer Roster</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Section 2: Enrolled Student Roster ── */}
                <div className="space-y-2.5 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>Enrolled Students for this Class Session</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {displayStudents.length} Students Active
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
                    <div className="grid grid-cols-12 bg-slate-50/90 text-slate-600 font-bold px-3.5 py-2 text-[11px] border-b border-slate-200">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Student Name & ID</div>
                      <div className="col-span-4">Institution / Campus</div>
                      <div className="col-span-2 text-right">Attendance</div>
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {displayStudents.map((stu: any, idx: number) => (
                        <div key={stu.studentId || idx} className="grid grid-cols-12 px-3.5 py-2.5 items-center hover:bg-slate-50/60 transition-colors">
                          <div className="col-span-1 font-mono text-[11px] text-slate-400">
                            {idx + 1}
                          </div>
                          <div className="col-span-5 pr-2">
                            <p className="font-bold text-slate-900 text-xs truncate">{stu.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{stu.studentId || stu.email}</p>
                          </div>
                          <div className="col-span-4 pr-2">
                            <span className="text-[11px] text-slate-700 truncate block">
                              🏛️ {stu.tenantName || stu.collegeName || 'The American College'}
                            </span>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {stu.attendancePercentage ? `${stu.attendancePercentage}%` : '96%'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500">
                  Target Classroom: <strong className="text-slate-800">{viewingSlotRoster.room || 'Live Online Studio'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setViewingSlotRoster(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Roster
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🚨 RESPONSIVE TIMETABLE CONFLICT CONFIRMATION POP-UP MODAL (Replaces browser alert) */}
      {pendingConflictData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-rose-50 via-amber-50/50 to-white border-b border-rose-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                    Schedule Overlap Detected
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Timetable Conflict Engine</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Trainer Double-Booking Warning
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {pendingConflictData.message}
              </p>

              {/* Clash Details Pill Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assigned Faculty:</span>
                  <span className="font-extrabold text-slate-900">{pendingConflictData.trainerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Day & Time Slot:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {pendingConflictData.day} • {pendingConflictData.timeSlot}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                  <span className="text-slate-500 font-medium">Target Cohort:</span>
                  <span className="font-bold text-slate-800">{pendingConflictData.cohort}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug text-[11px]">
                  <strong>System Notice:</strong> Proceeding will override the existing schedule. Students and faculty will receive instant timetable update notifications.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingConflictData(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-all cursor-pointer"
              >
                Cancel & Reschedule
              </button>
              <button
                type="button"
                onClick={commitScheduleSession}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Override & Save Anyway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

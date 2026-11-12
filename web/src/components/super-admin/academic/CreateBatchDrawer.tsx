// ============================================================================
// ISML COLLEGE LMS — CREATE / EDIT BATCH DRAWER
// Pure Course-Centric Batch Cohort Initialization:
// - Direct Course Selection (Select created course from dropdown/picker)
// - No College dropdown clutter (automatically bound to current campus scope)
// - Class Timing & Schedule Days configuration (Morning/Evening, Days of week)
// - Lead Faculty & Staff / Tutor assignment
// - Intake capacity & student allocation
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  X,
  Plus,
  Sparkles,
  Calendar,
  BookOpen,
  Users,
  Clock,
  UserCheck,
  CheckCircle2,
  Info,
  GraduationCap,
  School,
  Building2,
  Check,
  Search,
  UserPlus,
  ShieldCheck,
  HelpCircle,
  Lock,
  User,
} from 'lucide-react';
import { Batch, CourseSummary } from '@/types/rbac';
import { mockInstitutions, mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';
import { notificationStore } from '@/services/notificationStore';

interface CreateBatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: (newBatch: Batch) => void;
  editBatch?: Batch | null;
  onBatchUpdated?: (batch: Batch) => void;
}

const COLLEGE_PRESET_TIMINGS = [
  '07:00 AM – 08:30 AM (Early Morning)',
  '09:00 AM – 10:30 AM (Morning Intensive)',
  '11:30 AM – 01:00 PM (Mid-Day Session)',
  '02:00 PM – 03:30 PM (Afternoon Track)',
  '05:00 PM – 06:30 PM (Evening Fast-Track)',
  '07:00 PM – 08:30 PM (Night Professional)',
];

const SCHOOL_PRESET_TIMINGS = [
  '08:30 AM – 09:10 AM (Period 1 • 40m Cat 2)',
  '09:15 AM – 09:55 AM (Period 2 • 40m Cat 2)',
  '10:15 AM – 10:55 AM (Period 3 • 40m Cat 2)',
  '11:00 AM – 11:45 AM (Period 4 • 45m Cat 3)',
  '12:30 PM – 01:10 PM (Period 5 • 40m Cat 2)',
  '01:15 PM – 01:55 PM (Period 6 • 40m Cat 2)',
];

const PRESET_TIMINGS = COLLEGE_PRESET_TIMINGS;

const WEEK_DAYS = [
  { id: 'MON', label: 'Mon' },
  { id: 'TUE', label: 'Tue' },
  { id: 'WED', label: 'Wed' },
  { id: 'THU', label: 'Thu' },
  { id: 'FRI', label: 'Fri' },
  { id: 'SAT', label: 'Sat' },
  { id: 'SUN', label: 'Sun' },
];

const PRESET_STAFFS = [
  'Joy Jk',
  'Mme. Claire Fontaine',
  'Herr Wolfgang Meyer',
  'Sensei Kenji Takahashi',
  'Prof. Rajesh Raman',
  'Ms. Ananya Sharma (TA)',
  'Mr. Karthik Sundaram (TA)',
];

export default function CreateBatchDrawer({
  isOpen,
  onClose,
  onBatchCreated,
  editBatch,
  onBatchUpdated,
}: CreateBatchDrawerProps) {
  const { showSuccess, showError } = useToast();
  const { isSchoolMode, selectedCollegeId, institutions } = useCollege();

  // Active courses from API (direct from database)
  const [coursesList, setCoursesList] = useState<CourseSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const activePresetTimings = isSchoolMode ? SCHOOL_PRESET_TIMINGS : COLLEGE_PRESET_TIMINGS;
  const isEditMode = Boolean(editBatch);

  // Form states
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026–2027');
  const [admissionYear, setAdmissionYear] = useState(2026);
  const [graduationYear, setGraduationYear] = useState(2027);
  const [sectionsCount, setSectionsCount] = useState(1);
  const [studentsCount, setStudentsCount] = useState(isSchoolMode ? 35 : 40);
  const [status, setStatus] = useState<'ACTIVE' | 'GRADUATED' | 'INACTIVE' | 'DRAFT'>('ACTIVE');

  // Institution Scope Selection (School vs College vs Individual / Direct Students vs All)
  const [instCategory, setInstCategory] = useState<'ALL' | 'COLLEGE' | 'SCHOOL' | 'INDIVIDUAL'>('ALL');
  const [targetInstitutionId, setTargetInstitutionId] = useState<string>('ALL');

  // Real Database Students
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Real Database Faculty / Tutors
  const [availableFaculty, setAvailableFaculty] = useState<any[]>([]);
  const [leadFacultyId, setLeadFacultyId] = useState<string>('');
  const [substituteFacultyId, setSubstituteFacultyId] = useState<string>('');
  const [doubtFacultyId, setDoubtFacultyId] = useState<string>('');
  const [loadingFaculty, setLoadingFaculty] = useState(false);

  // Filter institutions based on Category
  const filteredInstitutionsList = useMemo(() => {
    if (instCategory === 'ALL' || instCategory === 'INDIVIDUAL') return institutions;
    if (instCategory === 'SCHOOL') {
      return institutions.filter((i) => i.type === 'SCHOOL' || i.name.toLowerCase().includes('school'));
    }
    return institutions.filter((i) => i.type !== 'SCHOOL' && !i.name.toLowerCase().includes('school'));
  }, [institutions, instCategory]);

  // Fetch real students matching institution / category
  useEffect(() => {
    if (!isOpen) return;
    setLoadingStudents(true);
    const instParam = targetInstitutionId !== 'ALL' ? `?collegeId=${encodeURIComponent(targetInstitutionId)}` : '';
    
    // Resilient student fetching
    const fetchStudents = async () => {
      try {
        let res;
        try {
          res = await fetch(`/api/portals/students${instParam}`);
          if (!res.ok) throw new Error();
        } catch {
          res = await fetch(`http://localhost:4000/api/portals/students${instParam}`);
        }
        const json = await res.json();
        let list = (json && json.status === 'success' && Array.isArray(json.data)) ? json.data : [];

        if (list.length === 0) {
          const fallbackStudents = require('@/lib/realDbStudents.json');
          if (Array.isArray(fallbackStudents)) {
            list = fallbackStudents.map((s: any, idx: number) => ({
              id: s.id || s.studentId || `std-${idx + 1}`,
              ...s,
            }));
          }
        }

        // Precise Filtering based on Category and Selected Institution Dropdown
        if (targetInstitutionId !== 'ALL') {
          list = list.filter((s: any) =>
            s.tenantId === targetInstitutionId ||
            s.collegeId === targetInstitutionId ||
            s.tenantCode === targetInstitutionId
          );
        } else if (instCategory === 'COLLEGE') {
          list = list.filter((s: any) =>
            s.tenantCode === 'AMER-COL' ||
            (s.tenantName && /american|college/i.test(s.tenantName))
          );
        } else if (instCategory === 'SCHOOL') {
          list = list.filter((s: any) =>
            s.tenantCode === 'SIVA-LIONS' ||
            (s.tenantName && /lion|siva|school/i.test(s.tenantName))
          );
        } else if (instCategory === 'INDIVIDUAL') {
          list = list.filter((s: any) =>
            s.enrollmentType === 'INDIVIDUAL' ||
            s.tenantCode === 'INDIVIDUAL' ||
            s.status === 'ACTIVE'
          );
        }

        setAvailableStudents(list);
        setSelectedStudentIds(list.map((s: any) => s.id));
      } catch {
        try {
          const fallbackStudents = require('@/lib/realDbStudents.json');
          if (Array.isArray(fallbackStudents)) {
            let data = fallbackStudents.map((s: any, idx: number) => ({
              id: s.id || s.studentId || `std-${idx + 1}`,
              ...s,
            }));
            if (targetInstitutionId !== 'ALL') {
              data = data.filter((s: any) => s.tenantId === targetInstitutionId || s.collegeId === targetInstitutionId);
            } else if (instCategory === 'COLLEGE') {
              data = data.filter((s: any) => s.tenantCode === 'AMER-COL');
            } else if (instCategory === 'SCHOOL') {
              data = data.filter((s: any) => s.tenantCode === 'SIVA-LIONS');
            }
            setAvailableStudents(data);
            setSelectedStudentIds(data.map((s: any) => s.id));
          }
        } catch {
          setAvailableStudents([]);
          setSelectedStudentIds([]);
        }
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [isOpen, targetInstitutionId, instCategory]);

  // Fetch real faculty / tutors based on institution
  useEffect(() => {
    if (!isOpen) return;
    setLoadingFaculty(true);
    const instParam = targetInstitutionId !== 'ALL' ? `?collegeId=${encodeURIComponent(targetInstitutionId)}` : '';
    
    const fetchFaculty = async () => {
      try {
        let res;
        try {
          res = await fetch(`/api/portals/faculty${instParam}`);
          if (!res.ok) throw new Error();
        } catch {
          res = await fetch(`http://localhost:4000/api/portals/faculty${instParam}`);
        }
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          setAvailableFaculty(json.data);
          if (!leadFacultyId) setLeadFacultyId(json.data[0].id);
          if (!substituteFacultyId && json.data.length > 1) setSubstituteFacultyId(json.data[1].id);
          if (!doubtFacultyId && json.data.length > 2) setDoubtFacultyId(json.data[2].id);
        } else {
          throw new Error();
        }
      } catch {
        try {
          const fallback = require('@/lib/realDbFaculty.json');
          if (Array.isArray(fallback) && fallback.length > 0) {
            setAvailableFaculty(fallback);
            if (!leadFacultyId) setLeadFacultyId(fallback[0].id);
            if (!substituteFacultyId && fallback.length > 1) setSubstituteFacultyId(fallback[1].id);
            if (!doubtFacultyId && fallback.length > 2) setDoubtFacultyId(fallback[2].id);
          }
        } catch {}
      } finally {
        setLoadingFaculty(false);
      }
    };
    fetchFaculty();
  }, [isOpen, targetInstitutionId]);

  // Toggle single student selection
  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  // Select all / Deselect all
  const selectAllStudents = () => {
    setSelectedStudentIds(availableStudents.map((s) => s.id));
  };
  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  // Filter students by search term
  const displayedStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return availableStudents;
    const q = studentSearchTerm.toLowerCase().trim();
    return availableStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.collegeName && s.collegeName.toLowerCase().includes(q))
    );
  }, [availableStudents, studentSearchTerm]);

  // Schedule & Timing
  const [isCustomTiming, setIsCustomTiming] = useState(false);
  const [batchTiming, setBatchTiming] = useState(() => activePresetTimings[0]);
  const [startTime, setStartTime] = useState(isSchoolMode ? '08:30' : '09:00');
  const [endTime, setEndTime] = useState(isSchoolMode ? '09:10' : '10:30');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [assignedFaculty, setAssignedFaculty] = useState(PRESET_STAFFS[0]);
  const [assignedStaffTutor, setAssignedStaffTutor] = useState(PRESET_STAFFS[5]);

  // Fetch live courses from API with resilient local route fallback
  useEffect(() => {
    async function loadCourses() {
      try {
        let res;
        try {
          res = await fetch('/api/portals/courses');
          if (!res.ok) throw new Error();
        } catch {
          res = await fetch('http://localhost:4000/api/portals/courses');
        }
        const json = await res.json();
        if (json?.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          setCoursesList(json.data);
          if (!selectedCourseId) {
            setSelectedCourseId(json.data[0].id);
          }
        } else {
          // Fallback to realDbCourses directly
          const fallback = require('@/lib/realDbCourses.json');
          if (Array.isArray(fallback) && fallback.length > 0) {
            setCoursesList(fallback as any);
            if (!selectedCourseId) {
              setSelectedCourseId(fallback[0].id);
            }
          }
        }
      } catch {
        const fallback = require('@/lib/realDbCourses.json');
        if (Array.isArray(fallback) && fallback.length > 0) {
          setCoursesList(fallback as any);
          if (!selectedCourseId) {
            setSelectedCourseId(fallback[0].id);
          }
        }
      }
    }
    loadCourses();
  }, [isOpen]);

  // Helper to format 24h "HH:MM" to "hh:mm AM/PM"
  const formatTimeSlot = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')} ${period}`;
  };

  const effectiveTiming = isCustomTiming
    ? `${formatTimeSlot(startTime)} – ${formatTimeSlot(endTime)} (Custom Slot)`
    : batchTiming;

  // Selected course object
  const selectedCourse = useMemo(() => {
    return coursesList.find((c) => c.id === selectedCourseId) || coursesList[0];
  }, [coursesList, selectedCourseId]);

  useEffect(() => {
    if (isOpen) {
      if (editBatch) {
        setName(editBatch.name);
        setAcademicYear(editBatch.academicYear || (editBatch.admissionYear ? `${editBatch.admissionYear}–${editBatch.graduationYear}` : '2026–2027'));
        setAdmissionYear(editBatch.admissionYear || 2026);
        setGraduationYear(editBatch.graduationYear || 2027);
        setSectionsCount(editBatch.sectionsCount || 1);
        setStudentsCount(editBatch.studentsCount || 40);
        setSelectedCourseId(editBatch.courseIds?.[0] || editBatch.programId || '');
        setStatus(editBatch.status as any);

        const existingTiming = editBatch.batchTiming || PRESET_TIMINGS[1];
        if (PRESET_TIMINGS.includes(existingTiming)) {
          setBatchTiming(existingTiming);
          setIsCustomTiming(false);
        } else {
          setIsCustomTiming(true);
          setBatchTiming(existingTiming);
        }

        setSelectedDays(editBatch.scheduleDays || ['MON', 'WED', 'FRI']);
        setAssignedFaculty(editBatch.assignedFacultyName || PRESET_STAFFS[0]);
        setAssignedStaffTutor(editBatch.assignedStaffNames?.[0] || PRESET_STAFFS[5]);
      } else {
        setName('');
        setAcademicYear('2026–2027');
        setAdmissionYear(2026);
        setGraduationYear(2027);
        setSectionsCount(1);
        setStudentsCount(40);
        setStatus('ACTIVE');
        setBatchTiming(PRESET_TIMINGS[1]);
        setIsCustomTiming(false);
        setStartTime('09:00');
        setEndTime('10:30');
        setSelectedDays(['MON', 'WED', 'FRI']);
        setAssignedFaculty(PRESET_STAFFS[0]);
        setAssignedStaffTutor(PRESET_STAFFS[5]);
      }
    }
  }, [isOpen, editBatch]);

  // Auto-fill batch title when course changes if not custom typed
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const crs = coursesList.find((c) => c.id === courseId);
    if (crs && (!name || name.includes('Cohort') || name.includes('Batch'))) {
      setName(`${crs.name} — Morning Cohort Alpha`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Please provide batch cohort title.');
      return;
    }
    if (!selectedCourseId && coursesList.length > 0) {
      showError('Please select a course for this batch.');
      return;
    }

    const matchedCourse = coursesList.find((c) => c.id === selectedCourseId);
    const courseName = matchedCourse?.name || 'Selected Course';
    const courseCode = matchedCourse?.code || 'CRS';

    const currentInst = institutions.find((i) => i.id === selectedCollegeId) || institutions[0] || mockInstitutions[0];

    const leadTutorObj = availableFaculty.find((f) => f.id === leadFacultyId) || availableFaculty[0];
    const subTutorObj = availableFaculty.find((f) => f.id === substituteFacultyId) || availableFaculty[1] || availableFaculty[0];
    const doubtTutorObj = availableFaculty.find((f) => f.id === doubtFacultyId) || availableFaculty[2] || availableFaculty[0];

    const leadFac = leadTutorObj?.name || selectedCourse?.facultyName || assignedFaculty || 'Lead Academic Faculty';
    const subFac = subTutorObj?.name || selectedCourse?.substituteTutors?.[0] || 'JK Faculty';
    const doubtFac = doubtTutorObj?.name || selectedCourse?.doubtSupportTutor || assignedStaffTutor || 'Prof. Antoine Martin';

    const assignedInst =
      targetInstitutionId !== 'ALL'
        ? institutions.find((i) => i.id === targetInstitutionId) || currentInst
        : currentInst;

    const assignedCount = selectedStudentIds.length > 0 ? selectedStudentIds.length : Number(studentsCount);

    if (isEditMode && editBatch) {
      const updatedBatch: Batch = {
        ...editBatch,
        institutionId: assignedInst.id,
        institutionName: assignedInst.name,
        programId: selectedCourseId,
        programName: courseName,
        departmentName: matchedCourse?.department || 'Foreign Languages & Linguistics',
        name: name.trim(),
        academicYear: academicYear.trim(),
        admissionYear: Number(admissionYear),
        graduationYear: Number(graduationYear),
        currentSemesterNumber: 1,
        sectionsCount: Number(sectionsCount),
        studentsCount: assignedCount,
        courseIds: [selectedCourseId],
        courseNames: [courseName],
        batchTiming: effectiveTiming,
        scheduleDays: selectedDays,
        assignedFacultyName: leadFac,
        assignedStaffNames: [doubtFac, subFac],
        status: editBatch.status,
      };
      if (onBatchUpdated) {
        onBatchUpdated(updatedBatch);
      }
      showSuccess(`Batch cohort "${updatedBatch.name}" updated successfully with ${assignedCount} students.`);
      onClose();
      return;
    }

    const newBatch: Batch = {
      id: `batch-${Date.now().toString().slice(-4)}`,
      code: `BAT-${courseCode}-${Date.now().toString().slice(-3)}`.toUpperCase(),
      institutionId: assignedInst.id,
      institutionName: assignedInst.name,
      programId: selectedCourseId,
      programName: courseName,
      departmentName: matchedCourse?.department || 'Foreign Languages & Linguistics',
      name: name.trim(),
      academicYear: academicYear.trim(),
      admissionYear: Number(admissionYear),
      graduationYear: Number(graduationYear),
      currentSemesterNumber: 1,
      sectionsCount: Number(sectionsCount),
      studentsCount: assignedCount,
      courseIds: [selectedCourseId],
      courseNames: [courseName],
      batchTiming: effectiveTiming,
      scheduleDays: selectedDays,
      assignedFacultyName: leadFac,
      assignedStaffNames: [doubtFac, subFac],
      status: 'DRAFT', // Default to DRAFT awaiting Super Admin authorization
      createdAt: new Date().toISOString(),
    };

    // 1. Persist batch to Centralized Local Next.js API & Backend
    const batchPayload = {
      id: newBatch.id,
      name: newBatch.name,
      code: newBatch.code,
      institutionId: newBatch.institutionId,
      institutionName: newBatch.institutionName,
      programId: newBatch.programId,
      programName: newBatch.programName,
      departmentName: newBatch.departmentName,
      academicYear: newBatch.academicYear,
      admissionYear: newBatch.admissionYear,
      graduationYear: newBatch.graduationYear,
      studentsCount: newBatch.studentsCount,
      courseId: selectedCourseId,
      courseIds: newBatch.courseIds,
      courseNames: newBatch.courseNames,
      batchTiming: newBatch.batchTiming,
      scheduleDays: newBatch.scheduleDays,
      assignedFacultyName: newBatch.assignedFacultyName,
      assignedStaffNames: newBatch.assignedStaffNames,
      leadFacultyId: leadTutorObj?.id || '',
      leadFacultyName: leadFac,
      substituteFacultyId: subTutorObj?.id || '',
      substituteFacultyName: subFac,
      doubtFacultyId: doubtTutorObj?.id || '',
      doubtFacultyName: doubtFac,
      studentIds: selectedStudentIds,
      status: 'DRAFT',
    };

    // Create Faculty Allocations for Tutors so they immediately reflect in Tutor Dashboard
    if (leadTutorObj) {
      fetch('/api/portals/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN',
          facultyId: leadTutorObj.id,
          facultyName: leadTutorObj.name,
          tutorRole: 'LEAD_TRAINER',
          institutionType: assignedInst.type || (instCategory === 'SCHOOL' ? 'SCHOOL' : 'COLLEGE'),
          institutionId: assignedInst.id,
          institutionName: assignedInst.name,
          courseId: selectedCourseId,
          courseName: courseName,
          subjectCode: courseCode,
          subjectName: courseName,
          batchId: newBatch.id,
          batchName: newBatch.name,
          languageFamily: 'FRENCH',
          scheduleSlots: [effectiveTiming],
        }),
      }).catch(() => null);
    }
    if (subTutorObj && subTutorObj.id !== leadTutorObj?.id) {
      fetch('/api/portals/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN',
          facultyId: subTutorObj.id,
          facultyName: subTutorObj.name,
          tutorRole: 'SUBSTITUTE_TUTOR',
          institutionType: assignedInst.type || (instCategory === 'SCHOOL' ? 'SCHOOL' : 'COLLEGE'),
          institutionId: assignedInst.id,
          institutionName: assignedInst.name,
          courseId: selectedCourseId,
          courseName: courseName,
          subjectCode: courseCode,
          subjectName: courseName,
          batchId: newBatch.id,
          batchName: newBatch.name,
          languageFamily: 'FRENCH',
          scheduleSlots: ['Standby / On-Call Coverage'],
        }),
      }).catch(() => null);
    }
    if (doubtTutorObj && doubtTutorObj.id !== leadTutorObj?.id) {
      fetch('/api/portals/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN',
          facultyId: doubtTutorObj.id,
          facultyName: doubtTutorObj.name,
          tutorRole: 'DOUBT_SOLVING_TUTOR',
          institutionType: assignedInst.type || (instCategory === 'SCHOOL' ? 'SCHOOL' : 'COLLEGE'),
          institutionId: assignedInst.id,
          institutionName: assignedInst.name,
          courseId: selectedCourseId,
          courseName: courseName,
          subjectCode: courseCode,
          subjectName: courseName,
          batchId: newBatch.id,
          batchName: newBatch.name,
          languageFamily: 'FRENCH',
          scheduleSlots: ['Doubt Support & 1-on-1 Sessions'],
        }),
      }).catch(() => null);
    }

    fetch('/api/portals/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchPayload),
    }).catch(() => null);

    fetch('http://localhost:4000/api/portals/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchPayload),
    }).catch(() => null);

    // 2. Submit approval request directly to Approval Center API (/api/portals/approvals)
    const approvalPayload = {
      id: `REQ-BAT-${newBatch.id.slice(0, 8)}`,
      requestType: 'BATCH_CREATION',
      module: 'Academic',
      title: `Batch Authorization: ${newBatch.name}`,
      description: `Cohort batch scheduled for live delivery with capacity ${newBatch.studentsCount} students for course ${courseName}.`,
      entityType: 'BATCH',
      entityId: newBatch.id,
      requestedByUserId: 'Academic Operations',
      priority: 'HIGH',
      institutionId: newBatch.institutionId,
      currentStatus: 'PENDING',
      submittedPayload: {
        batchId: newBatch.id,
        batchName: newBatch.name,
        batchCode: newBatch.code,
        courseName,
        institutionName: newBatch.institutionName,
        studentsCount: newBatch.studentsCount,
        batchTiming: newBatch.batchTiming,
        submittedBy: { name: 'Academic Manager', email: 'academics@isml.edu', role: 'Batch Coordinator' },
      },
    };

    fetch('/api/portals/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalPayload),
    }).catch(() => null);

    // 3. Dispatch Professional Live Notification to Super Admin Header Bell & Drawer
    try {
      notificationStore.addNotification({
        title: `Batch Authorization Request: ${newBatch.name}`,
        message: `New batch cohort "${newBatch.name}" created for ${courseName} at ${newBatch.institutionName}. Awaiting Super Admin approval.`,
        type: 'APPROVAL_REQUEST',
        category: 'URGENT',
        sourcePortal: 'Academic Desk',
        targetModule: 'BATCH',
        actionUrl: '/super-admin/approvals',
        institutionName: newBatch.institutionName,
        submittedBy: {
          name: 'Academic Manager',
          role: 'Academic Operations Lead',
        },
        metadata: {
          batchId: newBatch.id,
          batchName: newBatch.name,
          courseName,
        },
      });

      // Dispatch global window event for instant audio / bell pulse across UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('isml-realtime-event', {
            detail: {
              type: 'APPROVAL_SUBMITTED',
              payload: approvalPayload,
            },
          })
        );
      }
    } catch (e) {
      console.warn('Could not dispatch notification:', e);
    }

    onBatchCreated(newBatch);
    showSuccess(`Batch cohort "${newBatch.name}" created in DRAFT and submitted to Super Admin for approval.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300 border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Batch Cohort' : 'Create Batch Cohort'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Select course curriculum, timing & seat capacity
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* ─── 1. INSTITUTION TYPE & TARGET CAMPUS (School vs College First) ─── */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-[#0052CC]" />
                  <span>Target Institution Type <span className="text-rose-500">*</span></span>
                </label>

                {/* College vs School vs Individual Segmented Control */}
                <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setInstCategory('COLLEGE');
                      const col = institutions.find((i) => i.type !== 'SCHOOL' && !i.name.toLowerCase().includes('school')) || institutions[0];
                      if (col) setTargetInstitutionId(col.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      instCategory === 'COLLEGE'
                        ? 'bg-white text-[#0052CC] shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-3 h-3" />
                    <span>Colleges</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInstCategory('SCHOOL');
                      const sch = institutions.find((i) => i.type === 'SCHOOL' || i.name.toLowerCase().includes('school')) || institutions[0];
                      if (sch) setTargetInstitutionId(sch.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      instCategory === 'SCHOOL'
                        ? 'bg-white text-emerald-600 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <School className="w-3 h-3" />
                    <span>Schools</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInstCategory('INDIVIDUAL');
                      setTargetInstitutionId('ALL');
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      instCategory === 'INDIVIDUAL'
                        ? 'bg-white text-purple-700 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3 h-3 text-purple-600" />
                    <span>Individuals</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInstCategory('ALL');
                      setTargetInstitutionId('ALL');
                    }}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      instCategory === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Specific Campus / Scope Selector */}
              <div>
                <select
                  value={targetInstitutionId}
                  onChange={(e) => setTargetInstitutionId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC] shadow-2xs"
                >
                  {instCategory === 'INDIVIDUAL' ? (
                    <option value="ALL">👤 Direct Enrolled Individuals (Non-Institutional)</option>
                  ) : (
                    <option value="ALL">🏛️ Overall ({instCategory === 'ALL' ? 'All Institutions' : instCategory === 'COLLEGE' ? 'All Colleges' : 'All Schools'})</option>
                  )}
                  {filteredInstitutionsList.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.type === 'SCHOOL' ? '🏫' : '🎓'} {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ─── 2. SELECT COURSE CURRICULUM ─── */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Select Course Curriculum *</span>
              </label>

              {coursesList.length === 0 ? (
                <div className="p-3 bg-white rounded-xl border border-dashed border-amber-300 text-amber-800 text-xs">
                  <p className="font-bold">No courses available</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Please create a course first in Course Builder before creating a batch cohort.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="" disabled>-- Select Created Course --</option>
                    {coursesList.map((crs) => (
                      <option key={crs.id} value={crs.id}>
                        {crs.name}
                      </option>
                    ))}
                  </select>

                  {selectedCourse && (
                    <div className="flex items-center gap-2 text-[11px] text-blue-900 font-semibold bg-white/80 p-2 rounded-lg border border-blue-100">
                      <span className="font-mono px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                        {selectedCourse.code}
                      </span>
                      <span className="truncate">{selectedCourse.name}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-purple-700">{selectedCourse.duration || '90 Days'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── 3. Batch Cohort Title ─── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch Cohort Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. French A1 — Morning Cohort Alpha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            {/* ─── 3. CLASS TIMINGS & SCHEDULE DAYS ─── */}
            <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 to-blue-50/40 border border-indigo-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Class Timings & Schedule *</span>
                </label>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  {selectedDays.length} Days/Wk
                </span>
              </div>

              {/* Timing Mode Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Session Timing Slot
                  </label>
                  <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setIsCustomTiming(false)}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        !isCustomTiming ? 'bg-white text-indigo-900 shadow-2xs font-extrabold' : 'text-slate-600'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomTiming(true)}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        isCustomTiming ? 'bg-indigo-600 text-white shadow-2xs font-extrabold' : 'text-slate-600'
                      }`}
                    >
                      Custom Time
                    </button>
                  </div>
                </div>

                {!isCustomTiming ? (
                  <select
                    value={batchTiming}
                    onChange={(e) => setBatchTiming(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-500 outline-none shadow-2xs"
                  >
                    {activePresetTimings.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-indigo-200 shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Start Time</span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">End Time</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Day of Week Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Schedule Days
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {WEEK_DAYS.map((d) => {
                    const isSelected = selectedDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDay(d.id)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ─── 4. TUTOR & FACULTY ASSIGNMENT (Lead, Substitute, Doubt Solver) ─── */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">Faculty & Tutor Assignment</h3>
                    <p className="text-[11px] text-slate-500">Allocate verified teaching staff for this batch</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-100/80">
                  {availableFaculty.length} Available Staff
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Lead Native Trainer (Locked / Course-Bound) */}
                <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/90 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lead Faculty</span>
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 uppercase tracking-wide flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      Assigned
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={leadFacultyId}
                      disabled
                      aria-readonly="true"
                      className="w-full px-3 py-2 bg-slate-100/90 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-not-allowed opacity-90 shadow-2xs appearance-none"
                    >
                      {availableFaculty.map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name} ({fac.primaryLanguage || 'Native'})
                        </option>
                      ))}
                    </select>
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">Assigned lead faculty (locked for this curriculum).</p>
                </div>

                {/* 2. Substitute Tutor */}
                <div className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Substitute Tutor</span>
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 uppercase tracking-wide">
                      Standby
                    </span>
                  </div>
                  <select
                    value={substituteFacultyId}
                    onChange={(e) => setSubstituteFacultyId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="">-- No Standby Tutor --</option>
                    {availableFaculty.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.primaryLanguage || 'Standby'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 leading-tight">Emergency cover for unannounced leave.</p>
                </div>

                {/* 3. Doubt Clearance Tutor */}
                <div className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Doubt Solver</span>
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                      1-on-1 Q&A
                    </span>
                  </div>
                  <select
                    value={doubtFacultyId}
                    onChange={(e) => setDoubtFacultyId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="">-- No Doubt Tutor --</option>
                    {availableFaculty.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.primaryLanguage || 'Support'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 leading-tight">Conducts student doubt clearance clinic.</p>
                </div>
              </div>
            </div>

            {/* ─── 5. ENROLLED STUDENTS SELECTION (Directly from Chosen Campus) ─── */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">Student Enrollment Roster</h3>
                    <p className="text-[11px] text-slate-500">Pick eligible students admitted under this institution scope</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {selectedStudentIds.length} / {availableStudents.length} Selected
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200/80 transition-colors cursor-pointer"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllStudents}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      None
                    </button>
                  </div>
                </div>
              </div>

              {/* In-Roster Quick Institution Filter Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Filter By Institution / College
                  </label>
                  <select
                    value={targetInstitutionId}
                    onChange={(e) => setTargetInstitutionId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  >
                    <option value="ALL">🏛️ All Scope Students</option>
                    <option value="521323cd-00da-49a6-98ed-6b7918d181b4">🎓 The American College (AMER-COL)</option>
                    <option value="c37b62d5-6ca4-47cb-bed7-899ad75a3144">🏫 Sivakasi Lions Matriculation Higher Secondary School (SIVA-LIONS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Quick Search Student
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, roll ID..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Students Roster Picklist */}
              {loadingStudents ? (
                <div className="py-8 text-center text-xs text-slate-500 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Fetching enrolled students directory...
                </div>
              ) : displayedStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  No students found matching your criteria under this institution.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100/80 bg-slate-50/50 p-2 rounded-xl border border-slate-200/80">
                  {displayedStudents.map((stu) => {
                    const isSelected = selectedStudentIds.includes(stu.id);
                    const isSchoolStudent = stu.tenantCode?.includes('SIVA') || stu.tenantName?.toLowerCase().includes('school');
                    return (
                      <div
                        key={stu.id}
                        onClick={() => toggleStudent(stu.id)}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                            : 'bg-white border-transparent hover:border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox Icon */}
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {/* Student Details */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 leading-tight">
                                {stu.name}
                              </span>
                              <span className="text-[10px] font-mono font-medium text-slate-500 px-1.5 py-0.2 bg-slate-100 rounded">
                                {stu.studentId}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 truncate">
                              <span>{isSchoolStudent ? '🏫' : '🎓'}</span>
                              <span className="truncate">{stu.tenantName || stu.collegeName}</span>
                              {stu.email && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400 truncate">{stu.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isSelected
                                ? 'bg-blue-100/80 text-blue-800 border-blue-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isSelected ? 'Enrolled' : 'Available'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── 5. Admission Cycle & Student Capacity ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Academic Year *</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => {
                    const ay = e.target.value;
                    setAcademicYear(ay);
                    const years = ay.match(/\d{4}/g);
                    if (years && years.length >= 2) {
                      setAdmissionYear(Number(years[0]));
                      setGraduationYear(Number(years[1]));
                    }
                  }}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                >
                  <option value="2026–2027">2026–2027 (Current)</option>
                  <option value="2025–2026">2025–2026</option>
                  <option value="2027–2028">2027–2028</option>
                  <option value="2028–2029">2028–2029</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sections
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sectionsCount}
                  onChange={(e) => setSectionsCount(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Students Cap
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-800 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Batch will be submitted as <strong>DRAFT</strong> awaiting Super Admin authorization. Scheduled sessions: <strong>{effectiveTiming}</strong> ({selectedDays.join(', ')}).
              </span>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isEditMode ? 'Update Batch Cohort' : 'Create Batch Cohort'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

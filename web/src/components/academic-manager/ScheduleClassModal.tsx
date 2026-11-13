// ============================================================================
// ISML COLLEGE LMS — ADVANCED LIVE CLASS & TIMETABLE SCHEDULER MODAL
// Reusable scheduler form for Timetable and Live Classes pages
// Includes: Format (Batch Webinar vs 1:1), Recurrence, Course->Batch unlock, Day Multi-Select, Time Slots, Clash Checker
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  X,
  Plus,
  Sparkles,
  Users,
  Video,
  BookOpen,
  Wifi,
  ShieldCheck,
  Radio,
  Layers,
  GraduationCap,
  Copy,
  Check,
  Zap,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Repeat,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';
import { academicApprovalStore } from '@/services/academicApprovalStore';

export type DayType = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
export const DAYS: DayType[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const TIME_INTERVALS = [
  '08:00 AM - 09:30 AM',
  '09:00 AM - 10:30 AM',
  '09:30 AM - 11:00 AM',
  '11:00 AM - 12:30 PM',
  '11:30 AM - 01:00 PM',
  '02:00 PM - 03:30 PM',
  '03:30 PM - 05:00 PM',
  '05:00 PM - 06:30 PM',
  '06:30 PM - 08:00 PM',
  '06:30 PM - 09:00 PM',
  '08:00 PM - 09:30 PM',
];

interface ScheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduledSuccess?: () => void;
  initialSlot?: any;
}

export default function ScheduleClassModal({
  isOpen,
  onClose,
  onScheduledSuccess,
  initialSlot
}: ScheduleClassModalProps) {
  const { showSuccess, showError } = useToast();
  const { selectedCollegeId } = useCollege();

  // Data lists
  const [liveBatchesList, setLiveBatchesList] = useState<any[]>([]);
  const [liveCoursesList, setLiveCoursesList] = useState<any[]>([]);
  const [liveFacultyList, setLiveFacultyList] = useState<any[]>([]);
  const [liveStudentsList, setLiveStudentsList] = useState<any[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);

  // Form State
  const [sessionFormat, setSessionFormat] = useState<'GROUP_WEBINAR' | 'ONE_ON_ONE_HUMAN_TUTOR'>('GROUP_WEBINAR');
  const [formOneOnOneStudent, setFormOneOnOneStudent] = useState('');
  const [formOneOnOnePurpose, setFormOneOnOnePurpose] = useState('CEFR Speaking Drill & Phonetics Doubt Solving');
  const [scheduleMode, setScheduleMode] = useState<'ONE_DAY' | 'WEEKLY' | 'CYCLIC_ROTATION'>('WEEKLY');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [formSubjectName, setFormSubjectName] = useState('');
  const [formBatchName, setFormBatchName] = useState('');
  const [formFacultyName, setFormFacultyName] = useState('Joy JK');
  const [formDay, setFormDay] = useState<DayType>('MONDAY');
  const [formDays, setFormDays] = useState<DayType[]>(['MONDAY']);
  const [formTimeSlot, setFormTimeSlot] = useState(() => TIME_INTERVALS[1]);
  const [isCustomTimeSlot, setIsCustomTimeSlot] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('09:00 AM');
  const [customEndTime, setCustomEndTime] = useState('10:30 AM');
  const [formDate, setFormDate] = useState('2026-11-16');
  const [formCycleWeeks, setFormCycleWeeks] = useState(2);
  const [formMaxAttendees, setFormMaxAttendees] = useState(60);

  // Load Batches, Courses, Faculty, Students & Timetable
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/portals/batches')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setLiveBatchesList(res.data);
        }
      })
      .catch(() => {});

    fetch('/api/portals/courses')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setLiveCoursesList(res.data);
          if (!selectedCourseId && res.data.length > 0) {
            setSelectedCourseId(res.data[0].id);
            setFormSubjectName(res.data[0].name || res.data[0].title);
          }
        }
      })
      .catch(() => {});

    fetch('/api/portals/faculty')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setLiveFacultyList(res.data);
          if (res.data.length > 0) {
            setFormFacultyName(res.data[0].name);
          }
        }
      })
      .catch(() => {});

    fetch('/api/portals/students')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setLiveStudentsList(res.data);
          if (res.data.length > 0) {
            const first = res.data[0];
            setFormOneOnOneStudent(`${first.name} (${first.collegeName || 'The American College'})`);
          }
        }
      })
      .catch(() => {});

    fetch('/api/portals/timetable')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setTimetableSlots(res.data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Batches available for selected course
  const availableBatchesForCourse = useMemo(() => {
    if (!selectedCourseId) return [];
    const selectedCourse = liveCoursesList.find((c) => c.id === selectedCourseId);
    const targetCourseName = (selectedCourse?.name || selectedCourse?.title || formSubjectName || '').trim().toLowerCase();

    return liveBatchesList.filter((b) => {
      if (b.courseIds && b.courseIds.includes(selectedCourseId)) return true;
      if (b.programId && b.programId === selectedCourseId) return true;
      if (targetCourseName && b.courseNames && b.courseNames.some((c: string) => c.toLowerCase() === targetCourseName)) return true;
      if (targetCourseName && b.programName && b.programName.toLowerCase().includes(targetCourseName)) return true;
      return true; // Fallback display batches
    });
  }, [liveBatchesList, liveCoursesList, selectedCourseId, formSubjectName]);

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setFormBatchName('');
    const selectedCourse = liveCoursesList.find((c) => c.id === courseId);
    if (selectedCourse) {
      setFormSubjectName(selectedCourse.title || selectedCourse.name);
      if (selectedCourse.faculty) {
        setFormFacultyName(selectedCourse.faculty);
      }
    }
  };

  const handleBatchSelect = (batchName: string) => {
    setFormBatchName(batchName);
    const matchedBatch = liveBatchesList.find((b) => b.name === batchName);
    if (matchedBatch) {
      if (matchedBatch.assignedFacultyName || matchedBatch.leadFacultyName) {
        setFormFacultyName(matchedBatch.assignedFacultyName || matchedBatch.leadFacultyName);
      }
      if (matchedBatch.batchTiming || matchedBatch.timing) {
        const t = matchedBatch.batchTiming || matchedBatch.timing;
        if (TIME_INTERVALS.includes(t)) {
          setFormTimeSlot(t);
          setIsCustomTimeSlot(false);
        } else if (t.includes(' - ')) {
          setIsCustomTimeSlot(true);
          const [s, e] = t.split(' - ');
          setCustomStartTime(s.trim());
          setCustomEndTime(e.trim());
          setFormTimeSlot(t);
        }
      }
    }
  };

  // Clash Warning Checker
  const formValidationConflict = useMemo(() => {
    if (!formBatchName || !formTimeSlot || !formFacultyName) return null;
    const targetDays = formDays.length > 0 ? formDays : [formDay];

    for (const d of targetDays) {
      // 1. Trainer Clash
      const trainerClash = timetableSlots.find(
        (slot) => slot.day === d && slot.timeSlot === formTimeSlot &&
          slot.facultyName?.trim().toLowerCase() === formFacultyName.trim().toLowerCase() &&
          slot.batchName?.trim().toLowerCase() !== formBatchName.trim().toLowerCase()
      );
      if (trainerClash) {
        return {
          type: 'TRAINER_CLASH',
          message: `Trainer Conflict: ${formFacultyName} is already assigned on ${d} at ${formTimeSlot} for batch "${trainerClash.batchName}".`,
        };
      }

      // 2. Batch Clash
      const batchClash = timetableSlots.find(
        (slot) => slot.day === d && slot.timeSlot === formTimeSlot &&
          slot.batchName?.trim().toLowerCase() === formBatchName.trim().toLowerCase() &&
          slot.subjectName?.trim().toLowerCase() !== formSubjectName.trim().toLowerCase()
      );
      if (batchClash) {
        return {
          type: 'BATCH_CLASH',
          message: `Batch Conflict: "${formBatchName}" already has another session "${batchClash.subjectName}" on ${d} at ${formTimeSlot}.`,
        };
      }
    }
    return null;
  }, [timetableSlots, formDays, formDay, formTimeSlot, formFacultyName, formBatchName, formSubjectName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSubjectName) {
      showError('Please select a Course Track first.');
      return;
    }
    if (sessionFormat === 'GROUP_WEBINAR' && !formBatchName) {
      showError('Please choose a Batch Cohort.');
      return;
    }

    const newId = `slot-${Date.now()}`;
    const generatedUrl = `https://live.isml.edu/live-class/isml-${newId}`;
    const isOneOnOne = sessionFormat === 'ONE_ON_ONE_HUMAN_TUTOR';
    const selectedBatch = liveBatchesList.find((b) => b.name === formBatchName);
    const selectedCourse = liveCoursesList.find((c) => c.id === selectedCourseId);
    const courseTitle = selectedCourse?.name || selectedCourse?.title || formSubjectName;
    const resolvedInstitutionId = selectedBatch?.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4';
    const resolvedInstitutionName = selectedBatch?.institutionName || 'The American College';

    const targetDays = formDays.length > 0 ? formDays : [formDay];
    const targetDaysShort = targetDays.map((d) => d.slice(0, 3)).join(', ');

    const newSlot = {
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

    const slotsInstances = targetDays.map((dayItem, idx) => ({
      ...newSlot,
      id: `${newId}-${idx}`,
      day: dayItem,
    }));

    const approvalItem = {
      id: `appr-tt-${Date.now()}`,
      category: 'TIMETABLE_SLOT',
      requestType: 'TIMETABLE_SLOT',
      entityType: 'TIMETABLE',
      module: 'Academic',
      title: `Live Class Schedule: ${courseTitle} (${targetDaysShort})`,
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

    // 1. Submit to academic approval store
    academicApprovalStore.submit(approvalItem as any);

    // 2. Submit to backend approvals API
    try {
      await fetch('/api/portals/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalItem),
      });
    } catch {}

    // 3. Dispatch realtime event
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

    showSuccess(
      `Live Class session scheduled for ${newSlot.batchName} (${targetDaysShort} • ${newSlot.timeSlot})! Request routed to Super Admin for approval.`
    );

    onClose();
    if (onScheduledSuccess) {
      onScheduledSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[130] flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full flex flex-col overflow-hidden shadow-2xl border-l border-slate-200 font-sans animate-in slide-in-from-right duration-300">
        {/* Drawer Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0052CC] flex items-center justify-center font-bold shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0B2447]">
                Schedule Live Class & Online Webinar
              </h3>
              <p className="text-[11px] text-slate-500">
                100% Online interactive studio with automated clash verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Format Selection: Group Webinar vs 1:1 Human Teacher */}
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
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  sessionFormat === 'GROUP_WEBINAR'
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
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  sessionFormat === 'ONE_ON_ONE_HUMAN_TUTOR'
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

          {/* 1:1 Student Mentoring Details */}
          {sessionFormat === 'ONE_ON_ONE_HUMAN_TUTOR' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1:1 Student Personal Mentoring Details</span>
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  Max: 1 Student
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Student *</label>
                  <select
                    value={formOneOnOneStudent}
                    onChange={(e) => setFormOneOnOneStudent(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  >
                    {liveStudentsList.map((stu) => (
                      <option key={stu.id} value={`${stu.name} (${stu.collegeName || 'The American College'})`}>
                        {stu.name} ({stu.studentId || stu.id.substring(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Coaching Purpose *</label>
                  <input
                    type="text"
                    value={formOneOnOnePurpose}
                    onChange={(e) => setFormOneOnOnePurpose(e.target.value)}
                    placeholder="e.g. Speaking Drill & Doubt Solving"
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schedule Frequency Mode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Schedule Frequency <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScheduleMode('WEEKLY')}
                className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                  scheduleMode === 'WEEKLY'
                    ? 'border-[#0052CC] bg-blue-50 text-[#0052CC] ring-1 ring-blue-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                Weekly Recurring
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('ONE_DAY')}
                className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                  scheduleMode === 'ONE_DAY'
                    ? 'border-[#0052CC] bg-blue-50 text-[#0052CC] ring-1 ring-blue-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                One-Day Class
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('CYCLIC_ROTATION')}
                className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                  scheduleMode === 'CYCLIC_ROTATION'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                Cyclic Rotation
              </button>
            </div>
          </div>

          {/* 1. Select Course -> Unlocks Batches */}
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
                {liveCoursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.title || c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  2. Select Student Batch Cohort <span className="text-rose-500">*</span>
                </label>
                {!selectedCourseId && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Select course above first
                  </span>
                )}
              </div>
              <select
                value={formBatchName}
                disabled={!selectedCourseId}
                onChange={(e) => handleBatchSelect(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl font-bold text-xs outline-none transition-all ${
                  !selectedCourseId
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-100 cursor-pointer'
                }`}
                required
              >
                <option value="">
                  {!selectedCourseId ? '🔒 Select Course above to view batches' : '-- Choose Batch Cohort --'}
                </option>
                {availableBatchesForCourse.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.institutionName || b.campusCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Human Teacher */}
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
                    {fac.name} ({fac.primaryLanguage || 'Faculty Specialist'})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formFacultyName}
                onChange={(e) => setFormFacultyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none"
                required
              />
            )}
          </div>

          {/* Days of Week & Time Slot */}
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
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                        isSelected
                          ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCustomTimeSlot;
                    setIsCustomTimeSlot(next);
                    if (next) {
                      setFormTimeSlot(`${customStartTime} - ${customEndTime}`);
                    } else {
                      setFormTimeSlot(TIME_INTERVALS[1]);
                    }
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    isCustomTimeSlot
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {isCustomTimeSlot ? '✓ Custom Time Active' : '✏️ Custom Time'}
                </button>
              </div>

              {!isCustomTimeSlot ? (
                <select
                  value={formTimeSlot}
                  onChange={(e) => setFormTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {TIME_INTERVALS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
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
                        placeholder="09:00 AM"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none"
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
                        placeholder="10:30 AM"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* One-Day Date Picker */}
          {scheduleMode === 'ONE_DAY' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Specific Live Class Date *</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none"
                required
              />
            </div>
          )}

          {/* Cyclic Repeat Interval */}
          {scheduleMode === 'CYCLIC_ROTATION' && (
            <div>
              <label className="block text-[11px] font-bold text-purple-700 mb-1">Cycle Repeat Interval</label>
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

          {/* Maximum Live Attendees */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Maximum Live Attendees Limit</label>
            <input
              type="number"
              min={1}
              max={500}
              value={formMaxAttendees}
              onChange={(e) => setFormMaxAttendees(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none"
            />
          </div>

          {/* REAL-TIME CONFLICT WARNING */}
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

          {/* Footer CTA */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 -mx-5 -mb-5 mt-4">
            <span className="text-[11px] text-slate-500 font-medium">Direct LiveKit room engine</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-cyan-300" />
                <span>Confirm Schedule</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


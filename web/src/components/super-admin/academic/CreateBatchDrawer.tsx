// ============================================================================
// ISML COLLEGE LMS — CREATE / EDIT BATCH DRAWER
// Professional Cohort Initialization:
// - Removed strict academic degree program dependencies
// - Course-mapped batch cohort initialization
// - In-built Class Timing & Schedule Days configuration (Morning/Evening, Days of week)
// - Lead Faculty & Staff / Tutor assignment
// - Intake capacity & student allocation
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  Layers,
  X,
  Plus,
  Sparkles,
  Calendar,
  BookOpen,
  Users,
  Grid,
  Building2,
  Clock,
  UserCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Batch } from '@/types/rbac';
import { mockInstitutions, mockCourses, mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateBatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: (newBatch: Batch) => void;
  editBatch?: Batch | null;
  onBatchUpdated?: (batch: Batch) => void;
}

const PRESET_TIMINGS = [
  '07:00 AM – 08:30 AM (Early Morning)',
  '09:00 AM – 11:00 AM (Morning Session)',
  '11:30 AM – 01:00 PM (Mid-Day Session)',
  '02:00 PM – 04:00 PM (Afternoon Track)',
  '05:00 PM – 06:30 PM (Evening Fast-Track)',
  '07:00 PM – 08:30 PM (Night Professional)',
];

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
  'Dr. Anandhakumar V.',
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

  const isEditMode = Boolean(editBatch);

  const [institutionId, setInstitutionId] = useState(mockInstitutions[0]?.id || 'inst-01');
  const [institutionName, setInstitutionName] = useState(mockInstitutions[0]?.name || 'Loyola College');
  const [departmentName, setDepartmentName] = useState(mockDepartments[0]?.name || 'Department of Foreign Languages');
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026–2027');
  const [admissionYear, setAdmissionYear] = useState(2026);
  const [graduationYear, setGraduationYear] = useState(2027);
  const [sectionsCount, setSectionsCount] = useState(1);
  const [studentsCount, setStudentsCount] = useState(60);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'ACTIVE' | 'GRADUATED' | 'INACTIVE'>('ACTIVE');

  // Schedule & Timing
  const [isCustomTiming, setIsCustomTiming] = useState(false);
  const [batchTiming, setBatchTiming] = useState(PRESET_TIMINGS[1]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [assignedFaculty, setAssignedFaculty] = useState(PRESET_STAFFS[0]);
  const [assignedStaffTutor, setAssignedStaffTutor] = useState(PRESET_STAFFS[5]);

  // Filter courses available for selected institution
  const availableCourses = mockCourses.filter(
    (c) => !c.collegeId || c.collegeId === institutionId
  );

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

  useEffect(() => {
    if (isOpen) {
      if (editBatch) {
        setInstitutionId(editBatch.institutionId || mockInstitutions[0]?.id || 'inst-01');
        setInstitutionName(editBatch.institutionName || mockInstitutions[0]?.name || 'Loyola College');
        setDepartmentName(editBatch.departmentName || mockDepartments[0]?.name || 'Academic Department');
        setName(editBatch.name);
        setAcademicYear(editBatch.academicYear || (editBatch.admissionYear ? `${editBatch.admissionYear}–${editBatch.graduationYear}` : '2026–2027'));
        setAdmissionYear(editBatch.admissionYear || 2026);
        setGraduationYear(editBatch.graduationYear || 2027);
        setSectionsCount(editBatch.sectionsCount || 1);
        setStudentsCount(editBatch.studentsCount || 60);
        setSelectedCourseIds(editBatch.courseIds || []);
        setStatus(editBatch.status as 'ACTIVE' | 'GRADUATED' | 'INACTIVE');
        
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
        setInstitutionId(mockInstitutions[0]?.id || 'inst-01');
        setInstitutionName(mockInstitutions[0]?.name || 'Loyola College');
        setDepartmentName(mockDepartments[0]?.name || 'Department of Foreign Languages');
        setName(`Batch 2026 (Regular Track)`);
        setAcademicYear('2026–2027');
        setAdmissionYear(2026);
        setGraduationYear(2027);
        setSectionsCount(1);
        setStudentsCount(60);
        setSelectedCourseIds([]);
        setStatus('ACTIVE');
        setBatchTiming(PRESET_TIMINGS[1]);
        setIsCustomTiming(false);
        setStartTime('09:00');
        setEndTime('11:00');
        setSelectedDays(['MON', 'WED', 'FRI']);
        setAssignedFaculty(PRESET_STAFFS[0]);
        setAssignedStaffTutor(PRESET_STAFFS[5]);
      }
    }
  }, [isOpen, editBatch]);

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

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

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

    const matchedCourses = mockCourses.filter((c) => selectedCourseIds.includes(c.id));
    const courseNames = matchedCourses.map((c) => c.name);

    if (isEditMode && editBatch) {
      const updatedBatch: Batch = {
        ...editBatch,
        institutionId,
        institutionName,
        programId: 'course-track',
        programName: courseNames.length > 0 ? courseNames.slice(0, 2).join(' • ') : 'Course Cohort',
        departmentName,
        name: name.trim(),
        academicYear: academicYear.trim(),
        admissionYear: Number(admissionYear),
        graduationYear: Number(graduationYear),
        currentSemesterNumber: 1,
        sectionsCount: Number(sectionsCount),
        studentsCount: Number(studentsCount),
        courseIds: selectedCourseIds,
        courseNames,
        batchTiming: effectiveTiming,
        scheduleDays: selectedDays,
        assignedFacultyName: assignedFaculty,
        assignedStaffNames: [assignedStaffTutor],
        status,
      };
      if (onBatchUpdated) {
        onBatchUpdated(updatedBatch);
      }
      showSuccess(`Batch cohort "${updatedBatch.name}" updated successfully.`);
      onClose();
      return;
    }

    const newBatch: Batch = {
      id: `batch-${Date.now().toString().slice(-4)}`,
      institutionId,
      institutionName,
      programId: 'course-track',
      programName: courseNames.length > 0 ? courseNames.slice(0, 2).join(' • ') : 'Course Cohort',
      departmentName,
      name: name.trim(),
      academicYear: academicYear.trim(),
      admissionYear: Number(admissionYear),
      graduationYear: Number(graduationYear),
      currentSemesterNumber: 1,
      sectionsCount: Number(sectionsCount),
      studentsCount: Number(studentsCount),
      courseIds: selectedCourseIds,
      courseNames,
      batchTiming: effectiveTiming,
      scheduleDays: selectedDays,
      assignedFacultyName: assignedFaculty,
      assignedStaffNames: [assignedStaffTutor],
      status,
      createdAt: new Date().toISOString(),
    };

    onBatchCreated(newBatch);
    showSuccess(`Batch cohort "${newBatch.name}" created with scheduled timing.`);
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
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300 border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Course Batch Cohort' : 'Create Course Batch Cohort'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Course mapping, student intake capacity, daily timing & assigned faculty
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
            {/* Campus Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Affiliated Campus / College *</span>
              </label>
              <select
                value={institutionId}
                onChange={(e) => {
                  const id = e.target.value;
                  const inst = mockInstitutions.find((i) => i.id === id);
                  setInstitutionId(id);
                  if (inst) setInstitutionName(inst.name);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                {mockInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Cohort Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch Cohort Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. French A1 - Batch 2026 Morning Track"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>



            {/* ─── CLASS TIMINGS & SCHEDULE DAYS (Requested Feature) ─── */}
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
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none"
                  >
                    {PRESET_TIMINGS.map((slot) => (
                      <option key={slot} value={slot}>
                        ⏰ {slot}
                      </option>
                    ))}
                  </select>
                ) : (
                  /* Custom Time Range Pickers */
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0052CC] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0052CC] outline-none"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-indigo-700 font-bold flex items-center gap-1.5 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Configured: {formatTimeSlot(startTime)} to {formatTimeSlot(endTime)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Days of Week Pills */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Scheduled Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {WEEK_DAYS.map((d) => {
                    const isSelected = selectedDays.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleDay(d.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

            {/* ─── INCHARGE FACULTY & STAFF TUTOR ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lead Faculty</span>
                </label>
                <select
                  value={assignedFaculty}
                  onChange={(e) => setAssignedFaculty(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                >
                  {PRESET_STAFFS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Doubt Tutor / TA</span>
                </label>
                <select
                  value={assignedStaffTutor}
                  onChange={(e) => setAssignedStaffTutor(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                >
                  {PRESET_STAFFS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Admission Cycle & Student Capacity */}
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
                    // Automatically sync admission & graduation year if standard format
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

            {/* ─── MAP ENROLLED COURSES (Course Centric Mapping) ─── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Map Teaching Courses ({selectedCourseIds.length} Selected)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Select curricula</span>
              </div>
              <div className="border border-slate-200 rounded-2xl bg-slate-50/70 p-2.5 max-h-44 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {availableCourses.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    No courses found under this campus.
                  </p>
                ) : (
                  availableCourses.map((crs) => {
                    const isChecked = selectedCourseIds.includes(crs.id);
                    return (
                      <label
                        key={crs.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors pt-2 ${
                          isChecked ? 'bg-indigo-50/70 border border-indigo-200/80' : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCourseSelection(crs.id)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 truncate">{crs.name}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                              {crs.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{crs.department}</span>
                            <span>•</span>
                            <span>{crs.facultyName}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Lifecycle Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'GRADUATED' | 'INACTIVE')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="ACTIVE">ACTIVE (In Session)</option>
                <option value="GRADUATED">GRADUATED (Alumni)</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-800 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Students enrolled in this cohort will attend scheduled sessions during <strong>{batchTiming}</strong> ({selectedDays.join(', ')}).
              </span>
            </div>

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
                <span>{isEditMode ? 'Update Batch Cohort' : 'Save Batch Cohort'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

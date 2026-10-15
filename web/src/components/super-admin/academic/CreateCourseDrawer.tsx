// ============================================================================
// ISML COLLEGE LMS — CREATE / EDIT COURSE SLIDE-OVER DRAWER
// Duration & Days-Based Course Delivery (3 Months, 6 Months, 1 Year, or Custom Days)
// Primary Faculty Incharge, Substitute Tutors & Doubt Resolution Tutors
// Pure Course Creation — Batches removed, Fees managed in Finance module
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  X,
  IndianRupee,
  GraduationCap,
  Sparkles,
  Users,
  Award,
  Layers,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  UserCheck,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { CourseSummary } from '@/types/rbac';
import { mockDepartments, mockInstitutions } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateCourseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (newCourse: CourseSummary) => void;
  editCourse?: CourseSummary | null;
  onCourseUpdated?: (course: CourseSummary) => void;
}

const PRESET_TUTORS = [
  'Dr. Anandhakumar V.',
  'Mme. Claire Fontaine',
  'Herr Wolfgang Meyer',
  'Sensei Kenji Takahashi',
  'Prof. Rajesh Raman',
  'Ms. Ananya Sharma (TA)',
  'Mr. Karthik Sundaram (TA)',
  'Dr. Priya Subramanian',
];

export default function CreateCourseDrawer({
  isOpen,
  onClose,
  onCourseCreated,
  editCourse,
  onCourseUpdated,
}: CreateCourseDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editCourse);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [collegeId, setCollegeId] = useState(mockInstitutions[0]?.id || 'inst-01');
  const [collegeName, setCollegeName] = useState(mockInstitutions[0]?.name || 'Loyola College');
  const [department, setDepartment] = useState(mockDepartments[0].name);
  const [academicYear, setAcademicYear] = useState('2026–2027');

  // Faculty Leads & Substitute Support Tutors
  const [primaryFaculty, setPrimaryFaculty] = useState('Dr. Anandhakumar V.');
  const [substituteTutors, setSubstituteTutors] = useState<string[]>(['Ms. Ananya Sharma (TA)']);
  const [doubtSupportTutor, setDoubtSupportTutor] = useState('Mr. Karthik Sundaram (TA)');
  const [newSubTutorInput, setNewSubTutorInput] = useState('');

  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  // Duration & Day Count Configuration (Replacing strict Semester Term)
  // Options: 3_MONTHS (90 days), 6_MONTHS (180 days), 1_YEAR (365 days), CUSTOM
  const [durationType, setDurationType] = useState<'3_MONTHS' | '6_MONTHS' | '1_YEAR' | 'CUSTOM'>('3_MONTHS');
  const [customDays, setCustomDays] = useState<number>(45);

  // Computed days count & label
  const effectiveDays = useMemo(() => {
    switch (durationType) {
      case '3_MONTHS':
        return 90;
      case '6_MONTHS':
        return 180;
      case '1_YEAR':
        return 365;
      case 'CUSTOM':
        return customDays || 30;
      default:
        return 90;
    }
  }, [durationType, customDays]);

  const durationLabel = useMemo(() => {
    switch (durationType) {
      case '3_MONTHS':
        return '3 Months (90 Days Fast-Track)';
      case '6_MONTHS':
        return '6 Months (180 Days Career Track)';
      case '1_YEAR':
        return '1 Year (365 Days Professional Mastery)';
      case 'CUSTOM':
        return `${effectiveDays} Days (Custom Track)`;
      default:
        return `${effectiveDays} Days`;
    }
  }, [durationType, effectiveDays]);

  useEffect(() => {
    if (isOpen) {
      if (editCourse) {
        setName(editCourse.name);
        setCode(editCourse.code);
        setCollegeId(editCourse.collegeId || mockInstitutions[0]?.id || 'inst-01');
        setCollegeName(editCourse.collegeName || mockInstitutions[0]?.name || 'Loyola College');
        setDepartment(editCourse.department);
        setAcademicYear(editCourse.academicYear || '2026–2027');
        setPrimaryFaculty(editCourse.facultyName || 'Dr. Anandhakumar V.');
        setSubstituteTutors(editCourse.substituteTutors || ['Ms. Ananya Sharma (TA)']);
        setDoubtSupportTutor(editCourse.doubtSupportTutor || 'Mr. Karthik Sundaram (TA)');
        setStatus(editCourse.status as 'PUBLISHED' | 'DRAFT');

        // Restore Duration
        if (editCourse.durationType === '6_MONTHS') {
          setDurationType('6_MONTHS');
        } else if (editCourse.durationType === '1_YEAR') {
          setDurationType('1_YEAR');
        } else if (editCourse.durationType === 'CUSTOM' || editCourse.durationDays) {
          if (editCourse.durationDays === 90) {
            setDurationType('3_MONTHS');
          } else if (editCourse.durationDays === 180) {
            setDurationType('6_MONTHS');
          } else if (editCourse.durationDays === 365) {
            setDurationType('1_YEAR');
          } else {
            setDurationType('CUSTOM');
            setCustomDays(editCourse.durationDays || 45);
          }
        } else {
          setDurationType('3_MONTHS');
        }
      } else {
        setName('');
        setCode('');
        setCollegeId(mockInstitutions[0]?.id || 'inst-01');
        setCollegeName(mockInstitutions[0]?.name || 'Loyola College');
        setDepartment(mockDepartments[0].name);
        setAcademicYear('2026–2027');
        setPrimaryFaculty('Dr. Anandhakumar V.');
        setSubstituteTutors(['Ms. Ananya Sharma (TA)']);
        setDoubtSupportTutor('Mr. Karthik Sundaram (TA)');
        setStatus('PUBLISHED');
        setDurationType('3_MONTHS');
        setCustomDays(45);
      }
    }
  }, [isOpen, editCourse]);

  // Handle ESC
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

  const handleAddSubTutor = () => {
    if (!newSubTutorInput.trim()) return;
    if (!substituteTutors.includes(newSubTutorInput.trim())) {
      setSubstituteTutors((prev) => [...prev, newSubTutorInput.trim()]);
    }
    setNewSubTutorInput('');
  };

  const handleRemoveSubTutor = (index: number) => {
    setSubstituteTutors((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Please enter course title.');
      return;
    }
    if (!code.trim()) {
      showError('Please enter course code.');
      return;
    }
    if (!primaryFaculty.trim()) {
      showError('Please assign primary faculty incharge.');
      return;
    }

    if (isEditMode && editCourse) {
      const updatedCourse: CourseSummary = {
        ...editCourse,
        code: code.toUpperCase(),
        name,
        collegeId,
        collegeName,
        department,
        academicYear: academicYear.trim(),
        program: durationLabel,
        semester: 1,
        duration: durationLabel,
        durationDays: effectiveDays,
        durationType,
        facultyName: primaryFaculty,
        substituteTutors,
        doubtSupportTutor,
        courseFee: editCourse.courseFee,
        status,
      };
      if (onCourseUpdated) {
        onCourseUpdated(updatedCourse);
      }
      showSuccess(`Course "${name}" (${durationLabel} • AY ${academicYear}) updated successfully.`);
      onClose();
      return;
    }

    const newCourse: CourseSummary = {
      id: `course-${Date.now().toString().slice(-4)}`,
      code: code.toUpperCase(),
      name,
      collegeId,
      collegeName,
      department,
      academicYear: academicYear.trim(),
      program: durationLabel,
      semester: 1,
      duration: durationLabel,
      durationDays: effectiveDays,
      durationType,
      facultyName: primaryFaculty,
      substituteTutors,
      doubtSupportTutor,
      enrolledStudents: 0,
      completionRate: 0,
      courseFee: 0,
      batchIds: [],
      batchNames: [],
      status,
    };

    onCourseCreated(newCourse);
    showSuccess(`Course "${name}" created successfully for AY ${academicYear} (${durationLabel}).`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isEditMode ? 'Edit Teaching Course' : 'Create Teaching Course'}
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
                Define duration days (3M, 6M, 1Y or Custom), primary lead & substitute tutors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* College Scoping */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Affiliated College / Institution <span className="text-rose-500">*</span>
              </label>
              <select
                value={collegeId}
                onChange={(e) => {
                  setCollegeId(e.target.value);
                  const inst = mockInstitutions.find((i) => i.id === e.target.value);
                  if (inst) setCollegeName(inst.name);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                {mockInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🎓 {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Title & Code Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. French A1 Intensive Certification"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FR-A1-101"
                  className="w-full px-3 py-2 font-mono uppercase font-bold border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>
            </div>

            {/* Academic Year Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Academic Year Term <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                <option value="2026–2027">2026–2027 (Active Term)</option>
                <option value="2025–2026">2025–2026</option>
                <option value="2027–2028">2027–2028</option>
                <option value="2028–2029">2028–2029</option>
              </select>
            </div>

            {/* ─── DURATION & DAYS COUNT ─── */}
            <div className="p-3.5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0052CC] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0052CC]" />
                  Course Duration Track & Days Count <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#0052CC] px-2 py-0.5 rounded-full">
                  {effectiveDays} Days Total
                </span>
              </div>

              {/* 4 Preset Duration Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setDurationType('3_MONTHS')}
                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                    durationType === '3_MONTHS'
                      ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-xs font-black">3 Months</div>
                  <div className={`text-[10px] ${durationType === '3_MONTHS' ? 'text-blue-100' : 'text-slate-400'}`}>
                    90 Days
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDurationType('6_MONTHS')}
                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                    durationType === '6_MONTHS'
                      ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-xs font-black">6 Months</div>
                  <div className={`text-[10px] ${durationType === '6_MONTHS' ? 'text-blue-100' : 'text-slate-400'}`}>
                    180 Days
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDurationType('1_YEAR')}
                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                    durationType === '1_YEAR'
                      ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-xs font-black">1 Year</div>
                  <div className={`text-[10px] ${durationType === '1_YEAR' ? 'text-blue-100' : 'text-slate-400'}`}>
                    365 Days
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDurationType('CUSTOM')}
                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                    durationType === 'CUSTOM'
                      ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-xs font-black">Custom</div>
                  <div className={`text-[10px] ${durationType === 'CUSTOM' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {customDays || 'Any'} Days
                  </div>
                </button>
              </div>

              {/* Custom Days Input if CUSTOM selected */}
              {durationType === 'CUSTOM' && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Enter Exact Number of Days
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={730}
                      value={customDays}
                      onChange={(e) => setCustomDays(Math.max(1, Number(e.target.value)))}
                      placeholder="e.g. 45, 60, 120"
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-bold text-slate-400">
                      Days
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3 text-[#0052CC]" />
                Students complete syllabus based on this {effectiveDays}-day timeframe rather than college semesters.
              </p>
            </div>



            {/* ─── PRIMARY FACULTY INCHARGE ─── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Faculty Incharge <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="tutors-list"
                  value={primaryFaculty}
                  onChange={(e) => setPrimaryFaculty(e.target.value)}
                  placeholder="e.g. Dr. Anandhakumar V."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
                <datalist id="tutors-list">
                  {PRESET_TUTORS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* ─── SUBSTITUTE TUTORS & DOUBT CLEARING SUPPORT ─── */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Substitute Tutors & Doubt Support</span>
                  </label>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Assigned tutors available to take classes when lead faculty is away, and assist students with doubts.
                  </p>
                </div>
              </div>

              {/* Dedicated Doubt Resolving Tutor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-[#0052CC]" />
                  <span>Doubt Resolution / Teaching Assistant (TA)</span>
                </label>
                <input
                  type="text"
                  list="tutors-list"
                  value={doubtSupportTutor}
                  onChange={(e) => setDoubtSupportTutor(e.target.value)}
                  placeholder="e.g. Mr. Karthik Sundaram (TA)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>

              {/* Substitute Tutors List */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Substitute Tutors (Takes class in absence of lead)
                </label>

                {substituteTutors.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {substituteTutors.map((tutor, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 text-xs font-semibold rounded-lg shadow-2xs"
                      >
                        <UserCheck className="w-3 h-3 text-indigo-500" />
                        <span>{tutor}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubTutor(idx)}
                          className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                          title="Remove tutor"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No substitute tutors added yet.</p>
                )}

                {/* Add New Substitute Tutor Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    list="tutors-list"
                    value={newSubTutorInput}
                    onChange={(e) => setNewSubTutorInput(e.target.value)}
                    placeholder="Add substitute tutor name..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubTutor();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubTutor}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Publication Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                <option value="PUBLISHED">Published (Visible to Enrolled Students)</option>
                <option value="DRAFT">Draft (Under Curriculum Preparation)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEditMode ? 'Update Course' : 'Create Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

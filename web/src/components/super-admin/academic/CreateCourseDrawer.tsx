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
  School,
} from 'lucide-react';
import { CourseSummary, Institution } from '@/types/rbac';
import { mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';

interface CreateCourseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (newCourse: CourseSummary) => void;
  editCourse?: CourseSummary | null;
  onCourseUpdated?: (course: CourseSummary) => void;
}

const PRESET_TUTORS = [
  'Joy Jk',
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
  const { institutions: contextInstitutions, isSchoolMode: globalIsSchool } = useCollege();
  const [dbInstitutions, setDbInstitutions] = useState<Institution[]>([]);

  // Fetch all live partner institutions directly from DB
  useEffect(() => {
    fetch('http://localhost:4000/api/portals/institutions')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Institution[] = res.data
            .filter((item: any) => item.status === 'ACTIVE' && !item.name.toLowerCase().includes('test'))
            .map((item: any) => ({
              id: item.id,
              code: item.code,
              name: item.name,
              displayName: item.displayName || item.name,
              city: 'Tamil Nadu',
              state: 'TN',
              country: 'India',
              status: item.status || 'ACTIVE',
              type: (item.code.includes('DPS') || item.name.toLowerCase().includes('school')) ? 'SCHOOL' : 'COLLEGE',
              universityAffiliation: 'University of Madras / Anna University',
              naacAccreditation: 'NAAC A++',
              studentsCount: 0,
              facultyCount: 0,
              departmentsCount: 0,
              batchesCount: 0,
              coursesCount: 0,
              activeAcademicYear: '2026-2027',
              logoUrl: '/logo.png',
              primaryColor: '#0052CC',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }));
          setDbInstitutions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const institutions = useMemo(() => {
    if (dbInstitutions.length > 0) return dbInstitutions;
    return contextInstitutions;
  }, [dbInstitutions, contextInstitutions]);

  const isEditMode = Boolean(editCourse);

  // Institution Track Tab (School vs College)
  const [instTypeFilter, setInstTypeFilter] = useState<'ALL' | 'COLLEGE' | 'SCHOOL'>(
    globalIsSchool ? 'SCHOOL' : 'COLLEGE'
  );

  // Filtered institutions based on School vs College
  const availableInstitutions = useMemo(() => {
    if (instTypeFilter === 'SCHOOL') {
      return institutions.filter((i) => i.type === 'SCHOOL' || i.code.includes('DPS') || i.name.toLowerCase().includes('school'));
    }
    if (instTypeFilter === 'COLLEGE') {
      return institutions.filter((i) => i.type !== 'SCHOOL' && !i.code.includes('DPS') && !i.name.toLowerCase().includes('school'));
    }
    return institutions;
  }, [institutions, instTypeFilter]);

  const defaultInst = availableInstitutions[0] || institutions[0];

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [collegeId, setCollegeId] = useState(defaultInst?.id || 'inst-01');
  const [collegeName, setCollegeName] = useState(defaultInst?.name || 'Loyola College');
  const [department, setDepartment] = useState(mockDepartments[0]?.name || 'Foreign Languages');
  const [academicYear, setAcademicYear] = useState('2026–2027');

  // Real Database Tutors from Backend
  const DEFAULT_REAL_DB_TUTORS = [
    { id: 'user-tutor', name: 'Madame Claire Dubois', designation: 'Certified French Language Trainer' },
    { id: 'fac-373222', name: 'JK Faculty', designation: 'M.A. Linguistics / Certified Native C2' },
    { id: 'fac-218604', name: 'Prof. Antoine Martin', designation: 'Certified Language Specialist' },
  ];
  const [dbTutors, setDbTutors] = useState<Array<{ id: string; name: string; designation?: string }>>(DEFAULT_REAL_DB_TUTORS);

  useEffect(() => {
    fetch('http://localhost:4000/api/portals/faculty')
      .then((r) => r.json())
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map((f: any) => ({
            id: f.id,
            name: f.name || f.fullName,
            designation: f.designation || 'Language Instructor'
          }));
          setDbTutors(formatted);
          if (!editCourse && formatted[0]?.name) {
            setPrimaryFaculty(formatted[0].name);
            setDoubtSupportTutor(formatted[1]?.name || formatted[0].name + ' (TA)');
            setSubstituteTutors([formatted[1]?.name || formatted[0].name]);
          }
        }
      })
      .catch(() => {});
  }, [editCourse]);

  // Faculty Leads & Substitute Support Tutors
  const [primaryFaculty, setPrimaryFaculty] = useState('Madame Claire Dubois');
  const [substituteTutors, setSubstituteTutors] = useState<string[]>([]);
  const [doubtSupportTutor, setDoubtSupportTutor] = useState('');
  const [assignedCollegeTutor, setAssignedCollegeTutor] = useState('');
  const [campusTutors, setCampusTutors] = useState<Record<string, string>>({});
  const [newSubTutorInput, setNewSubTutorInput] = useState('');

  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  // Helper functions for Date manipulation
  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const addDaysToStr = (baseDateStr: string, days: number) => {
    try {
      const parts = (baseDateStr || getTodayStr()).split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatDatePreview = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Course Timeline: Start Date and End Date
  const [startDate, setStartDate] = useState<string>(() => getTodayStr());
  const [endDate, setEndDate] = useState<string>(() => addDaysToStr(getTodayStr(), 90));

  // Computed days count dynamically derived from startDate and endDate
  const effectiveDays = useMemo(() => {
    if (!startDate || !endDate) return 90;
    try {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      const diff = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    } catch {
      return 90;
    }
  }, [startDate, endDate]);

  const durationType = `${effectiveDays}_DAYS`;

  const isMultiCampus = collegeId === 'ALL_COLLEGES' || collegeId === 'ALL_SCHOOLS' || collegeId === 'ALL_INSTITUTIONS';

  const relevantInstitutions = useMemo(() => {
    if (collegeId === 'ALL_COLLEGES') {
      return availableInstitutions.filter((i) => i.type === 'COLLEGE');
    }
    if (collegeId === 'ALL_SCHOOLS') {
      return availableInstitutions.filter((i) => i.type === 'SCHOOL');
    }
    if (collegeId === 'ALL_INSTITUTIONS') {
      return availableInstitutions;
    }
    return [];
  }, [collegeId, availableInstitutions]);

  const durationLabel = useMemo(() => {
    const weeks = Math.ceil(effectiveDays / 7);
    const months = Math.round(effectiveDays / 30);
    if (months >= 1) {
      return `${effectiveDays} Days (~${months} Month${months > 1 ? 's' : ''} • ${weeks} Wks)`;
    }
    return `${effectiveDays} Days (${weeks} Weeks)`;
  }, [effectiveDays]);

  useEffect(() => {
    if (isOpen) {
      if (editCourse) {
        setName(editCourse.name);
        setCode(editCourse.code);
        setCollegeId(editCourse.collegeId || defaultInst?.id || 'inst-01');
        setCollegeName(editCourse.collegeName || defaultInst?.name || 'Loyola College');
        setDepartment(editCourse.department);
        setAcademicYear(editCourse.academicYear || '2026–2027');
        setPrimaryFaculty(editCourse.facultyName || 'Joy Jk');
        setSubstituteTutors(editCourse.substituteTutors || ['Ms. Ananya Sharma (TA)']);
        setDoubtSupportTutor(editCourse.doubtSupportTutor || 'Mr. Karthik Sundaram (TA)');
        setStatus(editCourse.status as 'PUBLISHED' | 'DRAFT');

        // Restore Start Date & End Date
        if (editCourse.startDate) {
          setStartDate(editCourse.startDate);
          setEndDate(editCourse.endDate || addDaysToStr(editCourse.startDate, editCourse.durationDays || 90));
        } else {
          const today = getTodayStr();
          setStartDate(today);
          setEndDate(addDaysToStr(today, editCourse.durationDays || 90));
        }


      } else {
        setName('');
        setCode('');
        setCollegeId(defaultInst?.id || 'inst-01');
        setCollegeName(defaultInst?.name || 'Loyola College');
        setDepartment(mockDepartments[0]?.name || 'Foreign Languages');
        setAcademicYear('2026–2027');
        setPrimaryFaculty('Madame Claire Dubois');
        setSubstituteTutors(['JK Faculty']);
        setDoubtSupportTutor('Prof. Antoine Martin');
        setAssignedCollegeTutor('JK Faculty');
        setStatus('DRAFT');
        const today = getTodayStr();
        setStartDate(today);
        setEndDate(addDaysToStr(today, 90));

      }
    }
  }, [isOpen, editCourse, defaultInst]);

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
        assignedCollegeTutor,
        campusTutors,
        startDate,
        endDate,
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
      assignedCollegeTutor,
      campusTutors,
      startDate,
      endDate,
      enrolledStudents: 0,
      completionRate: 0,
      courseFee: 0,
      batchIds: [],
      batchNames: [],
      status: 'DRAFT', // Courses start in DRAFT until authorized by Super Admin
    };

    // Persist new course to centralized backend
    fetch('http://localhost:4000/api/portals/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.toUpperCase(),
        name,
        collegeId,
        collegeName,
        department,
        academicYear: academicYear.trim(),
        program: durationLabel,
        duration: durationLabel,
        durationDays: effectiveDays,
        durationType,
        facultyName: primaryFaculty,
        substituteTutors,
        doubtSupportTutor,
        assignedCollegeTutor,
        campusTutors,
        startDate,
        endDate,
        status: 'DRAFT',
      }),
    }).catch(() => null);

    onCourseCreated(newCourse);
    showSuccess(`Course "${name}" created in DRAFT status and submitted to Super Admin for authorization.`);
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
            {/* College & School Scoping */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0052CC]" />
                  <span>Target Institution Type <span className="text-rose-500">*</span></span>
                </label>

                {/* College vs School Segmented Control */}
                <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setInstTypeFilter('COLLEGE');
                      const col = institutions.find((i) => i.type !== 'SCHOOL' && !i.code.includes('DPS') && !i.name.toLowerCase().includes('school')) || institutions[0];
                      if (col) {
                        setCollegeId(col.id);
                        setCollegeName(col.name);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      instTypeFilter === 'COLLEGE'
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
                      setInstTypeFilter('SCHOOL');
                      const sch = institutions.find((i) => i.type === 'SCHOOL' || i.code.includes('DPS') || i.name.toLowerCase().includes('school')) || institutions[0];
                      if (sch) {
                        setCollegeId(sch.id);
                        setCollegeName(sch.name);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      instTypeFilter === 'SCHOOL'
                        ? 'bg-white text-emerald-600 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <School className="w-3 h-3" />
                    <span>Schools</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstTypeFilter('ALL')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      instTypeFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              <div>
                <select
                  value={collegeId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCollegeId(val);
                    if (val === 'ALL_COLLEGES') {
                      setCollegeName('All Affiliated Colleges');
                    } else if (val === 'ALL_SCHOOLS') {
                      setCollegeName('All Registered Schools');
                    } else if (val === 'ALL_INSTITUTIONS') {
                      setCollegeName('All Institutions (Colleges & Schools)');
                    } else {
                      const inst = institutions.find((i) => i.id === val);
                      if (inst) setCollegeName(inst.name);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {/* Universal Multi-Institution Option */}
                  {instTypeFilter === 'COLLEGE' && (
                    <option value="ALL_COLLEGES">
                      🌐 All Colleges (Universal Across All Campuses)
                    </option>
                  )}
                  {instTypeFilter === 'SCHOOL' && (
                    <option value="ALL_SCHOOLS">
                      🏫 All Schools (Universal Across All K-12 Campuses)
                    </option>
                  )}
                  {instTypeFilter === 'ALL' && (
                    <>
                      <option value="ALL_INSTITUTIONS">
                        🌐 All Institutions (Colleges & Schools)
                      </option>
                      <option value="ALL_COLLEGES">
                        🎓 All Colleges
                      </option>
                      <option value="ALL_SCHOOLS">
                        🏫 All Schools
                      </option>
                    </>
                  )}

                  {availableInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.type === 'SCHOOL' || inst.code.includes('DPS') || inst.name.toLowerCase().includes('school') ? '🏫' : '🎓'} {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selected: <span className="font-semibold text-slate-700">{collegeName}</span>
                </p>
              </div>
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

            {/* ─── COURSE SCHEDULE: START DATE & END DATE ─── */}
            <div className="p-4 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 border border-blue-200/90 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0052CC] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0052CC]" />
                  <span>Course Start Date & End Date</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#0052CC] px-2.5 py-0.5 rounded-full">
                  {effectiveDays} Days ({Math.ceil(effectiveDays / 7)} Weeks)
                </span>
              </div>

              {/* Exact Start Date & End Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#0052CC]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Start Date (From)</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Kick-off
                    </span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setStartDate(newStart);
                      if (newStart && endDate && new Date(newStart) > new Date(endDate)) {
                        setEndDate(addDaysToStr(newStart, 90));
                      }
                    }}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                  <p className="text-[10px] text-slate-400">Class lectures and student access commence on this date.</p>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>End Date (To)</span>
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      Completion
                    </span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                  <p className="text-[10px] text-slate-400">Final viva assessment and course conclusion date.</p>
                </div>
              </div>

              {/* Dynamic Live Timeline Preview Badge */}
              <div className="p-3 bg-blue-100/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Course Schedule: <strong className="text-[#0B2447]">{formatDatePreview(startDate)} ➔ {formatDatePreview(endDate)}</strong>
                  </span>
                </span>
                <span className="text-[11px] font-bold text-[#0052CC] bg-white px-2.5 py-1 rounded-md border border-blue-200 shrink-0 shadow-2xs">
                  {effectiveDays} Days Duration (~{Math.ceil(effectiveDays / 7)} Weeks)
                </span>
              </div>
            </div>



            {/* ─── PRIMARY FACULTY INCHARGE ─── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Faculty Incharge <span className="text-rose-500">*</span>
              </label>
              <select
                value={primaryFaculty}
                onChange={(e) => setPrimaryFaculty(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                required
              >
                {dbTutors.length === 0 ? (
                  <option value={primaryFaculty}>{primaryFaculty || 'Select Lead Faculty'}</option>
                ) : (
                  dbTutors.map((t) => (
                    <option key={t.id} value={t.name}>
                      👤 {t.name} ({t.designation || 'Instructor'})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* ─── CAMPUS-ASSIGNED COLLEGE TUTOR / CAMPUS-WISE TUTOR ALLOCATION ─── */}
            {!isMultiCampus ? (
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0B2447] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#0052CC]" />
                    <span>Campus-Assigned College Tutor ({collegeName})</span>
                  </label>
                  <span className="text-[10px] bg-blue-100 text-[#0052CC] font-bold px-2 py-0.5 rounded-full">
                    College Incharge
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Dedicated ISML tutor assigned specifically for <strong className="text-slate-700">{collegeName}</strong> to take on-campus live classes, offline labs, viva speaking assessments and resolve local student doubts.
                </p>
                <select
                  value={assignedCollegeTutor}
                  onChange={(e) => setAssignedCollegeTutor(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="">-- Select Dedicated Campus Tutor --</option>
                  {dbTutors.map((t) => (
                    <option key={t.id} value={t.name}>
                      🎓 {t.name} ({collegeName} Campus Lead)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-[#0B2447] flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#0052CC]" />
                      <span>Campus-Wise Tutor Allocation (Each College/School Assigned Tutor)</span>
                    </label>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Assign a dedicated ISML campus tutor individually for each partner institution in this cohort.
                    </p>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-[#0052CC] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    {relevantInstitutions.length} Campuses
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {relevantInstitutions.map((inst, index) => {
                    const currentTutor = campusTutors[inst.id] || dbTutors[index % (dbTutors.length || 1)]?.name || dbTutors[0]?.name || '';
                    return (
                      <div
                        key={inst.id}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {inst.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {inst.type} • {inst.code}
                          </p>
                        </div>
                        <select
                          value={currentTutor}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCampusTutors((prev: Record<string, string>) => ({ ...prev, [inst.id]: val }));
                          }}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC] min-w-[200px]"
                        >
                          {dbTutors.map((t) => (
                            <option key={t.id} value={t.name}>
                              👤 {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                <select
                  value={doubtSupportTutor}
                  onChange={(e) => setDoubtSupportTutor(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="">-- Select Doubt Support Tutor --</option>
                  {dbTutors.map((t) => (
                    <option key={t.id} value={t.name}>
                      💬 {t.name} (Doubt Support / TA)
                    </option>
                  ))}
                </select>
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

                {/* Add New Substitute Tutor Dropdown from DB */}
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={newSubTutorInput}
                    onChange={(e) => setNewSubTutorInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  >
                    <option value="">-- Select Substitute Tutor from Database --</option>
                    {dbTutors
                      .filter((t) => !substituteTutors.includes(t.name) && t.name !== primaryFaculty)
                      .map((t) => (
                        <option key={t.id} value={t.name}>
                          👤 {t.name} ({t.designation || 'Instructor'})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={!newSubTutorInput}
                    onClick={handleAddSubTutor}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
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

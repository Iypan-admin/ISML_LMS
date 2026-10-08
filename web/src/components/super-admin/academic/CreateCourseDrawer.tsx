// ============================================================================
// ISML COLLEGE LMS — CREATE COURSE SLIDE-OVER DRAWER
// Create Individual Teaching Course with Faculty, Credits & Course Fee Master
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { CourseSummary } from '@/types/rbac';
import { mockDepartments, mockPrograms, mockInstitutions, mockBatches } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateCourseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (newCourse: CourseSummary) => void;
  editCourse?: CourseSummary | null;
  onCourseUpdated?: (course: CourseSummary) => void;
}

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
  const [program, setProgram] = useState(mockPrograms[0].name);
  const [semester, setSemester] = useState(1);
  const [credits, setCredits] = useState(4);
  const [facultyName, setFacultyName] = useState('Dr. Anandhakumar V.');
  const [courseFee, setCourseFee] = useState(12500);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  // Filter batches for selected college
  const availableBatches = mockBatches.filter(
    (b) => !b.institutionId || b.institutionId === collegeId
  );

  useEffect(() => {
    if (isOpen) {
      if (editCourse) {
        setName(editCourse.name);
        setCode(editCourse.code);
        setCollegeId(editCourse.collegeId || mockInstitutions[0]?.id || 'inst-01');
        setCollegeName(editCourse.collegeName || mockInstitutions[0]?.name || 'Loyola College');
        setDepartment(editCourse.department);
        setProgram(editCourse.program);
        setSemester(editCourse.semester);
        setCredits(editCourse.credits ?? 4);
        setFacultyName(editCourse.facultyName);
        setCourseFee(editCourse.courseFee || 12500);
        setSelectedBatchIds(editCourse.batchIds || []);
        setStatus(editCourse.status as 'PUBLISHED' | 'DRAFT');
      } else {
        setName('');
        setCode('');
        setCollegeId(mockInstitutions[0]?.id || 'inst-01');
        setCollegeName(mockInstitutions[0]?.name || 'Loyola College');
        setSemester(1);
        setCredits(4);
        setCourseFee(12500);
        setSelectedBatchIds([]);
        setStatus('PUBLISHED');
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

    const matchedBatches = mockBatches.filter((b) => selectedBatchIds.includes(b.id));
    const batchNames = matchedBatches.map((b) => b.name);

    if (isEditMode && editCourse) {
      const updatedCourse: CourseSummary = {
        ...editCourse,
        code: code.toUpperCase(),
        name,
        collegeId,
        collegeName,
        department,
        program,
        semester,
        credits,
        facultyName,
        courseFee,
        batchIds: selectedBatchIds,
        batchNames,
        status,
      };
      if (onCourseUpdated) {
        onCourseUpdated(updatedCourse);
      }
      showSuccess(`Course "${name}" updated successfully.`);
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
      program,
      semester,
      credits,
      facultyName,
      enrolledStudents: 0,
      completionRate: 0,
      courseFee,
      batchIds: selectedBatchIds,
      batchNames,
      status,
    };

    onCourseCreated(newCourse);
    showSuccess(`Course "${name}" created with ₹${courseFee.toLocaleString('en-IN')} fee.`);
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
                {isEditMode ? 'Modify syllabus, credits & tuition fee' : 'Define subject syllabus, credits & tuition fee'}
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Distributed Cloud Architecture & Kubernetes"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS-401"
                  className="w-full px-3 py-2 font-mono uppercase font-bold border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Credits
                </label>
                <select
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value={1}>1 Credit</option>
                  <option value={2}>2 Credits</option>
                  <option value={3}>3 Credits</option>
                  <option value={4}>4 Credits (Core)</option>
                  <option value={5}>5 Credits</option>
                </select>
              </div>
            </div>

            {/* Mapped Cohort Batches */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Map to Student Batches / Cohorts
                </label>
                <span className="text-[10px] text-[#0052CC] font-bold">
                  {selectedBatchIds.length} Batches Selected
                </span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/70">
                {availableBatches.map((b) => {
                  const isChecked = selectedBatchIds.includes(b.id);
                  return (
                    <label
                      key={b.id}
                      className={`flex items-center gap-2.5 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50 text-[#0052CC] font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedBatchIds((prev) =>
                            isChecked ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                          );
                        }}
                        className="rounded text-[#0052CC] focus:ring-[#0052CC]"
                      />
                      <span className="truncate">{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-auto">
                        Sem {b.currentSemesterNumber}
                      </span>
                    </label>
                  );
                })}
                {availableBatches.length === 0 && (
                  <p className="text-[11px] text-slate-400 p-2 text-center">
                    No batches found under selected college.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {mockDepartments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Degree Program
                </label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {mockPrograms.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Semester Term
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={courseFee}
                    onChange={(e) => setCourseFee(Number(e.target.value))}
                    step={500}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty Incharge
              </label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="e.g. Dr. Anandhakumar V."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

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

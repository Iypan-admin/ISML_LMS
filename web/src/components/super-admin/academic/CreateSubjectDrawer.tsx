// ============================================================================
// ISML COLLEGE LMS — CREATE SUBJECT DRAWER
// Curriculum Subject, Credits, Type & Assigned Faculty Allocation
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Plus, Sparkles, Hash, Layers, CheckCircle2 } from 'lucide-react';
import { Subject } from '@/types/rbac';
import { mockCourses } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateSubjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectCreated: (newSubject: Subject) => void;
  editSubject?: Subject | null;
  onSubjectUpdated?: (sub: Subject) => void;
}

export default function CreateSubjectDrawer({
  isOpen,
  onClose,
  onSubjectCreated,
  editSubject,
  onSubjectUpdated,
}: CreateSubjectDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editSubject);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState(1);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'THEORY' | 'PRACTICAL' | 'ELECTIVE'>('THEORY');
  const [status, setStatus] = useState<'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ACTIVE' | 'INACTIVE'>('DRAFT');

  useEffect(() => {
    if (isOpen) {
      if (editSubject) {
        setSelectedCourseId(editSubject.courseId || '');
        setSemesterNumber(editSubject.semesterNumber || 1);
        setName(editSubject.name);
        setCode(editSubject.code);
        setType(editSubject.type || 'THEORY');
        setStatus(editSubject.status || 'DRAFT');
      } else {
        setSelectedCourseId('');
        setSemesterNumber(1);
        setName('');
        setCode('');
        setType('THEORY');
        setStatus('DRAFT');
      }
    }
  }, [isOpen, editSubject]);

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
    if (!name.trim() || !code.trim()) {
      showError('Please provide subject name and code.');
      return;
    }

    const matchedCourse = mockCourses.find((c) => c.id === selectedCourseId);
    const crsName = matchedCourse ? matchedCourse.name : undefined;

    if (isEditMode && editSubject) {
      const updatedSubject: Subject = {
        ...editSubject,
        courseId: selectedCourseId || undefined,
        courseName: crsName || editSubject.courseName,
        semesterNumber: Number(semesterNumber),
        name: name.trim(),
        code: code.trim().toUpperCase(),
        credits: 0,
        type,
        facultyName: editSubject.facultyName || 'Unassigned',
        facultyEmail: editSubject.facultyEmail || '—',
        status,
      };
      if (onSubjectUpdated) {
        onSubjectUpdated(updatedSubject);
      }
      showSuccess(`Subject "${updatedSubject.name}" (${updatedSubject.code}) updated.`);
      onClose();
      return;
    }

    const newSubject: Subject = {
      id: `subj-${Date.now().toString().slice(-4)}`,
      courseId: selectedCourseId || undefined,
      courseName: crsName,
      semesterNumber: Number(semesterNumber),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits: 0,
      type,
      facultyName: 'Unassigned',
      facultyEmail: '—',
      modulesCount: 0,
      status: 'DRAFT', // Saved in draft pending super admin approval and publish
    };

    onSubjectCreated(newSubject);
    showSuccess(`Subject "${newSubject.name}" saved as Draft (Waiting for Super Admin approval & publish).`);
    onClose();
  };

  if (!isOpen) return null;

  const currentCourse = mockCourses.find((c) => c.id === selectedCourseId);

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
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Curriculum Subject' : 'Add Curriculum Subject'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode ? 'Modify coursework syllabus & classification' : 'Coursework syllabus & classification'}
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
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Optional Course Integration */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assign to Course</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none shadow-xs cursor-pointer"
              >
                <option value="">— Don't assign to a course now (Standalone Subject) —</option>
                {mockCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    📘 {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {currentCourse
                  ? `Will be linked to ${currentCourse.name}. You can also reassign anytime later.`
                  : 'You can create the subject standalone first, and assign it to any course later whenever ready.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Database Systems & Big Data"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Code *
                </label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="CS-304"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={semesterNumber}
                  onChange={(e) => setSemesterNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject Classification
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="THEORY">THEORY (Lecture & Examination)</option>
                <option value="PRACTICAL">PRACTICAL (Laboratory & Projects)</option>
                <option value="ELECTIVE">ELECTIVE (Interdisciplinary / Open Elective)</option>
              </select>
            </div>

            {/* Status & Approval Notice */}
            {isEditMode ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Curriculum Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                >
                  <option value="DRAFT">DRAFT (Under Preparation / Pending Approval)</option>
                  <option value="PENDING_APPROVAL">PENDING APPROVAL (Submitted for Super Admin Verification)</option>
                  <option value="PUBLISHED">PUBLISHED (Verified & Live in Course Curriculum)</option>
                  <option value="ACTIVE">ACTIVE (Taught in Current Syllabus)</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ⏳
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Draft & Approval Workflow
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    New subjects are automatically saved as <strong>DRAFT</strong>. Super Admin will verify the syllabus details and publish it to the active curriculum.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 sm:px-5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isEditMode ? 'Update Subject' : 'Save Subject'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — CREATE ASSESSMENT DRAWER
// Continuous Internal Assessment (CIA), Mid-Term & Examination Provisioning
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { FileCheck2, X, Plus, Sparkles, Calendar, BookOpen, Award, Users } from 'lucide-react';
import { AssessmentItem } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';

interface CreateAssessmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCreated: (newAssessment: AssessmentItem) => void;
  editAssessment?: AssessmentItem | null;
  onAssessmentUpdated?: (assessment: AssessmentItem) => void;
}

export default function CreateAssessmentDrawer({
  isOpen,
  onClose,
  onAssessmentCreated,
  editAssessment,
  onAssessmentUpdated,
}: CreateAssessmentDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editAssessment);

  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('Data Structures and Algorithms in C++');
  const [type, setType] = useState<'MID_TERM' | 'FINAL_EXAM' | 'QUIZ' | 'ASSIGNMENT'>('MID_TERM');
  const [programName, setProgramName] = useState('B.Tech Computer Science & Engineering');
  const [batchName, setBatchName] = useState('B.Tech CSE - Class of 2028');
  const [semester, setSemester] = useState(3);
  const [facultyName, setFacultyName] = useState('Dr. R. Ramanathan, Ph.D.');
  const [totalMarks, setTotalMarks] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'CLOSED'>('PUBLISHED');

  useEffect(() => {
    if (isOpen) {
      if (editAssessment) {
        setTitle(editAssessment.title);
        setSubjectName(editAssessment.subjectName);
        setType(editAssessment.type);
        setProgramName(editAssessment.programName);
        setBatchName(editAssessment.batchName);
        setSemester(editAssessment.semester);
        setFacultyName(editAssessment.facultyName);
        setTotalMarks(editAssessment.totalMarks);
        setDueDate(editAssessment.dueDate);
        setStatus(editAssessment.status);
      } else {
        setTitle('');
        setSubjectName('Data Structures and Algorithms in C++');
        setType('MID_TERM');
        setProgramName('B.Tech Computer Science & Engineering');
        setBatchName('B.Tech CSE - Class of 2028');
        setSemester(3);
        setFacultyName('Dr. R. Ramanathan, Ph.D.');
        setTotalMarks(100);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setDueDate(nextWeek.toISOString().split('T')[0]);
        setStatus('PUBLISHED');
      }
    }
  }, [isOpen, editAssessment]);

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
    if (!title.trim() || !subjectName.trim()) {
      showError('Please provide assessment title and subject name.');
      return;
    }

    if (isEditMode && editAssessment) {
      const updatedAssessment: AssessmentItem = {
        ...editAssessment,
        title: title.trim(),
        subjectName: subjectName.trim(),
        programName,
        semester: Number(semester),
        batchName,
        facultyName,
        type,
        totalMarks: Number(totalMarks),
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        status,
      };
      if (onAssessmentUpdated) {
        onAssessmentUpdated(updatedAssessment);
      }
      showSuccess(`Assessment "${updatedAssessment.title}" updated successfully.`);
      onClose();
      return;
    }

    const newAssessment: AssessmentItem = {
      id: `asm-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      subjectName: subjectName.trim(),
      programName,
      semester: Number(semester),
      batchName,
      facultyName,
      type,
      totalMarks: Number(totalMarks),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      submissionsCount: 0,
      status,
    };

    onAssessmentCreated(newAssessment);
    showSuccess(`Assessment "${newAssessment.title}" created successfully.`);
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
                <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Assessment' : 'Create Assessment'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode ? 'Modify assessment criteria, weightage & due date' : 'Schedule examination, assignment or quiz evaluation'}
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
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assessment Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mid-Term Theory Evaluation: Algorithms & Graph Complexity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Evaluation Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                >
                  <option value="MID_TERM">MID_TERM (Internal Exam)</option>
                  <option value="FINAL_EXAM">FINAL_EXAM (University Finals)</option>
                  <option value="QUIZ">QUIZ (MCQ / Online Test)</option>
                  <option value="ASSIGNMENT">ASSIGNMENT (Practical / Project)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Total Marks *
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures and Algorithms in C++"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Batch Cohort
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Instructor / Faculty
                </label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Due / Examination Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="PUBLISHED">PUBLISHED (Visible to Students & Parents)</option>
                <option value="DRAFT">DRAFT (Faculty Preparation Only)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-800 leading-relaxed">
              When published, this assessment item syncs with student study dashboards and parent attendance/grade notification channels.
            </div>

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
                <span>{isEditMode ? 'Update Assessment' : 'Save Assessment'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

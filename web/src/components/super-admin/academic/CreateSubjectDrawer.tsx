// ============================================================================
// ISML COLLEGE LMS — CREATE SUBJECT DRAWER
// Curriculum Subject, Credits, Type & Assigned Faculty Allocation
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Plus, Sparkles, Hash, Award, User, Mail } from 'lucide-react';
import { Subject } from '@/types/rbac';
import { mockPrograms } from '@/mock/superAdminData';
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

  const [selectedProgramId, setSelectedProgramId] = useState(mockPrograms[0]?.id || 'prog-01');
  const [semesterNumber, setSemesterNumber] = useState(3);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(4);
  const [type, setType] = useState<'THEORY' | 'PRACTICAL' | 'ELECTIVE'>('THEORY');
  const [facultyName, setFacultyName] = useState('Dr. R. Ramanathan, Ph.D.');
  const [facultyEmail, setFacultyEmail] = useState('ramanathan.r@loyolacollege.edu');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    if (isOpen) {
      if (editSubject) {
        setSelectedProgramId(editSubject.programId);
        setSemesterNumber(editSubject.semesterNumber);
        setName(editSubject.name);
        setCode(editSubject.code);
        setCredits(editSubject.credits);
        setType(editSubject.type);
        setFacultyName(editSubject.facultyName);
        setFacultyEmail(editSubject.facultyEmail);
        setStatus(editSubject.status);
      } else {
        setSelectedProgramId(mockPrograms[0]?.id || 'prog-01');
        setSemesterNumber(3);
        setName('');
        setCode('');
        setCredits(4);
        setType('THEORY');
        setFacultyName('Dr. R. Ramanathan, Ph.D.');
        setFacultyEmail('ramanathan.r@loyolacollege.edu');
        setStatus('ACTIVE');
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
    if (!name.trim() || !code.trim() || !facultyName.trim()) {
      showError('Please provide subject name, code, and faculty in-charge.');
      return;
    }

    const prog = mockPrograms.find((p) => p.id === selectedProgramId);
    const progName = prog ? prog.name : 'Degree Program';

    if (isEditMode && editSubject) {
      const updatedSubject: Subject = {
        ...editSubject,
        programId: selectedProgramId,
        programName: progName,
        semesterNumber: Number(semesterNumber),
        name: name.trim(),
        code: code.trim().toUpperCase(),
        credits: Number(credits),
        type,
        facultyName: facultyName.trim(),
        facultyEmail: facultyEmail.trim().toLowerCase(),
        status,
      };
      if (onSubjectUpdated) {
        onSubjectUpdated(updatedSubject);
      }
      showSuccess(`Subject "${updatedSubject.name}" (${updatedSubject.code}) updated successfully.`);
      onClose();
      return;
    }

    const newSubject: Subject = {
      id: `subj-${Date.now().toString().slice(-4)}`,
      programId: selectedProgramId,
      programName: progName,
      semesterNumber: Number(semesterNumber),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits: Number(credits),
      type,
      facultyName: facultyName.trim(),
      facultyEmail: facultyEmail.trim().toLowerCase(),
      modulesCount: 0,
      status,
    };

    onSubjectCreated(newSubject);
    showSuccess(`Subject "${newSubject.name}" (${newSubject.code}) added successfully.`);
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
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Curriculum Subject' : 'Add Curriculum Subject'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode ? 'Modify coursework syllabus, credits & faculty lead' : 'Coursework syllabus, credit weightage & faculty lead'}
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
                Target Degree Program *
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                {mockPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
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

            <div className="grid grid-cols-3 gap-3">
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
                  Credits *
                </label>
                <div className="relative">
                  <Award className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
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

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-[#0B2447] flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-[#0052CC]" />
                Faculty Lead Assignment
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. R. Ramanathan, Ph.D."
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Faculty Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramanathan.r@loyolacollege.edu"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Curriculum Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="ACTIVE">ACTIVE (Taught in Current Syllabus)</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
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
                <span>{isEditMode ? 'Update Subject' : 'Save Subject'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

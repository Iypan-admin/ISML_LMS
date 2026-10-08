// ============================================================================
// ISML COLLEGE LMS — CREATE SEMESTER DRAWER
// Academic Term Configuration, Date Windows & Promotion Setup
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, X, Plus, Sparkles, BookOpen, Clock } from 'lucide-react';
import { Semester } from '@/types/rbac';
import { mockPrograms } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateSemesterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSemesterCreated: (newSem: Semester) => void;
  editSemester?: Semester | null;
  onSemesterUpdated?: (sem: Semester) => void;
}

export default function CreateSemesterDrawer({
  isOpen,
  onClose,
  onSemesterCreated,
  editSemester,
  onSemesterUpdated,
}: CreateSemesterDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editSemester);

  const [selectedProgramId, setSelectedProgramId] = useState(mockPrograms[0]?.id || 'prog-01');
  const [semesterNumber, setSemesterNumber] = useState(1);
  const [name, setName] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [startDate, setStartDate] = useState('2024-07-01');
  const [endDate, setEndDate] = useState('2024-11-30');
  const [status, setStatus] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

  useEffect(() => {
    if (!isEditMode) {
      setName(`Semester ${semesterNumber}`);
    }
  }, [semesterNumber, isEditMode]);

  useEffect(() => {
    if (isOpen) {
      if (editSemester) {
        setSelectedProgramId(editSemester.programId);
        setSemesterNumber(editSemester.semesterNumber);
        setName(editSemester.name);
        setAcademicYear(editSemester.academicYear);
        setStartDate(editSemester.startDate);
        setEndDate(editSemester.endDate);
        setStatus(editSemester.status);
      } else {
        setSelectedProgramId(mockPrograms[0]?.id || 'prog-01');
        setSemesterNumber(1);
        setName('Semester 1');
        setAcademicYear('2024-2025');
        setStartDate('2024-07-01');
        setEndDate('2024-11-30');
        setStatus('ACTIVE');
      }
    }
  }, [isOpen, editSemester]);

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
    const prog = mockPrograms.find((p) => p.id === selectedProgramId);
    const progName = prog ? prog.name : 'Degree Program';

    if (isEditMode && editSemester) {
      const updatedSem: Semester = {
        ...editSemester,
        programId: selectedProgramId,
        programName: progName,
        semesterNumber: Number(semesterNumber),
        name: name.trim(),
        academicYear: academicYear.trim(),
        startDate,
        endDate,
        status,
      };
      if (onSemesterUpdated) {
        onSemesterUpdated(updatedSem);
      }
      showSuccess(`Semester term "${updatedSem.name}" updated successfully.`);
      onClose();
      return;
    }

    const newSem: Semester = {
      id: `sem-${Date.now().toString().slice(-4)}`,
      programId: selectedProgramId,
      programName: progName,
      semesterNumber: Number(semesterNumber),
      name: name.trim(),
      academicYear: academicYear.trim(),
      startDate,
      endDate,
      status,
      subjectsCount: 0,
    };

    onSemesterCreated(newSem);
    showSuccess(`Semester term "${newSem.name}" (${newSem.academicYear}) configured successfully.`);
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
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Semester Term' : 'Configure Semester Term'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode ? 'Modify semester term dates and status' : 'Define academic duration and teaching calendar'}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Semester Number *
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Year *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024-2025"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester Display Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Semester 1 (Autumn Term)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Term Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="ACTIVE">ACTIVE (Classes in Progress)</option>
                <option value="UPCOMING">UPCOMING (Enrollment Open)</option>
                <option value="COMPLETED">COMPLETED (Archived)</option>
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
                <span>{isEditMode ? 'Update Semester' : 'Save Semester'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

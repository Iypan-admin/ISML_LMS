// ============================================================================
// ISML COLLEGE LMS — CREATE BATCH DRAWER
// Student Cohort Initialization, Academic Cycle & Intake Capacity
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { Layers, X, Plus, Sparkles, Calendar, BookOpen, Users, Grid, Building2 } from 'lucide-react';
import { Batch } from '@/types/rbac';
import { mockPrograms, mockInstitutions, mockCourses } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateBatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: (newBatch: Batch) => void;
  editBatch?: Batch | null;
  onBatchUpdated?: (batch: Batch) => void;
}

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
  const [selectedProgramId, setSelectedProgramId] = useState(mockPrograms[0]?.id || 'prog-01');
  const [name, setName] = useState('');
  const [admissionYear, setAdmissionYear] = useState(2024);
  const [graduationYear, setGraduationYear] = useState(2028);
  const [currentSemesterNumber, setCurrentSemesterNumber] = useState(1);
  const [sectionsCount, setSectionsCount] = useState(2);
  const [studentsCount, setStudentsCount] = useState(60);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'ACTIVE' | 'GRADUATED' | 'INACTIVE'>('ACTIVE');

  // Filter courses available for selected institution
  const availableCourses = mockCourses.filter(
    (c) => !c.collegeId || c.collegeId === institutionId
  );

  // Auto-generate name when program or admission year changes only in create mode
  useEffect(() => {
    if (!isEditMode) {
      const prog = mockPrograms.find((p) => p.id === selectedProgramId);
      if (prog) {
        setName(`${prog.code} - Class of ${graduationYear}`);
      }
    }
  }, [selectedProgramId, graduationYear, isEditMode]);

  useEffect(() => {
    if (isOpen) {
      if (editBatch) {
        setInstitutionId(editBatch.institutionId || mockInstitutions[0]?.id || 'inst-01');
        setInstitutionName(editBatch.institutionName || mockInstitutions[0]?.name || 'Loyola College');
        setSelectedProgramId(editBatch.programId);
        setName(editBatch.name);
        setAdmissionYear(editBatch.admissionYear);
        setGraduationYear(editBatch.graduationYear);
        setCurrentSemesterNumber(editBatch.currentSemesterNumber);
        setSectionsCount(editBatch.sectionsCount);
        setStudentsCount(editBatch.studentsCount);
        setSelectedCourseIds(editBatch.courseIds || []);
        setStatus(editBatch.status as 'ACTIVE' | 'GRADUATED' | 'INACTIVE');
      } else {
        const prog = mockPrograms[0];
        setInstitutionId(mockInstitutions[0]?.id || 'inst-01');
        setInstitutionName(mockInstitutions[0]?.name || 'Loyola College');
        if (prog) {
          setSelectedProgramId(prog.id);
          setName(`${prog.code} - Class of 2028`);
        }
        setAdmissionYear(2024);
        setGraduationYear(2028);
        setCurrentSemesterNumber(1);
        setSectionsCount(2);
        setStudentsCount(60);
        setSelectedCourseIds([]);
        setStatus('ACTIVE');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Please provide batch cohort title.');
      return;
    }

    const prog = mockPrograms.find((p) => p.id === selectedProgramId) || {
      name: 'Computer Science & Engineering',
      departmentName: 'Department of Computer Science & IT',
    };

    const matchedCourses = mockCourses.filter((c) => selectedCourseIds.includes(c.id));
    const courseNames = matchedCourses.map((c) => c.name);

    if (isEditMode && editBatch) {
      const updatedBatch: Batch = {
        ...editBatch,
        institutionId,
        institutionName,
        programId: selectedProgramId,
        programName: prog.name,
        departmentName: prog.departmentName || 'Academic Department',
        name: name.trim(),
        admissionYear: Number(admissionYear),
        graduationYear: Number(graduationYear),
        currentSemesterNumber: Number(currentSemesterNumber),
        sectionsCount: Number(sectionsCount),
        studentsCount: Number(studentsCount),
        courseIds: selectedCourseIds,
        courseNames,
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
      programId: selectedProgramId,
      programName: prog.name,
      departmentName: prog.departmentName || 'Academic Department',
      name: name.trim(),
      admissionYear: Number(admissionYear),
      graduationYear: Number(graduationYear),
      currentSemesterNumber: Number(currentSemesterNumber),
      sectionsCount: Number(sectionsCount),
      studentsCount: Number(studentsCount),
      courseIds: selectedCourseIds,
      courseNames,
      status,
      createdAt: new Date().toISOString(),
    };

    onBatchCreated(newBatch);
    showSuccess(`Batch cohort "${newBatch.name}" created successfully.`);
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
                  {isEditMode ? 'Edit Batch Cohort' : 'Create Batch Cohort'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {isEditMode ? 'Modify academic cohort parameters' : 'Initialize academic cohort and section allocations'}
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
            {/* College Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                {mockInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Academic Program *
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
                Batch Cohort Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B.Tech CSE - Class of 2028"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admission Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Graduation Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="2021"
                    max="2040"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Sem
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={currentSemesterNumber}
                  onChange={(e) => setCurrentSemesterNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sections
                </label>
                <div className="relative">
                  <Grid className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={sectionsCount}
                    onChange={(e) => setSectionsCount(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Students Cap
                </label>
                <div className="relative">
                  <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mapped Courses Checklist */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Map Enrolled Courses ({selectedCourseIds.length} Selected)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Select all curricula</span>
              </div>
              <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-2.5 max-h-44 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {availableCourses.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    No courses available for this campus.
                  </p>
                ) : (
                  availableCourses.map((crs) => {
                    const isChecked = selectedCourseIds.includes(crs.id);
                    return (
                      <label
                        key={crs.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors pt-2 ${
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
                            <span className="font-semibold text-purple-700">{crs.credits || 4} Credits</span>
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Batch Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'GRADUATED' | 'INACTIVE')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              >
                <option value="ACTIVE">ACTIVE (In Session)</option>
                <option value="GRADUATED">GRADUATED (Alumni)</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-800 leading-relaxed">
              New students admitted via single-sign-on or bulk CSV upload can be immediately associated with this cohort batch.
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
                <span>{isEditMode ? 'Update Batch Cohort' : 'Save Batch Cohort'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

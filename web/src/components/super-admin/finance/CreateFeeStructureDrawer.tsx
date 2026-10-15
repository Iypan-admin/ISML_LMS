// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN: CREATE/EDIT COURSE FEE STRUCTURE DRAWER
// Course-Level Fee Schedules (Degree Program & Semester completely replaced by Course & Track)
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  IndianRupee,
  X,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  ShieldCheck,
  Building2,
  BookOpen,
} from 'lucide-react';
import { FeeStructure, FeeStructureItem, RequestStatus } from '@/types/rbac';
import { mockCourses, mockBatches, mockInstitutions } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';

interface CreateFeeStructureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFeeStructureCreated: (newFeeStructure: FeeStructure) => void;
  editFeeStructure?: FeeStructure | null;
  onFeeStructureUpdated?: (updatedFeeStructure: FeeStructure) => void;
  initialCourseId?: string;
}

export default function CreateFeeStructureDrawer({
  isOpen,
  onClose,
  onFeeStructureCreated,
  editFeeStructure,
  onFeeStructureUpdated,
  initialCourseId,
}: CreateFeeStructureDrawerProps) {
  const { showSuccess, showError } = useToast();
  const { selectedCollegeId: contextCollegeId, institutions } = useCollege();
  const isEditMode = Boolean(editFeeStructure);

  // 1. College Selection
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(
    contextCollegeId === OVERALL_COLLEGE_ID ? institutions[0]?.id || 'inst-01' : contextCollegeId
  );

  // 2. Course Selection (All courses for the selected college or all)
  const availableCourses = useMemo(() => {
    const list = mockCourses.filter((c) => !c.collegeId || c.collegeId === selectedCollegeId);
    return list.length > 0 ? list : mockCourses;
  }, [selectedCollegeId]);

  const [courseId, setCourseId] = useState<string>(
    initialCourseId || availableCourses[0]?.id || 'crs-01'
  );

  const selectedCourse = useMemo(() => {
    return mockCourses.find((c) => c.id === courseId) || availableCourses[0] || mockCourses[0];
  }, [courseId, availableCourses]);

  // 3. Batch Selection
  const availableBatches = useMemo(() => {
    const list = mockBatches.filter((b) => !b.institutionId || b.institutionId === selectedCollegeId);
    return list.length > 0 ? list : mockBatches;
  }, [selectedCollegeId]);

  const [batchId, setBatchId] = useState<string>(
    availableBatches[0]?.id || 'batch-2026-cs'
  );

  const selectedBatch = useMemo(() => {
    return mockBatches.find((b) => b.id === batchId) || availableBatches[0] || mockBatches[0];
  }, [batchId, availableBatches]);

  // 4. Academic Cycle & Duration Track (No Semester)
  const [courseDuration, setCourseDuration] = useState<string>('3 Months Intensive Track');
  const [academicYear, setAcademicYear] = useState('2026–2027');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-07-01');
  const [effectiveTo, setEffectiveTo] = useState('2026-11-30');
  const [status, setStatus] = useState<RequestStatus>('APPROVED');

  // 5. Components breakdown
  const [tuitionAmount, setTuitionAmount] = useState(33500);
  const [labAmount, setLabAmount] = useState(6500);
  const [examAmount, setExamAmount] = useState(3500);
  const [registrationAmount, setRegistrationAmount] = useState(2500);
  const [techAmount, setTechAmount] = useState(2000);

  const totalAmount = useMemo(() => {
    return (
      (Number(tuitionAmount) || 0) +
      (Number(labAmount) || 0) +
      (Number(examAmount) || 0) +
      (Number(registrationAmount) || 0) +
      (Number(techAmount) || 0)
    );
  }, [tuitionAmount, labAmount, examAmount, registrationAmount, techAmount]);

  const scheduleCode = editFeeStructure
    ? editFeeStructure.code
    : `FEESTR-${selectedCourse.code.replace(/[^a-zA-Z0-9]/g, '-')}-V${Date.now().toString().slice(-2)}`;

  useEffect(() => {
    if (isOpen) {
      if (editFeeStructure) {
        // Find matching course by name or code
        const matched = mockCourses.find(
          (c) =>
            c.name.toLowerCase() === editFeeStructure.programName.toLowerCase() ||
            c.code.toLowerCase() === editFeeStructure.code.toLowerCase()
        );
        if (matched) setCourseId(matched.id);

        if (editFeeStructure.batchId) setBatchId(editFeeStructure.batchId);
        setAcademicYear(editFeeStructure.academicYear || '2026–2027');
        setEffectiveFrom(editFeeStructure.effectiveFrom);
        setEffectiveTo(editFeeStructure.effectiveTo);
        setStatus(editFeeStructure.status);

        const tuition = editFeeStructure.components.find((c) => c.componentCode === 'TUITION_FEE')?.amount ?? 33500;
        const lab = editFeeStructure.components.find((c) => c.componentCode === 'LAB_FEE')?.amount ?? 6500;
        const exam = editFeeStructure.components.find((c) => c.componentCode === 'EXAM_FEE')?.amount ?? 3500;
        const reg = editFeeStructure.components.find((c) => c.componentCode === 'REGISTRATION_FEE')?.amount ?? 2500;
        const tech = editFeeStructure.components.find((c) => c.componentCode === 'TECH_FEE')?.amount ?? 2000;

        setTuitionAmount(tuition);
        setLabAmount(lab);
        setExamAmount(exam);
        setRegistrationAmount(reg);
        setTechAmount(tech);
      } else {
        if (initialCourseId) {
          setCourseId(initialCourseId);
          const found = mockCourses.find((c) => c.id === initialCourseId);
          if (found?.courseFee) {
            setTuitionAmount(found.courseFee);
          }
        } else if (availableCourses.length > 0) {
          setCourseId(availableCourses[0].id);
          if (availableCourses[0].courseFee) {
            setTuitionAmount(availableCourses[0].courseFee);
          }
        }
        setAcademicYear('2026–2027');
        setEffectiveFrom('2026-07-01');
        setEffectiveTo('2026-11-30');
        setStatus('APPROVED');
      }
    }
  }, [isOpen, editFeeStructure, availableCourses]);

  // When selected course changes, update default tuition
  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    const crs = mockCourses.find((c) => c.id === newCourseId);
    if (crs && crs.courseFee && crs.courseFee > 0) {
      setTuitionAmount(crs.courseFee);
    }
  };

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

    const components: FeeStructureItem[] = [
      { componentCode: 'TUITION_FEE', componentName: `${selectedCourse.name} Tuition`, amount: tuitionAmount, isOptional: false },
      { componentCode: 'LAB_FEE', componentName: 'Practical Lab & Digital Sandbox', amount: labAmount, isOptional: false },
      { componentCode: 'EXAM_FEE', componentName: 'Certification & Course Evaluations', amount: examAmount, isOptional: false },
      { componentCode: 'REGISTRATION_FEE', componentName: 'Course Registration & Enrollment', amount: registrationAmount, isOptional: false },
      { componentCode: 'TECH_FEE', componentName: 'ISML LMS & Technology Access Fee', amount: techAmount, isOptional: false },
    ];

    if (isEditMode && editFeeStructure) {
      const updatedStructure: FeeStructure = {
        ...editFeeStructure,
        programId: selectedCourse.id,
        programName: selectedCourse.name,
        departmentName: selectedCourse.department,
        batchId: selectedBatch.id,
        batchName: selectedBatch.name,
        semesterNumber: 1, // Normalized standard unit
        courseTrackName: courseDuration,
        academicYear,
        totalAmount,
        components,
        effectiveFrom,
        effectiveTo,
        status,
      };

      onFeeStructureUpdated?.(updatedStructure);
      showSuccess(`Fee schedule ${editFeeStructure.code} updated for ${selectedCourse.name}.`);
      onClose();
      return;
    }

    const newStructure: FeeStructure = {
      id: `fee-${Date.now().toString().slice(-4)}`,
      code: scheduleCode,
      programId: selectedCourse.id,
      programName: selectedCourse.name,
      departmentName: selectedCourse.department,
      batchId: selectedBatch.id,
      batchName: selectedBatch.name,
      semesterNumber: 1,
      courseTrackName: courseDuration,
      academicYear,
      version: 1,
      totalAmount,
      components,
      effectiveFrom,
      effectiveTo,
      status,
      submittedBy: 'Super Admin',
      submittedAt: new Date().toISOString(),
      approvedBy: status === 'APPROVED' ? 'Super Admin' : undefined,
      approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
    };

    onFeeStructureCreated(newStructure);
    showSuccess(`Fee schedule ${scheduleCode} (₹${totalAmount.toLocaleString('en-IN')}) provisioned for ${selectedCourse.name}.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isEditMode ? 'Edit Course Fee Schedule' : 'Create Course Fee Schedule'}
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
                Define course tuition packages, lab licenses, and exam certification fees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* College Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Target Institution Campus</span>
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
              >
                {mockInstitutions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selection (Replaced Degree Program) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#0052CC]" />
                  <span>Select Course <span className="text-rose-500">*</span></span>
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  {availableCourses.length} Courses Available
                </span>
              </label>
              <select
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border-2 border-blue-600 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
              >
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} ({c.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Batch & Track Details (Semester completely removed) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cohort / Batch
                </label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
                >
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Track / Duration Cycle
                </label>
                <select
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC] cursor-pointer"
                >
                  <option value="3 Months Intensive Track">3 Months Intensive Track</option>
                  <option value="6 Months Diploma Track">6 Months Diploma Track</option>
                  <option value="1 Year Professional Track">1 Year Professional Track</option>
                  <option value="Full Academic Year Track">Full Academic Year Track</option>
                  <option value="Self-Paced Track">Self-Paced Track</option>
                </select>
              </div>
            </div>

            {/* Generated Code */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Generated Master Code:</span>
              <span className="font-mono font-bold text-[#0052CC]">{scheduleCode}</span>
            </div>

            {/* Components Breakdown */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                Component Breakdown (Per Course Cycle)
              </span>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-700">Course Base Tuition Fee</span>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={tuitionAmount}
                      onChange={(e) => setTuitionAmount(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg font-bold text-xs text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-700">Practical & Digital Lab Fee</span>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={labAmount}
                      onChange={(e) => setLabAmount(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg font-bold text-xs text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-700">Certification & Exam Fee</span>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={examAmount}
                      onChange={(e) => setExamAmount(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg font-bold text-xs text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-700">Course Enrollment & Registration</span>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={registrationAmount}
                      onChange={(e) => setRegistrationAmount(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg font-bold text-xs text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-700">LMS & Tech Infrastructure</span>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={techAmount}
                      onChange={(e) => setTechAmount(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg font-bold text-xs text-right"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-700 uppercase font-bold block">
                  Total Course Fee
                </span>
                <span className="text-xs text-emerald-800">Billed to student accounts</span>
              </div>
              <p className="text-xl font-bold text-emerald-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Approval State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authorization Mode
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                <option value="APPROVED">Direct Super Admin Activation (Active immediately)</option>
                <option value="PENDING_APPROVAL">Submit to Governance Review (Pending Approval)</option>
                <option value="DRAFT">Draft Mode (Save for later adjustments)</option>
              </select>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEditMode ? 'Update Fee Schedule' : 'Create Course Fee Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

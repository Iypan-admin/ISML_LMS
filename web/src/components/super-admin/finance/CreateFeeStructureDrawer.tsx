// ============================================================================
// ISML COLLEGE LMS — CREATE FEE STRUCTURE DRAWER
// Version-Controlled Term Fee Schedules with Component Breakdown
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
} from 'lucide-react';
import { FeeStructure, FeeStructureItem, RequestStatus } from '@/types/rbac';
import { mockPrograms, mockBatches, mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateFeeStructureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFeeStructureCreated: (newFeeStructure: FeeStructure) => void;
  editFeeStructure?: FeeStructure | null;
  onFeeStructureUpdated?: (updatedFeeStructure: FeeStructure) => void;
}

export default function CreateFeeStructureDrawer({
  isOpen,
  onClose,
  onFeeStructureCreated,
  editFeeStructure,
  onFeeStructureUpdated,
}: CreateFeeStructureDrawerProps) {
  const { showSuccess, showError } = useToast();
  const isEditMode = Boolean(editFeeStructure);

  const [programId, setProgramId] = useState(mockPrograms[0]?.id || 'prog-bsc-cs');
  const [batchId, setBatchId] = useState(mockBatches[0]?.id || 'batch-2026-cs');
  const [semesterNumber, setSemesterNumber] = useState(1);
  const [academicYear, setAcademicYear] = useState('2026–2027');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-07-01');
  const [effectiveTo, setEffectiveTo] = useState('2026-11-30');
  const [status, setStatus] = useState<RequestStatus>('APPROVED');

  // Components breakdown
  const [tuitionAmount, setTuitionAmount] = useState(33500);
  const [labAmount, setLabAmount] = useState(6500);
  const [examAmount, setExamAmount] = useState(3500);
  const [registrationAmount, setRegistrationAmount] = useState(2500);
  const [techAmount, setTechAmount] = useState(2000);

  const selectedProgram = useMemo(() => {
    return mockPrograms.find((p) => p.id === programId) || mockPrograms[0];
  }, [programId]);

  const selectedBatch = useMemo(() => {
    return mockBatches.find((b) => b.id === batchId) || mockBatches[0];
  }, [batchId]);

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
    : `FEESTR-${selectedProgram.code}-S${semesterNumber}-V${Date.now().toString().slice(-2)}`;

  useEffect(() => {
    if (isOpen) {
      if (editFeeStructure) {
        setProgramId(editFeeStructure.programId);
        setBatchId(editFeeStructure.batchId);
        setSemesterNumber(editFeeStructure.semesterNumber);
        setAcademicYear(editFeeStructure.academicYear);
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
        setProgramId(mockPrograms[0]?.id || 'prog-bsc-cs');
        setBatchId(mockBatches[0]?.id || 'batch-2026-cs');
        setSemesterNumber(1);
        setAcademicYear('2026–2027');
        setEffectiveFrom('2026-07-01');
        setEffectiveTo('2026-11-30');
        setStatus('APPROVED');
        setTuitionAmount(33500);
        setLabAmount(6500);
        setExamAmount(3500);
        setRegistrationAmount(2500);
        setTechAmount(2000);
      }
    }
  }, [isOpen, editFeeStructure]);

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
      { componentCode: 'TUITION_FEE', componentName: 'Academic Tuition Fee', amount: tuitionAmount, isOptional: false },
      { componentCode: 'LAB_FEE', componentName: 'Computing & Practical Lab Fee', amount: labAmount, isOptional: false },
      { componentCode: 'EXAM_FEE', componentName: 'CIA & Semester Exam Evaluations', amount: examAmount, isOptional: false },
      { componentCode: 'REGISTRATION_FEE', componentName: 'University Registration & Admission', amount: registrationAmount, isOptional: false },
      { componentCode: 'TECH_FEE', componentName: 'ISML LMS & Technology Access Fee', amount: techAmount, isOptional: false },
    ];

    if (isEditMode && editFeeStructure) {
      const updatedStructure: FeeStructure = {
        ...editFeeStructure,
        programId: selectedProgram.id,
        programName: selectedProgram.name,
        departmentName: selectedProgram.departmentName,
        batchId: selectedBatch.id,
        batchName: selectedBatch.name,
        semesterNumber,
        academicYear,
        totalAmount,
        components,
        effectiveFrom,
        effectiveTo,
        status,
      };

      onFeeStructureUpdated?.(updatedStructure);
      showSuccess(`Fee schedule ${editFeeStructure.code} updated successfully.`);
      onClose();
      return;
    }

    const newStructure: FeeStructure = {
      id: `fee-${Date.now().toString().slice(-4)}`,
      code: scheduleCode,
      programId: selectedProgram.id,
      programName: selectedProgram.name,
      departmentName: selectedProgram.departmentName,
      batchId: selectedBatch.id,
      batchName: selectedBatch.name,
      semesterNumber,
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
    showSuccess(`Fee schedule ${scheduleCode} (₹${totalAmount.toLocaleString('en-IN')}) provisioned.`);
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
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isEditMode ? 'Edit Fee Schedule' : 'Create Fee Schedule'}
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
                {isEditMode
                  ? 'Update term fee items & authorization governance'
                  : 'Define term tuition fee breakdown & audit governance'}
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
            {/* Program Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Degree Program <span className="text-rose-500">*</span>
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cohort Batch
                </label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {mockBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Semester Term
                </label>
                <select
                  value={semesterNumber}
                  onChange={(e) => setSemesterNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
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
                Component Breakdown (Per Semester)
              </span>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-700">Academic Tuition Fee</span>
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
                  <span className="font-semibold text-slate-700">Practical & Computer Lab Fee</span>
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
                  <span className="font-semibold text-slate-700">CIA & Examination Fee</span>
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
                  <span className="font-semibold text-slate-700">University Registration</span>
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
                  Total Semester Fee
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
              <span>{isEditMode ? 'Update Fee Schedule' : 'Create Fee Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

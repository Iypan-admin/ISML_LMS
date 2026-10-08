// ============================================================================
// ISML COLLEGE LMS — CREATE PROGRAM & DEGREE COURSE SLIDE-OVER DRAWER
// Multi-Section Setup: Academic Identity + Fee Structure Master + Batch Cohorts
// ============================================================================

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Layers,
  IndianRupee,
  CalendarRange,
  BookOpen,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  ArrowRight,
  Shield,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  Users,
} from 'lucide-react';
import { Program, Batch } from '@/types/rbac';
import { mockDepartments, mockFeeStructures } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface CreateProgramDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProgramCreated: (newProgram: Program, newBatches: Batch[]) => void;
  editProgram?: Program | null;
  onProgramUpdated?: (updated: Program) => void;
}

export default function CreateProgramDrawer({
  isOpen,
  onClose,
  onProgramCreated,
  editProgram,
  onProgramUpdated,
}: CreateProgramDrawerProps) {
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(editProgram);

  // Active step / tab inside drawer
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'FEES' | 'BATCHES' | 'SUMMARY'>('IDENTITY');

  // ─── 1. Academic Identity ───
  const [departmentId, setDepartmentId] = useState(mockDepartments[0].id);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [degreeType, setDegreeType] = useState<'UNDERGRADUATE' | 'POSTGRADUATE' | 'DIPLOMA' | 'DOCTORAL'>('UNDERGRADUATE');
  const [durationYears, setDurationYears] = useState(3);
  const [totalSemesters, setTotalSemesters] = useState(6);
  const [description, setDescription] = useState('');

  // ─── 2. Fee Configuration ───
  const [feeMode, setFeeMode] = useState<'TEMPLATE' | 'CUSTOM'>('CUSTOM');
  const [selectedFeeTemplateId, setSelectedFeeTemplateId] = useState<string>(mockFeeStructures[0]?.id || '');

  // Custom Fee Components
  const [tuitionFee, setTuitionFee] = useState<number>(36000);
  const [labFee, setLabFee] = useState<number>(6500);
  const [admissionFee, setAdmissionFee] = useState<number>(2500);
  const [examFee, setExamFee] = useState<number>(3500);
  const [technologyFee, setTechnologyFee] = useState<number>(2000);

  // ─── 3. Batches Configuration ───
  const [admissionYear, setAdmissionYear] = useState<number>(2026);
  const [sectionsCount, setSectionsCount] = useState<number>(2);
  const [intakePerSection, setIntakePerSection] = useState<number>(60);
  const [shiftType, setShiftType] = useState<string>('REGULAR_DAY');

  // Auto-calculated fees
  const calculatedSemesterFee = useMemo(() => {
    if (feeMode === 'TEMPLATE') {
      const template = mockFeeStructures.find((f) => f.id === selectedFeeTemplateId);
      return template ? template.totalAmount : 48000;
    }
    return (
      (Number(tuitionFee) || 0) +
      (Number(labFee) || 0) +
      (Number(admissionFee) || 0) +
      (Number(examFee) || 0) +
      (Number(technologyFee) || 0)
    );
  }, [feeMode, selectedFeeTemplateId, tuitionFee, labFee, admissionFee, examFee, technologyFee]);

  const calculatedAnnualFee = calculatedSemesterFee * 2;
  const calculatedTotalProgramFee = calculatedSemesterFee * totalSemesters;

  // Auto-calculated graduation year
  const graduationYear = admissionYear + durationYears;

  // When durationYears changes, sync totalSemesters
  const handleDurationChange = (years: number) => {
    setDurationYears(years);
    setTotalSemesters(years * 2);
  };

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      if (editProgram) {
        setActiveTab('IDENTITY');
        setName(editProgram.name || '');
        setCode(editProgram.code || '');
        setDepartmentId(editProgram.departmentId || mockDepartments[0].id);
        setDegreeType(editProgram.degreeType || 'UNDERGRADUATE');
        setDurationYears(editProgram.durationYears || 3);
        setTotalSemesters(editProgram.totalSemesters || 6);
        setDescription('');
        setFeeMode('CUSTOM');
        setTuitionFee(editProgram.semesterFee || 36000);
        setLabFee(0);
        setAdmissionFee(0);
        setExamFee(0);
        setTechnologyFee(0);
        setSectionsCount(editProgram.batchesCount || 2);
        setIntakePerSection(60);
        setAdmissionYear(2026);
      } else {
        setActiveTab('IDENTITY');
        setName('');
        setCode('');
        setDepartmentId(mockDepartments[0].id);
        setDegreeType('UNDERGRADUATE');
        setDurationYears(3);
        setTotalSemesters(6);
        setDescription('');
        setFeeMode('CUSTOM');
        setTuitionFee(36000);
        setLabFee(6500);
        setAdmissionFee(2500);
        setExamFee(3500);
        setTechnologyFee(2000);
        setSectionsCount(2);
        setIntakePerSection(60);
        setAdmissionYear(2026);
      }
    }
  }, [isOpen, editProgram]);

  // Handle ESC key
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

  // Auto generate code from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code === 'AUTO') {
      const acronym = val
        .split(' ')
        .filter((w) => w.length > 0 && !['and', 'of', '&', 'in'].includes(w.toLowerCase()))
        .map((w) => w[0]?.toUpperCase())
        .join('');
      if (acronym.length >= 2) {
        setCode(acronym);
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Please enter a Program / Course name.');
      setActiveTab('IDENTITY');
      return;
    }
    if (!code.trim()) {
      showError('Please enter a Program code.');
      setActiveTab('IDENTITY');
      return;
    }

    const selectedDept = mockDepartments.find((d) => d.id === departmentId) || mockDepartments[0];

    if (isEditMode && editProgram) {
      const updatedProgram: Program = {
        ...editProgram,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        degreeType,
        durationYears,
        totalSemesters,
        semesterFee: calculatedSemesterFee,
        annualFee: calculatedAnnualFee,
        totalProgramFee: calculatedTotalProgramFee,
      };
      if (onProgramUpdated) {
        onProgramUpdated(updatedProgram);
      }
      showSuccess(`Program "${updatedProgram.name}" (${updatedProgram.code}) updated successfully.`);
      onClose();
      return;
    }

    const newProgramId = `prog-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    // Build Batch records
    const generatedBatches: Batch[] = [];
    const sectionLabels = ['Section A', 'Section B', 'Section C', 'Section D'];
    for (let i = 0; i < sectionsCount; i++) {
      const sectionLabel = sectionLabels[i] || `Section ${String.fromCharCode(65 + i)}`;
      generatedBatches.push({
        id: `batch-${admissionYear}-${code.toLowerCase()}-${i + 1}`,
        programId: newProgramId,
        programName: name,
        departmentName: selectedDept.name,
        name: `Cohort ${admissionYear}–${graduationYear} (${sectionLabel})`,
        admissionYear,
        graduationYear,
        currentSemesterNumber: 1,
        sectionsCount: 1,
        studentsCount: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    }

    const newProgram: Program = {
      id: newProgramId,
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      name,
      code: code.toUpperCase(),
      degreeType,
      durationYears,
      totalSemesters,
      batchesCount: sectionsCount,
      studentsCount: 0,
      semesterFee: calculatedSemesterFee,
      annualFee: calculatedAnnualFee,
      totalProgramFee: calculatedTotalProgramFee,
      feeStructureName: `FEESTR-${code.toUpperCase()}-S1-V1`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      initialBatches: generatedBatches.map((b) => ({
        name: b.name,
        intakeCapacity: intakePerSection,
        shift: shiftType,
      })),
    };

    onProgramCreated(newProgram, generatedBatches);
    showSuccess(`Program "${name}" provisioned with ${sectionsCount} batches and ₹${calculatedSemesterFee.toLocaleString('en-IN')}/sem fee structure.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300 font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#19376D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <GraduationCap className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {isEditMode ? 'Edit Academic Program & Course' : 'New Program & Degree Course Provisioning'}
                </h2>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Academic Master
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Configure curriculum identity, link per-semester fee schedules, and initialize cohort batches.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('IDENTITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'IDENTITY'
                ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>1. Degree & Course Identity</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FEES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'FEES'
                ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Fee Schedule (₹)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BATCHES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BATCHES'
                ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>3. Batches & Cohorts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SUMMARY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SUMMARY'
                ? 'bg-white text-[#0052CC] shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Review & Launch</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ────────────────────────────────────────────────────────────────── */}
            {/* TAB 1: ACADEMIC & COURSE IDENTITY */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {activeTab === 'IDENTITY' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start gap-2.5 text-blue-900 text-xs">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    Each Degree Program represents an accredited curriculum tier (e.g. B.Sc, B.Tech, M.Sc, MBA) housing structured semesters, course syllabi, and cohort batches.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Academic Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      required
                    >
                      {mockDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Degree Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Degree Classification <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={degreeType}
                      onChange={(e) => setDegreeType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      <option value="UNDERGRADUATE">Undergraduate (UG Degree)</option>
                      <option value="POSTGRADUATE">Postgraduate (PG Degree)</option>
                      <option value="DIPLOMA">Post-Diploma / Certification</option>
                      <option value="DOCTORAL">Doctoral (Ph.D. Research)</option>
                    </select>
                  </div>
                </div>

                {/* Program Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program / Degree Full Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. B.Tech Artificial Intelligence & Data Science"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Official name as printed on degree certificates and fee receipts.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Program Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Program Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BTECH-AIDS"
                      className="w-full px-3 py-2 font-mono uppercase font-bold border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                      required
                    />
                  </div>

                  {/* Duration in Years */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Duration (Years)
                    </label>
                    <select
                      value={durationYears}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      <option value={1}>1 Year (Fast-track)</option>
                      <option value={2}>2 Years (Standard PG)</option>
                      <option value={3}>3 Years (Standard UG Arts/Science)</option>
                      <option value={4}>4 Years (Engineering / Honors)</option>
                      <option value={5}>5 Years (Integrated Master's)</option>
                    </select>
                  </div>

                  {/* Total Semesters */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Semesters
                    </label>
                    <input
                      type="number"
                      value={totalSemesters}
                      onChange={(e) => setTotalSemesters(Number(e.target.value))}
                      min={1}
                      max={12}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Scope & Curriculum Objective
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Briefly describe the academic focus, industry certifications, and learning outcomes..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* TAB 2: FEES CONFIGURATION */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {activeTab === 'FEES' && (
              <div className="space-y-5">
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-emerald-900 text-xs">
                  <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Set tuition and institutional fee breakdown for this program. This automatically binds with student billing and fee payment policies.
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFeeMode('CUSTOM')}
                    className={`flex-1 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      feeMode === 'CUSTOM'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">
                      Custom Component Breakdown
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Configure tuition, lab, examination & LMS fee amounts directly
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeeMode('TEMPLATE')}
                    className={`flex-1 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      feeMode === 'TEMPLATE'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">
                      Inherit Approved Master Template
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Link with existing pre-approved Finance Master schedule
                    </span>
                  </button>
                </div>

                {feeMode === 'TEMPLATE' ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Approved Fee Schedule
                    </label>
                    <select
                      value={selectedFeeTemplateId}
                      onChange={(e) => setSelectedFeeTemplateId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      {mockFeeStructures.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.code} — {f.programName} (₹{f.totalAmount.toLocaleString('en-IN')}/sem)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tuition Fee */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Academic Tuition Fee (Per Semester)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={tuitionFee}
                          onChange={(e) => setTuitionFee(Number(e.target.value))}
                          step={500}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                        />
                      </div>
                    </div>

                    {/* Lab Fee */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Computing Lab & Practical Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={labFee}
                          onChange={(e) => setLabFee(Number(e.target.value))}
                          step={500}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                        />
                      </div>
                    </div>

                    {/* Examination Fee */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Examination & CIA Evaluation Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={examFee}
                          onChange={(e) => setExamFee(Number(e.target.value))}
                          step={500}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                        />
                      </div>
                    </div>

                    {/* University Registration / Admission Fee */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        University Registration / Admission Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={admissionFee}
                          onChange={(e) => setAdmissionFee(Number(e.target.value))}
                          step={500}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                        />
                      </div>
                    </div>

                    {/* Technology & LMS Fee */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Technology Infrastructure & ISML LMS Access Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          value={technologyFee}
                          onChange={(e) => setTechnologyFee(Number(e.target.value))}
                          step={500}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Computed Financial Summary Card */}
                <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-700/60 pb-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                        Live Computed Fee Schedule
                      </span>
                      <h4 className="text-sm font-bold text-white">Estimated Student Financial Obligation</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold text-emerald-200">
                      {totalSemesters} Semesters Total
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 bg-white/10 rounded-xl">
                      <span className="text-[10px] text-emerald-200 block uppercase font-medium">Per Semester</span>
                      <p className="text-base font-bold text-white mt-0.5">
                        ₹{calculatedSemesterFee.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="p-2.5 bg-white/10 rounded-xl">
                      <span className="text-[10px] text-emerald-200 block uppercase font-medium">Annual Academic Fee</span>
                      <p className="text-base font-bold text-white mt-0.5">
                        ₹{calculatedAnnualFee.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="p-2.5 bg-white/20 rounded-xl border border-white/20">
                      <span className="text-[10px] text-emerald-100 block uppercase font-bold">Full Program Cost</span>
                      <p className="text-base font-bold text-emerald-300 mt-0.5">
                        ₹{calculatedTotalProgramFee.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* TAB 3: BATCHES & COHORTS */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {activeTab === 'BATCHES' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-start gap-2.5 text-indigo-900 text-xs">
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    Configure initial student cohort batches for this course. Sections and capacity will be initialized automatically in the Academic Master directory.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Matriculation Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Admission Cohort Year
                    </label>
                    <input
                      type="number"
                      value={admissionYear}
                      onChange={(e) => setAdmissionYear(Number(e.target.value))}
                      min={2024}
                      max={2030}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  {/* Initial Sections */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Initial Batch Sections
                    </label>
                    <select
                      value={sectionsCount}
                      onChange={(e) => setSectionsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      <option value={1}>1 Section (Section A)</option>
                      <option value={2}>2 Sections (Section A & B)</option>
                      <option value={3}>3 Sections (Section A, B, C)</option>
                      <option value={4}>4 Sections (Section A, B, C, D)</option>
                    </select>
                  </div>

                  {/* Intake per section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Intake Capacity / Section
                    </label>
                    <input
                      type="number"
                      value={intakePerSection}
                      onChange={(e) => setIntakePerSection(Number(e.target.value))}
                      min={10}
                      max={120}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>
                </div>

                {/* Shift Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Delivery Shift
                  </label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  >
                    <option value="REGULAR_DAY">Day Regular (Shift I — 08:30 AM to 01:30 PM)</option>
                    <option value="EVENING_SELF_FINANCED">Evening / Self-Financed (Shift II — 01:45 PM to 06:45 PM)</option>
                    <option value="HYBRID_WEEKEND">Hybrid Executive & Weekend</option>
                  </select>
                </div>

                {/* Generated Batches Preview */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Batches Ready for Provisioning ({sectionsCount} Cohorts)
                  </span>
                  <div className="space-y-2">
                    {Array.from({ length: sectionsCount }).map((_, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {letter}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                Cohort {admissionYear}–{graduationYear} (Section {letter})
                              </p>
                              <span className="text-[10px] text-slate-500">
                                Starting Semester 1 • {shiftType === 'REGULAR_DAY' ? 'Day Shift' : 'Evening Shift'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold text-[10px] border border-indigo-200">
                              {intakePerSection} Seats Max
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────────────── */}
            {/* TAB 4: REVIEW & LAUNCH SUMMARY */}
            {/* ────────────────────────────────────────────────────────────────── */}
            {activeTab === 'SUMMARY' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-[#0B2447] text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Program Master Summary</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Program Title</span>
                      <p className="font-bold text-slate-900 truncate">{name || 'Untitled Course'}</p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Course Code</span>
                      <p className="font-mono font-bold text-[#0052CC]">{code || 'PENDING'}</p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Department</span>
                      <p className="font-semibold text-slate-800 truncate">
                        {mockDepartments.find((d) => d.id === departmentId)?.name}
                      </p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Duration</span>
                      <p className="font-semibold text-slate-800">
                        {durationYears} Years ({totalSemesters} Semesters)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Linked Fee Schedule</span>
                    </span>
                    <span className="font-bold text-emerald-800 text-xs">
                      ₹{calculatedSemesterFee.toLocaleString('en-IN')} / Semester
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Total Degree Financial Schedule:</span>
                    <span className="font-bold text-slate-900">₹{calculatedTotalProgramFee.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Batches Summary */}
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Cohort Batches to Generate</span>
                    </span>
                    <span className="font-bold text-indigo-800 text-xs">
                      {sectionsCount} Sections ({sectionsCount * intakePerSection} Total Seats)
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    Cohorts will be generated for admission year {admissionYear} graduating in {graduationYear}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab === 'IDENTITY' && (
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      showError('Please enter program title.');
                      return;
                    }
                    setActiveTab('FEES');
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Fees Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {activeTab === 'FEES' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('BATCHES')}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Batches Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {activeTab === 'BATCHES' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('SUMMARY')}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review & Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {activeTab === 'SUMMARY' && (
                <button
                  type="submit"
                  className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEditMode ? 'Save & Update Program' : 'Provision Program, Fees & Batches'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

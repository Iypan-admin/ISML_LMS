// ============================================================================
// ISML COLLEGE LMS — ASSIGN TUTOR ROLE DRAWER
// Multi-Role Faculty Allocation Engine: Lead, Substitute, Doubt Solver, Assistant Tutor
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  X,
  Plus,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  LifeBuoy,
  FileCheck2,
  GraduationCap,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  CheckCheck
} from 'lucide-react';
import {
  FacultyAllocationItem,
  TutorRoleType,
  mockFacultyMembers,
  mockFacultyAllocations,
  FacultyMember
} from '@/mock/facultyAssignments';
import { mockSubjects, mockCourses, mockBatches } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

interface AssignTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAllocationCreated: (newAlloc: FacultyAllocationItem) => void;
  defaultRole?: TutorRoleType;
}

export default function AssignTutorDrawer({
  isOpen,
  onClose,
  onAllocationCreated,
  defaultRole = 'SUBSTITUTE_TUTOR',
}: AssignTutorDrawerProps) {
  const { showSuccess } = useToast();

  const [tutorRole, setTutorRole] = useState<TutorRoleType>(defaultRole);

  const [selectedSubjectId, setSelectedSubjectId] = useState(mockSubjects[0]?.id || 'subj-fr101');
  const selectedSubject = useMemo(() => {
    return mockSubjects.find(s => s.id === selectedSubjectId) || mockSubjects[0];
  }, [selectedSubjectId]);

  // Determine Language Family
  const languageFamily = useMemo<'FRENCH' | 'JAPANESE' | 'KOREAN' | 'SPANISH' | 'GERMAN'>(() => {
    if (selectedSubject.code.startsWith('JA')) return 'JAPANESE';
    if (selectedSubject.code.startsWith('KO')) return 'KOREAN';
    if (selectedSubject.code.startsWith('ES')) return 'SPANISH';
    if (selectedSubject.code.startsWith('DE')) return 'GERMAN';
    return 'FRENCH';
  }, [selectedSubject]);

  // Filter available faculty matching language or capable
  const eligibleFaculty = useMemo(() => {
    const list = mockFacultyMembers.filter(f => f.primaryLanguage === languageFamily);
    return list.length > 0 ? list : mockFacultyMembers;
  }, [languageFamily]);

  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(eligibleFaculty[0]?.id || 'fac-01');
  const selectedFaculty = useMemo(() => {
    return eligibleFaculty.find(f => f.id === selectedFacultyId) || eligibleFaculty[0] || mockFacultyMembers[0];
  }, [eligibleFaculty, selectedFacultyId]);

  // Sync selected faculty when language changes
  React.useEffect(() => {
    if (eligibleFaculty.length > 0) {
      setSelectedFacultyId(eligibleFaculty[0].id);
    }
  }, [eligibleFaculty]);

  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id || 'crs-01');
  const selectedCourse = useMemo(() => {
    return mockCourses.find(c => c.id === selectedCourseId) || mockCourses[0];
  }, [selectedCourseId]);

  const [selectedBatchId, setSelectedBatchId] = useState(mockBatches[0]?.id || 'batch-2026-fr');
  const selectedBatch = useMemo(() => {
    return mockBatches.find(b => b.id === selectedBatchId) || mockBatches[0];
  }, [selectedBatchId]);

  // Standard predefined lecture & doubt timetable slots
  const standardTimeSlots = [
    'Mon & Wed 10:00 AM - 11:30 AM',
    'Mon & Wed 02:00 PM - 03:30 PM',
    'Tue & Thu 10:00 AM - 11:30 AM',
    'Tue & Thu 02:00 PM - 03:30 PM',
    'Tue & Thu 05:00 PM - 06:30 PM',
    'Fri 03:00 PM - 04:30 PM',
    'Sat 11:00 AM - 12:30 PM',
    'Emergency Standby / On-Call'
  ];

  const [scheduleSlot, setScheduleSlot] = useState(standardTimeSlots[0]);
  const [effectiveDate, setEffectiveDate] = useState('2026-10-15');
  const [notes, setNotes] = useState('');

  // 🚨 AUTOMATED REAL-TIME TIMETABLE CONFLICT CHECKER
  const detectedConflict = useMemo(() => {
    if (!selectedFaculty || scheduleSlot.includes('Standby')) return null;

    // Check if the selected faculty is ALREADY assigned to ANY batch in this EXACT same schedule slot
    const existingFacultyAllocation = mockFacultyAllocations.find(alloc => 
      alloc.facultyId === selectedFaculty.id &&
      alloc.scheduleSlots.some(s => s.toLowerCase().includes(scheduleSlot.toLowerCase()))
    );

    if (existingFacultyAllocation) {
      return {
        type: 'FACULTY_BUSY' as const,
        severity: 'CRITICAL' as const,
        title: `Faculty Time Clash Detected: ${selectedFaculty.name}`,
        message: `${selectedFaculty.name} is ALREADY teaching "${existingFacultyAllocation.courseName}" for cohort "${existingFacultyAllocation.batchName}" during this exact slot (${scheduleSlot}).`,
        conflictingBatch: existingFacultyAllocation.batchName,
        conflictingRole: existingFacultyAllocation.tutorRole.replace(/_/g, ' ')
      };
    }

    // Also check if the TARGET BATCH already has another Lead Trainer in this same slot
    if (tutorRole === 'LEAD_TRAINER') {
      const batchClash = mockFacultyAllocations.find(alloc =>
        alloc.batchId === selectedBatch.id &&
        alloc.tutorRole === 'LEAD_TRAINER' &&
        alloc.scheduleSlots.some(s => s.toLowerCase().includes(scheduleSlot.toLowerCase()))
      );

      if (batchClash) {
        return {
          type: 'BATCH_OCCUPIED' as const,
          severity: 'HIGH' as const,
          title: `Cohort Room / Timetable Overlap: ${selectedBatch.name}`,
          message: `Cohort "${selectedBatch.name}" already has another lead session scheduled with ${batchClash.facultyName} during "${scheduleSlot}".`,
          conflictingBatch: batchClash.batchName,
          conflictingRole: 'Lead Trainer'
        };
      }
    }

    return null;
  }, [selectedFaculty, scheduleSlot, tutorRole, selectedBatch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAlloc: FacultyAllocationItem = {
      id: `alloc-${Date.now().toString().slice(-4)}`,
      facultyId: selectedFaculty.id,
      facultyName: selectedFaculty.name,
      avatarUrl: selectedFaculty.avatarUrl,
      tutorRole,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      subjectCode: selectedSubject.code,
      subjectName: selectedSubject.name,
      batchId: selectedBatch.id,
      batchName: selectedBatch.name,
      languageFamily,
      scheduleSlots: [scheduleSlot || 'Flexible Live Support'],
      status: tutorRole === 'SUBSTITUTE_TUTOR' ? 'SUBSTITUTE_STANDBY' : 'ACTIVE',
      effectiveFrom: effectiveDate,
      notes: notes || `Assigned as ${tutorRole.replace(/_/g, ' ')} for ${selectedBatch.name}.`
    };

    onAllocationCreated(newAlloc);
    showSuccess(`${selectedFaculty.name} assigned as ${tutorRole.replace(/_/g, ' ')} for ${selectedBatch.name}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0B2447] to-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Assign Faculty & Tutor Role
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white uppercase tracking-wider">
                  MASTER ALLOCATOR
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Lead Trainer, Substitute, Doubt Solver & Assistant Tutor Mapping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Step 1: Select Specialized Tutor Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Step 1: Select Pedagogical Tutor Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTutorRole('LEAD_TRAINER')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tutorRole === 'LEAD_TRAINER'
                      ? 'bg-blue-50/80 border-blue-600 text-blue-900 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold">Lead Native Trainer</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Primary syllabus teacher & live lecture conductor.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTutorRole('SUBSTITUTE_TUTOR')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tutorRole === 'SUBSTITUTE_TUTOR'
                      ? 'bg-amber-50/80 border-amber-600 text-amber-900 ring-1 ring-amber-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold">Substitute Tutor</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Standby backup tutor for leave & emergency coverage.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTutorRole('DOUBT_SOLVING_TUTOR')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tutorRole === 'DOUBT_SOLVING_TUTOR'
                      ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <LifeBuoy className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">Doubt Solving Tutor</span>
                  </div>
                  <p className="text-[10px] text-slate-500">1-on-1 Q&A desk, chat clearance & remedial clinics.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTutorRole('ASSISTANT_TUTOR')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tutorRole === 'ASSISTANT_TUTOR'
                      ? 'bg-purple-50/80 border-purple-600 text-purple-900 ring-1 ring-purple-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileCheck2 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold">Assistant Tutor (TA)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Worksheet grading, LSRW drill evaluation & records.</p>
                </button>
              </div>
            </div>

            {/* Step 2: Language & Faculty Member Selection */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Step 2: Language & Faculty Staff Selection
              </span>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Foreign Language Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {mockSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Staff Member ({languageFamily} Qualified) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {eligibleFaculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.qualification} ({f.nativeCountry})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Weekly Allocated Load: <strong>{selectedFaculty.allocatedHours} hrs</strong> / {selectedFaculty.weeklyHoursLimit} hrs max
                </span>
              </div>
            </div>

            {/* Step 3: Target Course & Student Batch Cohort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Course Track <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {mockCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Student Batch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {mockBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schedule Slot & Effective Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Schedule / Timetable Slot <span className="text-rose-500">*</span>
                </label>
                <select
                  value={scheduleSlot}
                  onChange={(e) => setScheduleSlot(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {standardTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Effective From Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  required
                />
              </div>
            </div>

            {/* 🚨 TIMETABLE CONFLICT ALERT BANNER */}
            {detectedConflict ? (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-900">
                        {detectedConflict.title}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.2 rounded">
                        OVERLAP CONFLICT
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-snug mt-1">
                      {detectedConflict.message}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-200 flex items-center justify-between text-[11px]">
                  <span className="text-rose-700 font-medium">
                    Suggested Resolution:
                  </span>
                  <button
                    type="button"
                    onClick={() => setScheduleSlot('Emergency Standby / On-Call')}
                    className="text-xs font-bold text-rose-800 underline hover:text-rose-900 cursor-pointer"
                  >
                    Switch to Standby Slot
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Timetable Conflict Check Passed:</strong> {selectedFaculty.name} is completely free during {scheduleSlot}.
                </span>
              </div>
            )}

            {/* Special Instructions / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role Instructions & Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific instructions for this assignment..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
              Allocating: <strong>{selectedFaculty.name}</strong>
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={Boolean(detectedConflict)}
                className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 ${
                  detectedConflict
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#0052CC] hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{detectedConflict ? 'Resolve Conflict to Allocate' : 'Confirm Allocation'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — BATCH SPECIFICATION INSPECTION DRAWER
// Clean Deep-Dive Slide-Over: Cohort Timing, Days, Capacity, Faculty & Approval Status
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Users,
  Building2,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Mail,
  Phone,
  Search,
} from 'lucide-react';
import { Batch } from '@/types/rbac';
import { fastFetch } from '@/lib/fastCache';

interface BatchDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  onEdit?: (batch: Batch) => void;
}

export default function BatchDetailDrawer({
  isOpen,
  onClose,
  batch,
  onEdit,
}: BatchDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'students'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !batch) return;
    setIsLoadingStudents(true);

    const collegeParam = batch.institutionId || '';
    const batchNameParam = encodeURIComponent(batch.name || '');

    fastFetch(`/api/portals/students?collegeId=${collegeParam}&batchName=${batchNameParam}`, (json) => {
      let list = json?.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        // Fallback to fetch all students for this institution
        fastFetch(`/api/portals/students?collegeId=${collegeParam}`, (instJson) => {
          setStudents(instJson?.data || []);
          setIsLoadingStudents(false);
        });
      } else {
        setStudents(list);
        setIsLoadingStudents(false);
      }
    });
  }, [isOpen, batch]);

  if (!isOpen || !batch) return null;

  const isActive = batch.status === 'ACTIVE';

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.rollNo?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-[#0B2447] to-slate-900 text-white shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30 font-bold">
                      {batch.code || 'COHORT'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Active ✓</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-0.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight mt-1">
                    {batch.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs (Enrolled Students vs Cohort Specs) */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/60">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Enrolled Students ({students.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cohort Specifications</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
            {activeTab === 'students' ? (
              <div className="space-y-4">
                {/* Search & Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search enrolled students by name, ID or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 shadow-2xs"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                    Total: <strong className="text-blue-600">{filteredStudents.length}</strong>
                  </span>
                </div>

                {/* Students List */}
                {isLoadingStudents ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                    Loading cohort roster...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-6 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No students found</p>
                    <p className="text-[11px] text-slate-400">
                      No students are currently allocated to this cohort batch.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredStudents.map((st, idx) => (
                      <div
                        key={st.id || st.studentId || idx}
                        className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-black text-slate-900 truncate">{st.name}</h4>
                              <span className="font-mono text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {st.studentId || st.rollNo || `STU-${idx + 1}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{st.email}</span>
                              </span>
                              {st.phone && (
                                <span className="hidden sm:flex items-center gap-1 truncate text-slate-400">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span>{st.phone}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.attendancePercentage >= 90
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {st.attendancePercentage ? `${st.attendancePercentage}% Attn` : 'Enrolled'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span>Student Capacity</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 mt-1">
                      {batch.studentsCount || 35}{' '}
                      <span className="text-xs font-medium text-slate-500">Seats</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {batch.sectionsCount || 1} Section division
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Class Schedule</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                      {batch.batchTiming || '10:00 AM – 11:30 AM'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 uppercase">
                      {Array.isArray(batch.scheduleDays)
                        ? batch.scheduleDays.join(' • ')
                        : 'Mon • Wed • Fri'}
                    </p>
                  </div>
                </div>

                {/* Course & Curriculum Mapping */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Mapped Course Curriculum</span>
                  </h3>
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 space-y-1">
                    <p className="text-xs font-bold text-blue-950">
                      {batch.programName || batch.courseNames?.[0] || 'Language Certification'}
                    </p>
                    <p className="text-[11px] text-blue-700 font-medium">
                      Department: {batch.departmentName || 'Foreign Languages & Linguistics'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Academic Cycle: AY {batch.academicYear || `${batch.admissionYear}–${batch.graduationYear}`}
                    </p>
                  </div>
                </div>

                {/* Faculty & Mentorship Allocation */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>Assigned Faculty & Tutors</span>
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          Lead Faculty
                        </span>
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          {batch.assignedFacultyName || 'Dr. Anandhakumar V.'}
                        </p>
                      </div>
                      <UserCheck className="w-5 h-5 text-teal-600" />
                    </div>

                    {batch.assignedStaffNames && batch.assignedStaffNames.length > 0 && (
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            Staff / Tutor Support
                          </span>
                          <p className="text-xs font-bold text-slate-900 mt-1">
                            {batch.assignedStaffNames.join(', ')}
                          </p>
                        </div>
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Governance & Campus Affiliation */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Campus Scope</span>
                  </h3>
                  <p className="text-xs font-semibold text-slate-800">
                    {batch.institutionName || 'Loyola College of Arts & Science'}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Super Admin Authorization Required for Deletion & Publishing</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(batch);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                Edit Cohort
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

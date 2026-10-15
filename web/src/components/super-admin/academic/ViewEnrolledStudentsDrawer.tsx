// ============================================================================
// ISML COLLEGE LMS — VIEW COHORT DETAILS (STAFFS & STUDENTS) DRAWER
// Right-Side Slide Drawer displaying:
// 1. Enrolled Students roster
// 2. Assigned Staffs / Faculty, Substitute Tutors & Schedule Timing
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  X,
  Search,
  GraduationCap,
  Building2,
  Layers,
  HeartHandshake,
  ExternalLink,
  BookOpen,
  UserCheck,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { StudentUser } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';

export interface BatchStaffInfo {
  facultyName?: string;
  substituteTutors?: string[];
  doubtTutor?: string;
  batchTiming?: string;
  scheduleDays?: string[];
  courseNames?: string[];
}

interface ViewEnrolledStudentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  students: StudentUser[];
  staffInfo?: BatchStaffInfo;
}

export default function ViewEnrolledStudentsDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  students,
  staffInfo,
}: ViewEnrolledStudentsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'STAFFS'>('STUDENTS');
  const [search, setSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle ESC
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

  if (!isOpen) return null;

  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.parentName || '').toLowerCase().includes(q) ||
      (s.batchName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 transition-all ${
          isFullscreen ? 'w-full max-w-full' : 'w-full max-w-xl md:max-w-2xl lg:max-w-3xl'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E3A8A] bg-[#0B2447] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">{title}</h2>
              <p className="text-[11px] text-cyan-300 font-semibold truncate">
                {subtitle || `${students.length} Enrolled Learners`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              title={isFullscreen ? 'Exit Full Screen' : 'View Full Screen'}
            >
              {isFullscreen ? (
                <span className="text-xs font-bold px-2 py-0.5 bg-white/10 rounded border border-white/20">
                  Minimize
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 bg-white/10 rounded border border-white/20">
                  Full Screen
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Students vs Staffs & Schedule */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('STUDENTS')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STUDENTS'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Enrolled Students ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STAFFS')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STAFFS'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assigned Staffs & Timings</span>
          </button>
        </div>

        {activeTab === 'STUDENTS' ? (
          <>
            {/* Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#0052CC]">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter by student name, roll no, parent..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div
                className={`gap-3.5 ${
                  isFullscreen
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid grid-cols-1 md:grid-cols-2'
                }`}
              >
                {filtered.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
                  >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-[#0B2447]">{s.name}</h4>
                        <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {s.studentId}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Campus</span>
                      <span className="font-bold text-slate-800 truncate block">{s.collegeName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cohort Batch</span>
                      <span className="font-bold text-slate-800 truncate block">{s.batchName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Parent / Guardian</span>
                      <span className="font-semibold text-slate-700">
                        {s.parentName || '—'} {s.parentRelationship ? `(${s.parentRelationship})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Attendance</span>
                      <span className="font-bold text-emerald-700">{s.attendancePercentage}%</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">{s.email}</span>
                    <Link
                      href={`/super-admin/students/${s.id}`}
                      onClick={onClose}
                      className="text-[11px] font-bold text-[#0052CC] hover:underline flex items-center gap-1"
                    >
                      <span>Full Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No learners matching the query.
                </div>
              )}
            </div>
          </>
        ) : (
          /* Staffs & Timings Tab */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className={`gap-4 ${isFullscreen ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}`}>
              {/* Timing Card */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-2xl border border-indigo-200 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Class Timings & Scheduled Days</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Timing Slot</span>
                    <span className="font-black text-slate-900 text-sm">
                      {staffInfo?.batchTiming || '09:00 AM – 11:00 AM (Morning Session)'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Week Days</span>
                    <span className="font-bold text-indigo-700 text-xs">
                      {(staffInfo?.scheduleDays && staffInfo.scheduleDays.length > 0)
                        ? staffInfo.scheduleDays.join(', ')
                        : 'MON, WED, FRI'}
                    </span>
                  </div>
                </div>
              </div>

            {/* Lead Faculty Card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Lead Faculty Incharge</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Primary Lead
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0052CC] font-bold flex items-center justify-center shrink-0">
                  👨‍🏫
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {staffInfo?.facultyName || 'Dr. Anandhakumar V.'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Assigned Professor • Responsible for Course Lectures & Syllabus
                  </p>
                </div>
              </div>
            </div>

            {/* Doubt Resolution / TA Card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Doubt Resolution Tutor / Teaching Assistant</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Student Support
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                  🙋‍♂️
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {staffInfo?.doubtTutor || 'Mr. Karthik Sundaram (TA)'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Available during lab sessions & student doubt resolution hours
                  </p>
                </div>
              </div>
            </div>

            {/* Substitute Tutors */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Substitute Tutors on Call</span>
              </span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-800">
                  Ms. Ananya Sharma (TA), Prof. Rajesh Raman
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Empowered to conduct lectures if the lead faculty is unavailable.
                </p>
              </div>
            </div>

            {/* Mapped Curricula */}
            {staffInfo?.courseNames && staffInfo.courseNames.length > 0 && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Mapped Curricula ({staffInfo.courseNames.length} Courses)</span>
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {staffInfo.courseNames.map((cn, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-bold"
                    >
                      {cn}
                    </span>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-500">
            {activeTab === 'STUDENTS'
              ? `Showing ${filtered.length} of ${students.length} students`
              : `Cohort Operational Profile`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

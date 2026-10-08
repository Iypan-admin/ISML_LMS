// ============================================================================
// ISML COLLEGE LMS — VIEW ENROLLED LEARNERS SLIDE-OVER DRAWER
// Right-Side Slide Drawer displaying Students Enrolled in a Course or Batch
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
} from 'lucide-react';
import { StudentUser } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';

interface ViewEnrolledStudentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  students: StudentUser[];
}

export default function ViewEnrolledStudentsDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  students,
}: ViewEnrolledStudentsDrawerProps) {
  const [search, setSearch] = useState('');

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

      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
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
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all space-y-2"
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

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No learners matching the query.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-500">
            Showing {filtered.length} of {students.length} students
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

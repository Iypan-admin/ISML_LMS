// ============================================================================
// ISML COLLEGE LMS — TUTOR / FACULTY SWITCHER BAR
// Allows testing multi-role perspective dynamically in development & production
// Marie Delacroix (French Lead), Kenji (Japanese Lead), Anandhakumar (French Substitute),
// Priya (French Doubt Solver), Arjun (Japanese Assistant), Kavitha (Korean Assistant)
// ============================================================================

"use client";

import React from 'react';
import { UserCheck, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { useTutor } from '@/context/TutorContext';

export default function FacultyRoleSwitcherBar() {
  const {
    activeFacultyId,
    setActiveFacultyId,
    currentFaculty,
    allFacultyList,
    myAllocations,
  } = useTutor();

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-sans">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-200 flex items-center justify-center shrink-0">
          <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
              Active Tutor Profile
            </span>
            <span className="text-xs font-bold text-slate-800 truncate">
              {currentFaculty.name} ({currentFaculty.primaryLanguage})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {currentFaculty.designation} • {myAllocations.length} Active Cohorts
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden md:inline">
          Switch Faculty:
        </span>
        <select
          value={activeFacultyId}
          onChange={(e) => setActiveFacultyId(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-[#0052CC]"
          title="Switch Tutor Profile"
        >
          {allFacultyList.map((f) => (
            <option key={f.id} value={f.id}>
              🧑‍🏫 {f.name} ({f.primaryLanguage})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

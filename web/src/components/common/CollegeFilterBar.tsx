// ============================================================================
// ISML COLLEGE LMS — REUSABLE COLLEGE FILTER BAR
// Compact, executive campus-scoping dropdown bar used across pages
// ============================================================================

"use client";

import React from 'react';
import { Building2, Globe, GraduationCap, ChevronDown } from 'lucide-react';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';

interface CollegeFilterBarProps {
  label?: string;
  className?: string;
}

export default function CollegeFilterBar({
  label,
  className = '',
}: CollegeFilterBarProps) {
  const {
    selectedCollegeId,
    setSelectedCollegeId,
    filteredInstitutions,
    institutionCategory,
    setInstitutionCategory,
    isOverall,
    selectedCollege,
    isSchoolMode,
    labels,
  } = useCollege();

  const displayLabel = label || `${labels.institution} Scope:`;

  return (
    <div
      className={`bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans ${className}`}
    >
      {/* 1. Left: Scope Icon & College/School Segmented Switcher */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 pl-1 shrink-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isSchoolMode ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#0052CC]'
          }`}>
            {isSchoolMode ? <GraduationCap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block leading-tight">
              {displayLabel}
            </span>
            <span className="text-xs font-black text-slate-900 leading-tight">
              {isOverall
                ? isSchoolMode ? '🏫 Overall (All Schools)' : '🏛️ Overall (All Colleges)'
                : `${isSchoolMode ? '🏫' : '🎓'} ${selectedCollege?.name}`}
            </span>
          </div>
        </div>

        {/* Segmented Switcher: Colleges vs Schools */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setInstitutionCategory('COLLEGE')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              institutionCategory === 'COLLEGE'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Colleges</span>
          </button>
          <button
            type="button"
            onClick={() => setInstitutionCategory('SCHOOL')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              institutionCategory === 'SCHOOL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Schools</span>
          </button>
        </div>
      </div>

      {/* 2. Right: Clean Institution Dropdown Select (Replaces long horizontal pill row) */}
      <div className="flex items-center gap-2">
        <div className="relative min-w-[220px] sm:min-w-[280px]">
          <select
            value={selectedCollegeId}
            onChange={(e) => setSelectedCollegeId(e.target.value)}
            className={`w-full appearance-none pl-9 pr-8 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 ${
              isSchoolMode
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 focus:ring-emerald-500'
                : 'bg-blue-50/60 border-blue-200 text-blue-950 focus:ring-[#0052CC]'
            }`}
          >
            <option value={OVERALL_COLLEGE_ID}>
              🌐 All {isSchoolMode ? 'Schools' : 'Campuses'} (Consolidated)
            </option>
            {filteredInstitutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {isSchoolMode ? '🏫' : '🎓'} [{inst.code}] {inst.name}
              </option>
            ))}
          </select>
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            {isOverall ? (
              <Globe className={`w-4 h-4 ${isSchoolMode ? 'text-emerald-600' : 'text-[#0052CC]'}`} />
            ) : isSchoolMode ? (
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            ) : (
              <Building2 className="w-4 h-4 text-[#0052CC]" />
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

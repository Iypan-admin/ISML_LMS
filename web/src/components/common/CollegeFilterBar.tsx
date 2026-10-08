// ============================================================================
// ISML COLLEGE LMS — REUSABLE COLLEGE FILTER BAR
// Compact, executive campus-scoping pill bar used across pages
// ============================================================================

"use client";

import React from 'react';
import { Building2, Globe, ShieldCheck } from 'lucide-react';
import { useCollege, OVERALL_COLLEGE_ID } from '@/context/CollegeContext';

interface CollegeFilterBarProps {
  label?: string;
  className?: string;
}

export default function CollegeFilterBar({
  label = 'Campus Scope:',
  className = '',
}: CollegeFilterBarProps) {
  const { selectedCollegeId, setSelectedCollegeId, institutions, isOverall, selectedCollege } = useCollege();

  return (
    <div
      className={`bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-sans ${className}`}
    >
      <div className="flex items-center gap-2 pl-1 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center shrink-0">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
            {label}
          </span>
          <span className="text-xs font-bold text-slate-900 leading-tight">
            {isOverall ? '🏛️ Overall (All Campuses)' : `🎓 ${selectedCollege?.name}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCollegeId(OVERALL_COLLEGE_ID)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            isOverall
              ? 'bg-[#0052CC] text-white shadow-2xs ring-2 ring-blue-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>Overall</span>
        </button>

        {institutions.map((inst) => {
          const isSelected = selectedCollegeId === inst.id;
          return (
            <button
              key={inst.id}
              type="button"
              onClick={() => setSelectedCollegeId(inst.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#0052CC] text-white shadow-2xs ring-2 ring-blue-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={inst.name}
            >
              <span>{inst.code}</span>
              <span className="hidden md:inline font-normal text-[11px] opacity-90 truncate max-w-[120px]">
                {inst.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

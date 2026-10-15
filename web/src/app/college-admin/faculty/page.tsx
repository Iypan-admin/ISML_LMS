// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: FACULTY & TUTORS HUB
// (/college-admin/faculty)
// ============================================================================

"use client";

import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Globe2,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  Sparkles,
} from 'lucide-react';
import { mockInstitutions } from '@/mock/superAdminData';
import { mockFacultyMembers, mockFacultyAllocations } from '@/mock/facultyAssignments';

export default function CollegeAdminFacultyPage() {
  const currentCollege = mockInstitutions[0];
  const [search, setSearch] = useState('');

  const filteredFaculty = mockFacultyMembers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.primaryLanguage.toLowerCase().includes(search.toLowerCase()) ||
      f.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-[#0052CC] text-xs font-bold rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>Campus Faculty & Certified Language Tutors</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight mt-2">
            Language Faculty & Tutor Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View certified native language trainers and instructional tutors assigned to {currentCollege.name}.
          </p>
        </div>
      </div>

      {/* Faculty Roster Grid */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name or language..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0052CC] shadow-2xs"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">{filteredFaculty.length} Faculty Members</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFaculty.map((faculty) => {
          const allocations = mockFacultyAllocations.filter((a) => a.facultyId === faculty.id);
          return (
            <div
              key={faculty.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0052CC] to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      {faculty.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0B2447] text-sm">{faculty.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{faculty.designation}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {faculty.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Language: <strong className="text-slate-900">{faculty.primaryLanguage}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">Cert: <strong className="text-slate-900">{faculty.qualification}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-700 font-mono text-[11px]">{faculty.email}</span>
                  </div>
                </div>

                {/* Assigned Batches */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Assigned Campus Cohorts ({allocations.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {allocations.length > 0 ? (
                      allocations.map((alloc) => (
                        <span
                          key={alloc.id}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0052CC] text-[10px] font-bold border border-blue-100"
                        >
                          {alloc.batchName} ({alloc.tutorRole.replace('_', ' ')})
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Open for allocation</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Rating: ⭐ 4.9/5</span>
                <span className="font-mono text-emerald-700 font-bold">Active Campus Tutor</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

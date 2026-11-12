// ============================================================================
// ISML LMS — SALES & ADMISSION PORTAL: ONBOARD TUTOR / FACULTY
// (/sales-manager/onboard-tutor)
// Sales and Admissions Desk creates & onboards certified foreign language tutors
// ============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Globe2,
  GraduationCap,
  Award,
  Sparkles,
  Building2,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldCheck,
  UserCheck,
  Layers,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { fastFetch } from '@/lib/fastCache';
import CreateTutorDrawer from '@/components/academic-manager/CreateTutorDrawer';

export default function SalesManagerOnboardTutorPage() {
  const { showSuccess, showInfo } = useToast();
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFaculty = () => {
    fastFetch('/api/portals/faculty', (json) => {
      if (json && json.data) {
        setFacultyList(json.data);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchFaculty();
    const interval = setInterval(fetchFaculty, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredFaculty = facultyList.filter((f) => {
    if (languageFilter !== 'ALL' && f.primaryLanguage !== languageFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.designation.toLowerCase().includes(q) ||
        f.primaryLanguage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              ADMISSIONS & ONBOARDING DESK
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-600">Faculty Recruitment & Onboarding</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight mt-1 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#0052CC]" />
            <span>Onboard Certified Language Tutors</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new foreign language native faculty, create LMS tutor credentials, and assign them to partner colleges or K-12 schools.
          </p>
        </div>

        <button
          onClick={() => setIsCreateDrawerOpen(true)}
          className="px-4 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Tutor</span>
        </button>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Registered Tutors</span>
          <p className="text-2xl font-black text-[#0B2447] mt-1">{facultyList.length}</p>
          <span className="text-[11px] text-[#0052CC] font-semibold mt-1 block">Polyglot & CEFR Faculty</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Active in Studio Classes</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {facultyList.filter((f) => f.status === 'ACTIVE').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Live & Available</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Foreign Languages</span>
          <p className="text-2xl font-black text-purple-950 mt-1">5 Languages</p>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 block">French, German, Japanese, Korean, Spanish</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Onboarding Flow</span>
          <p className="text-2xl font-black text-amber-900 mt-1">Direct Sync</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Auto-generates Login Pass</span>
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutor by name, email, language or qualification..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Languages (5)</option>
            <option value="FRENCH">French (DELF)</option>
            <option value="GERMAN">German (Goethe)</option>
            <option value="JAPANESE">Japanese (JLPT)</option>
            <option value="KOREAN">Korean (TOPIK)</option>
            <option value="SPANISH">Spanish (DELE)</option>
          </select>
        </div>
      </div>

      {/* ─── Faculty Roster Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-800">
            Showing {filteredFaculty.length} Onboarded Faculty Members
          </span>
          <span>Sales & Admissions Registry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Faculty / Tutor</th>
                <th className="p-3">Primary Language</th>
                <th className="p-3">Designation & Qualifications</th>
                <th className="p-3">Assigned Campus</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFaculty.length === 0 ? (
                <tr key="empty-tutors">
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-400 font-medium">
                    No tutors found matching query. Click "Add New Tutor" to onboard one.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f, idx) => (
                  <tr key={f.id || `fac-${idx}`} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0052CC] font-bold text-xs flex items-center justify-center shrink-0">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-[#0B2447] block">{f.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {f.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-[#0052CC] border border-blue-200">
                        {f.primaryLanguage}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 font-semibold">{f.designation}</div>
                      <div className="text-[11px] text-slate-500">{f.qualification}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">
                        {f.assignedInstitutionName || 'Universal Affiliate'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {f.assignedInstitutionType === 'BOTH'
                          ? 'College & School'
                          : f.assignedInstitutionType || 'CAMPUS'}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {f.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add Tutor Drawer (Moved to Sales & Admissions) ─── */}
      <CreateTutorDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onTutorCreated={(newTutor) => {
          setFacultyList((prev) => [newTutor, ...prev]);
          showSuccess(`Tutor ${newTutor.name} successfully onboarded and added to directory!`);
          setIsCreateDrawerOpen(false);
          fetchFaculty();
        }}
      />
    </div>
  );
}


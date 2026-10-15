// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: UNIFIED FACULTY & ALLOCATIONS HUB
// (/academic-manager/faculty)
// Unified Master Control: Faculty Profiles & Course/Batch Allocations
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  UserCog,
  Plus,
  Mail,
  Phone,
  Globe2,
  GraduationCap,
  ShieldCheck,
  LifeBuoy,
  FileCheck2,
  Clock,
  Sparkles,
  Users,
  Search,
  Filter,
  CheckCircle2,
  CheckCheck,
  Layers,
  Calendar,
  BookOpen
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import { useToast } from '@/context/ToastContext';
import {
  mockFacultyMembers,
  mockFacultyAllocations,
  FacultyMember,
  FacultyAllocationItem,
  TutorRoleType
} from '@/mock/facultyAssignments';
import AssignTutorDrawer from '@/components/academic-manager/AssignTutorDrawer';

interface FacultyPageProps {
  portalRole?: 'super-admin' | 'academic-manager';
}

export default function AcademicManagerFacultyUnifiedPage({
  portalRole = 'academic-manager',
}: FacultyPageProps = {}) {
  const { showSuccess, showInfo } = useToast();
  const isSuperAdmin = portalRole === 'super-admin';

  // Primary Workspace Tab: Directory vs Batch Allocations
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ALLOCATIONS'>('DIRECTORY');

  // Faculty Directory State
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(mockFacultyMembers);
  const [facultySearch, setFacultySearch] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | TutorRoleType>('ALL');

  const handleToggleFacultyStatus = (facultyId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'ON_LEAVE' : 'ACTIVE';
    setFacultyList((prev) =>
      prev.map((f) => (f.id === facultyId ? { ...f, status: nextStatus as any } : f))
    );
    if (nextStatus === 'ACTIVE') {
      showSuccess(`Faculty marked active & available for live studio classes.`);
    } else {
      showInfo(`Faculty marked on-leave. Substitute standby alert triggered.`);
    }
  };

  // Allocations State
  const [allocations, setAllocations] = useState<FacultyAllocationItem[]>(mockFacultyAllocations);
  const [allocSearch, setAllocSearch] = useState('');
  const [allocRoleFilter, setAllocRoleFilter] = useState<'ALL' | TutorRoleType>('ALL');
  const [allocLangFilter, setAllocLangFilter] = useState<string>('ALL');

  // Drawer Controls
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [drawerDefaultRole, setDrawerDefaultRole] = useState<TutorRoleType>('LEAD_TRAINER');

  // Filtered Faculty List
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      if (selectedLanguageFilter !== 'ALL' && f.primaryLanguage !== selectedLanguageFilter) {
        return false;
      }
      if (selectedRoleFilter !== 'ALL' && !f.assignedRoles.includes(selectedRoleFilter)) {
        return false;
      }
      if (facultySearch.trim() !== '') {
        const q = facultySearch.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.designation.toLowerCase().includes(q) ||
          f.qualification.toLowerCase().includes(q) ||
          f.nativeCountry.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [facultyList, selectedLanguageFilter, selectedRoleFilter, facultySearch]);

  // Filtered Allocations List
  const filteredAllocations = useMemo(() => {
    return allocations.filter((item) => {
      if (allocRoleFilter !== 'ALL' && item.tutorRole !== allocRoleFilter) {
        return false;
      }
      if (allocLangFilter !== 'ALL' && item.languageFamily !== allocLangFilter) {
        return false;
      }
      if (allocSearch.trim() !== '') {
        const q = allocSearch.toLowerCase();
        return (
          item.facultyName.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q) ||
          item.batchName.toLowerCase().includes(q) ||
          item.subjectCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allocations, allocRoleFilter, allocLangFilter, allocSearch]);

  // Counts for Directory
  const totalLead = facultyList.filter(f => f.assignedRoles.includes('LEAD_TRAINER')).length;
  const totalSubstitutes = facultyList.filter(f => f.assignedRoles.includes('SUBSTITUTE_TUTOR')).length;
  const totalDoubtSolvers = facultyList.filter(f => f.assignedRoles.includes('DOUBT_SOLVING_TUTOR')).length;
  const totalAssistants = facultyList.filter(f => f.assignedRoles.includes('ASSISTANT_TUTOR')).length;

  const handleAllocationCreated = (newAlloc: FacultyAllocationItem) => {
    setAllocations((prev) => [newAlloc, ...prev]);
    showSuccess(`Allocated ${newAlloc.facultyName} to ${newAlloc.batchName} (${newAlloc.tutorRole.replace(/_/g, ' ')})`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'People & Enrollment' }, { label: 'Faculty & Allocations' }]} />

      <CollegeFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#0052CC]" />
            <span>Faculty & Course Allocations Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified control center for Native linguistic trainers, substitute rosters, doubt solvers, and cohort batch assignments.
          </p>
        </div>

        {!isSuperAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDrawerDefaultRole('SUBSTITUTE_TUTOR');
                setIsAssignDrawerOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Assign Standby</span>
            </button>
            <button
              onClick={() => {
                setDrawerDefaultRole('LEAD_TRAINER');
                setIsAssignDrawerOpen(true);
              }}
              className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Allocation</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Master View Tab Switcher (Directory vs Allocations) ─── */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200 shadow-2xs max-w-md">
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'DIRECTORY'
              ? 'bg-white text-[#0B2447] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#0052CC]" />
          <span>Faculty Directory</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'DIRECTORY' ? 'bg-blue-50 text-[#0052CC]' : 'bg-slate-200 text-slate-600'
          }`}>
            {facultyList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ALLOCATIONS')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ALLOCATIONS'
              ? 'bg-white text-[#0B2447] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCog className="w-4 h-4 text-indigo-600" />
          <span>Batch Allocations</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeTab === 'ALLOCATIONS' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {allocations.length}
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: FACULTY DIRECTORY VIEW */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Master Role Distribution KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div 
              onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'LEAD_TRAINER' ? 'ALL' : 'LEAD_TRAINER')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedRoleFilter === 'LEAD_TRAINER' ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-blue-800">Lead Native Trainers</span>
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B2447]">{totalLead}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Primary course delivery leads</p>
            </div>

            <div 
              onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'SUBSTITUTE_TUTOR' ? 'ALL' : 'SUBSTITUTE_TUTOR')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedRoleFilter === 'SUBSTITUTE_TUTOR' ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500' : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-amber-800">Substitute Tutors</span>
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B2447]">{totalSubstitutes}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Emergency standby & leave coverage</p>
            </div>

            <div 
              onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'DOUBT_SOLVING_TUTOR' ? 'ALL' : 'DOUBT_SOLVING_TUTOR')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedRoleFilter === 'DOUBT_SOLVING_TUTOR' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-emerald-800">Doubt Solving Tutors</span>
                <LifeBuoy className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B2447]">{totalDoubtSolvers}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">1-on-1 Q&A desk & remediation</p>
            </div>

            <div 
              onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'ASSISTANT_TUTOR' ? 'ALL' : 'ASSISTANT_TUTOR')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedRoleFilter === 'ASSISTANT_TUTOR' ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-500' : 'bg-white border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-purple-800">Assistant Tutors (TA)</span>
                <FileCheck2 className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B2447]">{totalAssistants}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Grading, drills & viva assessment</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                placeholder="Search faculty by name, qualification, language or nationality..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['ALL', 'FRENCH', 'JAPANESE', 'KOREAN', 'SPANISH', 'GERMAN'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguageFilter(lang)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedLanguageFilter === lang
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'ALL' ? 'All Languages' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Faculty Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.map((faculty) => (
              <div
                key={faculty.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Profile Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {faculty.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0B2447] leading-snug">{faculty.name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">{faculty.designation}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded mt-0.5">
                          <Globe2 className="w-2.5 h-2.5" />
                          <span>{faculty.primaryLanguage} Specialist • {faculty.nativeCountry}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusToggleSwitch
                        checked={faculty.status === 'ACTIVE' || faculty.status === 'AVAILABLE'}
                        onChange={() => handleToggleFacultyStatus(faculty.id, faculty.status)}
                        activeLabel="Active"
                        inactiveLabel="Leave"
                        showLabels={false}
                      />
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        faculty.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        faculty.status === 'AVAILABLE' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {faculty.status}
                      </span>
                    </div>
                  </div>

                  {/* Qualifications & Experience */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <p className="font-semibold text-slate-900 leading-snug">{faculty.qualification}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Experience: <strong>{faculty.experienceYears} Years</strong></span>
                      <span>Active Batches: <strong className="text-blue-700">{faculty.activeBatchesCount} Cohorts</strong></span>
                    </div>
                  </div>

                  {/* Roles Badges */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Active Pedagogical Roles
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {faculty.assignedRoles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            role === 'LEAD_TRAINER' ? 'bg-blue-100 text-blue-800' :
                            role === 'SUBSTITUTE_TUTOR' ? 'bg-amber-100 text-amber-800' :
                            role === 'DOUBT_SOLVING_TUTOR' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {role === 'LEAD_TRAINER' && <GraduationCap className="w-3 h-3" />}
                          {role === 'SUBSTITUTE_TUTOR' && <ShieldCheck className="w-3 h-3" />}
                          {role === 'DOUBT_SOLVING_TUTOR' && <LifeBuoy className="w-3 h-3" />}
                          {role === 'ASSISTANT_TUTOR' && <FileCheck2 className="w-3 h-3" />}
                          <span>{role.replace(/_/g, ' ')}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Workload Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                      <span>Weekly Workload</span>
                      <span className="font-bold text-slate-900">{faculty.allocatedHours} / {faculty.weeklyHoursLimit} hrs</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (faculty.allocatedHours / faculty.weeklyHoursLimit) > 0.8 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, (faculty.allocatedHours / faculty.weeklyHoursLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {!isSuperAdmin ? (
                    <>
                      <button
                        onClick={() => {
                          setDrawerDefaultRole('SUBSTITUTE_TUTOR');
                          setIsAssignDrawerOpen(true);
                        }}
                        className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-colors cursor-pointer text-center"
                      >
                        Assign Standby
                      </button>
                      <button
                        onClick={() => {
                          setDrawerDefaultRole('LEAD_TRAINER');
                          setIsAssignDrawerOpen(true);
                        }}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded-xl text-xs font-bold border border-blue-200 transition-colors cursor-pointer text-center"
                      >
                        Assign Batch
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs py-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Faculty Status
                      </span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                        {faculty.status === 'ACTIVE' ? 'Active Duty' : faculty.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: COURSE & BATCH ALLOCATIONS VIEW */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ALLOCATIONS' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Timetable Conflict Guard Health Bar */}
          <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0B2447]">Automated Timetable Conflict Guard</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                    LIVE SCANNER ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Live scheduler checks trainer timings, emergency standby overlaps, and cohort virtual studio slots across all {allocations.length} active assignments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                Current Overlaps: <strong className="text-emerald-700 font-extrabold">0 Conflicts</strong>
              </span>
            </div>
          </div>

          {/* Role Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
            {[
              { key: 'ALL', label: 'All Allocations', icon: Layers, count: allocations.length },
              { key: 'LEAD_TRAINER', label: 'Lead Native Trainers', icon: GraduationCap, count: allocations.filter(a => a.tutorRole === 'LEAD_TRAINER').length },
              { key: 'SUBSTITUTE_TUTOR', label: 'Substitute Tutors (Standby)', icon: ShieldCheck, count: allocations.filter(a => a.tutorRole === 'SUBSTITUTE_TUTOR').length },
              { key: 'DOUBT_SOLVING_TUTOR', label: 'Doubt Solving Tutors', icon: LifeBuoy, count: allocations.filter(a => a.tutorRole === 'DOUBT_SOLVING_TUTOR').length },
              { key: 'ASSISTANT_TUTOR', label: 'Assistant Tutors (TAs)', icon: FileCheck2, count: allocations.filter(a => a.tutorRole === 'ASSISTANT_TUTOR').length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = allocRoleFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setAllocRoleFilter(tab.key as any)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0052CC] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Language Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={allocSearch}
                onChange={(e) => setAllocSearch(e.target.value)}
                placeholder="Search allocations by faculty, course, batch or code..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['ALL', 'FRENCH', 'JAPANESE', 'KOREAN', 'SPANISH', 'GERMAN'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setAllocLangFilter(lang)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    allocLangFilter === lang
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'ALL' ? 'All Languages' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAllocations.map((alloc) => (
              <div
                key={alloc.id}
                className={`p-5 bg-white rounded-2xl border shadow-2xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between ${
                  alloc.tutorRole === 'SUBSTITUTE_TUTOR' ? 'border-amber-200/90' :
                  alloc.tutorRole === 'DOUBT_SOLVING_TUTOR' ? 'border-emerald-200/90' :
                  alloc.tutorRole === 'ASSISTANT_TUTOR' ? 'border-purple-200/90' :
                  'border-blue-200/90'
                }`}
              >
                <div className="space-y-3">
                  {/* Header with Role Badge & Language */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      alloc.tutorRole === 'LEAD_TRAINER' ? 'bg-blue-100 text-blue-800' :
                      alloc.tutorRole === 'SUBSTITUTE_TUTOR' ? 'bg-amber-100 text-amber-800' :
                      alloc.tutorRole === 'DOUBT_SOLVING_TUTOR' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {alloc.tutorRole === 'LEAD_TRAINER' && <GraduationCap className="w-3 h-3" />}
                      {alloc.tutorRole === 'SUBSTITUTE_TUTOR' && <ShieldCheck className="w-3 h-3" />}
                      {alloc.tutorRole === 'DOUBT_SOLVING_TUTOR' && <LifeBuoy className="w-3 h-3" />}
                      {alloc.tutorRole === 'ASSISTANT_TUTOR' && <FileCheck2 className="w-3 h-3" />}
                      <span>{alloc.tutorRole.replace(/_/g, ' ')}</span>
                    </span>

                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {alloc.subjectCode}
                    </span>
                  </div>

                  {/* Course & Cohort Info */}
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2447] leading-snug">{alloc.courseName}</h3>
                    <p className="text-xs text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 shrink-0" />
                      <span>{alloc.batchName}</span>
                    </p>
                  </div>

                  {/* Assigned Staff Member Block */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Assigned Tutor:</span>
                      <strong className="text-slate-900 font-bold">{alloc.facultyName}</strong>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pt-1 border-t border-slate-200/60">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span>{alloc.scheduleSlots.join(', ')}</span>
                    </div>
                  </div>

                  {/* Status & Notes */}
                  {alloc.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      "{alloc.notes}"
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alloc.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    alloc.status === 'SUBSTITUTE_STANDBY' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {alloc.status.replace(/_/g, ' ')}
                  </span>

                  {!isSuperAdmin ? (
                    <button
                      onClick={() => showSuccess(`Modifying schedule & standby for ${alloc.facultyName}`)}
                      className="text-xs font-bold text-[#0052CC] hover:underline cursor-pointer"
                    >
                      Modify Allocation
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      Audited Allocation
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unified Assign Tutor Drawer - Hidden for Super Admin */}
      {!isSuperAdmin && (
        <AssignTutorDrawer
          isOpen={isAssignDrawerOpen}
          onClose={() => setIsAssignDrawerOpen(false)}
          defaultRole={drawerDefaultRole}
          onAllocationCreated={handleAllocationCreated}
        />
      )}
    </div>
  );
}

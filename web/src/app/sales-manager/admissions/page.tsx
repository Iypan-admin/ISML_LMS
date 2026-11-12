"use client";
// ============================================================================
// ISML LMS — SALES ADMISSIONS LIST & DETAIL DRAWER (/sales-manager/admissions)
// Manage College and School Enrolment Leads, Update CRM Stages & Record Fees
// ============================================================================


import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  User,
  GraduationCap,
  School,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PhoneCall,
  CalendarDays,
  FileCheck,
  X,
  Edit2,
  UserCheck,
  MapPin,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Plus,
  Building2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { salesStore } from '@/mock/salesData';
import { AdmissionApplication, LeadStage, PaymentStatus } from '@/types/sales';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';
import { fastFetch } from '@/lib/fastCache';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';

function SalesAdmissionsPageContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');

  const { isSchoolMode, selectedCollege, isOverall, institutionCategory, filteredInstitutions } = useCollege();
  const { showSuccess, showInfo } = useToast();

  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);

  // Fetch live applications from database API with Instant 0ms Fast Cache
  const fetchLiveAdmissions = React.useCallback(async () => {
    try {
      fastFetch('/api/portals/admissions', (json) => {
        if (json && json.status === 'success' && Array.isArray(json.data)) {
          const mapped: AdmissionApplication[] = json.data.map((item: any) => ({
            id: item.id,
            applicationNumber: item.applicationNumber,
            category: item.admissionType === 'SCHOOL_STUDENT' ? 'SCHOOL' : 'COLLEGE',
            institutionId: item.institutionId,
            institutionName: item.institutionName || 'Affiliated Campus',
            fullName: item.fullName || `${item.firstName} ${item.lastName}`.trim(),
            email: item.email,
            phone: item.phone || item.mobileNumber,
            dob: '2005-06-15',
            gender: 'MALE',
            bloodGroup: 'O+',
            address: {
              street: 'Campus Road',
              city: 'Tamil Nadu',
              state: 'Tamil Nadu',
              pincode: '600001',
            },
            collegeDetails: {
              enrollmentMode: 'INSTITUTION_PARTNER',
              collegeName: item.institutionName || 'Affiliated Campus',
              collegeCode: 'COL',
              department: item.department || 'Linguistics & Technology',
              degreeProgram: item.degree || 'Language Track',
              semester: 'Sem 1',
              currentRollNumber: item.applicationNumber,
              languageSelected: item.targetLanguage || 'French',
              proficiencyLevel: item.targetLevel || 'A1',
              preferredBatchTiming: 'Morning Slot',
              hostelDayScholar: 'DAY_SCHOLAR',
            },
            schoolDetails: {
              enrollmentMode: 'INSTITUTION_PARTNER',
              schoolName: item.institutionName || 'Affiliated School',
              schoolCode: 'SCH',
              boardAffiliation: 'CBSE',
              gradeClass: 'Grade 9',
              section: 'A',
              academicYear: '2026–2027',
              parentFatherName: item.parentOrGuardianName || 'Parent',
              parentMotherName: 'Parent',
              parentEmergencyPhone: item.phone || item.mobileNumber,
              languageTrack: item.targetLanguage || 'French',
              schoolBatchSlot: 'Integrated Period Slot',
              transportMode: 'SCHOOL_BUS',
            },
            courseFee: 15000,
            discountScholarship: 0,
            finalPayable: 15000,
            amountPaid: 15000,
            paymentStatus: item.paymentStatus || 'PAID',
            paymentRefId: `TXN-${item.applicationNumber}`,
            stage: item.leadStage || 'ENROLLED',
            source: item.leadSource || 'CAMPUS_DRIVE',
            assignedSalesOfficer: 'Sales Desk Officer',
            assignedOfficerEmail: 'sales@isml.edu',
            leadScore: 90,
            submittedAt: item.createdAt,
            updatedAt: item.updatedAt,
            notes: ['Synchronized live from database records.'],
          }));

          setApplications(mapped);
        }
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetchLiveAdmissions();
    const interval = setInterval(fetchLiveAdmissions, 4000);

    const handleRealtime = (e: any) => {
      const type = e?.detail?.type;
      if (type === 'STUDENT_ENROLLED' || type === 'APPROVAL_REVIEWED' || type === 'APPROVAL_SUBMITTED') {
        fetchLiveAdmissions();
      }
    };
    window.addEventListener('isml-realtime-event', handleRealtime);

    return () => {
      clearInterval(interval);
      window.removeEventListener('isml-realtime-event', handleRealtime);
    };
  }, [fetchLiveAdmissions]);

  useEffect(() => {
    return salesStore.subscribe(() => {
      setApplications(salesStore.getApplications());
      if (selectedApp) {
        const updated = salesStore.getApplicationById(selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    });
  }, [selectedApp]);

  useEffect(() => {
    if (highlightId) {
      const found = salesStore.getApplicationById(highlightId);
      if (found) setSelectedApp(found);
    }
  }, [highlightId]);

  // Segmented Intake View Mode: 'COLLEGE' | 'SCHOOL' | 'INDIVIDUAL'
  const [selectedRegistryMode, setSelectedRegistryMode] = useState<'COLLEGE' | 'SCHOOL' | 'INDIVIDUAL'>('COLLEGE');
  const [selectedInstId, setSelectedInstId] = useState<string>('ALL');

  // Scoped Applications based on User Selected Scope (Colleges / Schools / Individual)
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // 1. Filter by Selected View Mode
      if (selectedRegistryMode === 'INDIVIDUAL') {
        const isIndividual =
          app.source === 'DIRECT_WALKIN' ||
          app.collegeDetails?.enrollmentMode === 'INDIVIDUAL_STUDENT' ||
          app.applicationNumber?.includes('IND') ||
          app.institutionName?.toLowerCase().includes('independent');
        if (!isIndividual && (app.source as string) !== 'WEBSITE_ENQUIRY') {
          // If explicitly marked as institution partner bulk, skip
          if (app.source === 'COLLEGE_PARTNER' || app.source === 'SCHOOL_MOU') return false;
        }
      } else if (selectedRegistryMode === 'SCHOOL') {
        if (app.category !== 'SCHOOL') return false;
        if (selectedInstId !== 'ALL' && app.institutionId !== selectedInstId) {
          if (!app.institutionName.toLowerCase().includes(selectedInstId.toLowerCase())) return false;
        }
      } else {
        // 'COLLEGE'
        if (app.category !== 'COLLEGE') return false;
        if (selectedInstId !== 'ALL' && app.institutionId !== selectedInstId) {
          if (!app.institutionName.toLowerCase().includes(selectedInstId.toLowerCase())) return false;
        }
      }

      // 2. Stage Filter
      if (selectedStage !== 'ALL' && app.stage !== selectedStage) {
        return false;
      }

      // 3. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          app.fullName.toLowerCase().includes(q) ||
          app.applicationNumber.toLowerCase().includes(q) ||
          app.email.toLowerCase().includes(q) ||
          app.institutionName.toLowerCase().includes(q) ||
          app.phone.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [applications, selectedRegistryMode, selectedInstId, selectedStage, searchQuery]);

  const handleStageChange = (appId: string, newStage: LeadStage) => {
    salesStore.updateStage(appId, newStage, `Stage updated to ${newStage} by Sales Officer`);
    showSuccess(`Application stage updated to ${newStage.replace(/_/g, ' ')}`);
  };

  return (
    <div className="space-y-6">
      {/* ─── Page Title Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-tr from-[#0052CC] to-blue-500 text-white rounded-xl shadow-sm">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
              {isSchoolMode ? 'School' : 'College'} Admission Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse student inquiries, verify admissions documents, and view enrollment details.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/sales-manager/enroll-student"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
          >
            <User className="w-4 h-4" />
            <span>+ Individual Enrollment</span>
          </Link>
          <Link
            href="/sales-manager/register-college"
            className="px-3.5 py-2 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>+ College Batch</span>
          </Link>
          <Link
            href="/sales-manager/register-school"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <School className="w-4 h-4" />
            <span>+ School Batch</span>
          </Link>
        </div>
      </div>

      {/* ─── Mode Selector & Interactive Institution Cards Bar ─── */}
      <div className="space-y-4">
        {/* Tier 1: Sector Pills (Colleges, Schools, Individual) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSelectedRegistryMode('COLLEGE');
                setSelectedInstId('ALL');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedRegistryMode === 'COLLEGE'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Colleges & Universities</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedRegistryMode === 'COLLEGE' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {applications.filter((a) => a.category === 'COLLEGE').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRegistryMode('SCHOOL');
                setSelectedInstId('ALL');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedRegistryMode === 'SCHOOL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <School className="w-4 h-4" />
              <span>K-12 Partner Schools</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedRegistryMode === 'SCHOOL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {applications.filter((a) => a.category === 'SCHOOL').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRegistryMode('INDIVIDUAL');
                setSelectedInstId('ALL');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedRegistryMode === 'INDIVIDUAL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Direct Individual Admissions</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedRegistryMode === 'INDIVIDUAL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {applications.filter((a) => a.source === 'DIRECT_WALKIN' || a.collegeDetails?.enrollmentMode === 'INDIVIDUAL_STUDENT').length}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium px-2">
            Click any campus card below to inspect respective student profiles & status
          </div>
        </div>

        {/* Tier 2: Campus / College Select Cards Grid */}
        {selectedRegistryMode !== 'INDIVIDUAL' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select {selectedRegistryMode === 'COLLEGE' ? 'College Campus' : 'School Campus'}:
              </span>
              {selectedInstId !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedInstId('ALL')}
                  className="text-xs font-bold text-[#0052CC] hover:underline cursor-pointer"
                >
                  View All {selectedRegistryMode === 'COLLEGE' ? 'Colleges' : 'Schools'} ({applications.filter(a => a.category === selectedRegistryMode).length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* "All Campuses" Card */}
              <div
                onClick={() => setSelectedInstId('ALL')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedInstId === 'ALL'
                    ? 'bg-white border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-sm'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    selectedRegistryMode === 'SCHOOL' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">All {selectedRegistryMode === 'COLLEGE' ? 'Colleges' : 'Schools'}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Consolidated Roster View</p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Total Enrolled</span>
                  <span className="font-bold text-[#0B2447]">
                    {applications.filter((a) => a.category === selectedRegistryMode).length} Students
                  </span>
                </div>
              </div>

              {/* Individual Campus Cards */}
              {filteredInstitutions
                .filter((inst) => (selectedRegistryMode === 'SCHOOL' ? inst.type === 'SCHOOL' : inst.type !== 'SCHOOL'))
                .slice(0, 7)
                .map((inst) => {
                  const instApps = applications.filter((a) => a.category === selectedRegistryMode && (a.institutionId === inst.id || a.institutionName.toLowerCase().includes(inst.name.toLowerCase()) || a.institutionName.toLowerCase().includes(inst.code.toLowerCase())));
                  const isSelected = selectedInstId === inst.name || selectedInstId === inst.id;

                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedInstId(inst.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? selectedRegistryMode === 'SCHOOL'
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
                            : 'bg-white border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-sm'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${
                          selectedRegistryMode === 'SCHOOL' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-[#0052CC] border-blue-200'
                        }`}>
                          {selectedRegistryMode === 'SCHOOL' ? <School className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 pr-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 block">{inst.code}</span>
                          <h3 className="font-bold text-xs text-slate-900 truncate" title={inst.name}>
                            {inst.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{(inst as any).campusArea || (inst as any).city || 'Tamil Nadu'}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Admissions</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#0B2447]">{instApps.length}</span>
                          {instApps.some((a) => a.stage !== 'ENROLLED') && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                              {instApps.filter((a) => a.stage !== 'ENROLLED').length} Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, application number, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
          >
            <option value="ALL">All Statuses ({filteredApps.length})</option>
            <option value="ENROLLED">Approved & Active</option>
            <option value="FORM_SUBMITTED">Pending Super Admin Approval</option>
          </select>
        </div>
      </div>

      {/* ─── Modern Student Admission Cards Grid (Zero Boring Table) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <span>Enrolled Students</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold text-[11px]">
              {filteredApps.length}
            </span>
            {selectedInstId !== 'ALL' && (
              <span className="text-[#0052CC] font-semibold">under {selectedInstId}</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Click any student card to inspect full admission specs, parent contacts & credentials
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              {selectedRegistryMode === 'SCHOOL' ? (
                <School className="w-6 h-6" />
              ) : selectedRegistryMode === 'INDIVIDUAL' ? (
                <Users className="w-6 h-6" />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No students found under {selectedInstId !== 'ALL' ? selectedInstId : selectedRegistryMode === 'COLLEGE' ? 'Colleges' : selectedRegistryMode === 'SCHOOL' ? 'Schools' : 'Individual Admissions'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching records found for your chosen filters. Try selecting a different campus or register a new candidate.
            </p>
            {selectedInstId !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedInstId('ALL')}
                className="mt-2 px-3 py-1.5 text-xs font-bold text-[#0052CC] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                Reset Campus Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const isApproved = app.stage === 'ENROLLED';
              const isSchool = app.category === 'SCHOOL';

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-[#0052CC]/50 shadow-2xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        isSchool
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-[#0052CC] border-blue-200'
                      }`}>
                        {isSchool ? <School className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                        <span>{app.category}</span>
                      </span>

                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                    </div>

                    {/* Student Name & App No */}
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0052CC] transition-colors truncate" title={app.fullName}>
                        {app.fullName}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {app.applicationNumber}
                        </span>
                        <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">
                          {isSchool ? app.schoolDetails?.languageTrack : `${app.collegeDetails?.languageSelected} (${app.collegeDetails?.proficiencyLevel})`}
                        </span>
                      </div>
                    </div>

                    {/* Campus and Academic Info */}
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400 font-medium">Campus:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[160px] text-right" title={app.institutionName}>
                          {app.institutionName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400 font-medium">{isSchool ? 'Grade/Class:' : 'Department:'}</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[160px] text-right">
                          {isSchool ? app.schoolDetails?.gradeClass : app.collegeDetails?.department}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400 font-medium">Contact:</span>
                        <span className="font-medium text-slate-800 text-right">{app.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div
                    className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-[#0052CC] text-slate-700 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>View Full Profile</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Detail Drawer (When an application is selected) ─── */}
      {selectedApp && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedApp.applicationNumber}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedApp.category === 'SCHOOL' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedApp.category} ADMISSION
                </span>
              </div>
              <h2 className="text-base font-black text-[#0B2447] mt-1">{selectedApp.fullName}</h2>
            </div>
            <button
              onClick={() => setSelectedApp(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Quick Status Pill */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              selectedApp.stage === 'ENROLLED'
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  selectedApp.stage === 'ENROLLED' ? 'text-emerald-700' : 'text-amber-800'
                }`}>
                  Approval Status
                </span>
                <span className={`font-bold text-sm flex items-center gap-1.5 mt-0.5 ${
                  selectedApp.stage === 'ENROLLED' ? 'text-emerald-700' : 'text-amber-800'
                }`}>
                  {selectedApp.stage === 'ENROLLED' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approved by Super Admin (Active)</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Pending Super Admin Authorization</span>
                    </>
                  )}
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                {selectedApp.applicationNumber}
              </span>
            </div>

            {/* Institution & Academic Specs */}
            <div className="space-y-2">
              <h3 className="font-black uppercase tracking-wider text-slate-400 text-[10px]">
                {selectedApp.category === 'SCHOOL' ? 'School & Pupil Profile' : 'College & Degree Profile'}
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-bold text-[#0B2447] text-right">{selectedApp.institutionName}</span>
                </div>
                {selectedApp.category === 'COLLEGE' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.collegeDetails?.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Degree Program:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedApp.collegeDetails?.degreeProgram}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Roll No / Reg:</span>
                      <span className="font-mono font-bold text-blue-700">{selectedApp.collegeDetails?.currentRollNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Language Track:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedApp.collegeDetails?.languageSelected} ({selectedApp.collegeDetails?.proficiencyLevel})
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Grade & Section:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedApp.schoolDetails?.gradeClass} ({selectedApp.schoolDetails?.section})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Board Affiliation:</span>
                      <span className="font-bold text-blue-700">{selectedApp.schoolDetails?.boardAffiliation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Father / Mother:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedApp.schoolDetails?.parentFatherName} / {selectedApp.schoolDetails?.parentMotherName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Language Track:</span>
                      <span className="font-bold text-emerald-700">{selectedApp.schoolDetails?.languageTrack}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Counselor Notes */}
            <div className="space-y-2">
              <h3 className="font-black uppercase tracking-wider text-slate-400 text-[10px]">CRM Activity Notes</h3>
              <div className="space-y-1.5">
                {selectedApp.notes.map((note, nIdx) => (
                  <div key={nIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function SalesAdmissionsPage() { return <Suspense fallback={<div>Loading...</div>}><SalesAdmissionsPageContent /></Suspense>; }
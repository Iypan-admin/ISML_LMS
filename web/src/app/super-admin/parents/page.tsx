// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN: PARENTS & GUARDIANS DIRECTORY
// (/super-admin/parents)
// Dedicated Central Parent & Guardian Portal: Multi-Student Linkages, Family Accounts,
// Responsive Course & Batch Filter Cards, Contact Ledger & Attendance Monitoring
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  GraduationCap,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  Sparkles,
  Download,
  X,
  Send,
  Building,
  UserCheck,
  UserX,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Building2,
  Check,
  BookOpen,
  BookMarked,
  SlidersHorizontal,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import { useToast } from '@/context/ToastContext';
import { useCollege } from '@/context/CollegeContext';
import { ParentUser, UserStatus } from '@/types/rbac';
import { mockCourses, mockBatches, mockInstitutions } from '@/mock/superAdminData';

// High-fidelity enriched Parent Dataset with Course & Batch linkages
export const superAdminMockParents: ParentUser[] = [
  {
    id: 'prt-001',
    name: "Dr. Ronald D'Souza",
    email: 'ronald.dsouza@apollohospitals.com',
    mobile: '+91 94440 12345',
    relationship: 'FATHER',
    status: 'ACTIVE',
    credentialsDelivered: true,
    portalLastLogin: '2026-10-12T14:30:00Z',
    createdAt: '2026-06-15T10:00:00Z',
    linkedStudents: [
      {
        studentId: 'ISML20260001',
        studentName: 'Aarav Sharma',
        programName: 'French A1 Intensive Certification Program',
        courseId: 'crs-01',
        courseName: 'French A1 Intensive Certification Program',
        batchId: 'batch-2026-cs',
        batchName: 'Cohort 2026–2029 (Section A & B)',
        collegeName: 'Loyola College of Arts & Science (Autonomous)',
        attendancePercentage: 92.4,
        feePendingAmount: 0,
      },
      {
        studentId: 'ISML20260042',
        studentName: 'Priya Sharma',
        programName: 'Japanese N5 Business Certificate Track',
        courseId: 'crs-03',
        courseName: 'Japanese N5 Business Certificate Track',
        batchId: 'batch-mcc-01',
        batchName: 'MCC Cohort 2026–2029 (Section A)',
        collegeName: 'Madras Christian College (MCC)',
        attendancePercentage: 96.0,
        feePendingAmount: 0,
      },
    ],
  },
  {
    id: 'prt-002',
    name: 'Lakshmi Narayanan',
    email: 'lakshmi.narayanan@tcs.com',
    mobile: '+91 94440 23456',
    relationship: 'MOTHER',
    status: 'ACTIVE',
    credentialsDelivered: true,
    portalLastLogin: '2026-10-13T09:15:00Z',
    createdAt: '2026-06-16T11:20:00Z',
    linkedStudents: [
      {
        studentId: 'ISML20260002',
        studentName: 'Ananya Ramesh',
        programName: 'German A1 Professional Career Track',
        courseId: 'crs-02',
        courseName: 'German A1 Professional Career Track',
        batchId: 'batch-2026-bca',
        batchName: 'Cohort 2026–2029 (BCA Section A)',
        collegeName: 'Loyola College of Arts & Science (Autonomous)',
        attendancePercentage: 88.0,
        feePendingAmount: 0,
      },
    ],
  },
  {
    id: 'prt-003',
    name: "Joseph D'Souza",
    email: 'joseph.dsouza@gmail.com',
    mobile: '+91 94440 34567',
    relationship: 'FATHER',
    status: 'ACTIVE',
    credentialsDelivered: true,
    portalLastLogin: '2026-10-10T16:45:00Z',
    createdAt: '2026-06-18T14:00:00Z',
    linkedStudents: [
      {
        studentId: 'ISML20260003',
        studentName: 'Kavitha S',
        programName: 'French A1 Intensive Certification Program',
        courseId: 'crs-01',
        courseName: 'French A1 Intensive Certification Program',
        batchId: 'batch-2026-fr',
        batchName: 'Cohort 2026–2029 (ISML Global)',
        collegeName: 'Loyola College of Arts & Science (Autonomous)',
        attendancePercentage: 94.2,
        feePendingAmount: 0,
      },
    ],
  },
  {
    id: 'prt-004',
    name: 'Karthik N',
    email: 'karthik.n@gmail.com',
    mobile: '+91 94440 45678',
    relationship: 'FATHER',
    status: 'INACTIVE',
    credentialsDelivered: false,
    createdAt: '2026-06-20T09:30:00Z',
    linkedStudents: [
      {
        studentId: 'ISML20260004',
        studentName: 'Vigneshwaran K',
        programName: 'French A1 Intensive Certification Program',
        courseId: 'crs-01',
        courseName: 'French A1 Intensive Certification Program',
        batchId: 'batch-2026-cs',
        batchName: 'Cohort 2026–2029 (Section A & B)',
        collegeName: 'Loyola College of Arts & Science (Autonomous)',
        attendancePercentage: 72.5,
        feePendingAmount: 14500,
      },
    ],
  },
  {
    id: 'prt-005',
    name: 'Sundaram V',
    email: 'sundaram.v@gmail.com',
    mobile: '+91 94440 56789',
    relationship: 'FATHER',
    status: 'ACTIVE',
    credentialsDelivered: true,
    portalLastLogin: '2026-10-14T08:10:00Z',
    createdAt: '2025-06-12T10:00:00Z',
    linkedStudents: [
      {
        studentId: 'ISML20250012',
        studentName: 'Sneha Sundaram',
        programName: 'Korean TOPIK I Intensive & Hangul Fluency Track',
        courseId: 'crs-04',
        courseName: 'Korean TOPIK I Intensive & Hangul Fluency Track',
        batchId: 'batch-2026-cs',
        batchName: 'Cohort 2026–2029 (Korean Section A)',
        collegeName: 'Loyola College of Arts & Science (Autonomous)',
        attendancePercentage: 98.0,
        feePendingAmount: 0,
      },
      {
        studentId: 'ISML20250088',
        studentName: 'Sanjay Sundaram',
        programName: 'French A1 Intensive Certification Program',
        courseId: 'crs-01',
        courseName: 'French A1 Intensive Certification Program',
        batchId: 'batch-2026-fr',
        batchName: 'Cohort 2026–2029 (ISML Global)',
        collegeName: 'Loyola College of Arts & Science (Autonomous)',
        attendancePercentage: 91.5,
        feePendingAmount: 0,
      },
    ],
  },
  {
    id: 'prt-006',
    name: 'Radhika Sharma',
    email: 'radhika.sharma@yahoo.com',
    mobile: '+91 94440 67890',
    relationship: 'MOTHER',
    status: 'ACTIVE',
    credentialsDelivered: true,
    portalLastLogin: '2026-10-09T18:00:00Z',
    createdAt: '2025-06-15T12:00:00Z',
    linkedStudents: [
      {
        studentId: 'ISML20250033',
        studentName: 'Rohith Sharma R',
        programName: 'German A1 Professional Career Track',
        courseId: 'crs-02',
        courseName: 'German A1 Professional Career Track',
        batchId: 'batch-2026-bca',
        batchName: 'Cohort 2026–2029 (BCA Section A)',
        collegeName: 'Loyola College of Arts & Science (Autonomous)',
        attendancePercentage: 64.0,
        feePendingAmount: 15500,
      },
    ],
  },
  {
    id: 'prt-007',
    name: 'Antonio Fernandez',
    email: 'antonio.fernandez@diplomatico.es',
    mobile: '+91 94440 78901',
    relationship: 'FATHER',
    status: 'ACTIVE',
    credentialsDelivered: true,
    portalLastLogin: '2026-10-15T09:00:00Z',
    createdAt: '2026-07-01T10:00:00Z',
    linkedStudents: [
      {
        studentId: 'ISML20260099',
        studentName: 'Isabella Fernandez',
        programName: 'Spanish A1 Business & Diplomatic Track',
        courseId: 'crs-05',
        courseName: 'Spanish A1 Business & Diplomatic Track',
        batchId: 'batch-smc-01',
        batchName: 'Stella Maris Cohort 2026–2029',
        collegeName: 'Stella Maris College for Women (Autonomous)',
        attendancePercentage: 95.0,
        feePendingAmount: 0,
      },
    ],
  },
];

export default function SuperAdminParentsDirectoryPage() {
  const { showSuccess, showInfo } = useToast();
  const { selectedCollegeId, isOverall, getCollegeName } = useCollege();
  const [parents, setParents] = useState<ParentUser[]>(superAdminMockParents);

  // 1. Available Courses filtered by selected College context
  const filteredCourses = useMemo(() => {
    if (isOverall || !selectedCollegeId) return mockCourses;
    return mockCourses.filter((c) => !c.collegeId || c.collegeId === selectedCollegeId);
  }, [selectedCollegeId, isOverall]);

  // Selected Course Filter State ('ALL' or specific courseId)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');

  // Batches belonging to the Active Course Filter
  const availableBatches = useMemo(() => {
    if (selectedCourseId === 'ALL') {
      if (isOverall || !selectedCollegeId) return mockBatches;
      return mockBatches.filter((b) => !b.institutionId || b.institutionId === selectedCollegeId);
    }
    return mockBatches.filter((b) => {
      const matchCourseId = b.courseIds?.includes(selectedCourseId);
      const matchCollege = isOverall || !selectedCollegeId || !b.institutionId || b.institutionId === selectedCollegeId;
      return matchCourseId && matchCollege;
    });
  }, [selectedCourseId, selectedCollegeId, isOverall]);

  // Selected Batch Filter State ('ALL' or specific batchId)
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');

  // View Category Tab ('ALL' | 'MULTI_CHILD' | 'NEEDS_ATTENTION')
  const [activeTab, setActiveTab] = useState<'ALL' | 'MULTI_CHILD' | 'NEEDS_ATTENTION'>('ALL');

  // General Filters
  const [relationshipFilter, setRelationshipFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Parent for Quick Drawer
  const [inspectParent, setInspectParent] = useState<ParentUser | null>(null);

  const handleToggleParentStatus = (parentId: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setParents((prev) =>
      prev.map((p) => (p.id === parentId ? { ...p, status: nextStatus } : p))
    );
    if (nextStatus === 'ACTIVE') {
      showSuccess(`Parent portal account activated.`);
    } else {
      showInfo(`Parent portal account suspended.`);
    }
  };

  // Filtered dataset combining Course, Batch, College, Tab, Dropdowns and Search
  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      // 1. College Scope Filter
      if (!isOverall && selectedCollegeId) {
        const matchesCollege = p.linkedStudents.some((s) => {
          const inst = mockInstitutions.find((i) => i.id === selectedCollegeId);
          return inst && s.collegeName.toLowerCase().includes(inst.name.toLowerCase());
        });
        if (!matchesCollege) return false;
      }

      // 2. Course Filter
      if (selectedCourseId !== 'ALL') {
        const matchesCourse = p.linkedStudents.some(
          (s) => s.courseId === selectedCourseId || s.programName.toLowerCase().includes(
            (mockCourses.find((c) => c.id === selectedCourseId)?.name || '').toLowerCase()
          )
        );
        if (!matchesCourse) return false;
      }

      // 3. Batch Filter
      if (selectedBatchId !== 'ALL') {
        const matchesBatch = p.linkedStudents.some((s) => s.batchId === selectedBatchId);
        if (!matchesBatch) return false;
      }

      // 4. Tab Filter
      if (activeTab === 'MULTI_CHILD' && p.linkedStudents.length <= 1) return false;
      if (activeTab === 'NEEDS_ATTENTION') {
        const hasLowAttendance = p.linkedStudents.some((s) => s.attendancePercentage < 75);
        const hasFeePending = p.linkedStudents.some((s) => (s.feePendingAmount || 0) > 0);
        if (!hasLowAttendance && !hasFeePending) return false;
      }

      // 5. Dropdown Filters
      if (relationshipFilter !== 'ALL' && p.relationship !== relationshipFilter) return false;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

      // 6. Search Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesParent =
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.mobile.includes(q);
        const matchesStudent = p.linkedStudents.some(
          (s) =>
            s.studentName.toLowerCase().includes(q) ||
            s.studentId.toLowerCase().includes(q) ||
            s.programName.toLowerCase().includes(q) ||
            (s.batchName || '').toLowerCase().includes(q)
        );
        return matchesParent || matchesStudent;
      }
      return true;
    });
  }, [
    parents,
    selectedCourseId,
    selectedBatchId,
    relationshipFilter,
    statusFilter,
    searchQuery,
    activeTab,
    isOverall,
    selectedCollegeId,
  ]);

  // Dynamic Metrics based on filtered result
  const totalParents = parents.length;
  const totalChildrenCovered = parents.reduce((acc, p) => acc + p.linkedStudents.length, 0);
  const multiChildParents = parents.filter((p) => p.linkedStudents.length > 1).length;
  const attentionParentsCount = parents.filter((p) =>
    p.linkedStudents.some((s) => s.attendancePercentage < 75 || (s.feePendingAmount || 0) > 0)
  ).length;

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Institutions & Users', href: '/super-admin/users' },
          { label: 'Parents & Guardians' },
        ]}
      />

      <CollegeFilterBar />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-[#0052CC]" />
              <span>Parents & Guardians Central Directory</span>
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
              Central Master
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered family accounts, multi-child linkages, course & cohort rosters, and attendance contact ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/super-admin/students"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-200 cursor-pointer shadow-2xs"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Student Directory</span>
          </Link>
          <button
            type="button"
            onClick={() => showSuccess('Exporting Parents & Guardians Master CSV audit ledger...')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. RESPONSIVE COURSE SELECTION CARDS                                       */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <BookMarked className="w-4 h-4 text-[#0052CC]" />
            <span>Filter Parents by Enrolled Course</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Showing parents whose children are enrolled in selected course
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Card: All Courses */}
          <button
            type="button"
            onClick={() => {
              setSelectedCourseId('ALL');
              setSelectedBatchId('ALL');
              showSuccess('Showing parents across all courses');
            }}
            className={`text-left p-3 rounded-2xl border transition duration-200 flex flex-col justify-between cursor-pointer ${
              selectedCourseId === 'ALL'
                ? 'bg-blue-50/80 border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-[#0052CC]">
                ALL TRACKS
              </span>
              {selectedCourseId === 'ALL' && (
                <span className="w-4 h-4 rounded-full bg-[#0052CC] text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </div>
            <strong className="text-xs font-black text-[#0B2447] truncate block">
              All Courses
            </strong>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {parents.length} Total Parents
            </span>
          </button>

          {/* Individual Course Cards */}
          {filteredCourses.map((c) => {
            const isSelected = selectedCourseId === c.id;
            const parentCount = parents.filter((p) =>
              p.linkedStudents.some((s) => s.courseId === c.id || s.programName.toLowerCase().includes(c.name.toLowerCase()))
            ).length;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCourseId(c.id);
                  setSelectedBatchId('ALL'); // Reset batch when course changes
                  showSuccess(`Filtered parents by Course: ${c.name}`);
                }}
                className={`text-left p-3 rounded-2xl border transition duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-[#0052CC] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.code}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#0052CC] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <strong className="text-xs font-black text-[#0B2447] line-clamp-1 block" title={c.name}>
                  {c.name}
                </strong>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {parentCount} Registered Parents
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RESPONSIVE BATCH / COHORT SELECTION CARDS                               */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>
              Filter Parents by Cohort / Batch ({availableBatches.length} Available)
            </span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Inspect families belonging to a specific teaching batch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Card: All Batches */}
          <button
            type="button"
            onClick={() => {
              setSelectedBatchId('ALL');
              showSuccess('Viewing all batches');
            }}
            className={`text-left p-3 rounded-2xl border transition duration-200 flex flex-col justify-between cursor-pointer ${
              selectedBatchId === 'ALL'
                ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                ALL BATCHES
              </span>
              {selectedBatchId === 'ALL' && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </div>
            <strong className="text-xs font-black text-emerald-950 truncate block mt-1">
              Every Cohort
            </strong>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Full cross-cohort roster
            </span>
          </button>

          {/* Individual Batch Cards */}
          {availableBatches.map((b) => {
            const isSelected = selectedBatchId === b.id;
            const parentCount = parents.filter((p) =>
              p.linkedStudents.some((s) => s.batchId === b.id)
            ).length;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBatchId(b.id);
                  showSuccess(`Viewing parents in Batch: ${b.name}`);
                }}
                className={`text-left p-3 rounded-2xl border transition duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider truncate">
                      {b.studentsCount} Students
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <strong className="text-xs font-black text-[#0B2447] truncate block" title={b.name}>
                  {b.name}
                </strong>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 pt-1 border-t border-slate-100">
                  <span className="truncate max-w-[130px] font-medium text-slate-700">
                    {b.assignedFacultyName || 'Mme. Claire Fontaine'}
                  </span>
                  <span className="font-bold text-emerald-700">
                    {parentCount} Parents
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KPI CARDS METRIC SUMMARY                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-blue-50/60 border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-xs'
              : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-700">Total Parents</span>
            <HeartHandshake className="w-4 h-4 text-[#0052CC]" />
          </div>
          <p className="text-2xl font-black text-[#0B2447]">{totalParents}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified guardian profiles</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-indigo-700">Students Covered</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-[#0B2447]">{totalChildrenCovered}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active linked learners</p>
        </div>

        <div
          onClick={() => setActiveTab('MULTI_CHILD')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'MULTI_CHILD'
              ? 'bg-purple-50/60 border-purple-600 ring-2 ring-purple-600/20 shadow-xs'
              : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-purple-700">Multi-Child Families</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-950">{multiChildParents}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Parents with 2+ children</p>
        </div>

        <div
          onClick={() => setActiveTab('NEEDS_ATTENTION')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'NEEDS_ATTENTION'
              ? 'bg-rose-50/60 border-rose-600 ring-2 ring-rose-600/20 shadow-xs'
              : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-rose-700">Action Required</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-950">{attentionParentsCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Low attendance or fees due</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SEARCH & FILTER TOOLBAR                                                */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by parent name, mobile, email, student ID, child name or batch..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Relationship Filter */}
          <select
            value={relationshipFilter}
            onChange={(e) => setRelationshipFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Relationships</option>
            <option value="FATHER">Father</option>
            <option value="MOTHER">Mother</option>
            <option value="GUARDIAN">Legal Guardian</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">All Account Status</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="INACTIVE">Suspended</option>
          </select>
        </div>
      </div>

      {/* View Filter Pill Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ALL'
              ? 'bg-[#0B2447] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>All Filtered Parents ({filteredParents.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MULTI_CHILD')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'MULTI_CHILD'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Child Families ({multiChildParents})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('NEEDS_ATTENTION')}
          className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'NEEDS_ATTENTION'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Notice Required ({attentionParentsCount})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. PARENTS CARDS GRID (WITH BATCH & COURSE METADATA)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParents.map((parent) => {
          const hasNotice = parent.linkedStudents.some(
            (s) => s.attendancePercentage < 75 || (s.feePendingAmount || 0) > 0
          );

          return (
            <div
              key={parent.id}
              className={`p-5 bg-white rounded-2xl border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                hasNotice ? 'border-amber-300 shadow-2xs' : 'border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                {/* Top Row: Parent Name & Relationship Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {parent.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-[#0B2447] leading-snug truncate">
                        {parent.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.2 rounded font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {parent.relationship}
                        </span>
                        {parent.linkedStudents.length > 1 && (
                          <span className="text-[10px] px-2 py-0.2 rounded font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                            {parent.linkedStudents.length} Children
                          </span>
                        )}
                        {hasNotice && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                            Attention
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusToggleSwitch
                      checked={parent.status === 'ACTIVE'}
                      onChange={() => handleToggleParentStatus(parent.id, parent.status)}
                      activeLabel="Active"
                      inactiveLabel="Inactive"
                      showLabels={false}
                    />
                    <StatusBadge status={parent.status} />
                  </div>
                </div>

                {/* Contact Info Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{parent.mobile}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{parent.email}</span>
                  </p>
                </div>

                {/* Linked Students List with Course & Batch Cards */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Linked Student{parent.linkedStudents.length > 1 ? 's' : ''} ({parent.linkedStudents.length})
                  </p>
                  <div className="space-y-2">
                    {parent.linkedStudents.map((child) => (
                      <div
                        key={child.studentId}
                        className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-1.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-black text-[#0B2447] truncate">{child.studentName}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">
                              ID: {child.studentId}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`text-[10px] font-bold block ${
                                child.attendancePercentage >= 85
                                  ? 'text-emerald-700'
                                  : child.attendancePercentage >= 75
                                  ? 'text-amber-700'
                                  : 'text-rose-600 font-black'
                              }`}
                            >
                              {child.attendancePercentage}% Att.
                            </span>
                            {child.feePendingAmount ? (
                              <span className="text-[9px] font-bold text-rose-600 block">
                                ₹{child.feePendingAmount} Due
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-600 block">
                                Fees Clear
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Enrolled Course & Batch Details Badge */}
                        <div className="pt-1.5 border-t border-blue-100 flex items-center justify-between text-[11px] gap-2">
                          <div className="flex items-center gap-1 min-w-0 text-[#0052CC]">
                            <BookOpen className="w-3 h-3 shrink-0" />
                            <span className="truncate font-semibold">{child.programName}</span>
                          </div>
                          {child.batchName && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100/80 text-emerald-800 shrink-0 truncate max-w-[140px]">
                              {child.batchName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectParent(parent)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Ledger</span>
                </button>
                <button
                  type="button"
                  onClick={() => showSuccess(`Direct notification sent to ${parent.name} (${parent.mobile})`)}
                  className="flex-1 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Notify</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredParents.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No parents matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your course card, batch card, search query or college filter.
          </p>
        </div>
      )}

      {/* ─── Parent Quick Profile Details Slide-Over Drawer ─── */}
      {inspectParent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-[#0B2447] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center font-black text-sm border border-white/20">
                    {inspectParent.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{inspectParent.name}</h3>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      {inspectParent.relationship} • {inspectParent.mobile}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectParent(null)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5 text-xs text-slate-700">
                {/* Personal & Contact Details */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Parent / Guardian Master Record
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Legal Full Name:</span>
                      <strong className="text-slate-900">{inspectParent.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Relationship:</span>
                      <strong className="text-[#0052CC] font-bold">{inspectParent.relationship}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registered Mobile:</span>
                      <strong className="text-slate-900 font-mono">{inspectParent.mobile}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email Address:</span>
                      <strong className="text-slate-900">{inspectParent.email}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Portal Credentials:</span>
                      <span className="font-bold text-emerald-700">Delivered & Active</span>
                    </div>
                  </div>
                </div>

                {/* Linked Children Roster with Course & Batch info */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Linked Children & Academic Cohorts ({inspectParent.linkedStudents.length})
                  </h4>
                  <div className="space-y-3">
                    {inspectParent.linkedStudents.map((child) => (
                      <div
                        key={child.studentId}
                        className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-black text-indigo-950 text-sm">{child.studentName}</h5>
                            <p className="text-[10px] text-slate-500 font-mono">{child.studentId}</p>
                          </div>
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                              child.attendancePercentage >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : child.attendancePercentage >= 75
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {child.attendancePercentage}% Attendance
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 pt-2 border-t border-indigo-200/60 space-y-1">
                          <p className="flex justify-between">
                            <span className="text-slate-500">Course Track:</span>
                            <strong className="text-slate-800">{child.programName}</strong>
                          </p>
                          {child.batchName && (
                            <p className="flex justify-between">
                              <span className="text-slate-500">Assigned Cohort:</span>
                              <strong className="text-emerald-800">{child.batchName}</strong>
                            </p>
                          )}
                          <p className="flex justify-between">
                            <span className="text-slate-500">College / Center:</span>
                            <span className="text-slate-700 font-medium">{child.collegeName}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">Fee Status:</span>
                            {child.feePendingAmount ? (
                              <strong className="text-rose-600 font-bold">
                                ₹{child.feePendingAmount} Due
                              </strong>
                            ) : (
                              <strong className="text-emerald-700 font-bold">Paid in Full</strong>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit & Compliance Safeguard */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Parent Communication & Audit Safeguard</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Automated SMS alerts for student attendance shortfall, quarterly academic reports, and fee reminders are transmitted to <strong>{inspectParent.mobile}</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectParent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showSuccess(`Official academic notice dispatched to ${inspectParent.name}.`);
                  setInspectParent(null);
                }}
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-xs"
              >
                Send Direct Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

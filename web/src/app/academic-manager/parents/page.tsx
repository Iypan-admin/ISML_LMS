// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: PARENTS & GUARDIANS DIRECTORY
// (/academic-manager/parents)
// Dedicated Parent Portal Directory: Multi-Student Links, Contacts & Engagement
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
  Building
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import { useToast } from '@/context/ToastContext';
import { ParentUser, UserStatus } from '@/types/rbac';
import { mockStudents } from '@/mock/superAdminData';

// Generate Parent Dataset from mockStudents with multi-student relations
export const initialMockParents: ParentUser[] = [
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
        programName: 'B.Sc Computer Science',
        collegeName: 'Loyola College of Arts & Science',
        attendancePercentage: 92.4,
        feePendingAmount: 0,
      },
      {
        studentId: 'ISML20260042',
        studentName: 'Priya Sharma',
        programName: 'Japanese N5 Language Diploma',
        collegeName: 'ISML Online Language Institute',
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
        programName: 'German A1 Intensive Program',
        collegeName: 'Loyola College of Arts & Science',
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
        collegeName: 'Loyola College of Arts & Science',
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
        programName: 'B.Sc Computer Science',
        collegeName: 'Loyola College of Arts & Science',
        attendancePercentage: 78.5,
        feePendingAmount: 12500,
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
        programName: 'B.Sc Computer Science',
        collegeName: 'Loyola College of Arts & Science',
        attendancePercentage: 98.0,
        feePendingAmount: 0,
      },
      {
        studentId: 'ISML20250088',
        studentName: 'Sanjay Sundaram',
        programName: 'Korean TOPIK I Fast-Track',
        collegeName: 'ISML Online Language Institute',
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
        programName: 'Bachelor of Computer Applications (BCA)',
        collegeName: 'Loyola College of Arts & Science',
        attendancePercentage: 62.0,
        feePendingAmount: 18000,
      },
    ],
  },
];

export default function AcademicManagerParentsPage() {
  const { showSuccess, showInfo } = useToast();
  const [parents, setParents] = useState<ParentUser[]>(initialMockParents);

  // Filters
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
      showInfo(`Parent portal account deactivated.`);
    }
  };

  // Filtered dataset
  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      if (relationshipFilter !== 'ALL' && p.relationship !== relationshipFilter) return false;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

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
            s.programName.toLowerCase().includes(q)
        );
        return matchesParent || matchesStudent;
      }
      return true;
    });
  }, [parents, relationshipFilter, statusFilter, searchQuery]);

  // Metrics
  const totalParents = parents.length;
  const totalChildrenCovered = parents.reduce((acc, p) => acc + p.linkedStudents.length, 0);
  const multiChildParents = parents.filter((p) => p.linkedStudents.length > 1).length;
  const activePortalLogins = parents.filter((p) => p.credentialsDelivered).length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'People & Faculty' }, { label: 'Parents & Guardians' }]} />

      <CollegeFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#0052CC]" />
            <span>Parents & Guardians Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered parents & legal guardians, multi-student family linkages, contact ledger & automated attendance notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/academic-manager/students"
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#0052CC] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 cursor-pointer shadow-2xs"
          >
            <GraduationCap className="w-4 h-4 text-[#0052CC]" />
            <span>Students Directory</span>
          </Link>
          <button
            onClick={() => showSuccess('Exporting Parents & Guardians CSV audit report...')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Parents CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-600">Total Parents</span>
            <HeartHandshake className="w-4 h-4 text-[#0052CC]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{totalParents}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified guardian profiles</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-indigo-700">Students Covered</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{totalChildrenCovered}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active children linked</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-purple-700">Multi-Child Families</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{multiChildParents}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Parents with 2+ children</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-emerald-700">Portal Enabled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#0B2447]">{activePortalLogins}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Credentials delivered</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by parent name, mobile, email or student name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
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
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Parents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParents.map((parent) => (
          <div
            key={parent.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Top Row: Parent Name & Relationship Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {parent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2447] leading-snug">{parent.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-2 py-0.2 rounded font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {parent.relationship}
                      </span>
                      {parent.linkedStudents.length > 1 && (
                        <span className="text-[10px] px-2 py-0.2 rounded font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                          {parent.linkedStudents.length} Children
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                <p className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{parent.mobile}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-500 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{parent.email}</span>
                </p>
              </div>

              {/* Linked Students List */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Linked Student{parent.linkedStudents.length > 1 ? 's' : ''} ({parent.linkedStudents.length})
                </p>
                <div className="space-y-1.5">
                  {parent.linkedStudents.map((child) => (
                    <div
                      key={child.studentId}
                      className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#0B2447]">{child.studentName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{child.studentId} • {child.programName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-bold block ${
                          child.attendancePercentage >= 85 ? 'text-emerald-700' :
                          child.attendancePercentage >= 75 ? 'text-amber-700' : 'text-rose-600'
                        }`}>
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
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setInspectParent(parent)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => showSuccess(`SMS alert dispatched to ${parent.name} (${parent.mobile})`)}
                className="flex-1 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Notify</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Parent Quick Profile Details Slide-Over Drawer ─── */}
      {inspectParent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-[#0B2447] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-sm border border-white/20">
                    {inspectParent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{inspectParent.name}</h3>
                    <p className="text-xs text-indigo-200 mt-0.5">{inspectParent.relationship} • {inspectParent.mobile}</p>
                  </div>
                </div>

                <button
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
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Parent / Guardian Details
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Legal Full Name:</span>
                      <strong className="text-slate-900">{inspectParent.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Relationship:</span>
                      <strong className="text-[#0052CC]">{inspectParent.relationship}</strong>
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
                      <span className="text-slate-500">Portal Onboarding:</span>
                      <span className="font-bold text-emerald-700">Delivered & Active</span>
                    </div>
                  </div>
                </div>

                {/* Linked Children Roster */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                            <h5 className="font-bold text-indigo-950 text-sm">{child.studentName}</h5>
                            <p className="text-[10px] text-slate-500 font-mono">{child.studentId}</p>
                          </div>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                            child.attendancePercentage >= 85 ? 'bg-emerald-100 text-emerald-800' :
                            child.attendancePercentage >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {child.attendancePercentage}% Attendance
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 pt-2 border-t border-indigo-200/60 space-y-1">
                          <p className="flex justify-between">
                            <span className="text-slate-500">Program:</span>
                            <strong className="text-slate-800">{child.programName}</strong>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">Institution:</span>
                            <span className="text-slate-700">{child.collegeName}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">Tuition Fee Status:</span>
                            {child.feePendingAmount ? (
                              <strong className="text-rose-600 font-bold">₹{child.feePendingAmount} Pending</strong>
                            ) : (
                              <strong className="text-emerald-700 font-bold">Clear (Paid in Full)</strong>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication History Notice */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Parent Communication & Audit Safeguard</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Automated SMS alerts for student live class absence, quarterly performance gradecards, and fee notifications are routed directly to <strong>{inspectParent.mobile}</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setInspectParent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showSuccess(`Official academic notice dispatched to ${inspectParent.name}.`);
                  setInspectParent(null);
                }}
                className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
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

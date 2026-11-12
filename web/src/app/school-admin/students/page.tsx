// ============================================================================
// ISML SCHOOL LMS — PUPIL ROSTER DIRECTORY (/school-admin/students)
// Scoped to selected School campus with real database items
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  Filter,
  UserCheck,
  CreditCard,
  Building2,
  Mail,
  School,
} from 'lucide-react';
import { fastFetch } from '@/lib/fastCache';

export default function SchoolAdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeSchool, setActiveSchool] = useState({
    id: 'SIVA-LIONS',
    name: 'Sivakasi Lions Matriculation Higher Secondary School',
  });

  useEffect(() => {
    let schId = 'SIVA-LIONS';
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('isml_admin_user') || localStorage.getItem('isml_user');
        if (stored) {
          const u = JSON.parse(stored);
          const isCollege = u.role === 'COLLEGE_ADMIN' || (u.email && u.email.includes('americancollege'));
          const schoolName = !isCollege && u.campusName ? u.campusName : 'Sivakasi Lions Matriculation Higher Secondary School';
          schId = !isCollege && (u.tenantId || u.institutionCode) ? (u.tenantId || u.institutionCode) : 'SIVA-LIONS';
          setActiveSchool({
            id: schId,
            name: schoolName,
          });
        }
      }
    } catch {}

    fastFetch(`/api/portals/students?collegeId=${encodeURIComponent(schId)}`, (json) => {
      if (json && json.data) setStudents(json.data);
    });
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (statusFilter === 'ACTIVE' && s.status !== 'ACTIVE') return false;
      if (statusFilter === 'SUSPENDED' && s.status === 'ACTIVE') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          (s.batchName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <School className="w-6 h-6 text-blue-600" />
              <span>School Pupil Directory</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
              {students.length} Pupils
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active K-12 learner registry for {activeSchool.name}.
          </p>
        </div>

        <Link
          href="/school-admin/fees"
          className="px-4 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
        >
          <CreditCard className="w-4 h-4" />
          <span>Term Fees Clearance</span>
        </Link>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pupils by name, roll number, or grade section..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Account Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">Pupil Name & Roll No</th>
                <th className="py-3 px-4">Language Track</th>
                <th className="py-3 px-4">Section / Grade</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr key="empty-row">
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-medium">
                    No pupils found matching query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => (
                  <tr key={s.id || s.studentId || `pupil-${index}`} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{s.studentId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {s.programName || 'Junior Foreign Language Track'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {s.batchName || 'Grade Section'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-700">
                        {s.attendancePercentage || 94}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/school-admin/students/${s.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: BATCHES & TIMETABLES
// (/college-admin/batches)
// Active batches with schedule timings, student counts, and assigned tutor profiles
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Users,
  Clock,
  Calendar,
  Building2,
  GraduationCap,
  ArrowRight,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { fastFetch } from '@/lib/fastCache';

export default function CollegeAdminBatchesPage() {
  const currentCollege = {
    id: 'inst-01',
    name: 'Loyola College of Arts & Science',
    code: 'LOYOLA',
    address: 'Sterling Road, Nungambakkam, Chennai',
    phone: '+91 44 2817 8200',
    email: 'admin@loyola.edu',
    website: 'https://loyolacollege.edu',
    status: 'ACTIVE' as const,
    type: 'COLLEGE' as const,
    affiliation: 'Autonomous • University of Madras',
    contactEmail: 'admin@loyola.edu',
    contactPhone: '+91 44 2817 8200',
  };

  const [batches, setBatches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let collegeIdParam = '';
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('isml_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.campusId) collegeIdParam = u.campusId;
        }
      }
    } catch {}

    fastFetch('http://localhost:4000/api/portals/batches', (json) => {
      if (json && json.data) {
        // Filter out school cohorts if any, keep college cohorts
        const collegeBatches = json.data.filter((b: any) =>
          !b.institutionName || !b.institutionName.includes('School')
        );
        setBatches(collegeBatches.length > 0 ? collegeBatches : json.data);
      }
      setIsLoading(false);
    });
  }, []);

  const filteredBatches = batches.filter((b) =>
    (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.assignedFacultyName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-600" />
              <span>Campus Batches & Timetables</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {filteredBatches.length} Cohorts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active class timings, assigned rooms, tutor allocations and student capacities for {currentCollege.name}.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches or faculty..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 transition shadow-2xs"
          />
        </div>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Batches Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? 'No cohorts matching your search filter.' : 'No active cohorts registered yet for this campus.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((b) => (
            <div
              key={b.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {b.status || 'ACTIVE'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {b.academicYear || '2026–2027'}
                  </span>
                </div>

                <h3 className="font-black text-sm text-[#0B2447] leading-snug">
                  {b.name}
                </h3>
                <p className="text-xs text-slate-500">{b.departmentName || b.programName || 'Foreign Language Immersion'}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Classroom Timings:</span>
                  <strong className="text-slate-900 font-mono">{b.batchTiming || '10:00 AM - 11:30 AM'}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Schedule Days:</span>
                  <strong className="text-slate-900">
                    {Array.isArray(b.scheduleDays) ? b.scheduleDays.join(', ').toUpperCase() : 'MON, WED, FRI'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Assigned Faculty:</span>
                  <strong className="text-purple-700">{b.assignedFacultyName || 'Foreign Language Faculty'}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Enrolled Strength:</span>
                  <strong className="text-slate-900">{b.studentsCount || 35} Students</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/college-admin/fees"
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Clear Batch Dues →
                </Link>
                <Link
                  href="/college-admin/students"
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition"
                >
                  View Learners
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

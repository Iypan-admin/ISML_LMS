// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: CAMPUS COURSES DIRECTORY
// (/college-admin/courses)
// Courses mapped to the active campus with student enrollment and completion %
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Search,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { mockInstitutions, mockCourses, mockBatches } from '@/mock/superAdminData';

export default function CollegeAdminCoursesPage() {
  const currentCollege = mockInstitutions[0];
  const courses = mockCourses.filter((c) => c.collegeId === currentCollege.id || !c.collegeId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.facultyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#0052CC]" />
              <span>Campus Courses Catalog</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
              {courses.length} Active Tracks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Foreign language and technical degree tracks active for {currentCollege.name}.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by title, course code or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] border border-blue-200">
                  {c.code}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {c.completionRate}% Delivered
                </span>
              </div>

              <h3 className="font-black text-sm text-[#0B2447] leading-snug line-clamp-2">
                {c.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">{c.department}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Enrolled Learners:</span>
                <strong className="text-slate-900">{c.enrolledStudents} Students</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Lead Faculty:</span>
                <strong className="text-slate-900 truncate max-w-[150px]">{c.facultyName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tuition Rate:</span>
                <strong className="text-emerald-700 font-mono">₹{(c.courseFee || 0).toLocaleString()} / sem</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/college-admin/fees"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Bulk Fee Pay</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/college-admin/students"
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] text-xs font-bold rounded-xl transition"
              >
                View Students
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

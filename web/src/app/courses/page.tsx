"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  GraduationCap
} from 'lucide-react';
import { fastFetch } from '@/lib/fastCache';

export default function ExploreCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('isml_user');
        if (stored) {
          const u = JSON.parse(stored);
          setUserProfile(u);
        }
      }
    } catch {}

    // Load purely from Real Database API
    fastFetch('/api/portals/courses', (json) => {
      setIsLoading(false);
      if (json?.status === 'success' && Array.isArray(json.data)) {
        // Exclude sample courses so newly enrolled or empty catalog stays strictly clean
        const realNonSample = json.data.filter((c: any) => 
          !c.name?.toLowerCase().includes('sample') && 
          !c.code?.toLowerCase().includes('sample')
        );
        setCourses(realNonSample);
      }
    });
  }, []);

  const institutionName = userProfile?.tenantName || userProfile?.collegeName || 'The American College';

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ─── Hero Header Banner ─── */}
      <div className="p-6 rounded-2xl shadow-lg border space-y-3 text-white bg-gradient-to-r from-[#0B2447] via-[#071730] to-[#1E3A8A] border-blue-900/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 bg-[#0052CC] text-white">
              <BookOpen className="w-3 h-3 text-cyan-300" />
              <span>Campus Course Catalog</span>
            </span>
            <span className="text-xs text-blue-200">
              Direct Academic Offerings
            </span>
          </div>
          <Link
            href="/learning"
            className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 transition"
          >
            <span>My Active Learning</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Explore Courses & Certifications
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl mt-1">
            Browse and enroll into newly offered certified courses for {institutionName}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold pt-1">
          <div className="px-3 py-1 rounded-xl flex items-center gap-1.5 bg-blue-500/20 text-cyan-200 border border-cyan-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enrolled Institution: {institutionName}</span>
          </div>
        </div>
      </div>

      {/* ─── Courses Directory / Empty State ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Available Courses ({courses.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold">
            Live Database Catalog
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading course catalog from database...</div>
        ) : courses.length === 0 ? (
          <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No New Courses Open for Enrollment</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no additional courses available to enroll. Any newly launched batches or language certifications created by the academic coordinator will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/learning"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                <span>Go to My Curriculum</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c: any) => (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg font-black text-xs bg-blue-50 border border-blue-200 text-[#0052CC]">
                    {c.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] text-[10px] font-extrabold">
                    Eligible
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#0B2447] leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {c.department || 'Academic Department'}
                  </p>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Duration:</span>
                    <span className="font-extrabold text-slate-800">{c.duration || '80 Hours'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Faculty:</span>
                    <span className="font-extrabold text-slate-800">{c.facultyName || 'Lead Faculty'}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Course Fee:</span>
                  <span className="font-mono text-emerald-700 font-extrabold text-sm">
                    ₹{(c.courseFee || 18500).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

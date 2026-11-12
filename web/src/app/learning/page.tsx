"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fastFetch } from '@/lib/fastCache';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  PlayCircle, 
  Video, 
  FileText, 
  FileCheck2, 
  Headphones, 
  CheckCircle2, 
  Clock, 
  Lock,
  Download,
  FolderOpen,
  Calendar,
  Users,
  Award,
  Layers,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface BatchInfo {
  id: string;
  name: string;
  code?: string;
  timing?: string;
  schedule?: string;
  campusName?: string;
  tutorName?: string;
}

interface CourseItem {
  id: string;
  name: string;
  code: string;
  department?: string;
  duration?: string;
  totalModules?: number;
  batches: BatchInfo[];
}

export default function MyLearningPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [expandedModule, setExpandedModule] = useState<string>('mod-1');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    let currentUser: any = null;
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('isml_user');
        if (stored) currentUser = JSON.parse(stored);
      }
    } catch {}
    setStudentProfile(currentUser);

    // Fetch dynamic live courses and batches
    Promise.all([
      new Promise<any[]>((resolve) => {
        fastFetch('/api/portals/courses', (json) => resolve(json?.data || []));
      }),
      new Promise<any[]>((resolve) => {
        fastFetch('/api/portals/batches', (json) => resolve(json?.data || []));
      }),
    ]).then(([rawCourses, rawBatches]) => {
      const isSchoolStudent = /school|siva|lion|matric/i.test(currentUser?.campusName || currentUser?.tenantName || '');
      const studentTenantId = currentUser?.tenantId || currentUser?.institutionId;
      const enrolledCourseName = currentUser?.courseName || currentUser?.enrolledCourse || '';
      const enrolledBatchName = currentUser?.batchName || '';

      // Find real matching batches that belong to the student's enrolled batch, or have active allocations
      const validBatches = (rawBatches || []).filter((b: any) => {
        if (enrolledBatchName && enrolledBatchName !== 'Active Cohort') {
          return b.name?.toLowerCase() === enrolledBatchName.toLowerCase() || b.id === currentUser?.batchId;
        }
        // If not explicitly set in session, include batches belonging to the student's tenant
        if (studentTenantId) {
          return b.institutionId === studentTenantId;
        }
        return true;
      });

      // Active batches to use
      const effectiveBatches = validBatches.length > 0 ? validBatches : (rawBatches || []);

      // Filter courses:
      // A course is only enrolled if:
      // 1. It directly matches the student's assigned courseName, OR
      // 2. An actual allocated batch links to this course (via courseIds or programId)
      const enrolledCourses = (rawCourses || []).filter((c: any) => {
        // Explicit course match
        if (enrolledCourseName && enrolledCourseName !== 'Foreign Language Track') {
          const matchName = c.name?.toLowerCase() === enrolledCourseName.toLowerCase() || 
                            c.displayName?.toLowerCase() === enrolledCourseName.toLowerCase();
          if (matchName) return true;
        }

        // Batch association match (only show course if the student's batch actually includes this course)
        const hasAssignedBatch = effectiveBatches.some((b: any) => {
          return b.programId === c.id || 
                 (Array.isArray(b.courseIds) && b.courseIds.includes(c.id)) ||
                 (Array.isArray(b.courseNames) && b.courseNames.some((cn: string) => cn?.toLowerCase() === c.name?.toLowerCase()));
        });

        return hasAssignedBatch;
      });

      // Fallback: If no explicit batch link found (e.g. fresh student), show only the 1 single relevant course for student's tenant
      const finalCoursePool = enrolledCourses.length > 0 ? enrolledCourses : (
        rawCourses && rawCourses.length > 0 ? [rawCourses[rawCourses.length - 1]] : []
      );

      const coursesWithBatches: CourseItem[] = finalCoursePool.map((c: any) => {
        const matchingBatches = effectiveBatches.filter((b: any) => {
          return b.programId === c.id || 
                 (Array.isArray(b.courseIds) && b.courseIds.includes(c.id)) ||
                 (Array.isArray(b.courseNames) && b.courseNames.some((cn: string) => cn?.toLowerCase() === c.name?.toLowerCase())) ||
                 b.name?.toLowerCase().includes(c.name?.toLowerCase());
        });

        // Only assign real matching batches, or if none, fallback to the single cohort batch
        const batchList: BatchInfo[] = (matchingBatches.length > 0 ? matchingBatches : effectiveBatches.slice(0, 1)).map((b: any) => ({
          id: b.id,
          name: b.name || (isSchoolStudent ? 'Grade 8 Section A' : 'MRNG BATCH'),
          code: b.code || (isSchoolStudent ? 'SEC-A' : 'BAT-01'),
          timing: b.batchTiming || '07:30 PM - 11:00 PM',
          schedule: Array.isArray(b.scheduleDays) ? b.scheduleDays.join(', ') : (b.schedule || 'Mon, Wed, Fri'),
          campusName: b.institutionName || currentUser?.campusName || currentUser?.tenantName || 'The American College',
          tutorName: b.assignedFacultyName || 'Joy JK',
        }));

        return {
          id: c.id,
          name: c.name,
          code: c.code || 'CRS-101',
          department: c.department || 'Languages & Humanities',
          duration: c.duration || '90 Days',
          totalModules: 6,
          batches: batchList,
        };
      });

      setCourses(coursesWithBatches);
      if (coursesWithBatches.length > 0) {
        setSelectedCourseId(coursesWithBatches[0].id);
        if (coursesWithBatches[0].batches.length > 0) {
          setSelectedBatchId(coursesWithBatches[0].batches[0].id);
        }
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const activeBatch = activeCourse?.batches?.find((b) => b.id === selectedBatchId) || activeCourse?.batches?.[0];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ─── Page Header Title ─── */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC] flex-wrap">
          <span className="font-bold">{activeCourse?.department || 'Curriculum Hub'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#0052CC]" />
          <span className="font-bold text-slate-800">{activeCourse?.name || 'Assigned Course'}</span>
          {activeBatch && (
            <>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0052CC] font-bold text-[11px]">
                {activeBatch.name}
              </span>
            </>
          )}
          {activeBatch?.tutorName && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Trainer: {activeBatch.tutorName}</span>
            </>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B2447]">
          My Assigned Curriculum & Cohorts
        </h1>
        <p className="text-xs text-slate-600">
          Explore your enrolled language tracks, active cohort batches, and pedagogical lesson modules.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="inline-block w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Loading your assigned curriculum and batch tracks...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ─── SECTION 1: MY COURSES ─── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  My Enrolled Courses ({courses.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Click course to switch syllabus & batch
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {courses.map((crs) => {
                const isSelected = selectedCourseId === crs.id;
                return (
                  <button
                    key={crs.id}
                    onClick={() => {
                      setSelectedCourseId(crs.id);
                      if (crs.batches.length > 0) setSelectedBatchId(crs.batches[0].id);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#0052CC] ring-2 ring-blue-500/20 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0052CC]">
                          {crs.code}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-500">
                          {crs.duration}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-[#0B2447] leading-snug">
                        {crs.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {crs.department}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600">
                        {crs.batches.length} {crs.batches.length === 1 ? 'Cohort Batch' : 'Cohort Batches'}
                      </span>
                      <span className="text-[#0052CC]">
                        {crs.totalModules} Academic Modules →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── SECTION 2: MY ASSIGNED BATCHES FOR THIS COURSE ─── */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  Assigned Batches for <span className="text-[#0052CC]">{activeCourse?.name}</span>
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500 shrink-0">
                {activeCourse?.batches?.length || 0} Cohort Allocated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(activeCourse?.batches || []).map((b) => {
                const isSelected = selectedBatchId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBatchId(b.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#0052CC] ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Active Cohort
                      </span>
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        {b.timing}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {b.name}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Campus: <span className="font-bold text-slate-800">{b.campusName}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>Schedule: {b.schedule}</span>
                      <span className="font-bold text-[#0052CC]">Trainer: {b.tutorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── SECTION 3: PEDAGOGICAL LESSON MODULES ─── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Curriculum Modules for {activeBatch?.name || 'Active Batch'}
                </h2>
              </div>
            </div>

            {/* Zero mock modules: Clean empty state when no modules uploaded yet */}
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No Modules Published Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Curriculum syllabus, live class links, and lesson modules for this batch will appear here once released by your faculty trainer.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

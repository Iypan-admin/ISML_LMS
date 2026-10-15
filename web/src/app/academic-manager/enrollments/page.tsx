// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: STUDENT ENROLLMENTS
// (/academic-manager/enrollments)
// ============================================================================

"use client";

import React, { useState } from 'react';
import { UserPlus, Plus, CheckCircle2, Users, Layers, GraduationCap } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { mockStudents, mockBatches } from '@/mock/superAdminData';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useToast } from '@/context/ToastContext';

export default function AcademicManagerEnrollmentsPage() {
  const { showSuccess } = useToast();

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'People & Enrollment' }, { label: 'Student Enrollments' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <span>Student Cohort Enrollment Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk cohort assignments, student transfers between batches, and academic track enrollments.
          </p>
        </div>

        <button
          onClick={() => showSuccess('Batch allocation modal triggered.')}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Cohort in Bulk</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockBatches.slice(0, 3).map((b) => (
          <div key={b.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                AY {b.admissionYear}–{b.graduationYear}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {b.studentsCount} Learners
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{b.name}</h3>
            <p className="text-xs text-slate-500">{b.programName}</p>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Sections: {b.sectionsCount}</span>
              <button
                onClick={() => showSuccess(`Enrolling students to ${b.name}`)}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Enroll More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — BATCHES MANAGEMENT
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Users, BookOpen, Building2, Eye } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import { Can } from '@/context/AuthRbacContext';
import { Batch } from '@/types/rbac';
import { mockBatches, mockPrograms, mockDepartments, mockStudents, mockCourses } from '@/mock/superAdminData';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import ViewEnrolledStudentsDrawer from '@/components/super-admin/academic/ViewEnrolledStudentsDrawer';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';

export default function BatchesPage() {
  const { showSuccess, showInfo } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [studentsDrawerBatch, setStudentsDrawerBatch] = useState<Batch | null>(null);

  // Filter batches based on selected college or overall
  const displayBatches = batches.filter((b) => {
    if (isOverall) return true;
    if (b.institutionId) return b.institutionId === selectedCollegeId;
    const prog = mockPrograms.find((p) => p.id === b.programId);
    const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleToggleBatch = (batch: Batch) => {
    const nextStatus = batch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setBatches((prev) =>
      prev.map((b) => (b.id === batch.id ? { ...b, status: nextStatus } : b))
    );
    if (nextStatus === 'INACTIVE') {
      showInfo(`Batch cohort "${batch.name}" suspended.`);
    } else {
      showSuccess(`Batch cohort "${batch.name}" activated.`);
    }
  };



  const columns: Column<Batch>[] = [
    {
      key: 'name',
      header: 'Batch Cohort',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-[#0B2447] text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.programName}</p>
        </div>
      ),
    },
    {
      key: 'institutionName',
      header: 'Affiliated Campus',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.institutionName || 'Loyola College'}
        </span>
      ),
    },
    {
      key: 'admissionYear',
      header: 'Academic Year',
      render: (row) => (
        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
          {row.academicYear || `${row.admissionYear}–${row.graduationYear}`}
        </span>
      ),
    },
    {
      key: 'batchTiming',
      header: 'Class Timing & Staff',
      className: 'min-w-[170px]',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
            <span className="text-indigo-600">⏰</span>
            <span>{row.batchTiming ? row.batchTiming.split(' (')[0] : '09:00 AM – 11:00 AM'}</span>
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            Staff: <span className="font-semibold text-slate-700">{row.assignedFacultyName || 'Dr. Anandhakumar V.'}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'courseNames',
      header: 'Mapped Curricula (Courses)',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.courseNames && row.courseNames.length > 0 ? (
            row.courseNames.map((cn, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap"
              >
                {cn}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">No courses mapped</span>
          )}
        </div>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Students Count',
      sortable: true,
      render: (row) => (
        <button
          onClick={() => setStudentsDrawerBatch(row)}
          className="inline-flex items-center gap-1 font-bold text-[#0052CC] hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer text-xs"
          title="Click to view enrolled learners in this cohort"
        >
          <Users className="w-3 h-3 text-[#0052CC]" />
          <span>{row.studentsCount} Students</span>
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-[140px]',
      render: (row) => (
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full">
          <StatusToggleSwitch
            checked={row.status === 'ACTIVE'}
            onChange={() => handleToggleBatch(row)}
            activeLabel="Active"
            inactiveLabel="Suspended"
          />
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right min-w-[100px]',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setStudentsDrawerBatch(row)}
            className="px-2.5 py-1 text-slate-700 hover:text-[#0052CC] bg-blue-50/70 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-blue-200"
            title="Inspect Full Cohort, Staffs & Students"
          >
            <Eye className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Inspect Cohort</span>
          </button>
        </div>
      ),
    },
  ];

  // Learners enrolled in the batch selected in drawer
  const enrolledLearnersForDrawer = studentsDrawerBatch
    ? mockStudents.filter((s) => {
        if (s.batchId === studentsDrawerBatch.id || s.batchName === studentsDrawerBatch.name) {
          return true;
        }
        if (
          studentsDrawerBatch.institutionId &&
          s.collegeId === studentsDrawerBatch.institutionId &&
          s.batchName?.toLowerCase().includes(studentsDrawerBatch.name.toLowerCase().slice(0, 8))
        ) {
          return true;
        }
        return false;
      })
    : [];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic', href: '/super-admin/academic' }, { label: 'Batches' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Batches & Cohorts Monitoring
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Institutional oversight of student cohorts, admission cycles, timetable hours, faculty assignments, and enrolled learners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
            Institutional Audit Mode
          </span>
        </div>
      </div>

      <DataTable
        data={displayBatches}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search batch cohort, program, campus..."
        searchKey={(row) => `${row.name} ${row.programName} ${row.institutionName || ''}`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {row.institutionName || 'Loyola College'} • {row.programName}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusToggleSwitch
                  checked={row.status === 'ACTIVE'}
                  onChange={() => handleToggleBatch(row)}
                  activeLabel="Active"
                  inactiveLabel="Suspended"
                />
                <StatusBadge status={row.status} />
              </div>
            </div>

            {/* Mapped Courses */}
            {row.courseNames && row.courseNames.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">Courses:</span>
                {row.courseNames.map((cn, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200"
                  >
                    {cn}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-700">
                {row.admissionYear} – {row.graduationYear}
              </span>
              <span>•</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Sem {row.currentSemesterNumber}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
              <button
                onClick={() => setStudentsDrawerBatch(row)}
                className="text-[11px] text-[#0052CC] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View ({row.studentsCount} Students)</span>
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStudentsDrawerBatch(row)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </div>
        )}
      />

      <ViewEnrolledStudentsDrawer
        isOpen={!!studentsDrawerBatch}
        onClose={() => setStudentsDrawerBatch(null)}
        title={studentsDrawerBatch ? `${studentsDrawerBatch.name}` : 'Cohort Learners'}
        subtitle={`Campus: ${studentsDrawerBatch?.institutionName || 'All Campuses'} • Timing: ${studentsDrawerBatch?.batchTiming || '09:00 AM - 11:00 AM'}`}
        students={enrolledLearnersForDrawer}
        staffInfo={
          studentsDrawerBatch
            ? {
                facultyName: studentsDrawerBatch.assignedFacultyName || 'Dr. Anandhakumar V.',
                substituteTutors: studentsDrawerBatch.assignedStaffNames || ['Ms. Ananya Sharma (TA)'],
                doubtTutor: 'Mr. Karthik Sundaram (TA)',
                batchTiming: studentsDrawerBatch.batchTiming || '09:00 AM – 11:00 AM (Morning Session)',
                scheduleDays: studentsDrawerBatch.scheduleDays || ['MON', 'WED', 'FRI'],
                courseNames: studentsDrawerBatch.courseNames || [],
              }
            : undefined
        }
      />
    </div>
  );
}

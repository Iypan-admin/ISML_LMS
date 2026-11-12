// ============================================================================
// ISML COLLEGE LMS — BATCHES & COHORTS MONITORING
// Live Data Driven / Strictly Audit & Monitoring Only (No Creation by Super Admin)
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layers, Users, BookOpen, Building2, Eye, Calendar, Clock, RefreshCw } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import { Batch } from '@/types/rbac';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import ViewEnrolledStudentsDrawer from '@/components/super-admin/academic/ViewEnrolledStudentsDrawer';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';
import { fastFetch } from '@/lib/fastCache';

export default function BatchesPage() {
  const { showSuccess, showInfo } = useToast();
  const { selectedCollegeId, selectedCollege, isOverall, isSchoolMode } = useCollege();
  
  // Real live batches from backend API
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [studentsDrawerBatch, setStudentsDrawerBatch] = useState<Batch | null>(null);

  // Fetch live batches from backend API with local route fallback
  const fetchLiveBatches = useCallback(async () => {
    try {
      let res;
      try {
        res = await fetch('/api/portals/batches', { cache: 'no-store' });
        if (!res.ok) throw new Error();
      } catch {
        res = await fetch('http://localhost:4000/api/portals/batches', { cache: 'no-store' });
      }
      const json = await res.json();
      if (json) {
        const rawBatches = Array.isArray(json) ? json : (json.data || []);
        const mapped: Batch[] = rawBatches.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code || `BAT-${b.id?.slice(-4)}`,
          institutionId: b.institutionId || b.collegeId || '521323cd-00da-49a6-98ed-6b7918d181b4',
          institutionName: b.institutionName || 'The American College',
          programId: b.programId || b.courseId || '',
          programName: b.programName || b.courseNames?.[0] || 'Language Course',
          departmentName: b.departmentName || 'Language & Humanities',
          academicYear: b.academicYear || '2026–2027',
          admissionYear: Number(b.admissionYear) || 2026,
          graduationYear: Number(b.graduationYear) || 2027,
          currentSemesterNumber: b.currentSemesterNumber || 1,
          sectionsCount: b.sectionsCount || 1,
          studentsCount: Number(b.studentsCount || b.maxStudents || 0),
          courseIds: b.courseIds || (b.courseId ? [b.courseId] : []),
          courseNames: b.courseNames || [],
          batchTiming: b.batchTiming || '10:00 AM – 11:30 AM',
          scheduleDays: b.scheduleDays || ['mon', 'wed', 'fri'],
          assignedFacultyName: b.assignedFacultyName || 'Assigned Faculty',
          assignedStaffNames: b.assignedStaffNames || [],
          status: b.status === 'ACTIVE' || b.status === 'ONGOING' ? 'ACTIVE' : (b.status || 'DRAFT'),
          createdAt: b.createdAt || new Date().toISOString(),
        }));
        setBatches(mapped);
        setIsLoading(false);
      }
    } catch (e) {
      console.warn('Failed to fetch batches in super admin:', e);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveBatches();
  }, [fetchLiveBatches]);

  // Filter batches based on selected institution scope
  const displayBatches = useMemo(() => {
    return batches.filter((b) => {
      if (isOverall) return true;
      if (b.institutionId) return b.institutionId === selectedCollegeId;
      return true;
    });
  }, [batches, isOverall, selectedCollegeId]);

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
          <p className="text-[11px] text-slate-500 font-medium">{row.programName || 'General Cohort'}</p>
        </div>
      ),
    },
    {
      key: 'institutionName',
      header: 'Affiliated Campus',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.institutionName || 'Institutional Campus'}
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
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-700 font-semibold">
            <Clock className="w-3 h-3 text-indigo-500" />
            <span>{row.batchTiming || 'Flexible Timetable'}</span>
          </div>
          {row.assignedFacultyName && (
            <div className="text-[10px] text-slate-500">
              Staff: <strong className="text-slate-700">{row.assignedFacultyName}</strong>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'courseNames',
      header: 'Mapped Curricula (Courses)',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
          {row.courseNames && row.courseNames.length > 0 ? (
            row.courseNames.map((cn, i) => (
              <span
                key={i}
                className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200"
              >
                {cn}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">No courses linked</span>
          )}
        </div>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Learners',
      render: (row) => (
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
          {row.studentsCount || 0} Students
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
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

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Architecture', href: '/super-admin/academic/curriculum' }, { label: 'Batches' }]} />

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
          <button
            onClick={fetchLiveBatches}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
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
        searchKey={(row) => `${row.name} ${row.programName || ''} ${row.institutionName || ''}`}
        emptyTitle="No Batches or Cohorts Found"
        emptyDescription={`There are currently no active cohorts registered for ${isOverall ? 'any institution' : (selectedCollege?.name || 'this institution')}. Batches created by Academic Managers will appear here for oversight.`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {row.institutionName || 'Campus'} • {row.programName || 'General Program'}
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
                Sem {row.currentSemesterNumber || 1}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
              <button
                onClick={() => setStudentsDrawerBatch(row)}
                className="text-[11px] text-[#0052CC] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View ({row.studentsCount || 0} Students)</span>
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

      {/* Inspect Cohort Enrolled Students Drawer */}
      <ViewEnrolledStudentsDrawer
        isOpen={!!studentsDrawerBatch}
        onClose={() => setStudentsDrawerBatch(null)}
        title={studentsDrawerBatch ? `${studentsDrawerBatch.name}` : 'Cohort Learners'}
        subtitle={`Campus: ${studentsDrawerBatch?.institutionName || 'All Campuses'} • Timing: ${studentsDrawerBatch?.batchTiming || 'Flexible Timetable'}`}
        students={[]}
        staffInfo={
          studentsDrawerBatch
            ? {
                facultyName: studentsDrawerBatch.assignedFacultyName || 'Assigned Faculty',
                substituteTutors: studentsDrawerBatch.assignedStaffNames || [],
                doubtTutor: 'Teaching Assistant',
                batchTiming: studentsDrawerBatch.batchTiming || 'Timetable Scheduled',
                scheduleDays: studentsDrawerBatch.scheduleDays || ['MON', 'WED', 'FRI'],
                courseNames: studentsDrawerBatch.courseNames || [],
              }
            : undefined
        }
      />
    </div>
  );
}

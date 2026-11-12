// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: BATCHES & COHORTS (/academic-manager/batches)
// Batch Creation, Multi-Cohort Management, Capacity Limits & Live Super Admin Approvals
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layers, Plus, Edit2, Users, BookOpen, Clock, Calendar, CheckCircle2, Eye } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Batch } from '@/types/rbac';
import CreateBatchDrawer from '@/components/super-admin/academic/CreateBatchDrawer';
import BatchDetailDrawer from '@/components/academic-manager/BatchDetailDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';
import { fastFetch } from '@/lib/fastCache';

export default function AcademicManagerBatchesPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [viewBatchDetail, setViewBatchDetail] = useState<Batch | null>(null);

  // Fetch live batches from backend API with local route fallback
  const fetchLiveBatches = useCallback(async () => {
    try {
      let res;
      try {
        res = await fetch('/api/portals/batches', { cache: 'no-store' });
        if (!res.ok) throw new Error();
      } catch {
        res = await fetch('https://ismllms-production.up.railway.app/api/portals/batches', { cache: 'no-store' });
      }
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        const liveBatches: Batch[] = json.data.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code || `BAT-${b.id?.slice(-4)}`,
          institutionId: b.institutionId || '521323cd-00da-49a6-98ed-6b7918d181b4',
          institutionName: b.institutionName || 'The American College',
          programId: b.programId || b.courseId || 'course-track',
          programName: b.programName || b.courseNames?.[0] || 'Language Certification',
          departmentName: b.departmentName || 'Foreign Languages & Linguistics',
          academicYear: b.academicYear || '2026–2027',
          admissionYear: Number(b.admissionYear) || 2026,
          graduationYear: Number(b.graduationYear) || 2027,
          currentSemesterNumber: b.currentSemesterNumber || 1,
          sectionsCount: b.sectionsCount || 1,
          studentsCount: b.studentsCount || 35,
          courseIds: b.courseIds || (b.courseId ? [b.courseId] : []),
          courseNames: b.courseNames || [],
          batchTiming: b.batchTiming || '10:00 AM – 11:30 AM',
          scheduleDays: b.scheduleDays || ['mon', 'wed', 'fri'],
          assignedFacultyName: b.assignedFacultyName || 'Joy Jk',
          assignedStaffNames: b.assignedStaffNames || [],
          status: b.status === 'ACTIVE' || b.status === 'ONGOING' ? 'ACTIVE' : (b.status || 'DRAFT'),
          createdAt: b.createdAt || new Date().toISOString(),
        }));
        setBatches(liveBatches);
      }
    } catch (e) {
      console.warn('Failed to fetch batches:', e);
    }
  }, []);

  useEffect(() => {
    fetchLiveBatches();

    const handleRealtime = (e: any) => {
      const type = e?.detail?.type;
      if (type === 'BATCHES_UPDATED' || type === 'APPROVAL_REVIEWED' || type === 'APPROVAL_SUBMITTED') {
        console.log('⚡ [Academic Batches] Realtime Event Detected:', type);
        fetchLiveBatches();
      }
    };

    window.addEventListener('isml-realtime-event', handleRealtime);

    return () => {
      window.removeEventListener('isml-realtime-event', handleRealtime);
    };
  }, [fetchLiveBatches]);

  const displayBatches = useMemo(() => {
    return batches.filter((b) => {
      if (isOverall) return true;
      if (b.institutionId) return b.institutionId === selectedCollegeId || b.institutionId === 'inst-01';
      return true;
    });
  }, [batches, isOverall, selectedCollegeId]);

  const handleBatchCreated = (newBatch: Batch) => {
    setBatches((prev) => [newBatch, ...prev]);
    fetchLiveBatches();
  };

  const handleBatchUpdated = (updatedBatch: Batch) => {
    setBatches((prev) => prev.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)));
  };

  const columns: Column<Batch>[] = [
    {
      key: 'name',
      header: 'Batch Cohort',
      sortable: true,
      className: 'w-[35%] min-w-[190px]',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-[#0B2447] text-xs leading-snug line-clamp-1">{row.name}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {row.code || 'COHORT'}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              AY {row.academicYear || `${row.admissionYear}–${row.graduationYear}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'programName',
      header: 'Course Track & Schedule',
      sortable: true,
      className: 'w-[30%] min-w-[170px]',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-slate-800 line-clamp-1">
            {row.programName || row.courseNames?.[0] || 'Language Certification'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{row.batchTiming || '10:00 AM – 11:30 AM'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Seat Capacity',
      sortable: true,
      className: 'w-[15%] min-w-[110px]',
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 text-[11px]">
          <Users className="w-3.5 h-3.5" />
          {row.studentsCount} Seats
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-[20%] min-w-[130px]',
      render: (row) => (
        <div className="space-y-0.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              row.status === 'ACTIVE'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {row.status === 'ACTIVE' ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Active ✓</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-0.5" />
                <span>Draft</span>
              </>
            )}
          </span>
          <p className="text-[10px] text-slate-500 font-semibold truncate">
            {row.status === 'ACTIVE' ? 'Authorized by Super Admin' : 'Awaiting Super Admin Approval'}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[10%] min-w-[80px] text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setViewBatchDetail(row)}
            className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all cursor-pointer shadow-2xs"
            title="View Enrolled Students & Cohort Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setEditBatch(row);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
            title="Edit Batch"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Batches & Cohorts' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Academic Cohorts & Batch Setup</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure student admission cohorts, section divisions, intake seat capacity, and current academic cycles.
          </p>
        </div>

        <button
          onClick={() => {
            setEditBatch(null);
            setIsDrawerOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Cohort Batch</span>
        </button>
      </div>

      <DataTable<Batch>
        data={displayBatches}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search batches by cohort title, timing or intake year..."
        pageSize={10}
        emptyTitle="No cohort batches"
        emptyDescription="No active batches enrolled under this campus scope."
      />

      <CreateBatchDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditBatch(null);
        }}
        onBatchCreated={handleBatchCreated}
        onBatchUpdated={handleBatchUpdated}
        editBatch={editBatch}
      />

      <BatchDetailDrawer
        isOpen={!!viewBatchDetail}
        onClose={() => setViewBatchDetail(null)}
        batch={viewBatchDetail}
        onEdit={(b) => {
          setEditBatch(b);
          setIsDrawerOpen(true);
        }}
      />
    </div>
  );
}

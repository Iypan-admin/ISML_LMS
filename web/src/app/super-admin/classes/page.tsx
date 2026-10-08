// ============================================================================
// ISML COLLEGE LMS — CLASSES & LECTURE SESSIONS
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Video, Plus, Edit2, Trash2, Calendar, Clock, MapPin, Users, Wifi, Building, ExternalLink } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Can } from '@/context/AuthRbacContext';
import { ClassSessionItem } from '@/types/rbac';
import { mockClassSessions, mockBatches, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import ScheduleSessionDrawer from '@/components/super-admin/scheduling/ScheduleSessionDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';

export default function ClassesPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [classes, setClasses] = useState<ClassSessionItem[]>(mockClassSessions);
  const [modeFilter, setModeFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editSession, setEditSession] = useState<ClassSessionItem | null>(null);
  const [deleteSession, setDeleteSession] = useState<ClassSessionItem | null>(null);

  // Filter classes based on selected college or overall AND delivery mode
  const displayClasses = classes.filter((c) => {
    // Mode filter
    if (modeFilter !== 'ALL') {
      const isOnline = c.deliveryMode === 'ONLINE' || c.roomOrLink?.toLowerCase().includes('studio') || c.roomOrLink?.toLowerCase().includes('zoom');
      if (modeFilter === 'ONLINE' && !isOnline) return false;
      if (modeFilter === 'OFFLINE' && isOnline) return false;
    }

    if (isOverall) return true;
    const batch = mockBatches.find((b) => b.name === c.batchName);
    const prog = mockPrograms.find((p) => p.name === c.programName || p.id === batch?.programId);
    const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
  });

  const handleSessionScheduled = (newSession: ClassSessionItem) => {
    setClasses((prev) => [newSession, ...prev]);
  };

  const handleSessionUpdated = (updatedSession: ClassSessionItem) => {
    setClasses((prev) => prev.map((c) => (c.id === updatedSession.id ? updatedSession : c)));
  };

  const handleSessionDeleted = () => {
    if (!deleteSession) return;
    setClasses((prev) => prev.filter((c) => c.id !== deleteSession.id));
    showSuccess(`Class period slot for "${deleteSession.subjectName}" deleted.`);
    setDeleteSession(null);
  };

  const openScheduleDrawer = () => {
    setEditSession(null);
    setIsScheduleOpen(true);
  };

  const openEditDrawer = (session: ClassSessionItem) => {
    setEditSession(session);
    setIsScheduleOpen(true);
  };

  const columns: Column<ClassSessionItem>[] = [
    {
      key: 'subjectName',
      header: 'Subject & Topic',
      sortable: true,
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-bold text-[#0B2447] text-xs leading-snug">{row.subjectName}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.batchName}</p>
        </div>
      ),
    },
    {
      key: 'deliveryMode',
      header: 'Delivery Mode',
      className: 'min-w-[130px]',
      render: (row) => {
        const isOnline = row.deliveryMode === 'ONLINE' || row.roomOrLink?.toLowerCase().includes('studio') || row.roomOrLink?.toLowerCase().includes('zoom');
        return isOnline ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0052CC] border border-blue-200">
            <Wifi className="w-3 h-3 text-[#0052CC]" />
            <span>Online Live</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Building className="w-3 h-3 text-emerald-700" />
            <span>Offline Campus</span>
          </span>
        );
      },
    },
    {
      key: 'facultyName',
      header: 'Faculty Member',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-800 text-xs">{row.facultyName}</span>,
    },
    {
      key: 'schedule',
      header: 'Date & Time',
      render: (row) => (
        <div>
          <p className="font-bold text-xs text-[#0052CC]">{row.timeSlot}</p>
          <p className="text-[10px] text-slate-400">{row.date}</p>
        </div>
      ),
    },
    {
      key: 'roomOrLink',
      header: 'Location / Room Link',
      className: 'min-w-[170px]',
      render: (row) => {
        const isOnline = row.deliveryMode === 'ONLINE' || row.roomOrLink?.toLowerCase().includes('studio') || row.roomOrLink?.toLowerCase().includes('zoom');
        return isOnline ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#0052CC] bg-blue-50/70 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[180px]">
            <Video className="w-3 h-3 shrink-0" />
            <span className="truncate">{row.meetingUrl || row.roomOrLink}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[180px]">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{row.venueRoom || row.roomOrLink}</span>
          </span>
        );
      },
    },
    {
      key: 'attendeesCount',
      header: 'Assigned',
      render: (row) => <span className="font-semibold text-slate-700">{row.attendeesCount} Students</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right min-w-[70px]',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditDrawer(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Class Slot"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteSession(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Class Slot"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Classes' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            Class Sessions & Lecture Slots
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Real-time live lecture rooms, campus laboratory allocations, and hybrid class schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Online / Offline Mode Filter Segmented Control */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shadow-2xs text-xs font-bold">
            <button
              onClick={() => setModeFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                modeFilter === 'ALL'
                  ? 'bg-white text-[#0B2447] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Modes ({classes.length})
            </button>
            <button
              onClick={() => setModeFilter('ONLINE')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                modeFilter === 'ONLINE'
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>Online Live</span>
            </button>
            <button
              onClick={() => setModeFilter('OFFLINE')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                modeFilter === 'OFFLINE'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-3 h-3" />
              <span>Offline Campus</span>
            </button>
          </div>

          <Can permission="CLASS_CREATE">
            <button
              onClick={openScheduleDrawer}
              className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Schedule Lecture</span>
            </button>
          </Can>
        </div>
      </div>

      <DataTable
        data={displayClasses}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search class session, faculty, room..."
        searchKey={(row) => `${row.subjectName} ${row.facultyName} ${row.roomOrLink}`}
        mobileCardRender={(row) => {
          const isOnline = row.deliveryMode === 'ONLINE' || row.roomOrLink?.toLowerCase().includes('studio') || row.roomOrLink?.toLowerCase().includes('zoom');
          return (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0052CC] border border-blue-200">
                        <Wifi className="w-2.5 h-2.5" />
                        <span>Online Live</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Building className="w-2.5 h-2.5 text-emerald-700" />
                        <span>Offline Campus</span>
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.subjectName}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{row.batchName}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                <span className="font-bold text-blue-700">{row.timeSlot}</span>
                <span>•</span>
                <span>{row.date}</span>
                <span>•</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[150px]">
                  {row.venueRoom || row.roomOrLink}
                </span>
                <span>•</span>
                <span>{row.attendeesCount} Students</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">{row.facultyName}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditDrawer(row)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteSession(row)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      />

      <ScheduleSessionDrawer
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setEditSession(null);
        }}
        onSessionScheduled={handleSessionScheduled}
        editSession={editSession}
        onSessionUpdated={handleSessionUpdated}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteSession}
        onClose={() => setDeleteSession(null)}
        onConfirm={handleSessionDeleted}
        entityType="Class Session Period"
        entityName={`${deleteSession?.subjectName} (${deleteSession?.timeSlot})`}
        description="Canceling and deleting this class session will remove it from student timetables and faculty schedules."
      />
    </div>
  );
}

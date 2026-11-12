// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: LIVE CLASSES (/academic-manager/live-classes)
// 100% Online Interactive Video Classes, Google Meet Style Live Inspection & Attendance
// ============================================================================

"use client";

import React, { useState } from 'react';
import { Video, Plus, Edit2, Trash2, Calendar, Clock, Users, Wifi, ExternalLink, Play, Radio, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { ClassSessionItem } from '@/types/rbac';
import { mockClassSessions, mockBatches, mockPrograms, mockDepartments } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import ScheduleOnlineMeetingDrawer from '@/components/academic-manager/ScheduleOnlineMeetingDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import LiveMeetingInspectionModal, { ClassSessionData } from '@/components/academic-manager/LiveMeetingInspectionModal';
import { fastFetch } from '@/lib/fastCache';

export default function AcademicManagerLiveClassesPage() {
  const { showSuccess, showWarning } = useToast();
  const { selectedCollegeId, isOverall, isSchoolMode, selectedCollege } = useCollege();
  const [classes, setClasses] = useState<ClassSessionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE_NOW' | 'UPCOMING'>('ALL');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editSession, setEditSession] = useState<ClassSessionItem | null>(null);
  const [deleteSession, setDeleteSession] = useState<ClassSessionItem | null>(null);
  const [inspectingSession, setInspectingSession] = useState<ClassSessionData | null>(null);

  // Fetch live classes from backend API (live status always fresh without stale cache)
  const fetchLiveClasses = React.useCallback(async () => {
    try {
      const res = await fetch('https://ismllms-production.up.railway.app/api/live-classes', { cache: 'no-store' });
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        const mapped: ClassSessionItem[] = json.data.map((c: any) => ({
          id: c.id,
          subjectName: c.title || c.subjectName,
          programName: c.courseName || 'Foreign Language Certification',
          batchName: c.batchName || 'Interactive Batch',
          facultyName: c.tutorName || 'Certified Tutor',
          deliveryMode: 'ONLINE',
          meetingUrl: c.meetingUrl,
          roomOrLink: c.roomName || c.meetingUrl,
          date: c.scheduledStartTime ? c.scheduledStartTime.split('T')[0] : '2026-11-03',
          timeSlot: `${c.durationMinutes || 60} Mins Session`,
          attendeesCount: c.enrolledStudentsCount || 35,
          institutionId: c.institutionId || 'inst-01',
          status: (c.status === 'LIVE' || c.tutorJoined === true) ? 'LIVE_NOW' : c.status === 'DRAFT' ? 'DRAFT' : 'UPCOMING',
        }));
        setClasses(mapped);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    fetchLiveClasses();
    const interval = setInterval(fetchLiveClasses, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveClasses]);

  // Filter classes based on selected School/College AND status filter
  const displayClasses = classes.filter((c) => {
    if (statusFilter === 'LIVE_NOW' && c.status !== 'LIVE_NOW') return false;
    if (statusFilter === 'UPCOMING' && c.status !== 'UPCOMING') return false;

    // School vs College type filter
    const isClassSchool = c.batchName.toLowerCase().includes('school') ||
      c.batchName.includes('Grade') ||
      c.subjectName.toLowerCase().includes('school') ||
      c.timeSlot.includes('Period');
    if (isSchoolMode && !isClassSchool && classes.some(cl => cl.batchName.toLowerCase().includes('school') || cl.batchName.includes('Grade'))) {
      return false;
    }
    if (!isSchoolMode && isClassSchool) {
      return false;
    }

    if (isOverall) return true;
    if ((c as any).institutionId && (c as any).institutionId === selectedCollegeId) return true;
    const batch = mockBatches.find((b) => b.name === c.batchName);
    if (batch?.institutionId && batch.institutionId === selectedCollegeId) return true;
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
    showSuccess(`Online live class for "${deleteSession.subjectName}" removed.`);
    setDeleteSession(null);
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
      header: 'Format',
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0052CC] border border-blue-200">
          <Wifi className="w-3 h-3 text-[#0052CC]" />
          <span>Online Live</span>
        </span>
      ),
    },
    {
      key: 'roomOrLink',
      header: 'Meeting Link / Room',
      render: (row) => {
        const link = row.meetingUrl || row.roomOrLink || 'https://meet.google.com/ism-live';
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-slate-600 truncate max-w-[140px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title={link}>
              {link.replace(/^https?:\/\//, '')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'facultyName',
      header: 'Assigned Trainer',
      sortable: true,
      render: (row) => <span className="text-xs font-semibold text-slate-700">{row.facultyName}</span>,
    },
    {
      key: 'date',
      header: 'Schedule Slot',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {row.date}
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {row.timeSlot}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Session Status',
      render: (row) => (
        <div className="space-y-0.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              row.status === 'LIVE_NOW'
                ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                : row.status === 'DRAFT'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {row.status === 'LIVE_NOW' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping mr-0.5" />
                <span>Live Now</span>
              </>
            ) : row.status === 'DRAFT' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-0.5" />
                <span>Draft</span>
              </>
            ) : (
              <>
                <span className="text-emerald-600 mr-0.5">✓</span>
                <span>Authorized</span>
              </>
            )}
          </span>
          <p className="text-[10px] text-slate-500 font-semibold truncate">
            {row.status === 'DRAFT'
              ? 'Awaiting Super Admin Approval'
              : row.status === 'LIVE_NOW'
              ? 'Session Ongoing'
              : 'Approved by Super Admin'}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => {
        const isLive = row.status === 'LIVE_NOW';
        const isDraft = row.status === 'DRAFT';
        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* 🎥 GOOGLE MEET STYLE LIVE INSPECT / JOIN STUDIO BUTTON */}
            <button
              onClick={async () => {
                // Realtime check from backend API if tutor has actually started and is broadcasting
                try {
                  const checkRes = await fetch(`https://ismllms-production.up.railway.app/api/live-classes/${row.id}`);
                  const checkData = await checkRes.json();
                  const trulyLive = checkData?.data?.status === 'LIVE' || checkData?.data?.tutorJoined === true;

                  if (!trulyLive) {
                    showWarning(
                      'Live class has not started yet by tutor. Please wait for the faculty to launch the live broadcast.',
                      'Class Not Live Yet'
                    );
                    return;
                  }
                } catch {
                  if (!isLive) {
                    showWarning(
                      'Live class has not started yet by tutor. Please wait for the faculty to launch the live broadcast.',
                      'Class Not Live Yet'
                    );
                    return;
                  }
                }

                setInspectingSession({
                  id: row.id,
                  topic: row.subjectName,
                  subjectName: row.subjectName,
                  batchName: row.batchName,
                  batchCode: 'FR-A1-ONLINE',
                  facultyName: row.facultyName,
                  date: row.date,
                  timeSlot: row.timeSlot,
                  status: 'LIVE_NOW',
                  roomOrLink: row.meetingUrl || row.roomOrLink,
                  attendeesCount: row.attendeesCount || 38,
                });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isLive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              title={isLive ? 'Attend & Inspect Live Online Class' : 'Live class not started yet by tutor'}
            >
              <Video className={`w-3.5 h-3.5 ${isLive ? 'text-white' : 'text-slate-500'}`} />
              <span>{isLive ? 'Attend / Inspect Live' : 'Not Started Yet'}</span>
            </button>

            <button
              onClick={() => {
                setEditSession(row);
                setIsScheduleOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Edit Online Class Schedule"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Teaching & Learning' }, { label: 'Online Live Classes' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-rose-600" />
            <span>Online Live Classes & Meeting Rooms</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            100% online foreign language video lectures, Google Meet integration, real-time live attendance & meeting inspection.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              All Online
            </button>
            <button
              onClick={() => setStatusFilter('LIVE_NOW')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${statusFilter === 'LIVE_NOW' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Live Now
            </button>
            <button
              onClick={() => setStatusFilter('UPCOMING')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${statusFilter === 'UPCOMING' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Upcoming
            </button>
          </div>

          <button
            onClick={() => {
              setEditSession(null);
              setIsScheduleOpen(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Online Meeting</span>
          </button>
        </div>
      </div>

      <DataTable<ClassSessionItem>
        data={displayClasses}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="subjectName"
        searchPlaceholder="Search online classes by subject, faculty trainer or batch..."
        pageSize={10}
        emptyTitle="No online live classes scheduled"
        emptyDescription="No online classes scheduled for this campus scope."
      />

      <ScheduleOnlineMeetingDrawer
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setEditSession(null);
        }}
        onSessionScheduled={handleSessionScheduled}
        onSessionUpdated={handleSessionUpdated}
        editSession={editSession}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteSession}
        onClose={() => setDeleteSession(null)}
        onConfirm={handleSessionDeleted}
        title="Cancel Online Lecture"
        entityType="Online Class Session"
        entityName={deleteSession?.subjectName}
        description="Are you sure you want to cancel this online lecture? Enrolled learners and faculty will receive instant cancellation notifications."
      />

      {/* 🎬 GOOGLE MEET STYLE FULLSCREEN / MOBILE FRIENDLY LIVE INSPECTION ROOM */}
      {inspectingSession && (
        <LiveMeetingInspectionModal
          isOpen={!!inspectingSession}
          onClose={() => setInspectingSession(null)}
          session={inspectingSession}
        />
      )}
    </div>
  );
}

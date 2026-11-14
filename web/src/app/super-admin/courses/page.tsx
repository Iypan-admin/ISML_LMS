// ============================================================================
// ISML COLLEGE LMS — COURSES MANAGEMENT
// Active Teaching Courses, Faculty Allocations & Course Fees
// ============================================================================

"use client";

import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Globe, Archive, IndianRupee, Users, Eye } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import { Can } from '@/context/AuthRbacContext';
import { CourseSummary, StudentUser } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import ViewEnrolledStudentsDrawer from '@/components/super-admin/academic/ViewEnrolledStudentsDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CourseDetailDrawer from '@/components/academic-manager/CourseDetailDrawer';
import { useCollege } from '@/context/CollegeContext';
import { fastFetch } from '@/lib/fastCache';

export default function CoursesPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [studentsDrawerCourse, setStudentsDrawerCourse] = useState<CourseSummary | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<CourseSummary | null>(null);
  const [viewCourseDetail, setViewCourseDetail] = useState<CourseSummary | null>(null);

  // Fetch live courses, batches and students directly from DB API
  const fetchLiveCourses = React.useCallback(() => {
    Promise.all([
      fetch('/api/portals/courses').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/portals/batches').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/portals/students').then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([resCourses, resBatches, resStudents]) => {
      const batchList: any[] = Array.isArray(resBatches?.data) ? resBatches.data : [];
      const studentList: any[] = Array.isArray(resStudents?.data) ? resStudents.data : [];
      setDbStudents(studentList);

      if (resCourses?.status === 'success' && Array.isArray(resCourses.data)) {
        const live: CourseSummary[] = resCourses.data.map((c: any) => {
          // 1. Find matching batches allocated to this course (by courseIds, programId, or courseNames)
          const matchedBatches = batchList.filter((b: any) => {
            const hasId = b.courseIds && Array.isArray(b.courseIds) && b.courseIds.includes(c.id);
            const hasProgram = b.programId && b.programId === c.id;
            const hasName = b.courseNames && Array.isArray(b.courseNames) && b.courseNames.some((cn: string) => cn.toLowerCase() === c.name.toLowerCase());
            const hasProgName = b.programName && b.programName.toLowerCase() === c.name.toLowerCase();
            return hasId || hasProgram || hasName || hasProgName;
          });

          const batchNames = matchedBatches.map((b: any) => b.name);
          const batchIds = matchedBatches.map((b: any) => b.id);

          // 2. Exact dynamic count of students enrolled in this course from DB
          const enrolledInCourse = studentList.filter((s: any) => {
            const matchId = s.enrolledCourseId === c.id || s.programId === c.id;
            const matchCode = s.enrolledCourseCode?.toLowerCase() === c.code?.toLowerCase();
            const matchName = s.enrolledCourseName?.toLowerCase() === c.name?.toLowerCase() || s.programName?.toLowerCase() === c.name?.toLowerCase();
            const matchBatch = s.batchId && batchIds.includes(s.batchId);
            return matchId || matchCode || matchName || matchBatch;
          });

          return {
            id: c.id,
            code: c.code,
            name: c.name,
            collegeId: c.collegeId || c.tenantId || '521323cd-00da-49a6-98ed-6b7918d181b4',
            collegeName: c.collegeName || 'The American College',
            department: c.department || 'Department of Foreign Languages',
            program: c.program || `${c.durationDays || 120} Days Track`,
            semester: c.semester || 1,
            academicYear: c.academicYear || '2026–2027',
            duration: c.duration || `${c.durationDays || 120} Days`,
            durationDays: Number(c.durationDays) || 120,
            durationType: c.durationType || '4_MONTHS',
            facultyName: c.facultyName || (matchedBatches[0]?.assignedFacultyName || 'Joy JK'),
            substituteTutors: c.substituteTutors || [],
            doubtSupportTutor: c.doubtSupportTutor,
            enrolledStudents: enrolledInCourse.length || 0,
            completionRate: c.completionRate || 0,
            courseFee: c.courseFee || 18500,
            batchNames: batchNames.length > 0 ? batchNames : (c.batchNames || []),
            batchIds: batchIds.length > 0 ? batchIds : (c.batchIds || []),
            status: c.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          };
        });
        setCourses(live);
      }
    });
  }, []);

  React.useEffect(() => {
    fetchLiveCourses();
    const interval = setInterval(fetchLiveCourses, 6000);
    return () => clearInterval(interval);
  }, [fetchLiveCourses]);

  const handleDeleteCourse = async () => {
    if (!deleteCourse) return;
    try {
      await fetch('/api/portals/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id: deleteCourse.id }),
      });
      setCourses((prev) => prev.filter((c) => c.id !== deleteCourse.id));
      showSuccess(`Course "${deleteCourse.name}" (${deleteCourse.code}) deleted permanently by Super Admin.`);
      setDeleteCourse(null);
    } catch {
      setCourses((prev) => prev.filter((c) => c.id !== deleteCourse.id));
      setDeleteCourse(null);
    }
  };

  // Filter courses based on selected college or overall
  const displayCourses = courses.filter((c) => {
    if (isOverall) return true;
    if (!selectedCollegeId) return true;
    return c.collegeId === selectedCollegeId || c.collegeId === 'inst-01';
  });

  const handleTogglePublish = (course: CourseSummary) => {
    const nextStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? { ...c, status: nextStatus }
          : c
      )
    );
    showSuccess(`Course "${course.name}" status updated to ${nextStatus}.`);
  };



  const columns: Column<CourseSummary>[] = [
    {
      key: 'name',
      header: 'Course Name',
      sortable: true,
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-[#0B2447] text-sm leading-snug line-clamp-1">{row.name}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              AY {row.academicYear || '2026–2027'}
            </span>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              ⏳ {row.durationDays ? `${row.durationDays} Days` : (row.duration || '90 Days')}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'collegeName',
      header: 'College & Duration',
      className: 'min-w-[190px]',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800 text-xs leading-tight line-clamp-1">
            {row.collegeName || 'Loyola College'}
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">
            {row.duration || (row.durationDays ? `${row.durationDays} Days Track` : '90 Days Track')}
          </p>
        </div>
      ),
    },
    {
      key: 'batchNames',
      header: 'Batches',
      className: 'min-w-[170px]',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.batchNames && row.batchNames.length > 0 ? (
            row.batchNames.map((bn, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200 truncate max-w-[190px] block"
                title={bn}
              >
                {bn}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 italic">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'facultyName',
      header: 'Faculty',
      sortable: true,
      className: 'min-w-[130px]',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-900 text-xs truncate max-w-[150px] block">
            {row.facultyName}
          </span>
          {(row.substituteTutors && row.substituteTutors.length > 0) || row.doubtSupportTutor ? (
            <div className="flex items-center gap-1 text-[10px] text-indigo-700">
              <span className="px-1.5 py-0.2 bg-indigo-50 border border-indigo-200 rounded font-medium truncate max-w-[140px]" title={`Doubt Support: ${row.doubtSupportTutor || row.substituteTutors?.[0]}`}>
                TA: {row.doubtSupportTutor || row.substituteTutors?.[0]}
              </span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'courseFee',
      header: 'Fee',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-emerald-800 text-xs whitespace-nowrap">
          ₹{(row.courseFee || 12500).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'enrolledStudents',
      header: 'Enrolled',
      sortable: true,
      render: (row) => (
        <button
          onClick={() => setStudentsDrawerCourse(row)}
          className="inline-flex items-center gap-1 font-bold text-[#0052CC] hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/80 transition-colors cursor-pointer text-[11px] whitespace-nowrap"
          title="Click to view enrolled learners list"
        >
          <Users className="w-3 h-3 text-[#0052CC]" />
          <span>{row.enrolledStudents}</span>
        </button>
      ),
    },
    {
      key: 'completionRate',
      header: 'Progress',
      className: 'w-24',
      render: (row) => (
        <div className="w-20">
          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
            <span>{row.completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#0052CC] h-1.5 rounded-full"
              style={{ width: `${row.completionRate}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-[140px]',
      render: (row) => (
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full">
          <StatusToggleSwitch
            checked={row.status === 'PUBLISHED'}
            onChange={() => handleTogglePublish(row)}
            activeLabel="Published"
            inactiveLabel="Suspended"
          />
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right min-w-[150px]',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setViewCourseDetail(row)}
            className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            title="View Full Course Specifications & Code"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStudentsDrawerCourse(row)}
            className="px-2.5 py-1 text-slate-700 hover:text-[#0052CC] bg-blue-50/70 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-blue-200"
            title="Inspect Enrolled Learners & Curricula"
          >
            <Users className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Learners</span>
          </button>
          <button
            onClick={() => setDeleteCourse(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Course (Super Admin Only)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Enrolled learners for currently selected course in drawer (Dynamic from DB)
  const enrolledLearnersForDrawer = studentsDrawerCourse
    ? dbStudents.filter((s) => {
        if (s.enrolledCourseId === studentsDrawerCourse.id || s.enrolledCourseCode?.toLowerCase() === studentsDrawerCourse.code.toLowerCase()) {
          return true;
        }
        if (s.enrolledCourseName && s.enrolledCourseName.toLowerCase() === studentsDrawerCourse.name.toLowerCase()) {
          return true;
        }
        if (s.programId === studentsDrawerCourse.id || (s.programName && s.programName.toLowerCase() === studentsDrawerCourse.name.toLowerCase())) {
          return true;
        }
        if (studentsDrawerCourse.batchIds && s.batchId && studentsDrawerCourse.batchIds.includes(s.batchId)) {
          return true;
        }
        return false;
      })
    : [];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 font-sans">
      <Breadcrumbs
        items={[{ label: 'Academic', href: '/super-admin/academic' }, { label: 'Courses' }]}
      />

      {/* College Scoping Filter Bar */}
      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0B2447] tracking-tight">
            College Course Delivery
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Institutional monitoring of active teaching courses, enrolled learners, faculty assignments, and syllabus progress.
          </p>
        </div>
      </div>

      <DataTable
        data={displayCourses}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search course title, code, instructor, campus..."
        searchKey={(row) => `${row.name} ${row.code} ${row.facultyName} ${row.collegeName || ''}`}
        mobileCardRender={(row) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[#0B2447] text-xs leading-tight">{row.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {row.collegeName || 'Loyola College'} • {row.department}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusToggleSwitch
                  checked={row.status === 'PUBLISHED'}
                  onChange={() => handleTogglePublish(row)}
                  activeLabel="Published"
                  inactiveLabel="Suspended"
                />
                <StatusBadge status={row.status} />
              </div>
            </div>

            {/* Mapped Batches */}
            {row.batchNames && row.batchNames.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">Batches:</span>
                {row.batchNames.map((bn, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200"
                  >
                    {bn}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {row.code}
              </span>
              <span>•</span>
              <span className="font-bold text-emerald-800">₹{(row.courseFee || 12500).toLocaleString('en-IN')}</span>
              <span>•</span>
              <span>{row.facultyName}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <button
                onClick={() => setStudentsDrawerCourse(row)}
                className="text-[11px] text-[#0052CC] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3 h-3" />
                <span>{row.enrolledStudents} Enrolled Learners</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTogglePublish(row)}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Toggle status"
                >
                  {row.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => setStudentsDrawerCourse(row)}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Users className="w-3 h-3" />
                  <span>Learners</span>
                </button>
              </div>
            </div>
          </div>
        )}
      />

      <CourseDetailDrawer
        isOpen={!!viewCourseDetail}
        onClose={() => setViewCourseDetail(null)}
        course={viewCourseDetail}
      />

      <ViewEnrolledStudentsDrawer
        isOpen={!!studentsDrawerCourse}
        onClose={() => setStudentsDrawerCourse(null)}
        title={studentsDrawerCourse ? `${studentsDrawerCourse.name} (${studentsDrawerCourse.code})` : 'Enrolled Learners'}
        subtitle={`Campus: ${studentsDrawerCourse?.collegeName || 'All Campuses'} • ${studentsDrawerCourse?.department || ''}`}
        students={enrolledLearnersForDrawer}
      />

      <DeleteConfirmDrawer
        isOpen={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course (Super Admin Only)"
        entityType="Course"
        entityName={deleteCourse?.name}
        description="Are you sure you want to permanently delete this course? Only Super Admins have the authorization to perform this deletion."
      />
    </div>
  );
}

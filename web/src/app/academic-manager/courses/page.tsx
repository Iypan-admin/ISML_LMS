// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: COURSES BUILDER (/academic-manager/courses)
// Complete Multi-Section Course Builder, Curriculum Mapping, Faculty & Publish Lifecycle
// ============================================================================

"use client";

import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Globe, Archive, Users, CheckCircle2, ChevronRight, Layers, Eye } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusToggleSwitch from '@/components/common/StatusToggleSwitch';
import { CourseSummary } from '@/types/rbac';
import { mockCourses, mockDepartments, mockStudents } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';
import CreateCourseDrawer from '@/components/super-admin/academic/CreateCourseDrawer';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import ViewEnrolledStudentsDrawer from '@/components/super-admin/academic/ViewEnrolledStudentsDrawer';
import CourseDetailDrawer from '@/components/academic-manager/CourseDetailDrawer';
import { useCollege } from '@/context/CollegeContext';
import { fastFetch } from '@/lib/fastCache';

export default function AcademicManagerCoursesPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall, isSchoolMode } = useCollege();
  const [courses, setCourses] = useState<CourseSummary[]>(() => {
    // 0ms instant cached load from sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('isml_courses_cache');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('isml_courses_cache');
    }
    return true;
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseSummary | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<CourseSummary | null>(null);
  const [studentsDrawerCourse, setStudentsDrawerCourse] = useState<CourseSummary | null>(null);
  const [viewCourseDetail, setViewCourseDetail] = useState<CourseSummary | null>(null);

  // Fetch live courses directly from DB API
  const fetchLiveCourses = React.useCallback(() => {
    fetch('https://ismllms-production.up.railway.app/api/portals/courses')
      .then((res) => res.json())
      .then((res) => {
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          const liveCourses: CourseSummary[] = res.data.map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            collegeId: c.collegeId || c.tenantId || '',
            collegeName: c.collegeName || c.tenant?.name || '',
            department: c.department || 'Languages & Humanities',
            program: c.program || c.duration || `${c.durationDays || 90} Days Track`,
            semester: 1,
            academicYear: c.academicYear || '2026–2027',
            duration: c.duration || (c.durationDays ? `${c.durationDays} Days` : '90 Days'),
            durationDays: Number(c.durationDays) || 90,
            durationType: c.durationType || (c.durationDays === 180 ? '6_MONTHS' : c.durationDays === 365 ? '1_YEAR' : c.durationDays === 90 ? '3_MONTHS' : 'CUSTOM'),
            facultyName: c.facultyName || 'Lead Academic Faculty',
            substituteTutors: c.substituteTutors || [],
            doubtSupportTutor: c.doubtSupportTutor,
            enrolledStudents: c.enrolledStudents || 0,
            completionRate: c.completionRate || 0,
            courseFee: c.courseFee || 0,
            status: c.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          }));
          setCourses(liveCourses);
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('isml_courses_cache', JSON.stringify(liveCourses));
            } catch {}
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch courses:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  React.useEffect(() => {
    fetchLiveCourses();

    const handleRealtime = (e: any) => {
      const type = e?.detail?.type;
      if (type === 'COURSES_UPDATED' || type === 'APPROVAL_REVIEWED' || type === 'APPROVAL_SUBMITTED') {
        console.log('⚡ [Academic Courses] Realtime Event Detected:', type);
        fetchLiveCourses();
      }
    };

    window.addEventListener('isml-realtime-event', handleRealtime);

    return () => {
      window.removeEventListener('isml-realtime-event', handleRealtime);
    };
  }, [fetchLiveCourses]);

  // Filter courses based on selected school/college or overall, deduplicating by id
  const displayCourses = React.useMemo(() => {
    const map = new Map<string, CourseSummary>();
    courses.forEach((c) => {
      // School vs College type check
      const isCourseSchool = (c.code && c.code.startsWith('SCH')) || (c.program && c.program.toLowerCase().includes('school')) || (c.name && c.name.toLowerCase().includes('school'));
      if (isSchoolMode && !isCourseSchool && courses.some(co => (co.code && co.code.startsWith('SCH')) || (co.name && co.name.toLowerCase().includes('school')))) {
        return;
      }
      if (!isSchoolMode && isCourseSchool) {
        return;
      }

      let matches = false;
      if (isOverall) {
        matches = true;
      } else if (!c.collegeId) {
        // Universal/Master courses (no specific tenantId) are available to all colleges
        matches = true;
      } else {
        // Course assigned to a specific college
        matches = c.collegeId === selectedCollegeId;
      }

      if (matches && !map.has(c.id)) {
        map.set(c.id, c);
      }
    });
    return Array.from(map.values());
  }, [courses, isOverall, selectedCollegeId, isSchoolMode]);

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

  const handleCourseCreated = (newCourse: CourseSummary) => {
    setCourses((prev) => [newCourse, ...prev]);
    fetchLiveCourses();
  };

  const handleCourseUpdated = (updatedCourse: CourseSummary) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const handleCourseDeleted = () => {
    if (!deleteCourse) return;
    setCourses((prev) => prev.filter((c) => c.id !== deleteCourse.id));
    showSuccess(`Course "${deleteCourse.name}" (${deleteCourse.code}) deleted.`);
    setDeleteCourse(null);
  };

  const columns: Column<CourseSummary>[] = [
    {
      key: 'name',
      header: 'Course & Track',
      sortable: true,
      className: 'w-[40%] min-w-[200px]',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-[#0B2447] text-xs leading-snug line-clamp-1">{row.name}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {row.code}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              AY {row.academicYear || '2026–2027'}
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
              ⏳ {row.durationDays ? `${row.durationDays} Days` : (row.duration || '90 Days')}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'facultyName',
      header: 'Assigned Faculty',
      sortable: true,
      className: 'w-[25%] min-w-[140px]',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-800 line-clamp-1">{row.facultyName || 'Lead Academic Faculty'}</p>
          <p className="text-[10px] text-slate-500 font-medium">
            {row.substituteTutors && row.substituteTutors.length > 0
              ? `+${row.substituteTutors.length} Substitute`
              : 'Primary Lead'}
          </p>
        </div>
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
              row.status === 'PUBLISHED'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {row.status === 'PUBLISHED' ? (
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
            {row.status === 'PUBLISHED' ? 'Authorized by Super Admin' : 'Awaiting Super Admin Approval'}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[15%] min-w-[90px] text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setViewCourseDetail(row)}
            className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all cursor-pointer shadow-2xs"
            title="View Full Curriculum Specifications (Hours, LSRW, Fee, Faculty)"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setEditCourse(row);
              setIsCreateOpen(true);
            }}
            className="p-1.5 text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
            title="Edit Course"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8 font-sans">
      <Breadcrumbs items={[{ label: 'Academic Structure' }, { label: 'Courses' }]} />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Course Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage course curriculum, faculty allocation, and batch schedules across departments.
          </p>
        </div>

        <button
          onClick={() => {
            setEditCourse(null);
            setIsCreateOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      <DataTable<CourseSummary>
        data={displayCourses}
        columns={columns}
        rowKey={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search courses by title, course code, department or faculty..."
        pageSize={10}
        isLoading={isLoading}
        emptyTitle="No active courses"
        emptyDescription="No active courses found for the current campus scope."
      />

      <CreateCourseDrawer
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditCourse(null);
        }}
        onCourseCreated={handleCourseCreated}
        onCourseUpdated={handleCourseUpdated}
        editCourse={editCourse}
      />

      <CourseDetailDrawer
        isOpen={!!viewCourseDetail}
        onClose={() => setViewCourseDetail(null)}
        course={viewCourseDetail}
        onEdit={(crs) => {
          setEditCourse(crs);
          setIsCreateOpen(true);
        }}
      />

      <ViewEnrolledStudentsDrawer
        isOpen={!!studentsDrawerCourse}
        onClose={() => setStudentsDrawerCourse(null)}
        title={studentsDrawerCourse?.name || 'Enrolled Learners'}
        subtitle={`Code: ${studentsDrawerCourse?.code || ''}`}
        students={mockStudents.filter((s) => s.enrolledCourseCode === studentsDrawerCourse?.code || s.programName === studentsDrawerCourse?.program)}
      />
    </div>
  );
}

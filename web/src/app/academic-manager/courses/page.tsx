// ============================================================================
// ISML COLLEGE LMS — ACADEMIC MANAGER: COURSES BUILDER (/academic-manager/courses)
// Complete Multi-Section Course Builder, Curriculum Mapping, Faculty & Publish Lifecycle
// ============================================================================

"use client";

import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Globe, Archive, Users, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
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
import { useCollege } from '@/context/CollegeContext';

export default function AcademicManagerCoursesPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [courses, setCourses] = useState<CourseSummary[]>(mockCourses);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseSummary | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<CourseSummary | null>(null);
  const [studentsDrawerCourse, setStudentsDrawerCourse] = useState<CourseSummary | null>(null);

  // Filter courses based on selected college or overall
  const displayCourses = courses.filter((c) => {
    if (isOverall) return true;
    if (c.collegeId) return c.collegeId === selectedCollegeId;
    const dept = mockDepartments.find((d) => d.name.toLowerCase() === c.department.toLowerCase());
    return !dept?.institutionId || dept.institutionId === selectedCollegeId;
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

  const handleCourseCreated = (newCourse: CourseSummary) => {
    setCourses((prev) => [newCourse, ...prev]);
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
      header: 'Course & Curriculum Track',
      sortable: true,
      className: 'min-w-[220px]',
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
          </div>
        </div>
      ),
    },
    {
      key: 'program',
      header: 'Language Program Track',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.program}</p>
          <p className="text-[11px] text-blue-600 font-bold">{row.duration || '90 Days Track'}</p>
        </div>
      ),
    },
    {
      key: 'facultyName',
      header: 'Assigned Faculty',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">{row.facultyName}</span>
      ),
    },
    {
      key: 'enrolledStudents',
      header: 'Enrollment',
      sortable: true,
      render: (row) => (
        <button
          onClick={() => setStudentsDrawerCourse(row)}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer transition-colors"
          title="Click to view enrolled students"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{row.enrolledStudents}</span>
        </button>
      ),
    },
    {
      key: 'completionRate',
      header: 'Progress',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${row.completionRate}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700">{row.completionRate}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusToggleSwitch
          checked={row.status === 'PUBLISHED'}
          onChange={() => handleTogglePublish(row)}
          activeLabel="Published"
          inactiveLabel="Draft"
          showLabels
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setEditCourse(row);
              setIsCreateOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Course Builder"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteCourse(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Course"
          >
            <Trash2 className="w-3.5 h-3.5" />
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

      <DeleteConfirmDrawer
        isOpen={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirm={handleCourseDeleted}
        title="Delete Course"
        entityType="Course"
        entityName={deleteCourse?.name}
        description="Are you sure you want to remove this course? All syllabus topics and enrolled learner references will be archived."
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

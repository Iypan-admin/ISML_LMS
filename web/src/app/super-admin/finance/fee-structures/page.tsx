// ============================================================================
// ISML COLLEGE LMS — SUPER ADMIN: INSTITUTIONAL COURSE FEE STRUCTURES
// User-friendly Course Cards with Live Fee Status, Direct Activate/Deactivate Toggle,
// Itemized Breakdown, Version History, and Course Fee Configuration
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  BookOpen,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ArrowUpRight,
  IndianRupee,
  School,
  Check,
  X,
} from 'lucide-react';
import { mockFeeStructures, mockPrograms, mockDepartments, mockCourses } from '@/mock/superAdminData';
import { FeeStructure, CourseSummary, RequestStatus } from '@/types/rbac';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import { useCollege } from '@/context/CollegeContext';
import { Modal } from '@/components/common/Modal';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import { useToast } from '@/context/ToastContext';
import { useRBAC } from '@/context/AuthRbacContext';
import CreateFeeStructureDrawer from '@/components/super-admin/finance/CreateFeeStructureDrawer';

type CourseFilterType = 'ALL' | 'ASSIGNED' | 'UNASSIGNED' | 'ACTIVE';

export default function FeeStructuresPage() {
  const { hasPermission } = useRBAC();
  const { showSuccess, showInfo, showError } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();

  const [structures, setStructures] = useState<FeeStructure[]>(mockFeeStructures);
  const [courseList, setCourseList] = useState<CourseSummary[]>(mockCourses);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [selectedCourseForDrawer, setSelectedCourseForDrawer] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<FeeStructure | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<CourseFilterType>('ALL');
  const [selectedCycle, setSelectedCycle] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Active / Deactivated State Map for fast toggle
  // Defaulting to status === 'APPROVED' or 'ACTIVE' as active
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>({});

  // Detail Modal for Version History & Audit Trail
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);

  // Scope courses based on campus filter
  const scopedCourses = useMemo(() => {
    return courseList.filter((course) => {
      if (isOverall) return true;
      return course.collegeId === selectedCollegeId;
    });
  }, [courseList, isOverall, selectedCollegeId]);

  // Combine Courses with matching Fee Structure & Active Status
  const courseCards = useMemo(() => {
    return scopedCourses.map((course) => {
      // Find matching fee structure by course code/name or batch
      const matchingFee = structures.find((s) => {
        const matchesName =
          s.programName.toLowerCase().includes(course.name.toLowerCase()) ||
          course.name.toLowerCase().includes(s.programName.toLowerCase());
        const matchesCode =
          s.code.toLowerCase().includes(course.code.toLowerCase()) ||
          course.code.toLowerCase().includes(s.code.toLowerCase());
        return matchesName || matchesCode;
      });

      const hasFeeAssigned = Boolean(course.courseFee && course.courseFee > 0) || Boolean(matchingFee);
      const effectiveAmount =
        matchingFee?.totalAmount ||
        (course.courseFee && course.courseFee > 0 ? course.courseFee : 0);

      // Determine active status (checking overrides first, then matching fee status)
      const defaultActive = matchingFee
        ? matchingFee.status === 'APPROVED'
        : hasFeeAssigned;
      const isActive =
        activeOverrides[course.id] !== undefined
          ? activeOverrides[course.id]
          : defaultActive;

      return {
        ...course,
        hasFeeAssigned,
        feeAmount: effectiveAmount,
        isActive,
        matchingFeeSchedule: matchingFee,
      };
    });
  }, [scopedCourses, structures, activeOverrides]);

  // Filtered Course Cards
  const filteredCourses = useMemo(() => {
    return courseCards.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (courseFilter === 'ASSIGNED') return c.hasFeeAssigned;
      if (courseFilter === 'UNASSIGNED') return !c.hasFeeAssigned;
      if (courseFilter === 'ACTIVE') return c.isActive;
      return true;
    });
  }, [courseCards, searchQuery, courseFilter]);

  const assignedCount = courseCards.filter((c) => c.hasFeeAssigned).length;
  const unassignedCount = courseCards.filter((c) => !c.hasFeeAssigned).length;
  const activeCount = courseCards.filter((c) => c.isActive && c.hasFeeAssigned).length;

  // Toggle Course Fee Activation
  const handleToggleActive = (courseId: string, currentStatus: boolean, courseName: string, feeSchedule?: FeeStructure) => {
    const nextStatus = !currentStatus;
    setActiveOverrides((prev) => ({
      ...prev,
      [courseId]: nextStatus,
    }));

    if (feeSchedule) {
      setStructures((prev) =>
        prev.map((s) =>
          s.id === feeSchedule.id
            ? { ...s, status: nextStatus ? 'APPROVED' : 'DRAFT' }
            : s
        )
      );
    }

    if (nextStatus) {
      showSuccess(`Fee structure for "${courseName}" is now ACTIVE & ready for enrollment payments.`);
    } else {
      showInfo(`Fee structure for "${courseName}" has been DEACTIVATED. New student payments will be paused.`);
    }
  };

  const handleOpenDrawerForCourse = (courseId: string, feeSchedule?: FeeStructure) => {
    if (feeSchedule) {
      setEditingStructure(feeSchedule);
      setSelectedCourseForDrawer(undefined);
    } else {
      setEditingStructure(null);
      setSelectedCourseForDrawer(courseId);
    }
    setIsCreateOpen(true);
  };

  const handleFeeStructureCreated = (newStructure: FeeStructure) => {
    setStructures((prev) => [newStructure, ...prev]);
    showSuccess(`Fee schedule ${newStructure.code} created and linked successfully.`);
  };

  const handleFeeStructureUpdated = (updatedStructure: FeeStructure) => {
    setStructures((prev) =>
      prev.map((s) => (s.id === updatedStructure.id ? updatedStructure : s))
    );
    setEditingStructure(null);
    showSuccess(`Fee schedule ${updatedStructure.code} updated successfully.`);
  };

  const handleDeleteFeeStructure = () => {
    if (!deleteTarget) return;
    setStructures((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    showSuccess(`Fee schedule ${deleteTarget.code} deleted successfully.`);
    setDeleteTarget(null);
  };

  const handleOpenDetails = (structure: FeeStructure) => {
    setSelectedStructure(structure);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs
        items={[{ label: 'Finance', href: '/super-admin/finance' }, { label: 'Course Fee Structures' }]}
      />

      <CollegeFilterBar />

      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Course Fee Management & Schedules
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            User-friendly course-level fees: edit amounts, view component breakdowns, and easily activate or deactivate course pricing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/super-admin/finance/approvals"
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4" />
            <span>Finance Approvals</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setEditingStructure(null);
              setSelectedCourseForDrawer(undefined);
              setIsCreateOpen(true);
            }}
            className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Fee Schedule</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Search, Status Metric Tabs & Filters ─── */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0052CC]" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Course Directory & Fee Status
            </h2>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setCourseFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                courseFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Courses ({courseCards.length})
            </button>
            <button
              onClick={() => setCourseFilter('ASSIGNED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                courseFilter === 'ASSIGNED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span>Fee Assigned</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  courseFilter === 'ASSIGNED' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {assignedCount}
              </span>
            </button>
            <button
              onClick={() => setCourseFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                courseFilter === 'ACTIVE'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <span>Active</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  courseFilter === 'ACTIVE' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setCourseFilter('UNASSIGNED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                courseFilter === 'UNASSIGNED'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <span>Fee Not Assigned</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  courseFilter === 'UNASSIGNED' ? 'bg-black/20 text-slate-950' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {unassignedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Search input for courses */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses by name, code, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white transition-all"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* ─── 3. User-Friendly Course Cards Grid with Live Toggle ─── */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No courses match the selected filter.</p>
          <p className="text-slate-400">Try adjusting your search query or switching tabs above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const hasFee = course.hasFeeAssigned;
            const feeSchedule = course.matchingFeeSchedule;
            const isActive = course.isActive;

            return (
              <div
                key={course.id}
                className={`p-4 rounded-2xl border transition-all bg-white shadow-2xs flex flex-col justify-between hover:shadow-md ${
                  !hasFee
                    ? 'border-amber-200/90 bg-gradient-to-br from-amber-50/20 to-white hover:border-amber-400'
                    : isActive
                    ? 'border-emerald-200/90 hover:border-emerald-400'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Course Code, Fee Status Badge, and Activate Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {course.code}
                      </span>
                      {hasFee ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{isActive ? 'Active' : 'Deactivated'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Fee Not Set</span>
                        </span>
                      )}
                    </div>

                    {/* Interactive Activate / Deactivate Toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                        {isActive ? 'Active' : 'Off'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        onClick={() => handleToggleActive(course.id, isActive, course.name, feeSchedule)}
                        title={isActive ? 'Click to Deactivate Course Fee' : 'Click to Activate Course Fee'}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-2 ${
                          isActive ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Course Title & Department */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1" title={course.name}>
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {course.department}
                    </p>
                  </div>

                  {/* Campus & Learners details */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-semibold truncate max-w-[200px]">
                      {course.collegeName || 'Loyola Campus'}
                    </span>
                    <span>•</span>
                    <span>{course.enrolledStudents || 60} Students Enrolled</span>
                    {feeSchedule && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-blue-600">v{feeSchedule.version}.0</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Pricing & Actions */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Course Fee Amount
                    </span>
                    {hasFee ? (
                      <span className="text-base font-black text-slate-900 flex items-center">
                        ₹{course.feeAmount.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">/ Term</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                        ₹0 (Setup Required)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* View Details button if schedule exists */}
                    {feeSchedule && (
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(feeSchedule)}
                        className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="View fee breakdown & audit history"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    )}

                    {/* Edit / Configure Fee Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDrawerForCourse(course.id, feeSchedule)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        hasFee
                          ? 'bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-200'
                          : 'bg-[#0052CC] hover:bg-blue-700 text-white shadow-2xs'
                      }`}
                      title={hasFee ? 'Edit fee structure' : 'Configure fee structure for this course'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{hasFee ? 'Edit Fee' : 'Set Fee'}</span>
                    </button>

                    {/* Delete Fee Schedule (only if assigned) */}
                    {feeSchedule && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(feeSchedule)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete fee schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Detail & Version History Modal ─── */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedStructure?.code || 'Course Fee Details'}
        description={`${selectedStructure?.programName || 'Course'} • Version ${selectedStructure?.version || 1}.0`}
        maxWidth="lg"
      >
        {selectedStructure && (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Academic Cycle</span>
                <p className="font-semibold text-slate-800">{selectedStructure.academicYear}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Target Cohort</span>
                <p className="font-semibold text-slate-800">{selectedStructure.batchName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Effective Window</span>
                <p className="font-semibold text-slate-800">
                  {selectedStructure.effectiveFrom} to {selectedStructure.effectiveTo}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedStructure.status} />
                </div>
              </div>
            </div>

            {/* Component Line Items */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#0052CC]" />
                Fee Components Breakdown ({selectedStructure.components.length} Items)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {selectedStructure.components.map((comp, idx) => (
                  <div key={idx} className="p-2.5 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{comp.componentName}</span>
                      <span className="font-mono text-[10px] text-slate-400 ml-2">({comp.componentCode})</span>
                    </div>
                    <div className="font-bold text-slate-900">
                      ₹{comp.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-slate-50/80 font-black flex items-center justify-between text-xs border-t border-slate-200">
                  <span className="text-slate-700">Total Course Fee</span>
                  <span className="text-sm font-black text-[#0052CC]">
                    ₹{selectedStructure.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Version History Table */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                Version Audit History
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-white flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">v{selectedStructure.version}.0 (Current)</span>
                    <p className="text-[11px] text-slate-500">
                      Total: ₹{selectedStructure.totalAmount.toLocaleString()} • Approved & Active
                    </p>
                  </div>
                  <StatusBadge status={selectedStructure.status} />
                </div>
                {selectedStructure.version > 1 && (
                  <div className="p-3 bg-slate-50 flex items-center justify-between text-slate-500">
                    <div>
                      <span className="font-bold text-slate-700">v1.0 (Archived Revision)</span>
                      <p className="text-[11px] text-slate-400">
                        Total: ₹{(selectedStructure.totalAmount - 3000).toLocaleString()} • Replaced by v2.0
                      </p>
                    </div>
                    <StatusBadge status="ARCHIVED" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  setEditingStructure(selectedStructure);
                  setIsCreateOpen(true);
                }}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052CC] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit This Schedule</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Right-Side Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteFeeStructure}
        entityType="Institutional Fee Schedule"
        entityName={deleteTarget?.code}
      />

      {/* Create / Edit Fee Schedule Right-Side Drawer */}
      <CreateFeeStructureDrawer
        isOpen={isCreateOpen || !!editingStructure}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingStructure(null);
          setSelectedCourseForDrawer(undefined);
        }}
        onFeeStructureCreated={handleFeeStructureCreated}
        editFeeStructure={editingStructure}
        initialCourseId={selectedCourseForDrawer}
        onFeeStructureUpdated={handleFeeStructureUpdated}
      />
    </div>
  );
}

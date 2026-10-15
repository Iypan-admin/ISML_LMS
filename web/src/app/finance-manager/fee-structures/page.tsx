// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER: FEE STRUCTURES & SCHEDULES
// (/finance-manager/fee-structures)
// Program Schedules, Expandable Itemized Component Line Items,
// Search & Semester Cascading Filters, EMI Installment Breakdown & Details
// ============================================================================

"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Plus,
  Coins,
  Send,
  Layers,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  CheckCircle2,
  ShieldCheck,
  History,
  FileCheck,
  SplitSquareVertical,
  Clock,
  Sparkles,
  BookOpen,
  AlertCircle,
  ArrowUpRight,
  IndianRupee,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import { useCollege } from '@/context/CollegeContext';
import { mockFeeStructures, mockPrograms, mockDepartments, mockCourses } from '@/mock/superAdminData';
import { FeeStructure, CourseSummary } from '@/types/rbac';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/common/Modal';
import ProposeFeeStructureDrawer from '@/components/finance-manager/forms/ProposeFeeStructureDrawer';

export default function FinanceManagerFeeStructuresPage() {
  const { selectedCollegeId, isOverall } = useCollege();
  const { showSuccess, showInfo } = useToast();

  const [structures, setStructures] = useState<FeeStructure[]>(mockFeeStructures);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourseForDrawer, setSelectedCourseForDrawer] = useState<string | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>('fee-bsc-s1');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Details Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);

  const handleSubmitToSuperAdmin = (code: string) => {
    showSuccess(`Fee Schedule ${code} submitted to Central Super Admin for final authorization!`);
  };

  // Filtered Structures
  const filtered = useMemo(() => {
    return structures.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.programName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.batchName.toLowerCase().includes(q) ||
        item.departmentName.toLowerCase().includes(q);

      const matchesSemester =
        selectedSemester === 'ALL' ||
        item.semesterNumber.toString() === selectedSemester ||
        item.durationType === selectedSemester;

      const matchesStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      if (!isOverall) {
        const prog = mockPrograms.find(
          (p) => p.name.toLowerCase() === item.programName.toLowerCase()
        );
        const dept = mockDepartments.find((d) => d.id === prog?.departmentId);
        if (dept?.institutionId && dept.institutionId !== selectedCollegeId) {
          return false;
        }
      }

      return matchesSearch && matchesSemester && matchesStatus;
    });
  }, [structures, searchQuery, selectedSemester, selectedStatus, isOverall, selectedCollegeId]);

  // Scoped Courses & their Fee Assignment Status
  const scopedCourses = useMemo(() => {
    return mockCourses.filter((c) => {
      if (isOverall) return true;
      if (c.collegeId) return c.collegeId === selectedCollegeId;
      const dept = mockDepartments.find((d) => d.name.toLowerCase() === c.department.toLowerCase());
      return !dept?.institutionId || dept.institutionId === selectedCollegeId;
    });
  }, [isOverall, selectedCollegeId]);

  // Combine Courses with their Fee Assignment Status
  const courseCards = useMemo(() => {
    return scopedCourses.map((course) => {
      // Find matching fee structure by course code/name or batch
      const matchingFee = structures.find((s) => {
        const matchesName = s.programName.toLowerCase().includes(course.name.toLowerCase()) ||
          course.name.toLowerCase().includes(s.programName.toLowerCase());
        const matchesDept = s.departmentName.toLowerCase().includes(course.department.toLowerCase());
        return matchesName || matchesDept;
      });

      const hasFeeAssigned = Boolean(course.courseFee && course.courseFee > 0) || Boolean(matchingFee);
      const effectiveAmount = course.courseFee && course.courseFee > 0
        ? course.courseFee
        : matchingFee?.totalAmount || 0;

      return {
        ...course,
        hasFeeAssigned,
        feeAmount: effectiveAmount,
        matchingFeeSchedule: matchingFee,
      };
    });
  }, [scopedCourses, structures]);

  // Filtered Course Cards based on Search & Course Filter
  const filteredCourseCards = useMemo(() => {
    return courseCards.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (courseFilter === 'ASSIGNED') return c.hasFeeAssigned;
      if (courseFilter === 'UNASSIGNED') return !c.hasFeeAssigned;
      return true;
    });
  }, [courseCards, searchQuery, courseFilter]);

  const assignedCount = courseCards.filter((c) => c.hasFeeAssigned).length;
  const unassignedCount = courseCards.filter((c) => !c.hasFeeAssigned).length;

  const handleOpenDrawerForCourse = (courseId: string) => {
    setSelectedCourseForDrawer(courseId);
    setIsDrawerOpen(true);
  };

  const handleOpenDetails = (structure: FeeStructure) => {
    setSelectedStructure(structure);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <Breadcrumbs items={[{ label: 'Finance Manager' }, { label: 'Fee Structures & Schedules' }]} />

      <CollegeFilterBar />

      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-[#0052CC] rounded-xl">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Course Fee Management & Schedules
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assign tuition fees to language courses, track assigned vs unassigned curriculum fees, configure installment breakdowns and dispatch proposals to Super Admin.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedCourseForDrawer(undefined);
              setIsDrawerOpen(true);
            }}
            className="px-3.5 py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Prepare New Fee Structure</span>
          </button>
        </div>
      </div>

      {/* ─── 2. All Courses Fee Cards (Assigned vs Unassigned) ─── */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0052CC]" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Language Courses Fee Pricing & Status
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of all academic courses with assigned fee packages or pending fee integrations.
            </p>
          </div>

          {/* Quick Filter Tabs for Courses */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start sm:self-auto">
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
                  ? 'bg-[#0052CC] text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <span>Fee Assigned</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                courseFilter === 'ASSIGNED' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {assignedCount}
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
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                courseFilter === 'UNASSIGNED' ? 'bg-black/20 text-slate-950' : 'bg-amber-100 text-amber-800'
              }`}>
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
              placeholder="Search courses by language, title, code or batch..."
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

        {/* Grid of Course Cards */}
        {filteredCourseCards.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No courses match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredCourseCards.map((course) => (
              <div
                key={course.id}
                className={`p-4 rounded-2xl border transition-all bg-white shadow-2xs flex flex-col justify-between ${
                  course.hasFeeAssigned
                    ? 'border-emerald-200/90 hover:border-emerald-400'
                    : 'border-amber-200/90 bg-gradient-to-br from-amber-50/20 to-white hover:border-amber-400'
                }`}
              >
                <div className="space-y-2">
                  {/* Status Badge & Code */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {course.code}
                    </span>
                    {course.hasFeeAssigned ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Fee Assigned</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Fee Not Assigned</span>
                      </span>
                    )}
                  </div>

                  {/* Course Title & Duration Track */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1" title={course.name}>
                      {course.name}
                    </h3>
                    <p className="text-[11px] text-blue-600 font-bold truncate mt-0.5">
                      {course.duration || '90 Days Language Track'}
                    </p>
                  </div>

                  {/* Batches / Campus Badge */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-semibold truncate max-w-[180px]">
                      {course.collegeName || 'Loyola Campus'}
                    </span>
                    <span>•</span>
                    <span>{course.enrolledStudents || 60} Learners</span>
                  </div>
                </div>

                {/* Bottom Pricing & Action */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Course Fee
                    </span>
                    {course.hasFeeAssigned ? (
                      <span className="text-base font-black text-emerald-800 flex items-center">
                        ₹{course.feeAmount.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">/ Term</span>
                      </span>
                    ) : (
                      <span className="text-xs font-black text-amber-700">
                        ₹0 (Pending Fee Setup)
                      </span>
                    )}
                  </div>

                  <div>
                    {course.hasFeeAssigned ? (
                      <button
                        onClick={() => handleOpenDrawerForCourse(course.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Modify fee structure"
                      >
                        <span>Update Fee</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenDrawerForCourse(course.id)}
                        className="px-3 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Integrate and assign fee package"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Fee</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* ─── Detail & Version History Modal ─── */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedStructure?.code || 'Fee Schedule Details'}
        description={`${selectedStructure?.programName} • Semester ${selectedStructure?.semesterNumber}`}
        maxWidth="lg"
      >
        {selectedStructure && (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Academic Year</span>
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
                <span className="text-[10px] text-slate-400 uppercase font-bold">Current Version</span>
                <p className="font-semibold text-slate-800">Version {selectedStructure.version}.0</p>
              </div>
            </div>

            {/* Version Audit History */}
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

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
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

      {/* Prepare / Propose Fee Structure Drawer */}
      <ProposeFeeStructureDrawer
        isOpen={isDrawerOpen}
        initialCourseId={selectedCourseForDrawer}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCourseForDrawer(undefined);
        }}
        onSubmitted={() => {
          showInfo('Proposal logged in store and sent to Super Admin Approvals Center.');
          setSelectedCourseForDrawer(undefined);
        }}
      />
    </div>
  );
}

// ============================================================================
// ISML COLLEGE LMS — COURSE & CERTIFICATION FEES
// Specialized Course Lab Surcharges & Certification Exam Pricing
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Receipt,
  FileCheck,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { mockCourses } from '@/mock/superAdminData';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CollegeFilterBar from '@/components/common/CollegeFilterBar';
import DeleteConfirmDrawer from '@/components/common/DeleteConfirmDrawer';
import { useCollege } from '@/context/CollegeContext';
import { useToast } from '@/context/ToastContext';
import CreateCourseSurchargeDrawer, { CourseFeeEntry } from '@/components/super-admin/finance/CreateCourseSurchargeDrawer';

export default function CourseFeesPage() {
  const { showSuccess } = useToast();
  const { selectedCollegeId, isOverall } = useCollege();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSurcharge, setEditingSurcharge] = useState<CourseFeeEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseFeeEntry | null>(null);

  const [courseFeeList, setCourseFeeList] = useState<CourseFeeEntry[]>([
    {
      courseId: 'crs-01',
      courseCode: 'ISML-FR-A1',
      courseName: 'French A1 Intensive Certification Program',
      department: 'Department of Foreign Languages (ISML)',
      certificationFee: 4500,
      labLicensingFee: 2000,
      totalCourseSurcharge: 6500,
      enrolledStudents: 180,
      status: 'APPROVED',
    },
    {
      courseId: 'crs-02',
      courseCode: 'CS-DSA-201',
      courseName: 'Data Structures and Algorithms in C++',
      department: 'Department of Computer Science & IT',
      certificationFee: 0,
      labLicensingFee: 2500,
      totalCourseSurcharge: 2500,
      enrolledStudents: 120,
      status: 'APPROVED',
    },
    {
      courseId: 'crs-03',
      courseCode: 'ISML-DE-A1',
      courseName: 'German A1 Professional Career Track',
      department: 'Department of Foreign Languages (ISML)',
      certificationFee: 4500,
      labLicensingFee: 2000,
      totalCourseSurcharge: 6500,
      enrolledStudents: 145,
      status: 'APPROVED',
    },
  ]);

  const handleAddSurcharge = (newEntry: CourseFeeEntry) => {
    setCourseFeeList((prev) => [newEntry, ...prev]);
  };

  const handleUpdateSurcharge = (updated: CourseFeeEntry) => {
    setCourseFeeList((prev) =>
      prev.map((c) => (c.courseId === updated.courseId ? updated : c))
    );
    setEditingSurcharge(null);
  };

  const handleDeleteSurcharge = () => {
    if (!deleteTarget) return;
    setCourseFeeList((prev) => prev.filter((c) => c.courseId !== deleteTarget.courseId));
    showSuccess(`Course surcharge for ${deleteTarget.courseCode} deleted successfully.`);
    setDeleteTarget(null);
  };

  const filtered = courseFeeList.filter(
    (c) =>
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-8 font-sans">
      <Breadcrumbs
        items={[{ label: 'Finance', href: '/super-admin/finance' }, { label: 'Course & Cert Fees' }]}
      />

      <CollegeFilterBar />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-[#0052CC] rounded-lg">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Course & Certification Fees
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Specialized lab licensing and international certification exam fee attachments per course.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSurcharge(null);
            setIsDrawerOpen(true);
          }}
          className="text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#0052CC] hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Course Surcharge</span>
        </button>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Name & Department</th>
                <th className="py-3 px-4 text-right">Certification Fee</th>
                <th className="py-3 px-4 text-right">Lab Licensing</th>
                <th className="py-3 px-4 text-right">Total Surcharge</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.courseId} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {item.courseCode}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.courseName}</div>
                    <div className="text-[11px] text-slate-500">{item.department}</div>
                  </td>

                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {item.certificationFee ? `₹${item.certificationFee.toLocaleString()}` : '—'}
                  </td>

                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    ₹{item.labLicensingFee.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ₹{item.totalCourseSurcharge.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingSurcharge(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Surcharge"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Surcharge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.map((item) => (
          <div
            key={item.courseId}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                  {item.courseCode}
                </span>
                <h3 className="text-xs font-bold text-slate-900 mt-1 leading-tight">{item.courseName}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.department}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-lg text-center text-[10px]">
              <div>
                <span className="text-slate-400 block">Cert Fee</span>
                <span className="font-semibold text-slate-700">
                  {item.certificationFee ? `₹${item.certificationFee.toLocaleString()}` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Lab Fee</span>
                <span className="font-semibold text-slate-700">
                  ₹{item.labLicensingFee.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total</span>
                <span className="font-bold text-[#0052CC]">
                  ₹{item.totalCourseSurcharge.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSurcharge(item)}
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit className="w-3 h-3 text-blue-600" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Right-Side Drawer */}
      <DeleteConfirmDrawer
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSurcharge}
        entityType="Course Surcharge"
        entityName={deleteTarget?.courseCode}
      />

      {/* Create / Edit Course Surcharge Right-Side Drawer */}
      <CreateCourseSurchargeDrawer
        isOpen={isDrawerOpen || !!editingSurcharge}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingSurcharge(null);
        }}
        onSurchargeCreated={handleAddSurcharge}
        editSurcharge={editingSurcharge}
        onSurchargeUpdated={handleUpdateSurcharge}
      />
    </div>
  );
}


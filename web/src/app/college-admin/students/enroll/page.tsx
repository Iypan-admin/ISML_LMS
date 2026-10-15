// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: ENROLL NEW STUDENT
// (/college-admin/students/enroll)
// Quick Enrollment Form: Student Demographics, Course & Batch Assignment,
// Fee Structure Selection, and Guardian Details
// ============================================================================

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  ArrowLeft,
  Building2,
  BookOpen,
  Layers,
  CheckCircle2,
  Phone,
  Mail,
  User,
  HeartHandshake,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { mockInstitutions, mockCourses, mockBatches } from '@/mock/superAdminData';
import { useToast } from '@/context/ToastContext';

export default function CollegeAdminEnrollStudentPage() {
  const router = useRouter();
  const { showSuccess } = useToast();
  const currentCollege = mockInstitutions[0];

  const collegeCourses = mockCourses.filter((c) => c.collegeId === currentCollege.id || !c.collegeId);
  const collegeBatches = mockBatches.filter((b) => b.institutionId === currentCollege.id || !b.institutionId);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: 'MALE',
    dob: '2005-08-15',
    courseId: collegeCourses[0]?.id || 'crs-01',
    batchId: collegeBatches[0]?.id || 'batch-2026-cs',
    parentName: '',
    parentMobile: '',
    parentRelationship: 'FATHER',
    initialFeeStatus: 'PAID', // 'PAID' | 'PAY_LATER'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      showSuccess(`Enrolled student "${formData.name}" successfully! ID: ISML2026${Math.floor(1000 + Math.random() * 9000)}`);
      router.push('/college-admin/students');
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/college-admin/students"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2447] tracking-tight">
              Enroll New Student
            </h1>
            <p className="text-xs text-slate-500">
              Register learner under {currentCollege.name} campus with course & batch allocation.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200">
          {currentCollege.code} Campus
        </span>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
        {/* Section 1: Basic Student Demographics */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-[#0052CC]" />
            <span>1. Student Personal Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vignesh Ramanathan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Official Student Email *</label>
              <input
                type="email"
                required
                placeholder="student@isml.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0052CC] outline-none cursor-pointer"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Course & Cohort Allocation */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>2. Academic Track & Batch Allocation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Enrolled Course Track *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600 outline-none cursor-pointer"
              >
                {collegeCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Assigned Batch / Cohort *</label>
              <select
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600 outline-none cursor-pointer"
              >
                {collegeBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.studentsCount} Students)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Parent / Guardian Details */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-black text-[#0B2447] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <HeartHandshake className="w-4 h-4 text-teal-600" />
            <span>3. Parent & Guardian Linkage</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Guardian Name</label>
              <input
                type="text"
                placeholder="Parent's Name"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Guardian Mobile</label>
              <input
                type="tel"
                placeholder="+91 94440 XXXXX"
                value={formData.parentMobile}
                onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Relationship</label>
              <select
                value={formData.parentRelationship}
                onChange={(e) => setFormData({ ...formData, parentRelationship: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none cursor-pointer"
              >
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="GUARDIAN">Legal Guardian</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/college-admin/students"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Enrolling Student...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Complete Enrollment & Issue ID</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

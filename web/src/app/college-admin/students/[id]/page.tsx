// ============================================================================
// ISML COLLEGE LMS — COLLEGE ADMIN: STUDENT 360 PROFILE VIEW
// (/college-admin/students/[id])
// ============================================================================

"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Mail,
  Phone,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Unlock,
  CreditCard,
  UserCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { mockInstitutions, mockStudents } from '@/mock/superAdminData';

export default function CollegeAdminStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string;
  const currentCollege = mockInstitutions[0];

  const student = useMemo(() => {
    return mockStudents.find((s) => s.id === idParam || s.studentId === idParam) || mockStudents[0];
  }, [idParam]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/college-admin/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0052CC] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Roster</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">Campus: {currentCollege.name}</span>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0052CC] to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-[#0B2447]">{student.name}</h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {student.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {student.studentId} • Roll: {(student as any).rollNumber || student.studentId}
            </p>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {student.enrolledCourseName || student.programName} — {student.batchName}
            </p>
          </div>
        </div>

        {/* Quick Access Status & Actions */}
        <div className="flex items-center gap-3">
          {(student as any).accessStatus === 'LOCKED' ? (
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Portal Access Locked (Fee Due)</span>
              </div>
              <div className="mt-2">
                <Link
                  href={`/college-admin/fees?studentId=${student.id}`}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Settle Fees & Unlock Access</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              <Unlock className="w-4 h-4" />
              <span>LMS Curriculum Access Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Student Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Attendance Rate</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{student.attendancePercentage}%</p>
          <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">Good standing</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Tuition Dues</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">
            ₹{(student as any).accessStatus === 'LOCKED' ? '14,500' : '0'}
          </p>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
            {(student as any).accessStatus === 'LOCKED' ? 'Pending settlement' : 'Fully cleared'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Enrolled Cohort</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">{student.batchName}</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Section A • Room 304</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Academic Performance</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">88.5%</p>
          <span className="text-[11px] font-semibold text-purple-700 mt-1 block">Grade A+ (Distinction)</span>
        </div>
      </div>

      {/* Profile Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Contact Details */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="text-sm font-extrabold text-[#0B2447] border-b border-slate-100 pb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#0052CC]" />
            <span>Personal & Contact Info</span>
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Official Email:</span>
              <span className="font-semibold text-slate-800">{student.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mobile Phone:</span>
              <span className="font-mono text-slate-800">{(student as any).phone || '+91 98401 23456'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Enrolled Institution:</span>
              <span className="font-semibold text-slate-800">{(student as any).institutionName || currentCollege.name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Registration Date:</span>
              <span className="text-slate-800 font-medium">Aug 2026</span>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Linkage */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="text-sm font-extrabold text-[#0B2447] border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Parent / Guardian Linkage</span>
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Guardian Name:</span>
              <span className="font-semibold text-slate-800">Dr. Meenakshi S</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Relationship:</span>
              <span className="font-semibold text-slate-800">Mother</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Guardian Contact:</span>
              <span className="font-mono text-slate-800">+91 98401 98765</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Parent Portal App:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                <span>Connected & Verified</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  Mail,
  Phone,
  Clock,
  BookOpen,
  ArrowLeft,
  Award,
  Layers,
  HeartHandshake,
  CreditCard,
  HelpCircle,
  Lock,
} from 'lucide-react';

export default function CollegeAdminStudentProfilePage() {
  const params = useParams();
  const studentIdParam = params?.id as string;

  const [activeTab, setActiveTab] = useState<
    'ACADEMIC' | 'COURSES' | 'ATTENDANCE' | 'ASSESSMENTS' | 'DOUBTS' | 'PARENT' | 'SECURITY'
  >('ACADEMIC');

  const [student, setStudent] = useState<any>({
    name: 'Loading Learner...',
    studentId: studentIdParam || 'STD-01',
    email: '',
    phone: '',
    status: 'ACTIVE',
  });

  React.useEffect(() => {
    if (studentIdParam) {
      fetch('/api/portals/students?collegeId=ALL')
        .then((r) => r.json())
        .then((json) => {
          if (json && json.data) {
            const found = json.data.find(
              (s: any) =>
                s.id === studentIdParam ||
                s.studentId === studentIdParam ||
                s.id === `amer-${studentIdParam}` ||
                s.studentId?.toLowerCase() === studentIdParam?.toLowerCase()
            );
            if (found) {
              setStudent(found);
            }
          }
        })
        .catch(() => {});
    }
  }, [studentIdParam]);

  const s = student;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans px-2 sm:px-0">
      {/* Top Breadcrumb & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/college-admin/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Campus Student Dossier
        </span>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {s.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-[#0B2447]">{s.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {s.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-1 font-mono">
                <span>Roll: {s.studentId}</span>
                <span>•</span>
                <span className="text-blue-700 font-sans font-medium">{s.email}</span>
                <span>•</span>
                <span className="text-slate-600 font-sans">{s.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/college-admin/fees"
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fees Ledger</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Counters (All 0) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-bold block text-[11px]">Campus Attendance</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">0%</p>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">0 Sessions</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-bold block text-[11px]">Enrolled Track</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">0</p>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">0 Courses</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-bold block text-[11px]">Batch Cohort</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">0</p>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">0 Cohorts</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-bold block text-[11px]">Tuition Fee Due</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">₹0</p>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">0 Balance Due</span>
          </div>
        </div>

        {/* Responsive Horizontal Navigation Tabs */}
        <div className="flex border-b border-slate-200 mt-6 gap-2 sm:gap-6 text-xs font-semibold overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'ACADEMIC', label: 'Academic Hierarchy (0)', icon: Layers },
            { id: 'COURSES', label: 'Courses (0)', icon: BookOpen },
            { id: 'ATTENDANCE', label: 'Attendance Breakdown (0)', icon: Clock },
            { id: 'ASSESSMENTS', label: 'Assessments & Marks (0)', icon: Award },
            { id: 'DOUBTS', label: 'Doubt Clearing Activity (0)', icon: HelpCircle },
            { id: 'PARENT', label: 'Parent & Guardian Portal (0)', icon: HeartHandshake },
            { id: 'SECURITY', label: 'Account Security (0)', icon: Lock },
          ].map((tab) => {
            const IconC = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-2 transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#0052CC] text-[#0052CC] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <IconC className={`w-3.5 h-3.5 ${isActive ? 'text-[#0052CC]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB 1: ACADEMIC HIERARCHY ─── */}
      {activeTab === 'ACADEMIC' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Academic Hierarchy (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 academic hierarchy levels configured.
          </p>
        </div>
      )}

      {/* ─── TAB 2: ENROLLED COURSES ─── */}
      {activeTab === 'COURSES' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Courses (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 courses enrolled for this student.
          </p>
        </div>
      )}

      {/* ─── TAB 3: ATTENDANCE BREAKDOWN ─── */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Attendance Breakdown (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 attendance logs recorded. 0% attendance.
          </p>
        </div>
      )}

      {/* ─── TAB 4: ASSESSMENTS & MARKS ─── */}
      {activeTab === 'ASSESSMENTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Assessments & Marks (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 assessments completed. 0 marks recorded.
          </p>
        </div>
      )}

      {/* ─── TAB 5: DOUBT CLEARING ACTIVITY ─── */}
      {activeTab === 'DOUBTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Doubt Clearing Activity (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 active doubts. 0 resolved doubts.
          </p>
        </div>
      )}

      {/* ─── TAB 6: PARENT & GUARDIAN PORTAL ─── */}
      {activeTab === 'PARENT' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
          <HeartHandshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Parent & Guardian Portal (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 parents linked. No guardian access enabled.
          </p>
        </div>
      )}

      {/* ─── TAB 7: ACCOUNT SECURITY ─── */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
          <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Account Security (0)</h4>
          <p className="text-xs text-slate-400 mt-1">
            0 security breaches. 0 locked accounts.
          </p>
        </div>
      )}
    </div>
  );
}
